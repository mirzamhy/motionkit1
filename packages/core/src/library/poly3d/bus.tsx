// bus-poly3d: yellow school bus, long axis X, front toward +X. Copied from volcano-whatif/src/scenes/rainier.tsx
// (`SchoolBus`); position and rotation now come from <Aset3D>. Only the yellow colour is used in Shot01-08.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat, signTexture } from './kit';

export const meta: ItemMeta = {
  id: 'bus-poly3d',
  name: 'Bus sekolah kuning (low-poly)',
  category: 'kendaraan-darat',
  benda: 'bus',
  gaya: 'poly3d',
  tags: ['bus', 'bus sekolah', 'school bus', 'kendaraan', 'vehicle', 'kuning', 'yellow', 'low-poly'],
  size: [11.5, 3.1, 2.65],
  variants: ['kuning'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/bus.tsx',
  komponen: ['SchoolBus'],
  invented: ['proporsi dan tulisan SCHOOL BUS disederhanakan dari bus nyata (stilisasi asal volcano-whatif)'],
};

const Bus: React.FC = () => {
  if (typeof document === 'undefined') throw new Error('bus-poly3d butuh canvas: render lewat Remotion (Chromium).');
  const sign = useMemo(() => new THREE.MeshBasicMaterial({ map: signTexture('#f2d22a', '#1a1a1a', [{ text: 'SCHOOL BUS', size: 64 }], 512, 110) }), []);
  const yellow = '#f0c020';
  const L = 10;
  return (
    <group>
      {/* body sits from y 0.45 to 3.0 */}
      <mesh material={flat(yellow)} position={[0, 1.75, 0]} scale={[L, 2.5, 2.5]} castShadow receiveShadow>
        <boxGeometry />
      </mesh>
      <mesh material={flat('#f4cc3a')} position={[0, 3.04, 0]} scale={[L - 0.2, 0.12, 2.3]}>
        <boxGeometry />
      </mesh>
      {/* hood */}
      <mesh material={flat(yellow)} position={[L / 2 + 0.75, 1.2, 0]} scale={[1.5, 1.4, 2.3]} castShadow>
        <boxGeometry />
      </mesh>
      {/* window band + black rub rails, both sides */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {Array.from({length: 9}, (_, i) => (
            <mesh key={i} material={flat('#6a5426')} position={[-L / 2 + 0.8 + i * 1.05, 2.25, s * 1.26]} scale={[0.85, 0.7, 0.02]}>
              <boxGeometry />
            </mesh>
          ))}
          {[1.65, 1.2].map((y) => (
            <mesh key={y} material={flat('#141414')} position={[0, y, s * 1.26]} scale={[L, 0.08, 0.02]}>
              <boxGeometry />
            </mesh>
          ))}
          <mesh material={sign} position={[-0.6, 2.8, s * 1.27]} rotation={[0, s > 0 ? 0 : Math.PI, 0]} scale={[3, 0.42, 1]}>
            <planeGeometry />
          </mesh>
        </group>
      ))}
      {/* wheels */}
      {[-3.2, 3.6].flatMap((x) =>
        [-1.15, 1.15].map((z) => (
          <mesh key={`${x},${z}`} material={flat('#121212')} position={[x, 0.5, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.35, 12]} />
          </mesh>
        )),
      )}
    </group>
  );
};

/** the original bus spans x -5 .. 6.5 (hood in front); shift so the base centre is the origin */
export const Item3D: React.FC<Item3DProps> = () => (
  <group position={[-0.75, 0, 0]}>
    <Bus />
  </group>
);
