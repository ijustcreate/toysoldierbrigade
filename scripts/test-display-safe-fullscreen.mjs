import fs from "node:fs";
import assert from "node:assert/strict";

const app = fs.readFileSync("src/App.tsx", "utf8");
const displayStart = app.indexOf("function DisplayApp");
assert.notEqual(displayStart, -1, "DisplayApp exists");
const displaySource = app.slice(displayStart);
assert.match(displaySource, /setIsFullscreen\(\(current\) => !current\)/, "TV presentation toggles local viewport state");
assert.doesNotMatch(displaySource, /requestFullscreen\(/, "TV display never calls browser Fullscreen API");
assert.doesNotMatch(displaySource, /exitFullscreen\(/, "TV display never exits browser Fullscreen API");

console.log("Display safe-fullscreen fixture passed: presentation stays inside the fixed viewport.");
