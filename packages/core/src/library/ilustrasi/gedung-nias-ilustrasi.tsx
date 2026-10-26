// Gedung NIAS 1923 (ilustrasi): pembungkus NiasBuilding dari scenes/UnairScene.tsx, sekolah dokter di Jl. Moestopo
// dengan atap limas bertingkat, dinding putih, dan gerbang berlengkung. Digambar pada koordinat film (1920x1080,
// tanah di y=800, lebar ±1940 px, tinggi ±670 px); di sini 40 px per meter, jadi ±48,5 m lebar dan ±16,7 m tinggi.
// Titik (x, y) ada di tengah garis tanah.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Defs, FONTS, GROUND, NiasBuilding } from '../../scenes/UnairScene';

export const meta: ItemMeta = {
  id: 'gedung-nias-ilustrasi',
  name: 'Gedung NIAS 1923 (sekolah dokter Surabaya, ilustrasi)',
  benda: 'gedung-nias',
  gaya: 'ilustrasi',
  category: 'bangunan',
  tags: ['gedung', 'nias', 'sekolah', 'sekolah dokter', 'unair', 'kampus', 'kolonial', 'atap limas', 'gerbang', 'building', 'school', 'campus', 'colonial', 'hip roof', 'moestopo'],
  era: '1923',
  region: 'Surabaya (Jl. Moestopo)',
  size: [48.5, 16.7, 20],
  variants: ['bernama', 'polos'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/gedung-nias-ilustrasi.tsx',
  komponen: [{ nama: 'NiasBuilding', dari: 'UnairScene' }],
  invented: ['skala 40 px per meter dipilih agar terbaca; ukuran nyata gedung tidak diukur dari foto', 'kedalaman bangunan (20 m) karangan', 'jumlah jendela, tiang, dan lubang angin disederhanakan dari foto 1925'],
};

const PER_M = 40;
const CX = 1022; // tengah gedung dalam koordinat film (x dari 54 sampai 1990)

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, variant = 'bernama', flip }) => {
  const k = s / PER_M;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) translate(${-CX} ${-GROUND})`}>
      <Defs />
      <path d={`M 80 ${GROUND} L 1990 ${GROUND} L 1990 ${GROUND + 26} L 60 ${GROUND + 34} Z`} fill="#2A2018" opacity={0.28} />
      <NiasBuilding f={FONTS} plate={variant === 'polos' ? <></> : undefined} />
    </g>
  );
};
