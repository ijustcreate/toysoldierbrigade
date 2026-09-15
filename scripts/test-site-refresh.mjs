import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../src/components/SiteRefreshButton.tsx", import.meta.url), "utf8");
const handler = source.slice(source.indexOf("  const refresh = async"), source.indexOf("  return <button"));
for (const mode of ["success", "dirty", "pending", "offline", "edit-during-fetch"]) {
  const calls = [];
  let navigated;
  let checks = 0;
  const context = {
    URL, Event, Error, Date, SITE_REFRESH_REQUEST: "refresh",
    setBusy: () => {}, hasPendingSharedSave: () => mode === "pending",
    loadSharedLanternStateSnapshot: async options => {
      calls.push(options);
      if (mode === "offline") throw new Error("offline");
      return { state: { boardPrograms: [] } };
    },
    fetch: async (url, options) => { assert.equal(options.cache, "no-store"); return { ok: true }; },
    window: {
      dispatchEvent: () => { checks++; return mode !== "dirty" && !(mode === "edit-during-fetch" && checks > 1); },
      alert: () => {},
      location: { href: "https://museum.example/app/?display=2#/theme", replace: url => { navigated = new URL(url); } }
    }
  };
  await vm.runInNewContext(`${handler}\nrefresh()`, context);
  if (mode === "success") {
    assert.equal(navigated.hash, "#/theme");
    assert.equal(navigated.searchParams.get("display"), "2");
    assert.ok(navigated.searchParams.has("lantern-refresh"));
    assert.equal(calls[0].updateSyncContext, false);
  } else assert.equal(navigated, undefined, `${mode} must not discard the current page`);
}
console.log("Site refresh checks passed: newest-build navigation, shared read, offline and unsaved-work protection.");
