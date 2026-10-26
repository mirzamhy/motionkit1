# Aset per gaya: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MotionKit's item library plug-and-play across looks: every asset named `<benda>-<gaya>`, used in films by id through `<Aset>`/`<Aset3D>`, searchable per object and per look, with a generated map and a gate, proven by six low-poly 3D assets (bus, gunung, pohon, rumput, gedung, bumi).

**Architecture:** One central library (`packages/core/src/library`) keeps the existing `LibraryItem` contract and adds `benda` + `gaya` to `ItemMeta`. A style registry (`styles/index.ts`) lists the six looks. Pure logic (naming rules, resolve, matrix, scaffold, map, gate checks) lives in small `.ts` files with `node:test` tests; the CLI (`apps/cli/aset.ts`) only does file IO. The six poly3d assets are copied from the simulif-gravity code already inside MotionKit (`templates/whatif-sim/three`) and from `C:\Mirza Personal\volcano-whatif\src`; the old template files become re-exports so there is one copy and `WhatIfGravity` renders identically.

**Tech Stack:** TypeScript, React 19, Remotion 4.0.473, `@remotion/three` + react-three-fiber + `three`, `node:test` run with `npx tsx --test` (the repo's runner; the spec said vitest, the repo uses `node:test`, so tests follow the repo).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md`. Gaya slugs: `stik`, `poly`, `poly3d`, `model3d`, `flanel`, `ilustrasi`. Asset id = `<benda>-<gaya>`, `benda` lowercase with optional hyphens; `LEGACY_IDS` = `perahu-kajang`, `gudang-pelabuhan`, `tiang-tambat` are exempt.
- `t` passed to `Item2D`/`Item3D` is a frame in 30-fps units; items needing seconds divide by 30.
- `Item3D` contract: metres, origin at the centre of the base, +y up. `Item2D`: `(x, y)` where the item meets the ground, `s` px per metre.
- Unknown id or wrong dimension must throw an `Error` (render fails), never render empty.
- Every frame must be computable alone: seeded `rng` / remotion `random`, no `Math.random`, no `useFrame`.
- Do not change the `C:\Mirza Personal\volcano-whatif` or `simulif-gravity` projects; copy code only.
- Windows quirks: `npx tsc --noEmit -p .` is slow (use a 300 s timeout); run render jobs one at a time; write non-trivial scripts to files, do not inline them in the shell.
- Commits: no `Co-Authored-By` / Claude attribution (user's standing rule). The working tree already has unrelated uncommitted changes (Stik Polos set etc.): `git add` only the exact paths a task lists, and run commit steps only after the user has said commits are wanted.
- Work in `C:\Mirza Personal\motionkit`. All paths below are relative to it. Test command pattern: `npx tsx --test <file>`.

## File Structure

New:
- `packages/core/src/styles/index.ts`: `GayaSlug`, `Gaya`, `GAYA`, `gayaBySlug`.
- `packages/core/src/library/naming.ts` (+ `naming.test.ts`): `LEGACY_IDS`, `masalahMeta`.
- `packages/core/src/library/aset-resolve.ts` (+ `aset-resolve.test.ts`): `suggest`, `resolveAset`.
- `packages/core/src/library/aset.tsx`: `Aset`, `Aset3D`.
- `packages/core/src/library/matriks.ts` (+ `matriks.test.ts`): `matriks`, `barisMatriks`, `cariAset`.
- `packages/core/src/library/scaffold.ts` (+ `scaffold.test.ts`): `sisipkan`, `kerangka`.
- `packages/core/src/library/peta.ts` (+ `peta.test.ts`): `idDipakai`, `pemakai`, `petaMd`, `periksaPustaka`.
- `apps/cli/aset.ts`: `gayaList`, `gayaShow`, `asetFind`, `asetBaru`, `asetPeta`, `petaTerbaru`, `petaDiRepo`, `sceneFiles`.
- `packages/core/src/library/poly3d/{index.ts,refs.md,util.tsx,planet.ts,kit.tsx,bumi.tsx,bus.tsx,pohon.tsx,gunung.tsx,rumput.tsx,gedung.tsx}`.
- `packages/core/src/scenes/aset-uji/AsetUji3D.tsx`.
- `docs/aset/PETA.md` (generated).

Modified: `library/types.ts`, `library/index.ts`, `library/preview.tsx`, `library/stik-polos/index.tsx`, three legacy item `index.tsx` files, `apps/cli/index.ts`, `apps/cli/gate.ts`, `templates/whatif-sim/three/{util.tsx,planet.ts,Grass.tsx,Park.tsx}`, `scenes/index.tsx`, `scenes/manifest.ts`, `AGENTS.md`, `docs/scenes/{ITEMS,KIT}.md`, the spec (Task 10).

---

### Task 1: Style registry, naming rules, `ItemMeta` fields

**Files:**
- Create: `packages/core/src/styles/index.ts`, `packages/core/src/library/naming.ts`, `packages/core/src/library/naming.test.ts`
- Modify: `packages/core/src/library/types.ts`, `packages/core/src/library/index.ts`, `packages/core/src/library/stik-polos/index.tsx:15-45`, `packages/core/src/library/kendaraan-air/perahu-kajang/index.tsx`, `packages/core/src/library/bangunan/gudang-pelabuhan/index.tsx`, `packages/core/src/library/properti/tiang-tambat/index.tsx`

**Interfaces:**
- Produces: `GayaSlug`, `Gaya`, `GAYA: Gaya[]`, `gayaBySlug(s: string): Gaya | undefined`; `ItemMeta` gains `benda: string; gaya: GayaSlug; aliases?: string[]; komponen?: string[]` and loses `style?`; `LEGACY_IDS: string[]`, `masalahMeta(m: ItemMeta): string[]` (empty = fine); `itemById` resolves aliases.

- [ ] **Step 1: Write the failing test** `packages/core/src/library/naming.test.ts`

```ts
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
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test packages/core/src/library/naming.test.ts`
Expected: FAIL, "Cannot find module '../styles'".

- [ ] **Step 3: Create `packages/core/src/styles/index.ts`**

```ts
// The looks MotionKit can shoot in. One entry per look; the library folder holds that look's assets
// (`mk gaya list`, `mk gaya show <slug>`). Naming: an asset is `<benda>-<gaya>`. See docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md.
export type GayaSlug = 'stik' | 'poly' | 'poly3d' | 'model3d' | 'flanel' | 'ilustrasi';

export type Gaya = {
  slug: GayaSlug;
  nama: string;
  dimensi: '2d' | '3d';
  ringkas: string;
  /** folder under packages/core/src/library; null = the old per-category folders */
  folder: string | null;
  /** scene ids (manifest.ts) to copy from */
  contoh: string[];
  /** the look's recipe, relative to packages/core/src */
  resep?: string;
};

export const GAYA: Gaya[] = [
  { slug: 'stik', nama: 'Stik Polos', dimensi: '2d', ringkas: 'Stickman abu-abu tanpa wajah, garis tebal, palet dingin dengan satu aksen hangat.', folder: 'stik-polos', contoh: ['StikAndaiRumah', 'StikAndaiOjol'], resep: 'styles/stik-polos/README.md' },
  { slug: 'poly3d', nama: 'Low-poly 3D', dimensi: '3d', ringkas: 'Bentuk low-poly flat-shaded di ThreeCanvas, tekstur prosedural, kamera bebas.', folder: 'poly3d', contoh: ['WhatIfGravity'], resep: 'templates/whatif-sim/README.md' },
  { slug: 'poly', nama: 'Low-poly 2D', dimensi: '2d', ringkas: 'Segitiga datar berwarna di SVG. Belum ada contoh.', folder: 'poly', contoh: [] },
  { slug: 'model3d', nama: 'Model GLB realistis', dimensi: '3d', ringkas: 'Model glTF (Poly Haven dsb.) dibungkus Item3D. Belum ada contoh.', folder: 'model3d', contoh: [] },
  { slug: 'flanel', nama: 'Kain flanel 3D (Jajan Dulu)', dimensi: '3d', ringkas: 'Tokoh dan benda dari kain flanel, rig badan di packages/three/src/jajan.', folder: 'flanel', contoh: ['JajanTeaserTudung', 'JajanTeaserLapak'] },
  { slug: 'ilustrasi', nama: 'Ilustrasi SVG berlapis', dimensi: '2d', ringkas: 'Gambar SVG bersumber foto acuan: pelabuhan, kampus, pasar.', folder: null, contoh: ['PelabuhanProof', 'UnairFilm'] },
];

export const gayaBySlug = (s: string) => GAYA.find((g) => g.slug === s);
```

Note: `contoh` ids must exist in `scenes/manifest.ts`; Step 7 checks that.

- [ ] **Step 4: Edit `library/types.ts`**: replace the `style?: string;` field and its comment, and add the import.

Old:
```ts
  /** style pack the item belongs to, e.g. 'stik-polos' (items drawn for one look, see styles/) */
  style?: string;
```
New:
```ts
  /** the thing: 'gedung', 'rumah-sakit'. id is `${benda}-${gaya}` (naming.ts) */
  benda: string;
  /** the look, a slug from styles/index.ts */
  gaya: GayaSlug;
  /** older ids that still resolve to this item, so a rename never breaks a film */
  aliases?: string[];
  /** names of the original components this item wraps; `mk aset peta` counts a scene that imports one as a user */
  komponen?: string[];
```
Add `import type { GayaSlug } from '../styles';` after `import type React from 'react';`.

- [ ] **Step 5: Create `packages/core/src/library/naming.ts`**

```ts
// Naming rule for the item library: id = `${benda}-${gaya}`. Checked by `mk gate` and naming.test.ts.
import { gayaBySlug } from '../styles';
import type { ItemMeta } from './types';

/** ids that predate the rule and keep their names */
export const LEGACY_IDS = ['perahu-kajang', 'gudang-pelabuhan', 'tiang-tambat'];

const BENDA = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** what is wrong with one item's naming; an empty list means fine */
export const masalahMeta = (m: ItemMeta): string[] => {
  const out: string[] = [];
  if (!gayaBySlug(m.gaya)) out.push(`${m.id}: gaya "${m.gaya}" bukan slug terdaftar (styles/index.ts)`);
  if (!BENDA.test(m.benda)) out.push(`${m.id}: benda "${m.benda}" harus huruf kecil/angka dengan strip`);
  if (!LEGACY_IDS.includes(m.id) && m.id !== `${m.benda}-${m.gaya}`) out.push(`${m.id}: id harus ${m.benda}-${m.gaya}`);
  return out;
};
```

- [ ] **Step 6: Wire the rest**

`library/index.ts` becomes (the markers are used by `mk aset baru` in Task 4; `itemById` now sees aliases):

```ts
// Every item in the library. Add a line when you add an item folder (docs/scenes/ITEMS.md).
// `mk aset baru` inserts at the `aset:` markers below.
import type { LibraryItem } from './types';
import * as perahuKajang from './kendaraan-air/perahu-kajang';
import * as gudangPelabuhan from './bangunan/gudang-pelabuhan';
import * as tiangTambat from './properti/tiang-tambat';
import { ITEMS_STIK_POLOS } from './stik-polos';
// aset:impor-gaya

export const ITEMS: LibraryItem[] = [
  perahuKajang,
  gudangPelabuhan,
  tiangTambat,
  ...ITEMS_STIK_POLOS,
  // aset:daftar-gaya
];
export const itemById = (id: string) => ITEMS.find((i) => i.meta.id === id || i.meta.aliases?.includes(id));
export type { ItemMeta, Item2DProps, Item3DProps, LibraryItem } from './types';
```

`library/stik-polos/index.tsx`, in `part()`: replace `style: STYLE_ID,` with
```ts
    benda: d.id.replace(/-stik$/, ''),
    gaya: 'stik',
```
(keep `export const STYLE_ID`).

Legacy items: in each `export const meta: ItemMeta = {` add after the `name:` line: `perahu-kajang` gets `benda: 'perahu', gaya: 'ilustrasi',`; `gudang-pelabuhan` gets `benda: 'gudang', gaya: 'ilustrasi',`; `tiang-tambat` gets `benda: 'tiang-tambat', gaya: 'ilustrasi',`.

- [ ] **Step 7: Check scene ids in `contoh`, then tests and typecheck**

Run: `grep -o "id: '[A-Za-z0-9]*'" packages/core/src/scenes/manifest.ts`
Every id in the `contoh` arrays (`StikAndaiRumah`, `StikAndaiOjol`, `WhatIfGravity`, `JajanTeaserTudung`, `JajanTeaserLapak`, `PelabuhanProof`, `UnairFilm`) must appear. Replace any that is missing with an id that is present. Also confirm `templates/whatif-sim/README.md` exists (`ls`); if not, drop the `resep` of `poly3d`.

Run: `npx tsx --test packages/core/src/library/naming.test.ts`
Expected: PASS (5 tests).

Run: `timeout 300 npx tsc --noEmit -p .`
Expected: no errors. If a file outside the list still sets `style:` on an `ItemMeta`, give it `benda`/`gaya` instead.

- [ ] **Step 8: Commit**

```bash
git add packages/core/src/styles/index.ts packages/core/src/library/naming.ts packages/core/src/library/naming.test.ts packages/core/src/library/types.ts packages/core/src/library/index.ts packages/core/src/library/stik-polos/index.tsx packages/core/src/library/kendaraan-air packages/core/src/library/bangunan packages/core/src/library/properti
git commit -m "feat(library): gaya registry, <benda>-<gaya> naming rule, aliases"
```

---

### Task 2: `<Aset>` and `<Aset3D>`

**Files:**
- Create: `packages/core/src/library/aset-resolve.ts`, `packages/core/src/library/aset-resolve.test.ts`, `packages/core/src/library/aset.tsx`

**Interfaces:**
- Consumes: `ITEMS`, `itemById` (`./index`), `Item2DProps`, `Item3DProps`, `LibraryItem`.
- Produces: `suggest(id: string, n?: number): string[]`; `resolveAset(id: string, dim: '2d' | '3d'): LibraryItem`; `<Aset id x y s t? seed? variant? light? flip? />`; `<Aset3D id position? rotation? scale? t? seed? variant? />`.

- [ ] **Step 1: Write the failing test** `aset-resolve.test.ts`

```tsx
// npx tsx --test packages/core/src/library/aset-resolve.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveAset, suggest } from './aset-resolve';
import { Aset } from './aset';

test('suggest ranks the nearest ids first', () => {
  assert.equal(suggest('mobil-stk')[0], 'mobil-stik');
  assert.equal(suggest('mobil-stk').length, 3);
});

test('resolveAset returns the item', () => {
  assert.equal(resolveAset('mobil-stik', '2d').meta.id, 'mobil-stik');
});

test('unknown id throws with suggestions and the fix command', () => {
  assert.throws(() => resolveAset('mobil-stk', '2d'), (e: Error) => /mobil-stik/.test(e.message) && /mk aset baru <benda> <gaya>/.test(e.message));
});

test('wrong dimension throws and names what exists', () => {
  assert.throws(() => resolveAset('mobil-stik', '3d'), (e: Error) => /Item3D/.test(e.message) && /2D/.test(e.message));
});

test('<Aset> renders a known 2D item and fails on an unknown one', () => {
  const ok = renderToStaticMarkup(React.createElement('svg', null, React.createElement(Aset, { id: 'lampu-jalan-stik', x: 100, y: 400, s: 100 })));
  assert.match(ok, /<g/);
  assert.throws(() => renderToStaticMarkup(React.createElement(Aset, { id: 'nope-stik', x: 0, y: 0, s: 1 })), /nope-stik/);
});
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test packages/core/src/library/aset-resolve.test.ts`
Expected: FAIL, "Cannot find module './aset-resolve'".

- [ ] **Step 3: Create `aset-resolve.ts`**

```ts
// Looks an asset up by id for <Aset>/<Aset3D>. A film may only use what is in the library: an unknown id or the wrong
// dimension throws, so a new thing is made in the library first ("pustaka dulu", AGENTS.md).
import { ITEMS, itemById } from './index';
import type { LibraryItem } from './types';

const lev = (a: string, b: string) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

/** the n ids closest to a wrong one (edit distance, ties by id) */
export const suggest = (id: string, n = 3) =>
  ITEMS.map((i) => i.meta.id).map((x) => ({ x, d: lev(id, x) })).sort((a, b) => a.d - b.d || a.x.localeCompare(b.x)).slice(0, n).map((r) => r.x);

export const resolveAset = (id: string, dim: '2d' | '3d'): LibraryItem => {
  const it = itemById(id);
  if (!it) throw new Error(`Aset "${id}" tidak ada di pustaka. Mirip: ${suggest(id).join(', ')}. Buat dulu: mk aset baru <benda> <gaya>  (cari: mk aset find <benda>)`);
  const has = [it.Item2D && '2D', it.Item3D && '3D'].filter(Boolean).join('+');
  if (dim === '2d' && !it.Item2D) throw new Error(`Aset "${id}" tidak punya Item2D (tersedia: ${has || 'tidak ada'}). Pakai <Aset3D> atau pilih id lain.`);
  if (dim === '3d' && !it.Item3D) throw new Error(`Aset "${id}" tidak punya Item3D (tersedia: ${has || 'tidak ada'}). Pakai <Aset> atau pilih id lain.`);
  return it;
};
```

- [ ] **Step 4: Create `aset.tsx`**

```tsx
// How a film uses a library asset: by id, never by redrawing it. <Aset> goes inside an <svg>, <Aset3D> inside a
// <ThreeCanvas>. `t` is a frame in 30-fps units. See docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md.
import React from 'react';
import { resolveAset } from './aset-resolve';
import type { Item2DProps, Item3DProps } from './types';

type V3 = [number, number, number];

export const Aset: React.FC<{ id: string } & Item2DProps> = ({ id, ...p }) => {
  const { Item2D } = resolveAset(id, '2d');
  return <Item2D {...p} />;
};

export const Aset3D: React.FC<{ id: string; position?: V3; rotation?: V3; scale?: number | V3 } & Item3DProps> = ({ id, position, rotation, scale, ...p }) => {
  const { Item3D } = resolveAset(id, '3d');
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Item3D {...p} />
    </group>
  );
};
```

- [ ] **Step 5: Run the tests and typecheck**

Run: `npx tsx --test packages/core/src/library/aset-resolve.test.ts`
Expected: PASS (5 tests).
Run: `timeout 300 npx tsc --noEmit -p .`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/library/aset-resolve.ts packages/core/src/library/aset-resolve.test.ts packages/core/src/library/aset.tsx
git commit -m "feat(library): <Aset>/<Aset3D> with throw-on-unknown and suggestions"
```

---

### Task 3: Matrix, `mk gaya`, `mk aset find`

**Files:**
- Create: `packages/core/src/library/matriks.ts`, `packages/core/src/library/matriks.test.ts`, `apps/cli/aset.ts`
- Modify: `apps/cli/index.ts` (HELP text near line 23, new cases next to `case 'item'` at ~line 273)

**Interfaces:**
- Consumes: `GAYA`, `GayaSlug`, `LibraryItem`, `ITEMS`, `scoreKit`.
- Produces: `matriks(items: LibraryItem[]): Map<string, Partial<Record<GayaSlug, string>>>` (benda to gaya to item id); `barisMatriks(benda: string, row): string`; `cariAset(q: string, gaya?: GayaSlug, items?: LibraryItem[]): { benda: string; row: ...; baris: string }[]`; CLI functions `gayaList()`, `gayaShow(slug)`, `asetFind(q, gaya?)`.

- [ ] **Step 1: Write the failing test** `matriks.test.ts`

```ts
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
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test packages/core/src/library/matriks.test.ts`
Expected: FAIL, "Cannot find module './matriks'".

- [ ] **Step 3: Create `matriks.ts`**

```ts
// The benda × gaya matrix behind `mk aset find`: for each thing, which looks already have it.
import { GAYA, type GayaSlug } from '../styles';
import { scoreKit } from '../scenes/catalog';
import { ITEMS } from './index';
import type { LibraryItem } from './types';

export type Baris = Partial<Record<GayaSlug, string>>;

export const matriks = (items: LibraryItem[]) => {
  const m = new Map<string, Baris>();
  for (const { meta } of items) m.set(meta.benda, { ...m.get(meta.benda), [meta.gaya]: meta.id });
  return m;
};

export const barisMatriks = (benda: string, row: Baris) => `${benda}: ${GAYA.map((g) => `${g.slug} ${row[g.slug] ? '✔' : '✗'}`).join('  ')}`;

/** things matching the words (by benda, tags or name), narrowed to a look when given; each with its matrix row */
export const cariAset = (q: string, gaya?: GayaSlug, items: LibraryItem[] = ITEMS) => {
  const m = matriks(items);
  const hit = new Set<string>();
  for (const { meta } of items) {
    const e = { id: meta.id, file: '', kind: 'item' as const, role: meta.name, use: '', tags: [meta.benda, ...meta.tags] };
    if (scoreKit(e, q) > 0 && (!gaya || meta.gaya === gaya)) hit.add(meta.benda);
  }
  return [...hit].sort().map((benda) => ({ benda, row: m.get(benda)!, baris: barisMatriks(benda, m.get(benda)!) }));
};
```

- [ ] **Step 4: Create `apps/cli/aset.ts`** (gaya + find now; `asetBaru` is added in Task 4, `asetPeta` in Task 5)

```ts
// mk gaya / mk aset: the looks and their assets. Pure logic lives in packages/core/src/library; this file only prints and writes.
import { GAYA, gayaBySlug, type GayaSlug } from '../../packages/core/src/styles';
import { ITEMS } from '../../packages/core/src/library';
import { cariAset } from '../../packages/core/src/library/matriks';

const log = (s: string) => console.log(s);
const jumlah = (slug: GayaSlug) => ITEMS.filter((i) => i.meta.gaya === slug).length;

export const gayaList = () => {
  for (const g of GAYA) log(`  ${g.slug.padEnd(10)} ${g.dimensi}  ${String(jumlah(g.slug)).padStart(3)} aset  ${(jumlah(g.slug) ? 'ada' : 'kosong').padEnd(7)} ${g.nama}  · contoh: ${g.contoh.join(', ') || '-'}`);
};

export const gayaShow = (slug: string) => {
  const g = gayaBySlug(slug);
  if (!g) throw new Error(`gaya "${slug}" tidak ada. Pilih: ${GAYA.map((x) => x.slug).join(', ')}`);
  log(`\n  ${g.nama} (${g.slug}, ${g.dimensi})\n  ${g.ringkas}\n  folder: library/${g.folder ?? '(kategori lama)'}  ·  resep: ${g.resep ?? '-'}\n  film contoh: ${g.contoh.join(', ') || '-'}\n  aset:`);
  const own = ITEMS.filter((i) => i.meta.gaya === g.slug);
  if (!own.length) log('    (kosong) mk aset baru <benda> ' + g.slug);
  for (const { meta, Item2D, Item3D } of own) log(`    ${meta.id.padEnd(26)} ${[Item2D && '2D', Item3D && '3D'].filter(Boolean).join('+').padEnd(6)} ${meta.size.join('×')} m  ${meta.variants?.join(', ') ?? ''}`);
};

export const asetFind = (q: string, gaya?: string) => {
  if (gaya && !gayaBySlug(gaya)) throw new Error(`gaya "${gaya}" tidak ada. Pilih: ${GAYA.map((x) => x.slug).join(', ')}`);
  const hits = cariAset(q, gaya as GayaSlug | undefined);
  if (!hits.length) return log(`  tidak ada benda untuk "${q}"${gaya ? ` di gaya ${gaya}` : ''}: gambar dulu di pustaka (mk aset baru <benda> <gaya>)`);
  for (const h of hits) log(`  ${h.baris}\n    ${Object.values(h.row).join(', ')}`);
};
```

- [ ] **Step 5: Wire into `apps/cli/index.ts`**

Add the import next to the `./item` import: `import { asetFind, gayaList, gayaShow } from './aset';`

Add before `case 'gate':`:

```ts
    case 'gaya': {
      const [, sub, slug2] = args;
      if (sub === 'list') gayaList();
      else if (sub === 'show' && slug2) gayaShow(slug2);
      else throw new Error('usage: mk gaya list | show <slug>');
      break;
    }
    case 'aset': {
      const [, sub, ...rest] = args;
      const gi = rest.indexOf('--gaya');
      const words = rest.filter((x, i) => !x.startsWith('--') && rest[i - 1] !== '--gaya');
      if (sub === 'find' && words.length) asetFind(words.join(' '), gi >= 0 ? rest[gi + 1] : undefined);
      else throw new Error('usage: mk aset find <kata> [--gaya <slug>] | baru <benda> <gaya> | peta');
      break;
    }
```

Add to the `HELP` template, next to the `mk item …` lines:

```
  mk gaya list | show <slug>   the looks (stik, poly3d, …) with their assets and example films
  mk aset find <kata> [--gaya <slug>]   which looks already have a thing (matrix per benda)
```

Do not touch the existing `case 'asset'` (a different command: downloads).

- [ ] **Step 6: Run tests and the CLI**

Run: `npx tsx --test packages/core/src/library/matriks.test.ts`
Expected: PASS (3 tests).
Run: `node bin/mk.mjs gaya list`
Expected: six lines; `stik` shows 14 aset, `ilustrasi` 3, the others `kosong`.
Run: `node bin/mk.mjs aset find rumah`
Expected: lines like `rumah-sakit: stik ✔  poly3d ✗ …`.
Run: `timeout 300 npx tsc --noEmit -p .`; Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/library/matriks.ts packages/core/src/library/matriks.test.ts apps/cli/aset.ts apps/cli/index.ts
git commit -m "feat(cli): mk gaya list|show and mk aset find with benda x gaya matrix"
```

---

### Task 4: `mk aset baru` scaffold

**Files:**
- Create: `packages/core/src/library/scaffold.ts`, `packages/core/src/library/scaffold.test.ts`
- Modify: `apps/cli/aset.ts` (add `asetBaru`), `apps/cli/index.ts` (route `baru`)

**Interfaces:**
- Consumes: `gayaBySlug`.
- Produces: `sisipkan(text: string, marker: string, line: string): string` (inserts `line` before the line containing `marker`, same indent; throws if the marker is missing); `kerangka(benda: string, gaya: string, ada: Set<string>)` returning `{ id, folder, file, content, indexNew, indexImport, indexList, itemImport, itemName, refsNote }` where `file` is relative to `packages/core/src/library`; throws on bad benda, bad gaya, duplicate, `stik` and `ilustrasi`.

- [ ] **Step 1: Write the failing test** `scaffold.test.ts`

```ts
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
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test packages/core/src/library/scaffold.test.ts`
Expected: FAIL, "Cannot find module './scaffold'".

- [ ] **Step 3: Create `scaffold.ts`**

```ts
// `mk aset baru <benda> <gaya>`: the skeleton of a new asset, so a thing is made in the library before a film uses it.
// The skeleton draws a labelled box, so `mk item preview <id>` works straight away.
import { gayaBySlug } from '../styles';

export const sisipkan = (text: string, marker: string, line: string) => {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.includes(marker));
  if (i < 0) throw new Error(`marker "${marker}" tidak ada`);
  const indent = lines[i].match(/^\s*/)![0];
  lines.splice(i, 0, indent + line);
  return lines.join('\n');
};

const head = (id: string, benda: string, gaya: string, folder: string) => `export const meta: ItemMeta = {
  id: '${id}',
  name: '${benda} (${gaya})',
  category: 'properti', // ganti: kendaraan-air | bangunan | properti | alam | orang | kendaraan-darat
  benda: '${benda}', gaya: '${gaya}',
  tags: ['${benda}'],
  size: [1, 1, 1],
  variants: ['default'],
  refs: 'packages/core/src/library/${folder}/refs.md',
  file: 'packages/core/src/library/${folder}/${benda}.tsx',
  invented: ['BELUM DIGAMBAR: kerangka'],
};
`;

const skeleton2D = (id: string, benda: string, gaya: string, folder: string) => `// ${id}: BELUM DIGAMBAR. Ganti kotak ini dengan gambar aslinya (aturan gaya: lihat \`mk gaya show ${gaya}\`).
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';

${head(id, benda, gaya, folder)}
export const Item2D: React.FC<Item2DProps> = ({ x, y, s }) => (
  <g transform={\`translate(\${x} \${y}) scale(\${s})\`}>
    <rect x={-0.5} y={-1} width={1} height={1} fill="#c33" stroke="#400" strokeWidth={0.04} />
    <text x={0} y={-0.5} textAnchor="middle" fontSize={0.12} fill="#fff">BELUM DIGAMBAR</text>
  </g>
);
`;

const skeleton3D = (id: string, benda: string, gaya: string, folder: string) => `// ${id}: BELUM DIGAMBAR. Ganti kotak ini dengan modelnya (aturan gaya: lihat \`mk gaya show ${gaya}\`). Meter, titik asal di tengah alas.
import React from 'react';
import type { Item3DProps, ItemMeta } from '../types';

${head(id, benda, gaya, folder)}
// BELUM DIGAMBAR
export const Item3D: React.FC<Item3DProps> = () => (
  <mesh position={[0, 0.5, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshLambertMaterial color="#cc3333" />
  </mesh>
);
`;

const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export const kerangka = (benda: string, gaya: string, ada: Set<string>) => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(benda)) throw new Error(`benda "${benda}" harus huruf kecil/angka dengan strip`);
  const g = gayaBySlug(gaya);
  if (!g) throw new Error(`gaya "${gaya}" bukan slug terdaftar (mk gaya list)`);
  if (g.slug === 'stik') throw new Error('Stik Polos: tambah part({...}) di library/stik-polos/index.tsx (resep: styles/stik-polos/README.md)');
  if (!g.folder) throw new Error('ilustrasi memakai folder kategori lama (library/<kategori>/<id>/index.tsx, lihat docs/scenes/ITEMS.md)');
  const id = `${benda}-${g.slug}`;
  if (ada.has(id)) throw new Error(`aset "${id}" sudah ada`);
  const up = `ITEMS_${g.slug.toUpperCase()}`;
  return {
    id,
    folder: g.folder,
    file: `${g.folder}/${benda}.tsx`,
    content: (g.dimensi === '3d' ? skeleton3D : skeleton2D)(id, benda, g.slug, g.folder),
    /** index.ts of a look that has no folder yet */
    indexNew: `// Assets of the "${g.nama}" look. \`mk aset baru\` inserts at the aset: markers.\nimport type { LibraryItem } from '../types';\n// aset:impor\n\nexport const ${up}: LibraryItem[] = [\n  // aset:daftar\n];\n`,
    indexImport: `import { ${up} } from './${g.folder}';`,
    indexList: `...${up},`,
    itemImport: `import * as ${camel(benda)} from './${benda}';`,
    itemName: camel(benda),
    refsNote: `\n## ${id}\n\nBELUM ADA ACUAN. Tulis di sini foto/gambar yang dipakai, apa yang terlihat, ukuran nyata, dan bagian yang direka.\n`,
  };
};
```

- [ ] **Step 4: Add `asetBaru` to `apps/cli/aset.ts`**

Add imports at the top: `existsSync, mkdirSync, readFileSync, writeFileSync` from `node:fs`, `join` from `node:path`, `ROOT` from `./paths`, `kerangka, sisipkan` from `../../packages/core/src/library/scaffold`. Append:

```ts
const LIB = join(ROOT, 'packages', 'core', 'src', 'library');

export const asetBaru = (benda: string, gaya: string) => {
  const k = kerangka(benda, gaya, new Set(ITEMS.map((i) => i.meta.id)));
  const dir = join(LIB, k.folder);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(LIB, k.file), k.content);
  const idx = join(dir, 'index.ts');
  if (!existsSync(idx)) {
    writeFileSync(idx, k.indexNew);
    const top = join(LIB, 'index.ts');
    let t = readFileSync(top, 'utf8');
    t = sisipkan(t, '// aset:impor-gaya', k.indexImport);
    t = sisipkan(t, '// aset:daftar-gaya', k.indexList);
    writeFileSync(top, t);
  }
  let i = readFileSync(idx, 'utf8');
  i = sisipkan(i, '// aset:impor', k.itemImport);
  i = sisipkan(i, '// aset:daftar', `${k.itemName},`);
  writeFileSync(idx, i);
  const refs = join(dir, 'refs.md');
  writeFileSync(refs, (existsSync(refs) ? readFileSync(refs, 'utf8') : `# ${gaya}: acuan\n`) + k.refsNote);
  log(`  ✓ ${k.id}\n    ${join('packages/core/src/library', k.file)}\n    lihat: node bin/mk.mjs item preview ${k.id}\n    lalu isi refs.md, gambar, dan jalankan: node bin/mk.mjs aset peta`);
};
```

In `apps/cli/index.ts` extend the import to include `asetBaru` and add, before the final `else throw` of `case 'aset'`:

```ts
      else if (sub === 'baru' && words.length === 2) asetBaru(words[0], words[1]);
```

- [ ] **Step 5: Run unit tests**

Run: `npx tsx --test packages/core/src/library/scaffold.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: End-to-end check, then undo it**

Run: `node bin/mk.mjs aset baru gedung model3d`
Expected: prints `✓ gedung-model3d`. Then `timeout 300 npx tsc --noEmit -p .` must be clean (criterion 4), and `node bin/mk.mjs item preview gedung-model3d` writes `out/items/gedung-model3d/preview-3d.jpg` showing a red box.
Run the same `aset baru` command again; Expected error: `aset "gedung-model3d" sudah ada`.
Undo (the skeleton is not a real asset): delete the folder `packages/core/src/library/model3d/` and remove the two lines `import { ITEMS_MODEL3D } from './model3d';` and `...ITEMS_MODEL3D,` from `packages/core/src/library/index.ts`. Confirm with `git diff packages/core/src/library/index.ts` that only the Task 1 marker structure differs from HEAD.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/library/scaffold.ts packages/core/src/library/scaffold.test.ts apps/cli/aset.ts apps/cli/index.ts
git commit -m "feat(cli): mk aset baru scaffolds a labelled placeholder asset"
```

---

### Task 5: Generated `PETA.md`, `mk aset peta`, gate checks

**Files:**
- Create: `packages/core/src/library/peta.ts`, `packages/core/src/library/peta.test.ts`
- Modify: `apps/cli/aset.ts` (add `sceneFiles`, `petaTerbaru`, `petaDiRepo`, `asetPeta`), `apps/cli/index.ts` (route `peta`), `apps/cli/gate.ts`
- Generated: `docs/aset/PETA.md`

**Interfaces:**
- Consumes: `LibraryItem`, `GAYA`, `masalahMeta`, `matriks`.
- Produces: `type Berkas = { path: string; text: string }` (scene files, path relative to `packages/core/src/scenes`); `idDipakai(files): { id: string; path: string }[]` (explicit ids in `<Aset id=…>`, `<Aset3D id=…>`, `itemById('…')`); `pemakai(items, files, sceneIds): Map<string, string[]>` (item id to film labels; also counts files that import a name listed in `meta.komponen`); `petaMd(items, files, sceneIds): string`; `periksaPustaka({ items, files, sceneIds, refsAda, petaRepo }): string[]` (messages; empty = pass).

- [ ] **Step 1: Write the failing test** `peta.test.ts`

```ts
// npx tsx --test packages/core/src/library/peta.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idDipakai, pemakai, periksaPustaka, petaMd } from './peta';
import type { LibraryItem } from './types';

const it = (id: string, benda: string, gaya: LibraryItem['meta']['gaya'], extra: Partial<LibraryItem['meta']> = {}): LibraryItem => ({
  meta: { id, name: id, category: 'bangunan', benda, gaya, tags: [], size: [2, 3, 4], refs: 'r.md', variants: ['a', 'b'], ...extra },
  Item3D: () => null,
});
const items = [it('gedung-poly3d', 'gedung', 'poly3d', { komponen: ['City'] }), it('bus-poly3d', 'bus', 'poly3d')];
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
```

- [ ] **Step 2: Run to see it fail**

Run: `npx tsx --test packages/core/src/library/peta.test.ts`
Expected: FAIL, "Cannot find module './peta'".

- [ ] **Step 3: Create `peta.ts`**

```ts
// docs/aset/PETA.md: the generated map of the library (benda × gaya, per-asset details, which films use what) and the
// static checks `mk gate` runs on it. Pure functions; apps/cli/aset.ts reads the files.
import { GAYA } from '../styles';
import { masalahMeta } from './naming';
import { matriks } from './matriks';
import type { LibraryItem } from './types';

export type Berkas = { path: string; text: string };

const ASET_TAG = /<Aset(?:3D)?\b[^>]*?\bid=["']([^"']+)["']/g;
const BY_ID = /itemById\(\s*['"]([^'"]+)['"]\s*\)/g;

export const idDipakai = (files: Berkas[]) => {
  const out: { id: string; path: string }[] = [];
  for (const f of files) for (const re of [ASET_TAG, BY_ID]) for (const m of f.text.matchAll(re)) out.push({ id: m[1], path: f.path });
  return out;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const label = (path: string, sceneIds: string[]) => {
  const dir = path.includes('/') ? path.split('/')[0] : '';
  return sceneIds.find((s) => dir && norm(s) === norm(dir)) ?? path.replace(/\.tsx?$/, '');
};
const imports = (text: string, name: string) => new RegExp(`import[^;]*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`).test(text);

export const pemakai = (items: LibraryItem[], files: Berkas[], sceneIds: string[]) => {
  const res = new Map<string, string[]>();
  const add = (id: string, l: string) => res.set(id, [...new Set([...(res.get(id) ?? []), l])].sort());
  for (const u of idDipakai(files)) add(u.id, label(u.path, sceneIds));
  for (const { meta } of items) for (const f of files) if (meta.komponen?.some((n) => imports(f.text, n))) add(meta.id, label(f.path, sceneIds));
  return res;
};

export const petaMd = (items: LibraryItem[], files: Berkas[], sceneIds: string[]) => {
  const sorted = [...items].sort((a, b) => a.meta.id.localeCompare(b.meta.id));
  const m = matriks(sorted);
  const use = pemakai(sorted, files, sceneIds);
  const rows = [...m.keys()].sort().map((b) => `| ${b} | ${GAYA.map((g) => (m.get(b)![g.slug] ? `✔ \`${m.get(b)![g.slug]}\`` : '✗')).join(' | ')} |`);
  const per = sorted.map(({ meta, Item2D, Item3D }) => `### ${meta.id}\n- ${[Item2D && '2D', Item3D && '3D'].filter(Boolean).join('+')} · ${meta.size.join(' × ')} m · varian: ${meta.variants?.join(', ') || '-'}\n- dipakai: ${use.get(meta.id)?.join(', ') || '-'}\n- acuan: \`${meta.refs}\``);
  const gaya = GAYA.map((g) => `- **${g.slug}** ${g.nama} (${g.dimensi}): ${g.contoh.join(', ') || 'belum ada film contoh'}`);
  return `# Peta aset\n\n<!-- Dibuat oleh \`node bin/mk.mjs aset peta\`. Jangan disunting; \`mk gate\` gagal bila berbeda. -->\n\nCari dulu: \`mk aset find <benda>\`. Buat yang belum ada: \`mk aset baru <benda> <gaya>\`.\n\n## Matriks benda × gaya\n\n| benda | ${GAYA.map((g) => g.slug).join(' | ')} |\n|---|${GAYA.map(() => '---').join('|')}|\n${rows.join('\n')}\n\n## Aset\n\n${per.join('\n\n')}\n\n## Gaya\n\n${gaya.join('\n')}\n`;
};

