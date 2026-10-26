import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { Audio, staticFile, useCurrentFrame, delayRender, continueRender } from 'remotion';
import { VendorStall } from './vendor-stall';
import { beats } from '../packages/core/src/scenes/beats';
import { BeatBar } from '../packages/core/src/scenes/debug';
type V = [number, number, number];
type Person = React.ComponentType<{ target?: V; grip?: number; angle?: number; gait?: number; shirtColor?: string; apron?: boolean }>;
const smooth = (t: number) => t * t * (3 - 2 * t);
const ease = (f: number, a: number, b: number) => smooth(Math.max(0, Math.min(1, (f - a) / (b - a))));
// The exchange as named beats (24 fps): [name, frames, gap after the previous beat; negative overlaps it].
// `tempo` scales every length and gap; `hold` adds a still beat after the handover (hit, hold, build);
// `lead` adds frames before the first beat (room for a title and the first words of a voice-over).
export type ExchangeTiming = { tempo?: number; hold?: number; lead?: number };
const timeline = ({ tempo = 1, hold = 0, lead = 0 }: ExchangeTiming = {}) => {
  const k = (n: number) => Math.round(n * tempo);
  return beats([
    ['jual', k(38), k(12) + lead], // seller lifts the bag towards the buyer
    ['raih', k(30), k(-16)], // buyer reaches while the seller is still moving
    ['serah', k(20), k(2)], // bag passes hand to hand
    ['tahan', hold], // both hands on the bag, still
    ['kembali', k(34), k(2)], // seller lets go and returns to rest
    ['tarik', k(22), k(-26)], // buyer draws the bag over the counter
    ['angkat', k(18)], // buyer lifts it clear
    ['turun', k(24)], // and lowers it to the hip
    ['langkah', k(28), k(-42)], // the step back, under angkat and turun
  ] as const);
};
type Timeline = ReturnType<typeof timeline>;
type Beat = Parameters<Timeline['p']>[1];
/** frames the shot needs for this timing: the last beat plus a short tail */
export const exchangeFrames = (o: ExchangeTiming = {}) => timeline(o).b('turun') + 8;

const blend = (a: V, b: V, t: number): V => a.map((x, i) => x + (b[i] - x) * t) as V;
const add = (a: V, b: V): V => a.map((x, i) => x + b[i]) as V;

/** every moving value of the shot at frame f: a pure function, so a debug overlay can sample any frame */
const pose = (T: Timeline, f: number) => {
  const at = (k: Beat, from = 0, to = 1) => T.p(f, k, from, to, smooth);
  const sellerRest: V = [0.25, 1.34, 0.22], sellerMeet: V = [0, 1.33, 0.47];
  const seller = blend(blend(sellerRest, sellerMeet, at('jual')), [0.25, 0.9, 0.12], at('kembali'));
  const buyerRest: V = [0.255, 0.86, 0.08], buyerMeet: V = [0, 1.33, 0.47];
  const buyerPull: V = [0.18, 1.33, 0.2], buyerLift: V = [0.28, 1.3, 0.22], buyerHip: V = [0.31, 0.95, 0.06];
  const lower = at('turun');
  const buyer = blend(blend(blend(blend(buyerRest, buyerMeet, at('raih')), buyerPull, at('tarik')), buyerLift, at('angkat')), buyerHip, lower);
  // After taking the bag the buyer steps back to clear the stall front (Z=.79), then lets the bag hang at the hip.
  const step = at('langkah'), buyerZ = 0.94 + step * 0.3;
  const gait = Math.sin(step * Math.PI * 2) * 0.45 * Math.sin(step * Math.PI);
  // The buyer faces -Z. Convert its local wrist and grip offset into the seller's world space.
  const buyerWorld: V = [-buyer[0], buyer[1], buyerZ - buyer[2]];
  const sellerHandle = add(seller, [0, -0.055, 0.045]);
  const buyerHandle = add(buyerWorld, [0, -0.055 - lower * 0.04, -0.045 + lower * 0.015]);
  const handle = blend(sellerHandle, buyerHandle, at('serah'));
  const sellerGrip = 1 - (T.b('tahan') > T.a('tahan') ? at('kembali', -0.1, 0.3) : at('serah', 0.5, 1.2));
  return { seller, buyer, buyerWorld, buyerZ, gait, lower, step, handle, sellerGrip, buyerGrip: at('raih', 0.7, 1.2) };
};

