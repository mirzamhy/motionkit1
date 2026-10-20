// npx tsx --test apps/cli/onsets.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectOnsets, snapShots } from './onsets';

const rate = 22050;
/** silence with a short decaying noise click at each time (seconds) */
const clicks = (times: number[], len = 6) => {
  const pcm = new Float32Array(rate * len);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  for (const t of times) for (let j = 0; j < 2000; j++) pcm[Math.round(t * rate) + j] += rnd() * Math.exp(-j / 400) * 0.8;
  return pcm;
};

test('finds a click train within 30 ms', () => {
  const times = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
  const found = detectOnsets(clicks(times), rate).map((o) => o.sec);
  assert.equal(found.length, times.length);
  times.forEach((t, i) => assert.ok(Math.abs(found[i] - t) < 0.03, `${t} vs ${found[i]}`));
});

test('silence has no onsets', () => {
  assert.equal(detectOnsets(new Float32Array(rate * 2), rate).length, 0);
});

test('snaps cuts to the nearest onset within the window, each onset once, first shot fixed', () => {
  // shots of 100, 150, 150 frames at 60 fps; onsets at 1.75 s (105 f) and 4.0 s (240 f)
  const r = snapShots([100, 150, 150], [{ sec: 1.75, strength: 2 }, { sec: 4.0, strength: 2 }], 60, { window: 20 });
  assert.deepEqual(r.durs, [105, 135, 150]); // only the shot before a cut changes length
  assert.deepEqual(r.moves, [{ shot: 1, from: 100, to: 105 }, { shot: 2, from: 255, to: 240 }]); // the first snap already moved shot 2 by +5
});

test('leaves a cut alone when no onset is near or the previous shot would get too short', () => {
  assert.deepEqual(snapShots([100, 100], [{ sec: 3, strength: 2 }], 60, { window: 20 }).durs, [100, 100]);
  assert.deepEqual(snapShots([40, 100], [{ sec: 0.3, strength: 2 }], 60, { window: 30, minDur: 30 }).durs, [40, 100]);
});
