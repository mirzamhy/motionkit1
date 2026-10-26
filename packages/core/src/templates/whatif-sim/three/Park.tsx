import React, { useMemo } from 'react';
import * as THREE from 'three';
import { B, rng } from './util';
import { PohonTaman as Tree } from '../../../library/poly3d/pohon';
import { buildingGeometry, windowTexture } from '../../../library/poly3d/gedung';

/* ---------- City: beige window-grid blocks + hazy towers ---------- */

export const City: React.FC = () => {
  const group = useMemo(() => {
    const root = new THREE.Group();
    const r = rng(11);
    const mat = new THREE.MeshLambertMaterial({ map: windowTexture() });
    for (const row of [
      { z: -58, h0: 6, h1: 10 },
      { z: -72, h0: 10, h1: 16 },
    ]) {
      let x = -55;
      while (x < 55) {
        const w = 5 + r() * 5;
        const h = row.h0 + r() * (row.h1 - row.h0);
        const d = 6;
        const m = new THREE.Mesh(buildingGeometry(w, h, d), mat);
        m.position.set(x + w / 2, h / 2, row.z - r() * 3);
        root.add(m);
        x += w + r() * 0.6;
      }
    }
    const towerMat = new THREE.MeshLambertMaterial({ color: '#a3abb7' });
    for (let i = 0; i < 16; i++) {
      const w = 6 + r() * 5;
      const h = 30 + r() * 40;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), towerMat);
      m.position.set(-80 + r() * 160, h / 2, -95 - r() * 60);
      root.add(m);
    }
    return root;
  }, []);
  return <primitive object={group} />;
};

/* ---------- Low-poly trees ---------- */

const TREES = (() => {
  const r = rng(23);
  const list: { p: [number, number, number]; s: number }[] = [
    { p: [3.4, 0, -4.2], s: 1.55 },
    { p: [-7, 0, -9], s: 1.2 },
    { p: [6.5, 0, -11], s: 1.1 },
  ];
  for (let x = -40; x < 40; x += 2.6 + r() * 2.2) {
    list.push({ p: [x, 0, -22 - r() * 7], s: 0.75 + r() * 0.55 });
  }
  return list;
})();

export const Trees: React.FC = () => (
  <>
    {TREES.map((t, i) => (
      <Tree key={i} p={t.p} s={t.s} seed={i + 100} />
    ))}
  </>
);

/* ---------- Ground, plinth, fountain ---------- */

export const Ground: React.FC = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[400, 400]} />
      <meshLambertMaterial color="#3d5424" />
    </mesh>
    <mesh position={[0, 0.04, 0]}>
      <cylinderGeometry args={[1.1, 1.15, 0.08, 40]} />
      <meshLambertMaterial color="#aaa69d" />
    </mesh>
  </>
);

export const Fountain: React.FC<{ time: number; spray?: boolean }> = ({ time, spray = true }) => (
  <group position={[-4.5, 0, -2.5]}>
    <mesh position={[0, 0.22, 0]}>
      <cylinderGeometry args={[1.3, 1.35, 0.44, 32]} />
      <meshLambertMaterial color="#bdb7ab" />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[1.15, 1.15, 0.02, 32]} />
      <meshLambertMaterial color="#6f90a8" />
    </mesh>
    <B p={[0, 0.7, 0]} s={[0.24, 0.6, 0.24]} c="#bdb7ab" />
    <mesh position={[0, 1.02, 0]}>
      <cylinderGeometry args={[0.42, 0.3, 0.12, 20]} />
      <meshLambertMaterial color="#bdb7ab" />
    </mesh>
    <mesh visible={spray} position={[0, 1.35 + Math.sin(time * 6) * 0.02, 0]}>
      <coneGeometry args={[0.32, 0.6, 12, 1, true]} />
      <meshLambertMaterial color="#e8eef2" transparent opacity={0.6} />
    </mesh>
  </group>
);
