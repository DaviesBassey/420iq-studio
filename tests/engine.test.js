const test = require("node:test");
const assert = require("node:assert/strict");

const engine = require("../engine.js");

const sampleQuestions = [
  {
    id: "q-science-1",
    domain: "Science & Plant Literacy",
    difficulty: "Spark",
    stem: "What does THC stand for?",
    choices: [
      "Tetrahydrocannabinol",
      "Terpene hybrid compound",
      "Total hemp content",
      "Traditional herbal code"
    ],
    correctIndex: 0,
    knowledgeDrop: "THC is one cannabinoid among many studied in cannabis research.",
    sourceSignals: [
      "A cannabinoid name usually ends with -ol.",
      "A marketing term can replace a chemical name.",
      "A growing method defines the molecule."
    ],
    verifiedSignalIndex: 0,
    readTime: 8,
    sensitivity: "Tier 1"
  },
  {
    id: "q-history-1",
    domain: "History & Global Roots",
    difficulty: "Flame",
    stem: "Which material use is historically associated with hemp fiber?",
    choices: ["Rope", "Glass", "Porcelain", "Concrete dye"],
    correctIndex: 0,
    knowledgeDrop: "Hemp fiber has long been used in textiles and cordage.",
    sourceSignals: ["Cordage is a fiber use.", "Glass is spun from plant bast.", "Porcelain is made from stems."],
    verifiedSignalIndex: 0,
    readTime: 9,
    sensitivity: "Tier 1"
  },
  {
    id: "q-culture-1",
    domain: "Culture & Media",
    difficulty: "Inferno",
    stem: "Which term describes exaggerated claims presented without strong evidence?",
    choices: ["Hype", "Taxonomy", "Pollination", "Fermentation"],
    correctIndex: 0,
    knowledgeDrop: "Evidence literacy is a core part of the 420 IQ format.",
    sourceSignals: ["Claims need evidence quality checks.", "All traditional use is clinical proof.", "Popularity makes a claim verified."],
    verifiedSignalIndex: 0,
    readTime: 11,
    sensitivity: "Tier 2"
  },
  {
    id: "q-business-1",
    domain: "Business & Ethics",
    difficulty: "Wild 420",
    stem: "What should a sponsor-neutral prize avoid in this format?",
    choices: ["Cannabis products", "Learning experiences", "Trophy status", "Council session"],
    correctIndex: 0,
    knowledgeDrop: "The format rewards knowledge, not purchasing or consumption.",
    sourceSignals: ["Knowledge prizes avoid product promotion.", "Any sponsor item is automatically suitable.", "Consumption is required to prove expertise."],
    verifiedSignalIndex: 0,
    readTime: 10,
    sensitivity: "Tier 2"
  }
];

test("public payload hides correct answers and verified source signal index before reveal", () => {
  const game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "public-payload"
  });

  const currentQuestion = engine.currentQuestion(game);
  const publicQuestion = engine.getPublicQuestion(game);

  assert.equal(publicQuestion.stem, currentQuestion.stem);
  assert.equal(publicQuestion.correctIndex, undefined);
  assert.equal(publicQuestion.verifiedSignalIndex, undefined);
  assert.equal(publicQuestion.sourceSignals.length, 3);
});

test("created games carry the current static pilot version", () => {
  const game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "version-check"
  });

  assert.equal(game.version, "420iq-static-pilot-v2");
});

test("finite-state machine rejects invalid transitions", () => {
  const game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "invalid-transition"
  });

  assert.throws(
    () => engine.transition(game, "REVEAL", {}, "producer"),
    /Invalid transition/
  );
});

test("confidence scoring applies multipliers and never drops below zero", () => {
  assert.equal(
    engine.scoreAnswer({
      difficulty: "Flame",
      confidence: "Confident",
      correct: true,
      currentScore: 0
    }).delta,
    375
  );

  assert.deepEqual(
    engine.scoreAnswer({
      difficulty: "Inferno",
      confidence: "Certain",
      correct: false,
      currentScore: 60
    }),
    { delta: -60, nextScore: 0, stealEligible: true }
  );
});

