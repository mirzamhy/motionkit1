// Every item in the library. Add a line when you add an item folder (docs/scenes/ITEMS.md).
// `mk aset baru` inserts at the `aset:` markers below.
import type { LibraryItem } from './types';
import * as perahuKajang from './kendaraan-air/perahu-kajang';
import * as gudangPelabuhan from './bangunan/gudang-pelabuhan';
import * as tiangTambat from './properti/tiang-tambat';
import { ITEMS_STIK_POLOS } from './stik-polos';
import { ITEMS_POLY3D } from './poly3d';
import { ITEMS_ILUSTRASI } from './ilustrasi';
// aset:impor-gaya

export const ITEMS: LibraryItem[] = [
  perahuKajang,
  gudangPelabuhan,
  tiangTambat,
  ...ITEMS_STIK_POLOS,
  ...ITEMS_POLY3D,
  ...ITEMS_ILUSTRASI,
  // aset:daftar-gaya
];
export const itemById = (id: string) => ITEMS.find((i) => i.meta.id === id || i.meta.aliases?.includes(id));
export type { ItemMeta, Item2DProps, Item3DProps, LibraryItem } from './types';
