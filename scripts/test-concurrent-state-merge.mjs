import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/concurrentStateMerge.ts", import.meta.url), "utf8");
const hostSource = await readFile(new URL("../src/host/lanternHost.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { mergeConcurrentState } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const baseline = {
  boardPrograms: [
    { id: "hand-edited", title: "Original", panels: [{ id: "heading", text: "Original heading" }] },
    { id: "other-board", title: "Old remote title" }
  ],
  schedules: [{ id: "event", time: "09:00" }],
  theme: "light"
};
const local = structuredClone(baseline);
local.boardPrograms[0].panels[0].text = "My hand edit";
const shared = structuredClone(baseline);
shared.boardPrograms[1].title = "New remote title";
shared.schedules[0].time = "10:00";
shared.theme = "dark";

const merged = mergeConcurrentState(baseline, local, shared);
assert.equal(merged.boardPrograms[0].panels[0].text, "My hand edit", "active hand edit wins");
assert.equal(merged.boardPrograms[1].title, "New remote title", "unrelated board update survives");
assert.equal(merged.schedules[0].time, "10:00", "newer schedule survives");
assert.equal(merged.theme, "dark", "newer unrelated setting survives");

const both = structuredClone(shared);
both.boardPrograms[0].panels[0].text = "Someone else's collision";
assert.equal(mergeConcurrentState(baseline, local, both).boardPrograms[0].panels[0].text, "My hand edit", "current local field wins a direct collision");

const pending = structuredClone(local);
pending.boardPrograms[0].panels[0].text = "My even newer edit";
const rebasedPending = mergeConcurrentState(local, pending, merged);
assert.equal(rebasedPending.boardPrograms[0].panels[0].text, "My even newer edit", "an edit made during saving is retained");
assert.equal(rebasedPending.schedules[0].time, "10:00", "pending edit keeps the acknowledged remote merge");

const racingShared = structuredClone(shared);
racingShared.schedules[0].time = "11:00";
const secondMerge = mergeConcurrentState(shared, merged, racingShared);
assert.equal(secondMerge.boardPrograms[0].panels[0].text, "My hand edit", "hand edit survives a second server race");
assert.equal(secondMerge.schedules[0].time, "11:00", "the second newer remote change is not mistaken for a local edit");

assert.match(hostSource, /if \(sharedStateUpdatedAt === undefined \|\| !sharedStateBaseline\)[\s\S]*loadSharedLanternStateSnapshot\(\{ updateSyncContext: false \}\)[\s\S]*sharedStateWriteBlocked = true;/, "Save must recover a missing startup baseline by fetching and merging the latest shared copy");

console.log("Concurrent state merge checks passed: hand edits win while unrelated shared work survives.");
