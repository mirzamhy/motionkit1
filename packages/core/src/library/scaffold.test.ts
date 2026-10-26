// npx tsx --test packages/core/src/library/scaffold.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kerangka, rencanaTulis, sisipkan } from './scaffold';

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
  assert.throws(() => kerangka('Gedung', 'poly3d', new Set()), /huruf/);
  assert.throws(() => kerangka('gedung', 'xx', new Set()), /gaya/);
  assert.throws(() => kerangka('gedung', 'stik', new Set()), /part\(/);
  assert.throws(() => kerangka('gedung', 'ilustrasi', new Set()), /kategori/);
});

test('benda must start with a letter', () => {
  assert.throws(() => kerangka('3d-box', 'poly3d', new Set()), /huruf/);
});

test('import identifier is never a reserved word and is unique per benda', () => {
  const k = kerangka('class', 'poly3d', new Set());
  assert.notEqual(k.itemName, 'class');
  assert.match(k.itemName, /^[A-Za-z_$][A-Za-z0-9_$]*$/);
  assert.equal(k.itemImport, `import * as ${k.itemName} from './class';`);
  assert.notEqual(kerangka('a-1', 'poly3d', new Set()).itemName, kerangka('a1', 'poly3d', new Set()).itemName);
});


const top = '// aset:impor-gaya\nx\n  // aset:daftar-gaya\n';

test('rencanaTulis plans every edit in memory; a missing marker throws before any write', () => {
  const k = kerangka('gedung', 'model3d', new Set());
  assert.throws(() => rencanaTulis(k, 'model3d', { top: '// aset:impor-gaya\nno second marker' }), /marker/);
  assert.throws(() => rencanaTulis(k, 'model3d', { top: 'kosong' }), /marker/);
  assert.throws(() => rencanaTulis(k, 'model3d', { top, idx: 'index tanpa marker' }), /marker/);
  const ok = rencanaTulis(k, 'model3d', { top });
  assert.match(ok.top!, /import \{ ITEMS_MODEL3D \}/);
  assert.ok(ok.idx.includes(`import * as ${k.itemName} from './gedung';`));
  assert.match(ok.refs, /## gedung-model3d/);
});

test('rencanaTulis leaves the top index alone when the look folder already exists', () => {
  const k = kerangka('gedung', 'model3d', new Set());
  const p = rencanaTulis(k, 'model3d', { top: 'tanpa marker', idx: '// aset:impor\n// aset:daftar\n', refs: '# r\n' });
  assert.equal(p.top, undefined);
  assert.ok(p.refs.startsWith('# r\n'));
});
