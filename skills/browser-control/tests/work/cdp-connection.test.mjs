/** Work probes at the CLI/real-WebSocket boundary; no logged-in browser or page writes. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const cli = new URL('../../scripts/cdp.mjs', import.meta.url).pathname;

/** Run a separate CLI process, capturing its externally visible result. */
function command(env, args) {
  const child = spawn(process.execPath, [cli, '--tab', 'online\\.php', '--timeout', '4000', ...args], { env });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  return once(child, 'exit').then(([code]) => ({ code, stdout, stderr }));
}

/** Minimal RFC6455 fixture to count actual Chrome connections across separate CLI processes. */
async function browserFixture() {
  let connections = 0;
  let evaluations = 0;
  const sockets = new Set();
  const sessions = new Set();
  const server = http.createServer();
  server.on('upgrade', (request, socket) => {
    connections += 1;
    sockets.add(socket);
    socket.on('error', () => {});
    socket.on('close', () => sockets.delete(socket));
    const accept = createHash('sha1').update(request.headers['sec-websocket-key'] +
      '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 2) {
        const opcode = buffer[0] & 15;
        let size = buffer[1] & 127;
        let offset = 2;
        if (size === 126) {
          if (buffer.length < 4) return;
          size = buffer.readUInt16BE(2); offset = 4;
        }
        if (buffer.length < offset + 4 + size) return;
        const mask = buffer.subarray(offset, offset + 4);
        const payload = Buffer.from(buffer.subarray(offset + 4, offset + 4 + size));
        for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
        buffer = buffer.subarray(offset + 4 + size);
        if (opcode === 8) { socket.end(Buffer.from([0x88, 0])); return; }
        const message = JSON.parse(payload.toString());
        let result = {};
        let error;
        if (message.method === 'Target.getTargets') result = { targetInfos: [
          { type: 'page', targetId: 'page-1', url: 'https://example.test/online.php', title: 'Fixture' }
        ] };
        if (message.method === 'Target.getTargetInfo') result = { targetInfo: { url: 'https://example.test/online.php' } };
        if (message.method === 'Target.attachToTarget') {
          result = { sessionId: randomUUID() }; sessions.add(result.sessionId);
        }
        if (message.method === 'Target.detachFromTarget') sessions.delete(message.params.sessionId);
        if (message.method === 'Runtime.evaluate') {
          evaluations += 1;
          if (message.params.expression === 'disconnect') { socket.destroy(); return; }
          if (message.params.expression === 'hang') continue;
          if (message.params.expression === 'protocol-error') error = { code: -32000, message: 'Fixture rejected command' };
          result = message.params.expression === 'throw' ? { exceptionDetails: { text: 'Fixture page exception' } }
            : { result: { value: message.params.expression } };
        }
        const data = Buffer.from(JSON.stringify({ id: message.id, ...(error ? { error } : { result }) }));
        const header = data.length < 126 ? Buffer.from([0x81, data.length]) : Buffer.from([0x81, 126, data.length >> 8, data.length & 255]);
        socket.write(Buffer.concat([header, data]));
      }
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    env: { ...process.env, CDP_WS: `ws://127.0.0.1:${server.address().port}/${randomUUID()}` },
    get connections() { return connections; },
    get evaluations() { return evaluations; },
    get sessions() { return sessions.size; },
    close() { for (const socket of sockets) socket.destroy(); server.close(); }
  };
}

test('separate and concurrent commands share one approval connection; failures clean sessions', async (t) => {
  const fixture = await browserFixture();
  t.after(async () => { await command(fixture.env, ['--stop']); fixture.close(); });
  const before = await command(fixture.env, ['--status']);
  assert.equal(JSON.parse(before.stdout).running, false);
  assert.equal(fixture.connections, 0);
  const initial = await Promise.all([
    command(fixture.env, ['--expr', 'first']), command(fixture.env, ['--expr', 'second'])
  ]);
  for (const result of initial) { assert.equal(result.code, 0, result.stderr); }
  assert.match(initial[0].stdout, /"first"/);
  assert.match(initial[1].stdout, /"second"/);
  assert.equal(fixture.connections, 1, 'fresh processes must not trigger fresh browser connections');
  assert.equal(fixture.sessions, 0);
  const status = JSON.parse((await command(fixture.env, ['--status'])).stdout);
  assert.equal(status.connected, true);
  const listing = await command(fixture.env, ['--list']);
  assert.match(listing.stdout, /page-1/);
  for (const expression of ['throw', 'protocol-error']) {
    const result = await command(fixture.env, ['--expr', expression]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Fixture/);
  }
  const timeout = await command(fixture.env, ['--timeout', '300', '--expr', 'hang']);
  assert.equal(timeout.code, 2);
  const after = await command(fixture.env, ['--expr', 'after-timeout']);
  assert.equal(after.code, 0, after.stderr);
  assert.equal(fixture.connections, 1);
  assert.equal(fixture.sessions, 0, 'failed/timed-out CLI must release its target session');
  assert.equal((await command(fixture.env, ['--stop'])).code, 0);
  assert.equal(JSON.parse((await command(fixture.env, ['--status'])).stdout).running, false);
  const restarted = await command(fixture.env, ['--expr', 'after-stop']);
  assert.equal(restarted.code, 0, restarted.stderr);
  assert.equal(fixture.connections, 2, 'explicit stop ends the approval lifetime');
});

test('Chrome disconnect fails the command promptly without reconnect or replay', async (t) => {
  const fixture = await browserFixture();
  t.after(async () => { await command(fixture.env, ['--stop']); fixture.close(); });
  const result = await command(fixture.env, ['--expr', 'disconnect']);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /disconnected/);
  assert.equal(fixture.connections, 1);
  assert.equal(fixture.evaluations, 1);
  assert.equal(JSON.parse((await command(fixture.env, ['--status'])).stdout).running, false);
});


test('concurrent commands recover a killed relay with one replacement connection', async (t) => {
  const fixture = await browserFixture();
  t.after(async () => { await command(fixture.env, ['--stop']); fixture.close(); });
  assert.equal((await command(fixture.env, ['--expr', 'before-kill'])).code, 0);
  const status = JSON.parse((await command(fixture.env, ['--status'])).stdout);
  process.kill(status.pid, 'SIGKILL');
  await new Promise((resolve) => setTimeout(resolve, 100));
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => command(fixture.env, ['--expr', 'after-kill-' + i])));
  for (const result of results) assert.equal(result.code, 0, result.stderr);
  assert.equal(fixture.connections, 2, 'one original plus exactly one replacement browser connection');
});