export const periksaPustaka = (o: { items: LibraryItem[]; files: Berkas[]; sceneIds: string[]; refsAda: (p: string) => boolean; petaRepo: string }) => {
  const out: string[] = [];
  for (const { meta } of o.items) {
    out.push(...masalahMeta(meta));
    if (!o.refsAda(meta.refs)) out.push(`${meta.id}: refs.md tidak ada (${meta.refs})`);
  }
  const ids = new Set(o.items.flatMap((i) => [i.meta.id, ...(i.meta.aliases ?? [])]));
  for (const u of idDipakai(o.files)) if (!ids.has(u.id)) out.push(`${u.path}: memakai id "${u.id}" yang tidak ada di pustaka (mk aset baru <benda> <gaya>)`);
  if (petaMd(o.items, o.files, o.sceneIds) !== o.petaRepo) out.push('docs/aset/PETA.md usang: jalankan `node bin/mk.mjs aset peta`');
  return out;
};
```

- [ ] **Step 4: Add the file side to `apps/cli/aset.ts`**

Add imports: `readdirSync, statSync` from `node:fs` (merge with the existing `node:fs` import), `relative` from `node:path`, `SCENES` from `../../packages/core/src/scenes/manifest`, `petaMd, type Berkas` from `../../packages/core/src/library/peta`. Append:

```ts
const SCENES_DIR = join(ROOT, 'packages', 'core', 'src', 'scenes');
const PETA = join(ROOT, 'docs', 'aset', 'PETA.md');

