// pejuang-poly3d: Karakter pejuang arek Suroboyo (BKR / laskar rakyat) era pertempuran 1945.
// Tinggi: ~1.72m, postur berdiri siap tempur, ikat kepala merah putih, kemeja pejuang cokelat/krem, celana katun, selempang amunisi/tas, dan memegang bambu runcing di tangan kanan.
// Varian: `siap` (memegang bambu runcing tegak) dan `serang` (bambu runcing condong ke depan).
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'pejuang-poly3d',
  name: 'Pejuang Arek Suroboyo 1945 (Ikat Kepala & Bambu Runcing)',
  category: 'orang',
  benda: 'pejuang',
  gaya: 'poly3d',
  tags: ['pejuang', 'arek suroboyo', 'bkr', 'laskar', 'karakter', 'orang', 'bambu runcing', '1945', 'low-poly'],
  era: '1945',
  region: 'Surabaya, Jawa Timur',
  size: [0.7, 1.75, 0.5],
  variants: ['siap', 'serang'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/pejuang.tsx',
  invented: [
    'anatomi disederhanakan proporsi 7 kepala low-poly flat-shaded',
    'ikat kepala merah putih khas pemuda revolusi Surabaya',
  ],
};

type V3 = [number, number, number];

const Box: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => (
  <mesh position={p} material={flat(c)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const headGeo = new THREE.BoxGeometry(0.24, 0.26, 0.24);
const stalkGeo = new THREE.CylinderGeometry(0.025, 0.03, 2.1, 6);
const tipGeo = new THREE.ConeGeometry(0.03, 0.35, 6);

const C_SKIN = '#c68a5c';
const C_SHIRT = '#967d5e'; // kemeja cokelat/khaki pejuang
const C_PANTS = '#4a4034'; // celana gelap
const C_HAIR = '#1c1917';
const C_BAND_RED = '#b91c1c';
const C_BAND_WHITE = '#f8fafc';
const C_BELT = '#292524';
const C_BAMBOO = '#6b7c3e';
const C_TIP = '#d4c28d';

export const Item3D: React.FC<Item3DProps> = ({ variant = 'siap' }) => {
  const isAttack = variant === 'serang';

  return (
    <group>
      {/* --- KAKI & SEPATU/SANDAL --- */}
      {/* Sepatu/kaki kiri & kanan */}
      <Box p={[-0.12, 0.05, 0.04]} s={[0.13, 0.1, 0.24]} c="#3e2723" />
      <Box p={[0.12, 0.05, 0.04]} s={[0.13, 0.1, 0.24]} c="#3e2723" />
      {/* Kaki bawah (betis/kulit) */}
      <Box p={[-0.12, 0.22, 0]} s={[0.11, 0.26, 0.12]} c={C_SKIN} />
      <Box p={[0.12, 0.22, 0]} s={[0.11, 0.26, 0.12]} c={C_SKIN} />
      {/* Celana pejuang (paha hingga lutut) */}
      <Box p={[-0.12, 0.55, 0]} s={[0.16, 0.44, 0.18]} c={C_PANTS} />
      <Box p={[0.12, 0.55, 0]} s={[0.16, 0.44, 0.18]} c={C_PANTS} />
      <Box p={[0, 0.76, 0]} s={[0.38, 0.12, 0.22]} c={C_PANTS} />

      {/* --- PINGGANG & IKAT PINGGANG --- */}
      <Box p={[0, 0.82, 0]} s={[0.4, 0.06, 0.23]} c={C_BELT} />
      <Box p={[0, 0.82, 0.12]} s={[0.08, 0.07, 0.02]} c="#eab308" /> {/* gesper */}

      {/* --- BADAN / KEMEJA PEJUANG --- */}
      <Box p={[0, 1.06, 0]} s={[0.42, 0.44, 0.24]} c={C_SHIRT} />
      {/* Selempang tas/amunisi menyilang dada */}
      <Box p={[-0.02, 1.06, 0.125]} s={[0.06, 0.46, 0.02]} c="#3a2e22" />
      {/* Kerah baju */}
      <Box p={[0, 1.3, 0.08]} s={[0.22, 0.06, 0.12]} c={C_SHIRT} />

      {/* --- LEHER & KEPALA --- */}
      <Box p={[0, 1.35, 0]} s={[0.12, 0.1, 0.12]} c={C_SKIN} />
      <mesh position={[0, 1.52, 0]} material={flat(C_SKIN)} castShadow>
        <primitive object={headGeo} attach="geometry" />
      </mesh>
      {/* Rambut atas */}
      <Box p={[0, 1.66, -0.02]} s={[0.26, 0.06, 0.26]} c={C_HAIR} />
      <Box p={[0, 1.55, -0.12]} s={[0.26, 0.2, 0.04]} c={C_HAIR} />

      {/* --- IKAT KEPALA MERAH PUTIH --- */}
      <Box p={[0, 1.58, 0]} s={[0.26, 0.05, 0.26]} c={C_BAND_RED} />
      <Box p={[0, 1.54, 0]} s={[0.26, 0.04, 0.26]} c={C_BAND_WHITE} />
      {/* Simpul pita ikat kepala di belakang */}
      <Box p={[0, 1.56, -0.15]} s={[0.08, 0.12, 0.04]} c={C_BAND_RED} />

      {/* --- LENGAN KIRI (santai di samping / mengepal) --- */}
      <Box p={[-0.26, 1.15, 0]} s={[0.12, 0.32, 0.14]} c={C_SHIRT} />
      <Box p={[-0.26, 0.88, 0.02]} s={[0.09, 0.26, 0.1]} c={C_SKIN} />
      <Box p={[-0.26, 0.72, 0.04]} s={[0.09, 0.1, 0.1]} c={C_SKIN} /> {/* tangan mengepal */}

      {/* --- LENGAN KANAN & SENJATA BAMBU RUNCING --- */}
      {isAttack ? (
        // Varian serang: lengan menjulur ke depan membawa bambu runcing menusuk
        <group>
          <Box p={[0.26, 1.15, 0.12]} s={[0.12, 0.14, 0.3]} c={C_SHIRT} />
          <Box p={[0.26, 1.12, 0.35]} s={[0.09, 0.1, 0.28]} c={C_SKIN} />
          {/* Bambu runcing diarahkan condong ke depan (+Z) */}
          <group position={[0.28, 1.12, 0.4]} rotation={[Math.PI / 3, 0, 0]}>
            <mesh position={[0, 0.5, 0]} material={flat(C_BAMBOO)} castShadow>
              <primitive object={stalkGeo} attach="geometry" />
            </mesh>
            <mesh position={[0, 1.6, 0]} rotation={[0.1, 0, 0]} material={flat(C_TIP)} castShadow>
              <primitive object={tipGeo} attach="geometry" />
            </mesh>
          </group>
        </group>
      ) : (
        // Varian siap: memegang bambu runcing berdiri tegak lurus
        <group>
          <Box p={[0.26, 1.15, 0.02]} s={[0.12, 0.32, 0.14]} c={C_SHIRT} />
          <Box p={[0.26, 0.92, 0.1]} s={[0.09, 0.24, 0.1]} c={C_SKIN} />
          {/* Tangan memegang bambu */}
          <Box p={[0.26, 0.82, 0.18]} s={[0.1, 0.1, 0.12]} c={C_SKIN} />
          {/* Bambu runcing berdiri tegak */}
          <group position={[0.26, 0, 0.18]}>
            <mesh position={[0, 1.05, 0]} material={flat(C_BAMBOO)} castShadow>
              <primitive object={stalkGeo} attach="geometry" />
            </mesh>
            <mesh position={[0, 2.2, 0]} rotation={[0.08, 0, 0]} material={flat(C_TIP)} castShadow>
              <primitive object={tipGeo} attach="geometry" />
            </mesh>
            {/* Pita merah putih di leher bambu */}
            <Box p={[0, 1.8, 0.03]} s={[0.1, 0.05, 0.02]} c={C_BAND_RED} />
            <Box p={[0, 1.75, 0.03]} s={[0.1, 0.05, 0.02]} c={C_BAND_WHITE} />
          </group>
        </group>
      )}
    </group>
  );
};
