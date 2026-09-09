import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [app, styles] = await Promise.all([
  readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/styles.css", import.meta.url), "utf8")
]);

assert.match(app, /<strong>Counterclockwise<\/strong>/, "counterclockwise is the first/left choice");
assert.match(app, /<strong>Clockwise<\/strong>/, "clockwise is the second/right choice");
assert.ok(app.indexOf("<strong>Counterclockwise</strong>") < app.indexOf("<strong>Clockwise</strong>"));
assert.match(app, /tv-mode-mounted-\$\{mountRotation\}/, "final setup uses selected physical rotation");
assert.match(styles, /\.tv-mode-shell\.tv-mode-mounted-clockwise \{ transform: translate\(-50%, -50%\) rotate\(-90deg\); \}/);
assert.match(styles, /\.tv-mode-shell\.tv-mode-mounted-counterclockwise \{ transform: translate\(-50%, -50%\) rotate\(90deg\); \}/);
assert.match(styles, /width: 100vh;\s*height: 100vw;/, "rotated setup swaps viewport dimensions");
assert.match(app, /Oops, it’s rotated the other way/);
assert.match(app, /It’s landscape/);
assert.match(app, /rememberSetup\("Portrait", next, selectedScreen\?\.id\)/, "rotation persists immediately");
assert.match(app, /saved\.orientation === "Portrait".*return "display";/, "saved portrait setup resumes at corrected display screen");
console.log("TV setup fixture passed: browser orientation choices, rotated confirmation, corrections and persistence.");