export const sceneFiles = (dir = SCENES_DIR, out: Berkas[] = []): Berkas[] => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) sceneFiles(p, out);
    else if (/\.tsx?$/.test(e) && !e.endsWith('.test.ts')) out.push({ path: relative(SCENES_DIR, p).replace(/\\/g, '/'), text: readFileSync(p, 'utf8') });
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
};

export const petaTerbaru = () => petaMd(ITEMS, sceneFiles(), SCENES.map((s) => s.id));
export const petaDiRepo = () => (existsSync(PETA) ? readFileSync(PETA, 'utf8') : '');

export const asetPeta = () => {
  mkdirSync(join(ROOT, 'docs', 'aset'), { recursive: true });
  writeFileSync(PETA, petaTerbaru());
  log(`  ✓ ${relative(ROOT, PETA)} (${ITEMS.length} aset)`);
};
```

In `apps/cli/index.ts`: add `asetPeta` to the import and `else if (sub === 'peta') asetPeta();` before the final `else throw` of `case 'aset'`.

- [ ] **Step 5: Add the static checks to `apps/cli/gate.ts`**

Add imports: `ITEMS` from `../../packages/core/src/library`, `periksaPustaka` from `../../packages/core/src/library/peta`, `petaDiRepo, sceneFiles` from `./aset` (`existsSync`, `join`, `SCENES`, `ROOT` are already imported). Immediately after `mkdirSync(outDir, { recursive: true });` at the top of `gate`, insert:

```ts
  log('[gate] library rules (names, refs.md, PETA.md, ids used by films)');
  const masalah = periksaPustaka({
    items: ITEMS,
    files: sceneFiles(),
    sceneIds: SCENES.map((s) => s.id),
    refsAda: (p) => existsSync(join(ROOT, p)),
    petaRepo: petaDiRepo(),
  });
  if (masalah.length) {
    log(masalah.map((m) => `  - ${m}`).join('\n'));
    throw new Error('[gate] library rules failed');
  }
