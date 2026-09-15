import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const source = await readFile(new URL("../src/concurrentStateMerge.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { mergeConcurrentState } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
// Execute the actual editor relay effect with a delayed save acknowledgement.
const start = app.indexOf("    if (incomingSavedSnapshot === observedSavedSnapshot.current) return;");
assert.ok(start >= 0);
const end = app.indexOf("  }, [hasUnsavedChanges, incomingSavedSnapshot, savedState]);", start);
assert.ok(end > start);
const effect = app.slice(start, end);
const submitted = { boardPrograms: [{ id: "board", panels: [{ id: "donors", donorIds: ["a"], fontSize: 30 }] }] };
const newer = structuredClone(submitted);
newer.boardPrograms[0].panels[0].donorIds.push("b");
newer.boardPrograms[0].panels[0].fontSize = 42;
for (const draft of [submitted, newer]) {
  let rendered;
  let savedSnapshot;
  const context = {
    incomingSavedSnapshot: JSON.stringify(submitted),
    observedSavedSnapshot: { current: "old" },
    pendingSavedBoardSnapshot: { current: { snapshot: JSON.stringify(submitted), state: submitted } },
    draftStateRef: { current: structuredClone(draft) },
    draftBaselineRef: { current: structuredClone(submitted) },
    savedState: structuredClone(submitted),
    hasUnsavedChanges: true,
    mergeConcurrentState, structuredClone,
    setDraftState: (value) => { rendered = value; },
    setSavedDraftSnapshot: (value) => { savedSnapshot = value; }
  };
  vm.runInNewContext(`(() => { ${effect} })()`, context);
  assert.deepEqual(rendered, draft, "save acknowledgement must preserve post-submit membership and formatting edits");
  assert.equal(savedSnapshot, JSON.stringify(submitted), "only the submitted version is marked saved");
  assert.equal(context.pendingSavedBoardSnapshot.current, null);
  assert.deepEqual(context.draftStateRef.current, draft);
}

// Another operator narrows Explore while this editor changes the Play list.
const baseline = { boardPrograms: [{ id: "board", panels: [
  { id: "explore", donorIds: ["explore-donor", "play-donor"] },
  { id: "play", donorIds: ["play-donor"], fontSize: 30 }
] }] };
const localDraft = structuredClone(baseline);
localDraft.boardPrograms[0].panels[1].fontSize = 44;
const shared = structuredClone(baseline);
shared.boardPrograms[0].panels[0].donorIds = ["explore-donor"];
let refreshed;
const refreshContext = {
  incomingSavedSnapshot: JSON.stringify(shared), observedSavedSnapshot: { current: JSON.stringify(baseline) },
  pendingSavedBoardSnapshot: { current: null }, draftStateRef: { current: localDraft },
  draftBaselineRef: { current: baseline }, savedState: shared, hasUnsavedChanges: true,
  mergeConcurrentState, structuredClone,
  setDraftState: value => { refreshed = value; }, setSavedDraftSnapshot: () => {}
};
vm.runInNewContext(`(() => { ${effect} })()`, refreshContext);
assert.deepEqual(refreshed.boardPrograms[0].panels[0].donorIds, ["explore-donor"], "dirty editor must adopt incoming Explore membership");
assert.equal(refreshed.boardPrograms[0].panels[1].fontSize, 44, "incoming changes must preserve the local Play edit");
// Run the actual save updater against state arriving during durable storage.
const saveStart = app.indexOf("    updateState((current) => {", app.indexOf("  const saveBoard = async () => {"));
const saveEnd = app.indexOf("    savedState.boardPrograms.forEach", saveStart);
assert.ok(saveStart > 0 && saveEnd > saveStart);
let saved;
vm.runInNewContext(`(() => { ${app.slice(saveStart, saveEnd)} })()`, {
  draftBaseline: baseline, currentDraft: localDraft, mergeConcurrentState,
  pendingSavedBoardSnapshot: { current: null }, boardEditorDraftSnapshot: JSON.stringify,
  updateState: updater => { saved = updater(shared); }
});
assert.deepEqual(saved.boardPrograms[0].panels[0].donorIds, ["explore-donor"], "saving Play must not restore the stale Explore roster");
assert.equal(saved.boardPrograms[0].panels[1].fontSize, 44);
assert.match(app.slice(app.indexOf("const pullLatestSiteChanges"), app.indexOf("const applyPendingSiteUpdate")), /loadSharedLanternStateSnapshot\(\{ updateSyncContext: false \}\)/, "Checking for updates must not advance the save baseline");
console.log("Board save handoff checks passed: later donor edits survive a delayed acknowledgement.");
