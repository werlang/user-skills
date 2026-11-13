/**
 * recorder.js — record the requests a page sends (fetch + XHR), with bodies and responses.
 * Learn an unknown payload by watching the real UI do it once:
 *
 *   node cdp.mjs --tab '<regex>' --pre recorder.js --expr '"recording"'
 *   # ask the user to perform the action once in the page, then:
 *   node cdp.mjs --tab '<regex>' --expr 'window.__rec.calls'
 *
 * Narrow it before installing: --expr 'window.__recFilter = "api/save"' (URL substring/regex).
 * Bodies and responses are truncated to 4000 chars. A page reload removes the recorder.
 */
(function () {
  if (window.__rec) return;
  const R = window.__rec = { calls: [], startedAt: new Date().toISOString() };
  const want = (url) => new RegExp(window.__recFilter || '.').test(url);
  const cut = (v) => (typeof v === 'string' ? v.slice(0, 4000) : v);
  const parse = (t) => { try { return JSON.parse(t); } catch (e) { return cut(t); } };
  const keep = (method, url, body, status, text, via) => {
    if (!want(url)) return;
    R.calls.push({ at: new Date().toISOString(), via, method, url, status, body: parse(cut(body || '')), response: parse(cut(text || '')) });
  };
  const origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const method = (init && init.method) || (input && input.method) || 'GET';
    const body = init && typeof init.body === 'string' ? init.body : null;
    const p = origFetch(input, init);
    p.then((r) => r.clone().text().then((t) => keep(method, url, body, r.status, t, 'fetch'))).catch(() => {});
    return p;
  };
  const open = XMLHttpRequest.prototype.open;
  const sendX = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) { this.__rm = method; this.__ru = url; return open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener('loadend', () => keep(this.__rm, this.__ru || '', typeof body === 'string' ? body : null, this.status, this.responseText, 'xhr'));
    return sendX.apply(this, arguments);
  };
})();
