// The procedural market person (head, hair, shirt, trousers, IK arms from vendor-ik, legs with a simple gait),
// moved out of vendor-lab.tsx so other scenes can use it without registering the lab's compositions.
import React from 'react';
import { Vector3, Quaternion } from 'three';
import { RigArm, type VendorPose } from './vendor-ik';

type V = [number, number, number];
const Oval = ({ p, s, c }: { p: V; s: V; c: string }) => <mesh position={p} scale={s} castShadow><sphereGeometry args={[1, 28, 20]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>;
const Limb = ({ a, b, r, c }: { a: V; b: V; r: number; c: string }) => {
  const start = new Vector3(...a), end = new Vector3(...b);
  const middle = start.clone().add(end).multiplyScalar(0.5);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), end.clone().sub(start).normalize());
  return <mesh position={middle} quaternion={q} castShadow><capsuleGeometry args={[r, Math.max(0.001, start.distanceTo(end) - r * 0.5), 8, 14]} /><meshStandardMaterial color={c} roughness={0.85} /></mesh>;
};
export const Vendor = ({ pose = 'idle', target, grip = 0, angle, gait = 0, shirtColor = '#c6b897', apron = true, peci = false, trousers = '#34424a' }: { pose?: VendorPose; target?: V; grip?: number; angle?: number; gait?: number; shirtColor?: string; apron?: boolean; peci?: boolean; trousers?: string }) => {
  const skin = '#bf8864', shirt = shirtColor, pants = trousers;
  return <group>
    <Oval p={[0, 1.59, 0]} s={[0.112, 0.145, 0.108]} c={skin} />
    <Limb a={[0, 1.37, 0]} b={[0, 1.47, 0]} r={0.047} c={skin} />
    {[-1, 1].map((side) => <Oval key={side} p={[side * 0.111, 1.59, 0]} s={[0.018, 0.034, 0.021]} c={skin} />)}
    <mesh position={[0, 1.605, -0.012]} scale={[0.119, 0.145, 0.117]} castShadow>
      <sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.51]} /><meshStandardMaterial color="#27231f" roughness={1} />
    </mesh>
    {[-1, 1].map((side) => <Oval key={side} p={[side * 0.106, 1.59, -0.026]} s={[0.015, 0.067, 0.063]} c="#27231f" />)}
    {Array.from({ length: 9 }, (_, i) => <Oval key={i} p={[-0.086 + i * 0.021, 1.693 + Math.sin(i * 0.6) * 0.012, 0.043]} s={[0.027, 0.037, 0.067]} c={i % 3 ? '#302a24' : '#3b3027'} />)}
    {/* black velvet peci, worn level over the hair */}
    {peci && <mesh position={[0, 1.715, -0.006]} castShadow><cylinderGeometry args={[0.104, 0.112, 0.085, 28]} /><meshStandardMaterial color="#151312" roughness={0.7} /></mesh>}
    <Oval p={[0, 1.19, -0.012]} s={[0.19, 0.235, 0.11]} c={shirt} />
    <Oval p={[0, 0.94, -0.012]} s={[0.155, 0.13, 0.103]} c={pants} />
    {[-1, 1].map((side) => <group key={side}>
      <Limb a={[side * 0.095, 0.96, 0]} b={[side * 0.11, 0.53, gait * side * 0.13]} r={0.075} c={pants} />
      <Limb a={[side * 0.11, 0.53, gait * side * 0.13]} b={[side * 0.12, 0.11 + Math.max(0, gait * side) * 0.07, gait * side * 0.25]} r={0.058} c={pants} />
      <Oval p={[side * 0.12, 0.063 + Math.max(0, gait * side) * 0.07, 0.075 + gait * side * 0.25]} s={[0.068, 0.037, 0.125]} c="#34302a" />
      <Oval p={[side * 0.12, 0.092 + Math.max(0, gait * side) * 0.07, 0.09 + gait * side * 0.25]} s={[0.053, 0.025, 0.095]} c={skin} />
      <RigArm side={side} pose={pose} target={side === 1 && target ? target : gait !== 0 ? [side * 0.255, 0.88, 0.08 - side * gait * 0.13] : undefined} grip={grip} angle={side === 1 ? angle : undefined} showProps={!target && gait === 0} shirtColor={shirt} />
      {apron && <Limb a={[side * 0.072, 1.42, 0.025]} b={[side * 0.08, 1.22, 0.115]} r={0.014} c="#315c52" />}
    </group>)}
    {apron && <>
    <mesh position={[0, 1.16, 0.103]} castShadow><boxGeometry args={[0.235, 0.28, 0.023]} /><meshStandardMaterial color="#39695d" roughness={1} /></mesh>
    <mesh position={[0, 0.94, 0.12]} castShadow><boxGeometry args={[0.3, 0.3, 0.025]} /><meshStandardMaterial color="#39695d" roughness={1} /></mesh>
    <mesh position={[0, 1.03, 0.139]}><boxGeometry args={[0.16, 0.115, 0.012]} /><meshStandardMaterial color="#527f6e" /></mesh>
    <mesh position={[0, 1.076, 0.149]}><boxGeometry args={[0.16, 0.006, 0.004]} /><meshStandardMaterial color="#bbbc95" /></mesh>
    </>}
  </group>;
};
