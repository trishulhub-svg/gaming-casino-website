/**
 * AgentFix — Lightweight client-side monitoring agent
 * Captures: JS errors, unhandled rejections, console errors, slow API calls, page load timing
 * Reports to: /api/agentfix/report
 * Loaded on every page via <Script src="/agentfix.js" />
 */
(function () {
  'use strict';

  // Prevent double-init
  if (window.__AGENTFIX__) return;
  window.__AGENTFIX__ = true;

  var ENDPOINT = '/api/agentfix/report';
  var SESSION_ID = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  var QUEUE = [];
  var FLUSH_INTERVAL = 10000; // 10 seconds
  var MAX_QUEUE = 20;

  function safeStringify(obj) {
    try {
      return typeof obj === 'string' ? obj : JSON.stringify(obj);
    } catch (e) {
      return '[unserializable]';
    }
  }

  function send(payload) {
    payload.session = SESSION_ID;
    payload.url = window.location.href;
    payload.timestamp = new Date().toISOString();
    payload.userAgent = navigator.userAgent;

    QUEUE.push(payload);
    if (QUEUE.length >= MAX_QUEUE) flush();
  }

  function flush() {
    if (QUEUE.length === 0) return;
    var batch = QUEUE.splice(0, QUEUE.length);
    try {
      // Use sendBeacon for reliability during page unload
      if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify({ events: batch })], { type: 'application/json' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
      // Fallback to fetch
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {
      // Silently fail — don't crash the page
    }
  }

  // === 1. Capture JS errors ===
  window.addEventListener('error', function (e) {
    send({
      type: 'js_error',
      message: e.message,
      filename: e.filename,
      line: e.lineno,
      column: e.colno,
      stack: e.error && e.error.stack ? e.error.stack : null,
    });
  });

  // === 2. Capture unhandled promise rejections ===
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    send({
      type: 'promise_rejection',
      message: reason && reason.message ? reason.message : safeStringify(reason),
      stack: reason && reason.stack ? reason.stack : null,
    });
  });

  // === 3. Capture console.error ===
  var origConsoleError = console.error;
  console.error = function () {
    try {
      var args = Array.prototype.slice.call(arguments);
      send({
        type: 'console_error',
        message: args.map(safeStringify).join(' ').slice(0, 2000),
      });
    } catch (e) {}
    origConsoleError.apply(console, arguments);
  };

  // === 4. Capture slow / failed fetch calls ===
  var origFetch = window.fetch;
  window.fetch = function () {
    var args = arguments;
    var start = Date.now();
    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';

    return origFetch.apply(this, args).then(
      function (response) {
        var duration = Date.now() - start;
        if (!response.ok) {
          send({
            type: 'fetch_error',
            url: url,
            status: response.status,
            duration: duration,
          });
        } else if (duration > 5000) {
          send({
            type: 'fetch_slow',
            url: url,
            status: response.status,
            duration: duration,
          });
        }
        return response;
      },
      function (err) {
        send({
          type: 'fetch_failed',
          url: url,
          message: err && err.message ? err.message : safeStringify(err),
          duration: Date.now() - start,
        });
        throw err;
      }
    );
  };

  // === 5. Page load timing ===
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (window.performance && window.performance.timing) {
        var t = window.performance.timing;
        send({
          type: 'page_load',
          domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
          loadComplete: t.loadEventEnd - t.navigationStart,
          domInteractive: t.domInteractive - t.navigationStart,
          responseEnd: t.responseEnd - t.navigationStart,
        });
      }
    }, 0);
  });

  // === 6. Flush on page unload ===
  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });

  // === 7. Periodic flush ===
  setInterval(flush, FLUSH_INTERVAL);

  // === 8. Ping on session start ===
  send({
    type: 'session_start',
    referrer: document.referrer,
    viewport: window.innerWidth + 'x' + window.innerHeight,
    language: navigator.language,
  });

  console.log('[AgentFix] Monitoring active. Session:', SESSION_ID);
})();
