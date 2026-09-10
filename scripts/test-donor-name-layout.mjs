import assert from "node:assert/strict";
import { buildDonorNameGridLayout, splitDonorNameLines } from "../src/donorNameLayout.ts";

assert.deepEqual(splitDonorNameLines("Kevin and Sandy Huber"), ["Kevin", "and", "Sandy Huber"]);
assert.deepEqual(splitDonorNameLines("Denise & Rob Aitken"), ["Denise", "and", "Rob Aitken"]);
assert.deepEqual(splitDonorNameLines("Mary Bava"), ["Mary Bava"]);

const longName = "Patricia Alexandra Montgomery Brusher";
const longLines = splitDonorNameLines(longName);
assert.ok(longLines.length >= 2 && longLines.length <= 3);
assert.equal(longLines.join(" "), longName);

const gridLayout = buildDonorNameGridLayout([
  { name: "Kevin & Sandy Huber" },
  { name: "Duane Isetti" },
  { name: "Mary Bava" },
  { name: "Joanne Waters" }
], 2);
assert.equal(gridLayout.rowCount, 2);
assert.equal(gridLayout.rowUnits[0], gridLayout.rowUnits[1], "short-name rows must be as tall as neighboring multiline-name rows");
assert.ok(gridLayout.rowUnits[0] >= 3.24, "each row reserves enough space for the tallest name");
assert.equal(gridLayout.totalUnits, gridLayout.rowCount * gridLayout.rowUnits[0]);

for (const columns of [1, 3, 6, 12]) {
  const mixed = buildDonorNameGridLayout([
    { name: "Alex and Jordan Example", hasSubtext: true },
    ...Array.from({ length: 23 }, () => ({ name: "Short Name" }))
  ], columns, 25);
  assert.equal(mixed.rowCount, 25, "authored row capacity is preserved");
  assert.equal(new Set(mixed.rowUnits).size, 1, "all rows, including empty capacity, have equal height");
  assert.ok(mixed.rowUnits[0] > gridLayout.rowUnits[0], "uniform rows also reserve subtext space");
}
assert.deepEqual(buildDonorNameGridLayout([], 3).rowUnits, [1.4], "empty lists remain safe");

console.log(JSON.stringify({
  conjunction: splitDonorNameLines("Kevin and Sandy Huber"),
  ampersand: splitDonorNameLines("Denise & Rob Aitken"),
  longName: longLines,
  fixedFontSize: true,
  rowUnits: gridLayout.rowUnits
}));