test("final IQ target is won or lost exactly on the 420 Decision", () => {
  assert.deepEqual(
    engine.scoreAnswer({
      difficulty: "Final",
      confidence: "Certain",
      correct: true,
      currentScore: 800,
      riskPoints: 500
    }),
    { delta: 500, nextScore: 1300, stealEligible: false }
  );

  assert.deepEqual(
    engine.scoreAnswer({
      difficulty: "Final",
      confidence: "Certain",
      correct: false,
      currentScore: 800,
      riskPoints: 500
    }),
    { delta: -500, nextScore: 300, stealEligible: true }
  );
});

test("lifelines cannot be reused and trusted circle falls back when contacts are unavailable", () => {
  let game = engine.createGame({
    mode: "couple",
    players: [{ name: "Nia" }, { name: "Sol" }],
    questions: sampleQuestions,
    seed: "lifeline-test",
    trustedCircle: [
      { name: "Mina", available: false, cleared: true },
      { name: "Jay", available: false, cleared: true }
    ]
  });

  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");
  game = engine.activateLifeline(game, "trustedCircle", "producer");

  assert.equal(game.lifelineActive.type, "trustedCircle");
  assert.equal(game.lifelineActive.mode, "Circle Consensus");
  assert.equal(game.lifelines.trustedCircle.used, true);
  assert.throws(
    () => engine.activateLifeline(game, "trustedCircle", "producer"),
    /already used/
  );
});

test("50:50 removes two wrong answers, keeps the correct one, and cannot repeat", () => {
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "fifty-test"
  });

  // Cannot use it before the question is live.
  assert.throws(() => engine.useFiftyFifty(game, "producer"), /Cannot use 50:50/);

  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");

  const correctIndex = engine.currentQuestion(game).correctIndex;
  game = engine.useFiftyFifty(game, "producer");

  const removed = game.lifelines.fiftyFifty.removed;
  assert.equal(game.lifelines.fiftyFifty.used, true);
  assert.equal(removed.length, 2);
  assert.ok(!removed.includes(correctIndex), "never removes the correct answer");
  assert.equal(game.phase, "QUESTION_LIVE", "50:50 is an instant modifier, not a resolution flow");

  // The public payload surfaces the removed pair (wrong answers only) and still
  // hides the answer key.
  const publicQuestion = engine.getPublicQuestion(game);
  assert.deepEqual(publicQuestion.fiftyFiftyRemoved.slice().sort(), removed.slice().sort());
  assert.equal(publicQuestion.correctIndex, undefined);

  assert.throws(() => engine.useFiftyFifty(game, "producer"), /already used/);
});

test("banked guarantee floors the score and walk-away ends the run at the banked total", () => {
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "walkaway-test"
  });

  assert.equal(game.guaranteedFloor, 0, "new games start with no guarantee");
  assert.equal(game.outcome, null);

  // A guaranteed floor stops a wrong answer from dropping the score below it.
  const scored = engine.scoreAnswer({
    difficulty: "Inferno",
    confidence: "Certain",
    correct: false,
    currentScore: 500,
    guaranteedFloor: 400
  });
  assert.equal(scored.nextScore, 400, "-200 would give 300, but the floor holds at 400");

  // bankGuarantee locks the current score as the floor and never lowers it.
  game.scores[game.participant.id] = 600;
  game = engine.bankGuarantee(game, "producer");
  assert.equal(game.guaranteedFloor, 600);
  game.scores[game.participant.id] = 300;
  game = engine.bankGuarantee(game, "producer");
  assert.equal(game.guaranteedFloor, 600, "banking never lowers the floor");

  // Drive to a between-questions state, then walk away.
  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");
  const correctIndex = engine.currentQuestion(game).correctIndex;
  game = engine.lockAnswer(game, { choiceIndex: correctIndex, confidence: "Curious" }, "contestant");
  game = engine.revealAnswer(game, "producer");
  game = engine.commitScore(game, "scorekeeper");
  assert.equal(game.phase, "SCORE_COMMITTED");

  const banked = game.scores[game.participant.id];
  game = engine.walkAway(game, "producer");
  assert.equal(game.phase, "COMPLETE");
  assert.equal(game.outcome.type, "walkAway");
  assert.equal(game.outcome.bankedScore, banked);

  // Cannot walk away again from a completed show.
  assert.throws(() => engine.walkAway(game, "producer"), /Cannot walk away/);
});

