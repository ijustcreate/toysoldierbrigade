import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/donorRoster.ts", import.meta.url), "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 }
}).outputText;
const roster = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);

const programs = [{ id: "brigade", levels: [{ id: "explore", name: "Explore" }, { id: "play", name: "Play" }] }];
const donors = [
  { id: "ada", name: "Ada Lovelace", tier: "Founding", tags: ["Legacy"], donationType: "Cash" },
  { id: "grace", name: "Grace Hopper", givingProgramId: "brigade", givingLevelId: "explore", tags: ["Class of 2026"], donationType: "Sponsorship" },
  { id: "katherine", name: "Katherine Johnson", givingProgramId: "brigade", givingLevelId: "play", tags: ["Volunteer"], donationType: "Volunteer" }
];

assert.deepEqual(roster.filterDonorRoster(donors, programs, { query: "grace", facet: "all", donationType: "all" }).map(({ id }) => id), ["grace"]);
assert.deepEqual(roster.filterDonorRoster(donors, programs, { query: "", facet: "Explore", donationType: "all" }).map(({ id }) => id), ["grace"]);
assert.deepEqual(roster.filterDonorRoster(donors, programs, { query: "", facet: "Legacy", donationType: "all" }).map(({ id }) => id), ["ada"]);
assert.deepEqual(roster.filterDonorRoster(donors, programs, { query: "", facet: "all", donationType: "Volunteer" }).map(({ id }) => id), ["katherine"]);

const selected = ["ada", "grace"];
const shown = roster.filterDonorRoster(donors, programs, { query: "katherine", facet: "all", donationType: "all" }).map(({ id }) => id);
assert.deepEqual(selected, ["ada", "grace"], "filtering must not mutate membership");
assert.deepEqual(roster.updateDonorRosterMembership(selected, shown, "add"), ["ada", "grace", "katherine"]);
assert.deepEqual(roster.updateDonorRosterMembership(["ada", "grace", "katherine"], shown, "remove"), ["ada", "grace"], "removing shown donors must preserve hidden selections");

console.log("Donor roster membership fixture passed.");
