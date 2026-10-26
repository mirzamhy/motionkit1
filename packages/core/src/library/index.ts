// Every item in the library. Add a line when you add an item folder (docs/scenes/ITEMS.md).
import type { LibraryItem } from './types';
import * as perahuKajang from './kendaraan-air/perahu-kajang';
import * as gudangPelabuhan from './bangunan/gudang-pelabuhan';
import * as tiangTambat from './properti/tiang-tambat';
import { ITEMS_STIK_POLOS } from './stik-polos';

export const ITEMS: LibraryItem[] = [perahuKajang, gudangPelabuhan, tiangTambat, ...ITEMS_STIK_POLOS];
export const itemById = (id: string) => ITEMS.find((i) => i.meta.id === id);
export type { ItemMeta, Item2DProps, Item3DProps, LibraryItem } from './types';
