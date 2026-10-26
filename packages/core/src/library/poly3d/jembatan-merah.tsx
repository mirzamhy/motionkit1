// jembatan-merah-poly3d: Jembatan Merah Surabaya, situs pertempuran sengit 1945 & tewasnya Brigadir Mallaby.
// Struktur bata merah, pagar besi merah khas kolonial Belanda, jalan aspal, dan pilar gerbang jembatan.
// Dimensi: ~16m panjang (sumbu X) x 3.6m tinggi x 6m lebar (sumbu Z).
import React from 'react';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'jembatan-merah-poly3d',
  name: 'Jembatan Merah Surabaya (1945)',
  category: 'bangunan',
  benda: 'jembatan-merah',
  gaya: 'poly3d',
  tags: ['jembatan merah', 'surabaya', 'sejarah 1945', 'mallaby', 'bangunan kolonial', 'kali mas', 'perang', 'low-poly'],
  era: '1945',
  region: 'Surabaya, Jawa Timur',
  size: [16, 3.6, 6],
  variants: ['utuh', 'perang'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/jembatan-merah.tsx',
  invented: [
    'penyederhanaan pilar beton kolonial dan jeruji pagar besi merah',
    'varian perang menambahkan barikade karung pasir dan puing pertempuran',
  ],
};

type V3 = [number, number, number];

const Box: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => (
  <mesh position={p} material={flat(c)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const C_RED_BRICK = '#8b251e';
const C_RED_BRIGHT = '#a93226';
const C_STONE = '#565e64';
const C_ASPHALT = '#2b2d30';
const C_SANDBAG = '#a68a68';

export const Item3D: React.FC<Item3DProps> = ({ variant = 'perang' }) => {
  // Posisi pagar sepanjang jembatan di sumbu X
  const fenceXs = [-6, -4, -2, 0, 2, 4, 6];

  return (
    <group>
      {/* --- PONDASI & DERMAGA JEMBATAN BAWAH --- */}
      {/* Pilar tengah penyangga sungai Kali Mas */}
      <Box p={[0, 0.6, 0]} s={[3.2, 1.2, 6.4]} c={C_STONE} />
      <Box p={[-7, 0.6, 0]} s={[2.4, 1.2, 6.4]} c={C_STONE} />
      <Box p={[7, 0.6, 0]} s={[2.4, 1.2, 6.4]} c={C_STONE} />

      {/* --- BADAN JEMBATAN & JALAN UTAMA --- */}
      {/* Balok dasar jembatan */}
      <Box p={[0, 1.35, 0]} s={[16, 0.35, 5.8]} c={C_RED_BRICK} />
      {/* Permukaan aspal jalan */}
      <Box p={[0, 1.55, 0]} s={[16, 0.08, 4.2]} c={C_ASPHALT} />
      {/* Trotoar pejalan kaki sisi kiri (z = -2.4) dan kanan (z = +2.4) */}
      <Box p={[0, 1.62, -2.4]} s={[16, 0.18, 0.8]} c={C_STONE} />
      <Box p={[0, 1.62, 2.4]} s={[16, 0.18, 0.8]} c={C_STONE} />

      {/* --- PILAR MERAH DI KEDUA UJUNG JEMBATAN --- */}
      {/* Pilar ujung barat (X = -7.5) */}
      <Box p={[-7.5, 2.5, -2.5]} s={[0.8, 1.8, 0.8]} c={C_RED_BRIGHT} />
      <Box p={[-7.5, 3.45, -2.5]} s={[1.0, 0.15, 1.0]} c={C_STONE} />
      <Box p={[-7.5, 2.5, 2.5]} s={[0.8, 1.8, 0.8]} c={C_RED_BRIGHT} />
      <Box p={[-7.5, 3.45, 2.5]} s={[1.0, 0.15, 1.0]} c={C_STONE} />

      {/* Pilar ujung timur (X = 7.5) */}
      <Box p={[7.5, 2.5, -2.5]} s={[0.8, 1.8, 0.8]} c={C_RED_BRIGHT} />
      <Box p={[7.5, 3.45, -2.5]} s={[1.0, 0.15, 1.0]} c={C_STONE} />
      <Box p={[7.5, 2.5, 2.5]} s={[0.8, 1.8, 0.8]} c={C_RED_BRIGHT} />
      <Box p={[7.5, 3.45, 2.5]} s={[1.0, 0.15, 1.0]} c={C_STONE} />

      {/* --- PAGAR BESI MERAH IKONIK --- */}
      {/* Pagar sisi utara (Z = -2.7) */}
      <Box p={[0, 2.65, -2.7]} s={[15.6, 0.1, 0.08]} c={C_RED_BRIGHT} />
      <Box p={[0, 2.05, -2.7]} s={[15.6, 0.1, 0.08]} c={C_RED_BRIGHT} />
      {fenceXs.map((x, i) => (
        <Box key={`fn-${i}`} p={[x, 2.35, -2.7]} s={[0.12, 1.3, 0.12]} c={C_RED_BRIGHT} />
      ))}

      {/* Pagar sisi selatan (Z = +2.7) */}
      <Box p={[0, 2.65, 2.7]} s={[15.6, 0.1, 0.08]} c={C_RED_BRIGHT} />
      <Box p={[0, 2.05, 2.7]} s={[15.6, 0.1, 0.08]} c={C_RED_BRIGHT} />
      {fenceXs.map((x, i) => (
        <Box key={`fs-${i}`} p={[x, 2.35, 2.7]} s={[0.12, 1.3, 0.12]} c={C_RED_BRIGHT} />
      ))}

      {/* --- DETAIL KHUSUS VARIAN PERANG (SANDBAG & BARIKADE) --- */}
      {variant === 'perang' && (
        <group>
          {/* Barikade karung pasir pejuang di ujung barat */}
          <Box p={[-5.2, 1.95, -1.2]} s={[1.4, 0.5, 0.6]} c={C_SANDBAG} />
          <Box p={[-5.1, 2.35, -1.2]} s={[1.1, 0.4, 0.5]} c={C_SANDBAG} />
          <Box p={[-5.2, 1.95, 1.2]} s={[1.4, 0.5, 0.6]} c={C_SANDBAG} />
          <Box p={[-5.1, 2.35, 1.2]} s={[1.1, 0.4, 0.5]} c={C_SANDBAG} />
          {/* Tong drum pertahanan */}
          <Box p={[-4.0, 2.0, 1.8]} s={[0.5, 0.8, 0.5]} c="#475569" />
        </group>
      )}
    </group>
  );
};
