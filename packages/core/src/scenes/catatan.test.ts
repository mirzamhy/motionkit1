import assert from 'node:assert/strict';
import test from 'node:test';
import { CATATAN, KAMERA, RITME, catatanFilm } from './catatan';
import { SCENES } from './manifest';

test('every note belongs to a registered film and uses known camera and rhythm words', () => {
  for (const [id, c] of Object.entries(CATATAN)) {
    assert.ok(SCENES.some((s) => s.id === id), `${id} is not in manifest.ts`);
    assert.ok(RITME.includes(c.ritme), `${id}: ritme`);
    assert.ok(c.kamera.length && c.kamera.every((k) => KAMERA.includes(k)), `${id}: kamera`);
    assert.ok(c.detik > 0, `${id}: detik`);
  }
});

test('a variant film inherits the note of the film it is named after', () => {
  assert.equal(catatanFilm('StikAndaiOjolGerimis'), CATATAN.StikAndaiOjol);
  assert.equal(catatanFilm('StikAndaiRumahKabut'), CATATAN.StikAndaiRumah);
  assert.equal(catatanFilm('Tidakada'), undefined);
});

test('the longest matching key wins', () => {
  const a = { gaya: 'stik', format: 'a', kamera: ['tetap'], ritme: 'beat-sheet', detik: 1 } as const;
  const b = { ...a, format: 'b' };
  assert.equal(catatanFilm('FooBarX', { Foo: a, FooBar: b } as never)?.format, 'b');
});
