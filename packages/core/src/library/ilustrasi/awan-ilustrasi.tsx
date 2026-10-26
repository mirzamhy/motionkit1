// Awan (ilustrasi): pembungkus Cloud dari scenes/kit.tsx, awan lembut dari elips bertumpuk di atas alas rata.
// Ukuran nominal (40 satuan per meter): awan di langit tidak punya ukuran sebenarnya. Titik (x, y) ada di dasar awan.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Cloud } from '../../scenes/kit';

export const meta: ItemMeta = {
  id: 'awan-ilustrasi',
  name: 'Awan lembut dari elips bertumpuk (ilustrasi)',
  benda: 'awan',
  gaya: 'ilustrasi',
  category: 'alam',
  tags: ['awan', 'langit', 'cuaca', 'siang', 'cloud', 'sky', 'weather'],
  size: [6.3, 2.9, 1],
  variants: ['putih', 'senja', 'kelabu'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/awan-ilustrasi.tsx',
  komponen: [{ nama: 'Cloud', dari: 'kit' }],
  invented: ['ukuran nominal (awan nyata jauh lebih besar dan jauh)', 'warna senja dan kelabu karangan'],
};

const PER_M = 40;
const FILL: Record<string, [string, number]> = { putih: ['#FFFFFF', 0.9], senja: ['#F6D9B0', 0.85], kelabu: ['#B9C3CC', 0.85] };

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, variant = 'putih', flip }) => {
  const k = s / PER_M;
  const [fill, opacity] = FILL[variant] ?? FILL.putih;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) translate(0 -34)`}>
      <Cloud x={0} y={0} fill={fill} opacity={opacity} />
    </g>
  );
};
