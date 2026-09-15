import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { build } from "esbuild";

const temporary = await mkdtemp(path.join(os.tmpdir(), "lantern-list-isolation-"));
try {
  const outfile = path.join(temporary, "fixture.mjs");
  await build({ stdin: { contents: 'export * from "./src/donorRoster.ts"; export { normalizeState, serializableSharedState } from "./src/host/lanternHost.ts"; export { initialState } from "./src/sampleData.ts";', resolveDir: process.cwd() }, outfile, bundle: true, platform: "node", format: "esm", define: { "import.meta.env": JSON.stringify({ DEV: false, BASE_URL: "/", VITE_LANTERN_SERVICE_ENDPOINT: "", VITE_LANTERN_BUG_ENDPOINT: "" }) }, logLevel: "silent" });
  const api = await import(pathToFileURL(outfile).href);
  const app = await readFile("src/App.tsx", "utf8");
  const compile = (source) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
  const optionsCode = compile(app.slice(app.indexOf("function donorListOptions("), app.indexOf("function DonorListPicker(")));
  const saveCode = compile(app.slice(app.indexOf("  const saveDonor = () => {"), app.indexOf("  const deleteDonor =", app.indexOf("  const saveDonor = () => {"))));
  assert.ok(saveCode.includes("const saveDonor"));
  const toggleCode = compile(app.slice(app.indexOf("  const toggleSelectedDonorList ="), app.indexOf("  const addDonorImage =")));
  const donor = (id, tier) => ({ ...api.initialState.donors[0], id, name: id, tier, active: true, boardIds: ["separate"] });
  const initial = structuredClone(api.initialState);
  initial.donors = [donor("explore", "Explore"), donor("play", "Play"), donor("extra", "Explore")];
  initial.boardPrograms = [{ ...initial.boardPrograms[0], id: "separate", name: "Two separate lists", donorIds: ["explore", "play"], panels: [
    { id: "explore-list", type: "donors", title: "Explore", donorTierFilter: ["Explore"] },
    { id: "play-list", type: "donors", title: "Play", donorTierFilter: ["Play"] }
  ] }];
  const lists = (state) => state.boardPrograms[0].panels.map((panel) => api.resolvePanelDonors(state.donors, state.boardPrograms[0].donorIds, panel).map((d) => d.id));
  assert.deepEqual(lists(initial), [["explore"], ["play"]]);
  const edited = structuredClone(initial);
  edited.boardPrograms[0].panels = api.materializeDonorPanelMembership(edited.boardPrograms[0].panels, "explore-list", ["explore", "play"], ["explore", "extra"], edited.donors);
  edited.boardPrograms[0].donorIds.push("extra");
  assert.deepEqual(lists(edited), [["explore", "extra"], ["play"]], "editing Explore must freeze only the effective Play membership");
  const reloaded = api.normalizeState(JSON.parse(JSON.stringify(api.serializableSharedState(edited))));
  assert.deepEqual(lists(reloaded), lists(edited), "save/reload preserves both lists");

  function contextFor(state, draftId, selectedIds, originalIds = selectedIds) {
    const context = { ...api, state: structuredClone(state), draft: { ...state.donors.find((d) => d.id === draftId), name: "Edited profile" }, draftDonorListIds: [...selectedIds], originalDonorListIds: [...originalIds], donorDisplayName: (d) => d.name,
      setDraft: (draft) => { context.draft = draft; }, setDraftDonorListIds: (ids) => { context.draftDonorListIds = ids; }, setOriginalDonorListIds: (ids) => { context.originalDonorListIds = ids; }, setEditingId: () => {}, setDiscardDraftPending: () => {}, updateState: (updater) => { context.state = updater(context.state); } };
    vm.createContext(context);
    vm.runInContext(optionsCode, context);
    context.availableDonorLists = vm.runInContext("donorListOptions(state)", context);
    return context;
  }
  const profile = contextFor(initial, "play", ["separate::play-list"]);
  vm.runInContext(`${saveCode}\nsaveDonor();`, profile);
  assert.deepEqual(lists(profile.state), [["explore"], ["play"]], "saving a profile must not replace panel memberships");
  const added = contextFor(initial, "extra", ["separate::explore-list"], []);
  vm.runInContext(`${saveCode}\nsaveDonor();`, added);
  assert.deepEqual(lists(added.state), [["explore", "extra"], ["play"]], "profile assignment adds to one list only");
  const toggled = contextFor(initial, "extra", []);
  toggled.selectedDonorListId = "separate::explore-list";
  vm.runInContext(`${toggleCode}\ntoggleSelectedDonorList();`, toggled);
  assert.deepEqual(lists(toggled.state), [["explore", "extra"], ["play"]], "immediate Add targets only the chosen list");
  vm.runInContext("toggleSelectedDonorList();", toggled);
  assert.deepEqual(lists(toggled.state), [["explore"], ["play"]], "immediate Remove leaves the other list intact");
  const overlapping = structuredClone(edited);
  overlapping.boardPrograms[0].panels[1].donorIds = ["play", "extra"];
  const removed = contextFor(overlapping, "extra", ["separate::explore-list", "separate::play-list"]);
  removed.selectedDonorListId = "separate::explore-list";
  vm.runInContext(`${toggleCode}\ntoggleSelectedDonorList();`, removed);
  assert.deepEqual(lists(removed.state), [["explore"], ["play", "extra"]], "removing from one list preserves intentional membership in another");
  assert.ok(removed.state.boardPrograms[0].donorIds.includes("extra"));
  const empty = structuredClone(edited);
  empty.boardPrograms[0].panels[0].donorIds = [];
  const unchanged = contextFor(empty, "play", ["separate::play-list"]);
  vm.runInContext(`${saveCode}\nsaveDonor();`, unchanged);
  assert.deepEqual(lists(unchanged.state), [[], ["play"]], "an intentionally empty list stays empty after a profile save");
  console.log("Independent donor-list checks passed: filtered inheritance, profile save, per-list add/remove, and serialization/reload.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
