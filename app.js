(function run420IQApp() {
  "use strict";

  const IQ = window.IQ420Engine;
  const GAME_VERSION = "420iq-static-pilot-v2";
  const STORAGE_KEY = "420iqPilotGameV2";
  const STORAGE_BACKUP_KEY = "420iqPilotGameV2Backup";
  const QUESTION_BANK_KEY = "420iqPilotQuestionBankV2";
  const SOUND_KEY = "420iqPilotSoundEnabled";
  const BACKUP_FILE_TYPE = "420iq-backup";
  const HISTORY_LIMIT = 40;
  const AGE_ACK_KEY = "420iqAgeAcknowledgedV1";
  const ANSWER_LETTERS = ["A", "B", "C", "D", "E", "F"];
  const ACCESS_MODES = new Set(["admin", "player", "stage"]);
  const VALID_TABS = new Set(["host", "stage", "player", "pack", "audit"]);
  const SYNC_CHANNEL_NAME = "420iq-sync";
  const FINAL_CATEGORY_OPTIONS = [
    "Science & Plant Literacy",
    "Sports & Performance",
    "Music & Pop Culture",
    "History & Global Roots",
    "Law & Policy",
    "Culture & Media",
    "Public Health & Safety",
    "Business & Ethics",
    "Future & Innovation"
  ];

  const DEMO_QUESTIONS = [
    {
      id: "demo-science-thc",
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
      knowledgeDrop: "THC is one cannabinoid among many studied in cannabis research. 420IQ treats this as knowledge, not a product recommendation.",
      sourceSignals: [
        "A cannabinoid name usually ends with -ol.",
        "A marketing term can replace a chemical name.",
        "A growing method defines the molecule."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: chemical name record must be verified before broadcast.",
      correctAsOf: "Demo only",
      readTime: 8,
      sensitivity: "Tier 1"
    },
    {
      id: "demo-history-hemp-fiber",
      domain: "History & Global Roots",
      difficulty: "Flame",
      stem: "Which material use is historically associated with hemp fiber?",
      choices: ["Rope and textiles", "Porcelain glazing", "Optical glass", "Battery acid"],
      correctIndex: 0,
      knowledgeDrop: "Hemp fiber has been used in cordage and textiles. Production questions still need territory-specific sourcing.",
      sourceSignals: [
        "Cordage is a fiber use.",
        "Glass is spun from plant bast.",
        "Porcelain is made from stems."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: material-history source required.",
      correctAsOf: "Demo only",
      readTime: 9,
      sensitivity: "Tier 1"
    },
    {
      id: "demo-law-1961",
      domain: "Law & Policy",
      difficulty: "Inferno",
      stem: "Which 1961 international treaty is central to the modern global drug-control framework?",
      choices: [
        "Single Convention on Narcotic Drugs",
        "Kyoto Protocol",
        "Geneva Conventions",
        "Paris Agreement"
      ],
      correctIndex: 0,
      knowledgeDrop: "Legal questions need dates, jurisdictions and careful wording. This demo question asks about treaty title, not current local law.",
      sourceSignals: [
        "The title names narcotic drugs directly.",
        "Climate agreements set drug schedules.",
        "Humanitarian law defines cannabis policy."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: UN treaty record required before broadcast.",
      correctAsOf: "Demo only",
      readTime: 13,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-culture-evidence",
      domain: "Culture & Media",
      difficulty: "Inferno",
      stem: "In 420IQ, what should the host challenge when a contestant gives a confident but unsupported claim?",
      choices: [
        "The evidence behind the claim",
        "The contestant's personality",
        "The strongest accent in the room",
        "The speed of the applause"
      ],
      correctIndex: 0,
      knowledgeDrop: "The format gets tension from evidence literacy and overconfidence, not from humiliating contestants.",
      sourceSignals: [
        "The show tests what a claim can defend.",
        "Volume makes a claim verified.",
        "A confident tone replaces review."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: editorial standard from 420IQ bible.",
      correctAsOf: "Demo only",
      readTime: 11,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-safety-claims",
      domain: "Public Health & Safety",
      difficulty: "Flame",
      stem: "Which wording approach is safest for health-related Knowledge Drops?",
      choices: [
        "Cautious, sourced and clearly qualified",
        "Universal claims without a date",
        "Dosage advice from the host",
        "Anecdotes presented as proof"
      ],
      correctIndex: 0,
      knowledgeDrop: "Sensitive topics require cautious language, qualified review and a clear correct-as-of date.",
      sourceSignals: [
        "Evidence quality and date labels matter.",
        "Anecdotes are enough for medical certainty.",
        "A host can prescribe if the answer sounds simple."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: Tier 3 review workflow required for production.",
      correctAsOf: "Demo only",
      readTime: 12,
      sensitivity: "Tier 3"
    },
    {
      id: "demo-business-prizes",
      domain: "Business & Ethics",
      difficulty: "Wild 420",
      stem: "What should a sponsor-neutral 420IQ reward avoid?",
      choices: [
        "Cannabis-product redemption",
        "Knowledge status",
        "A trophy moment",
        "A verified learning experience"
      ],
      correctIndex: 0,
      knowledgeDrop: "420IQ rewards knowledge, recognition and qualification. It does not reward buying, consuming or promoting cannabis products.",
      sourceSignals: [
        "Knowledge rewards avoid product promotion.",
        "Any sponsor item is automatically suitable.",
        "Consumption is required to prove expertise."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: format bible reward rules.",
      correctAsOf: "Demo only",
      readTime: 10,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-sports-anti-doping",
      domain: "Sports & Performance",
      difficulty: "Flame",
      stem: "In sports coverage, what should 420IQ check before discussing cannabis and athlete eligibility?",
      choices: [
        "The current rule for the league or event",
        "The loudest fan opinion",
        "The player's jersey number",
        "The age of the stadium"
      ],
      correctIndex: 0,
      knowledgeDrop: "Sports rules can vary by league, country and event. 420IQ frames eligibility questions around current governing-body policy, not assumptions.",
      sourceSignals: [
        "Rules depend on the governing body and date.",
        "Fan opinion defines athlete eligibility.",
        "Venue history sets anti-doping policy."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: verify against the current league, federation or anti-doping authority rulebook.",
      correctAsOf: "Demo only",
      readTime: 12,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-sports-recovery-claims",
      domain: "Sports & Performance",
      difficulty: "Inferno",
      stem: "Which phrase keeps a sports-recovery Knowledge Drop responsible?",
      choices: [
        "Some athletes report use, but evidence and rules vary",
        "Cannabis guarantees faster recovery",
        "Every league treats cannabinoids the same",
        "Anecdotes replace medical review"
      ],
      correctIndex: 0,
      knowledgeDrop: "Performance and recovery claims need careful qualifiers. Player stories are not the same as clinical proof or league clearance.",
      sourceSignals: [
        "Claims should separate reports, evidence and eligibility.",
        "A single athlete story proves universal recovery.",
        "Rules are identical across all sports."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: verify with current sports policy and health evidence before broadcast.",
      correctAsOf: "Demo only",
      readTime: 13,
      sensitivity: "Tier 3"
    },
    {
      id: "demo-music-hiphop-cultural-reference",
      domain: "Music & Pop Culture",
      difficulty: "Spark",
      stem: "In music history questions, what should 420IQ test without turning culture into a stereotype?",
      choices: [
        "The context of a lyric, era or scene",
        "A caricature of the artist",
        "A rumor from comment sections",
        "A joke about the audience"
      ],
      correctIndex: 0,
      knowledgeDrop: "Pop-culture questions work best when they test context, influence and media literacy instead of reducing artists or fans to cliches.",
      sourceSignals: [
        "Context and source attribution protect the question.",
        "Stereotypes make cultural facts stronger.",
        "Rumors are enough if they trend."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: verify music references through reliable interviews, releases or archives.",
      correctAsOf: "Demo only",
      readTime: 10,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-music-film-rating",
      domain: "Music & Pop Culture",
      difficulty: "Flame",
      stem: "Why should a film or music cannabis reference include its release context?",
      choices: [
        "Audience standards and laws change over time",
        "Old scenes are automatically current law",
        "The title proves the fact",
        "All references are endorsements"
      ],
      correctIndex: 0,
      knowledgeDrop: "Release year, location and genre context help viewers separate a cultural reference from current legal or health advice.",
      sourceSignals: [
        "Context prevents outdated or overbroad claims.",
        "A movie scene is current policy.",
        "A song title is a legal source."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: cite the release record and avoid treating fiction as advice.",
      correctAsOf: "Demo only",
      readTime: 11,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-law-age-gates",
      domain: "Law & Policy",
      difficulty: "Flame",
      stem: "What should a host say before comparing cannabis age rules across places?",
      choices: [
        "Jurisdiction and date matter",
        "Every country uses the same age",
        "Online comments settle the rule",
        "The rule never changes"
      ],
      correctIndex: 0,
      knowledgeDrop: "Age and access rules are jurisdiction-specific and can change. 420IQ should never flatten them into one universal rule.",
      sourceSignals: [
        "Territory and date define the claim boundary.",
        "All countries use the same standard.",
        "A viral post is a legal update."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: verify with current government or regulator sources by territory.",
      correctAsOf: "Demo only",
      readTime: 11,
      sensitivity: "Tier 3"
    },
    {
      id: "demo-science-endocannabinoid",
      domain: "Science & Plant Literacy",
      difficulty: "Inferno",
      stem: "What does the endocannabinoid system help regulate in the body?",
      choices: [
        "Several signaling processes",
        "Only hair color",
        "Internet speed",
        "Stadium lighting"
      ],
      correctIndex: 0,
      knowledgeDrop: "The endocannabinoid system is a biological signaling system. Simple explanations still need careful, non-medical wording.",
      sourceSignals: [
        "It is described as a signaling system.",
        "It controls only cosmetic traits.",
        "It is a sports broadcast system."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: verify through science education or biomedical reference sources.",
      correctAsOf: "Demo only",
      readTime: 12,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-business-lab-labels",
      domain: "Business & Ethics",
      difficulty: "Spark",
      stem: "What should a consumer-facing cannabis product label help someone check?",
      choices: [
        "Tested contents and clear warnings",
        "A celebrity rumor",
        "A hidden prize code",
        "A guaranteed effect"
      ],
      correctIndex: 0,
      knowledgeDrop: "Labels and testing claims should help people verify what is being represented, while avoiding promises about effects.",
      sourceSignals: [
        "Labels should communicate contents and warnings.",
        "Rumors are stronger than testing.",
        "Effects can be guaranteed for everyone."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: verify label requirements by jurisdiction before broadcast.",
      correctAsOf: "Demo only",
      readTime: 10,
      sensitivity: "Tier 2"
    },
    {
      id: "demo-final-source-date",
      domain: "Future & Innovation",
      difficulty: "Final",
      final: true,
      stem: "The 420 Decision: Why should a Knowledge Drop include a source cue and correct-as-of date?",
      choices: [
        "So viewers know the fact can be checked and may change",
        "So the host can skip the explanation",
        "So all legal rules sound universal",
        "So questions can be reused forever"
      ],
      correctIndex: 0,
      knowledgeDrop: "A strong Knowledge Drop leaves the viewer with something defensible: the claim, the limit and where the fact should be checked.",
      sourceSignals: [
        "Dates and sources define the boundary of a claim.",
        "A fact stays current because it appeared on screen.",
        "Legal and health claims never need territory labels."
      ],
      verifiedSignalIndex: 0,
      sourceCue: "Demo source cue: production needs actual source metadata.",
      correctAsOf: "Demo only",
      readTime: 15,
      sensitivity: "Tier 2"
    }
  ];

  const PHASE_CUES = {
    PRE_SHOW: "Pre-show hold. Prepare the contestant and confirm the episode pack.",
    INTRO: "Host opens the episode, explains the theme and introduces the player arc.",
    QUESTION_READY: "Question is loaded. Answer stays hidden from public displays.",
    QUESTION_LIVE: "Question is live. Player can choose confidence, answer or lifeline.",
    LIFELINE_ACTIVE: "Lifeline is active. Resolve it before the show moves on.",
    ANSWER_LOCKED: "Answer locked. Hold tension before the host reveal.",
    REVEAL: "Reveal state. Correct answer and score delta are now visible.",
    KNOWLEDGE_DROP: "Knowledge Drop state. Host explains the verified learning beat.",
    SCORE_COMMITTED: "Score committed. Advance, trigger 420 Decision or complete.",
    NEXT_QUESTION: "Advancing to the next question.",
    FINAL: "The 420 Decision is active. Select the IQ target and open the final question.",
    COMPLETE: "Show complete. Export the audit package."
  };

  const dom = {
    surfaces: Array.from(document.querySelectorAll(".surface")),
    tabs: Array.from(document.querySelectorAll(".tab-button")),
    brandLink: document.querySelector(".brand-lockup"),
    setupPanel: document.getElementById("setupPanel"),
    runPanel: document.getElementById("runPanel"),
    recapPanel: document.getElementById("recapPanel"),
    modeButtons: Array.from(document.querySelectorAll(".mode-button")),
    soloFields: Array.from(document.querySelectorAll(".solo-field")),
    coupleFields: Array.from(document.querySelectorAll(".couple-field")),
    singleNameInput: document.getElementById("singleNameInput"),
    partnerOneInput: document.getElementById("partnerOneInput"),
    partnerTwoInput: document.getElementById("partnerTwoInput"),
    seedInput: document.getElementById("seedInput"),
    timerSecondsInput: document.getElementById("timerSecondsInput"),
    contactOneInput: document.getElementById("contactOneInput"),
    contactTwoInput: document.getElementById("contactTwoInput"),
    contactOneAvailable: document.getElementById("contactOneAvailable"),
    contactTwoAvailable: document.getElementById("contactTwoAvailable"),
    startGameButton: document.getElementById("startGameButton"),
    questionImportInput: document.getElementById("questionImportInput"),
    soundToggle: document.getElementById("soundToggle"),
    resetButton: document.getElementById("resetButton"),
    exportButton: document.getElementById("exportButton"),
    undoButton: document.getElementById("undoButton"),
    backupButton: document.getElementById("backupButton"),
    restoreBackupInput: document.getElementById("restoreBackupInput"),
    fullscreenButton: document.getElementById("fullscreenButton"),
    phaseLabel: document.getElementById("phaseLabel"),
    scoreValue: document.getElementById("scoreValue"),
    questionCounter: document.getElementById("questionCounter"),
    hostTimerCard: document.getElementById("hostTimerCard"),
    hostTimerValue: document.getElementById("hostTimerValue"),
    hostQuestionMeta: document.getElementById("hostQuestionMeta"),
    hostQuestionStem: document.getElementById("hostQuestionStem"),
    hostChoices: document.getElementById("hostChoices"),
    confidenceButtons: Array.from(document.querySelectorAll("[data-confidence]")),
    riskButtons: Array.from(document.querySelectorAll("[data-risk]")),
    lifelinePanel: document.getElementById("lifelinePanel"),
    finalPanel: document.getElementById("finalPanel"),
    finalCategorySelect: document.getElementById("finalCategorySelect"),
    cueText: document.getElementById("cueText"),
    sideRing: document.getElementById("sideRing"),
    introButton: document.getElementById("introButton"),
    readyButton: document.getElementById("readyButton"),
    liveButton: document.getElementById("liveButton"),
    sourceButton: document.getElementById("sourceButton"),
    trustedButton: document.getElementById("trustedButton"),
    lockButton: document.getElementById("lockButton"),
    revealButton: document.getElementById("revealButton"),
    dropButton: document.getElementById("dropButton"),
    commitButton: document.getElementById("commitButton"),
    nextButton: document.getElementById("nextButton"),
    decisionButton: document.getElementById("decisionButton"),
    openFinalButton: document.getElementById("openFinalButton"),
    completeButton: document.getElementById("completeButton"),
    stageFrame: document.getElementById("stageFrame"),
    popoutStageButton: document.getElementById("popoutStageButton"),
    stagePhase: document.getElementById("stagePhase"),
    stageTimer: document.getElementById("stageTimer"),
    stageDifficulty: document.getElementById("stageDifficulty"),
    stageRing: document.getElementById("stageRing"),
    stagePlayer: document.getElementById("stagePlayer"),
    stageScore: document.getElementById("stageScore"),
    stageQuestion: document.getElementById("stageQuestion"),
    stageAnswers: document.getElementById("stageAnswers"),
    stageCue: document.getElementById("stageCue"),
    stageChecksum: document.getElementById("stageChecksum"),
    stageRecap: document.getElementById("stageRecap"),
    phoneFrame: document.getElementById("phoneFrame"),
    phoneRing: document.getElementById("phoneRing"),
    verticalPhase: document.getElementById("verticalPhase"),
    verticalTimer: document.getElementById("verticalTimer"),
    verticalPlayer: document.getElementById("verticalPlayer"),
    verticalScore: document.getElementById("verticalScore"),
    verticalQuestion: document.getElementById("verticalQuestion"),
    verticalBars: document.getElementById("verticalBars"),
    verticalCue: document.getElementById("verticalCue"),
    playerModeLabel: document.getElementById("playerModeLabel"),
    playerName: document.getElementById("playerName"),
    playerPrompt: document.getElementById("playerPrompt"),
    playerChoices: document.getElementById("playerChoices"),
    playerTimer: document.getElementById("playerTimer"),
    playerTimerCopy: document.getElementById("playerTimerCopy"),
    teamModeText: document.getElementById("teamModeText"),
    lifelineState: document.getElementById("lifelineState"),
    packSeed: document.getElementById("packSeed"),
    packChecksum: document.getElementById("packChecksum"),
    packBalance: document.getElementById("packBalance"),
    questionTable: document.getElementById("questionTable"),
    eventLog: document.getElementById("eventLog"),
    publicPayloadCard: document.getElementById("publicPayloadCard"),
    exportPackButton: document.getElementById("exportPackButton"),
    ageGate: document.getElementById("ageGate"),
    ageGateConfirm: document.getElementById("ageGateConfirm"),
    ageGateAccept: document.getElementById("ageGateAccept"),
    ageGateDecline: document.getElementById("ageGateDecline"),
    ageGateNote: document.getElementById("ageGateNote"),
    toast: document.getElementById("toast")
  };

  let questionBank = loadQuestionBank();
  let game = loadSavedGame();
  let history = [];
  let currentMode = game ? game.mode : "solo";
  let selectedChoiceIndex = null;
  let selectedConfidence = "Curious";
  let selectedRisk = "Rise";
  let selectedSignalIndex = null;
  let toastTimer = null;
  let audioContext = null;
  let audioUnlocked = false;
  let audioUnlockPromise = null;
  let pendingCueType = null;
  let soundEnabled = readInitialSoundEnabled();
  let lastTickSecond = null;
  let timeoutCuePlayed = false;
  let syncChannel = null;
  const accessMode = readAccessMode();

  if (accessMode === "stage") {
    // The Stage window is a silent broadcast display; the host machine owns
    // the show audio, so a second monitor must never emit its own cues.
    soundEnabled = false;
  }

  function readAccessMode() {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = String(params.get("access") || params.get("role") || "admin").toLowerCase();
    return ACCESS_MODES.has(requestedMode) ? requestedMode : "admin";
  }

  function readInitialSoundEnabled() {
    const params = new URLSearchParams(window.location.search);
    const requestedSound = String(params.get("sfx") || "").toLowerCase();

    if (["1", "on", "true"].includes(requestedSound)) {
      localStorage.setItem(SOUND_KEY, "true");
      return true;
    }

    if (["0", "off", "false"].includes(requestedSound)) {
      localStorage.setItem(SOUND_KEY, "false");
      return false;
    }

    return localStorage.getItem(SOUND_KEY) !== "false";
  }

  function isDisplayAccess() {
    return accessMode === "player" || accessMode === "stage";
  }

  function readInitialTab() {
    const requestedTab = window.location.hash.replace("#", "").toLowerCase();
    return VALID_TABS.has(requestedTab) ? requestedTab : "host";
  }

  function resolveAccessTab(tabName) {
    if (accessMode === "player") {
      return "player";
    }

    if (accessMode === "stage") {
      return "stage";
    }

    return VALID_TABS.has(tabName) ? tabName : "host";
  }

  function loadQuestionBank() {
    try {
      const saved = JSON.parse(localStorage.getItem(QUESTION_BANK_KEY));
      if (Array.isArray(saved) && saved.length) {
        return saved;
      }
    } catch (error) {
      console.warn("Could not load saved question bank.", error);
    }

    return DEMO_QUESTIONS;
  }

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadSavedGame() {
    // Try the primary key, then the mirror: a torn or cleared primary write
    // should not lose the show if the backup key survived.
    for (const key of [STORAGE_KEY, STORAGE_BACKUP_KEY]) {
      try {
        const saved = JSON.parse(localStorage.getItem(key));
        if (saved && saved.version === GAME_VERSION) {
          return saved;
        }
      } catch (error) {
        console.warn(`Could not restore saved 420IQ session from ${key}.`, error);
      }
    }

    return null;
  }

  function saveGame() {
    // Display windows (Stage, player) are receive-only mirrors: they never
    // persist or broadcast, so they cannot clobber the host's authoritative state.
    if (!game || isDisplayAccess()) {
      return;
    }

    const serialized = JSON.stringify(game);
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(STORAGE_BACKUP_KEY, serialized);
    } catch (error) {
      console.warn("Could not persist the 420IQ session.", error);
      showToast("Storage is full. Download a recovery backup to be safe.");
    }

    broadcastState();
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove("visible");
    }, 2600);
  }

  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function readTimerSeconds() {
    const value = Number(dom.timerSecondsInput.value);

    if (!Number.isFinite(value) || value < 5 || value > 300) {
      dom.timerSecondsInput.focus();
      throw new Error("Question timer must be between 5 and 300 seconds.");
    }

    return Math.round(value);
  }

  function defaultTimerSeconds() {
    if (game && game.timer && Number.isFinite(game.timer.durationSeconds)) {
      return game.timer.durationSeconds;
    }

    const value = Number(dom.timerSecondsInput.value);
    return Number.isFinite(value) ? Math.max(5, Math.min(300, Math.round(value))) : 30;
  }

  function isAudioReadyForPlayback() {
    return Boolean(soundEnabled && audioUnlocked && audioContext && audioContext.state === "running");
  }

  function syncSoundButton() {
    const needsArm = soundEnabled && accessMode !== "stage" && !isAudioReadyForPlayback();
    dom.soundToggle.textContent = needsArm ? "ARM" : soundEnabled ? "SFX" : "OFF";
    dom.soundToggle.classList.toggle("active", soundEnabled);
    dom.soundToggle.classList.toggle("needs-arm", needsArm);
    dom.soundToggle.classList.toggle("armed", soundEnabled && isAudioReadyForPlayback());
    dom.soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    dom.soundToggle.title = needsArm
      ? "Tap to arm and test SFX"
      : soundEnabled
      ? "SFX on"
      : "SFX off";
    dom.soundToggle.setAttribute(
      "aria-label",
      needsArm ? "Arm sound effects" : "Toggle sound effects"
    );
  }

  function ensureAudioContext() {
    if (!soundEnabled) {
      return null;
    }

    try {
      if (audioContext && audioContext.state === "closed") {
        audioContext = null;
      }

      if (!audioContext) {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) {
          throw new Error("WebAudio is not supported in this browser.");
        }
        audioContext = new AudioContextConstructor();
        audioUnlocked = false;
      }
      return audioContext;
    } catch (error) {
      soundEnabled = false;
      syncSoundButton();
      return null;
    }
  }

  function primeMobileAudio(context) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = 440;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.setValueAtTime(0.0001, now + 0.03);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.03);
  }

  async function unlockAudioContext() {
    if (!soundEnabled) {
      return null;
    }

    const context = ensureAudioContext();
    if (!context) {
      return null;
    }

    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (audioContext.state !== "running") {
        return null;
      }

      if (!audioUnlocked) {
        primeMobileAudio(audioContext);
        audioUnlocked = true;
        syncSoundButton();
      }

      return audioContext;
    } catch (error) {
      return null;
    }
  }

  function unlockAudioFromGesture() {
    if (!soundEnabled || audioUnlocked) {
      return;
    }

    if (!audioUnlockPromise) {
      audioUnlockPromise = unlockAudioContext().finally(() => {
        audioUnlockPromise = null;
      });
    }
  }

  function installMobileAudioUnlock() {
    document.addEventListener("pointerdown", unlockAudioFromGesture, { passive: true });
    document.addEventListener("touchstart", unlockAudioFromGesture, { passive: true });
    document.addEventListener("keydown", unlockAudioFromGesture);
  }

  async function playCue(type) {
    if (!soundEnabled) {
      return false;
    }

    if (audioUnlockPromise) {
      await audioUnlockPromise;
    }

    const context = await unlockAudioContext();
    if (!context) {
      return false;
    }

    const patterns = {
      ui: [
        { frequency: 520, duration: 0.045, delay: 0, gain: 0.035, wave: "sine" }
      ],
      answerSelect: [
        { frequency: 588, duration: 0.045, delay: 0, gain: 0.035, wave: "triangle" },
        { frequency: 784, duration: 0.065, delay: 0.045, gain: 0.032, wave: "sine" }
      ],
      questionLive: [
        { frequency: 392, duration: 0.075, delay: 0, gain: 0.04, wave: "sine" },
        { frequency: 588, duration: 0.09, delay: 0.08, gain: 0.045, wave: "triangle" }
      ],
      timerTick: [
        { frequency: 760, duration: 0.035, delay: 0, gain: 0.025, wave: "square" }
      ],
      urgentTick: [
        { frequency: 980, duration: 0.045, delay: 0, gain: 0.04, wave: "square" }
      ],
      timerExpired: [
        { frequency: 260, duration: 0.12, delay: 0, gain: 0.05, wave: "sawtooth" },
        { frequency: 180, duration: 0.18, delay: 0.11, gain: 0.045, wave: "sawtooth" }
      ],
      answerCorrect: [
        { frequency: 392, duration: 0.065, delay: 0, gain: 0.04, wave: "triangle" },
        { frequency: 523, duration: 0.075, delay: 0.055, gain: 0.05, wave: "triangle" },
        { frequency: 659, duration: 0.085, delay: 0.12, gain: 0.055, wave: "triangle" },
        { frequency: 784, duration: 0.12, delay: 0.2, gain: 0.06, wave: "sine" },
        { frequency: 1046, duration: 0.2, delay: 0.31, gain: 0.05, wave: "sine" },
        { frequency: 1318, duration: 0.16, delay: 0.39, gain: 0.032, wave: "sine" }
      ],
      answerWrong: [
        { frequency: 220, duration: 0.13, delay: 0, gain: 0.052, wave: "sawtooth" },
        { frequency: 146, duration: 0.19, delay: 0.12, gain: 0.044, wave: "sawtooth" }
      ],
      lifeline: [
        { frequency: 440, duration: 0.08, delay: 0, gain: 0.038, wave: "sine" },
        { frequency: 880, duration: 0.08, delay: 0.09, gain: 0.032, wave: "sine" }
      ],
      segmentOutro: [
        { frequency: 311, duration: 0.11, delay: 0, gain: 0.038, wave: "triangle" },
        { frequency: 415, duration: 0.1, delay: 0.08, gain: 0.04, wave: "triangle" },
        { frequency: 622, duration: 0.14, delay: 0.16, gain: 0.045, wave: "sine" },
        { frequency: 830, duration: 0.2, delay: 0.29, gain: 0.038, wave: "sine" }
      ],
      complete: [
        { frequency: 392, duration: 0.08, delay: 0, gain: 0.04, wave: "triangle" },
        { frequency: 523, duration: 0.09, delay: 0.08, gain: 0.045, wave: "triangle" },
        { frequency: 659, duration: 0.1, delay: 0.17, gain: 0.05, wave: "triangle" },
        { frequency: 1046, duration: 0.18, delay: 0.28, gain: 0.055, wave: "sine" }
      ]
    };
    const pattern = patterns[type] || patterns.ui;
    const now = context.currentTime;

    try {
      pattern.forEach(note => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = note.wave;
        oscillator.frequency.value = note.frequency;
        gain.gain.setValueAtTime(0.0001, now + note.delay);
        gain.gain.exponentialRampToValueAtTime(note.gain, now + note.delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.duration);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + note.delay);
        oscillator.stop(now + note.delay + note.duration + 0.02);
      });
    } catch (error) {
      return false;
    }

    return true;
  }

  function updateTimerDisplays(options = {}) {
    const allowSfx = options.allowSfx !== false;
    const fallbackDuration = defaultTimerSeconds();
    const snapshot = game
      ? IQ.getTimerSnapshot(game)
      : {
          durationSeconds: fallbackDuration,
          remainingSeconds: fallbackDuration,
          elapsedSeconds: 0,
          expired: false
        };
    const timerText = formatTime(snapshot.remainingSeconds);
    const urgent = snapshot.remainingSeconds <= 5 && snapshot.remainingSeconds > 0;
    const timerRunning = Boolean(
      game &&
      game.timer &&
      game.timer.running &&
      (game.phase === "QUESTION_LIVE" || game.phase === "LIFELINE_ACTIVE")
    );

    dom.hostTimerValue.textContent = timerText;
    dom.stageTimer.textContent = timerText;
    dom.playerTimer.textContent = timerText;
    dom.verticalTimer.textContent = timerText;

    [dom.hostTimerCard, dom.stageTimer, dom.playerTimer, dom.verticalTimer].forEach(element => {
      element.classList.toggle("urgent", urgent && timerRunning);
      element.classList.toggle("expired", snapshot.expired && timerRunning);
    });
    dom.phoneFrame.classList.toggle("urgent", urgent && timerRunning);
    dom.phoneFrame.classList.toggle("expired", snapshot.expired && timerRunning);

    dom.playerTimerCopy.textContent = timerRunning
      ? (snapshot.expired ? "Time is up. Wait for the host." : "Clock is live. Lock before it reaches zero.")
      : "The timer starts when the host sends the question live.";

    if (!timerRunning) {
      lastTickSecond = null;
      timeoutCuePlayed = false;
      return;
    }

    if (lastTickSecond === null) {
      lastTickSecond = snapshot.remainingSeconds;
      return;
    }

    if (snapshot.remainingSeconds !== lastTickSecond) {
      if (allowSfx && snapshot.remainingSeconds > 0) {
        playCue(snapshot.remainingSeconds <= 5 ? "urgentTick" : "timerTick");
      }

      if (allowSfx && snapshot.expired && !timeoutCuePlayed) {
        playCue("timerExpired");
        timeoutCuePlayed = true;
        showToast("Time expired.");
      }

      lastTickSecond = snapshot.remainingSeconds;
    }
  }

  function postSync(message) {
    if (!syncChannel) {
      return;
    }

    try {
      syncChannel.postMessage(message);
    } catch (error) {
      // Channel closed (window unloading) — safe to ignore.
    }
  }

  function broadcastState() {
    // Only the host broadcasts authoritative state to display windows.
    if (isDisplayAccess() || !game) {
      return;
    }

    postSync({ type: "state", game });
  }

  function queuePendingCue(type) {
    if (!soundEnabled || accessMode === "stage") {
      return;
    }

    pendingCueType = type;
    syncSoundButton();
  }

  function playIncomingGameCue(previousGame, incomingGame) {
    if (!isDisplayAccess() || accessMode === "stage" || !previousGame || !incomingGame) {
      return;
    }

    const sameQuestion = previousGame.activeQuestionIndex === incomingGame.activeQuestionIndex;
    const samePhase = previousGame.phase === incomingGame.phase;

    if (sameQuestion && samePhase) {
      return;
    }

    if (incomingGame.phase === "REVEAL" && incomingGame.reveal && incomingGame.reveal.audioCue) {
      playCue(incomingGame.reveal.audioCue).then(played => {
        if (!played) {
          queuePendingCue(incomingGame.reveal.audioCue);
        }
      });
      return;
    }

    if (incomingGame.phase === "SCORE_COMMITTED" && incomingGame.segmentOutro && incomingGame.segmentOutro.audioCue) {
      playCue(incomingGame.segmentOutro.audioCue).then(played => {
        if (!played) {
          queuePendingCue(incomingGame.segmentOutro.audioCue);
        }
      });
    }
  }

  function applyIncomingGame(incoming) {
    if (!incoming || incoming.version !== GAME_VERSION) {
      return;
    }

    const previousGame = game ? cloneState(game) : null;
    game = incoming;
    currentMode = game.mode === "couple" ? "couple" : "solo";
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
    lastTickSecond = null;
    timeoutCuePlayed = false;
    render();
    playIncomingGameCue(previousGame, game);
  }

  function handleSyncMessage(message) {
    if (!message) {
      return;
    }

    // A display window just opened and asked the host to push current state.
    if (message.type === "request" && !isDisplayAccess()) {
      broadcastState();
      return;
    }

    if (message.type === "state" && isDisplayAccess()) {
      applyIncomingGame(message.game);
    }
  }

  function initCrossWindowSync() {
    // BroadcastChannel: instant same-origin sync between the host and any
    // display window (Stage on a second monitor, a same-machine player view).
    if ("BroadcastChannel" in window) {
      syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      syncChannel.addEventListener("message", event => handleSyncMessage(event.data));
    }

    // Fallback for browsers without BroadcastChannel: the storage event fires
    // in *other* same-origin windows whenever localStorage changes, and the
    // host writes on every state change.
    window.addEventListener("storage", event => {
      if (isDisplayAccess() && (event.key === STORAGE_KEY || event.key === STORAGE_BACKUP_KEY)) {
        applyIncomingGame(loadSavedGame());
      }
    });

    if (isDisplayAccess()) {
      // Our initial localStorage read may be stale — ask the host to push now.
      postSync({ type: "request" });
    }
  }

  function initAgeGate() {
    // The broadcast Stage display must never show a modal (OBS would capture it),
    // and a browser that already acknowledged is not prompted again.
    if (accessMode === "stage" || localStorage.getItem(AGE_ACK_KEY) === "true" || !dom.ageGate) {
      return;
    }

    dom.ageGate.hidden = false;
    document.body.classList.add("age-gate-open");

    dom.ageGateConfirm.addEventListener("change", () => {
      dom.ageGateAccept.disabled = !dom.ageGateConfirm.checked;
      if (dom.ageGateConfirm.checked) {
        dom.ageGateNote.hidden = true;
      }
    });

    dom.ageGateAccept.addEventListener("click", () => {
      if (!dom.ageGateConfirm.checked) {
        return;
      }
      localStorage.setItem(AGE_ACK_KEY, "true");
      dom.ageGate.hidden = true;
      document.body.classList.remove("age-gate-open");
    });

    dom.ageGateDecline.addEventListener("click", () => {
      dom.ageGateNote.hidden = false;
    });
  }

  function exportPack() {
    const bundle = {
      type: "420iq-pack",
      version: GAME_VERSION,
      exportedAt: new Date().toISOString(),
      questions: questionBank
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `420iq-pack-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${questionBank.length} questions. Commit the file to version control.`);
  }

  function popoutStage() {
    const stageUrl = `${window.location.pathname}?access=stage#stage`;
    const stageWindow = window.open(
      stageUrl,
      "420iq-stage",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
    );

    if (!stageWindow) {
      showToast("Allow pop-ups to open the Stage window.");
      return;
    }

    showToast("Stage window opened. Move it to your capture display, then press F for fullscreen.");
  }

  function applyAccessMode() {
    document.body.dataset.access = accessMode;

    const displayMode = isDisplayAccess();
    const forcedSurface = accessMode === "stage" ? "stage" : "player";

    dom.tabs.forEach(button => {
      button.hidden = displayMode && button.dataset.tab !== forcedSurface;
      button.disabled = button.hidden;
      button.setAttribute("aria-hidden", String(button.hidden));
    });

    [dom.exportButton, dom.resetButton].forEach(button => {
      button.hidden = displayMode;
      button.disabled = button.hidden;
      button.setAttribute("aria-hidden", String(button.hidden));
    });

    [dom.undoButton, dom.backupButton].forEach(button => {
      if (!button) {
        return;
      }
      button.hidden = displayMode;
      button.disabled = button.hidden;
      button.setAttribute("aria-hidden", String(button.hidden));
    });

    if (dom.popoutStageButton) {
      dom.popoutStageButton.hidden = accessMode !== "admin";
    }

    dom.surfaces.forEach(surface => {
      const locked = displayMode && surface.dataset.surface !== forcedSurface;
      surface.toggleAttribute("inert", locked);
      surface.setAttribute("aria-hidden", String(locked));
    });

    if (dom.brandLink) {
      dom.brandLink.href = displayMode ? `#${forcedSurface}` : "#host";
      dom.brandLink.setAttribute(
        "aria-label",
        displayMode ? "420IQ display" : "420IQ home"
      );
    }
  }

  function setActiveTab(tabName) {
    const activeTab = resolveAccessTab(tabName);
    syncRouteHash(activeTab);

    dom.tabs.forEach(button => {
      button.classList.toggle("active", button.dataset.tab === activeTab);
    });
    dom.surfaces.forEach(surface => {
      const isActive = surface.dataset.surface === activeTab;
      surface.classList.toggle("active", isActive);
      if (accessMode === "player") {
        surface.setAttribute("aria-hidden", String(!isActive));
      }
    });
  }

  function syncRouteHash(activeTab) {
    const nextHash = `#${activeTab}`;
    if (window.location.hash === nextHash) {
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.replaceState(null, "", nextUrl);
  }

  function setMode(mode) {
    currentMode = mode === "couple" ? "couple" : "solo";
    dom.modeButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.mode === currentMode);
    });
    dom.soloFields.forEach(field => {
      field.hidden = currentMode !== "solo";
    });
    dom.coupleFields.forEach(field => {
      field.hidden = currentMode !== "couple";
    });
  }

  function createShowSession() {
    const players = currentMode === "couple"
      ? [
          { name: dom.partnerOneInput.value },
          { name: dom.partnerTwoInput.value }
        ]
      : [{ name: dom.singleNameInput.value }];
    const seed = dom.seedInput.value.trim() || "420iq-youtube-pilot";
    const timerSeconds = readTimerSeconds();

    game = IQ.createGame({
      version: GAME_VERSION,
      mode: currentMode,
      players,
      questions: questionBank,
      seed,
      defaultQuestionSeconds: timerSeconds,
      trustedCircle: [
        {
          name: dom.contactOneInput.value,
          cleared: true,
          available: dom.contactOneAvailable.checked
        },
        {
          name: dom.contactTwoInput.value,
          cleared: true,
          available: dom.contactTwoAvailable.checked
        }
      ]
    });

    selectedChoiceIndex = null;
    selectedConfidence = "Curious";
    selectedRisk = "Rise";
    selectedSignalIndex = null;
    history = [];

    saveGame();
    render();
    playCue("ui");
    showToast("420IQ show session created.");
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_BACKUP_KEY);
    game = null;
    history = [];
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
    render();
    setActiveTab("host");
    showToast("Local show session reset.");
  }

  function nextQuestionIsFinal() {
    if (!game) return false;
    const nextQuestion = game.pack.sequence[game.activeQuestionIndex + 1];
    return Boolean(nextQuestion && nextQuestion.final);
  }

  function currentQuestionIsFinal() {
    if (!game) return false;
    const question = IQ.currentQuestion(game);
    return Boolean(question && question.final);
  }

  function shouldShowFinalDecisionPanel() {
    if (!game) return false;
    return (
      game.phase === "FINAL" ||
      (game.phase === "SCORE_COMMITTED" && nextQuestionIsFinal()) ||
      (Boolean(game.finalDecision) && currentQuestionIsFinal())
    );
  }

  function selectedCategoryForRender() {
    if (!game) return dom.finalCategorySelect.value;
    if (game.finalDecision && FINAL_CATEGORY_OPTIONS.includes(game.finalDecision.category)) {
      return game.finalDecision.category;
    }
    if (shouldShowFinalDecisionPanel()) {
      return dom.finalCategorySelect.value;
    }

    const currentQuestion = IQ.currentQuestion(game);
    return currentQuestion && !currentQuestion.final ? currentQuestion.domain : dom.finalCategorySelect.value;
  }

  function syncFinalCategoryOptions(preferredCategory = null) {
    if (!game) return;

    const selectedCategory = preferredCategory && FINAL_CATEGORY_OPTIONS.includes(preferredCategory)
      ? preferredCategory
      : game.finalDecision && FINAL_CATEGORY_OPTIONS.includes(game.finalDecision.category)
      ? game.finalDecision.category
      : dom.finalCategorySelect.value;
    const finalCategory = FINAL_CATEGORY_OPTIONS.includes(selectedCategory)
      ? selectedCategory
      : FINAL_CATEGORY_OPTIONS[0];

    dom.finalCategorySelect.innerHTML = FINAL_CATEGORY_OPTIONS
      .map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
      .join("");
    dom.finalCategorySelect.value = finalCategory;
  }

  function chooseQuestionForCategory(category) {
    if (!game || !FINAL_CATEGORY_OPTIONS.includes(category)) return -1;

    const currentQuestion = IQ.currentQuestion(game);
    if (currentQuestion && currentQuestion.domain === category && !currentQuestion.final) {
      return game.activeQuestionIndex;
    }

    const nextCategoryQuestion = game.pack.sequence.findIndex((question, index) => (
      index >= game.activeQuestionIndex && question.domain === category && !question.final
    ));
    if (nextCategoryQuestion >= 0) {
      return nextCategoryQuestion;
    }

    return game.pack.sequence.findIndex(question => question.domain === category && !question.final);
  }

  function resetQuestionAttemptState() {
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
    lastTickSecond = null;
    timeoutCuePlayed = false;
    if (!game) return;

    game.lockedAnswer = null;
    game.reveal = null;
    game.lifelineActive = null;
    game.timer = {
      ...game.timer,
      startedAtEpochMs: null,
      endsAtEpochMs: null,
      stoppedAtEpochMs: null,
      running: false
    };
  }

  function applySelectedCategory(category) {
    if (!game) {
      syncFinalCategoryOptions(category);
      return;
    }

    if (shouldShowFinalDecisionPanel()) {
      syncFinalCategoryOptions(category);
      return;
    }

    if (!["PRE_SHOW", "INTRO", "QUESTION_READY"].includes(game.phase)) {
      syncFinalCategoryOptions(selectedCategoryForRender());
      showToast("Change category before the question goes live.");
      return;
    }

    const categoryQuestionIndex = chooseQuestionForCategory(category);
    if (categoryQuestionIndex < 0) {
      syncFinalCategoryOptions(selectedCategoryForRender());
      showToast(`No regular ${category} question is available in this demo pack.`);
      return;
    }

    game.activeQuestionIndex = categoryQuestionIndex;
    resetQuestionAttemptState();
    saveGame();
    render();
    showToast(`${category} question loaded.`);
  }

  function pushHistory(snapshot) {
    if (!snapshot) {
      return;
    }

    history.push(snapshot);
    if (history.length > HISTORY_LIMIT) {
      history.shift();
    }
  }

  function perform(action) {
    // Snapshot the pre-action state so a mis-clicked transition (a wrong lock,
    // an accidental reveal or commit) can be reverted without a re-record.
    const snapshot = game ? cloneState(game) : null;

    try {
      action();
      if (snapshot) {
        pushHistory(snapshot);
      }
      saveGame();
      render();
    } catch (error) {
      showToast(error.message || "Action blocked.");
    }
  }

  function syncUndoButton() {
    if (!dom.undoButton) {
      return;
    }

    dom.undoButton.disabled = accessMode === "player" || !game || history.length === 0;
  }

  function undoLastAction() {
    if (!game || history.length === 0) {
      showToast("Nothing to undo.");
      return;
    }

    const snapshot = history.pop();

    try {
      game = IQ.rewind(game, snapshot, "producer");
    } catch (error) {
      showToast(error.message || "Undo blocked.");
      return;
    }

    selectedChoiceIndex = null;
    selectedSignalIndex = null;
    lastTickSecond = null;
    timeoutCuePlayed = false;
    saveGame();
    render();
    playCue("ui");
    showToast("Reverted the last step.");
  }

  function downloadBackup() {
    if (!game) {
      showToast("Create a show session before backing up.");
      return;
    }

    const bundle = {
      type: BACKUP_FILE_TYPE,
      version: GAME_VERSION,
      savedAt: new Date().toISOString(),
      game,
      questionBank
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `420iq-backup-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Recovery backup downloaded.");
  }

  async function restoreBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const bundle = JSON.parse(await file.text());
      if (
        !bundle ||
        bundle.type !== BACKUP_FILE_TYPE ||
        !bundle.game ||
        bundle.game.version !== GAME_VERSION
      ) {
        throw new Error("This file is not a compatible 420IQ backup.");
      }

      game = bundle.game;
      if (Array.isArray(bundle.questionBank) && bundle.questionBank.length) {
        questionBank = bundle.questionBank;
        localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questionBank));
      }

      currentMode = game.mode === "couple" ? "couple" : "solo";
      history = [];
      selectedChoiceIndex = null;
      selectedSignalIndex = null;
      selectedConfidence = "Curious";
      selectedRisk = "Rise";
      saveGame();
      setActiveTab("host");
      render();
      showToast("Session restored from backup.");
    } catch (error) {
      showToast(error.message || "Backup could not be restored.");
    } finally {
      event.target.value = "";
    }
  }

  function render() {
    setMode(currentMode);
    const isComplete = Boolean(game && game.phase === "COMPLETE");
    dom.setupPanel.hidden = Boolean(game);
    dom.runPanel.hidden = !game || isComplete;
    if (dom.recapPanel) {
      dom.recapPanel.hidden = !isComplete;
    }

    renderHost();
    renderStage();
    renderPlayer();
    renderPack();
    renderAudit();
    renderRecap();
    updateTimerDisplays({ allowSfx: false });
  }

  function computeRecap() {
    if (!game) {
      return null;
    }

    const results = (Array.isArray(game.results) ? game.results.slice() : [])
      .sort((a, b) => a.index - b.index);
    const total = results.length;
    const correct = results.filter(result => result.correct).length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    const byDifficulty = {};
    results.forEach(result => {
      const bucket = byDifficulty[result.difficulty] || (byDifficulty[result.difficulty] = { correct: 0, total: 0 });
      bucket.total += 1;
      if (result.correct) {
        bucket.correct += 1;
      }
    });

    return {
      results,
      total,
      correct,
      accuracy,
      finalScore: game.scores[game.participant.id] || 0,
      player: game.participant.displayName,
      byDifficulty,
      lifelines: {
        trustedCircle: game.lifelines.trustedCircle.used,
        sourceSignal: game.lifelines.sourceSignal.used
      }
    };
  }

  function renderRecap() {
    const complete = Boolean(game && game.phase === "COMPLETE");

    if (dom.stageRecap) {
      dom.stageRecap.hidden = !complete;
    }

    if (!complete) {
      if (dom.recapPanel) dom.recapPanel.innerHTML = "";
      if (dom.stageRecap) dom.stageRecap.innerHTML = "";
      return;
    }

    const recap = computeRecap();
    renderHostRecap(recap);
    renderStageRecap(recap);
  }

  function renderHostRecap(recap) {
    if (!dom.recapPanel) {
      return;
    }

    const difficultyBlocks = Object.keys(recap.byDifficulty).map(difficulty => {
      const bucket = recap.byDifficulty[difficulty];
      return `<div class="recap-diff">${difficultyChip(difficulty)}<span>${bucket.correct}/${bucket.total}</span></div>`;
    }).join("");

    const rows = recap.results.map(result => `
      <div class="recap-row ${result.correct ? "is-correct" : "is-wrong"}">
        <strong>Q${result.index + 1}</strong>
        ${difficultyChip(result.difficulty)}
        <span class="recap-domain">${escapeHtml(result.domain)}</span>
        <span class="recap-mark">${result.correct ? "✓" : "✗"}</span>
        <span class="recap-delta">${result.delta >= 0 ? "+" : ""}${result.delta.toLocaleString()} IQ</span>
      </div>
    `).join("");

    dom.recapPanel.innerHTML = `
      <div class="recap-head">
        <div class="section-kicker">Show complete</div>
        <h2 id="recapTitle">${escapeHtml(recap.player)}</h2>
        <div class="recap-final"><strong>${recap.finalScore.toLocaleString()}</strong><span>IQ</span></div>
      </div>
      <div class="recap-blocks">
        <div class="recap-block accent-amber">
          <span>Accuracy</span>
          <strong>${recap.accuracy}%</strong>
          <p>${recap.correct} of ${recap.total} correct</p>
        </div>
        <div class="recap-block accent-blue">
          <span>By difficulty</span>
          <div class="recap-diffs">${difficultyBlocks || "<p>No questions committed.</p>"}</div>
        </div>
        <div class="recap-block accent-green">
          <span>Lifelines</span>
          <p>Trusted Circle: ${recap.lifelines.trustedCircle ? "used" : "unused"}</p>
          <p>Source Signal: ${recap.lifelines.sourceSignal ? "used" : "unused"}</p>
        </div>
      </div>
      <div class="recap-list">${rows || "<p class=\"recap-empty\">No committed questions to recap.</p>"}</div>
      <button class="primary-button" type="button" id="recapNewButton">Start new session</button>
    `;

    const newButton = document.getElementById("recapNewButton");
    if (newButton) {
      newButton.addEventListener("click", resetDemo);
    }
  }

  function renderStageRecap(recap) {
    if (!dom.stageRecap) {
      return;
    }

    const chips = Object.keys(recap.byDifficulty).map(difficulty => {
      const bucket = recap.byDifficulty[difficulty];
      return `<div class="stage-recap-chip">${difficultyChip(difficulty)}<span>${bucket.correct}/${bucket.total}</span></div>`;
    }).join("");

    dom.stageRecap.innerHTML = `
      <div class="section-kicker">Show complete</div>
      <div class="stage-recap-score">
        <span>${escapeHtml(recap.player)}</span>
        <strong>${recap.finalScore.toLocaleString()} IQ</strong>
      </div>
      <div class="stage-recap-accuracy">${recap.correct} / ${recap.total} correct · ${recap.accuracy}%</div>
      <div class="stage-recap-chips">${chips}</div>
    `;
  }

  function renderHost() {
    if (!game) {
      dom.phaseLabel.textContent = "NO SESSION";
      dom.scoreValue.textContent = "0";
      dom.questionCounter.textContent = "0/0";
      dom.hostQuestionMeta.textContent = "No active question";
      dom.hostQuestionStem.textContent = "Create a show session to begin.";
      dom.hostChoices.innerHTML = "";
      dom.cueText.textContent = PHASE_CUES.PRE_SHOW;
      dom.lifelinePanel.innerHTML = "<div class=\"panel-label\">Lifeline output</div><p>Source Signal and Trusted Circle appear here when activated.</p>";
      dom.finalPanel.hidden = true;
      renderControls();
      return;
    }

    const publicQuestion = IQ.getPublicQuestion(game);
    const score = game.scores[game.participant.id] || 0;
    const progressDegrees = progressToDegrees();

    dom.phaseLabel.textContent = game.phase;
    dom.scoreValue.textContent = score.toLocaleString();
    dom.questionCounter.textContent = `${publicQuestion.index}/${publicQuestion.total}`;
    dom.hostQuestionMeta.innerHTML = categoryChip(publicQuestion.domain) + difficultyChip(publicQuestion.difficulty);
    dom.hostQuestionStem.textContent = publicQuestion.stem;
    dom.cueText.textContent = PHASE_CUES[game.phase] || "Ready.";
    dom.sideRing.style.setProperty("--ring-progress", `${progressDegrees}deg`);
    dom.sideRing.classList.toggle("locked", game.phase === "ANSWER_LOCKED");
    syncFinalCategoryOptions(selectedCategoryForRender());
    dom.finalPanel.hidden = !shouldShowFinalDecisionPanel();

    renderChoiceButtons(dom.hostChoices, publicQuestion, "answer-choice");
    renderConfidence();
    renderLifelinePanel();
    renderControls();
  }

  function renderConfidence() {
    dom.confidenceButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.confidence === selectedConfidence);
    });
    dom.riskButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.risk === selectedRisk);
    });
  }

  function renderChoiceButtons(container, publicQuestion, className) {
    container.innerHTML = "";
    const lockedChoice = game && game.lockedAnswer ? game.lockedAnswer.choiceIndex : null;
    const visibleSelection = lockedChoice !== null ? lockedChoice : selectedChoiceIndex;
    const reveal = game ? game.reveal : null;
    const canSelect = game && (game.phase === "QUESTION_LIVE" || game.phase === "LIFELINE_ACTIVE") && !game.lockedAnswer;

    publicQuestion.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.dataset.choiceIndex = String(index);
      button.disabled = !canSelect;

      if (visibleSelection === index && !reveal) {
        button.classList.add("selected");
      }

      if (reveal && reveal.correctIndex === index) {
        button.classList.add("correct");
      } else if (reveal && lockedChoice === index && !reveal.correct) {
        button.classList.add("incorrect");
      }

      button.innerHTML = `<span>${ANSWER_LETTERS[index] || index + 1}</span><span>${escapeHtml(choice)}</span>`;
      button.addEventListener("click", () => {
        if (!canSelect) return;
        selectedChoiceIndex = index;
        render();
        playCue("answerSelect");
      });

      container.appendChild(button);
    });
  }

  function renderStaticChoices(container, publicQuestion, className) {
    container.innerHTML = "";
    const lockedChoice = game && game.lockedAnswer ? game.lockedAnswer.choiceIndex : null;
    const reveal = game ? game.reveal : null;

    publicQuestion.choices.forEach((choice, index) => {
      const row = document.createElement("div");
      row.className = className;

      if (reveal && reveal.correctIndex === index) {
        row.classList.add("correct");
      } else if (reveal && lockedChoice === index && !reveal.correct) {
        row.classList.add("incorrect");
      }

      row.innerHTML = `<span>${ANSWER_LETTERS[index] || index + 1}</span><span>${escapeHtml(choice)}</span>`;
      container.appendChild(row);
    });
  }

  function renderLifelinePanel() {
    if (!game) return;

    const trustedState = game.lifelines.trustedCircle.used ? "used" : "available";
    const sourceState = game.lifelines.sourceSignal.used ? "used" : "available";

    if (!game.lifelineActive) {
      dom.lifelinePanel.innerHTML = `
        <div class="panel-label">Lifeline output</div>
        <p>Trusted Circle is ${trustedState}. Source Signal is ${sourceState}.</p>
      `;
      return;
    }

    if (game.lifelineActive.type === "trustedCircle") {
      renderTrustedCirclePanel();
      return;
    }

    renderSourceSignalPanel();
  }

  function renderTrustedCirclePanel() {
    const active = game.lifelineActive;
    const body = active.selectedContact
      ? `<p>${escapeHtml(active.selectedContact.name)} is connected. Advice window: ${active.secondsForAdvice}s, then ${active.secondsForContestantLock}s to lock.</p>`
      : `<p>No cleared contact is available. Circle Consensus fallback is displayed from rehearsal data.</p>${renderConsensus(active.consensus || [])}`;

    dom.lifelinePanel.innerHTML = `
      <div class="panel-label">${escapeHtml(active.mode)}</div>
      ${body}
      ${active.resolved ? "<div class=\"signal-result\">Lifeline resolved. Return to the answer.</div>" : "<button class=\"secondary-button\" type=\"button\" id=\"resolveTrustedButton\">Return to question</button>"}
    `;

    const button = document.getElementById("resolveTrustedButton");
    if (button) {
      button.addEventListener("click", () => {
        perform(() => {
          game = IQ.resolveLifeline(game, {}, "producer");
        });
      });
    }
  }

  function renderConsensus(consensus) {
    if (!consensus.length) {
      return "";
    }

    return `
      <div class="signal-list">
        ${consensus.map(item => `<div class="signal-choice"><strong>${ANSWER_LETTERS[item.choiceIndex] || item.choiceIndex + 1}</strong><span>${item.percent}%</span></div>`).join("")}
      </div>
    `;
  }

  function renderSourceSignalPanel() {
    const active = game.lifelineActive;
    const signals = active.signals || [];
    const verifiedSignal = active.verifiedSignal || "";
    const signalButtons = signals.map((signal, index) => `
      <button class="signal-choice ${selectedSignalIndex === index ? "selected" : ""}" type="button" data-signal-index="${index}">
        <span>${index + 1}</span>
        <span>${escapeHtml(signal)}</span>
      </button>
    `).join("");

    dom.lifelinePanel.innerHTML = `
      <div class="panel-label">Source Signal</div>
      <p>Contestant chooses which evidence signal to trust. The verified clue does not disclose the answer.</p>
      <div class="signal-list">${signalButtons}</div>
      ${active.resolved ? `<div class="signal-result">Verified signal: ${escapeHtml(verifiedSignal)}</div>` : "<button class=\"secondary-button\" type=\"button\" id=\"resolveSourceButton\">Reveal verified signal</button>"}
    `;

    dom.lifelinePanel.querySelectorAll("[data-signal-index]").forEach(button => {
      button.addEventListener("click", () => {
        selectedSignalIndex = Number(button.dataset.signalIndex);
        render();
      });
    });

    const resolveButton = document.getElementById("resolveSourceButton");
    if (resolveButton) {
      resolveButton.disabled = selectedSignalIndex === null;
      resolveButton.addEventListener("click", () => {
        perform(() => {
          game = IQ.resolveLifeline(game, {
            selectedIndex: selectedSignalIndex
          }, "producer");
          selectedSignalIndex = null;
        });
      });
    }
  }

  function renderControls() {
    const phase = game ? game.phase : null;
    const can = nextState => {
      return Boolean(game && IQ.VALID_TRANSITIONS[phase] && IQ.VALID_TRANSITIONS[phase].includes(nextState));
    };

    dom.introButton.disabled = !can("INTRO");
    dom.readyButton.disabled = !can("QUESTION_READY");
    dom.liveButton.disabled = !can("QUESTION_LIVE");
    dom.sourceButton.disabled = !(game && phase === "QUESTION_LIVE" && !game.lifelines.sourceSignal.used);
    dom.trustedButton.disabled = !(game && phase === "QUESTION_LIVE" && !game.lifelines.trustedCircle.used);
    dom.lockButton.disabled = !(game && (phase === "QUESTION_LIVE" || phase === "LIFELINE_ACTIVE") && selectedChoiceIndex !== null && !game.lockedAnswer);
    dom.revealButton.disabled = !can("REVEAL");
    dom.dropButton.disabled = !(game && phase === "REVEAL" && IQ.currentQuestion(game).knowledgeDrop);
    dom.commitButton.disabled = !(game && (phase === "REVEAL" || phase === "KNOWLEDGE_DROP"));
    dom.nextButton.disabled = !(game && phase === "SCORE_COMMITTED" && !nextQuestionIsFinal() && !currentQuestionIsFinal());
    dom.decisionButton.disabled = !(game && phase === "SCORE_COMMITTED" && nextQuestionIsFinal());
    dom.openFinalButton.disabled = !(game && phase === "FINAL");
    dom.completeButton.disabled = !(game && phase === "SCORE_COMMITTED" && currentQuestionIsFinal());

    [
      dom.introButton,
      dom.readyButton,
      dom.liveButton,
      dom.lockButton,
      dom.revealButton,
      dom.commitButton,
      dom.nextButton,
      dom.decisionButton,
      dom.openFinalButton,
      dom.completeButton
    ].forEach(button => button.classList.remove("primary-live"));

    const primaryByPhase = {
      PRE_SHOW: dom.introButton,
      INTRO: dom.readyButton,
      QUESTION_READY: dom.liveButton,
      QUESTION_LIVE: dom.lockButton,
      ANSWER_LOCKED: dom.revealButton,
      REVEAL: dom.dropButton,
      KNOWLEDGE_DROP: dom.commitButton,
      SCORE_COMMITTED: nextQuestionIsFinal() ? dom.decisionButton : (currentQuestionIsFinal() ? dom.completeButton : dom.nextButton),
      FINAL: dom.openFinalButton
    };

    if (primaryByPhase[phase]) {
      primaryByPhase[phase].classList.add("primary-live");
    }

    syncUndoButton();
  }

  function renderStage() {
    const score = game ? game.scores[game.participant.id] || 0 : 0;
    const publicQuestion = game ? IQ.getPublicQuestion(game) : null;
    const progressDegrees = progressToDegrees();

    dom.stagePhase.textContent = game ? game.phase : "PRE_SHOW";
    dom.stageDifficulty.innerHTML = publicQuestion ? difficultyChip(publicQuestion.difficulty) : "420IQ";
    dom.stagePlayer.textContent = game ? game.participant.displayName : "Contestant";
    dom.stageScore.textContent = `${score.toLocaleString()} IQ`;
    dom.stageQuestion.textContent = publicQuestion ? publicQuestion.stem : "Create a session to load the first question.";
    dom.stageCue.textContent = game ? PHASE_CUES[game.phase] : "YouTube master display";
    dom.stageChecksum.textContent = game ? game.pack.checksum : "pack pending";
    dom.stageRing.style.setProperty("--ring-progress", `${progressDegrees}deg`);
    dom.stageRing.classList.toggle("locked", game && game.phase === "ANSWER_LOCKED");
    renderVerticalPreview(publicQuestion, score, progressDegrees);

    if (publicQuestion) {
      renderStaticChoices(dom.stageAnswers, publicQuestion, "stage-answer");
    } else {
      dom.stageAnswers.innerHTML = "";
    }
  }

  function renderVerticalPreview(publicQuestion, score, progressDegrees) {
    const fallbackDuration = defaultTimerSeconds();
    const timerSnapshot = game
      ? IQ.getTimerSnapshot(game)
      : {
          durationSeconds: fallbackDuration,
          remainingSeconds: fallbackDuration,
          elapsedSeconds: 0,
          expired: false
        };
    const phase = game ? game.phase : "PRE_SHOW";
    const lockedChoice = game && game.lockedAnswer ? game.lockedAnswer.choiceIndex : null;
    const visibleSelection = lockedChoice !== null ? lockedChoice : selectedChoiceIndex;
    const reveal = game ? game.reveal : null;
    const canSelect = Boolean(
      game &&
      publicQuestion &&
      (game.phase === "QUESTION_LIVE" || game.phase === "LIFELINE_ACTIVE") &&
      !game.lockedAnswer
    );

    dom.phoneFrame.classList.toggle("live", Boolean(game));
    dom.phoneFrame.classList.toggle("selectable", canSelect);
    dom.phoneFrame.classList.toggle("locked", game && game.phase === "ANSWER_LOCKED");
    dom.phoneFrame.classList.toggle("reveal", Boolean(reveal));
    dom.phoneRing.style.setProperty("--ring-progress", `${progressDegrees}deg`);
    dom.verticalPhase.textContent = game ? phase.replace(/_/g, " ") : "9:16 CLIP SAFE";
    dom.verticalTimer.textContent = formatTime(timerSnapshot.remainingSeconds);
    dom.verticalPlayer.textContent = game ? game.participant.displayName : "Contestant";
    dom.verticalScore.textContent = `${score.toLocaleString()} IQ`;
    dom.verticalQuestion.textContent = publicQuestion
      ? publicQuestion.stem
      : "Question moments stay centered for Shorts, Reels and TikTok.";
    dom.verticalCue.textContent = game
      ? (PHASE_CUES[phase] || "Ready.")
      : "Vertical output idle";

    dom.verticalBars.innerHTML = "";
    if (!publicQuestion) return;

    publicQuestion.choices.slice(0, 4).forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "phone-choice";
      button.dataset.choiceIndex = String(index);
      button.disabled = !canSelect;
      button.setAttribute("aria-pressed", String(visibleSelection === index && !reveal));

      if (visibleSelection === index && !reveal) {
        button.classList.add("selected");
      }

      if (reveal && reveal.correctIndex === index) {
        button.classList.add("correct");
      } else if (reveal && lockedChoice === index && !reveal.correct) {
        button.classList.add("incorrect");
      }

      button.innerHTML = `<span>${ANSWER_LETTERS[index] || index + 1}</span><strong>${escapeHtml(choice)}</strong>`;
      button.addEventListener("click", () => {
        if (!canSelect) return;
        selectedChoiceIndex = index;
        render();
        playCue("answerSelect");
      });

      dom.verticalBars.appendChild(button);
    });
  }

  function renderPlayer() {
    if (!game) {
      dom.playerModeLabel.textContent = "Contestant display";
      dom.playerName.textContent = "Contestant";
      dom.playerPrompt.textContent = "Waiting for the host.";
      dom.playerChoices.innerHTML = "";
      dom.teamModeText.textContent = "Single player mode is ready.";
      dom.lifelineState.innerHTML = "";
      return;
    }

    const publicQuestion = IQ.getPublicQuestion(game);
    const members = game.participant.members.map(member => member.name).join(" and ");

    dom.playerModeLabel.textContent = game.mode === "couple" ? "Couple contestant display" : "Single contestant display";
    dom.playerName.textContent = game.participant.displayName;
    dom.playerPrompt.textContent = game.phase === "QUESTION_LIVE"
      ? "Choose one answer and let the host lock it."
      : PHASE_CUES[game.phase];
    dom.teamModeText.textContent = game.mode === "couple"
      ? `${members} play as one team. Their answer is locked as a shared decision.`
      : `${members} plays solo against the 420IQ lane.`;

    renderChoiceButtons(dom.playerChoices, publicQuestion, "player-choice");
    renderLifelineState();
  }

  function renderLifelineState() {
    dom.lifelineState.innerHTML = "";
    [
      ["Trusted Circle", game.lifelines.trustedCircle.used],
      ["Source Signal", game.lifelines.sourceSignal.used]
    ].forEach(([label, used]) => {
      const item = document.createElement("div");
      item.className = "state-pill";
      item.innerHTML = `<span>${label}</span><strong>${used ? "Used" : "Ready"}</strong>`;
      dom.lifelineState.appendChild(item);
    });
  }

  function renderPack() {
    const preview = game ? game.pack : IQ.buildBalancedSequence(questionBank, {
      seed: dom.seedInput.value || "420iq-youtube-pilot",
      count: questionBank.length
    });

    dom.packSeed.textContent = preview.seed;
    dom.packChecksum.textContent = preview.checksum;
    dom.packBalance.textContent = preview.diagnostics.valid
      ? "Valid"
      : `${preview.diagnostics.violations.length} issue(s)`;

    dom.questionTable.innerHTML = "";
    preview.sequence.forEach((question, index) => {
      const row = document.createElement("div");
      row.className = "question-row";
      row.innerHTML = `
        <strong>${index + 1}</strong>
        <span>${difficultyChip(question.difficulty)}</span>
        <div>${escapeHtml(question.stem)}</div>
        <span>${question.final ? "Final" : escapeHtml(question.sensitivity)}</span>
      `;
      dom.questionTable.appendChild(row);
    });
  }

  function renderPublicPayloadCard(payload) {
    if (!payload || !payload.question) {
      dom.publicPayloadCard.innerHTML = "<p class=\"payload-empty\">Create a show session to preview the safe public display.</p>";
      return;
    }

    const question = payload.question;
    const choices = question.choices.map((choice, index) => `
      <li class="payload-answer">
        <span>${ANSWER_LETTERS[index] || index + 1}</span>
        <strong>${escapeHtml(choice)}</strong>
      </li>
    `).join("");
    const sourceSignals = question.sourceSignals.map(signal => `<li>${escapeHtml(signal)}</li>`).join("");

    dom.publicPayloadCard.innerHTML = `
      <div class="payload-summary">
        <div class="payload-field">
          <span>Phase</span>
          <strong>${escapeHtml(payload.phase)}</strong>
        </div>
        <div class="payload-field">
          <span>Player</span>
          <strong>${escapeHtml(payload.participant)}</strong>
        </div>
        <div class="payload-field">
          <span>Score</span>
          <strong>${Number(payload.score).toLocaleString()} IQ</strong>
        </div>
      </div>
      <div class="payload-question">
        <span>${categoryChip(question.domain)} ${difficultyChip(question.difficulty)}</span>
        <h3>${escapeHtml(question.stem)}</h3>
      </div>
      <ol class="payload-answer-list">
        ${choices}
      </ol>
      <div class="payload-safe-state">
        <span>Broadcast safe</span>
        <strong>Answer key hidden until reveal</strong>
      </div>
      <div class="payload-signals">
        <span>Source Signal options</span>
        <ul>${sourceSignals}</ul>
      </div>
    `;
  }

  function renderAudit() {
    if (!game) {
      dom.eventLog.innerHTML = "<div class=\"event-row\"><strong>Waiting</strong><span>No session</span><code>Create a show session to begin the audit trail.</code></div>";
      renderPublicPayloadCard(null);
      return;
    }

    dom.eventLog.innerHTML = "";
    game.events.forEach(event => {
      const row = document.createElement("div");
      row.className = "event-row";
      row.innerHTML = `
        <strong>${escapeHtml(event.id)}</strong>
        <span>${escapeHtml(event.type)}<br>${escapeHtml(event.previousState || "START")} -> ${escapeHtml(event.nextState || "END")}</span>
        <code>${escapeHtml(JSON.stringify(event.payload))}</code>
      `;
      dom.eventLog.appendChild(row);
    });

    renderPublicPayloadCard({
      phase: game.phase,
      participant: game.participant.displayName,
      score: game.scores[game.participant.id] || 0,
      question: IQ.getPublicQuestion(game)
    });
  }

  function progressToDegrees() {
    if (!game || !game.pack.sequence.length) {
      return 0;
    }

    const completed = game.phase === "COMPLETE"
      ? game.pack.sequence.length
      : game.activeQuestionIndex;
    return Math.round((completed / game.pack.sequence.length) * 360);
  }

  function exportAudit() {
    if (!game) {
      showToast("Create a show session before exporting.");
      return;
    }

    const audit = IQ.exportAudit(game);
    const blob = new Blob([JSON.stringify(audit, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `420iq-audit-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Audit JSON exported.");
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      showToast("Fullscreen is not available in this browser.");
    }
  }

  async function importQuestionBank(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const imported = convertQuestionBank(parsed);
      questionBank = imported;
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questionBank));
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_BACKUP_KEY);
      game = null;
      history = [];
      render();
      showToast(`${imported.length} questions imported for rehearsal.`);
    } catch (error) {
      showToast(error.message || "Question JSON could not be imported.");
    } finally {
      event.target.value = "";
    }
  }

  function convertQuestionBank(candidate) {
    const source = Array.isArray(candidate)
      ? candidate
      : Array.isArray(candidate.questions)
        ? candidate.questions
        : Array.isArray(candidate.mainQuestions)
          ? candidate.mainQuestions
          : [];

    if (!source.length) {
      throw new Error("Import needs an array, questions, or mainQuestions.");
    }

    const difficulties = ["Spark", "Flame", "Inferno", "Spark", "Flame", "Wild 420"];
    const converted = source.map((item, index) => {
      const choices = Array.isArray(item.choices)
        ? item.choices
        : Array.isArray(item.answers)
          ? item.answers
          : [];
      const stem = item.stem || item.question;
      const correctIndex = Number.isInteger(item.correctIndex)
        ? item.correctIndex
        : item.correctAnswer;

      if (!stem || choices.length < 2 || !Number.isInteger(correctIndex)) {
        throw new Error(`Question ${index + 1} is not compatible.`);
      }

      return {
        id: `import-${Date.now()}-${index + 1}`,
        domain: String(item.domain || item.category || "Imported"),
        difficulty: item.difficulty || difficulties[index % difficulties.length],
        stem: String(stem),
        choices: choices.map(String),
        correctIndex,
        knowledgeDrop: String(item.knowledgeDrop || item.explanation || "Imported rehearsal question. Add a sourced Knowledge Drop before broadcast."),
        sourceSignals: Array.isArray(item.sourceSignals) && item.sourceSignals.length >= 3
          ? item.sourceSignals.slice(0, 3).map(String)
          : [
              "Imported record needs a verified source.",
              "Imported data is automatically Council-approved.",
              "Rehearsal use makes a question broadcast safe."
            ],
        verifiedSignalIndex: Number.isInteger(item.verifiedSignalIndex) ? item.verifiedSignalIndex : 0,
        sourceCue: String(item.sourceCue || "Imported demo record. Verify before broadcast."),
        correctAsOf: String(item.correctAsOf || "Imported rehearsal only"),
        sensitivity: String(item.sensitivity || "Tier 2"),
        readTime: Number(item.readTime) || 10
      };
    });

    return converted.length >= 2
      ? converted
      : converted.concat(DEMO_QUESTIONS.slice(0, 2));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function difficultyChip(difficulty) {
    const value = String(difficulty || "");
    return `<span class="chip chip-difficulty" data-difficulty="${escapeHtml(value)}">${escapeHtml(value)}</span>`;
  }

  function categoryChip(domain) {
    return `<span class="chip chip-category">${escapeHtml(String(domain || ""))}</span>`;
  }

  dom.tabs.forEach(button => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  if (dom.brandLink) {
    dom.brandLink.addEventListener("click", event => {
      event.preventDefault();
      setActiveTab(accessMode === "player" ? "player" : "host");
    });
  }

  window.addEventListener("hashchange", () => setActiveTab(resolveAccessTab(readInitialTab())));

  dom.modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  dom.confidenceButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedConfidence = button.dataset.confidence;
      render();
    });
  });

  dom.riskButtons.forEach(button => {
    button.addEventListener("click", () => {
      selectedRisk = button.dataset.risk;
      render();
    });
  });

  dom.finalCategorySelect.addEventListener("change", () => {
    applySelectedCategory(dom.finalCategorySelect.value);
  });

  dom.startGameButton.addEventListener("click", createShowSession);
  dom.questionImportInput.addEventListener("change", importQuestionBank);
  dom.soundToggle.addEventListener("click", async () => {
    if (soundEnabled && !isAudioReadyForPlayback()) {
      const played = await playCue(pendingCueType || "ui");
      if (played) {
        pendingCueType = null;
      }
      syncSoundButton();
      showToast(played ? "SFX armed." : "Tap SFX again to allow audio.");
      return;
    }

    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
    if (soundEnabled) {
      const played = await playCue("ui");
      showToast(played ? "SFX is on." : "Tap ARM to enable SFX.");
    } else {
      pendingCueType = null;
      showToast("SFX is off.");
    }
    syncSoundButton();
  });
  dom.resetButton.addEventListener("click", resetDemo);
  dom.exportButton.addEventListener("click", exportAudit);
  if (dom.undoButton) {
    dom.undoButton.addEventListener("click", undoLastAction);
  }
  if (dom.backupButton) {
    dom.backupButton.addEventListener("click", downloadBackup);
  }
  if (dom.restoreBackupInput) {
    dom.restoreBackupInput.addEventListener("change", restoreBackup);
  }
  if (dom.popoutStageButton) {
    dom.popoutStageButton.addEventListener("click", popoutStage);
  }
  if (dom.exportPackButton) {
    dom.exportPackButton.addEventListener("click", exportPack);
  }
  dom.fullscreenButton.addEventListener("click", toggleFullscreen);

  dom.introButton.addEventListener("click", () => perform(() => {
    game = IQ.transition(game, "INTRO", {}, "producer");
  }));

  dom.readyButton.addEventListener("click", () => perform(() => {
    game = IQ.transition(game, "QUESTION_READY", {}, "producer");
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
  }));

  dom.liveButton.addEventListener("click", () => perform(() => {
    const durationSeconds = readTimerSeconds();
    game = IQ.transition(game, "QUESTION_LIVE", { durationSeconds }, "producer");
    game = IQ.startQuestionTimer(game, durationSeconds, Date.now(), "producer");
    lastTickSecond = null;
    timeoutCuePlayed = false;
    playCue("questionLive");
  }));

  dom.sourceButton.addEventListener("click", () => perform(() => {
    game = IQ.activateLifeline(game, "sourceSignal", "producer");
    selectedSignalIndex = null;
    playCue("lifeline");
  }));

  dom.trustedButton.addEventListener("click", () => perform(() => {
    game = IQ.activateLifeline(game, "trustedCircle", "producer");
    playCue("lifeline");
  }));

  dom.lockButton.addEventListener("click", () => perform(() => {
    game = IQ.lockAnswer(game, {
      choiceIndex: selectedChoiceIndex,
      confidence: selectedConfidence
    }, "contestant");
  }));

  dom.revealButton.addEventListener("click", () => perform(() => {
    game = IQ.revealAnswer(game, "producer");
    playCue(game.reveal.audioCue);
  }));

  dom.dropButton.addEventListener("click", () => perform(() => {
    game = IQ.showKnowledgeDrop(game, "host");
  }));

  dom.commitButton.addEventListener("click", () => perform(() => {
    game = IQ.commitScore(game, "scorekeeper");
    playCue(game.segmentOutro.audioCue);
  }));

  dom.nextButton.addEventListener("click", () => perform(() => {
    game = IQ.advanceQuestion(game, "producer");
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
  }));

  dom.decisionButton.addEventListener("click", () => perform(() => {
    game = IQ.startFinalDecision(game, {
      riskBand: selectedRisk,
      category: dom.finalCategorySelect.value
    }, "producer");
  }));

  dom.openFinalButton.addEventListener("click", () => perform(() => {
    game = IQ.openFinalQuestion(game, "producer");
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
  }));

  dom.completeButton.addEventListener("click", () => perform(() => {
    game = IQ.advanceQuestion(game, "producer");
    playCue("complete");
  }));

  document.addEventListener("keydown", event => {
    if (!game || !(game.phase === "QUESTION_LIVE" || game.phase === "LIFELINE_ACTIVE")) {
      return;
    }

    const index = ANSWER_LETTERS.indexOf(event.key.toUpperCase());
    const question = IQ.getPublicQuestion(game);
    if (index >= 0 && index < question.choices.length && !game.lockedAnswer) {
      selectedChoiceIndex = index;
      render();
      playCue("answerSelect");
    }

    if (event.key === "Enter" && !dom.lockButton.disabled) {
      dom.lockButton.click();
    }
  });

  if (game && game.timer && Number.isFinite(game.timer.durationSeconds)) {
    dom.timerSecondsInput.value = String(game.timer.durationSeconds);
  }

  if (accessMode === "stage") {
    // On the broadcast display, F or a double-click toggles fullscreen so the
    // host can fill their capture monitor without any on-screen chrome.
    document.addEventListener("keydown", event => {
      if (event.key === "f" || event.key === "F") {
        toggleFullscreen();
      }
    });
    if (dom.stageFrame) {
      dom.stageFrame.addEventListener("dblclick", toggleFullscreen);
    }
  }

  applyAccessMode();
  const initialTab = resolveAccessTab(readInitialTab());
  setActiveTab(initialTab);
  setMode(currentMode);
  syncSoundButton();
  installMobileAudioUnlock();
  initCrossWindowSync();
  initAgeGate();
  window.setInterval(updateTimerDisplays, 250);
  // Heal storage on load: if the session was recovered from the mirror key
  // (a torn or cleared primary write), re-persist to both keys immediately.
  if (game) {
    saveGame();
  }
  render();
})();
