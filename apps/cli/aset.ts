// mk gaya / mk aset: the looks and their assets. Pure logic lives in packages/core/src/library; this file only prints and writes.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './paths';
import { kerangka, sisipkan } from '../../packages/core/src/library/scaffold';
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
  writeFileSync(refs, (existsSync(refs) ? readFileSync(refs, 'utf8') : `# ${gaya}: acuan
`) + k.refsNote);
  log(`  ✓ ${k.id}
    ${join('packages/core/src/library', k.file)}
    lihat: node bin/mk.mjs item preview ${k.id}
    lalu isi refs.md, gambar, dan jalankan: node bin/mk.mjs aset peta`);
};
