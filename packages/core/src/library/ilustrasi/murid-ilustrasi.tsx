// Murid NIAS (ilustrasi): pembungkus Student dari scenes/UnairScene.tsx, murid dari belakang berjalan dengan jaket
// putih tertutup dan celana pendek putih. Tinggi ±124 satuan untuk 1,65 m, jadi 75 satuan per meter.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Student } from '../../scenes/UnairScene';

export const meta: ItemMeta = {
  id: 'murid-ilustrasi',
  name: 'Murid sekolah dokter NIAS 1920-an dari belakang (ilustrasi)',
  benda: 'murid',
  gaya: 'ilustrasi',
  category: 'orang',
  tags: ['murid', 'siswa', 'mahasiswa', 'pelajar', 'nias', 'sekolah', 'seragam', 'jalan', 'student', 'pupil', 'school', 'uniform', 'colonial'],
  era: '1920-an',
  region: 'Surabaya',
  size: [0.6, 1.7, 0.3],
  variants: ['buku', 'topi', 'polos'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/murid-ilustrasi.tsx',
  komponen: [{ nama: 'Student', dari: 'UnairScene' }],
  invented: ['wajah tidak digambar (tampak belakang)', 'detail seragam disederhanakan dari foto 1925, bukan salinan'],
};

const PER_M = 75;

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'buku', flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <Student x={0} y={0} s={s / PER_M} t={t} ph={seed * 1.7} hat={variant === 'topi'} book={variant === 'buku'} />
  </g>
);
