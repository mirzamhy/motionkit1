// tank-poly3d: Tank era Perang Surabaya (Sherman / Stuart style low-poly), bodi lapis baja, kubah meriam putar, laras meriam, dan roda rantai (treads).
// Dimensi: ~6m panjang x 2.8m lebar x 2.6m tinggi, flat-shaded boxes & cylinders.
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'tank-poly3d',
  name: 'Tank Militer Lapis Baja (Perang Surabaya 1945)',
  category: 'kendaraan-darat',
  benda: 'tank',
  gaya: 'poly3d',
  tags: ['tank', 'sherman', 'stuart', 'militer', 'perang', 'surabaya 1945', 'sekutu', 'bkr', 'low-poly'],
  era: '1945',
  region: 'Surabaya, Jawa Timur',
  size: [6, 2.6, 2.8],
  variants: ['sekutu', 'bkr'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/tank.tsx',
  invented: [
    'proporsi disederhanakan ala low-poly flat-shaded',
    'detail baut dan plat roda disederhanakan jadi susunan balok dan silinder',
  ],
};

type V3 = [number, number, number];

const Box: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => (
  <mesh position={p} material={flat(c)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.35, 10);
const barrelGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.6, 8);

const LOOK = {
  sekutu: { hull: '#444d38', dark: '#2b3124', tread: '#222320', star: '#e2e8f0', barrel: '#373d2d' },
  bkr: { hull: '#4a463a', dark: '#2d2922', tread: '#222320', star: '#b91c1c', barrel: '#3b382e' },
} as const;

export const Item3D: React.FC<Item3DProps> = ({ variant = 'sekutu' }) => {
  const L = variant === 'bkr' ? LOOK.bkr : LOOK.sekutu;

  // Road wheels positions along X axis (-2.0 to 2.0)
  const wheelXs = [-1.8, -0.9, 0, 0.9, 1.8];

  return (
    <group>
      {/* --- TREADS / TRACKS (Kiri & Kanan) --- */}
      {/* Track kiri (z = -1.15) */}
      <Box p={[0, 0.45, -1.15]} s={[4.6, 0.7, 0.45]} c={L.tread} />
      {/* Track kanan (z = +1.15) */}
      <Box p={[0, 0.45, 1.15]} s={[4.6, 0.7, 0.45]} c={L.tread} />

      {/* Roda-roda di dalam track */}
      {wheelXs.map((x, i) => (
        <React.Fragment key={`wheels-${i}`}>
          <mesh position={[x, 0.4, -1.15]} rotation={[Math.PI / 2, 0, 0]} material={flat(L.dark)}>
            <primitive object={wheelGeo} attach="geometry" />
          </mesh>
          <mesh position={[x, 0.4, 1.15]} rotation={[Math.PI / 2, 0, 0]} material={flat(L.dark)}>
            <primitive object={wheelGeo} attach="geometry" />
          </mesh>
        </React.Fragment>
      ))}

      {/* Spatbor / Mudguards pelindung rantai */}
      <Box p={[0, 0.85, -1.15]} s={[5.0, 0.12, 0.52]} c={L.hull} />
      <Box p={[0, 0.85, 1.15]} s={[5.0, 0.12, 0.52]} c={L.hull} />

      {/* --- BODY UTAMA (HULL) --- */}
      {/* Bawah bodi di antara dua rantai */}
      <Box p={[0, 0.65, 0]} s={[4.4, 0.5, 1.8]} c={L.dark} />
      {/* Bodi utama atas */}
      <Box p={[-0.1, 1.15, 0]} s={[4.2, 0.65, 1.9]} c={L.hull} />
      {/* Glacis plate depan miring */}
      <Box p={[2.05, 1.05, 0]} s={[0.5, 0.55, 1.85]} c={L.hull} />
      {/* Bagian buritan / knalpot */}
      <Box p={[-2.15, 1.1, 0]} s={[0.3, 0.4, 1.4]} c={L.dark} />
      <Box p={[-2.25, 1.3, -0.4]} s={[0.2, 0.2, 0.3]} c="#1a1a1a" />

      {/* --- KUBAH / TURRET --- */}
      <Box p={[0.2, 1.7, 0]} s={[2.0, 0.6, 1.6]} c={L.hull} />
      <Box p={[0.9, 1.65, 0]} s={[0.4, 0.5, 1.1]} c={L.dark} />
      {/* Hatch / Pintu palka atas komandan */}
      <Box p={[0.0, 2.05, 0.3]} s={[0.7, 0.12, 0.7]} c={L.dark} />

      {/* --- LARAS MERIAM (CANNON BARREL) mengarah ke +X (depan) --- */}
      <mesh position={[2.2, 1.65, 0]} rotation={[0, 0, -Math.PI / 2]} material={flat(L.barrel)} castShadow>
        <primitive object={barrelGeo} attach="geometry" />
      </mesh>
      {/* Muzzle brake di ujung laras */}
      <Box p={[3.55, 1.65, 0]} s={[0.22, 0.22, 0.22]} c={L.dark} />

      {/* Simbol identitas (Bintang Sekutu putih / Bendera Merah Putih pejuang BKR) */}
      {variant === 'sekutu' ? (
        <Box p={[0.2, 1.75, 0.81]} s={[0.4, 0.4, 0.02]} c={L.star} />
      ) : (
        <group position={[0.2, 1.75, 0.81]}>
          <Box p={[0, 0.1, 0]} s={[0.5, 0.18, 0.02]} c="#b91c1c" />
          <Box p={[0, -0.08, 0]} s={[0.5, 0.18, 0.02]} c="#ffffff" />
        </group>
      )}
    </group>
  );
};
