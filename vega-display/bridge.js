/* Runs before the hosted app: device-local preferences and display-only guardrails. */
(function () {
  if (window.__lanternVega) return;
  window.__lanternVega = true;
  var key = 'lantern-vega-display-route-v1';
  var portraitSite = /^#\/dashboard\?vega=portrait&mount=(clockwise|counterclockwise)$/.test(location.hash);
  var portraitMount = portraitSite ? location.hash.match(/mount=(clockwise|counterclockwise)/)[1] : null;
  function validDisplay(hash) {
    return /^#\/display\/[^/?#]+\?tv=1&mount=(none|clockwise|counterclockwise)$/.test(hash);
  }
  function displayMount(hash) {
    var match = hash.match(/[?&]mount=(none|clockwise|counterclockwise)/);
    return match ? match[1] : 'none';
  }
  function normalSiteRoute(hash) {
    return /^#\/(?!tv(?:[/?#]|$)|display(?:-wall)?\/|announcement-demo\/)/.test(hash);
  }
  function read() {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function send(type) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: type }));
  }
  // This app never edits board data or uploads assets, including through future UI changes.
  function canRequest(method) { return /^(GET|HEAD|OPTIONS)$/i.test(method || 'GET'); }
  var originalFetch = window.fetch.bind(window);
  window.fetch = function (input, options) {
    var method = (options && options.method) || (input && input.method) || 'GET';
    if (!canRequest(method)) return Promise.reject(new Error('Recognition display is read-only'));
    return originalFetch(input, options);
  };
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method) {
    if (!canRequest(method)) throw new Error('Recognition display is read-only');
    return open.apply(this, arguments);
  };
  // Display presence/signaling still uses the existing WebSocket, but a state
  // publication must never reach another operator's browser through that relay.
  if (window.WebSocket) {
    var socketSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data) {
      try {
        var envelope = JSON.parse(data);
        if ((envelope.message || envelope).type === 'state-update') return;
      } catch (_) { return; }
      return socketSend.call(this, data);
    };
  }
  if (navigator.sendBeacon) navigator.sendBeacon = function () { return false; };
  window.open = function () { return null; };
  function applyPortraitSite() {
    var active = portraitSite && normalSiteRoute(location.hash) && portraitMount !== 'none';
    document.documentElement.classList.toggle('lantern-vega-portrait-site', active);
    document.documentElement.classList.toggle('lantern-vega-portrait-clockwise', active && portraitMount === 'clockwise');
    document.documentElement.classList.toggle('lantern-vega-portrait-counterclockwise', active && portraitMount === 'counterclockwise');
    var viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) viewport.setAttribute('content', active ? 'width=720, initial-scale=1, maximum-scale=1, user-scalable=no' : 'width=device-width, initial-scale=1');
  }
  var saved = read();
  if (!portraitSite) {
    if (validDisplay(saved)) history.replaceState(null, '', saved);
    else history.replaceState(null, '', '#/tv');
  }
  window.addEventListener('hashchange', function (event) {
    var hash = location.hash;
    if (validDisplay(hash)) {
      portraitSite = false;
      portraitMount = null;
      try { localStorage.setItem(key, hash); } catch (_) { send('storage-unavailable'); }
    } else if (portraitSite && normalSiteRoute(hash)) {
      applyPortraitSite();
    } else if (hash !== '#/tv') {
      event.stopImmediatePropagation();
      location.replace('#/tv');
    }
  }, true);
  // Refreshing stays on this route, while Back intentionally opens setup.
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === 'BrowserBack' || event.keyCode === 461) {
      if (validDisplay(location.hash)) {
        event.preventDefault(); event.stopImmediatePropagation();
        portraitMount = displayMount(location.hash);
        if (portraitMount === 'clockwise' || portraitMount === 'counterclockwise') {
          portraitSite = true;
          location.replace('#/dashboard?vega=portrait&mount=' + portraitMount);
        } else {
          location.replace('#/dashboard');
        }
      }
      return;
    }
    if (location.hash !== '#/tv') return;
    var buttons = Array.from(document.querySelectorAll('.tv-mode-card button:not(:disabled)'))
      .filter(function (button) { return button.getClientRects().length > 0; });
    if (!buttons.length) return;
    var index = buttons.indexOf(document.activeElement);
    if (/^Arrow(Up|Down|Left|Right)$/.test(event.key)) {
      event.preventDefault(); event.stopImmediatePropagation();
      var step = /Up|Left/.test(event.key) ? -1 : 1;
      buttons[index < 0 ? 0 : (index + step + buttons.length) % buttons.length].focus();
    } else if (event.key === 'Enter' && index < 0) {
      event.preventDefault(); event.stopImmediatePropagation(); buttons[0].focus();
    }
  }, true);
  function ready() {
    var style = document.createElement('style');
    style.textContent = '.tv-mode-header button{display:none!important} button:focus-visible{outline:5px solid #fff!important;outline-offset:5px!important}'
      + '.lantern-vega-portrait-site,.lantern-vega-portrait-site body{width:100%;height:100%;overflow:hidden!important}'
      + '.lantern-vega-portrait-site #root{position:fixed;top:50%;left:50%;width:100vh;height:100vw;overflow:auto;overscroll-behavior:contain}'
      + '.lantern-vega-portrait-clockwise #root{transform:translate(-50%,-50%) rotate(-90deg)}'
      + '.lantern-vega-portrait-counterclockwise #root{transform:translate(-50%,-50%) rotate(90deg)}';
    document.head.appendChild(style);
    applyPortraitSite();
    send('ready');
    // A responsive page signals health. Background suspension is not a crash.
    setInterval(function () { send('heartbeat'); }, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
  return true;
})();
