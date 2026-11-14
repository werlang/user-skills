#!/usr/bin/env node
/**
 * cdp.mjs — act inside the user's real, logged-in Chrome over the Chrome DevTools Protocol.
 *
 * Attaches to the Chrome the user already runs (remote debugging enabled in
 * chrome://inspect/#remote-debugging, Chrome 144+, or Chrome started with
 * --remote-debugging-port), picks one tab, runs JavaScript inside it (same cookies, same
 * session) and prints the result as JSON. No MCP, no Playwright, no dependencies (Node >= 22).
 *
 * Usage:
 *   node cdp.mjs --list
 *   node cdp.mjs --tab 'example\.com/app' --expr 'document.title'
 *   node cdp.mjs --tab 'app' --pre helper.js --eval check.js
 *   node cdp.mjs --tab 'app' --attach '#upload=a.csv,b.csv' --wait 3000 --expr 'window.state'
 *   node cdp.mjs --tab 'app' --click 'button.save' --wait 1000 --shot out.png --clip '#panel'
 *   node cdp.mjs --open 'https://example.com' --wait 3000 --expr 'location.href'
 *
 * Options
 *   --status               show relay status without connecting to Chrome
 *   --stop                 close the persistent Chrome connection
 *   --list                 list open pages (id, url, title) and exit
 *   --tab <regex>          use the first page whose URL matches (required unless --open)
 *   --open <url>           open a NEW tab for this run instead (the user's tabs stay untouched);
 *                          add --close to close it at the end
 *   --pre <file>           evaluate a script first (repeatable, in order)
 *   --attach <css>=paths   set local files on an <input type=file> (searched through open shadow
 *                          roots) and dispatch "change"; paths comma-separated (repeatable)
 *   --click <css>          click an element (also through shadow roots) (repeatable, in order)
 *   --wait <ms>            sleep after --pre/--attach/--click, before --expr/--eval
 *   --expr '<js>'          expression to evaluate; promises are awaited
 *   --eval <file|->        same, from a file or stdin
 *   --shot <out.png>       screenshot at the end
 *   --clip <css|x,y,w,h>   crop the screenshot to an element or a rectangle
 *   --timeout <ms>         whole-run limit (default 60000)
 *   --help                 this text
 *
 * Commands reuse one background connection; it closes after 30 minutes idle.
 * Endpoint: $CDP_WS, else http://127.0.0.1:${CDP_PORT:-9222}/json/version, else the
 * DevToolsActivePort file of the default Chrome profile. Relay requires macOS/Linux (Unix sockets).
 * Exit codes: 0 ok · 1 page error · 2 connection problem (a hint explains what to do).
 */
import fs from 'node:fs';
import path from 'node:path';
import { openConnection, readMessages } from './connection.mjs';

const argv = process.argv.slice(2);
if (!argv.length || argv.includes('--help')) {
  const src = fs.readFileSync(new URL(import.meta.url), 'utf8');
  console.log(src.slice(src.indexOf('/**') + 3, src.indexOf('*/')).replace(/^ \* ?/gm, ''));
  process.exit(0);
}
const opt = { pre: [], attach: [], click: [], wait: 0, timeout: 60000 };
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  const next = () => argv[++i];
  if (a === '--status') opt.status = true;
  else if (a === '--stop') opt.stop = true;
  else if (a === '--list') opt.list = true;
  else if (a === '--tab') opt.tab = next();
  else if (a === '--open') opt.open = next();
  else if (a === '--close') opt.close = true;
  else if (a === '--pre') opt.pre.push(next());
  else if (a === '--attach') opt.attach.push(next());
  else if (a === '--click') opt.click.push(next());
  else if (a === '--wait') opt.wait = Number(next());
  else if (a === '--expr') opt.expr = next();
  else if (a === '--eval') opt.evalFile = next();
  else if (a === '--shot') opt.shot = next();
  else if (a === '--clip') opt.clip = next();
  else if (a === '--timeout') opt.timeout = Number(next());
  else { console.error('unknown option ' + a + ' (see --help)'); process.exit(2); }
}

const HINT = [
  'Chrome did not answer. Check, in this order:',
  '  1. Chrome is open and remote debugging is on: chrome://inspect/#remote-debugging',
  '  2. Chrome shows "Allow remote debugging?" for this new connection — ask the user to click Allow',
  '  3. An alert/confirm dialog is open in the tab — ask the user to close it',
  '  4. Your sandbox blocks reading DevToolsActivePort — export CDP_WS (see the skill)'
].join('\n');
const killer = setTimeout(() => { console.error('TIMEOUT after ' + opt.timeout + ' ms\n' + HINT); process.exit(2); }, opt.timeout);

let connection;
try {
  connection = await openConnection({ start: !opt.status && !opt.stop });
} catch (error) { console.error(error.message); process.exit(2); }
if (!connection) {
  console.log(JSON.stringify({ running: false, connected: false }));
  process.exit(0);
}

