"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MAX_JSON_BYTES = 1024 * 1024;
const DEFAULT_PORT = 8787;
const ROOT_DIR = __dirname;
const PUBLIC_FILES = new Set([
  "index.html",
  "styles.css",
  "app.js",
  "engine.js",
  "service-worker.js",
  "manifest.webmanifest",
  "data/questions.default.json"
]);
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};
const SESSION_ROLES = new Set(["host", "player", "stage"]);
const CONFIDENCE_VALUES = new Set(["Curious", "Confident", "Certain"]);

function createToken(byteLength = 24) {
  return crypto
    .randomBytes(byteLength)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseBearerToken(headerValue) {
  const match = String(headerValue || "").match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function sanitizeSessionId(value) {
  const sessionId = String(value || "").trim();
  return /^[a-zA-Z0-9_-]{8,80}$/.test(sessionId) ? sessionId : "";
}

function sanitizeRole(value) {
  const role = String(value || "").toLowerCase();
  return SESSION_ROLES.has(role) ? role : "";
}

function sanitizePlayerAnswer(payload = {}) {
  const choiceIndex = Number(payload.choiceIndex);
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex > 5) {
    throw new Error("Invalid answer choice.");
  }

  const confidence = CONFIDENCE_VALUES.has(payload.confidence)
    ? payload.confidence
    : "Curious";
  const participant = String(payload.participant || "Player").trim().slice(0, 80) || "Player";

  return {
    choiceIndex,
    confidence,
    participant
  };
}

function sanitizeGameSnapshot(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("State payload must be an object.");
  }

  if (candidate.version !== "420iq-static-pilot-v2") {
    throw new Error("State payload version is not supported.");
  }

  return candidate;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function publicGameSnapshot(game) {
  if (!game) {
    return null;
  }

  const snapshot = cloneJson(game);
  if (snapshot.pack && Array.isArray(snapshot.pack.sequence)) {
    snapshot.pack.sequence = snapshot.pack.sequence.map(question => {
      const {
        correctIndex,
        verifiedSignalIndex,
        knowledgeDrop,
        sourceCue,
        correctAsOf,
        ...publicQuestion
      } = question;
      return publicQuestion;
    });
  }

  snapshot.events = [];
  snapshot.trustedCircle = [];
  if (snapshot.lifelineActive && snapshot.lifelineActive.selectedContact) {
    snapshot.lifelineActive.selectedContact = null;
  }

  return snapshot;
}

function buildSessionLinks(session, origin = `http://localhost:${DEFAULT_PORT}`) {
  const safeOrigin = String(origin || `http://localhost:${DEFAULT_PORT}`);
  const baseUrl = new URL("/", safeOrigin);

  function roleLink(role, access, token, hash, sfxValue = "") {
    const url = new URL(baseUrl.href);
    url.searchParams.set("access", access);
    url.searchParams.set("role", role);
    url.searchParams.set("session", session.sessionId);
    url.searchParams.set("token", token);
    if (sfxValue) {
      url.searchParams.set("sfx", sfxValue);
    }
    url.hash = hash;
    return url.href;
  }

  return {
    host: roleLink("host", "admin", session.hostToken, "host", "on"),
    player: roleLink("player", "player", session.playerToken, "player", "on"),
    stage: roleLink("stage", "stage", session.stageToken, "stage", "off")
  };
}

function createSessionStore(options = {}) {
  const ttlMs = Number(options.ttlMs) || 8 * 60 * 60 * 1000;
  const maxSessions = Number(options.maxSessions) || 64;
  const sessions = new Map();

  function pruneSessions() {
    const now = Date.now();
    for (const [sessionId, session] of sessions.entries()) {
      if (now - session.updatedAtEpochMs > ttlMs) {
        closeClients(session);
        sessions.delete(sessionId);
      }
    }

    while (sessions.size > maxSessions) {
      const [oldestSessionId, oldestSession] = sessions.entries().next().value;
      closeClients(oldestSession);
      sessions.delete(oldestSessionId);
    }
  }

  function createSession({ origin } = {}) {
    pruneSessions();
    const now = Date.now();
    const session = {
      sessionId: createToken(12),
      hostToken: createToken(),
      playerToken: createToken(),
      stageToken: createToken(),
      origin: String(origin || ""),
      game: null,
      lastPlayerAnswer: null,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      updatedAtEpochMs: now,
      clients: new Set()
    };

    sessions.set(session.sessionId, session);
    return session;
  }

  function getSession(sessionId) {
    const safeSessionId = sanitizeSessionId(sessionId);
    if (!safeSessionId) {
      return null;
    }

    pruneSessions();
    return sessions.get(safeSessionId) || null;
  }

  function tokenForRole(session, role) {
    if (role === "host") return session.hostToken;
    if (role === "player") return session.playerToken;
    if (role === "stage") return session.stageToken;
    return "";
  }

  function authenticate(sessionId, role, token) {
    const session = getSession(sessionId);
    const safeRole = sanitizeRole(role);
    const safeToken = String(token || "");
    return Boolean(session && safeRole && safeToken && tokenForRole(session, safeRole) === safeToken);
  }

  function touch(session) {
    const now = Date.now();
    session.updatedAtEpochMs = now;
    session.updatedAt = new Date(now).toISOString();
  }

  function publishState(sessionId, token, game) {
    const session = getSession(sessionId);
    if (!session) {
      return { ok: false, status: 404, error: "Session not found." };
    }

    if (!authenticate(sessionId, "host", token)) {
      return { ok: false, status: 403, error: "Host token required." };
    }

    try {
      session.game = sanitizeGameSnapshot(game);
    } catch (error) {
      return { ok: false, status: 400, error: error.message };
    }

    touch(session);
    broadcastToSession(session, "state", { game: session.game }, ["player", "stage"]);
    return { ok: true, status: 200, game: session.game };
  }

  function submitPlayerAnswer(sessionId, token, payload) {
    const session = getSession(sessionId);
    if (!session) {
      return { ok: false, status: 404, error: "Session not found." };
    }

    if (!authenticate(sessionId, "player", token)) {
      return { ok: false, status: 403, error: "Player token required." };
    }

    let answer;
    try {
      answer = sanitizePlayerAnswer(payload);
    } catch (error) {
      return { ok: false, status: 400, error: error.message };
    }

    session.lastPlayerAnswer = {
      ...answer,
      submittedAt: new Date().toISOString()
    };
    touch(session);
    broadcastToSession(session, "playerAnswer", session.lastPlayerAnswer, ["host"]);
    return { ok: true, status: 200, answer: session.lastPlayerAnswer };
  }

  function addClient(sessionId, role, token, response) {
    const session = getSession(sessionId);
    if (!session) {
      return { ok: false, status: 404, error: "Session not found." };
    }

    if (!authenticate(sessionId, role, token)) {
      return { ok: false, status: 403, error: "Token does not match this role." };
    }

    const safeRole = sanitizeRole(role);
    const client = {
      id: createToken(8),
      role: safeRole,
      response,
      heartbeat: null
    };

    client.heartbeat = setInterval(() => {
      try {
        response.write(": keepalive\n\n");
      } catch (error) {
        clearInterval(client.heartbeat);
        session.clients.delete(client);
      }
    }, 25000);

    response.on("close", () => {
      clearInterval(client.heartbeat);
      session.clients.delete(client);
    });

    session.clients.add(client);
    sendSse(response, "connected", {
      sessionId: session.sessionId,
      role: safeRole,
      connectedAt: new Date().toISOString()
    });

    if (session.game && (safeRole === "player" || safeRole === "stage")) {
      sendSse(response, "state", { game: publicGameSnapshot(session.game) });
    }

    return { ok: true, status: 200 };
  }

  return {
    createSession,
    getSession,
    authenticate,
    publishState,
    submitPlayerAnswer,
    addClient
  };
}

function sendSse(response, eventName, data) {
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcastToSession(session, eventName, data, roles) {
  const roleSet = new Set(roles || ["host", "player", "stage"]);
  for (const client of session.clients) {
    if (!roleSet.has(client.role)) {
      continue;
    }

    try {
      const outgoingData = eventName === "state" && data && data.game && client.role !== "host"
        ? { game: publicGameSnapshot(data.game) }
        : data;
      sendSse(client.response, eventName, outgoingData);
    } catch (error) {
      clearInterval(client.heartbeat);
      session.clients.delete(client);
    }
  }
}

function closeClients(session) {
  for (const client of session.clients) {
    clearInterval(client.heartbeat);
    try {
      client.response.end();
    } catch (error) {
      // The socket is already gone.
    }
  }
  session.clients.clear();
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function requestOrigin(request) {
  const protocol = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim() || "http";
  const host = request.headers.host || `localhost:${DEFAULT_PORT}`;
  return `${protocol}://${host}`;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_JSON_BYTES) {
        reject(new Error("JSON payload is too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("error", reject);
    request.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(new Error("Request body must be valid JSON."));
      }
    });
  });
}

