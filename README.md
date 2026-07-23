# 420IQ Studio

Local-first host controller for the 420IQ quiz show. Finite-state show flow,
Confidence Lock, Source Signal / Trusted Circle lifelines, question timer,
16:9 stage + 9:16 vertical preview, and the 420 Decision final — all running
in the browser with no backend and no network calls at runtime.

Packaged as an installable, offline-first **Progressive Web App (PWA)**.

## Files

| File | Role |
| --- | --- |
| `index.html` | App shell and surfaces (host / stage / player / pack / audit) |
| `styles.css` | Premium-mobile theme |
| `engine.js` | Pure game engine — state machine, scoring, pack balancing, timer (no DOM) |
| `app.js` | UI glue — rendering, controls, WebAudio SFX, access routing, persistence |
| `manifest.webmanifest` | PWA manifest (name, icons, theme, standalone display) |
| `service-worker.js` | Precache-and-serve shell for offline launch + clean updates |
| `icons/` | App icons (192/512 any + maskable, Apple touch icon) |
| `data/` | Version-controlled question packs (`questions.default.json` is the tracked default) |
| `package.json` | Handoff scripts for local serving, tests and syntax checks |
| `tests/` | `node --test` suites (engine, static UI, PWA, package) |
| `RECORDING.md` | Dry-run recording checklist (two-monitor + OBS + full run-through) |

## Access URLs

Access separation is enforced in `app.js` (read from the URL, independent of
the PWA layer):

