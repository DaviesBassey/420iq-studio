# PLAN.md — scope contract for 420IQ Studio

**Read this before making any change.** Two AI assistants work on this repo —
Claude and Codex (Codex takes over when Claude usage limits hit). This file is
the shared source of truth for what's decided and what's off-limits, so a
deliberate decision doesn't get silently reversed by whoever edits next.

Owner: Davies (github.com/DaviesBassey/420iq-studio). Last updated: 2026-08-08.

## The one rule

If a change would touch or reverse anything under **Locked decisions**, **stop
and confirm with Davies first.** Do not build it silently, even if it seems
like an obvious improvement and even if it passes tests. "It's already built"
is not "it was agreed."

## Current state (branches)

- **`main`** — the validated, local-first static app. No backend, no runtime
  network calls, no external dependencies, no build step. Installable offline
  PWA. This is what gets recorded and shipped first.
- **`feat/cross-device-sync`** — Codex's cross-device backend (`server.js` +
  client integration in `app.js`): Node session server, role tokens, SSE state
  sync, player-answer submission. **Quarantined here on purpose.** Working, but
  not reviewed line-by-line, not security-hardened, and built ahead of the
  agreed phase order. Do not merge to `main` yet (see gates below).

## Locked decisions

1. **`main` stays local-first.** No backend, no runtime network calls, no
   external deps, no build step. It must keep running from a static host and
   offline.
2. **The cross-device backend does not merge to `main`** until *all three*
   gates are met:
   a. the single-player show has been recorded on camera at least once (the
      dry-run — see `RECORDING.md`);
   b. a full line-by-line + security/threat-model review of `server.js` and the
      client integration;
   c. the cannabis-networked compliance questions are answered — age-gating for
      remote participants, and what player data is collected/retained.
3. **Answer keys are never exposed** to the public/player/stage surfaces before
   the host reveal. This invariant holds on every surface and over any sync.
   - **How it's enforced (do not regress):** the host broadcasts only
     `sanitizeGameForDisplay(game)`, which deletes `correctIndex` and
     `verifiedSignalIndex` from every question in `pack.sequence`. Every outbound
     path — BroadcastChannel (`postSync`), the LAN relay (`publishStateToRelay`),
     and the `storage`-event fallback — sends/applies only that sanitized view.
     The host keeps its full local `game` (it never applies its own broadcast).
     The correct answer reaches displays **only** via the `reveal` object at
     reveal time. If you touch broadcast/sync, keep the full game off the wire.
   - **Known residual:** crash-recovery persists the full game to same-origin
     `localStorage`, so a display on the *operator's own machine* can read the
     key there. Not a contestant vector (a networked device is a different origin
     and only sees the sanitized relay stream). Revisit if host and displays ever
     share an origin with untrusted viewers.
4. **Access separation is enforced.** admin / player / stage are distinct;
   players never receive host controls; the Stage broadcast surface never shows
   modals (e.g. the age gate).
5. **The compliance layer stays** — age/jurisdiction gate on first load, and the
   standing disclaimer.

## Phase order

- **Now:** validate the core single-player broadcast show with a real OBS
  dry-run recording (`RECORDING.md`). This is the gate before deciding what's
  next — reality, not a diff, decides.
- **After the dry-run**, pick the next phase from what it surfaces. Likely
  candidates: on-camera legibility / type-scale tuning, an OBS scene preset,
  pacing holds; a native wrapper (Electron desktop host / Capacitor); or
  promoting the cross-device backend **only if** the show proves out and live
  audience play is actually wanted.

## Working agreements

- **Read this file first.** If a Locked decision is in the way, confirm before
  building.
- **Versioning:** `index.html` carries a `?v=420iqN` token on `styles.css`,
  `engine.js`, and `app.js`; bump it in lockstep with `ASSET_VERSION` and a
  bumped `CACHE_VERSION` in `service-worker.js` on every change, or the service
  worker serves stale assets. The PWA test suite fails if the tokens drift.
- **Keep it green:** `npm test` passes and `npm run check` is clean before
  committing.
- **Branch discipline:** anything that isn't on `main`'s local-first path goes
  on a branch. Commit as you go; push via SSH.
- **Keep this file current.** If Davies changes a decision, update the relevant
  section here in the same change, and note what/when.
