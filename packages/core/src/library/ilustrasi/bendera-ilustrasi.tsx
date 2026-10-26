// Bendera (ilustrasi): pembungkus Flag dari scenes/UnairParts.tsx, kain yang berkibar (irisan tegak mengikuti
// gelombang sinus) dipasang pada tiang sederhana. Kainnya persis Flag di film; tiangnya tambahan agar bisa berdiri
// di tanah. 75 satuan per meter: kain 1,2 x 0,8 m, tiang 4,5 m. Titik (x, y) ada di kaki tiang.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Flag, MERAH_PUTIH, UNAIR_BANDS } from '../../scenes/UnairParts';

export const meta: ItemMeta = {
  id: 'bendera-ilustrasi',
  name: 'Bendera berkibar di tiang (ilustrasi Unair)',
  benda: 'bendera',
  gaya: 'ilustrasi',
  category: 'properti',
  tags: ['bendera', 'merah putih', 'kibar', 'tiang bendera', 'unair', 'upacara', 'flag', 'banner', 'flagpole', 'waving'],
  era: '1954 dan masa kini',
  region: 'Indonesia',
  size: [1.3, 4.7, 0.1],
  variants: ['merah-putih', 'unair', 'putih'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/bendera-ilustrasi.tsx',
  komponen: [{ nama: 'Flag', dari: 'UnairParts' }],
  invented: ['tiang dan ujung tiang (di film tiang digambar terpisah)', 'warna kuning dan biru Unair mengikuti konstanta film, bukan diukur dari panji asli', 'rasio kain 3:2 dipilih'],
};

const PER_M = 75;
const POLE = 340;
const BANDS: Record<string, string[]> = { 'merah-putih': MERAH_PUTIH, unair: UNAIR_BANDS, putih: ['#FAFAF5'] };

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'merah-putih', flip }) => {
  const k = s / PER_M;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <ellipse cx={0} cy={2} rx={12} ry={3} fill="#000" opacity={0.2} />
      <rect x={-2.5} y={-POLE} width={5} height={POLE} fill="#8A7B66" />
      <rect x={-2.5} y={-POLE} width={2} height={POLE} fill="#B3A58C" />
      <circle cx={0} cy={-POLE - 4} r={5} fill="#E9B03A" />
      <Flag x={2.5} y={-POLE + 6} w={90} h={60} bands={BANDS[variant] ?? MERAH_PUTIH} t={t} ph={seed * 0.9} />
    </g>
  );
};
