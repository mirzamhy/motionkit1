// npx tsx --test packages/core/src/scenes/catalog.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIT, findKit } from './catalog';

const here = dirname(fileURLToPath(import.meta.url));

test('every catalog entry points at a file that exists', () => {
  // lab code under scripts/ is not committed yet, so only kit files are checked
  for (const e of KIT.filter((x) => !x.file.includes('scripts/'))) assert.ok(existsSync(join(here, e.file)), `${e.id}: ${e.file} missing`);
});

test('ids are unique', () => {
  assert.equal(new Set(KIT.map((e) => e.id)).size, KIT.length);
});

test('Indonesian words find the right part first', () => {
  assert.equal(findKit('transisi tinta')[0].id, 'Shot.cut');
  assert.equal(findKit('caption kata')[0].id, 'Film.words');
  // a library asset (pohon-poly3d) ranks first: "pustaka dulu"; the kit's Foliage must still be found right after it
  assert.deepEqual(findKit('pohon').slice(0, 2).map((e) => e.id), ['pohon-poly3d', 'Foliage']);
  assert.equal(findKit('semak')[0].id, 'Shrub');
  assert.equal(findKit('bendera')[0].id, 'Flag');
  assert.equal(findKit('timing tahan')[0].id, 'beats');
});

test('nothing found for unrelated words', () => {
  assert.equal(findKit('roket mars nuklir').length, 0);
});
