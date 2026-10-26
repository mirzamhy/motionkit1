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
