import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
for (const path of ["vega-display/App.tsx", "vega-display/bridge.js", "vega-display/prepare.mjs"]) {
  await assert.rejects(access(new URL(path, root)), { code: "ENOENT" }, `${path} is retired`);
}
const native = await readFile(new URL("src-tauri/src/lib.rs", root), "utf8");
assert.doesNotMatch(native, /fire_tv_key|Command::new\("adb"\)/, "retired remote command is not callable");
assert.match(native, /fn open_test_displays\(/, "generic native display support remains");
const app = await readFile(new URL("src/App.tsx", root), "utf8");
assert.match(app, /function DisplayApp\(/, "browser display route remains");
assert.match(app, /startDisplayWakeLock\(/, "generic keep-awake behavior remains");
const metadata = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
assert.match(metadata.description, /mini-PC/);
assert.doesNotMatch(metadata.description, /Fire|Silk|Vega/);
console.log("PC display platform checks passed; generic browser/Windows display support retained.");