function tokenFromRequest(request, url) {
  return parseBearerToken(request.headers.authorization) || String(url.searchParams.get("token") || "");
}

function publicSessionPayload(session, origin, role) {
  const base = {
    sessionId: session.sessionId,
    role,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    game: role === "host" ? session.game : publicGameSnapshot(session.game)
  };

  if (role === "host") {
    return {
      ...base,
      hostToken: session.hostToken,
      links: buildSessionLinks(session, origin)
    };
  }

  return base;
}

async function handleApi(request, response, url, store) {
  if (url.pathname === "/healthz" && request.method === "GET") {
    sendJson(response, 200, { ok: true });
    return true;
  }

  if (url.pathname === "/api/sessions" && request.method === "POST") {
    let body = {};
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message });
      return true;
    }

    const origin = String(body.origin || requestOrigin(request));
    const session = store.createSession({ origin });
    sendJson(response, 201, {
      ok: true,
      sessionId: session.sessionId,
      hostToken: session.hostToken,
      links: buildSessionLinks(session, origin)
    });
    return true;
  }

  const match = url.pathname.match(/^\/api\/sessions\/([^/]+)(?:\/([^/]+))?$/);
  if (!match) {
    return false;
  }

  const sessionId = sanitizeSessionId(match[1]);
  const action = match[2] || "";

  if (!sessionId) {
    sendJson(response, 404, { ok: false, error: "Session not found." });
    return true;
  }

  if (!action && request.method === "GET") {
    const role = sanitizeRole(url.searchParams.get("role")) || "host";
    const token = tokenFromRequest(request, url);
    const session = store.getSession(sessionId);
    if (!session) {
      sendJson(response, 404, { ok: false, error: "Session not found." });
      return true;
    }

    if (!store.authenticate(sessionId, role, token)) {
      sendJson(response, 403, { ok: false, error: "Token does not match this role." });
      return true;
    }

    sendJson(response, 200, {
      ok: true,
      ...publicSessionPayload(session, requestOrigin(request), role)
    });
    return true;
  }

  if (action === "events" && request.method === "GET") {
    const role = sanitizeRole(url.searchParams.get("role"));
    const token = tokenFromRequest(request, url);
    if (!role) {
      sendJson(response, 400, { ok: false, error: "Role is required." });
      return true;
    }

    if (!store.getSession(sessionId)) {
      sendJson(response, 404, { ok: false, error: "Session not found." });
      return true;
    }

    if (!store.authenticate(sessionId, role, token)) {
      sendJson(response, 403, { ok: false, error: "Token does not match this role." });
      return true;
    }

    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    const result = store.addClient(sessionId, role, token, response);
    if (!result.ok) {
      sendSse(response, "error", { error: result.error });
      response.end();
    }
    return true;
  }

  if (action === "state" && request.method === "POST") {
    let body = {};
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message });
      return true;
    }

    const result = store.publishState(sessionId, tokenFromRequest(request, url), body.game);
    sendJson(response, result.status, result.ok ? { ok: true } : { ok: false, error: result.error });
    return true;
  }

  if (action === "player-answer" && request.method === "POST") {
    let body = {};
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendJson(response, 400, { ok: false, error: error.message });
      return true;
    }

    const result = store.submitPlayerAnswer(sessionId, tokenFromRequest(request, url), body);
    sendJson(response, result.status, result.ok ? { ok: true, answer: result.answer } : { ok: false, error: result.error });
    return true;
  }

  sendJson(response, 405, { ok: false, error: "Method not allowed." });
  return true;
}

