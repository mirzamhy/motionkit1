// bambu-runcing-poly3d: Senjata ikonik perjuangan rakyat Surabaya 1945.
// Seikat bambu runcing dengan ikatan merah putih, batang bambu hijau-kekuningan beruas dan ujung runcing miring.
// Dimensi: ~0.8m x 2.4m x 0.8m, titik asal di dasar lantai.
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'bambu-runcing-poly3d',
  name: 'Bambu Runcing Pejuang Surabaya (Tunggal & Ikatan)',
  category: 'properti',
  benda: 'bambu-runcing',
  gaya: 'poly3d',
  tags: ['bambu runcing', 'senjata', 'pejuang', 'areek suroboyo', 'perjuangan 1945', 'merah putih', 'low-poly'],
  era: '1945',
  region: 'Surabaya, Jawa Timur',
  size: [0.8, 2.4, 0.8],
  variants: ['ikatan', 'tunggal'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/bambu-runcing.tsx',
  invented: [
    'ujung runcing disederhanakan dengan silinder kerucut miring',
    'pita merah putih sebagai simbol perjuangan pemuda arek Suroboyo',
  ],
};

type V3 = [number, number, number];

const Box: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => (
  <mesh position={p} material={flat(c)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const stalkGeo = new THREE.CylinderGeometry(0.04, 0.045, 1.9, 7);
const tipGeo = new THREE.ConeGeometry(0.04, 0.45, 7);

const SingleBamboo: React.FC<{ pos: V3; rot?: V3; color?: string }> = ({ pos, rot = [0, 0, 0], color = '#738343' }) => (
  <group position={pos} rotation={rot}>
    {/* Batang bambu */}
    <mesh position={[0, 0.95, 0]} material={flat(color)} castShadow>
      <primitive object={stalkGeo} attach="geometry" />
    </mesh>
    {/* Ruas-ruas bambu */}
    <Box p={[0, 0.45, 0]} s={[0.095, 0.03, 0.095]} c="#4e5c2b" />
    <Box p={[0, 0.95, 0]} s={[0.095, 0.03, 0.095]} c="#4e5c2b" />
    <Box p={[0, 1.45, 0]} s={[0.095, 0.03, 0.095]} c="#4e5c2b" />
    {/* Ujung runcing tajam */}
    <mesh position={[0, 2.05, 0]} rotation={[0.08, 0, 0.08]} material={flat('#c7b986')} castShadow>
      <primitive object={tipGeo} attach="geometry" />
    </mesh>
  </group>
);

export const Item3D: React.FC<Item3DProps> = ({ variant = 'ikatan' }) => {
  if (variant === 'tunggal') {
    return (
      <group>
        <SingleBamboo pos={[0, 0, 0]} rot={[0.05, 0, 0.05]} />
        {/* Pita merah putih kecil di leher */}
        <Box p={[0, 1.6, 0.03]} s={[0.12, 0.06, 0.02]} c="#b91c1c" />
        <Box p={[0, 1.54, 0.03]} s={[0.12, 0.06, 0.02]} c="#ffffff" />
      </group>
    );
  }

  // Varian ikatan (5 batang berdiri saling silang kokoh)
  return (
    <group>
      <SingleBamboo pos={[0, 0, 0]} rot={[0, 0, 0]} color="#7a8b48" />
      <SingleBamboo pos={[-0.15, 0, -0.1]} rot={[0.1, 0, -0.1]} color="#6b7c3e" />
      <SingleBamboo pos={[0.18, 0, -0.08]} rot={[0.08, 0, 0.12]} color="#82944d" />
      <SingleBamboo pos={[-0.12, 0, 0.16]} rot={[-0.12, 0, -0.08]} color="#738343" />
      <SingleBamboo pos={[0.14, 0, 0.14]} rot={[-0.09, 0, 0.11]} color="#66773a" />

      {/* Tali tambang pengikat di tengah */}
      <Box p={[0, 0.9, 0]} s={[0.42, 0.14, 0.42]} c="#8b7355" />

      {/* Kain Merah Putih berkibar di ikatan */}
      <group position={[0, 1.45, 0.22]}>
        <Box p={[0.15, 0.08, 0]} s={[0.38, 0.14, 0.02]} c="#b91c1c" />
        <Box p={[0.15, -0.06, 0]} s={[0.38, 0.14, 0.02]} c="#f8fafc" />
      </group>
    </group>
  );
};