- **Host / admin:** `/?access=admin#host` — full controller (this is also the
  installed app's `start_url`).
- **Player only:** `/?access=player#player` — contestant display only; host
  tabs, Undo, Backup, Export and Reset are hidden and host surfaces are made
  `inert`.
- **Stage display:** `/?access=stage#stage` — a chrome-free, full-bleed 16:9
  broadcast display (no topbar, no tabs, no 9:16 preview). Silent by design —
  the host machine owns the show audio. Opened via the Stage tab's **Pop out
  Stage window** button; press **F** (or double-click) to fullscreen it on the
  capture monitor.

## Two-monitor broadcast (cross-window sync)

The host console and the Stage display can run in separate windows on separate
monitors. The Stage window is a **receive-only mirror**: it renders the live
show but never persists or controls it. State propagates from host → Stage in
real time via `BroadcastChannel` (same-origin), with the `storage` event as a
fallback. The host is always authoritative; a freshly opened Stage window
requests current state on load. The countdown timer runs locally in each window
from the shared start/end timestamps, so it stays smooth without per-tick
messages. (Cross-*device* mirroring — e.g. a player's phone — is out of scope
here; it needs the deferred audience backend.)

## Sound effects (SFX)

All cues are synthesised in the browser with WebAudio (no audio files). Browsers
won't start audio without a user gesture, so the toolbar SFX button reflects
state:

- **ARM** (amber) — sound is enabled but the browser hasn't unlocked audio yet.
  Tap once to arm; a queued cue (e.g. a reveal that fired before arming) plays on
  arm.
- **SFX** (teal) — armed and ready; cues play live.
- **OFF** — muted.

The **Stage** window is always silent (the host machine owns the show audio). A
same-machine **player** window plays reveal/segment cues as host state syncs in.
Override the default with `?sfx=on` / `?sfx=off` in the URL (persists per
browser).

## End-of-show recap

When the show reaches `COMPLETE`, both surfaces switch to a recap:

- **Host** — final IQ, accuracy (correct / total), a per-difficulty breakdown,
  lifelines used, and a per-question hit/miss list with score deltas, plus a
  **Start new session** button.
- **Stage** — a clean, opaque broadcast card (final IQ, correct/total + accuracy,
  difficulty breakdown), so the recap is capture-ready.

The recap is derived from a per-question `results` ledger the engine records on
each score commit. Because the ledger lives in game state, **undo/rewind is
recap-safe** — reverting past a commit drops that question's result, and
re-committing overwrites rather than duplicating.

## Live-production safety (host only)

Recording an episode is unforgiving, so the host toolbar carries two safety
controls:

- **UN — Undo.** Reverts the last show-flow step (a mis-clicked lock, an
  accidental reveal/commit) without a re-record. It restores the prior state
  but never rewrites history: the audit trail keeps growing and records a
  `STATE_REWIND` compensating event. Undo history is in-memory (cleared on a
  new session / restore) and depth-bounded.
- **BK — Backup / Restore.** `BK` downloads a full recovery file (current game
  **and** question bank). After a wipe, **Restore backup** in the setup panel
  rebuilds the exact session from that file — the only recovery path that
  survives the browser's storage being cleared or purged.

Every state change is also mirrored to a second `localStorage` key, so a torn
or cleared primary write is recovered automatically on the next load (and
re-persisted to both keys).

## Compliance & content responsibility

Cannabis is a regulated topic, so the app carries a light compliance layer
(none of it collects personal data):

- **Age & jurisdiction gate.** On first load the app is blocked by a modal that
  states the content is educational (not legal/medical/investment advice) and
  requires a legal-age + jurisdiction acknowledgement. The acknowledgement is
  stored per-browser (`localStorage`) so it prompts once. It **never** shows on
  the Stage display (`?access=stage`) — a modal must not appear on a captured
  broadcast surface.
- **Standing disclaimer.** A jurisdiction disclaimer sits in the setup panel as
  a persistent reminder to verify local rules before broadcast.
- These are a responsible-content posture, **not legal advice or a compliance
  guarantee** — confirm the rules for your territory and platform (YouTube
  cannabis content is frequently age-restricted or demonetised).

## Question packs are your IP — keep them in version control

The default pack lives at `data/questions.default.json` (tracked), and the demo
seed is also embedded in `app.js` for offline first-run. Your real, edited packs
should not live only in a browser:

- **Import question JSON** (setup panel) loads a pack.
- **Export pack JSON** (Pack tab, host only) downloads the current question bank
  as a clean, re-importable file — commit that file to git after every edit.

Import/export share the `{ "type": "420iq-pack", "questions": [...] }` shape, so
a pack round-trips losslessly.

## Run locally

Service workers require `http://localhost` or HTTPS — opening `index.html` over
`file://` disables install/offline (the app still runs; the SW just no-ops).

```sh
# from this directory
npm start
# then open http://localhost:8787/?access=admin#host
```

## Deploy

Copy this directory to any static host that serves over **HTTPS** (GitHub
Pages, Netlify, Cloudflare Pages, S3+CloudFront, nginx). No build step. Ensure
`manifest.webmanifest` is served as `application/manifest+json` (most hosts do
this automatically). On first visit the service worker precaches the shell;
subsequent launches work offline and the host can "Install / Add to Home
Screen" on desktop, Android and iOS.

## Releasing a new version

When `engine.js`, `app.js` **or `styles.css`** change (all three carry a `?v=`
cache-busting token — a stylesheet edit that skips the bump serves stale CSS):

1. Bump the `?v=` token on the `styles.css` link and the `engine.js` / `app.js`
   `<script>` tags in `index.html` **and** `ASSET_VERSION` in
   `service-worker.js` — all together, to the same value.
2. Bump `CACHE_VERSION` in `service-worker.js` so stale shells are evicted on
   the next activation.

Navigations are network-first, so a redeploy is picked up on the next online
launch; the old cache is cleared on `activate`. `npm test` guards this — the PWA
suite fails if the tokens in `index.html` and `service-worker.js` drift apart.

## Checks

```sh
npm test
npm run check
```

## Wrapper roadmap

PWA is the shared core. When native packaging is needed:

- **Capacitor** — wraps this exact PWA into iOS/Android App Store binaries
  (add native SFX/haptics later). No game-code changes required.
- **Electron** — wraps it as a desktop host app for the studio machine
  (kiosk/fullscreen, always-offline).
