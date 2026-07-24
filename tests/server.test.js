const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MAX_JSON_BYTES,
  createSessionStore,
  buildSessionLinks,
  parseBearerToken,
  publicGameSnapshot,
  sanitizePlayerAnswer
} = require("../server.js");

test("session server issues separate role tokens and scoped share links", () => {
  const store = createSessionStore();
  const session = store.createSession({
    origin: "http://localhost:8787"
  });

  assert.ok(session.sessionId);
  assert.notEqual(session.hostToken, session.playerToken);
  assert.notEqual(session.hostToken, session.stageToken);
  assert.equal(store.authenticate(session.sessionId, "host", session.hostToken), true);
  assert.equal(store.authenticate(session.sessionId, "host", session.playerToken), false);
  assert.equal(store.authenticate(session.sessionId, "player", session.playerToken), true);

  const links = buildSessionLinks(session, "http://localhost:8787");

  assert.match(links.host, /access=admin/);
  assert.match(links.player, /access=player/);
  assert.match(links.stage, /access=stage/);
  assert.ok(!links.player.includes(session.hostToken), "player link must not leak host token");
  assert.ok(!links.stage.includes(session.hostToken), "stage link must not leak host token");
});

test("session server allows only host tokens to publish state", () => {
  const store = createSessionStore();
  const session = store.createSession();

  const game = {
    version: "420iq-static-pilot-v2",
    phase: "QUESTION_LIVE",
    activeQuestionIndex: 0
  };

  assert.equal(store.publishState(session.sessionId, session.playerToken, game).ok, false);
  assert.equal(store.publishState(session.sessionId, session.hostToken, game).ok, true);
  assert.deepEqual(store.getSession(session.sessionId).game, game);
});

test("player answer payloads are bounded and normalized", () => {
  assert.deepEqual(
    sanitizePlayerAnswer({
      choiceIndex: "2",
      confidence: "Certain",
      participant: "Ari Stone"
    }),
    {
      choiceIndex: 2,
      confidence: "Certain",
      participant: "Ari Stone"
    }
  );

  assert.throws(() => sanitizePlayerAnswer({ choiceIndex: -1 }), /Invalid answer choice/);
  assert.throws(() => sanitizePlayerAnswer({ choiceIndex: 99 }), /Invalid answer choice/);
  assert.equal(MAX_JSON_BYTES, 1024 * 1024);
});

test("bearer token parser accepts Authorization headers without query leakage", () => {
  assert.equal(parseBearerToken("Bearer abc123"), "abc123");
  assert.equal(parseBearerToken("bearer abc123"), "abc123");
  assert.equal(parseBearerToken("Basic abc123"), "");
  assert.equal(parseBearerToken(""), "");
});

test("public game snapshots strip answer keys and private show internals", () => {
  const game = {
    version: "420iq-static-pilot-v2",
    phase: "QUESTION_LIVE",
    activeQuestionIndex: 0,
    pack: {
      sequence: [
        {
          id: "q1",
          stem: "Question?",
          choices: ["A", "B"],
          correctIndex: 1,
          verifiedSignalIndex: 0,
          knowledgeDrop: "Private explanation",
          sourceCue: "Private source",
          correctAsOf: "Private date"
        }
      ]
    },
    trustedCircle: [{ name: "Private Contact" }],
    lifelineActive: {
      type: "trustedCircle",
      selectedContact: { name: "Private Contact" }
    },
    events: [{ payload: { correctIndex: 1 } }]
  };

  const publicSnapshot = publicGameSnapshot(game);

  assert.equal(publicSnapshot.pack.sequence[0].correctIndex, undefined);
  assert.equal(publicSnapshot.pack.sequence[0].verifiedSignalIndex, undefined);
  assert.equal(publicSnapshot.pack.sequence[0].knowledgeDrop, undefined);
  assert.deepEqual(publicSnapshot.trustedCircle, []);
  assert.equal(publicSnapshot.lifelineActive.selectedContact, null);
  assert.deepEqual(publicSnapshot.events, []);
});