```

Also add "library rules" to the step list in the file's header comment.

- [ ] **Step 6: Generate the map, run tests and gate**

Run: `npx tsx --test packages/core/src/library/peta.test.ts`
Expected: PASS (4 tests).
Run: `node bin/mk.mjs aset peta`; Expected: `✓ docs\aset\PETA.md (17 aset)`.
Determinism: `md5sum docs/aset/PETA.md`, run `node bin/mk.mjs aset peta` again, `md5sum` again; the two sums must match.
Run: `timeout 900 node bin/mk.mjs gate --no-render`; Expected: the `[gate]` stages run through `render smoke skipped` with no failure. (If the library rules step lists a missing `refs.md`, add the file or fix the `meta.refs` path.)

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/library/peta.ts packages/core/src/library/peta.test.ts apps/cli/aset.ts apps/cli/index.ts apps/cli/gate.ts docs/aset/PETA.md
git commit -m "feat(cli): generated PETA.md, mk aset peta, library rules in mk gate"
```

---

### Task 6: poly3d foundation and `bumi-poly3d`

**Files:**
- Create: `packages/core/src/library/poly3d/{index.ts,refs.md,util.tsx,planet.ts,bumi.tsx}`
- Modify: `packages/core/src/templates/whatif-sim/three/util.tsx`, `packages/core/src/templates/whatif-sim/three/planet.ts`, `packages/core/src/library/index.ts`