test("same seed builds the same valid balanced sequence", () => {
  const first = engine.buildBalancedSequence(sampleQuestions, {
    seed: "episode-101",
    count: 4
  });
  const second = engine.buildBalancedSequence(sampleQuestions, {
    seed: "episode-101",
    count: 4
  });

  assert.deepEqual(
    first.sequence.map(question => question.id),
    second.sequence.map(question => question.id)
  );
  assert.equal(first.diagnostics.valid, true);
  assert.equal(first.diagnostics.violations.length, 0);
});

test("answer choices are shuffled so the correct answer is not always in the same slot", () => {
  const packA = engine.buildBalancedSequence(sampleQuestions, { seed: "shuffle-check" });
  const packB = engine.buildBalancedSequence(sampleQuestions, { seed: "shuffle-check" });

  // Deterministic: same seed reproduces the same choice order + correctIndex.
  assert.deepEqual(
    packA.sequence.map(q => [q.id, q.correctIndex]),
    packB.sequence.map(q => [q.id, q.correctIndex])
  );

  // The correct answer lands in more than one slot across the pack (not all "A").
  const positions = new Set(packA.sequence.map(q => q.correctIndex));
  assert.ok(positions.size > 1, "correct answers should not all share one slot");

  // The remap is faithful: the choice at correctIndex is still the source-correct text.
  const sourceCorrect = new Map(sampleQuestions.map(q => [q.id, q.choices[q.correctIndex]]));
  packA.sequence.forEach(q => {
    assert.equal(q.choices[q.correctIndex], sourceCorrect.get(q.id));
  });
});

test("question timer reports remaining time and expiry", () => {
  const game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "timer-test"
  });

  const timedGame = engine.startQuestionTimer(game, 30, 1000, "producer");

  assert.deepEqual(
    engine.getTimerSnapshot(timedGame, 1000),
    { durationSeconds: 30, remainingSeconds: 30, elapsedSeconds: 0, expired: false }
  );
  assert.deepEqual(
    engine.getTimerSnapshot(timedGame, 11000),
    { durationSeconds: 30, remainingSeconds: 20, elapsedSeconds: 10, expired: false }
  );
  assert.deepEqual(
    engine.getTimerSnapshot(timedGame, 31500),
    { durationSeconds: 30, remainingSeconds: 0, elapsedSeconds: 30, expired: true }
  );
});

test("answer reveal carries the correct SFX cue", () => {
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "sfx-test"
  });

  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");
  const question = engine.currentQuestion(game);
  const wrongIndex = (question.correctIndex + 1) % question.choices.length;
  game = engine.lockAnswer(game, { choiceIndex: wrongIndex, confidence: "Curious" }, "contestant");
  game = engine.revealAnswer(game, "producer");

  assert.equal(game.reveal.correct, false);
  assert.equal(game.reveal.audioCue, "answerWrong");
});

test("score commit marks the end of a segment with an outro SFX cue", () => {
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "segment-outro-test"
  });

  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");
  game = engine.lockAnswer(game, { choiceIndex: 0, confidence: "Curious" }, "contestant");
  game = engine.revealAnswer(game, "producer");
  game = engine.commitScore(game, "scorekeeper");

  const lastEvent = game.events.at(-1);

  assert.equal(game.segmentOutro.audioCue, "segmentOutro");
  assert.equal(game.segmentOutro.segmentNumber, 1);
  assert.equal(lastEvent.payload.audioCue, "segmentOutro");
});

