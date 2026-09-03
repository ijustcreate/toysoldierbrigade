import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/display/BabylonDonorWall.tsx", import.meta.url), "utf8");

assert.match(source, /const useSafeCanvasRenderer = fitToScreen && viewMode === "2d"/);
assert.match(source, /if \(useSafeCanvasRenderer\) return;/);
assert.match(source, /canvas\?\.getContext\("2d"\)/);
assert.match(source, /drawTextureContent\([^\n]+false\)/);
assert.match(source, /if \(mirrorForTexture\)/);
console.log("TV-safe board renderer fixture passed: straight-on output bypasses WebGL and paints through Canvas 2D.");
