import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../src/display/BabylonDonorWall.tsx", import.meta.url), "utf8");

assert.match(source, /const isTvBrowser = typeof navigator !== "undefined"/);
assert.match(source, /const isExplicitTvMode = typeof window !== "undefined"/);
const selection = source.match(/const useSafeCanvasRenderer = ([^;]+);/);
assert.ok(selection);
for (const [viewMode, preferCanvas2D, isTvBrowser, isExplicitTvMode, expected] of [
  ["2d", false, false, false, false], // Normal dashboard behavior is unchanged.
  ["2d", true, false, false, true], // Announcements and Blips opt in.
  ["3d", true, false, false, false],
  ["2d", false, true, false, true],
  ["2d", false, false, true, true]
]) {
  assert.equal(vm.runInNewContext(selection[1], { webglFailed: false, fitToScreen: true, viewMode, preferCanvas2D, isTvBrowser, isExplicitTvMode }), expected);
}
assert.match(source, /if \(useSafeCanvasRenderer \|\| useHtmlFallback\) return;/);
assert.match(source, /canvas\?\.getContext\("2d"\)/);
assert.match(source, /const widthCss = canvas\.clientWidth;/);
assert.match(source, /const heightCss = canvas\.clientHeight;/);
assert.doesNotMatch(source, /canvas\.getBoundingClientRect\(\)/);
assert.match(source, /drawTextureContent\([^\n]+false\)/);
assert.match(source, /if \(mirrorForTexture\)/);
assert.match(source, /requiresTvHtmlFallback/);
assert.match(source, /TvBrowserBoardFallback/);
assert.match(source, /size \* \(0\.12 \+ random\(39\.346\) \* 0\.32\)/);
assert.match(source, /shimmer \* depth \* 0\.5/);
console.log("TV-safe board renderer fixture passed: straight-on output bypasses WebGL and paints through Canvas 2D.");

