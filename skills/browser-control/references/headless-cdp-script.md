# Driving an isolated headless Chrome from a script

Use when there is no MCP and no `agent-browser`, but a Node on the box that owns a Chrome: a throwaway profile,
no user session, full control, and the output is a JSON report plus PNGs another agent can inspect.

## Launch where the work is

The browser has to run on the machine that holds the assets and the RAM the page needs (software WebGL for a
3D scene is gigabytes, and a tab that dies takes its CDP session with it — `no close frame received or sent`).

```bash
rm -rf /tmp/<job>-hl
("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --remote-debugging-port=9333 --user-data-dir=/tmp/<job>-hl \
  --no-first-run --no-default-browser-check --disable-extensions about:blank > /tmp/chrome-hl.log 2>&1 &)
curl -s http://127.0.0.1:9333/json/version
```

A separate `--user-data-dir` is what keeps this out of the user's profile (row C), even on his own machine.

## Connect and drive

Node 22+ ships `fetch` and a global `WebSocket`, so the whole client is dependency-free:

```js
const { webSocketDebuggerUrl } = await (await fetch('http://127.0.0.1:9333/json/version')).json();
ws = new WebSocket(webSocketDebuggerUrl);                       // browser-level socket
const target = await (await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent('about:blank')}`,
    { method: 'PUT' })).json();                                  // PUT, not GET, on current Chrome
const { sessionId } = await send('Target.attachToTarget', { targetId: target.id, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
```

- Every command carries the `sessionId` from `attachToTarget`; the response comes back on the same socket,
  correlated by `id`. Keep one `pending` map and a per-method timeout, or a crashed tab blocks forever.
- `Page.captureScreenshot` with `clip: {x, y, width, height, scale}` taken from `getBoundingClientRect()` in
  CSS pixels gives you a component shot instead of a whole window.
- Instrument the page itself for numbers (`Runtime.evaluate` returning JSON), and keep the screenshots for what
  numbers cannot show.

## Cookies and origins

- Set cookies on the target's session **before** `Page.navigate`:
  `Network.setCookie {name, value, domain, path}`; delete stale ones with `Network.deleteCookies` so the
  server-rendered state is the state you meant to test.
- **The page and the API must share one hostname.** A cookie set for `127.0.0.1` is never sent to
  `localhost:8096`, so the SPA loads, its first authorised call 403s, and the UI shows a generic
  "could not load" dialog that reads like a product bug. Point the app's own `API_URL`/`WEB_URL` at the same
  host you browse.
- **Never route a session token through agent tool output.** It is redacted on the way out (`eyJhbG...MlJs`)
  and the file you wrote is corrupt, which surfaces later as 401s. Mint it inside the command that consumes it
  (`TOKEN=$(docker compose exec -T api node scripts/issue-session.js 1 | tr -d "\r\n"); node drive.mjs "$TOKEN"`).

## State the app resolves itself

When the app applies the account's stored choice over a local cache (a preference, a theme), switching the
cookie does nothing: every scenario renders the value from the database. Set the value where the app reads it,
and re-read it before each scenario — an `UPDATE` silently skipped by quoting makes two scenarios produce the
same screenshot, and identical PNG sizes across "different" runs is the tell.

Also check what gates the first screen: a welcome/tutorial modal or an onboarding row (`showTutorial=1`) covers
the very UI being measured, and the capture is then a dialog, not the app.

## Reading results

- Give the heavy scene 60–90 s: models, textures and animations arrive long after `load`.
- Do not read a WebGL canvas with `drawImage` — without `preserveDrawingBuffer` it yields an empty buffer, so
  `coverage: 0` is a property of the reader, not of the page. Compare clipped screenshots (animation paused).
- Alpha-only coverage cannot distinguish two swatches of the same shape in different colours: hash the RGB too.
- Inspect at least one capture per surface yourself; a screenshot nobody opened is a file, not evidence.
