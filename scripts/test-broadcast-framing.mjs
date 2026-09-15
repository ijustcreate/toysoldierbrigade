import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import vm from "node:vm";
import ts from "typescript";

const dir = await mkdtemp(path.join(os.tmpdir(), "lantern-framing-"));
try {
  const outfile = path.join(dir, "test.mjs");
  await build({ stdin: { contents: 'export * from "./src/broadcastFramingProfiles"; export * from "./src/broadcastVideoFraming"; export { initialState } from "./src/sampleData"; export { normalizeState, serializableSharedState } from "./src/host/lanternHost";', resolveDir: process.cwd() }, outfile, bundle: true, platform: "node", format: "esm", define: { "import.meta.env": JSON.stringify({ DEV: true, BASE_URL: "/" }) }, logLevel: "silent" });
  const api = await import(pathToFileURL(outfile).href);
  const state = structuredClone(api.initialState);
  const original = structuredClone(state);
  const wide = { id: "display-2", orientation: "Landscape" };
  const tall = { id: "display-1", orientation: "Portrait" };
  let live = state.live;
  const legacy = api.liveCompositionForDisplay(live, wide).frame;
  for (const cameraOrientation of ["Landscape", "Portrait"]) {
    live = { ...live, cameraOrientation };
    for (const screen of [wide, tall]) {
      const x = (cameraOrientation === "Portrait" ? 12 : 4) + (screen.orientation === "Portrait" ? 3 : 0);
      live = api.patchBroadcastLayout(live, screen, { frame: { ...legacy, x, width: 60 } });
    }
  }
  for (const cameraOrientation of ["Landscape", "Portrait"]) {
    for (const screen of [wide, tall]) {
      const expected = (cameraOrientation === "Portrait" ? 12 : 4) + (screen.orientation === "Portrait" ? 3 : 0);
      assert.equal(api.liveCompositionForDisplay({ ...live, cameraOrientation }, screen).frame.x, expected);
    }
  }
  assert.deepEqual(live.frame, original.live.frame, "legacy framing remains unchanged");
  const beforeDrag = api.liveCompositionForDisplay(live, wide).frame;
  live = api.patchBroadcastLayout(live, wide, { frame: { ...beforeDrag, rotation: 45, crop: { ...beforeDrag.crop, scale: 1.5 } } });
  live = api.patchBroadcastLayout(live, wide, { frame: { ...beforeDrag, x: 22 } }, beforeDrag);
  const afterDrag = api.liveCompositionForDisplay(live, wide).frame;
  assert.equal(afterDrag.x, 22);
  assert.equal(afterDrag.rotation, 45, "finishing a move preserves a newer rotation setting");
  assert.equal(afterDrag.crop.scale, 1.5, "finishing a move preserves a newer zoom setting");
  const switched = api.patchBroadcastLayout({ ...live, cameraOrientation: "Landscape" }, wide, { frame: { ...afterDrag, y: 9 } }, afterDrag, "Portrait");
  assert.equal(switched.cameraOrientation, "Landscape");
  assert.equal(api.liveCompositionForDisplay({ ...switched, cameraOrientation: "Portrait" }, wide).frame.y, 9, "gesture commits to its original source profile after a switch");
  state.live = switched;
  const reloaded = api.normalizeState(JSON.parse(JSON.stringify(api.serializableSharedState(state))));
  assert.deepEqual(reloaded.live.framingProfiles, state.live.framingProfiles, "profiles survive save/reload");
  state.live = original.live;
  assert.deepEqual(state, original, "framing edits never change any board or other state");
  const frame = { ...legacy, x: 20, y: 15, width: 40, height: 30 };
  for (const edge of ["nw", "ne", "sw", "se"]) {
    for (const delta of [-1000, -20, 20, 1000]) {
      const resized = api.resizeBroadcastFrame(frame, edge, delta, delta);
      assert.ok(resized.x >= -1e-8 && resized.y >= -1e-8 && resized.x + resized.width <= 100.000001 && resized.y + resized.height <= 100.000001);
      assert.ok(Math.abs(resized.width / resized.height - frame.width / frame.height) < 1e-8);
      assert.ok(Math.abs((edge.includes("w") ? resized.x + resized.width : resized.x) - (edge.includes("w") ? frame.x + frame.width : frame.x)) < 1e-8);
    }
  }
  const app = await readFile("src/App.tsx", "utf8");
  const start = app.indexOf("  const finishDrag =", app.indexOf("function DirectLiveStage"));
  const end = app.indexOf("  const beginTextDrag =", start);
  const code = ts.transpileModule(app.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  let committed;
  const context = { dragRef: { current: { pointerId: 1, frame, commit: (result, baseline) => { committed = { result, baseline }; } } }, frameDraftRef: { current: { ...frame, x: 25 } }, setFrameDraft: () => {}, event: { pointerId: 1, currentTarget: { hasPointerCapture: () => false } } };
  vm.runInNewContext(`${code}\nfinishDrag(event);`, context);
  assert.equal(committed.result.x, 25);
  assert.equal(committed.baseline, frame);
  assert.equal(context.dragRef.current, null);
  console.log("Broadcast framing passed: four independent orientation combinations, concurrent edits, gesture commit, bounded resizing, reload and board preservation.");
} finally { await rm(dir, { recursive: true, force: true }); }