/** dots along each moving point, every 2 frames over the whole shot: past solid, future faint, now large; drawn on top */
const Paths = ({ T, f, end }: { T: Timeline; f: number; end: number }) => {
  const dots = [];
  for (let g = 0; g <= end; g += 2) {
    const p = pose(T, g), now = Math.abs(g - f) < 1;
    for (const [pt, c] of [[p.seller, '#2F7DE1'], [p.buyerWorld, '#D9478A'], [p.handle, '#F2A93B']] as const)
      dots.push(<mesh key={`${g}-${c}`} position={pt} renderOrder={10}><sphereGeometry args={[now ? 0.022 : 0.009, 10, 8]} /><meshBasicMaterial color={c} transparent opacity={g <= f ? 0.95 : 0.3} depthTest={false} /></mesh>);
  }
  return <>{dots}</>;
};

const ExchangeScene = ({ Character, ready, T, debug }: { Character: Person; ready: () => void; T: Timeline; debug?: boolean }) => {
  const f = useCurrentFrame();
  const SHOT_END = T.b('turun') + 7;
  const { gl, scene, camera } = useThree();
  const { seller, buyer, buyerZ, gait, lower, step, handle, sellerGrip, buyerGrip } = pose(T, f);
  camera.position.set(2.7 - ease(f, 0, SHOT_END) * 0.1, 1.6, 0.48);
  camera.lookAt(0, 1.23 - lower * 0.08, 0.44 + step * 0.12); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready, f]);
  return <>
    <Character target={seller} grip={sellerGrip} angle={-1.15} shirtColor="#ccb78e" />
    <group position={[0, 0, buyerZ]} rotation={[0, Math.PI, 0]}><Character apron={false} shirtColor="#8d596c" target={buyer} grip={buyerGrip} angle={-1.15 + lower * 0.95} gait={gait} /></group>
    <VendorStall load={0.35} hideRightPost />
    {debug && <Paths T={T} f={f} end={SHOT_END} />}
    <group position={handle}>
      {[-1, 1].map((side) => <mesh key={side} position={[0, -0.01, side * (0.045 - lower * 0.032)]} rotation={[side * lower * 0.25, 0, 0]} castShadow><torusGeometry args={[0.043, 0.007, 8, 32]} /><meshStandardMaterial color="#9e7546" /></mesh>)}
      <mesh position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.23, 0.2, 0.14]} /><meshStandardMaterial color="#ba9462" roughness={1} /></mesh>
      <mesh position={[0, -0.15, 0.072]}><boxGeometry args={[0.2, 0.002, 0.001]} /><meshStandardMaterial color="#a78153" /></mesh>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[50, 50]} /><meshStandardMaterial color="#9da58e" roughness={0.8} /></mesh>
    <mesh position={[0, 1.45, -0.9]} receiveShadow><boxGeometry args={[4, 2.9, 0.06]} /><meshStandardMaterial color="#b6b9a0" /></mesh>
    <mesh position={[-1.35, 0.4, -0.25]} castShadow><boxGeometry args={[0.6, 0.8, 0.65]} /><meshStandardMaterial color="#8a6c48" /></mesh>
  </>;
};
export const MarketExchange = ({ Character, timing, debug = false, sound = true }: { Character: Person; timing?: ExchangeTiming; debug?: boolean; sound?: boolean }) => {
  const f = useCurrentFrame();
  const [T] = useState(() => timeline(timing));
  const [handle] = useState(() => delayRender('Market exchange'));
  return <>
    {sound && <Audio src={staticFile('market-sound.wav')} loop volume={0.3} />}
    <ThreeCanvas width={1280} height={960} shadows camera={{ fov: 35, near: 0.05, far: 100 }}>
      <color attach="background" args={['#c4cbb7']} />
      <hemisphereLight args={['#fff5dc', '#576b5d', 1.4]} />
      <directionalLight position={[-2, 5, 3]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} shadow-normalBias={0.025} />
      <directionalLight position={[1, 3, -2]} intensity={1.2} color="#d7e5cf" />
      <ExchangeScene Character={Character} T={T} debug={debug} ready={() => continueRender(handle)} />
    </ThreeCanvas>
    {debug && <BeatBar at={T.at} t={f} total={T.b('turun') + 8} width={1280} />}
  </>;
};
