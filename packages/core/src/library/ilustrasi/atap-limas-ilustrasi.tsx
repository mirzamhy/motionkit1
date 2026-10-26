// Atap limas (ilustrasi): pembungkus HipRoof dari scenes/UnairScene.tsx, atap dua kemiringan (topi curam di atas rok
// yang melebar) dengan tekstur genteng, rusuk, dan dua pucuk. 40 px per meter seperti gedung NIAS. Titik (x, y) ada
// di tengah garis tritisan (bawah atap), jadi atap berdiri di atas garis itu.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Defs, HipRoof } from '../../scenes/UnairScene';

export const meta: ItemMeta = {
  id: 'atap-limas-ilustrasi',
  name: 'Atap limas dua kemiringan bergenteng (ilustrasi)',
  benda: 'atap-limas',
  gaya: 'ilustrasi',
  category: 'bangunan',
  tags: ['atap', 'limas', 'genteng', 'kolonial', 'nias', 'roof', 'hip roof', 'tile', 'colonial', 'bangunan'],
  era: '1923',
  region: 'Surabaya',
  size: [12.5, 8.5, 10],
  variants: ['utama', 'kecil', 'jauh'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/atap-limas-ilustrasi.tsx',
  komponen: [{ nama: 'HipRoof', dari: 'UnairScene' }],
  invented: ['skala 40 px per meter dan kedalaman 10 m dipilih agar terbaca', 'varian kecil dan jauh memakai ukuran dari gedung NIAS di film, bukan ukuran terukur'],
};

const PER_M = 40;
// parameter HipRoof persis seperti di NiasBuilding; tengah garis tritisan dalam koordinat film = (x0 + x1) / 2
const SPEC = {
  utama: { x0: 520, x1: 1020, eave: 436, kink: 340, top: 132, r0: 700, r1: 872, far: false },
  kecil: { x0: 950, x1: 1222, eave: 436, kink: 352, top: 168, r0: 1058, r1: 1126, far: false },
  jauh: { x0: 520, x1: 1020, eave: 436, kink: 340, top: 132, r0: 700, r1: 872, far: true },
} as const;

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, variant = 'utama', flip }) => {
  const p = SPEC[variant as keyof typeof SPEC] ?? SPEC.utama;
  const k = s / PER_M;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) translate(${-(p.x0 + p.x1) / 2} ${-p.eave})`}>
      <Defs />
      <HipRoof {...p} />
    </g>
  );
};
