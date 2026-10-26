import React, { useEffect, useState } from 'react';
import { Audio, staticFile, useCurrentFrame, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { VendorStall } from './vendor-stall';
import { Vegetable, RawChicken } from './market-produce';
import type { VendorPose } from './vendor-ik';
type V = [number, number, number];
type CharacterType = React.ComponentType<{ pose?: VendorPose; target?: V; grip?: number; angle?: number; gait?: number; shirtColor?: string; apron?: boolean }>;
const smooth = (f: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (f - a) / (b - a))); return t * t * (3 - 2 * t); };
const Block = ({ p, s, c }: { p: V; s: V; c: string }) => <mesh position={p} castShadow receiveShadow><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={0.9} /></mesh>;
const Bag = () => <group position={[0.29, 0.62, 0.1]}><mesh castShadow><boxGeometry args={[0.19, 0.24, 0.12]} /><meshStandardMaterial color="#c29d66" /></mesh><mesh position={[0, 0.15, 0]}><torusGeometry args={[0.045, 0.007, 6, 16]} /><meshStandardMaterial color="#c29d66" /></mesh></group>;
const Hall = ({ Character, ready }: { Character: CharacterType; ready: () => void }) => {
  const f = useCurrentFrame();
  const { gl, scene, camera } = useThree();
  camera.position.set(7.7 - smooth(f, 0, 239) * 0.6, 5.6, 9.7 - smooth(f, 0, 239) * 0.7);
  camera.lookAt(0, 0.95, 0); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready, f]);
  const reach = smooth(f, 35, 65) * (1 - smooth(f, 160, 190));
  const handed = smooth(f, 110, 135);
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.105, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#9ca58f" roughness={1} /></mesh>
    <Block p={[0, -0.1, 0]} s={[7.4, 0.2, 9]} c="#858e82" />
    {Array.from({ length: 19 }, (_, i) => <Block key={i} p={[0, 0.002, -4.5 + i * 0.5]} s={[7.4, 0.005, 0.012]} c="#646e63" />)}
    {[-1, 1].map((side) => <React.Fragment key={side}>
      <Block p={[side * 1.15, 0.006, 0]} s={[0.11, 0.012, 8.5]} c="#42564d" />
      {[-2.3, 0, 2.3].map((z, index) => <group key={z} position={[side * 2.25, 0, z]} rotation={[0, -side * Math.PI / 2, 0]}>
        <VendorStall load={index === 1 ? reach : 0} />
        <Character target={index === 1 ? [0.2, 1.08 + 0.13 * reach, 0.12 + 0.24 * reach] : undefined} grip={reach} angle={-0.7 * reach} shirtColor={index % 2 ? '#a78464' : '#c4b18d'} />
        {index === 0 && <group position={[0.43, -0.32, 0.45]} scale={0.65}><RawChicken x={0} z={0} /></group>}
        {index === 2 && Array.from({ length: 4 }, (_, i) => <group key={i} position={[-0.55 + i * 0.15, 1.04, 0.6]} scale={0.5}><Vegetable kind={2} seed={i} /></group>)}
      </group>)}
    </React.Fragment>)}
    {/* Buyers occupy the stall edges; two lanes remain clear in the centre. */}
    {[-1, 1].map((side) => <group key={side} position={[side * 1.05, 0, side === -1 ? 0 : -2.3]} rotation={[0, side * Math.PI / 2, 0]}>
      <Character apron={false} shirtColor={side === -1 ? '#9e5151' : '#597f9c'} target={[0.23, 0.9 + reach * 0.22, 0.08 + reach * 0.29]} grip={reach} angle={-0.75 * reach} />
      {side === 1 && <Bag />}
    </group>)}
    <group position={[-1.52 + handed * 0.36, 0.18 - handed * 0.07, -0.13]} rotation={[0, -Math.PI / 2, 0]}><Bag /></group>
    {[0, 1, 2, 3].map((i) => {
      const forward = i % 2 === 0;
      const z = (forward ? 1 : -1) * (5.3 + Math.floor(i / 2) * 3 - f * 0.038);
      return <group key={i} position={[forward ? -0.32 : 0.4, 0, z]} rotation={[0, forward ? Math.PI : 0, 0]}>
        <Character apron={false} shirtColor={['#758aa0', '#a47d50', '#79734e', '#976a85'][i]} gait={Math.sin(f * 0.22 + i * 1.7)} />
        {i % 2 === 1 && <Bag />}
      </group>;
    })}
    {[-3.6, 3.6].map((x) => <React.Fragment key={x}>{[-3.7, 0, 3.7].map((z) => <Block key={z} p={[x, 1.65, z]} s={[0.13, 3.3, 0.13]} c="#66786a" />)}</React.Fragment>)}
    {[-3.7, 0, 3.7].map((z) => <React.Fragment key={z}><Block p={[0, 3.3, z]} s={[7.4, 0.13, 0.13]} c="#66786a" /><Block p={[0, 3.4, z - 0.5]} s={[7.4, 0.07, 0.7]} c="#a5ada1" /></React.Fragment>)}
    {[-2.3, 0, 2.3].map((z) => <React.Fragment key={z}><Block p={[0, 2.9, z]} s={[0.018, 0.6, 0.018]} c="#393f35" /><mesh position={[0, 2.58, z]}><sphereGeometry args={[0.055, 12, 8]} /><meshStandardMaterial color="#fff0c8" emissive="#fff0c8" emissiveIntensity={2} /></mesh><pointLight position={[0, 2.55, z]} intensity={7} color="#ffe6b8" /></React.Fragment>)}
    <Block p={[0, 1.3, -4.4]} s={[7.4, 2.6, 0.1]} c="#a6b5a2" />
  </>;
};
export const FullMarket = ({ Character }: { Character: CharacterType }) => {
  const [handle] = useState(() => delayRender('Full market scene'));
  return <>
    <Audio src={staticFile('market-sound.wav')} loop volume={0.35} />
    <ThreeCanvas width={1280} height={720} shadows camera={{ fov: 40, near: 0.1, far: 100 }}>
      <color attach="background" args={['#d2d8ca']} /><hemisphereLight args={['#fff6df', '#657061', 1.5]} />
      <directionalLight position={[-4, 9, 7]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-normalBias={0.035} />
      <Hall Character={Character} ready={() => continueRender(handle)} />
    </ThreeCanvas>
  </>;
};