**Interfaces:**
- Produces: `library/poly3d/util.tsx` (`rng`, `B`), `library/poly3d/planet.ts` (`makeEarthTextures`, `makeMoonTexture`), `ITEMS_POLY3D: LibraryItem[]` (starts with bumi), item `bumi-poly3d` with variants `berawan`, `polos`.

- [ ] **Step 1: Baseline stills of `WhatIfGravity` before touching any scene code**

Run (one render job, slow): `node bin/mk.mjs scene stills WhatIfGravity 30,300,600,900,1300,1800,2400,3000`
The command prints where the stills land (`out/scenes/WhatIfGravity/`). Copy that folder: `cp -r out/scenes/WhatIfGravity out/baseline-wig`. Open two or three with the Read tool and check grass, city, trees and the Earth are visible (if a frame is black, use another and note the final list). Tasks 8 re-renders the same frames.

- [ ] **Step 2: Move the shared helpers into the library, leave re-exports**

```bash
mkdir -p packages/core/src/library/poly3d
cp packages/core/src/templates/whatif-sim/three/util.tsx packages/core/src/library/poly3d/util.tsx
cp packages/core/src/templates/whatif-sim/three/planet.ts packages/core/src/library/poly3d/planet.ts
```
Add one first line to each copy: `// Moved from templates/whatif-sim/three (simulif-gravity). The old path re-exports this file.` (`planet.ts` imports `./util`, which now resolves to the copy.) Then overwrite the old files:
```bash
printf "export * from '../../../library/poly3d/util';\n" > packages/core/src/templates/whatif-sim/three/util.tsx
printf "export * from '../../../library/poly3d/planet';\n" > packages/core/src/templates/whatif-sim/three/planet.ts
```
Check there is no default export in either copy: `grep -n "export default" packages/core/src/library/poly3d/util.tsx packages/core/src/library/poly3d/planet.ts` prints nothing.

- [ ] **Step 3: Create `library/poly3d/bumi.tsx`**

```tsx
// bumi-poly3d: a 1 m radius globe with procedural continents and an optional cloud shell. Textures come from
// planet.ts (moved from simulif-gravity templates/whatif-sim/three/planet.ts); the sphere pair was built inline in
// scenes/whatif-gravity/Space.tsx (`Planet`). Needs a canvas, so it must render in Chromium (Remotion).
import React, { useMemo } from 'react';
import type { Item3DProps, ItemMeta } from '../types';
import { makeEarthTextures } from './planet';

export const meta: ItemMeta = {
  id: 'bumi-poly3d',
  name: 'Bumi (bola bertekstur prosedural)',
  category: 'alam',
  benda: 'bumi',
  gaya: 'poly3d',
  tags: ['bumi', 'earth', 'planet', 'globe', 'bola', 'awan', 'cloud', 'luar angkasa', 'space'],
  size: [2, 2, 2],
  variants: ['berawan', 'polos'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/bumi.tsx',
  komponen: ['makeEarthTextures'],
  invented: ['benua, es dan awan dibuat dari noise, bukan peta nyata'],
};

export const Item3D: React.FC<Item3DProps> = ({ t = 0, variant = 'berawan' }) => {
  if (typeof document === 'undefined') throw new Error('bumi-poly3d butuh canvas: render lewat Remotion (Chromium), bukan di Node.');
  const tex = useMemo(makeEarthTextures, []);
  const spin = (t / 30) * 0.15;
  return (
    <group position={[0, 1, 0]}>
      <mesh rotation={[0, spin, 0]}>
        <sphereGeometry args={[1, 96, 64]} />
        <meshLambertMaterial map={tex.map} />
      </mesh>
      {variant === 'berawan' && (
        <mesh rotation={[0, spin * 1.25 + 0.6, 0]}>
          <sphereGeometry args={[1.012, 96, 64]} />
          <meshLambertMaterial map={tex.clouds} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};
```

- [ ] **Step 4: Create `library/poly3d/index.ts`, `refs.md`; wire into `library/index.ts`**

`index.ts`:
```ts
// Assets of the "Low-poly 3D" look. `mk aset baru` inserts at the aset: markers.
import type { LibraryItem } from '../types';
import * as bumi from './bumi';
// aset:impor

export const ITEMS_POLY3D: LibraryItem[] = [
  bumi,
  // aset:daftar
];
```
`refs.md`:
```markdown
# Low-poly 3D: acuan

Aset low-poly 3D disalin dari dua proyek pengguna dan tidak memakai foto acuan; bentuknya stilisasi sendiri.
Sumber kode: `C:\Mirza Personal\volcano-whatif\src` (bus, gunung, pohon bulat) dan `C:\Mirza Personal\simulif-gravity`
(taman, rumput, gedung, bumi; kini di `packages/core/src/templates/whatif-sim/three`). Proyek asal tidak diubah.

## bumi-poly3d

Bola jari-jari 1 m, tekstur dari `planet.ts`. Tidak ada foto; benua dan awan reka dari noise.
```
In `library/index.ts` insert `import { ITEMS_POLY3D } from './poly3d';` above `// aset:impor-gaya` and `...ITEMS_POLY3D,` above `// aset:daftar-gaya`.

- [ ] **Step 5: Verify and look**

