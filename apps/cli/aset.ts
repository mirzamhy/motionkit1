// mk gaya / mk aset: the looks and their assets. Pure logic lives in packages/core/src/library; this file only prints and writes.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT } from './paths';
import { kerangka, kerangkaStik, rencanaStik, rencanaTulis } from '../../packages/core/src/library/scaffold';
import { GAYA, gayaBySlug, type GayaSlug } from '../../packages/core/src/styles';
import { ITEMS } from '../../packages/core/src/library';
import { cariAset } from '../../packages/core/src/library/matriks';
import { susunPrompt, type TargetPrompt } from '../../packages/core/src/library/prompt';
import { SCENES } from '../../packages/core/src/scenes/manifest';
import { petaMd, type Berkas } from '../../packages/core/src/library/peta';

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

const LIB = join(ROOT, 'packages', 'core', 'src', 'library');

const asetBaruStik = (benda: string) => {
  const k = kerangkaStik(benda, new Set(ITEMS.map((i) => i.meta.id)));
  const idx = join(LIB, 'stik-polos', 'index.tsx');
  const refs = join(LIB, 'stik-polos', 'refs.md');
  const plan = rencanaStik(k, { idx: readFileSync(idx, 'utf8'), refs: readFileSync(refs, 'utf8') });
  writeFileSync(idx, plan.idx);
  writeFileSync(refs, plan.refs);
  log(`  ✓ ${k.id}
    ${join('packages/core/src/library', 'stik-polos/index.tsx')}  (entri part({...}), ganti kotak penanda dengan gambar)
    lihat: node bin/mk.mjs item preview ${k.id}
    lalu isi refs.md, gambar, dan jalankan: node bin/mk.mjs aset peta`);
};

export const asetBaru = (benda: string, gaya: string) => {
  if (gaya === 'stik') return asetBaruStik(benda);
  const k = kerangka(benda, gaya, new Set(ITEMS.map((i) => i.meta.id)));
  const dir = join(LIB, k.folder);
  const file = join(LIB, k.file);
  if (existsSync(file)) throw new Error(`file sudah ada, tidak ditimpa: ${k.file}`);
  const idx = join(dir, 'index.ts');
  const refs = join(dir, 'refs.md');
  const top = join(LIB, 'index.ts');
  const rd = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : undefined);
  // every edit is computed first; a missing marker throws here, before anything is written
  const plan = rencanaTulis(k, gaya, { top: readFileSync(top, 'utf8'), idx: rd(idx), refs: rd(refs) });
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, k.content, { flag: 'wx' });
  writeFileSync(idx, plan.idx);
  if (plan.top !== undefined) writeFileSync(top, plan.top);
  writeFileSync(refs, plan.refs);
  log(`  ✓ ${k.id}
    ${join('packages/core/src/library', k.file)}
    lihat: node bin/mk.mjs item preview ${k.id}
    lalu isi refs.md, gambar, dan jalankan: node bin/mk.mjs aset peta`);
};

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
export const petaDiRepo = () => (existsSync(PETA) ? readFileSync(PETA, 'utf8').replace(/\r\n/g, '\n') : '');

export const asetPeta = () => {
  mkdirSync(join(ROOT, 'docs', 'aset'), { recursive: true });
  writeFileSync(PETA, petaTerbaru());
  log(`  ✓ ${relative(ROOT, PETA)} (${ITEMS.length} aset)`);
};

export const asetPrompt = (benda: string, gaya: string, opt: { target?: string; ukuran?: string; catatan?: string }) => {
  const serupa = ITEMS.filter((i) => i.meta.benda === benda && i.meta.gaya !== gaya);
  log(susunPrompt({ benda, gaya, target: (opt.target ?? 'kode') as TargetPrompt, ukuran: opt.ukuran, catatan: opt.catatan, serupa }));
};
