// npx tsx --test packages/core/src/scenes/beats.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beats } from './beats';

const lin = (x: number) => x;

test('beats follow each other, gap first-beat start, negative gap overlaps', () => {
  const T = beats([['jual', 38, 12], ['raih', 30, -16], ['serah', 20, 2]]);
  assert.deepEqual(T.at.jual, [12, 50]);
  assert.deepEqual(T.at.raih, [34, 64]);
  assert.deepEqual(T.at.serah, [66, 86]);
  assert.equal(T.end, 86);
});

test('lengthening one beat moves every later beat by the same amount', () => {
  const A = beats([['a', 10], ['b', 20, 5], ['c', 8]]);
  const B = beats([['a', 16], ['b', 20, 5], ['c', 8]]);
  assert.equal(B.a('b') - A.a('b'), 6);
  assert.equal(B.a('c') - A.a('c'), 6);
});

test('p: progress over a beat and over fractions of it', () => {
  const T = beats([['serah', 20, 66]]);
  assert.equal(T.p(66, 'serah', 0, 1, lin), 0);
  assert.equal(T.p(76, 'serah', 0, 1, lin), 0.5);
  assert.equal(T.p(90, 'serah', 0, 1, lin), 1);
  // fraction 0.5 → 1.2 of a 20-frame beat at 66 is frames 76 → 90
  assert.equal(T.p(76, 'serah', 0.5, 1.2, lin), 0);
  assert.equal(T.p(83, 'serah', 0.5, 1.2, lin), 0.5);
});

test('span runs from one beat start to another beat end', () => {
  const T = beats([['a', 10], ['b', 10]]);
  assert.equal(T.span(10, 'a', 'b', lin), 0.5);
});

test('a name listed twice is an error', () => {
  assert.throws(() => beats([['a', 1], ['a', 1]]));
});