Run: `timeout 300 npx tsc --noEmit -p .`; Expected: clean.
Run: `node bin/mk.mjs item preview bumi-poly3d`; Expected: `3D → out/items/bumi-poly3d/preview-3d.jpg`. Open it with Read: two rows (berawan, polos), four turns each, a globe with continents. Read the "terukur" size in the caption; if it differs from `2 × 2 × 2 m` by more than 0.1, update `meta.size`.
Run: `node bin/mk.mjs aset peta`, then `timeout 900 node bin/mk.mjs gate --no-render`; Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/library/poly3d packages/core/src/library/index.ts packages/core/src/templates/whatif-sim/three/util.tsx packages/core/src/templates/whatif-sim/three/planet.ts docs/aset/PETA.md
git commit -m "feat(poly3d): library folder, bumi-poly3d; util and planet moved with re-exports"
```

---

### Task 7: `bus-poly3d`, `pohon-poly3d`, `gunung-poly3d`

**Files:**
- Create: `packages/core/src/library/poly3d/{kit.tsx,bus.tsx,pohon.tsx,gunung.tsx}`
- Modify: `packages/core/src/library/poly3d/index.ts`, `packages/core/src/library/poly3d/refs.md`, `packages/core/src/library/preview.tsx` (camera far plane), `packages/core/src/templates/whatif-sim/three/Park.tsx` (use the shared taman tree)

**Interfaces:**
- Consumes: `rng` from `./util`; remotion `random`.
- Produces: `flat(color)`, `signTexture(...)` (`./kit`); items `bus-poly3d` (variant `kuning`), `pohon-poly3d` (variants `bulat`, `taman`; exports `PohonBulat`, `PohonTaman`), `gunung-poly3d` (variants `vesuvius`, `sakura`, `rainier`; exports `Gunung`).

- [ ] **Step 1: `library/poly3d/kit.tsx`**: copy these two exports verbatim from `C:\Mirza Personal\volcano-whatif\src\three\kit.tsx`: `flat` with its `matCache` (lines 8–16) and `signTexture` (lines 214–234). Header: `// Copied from volcano-whatif/src/three/kit.tsx (flat, signTexture). The original project is untouched.` Import: `import * as THREE from 'three';`.

- [ ] **Step 2: `library/poly3d/bus.tsx`**

Copy the JSX of `SchoolBus` from `volcano-whatif/src/scenes/rainier.tsx` lines 13–69 (do not retype it): keep `L = 10`, `yellow = '#f0c020'`, the window/rail/sign/wheel loops. The only changes: the component takes no props and the outer element `<group position={position} rotation={rot}>` becomes `<group>`. File layout:

```tsx
// bus-poly3d: yellow school bus, long axis X, front toward +X. Copied from volcano-whatif/src/scenes/rainier.tsx
// (`SchoolBus`); position and rotation now come from <Aset3D>. Only the yellow colour is used in Shot01-08.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat, signTexture } from './kit';

export const meta: ItemMeta = {
  id: 'bus-poly3d',
  name: 'Bus sekolah kuning (low-poly)',
  category: 'kendaraan-darat',
  benda: 'bus',
  gaya: 'poly3d',
  tags: ['bus', 'bus sekolah', 'school bus', 'kendaraan', 'vehicle', 'kuning', 'yellow', 'low-poly'],
  size: [11.5, 3.1, 2.5],
  variants: ['kuning'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/bus.tsx',
  komponen: ['SchoolBus'],
  invented: ['proporsi dan tulisan SCHOOL BUS disederhanakan'],
};

const Bus: React.FC = () => {
  if (typeof document === 'undefined') throw new Error('bus-poly3d butuh canvas: render lewat Remotion (Chromium).');
  const sign = useMemo(() => new THREE.MeshBasicMaterial({ map: signTexture('#f2d22a', '#1a1a1a', [{ text: 'SCHOOL BUS', size: 64 }], 512, 110) }), []);
  const yellow = '#f0c020';
  const L = 10;
  return (
    <group>
      {/* the rest of SchoolBus' JSX, copied from rainier.tsx lines 21-67 */}
    </group>
  );
};

/** the original bus spans x -5 .. 6.5 (hood in front); shift so the base centre is the origin */
export const Item3D: React.FC<Item3DProps> = () => (
  <group position={[-0.75, 0, 0]}>
    <Bus />
  </group>
);
```
(The placeholder comment inside `<group>` stands for the copied children; the final file must contain them, not the comment.)

- [ ] **Step 3: `library/poly3d/pohon.tsx`**

```tsx
// pohon-poly3d: two low-poly trees. `bulat` = one icosahedron crown on a cone trunk, from volcano-whatif/src/three/kit.tsx
// (`Tree`); `taman` = three blobs on a trunk, from simulif-gravity Park.tsx (`Tree`, used by the park scene).
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';
import { rng } from './util';

type V3 = [number, number, number];

export const meta: ItemMeta = {
  id: 'pohon-poly3d',
  name: 'Pohon low-poly (bulat / taman)',
  category: 'alam',
  benda: 'pohon',
  gaya: 'poly3d',
  tags: ['pohon', 'tree', 'taman', 'park', 'hutan', 'forest', 'daun', 'low-poly'],
  size: [2.6, 3.8, 2.6],
  variants: ['bulat', 'taman'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/pohon.tsx',
  komponen: ['Trees'],
  invented: ['bentuk disederhanakan, tanpa acuan spesies'],
};

const trunk = new THREE.CylinderGeometry(0.12, 0.16, 1, 5);
const crown = new THREE.IcosahedronGeometry(1, 0);

export const PohonBulat: React.FC<{ p?: V3; size?: number; color?: string }> = ({ p = [0, 0, 0], size = 1, color = '#2f5a2c' }) => (
  <group position={p} scale={size}>
    <mesh geometry={trunk} material={flat('#4a3626')} position={[0, 0.9, 0]} scale={[1, 1.8, 1]} castShadow />
    <mesh geometry={crown} material={flat(color)} position={[0, 2.3, 0]} scale={[1.3, 1, 1.3]} castShadow />
  </group>
);

/* the park tree exactly as it was in Park.tsx */
export const PohonTaman: React.FC<{ p?: V3; s?: number; seed: number }> = ({ p = [0, 0, 0], s = 1, seed }) => {
  const r = rng(seed);
  const greens = ['#2d6a2a', '#357a30', '#2a5f27'];
  const blobs = [
    [0, 2.3, 0, 1.0],
    [0.55 * (r() - 0.3), 2.9, 0.2, 0.8],
    [-0.5, 2.5 + r() * 0.3, -0.2, 0.75],
  ];
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 1.8, 6]} />
        <meshLambertMaterial color="#5b3c25" />
      </mesh>
      {blobs.map(([x, y, z, rad], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[rad, 1]} />
          <meshLambertMaterial color={greens[i % 3]} flatShading />
        </mesh>
      ))}
    </group>
  );
};

export const Item3D: React.FC<Item3DProps> = ({ variant = 'bulat', seed = 0 }) => (variant === 'taman' ? <PohonTaman seed={seed + 100} /> : <PohonBulat />);
```
In `templates/whatif-sim/three/Park.tsx`: delete the local `const Tree …` block (the one under `/* ---------- Low-poly trees ---------- */`) and add `import { PohonTaman as Tree } from '../../../library/poly3d/pohon';`; the existing `<Tree key={i} p={t.p} s={t.s} seed={i + 100} />` keeps working unchanged.

- [ ] **Step 4: `library/poly3d/gunung.tsx`**

Copy `Volcano` from `volcano-whatif/src/three/kit.tsx` lines 128–159 as `Gunung` (same props and body; `random` from `remotion`, `flat` from `./kit`, `useMemo` and `THREE` imported). Then:

```tsx
export const meta: ItemMeta = {
  id: 'gunung-poly3d',
  name: 'Gunung berapi low-poly',
  category: 'alam',
  benda: 'gunung',
  gaya: 'poly3d',
  tags: ['gunung', 'gunung berapi', 'volcano', 'mountain', 'kawah', 'rainier', 'sakurajima', 'vesuvius', 'low-poly'],
  size: [660, 170, 660],
  variants: ['vesuvius', 'sakura', 'rainier'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/gunung.tsx',
  komponen: ['Volcano'],
  invented: ['bentuk kerucut dengan jitter acak, bukan model medan nyata', 'skala film (ratusan meter), bukan skala gunung nyata'],
};

const PRESET: Record<string, { r: number; h: number; color: string; seed: string; salju?: boolean }> = {
  vesuvius: { r: 140, h: 48, color: '#7f6a62', seed: 'vesuvius' }, // volcano-whatif Shot01
  sakura: { r: 240, h: 150, color: '#5e5853', seed: 'sakura' }, // sakurajima.tsx
  rainier: { r: 330, h: 170, color: '#5e6466', seed: 'rainier', salju: true }, // rainier.tsx, with snow cap
};

export const Item3D: React.FC<Item3DProps> = ({ variant = 'vesuvius', seed }) => {
  const p = PRESET[variant] ?? PRESET.vesuvius;
  const sd = `${p.seed}${seed === undefined ? '' : seed}`;
  return (
    <group>
      <Gunung position={[0, 0, 0]} radius={p.r} height={p.h} color={p.color} seed={sd} />
      {p.salju && <Gunung position={[0, p.h * 0.5, 2]} radius={p.r * 0.56} height={p.h * 0.52} color="#e4e8ea" seed={`${sd}-snow`} />}
    </group>
  );
};
```
`meta.size` is the largest preset (Rainier); the preview's measured size is for the first variant (vesuvius), so keep `[660, 170, 660]` and say so in `refs.md`.

- [ ] **Step 5: Fix the preview camera for big items**

In `library/preview.tsx`, `Preview3D`: change `camera={{ fov: 30, near: 0.01, far: 2000 }}` to `camera={{ fov: 30, near: 0.01, far: Math.max(2000, span * 60) }}` (`span` is defined above the return, so it is in scope).

- [ ] **Step 6: Register, document, look**

