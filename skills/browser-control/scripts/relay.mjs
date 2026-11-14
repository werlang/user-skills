/** One long-lived Chrome connection; clients get separate request IDs and target sessions. */
import fs from 'node:fs';
import net from 'node:net';
import { endpoint, readMessages } from './connection.mjs';
import { IdleTimeout } from './idle-timeout.mjs';

const socket = process.argv[2];
const clients = new Set();
const pending = new Map();
let sequence = 0;
let ws;
let opening;
let ownsSocket = false;
let stopping = false;
const idle = new IdleTimeout(() => stop('CDP connection closed after 30 minutes idle.'));

/** Close clients and remove only the socket this process successfully bound. */
function stop(message) {
  if (stopping) return;
  stopping = true;
  idle.cancel();
  for (const client of clients) client.end(JSON.stringify({ fatal: message }) + '\n');
  if (ownsSocket) fs.rmSync(socket, { force: true });
  ws?.close();
  server.close();
  setTimeout(() => process.exit(0), 100).unref();
}

/** Release this client's target sessions, even when a timed-out attach finishes later. */
function detach(sessionId) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: ++sequence, method: 'Target.detachFromTarget', params: { sessionId } }));
  }
}

/** Lazily connect once; failure terminates the relay instead of replaying commands. */
function openChrome() {
  if (opening) return opening;
  opening = (async () => {
    ws = new WebSocket(await endpoint());
    ws.addEventListener('message', ({ data }) => {
      const response = JSON.parse(data);
      const request = pending.get(response.id);
      if (!request) return;
      pending.delete(response.id);
      if (request.method === 'Target.attachToTarget' && response.result?.sessionId) {
        if (request.client.destroyed) detach(response.result.sessionId);
        else request.client.sessions.add(response.result.sessionId);
      }
      if (request.method === 'Target.detachFromTarget' && !response.error) {
        request.client.sessions.delete(request.sessionId);
      }
      if (!request.client.destroyed) {
        request.client.write(JSON.stringify({ ...response, id: request.id }) + '\n');
      }
    });
    ws.addEventListener('close', () => stop('Chrome disconnected. Command outcome may be unknown; do not replay writes.'));
    ws.addEventListener('error', () => stop('Chrome disconnected or WebSocket failed. Command outcome may be unknown; do not replay writes.'));
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error('Chrome WebSocket failed')), { once: true });
      ws.addEventListener('close', () => reject(new Error('Chrome disconnected')), { once: true });
    });
  })();
  return opening;
}

const server = net.createServer((client) => {
  clients.add(client);
  client.sessions = new Set();
  client.on('error', () => client.destroy());
  client.on('close', () => {
    clients.delete(client);
    idle.end(client);
    for (const sessionId of client.sessions) detach(sessionId);
    // Retain pending attach bookkeeping so its late response can be detached too.
    for (const [id, request] of pending) {
      if (request.client === client && request.method !== 'Target.attachToTarget') pending.delete(id);
    }
  });
  readMessages(client, (message) => {
    if (message.control === 'status') {
      client.write(JSON.stringify({ running: true, connected: ws?.readyState === WebSocket.OPEN, pid: process.pid, idleExpiresAt: idle.expiresAt }) + '\n');
      return;
    }
    if (message.control === 'stop') { stop('CDP connection stopped by operator.'); return; }
    idle.begin(client);
    void (async () => {
      await openChrome();
      if (client.destroyed || stopping) return;
      const id = ++sequence;
      pending.set(id, { client, id: message.id, method: message.method, sessionId: message.params?.sessionId });
      ws.send(JSON.stringify({ ...message, id }));
    })().catch((error) => stop(error.message));
  });
});
server.on('error', (error) => {
  // Another starter may have won the bind race. It owns that socket.
  const anotherStarterWon = ['EADDRINUSE', 'EEXIST'].includes(error.code);
  process.send?.(anotherStarterWon ? { ready: true } : { error: error.message });
  process.exit(anotherStarterWon ? 0 : 2);
});
server.listen(socket, () => {
  ownsSocket = true;
  fs.chmodSync(socket, 0o600);
  process.send?.({ ready: true });
});
process.on('SIGTERM', () => stop('CDP relay terminated.'));
process.on('SIGINT', () => stop('CDP relay interrupted.'));
