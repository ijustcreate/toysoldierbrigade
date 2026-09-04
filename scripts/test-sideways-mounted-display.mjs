import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [types, app, styles, host, nativeHost] = await Promise.all([
  readFile(new URL("../src/types.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles.css", import.meta.url), "utf8"),
  readFile(new URL("../src/host/lanternHost.ts", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8")
]);

assert.match(types, /mountRotation\?: "none" \| "clockwise" \| "counterclockwise"/);
assert.match(app, /label="Display format"/);
assert.match(app, /label="TV mounting"/);
assert.match(app, /onClick=\{\(event\) => toggleDisplayMenuAt\(event\.clientX, event\.clientY\)\}/);
assert.match(app, /mounted-\$\{screen\.mountRotation\}/);
assert.match(styles, /\.display-shell\.mounted-clockwise/);
assert.match(styles, /mounted-clockwise \{ transform: translate\(-50%, -50%\) rotate\(-90deg\); \}/);
assert.match(styles, /mounted-counterclockwise \{ transform: translate\(-50%, -50%\) rotate\(90deg\); \}/);
assert.match(host, /mountRotation: screen\?\.mountRotation/);
assert.match(nativeHost, /mount_rotation: Option<String>/);
console.log("Sideways-mounted display fixture passed: persisted rotation wraps the full display output.");