`poly3d/index.ts`: add `import * as bus from './bus'; import * as pohon from './pohon'; import * as gunung from './gunung';` above `// aset:impor` and `bus, pohon, gunung,` above `// aset:daftar`. Append to `poly3d/refs.md`:
```markdown

## bus-poly3d
Dari `volcano-whatif/src/scenes/rainier.tsx` (`SchoolBus`). Hanya warna kuning dipakai di Shot01–08, jadi satu varian.

## pohon-poly3d
`bulat` dari `volcano-whatif/src/three/kit.tsx` (`Tree`), `taman` dari `Park.tsx` simulif-gravity. Dua tampilan lama = dua varian.

## gunung-poly3d
`Volcano` dari `volcano-whatif/src/three/kit.tsx`. Preset: `vesuvius` (Shot01, r 140 h 48), `sakura` (r 240 h 150), `rainier` (r 330 h 170 + tudung salju). `meta.size` memuat preset terbesar (rainier); ukuran terukur di preview adalah baris pertama (vesuvius).
```
Run `timeout 300 npx tsc --noEmit -p .` (clean), then `node bin/mk.mjs item preview bus-poly3d`, `… pohon-poly3d`, `… gunung-poly3d`. Open each preview: the bus is yellow with a window band and a hood at +X; both trees; three mountains in rows (rainier with a white cap). Fix `meta.size` of bus and pohon from the measured captions (bus ≈ 11.5 × 3.1 × 2.5, trees ≈ 2.6 × 3.7).

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/library/poly3d packages/core/src/library/preview.tsx packages/core/src/templates/whatif-sim/three/Park.tsx
git commit -m "feat(poly3d): bus, pohon, gunung assets; preview far plane scales with item size"
```

---

### Task 8: `rumput-poly3d`, `gedung-poly3d`, and the regression stills

**Files:**
- Create: `packages/core/src/library/poly3d/{rumput.tsx,gedung.tsx}`
- Modify: `packages/core/src/library/poly3d/index.ts`, `packages/core/src/library/poly3d/refs.md`, `packages/core/src/templates/whatif-sim/three/Grass.tsx`, `packages/core/src/templates/whatif-sim/three/Park.tsx`

**Interfaces:**
- Produces: `useGrass(zones?, holes?)`, `Grass: React.FC<{ time: number; zones?: Zone[]; holes?: Hole[] }>` (defaults = the original global field), `windowTexture()`, `buildingGeometry(w, h, d)`, items `rumput-poly3d` (variant `hijau`, 10×10 m patch, `time = t / 30`) and `gedung-poly3d` (variants `rendah`, `sedang`, `menara`).

- [ ] **Step 1: `library/poly3d/rumput.tsx`**

`cp packages/core/src/templates/whatif-sim/three/Grass.tsx packages/core/src/library/poly3d/rumput.tsx`, change its `import { rng } from './util'` (it already points to `./util`, which exists in the new folder), then make the two data tables parameters without changing default behaviour or the random sequence:

- Add above `useGrass`: `export type Zone = { n: number; x0: number; x1: number; z0: number; z1: number };` and `export type Hole = { x: number; z: number; r: number };`; type the existing `HOLES` constant as `Hole[]`.
- Move the literal `zones = [ { n: 130000, … }, { n: 60000, … } ]` array out of the `useMemo` body into a module constant `const ZONES: Zone[] = [ … ];` (same two entries, same comments) and delete the local `const zones = …`.
- Change `export const useGrass = () => useMemo(() => {` to `export const useGrass = (zones: Zone[] = ZONES, holes: Hole[] = HOLES) => useMemo(() => {`; in the blade loop use `holes` instead of `HOLES`; change the closing `}, [])` to `}, [zones, holes])`.
- `bladeGeometry`, the shader patch, `rng(7)` and the loop order stay exactly as they are.

Replace the `Grass` component and append the item:

```tsx
export const Grass: React.FC<{ time: number; zones?: Zone[]; holes?: Hole[] }> = ({ time, zones, holes }) => {
  const { mesh, uTime } = useGrass(zones, holes);
  uTime.value = time;
  return <primitive object={mesh} />;
};

import type { Item3DProps, ItemMeta } from '../types';

