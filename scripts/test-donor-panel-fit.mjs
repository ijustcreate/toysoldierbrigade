import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fitDonorPanel } from "../src/fitDonorPanel.ts";

// Synthetic layout harness: exercise fitting without any saved museum state.
function fixture({ maximum = 28, heightLimit = 15, widthLimit = 100, scale = 1 } = {}) {
  const properties = new Map();
  const size = () => Number.parseFloat(properties.get("--donor-fitted-size") ?? maximum);
  const row = {
    getBoundingClientRect: () => ({ top: 0, bottom: 40 * scale, left: 0, right: 100 * scale }),
    querySelectorAll: () => [text]
  };
  const text = {
    clientWidth: 100,
    get scrollWidth() { return size() / widthLimit * 100; },
    getBoundingClientRect() {
      const height = size() / heightLimit * 40;
      const width = size() / widthLimit * 100;
      return { top: (40 - height) / 2 * scale, bottom: (40 + height) / 2 * scale, left: (100 - width) / 2 * scale, right: (100 + width) / 2 * scale };
    }
  };
  const grid = {
    clientWidth: 100, clientHeight: 40, scrollWidth: 100, scrollHeight: 40,
    style: { setProperty: (name, value) => properties.set(name, value), removeProperty: (name) => properties.delete(name) },
    querySelectorAll: () => [row], dataset: {}
  };
  return { grid, maximum, properties };
}

const originalGetComputedStyle = globalThis.getComputedStyle;
try {
  for (const scale of [0.3, 1, 4]) {
    const { grid, maximum } = fixture({ scale });
    globalThis.getComputedStyle = () => ({ fontSize: `${maximum}px` });
    const fitted = fitDonorPanel(grid);
    assert.ok(fitted <= 15 && fitted > 14.9, "use the largest size within the row height");
    assert.equal(grid.dataset.fittedFontSize, String(fitted));
    assert.equal(fitDonorPanel(grid), fitted, "repeated fitting is stable and independent of preview zoom");
  }
  const horizontal = fixture({ heightLimit: 100, widthLimit: 12 });
  globalThis.getComputedStyle = () => ({ fontSize: "28px" });
  assert.ok(fitDonorPanel(horizontal.grid) <= 12, "long names fit horizontally, too");
  const roomy = fixture({ maximum: 9, heightLimit: 50 });
  globalThis.getComputedStyle = () => ({ fontSize: "9px" });
  assert.equal(fitDonorPanel(roomy.grid), 9, "never enlarge a small authored font");
  globalThis.getComputedStyle = () => ({ fontSize: "18px" });
  assert.equal(fitDonorPanel(roomy.grid), 18, "a new font setting replaces, rather than compounds, old fitting");
  roomy.grid.clientHeight = 0;
  assert.equal(fitDonorPanel(roomy.grid), 0, "hidden panels can defer fitting until resize");
  roomy.grid.clientHeight = 40;
  roomy.grid.querySelectorAll = () => [];
  assert.equal(fitDonorPanel(roomy.grid), 0, "empty panels are safe");
  assert.equal(roomy.properties.has("--donor-fitted-size"), false, "empty panels clear previous fitting");
} finally {
  if (originalGetComputedStyle === undefined) delete globalThis.getComputedStyle;
  else globalThis.getComputedStyle = originalGetComputedStyle;
}

const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
const gridRule = css.match(/\.direct-donor-grid\s*\{([^}]+)\}/)?.[1];
assert.match(gridRule, /overflow:\s*hidden/, "passive board rosters never gain scrollbars");
assert.doesNotMatch(gridRule, /overflow[^;]*:\s*(auto|scroll)/);
const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
assert.match(app, /<FittedDonorGrid/, "editor and authored TV presentation use the fitted grid");
assert.match(app, /gridTemplateRows: layout\.rowUnits\.map\(\(units\) => `minmax\(0,/, "rows are bounded by panel height");
assert.match(app, /panelDonors\(panel\)\.slice\(0,/, "intentional row capacity still applies");
console.log("Donor panel fitting passed: bounded height/width, authored maximum, resize, zoom, empty panels and retained row capacity.");
