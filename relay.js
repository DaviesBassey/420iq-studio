/**
 * 420IQ live relay — cross-device state sync for the pilot.
 *
 * The app is local-first: the host drives its own session and, in-browser,
 * mirrors state to same-machine display windows over BroadcastChannel. This
 * relay extends that same one-way model across the LAN so a contestant's phone
 * (or a second screen) can subscribe to the live show:
 *
 *   - The host POSTs the public game state to /sync/publish on every change.
 *   - Displays open an EventSource on /sync/subscribe and receive each update,
 *     plus the last cached state immediately on connect (so a phone that joins
 *     mid-show catches up without waiting for the next change).
 *
 * It also serves the static app (same role as `python -m http.server`), so a
 * single `node relay.js` covers both the files and the sync channel. Zero
 * dependencies: Node's built-in http + Server-Sent Events. There is no cloud
 * hop — state stays on the LAN, which suits recording day. For an audience
 * "from anywhere" phase, swap this transport for a hosted pub/sub; the client
 * message shape ({type:"state", game}) is intentionally identical.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json"
};

const MAX_PUBLISH_BYTES = 2_000_000;

function createRelayServer(options = {}) {
  const root = options.root || process.cwd();
  const subscribers = new Set();
  let lastState = null; // raw JSON string of the most recent host state
  let lastAnswer = null; // raw JSON string of the most recent contestant answer

  function fanOut(payload) {
    for (const res of subscribers) {
      try {
        res.write(`data: ${payload}\n\n`);
      } catch (error) {
        subscribers.delete(res);
      }
    }
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    // --- SSE subscribe: displays listen for host state ---
    if (pathname === "/sync/subscribe" && req.method === "GET") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "access-control-allow-origin": "*"
      });
      res.write(": connected\n\n");
      subscribers.add(res);
      if (lastState !== null) {
        res.write(`data: ${lastState}\n\n`);
      }
      if (lastAnswer !== null) {
        res.write(`data: ${lastAnswer}\n\n`);
      }
      // Keep intermediaries from closing an idle stream.
      const ping = setInterval(() => {
        try {
          res.write(": ping\n\n");
        } catch (error) {
          /* connection gone; cleaned up on close */
        }
      }, 25000);
      req.on("close", () => {
        clearInterval(ping);
        subscribers.delete(res);
      });
      return;
    }

    // --- publish: the host pushes authoritative state ---
    if (pathname === "/sync/publish" && req.method === "POST") {
      let body = "";
      let aborted = false;
      req.on("data", chunk => {
        body += chunk;
        if (body.length > MAX_PUBLISH_BYTES) {
          aborted = true;
          res.writeHead(413, { "access-control-allow-origin": "*" });
          res.end("payload too large");
          req.destroy();
        }
      });
      req.on("end", () => {
        if (aborted) return;
        try {
          JSON.parse(body);
        } catch (error) {
          res.writeHead(400, { "access-control-allow-origin": "*" });
          res.end("invalid json");
          return;
        }
        lastState = body;
        fanOut(body);
        res.writeHead(204, { "access-control-allow-origin": "*" });
        res.end();
      });
      return;
    }

    // --- answer: a contestant device sends its selection back to the host ---
    if (pathname === "/sync/answer" && req.method === "POST") {
      let body = "";
      let aborted = false;
      req.on("data", chunk => {
        body += chunk;
        if (body.length > MAX_PUBLISH_BYTES) {
          aborted = true;
          res.writeHead(413, { "access-control-allow-origin": "*" });
          res.end("payload too large");
          req.destroy();
        }
      });
      req.on("end", () => {
        if (aborted) return;
        try {
          JSON.parse(body);
        } catch (error) {
          res.writeHead(400, { "access-control-allow-origin": "*" });
          res.end("invalid json");
          return;
        }
        // Cached separately from state so it never overwrites the show state, and
        // replayed to a host that reconnects. The host guards by question index.
        lastAnswer = body;
        fanOut(body);
        res.writeHead(204, { "access-control-allow-origin": "*" });
        res.end();
      });
      return;
    }

    // --- health / feature-detection for the client ---
    if (pathname === "/sync/health" && req.method === "GET") {
      // Hand the client the machine's LAN address (LAN IP + the port it was
      // reached on) so the join QR resolves to a phone-reachable URL even when
      // the host page was opened via localhost.
      const reqHost = req.headers.host || "";
      const portPart = reqHost.includes(":") ? reqHost.split(":")[1] : "";
      const lanIp = firstLanAddress();
      const lanHost = lanIp !== "localhost" && portPart ? `${lanIp}:${portPart}` : null;
      res.writeHead(200, {
        "content-type": "application/json",
        "access-control-allow-origin": "*"
      });
      res.end(
        JSON.stringify({ ok: true, host: lanHost, subscribers: subscribers.size, hasState: lastState !== null })
      );
      return;
    }

    // --- static file serving (the app shell) ---
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end("method not allowed");
      return;
    }

    let rel = decodeURIComponent(pathname);
    if (rel === "/" || rel === "") {
      rel = "/index.html";
    }

    const filePath = path.join(root, rel);
    const relCheck = path.relative(root, filePath);
    if (relCheck.startsWith("..") || path.isAbsolute(relCheck)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("not found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(filePath).pipe(res);
    });
  });

  return server;
}

function firstLanAddress() {
  try {
    const os = require("node:os");
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        // Skip loopback and link-local (169.254.x) — neither is phone-reachable.
        if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254.")) {
          return net.address;
        }
      }
    }
  } catch (error) {
    /* fall through */
  }
  return "localhost";
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8787);
  const server = createRelayServer({ root: __dirname });
  server.listen(port, "0.0.0.0", () => {
    const ip = firstLanAddress();
    process.stdout.write(
      `\n  420IQ live relay on ${port} — host publishes, phones subscribe.\n` +
        `  Open the HOST on this LAN address (both devices on the same Wi-Fi):\n` +
        `    http://${ip}:${port}/index.html#host\n\n`
    );
  });
}

module.exports = { createRelayServer };
