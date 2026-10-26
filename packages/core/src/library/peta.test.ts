// npx tsx --test packages/core/src/library/peta.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idDipakai, pemakai, periksaPustaka, petaMd } from './peta';
import type { LibraryItem } from './types';

const it = (id: string, benda: string, gaya: LibraryItem['meta']['gaya'], extra: Partial<LibraryItem['meta']> = {}): LibraryItem => ({
  meta: { id, name: id, category: 'bangunan', benda, gaya, tags: [], size: [2, 3, 4], refs: 'r.md', variants: ['a', 'b'], ...extra },
  Item3D: () => null,
});
const items = [it('gedung-poly3d', 'gedung', 'poly3d', { komponen: [{ nama: 'City', dari: 'whatif-sim/three/Park' }] }), it('bus-poly3d', 'bus', 'poly3d')];
const files = [
  { path: 'whatif-gravity/World.tsx', text: "import { City } from '../../templates/whatif-sim/three/Park';\n<Aset3D\n  id=\"bus-poly3d\" />" },
  { path: 'x/Other.tsx', text: "const a = itemById('ghost-stik');" },
];

test('idDipakai reads Aset, Aset3D (multi-line) and itemById', () => {
  assert.deepEqual(idDipakai(files).map((r) => r.id).sort(), ['bus-poly3d', 'ghost-stik']);
});

test('pemakai counts explicit ids and imports of komponen, labelled by film id when the folder matches', () => {
  const m = pemakai(items, files, ['WhatIfGravity']);
  assert.deepEqual(m.get('gedung-poly3d'), ['WhatIfGravity']);
  assert.deepEqual(m.get('bus-poly3d'), ['WhatIfGravity']);
});

test('pemakai matches by module: same-named City from another module does not count', () => {
  const other = [{ path: 'stik-polos/StikAndaiRumah.tsx', text: "import { Bubble, City, Label } from '../../styles/stik-polos/kit';" }];
  assert.equal(pemakai(items, other, ['StikAndaiRumah']).get('gedung-poly3d'), undefined);
  const ok = [{ path: 'x/Y.tsx', text: "import { Trees, City } from '../../templates/whatif-sim/three/Park';" }];
  assert.deepEqual(pemakai(items, ok, []).get('gedung-poly3d'), ['x/Y']);
});

test('petaMd is deterministic and has matrix + per-asset sections', () => {
  const a = petaMd(items, files, ['WhatIfGravity']);
  assert.equal(a, petaMd([...items].reverse(), files, ['WhatIfGravity']));
  assert.match(a, /\| bus \|/);
  assert.match(a, /### bus-poly3d/);
  assert.match(a, /WhatIfGravity/);
});

test('periksaPustaka reports bad names, missing refs, stale map and unknown ids', () => {
  const ok = periksaPustaka({ items, files: [files[0]], sceneIds: ['WhatIfGravity'], refsAda: () => true, petaRepo: petaMd(items, [files[0]], ['WhatIfGravity']) });
  assert.deepEqual(ok, []);
  const bad = periksaPustaka({ items: [...items, it('salah', 'bus', 'poly3d')], files, sceneIds: [], refsAda: () => false, petaRepo: 'lama' });
  const all = bad.join('\n');
  assert.match(all, /salah: id harus bus-poly3d/);
  assert.match(all, /refs.md/);
  assert.match(all, /mk aset peta/);
  assert.match(all, /ghost-stik/);
});
