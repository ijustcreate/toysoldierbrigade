import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/displayStateRefresh.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { createDisplayStateRefreshGuard } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const guard = createDisplayStateRefreshGuard();
assert.equal(guard.accept(guard.begin(), "local"), true, "Offline startup can use cached state");
assert.equal(guard.accept(guard.begin(), "shared"), true, "Published schedule replaces startup cache");
assert.equal(guard.accept(guard.begin(), "local"), false, "Failed polls cannot erase the published schedule");
const pending = guard.begin();
guard.receivedLiveUpdate();
assert.equal(guard.accept(pending, "shared"), false, "A pending request cannot overwrite a newer live update");
assert.equal(guard.accept(guard.begin(), "shared"), true, "Subsequent successful polls still apply schedule changes and removals");
const pushed = createDisplayStateRefreshGuard();
pushed.receivedLiveUpdate();
assert.equal(pushed.accept(pushed.begin(), "local"), false, "Live updates are retained even before the first successful poll");
console.log("Display refresh regression checks passed.");
