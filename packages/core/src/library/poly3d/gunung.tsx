// gunung-poly3d: truncated low-poly cone with jittered vertices (`Volcano` from volcano-whatif/src/three/kit.tsx,
// renamed `Gunung`). Three film presets: vesuvius, sakura, rainier (with snow cap).
import React, { useMemo } from 'react';
import { random } from 'remotion';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'gunung-poly3d',
  name: 'Gunung berapi low-poly',
  category: 'alam',
  benda: 'gunung',
  gaya: 'poly3d',
  tags: ['gunung', 'gunung berapi', 'volcano', 'mountain', 'kawah', 'rainier', 'sakurajima', 'vesuvius', 'low-poly'],
  size: [660, 170, 660],
  variants: ['vesuvius', 'sakura', 'rainier'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/gunung.tsx',
  komponen: ['Volcano'],
  invented: ['bentuk kerucut dengan jitter acak, bukan model medan nyata', 'skala film (ratusan meter), bukan skala gunung nyata'],
};

// Truncated low-poly cone with jittered vertices, flat shaded.
export const Gunung: React.FC<{position: [number, number, number]; radius: number; height: number; color: string; seed: string}> = ({
  position,
  radius,
  height,
  color,
  seed,
}) => {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(radius * 0.09, radius, height, 18, 4, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = (y + height / 2) / height; // 0 base .. 1 top
      // Seed by position, not index: the cylinder seam has duplicate vertices that
      // must move together or the surface tears open.
      const r2 = (v: number) => String(Math.round(v * 100) / 100); // String(-0) === '0'
      const k = `${seed}${r2(pos.getX(i))},${r2(y)},${r2(pos.getZ(i))}`;
      const jx = (random(k + 'x') - 0.5) * radius * 0.05 * (1 - t * 0.6);
      const jy = (random(k + 'y') - 0.5) * height * 0.06 * (t > 0.01 && t < 0.99 ? 1 : 0);
      const jz = (random(k + 'z') - 0.5) * radius * 0.05 * (1 - t * 0.6);
      pos.setXYZ(i, pos.getX(i) + jx, y + jy, pos.getZ(i) + jz);
    }
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    return ng;
  }, [radius, height, seed]);
  return <mesh geometry={geo} material={flat(color)} position={[position[0], position[1] + height / 2, position[2]]} receiveShadow />;
};

const PRESET: Record<string, { r: number; h: number; color: string; seed: string; salju?: boolean }> = {
  vesuvius: { r: 140, h: 48, color: '#7f6a62', seed: 'vesuvius' }, // volcano-whatif Shot01
  sakura: { r: 240, h: 150, color: '#5e5853', seed: 'sakura' }, // sakurajima.tsx
  rainier: { r: 330, h: 170, color: '#5e6466', seed: 'rainier', salju: true }, // rainier.tsx, with snow cap
};

export const Item3D: React.FC<Item3DProps> = ({ variant = 'vesuvius', seed }) => {
  const p = PRESET[variant] ?? PRESET.vesuvius;
  const sd = `${p.seed}${seed === undefined ? '' : seed}`;
  return (
    <group>
      <Gunung position={[0, 0, 0]} radius={p.r} height={p.h} color={p.color} seed={sd} />
      {p.salju && <Gunung position={[0, p.h * 0.5, 2]} radius={p.r * 0.56} height={p.h * 0.52} color="#e4e8ea" seed={`${sd}-snow`} />}
    </group>
  );
};
