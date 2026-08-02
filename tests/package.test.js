const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

function readProjectFile(fileName) {
  return fs.readFileSync(path.join(projectRoot, fileName), "utf8");
}

test("package scripts expose the standard handoff commands", () => {
  const manifest = JSON.parse(readProjectFile("package.json"));

  assert.equal(manifest.private, true);
  assert.equal(manifest.type, "commonjs");
  assert.equal(manifest.scripts.start, "node relay.js");
  assert.equal(manifest.scripts.serve, "python3 -m http.server 8787");
  assert.equal(manifest.scripts.test, "node --test tests/*.test.js");
  assert.equal(
    manifest.scripts.check,
    "node --check app.js && node --check engine.js && node --check service-worker.js && node --check relay.js"
  );
});

test("README documents npm handoff commands", () => {
  const readme = readProjectFile("README.md");

  assert.match(readme, /npm start/);
  assert.match(readme, /npm test/);
  assert.match(readme, /npm run check/);
});
