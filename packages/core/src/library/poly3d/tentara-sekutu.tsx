// tentara-sekutu-poly3d: Prajurit tentara Sekutu / British Indian Army era Pertempuran Surabaya 1945.
// Helm baja Brodie/khas Inggris (bentuk piring datar melengkung), seragam drill khaki zaitun militer, sabuk ransel/kopel, sepatu lars hitam, dan senapan Lee-Enfield.
// Varian: `siap` (senapan disandang di bahu) dan `bidik` (senapan dibidikkan ke arah depan +Z).
import React from 'react';
import * as THREE from 'three';
import type { Item3DProps, ItemMeta } from '../types';
import { flat } from './kit';

export const meta: ItemMeta = {
  id: 'tentara-sekutu-poly3d',
  name: 'Tentara Sekutu / British Army 1945 (Helm Brodie & Senapan)',
  category: 'orang',
  benda: 'tentara-sekutu',
  gaya: 'poly3d',
  tags: ['tentara', 'sekutu', 'british', 'inggris', 'gurkha', 'mallaby', 'orang', 'senapan', '1945', 'low-poly'],
  era: '1945',
  region: 'Surabaya, Jawa Timur',
  size: [0.7, 1.76, 0.5],
  variants: ['siap', 'bidik'],
  refs: 'packages/core/src/library/poly3d/refs.md',
  file: 'packages/core/src/library/poly3d/tentara-sekutu.tsx',
  invented: [
    'anatomi disederhanakan proporsi 7 kepala low-poly flat-shaded',
    'helm baja Brodie khas pasukan Persemakmuran Inggris (Commonwealth)',
    'senapan Lee-Enfield disederhanakan balok laras dan popor kayu',
  ],
};

type V3 = [number, number, number];

const Box: React.FC<{ p: V3; s: V3; c: string }> = ({ p, s, c }) => (
  <mesh position={p} material={flat(c)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const headGeo = new THREE.BoxGeometry(0.24, 0.25, 0.24);
const helmetTopGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.12, 8);
const helmetBrimGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.03, 8);
const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6);

const C_SKIN = '#c9966b';
const C_UNIFORM = '#556345'; // seragam militer British olive/khaki
const C_HELMET = '#424f33'; // helm baja Brodie hijau tua zaitun
const C_BOOTS = '#1e1e1e'; // lars hitam
const C_WEBBING = '#736b4e'; // sabuk & tali selempang web gear
const C_RIFLE_WOOD = '#4a2f1c'; // popor senapan kayu
const C_RIFLE_STEEL = '#262626'; // laras baja gelap