test("rewind restores prior functional state while preserving the audit trail", () => {
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "rewind-test"
  });

  const preIntroSnapshot = game;
  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  const eventsBeforeRewind = game.events.length;

  const rewound = engine.rewind(game, preIntroSnapshot, "producer");

  // Functional state reverts to the snapshot...
  assert.equal(rewound.phase, "PRE_SHOW");
  // ...but the audit trail is preserved and grows by one compensating event.
  assert.equal(rewound.events.length, eventsBeforeRewind + 1);

  const marker = rewound.events.at(-1);
  assert.equal(marker.type, "STATE_REWIND");
  assert.equal(marker.previousState, "QUESTION_READY");
  assert.equal(marker.nextState, "PRE_SHOW");
});

test("commit records a per-question result that a rewind cleanly removes", () => {
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "recap-ledger"
  });

  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");
  const beforeLock = game;
  game = engine.lockAnswer(game, { choiceIndex: engine.currentQuestion(game).correctIndex, confidence: "Curious" }, "contestant");
  game = engine.revealAnswer(game, "producer");
  game = engine.commitScore(game, "scorekeeper");

  assert.equal(game.results.length, 1);
  assert.equal(game.results[0].index, 0);
  assert.equal(game.results[0].correct, true);
  assert.equal(typeof game.results[0].delta, "number");

  const rewound = engine.rewind(game, beforeLock, "producer");
  assert.equal(rewound.results.length, 0);
});

test("rewind refuses when there is no prior snapshot", () => {
  const game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions,
    seed: "rewind-guard"
  });

  assert.throws(() => engine.rewind(game, null, "producer"), /No prior state/);
});

test("final decision opens the final question from the selected category", () => {
  const finalQuestions = [
    {
      id: "q-final-future",
      domain: "Future & Innovation",
      difficulty: "Final",
      final: true,
      stem: "Which final category checks future sourcing?",
      choices: ["Future source cue", "Sports ruling", "Music archive", "Sponsor claim"],
      correctIndex: 0,
      knowledgeDrop: "Future-facing claims still need verifiable source boundaries.",
      sourceSignals: ["Future source cue is the category clue.", "Sports rules decide every final.", "Archives replace date checks."],
      verifiedSignalIndex: 0,
      readTime: 12,
      sensitivity: "Tier 2"
    },
    {
      id: "q-final-sports",
      domain: "Sports & Performance",
      difficulty: "Final",
      final: true,
      stem: "Which final category checks athlete eligibility?",
      choices: ["Current governing-body rule", "Venue size", "Fan poll", "Jersey color"],
      correctIndex: 0,
      knowledgeDrop: "Sports eligibility questions must point to the current governing-body rule.",
      sourceSignals: ["Current governing-body rule matches sports.", "Fan polls set policy.", "Venue size decides eligibility."],
      verifiedSignalIndex: 0,
      readTime: 12,
      sensitivity: "Tier 2"
    }
  ];
  let game = engine.createGame({
    mode: "solo",
    players: [{ name: "Ari" }],
    questions: sampleQuestions.concat(finalQuestions),
    seed: "selected-final-category"
  });

  game = engine.transition(game, "INTRO", {}, "producer");
  game = engine.transition(game, "QUESTION_READY", {}, "producer");
  game = engine.transition(game, "QUESTION_LIVE", {}, "producer");
  game = engine.lockAnswer(game, { choiceIndex: 0, confidence: "Curious" }, "contestant");
  game = engine.revealAnswer(game, "producer");
  game = engine.commitScore(game, "scorekeeper");
  game = engine.startFinalDecision(game, {
    riskBand: "Rise",
    category: "Sports & Performance"
  }, "producer");
  game = engine.openFinalQuestion(game, "producer");

  const finalQuestion = engine.currentQuestion(game);

  assert.equal(finalQuestion.id, "q-final-sports");
  assert.equal(finalQuestion.domain, "Sports & Performance");
});
