import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync(new URL('./bridge.js', import.meta.url), 'utf8');
function browser(saved, storageBroken = false) {
  const listeners = {};
  const writes = [];
  const requests = [];
  const messages = [];
  const storage = new Map(saved ? [['lantern-vega-display-route-v1', saved]] : []);
  const location = { hash: '#/tv', replace(value) { this.hash = value; } };
  function XMLHttpRequest() {}
  XMLHttpRequest.prototype.open = (...args) => requests.push(args);
  function WebSocket() {}
  WebSocket.prototype.send = data => writes.push(data);
  const context = {
    location, XMLHttpRequest, WebSocket,
    navigator: { sendBeacon: () => { throw new Error('Unexpected write'); } },
    history: { replaceState(_, __, hash) { location.hash = hash; } },
    localStorage: {
      getItem: key => { if (storageBroken) throw new Error('Storage unavailable'); return storage.get(key); },
      setItem: (key, value) => { if (storageBroken) throw new Error('Storage unavailable'); storage.set(key, value); },
    },
    document: { readyState: 'loading', addEventListener() {}, querySelectorAll: () => [] },
    setInterval() {},
    fetch: (...args) => { requests.push(args); return Promise.resolve('read'); },
    addEventListener: (type, listener) => { listeners[type] = listener; },
    ReactNativeWebView: { postMessage: value => messages.push(JSON.parse(value)) },
  };
  context.window = context;
  vm.runInNewContext(script, context);
  return { context, storage, listeners, requests, writes, messages };
}

const route = '#/display/portrait%20one?tv=1&mount=clockwise';
const b = browser(route);
assert.equal(b.context.location.hash, route, 'cold launch restores selected display');
for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  await assert.rejects(b.context.fetch('https://example.test/state', { method }), /read-only/);
  await assert.rejects(b.context.fetch({ url: 'https://example.test/state', method }), /read-only/);
  assert.throws(() => new b.context.XMLHttpRequest().open(method, '/state'), /read-only/);
}
assert.equal(b.requests.length, 0, 'writes never reach transport');
assert.equal(await b.context.fetch('/state'), 'read');
assert.equal(b.context.navigator.sendBeacon('/state', 'data'), false);
const socket = new b.context.WebSocket();
socket.send(JSON.stringify({ message: { type: 'state-update', state: {} } }));
assert.equal(b.writes.length, 0, 'state is not relayed to other operators');
socket.send(JSON.stringify({ message: { type: 'display-session-status', status: 'online' } }));
assert.equal(b.writes.length, 1, 'display presence still works');
b.context.location.hash = '#/dashboard';
let stopped = false;
b.listeners.hashchange({ stopImmediatePropagation() { stopped = true; } });
assert.equal(stopped, true);
assert.equal(b.context.location.hash, '#/tv', 'editor routes cannot mount');
b.context.location.hash = '#/display/second?tv=1&mount=counterclockwise';
b.listeners.hashchange({});
assert.equal(b.storage.get('lantern-vega-display-route-v1'), b.context.location.hash);
assert.equal(browser('#/dashboard').context.location.hash, '#/tv');
const broken = browser(null, true);
broken.context.location.hash = route;
broken.listeners.hashchange({});
assert.equal(broken.messages[0].type, 'storage-unavailable');
console.log('PASS: saved selection, invalid routes, denied storage, HTTP write protection, relay protection, live reads and presence.');
