// npx tsx --test apps/cli/asset.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gltfSize } from './asset';

const near = (a: number[], b: number[]) => a.forEach((x, i) => assert.ok(Math.abs(x - b[i]) < 1e-6, `${a} vs ${b}`));
const box = (min: number[], max: number[], extra = {}) => ({ min, max, ...extra });

test('size of one mesh with no transform', () => {
  near(gltfSize({ scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], accessors: [box([-1, 0, -0.5], [1, 2, 0.5])] }), [2, 2, 1]);
});

test('node scale and child translation are applied', () => {
  const j = { scenes: [{ nodes: [0] }], nodes: [{ scale: [0.5, 0.5, 0.5], children: [1] }, { mesh: 0, translation: [4, 0, 0] }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], accessors: [box([0, 0, 0], [1, 1, 1])] };
  near(gltfSize(j), [0.5, 0.5, 0.5]);
});

test('a 90-degree turn about y swaps x and z', () => {
  const s = Math.SQRT1_2;
  near(gltfSize({ scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, rotation: [0, s, 0, s] }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], accessors: [box([0, 0, 0], [3, 1, 1])] }), [1, 1, 3]);
});

test('quantized (normalized short) positions are dequantized before the node scale', () => {
  const j = { scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, scale: [0.3, 0.3, 0.3] }], meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], accessors: [box([-32767, 0, -32767], [32767, 32767, 32767], { normalized: true, componentType: 5122 })] };
  near(gltfSize(j), [0.6, 0.3, 0.6]);
});
