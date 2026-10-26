// npx tsx --test packages/core/src/library/matriks.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barisMatriks, cariAset, matriks } from './matriks';
import type { LibraryItem } from './types';

const mk = (id: string, benda: string, gaya: LibraryItem['meta']['gaya']): LibraryItem => ({ meta: { id, name: id, category: 'bangunan', benda, gaya, tags: [benda], size: [1, 1, 1], refs: 'x' } });
const items = [mk('gedung-stik', 'gedung', 'stik'), mk('gedung-poly3d', 'gedung', 'poly3d'), mk('bus-poly3d', 'bus', 'poly3d')];

test('matrix groups ids by benda and gaya', () => {
  const m = matriks(items);
  assert.deepEqual(m.get('gedung'), { stik: 'gedung-stik', poly3d: 'gedung-poly3d' });
  assert.deepEqual(m.get('bus'), { poly3d: 'bus-poly3d' });
});

test('row prints every gaya in registry order with ✔ and ✗', () => {
  assert.equal(barisMatriks('bus', { poly3d: 'bus-poly3d' }), 'bus: stik ✗  poly3d ✔  poly ✗  model3d ✗  flanel ✗  ilustrasi ✗');
});

test('cariAset finds a benda with several gaya, one gaya, and none', () => {
  assert.equal(cariAset('gedung', undefined, items)[0].baris.startsWith('gedung: stik ✔  poly3d ✔'), true);
  assert.deepEqual(cariAset('gedung', 'stik', items).map((r) => r.benda), ['gedung']);
  assert.deepEqual(cariAset('bus', 'stik', items), []);
  assert.deepEqual(cariAset('roket', undefined, items), []);
});