function normalizePublicPath(urlPathname) {
  let pathname = urlPathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch (error) {
    return "";
  }

  if (pathname === "/") {
    return "index.html";
  }

  const normalized = path.posix.normalize(pathname).replace(/^\/+/, "");
  if (!normalized || normalized.startsWith("../") || normalized.includes("/../")) {
    return "";
  }

  return normalized;
}

function isAllowedPublicPath(relativePath) {
  if (PUBLIC_FILES.has(relativePath)) {
    return true;
  }

  return relativePath.startsWith("icons/") && !relativePath.includes("..");
}

function serveStatic(request, response, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  const publicPath = normalizePublicPath(url.pathname);
  if (!publicPath || !isAllowedPublicPath(publicPath)) {
    sendJson(response, 404, { ok: false, error: "Not found." });
    return;
  }

  const absolutePath = path.resolve(ROOT_DIR, publicPath);
  if (!absolutePath.startsWith(`${ROOT_DIR}${path.sep}`) && absolutePath !== path.join(ROOT_DIR, "index.html")) {
    sendJson(response, 404, { ok: false, error: "Not found." });
    return;
  }

  fs.stat(absolutePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(response, 404, { ok: false, error: "Not found." });
      return;
    }

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(absolutePath)] || "application/octet-stream",
      "Cache-Control": publicPath === "index.html" ? "no-cache" : "public, max-age=300"
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(absolutePath).pipe(response);
  });
}

function createServer(options = {}) {
  const store = options.store || createSessionStore(options.storeOptions);
  return http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", requestOrigin(request));

    try {
      const handled = await handleApi(request, response, url, store);
      if (handled) {
        return;
      }
    } catch (error) {
      sendJson(response, 500, { ok: false, error: "Internal server error." });
      return;
    }

    serveStatic(request, response, url);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  const host = process.env.HOST || "0.0.0.0";
  const server = createServer();

  server.listen(port, host, () => {
    console.log(`420IQ Studio listening on http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
  });
}

module.exports = {
  MAX_JSON_BYTES,
  buildSessionLinks,
  createServer,
  createSessionStore,
  parseBearerToken,
  publicGameSnapshot,
  sanitizePlayerAnswer
};
