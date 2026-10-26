import React from 'react';
import { CatmullRomCurve3, Vector3 } from 'three';
type V = [number, number, number];
const Oval = ({ p, s, c }: { p: V; s: V; c: string }) => <mesh position={p} scale={s} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={c} roughness={0.62} /></mesh>;
export const Stem = ({ points, r, c }: { points: V[]; r: number; c: string }) => <mesh castShadow><tubeGeometry args={[new CatmullRomCurve3(points.map((p) => new Vector3(...p))), 14, r, 7, false]} /><meshStandardMaterial color={c} roughness={0.8} /></mesh>;

export const RawChicken = ({ x, z, turn = 0 }: { x: number; z: number; turn?: number }) => <group position={[x, 1.32, z]} rotation={[0, turn, 0]}>
  <Oval p={[0, 0.12, -0.04]} s={[0.22, 0.17, 0.3]} c="#edcdb1" />
  <Oval p={[0, 0.19, -0.12]} s={[0.16, 0.11, 0.23]} c="#f0d5be" />
  <Oval p={[0, 0.04, 0.24]} s={[0.085, 0.05, 0.025]} c="#b68870" />
  <Stem points={[[0, 0.11, -0.27], [0.03, 0.08, -0.37], [0.04, 0.02, -0.42]]} r={0.055} c="#ddba9c" />
  {[-1, 1].map((s) => <group key={s}>
    <Oval p={[s * 0.2, 0.085, 0.14]} s={[0.12, 0.11, 0.17]} c="#e6bea0" />
    <Stem points={[[s * 0.22, 0.08, 0.2], [s * 0.27, 0.04, 0.36], [s * 0.24, 0.04, 0.49]]} r={0.037} c="#e9c6a5" />
    {[-1, 0, 1].map((toe) => <Stem key={toe} points={[[s * 0.24, 0.04, 0.47], [s * 0.24 + toe * 0.035, 0.035, 0.55], [s * 0.24 + toe * 0.06, 0.02, 0.59]]} r={0.009} c="#d5ad80" />)}
    <Stem points={[[s * 0.18, 0.14, -0.18], [s * 0.3, 0.07, -0.1], [s * 0.22, 0.04, 0.02]]} r={0.04} c="#dfb79b" />
  </group>)}
  {Array.from({ length: 36 }, (_, i) => {
    const a = i * 2.399; const radius = Math.sqrt(i / 36);
    return <Oval key={i} p={[Math.cos(a) * 0.17 * radius, 0.26 - radius * radius * 0.055, -0.08 + Math.sin(a) * 0.21 * radius]} s={[0.005, 0.003, 0.005]} c="#dcb99b" />;
  })}
</group>;

export const Vegetable = ({ kind, seed }: { kind: number; seed: number }) => {
  if (kind === 0) return <><Stem points={[[0, 0, -0.13], [0.03, 0.035, 0], [-0.02, 0.01, 0.12], [-0.07, 0.01, 0.19]]} r={0.025} c={seed % 4 ? '#bc3023' : '#619235'} /><Stem points={[[0, 0, -0.13], [0.01, 0.035, -0.18]]} r={0.009} c="#477537" /></>;
  if (kind === 1) return <><mesh rotation={[Math.PI / 2, 0, 0]} castShadow><coneGeometry args={[0.055, 0.32, 12]} /><meshStandardMaterial color="#dc792a" /></mesh>{[0, 1, 2].map((i) => <Stem key={i} points={[[0, 0, 0.16], [0.015 * i, 0.04, 0.24], [0.04 * (i - 1), 0.04, 0.32]]} r={0.01} c="#568344" />)}</>;
  if (kind === 2) return <><Oval p={[0, 0, 0]} s={[0.075, 0.06, 0.2]} c="#573c68" /><Oval p={[0, 0, -0.18]} s={[0.05, 0.045, 0.055]} c="#578342" /><Stem points={[[0, 0, -0.2], [0.02, 0.03, -0.27]]} r={0.013} c="#50743c" /></>;
  if (kind === 3) return <><Oval p={[0, 0, 0]} s={[0.14, 0.12, 0.14]} c="#a0b775" />{Array.from({ length: 7 }, (_, i) => <group key={i} rotation={[0, i * 2.4, 0]}><Oval p={[0.065, 0.02, 0]} s={[0.085, 0.12, 0.14]} c={i % 2 ? '#b4c78c' : '#86a367'} /><Stem points={[[0.1, -0.03, 0], [0.14, 0.03, 0], [0.07, 0.12, 0]]} r={0.003} c="#d7dfae" /></group>)}</>;
  return <>{Array.from({ length: 5 }, (_, i) => <Stem key={i} points={[[i * 0.018, 0, -0.23], [i * 0.018, 0.02, -0.05], [0.025 * i, 0.06, 0.16], [0.035 * i - 0.06, 0.04, 0.35]]} r={0.012} c={i % 2 ? '#4c843e' : '#729c52'} />)}</>;
};
