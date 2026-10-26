// pohon-poly3d: two low-poly trees. `bulat` = one icosahedron crown on a cone trunk, from volcano-whatif/src/three/kit.tsx
// (`Tree`); `taman` = three blobs on a trunk, from simulif-gravity Park.tsx (`Tree`, used by the park scene).
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';
import { rng } from './util';

type V3 = [number, number, number];

export const meta: ItemMeta = {
  id: 'pohon-poly3d',
  name: 'Pohon low-poly (bulat / taman)',
  category: 'alam',
  benda: 'pohon',
  gaya: 'poly3d',
  tags: ['pohon', 'tree', 'taman', 'park', 'hutan', 'forest', 'daun', 'low-poly'],
  size: [2.6, 3.7, 2.6],
  variants: ['bulat', 'taman'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/pohon.tsx',
  komponen: [{ nama: 'Trees', dari: 'whatif-sim/three/Park' }],
  invented: ['bentuk disederhanakan, tanpa acuan spesies'],
};

const trunk = new THREE.CylinderGeometry(0.12, 0.16, 1, 5);
const crown = new THREE.IcosahedronGeometry(1, 0);

export const PohonBulat: React.FC<{ p?: V3; size?: number; color?: string }> = ({ p = [0, 0, 0], size = 1, color = '#2f5a2c' }) => (
  <group position={p} scale={size}>
    <mesh geometry={trunk} material={flat('#4a3626')} position={[0, 0.9, 0]} scale={[1, 1.8, 1]} castShadow />
    <mesh geometry={crown} material={flat(color)} position={[0, 2.3, 0]} scale={[1.3, 1, 1.3]} castShadow />
  </group>
);

/* the park tree exactly as it was in Park.tsx */
export const PohonTaman: React.FC<{ p?: V3; s?: number; seed: number }> = ({ p = [0, 0, 0], s = 1, seed }) => {
  const r = rng(seed);
  const greens = ['#2d6a2a', '#357a30', '#2a5f27'];
  const blobs = [
    [0, 2.3, 0, 1.0],
    [0.55 * (r() - 0.3), 2.9, 0.2, 0.8],
    [-0.5, 2.5 + r() * 0.3, -0.2, 0.75],
  ];
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 1.8, 6]} />
        <meshLambertMaterial color="#5b3c25" />
      </mesh>
      {blobs.map(([x, y, z, rad], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[rad, 1]} />
          <meshLambertMaterial color={greens[i % 3]} flatShading />
        </mesh>
      ))}
    </group>
  );
};

export const Item3D: React.FC<Item3DProps> = ({ variant = 'bulat', seed = 0 }) => (variant === 'taman' ? <PohonTaman seed={seed + 100} /> : <PohonBulat />);
