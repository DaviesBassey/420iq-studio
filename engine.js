(function attach420IQEngine(globalObject) {
  "use strict";

  const PHASES = [
    "PRE_SHOW",
    "INTRO",
    "QUESTION_READY",
    "QUESTION_LIVE",
    "LIFELINE_ACTIVE",
    "ANSWER_LOCKED",
    "REVEAL",
    "KNOWLEDGE_DROP",
    "SCORE_COMMITTED",
    "NEXT_QUESTION",
    "FINAL",
    "COMPLETE"
  ];

  const VALID_TRANSITIONS = {
    PRE_SHOW: ["INTRO"],
    INTRO: ["QUESTION_READY"],
    QUESTION_READY: ["QUESTION_LIVE"],
    QUESTION_LIVE: ["LIFELINE_ACTIVE", "ANSWER_LOCKED", "FINAL"],
    LIFELINE_ACTIVE: ["QUESTION_LIVE", "ANSWER_LOCKED"],
    ANSWER_LOCKED: ["REVEAL"],
    REVEAL: ["KNOWLEDGE_DROP", "SCORE_COMMITTED"],
    KNOWLEDGE_DROP: ["SCORE_COMMITTED"],
    SCORE_COMMITTED: ["NEXT_QUESTION", "FINAL", "COMPLETE"],
    NEXT_QUESTION: ["QUESTION_READY", "FINAL", "COMPLETE"],
    FINAL: ["QUESTION_READY", "COMPLETE"],
    COMPLETE: []
  };

  const DIFFICULTY_POINTS = {
    Spark: 100,
    Flame: 250,
    Inferno: 500,
    "Wild 420": 420,
    Final: 500
  };

  const DIFFICULTY_PENALTIES = {
    Spark: 0,
    Flame: -50,
    Inferno: -100,
    "Wild 420": -84,
    Final: 0
  };

  const DIFFICULTY_WEIGHT = {
    Spark: 1,
    Flame: 2.5,
    Inferno: 5,
    "Wild 420": 4.2,
    Final: 5
  };

  const CONFIDENCE_MULTIPLIERS = {
    Curious: 1,
    Confident: 1.5,
    Certain: 2
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function assertPhase(phase) {
    if (!PHASES.includes(phase)) {
      throw new Error(`Unknown phase: ${phase}`);
    }
  }

  function normaliseName(name, fallback) {
    const value = String(name || "").trim();
    return value ? value.slice(0, 40) : fallback;
  }

  function hashSeed(input) {
    const source = String(input || "420iq");
    let hash = 2166136261;

    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function seededRandom(seed) {
    let state = hashSeed(seed) || 0x420420;

    return function nextRandom() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleWithSeed(items, seed) {
    const random = seededRandom(seed);
    const result = items.slice();

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      const current = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = current;
    }

    return result;
  }

  function questionId(question, index) {
    return String(question.id || `question-${index + 1}`);
  }

  function normaliseQuestion(question, index) {
    if (!question || typeof question.stem !== "string") {
      throw new Error(`Question ${index + 1} is missing a stem.`);
    }

    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      throw new Error(`Question ${index + 1} needs at least two choices.`);
    }

    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.choices.length
    ) {
      throw new Error(`Question ${index + 1} has an invalid correctIndex.`);
    }

    const difficulty = DIFFICULTY_POINTS[question.difficulty]
      ? question.difficulty
      : "Spark";

    return {
      id: questionId(question, index),
      domain: String(question.domain || "General Knowledge"),
      difficulty,
      stem: question.stem.trim(),
      choices: question.choices.map(choice => String(choice).trim()),
      correctIndex: question.correctIndex,
      knowledgeDrop: String(question.knowledgeDrop || ""),
      sourceSignals: Array.isArray(question.sourceSignals)
        ? question.sourceSignals.map(signal => String(signal).trim()).filter(Boolean).slice(0, 3)
        : [],
      verifiedSignalIndex: Number.isInteger(question.verifiedSignalIndex)
        ? question.verifiedSignalIndex
        : 0,
      readTime: Number.isFinite(question.readTime) ? question.readTime : 10,
      sensitivity: String(question.sensitivity || "Tier 1"),
      sourceCue: String(question.sourceCue || "Demo record: verify and source before broadcast."),
      correctAsOf: String(question.correctAsOf || "Demo only"),
      final: question.final === true
    };
  }

  function countRuns(sequence, fieldName) {
    let longestRun = 0;
    let currentRun = 0;
    let previous = null;

    sequence.forEach(item => {
      const value = item[fieldName];
      currentRun = value === previous ? currentRun + 1 : 1;
      previous = value;
      longestRun = Math.max(longestRun, currentRun);
    });

    return longestRun;
  }

  function moveFirstSparkIntoOpening(sequence) {
    const firstThreeHasSpark = sequence.slice(0, 3).some(question => question.difficulty === "Spark");

    if (firstThreeHasSpark || sequence.length < 3) {
      return sequence;
    }

    const sparkIndex = sequence.findIndex(question => question.difficulty === "Spark");
    if (sparkIndex < 0) {
      return sequence;
    }

    const result = sequence.slice();
    const spark = result.splice(sparkIndex, 1)[0];
    result.splice(1, 0, spark);
    return result;
  }

  function reduceDifficultyRuns(sequence) {
    const result = sequence.slice();

    for (let index = 2; index < result.length; index += 1) {
      const sameRun =
        result[index].difficulty === result[index - 1].difficulty &&
        result[index].difficulty === result[index - 2].difficulty;

      if (!sameRun) {
        continue;
      }

      const replacementIndex = result.findIndex((candidate, candidateIndex) => {
        return candidateIndex > index && candidate.difficulty !== result[index].difficulty;
      });

      if (replacementIndex > index) {
        const replacement = result[replacementIndex];
        result[replacementIndex] = result[index];
        result[index] = replacement;
      }
    }

    return result;
  }

  function validateSequence(sequence) {
    const violations = [];

    if (!sequence.length) {
      violations.push("Sequence is empty.");
    }

    if (
      sequence.length >= 3 &&
      !sequence.slice(0, 3).some(question => question.difficulty === "Spark")
    ) {
      violations.push("At least one Spark question must appear in the first three questions.");
    }

    if (
      sequence.length >= 4 &&
      !sequence.slice(1).some(question => question.difficulty === "Inferno")
    ) {
      violations.push("At least one Inferno question must appear after the opening question.");
    }

    if (countRuns(sequence, "difficulty") > 2) {
      violations.push("No more than two questions of the same difficulty may appear consecutively.");
    }

    const domainCounts = sequence.reduce((totals, question) => {
      totals[question.domain] = (totals[question.domain] || 0) + 1;
      return totals;
    }, {});
    const domainValues = Object.values(domainCounts);

    if (
      domainValues.length > 1 &&
      Math.max(...domainValues) - Math.min(...domainValues) > 1
    ) {
      violations.push("Category exposure differs by more than one question.");
    }

    const ids = new Set();
    sequence.forEach(question => {
      if (ids.has(question.id)) {
        violations.push(`Duplicate question id: ${question.id}`);
      }
      ids.add(question.id);
    });

    const totalDifficultyWeight = sequence.reduce(
      (total, question) => total + (DIFFICULTY_WEIGHT[question.difficulty] || 1),
      0
    );

    return {
      valid: violations.length === 0,
      violations,
      totalDifficultyWeight: Number(totalDifficultyWeight.toFixed(2)),
      longestDifficultyRun: countRuns(sequence, "difficulty"),
      domainCounts
    };
  }

  function shuffleQuestionChoices(question, seed) {
    // Deterministically reorder the answer choices so the correct answer is not
    // always in the same slot, then remap correctIndex to its new position.
    const order = shuffleWithSeed(
      question.choices.map((choice, index) => index),
      `${seed}:${question.id}:choices`
    );
    return {
      ...question,
      choices: order.map(index => question.choices[index]),
      correctIndex: order.indexOf(question.correctIndex)
    };
  }

  function buildBalancedSequence(questions, options = {}) {
    const count = Number.isInteger(options.count)
      ? Math.max(1, Math.min(options.count, questions.length))
      : questions.length;
    const seed = String(options.seed || "420iq-demo-pack");
    const normalised = questions.map(normaliseQuestion);
    const finalQuestions = normalised.filter(question => question.final);
    const regularQuestions = normalised.filter(question => !question.final);
    const finalCount = Math.min(finalQuestions.length, count);
    const regularCount = Math.max(0, Math.min(regularQuestions.length, count - finalCount));
    let bestSequence = regularQuestions.slice(0, regularCount).concat(finalQuestions.slice(0, finalCount));
    let bestDiagnostics = validateSequence(bestSequence);

    for (let candidateIndex = 0; candidateIndex < 120; candidateIndex += 1) {
      const candidateSeed = `${seed}:${candidateIndex}`;
      let candidate = shuffleWithSeed(regularQuestions, candidateSeed).slice(0, regularCount);
      candidate = moveFirstSparkIntoOpening(candidate);
      candidate = reduceDifficultyRuns(candidate);
      candidate = candidate.concat(finalQuestions.slice(0, finalCount));

      const diagnostics = validateSequence(candidate);
      const score =
        diagnostics.violations.length * 100 +
        diagnostics.longestDifficultyRun * 8 +
        Math.abs(diagnostics.totalDifficultyWeight - 10);

      const bestScore =
        bestDiagnostics.violations.length * 100 +
        bestDiagnostics.longestDifficultyRun * 8 +
        Math.abs(bestDiagnostics.totalDifficultyWeight - 10);

      if (score < bestScore) {
        bestSequence = candidate;
        bestDiagnostics = diagnostics;
      }

      if (diagnostics.valid) {
        bestSequence = candidate;
        bestDiagnostics = diagnostics;
        break;
      }
    }

    const shuffledSequence = bestSequence.map(question => shuffleQuestionChoices(question, seed));

    return {
      seed,
      checksum: checksumQuestions(shuffledSequence),
      sequence: shuffledSequence,
      diagnostics: {
        ...bestDiagnostics,
        seed
      }
    };
  }

  function checksumQuestions(sequence) {
    const source = sequence.map(question => `${question.id}:${question.correctIndex}`).join("|");
    return `pack-${hashSeed(source).toString(16).padStart(8, "0")}`;
  }

  function createParticipant(mode, players) {
    const safePlayers = Array.isArray(players) && players.length
      ? players
      : [{ name: "Contestant" }];
    const members = safePlayers.slice(0, mode === "couple" ? 2 : 1).map((player, index) => ({
      id: `member-${index + 1}`,
      name: normaliseName(player.name, `Player ${index + 1}`)
    }));

    return {
      id: "team-1",
      mode,
      displayName: mode === "couple" && members.length > 1
        ? `${members[0].name} + ${members[1].name}`
        : members[0].name,
      members
    };
  }

  function createGame(options = {}) {
    const mode = options.mode === "couple" ? "couple" : "solo";
    const seed = String(options.seed || `420iq-${Date.now()}`);
    const questions = Array.isArray(options.questions) && options.questions.length
      ? options.questions
      : [];

    if (!questions.length) {
      throw new Error("Create game requires at least one question.");
    }

    const pack = buildBalancedSequence(questions, {
      seed,
      count: options.count || questions.length
    });
    const participant = createParticipant(mode, options.players);
    const trustedCircle = Array.isArray(options.trustedCircle)
      ? options.trustedCircle.slice(0, 2).map((contact, index) => ({
          id: `contact-${index + 1}`,
          name: normaliseName(contact.name, `Contact ${index + 1}`),
          cleared: contact.cleared === true,
          available: contact.available === true
        }))
      : [
          { id: "contact-1", name: "Jordan", cleared: true, available: true },
          { id: "contact-2", name: "Maya", cleared: true, available: true }
        ];

    const game = {
      version: "420iq-static-pilot-v2",
      mode,
      seed,
      phase: "PRE_SHOW",
      participant,
      pack,
      activeQuestionIndex: 0,
      scores: {
        [participant.id]: 0
      },
      lifelines: {
        trustedCircle: { used: false },
        sourceSignal: { used: false },
        fiftyFifty: { used: false, removed: null }
      },
      trustedCircle,
      lifelineActive: null,
      lockedAnswer: null,
      reveal: null,
      segmentOutro: null,
      timer: {
        durationSeconds: Number.isInteger(options.defaultQuestionSeconds)
          ? Math.max(5, Math.min(300, options.defaultQuestionSeconds))
          : 30,
        startedAtEpochMs: null,
        endsAtEpochMs: null,
        stoppedAtEpochMs: null,
        running: false
      },
      finalDecision: null,
      guaranteedFloor: 0,
      outcome: null,
      rehearsal: true,
      results: [],
      events: []
    };

    return addEvent(game, {
      type: "GAME_CREATED",
      actor: "system",
      previousState: null,
      nextState: "PRE_SHOW",
      payload: {
        mode,
        seed,
        checksum: pack.checksum,
        participant: participant.displayName
      }
    });
  }

  function addEvent(game, event) {
    const nextGame = clone(game);
    const safePayload = clone(event.payload || {});
    nextGame.events = Array.isArray(nextGame.events) ? nextGame.events : [];
    nextGame.events.push({
      id: `evt-${String(nextGame.events.length + 1).padStart(4, "0")}`,
      type: event.type || "TRANSITION",
      actor: String(event.actor || "system"),
      timestamp: new Date().toISOString(),
      previousState: event.previousState,
      nextState: event.nextState,
      payload: safePayload
    });
    return nextGame;
  }

  function transition(game, nextState, payload = {}, actor = "producer") {
    assertPhase(game.phase);
    assertPhase(nextState);

    const allowed = VALID_TRANSITIONS[game.phase] || [];
    if (!allowed.includes(nextState)) {
      throw new Error(`Invalid transition from ${game.phase} to ${nextState}.`);
    }

    const nextGame = clone(game);
    const previousState = nextGame.phase;
    nextGame.phase = nextState;

    return addEvent(nextGame, {
      type: "STATE_TRANSITION",
      actor,
      previousState,
      nextState,
      payload
    });
  }

  function currentQuestion(game) {
    return game.pack.sequence[game.activeQuestionIndex] || null;
  }

  function getPublicQuestion(game) {
    const question = currentQuestion(game);
    if (!question) {
      return null;
    }

    return {
      id: question.id,
      index: game.activeQuestionIndex + 1,
      total: game.pack.sequence.length,
      domain: question.domain,
      difficulty: question.difficulty,
      stem: question.stem,
      choices: question.choices.slice(),
      sourceSignals: question.sourceSignals.slice(),
      sensitivity: question.sensitivity,
      final: question.final,
      // The 50:50 removes only wrong answers, so exposing them never leaks the
      // key — displays grey these out while the correct choice stays hidden.
      fiftyFiftyRemoved:
        game.lifelines.fiftyFifty && Array.isArray(game.lifelines.fiftyFifty.removed)
          ? game.lifelines.fiftyFifty.removed.slice()
          : null
    };
  }

  function startQuestionTimer(game, durationSeconds, nowMs = Date.now(), actor = "producer") {
    const safeDuration = Number.isFinite(durationSeconds)
      ? Math.max(5, Math.min(300, Math.round(durationSeconds)))
      : Math.max(5, Math.min(300, Math.round(game.timer && game.timer.durationSeconds || 30)));
    const startedAtEpochMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const nextGame = clone(game);

    nextGame.timer = {
      durationSeconds: safeDuration,
      startedAtEpochMs,
      endsAtEpochMs: startedAtEpochMs + safeDuration * 1000,
      stoppedAtEpochMs: null,
      running: true
    };

    return addEvent(nextGame, {
      type: "TIMER_STARTED",
      actor,
      previousState: game.phase,
      nextState: game.phase,
      payload: {
        questionIndex: game.activeQuestionIndex,
        durationSeconds: safeDuration
      }
    });
  }

  function stopQuestionTimer(game, nowMs = Date.now()) {
    if (!game.timer || !game.timer.running) {
      return clone(game);
    }

    const stoppedAtEpochMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const nextGame = clone(game);
    nextGame.timer.running = false;
    nextGame.timer.stoppedAtEpochMs = stoppedAtEpochMs;
    return nextGame;
  }

  function getTimerSnapshot(game, nowMs = Date.now()) {
    const timer = game && game.timer
      ? game.timer
      : { durationSeconds: 30, startedAtEpochMs: null, endsAtEpochMs: null, stoppedAtEpochMs: null, running: false };
    const durationSeconds = Math.max(0, Number(timer.durationSeconds) || 0);

    if (!Number.isFinite(timer.startedAtEpochMs) || !Number.isFinite(timer.endsAtEpochMs)) {
      return {
        durationSeconds,
        remainingSeconds: durationSeconds,
        elapsedSeconds: 0,
        expired: false
      };
    }

    const effectiveNow = Number.isFinite(timer.stoppedAtEpochMs)
      ? timer.stoppedAtEpochMs
      : (Number.isFinite(nowMs) ? nowMs : Date.now());
    const elapsedSeconds = Math.min(
      durationSeconds,
      Math.max(0, Math.floor((effectiveNow - timer.startedAtEpochMs) / 1000))
    );
    const remainingSeconds = Math.max(
      0,
      Math.ceil((timer.endsAtEpochMs - effectiveNow) / 1000)
    );

    return {
      durationSeconds,
      remainingSeconds,
      elapsedSeconds,
      expired: remainingSeconds === 0
    };
  }

  function scoreAnswer(input) {
    const difficulty = DIFFICULTY_POINTS[input.difficulty]
      ? input.difficulty
      : "Spark";
    const confidence = CONFIDENCE_MULTIPLIERS[input.confidence]
      ? input.confidence
      : "Curious";
    const wagerPoints = Number(input.riskPoints);
    const hasRiskTarget = Number.isFinite(wagerPoints);
    const basePoints = hasRiskTarget
      ? Math.max(0, Math.round(wagerPoints))
      : DIFFICULTY_POINTS[difficulty];
    const multiplier = CONFIDENCE_MULTIPLIERS[confidence];
    const currentScore = Math.max(0, Number(input.currentScore) || 0);
    // A banked guarantee is the floor a wrong answer can't drop below (>= 0).
    const guaranteedFloor = Math.max(0, Number(input.guaranteedFloor) || 0);
    const rawDelta = hasRiskTarget
      ? (input.correct ? basePoints : -basePoints)
      : input.correct
      ? Math.round(basePoints * multiplier)
      : Math.round((DIFFICULTY_PENALTIES[difficulty] || 0) * multiplier);
    const nextScore = Math.max(guaranteedFloor, currentScore + rawDelta);

    return {
      delta: nextScore - currentScore,
      nextScore,
      stealEligible: !input.correct && (difficulty === "Inferno" || confidence === "Certain")
    };
  }

  function activateLifeline(game, type, actor = "producer") {
    const normalizedType = type === "sourceSignal" ? "sourceSignal" : "trustedCircle";

    if (game.lifelines[normalizedType] && game.lifelines[normalizedType].used) {
      throw new Error(`${normalizedType} has already used.`);
    }

    if (game.phase !== "QUESTION_LIVE") {
      throw new Error(`Cannot activate a lifeline during ${game.phase}.`);
    }

    const question = currentQuestion(game);
    const nextGame = clone(game);
    nextGame.lifelines[normalizedType].used = true;

    if (normalizedType === "sourceSignal") {
      nextGame.lifelineActive = {
        type: "sourceSignal",
        signals: question.sourceSignals.slice(),
        selectedIndex: null,
        verifiedSignalIndex: null,
        resolved: false
      };
    } else {
      const available = nextGame.trustedCircle.filter(contact => contact.cleared && contact.available);
      const random = seededRandom(`${nextGame.seed}:${nextGame.events.length}:trusted-circle`);
      const selected = available.length
        ? available[Math.floor(random() * available.length)]
        : null;

      nextGame.lifelineActive = selected
        ? {
            type: "trustedCircle",
            mode: "Trusted Circle",
            selectedContact: selected,
            secondsForAdvice: 25,
            secondsForContestantLock: 10,
            resolved: false
          }
        : {
            type: "trustedCircle",
            mode: "Circle Consensus",
            selectedContact: null,
            consensus: buildConsensus(question.choices.length, random),
            resolved: false
          };
    }

    const transitioned = transition(nextGame, "LIFELINE_ACTIVE", {
      type: normalizedType,
      mode: nextGame.lifelineActive.mode || "Source Signal"
    }, actor);

    return transitioned;
  }

  function buildConsensus(choiceCount, random) {
    const values = [];
    let remaining = 100;

    for (let index = 0; index < choiceCount; index += 1) {
      if (index === choiceCount - 1) {
        values.push(remaining);
      } else {
        const value = Math.max(4, Math.min(remaining - 4 * (choiceCount - index - 1), Math.round(random() * 45)));
        values.push(value);
        remaining -= value;
      }
    }

    return values.map((value, index) => ({
      choiceIndex: index,
      percent: value
    }));
  }

  function resolveLifeline(game, payload = {}, actor = "producer") {
    if (game.phase !== "LIFELINE_ACTIVE" || !game.lifelineActive) {
      throw new Error("No active lifeline to resolve.");
    }

    const question = currentQuestion(game);
    const nextGame = clone(game);

    if (nextGame.lifelineActive.type === "sourceSignal") {
      const selectedIndex = Math.max(
        0,
        Math.min(question.sourceSignals.length - 1, Number(payload.selectedIndex) || 0)
      );
      nextGame.lifelineActive.selectedIndex = selectedIndex;
      nextGame.lifelineActive.verifiedSignalIndex = question.verifiedSignalIndex;
      nextGame.lifelineActive.verifiedSignal = question.sourceSignals[question.verifiedSignalIndex] || "";
    }

    nextGame.lifelineActive.resolved = true;
    return transition(nextGame, "QUESTION_LIVE", {
      type: nextGame.lifelineActive.type,
      resolved: true
    }, actor);
  }

  function useFiftyFifty(game, actor = "producer") {
    if (game.lifelines.fiftyFifty && game.lifelines.fiftyFifty.used) {
      throw new Error("fiftyFifty has already used.");
    }

    if (game.phase !== "QUESTION_LIVE") {
      throw new Error(`Cannot use 50:50 during ${game.phase}.`);
    }

    const question = currentQuestion(game);
    const wrongIndices = question.choices
      .map((choice, index) => index)
      .filter(index => index !== question.correctIndex);

    // Leave the correct answer plus one wrong answer: remove up to two wrongs.
    // Deterministic (seeded) so a rewind + redo picks the same pair.
    const removeCount = Math.min(2, Math.max(0, wrongIndices.length - 1));
    const shuffled = shuffleWithSeed(wrongIndices, `${game.seed}:${game.events.length}:fifty-fifty`);
    const removed = shuffled.slice(0, removeCount).sort((a, b) => a - b);

    // Instant modifier: no LIFELINE_ACTIVE resolution flow, stays QUESTION_LIVE.
    const nextGame = clone(game);
    nextGame.lifelines.fiftyFifty = { used: true, removed };

    return addEvent(nextGame, {
      type: "FIFTY_FIFTY_USED",
      actor,
      previousState: game.phase,
      nextState: game.phase,
      payload: { removed }
    });
  }

  function bankGuarantee(game, actor = "producer") {
    if (game.phase === "COMPLETE") {
      throw new Error("Cannot bank a guarantee after the show is complete.");
    }

    const currentScore = game.scores[game.participant.id] || 0;
    // A safe haven only ratchets up — banking never lowers a floor already set.
    const nextFloor = Math.max(game.guaranteedFloor || 0, currentScore);
    const nextGame = clone(game);
    nextGame.guaranteedFloor = nextFloor;

    return addEvent(nextGame, {
      type: "GUARANTEE_BANKED",
      actor,
      previousState: game.phase,
      nextState: game.phase,
      payload: { guaranteedFloor: nextFloor }
    });
  }

  function walkAway(game, actor = "producer") {
    // The contestant banks and leaves between questions rather than risk more.
    const allowed = ["SCORE_COMMITTED", "NEXT_QUESTION", "FINAL"];
    if (!allowed.includes(game.phase)) {
      throw new Error(`Cannot walk away during ${game.phase}.`);
    }

    const bankedScore = game.scores[game.participant.id] || 0;
    const nextGame = clone(game);
    nextGame.outcome = { type: "walkAway", bankedScore };

    return transition(nextGame, "COMPLETE", { outcome: "walkAway", bankedScore }, actor);
  }

  function lockAnswer(game, payload = {}, actor = "contestant") {
    if (game.phase !== "QUESTION_LIVE" && game.phase !== "LIFELINE_ACTIVE") {
      throw new Error(`Cannot lock answer during ${game.phase}.`);
    }

    const question = currentQuestion(game);
    const selected = Number(payload.choiceIndex);

    if (!Number.isInteger(selected) || selected < 0 || selected >= question.choices.length) {
      throw new Error("Invalid answer choice.");
    }

    const confidence = CONFIDENCE_MULTIPLIERS[payload.confidence]
      ? payload.confidence
      : "Curious";

    let preparedGame = stopQuestionTimer(game);
    preparedGame.lockedAnswer = {
      choiceIndex: selected,
      confidence,
      lockedAt: new Date().toISOString()
    };
    preparedGame.lifelineActive = null;

    if (preparedGame.phase === "LIFELINE_ACTIVE") {
      preparedGame.phase = "QUESTION_LIVE";
    }

    return transition(preparedGame, "ANSWER_LOCKED", {
      choiceIndex: selected,
      confidence
    }, actor);
  }

  function revealAnswer(game, actor = "producer") {
    if (game.phase !== "ANSWER_LOCKED" || !game.lockedAnswer) {
      throw new Error(`Cannot reveal answer during ${game.phase}.`);
    }

    const question = currentQuestion(game);
    const correct = game.lockedAnswer.choiceIndex === question.correctIndex;
    const scoring = scoreAnswer({
      difficulty: question.difficulty,
      confidence: game.lockedAnswer.confidence,
      correct,
      currentScore: game.scores[game.participant.id] || 0,
      guaranteedFloor: game.guaranteedFloor || 0,
      riskPoints: game.finalDecision && question.final
        ? game.finalDecision.points
        : undefined
    });

    const nextGame = clone(game);
    nextGame.reveal = {
      correct,
      correctIndex: question.correctIndex,
      correctChoice: question.choices[question.correctIndex],
      knowledgeDrop: question.knowledgeDrop,
      sourceCue: question.sourceCue,
      correctAsOf: question.correctAsOf,
      audioCue: correct ? "answerCorrect" : "answerWrong",
      scoring
    };

    return transition(nextGame, "REVEAL", {
      correct,
      correctIndex: question.correctIndex,
      delta: scoring.delta
    }, actor);
  }

  function showKnowledgeDrop(game, actor = "host") {
    if (game.phase !== "REVEAL") {
      throw new Error(`Cannot show Knowledge Drop during ${game.phase}.`);
    }

    return transition(game, "KNOWLEDGE_DROP", {
      questionId: currentQuestion(game).id
    }, actor);
  }

  function commitScore(game, actor = "scorekeeper") {
    if (game.phase !== "REVEAL" && game.phase !== "KNOWLEDGE_DROP") {
      throw new Error(`Cannot commit score during ${game.phase}.`);
    }

    if (!game.reveal || !game.reveal.scoring) {
      throw new Error("No reveal scoring is available.");
    }

    const nextGame = clone(game);
    const participantId = nextGame.participant.id;
    const previousScore = nextGame.scores[participantId] || 0;
    nextGame.scores[participantId] = game.reveal.scoring.nextScore;

    const question = currentQuestion(nextGame);
    // Per-question ledger for the end-of-show recap. It lives in game state, so
    // a rewind past a commit naturally drops the entry (the restored snapshot
    // predates it); a re-commit of the same question overwrites, never duplicates.
    nextGame.results = Array.isArray(nextGame.results)
      ? nextGame.results.filter(result => result.index !== nextGame.activeQuestionIndex)
      : [];
    nextGame.results.push({
      index: nextGame.activeQuestionIndex,
      questionId: question.id,
      domain: question.domain,
      difficulty: question.difficulty,
      correct: game.reveal.correct === true,
      delta: game.reveal.scoring.delta,
      scoreAfter: game.reveal.scoring.nextScore,
      final: question.final === true
    });

    nextGame.segmentOutro = {
      audioCue: "segmentOutro",
      segmentNumber: nextGame.activeQuestionIndex + 1,
      questionId: question.id
    };

    return transition(nextGame, "SCORE_COMMITTED", {
      participantId,
      previousScore,
      nextScore: nextGame.scores[participantId],
      delta: nextGame.scores[participantId] - previousScore,
      audioCue: nextGame.segmentOutro.audioCue,
      segmentNumber: nextGame.segmentOutro.segmentNumber
    }, actor);
  }

  function advanceQuestion(game, actor = "producer") {
    if (game.phase !== "SCORE_COMMITTED") {
      throw new Error(`Cannot advance from ${game.phase}.`);
    }

    const hasNextQuestion = game.activeQuestionIndex + 1 < game.pack.sequence.length;

    if (!hasNextQuestion) {
      return transition(game, "COMPLETE", {
        finalScore: game.scores[game.participant.id] || 0
      }, actor);
    }

    let nextGame = transition(game, "NEXT_QUESTION", {
      fromQuestionIndex: game.activeQuestionIndex
    }, actor);
    nextGame = clone(nextGame);
    nextGame.activeQuestionIndex += 1;
    nextGame.lockedAnswer = null;
    nextGame.reveal = null;
    nextGame.lifelineActive = null;
    // Clear the 50:50 elimination — it's an effect on the question it was used
    // on, not a standing state. `used` stays true (lifelines are once-per-show).
    if (nextGame.lifelines && nextGame.lifelines.fiftyFifty) {
      nextGame.lifelines.fiftyFifty.removed = null;
    }
    nextGame.timer = {
      ...nextGame.timer,
      startedAtEpochMs: null,
      endsAtEpochMs: null,
      stoppedAtEpochMs: null,
      running: false
    };

    return transition(nextGame, "QUESTION_READY", {
      questionIndex: nextGame.activeQuestionIndex
    }, actor);
  }

  function startFinalDecision(game, decision = {}, actor = "producer") {
    if (game.phase !== "SCORE_COMMITTED" && game.phase !== "NEXT_QUESTION") {
      throw new Error(`Cannot start final decision during ${game.phase}.`);
    }

    const riskBand = ["Hold", "Rise", "Reach"].includes(decision.riskBand)
      ? decision.riskBand
      : "Rise";
    const points = riskBand === "Hold" ? 250 : riskBand === "Reach" ? 1000 : 500;
    const nextGame = clone(game);
    nextGame.finalDecision = {
      riskBand,
      points,
      category: String(decision.category || "The 420 Decision")
    };

    return transition(nextGame, "FINAL", nextGame.finalDecision, actor);
  }

  function openFinalQuestion(game, actor = "producer") {
    if (game.phase !== "FINAL") {
      throw new Error(`Cannot open final question during ${game.phase}.`);
    }

    const selectedCategory = game.finalDecision && game.finalDecision.category;
    const selectedFinalIndex = selectedCategory
      ? game.pack.sequence.findIndex(question => question.final && question.domain === selectedCategory)
      : -1;
    const finalIndex = selectedFinalIndex >= 0
      ? selectedFinalIndex
      : game.pack.sequence.findIndex(question => question.final);
    const nextGame = clone(game);
    nextGame.activeQuestionIndex = finalIndex >= 0
      ? finalIndex
      : Math.max(0, nextGame.pack.sequence.length - 1);
    nextGame.lockedAnswer = null;
    nextGame.reveal = null;
    nextGame.lifelineActive = null;
    // Clear the 50:50 elimination — it's an effect on the question it was used
    // on, not a standing state. `used` stays true (lifelines are once-per-show).
    if (nextGame.lifelines && nextGame.lifelines.fiftyFifty) {
      nextGame.lifelines.fiftyFifty.removed = null;
    }
    nextGame.timer = {
      ...nextGame.timer,
      startedAtEpochMs: null,
      endsAtEpochMs: null,
      stoppedAtEpochMs: null,
      running: false
    };

    return transition(nextGame, "QUESTION_READY", {
      questionIndex: nextGame.activeQuestionIndex,
      finalDecision: nextGame.finalDecision
    }, actor);
  }

  function rewind(game, snapshot, actor = "producer") {
    if (!snapshot || typeof snapshot.phase !== "string") {
      throw new Error("No prior state is available to rewind to.");
    }

    const restored = clone(snapshot);
    // Rewinding restores the functional state but must never erase history:
    // keep the full append-only audit trail and mark the rewind with a
    // compensating event instead of deleting the events that happened.
    restored.events = Array.isArray(game.events) ? clone(game.events) : [];

    return addEvent(restored, {
      type: "STATE_REWIND",
      actor,
      previousState: game.phase,
      nextState: snapshot.phase,
      payload: {
        revertedFrom: game.phase,
        revertedTo: snapshot.phase
      }
    });
  }

  function exportAudit(game) {
    return {
      gameVersion: game.version,
      mode: game.mode,
      phase: game.phase,
      participant: game.participant,
      checksum: game.pack.checksum,
      seed: game.seed,
      score: game.scores[game.participant.id] || 0,
      events: clone(game.events)
    };
  }

  const api = {
    PHASES,
    VALID_TRANSITIONS,
    DIFFICULTY_POINTS,
    CONFIDENCE_MULTIPLIERS,
    buildBalancedSequence,
    createGame,
    transition,
    getPublicQuestion,
    currentQuestion,
    startQuestionTimer,
    stopQuestionTimer,
    getTimerSnapshot,
    scoreAnswer,
    activateLifeline,
    resolveLifeline,
    useFiftyFifty,
    bankGuarantee,
    walkAway,
    lockAnswer,
    revealAnswer,
    showKnowledgeDrop,
    commitScore,
    advanceQuestion,
    startFinalDecision,
    openFinalQuestion,
    rewind,
    exportAudit,
    validateSequence
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalObject.IQ420Engine = api;
})(typeof window !== "undefined" ? window : globalThis);
