import React from 'react';
import { Quaternion, Vector3 } from 'three';
type V = [number, number, number];
export type VendorPose = 'idle' | 'reach' | 'bag';
export function elbowAt(shoulder: V, target: V, pole: V, upper = 0.27, lower = 0.25): V {
  const a = new Vector3(...shoulder), b = new Vector3(...target);
  const direction = b.clone().sub(a);
  const distance = Math.max(0.001, Math.min(upper + lower - 0.001, direction.length()));
  direction.normalize();
  const bend = new Vector3(...pole).sub(a);
  bend.addScaledVector(direction, -bend.dot(direction)).normalize();
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  return a.addScaledVector(direction, along).addScaledVector(bend, Math.sqrt(Math.max(0, upper * upper - along * along))).toArray() as V;
}
const Segment = ({ a, b, r, color }: { a: V; b: V; r: number; color: string }) => {
  const start = new Vector3(...a), end = new Vector3(...b);
  return <mesh position={start.clone().add(end).multiplyScalar(0.5)} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), end.clone().sub(start).normalize())} castShadow>
    <cylinderGeometry args={[r * 0.9, r, start.distanceTo(end), 18]} /><meshStandardMaterial color={color} roughness={0.85} />
  </mesh>;
};
const Joint = ({ p, r, color }: { p: V; r: number; color: string }) => <mesh position={p} castShadow><sphereGeometry args={[r, 20, 16]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>;
export const RigArm = ({ side, pose, target, grip = 0, angle, showProps = true, shirtColor = '#c6b897' }: { side: number; pose: VendorPose; target?: V; grip?: number; angle?: number; showProps?: boolean; shirtColor?: string }) => {
  const shoulder: V = [side * 0.168, 1.33, 0];
  const active = side === 1 && pose !== 'idle';
  const wrist: V = target ?? (active ? pose === 'reach' ? [0.27, 1.14, 0.43] : [0.3, 0.96, 0.29] : [side * 0.255, 0.855, 0.08]);
  const elbow = elbowAt(shoulder, wrist, [side * 0.7, 1.06, -0.14]);
  const sleeveEnd = new Vector3(...shoulder).lerp(new Vector3(...elbow), 0.63).toArray() as V;
  const skin = '#bf8864';
  return <>
    <Segment a={shoulder} b={sleeveEnd} r={0.064} color={shirtColor} />
    <Joint p={shoulder} r={0.065} color={shirtColor} />
    <Segment a={sleeveEnd} b={elbow} r={0.045} color={skin} />
    <Joint p={elbow} r={0.044} color={skin} />
    <Segment a={elbow} b={wrist} r={0.035} color={skin} />
    <Joint p={wrist} r={0.03} color={skin} />
    <group position={wrist} rotation={[angle ?? (active && pose === 'reach' ? -1.15 : -0.18), 0, 0]}>
      <mesh position={[0, -0.035, 0]} scale={[0.037, 0.05, 0.023]} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={skin} /></mesh>
      {[0, 1, 2, 3].map((i) => {
        const x = -0.025 + i * 0.016;
        const curl = target ? 0.008 + grip * 0.034 : active ? pose === 'bag' ? 0.042 : 0.025 : 0.008;
        const a: V = [x, -0.065, 0], b: V = [x, -0.092, curl], c: V = [x, -0.102 + (active ? 0.025 : 0), curl + (active ? -0.02 : 0)];
        return <group key={i}><Segment a={a} b={b} r={0.007} color={skin} /><Joint p={b} r={0.007} color={skin} /><Segment a={b} b={c} r={0.006} color={skin} /></group>;
      })}
      <Segment a={[side * 0.031, -0.02, 0.01]} b={[side * 0.043, -0.056, 0.035]} r={0.011} color={skin} />
    </group>
    {showProps && active && pose === 'bag' && <group position={[wrist[0], wrist[1] - 0.11, wrist[2] + 0.012]}>
      <mesh castShadow><torusGeometry args={[0.045, 0.008, 8, 32]} /><meshStandardMaterial color="#bb9465" /></mesh>
      <mesh position={[0, -0.2, 0]} castShadow><boxGeometry args={[0.24, 0.31, 0.14]} /><meshStandardMaterial color="#ba9464" roughness={1} /></mesh>
    </group>}
    {showProps && active && pose === 'reach' && <group>
      <mesh position={[0.3, 0.96, 0.52]} castShadow><boxGeometry args={[0.47, 0.09, 0.4]} /><meshStandardMaterial color="#866644" /></mesh>
      {[0, 1, 2].map((i) => <mesh key={i} position={[0.18 + i * 0.1, 1.06, 0.52]} scale={[0.07, 0.075, 0.085]} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color="#80a363" /></mesh>)}
    </group>}
  </>;
};
