(function run420IQApp() {
  "use strict";

  const IQ = window.IQ420Engine;
  const GAME_VERSION = "420iq-static-pilot-v2";
  const STORAGE_KEY = "420iqPilotGameV2";
  const STORAGE_BACKUP_KEY = "420iqPilotGameV2Backup";
  const QUESTION_BANK_KEY = "420iqPilotQuestionBankV2";
  const SOUND_KEY = "420iqPilotSoundEnabled";
  const JOIN_HOST_KEY = "420iqJoinHostV1";
  const BACKUP_FILE_TYPE = "420iq-backup";
  const HISTORY_LIMIT = 40;
  const AGE_ACK_KEY = "420iqAgeAcknowledgedV1";
  const ANSWER_LETTERS = ["A", "B", "C", "D", "E", "F"];
  const ACCESS_MODES = new Set(["admin", "player", "stage"]);
  const VALID_TABS = new Set(["host", "stage", "player", "pack", "audit"]);
  const SYNC_CHANNEL_NAME = "420iq-sync";
  const NO_CATEGORY_SELECTED = "";
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
  const QR_VERSION = 5;
  const QR_ALIGNMENT_POSITIONS = [6, 30];
  const QR_DATA_CODEWORD_COUNT = 108;
  const QR_ERROR_CORRECTION_CODEWORDS = 26;
  const QR_BYTE_COUNT_BITS = 8;
  const QR_MAX_BYTE_LENGTH = QR_DATA_CODEWORD_COUNT - 2;

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
    FINAL: "The 420 Decision is active. Choose the IQ target and category, then open the final question.",
    COMPLETE: "Show complete. Export the audit package."
  };

  const dom = {
    surfaces: Array.from(document.querySelectorAll(".surface")),
    tabs: Array.from(document.querySelectorAll(".tab-button")),
    brandLink: document.querySelector(".brand-lockup"),
    setupPanel: document.getElementById("setupPanel"),
    runPanel: document.getElementById("runPanel"),
    recapPanel: document.getElementById("recapPanel"),
    categoryPicker: document.getElementById("categoryPicker"),
    categoryGrid: document.getElementById("categoryGrid"),
    balancedStartButton: document.getElementById("balancedStartButton"),
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
    guaranteedValue: document.getElementById("guaranteedValue"),
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
    playerJoinQr: document.getElementById("playerJoinQr"),
    playerJoinLink: document.getElementById("playerJoinLink"),
    joinHostInput: document.getElementById("joinHostInput"),
    applyJoinHostButton: document.getElementById("applyJoinHostButton"),
    joinHelp: document.getElementById("joinHelp"),
    copyLinkButtons: Array.from(document.querySelectorAll("[data-copy-target]")),
    introButton: document.getElementById("introButton"),
    readyButton: document.getElementById("readyButton"),
    liveButton: document.getElementById("liveButton"),
    sourceButton: document.getElementById("sourceButton"),
    trustedButton: document.getElementById("trustedButton"),
    fiftyButton: document.getElementById("fiftyButton"),
    lockButton: document.getElementById("lockButton"),
    revealButton: document.getElementById("revealButton"),
    dropButton: document.getElementById("dropButton"),
    commitButton: document.getElementById("commitButton"),
    nextButton: document.getElementById("nextButton"),
    guaranteeButton: document.getElementById("guaranteeButton"),
    walkAwayButton: document.getElementById("walkAwayButton"),
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
    playerQuestion: document.getElementById("playerQuestion"),
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
  let awaitingCategoryStart = false;
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
  let networkSyncEnabled = false;
  let joinHostOverride = readJoinHostOverride();
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
        const serialized = localStorage.getItem(key);
        const saved = JSON.parse(serialized);
        if (saved && saved.version === GAME_VERSION) {
          rehealSavedGame(serialized);
          return saved;
        }
      } catch (error) {
        console.warn(`Could not restore saved 420IQ session from ${key}.`, error);
      }
    }

    return null;
  }

  function rehealSavedGame(serialized) {
    // Recovery restores dual-key redundancy right away: if one key was torn, the
    // show would otherwise run on the single surviving copy until the next save,
    // and a second failure in that window loses everything. The equality guards
    // keep the normal (both keys already healthy) path free of extra writes.
    try {
      if (localStorage.getItem(STORAGE_KEY) !== serialized) {
        localStorage.setItem(STORAGE_KEY, serialized);
      }
      if (localStorage.getItem(STORAGE_BACKUP_KEY) !== serialized) {
        localStorage.setItem(STORAGE_BACKUP_KEY, serialized);
      }
    } catch (error) {
      console.warn("Could not re-heal 420IQ storage after recovery.", error);
    }
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
    publishStateToRelay();
  }

  function broadcastReset() {
    // Host-only: the show was cleared. Tell every display (same-browser and
    // networked) to return to the waiting screen, since broadcastState() sends
    // nothing once game is null.
    if (isDisplayAccess()) {
      return;
    }
    postSync({ type: "reset" });
    publishResetToRelay();
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

  function applyIncomingAnswer(message) {
    // Host-only: a contestant device chose an answer. Set it as the pending
    // selection so the host can lock it; the host stays authoritative.
    if (isDisplayAccess() || !game || typeof message.choiceIndex !== "number") {
      return;
    }

    // Ignore a stale tap from a previous question.
    if (message.questionIndex != null && message.questionIndex !== game.activeQuestionIndex) {
      return;
    }

    // Only while the answer is still open (not locked/revealed).
    const canSelect =
      (game.phase === "QUESTION_LIVE" || game.phase === "LIFELINE_ACTIVE") && !game.lockedAnswer;
    if (!canSelect || message.choiceIndex < 0) {
      return;
    }

    selectedChoiceIndex = message.choiceIndex;
    render();
    playCue("answerSelect");
  }

  function clearDisplayGame() {
    // Display-only: the host cleared the show — return to the waiting screen.
    if (!isDisplayAccess()) {
      return;
    }
    game = null;
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
    lastTickSecond = null;
    timeoutCuePlayed = false;
    render();
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

    if (message.type === "reset" && isDisplayAccess()) {
      clearDisplayGame();
      return;
    }

    if (message.type === "state" && isDisplayAccess()) {
      applyIncomingGame(message.game);
      return;
    }

    // A contestant device tapped an answer — surface it on the host console as a
    // pending selection. The host still sets confidence and commits the lock.
    if (message.type === "answer" && !isDisplayAccess()) {
      applyIncomingAnswer(message);
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
        const loaded = loadSavedGame();
        if (loaded) {
          applyIncomingGame(loaded);
        } else {
          clearDisplayGame();
        }
      }
    });

    if (isDisplayAccess()) {
      // Our initial localStorage read may be stale — ask the host to push now.
      postSync({ type: "request" });
    }
  }

  function publishStateToRelay() {
    // Host-only: mirror authoritative state to the LAN relay so a phone or a
    // second-device display on the network can follow the live show. No-op when
    // the app is served statically (no relay) — network sync stays disabled.
    if (!networkSyncEnabled || isDisplayAccess() || !game) {
      return;
    }

    try {
      fetch("/sync/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "state", game }),
        keepalive: true
      }).catch(() => {
        // Relay unreachable mid-show — same-browser BroadcastChannel still works.
      });
    } catch (error) {
      /* fetch unsupported or blocked; ignore */
    }
  }

  function publishAnswerToRelay(choiceIndex) {
    // Player-only: send the contestant's tapped choice back to the host over the
    // relay. Tagged with the question index so a stale tap can't apply later.
    if (!networkSyncEnabled || accessMode !== "player" || !game) {
      return;
    }

    try {
      fetch("/sync/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "answer",
          choiceIndex,
          questionIndex: game.activeQuestionIndex
        }),
        keepalive: true
      }).catch(() => {
        /* relay unreachable; local selection still shows on this device */
      });
    } catch (error) {
      /* fetch unsupported or blocked; ignore */
    }
  }

  function publishResetToRelay() {
    // Host-only: clear the relay's cached state so a phone reconnecting after a
    // reset gets the waiting screen, not the stale last question.
    if (!networkSyncEnabled || isDisplayAccess()) {
      return;
    }

    try {
      fetch("/sync/reset", { method: "POST", keepalive: true }).catch(() => {
        /* relay unreachable; same-browser reset still applied */
      });
    } catch (error) {
      /* fetch unsupported or blocked; ignore */
    }
  }

  function openRelayStateStream() {
    // Display-only: subscribe to the relay's SSE stream. The relay replays the
    // last cached state on connect, so a phone joining mid-show catches up.
    if (!("EventSource" in window)) {
      return;
    }

    try {
      const stream = new EventSource("/sync/subscribe");
      stream.addEventListener("message", event => {
        try {
          handleSyncMessage(JSON.parse(event.data));
        } catch (error) {
          /* malformed frame; ignore */
        }
      });
      // EventSource auto-reconnects; acceptable against a known-present relay.
    } catch (error) {
      /* ignore */
    }
  }

  function initNetworkSync() {
    // Cross-device sync only activates when served by the live relay. On static
    // hosting (GitHub Pages) or file://, /sync/health is absent, so this stays
    // off and the app runs local-first with no failing requests.
    if (!("fetch" in window)) {
      return;
    }

    fetch("/sync/health", { cache: "no-store" })
      .then(response => (response.ok ? response.json() : null))
      .then(info => {
        if (!info || !info.ok) {
          return;
        }
        networkSyncEnabled = true;
        // Opened via localhost? Adopt the relay's LAN address so the join QR
        // resolves to something a phone can reach — no manual IP entry. A host
        // the operator saved by hand always wins; not persisted, so it re-detects
        // if the network changes.
        if (info.host && !joinHostOverride && isLoopbackHost(location.hostname)) {
          joinHostOverride = info.host;
          renderPlayerJoinPanel();
        }
        // Everyone listens: displays receive state, the host receives answers.
        openRelayStateStream();
        if (!isDisplayAccess()) {
          // Host also pushes current state so phones already subscribed catch up.
          publishStateToRelay();
        }
      })
      .catch(() => {
        /* no relay; stay local-first */
      });
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

  function buildAccessUrl(access, hash) {
    const url = new URL(window.location.href);
    url.searchParams.set("access", access);
    url.searchParams.delete("role");
    url.hash = hash;
    return url;
  }

  function isLoopbackHost(hostname) {
    const host = String(hostname || "").toLowerCase();
    return (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host.startsWith("127.")
    );
  }

  function isWebProtocol(protocol) {
    return protocol === "http:" || protocol === "https:";
  }

  function normaliseJoinHost(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) {
      return "";
    }

    try {
      const parsed = new URL(/^https?:\/\//i.test(rawValue) ? rawValue : `http://${rawValue}`);
      return parsed.host;
    } catch (error) {
      return "";
    }
  }

  function readJoinHostOverride() {
    return normaliseJoinHost(localStorage.getItem(JOIN_HOST_KEY));
  }

  function buildPlayerJoinPathname(url) {
    if (url.protocol === "file:") {
      return "/";
    }

    const pathname = url.pathname || "/";
    if (pathname.endsWith("/index.html")) {
      return pathname.slice(0, -"index.html".length) || "/";
    }

    return pathname;
  }

  function buildPhoneReachableUrl(access, hash, hostOverride = joinHostOverride) {
    const url = buildAccessUrl(access, hash);
    const normalisedHost = normaliseJoinHost(hostOverride);

    if (normalisedHost) {
      const pathname = buildPlayerJoinPathname(url);
      const joinUrl = new URL(`http://${normalisedHost}${pathname}`);
      joinUrl.search = url.search;
      joinUrl.hash = url.hash;
      return joinUrl;
    }

    if (!isWebProtocol(url.protocol)) {
      return null;
    }

    if (isLoopbackHost(url.hostname)) {
      return null;
    }

    url.pathname = buildPlayerJoinPathname(url);
    return url;
  }

  function previewJoinHostInput() {
    const typedHost = normaliseJoinHost(dom.joinHostInput ? dom.joinHostInput.value : "");
    const playerUrl = buildPhoneReachableUrl("player", "#player", typedHost);

    if (dom.playerJoinLink) {
      dom.playerJoinLink.value = playerUrl ? playerUrl.href : "";
    }

    if (dom.joinHelp) {
      dom.joinHelp.textContent = playerUrl
        ? "QR preview uses the address shown below. Tap Use to remember it."
        : window.location.protocol === "file:"
          ? "This page is open from disk. Run npm start, then enter this computer's LAN IP and port."
          : "Enter this computer's LAN IP and port, then tap Use.";
    }

    renderPlayerJoinQr(playerUrl ? playerUrl.href : "");
  }

  function renderPlayerJoinPanel() {
    const playerUrl = buildPhoneReachableUrl("player", "#player");

    if (dom.joinHostInput) {
      dom.joinHostInput.value = normaliseJoinHost(joinHostOverride);
    }

    if (dom.joinHelp) {
      dom.joinHelp.textContent = playerUrl
        ? "QR uses the address shown below."
        : window.location.protocol === "file:"
          ? "This page is open from disk. Run npm start, then enter this computer's LAN IP and port."
          : "localhost only works on this computer. Enter this computer's LAN IP and port, then tap Use.";
    }

    if (!dom.playerJoinLink) {
      renderPlayerJoinQr(playerUrl ? playerUrl.href : "");
      return;
    }

    dom.playerJoinLink.value = playerUrl ? playerUrl.href : "";
    renderPlayerJoinQr(playerUrl ? playerUrl.href : "");
  }

  function applyJoinHostOverride() {
    const normalisedHost = normaliseJoinHost(dom.joinHostInput ? dom.joinHostInput.value : "");

    if (!normalisedHost) {
      joinHostOverride = "";
      localStorage.removeItem(JOIN_HOST_KEY);
      renderPlayerJoinPanel();
      showToast("Enter an IP address and port the phone can reach.");
      return;
    }

    joinHostOverride = normalisedHost;
    localStorage.setItem(JOIN_HOST_KEY, normalisedHost);
    renderPlayerJoinPanel();
    showToast("Player QR updated.");
  }

  async function copyLinkValue(targetId) {
    const input = document.getElementById(targetId);
    if (!input || !input.value) {
      showToast("No link to copy yet.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(input.value);
      } else {
        input.select();
        document.execCommand("copy");
        input.blur();
      }
      showToast("Player link copied.");
    } catch (error) {
      input.select();
      showToast("Link selected. Copy it from the field.");
    }
  }

  function renderPlayerJoinQr(playerUrl) {
    const canvas = dom.playerJoinQr;
    if (!canvas) {
      return;
    }

    try {
      if (!playerUrl) {
        drawQrPlaceholder(canvas, "LAN URL");
        return;
      }

      const matrix = createQrCodeMatrix(playerUrl);
      drawQrMatrix(canvas, matrix);
    } catch (error) {
      drawQrPlaceholder(canvas, "Copy link");
    }
  }

  function drawQrPlaceholder(canvas, label) {
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const size = canvas.width;
    context.fillStyle = "#10111b";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "rgba(65, 255, 242, 0.5)";
    context.lineWidth = 2;
    context.strokeRect(9, 9, size - 18, size - 18);
    context.fillStyle = "#c6fff9";
    context.font = "800 15px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, size / 2, size / 2);
  }

  function drawQrMatrix(canvas, matrix) {
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const moduleCount = matrix.length;
    const quietZone = 4;
    const cellSize = Math.floor(canvas.width / (moduleCount + quietZone * 2));
    const qrSize = cellSize * (moduleCount + quietZone * 2);
    const offset = Math.floor((canvas.width - qrSize) / 2);

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#10111b";

    matrix.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (!dark) {
          return;
        }

        context.fillRect(
          offset + (x + quietZone) * cellSize,
          offset + (y + quietZone) * cellSize,
          cellSize,
          cellSize
        );
      });
    });
  }

  function utf8Bytes(value) {
    if ("TextEncoder" in window) {
      return Array.from(new TextEncoder().encode(value));
    }

    return Array.from(unescape(encodeURIComponent(value))).map(character => character.charCodeAt(0));
  }

  function createQrCodeMatrix(value) {
    const version = QR_VERSION;
    const size = version * 4 + 17;
    const bytes = utf8Bytes(String(value));

    if (bytes.length > QR_MAX_BYTE_LENGTH) {
      throw new Error("Player link is too long for the local QR generator.");
    }

    const modules = Array.from({ length: size }, () => Array(size).fill(false));
    const functions = Array.from({ length: size }, () => Array(size).fill(false));

    function setModule(x, y, dark, isFunction = false) {
      if (x < 0 || y < 0 || x >= size || y >= size) {
        return;
      }

      modules[y][x] = dark === true;
      if (isFunction) {
        functions[y][x] = true;
      }
    }

    function setFunctionModule(x, y, dark) {
      setModule(x, y, dark, true);
    }

    function drawFinderPattern(centerX, centerY) {
      for (let y = -4; y <= 4; y += 1) {
        for (let x = -4; x <= 4; x += 1) {
          const distance = Math.max(Math.abs(x), Math.abs(y));
          const dark = distance !== 2 && distance <= 3;
          setFunctionModule(centerX + x, centerY + y, dark);
        }
      }
    }

    function drawAlignmentPattern(centerX, centerY) {
      for (let y = -2; y <= 2; y += 1) {
        for (let x = -2; x <= 2; x += 1) {
          const distance = Math.max(Math.abs(x), Math.abs(y));
          setFunctionModule(centerX + x, centerY + y, distance !== 1);
        }
      }
    }

    function drawFunctionPatterns(maskPattern) {
      drawFinderPattern(3, 3);
      drawFinderPattern(size - 4, 3);
      drawFinderPattern(3, size - 4);

      QR_ALIGNMENT_POSITIONS.forEach(y => {
        QR_ALIGNMENT_POSITIONS.forEach(x => {
          if (!functions[y][x]) {
            drawAlignmentPattern(x, y);
          }
        });
      });

      for (let i = 8; i < size - 8; i += 1) {
        const dark = i % 2 === 0;
        setFunctionModule(6, i, dark);
        setFunctionModule(i, 6, dark);
      }

      drawFormatBits(maskPattern);
      drawVersionBits(version);
    }

    function getBit(valueToRead, bitIndex) {
      return ((valueToRead >>> bitIndex) & 1) !== 0;
    }

    function drawFormatBits(maskPattern) {
      const errorCorrectionBits = 1;
      const data = (errorCorrectionBits << 3) | maskPattern;
      let remainder = data;
      for (let i = 0; i < 10; i += 1) {
        remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
      }
      const bits = ((data << 10) | remainder) ^ 0x5412;

      for (let i = 0; i <= 5; i += 1) setFunctionModule(8, i, getBit(bits, i));
      setFunctionModule(8, 7, getBit(bits, 6));
      setFunctionModule(8, 8, getBit(bits, 7));
      setFunctionModule(7, 8, getBit(bits, 8));
      for (let i = 9; i < 15; i += 1) setFunctionModule(14 - i, 8, getBit(bits, i));

      for (let i = 0; i < 8; i += 1) setFunctionModule(size - 1 - i, 8, getBit(bits, i));
      for (let i = 8; i < 15; i += 1) setFunctionModule(8, size - 15 + i, getBit(bits, i));
      setFunctionModule(8, size - 8, true);
    }

    function drawVersionBits(versionNumber) {
      if (versionNumber < 7) {
        return;
      }

      let remainder = versionNumber;
      for (let i = 0; i < 12; i += 1) {
        remainder = (remainder << 1) ^ (((remainder >>> 11) & 1) * 0x1f25);
      }
      const bits = (versionNumber << 12) | remainder;

      for (let i = 0; i < 18; i += 1) {
        const bit = getBit(bits, i);
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunctionModule(a, b, bit);
        setFunctionModule(b, a, bit);
      }
    }

    const maskPattern = 2;
    drawFunctionPatterns(maskPattern);
    const codewords = createQrCodewords(bytes);
    let bitIndex = 0;

    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) {
        right -= 1;
      }

      for (let vertical = 0; vertical < size; vertical += 1) {
        const upward = ((size - 1 - right) & 2) === 0;
        const y = upward ? size - 1 - vertical : vertical;

        for (let column = 0; column < 2; column += 1) {
          const x = right - column;
          if (functions[y][x]) {
            continue;
          }

          const dark = bitIndex < codewords.length * 8
            ? getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7))
            : false;
          const masked = dark !== (x % 3 === 0);
          setModule(x, y, masked, false);
          bitIndex += 1;
        }
      }
    }

    drawFormatBits(maskPattern);
    return modules;
  }

  function createQrCodewords(dataBytes) {
    const bits = [];
    const appendBits = (value, length) => {
      for (let i = length - 1; i >= 0; i -= 1) {
        bits.push((value >>> i) & 1);
      }
    };

    appendBits(0x4, 4);
    appendBits(dataBytes.length, QR_BYTE_COUNT_BITS);
    dataBytes.forEach(byte => appendBits(byte, 8));

    const capacityBits = QR_DATA_CODEWORD_COUNT * 8;
    for (let i = 0; i < 4 && bits.length < capacityBits; i += 1) {
      bits.push(0);
    }
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    const dataCodewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let codeword = 0;
      for (let j = 0; j < 8; j += 1) {
        codeword = (codeword << 1) | bits[i + j];
      }
      dataCodewords.push(codeword);
    }

    for (let padByte = 0xec; dataCodewords.length < QR_DATA_CODEWORD_COUNT; padByte ^= 0xfd) {
      dataCodewords.push(padByte);
    }

    return appendQrErrorCorrection(dataCodewords);
  }

  function appendQrErrorCorrection(dataCodewords) {
    const divisor = reedSolomonDivisor(QR_ERROR_CORRECTION_CODEWORDS);
    return dataCodewords.concat(reedSolomonRemainder(dataCodewords, divisor));
  }

  function reedSolomonDivisor(degree) {
    const result = Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;

    for (let i = 0; i < degree; i += 1) {
      for (let j = 0; j < result.length; j += 1) {
        result[j] = gfMultiply(result[j], root);
        if (j + 1 < result.length) {
          result[j] ^= result[j + 1];
        }
      }
      root = gfMultiply(root, 0x02);
    }

    return result;
  }

  function reedSolomonRemainder(data, divisor) {
    const result = Array(divisor.length).fill(0);

    data.forEach(byte => {
      const factor = byte ^ result.shift();
      result.push(0);
      divisor.forEach((coefficient, index) => {
        result[index] ^= gfMultiply(coefficient, factor);
      });
    });

    return result;
  }

  function gfMultiply(left, right) {
    let x = left;
    let y = right;
    let result = 0;

    for (let i = 0; i < 8; i += 1) {
      if ((y & 1) !== 0) {
        result ^= x;
      }
      const carry = (x & 0x80) !== 0;
      x = (x << 1) & 0xff;
      if (carry) {
        x ^= 0x1d;
      }
      y >>>= 1;
    }

    return result;
  }

  function popoutStage() {
    const stageUrl = buildAccessUrl("stage", "#stage").href;
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
    // Neutral start: no question is presented until the host picks a category.
    awaitingCategoryStart = true;

    saveGame();
    render();
    playCue("ui");
    showToast("Session created. Choose a category to open the show.");
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_BACKUP_KEY);
    game = null;
    history = [];
    awaitingCategoryStart = false;
    selectedChoiceIndex = null;
    selectedSignalIndex = null;
    broadcastReset();
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

  function questionRevealedToDisplays() {
    // Keep the question stem and answer choices off the contestant and broadcast
    // displays until the host sends the question live. Pre-live phases (and the
    // 420 Decision selection) show a standby hold instead of leaking the loaded
    // question during category selection or the intro.
    if (!game) return false;
    return !["PRE_SHOW", "INTRO", "QUESTION_READY", "FINAL"].includes(game.phase);
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
    if (!game) return dom.finalCategorySelect.value || NO_CATEGORY_SELECTED;
    if (game.finalDecision && FINAL_CATEGORY_OPTIONS.includes(game.finalDecision.category)) {
      return game.finalDecision.category;
    }
    return dom.finalCategorySelect.value || NO_CATEGORY_SELECTED;
  }

  function syncFinalCategoryOptions(preferredCategory = null) {
    if (!game) return;

    const selectedCategory = preferredCategory !== null
      ? preferredCategory
      : game.finalDecision && FINAL_CATEGORY_OPTIONS.includes(game.finalDecision.category)
      ? game.finalDecision.category
      : dom.finalCategorySelect.value || NO_CATEGORY_SELECTED;
    const finalCategory = FINAL_CATEGORY_OPTIONS.includes(selectedCategory)
      ? selectedCategory
      : NO_CATEGORY_SELECTED;

    dom.finalCategorySelect.innerHTML = [`<option value="${NO_CATEGORY_SELECTED}">Choose category</option>`]
      .concat(FINAL_CATEGORY_OPTIONS
      .map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
      )
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
    if (category === NO_CATEGORY_SELECTED) {
      syncFinalCategoryOptions(NO_CATEGORY_SELECTED);
      return;
    }

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
      awaitingCategoryStart = false;
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
    renderCategoryStart();
    renderStage();
    renderPlayer();
    renderPlayerJoinPanel();
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
      guaranteedFloor: game.guaranteedFloor || 0,
      outcome: game.outcome || null,
      player: game.participant.displayName,
      byDifficulty,
      lifelines: {
        trustedCircle: game.lifelines.trustedCircle.used,
        sourceSignal: game.lifelines.sourceSignal.used,
        fiftyFifty: game.lifelines.fiftyFifty.used
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

    const walkedAway = recap.outcome && recap.outcome.type === "walkAway";

    dom.recapPanel.innerHTML = `
      <div class="recap-head">
        <div class="section-kicker">${walkedAway ? "Walked away" : "Show complete"}</div>
        <h2 id="recapTitle">${escapeHtml(recap.player)}</h2>
        <div class="recap-final"><strong>${recap.finalScore.toLocaleString()}</strong><span>IQ</span></div>
        ${walkedAway ? `<p class="recap-walkaway">Banked ${recap.outcome.bankedScore.toLocaleString()} IQ and walked away.</p>` : ""}
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
          <p>50:50: ${recap.lifelines.fiftyFifty ? "used" : "unused"}</p>
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

    const walkedAway = recap.outcome && recap.outcome.type === "walkAway";

    dom.stageRecap.innerHTML = `
      <div class="section-kicker">${walkedAway ? "Walked away" : "Show complete"}</div>
      <div class="stage-recap-score">
        <span>${escapeHtml(recap.player)}</span>
        <strong>${recap.finalScore.toLocaleString()} IQ</strong>
      </div>
      <div class="stage-recap-accuracy">${recap.correct} / ${recap.total} correct · ${recap.accuracy}%</div>
      <div class="stage-recap-chips">${chips}</div>
    `;
  }

  function renderCategoryStart() {
    const active = Boolean(game && awaitingCategoryStart);

    if (dom.runPanel) {
      dom.runPanel.dataset.phase = active ? "category" : "";
    }
    if (dom.categoryPicker) {
      dom.categoryPicker.hidden = !active;
    }

    if (!active || !dom.categoryGrid) {
      return;
    }

    dom.categoryGrid.innerHTML = "";
    FINAL_CATEGORY_OPTIONS.forEach(category => {
      const available = chooseQuestionForCategory(category) >= 0;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-option";
      button.disabled = !available;
      button.textContent = category;
      button.addEventListener("click", () => chooseStartCategory(category));
      dom.categoryGrid.appendChild(button);
    });
  }

  function chooseStartCategory(category) {
    if (!game) {
      return;
    }

    const categoryQuestionIndex = chooseQuestionForCategory(category);
    if (categoryQuestionIndex < 0) {
      showToast(`No regular ${category} question is available in this pack.`);
      return;
    }

    game.activeQuestionIndex = categoryQuestionIndex;
    resetQuestionAttemptState();
    awaitingCategoryStart = false;
    saveGame();
    render();
    playCue("ui");
    showToast(`${category} loaded. Open with the intro.`);
  }

  function startWithBalancedOrder() {
    if (!game) {
      return;
    }

    awaitingCategoryStart = false;
    saveGame();
    render();
    playCue("ui");
    showToast("Balanced pack order — first question loaded.");
  }

  function renderHost() {
    if (!game) {
      dom.phaseLabel.textContent = "NO SESSION";
      dom.scoreValue.textContent = "0";
      dom.guaranteedValue.textContent = "0";
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
    dom.guaranteedValue.textContent = (game.guaranteedFloor || 0).toLocaleString();
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
    const eliminated = (publicQuestion && publicQuestion.fiftyFiftyRemoved) || [];

    publicQuestion.choices.forEach((choice, index) => {
      const isEliminated = !reveal && eliminated.includes(index);
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.dataset.choiceIndex = String(index);
      button.disabled = !canSelect || isEliminated;

      if (isEliminated) {
        button.classList.add("eliminated");
      }

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
        if (!canSelect || isEliminated) return;
        selectedChoiceIndex = index;
        render();
        playCue("answerSelect");
        publishAnswerToRelay(index);
      });

      container.appendChild(button);
    });
  }

  function renderStaticChoices(container, publicQuestion, className) {
    container.innerHTML = "";
    const lockedChoice = game && game.lockedAnswer ? game.lockedAnswer.choiceIndex : null;
    const reveal = game ? game.reveal : null;
    const eliminated = (publicQuestion && publicQuestion.fiftyFiftyRemoved) || [];

    publicQuestion.choices.forEach((choice, index) => {
      const row = document.createElement("div");
      row.className = className;

      if (!reveal && eliminated.includes(index)) {
        row.classList.add("eliminated");
      }

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
    dom.fiftyButton.disabled = !(game && phase === "QUESTION_LIVE" && !game.lifelines.fiftyFifty.used);
    dom.lockButton.disabled = !(game && (phase === "QUESTION_LIVE" || phase === "LIFELINE_ACTIVE") && selectedChoiceIndex !== null && !game.lockedAnswer);
    dom.revealButton.disabled = !can("REVEAL");
    dom.dropButton.disabled = !(game && phase === "REVEAL" && IQ.currentQuestion(game).knowledgeDrop);
    dom.commitButton.disabled = !(game && (phase === "REVEAL" || phase === "KNOWLEDGE_DROP"));
    dom.nextButton.disabled = !(game && phase === "SCORE_COMMITTED" && !nextQuestionIsFinal() && !currentQuestionIsFinal());
    // Bank a safe-haven floor whenever there's more score than is already guaranteed.
    dom.guaranteeButton.disabled = !(game && phase !== "PRE_SHOW" && phase !== "COMPLETE"
      && (game.scores[game.participant.id] || 0) > (game.guaranteedFloor || 0));
    // Walk away (bank and end) only between questions, matching the engine guard.
    dom.walkAwayButton.disabled = !(game && ["SCORE_COMMITTED", "NEXT_QUESTION", "FINAL"].includes(phase));
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

    const revealed = questionRevealedToDisplays();

    dom.stagePhase.textContent = game ? game.phase : "PRE_SHOW";
    dom.stageDifficulty.innerHTML = revealed && publicQuestion ? difficultyChip(publicQuestion.difficulty) : "420IQ";
    dom.stagePlayer.textContent = game ? game.participant.displayName : "Contestant";
    dom.stageScore.textContent = `${score.toLocaleString()} IQ`;
    dom.stageQuestion.textContent = revealed && publicQuestion
      ? publicQuestion.stem
      : game
        ? "Standby — the host is preparing the question."
        : "Create a session to load the first question.";
    dom.stageCue.textContent = game ? PHASE_CUES[game.phase] : "YouTube master display";
    dom.stageChecksum.textContent = game ? game.pack.checksum : "pack pending";
    dom.stageRing.style.setProperty("--ring-progress", `${progressDegrees}deg`);
    dom.stageRing.classList.toggle("locked", game && game.phase === "ANSWER_LOCKED");
    renderVerticalPreview(revealed ? publicQuestion : null, score, progressDegrees);

    if (revealed && publicQuestion) {
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

    const eliminated = publicQuestion.fiftyFiftyRemoved || [];

    publicQuestion.choices.slice(0, 4).forEach((choice, index) => {
      const isEliminated = !reveal && eliminated.includes(index);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "phone-choice";
      button.dataset.choiceIndex = String(index);
      button.disabled = !canSelect || isEliminated;
      button.setAttribute("aria-pressed", String(visibleSelection === index && !reveal));

      if (isEliminated) {
        button.classList.add("eliminated");
      }

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
        if (!canSelect || isEliminated) return;
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
      dom.playerQuestion.textContent = "";
      dom.playerPrompt.textContent = "Waiting for the host.";
      dom.playerChoices.innerHTML = "";
      dom.teamModeText.textContent = "Single player mode is ready.";
      dom.lifelineState.innerHTML = "";
      return;
    }

    const publicQuestion = IQ.getPublicQuestion(game);
    const revealed = questionRevealedToDisplays();
    const members = game.participant.members.map(member => member.name).join(" and ");

    dom.playerModeLabel.textContent = game.mode === "couple" ? "Couple contestant display" : "Single contestant display";
    dom.playerName.textContent = game.participant.displayName;
    dom.playerQuestion.textContent = revealed && publicQuestion ? publicQuestion.stem : "";
    dom.playerPrompt.textContent = game.phase === "QUESTION_LIVE"
      ? "Choose one answer and let the host lock it."
      : PHASE_CUES[game.phase];
    dom.teamModeText.textContent = game.mode === "couple"
      ? `${members} play as one team. Their answer is locked as a shared decision.`
      : `${members} plays solo against the 420IQ lane.`;

    if (revealed && publicQuestion) {
      renderChoiceButtons(dom.playerChoices, publicQuestion, "player-choice");
    } else {
      dom.playerChoices.innerHTML = "";
    }
    renderLifelineState();
  }

  function renderLifelineState() {
    dom.lifelineState.innerHTML = "";
    [
      ["Trusted Circle", game.lifelines.trustedCircle.used],
      ["Source Signal", game.lifelines.sourceSignal.used],
      ["50:50", game.lifelines.fiftyFifty.used]
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
      broadcastReset();
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

  dom.copyLinkButtons.forEach(button => {
    button.addEventListener("click", () => copyLinkValue(button.dataset.copyTarget));
  });

  if (dom.applyJoinHostButton) {
    dom.applyJoinHostButton.addEventListener("click", applyJoinHostOverride);
  }
  if (dom.joinHostInput) {
    dom.joinHostInput.addEventListener("input", previewJoinHostInput);
    dom.joinHostInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyJoinHostOverride();
      }
    });
  }

  dom.startGameButton.addEventListener("click", createShowSession);
  if (dom.balancedStartButton) {
    dom.balancedStartButton.addEventListener("click", startWithBalancedOrder);
  }
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

  dom.fiftyButton.addEventListener("click", () => perform(() => {
    game = IQ.useFiftyFifty(game, "producer");
    const removed = game.lifelines.fiftyFifty.removed || [];
    if (removed.includes(selectedChoiceIndex)) {
      selectedChoiceIndex = null;
    }
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

  dom.guaranteeButton.addEventListener("click", () => perform(() => {
    game = IQ.bankGuarantee(game, "producer");
    showToast(`Guaranteed floor banked at ${(game.guaranteedFloor || 0).toLocaleString()} IQ.`);
    playCue("ui");
  }));

  dom.walkAwayButton.addEventListener("click", () => perform(() => {
    game = IQ.walkAway(game, "producer");
    showToast(`Walked away with ${(game.outcome.bankedScore || 0).toLocaleString()} IQ.`);
    playCue("ui");
  }));

  dom.decisionButton.addEventListener("click", () => perform(() => {
    const finalCategory = selectedCategoryForRender();
    if (finalCategory === NO_CATEGORY_SELECTED) {
      syncFinalCategoryOptions(NO_CATEGORY_SELECTED);
      dom.finalCategorySelect.focus();
      throw new Error("Choose a final category before the 420 Decision.");
    }

    game = IQ.startFinalDecision(game, {
      riskBand: selectedRisk,
      category: finalCategory
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
    const eliminated = (question && question.fiftyFiftyRemoved) || [];
    if (index >= 0 && index < question.choices.length && !game.lockedAnswer && !eliminated.includes(index)) {
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
  initNetworkSync();
  initAgeGate();
  window.setInterval(updateTimerDisplays, 250);
  // Heal storage on load: if the session was recovered from the mirror key
  // (a torn or cleared primary write), re-persist to both keys immediately.
  if (game) {
    saveGame();
  }
  render();
})();
