// pos-ronda-poly3d: night-watch post (pos ronda / gardu) on a low stage: four timber posts, half-height board walls on
// three sides, a lattice upper back, a bench, a kentongan (slit drum) under the eave, two steps at the open front
// (+z) and a pyramid hip roof. Flat-shaded boxes in metres, origin at the centre of the base, 3 x 3 x 3 m overall.
// Variants: `kayu` (timber, clay tile roof) and `seng` (weathered grey boards, corrugated zinc roof).
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'pos-ronda-poly3d',
  name: 'Pos ronda kayu beratap (kayu / seng)',
  category: 'bangunan',
  benda: 'pos-ronda',
  gaya: 'poly3d',
  tags: ['pos ronda', 'pos kamling', 'gardu', 'siskamling', 'ronda', 'kentongan', 'jaga malam', 'night watch', 'guard post', 'shelter', 'kampung', 'low-poly'],
  era: 'kini',
  region: 'Indonesia (kampung dan perumahan)',
  size: [3, 3, 3],
  variants: ['kayu', 'seng'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/pos-ronda.tsx',
  invented: [
    'ukuran dan proporsi dari pengetahuan umum pos ronda kampung, bukan hasil ukur satu bangunan',
    'pos ronda nyata amat beragam; yang digambar satu bentuk umum, bukan replika bangunan tertentu',
    'dinding kayu, bangku, dan kentongan disederhanakan jadi balok datar; tanpa tekstur',
  ],
};

type V3 = [number, number, number];

const Box: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => (
  <mesh position={p} material={flat(c)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const LOOK = {
  kayu: { post: '#5b4331', plank: ['#8a6a4a', '#7d5f42', '#94734f'], floor: '#6e5439', roof: '#9b5a45', roofTop: '#7f4636', fascia: '#4c3727', stone: '#8d8d88' },
  seng: { post: '#4f4f4a', plank: ['#7b7d78', '#70726d', '#858782'], floor: '#5f5a50', roof: '#8c99a2', roofTop: '#76848e', fascia: '#3f4144', stone: '#85857f' },
} as const;

const roofGeo = new THREE.ConeGeometry(1.5 * Math.SQRT2, 0.8, 4, 1);
const drumGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);

export const Item3D: React.FC<Item3DProps> = ({ variant = 'kayu' }) => {
  const L = variant === 'seng' ? LOOK.seng : LOOK.kayu;
  const F = 0.63; // floor top
  const H = 2.2; // top of posts / eave
  const q = 0.98; // post centre offset
  const posts: V3[] = [[-q, 0, -q], [q, 0, -q], [-q, 0, q], [q, 0, q]];
  const bands = [0.1, 0.31, 0.52]; // three board bands, 0.2 m each, stacked from the floor to 0.62 m
  const bars = Array.from({ length: 9 }, (_, i) => -0.88 + (i * 1.76) / 8);
  return (
    <group>
      {/* footings and floor frame */}
      {posts.map((p, i) => <Box key={`f${i}`} p={[p[0], 0.13, p[2]]} s={[0.3, 0.26, 0.3]} c={L.stone} />)}
      <Box p={[0, 0.5, 0]} s={[2.2, 0.1, 2.2]} c={L.fascia} />
      <Box p={[0, F - 0.04, 0]} s={[2.2, 0.08, 2.2]} c={L.floor} />
      {/* posts */}
      {posts.map((p, i) => <Box key={`p${i}`} p={[p[0], 0.26 + (H - 0.26) / 2, p[2]]} s={[0.14, H - 0.26, 0.14]} c={L.post} />)}
      {/* half-height board walls: back, left, right */}
      {bands.map((y, i) => (
        <group key={`w${i}`}>
          <Box p={[0, F + y, -q]} s={[1.84, 0.2, 0.05]} c={L.plank[i]} />
          <Box p={[-q, F + y, 0]} s={[0.05, 0.2, 1.84]} c={L.plank[(i + 1) % 3]} />
          <Box p={[q, F + y, 0]} s={[0.05, 0.2, 1.84]} c={L.plank[(i + 2) % 3]} />
        </group>
      ))}
      {/* upper back lattice */}
      {bars.map((x, i) => <Box key={`b${i}`} p={[x, 1.55, -q]} s={[0.05, 1.5, 0.05]} c={L.post} />)}
      <Box p={[0, 1.38, -q]} s={[1.84, 0.06, 0.06]} c={L.post} />
      {/* side rails at shoulder height */}
      <Box p={[-q, 1.45, 0]} s={[0.06, 0.06, 1.84]} c={L.post} />
      <Box p={[q, 1.45, 0]} s={[0.06, 0.06, 1.84]} c={L.post} />
      {/* ring beam */}
      <Box p={[0, H - 0.06, -q]} s={[2.1, 0.12, 0.12]} c={L.fascia} />
      <Box p={[0, H - 0.06, q]} s={[2.1, 0.12, 0.12]} c={L.fascia} />
      <Box p={[-q, H - 0.06, 0]} s={[0.12, 0.12, 2.1]} c={L.fascia} />
      <Box p={[q, H - 0.06, 0]} s={[0.12, 0.12, 2.1]} c={L.fascia} />
      {/* bench along the back wall */}
      <Box p={[0, F + 0.4, -0.7]} s={[1.7, 0.06, 0.4]} c={L.plank[2]} />
      <Box p={[-0.75, F + 0.2, -0.7]} s={[0.07, 0.4, 0.34]} c={L.post} />
      <Box p={[0.75, F + 0.2, -0.7]} s={[0.07, 0.4, 0.34]} c={L.post} />
      {/* kentongan hanging from the left side beam */}
      <Box p={[-0.78, 2.0, 0.42]} s={[0.015, 0.3, 0.015]} c={L.post} />
      <Box p={[-0.78, 2.0, 0.9]} s={[0.015, 0.3, 0.015]} c={L.post} />
      <mesh geometry={drumGeo} material={flat('#6b4a30')} position={[-0.78, 1.8, 0.66]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      <Box p={[-0.78, 1.9, 0.66]} s={[0.04, 0.02, 0.4]} c="#2b1d12" />
      {/* two steps at the open front */}
      <Box p={[0, 0.21, 1.165]} s={[1.0, 0.42, 0.23]} c={L.stone} />
      <Box p={[0, 0.105, 1.39]} s={[1.0, 0.21, 0.22]} c={L.stone} />
      {/* roof: ceiling board, pyramid, eave fascia, finial */}
      <Box p={[0, H + 0.02, 0]} s={[2.4, 0.04, 2.4]} c={L.fascia} />
      <mesh geometry={roofGeo} material={flat(L.roof)} position={[0, H + 0.4, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow />
      <Box p={[0, H + 0.04, 1.47]} s={[2.94, 0.08, 0.06]} c={L.fascia} />
      <Box p={[0, H + 0.04, -1.47]} s={[2.94, 0.08, 0.06]} c={L.fascia} />
      <Box p={[-1.47, H + 0.04, 0]} s={[0.06, 0.08, 2.94]} c={L.fascia} />
      <Box p={[1.47, H + 0.04, 0]} s={[0.06, 0.08, 2.94]} c={L.fascia} />
      <Box p={[0, 2.98, 0]} s={[0.14, 0.06, 0.14]} c={L.roofTop} />
    </group>
  );
};