let seq = 0;
const pending = new Map();
/** Report transport loss promptly; never reconnect/replay a possibly executed page mutation. */
function fail(message) { console.error(message + '\n' + HINT); process.exit(2); }
connection.on('error', (error) => fail(error.message));
connection.on('close', () => fail('CDP relay disconnected. Command outcome may be unknown.'));
readMessages(connection, (response) => {
  if (opt.stop && response.fatal) { console.log('CDP connection stopped.'); process.exit(0); }
  if (response.fatal) { fail(response.fatal); return; }
  if (opt.status) { console.log(JSON.stringify(response)); process.exit(0); }
  if (!pending.has(response.id)) return;
  const { resolve, reject } = pending.get(response.id);
  pending.delete(response.id);
  response.error ? reject(new Error(JSON.stringify(response.error))) : resolve(response.result);
});
if (opt.status || opt.stop) {
  connection.write(JSON.stringify({ control: opt.stop ? 'stop' : 'status' }) + '\n');
  await new Promise(() => {});
}
/** Send once via the relay; IDs and target sessions remain private to this command. */
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  connection.write(JSON.stringify({ id, method, params, sessionId }) + '\n');
});

const { targetInfos } = await send('Target.getTargets');
const pages = targetInfos.filter((t) => t.type === 'page');
if (opt.list) {
  pages.forEach((t) => console.log(t.targetId + '  ' + t.url.slice(0, 120) + '  | ' + t.title.slice(0, 50)));
  process.exit(0);
}
let targetId;
if (opt.open) {
  targetId = (await send('Target.createTarget', { url: opt.open, background: true })).targetId;
} else {
  if (!opt.tab) { console.error('--tab <regex> or --open <url> is required (see --list)'); process.exit(2); }
  const re = new RegExp(opt.tab);
  const tab = pages.find((t) => re.test(t.url));
  if (!tab) { console.error('no open page matches /' + opt.tab + '/ — use --list'); process.exit(2); }
  targetId = tab.targetId;
}
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

/** Evaluate in the page; throws with the page's exception text. */
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error((d.exception && d.exception.description) || d.text || JSON.stringify(d));
  }
  return r.result.value;
}

/** In-page helper: querySelector that also walks open shadow roots. */
const DEEP = `(function deep(sel, root) {
  root = root || document;
  const hit = root.querySelector(sel);
  if (hit) return hit;
  for (const el of root.querySelectorAll('*')) if (el.shadowRoot) { const h = deep(sel, el.shadowRoot); if (h) return h; }
  return null;
})`;

try {
  for (const f of opt.pre) await evaluate(fs.readFileSync(f, 'utf8') + '\n;undefined');
  for (const spec of opt.attach) {
    const cut = spec.lastIndexOf('=');
    const sel = spec.slice(0, cut);
    const files = spec.slice(cut + 1).split(',').map((p) => ({ name: path.basename(p), b64: fs.readFileSync(p).toString('base64') }));
    await evaluate(`(() => {
      const input = ${DEEP}(${JSON.stringify(sel)});
      if (!input) throw new Error('no element matches ${sel.replace(/'/g, '')}');
      const dt = new DataTransfer();
      for (const f of ${JSON.stringify(files)}) dt.items.add(new File([Uint8Array.from(atob(f.b64), c => c.charCodeAt(0))], f.name));
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
  }
  for (const sel of opt.click) {
    await evaluate(`(() => { const el = ${DEEP}(${JSON.stringify(sel)}); if (!el) throw new Error('no element matches ' + ${JSON.stringify(sel)}); el.click(); return true; })()`);
  }
  if (opt.wait) await new Promise((r) => setTimeout(r, opt.wait));
  let expr = opt.expr;
  if (opt.evalFile) expr = opt.evalFile === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(opt.evalFile, 'utf8');
  const info = (await send('Target.getTargetInfo', { targetId })).targetInfo;
  console.log('# ' + info.url);
  if (expr) console.log(JSON.stringify(await evaluate(expr), null, 1));
  if (opt.shot) {
    let clip;
    if (opt.clip && /^[\d.]+,[\d.]+,[\d.]+,[\d.]+$/.test(opt.clip)) {
      const [x, y, width, height] = opt.clip.split(',').map(Number);
      clip = { x, y, width, height, scale: 1 };
    } else if (opt.clip) {
      const r = await evaluate(`(() => { const el = ${DEEP}(${JSON.stringify(opt.clip)}); if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; })()`);
      if (r) clip = { ...r, scale: 1 };
    }
    const shot = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip } : {}) }, sessionId);
    fs.writeFileSync(opt.shot, Buffer.from(shot.data, 'base64'));
    console.log('# screenshot ' + opt.shot);
  }
  await send('Target.detachFromTarget', { sessionId });
  if (opt.open && opt.close) await send('Target.closeTarget', { targetId });
  clearTimeout(killer);
  process.exit(0);
} catch (e) {
  console.error('ERROR ' + e.message);
  process.exit(1);
}