export const meta: ItemMeta = {
  id: 'rumput-poly3d',
  name: 'Hamparan rumput (bilah instan)',
  category: 'alam',
  benda: 'rumput',
  gaya: 'poly3d',
  tags: ['rumput', 'grass', 'padang', 'lawn', 'taman', 'park', 'angin', 'low-poly'],
  size: [10, 1, 10],
  variants: ['hijau'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/rumput.tsx',
  komponen: ['Grass'],
  invented: ['warna dan tinggi bilah acak, tanpa acuan spesies'],
};

const PATCH: Zone[] = [{ n: 20000, x0: -5, x1: 5, z0: -5, z1: 5 }];
const NO_HOLES: Hole[] = [];
export const Item3D: React.FC<Item3DProps> = ({ t = 0 }) => <Grass time={t / 30} zones={PATCH} holes={NO_HOLES} />;
```
(Move the `import type` line to the top of the file with the other imports.) Replace `templates/whatif-sim/three/Grass.tsx` content with:
```ts
export { Grass, useGrass } from '../../../library/poly3d/rumput';
```

- [ ] **Step 2: `library/poly3d/gedung.tsx`**

Cut `windowTexture` and `buildingGeometry` (Park.tsx lines 5–36, the exact text) into this file as exports; in `Park.tsx` replace them with `import { buildingGeometry, windowTexture } from '../../../library/poly3d/gedung';` (keep the `/* City */` block and `City` itself untouched; Park.tsx still needs `THREE`, `useMemo`, `rng`, `B` for the rest). File layout:

```tsx
// gedung-poly3d: one building of the park's city skyline. `rendah` and `sedang` are the beige window-grid blocks of the
// two front rows, `menara` the hazy grey tower of the back; sizes come from the ranges in simulif-gravity's `City`.
// `seed` picks the exact width and height inside the range.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { rng } from './util';

/* export const windowTexture and export const buildingGeometry: moved here verbatim from Park.tsx */

export const meta: ItemMeta = {
  id: 'gedung-poly3d',
  name: 'Gedung kota (blok jendela / menara)',
  category: 'bangunan',
  benda: 'gedung',
  gaya: 'poly3d',
  tags: ['gedung', 'bangunan', 'building', 'kota', 'city', 'menara', 'tower', 'jendela', 'low-poly'],
  size: [11, 70, 11],
  variants: ['rendah', 'sedang', 'menara'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/gedung.tsx',
  komponen: ['City'],
  invented: ['jendela satu pola, tanpa acuan bangunan nyata'],
};

const RANGE = {
  rendah: { w: [5, 10], h: [6, 10], tower: false },
  sedang: { w: [5, 10], h: [10, 16], tower: false },
  menara: { w: [6, 11], h: [30, 70], tower: true },
} as const;

export const Item3D: React.FC<Item3DProps> = ({ variant = 'sedang', seed = 0 }) => {
  if (typeof document === 'undefined') throw new Error('gedung-poly3d butuh canvas: render lewat Remotion (Chromium).');
  const k = RANGE[variant as keyof typeof RANGE] ?? RANGE.sedang;
  const r = rng(seed + 11);
  const w = k.w[0] + r() * (k.w[1] - k.w[0]);
  const h = k.h[0] + r() * (k.h[1] - k.h[0]);
  const map = useMemo(windowTexture, []);
  const geo = useMemo(() => (k.tower ? new THREE.BoxGeometry(w, h, w) : buildingGeometry(w, h, 6)), [k.tower, w, h]);
  return (
    <mesh geometry={geo} position={[0, h / 2, 0]}>
      {k.tower ? <meshLambertMaterial color="#a3abb7" /> : <meshLambertMaterial map={map} />}
    </mesh>
  );
};
```

- [ ] **Step 3: Register, refs, typecheck, look**

`poly3d/index.ts`: add `import * as rumput from './rumput'; import * as gedung from './gedung';` and `rumput, gedung,` at the markers. Append to `poly3d/refs.md`:
```markdown

## rumput-poly3d
`Grass` + `useGrass` dari simulif-gravity (`three/Grass.tsx`, kini di sini). Film taman memakai hamparan global (dua zona, dengan lubang untuk alas dan air mancur); item ini hamparan 10 × 10 m tanpa lubang, `time = t / 30`. Satu warna (hijau): warna kering tidak ada di shader.

## gedung-poly3d
Satu bangunan dari perulangan `City` (`three/Park.tsx`). Rentang ukuran: baris depan tinggi 6–10 dan 10–16 m, menara belakang 30–70 m.
```
Run `timeout 300 npx tsc --noEmit -p .` (clean). Run `node bin/mk.mjs item preview rumput-poly3d` and `… gedung-poly3d`; open both: a green patch (four turns), three building variants with window grids and one grey tower. Update `meta.size` from the measured captions where they differ by more than 0.1 m (rumput height is blade height, ≈ 0.75 m).

- [ ] **Step 4: Regression stills of `WhatIfGravity`**

Run (one job): `node bin/mk.mjs scene stills WhatIfGravity 30,300,600,900,1300,1800,2400,3000` (the same frame list as Task 6 Step 1).
Compare with the baseline: `for f in out/baseline-wig/*; do cmp "$f" "out/scenes/WhatIfGravity/$(basename "$f")" && echo same "$(basename "$f")"; done`.
Expected: every file `same`. If a pair differs, open both with Read: a byte difference with no visible difference is acceptable (say so); a visible difference is a bug in this task (most likely the `useGrass` refactor changed the random sequence, or `Park.tsx` lost an import): fix before continuing.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/library/poly3d packages/core/src/templates/whatif-sim/three/Grass.tsx packages/core/src/templates/whatif-sim/three/Park.tsx
git commit -m "feat(poly3d): rumput and gedung assets; Grass/Park re-use the library code"
```

---

### Task 9: `AsetUji3D` composition

**Files:**
- Create: `packages/core/src/scenes/aset-uji/AsetUji3D.tsx`
- Modify: `packages/core/src/scenes/index.tsx` (import near line 4, `<Composition>` near line 91), `packages/core/src/scenes/manifest.ts` (one line)

**Interfaces:**
- Consumes: `Aset3D`.
- Produces: scene id `AsetUji3D`, 1280×720, 30 fps, 90 frames.

- [ ] **Step 1: Create the scene**

```tsx
// AsetUji3D: one scene with every poly3d asset placed through <Aset3D>, to see that they sit together at the right scale.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Aset3D } from '../../library/aset';

export const ASET_UJI_FRAMES = 90;

export const AsetUji3D: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#bcd4e6' }}>
      <ThreeCanvas width={1280} height={720} camera={{ fov: 40, position: [0, 9, 34], near: 0.1, far: 3000 }}>
        <color attach="background" args={['#bcd4e6']} />
        <hemisphereLight args={['#e3e9f2', '#3a4826', 1.5]} />
        <directionalLight position={[-20, 40, 25]} intensity={2.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshLambertMaterial color="#3d5424" />
        </mesh>
        <Aset3D id="rumput-poly3d" position={[0, 0, 4]} t={t} />
        <Aset3D id="bus-poly3d" position={[-10, 0, 0]} rotation={[0, 0.4, 0]} />
        <Aset3D id="pohon-poly3d" variant="bulat" position={[6, 0, -2]} scale={1.5} />
        <Aset3D id="pohon-poly3d" variant="taman" position={[11, 0, -4]} seed={3} scale={1.5} />
        <Aset3D id="gedung-poly3d" variant="rendah" position={[-14, 0, -30]} seed={1} />
        <Aset3D id="gedung-poly3d" variant="sedang" position={[0, 0, -34]} seed={2} />
        <Aset3D id="gedung-poly3d" variant="menara" position={[16, 0, -60]} seed={3} />
        <Aset3D id="gunung-poly3d" variant="sakura" position={[-60, 0, -500]} />
        <Aset3D id="bumi-poly3d" position={[14, 7, -10]} scale={3} t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
```
In `scenes/index.tsx` add `import { AsetUji3D, ASET_UJI_FRAMES } from './aset-uji/AsetUji3D';` and `<Composition id="AsetUji3D" component={AsetUji3D} width={1280} height={720} fps={30} durationInFrames={ASET_UJI_FRAMES} />` next to the `WhatIfGravity` one. In `manifest.ts` add after the WhatIfGravity line: `{ id: 'AsetUji3D', about: 'Test scene: all poly3d library assets placed with <Aset3D> (bus, gunung, pohon, rumput, gedung, bumi).', width: 1280, height: 720 },`.

- [ ] **Step 2: Render and look**

Run: `timeout 300 npx tsc --noEmit -p .` (clean), then `node bin/mk.mjs scene stills AsetUji3D 0,45 --grid`.
Expected: stills in `out/scenes/AsetUji3D/`. Open both: bus, two trees, grass patch, three buildings in the distance, a mountain far back, a globe above; the grass and globe differ between frame 0 and 45. Nothing floating below ground, nothing clipped by the far plane. If an asset is off-scale or hidden, adjust only the scene's `position`/`scale`, unless the preview in Tasks 6–8 showed a real asset defect.

- [ ] **Step 3: Prove a wrong id fails the render**

Temporarily change one line to `<Aset3D id="bus-poly3" … />`, run `node bin/mk.mjs scene stills AsetUji3D 0`; Expected: the render fails and the output contains `Aset "bus-poly3" tidak ada di pustaka. Mirip: bus-poly3d`. Revert the line.

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/scenes/aset-uji packages/core/src/scenes/index.tsx packages/core/src/scenes/manifest.ts
git commit -m "feat(scenes): AsetUji3D places every poly3d asset through <Aset3D>"
```

---

### Task 10: Rules, docs, final map and acceptance run

**Files:**
- Modify: `AGENTS.md`, `docs/scenes/ITEMS.md`, `docs/scenes/KIT.md`, `docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md`
- Generated: `docs/aset/PETA.md`

- [ ] **Step 1: "Pustaka dulu" rule in `AGENTS.md`**

Add this section next to the existing item/kit rules for scene mode:

```markdown
## Pustaka dulu (aset per gaya)

Benda yang bisa dipakai ulang (kendaraan, bangunan, tanaman, orang, alam, properti) tidak digambar di file scene. Alurnya:

1. Mulai tiap video dengan `node bin/mk.mjs gaya show <gaya>` dan buka film contoh gaya itu.
2. Untuk tiap benda di storyboard: `node bin/mk.mjs aset find <benda>`. Jika gaya lain sudah punya benda itu, tiru proporsi dan variannya.
3. Belum ada: `node bin/mk.mjs aset baru <benda> <gaya>`, gambar di `library/<gaya>/`, lihat lewat `node bin/mk.mjs item preview <id>`.
4. Film memakai aset lewat `<Aset id="..."/>` (2D, di dalam `<svg>`) atau `<Aset3D id="..."/>` (3D, di dalam `<ThreeCanvas>`). Id yang tidak terdaftar membuat render gagal.
5. Sesudah menambah atau mengubah aset: `node bin/mk.mjs aset peta` (memperbarui `docs/aset/PETA.md`) dan `node bin/mk.mjs gate --no-render`.

Nama aset: `<benda>-<gaya>` (`gedung-stik`, `gedung-poly3d`). Gaya: stik, poly, poly3d, model3d, flanel, ilustrasi (`node bin/mk.mjs gaya list`).
```
Also add `mk gaya list|show` and `mk aset find|baru|peta` to the command list in `AGENTS.md` next to `mk item find`.

- [ ] **Step 2: Update `docs/scenes/ITEMS.md` and `docs/scenes/KIT.md`**

`ITEMS.md`, workflow step 5 ("Register it"): add "Items are named `<benda>-<gaya>` and carry `benda` and `gaya` in `meta`; make the skeleton with `mk aset baru <benda> <gaya>`; films use items through `<Aset>`/`<Aset3D>`." `KIT.md`, section "Styles": add a row for `poly3d` (six saved assets: bus, gunung, pohon, rumput, gedung, bumi; `mk gaya show poly3d`; film `WhatIfGravity`, test scene `AsetUji3D`) and the sentence "All looks and their assets: `docs/aset/PETA.md`."

- [ ] **Step 3: Record the deviations in the spec**

In the spec, section "1. Gaya dan penamaan", after the `ItemMeta` snippet add:
```markdown
`ItemMeta` juga mendapat `aliases?: string[]` dan `komponen?: string[]` (nama komponen asli yang dibungkus; `mk aset peta` menganggap film yang meng-import salah satunya sebagai pemakai aset, karena film lama memakai komponen asli, bukan `<Aset3D>`). Tes memakai `node:test` (`npx tsx --test`), runner repo ini, bukan vitest. Varian pohon: `bulat` dan `taman`.
```
and change the spec's status line to `Status: disetujui; rencana di docs/superpowers/plans/2026-10-27-aset-per-gaya.md.`

- [ ] **Step 4: Regenerate the map and run everything**

Run: `node bin/mk.mjs aset peta`.
Open `docs/aset/PETA.md`: the matrix has rows for `bumi`, `bus`, `gedung`, `gunung`, `pohon`, `rumput` with `✔ \`<id>\`` under `poly3d`; the `### gedung-poly3d`, `rumput-poly3d`, `pohon-poly3d`, `bumi-poly3d` sections list `WhatIfGravity` under "dipakai", and all six list `AsetUji3D`.
Run: `timeout 900 node bin/mk.mjs gate --no-render`; Expected: all `[gate]` stages pass.
Run: `node bin/mk.mjs gaya show poly3d`; Expected: six assets and `WhatIfGravity` (criterion 1). Run `node bin/mk.mjs aset find bus`; Expected: `bus: stik ✗  poly3d ✔ …` (criterion 2).

- [ ] **Step 5: Acceptance checklist (spec "Kriteria selesai")**

Confirm each with the evidence above: (1) `gaya list`/`show`; (2) `aset find bus`; (3) `AsetUji3D` stills + failing wrong id (Task 9); (4) `aset baru gedung model3d` compiled and previewed (Task 4 Step 6); (5) `gate --no-render` passes and PETA names `WhatIfGravity`; (6) WhatIfGravity stills identical (Task 8 Step 4) and `tsc` clean; (7) `AGENTS.md` rule present. Report any criterion not met instead of marking it done.

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md docs/scenes/ITEMS.md docs/scenes/KIT.md docs/aset/PETA.md docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md docs/superpowers/plans/2026-10-27-aset-per-gaya.md
git commit -m "docs: pustaka dulu rule, ITEMS/KIT updates, PETA.md, plan"
```

---

## Self-Review

- **Spec coverage:** gaya registry and naming (T1); `<Aset>`/`<Aset3D>`, errors, alias lookup (T1, T2); CLI `gaya list|show`, `aset find|baru|peta` (T3–T5); PETA.md generated and deterministic, gate checks incl. stale map and unknown ids (T5); "pustaka dulu" in AGENTS.md (T10); six poly3d assets with sources and variants decided from the source (T6–T8: bus `kuning` only, gunung presets from the three real scenes, pohon `bulat`/`taman`, rumput `hijau` only because the shader has no dry colour, gedung three ranges from `City`, bumi `berawan`/`polos`); old template files turned into re-exports (T6, T7, T8); AsetUji3D and regression stills (T8, T9); canvas-less Node guards in bumi, bus, gedung. Out of scope by design: flanel, ilustrasi migration, orang-poly3d, galleries (specs 2–4).
- **Deviations from the spec, all recorded in Task 10:** tests use `node:test` not vitest; `komponen` field added to `ItemMeta` so films that use the original components count as users of the wrapped asset; pohon variant `bulat` instead of `pinus` (the source is a single round crown); `gunung` size is the Rainier preset (film-scale metres).
- **Type consistency:** `masalahMeta`, `LEGACY_IDS`, `resolveAset`, `suggest`, `matriks`/`barisMatriks`/`cariAset`, `kerangka`/`sisipkan`, `idDipakai`/`pemakai`/`petaMd`/`periksaPustaka`, `ITEMS_POLY3D`, `Zone`/`Hole`, and the markers (`// aset:impor-gaya`, `// aset:daftar-gaya`, `// aset:impor`, `// aset:daftar`) are used with the same names and signatures in every task that touches them.
