const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const { createRelayServer } = require("../relay.js");

const projectRoot = path.resolve(__dirname, "..");

function listen(server) {
  return new Promise(resolve =>
    server.listen(0, "127.0.0.1", () => resolve(server.address().port))
  );
}

function close(server) {
  return new Promise(resolve => server.close(resolve));
}

function postJson(port, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body));
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: urlPath,
        method: "POST",
        headers: { "content-type": "application/json", "content-length": data.length }
      },
      res => {
        let b = "";
        res.on("data", c => (b += c));
        res.on("end", () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function postReset(port) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: "127.0.0.1", port, path: "/sync/reset", method: "POST" },
      res => {
        res.on("data", () => {});
        res.on("end", () => resolve(res.statusCode));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function getPlain(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: "127.0.0.1", port, path: urlPath }, res => {
      let b = "";
      res.on("data", c => (b += c));
      res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject);
  });
}

// Opens an SSE subscription and exposes next() -> Promise<string> for each `data:` payload.
function subscribe(port) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: "127.0.0.1", port, path: "/sync/subscribe" }, res => {
      let buf = "";
      const events = [];
      const waiters = [];
      res.setEncoding("utf8");
      res.on("data", chunk => {
        buf += chunk;
        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const raw = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const dataLine = raw.split("\n").find(l => l.startsWith("data:"));
          if (dataLine) {
            const payload = dataLine.slice(5).trim();
            const waiter = waiters.shift();
            if (waiter) waiter(payload);
            else events.push(payload);
          }
        }
      });
      resolve({
        req,
        next() {
          return new Promise(r => {
            const queued = events.shift();
            if (queued !== undefined) r(queued);
            else waiters.push(r);
          });
        }
      });
    });
    req.on("error", reject);
  });
}

test("subscriber receives state published after it connects", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const sub = await subscribe(port);

  const message = { type: "state", game: { version: "v", phase: "QUESTION_LIVE" } };
  await postJson(port, "/sync/publish", message);

  const received = await sub.next();
  assert.deepEqual(JSON.parse(received), message);

  sub.req.destroy();
  await close(server);
});

test("a late subscriber immediately gets the last published state", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);

  const message = { type: "state", game: { version: "v", phase: "REVEAL" } };
  await postJson(port, "/sync/publish", message);

  const sub = await subscribe(port);
  const received = await sub.next();
  assert.deepEqual(JSON.parse(received), message);

  sub.req.destroy();
  await close(server);
});

test("publish fans out to every connected subscriber", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const a = await subscribe(port);
  const b = await subscribe(port);

  const message = { type: "state", game: { version: "v", phase: "INTRO" } };
  await postJson(port, "/sync/publish", message);

  assert.deepEqual(JSON.parse(await a.next()), message);
  assert.deepEqual(JSON.parse(await b.next()), message);

  a.req.destroy();
  b.req.destroy();
  await close(server);
});

