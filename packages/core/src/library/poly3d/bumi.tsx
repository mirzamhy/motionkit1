// bumi-poly3d: a 1 m radius globe with procedural continents and an optional cloud shell. Textures come from
// planet.ts (moved from simulif-gravity templates/whatif-sim/three/planet.ts); the sphere pair was built inline in
// scenes/whatif-gravity/Space.tsx (`Planet`). Needs a canvas, so it must render in Chromium (Remotion).
import React, { useMemo } from 'react';
import type { Item3DProps, ItemMeta } from '../types';
import { makeEarthTextures } from './planet';

export const meta: ItemMeta = {
  id: 'bumi-poly3d',
  name: 'Bumi (bola bertekstur prosedural)',
  category: 'alam',
  benda: 'bumi',
  gaya: 'poly3d',
  tags: ['bumi', 'earth', 'planet', 'globe', 'bola', 'awan', 'cloud', 'luar angkasa', 'space'],
  size: [2, 2, 2],
  variants: ['berawan', 'polos'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/bumi.tsx',
  komponen: ['makeEarthTextures'],
  invented: ['benua, es dan awan dibuat dari noise, bukan peta nyata'],
};

export const Item3D: React.FC<Item3DProps> = ({ t = 0, variant = 'berawan' }) => {
  if (typeof document === 'undefined') throw new Error('bumi-poly3d butuh canvas: render lewat Remotion (Chromium), bukan di Node.');
  const tex = useMemo(makeEarthTextures, []);
  const spin = (t / 30) * 0.15;
  return (
    <group position={[0, 1, 0]}>
      <mesh rotation={[0, spin, 0]}>
        <sphereGeometry args={[1, 96, 64]} />
        <meshLambertMaterial map={tex.map} />
      </mesh>
      {variant === 'berawan' && (
        <mesh rotation={[0, spin * 1.25 + 0.6, 0]}>
          <sphereGeometry args={[1.012, 96, 64]} />
          <meshLambertMaterial map={tex.clouds} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};
