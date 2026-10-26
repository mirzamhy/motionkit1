// Aset gaya "Ilustrasi SVG berlapis": pembungkus tipis di atas komponen gambar lama (scenes/*.tsx). Komponen aslinya
// tidak diubah; Item2D hanya memetakan (x, y, s) ke koordinat komponen supaya film bisa memakainya lewat <Aset id="...">.
// `mk aset baru` menyisipkan di marker aset: di bawah.
import type { LibraryItem } from '../types';
import * as orang from './orang-ilustrasi';
import * as murid from './murid-ilustrasi';
import * as gedungNias from './gedung-nias-ilustrasi';
import * as atapLimas from './atap-limas-ilustrasi';
import * as bendera from './bendera-ilustrasi';
import * as awan from './awan-ilustrasi';
import * as pohon from './pohon-ilustrasi';
import * as palem from './palem-ilustrasi';
import * as semak from './semak-ilustrasi';
import * as pizza from './pizza-ilustrasi';
// aset:impor

export const ITEMS_ILUSTRASI: LibraryItem[] = [
  orang,
  murid,
  gedungNias,
  atapLimas,
  bendera,
  awan,
  pohon,
  palem,
  semak,
  pizza,
  // aset:daftar
];
