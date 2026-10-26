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
