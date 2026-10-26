// npx tsx --test packages/core/src/library/naming.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GAYA, gayaBySlug } from '../styles';
import { ITEMS, itemById } from './index';
import { LEGACY_IDS, masalahMeta } from './naming';
import type { ItemMeta } from './types';

const base: ItemMeta = { id: 'bus-poly3d', name: 'Bus', category: 'kendaraan-darat', benda: 'bus', gaya: 'poly3d', tags: [], size: [1, 1, 1], refs: 'x' };

test('six gaya with unique slugs', () => {
  assert.deepEqual(GAYA.map((g) => g.slug), ['stik', 'poly3d', 'poly', 'model3d', 'flanel', 'ilustrasi']);
  assert.equal(gayaBySlug('stik')?.nama, 'Stik Polos');
  assert.equal(gayaBySlug('nope'), undefined);
});

test('every library item follows <benda>-<gaya> (or is legacy)', () => {
  for (const { meta } of ITEMS) assert.deepEqual(masalahMeta(meta), [], meta.id);
});

test('masalahMeta flags a wrong id, a bad benda and a bad gaya', () => {
  assert.equal(masalahMeta(base).length, 0);
  assert.match(masalahMeta({ ...base, id: 'bus' })[0], /bus-poly3d/);
  assert.match(masalahMeta({ ...base, benda: 'Bus', id: 'Bus-poly3d' }).join(' '), /huruf kecil/);
  assert.match(masalahMeta({ ...base, gaya: 'xx' as never, id: 'bus-xx' }).join(' '), /gaya/);
});

test('legacy ids are exempt', () => {
  assert.deepEqual([...LEGACY_IDS].sort(), ['gudang-pelabuhan', 'perahu-kajang', 'tiang-tambat']);
  assert.ok(ITEMS.filter((i) => LEGACY_IDS.includes(i.meta.id)).length === 3);
});

test('itemById resolves aliases', () => {
  const it = ITEMS[0];
  it.meta.aliases = ['alias-uji'];
  assert.equal(itemById('alias-uji'), it);
  delete it.meta.aliases;
});
