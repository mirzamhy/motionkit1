// How a film uses a library asset: by id, never by redrawing it. <Aset> goes inside an <svg>, <Aset3D> inside a
// <ThreeCanvas>. `t` is a frame in 30-fps units. See docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md.
import React from 'react';
import { resolveAset } from './aset-resolve';
import type { Item2DProps, Item3DProps } from './types';

type V3 = [number, number, number];

export const Aset: React.FC<{ id: string } & Item2DProps> = ({ id, ...p }) => {
  const Item2D = resolveAset(id, '2d').Item2D!; // resolveAset guarantees it
  return <Item2D {...p} />;
};

export const Aset3D: React.FC<{ id: string; position?: V3; rotation?: V3; scale?: number | V3 } & Item3DProps> = ({ id, position, rotation, scale, ...p }) => {
  const Item3D = resolveAset(id, '3d').Item3D!;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Item3D {...p} />
    </group>
  );
};
