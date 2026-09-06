import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "lantern-state-test-"));
const bundledModule = path.join(temporaryDirectory, "state.mjs");

try {
  await build({
    stdin: {
      contents: `export { normalizeState, serializableSharedState } from "./src/host/lanternHost.ts"; export { initialState, LANTERN_CONTENT_VERSION } from "./src/sampleData.ts";`,
      resolveDir: process.cwd(),
      sourcefile: "state-preservation-entry.ts"
    },
    outfile: bundledModule,
    bundle: true,
    platform: "node",
    format: "esm",
    define: { "import.meta.env": JSON.stringify({ DEV: false, BASE_URL: "/", VITE_LANTERN_SERVICE_ENDPOINT: "", VITE_LANTERN_BUG_ENDPOINT: "", VITE_LANTERN_READ_ENDPOINT: "" }) },
    logLevel: "silent"
  });
  const { initialState, LANTERN_CONTENT_VERSION, normalizeState, serializableSharedState } = await import(`${pathToFileURL(bundledModule).href}?${Date.now()}`);
  const customized = structuredClone(initialState);
  customized.contentVersion = LANTERN_CONTENT_VERSION;
  const programIndex = customized.boardPrograms.findIndex((program) => program.id === "board-toy-soldier-portrait");
  assert.notEqual(programIndex, -1, "fixture board must exist");
  const program = customized.boardPrograms[programIndex];
  program.name = "Museum-authored roster";
  program.fontFamily = "Poppins";
  program.nameSize = 43;
  program.panels = [
    { id: "authored-heading", type: "heading", eyebrow: "Museum staff copy", title: "Every saved word stays", body: "Do not restore a template here.", size: "feature", x: 4.25, y: 7.5, width: 91.5, height: 14.75, fontFamily: "Poppins", fontSize: 61, textColor: "#f4cc54", letterSpacing: 1.7, lineHeight: 1.4, fontWeight: "bold", fontStyle: "italic", underline: true, textAlign: "center" },
    { id: "authored-donors", type: "donors", title: "Play donors", size: "feature", columns: 2, rows: 7, donorIds: [...program.donorIds], x: 5, y: 25, width: 90, height: 63, fontFamily: "DM Sans", fontSize: 37, lineHeight: 1.3, donorRowGap: 19, donorColumnGap: 11, donorDividerColor: "#52789a", donorDividerThickness: 2, donorDividerOpacity: 0.65 },
    { id: "authored-brass-image", type: "image", title: "Staff-sized brass image", size: "standard", x: 12, y: 89, width: 76, height: 9.5, imageUrl: "/assets/board-accents/brass-arch.png", imageFit: "contain" }
  ];
  customized.boardPrograms[programIndex] = program;
  customized.schedules = [{ id: "museum-authored-schedule", name: "Museum-authored board hours", target: "display-1", boardId: program.id, contentType: "board", days: [0, 1, 2, 3, 4, 5, 6], recurrence: "weekly", startTime: "13:00", endTime: "21:00", active: true, color: "#335577" }];

  const normalized = normalizeState(structuredClone(customized));
  assert.deepEqual(
    JSON.parse(JSON.stringify(normalized.boardPrograms)),
    JSON.parse(JSON.stringify(customized.boardPrograms)),
    "current saved board content and every serialized panel field must survive normalization exactly"
  );
  assert.deepEqual(normalized.schedules, customized.schedules, "current saved schedules must survive normalization exactly");

  const roundTripped = JSON.parse(JSON.stringify({ state: serializableSharedState(normalized) })).state;
  assert.deepEqual(roundTripped.boardPrograms, JSON.parse(JSON.stringify(customized.boardPrograms)), "shared serialization must preserve authored copy, typography, spacing, and geometry");
  assert.deepEqual(roundTripped.schedules, JSON.parse(JSON.stringify(customized.schedules)), "shared serialization must preserve schedules");

  if (process.env.LANTERN_STATE_FIXTURE) {
    const payload = JSON.parse(await readFile(process.env.LANTERN_STATE_FIXTURE, "utf8"));
    const fixtureState = payload.state ?? payload;
    assert.equal(fixtureState.contentVersion, LANTERN_CONTENT_VERSION, "external preservation fixture must already use the current schema");
    const fixtureNormalized = normalizeState(structuredClone(fixtureState));
    assert.deepEqual(JSON.parse(JSON.stringify(fixtureNormalized.boardPrograms)), JSON.parse(JSON.stringify(fixtureState.boardPrograms)), "external current-version boards must survive normalization");
    assert.deepEqual(JSON.parse(JSON.stringify(fixtureNormalized.schedules)), JSON.parse(JSON.stringify(fixtureState.schedules)), "external current-version schedules must survive normalization");
    console.log("External read-only board and schedule fixture also survived normalization.");
  }

  console.log("Current-version board normalization and serialization preservation checks passed.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