export const Item3D: React.FC<Item3DProps> = ({ variant = 'siap' }) => {
  const isAim = variant === 'bidik';

  return (
    <group>
      {/* --- SEPATU LARS & KAKI --- */}
      <Box p={[-0.13, 0.09, 0.04]} s={[0.14, 0.18, 0.26]} c={C_BOOTS} />
      <Box p={[0.13, 0.09, 0.04]} s={[0.14, 0.18, 0.26]} c={C_BOOTS} />
      {/* Celana panjang seragam */}
      <Box p={[-0.13, 0.48, 0]} s={[0.17, 0.62, 0.2]} c={C_UNIFORM} />
      <Box p={[0.13, 0.48, 0]} s={[0.17, 0.62, 0.2]} c={C_UNIFORM} />
      <Box p={[0, 0.78, 0]} s={[0.42, 0.14, 0.24]} c={C_UNIFORM} />

      {/* --- KOPEL & POUCH AMUNISI --- */}
      <Box p={[0, 0.84, 0]} s={[0.44, 0.08, 0.26]} c={C_WEBBING} />
      <Box p={[-0.14, 0.84, 0.14]} s={[0.11, 0.11, 0.05]} c={C_WEBBING} /> {/* pouch kiri */}
      <Box p={[0.14, 0.84, 0.14]} s={[0.11, 0.11, 0.05]} c={C_WEBBING} /> {/* pouch kanan */}

      {/* --- BADAN SERAGAM MILITER --- */}
      <Box p={[0, 1.08, 0]} s={[0.44, 0.44, 0.26]} c={C_UNIFORM} />
      {/* Tali ransel webbing menyilang di pundak */}
      <Box p={[-0.14, 1.08, 0.135]} s={[0.06, 0.44, 0.02]} c={C_WEBBING} />
      <Box p={[0.14, 1.08, 0.135]} s={[0.06, 0.44, 0.02]} c={C_WEBBING} />
      <Box p={[-0.14, 1.08, -0.135]} s={[0.06, 0.44, 0.02]} c={C_WEBBING} />
      <Box p={[0.14, 1.08, -0.135]} s={[0.06, 0.44, 0.02]} c={C_WEBBING} />
      {/* Kerah kemeja seragam */}
      <Box p={[0, 1.31, 0.09]} s={[0.22, 0.06, 0.12]} c={C_UNIFORM} />

      {/* --- LEHER & KEPALA --- */}
      <Box p={[0, 1.36, 0]} s={[0.12, 0.09, 0.12]} c={C_SKIN} />
      <mesh position={[0, 1.51, 0]} material={flat(C_SKIN)} castShadow>
        <primitive object={headGeo} attach="geometry" />
      </mesh>

      {/* --- HELM BAJA BRODIE (PIRINGAN KHAS INGGRIS) --- */}
      <group position={[0, 1.63, 0]}>
        {/* Kubah helm */}
        <mesh position={[0, 0.04, 0]} material={flat(C_HELMET)} castShadow>
          <primitive object={helmetTopGeo} attach="geometry" />
        </mesh>
        {/* Pinggiran lebar piringan (brim) */}
        <mesh position={[0, -0.02, 0]} material={flat(C_HELMET)} castShadow>
          <primitive object={helmetBrimGeo} attach="geometry" />
        </mesh>
        {/* Tali dagu helm */}
        <Box p={[0, -0.14, 0.08]} s={[0.23, 0.02, 0.02]} c="#292524" />
      </group>

      {/* --- LENGAN & SENAPAN LEE-ENFIELD --- */}
      {isAim ? (
        // Varian bidik: dua tangan mengangkat senapan mengarah ke depan (+Z)
        <group>
          {/* Lengan kanan & kiri maju ke depan */}
          <Box p={[-0.18, 1.18, 0.22]} s={[0.11, 0.12, 0.32]} c={C_UNIFORM} />
          <Box p={[0.22, 1.18, 0.18]} s={[0.11, 0.12, 0.28]} c={C_UNIFORM} />
          <Box p={[-0.14, 1.18, 0.42]} s={[0.08, 0.08, 0.1]} c={C_SKIN} /> {/* tangan kiri pegang laras */}
          <Box p={[0.16, 1.18, 0.32]} s={[0.08, 0.08, 0.1]} c={C_SKIN} /> {/* tangan kanan pegang picu */}
          {/* Senapan Lee-Enfield mendatar */}
          <group position={[0.02, 1.18, 0.35]}>
            {/* Popor kayu */}
            <Box p={[0, -0.02, -0.16]} s={[0.05, 0.09, 0.36]} c={C_RIFLE_WOOD} />
            {/* Bodi tengah & magasin */}
            <Box p={[0, -0.01, 0.1]} s={[0.045, 0.07, 0.34]} c={C_RIFLE_WOOD} />
            <Box p={[0, -0.06, 0.06]} s={[0.04, 0.06, 0.08]} c={C_RIFLE_STEEL} /> {/* kotak magasin */}
            {/* Laras baja ke arah depan */}
            <mesh position={[0, 0.02, 0.55]} rotation={[Math.PI / 2, 0, 0]} material={flat(C_RIFLE_STEEL)}>
              <primitive object={barrelGeo} attach="geometry" />
            </mesh>
            {/* Bayonet di ujung senapan */}
            <Box p={[0, 0.02, 1.05]} s={[0.01, 0.04, 0.2]} c="#94a3b8" />
          </group>
        </group>
      ) : (
        // Varian siap: senapan tersandang di bahu kanan
        <group>
          {/* Lengan kiri santai */}
          <Box p={[-0.27, 1.16, 0]} s={[0.12, 0.32, 0.14]} c={C_UNIFORM} />
          <Box p={[-0.27, 0.88, 0.02]} s={[0.09, 0.26, 0.1]} c={C_SKIN} />
          {/* Lengan kanan memegang tali sandang */}
          <Box p={[0.27, 1.16, 0.02]} s={[0.12, 0.3, 0.14]} c={C_UNIFORM} />
          <Box p={[0.25, 0.96, 0.14]} s={[0.09, 0.2, 0.1]} c={C_SKIN} />
          {/* Senapan Lee-Enfield di pundak belakang kanan */}
          <group position={[0.22, 1.25, -0.16]} rotation={[-0.2, 0, 0.1]}>
            <Box p={[0, -0.25, 0]} s={[0.05, 0.4, 0.08]} c={C_RIFLE_WOOD} />
            <mesh position={[0, 0.35, 0]} material={flat(C_RIFLE_STEEL)}>
              <primitive object={barrelGeo} attach="geometry" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
