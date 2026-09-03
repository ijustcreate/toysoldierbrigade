import assert from "node:assert/strict";
import { initialState } from "../src/sampleData";
import { normalizeState } from "../src/host/lanternHost";

const saved = structuredClone(initialState);
saved.contentVersion = 21;

for (const id of ["toy-play-10", "toy-play-15", "toy-play-20"]) {
  const donor = saved.donors.find((item) => item.id === id);
  assert.ok(donor, `Missing brigade donor ${id}`);
  donor.recordStatus = "deprecated-legacy";
  donor.tags = [...(donor.tags ?? []), "Deprecated/Legacy"];
}

const normalized = normalizeState(saved);
for (const id of ["toy-play-10", "toy-play-15", "toy-play-20"]) {
  const donor = normalized.donors.find((item) => item.id === id);
  assert.equal(donor?.recordStatus, "current", `${id} should be current`);
  assert.ok(!donor?.tags?.includes("Deprecated/Legacy"), `${id} should not retain a legacy tag`);
}

assert.equal(normalized.donors.find((item) => item.id === "legacy-photo1-01")?.recordStatus, "deprecated-legacy", "Historical legacy donors must remain legacy");
assert.equal(normalized.contentVersion, 22, "The correction should advance the content version");

console.log("Brigade donor status migration passed.");
