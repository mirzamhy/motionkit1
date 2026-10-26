// Orang (ilustrasi): pembungkus Walker dari scenes/UnairParts.tsx, orang dilihat dari belakang yang berjalan.
// Gambarnya sama dengan di film; Item2D hanya memetakan (x, y = telapak kaki di tanah, s = px per meter) ke
// koordinat Walker (tinggi ±124 satuan untuk 1,65 m, jadi 75 satuan per meter).
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { OUTFITS, OUTFITS_1954, Walker } from '../../scenes/UnairParts';

export const meta: ItemMeta = {
  id: 'orang-ilustrasi',
  name: 'Orang dari belakang, berjalan (ilustrasi Unair)',
  benda: 'orang',
  gaya: 'ilustrasi',
  category: 'orang',
  tags: ['orang', 'manusia', 'tokoh', 'pejalan', 'mahasiswa', 'jalan', 'kerumunan', 'person', 'people', 'walker', 'pedestrian', 'student', 'crowd', 'peci', 'hijab'],
  era: '1954 dan masa kini',
  region: 'Surabaya',
  size: [0.6, 1.7, 0.3],
  variants: ['kemeja-putih', 'hijab-merah-muda', 'kemeja-biru', 'jaket-unair', 'peci-1954', 'coklat-1954', 'sanggul-1954', 'peci-gelap-1954'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/orang-ilustrasi.tsx',
  komponen: [{ nama: 'Walker', dari: 'UnairParts' }],
  invented: ['wajah tidak digambar (tampak belakang)', 'warna dan potongan pakaian tiap varian karangan, bukan salinan foto'],
};

const OUTFIT_BY_VARIANT: Record<string, (typeof OUTFITS)[number]> = {
  'kemeja-putih': OUTFITS[0], 'hijab-merah-muda': OUTFITS[1], 'kemeja-biru': OUTFITS[2], 'jaket-unair': OUTFITS[3],
  'peci-1954': OUTFITS_1954[0], 'coklat-1954': OUTFITS_1954[1], 'sanggul-1954': OUTFITS_1954[2], 'peci-gelap-1954': OUTFITS_1954[3],
};

const PER_M = 75;

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'kemeja-putih', flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <Walker x={0} y={0} s={s / PER_M} t={t} ph={seed * 1.7} o={OUTFIT_BY_VARIANT[variant] ?? OUTFITS[0]} />
  </g>
);
