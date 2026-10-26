import assert from 'node:assert/strict';
import test from 'node:test';
import { ITEMS } from './index';
import { bagiShot, bendaDariBrief, kataBrief, pilihAcuan, pilihGaya, susunStoryboard, type FilmInfo } from './storyboard';

const films: FilmInfo[] = [
  { id: 'StikAndaiOjol', width: 1080, height: 1920 },
  { id: 'StikAndaiOjolGerimis', width: 1080, height: 1920 },
  { id: 'WhatIfGravity', width: 1080, height: 1920 },
  { id: 'PelabuhanIlustrasi', width: 1920, height: 1080 },
];
const m = (brief: string, extra = {}) => ({ brief, rasio: '9:16' as const, detik: 12, ...extra });

test('brief words drop stopwords and duplicates', () => {
  assert.deepEqual(kataBrief('Ojol bertemu penjual kopi, saat hujan! ojol'), ['ojol', 'bertemu', 'penjual', 'kopi', 'hujan']);
});

test('brief words match library benda by name, alias and tag', () => {
  const { benda } = bendaDariBrief('ojol dan penjual kopi', ITEMS);
  assert.ok(benda.includes('ojol'));
  assert.ok(benda.includes('penjual-kopi'));
});

test('look is the one that already has most of the requested things', () => {
  const { benda } = bendaDariBrief('ojol dan penjual kopi', ITEMS);
  assert.equal(pilihGaya(m('x'), benda, ITEMS, films).gaya, 'stik');
  assert.equal(pilihGaya(m('x'), ['gunung', 'gedung'], ITEMS, films).gaya, 'poly3d');
  assert.equal(pilihGaya(m('x', { gaya: 'poly' }), benda, ITEMS, films).gaya, 'poly');
});

test('reference film: same look, same ratio, nearest length, base film before its variants', () => {
  assert.equal(pilihAcuan(m('x'), 'stik', films)?.f.id, 'StikAndaiOjol');
  assert.equal(pilihAcuan(m('x'), 'flanel', films), undefined);
});

test('shot lengths always sum to the requested seconds', () => {
  for (const r of ['hook-hold-payoff', 'beat-sheet', 'masalah-solusi', 'peta-energi'] as const)
    for (const d of [7, 12, 20, 33, 60]) {
      const s = bagiShot(r, d);
      assert.equal(Math.round(s.reduce((a, b) => a + b.detik, 0) * 10) / 10, d, `${r} ${d}`);
      assert.ok(s.every((x) => x.detik > 0));
    }
});

test('storyboard for an ojol brief uses stik parts and the Ojol film as reference', () => {
  const r = susunStoryboard(m('ojol bertemu penjual kopi saat hujan'), ITEMS, films);
  assert.equal(r.gaya, 'stik');
  assert.equal(r.acuan, 'StikAndaiOjol');
  assert.match(r.md, /`ojol-stik`/);
  assert.match(r.md, /`penjual-kopi-stik`/);
  assert.match(r.md, /ISI/);
});

test('a thing missing in the chosen look is marked BELUM ADA with the command and a reference', () => {
  const r = susunStoryboard(m('gunung di atas kota', { gaya: 'stik', rasio: '16:9', detik: 20 }), ITEMS, films);
  assert.match(r.md, /BELUM ADA — `mk aset baru gedung stik`/);
  assert.match(r.md, /acuan: `gedung-poly3d`/);
});
