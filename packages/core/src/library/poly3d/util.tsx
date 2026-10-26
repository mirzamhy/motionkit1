// Moved from templates/whatif-sim/three (simulif-gravity). The old path re-exports this file.
import React from 'react';

export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type V3 = [number, number, number];

/** Flat-shaded box. Pivot is the box centre. */
export const B: React.FC<{ p?: V3; s: V3; c: string; r?: V3 }> = ({ p = [0, 0, 0], s, c, r }) => (
  <mesh position={p} rotation={r}>
    <boxGeometry args={s} />
    <meshLambertMaterial color={c} />
  </mesh>
);
