// Naming rule for the item library: id = `${benda}-${gaya}`. Checked by `mk gate` and naming.test.ts.
import { gayaBySlug } from '../styles';
import type { ItemMeta } from './types';

/** ids that predate the rule and keep their names */
export const LEGACY_IDS = ['perahu-kajang', 'gudang-pelabuhan', 'tiang-tambat'];

const BENDA = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** what is wrong with one item's naming; an empty list means fine */
export const masalahMeta = (m: ItemMeta): string[] => {
  const out: string[] = [];
  if (!gayaBySlug(m.gaya)) out.push(`${m.id}: gaya "${m.gaya}" bukan slug terdaftar (styles/index.ts)`);
  if (!BENDA.test(m.benda)) out.push(`${m.id}: benda "${m.benda}" harus diawali huruf, lalu huruf kecil/angka dengan strip`);
  if (!LEGACY_IDS.includes(m.id) && m.id !== `${m.benda}-${m.gaya}`) out.push(`${m.id}: id harus ${m.benda}-${m.gaya}`);
  return out;
};
