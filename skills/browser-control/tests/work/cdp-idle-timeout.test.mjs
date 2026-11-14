/** Virtual-clock probes for the production 30-minute idle boundary. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IdleTimeout } from '../../scripts/idle-timeout.mjs';

const halfHour = 30 * 60 * 1000;

test('closes at exactly 30 idle minutes; passive clients do not extend the deadline', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let closed = 0;
  const idle = new IdleTimeout(() => closed++);
  assert.equal(idle.expiresAt, halfHour);
  t.mock.timers.tick(halfHour - 1);
  idle.end({ statusOnly: true });
  assert.equal(idle.expiresAt, halfHour);
  assert.equal(closed, 0);
  t.mock.timers.tick(1);
  assert.equal(closed, 1);
});

test('running commands suspend expiry; last client exit starts a full new window', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
  let closed = 0;
  const idle = new IdleTimeout(() => closed++);
  const first = {};
  const second = {};
  t.mock.timers.tick(halfHour - 1);
  idle.begin(first);
  idle.begin(second);
  assert.equal(idle.expiresAt, null);
  t.mock.timers.tick(halfHour * 2);
  idle.end(first);
  t.mock.timers.tick(halfHour);
  assert.equal(closed, 0);
  idle.end(second);
  assert.equal(idle.expiresAt, Date.now() + halfHour);
  t.mock.timers.tick(halfHour - 1);
  assert.equal(closed, 0);
  t.mock.timers.tick(1);
  assert.equal(closed, 1);
});

test('shutdown cancels the idle callback', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let closed = 0;
  const idle = new IdleTimeout(() => closed++);
  idle.cancel();
  t.mock.timers.tick(halfHour);
  assert.equal(closed, 0);
});
