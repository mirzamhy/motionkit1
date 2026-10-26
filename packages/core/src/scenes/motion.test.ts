import assert from 'node:assert/strict';
import test from 'node:test';
import { clamp01, kf, pop, prog, seeded, typed, type KP } from './motion';

test('progress is bounded and a zero-length interval lands on its end value', () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(prog(5, 0, 10, (x) => x), 0.5);
  assert.equal(prog(-1, 0, 10, (x) => x), 0);
  assert.equal(prog(11, 0, 10, (x) => x), 1);
  assert.equal(prog(10, 10, 10, (x) => x), 0);
  assert.equal(prog(11, 10, 10, (x) => x), 1);
});

test('keyframes clamp at both ends and duplicate frames resolve to the later key', () => {
  const points: KP[] = [[0, 0], [10, 10], [10, 20], [20, 30]];
  assert.equal(kf(-4, points), 0);
  assert.equal(kf(5, points), 5);
  assert.equal(kf(10, points), 20);
  assert.equal(kf(15, points), 25);
  assert.equal(kf(40, points), 30);
  assert.throws(() => kf(0, []), /at least one keyframe/i);
});

test('typed reveal and pop are deterministic for arbitrary frame order', () => {
  assert.equal(typed('motion', 9, 10, 1), '');
  assert.equal(typed('motion', 13, 10, 1), 'mot');
  assert.equal(typed('motion', 99, 10, 1), 'motion');
  assert.equal(pop(4, 5), 0);
  assert.equal(pop(12, 5), pop(12, 5));
  assert.equal(seeded(42), seeded(42));
  assert.notEqual(seeded(42), seeded(43));
});
