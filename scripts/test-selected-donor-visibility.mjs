import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/donorRoster.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText;
const { resolvePanelDonors, donorListRowCount } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const donors = [
  { id: "inactive", name: "Selected household", active: false, tier: "Play" },
  { id: "active", name: "Other donor", active: true, tier: "Explore" },
  { id: "outside", name: "Selected outside board roster", active: true, tier: "Play" }
];
const original = structuredClone(donors);
assert.deepEqual(resolvePanelDonors(donors, ["active"], { donorIds: ["inactive", "outside", "inactive"], donorTierFilter: ["Explore"] }).map(d => d.id), ["inactive", "outside"], "Explicit selections override status, tier, and stale board-level membership without duplicates");
assert.deepEqual(resolvePanelDonors(donors, ["active"], { donorIds: [] }), [], "An explicitly empty list stays empty");
assert.deepEqual(resolvePanelDonors(donors, ["inactive", "active"], {}).map(d => d.id), ["active"], "Unconfigured legacy lists retain automatic filtering");
assert.deepEqual(resolvePanelDonors(donors, [], { donorIds: ["missing"] }), []);
assert.equal(donorListRowCount(31, 2, 6), 16, "A saved row limit cannot truncate selected names");
assert.equal(donorListRowCount(3, 2, 8), 8, "Authored extra rows are preserved");
assert.deepEqual(donors, original, "Rendering must not change donor records");
console.log("Selected donor visibility checks passed.");
