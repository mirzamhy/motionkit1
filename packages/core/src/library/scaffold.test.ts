// npx tsx --test packages/core/src/library/scaffold.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kerangka, sisipkan } from './scaffold';

test('sisipkan puts a line above the marker with the marker indent', () => {
  assert.equal(sisipkan('a\n  // m\nb', '// m', 'X,'), 'a\n  X,\n  // m\nb');
  assert.throws(() => sisipkan('a', '// m', 'X'), /marker/);
});

test('3D skeleton for a new look names the item right and draws a labelled box', () => {
  const k = kerangka('gedung', 'model3d', new Set());
  assert.equal(k.id, 'gedung-model3d');
  assert.equal(k.file, 'model3d/gedung.tsx');
  assert.match(k.content, /id: 'gedung-model3d'/);
  assert.match(k.content, /benda: 'gedung', gaya: 'model3d'/);
  assert.match(k.content, /BELUM DIGAMBAR/);
  assert.match(k.content, /export const Item3D/);
  assert.equal(k.indexImport, "import { ITEMS_MODEL3D } from './model3d';");
});

test('2D skeleton uses Item2D', () => {
  const k = kerangka('gedung', 'poly', new Set());
  assert.match(k.content, /export const Item2D/);
  assert.doesNotMatch(k.content, /Item3D/);
});

test('refuses duplicates, bad names and looks that have their own route', () => {
  assert.throws(() => kerangka('gedung', 'poly3d', new Set(['gedung-poly3d'])), /sudah ada/);
  assert.throws(() => kerangka('Gedung', 'poly3d', new Set()), /huruf kecil/);
  assert.throws(() => kerangka('gedung', 'xx', new Set()), /gaya/);
  assert.throws(() => kerangka('gedung', 'stik', new Set()), /part\(/);
  assert.throws(() => kerangka('gedung', 'ilustrasi', new Set()), /kategori/);
});
