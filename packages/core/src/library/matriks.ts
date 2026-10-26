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
