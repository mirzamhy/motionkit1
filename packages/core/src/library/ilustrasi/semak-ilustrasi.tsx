// Semak (ilustrasi): pembungkus Shrub dari scenes/kit.tsx, rumpun daun bilah panjang (pandan, serai, pisang muda)
// yang tumbuh dari satu titik, tiga warna, bergoyang pada fase masing-masing. 75 satuan per meter. Titik (x, y) ada di tanah.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Shrub } from '../../scenes/kit';

export const meta: ItemMeta = {
  id: 'semak-ilustrasi',
  name: 'Semak daun bilah (pandan, serai) (ilustrasi)',
  benda: 'semak',
  gaya: 'ilustrasi',
  category: 'alam',
  tags: ['semak', 'pandan', 'serai', 'rumpun', 'tanaman', 'tropis', 'shrub', 'bush', 'grass', 'plant', 'tropical'],
  region: 'Hindia Belanda, pesisir',
  size: [2.6, 1.1, 1.5],
  variants: ['besar', 'kecil'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/semak-ilustrasi.tsx',
  komponen: [{ nama: 'Shrub', dari: 'kit' }],
  invented: ['bukan spesies tertentu', 'ukuran mengikuti film, bukan diukur'],
};

const PER_M = 75;
const SPEC: Record<string, { r: number; seed: number }> = { besar: { r: 95, seed: 3 }, kecil: { r: 55, seed: 12 } };

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'besar', flip }) => {
  const k = s / PER_M;
  const p = SPEC[variant] ?? SPEC.besar;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <Shrub x={0} y={0} r={p.r} seed={p.seed + seed} t={t} />
    </g>
  );
};
