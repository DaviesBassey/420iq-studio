const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

function readProjectFile(fileName) {
  return fs.readFileSync(path.join(projectRoot, fileName), "utf8");
}

function projectFileExists(fileName) {
  return fs.existsSync(path.join(projectRoot, fileName));
}

test("web app manifest is valid JSON with the fields required for install", () => {
  const manifest = JSON.parse(readProjectFile("manifest.webmanifest"));

  assert.equal(manifest.name, "420IQ Studio");
  assert.equal(manifest.short_name, "420IQ");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#101014");
  assert.equal(manifest.background_color, "#101014");
  assert.match(manifest.start_url, /access=admin/);
  assert.equal(manifest.scope, "./");

  const sizes = manifest.icons.map(icon => icon.sizes);
  assert.ok(sizes.includes("192x192"), "manifest must declare a 192px icon");
  assert.ok(sizes.includes("512x512"), "manifest must declare a 512px icon");
  assert.ok(
    manifest.icons.some(icon => icon.purpose === "maskable"),
    "manifest must declare at least one maskable icon"
  );
});

test("every icon referenced by the manifest exists on disk", () => {
  const manifest = JSON.parse(readProjectFile("manifest.webmanifest"));

  manifest.icons.forEach(icon => {
    assert.ok(
      projectFileExists(icon.src),
      `missing manifest icon file: ${icon.src}`
    );
  });

  assert.ok(projectFileExists("icons/apple-touch-icon.png"), "missing apple-touch-icon.png");
});

test("index.html links the manifest, iOS meta tags and apple touch icon", () => {
  const html = readProjectFile("index.html");

  assert.match(html, /<link rel="manifest" href="\.\/manifest\.webmanifest">/);
  assert.match(html, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="420IQ">/);
  assert.match(html, /<link rel="apple-touch-icon" href="\.\/icons\/apple-touch-icon\.png">/);
});

test("index.html registers the service worker only when it is supported", () => {
  const html = readProjectFile("index.html");

  assert.match(html, /if \(!\("serviceWorker" in navigator\)\)/);
  assert.match(html, /navigator\.serviceWorker\.register\("\.\/service-worker\.js"\)/);
  assert.match(html, /\.catch\(function onError/);
});

test("service worker precaches the exact versioned app shell", () => {
  const sw = readProjectFile("service-worker.js");

  assert.match(sw, /const CACHE_NAME = `420iq-shell-\$\{CACHE_VERSION\}`;/);
  assert.match(sw, /"\.\/index\.html"/);
  assert.match(sw, /`\.\/styles\.css\?v=\$\{ASSET_VERSION\}`/);
  assert.match(sw, /`\.\/engine\.js\?v=\$\{ASSET_VERSION\}`/);
  assert.match(sw, /`\.\/app\.js\?v=\$\{ASSET_VERSION\}`/);
  assert.match(sw, /"\.\/manifest\.webmanifest"/);
});

test("service worker asset version matches the cache token in index.html", () => {
  const sw = readProjectFile("service-worker.js");
  const html = readProjectFile("index.html");

  const match = sw.match(/const ASSET_VERSION = "([^"]+)"/);
  assert.ok(match, "service worker must declare ASSET_VERSION");
  const assetVersion = match[1];

  assert.match(html, new RegExp(`engine\\.js\\?v=${assetVersion}`));
  assert.match(html, new RegExp(`app\\.js\\?v=${assetVersion}`));
  assert.match(html, new RegExp(`styles\\.css\\?v=${assetVersion}`));
});

test("service worker does not ignore search params for versioned JS and CSS", () => {
  const sw = readProjectFile("service-worker.js");

  assert.match(sw, /function requestMustMatchSearch\(url\)/);
  assert.match(sw, /url\.pathname\.endsWith\("\/app\.js"\)/);
  assert.match(sw, /url\.pathname\.endsWith\("\/engine\.js"\)/);
  assert.match(sw, /url\.pathname\.endsWith\("\/styles\.css"\)/);
  assert.match(sw, /const exactMatchOnly = requestMustMatchSearch\(url\)/);
  assert.match(sw, /exactMatchOnly\s*\?\s*null\s*:\s*caches\.match\(request, \{ ignoreSearch: true \}\)/);
});

test("service worker cleans up stale shell caches on activate and controls clients", () => {
  const sw = readProjectFile("service-worker.js");

  assert.match(sw, /self\.skipWaiting\(\)/);
  assert.match(sw, /self\.clients\.claim\(\)/);
  assert.match(sw, /key\.startsWith\("420iq-shell-"\) && key !== CACHE_NAME/);
  assert.match(sw, /request\.mode === "navigate"/);
});
