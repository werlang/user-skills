/** Persistent CDP transport. Only the owner can access its local Unix socket. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Namespace by checkout and endpoint configuration; never mix explicit Chrome instances. */
export function socketPath() {
  const key = createHash('sha256').update(JSON.stringify([
    fileURLToPath(new URL('.', import.meta.url)), process.env.CDP_WS || '', process.env.CDP_PORT || '9222'
  ])).digest('hex').slice(0, 16);
  const dir = path.join(os.tmpdir(), `browser-cdp-${process.getuid()}`);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(dir);
  if (!stat.isDirectory() || stat.uid !== process.getuid() || (stat.mode & 0o077)) {
    throw new Error('CDP socket directory must be owned by you with permissions 0700: ' + dir);
  }
  return path.join(dir, key + '.sock');
}

/** Open an existing relay, without touching Chrome or starting a process. */
function connect(socket) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(socket);
    client.once('error', reject);
    client.once('connect', () => { client.removeListener('error', reject); resolve(client); });
  });
}

/** Read newline-delimited JSON, including split/coalesced TCP or Unix-socket chunks. */
export function readMessages(stream, receive) {
  let buffer = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      try { receive(JSON.parse(line)); } catch (error) { stream.destroy(error); return; }
    }
  });
}

/** Serialize stale-socket cleanup and bind; never unlink a socket another starter just created. */
async function acquireStartupLock(socket) {
  const lock = socket + '.starting';
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      fs.mkdirSync(lock, { mode: 0o700 });
      return () => fs.rmdirSync(lock);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error('CDP startup lock is busy: ' + lock +
    '. If a starter crashed, remove this empty directory only after confirming no helper is starting.');
}

/** Start one shared relay when absent. Setup retries never send or replay CDP commands. */
export async function openConnection({ start = true } = {}) {
  const socket = socketPath();
  try { return await connect(socket); } catch (error) {
    if (!['ENOENT', 'ECONNREFUSED'].includes(error.code)) throw error;
    if (!start) return null;
  }
  const release = await acquireStartupLock(socket);
  try {
    // A competing starter may have finished while we waited for the lock.
    try { return await connect(socket); } catch (error) {
      if (!['ENOENT', 'ECONNREFUSED'].includes(error.code)) throw error;
      if (error.code === 'ECONNREFUSED') fs.rmSync(socket, { force: true });
    }
    const child = spawn(process.execPath, [fileURLToPath(new URL('./relay.mjs', import.meta.url)), socket], {
      detached: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc']
    });
    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code) => reject(new Error('CDP relay failed to start (exit ' + code + ')')));
      child.once('message', (message) => {
        child.disconnect();
        message.error ? reject(new Error(message.error)) : resolve();
      });
    });
    child.unref();
    return await connect(socket);
  } finally { release(); }
}

/** Find Chrome's WebSocket endpoint using the existing environment/port/profile order. */
export async function endpoint() {
  if (process.env.CDP_WS) return process.env.CDP_WS;
  try {
    const response = await fetch(`http://127.0.0.1:${process.env.CDP_PORT || '9222'}/json/version`, {
      signal: AbortSignal.timeout(2000)
    });
    if (response.ok) {
      const data = await response.json();
      if (data.webSocketDebuggerUrl) return data.webSocketDebuggerUrl;
    }
  } catch { /* Chrome's inspect mode exposes no HTTP discovery endpoint. */ }
  const candidates = [
    path.join(os.homedir(), 'Library/Application Support/Google/Chrome/DevToolsActivePort'),
    path.join(os.homedir(), '.config/google-chrome/DevToolsActivePort'),
    path.join(os.homedir(), '.config/chromium/DevToolsActivePort'),
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/User Data/DevToolsActivePort')
  ];
  for (const file of candidates) {
    try {
      const [port, wsPath] = fs.readFileSync(file, 'utf8').split('\n');
      if (port && wsPath) return `ws://127.0.0.1:${port.trim()}${wsPath.trim()}`;
    } catch (error) {
      if (['EPERM', 'EACCES'].includes(error.code)) {
        throw new Error('Permission denied reading ' + file + '; set CDP_WS to the browser WebSocket endpoint.');
      }
    }
  }
  throw new Error('No CDP endpoint found. Enable chrome://inspect/#remote-debugging.');
}
