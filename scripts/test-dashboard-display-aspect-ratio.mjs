import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

assert.match(styles, /dashboard-display-preview\.landscape \.wall-canvas \{[\s\S]*?height: auto;[\s\S]*?aspect-ratio: 16 \/ 9;/);
assert.match(styles, /dashboard-display-preview\.portrait \.wall-canvas \{[\s\S]*?width: auto;[\s\S]*?aspect-ratio: 9 \/ 16;/);
assert.match(styles, /dashboard-display-preview\.portrait > \.tv-browser-board \{[\s\S]*?aspect-ratio: 9 \/ 16;/);
console.log("Dashboard display previews preserve their configured portrait or landscape aspect ratio.");
