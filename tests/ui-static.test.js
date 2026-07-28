const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

function readProjectFile(fileName) {
  return fs.readFileSync(path.join(projectRoot, fileName), "utf8");
}

test("audit public preview renders as a safe display card instead of raw JSON code", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");

  assert.match(html, /id="publicPayloadCard"/);
  assert.doesNotMatch(html, /<pre\s+id="publicPayload"/);
  assert.match(app, /function renderPublicPayloadCard/);
  assert.doesNotMatch(app, /publicPayload\.textContent\s*=\s*JSON\.stringify/);
});

test("app shell exposes the polished premium mobile theme hooks", () => {
  const html = readProjectFile("index.html");
  const css = readProjectFile("styles.css");

  assert.match(html, /data-theme="premium-mobile"/);
  assert.match(css, /--electric-blue:\s*#2563ff/i);
  assert.match(css, /--neon-pink:\s*#e44cff/i);
  assert.match(css, /--radius-xl:\s*28px/i);
  assert.match(css, /body::before/);
  assert.match(css, /\.answer-choice::after/);
});

test("mobile SFX unlocks WebAudio from user gestures before scheduling cues", () => {
  const app = readProjectFile("app.js");

  assert.match(app, /async function unlockAudioContext/);
  assert.match(app, /function primeMobileAudio/);
  assert.match(app, /await audioContext\.resume\(\)/);
  assert.match(app, /document\.addEventListener\("pointerdown", unlockAudioFromGesture/);
  assert.match(app, /document\.addEventListener\("touchstart", unlockAudioFromGesture/);
  assert.match(app, /document\.addEventListener\("keydown", unlockAudioFromGesture/);
  assert.match(app, /const context = await unlockAudioContext\(\)/);
});

test("SFX control arms mobile audio before it can be toggled off", () => {
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(app, /function isAudioReadyForPlayback\(\)/);
  assert.match(app, /function readInitialSoundEnabled\(\)/);
  assert.match(app, /params\.get\("sfx"\)/);
  assert.match(app, /let pendingCueType = null/);
  assert.match(app, /dom\.soundToggle\.textContent = needsArm \? "ARM" : soundEnabled \? "SFX" : "OFF"/);
  assert.match(app, /dom\.soundToggle\.classList\.toggle\("needs-arm", needsArm\)/);
  assert.match(app, /async function playCue\(type\)[\s\S]*return false;[\s\S]*return true;/);
  assert.match(app, /dom\.soundToggle\.addEventListener\("click", async \(\) => \{[\s\S]*if \(soundEnabled && !isAudioReadyForPlayback\(\)\)[\s\S]*await playCue\(pendingCueType \|\| "ui"\)[\s\S]*return;/);
  assert.match(css, /\.icon-action\.needs-arm/);
});

test("display windows play SFX when host reveal and segment states sync in", () => {
  const app = readProjectFile("app.js");

  assert.match(app, /function playIncomingGameCue\(previousGame, incomingGame\)/);
  assert.match(app, /incomingGame\.phase === "REVEAL"[\s\S]*incomingGame\.reveal\.audioCue/);
  assert.match(app, /playCue\(incomingGame\.reveal\.audioCue\)/);
  assert.match(app, /incomingGame\.phase === "SCORE_COMMITTED"[\s\S]*incomingGame\.segmentOutro\.audioCue/);
  assert.match(app, /playCue\(incomingGame\.segmentOutro\.audioCue\)/);
  assert.match(app, /const previousGame = game \? cloneState\(game\) : null[\s\S]*playIncomingGameCue\(previousGame, game\)/);
});

test("9:16 preview mirrors active show state with high-contrast ring text", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(html, /id="verticalPhase"/);
  assert.match(html, /id="verticalTimer"/);
  assert.match(html, /id="verticalScore"/);
  assert.match(html, /id="verticalCue"/);
  assert.match(app, /function renderVerticalPreview/);
  assert.match(app, /phone-choice/);
  assert.match(app, /dom\.verticalPhase\.textContent/);
  assert.match(css, /--contrast-text:\s*#ffffff/i);
  assert.match(css, /\.phone-choice\.correct/);
  assert.match(css, /\.stage-ring span,\s*\n\.stage-ring strong/);
});

test("player answer selection triggers SFX feedback", () => {
  const app = readProjectFile("app.js");

  assert.match(app, /answerSelect:\s*\[/);
  assert.match(app, /function renderChoiceButtons[\s\S]*selectedChoiceIndex = index;[\s\S]*render\(\);[\s\S]*playCue\("answerSelect"\);/);
  assert.match(app, /document\.addEventListener\("keydown"[\s\S]*selectedChoiceIndex = index;[\s\S]*render\(\);[\s\S]*playCue\("answerSelect"\);/);
});

test("premium spacing tokens align stage, timer and 9:16 surfaces", () => {
  const css = readProjectFile("styles.css");

  assert.match(css, /--space-panel:\s*clamp\(18px,\s*1\.7vw,\s*28px\)/);
  assert.match(css, /--space-stage:\s*clamp\(24px,\s*2\.2vw,\s*36px\)/);
  assert.match(css, /--space-control-y:\s*12px/);
  assert.match(css, /\.stage-frame\s*\{[\s\S]*padding:\s*var\(--space-stage\)/);
  assert.match(css, /\.phone-frame\s*\{[\s\S]*padding:\s*var\(--space-panel\)/);
  assert.match(css, /\.stage-timer\s*\{[\s\S]*padding:\s*var\(--space-control-y\)\s*var\(--space-control-x\)/);
  assert.match(css, /\.phone-choice\s*\{[\s\S]*padding:\s*var\(--space-control-y\)\s*var\(--space-control-x\)/);
  assert.match(css, /\.phone-cue\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
});

test("stage footer stays in the 16:9 layout flow instead of overlapping answers", () => {
  const css = readProjectFile("styles.css");

  assert.match(css, /\.stage-frame\s*\{[\s\S]*display:\s*grid/);
  assert.match(css, /\.stage-frame\s*\{[\s\S]*grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)\s+auto\s+auto/);
  assert.match(css, /\.stage-footer\s*\{[\s\S]*position:\s*static/);
});

test("mobile stage surface stacks without preserving a cramped 16:9 height", () => {
  const css = readProjectFile("styles.css");

  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*\.stage-frame\s*\{[\s\S]*aspect-ratio:\s*auto/);
  assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*\.stage-frame\s*\{[\s\S]*min-height:\s*680px/);
});

test("premium player screen uses roomy typography and balanced side-card padding", () => {
  const css = readProjectFile("styles.css");

  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-layout\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(300px,\s*360px\)/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-main\s*\{[\s\S]*padding:\s*clamp\(28px,\s*2\.7vw,\s*44px\)/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-main h2\s*\{[\s\S]*font-size:\s*clamp\(42px,\s*4\.4vw,\s*60px\)[\s\S]*line-height:\s*1\.18[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-main p\s*\{[\s\S]*max-width:\s*780px[\s\S]*font-size:\s*clamp\(17px,\s*1\.35vw,\s*21px\)/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-choice\s*\{[\s\S]*min-height:\s*clamp\(58px,\s*5\.2vw,\s*66px\)[\s\S]*padding:\s*14px\s+18px[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-side \.status-panel\s*\{[\s\S]*padding:\s*clamp\(24px,\s*2\.2vw,\s*36px\)/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-side \.status-panel p\s*\{[\s\S]*line-height:\s*1\.55/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.player-timer\s*\{[\s\S]*min-height:\s*110px[\s\S]*display:\s*grid[\s\S]*padding:\s*22px\s+var\(--space-control-x\)/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.lifeline-state\s*\{[\s\S]*gap:\s*12px/);
  assert.match(css, /\[data-theme="premium-mobile"\]\s+\.state-pill\s*\{[\s\S]*min-height:\s*54px/);
});

test("demo bank exposes fourteen questions with sports and music categories", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");

  const demoQuestionIds = app.match(/id:\s*"demo-/g) ?? [];

  assert.equal(demoQuestionIds.length, 14);
  assert.match(app, /domain:\s*"Sports & Performance"/);
  assert.match(app, /domain:\s*"Music & Pop Culture"/);
  assert.match(html, /<option>Sports & Performance<\/option>/);
  assert.match(html, /<option>Music & Pop Culture<\/option>/);
});

test("420 Decision panel only appears when final selection is contextually valid", () => {
  const app = readProjectFile("app.js");

  assert.match(app, /const FINAL_CATEGORY_OPTIONS = \[/);
  assert.match(app, /function shouldShowFinalDecisionPanel\(\)/);
  assert.match(app, /game\.phase === "SCORE_COMMITTED" && nextQuestionIsFinal\(\)/);
  assert.match(app, /Boolean\(game\.finalDecision\) && currentQuestionIsFinal\(\)/);
  assert.match(app, /function syncFinalCategoryOptions\(preferredCategory = null\)/);
  assert.match(app, /FINAL_CATEGORY_OPTIONS\s*\n\s*\.map\(category =>/);
  assert.doesNotMatch(app, /game\.pack\.sequence\s*\n\s*\.filter\(question => question\.final\)/);
  assert.match(app, /dom\.finalPanel\.hidden = !shouldShowFinalDecisionPanel\(\)/);
  assert.doesNotMatch(app, /dom\.finalPanel\.hidden = !\(game\.phase === "FINAL" \|\| nextQuestionIsFinal\(\)\)/);
});

test("420 Decision category selection routes the active regular question", () => {
  const app = readProjectFile("app.js");

  assert.match(app, /function selectedCategoryForRender\(\)/);
  assert.match(app, /dom\.finalCategorySelect\.value \|\| NO_CATEGORY_SELECTED/);
  assert.match(app, /function chooseQuestionForCategory\(category\)/);
  assert.match(app, /question\.domain === category && !question\.final/);
  assert.match(app, /function resetQuestionAttemptState\(\)/);
  assert.match(app, /const categoryQuestionIndex = chooseQuestionForCategory\(category\)/);
  assert.match(app, /game\.activeQuestionIndex = categoryQuestionIndex/);
  assert.match(app, /dom\.finalCategorySelect\.addEventListener\("change", \(\) =>/);
  assert.match(app, /applySelectedCategory\(dom\.finalCategorySelect\.value\)/);
});

test("420 Decision controls expose clear category and IQ target structure", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(html, /Choose a category and IQ target before opening the final question\./);
  assert.match(app, /FINAL: "The 420 Decision is active\. Choose the IQ target and category, then open the final question\."/);
  assert.match(app, /const NO_CATEGORY_SELECTED = ""/);
  assert.match(html, /<option value="">Choose category<\/option>/);
  assert.match(app, /if \(category === NO_CATEGORY_SELECTED\)/);
  assert.match(html, /<div class="final-field">[\s\S]*<span class="control-label" id="finalCategoryLabel">Final category<\/span>[\s\S]*<select id="finalCategorySelect"/);
  assert.match(html, /<div class="final-field final-risk-field">[\s\S]*<span class="control-label" id="riskBandLabel">IQ target<\/span>/);
  assert.match(html, /class="segmented compact final-risk-buttons"/);
  assert.match(html, /data-risk="Hold"[\s\S]*<span>Hold<\/span>[\s\S]*<strong>250 IQ<\/strong>/);
  assert.match(html, /data-risk="Rise"[\s\S]*<span>Rise<\/span>[\s\S]*<strong>500 IQ<\/strong>/);
  assert.match(html, /data-risk="Reach"[\s\S]*<span>Reach<\/span>[\s\S]*<strong>1,000 IQ<\/strong>/);
  assert.match(css, /\.final-controls\s*\{[\s\S]*display:\s*grid[\s\S]*width:\s*min\(100%,\s*640px\)/);
  assert.match(css, /\.final-risk-buttons\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.final-risk-buttons \.segment strong\s*\{[\s\S]*font-size:\s*clamp\(17px,\s*1\.5vw,\s*22px\)/);
});

test("host side panel restores a static scan-to-join player card", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(html, /id="joinPanel"/);
  assert.match(html, /Scan QR to join/);
  assert.match(html, /id="playerJoinQr"/);
  assert.match(html, /id="playerJoinLink"/);
  assert.match(html, /data-copy-target="playerJoinLink"/);
  assert.match(app, /playerJoinQr: document\.getElementById\("playerJoinQr"\)/);
  assert.match(app, /function buildAccessUrl\(access, hash\)/);
  assert.match(app, /function renderPlayerJoinPanel\(\)/);
  assert.match(app, /function renderPlayerJoinQr\(playerUrl\)/);
  assert.match(app, /function createQrCodeMatrix\(value\)/);
  assert.match(app, /function reedSolomonRemainder\(data, divisor\)/);
  assert.match(app, /dom\.copyLinkButtons\.forEach/);
  assert.doesNotMatch(app, /fetch\("\.\/api\/sessions"/);
  assert.doesNotMatch(app, /new EventSource\(/);
  assert.match(css, /\.join-panel/);
  assert.match(css, /\.join-qr-card/);
  assert.match(css, /\.join-link-row/);
});

test("player QR avoids localhost links that fail on phones", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(html, /id="joinHostInput"/);
  assert.match(html, /id="applyJoinHostButton"/);
  assert.match(html, /id="joinHelp"/);
  assert.match(app, /const JOIN_HOST_KEY = "420iqJoinHostV1"/);
  assert.match(app, /function isLoopbackHost\(hostname\)/);
  assert.match(app, /function buildPhoneReachableUrl\(access, hash\)/);
  assert.match(app, /drawQrPlaceholder\(canvas, "LAN URL"\)/);
  assert.match(app, /localStorage\.setItem\(JOIN_HOST_KEY, normalisedHost\)/);
  assert.match(css, /\.join-help/);
});

test("html carries an early player access bootstrap and current cache token", () => {
  const html = readProjectFile("index.html");

  assert.match(html, /<body data-theme="premium-mobile" data-access="admin">/);
  assert.match(html, /function bootstrapPlayerAccess\(\)/);
  assert.match(html, /document\.body\.dataset\.access = "player"/);
  assert.match(html, /window\.history\.replaceState\(null, "", playerUrl\)/);
  assert.match(html, /<script src="\.\/engine\.js\?v=420iq28"><\/script>/);
  assert.match(html, /<script src="\.\/app\.js\?v=420iq28"><\/script>/);
});

test("host-only undo reverts the last step via a compensating engine event", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");

  assert.match(html, /id="undoButton"/);
  assert.match(app, /const snapshot = game \? cloneState\(game\) : null/);
  assert.match(app, /function pushHistory\(/);
  assert.match(app, /function undoLastAction\(\)/);
  assert.match(app, /game = IQ\.rewind\(game, snapshot, "producer"\)/);
  assert.match(app, /\[dom\.undoButton, dom\.backupButton\]\.forEach/);
});

test("crash-safe backup mirrors storage and supports a downloadable restore", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");

  assert.match(html, /id="backupButton"/);
  assert.match(html, /id="restoreBackupInput"/);
  assert.match(app, /const STORAGE_BACKUP_KEY = "420iqPilotGameV2Backup"/);
  assert.match(app, /localStorage\.setItem\(STORAGE_BACKUP_KEY, serialized\)/);
  assert.match(app, /for \(const key of \[STORAGE_KEY, STORAGE_BACKUP_KEY\]\)/);
  assert.match(app, /function downloadBackup\(\)/);
  assert.match(app, /function restoreBackup\(/);
  assert.match(app, /bundle\.type !== BACKUP_FILE_TYPE/);
});

test("recovery re-heals both storage keys so redundancy is restored immediately", () => {
  const app = readProjectFile("app.js");

  // A successful load re-writes both keys, so a mirror-recovery does not leave
  // the show running on a single surviving copy until the next save.
  assert.match(app, /function rehealSavedGame\(serialized\)/);
  assert.match(app, /rehealSavedGame\(serialized\)/);
  assert.match(app, /if \(localStorage\.getItem\(STORAGE_KEY\) !== serialized\)/);
  assert.match(app, /if \(localStorage\.getItem\(STORAGE_BACKUP_KEY\) !== serialized\)/);
});

test("stage display mode and cross-window sync power the two-monitor broadcast", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  // Stage is a first-class display access mode with a pop-out entry point.
  assert.match(app, /const ACCESS_MODES = new Set\(\["admin", "player", "stage"\]\)/);
  assert.match(app, /function isDisplayAccess\(\)[\s\S]*accessMode === "stage"/);
  assert.match(html, /id="popoutStageButton"/);
  assert.match(html, /document\.body\.dataset\.access = "stage"/);
  assert.match(app, /function popoutStage\(\)[\s\S]*window\.open\(/);
  assert.match(app, /buildAccessUrl\("stage", "#stage"\)\.href/);

  // The Stage window is a silent, receive-only mirror.
  assert.match(app, /if \(accessMode === "stage"\)[\s\S]*soundEnabled = false/);
  assert.match(app, /if \(!game \|\| isDisplayAccess\(\)\)/);

  // BroadcastChannel primary + storage-event fallback, host stays authoritative.
  assert.match(app, /new BroadcastChannel\(SYNC_CHANNEL_NAME\)/);
  assert.match(app, /window\.addEventListener\("storage"/);
  assert.match(app, /function broadcastState\(\)[\s\S]*postSync\(\{ type: "state", game \}\)/);
  assert.match(app, /function applyIncomingGame\(/);
  assert.match(app, /initCrossWindowSync\(\)/);

  // Stage window renders full-bleed 16:9 with no host chrome.
  assert.match(css, /\[data-access="stage"\] \.topbar\s*\{[\s\S]*display: none/);
  assert.match(css, /\[data-access="stage"\] \.stage-toolbar,\s*\n\[data-access="stage"\] \.vertical-preview/);
});

test("end-of-show recap renders on COMPLETE for host and stage", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(html, /id="recapPanel"/);
  assert.match(html, /id="stageRecap"/);
  assert.match(app, /function computeRecap\(\)/);
  assert.match(app, /function renderRecap\(\)/);
  assert.match(app, /function renderHostRecap\(/);
  assert.match(app, /function renderStageRecap\(/);
  assert.match(app, /const isComplete = Boolean\(game && game\.phase === "COMPLETE"\)/);
  assert.match(app, /dom\.runPanel\.hidden = !game \|\| isComplete/);
  assert.match(css, /\.recap-block\.accent-amber/);
  assert.match(css, /\.recap-row\.is-correct/);
  assert.match(css, /\.stage-recap\s*\{[\s\S]*position:\s*absolute/);
});

test("category-first neutral start gates the show behind a category picker", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(html, /id="categoryPicker"/);
  assert.match(html, /id="categoryGrid"/);
  assert.match(html, /id="balancedStartButton"/);
  assert.match(app, /let awaitingCategoryStart = false/);
  assert.match(app, /awaitingCategoryStart = true/);
  assert.match(app, /function renderCategoryStart\(\)/);
  assert.match(app, /function chooseStartCategory\(/);
  assert.match(app, /dom\.runPanel\.dataset\.phase = active \? "category" : ""/);
  assert.match(css, /\.run-panel\[data-phase="category"\] \.control-deck/);
});

test("difficulty and category render as semantic color-coded chips", () => {
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(app, /function difficultyChip\(/);
  assert.match(app, /function categoryChip\(/);
  assert.match(app, /dom\.hostQuestionMeta\.innerHTML = categoryChip\(/);
  assert.match(app, /dom\.stageDifficulty\.innerHTML = publicQuestion \? difficultyChip\(/);
  assert.match(css, /\.chip-difficulty\[data-difficulty="Spark"\]/);
  assert.match(css, /\.chip-difficulty\[data-difficulty="Inferno"\]/);
  assert.match(css, /\.chip-difficulty\[data-difficulty="Wild 420"\]/);
  assert.match(css, /\.chip-difficulty\[data-difficulty="Final"\]/);
  assert.match(css, /\.chip-category\s*\{[\s\S]*--chip/);
});

test("age & jurisdiction gate blocks the app until acknowledged, but never on the broadcast Stage", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");

  assert.match(html, /id="ageGate"[\s\S]*role="dialog"[\s\S]*aria-modal="true"/);
  assert.match(html, /id="ageGateConfirm"/);
  assert.match(html, /id="ageGateAccept"/);
  assert.match(app, /const AGE_ACK_KEY = "420iqAgeAcknowledgedV1"/);
  assert.match(app, /function initAgeGate\(\)/);
  assert.match(app, /accessMode === "stage" \|\| localStorage\.getItem\(AGE_ACK_KEY\) === "true"/);
  assert.match(app, /localStorage\.setItem\(AGE_ACK_KEY, "true"\)/);
  assert.match(app, /document\.body\.classList\.add\("age-gate-open"\)/);
  assert.match(app, /initAgeGate\(\)/);
});

test("jurisdiction disclaimer is present and packs can be exported for version control", () => {
  const html = readProjectFile("index.html");
  const app = readProjectFile("app.js");

  assert.match(html, /class="jurisdiction-disclaimer"/);
  assert.match(html, /not legal, medical, or investment advice/i);
  assert.match(html, /id="exportPackButton"/);
  assert.match(app, /function exportPack\(\)/);
  assert.match(app, /type: "420iq-pack"/);
  assert.match(app, /questions: questionBank/);
});

test("the default question pack is a tracked, importable JSON artifact", () => {
  const pack = JSON.parse(readProjectFile("data/questions.default.json"));

  assert.equal(pack.type, "420iq-pack");
  assert.ok(Array.isArray(pack.questions));
  assert.equal(pack.questions.length, 14);
  assert.ok(pack.questions.some(question => question.final === true), "pack must include the final question");

  pack.questions.forEach(question => {
    assert.equal(typeof question.stem, "string");
    assert.ok(Array.isArray(question.choices) && question.choices.length >= 2);
    assert.equal(typeof question.correctIndex, "number");
  });
});

test("player-only access forces the player console and hides admin controls", () => {
  const app = readProjectFile("app.js");
  const css = readProjectFile("styles.css");

  assert.match(app, /const ACCESS_MODES = new Set\(\["admin", "player", "stage"\]\)/);
  assert.match(app, /function readAccessMode\(\)[\s\S]*new URLSearchParams\(window\.location\.search\)[\s\S]*params\.get\("access"\)[\s\S]*params\.get\("role"\)/);
  assert.match(app, /function resolveAccessTab\(tabName\)[\s\S]*if \(accessMode === "player"\)[\s\S]*return "player"/);
  assert.match(app, /function applyAccessMode\(\)[\s\S]*document\.body\.dataset\.access = accessMode/);
  assert.match(app, /button\.hidden = displayMode && button\.dataset\.tab !== forcedSurface/);
  assert.match(app, /\[dom\.exportButton, dom\.resetButton\]\.forEach/);
  assert.match(app, /const initialTab = resolveAccessTab\(readInitialTab\(\)\)/);
  assert.match(app, /setActiveTab\(initialTab\)/);
  assert.match(app, /function syncRouteHash\(activeTab\)/);
  assert.match(app, /syncRouteHash\(activeTab\)/);
  assert.match(app, /window\.addEventListener\("hashchange", \(\) => setActiveTab\(resolveAccessTab\(readInitialTab\(\)\)\)\)/);
  assert.match(css, /\[data-access="player"\]\s+\.tab-button:not\(\[data-tab="player"\]\)/);
  assert.match(css, /\[data-access="player"\]\s+#exportButton,\s*\n\[data-access="player"\]\s+#resetButton/);
});