test("rejects invalid JSON on publish", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const res = await new Promise((resolve, reject) => {
    const data = Buffer.from("{not json");
    const req = http.request(
      { host: "127.0.0.1", port, path: "/sync/publish", method: "POST", headers: { "content-length": data.length } },
      r => {
        let b = "";
        r.on("data", c => (b += c));
        r.on("end", () => resolve({ status: r.statusCode, body: b }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
  assert.equal(res.status, 400);
  await close(server);
});

test("serves the app shell at the site root", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const res = await getPlain(port, "/");
  assert.equal(res.status, 200);
  assert.match(res.body, /420IQ/);
  await close(server);
});

test("does not serve files outside the app root", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const res = await getPlain(port, "/../../../etc/passwd");
  assert.notEqual(res.status, 200);
  await close(server);
});

test("client wires network sync: host publishes, displays subscribe", () => {
  const fs = require("node:fs");
  const app = fs.readFileSync(path.join(projectRoot, "app.js"), "utf8");

  // Feature-detected activation and the two transport directions.
  assert.match(app, /function initNetworkSync/);
  assert.match(app, /\/sync\/health/);
  assert.match(app, /function publishStateToRelay/);
  assert.match(app, /\/sync\/publish/);
  assert.match(app, /function openRelayStateStream/);
  assert.match(app, /new EventSource\("\/sync\/subscribe"\)/);
  // Host broadcast mirrors to the relay, and init runs at startup.
  assert.match(app, /postSync\(\{ type: "state", game \}\);\s*publishStateToRelay\(\);/);
  assert.match(app, /initNetworkSync\(\);/);

  // Answer path: the player posts its tap, the host applies it as a pending pick.
  assert.match(app, /function publishAnswerToRelay/);
  assert.match(app, /"\/sync\/answer"/);
  assert.match(app, /function applyIncomingAnswer/);
  assert.match(app, /message\.type === "answer" && !isDisplayAccess\(\)/);
  assert.match(app, /publishAnswerToRelay\(index\);/);

  // Localhost QR: the client adopts the relay-reported LAN host so the QR works
  // without manual IP entry when the host was opened via localhost.
  assert.match(app, /info\.host && !joinHostOverride && isLoopbackHost\(location\.hostname\)/);
  assert.match(app, /joinHostOverride = info\.host;/);

  // Reset path: host clears -> displays return to the waiting screen.
  assert.match(app, /function broadcastReset/);
  assert.match(app, /"\/sync\/reset"/);
  assert.match(app, /function clearDisplayGame/);
  assert.match(app, /message\.type === "reset" && isDisplayAccess\(\)/);
  assert.match(app, /broadcastReset\(\);/);
});

test("reset clears cached state and notifies connected displays", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);

  await postJson(port, "/sync/publish", { type: "state", game: { version: "v", phase: "QUESTION_LIVE" } });
  const sub = await subscribe(port);
  assert.equal(JSON.parse(await sub.next()).type, "state"); // cached state on connect

  assert.equal(await postReset(port), 204);
  assert.deepEqual(JSON.parse(await sub.next()), { type: "reset" }); // live fan-out

  sub.req.destroy();
  await close(server);
});

test("after reset a fresh subscriber receives no stale state", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);

  await postJson(port, "/sync/publish", { type: "state", game: { version: "v", phase: "REVEAL" } });
  await postReset(port);

  const sub = await subscribe(port);
  const outcome = await Promise.race([
    sub.next().then(value => ({ got: value })),
    new Promise(resolve => setTimeout(() => resolve({ got: null }), 400))
  ]);
  assert.equal(outcome.got, null); // nothing cached to replay

  sub.req.destroy();
  await close(server);
});

test("health reports the machine's LAN host for the join QR", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const res = await getPlain(port, "/sync/health");
  const info = JSON.parse(res.body);
  assert.equal(info.ok, true);
  assert.ok("host" in info); // string "ip:port" when a LAN address exists, else null
  if (info.host !== null) {
    assert.match(info.host, /^\d+\.\d+\.\d+\.\d+:\d+$/);
  }
  await close(server);
});

test("relays a contestant answer to subscribers", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);
  const sub = await subscribe(port);

  const answer = { type: "answer", choiceIndex: 2, questionIndex: 0 };
  await postJson(port, "/sync/answer", answer);

  assert.deepEqual(JSON.parse(await sub.next()), answer);
  sub.req.destroy();
  await close(server);
});

test("a late subscriber receives the cached last answer", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);

  const answer = { type: "answer", choiceIndex: 1, questionIndex: 3 };
  await postJson(port, "/sync/answer", answer);

  const sub = await subscribe(port);
  assert.deepEqual(JSON.parse(await sub.next()), answer);
  sub.req.destroy();
  await close(server);
});

test("answers do not overwrite cached state — both replay on connect", async () => {
  const server = createRelayServer({ root: projectRoot });
  const port = await listen(server);

  const state = { type: "state", game: { version: "v", phase: "QUESTION_LIVE" } };
  const answer = { type: "answer", choiceIndex: 0, questionIndex: 0 };
  await postJson(port, "/sync/publish", state);
  await postJson(port, "/sync/answer", answer);

  const sub = await subscribe(port);
  const first = JSON.parse(await sub.next());
  const second = JSON.parse(await sub.next());
  assert.deepEqual([first.type, second.type].sort(), ["answer", "state"]);

  sub.req.destroy();
  await close(server);
});
