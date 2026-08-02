# DEPLOY.md — hosting the local-first app

`main` is a static PWA: no backend, no build step. It runs from any static host
over **HTTPS** (HTTPS is required — service workers and PWA install refuse to run
over plain http except on localhost). The simplest home is **GitHub Pages**, on
the same repo.

Portability is already handled: every path is relative (`./…`), the manifest
`scope` is `./`, and the service worker registers from `./service-worker.js`, so
the app works from a subpath like `/420iq-studio/` with no code changes.

## Publish on GitHub Pages (one-time)

You do this — enabling Pages publishes the app publicly, so it's your call.

1. Push `main` to GitHub (already the remote: `DaviesBassey/420iq-studio`).
2. Repo → **Settings → Pages**.
3. **Source:** *Deploy from a branch*. **Branch:** `main`, folder **`/ (root)`**. Save.
4. Wait ~1 minute. The URL will be:
   **`https://daviesbassey.github.io/420iq-studio/`**

The `.nojekyll` file in the repo tells Pages to serve the files as-is (no Jekyll
processing).

## Verify after it goes live

- Open the URL. It should load the Host console.
- DevTools → **Network**: assets load as `…?v=420iq28` (the current token).
- DevTools → **Application → Service Workers**: one active worker, scope
  `/420iq-studio/`. → **Manifest**: installable, no errors.
- Try **Install app** (address-bar icon) → it should launch standalone.
- The three surfaces, by URL:
  - Host — `…/420iq-studio/?access=admin#host`
  - Stage — `…/420iq-studio/?access=stage#stage`
  - Player — `…/420iq-studio/?access=player#player`

## Things to know

- **Access is by URL param, not auth.** Anyone with the `?access=admin` URL gets
  the host controls. That's fine while the app is local-first — there's no shared
  server, so each browser only drives its own local session. Don't treat the
  admin URL as private once the audience/backend path is live.
- **Player QR.** Hosted over HTTPS on a static host (GitHub Pages), the join QR
  resolves to the public player URL, but that page shows "waiting for the host" —
  a static host can't relay state, so there is no cross-device sync on this path.
  For live sync, run the app from the **LAN relay** instead (`npm start` →
  `relay.js`): the host and a phone on the same Wi-Fi share live state, and the
  player mirrors the show. See the README. A cloud realtime channel would give
  the same live sync over HTTPS from any network — the client transport is
  written to swap in later (the `{type:"state", game}` message shape is identical).
- **Cache/versioning still applies.** Every asset change must bump the `?v=` token
  in `index.html` and `ASSET_VERSION` + `CACHE_VERSION` in `service-worker.js`, or
  returning visitors get stale assets. Pages also fronts a CDN cache (~10 min), so
  a change can take a few minutes to appear even after the bump.
- **The whole repo root is served.** `README.md`, `PLAN.md`, `RECORDING.md`, and
  `tests/` become publicly readable at their paths. Nothing secret is there, so
  root deploy is fine. If you'd rather expose only the app, switch to a GitHub
  Actions Pages deploy that uploads just the app files — more moving parts, so
  only worth it if the public docs bother you.

## Alternatives (equivalent, all static + HTTPS)

- **Cloudflare Pages / Netlify:** connect the repo, build command *none*, output
  dir = repo root. Gives the app at the domain root (`/`) instead of a subpath,
  and a faster cache-purge than GitHub Pages.
- **Custom domain:** any of the above supports one later; add it once the URL is
  proven.
