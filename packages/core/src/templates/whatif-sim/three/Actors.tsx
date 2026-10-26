import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { B } from './util';

const SKIN = '#d49568';
const RED = '#d23a2f';
const JEANS = '#23355f';
const HAIR = '#3a2416';

/* ---------- Boxy character, faces +z ---------- */

export const Character: React.FC<{
  t: number;
  /** 0 = arms down, 1 = T-pose */
  armLift?: number;
  shirt?: string;
  p?: [number, number, number];
  r?: [number, number, number];
  scale?: number;
}> = ({ t, armLift = 0, shirt = RED, p = [0, 0.08, 0], r = [0, 0, 0], scale = 1 }) => {
  const breath = Math.sin(t * 2.2) * 0.012;
  const sway = Math.sin(t * 1.1) * 0.04 + armLift * 1.45;
  return (
    <group position={p} rotation={r} scale={scale}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.12, 0, 0]}>
          <B p={[0, 0.45, 0]} s={[0.2, 0.82, 0.22]} c={JEANS} />
          <B p={[0, 0.05, 0.04]} s={[0.21, 0.1, 0.3]} c="#26262a" />
        </group>
      ))}
      <group position={[0, 0.86, 0]} scale={[1, 1 + breath, 1]}>
        <B p={[0, 0.32, 0]} s={[0.52, 0.64, 0.28]} c={shirt} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.34, 1.46, 0]} rotation={[0, 0, s * (0.07 + sway)]}>
          <B p={[0, -0.12, 0]} s={[0.17, 0.26, 0.2]} c={shirt} />
          <B p={[0, -0.46, 0]} s={[0.13, 0.44, 0.14]} c={SKIN} />
        </group>
      ))}
      <B p={[0, 1.56, 0]} s={[0.12, 0.1, 0.12]} c={SKIN} />
      <group position={[0, 1.76, 0]} rotation={[0, Math.sin(t * 0.6) * 0.15, 0]}>
        <B s={[0.3, 0.32, 0.3]} c={SKIN} />
        <B p={[0, 0.15, -0.02]} s={[0.32, 0.08, 0.33]} c={HAIR} />
        <B p={[0, 0.04, -0.14]} s={[0.32, 0.26, 0.06]} c={HAIR} />
        <B p={[-0.07, 0.02, 0.151]} s={[0.05, 0.03, 0.01]} c="#1b1b1b" />
        <B p={[0.07, 0.02, 0.151]} s={[0.05, 0.03, 0.01]} c="#1b1b1b" />
      </group>
    </group>
  );
};

/* ---------- Voxel dog, faces local +x ---------- */

const WHITE = '#e9e6df';

export const Dog: React.FC<{
  p: [number, number, number];
  yaw: number;
  roll?: number;
  /** world time; drives the run cycle */
  t: number;
  /** 0 = running, 1 = legs stretched (mid-air) */
  stretch?: number;
}> = ({ p, yaw, roll = 0, t, stretch = 0 }) => {
  const legs: [number, number, number][] = [
    [0.27, 0.36, 0.11],
    [0.27, 0.36, -0.11],
    [-0.27, 0.36, 0.11],
    [-0.27, 0.36, -0.11],
  ];
  const phases = [0, Math.PI, Math.PI, 0];
  return (
    <group position={p} rotation={[roll, yaw, 0]} scale={1.2}>
      <B p={[0, 0.5, 0]} s={[0.75, 0.34, 0.32]} c={WHITE} />
      <group position={[0.45, 0.7, 0]}>
        <B s={[0.3, 0.3, 0.3]} c={WHITE} />
        <B p={[0.19, -0.06, 0]} s={[0.14, 0.13, 0.18]} c={WHITE} />
        <B p={[0.265, -0.02, 0]} s={[0.03, 0.05, 0.07]} c="#2b2b2b" />
        <B p={[0.151, 0.05, 0.08]} s={[0.01, 0.05, 0.05]} c="#b3302a" />
        <B p={[0.151, 0.05, -0.08]} s={[0.01, 0.05, 0.05]} c="#b3302a" />
        <B p={[-0.04, 0.19, 0.09]} s={[0.08, 0.1, 0.06]} c={WHITE} />
        <B p={[-0.04, 0.19, -0.09]} s={[0.08, 0.1, 0.06]} c={WHITE} />
      </group>
      {legs.map(([x, y, z], i) => {
        const run = Math.sin(t * 14 + phases[i]) * 0.7;
        const air = (x > 0 ? 1 : -1) * 0.9;
        return (
          <group key={i} position={[x, y, z]} rotation={[0, 0, run * (1 - stretch) + air * stretch]}>
            <B p={[0, -0.17, 0]} s={[0.1, 0.36, 0.1]} c={WHITE} />
          </group>
        );
      })}
      <group position={[-0.37, 0.6, 0]} rotation={[0, 0, 0.7 + Math.sin(t * 10) * 0.2]}>
        <B p={[-0.08, 0, 0]} s={[0.18, 0.06, 0.06]} c={WHITE} />
      </group>
    </group>
  );
};

/* ---------- First-person hand, glued to the camera ---------- */

const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

export const Hand: React.FC<{ t: number }> = ({ t }) => {
  const camera = useThree((s) => s.camera);
  const offset = new THREE.Vector3(-0.13, -0.27 + Math.sin(t * 2) * 0.004, -0.75).applyQuaternion(camera.quaternion);
  const pos = camera.position.clone().add(offset);
  tmpE.set(0.05, -0.1, 0.12);
  const q = camera.quaternion.clone().multiply(tmpQ.setFromEuler(tmpE));
  return (
    <group position={pos} quaternion={q} scale={1.1}>
      <B s={[0.1, 0.11, 0.03]} c={SKIN} />
      {[-0.036, -0.012, 0.012, 0.036].map((x, i) => (
        <B key={i} p={[x, 0.095 + (i === 1 || i === 2 ? 0.006 : 0), 0]} s={[0.021, 0.085, 0.024]} c={SKIN} />
      ))}
      <B p={[0.062, -0.005, 0.005]} s={[0.025, 0.065, 0.025]} r={[0, 0, -0.9]} c={SKIN} />
      <B p={[0, -0.09, -0.005]} s={[0.085, 0.08, 0.028]} c={SKIN} />
    </group>
  );
};
