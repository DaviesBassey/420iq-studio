/**
 * 420IQ Studio service worker.
 *
 * The app is fully self-contained (no network calls at runtime), so this is a
 * precache-and-serve shell:
 *   - install: precache the app shell, then take over immediately.
 *   - activate: drop stale caches from previous versions, then claim clients.
 *   - fetch:  navigations use network-first (so a redeploy is picked up),
 *             every other same-origin GET uses cache-first with a network
 *             fallback that fills the cache for next time.
 *
 * Bump CACHE_VERSION on any release so old shells are evicted on activate.
 * Bump the `?v=` token on engine.js / app.js in index.html AND here together
 * when their contents change, so the precache stores the fresh bytes.
 */
const CACHE_VERSION = "v21";
const CACHE_NAME = `420iq-shell-${CACHE_VERSION}`;
const ASSET_VERSION = "420iq28";

// Core shell: if any of these fail to cache, offline launch is impossible, so
// `addAll` fails loudly (atomic) and the old worker stays in control.
const CRITICAL_URLS = [
  "./",
  "./index.html",
  `./styles.css?v=${ASSET_VERSION}`,
  `./engine.js?v=${ASSET_VERSION}`,
  `./app.js?v=${ASSET_VERSION}`
];

// Nice-to-have: a single missing icon must not sink the whole precache, so
// these are cached best-effort and a failure is tolerated.
const OPTIONAL_URLS = [
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

function requestMustMatchSearch(url) {
  return (
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/engine.js") ||
    url.pathname.endsWith("/styles.css")
  );
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(CRITICAL_URLS);
        await Promise.allSettled(OPTIONAL_URLS.map(url => cache.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith("420iq-shell-") && key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then(cached => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  const exactMatchOnly = requestMustMatchSearch(url);

  event.respondWith(
    caches
      .match(request)
      .then(cached => cached || (exactMatchOnly ? null : caches.match(request, { ignoreSearch: true })))
      .then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(request).then(response => {
          if (response && response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        });
      })
  );
});
