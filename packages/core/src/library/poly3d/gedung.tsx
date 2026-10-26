// gedung-poly3d: one building of the park's city skyline. `rendah` and `sedang` are the beige window-grid blocks of the
// two front rows, `menara` the hazy grey tower of the back; sizes come from the ranges in simulif-gravity's `City`.
// `seed` picks the exact width and height inside the range.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { rng } from './util';

export const windowTexture = () => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#cdbb9e';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#6e6359';
  g.fillRect(24, 18, 16, 26);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

export const buildingGeometry = (w: number, h: number, d: number) => {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let face = 0; face < 6; face++) {
    for (let j = face * 4; j < face * 4 + 4; j++) {
      if (face === 2 || face === 3) {
        uv.setXY(j, 0.05, 0.05); // roof / floor: plain wall colour
      } else {
        const su = (face < 2 ? d : w) / 0.9;
        uv.setXY(j, uv.getX(j) * su, uv.getY(j) * (h / 1.1));
      }
    }
  }
  uv.needsUpdate = true;
  return g;
};

export const meta: ItemMeta = {
  id: 'gedung-poly3d',
  name: 'Gedung kota (blok jendela / menara)',
  category: 'bangunan',
  benda: 'gedung',
  gaya: 'poly3d',
  tags: ['gedung', 'bangunan', 'building', 'kota', 'city', 'menara', 'tower', 'jendela', 'low-poly'],
  size: [11, 70, 11],
  variants: ['rendah', 'sedang', 'menara'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/gedung.tsx',
  komponen: [{ nama: 'City', dari: 'whatif-sim/three/Park' }],
  invented: ['jendela satu pola, tanpa acuan bangunan nyata'],
};

const RANGE = {
  rendah: { w: [5, 10], h: [6, 10], tower: false },
  sedang: { w: [5, 10], h: [10, 16], tower: false },
  menara: { w: [6, 11], h: [30, 70], tower: true },
} as const;

export const Item3D: React.FC<Item3DProps> = ({ variant = 'sedang', seed = 0 }) => {
  if (typeof document === 'undefined') throw new Error('gedung-poly3d butuh canvas: render lewat Remotion (Chromium).');
  const k = RANGE[variant as keyof typeof RANGE] ?? RANGE.sedang;
  const r = rng(seed + 11);
  const w = k.w[0] + r() * (k.w[1] - k.w[0]);
  const h = k.h[0] + r() * (k.h[1] - k.h[0]);
  const map = useMemo(windowTexture, []);
  const geo = useMemo(() => (k.tower ? new THREE.BoxGeometry(w, h, w) : buildingGeometry(w, h, 6)), [k.tower, w, h]);
  return (
    <mesh geometry={geo} position={[0, h / 2, 0]}>
      {k.tower ? <meshLambertMaterial color="#a3abb7" /> : <meshLambertMaterial map={map} />}
    </mesh>
  );
};
