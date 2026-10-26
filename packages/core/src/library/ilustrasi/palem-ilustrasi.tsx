// Palem (ilustrasi): pembungkus Palm dari scenes/kit.tsx, palem berdaun menyirip dengan batang bercincin yang sedikit
// condong dan pelepah melengkung. Tinggi dan skala varian sama dengan palem di bidikan pelabuhan. 75 satuan per meter.
// Titik (x, y) ada di kaki batang.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Palm } from '../../scenes/kit';

export const meta: ItemMeta = {
  id: 'palem-ilustrasi',
  name: 'Palem berdaun menyirip (ilustrasi pelabuhan)',
  benda: 'palem',
  gaya: 'ilustrasi',
  category: 'alam',
  tags: ['palem', 'kelapa', 'pohon', 'tropis', 'pantai', 'pelabuhan', 'palm', 'coconut', 'tropical', 'tree', 'harbour'],
  region: 'Hindia Belanda, pesisir',
  size: [6, 8.8, 6],
  variants: ['tinggi', 'sedang', 'pendek'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/palem-ilustrasi.tsx',
  komponen: [{ nama: 'Palm', dari: 'kit' }],
  invented: ['bukan spesies tertentu (kelapa atau palem raja tidak dibedakan)', 'tinggi tiap varian mengikuti film, bukan diukur'],
};

const PER_M = 75;
const SPEC: Record<string, { h: number; s: number; seed: number }> = { tinggi: { h: 470, s: 1, seed: 4 }, sedang: { h: 360, s: 1, seed: 7 }, pendek: { h: 280, s: 0.85, seed: 9 } };

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'tinggi', flip }) => {
  const k = s / PER_M;
  const p = SPEC[variant] ?? SPEC.tinggi;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <Palm x={0} base={0} h={p.h} t={t} seed={p.seed + seed} s={p.s} />
    </g>
  );
};
