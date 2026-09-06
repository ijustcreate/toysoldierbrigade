import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/displayWakeLock.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const flush = () => new Promise((resolve) => setImmediate(resolve));
function fixture({ supported = true, hidden = false } = {}) {
  const document = new EventTarget();
  document.visibilityState = hidden ? "hidden" : "visible";
  const window = new EventTarget();
  let pulse;
  window.setInterval = (callback, ms) => { assert.equal(ms, 60_000); pulse = callback; return 1; };
  window.clearInterval = () => { pulse = undefined; };
  let requests = 0;
  const locks = [];
  let nextRequest;
  const navigator = supported ? { wakeLock: { request: async (type) => {
    assert.equal(type, "screen");
    requests++;
    if (nextRequest) return nextRequest();
    const lock = new EventTarget();
    lock.released = false;
    lock.release = async () => { lock.released = true; lock.dispatchEvent(new Event("release")); };
    locks.push(lock);
    return lock;
  } } } : {};
  const context = { exports: {}, document, window, navigator };
  vm.runInNewContext(compiled, context);
  return {
    start: context.exports.startDisplayWakeLock, document, window, locks,
    get requests() { return requests; },
    set request(fn) { nextRequest = fn; },
    pulse: () => pulse?.(), get timerActive() { return Boolean(pulse); },
    visible(value) { document.visibilityState = value ? "visible" : "hidden"; document.dispatchEvent(new Event("visibilitychange")); },
    focus() { window.dispatchEvent(new Event("focus")); }
  };
}

const f = fixture();
const stop = f.start();
await flush();
assert.equal(f.requests, 1);
f.focus(); f.pulse(); f.visible(true);
await flush();
assert.equal(f.requests, 1, "held lock must not generate duplicate requests");
await f.locks[0].release();
f.pulse(); await flush();
assert.equal(f.requests, 2, "released lock is retried");
f.visible(false); await f.locks[1].release(); f.pulse(); f.focus();
await flush(); assert.equal(f.requests, 2, "hidden pages must not request locks");
f.visible(true); await flush(); assert.equal(f.requests, 3);
stop(); await flush();
assert.equal(f.locks[2].released, true);
assert.equal(f.timerActive, false);
f.focus(); f.visible(true); f.pulse(); await flush(); assert.equal(f.requests, 3);

const rejected = fixture();
rejected.request = () => Promise.reject(new Error("Power policy"));
const stopRejected = rejected.start(); await flush();
rejected.request = undefined;
rejected.focus(); await flush(); assert.equal(rejected.requests, 2);
stopRejected();

for (const cleanup of ["unmount", "hidden"]) {
  const pending = fixture();
  let resolve;
  pending.request = () => new Promise((done) => { resolve = done; });
  const dispose = pending.start();
  pending.focus(); pending.pulse(); assert.equal(pending.requests, 1);
  if (cleanup === "unmount") dispose(); else pending.visible(false);
  const late = new EventTarget();
  late.released = false;
  late.release = async () => { late.released = true; };
  resolve(late); await flush();
  assert.equal(late.released, true, `late lock is released after ${cleanup}`);
  dispose();
}
const unsupported = fixture({ supported: false });
const stopUnsupported = unsupported.start(); unsupported.focus(); unsupported.pulse(); stopUnsupported();
const hidden = fixture({ hidden: true });
const stopHidden = hidden.start(); assert.equal(hidden.requests, 0);
hidden.visible(true); await flush(); assert.equal(hidden.requests, 1); stopHidden();

const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
assert.match(app, /export function App\(\) \{\s*\/\/[^\n]*\n\s*useEffect\(\(\) => startDisplayWakeLock\(\), \[\]\);/);
assert.equal((app.match(/startDisplayWakeLock\(\)/g) ?? []).length, 1, "one owner above all route branches");
assert.match(app, /allow="autoplay; fullscreen; screen-wake-lock"/);
console.log("Wake-lock lifecycle passed: all-route ownership, unsupported/rejected API, retry, visibility, cleanup, and pending-request races.");
