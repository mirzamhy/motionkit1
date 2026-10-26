import React, { useEffect, useState } from 'react';
import { Composition, registerRoot, delayRender, continueRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { RawChicken, Vegetable } from './market-produce';

type V = [number, number, number];
const B = ({ p, s, c }: { p: V; s: V; c: string }) => <mesh position={p} castShadow receiveShadow><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={0.8} /></mesh>;
const E = ({ p, s, c }: { p: V; s: V; c: string }) => <mesh position={p} scale={s} castShadow><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={c} roughness={0.55} /></mesh>;
const C = ({ p, r, h, c }: { p: V; r: number; h: number; c: string }) => <mesh position={p} castShadow><cylinderGeometry args={[r, r, h, 24]} /><meshStandardMaterial color={c} roughness={0.7} /></mesh>;
function label(text: string) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 160;
  const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#234941'; ctx.fillRect(0, 0, 768, 160);
  ctx.fillStyle = '#fff0cd'; ctx.font = 'bold 64px Arial'; ctx.textAlign = 'center'; ctx.fillText(text, 384, 105);
  const tex = new CanvasTexture(canvas); tex.colorSpace = SRGBColorSpace; return tex;
}
const Fish = ({ x, z, a = 0 }: { x: number; z: number; a?: number }) => <group position={[x, 1.28, z]} rotation={[0, a, 0]}>
  <E p={[0, 0, 0]} s={[0.12, 0.075, 0.33]} c="#a8bfbd" />
  <E p={[0, 0.028, -0.07]} s={[0.095, 0.052, 0.22]} c="#597681" />
  <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.14, 0.2, 3]} /><meshStandardMaterial color="#526f75" /></mesh>
  <E p={[0.085, 0.028, -0.22]} s={[0.018, 0.018, 0.018]} c="#172728" />
</group>;
const Chicken = ({ x, z }: { x: number; z: number }) => <group position={[x, 1.27, z]}>
  <E p={[0, 0.08, 0]} s={[0.19, 0.14, 0.24]} c="#edc6a9" />
  {[-1, 1].map((side) => <group key={side}><E p={[side * 0.17, 0.04, 0.14]} s={[0.095, 0.085, 0.16]} c="#e5b595" /><E p={[side * 0.13, 0.02, 0.29]} s={[0.045, 0.045, 0.13]} c="#edc6a9" /><E p={[side * 0.19, 0.07, -0.08]} s={[0.055, 0.07, 0.15]} c="#dca78c" /></group>)}
</group>;
const Scene = ({ ready }: { ready: () => void }) => {
  const { gl, scene, camera } = useThree();
  const frame = useCurrentFrame();
  const [labels] = useState(() => ['AYAM SEGAR', 'IKAN SEGAR', 'SAYUR MAYUR'].map(label));
  if (frame === 1) { camera.position.set(-2.4, 2.6, 3.2); camera.lookAt(-3.5, 1.35, 0.6); }
  else if (frame === 2) { camera.position.set(4.7, 2.5, 3.3); camera.lookAt(3.4, 1.35, 0.6); }
  else camera.lookAt(0, 1.3, 0);
  camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready]);
  return <>
    <B p={[0, -0.12, 0.4]} s={[12, 0.24, 6.5]} c="#7b817b" />
    {Array.from({ length: 13 }, (_, i) => <B key={i} p={[-5.8 + i * 0.95, 0.008, 1.9]} s={[0.016, 0.008, 3.3]} c="#505c58" />)}
    <B p={[0, 0.01, 2.4]} s={[10.5, 0.02, 0.18]} c="#283c38" />
    {Array.from({ length: 60 }, (_, i) => <B key={i} p={[-5.15 + i * 0.175, 0.024, 2.4]} s={[0.055, 0.015, 0.2]} c="#788a84" />)}
    {[-3.4, 0, 3.4].map((x, index) => <group key={x} position={[x, 0, 0]}>
      {[-1.62, 1.62].map((px) => <group key={px}>{[-1.3, 1.35].map((z) => <B key={z} p={[px, 1.65, z]} s={[0.12, 3.3, 0.12]} c="#745138" />)}</group>)}
      {[-1.3, 1.35].map((z) => <group key={z}><B p={[0, 3.1, z]} s={[3.38, 0.16, 0.14]} c="#795a3d" /><B p={[0, 2.82, z]} s={[3.18, 0.42, 0.065]} c="#a2835b" /></group>)}
      {[-1.62, 1.62].map((px) => <B key={px} p={[px, 3.1, 0]} s={[0.14, 0.16, 2.8]} c="#795a3d" />)}
      <mesh position={[0, 2.8, 1.31]}><planeGeometry args={[2.6, 0.55]} /><meshStandardMaterial map={labels[index]} /></mesh>
      {Array.from({ length: 13 }, (_, i) => <B key={i} p={[-1.4 + i * 0.235, 0.65, 1.22]} s={[0.22, 1.02, 0.07]} c={i % 3 === 0 ? '#8b6845' : '#a48359'} />)}
      <B p={[0, 0.21, 0.6]} s={[3.05, 0.12, 1.35]} c="#725236" />
      <B p={[0, 1.2, 0.6]} s={[3.16, 0.09, 1.5]} c={index === 2 ? '#9c8056' : '#c1c6b8'} />
      <B p={[0, 1.12, 1.28]} s={[3.16, 0.12, 0.1]} c="#6c4c32" />
      {Array.from({ length: 10 }, (_, i) => <B key={i} p={[-1.4 + i * 0.31, 0.7, 1.288]} s={[0.01, 0.9, 0.01]} c="#87978a" />)}
      <B p={[0.9, 1.4, -0.2]} s={[0.4, 0.18, 0.35]} c="#597b65" />
      <C p={[0.9, 1.54, -0.2]} r={0.27} h={0.025} c="#adb7b1" />
      <C p={[-0.85, 0.3, 1.6]} r={0.28} h={0.55} c={index === 1 ? '#407e8f' : '#b5533f'} />
      <mesh position={[0, 2.5, 0.4]}><sphereGeometry args={[0.09, 12, 8]} /><meshStandardMaterial emissive="#fff3d4" emissiveIntensity={2} color="#fff3d4" /></mesh>
      <pointLight position={[0, 2.45, 0.5]} intensity={8} color="#ffeac3" />
      <B p={[0, 2.84, 0.4]} s={[0.018, 0.5, 0.018]} c="#2b3632" />
    </group>)}
    {[-4.4, -3.55, -2.7].map((x, i) => <group key={x}><C p={[x, 1.26, 0.65]} r={0.38} h={0.07} c="#ad8350" /><RawChicken x={x} z={0.58} turn={(i - 1) * 0.24} /></group>)}
    <B p={[0, 1.27, 0.6]} s={[2.9, 0.035, 1.25]} c="#e0eddf" />
    {Array.from({ length: 28 }, (_, i) => <E key={i} p={[-1.3 + (i % 7) * 0.4, 1.29, 0.15 + Math.floor(i / 7) * 0.28]} s={[0.16, 0.035, 0.09]} c="#d5e8e9" />)}
    {Array.from({ length: 10 }, (_, i) => <Fish key={i} x={-1.12 + (i % 5) * 0.54} z={0.35 + Math.floor(i / 5) * 0.55} a={0.12} />)}
    {Array.from({ length: 5 }, (_, bin) => <group key={bin} position={[2.15 + bin * 0.62, 0, 0]}>
      <B p={[0, 1.27, 0.58]} s={[0.57, 0.12, 1.15]} c="#4f693c" />
      {Array.from({ length: bin === 0 ? 45 : 12 }, (_, i) => <group key={i} position={[-0.15 + (i % 3) * 0.15, 1.39 + Math.floor(i / 9) * 0.045, 0.2 + (Math.floor(i / 3) % 3) * 0.3]} rotation={[0, Math.sin(i * 17) * 0.4, 0]}><Vegetable kind={bin} seed={i} /></group>)}
    </group>)}
    <B p={[3.7, 0.3, 1.65]} s={[1.2, 0.5, 0.65]} c="#8f7046" />
    {Array.from({ length: 8 }, (_, i) => <E key={i} p={[3.3 + (i % 4) * 0.25, 0.6, 1.6 + Math.floor(i / 4) * 0.18]} s={[0.15, 0.14, 0.14]} c="#618f44" />)}
    <B p={[-1.85, 0.3, 0]} s={[0.55, 0.55, 0.65]} c="#ede8d4" />
    <B p={[0, 3.55, -1]} s={[11, 0.12, 0.12]} c="#505e58" />
  </>;
};
const Preview = () => {
  const [handle] = useState(() => delayRender('Pasar geometry'));
  return <ThreeCanvas width={1800} height={1000} shadows camera={{ position: [9, 5.8, 15], fov: 40 }}>
    <color attach="background" args={['#bac6be']} />
    <hemisphereLight args={['#ecf3ed', '#666449', 1.5]} />
    <directionalLight position={[-5, 10, 7]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={0.04} />
    <Scene ready={() => continueRender(handle)} />
  </ThreeCanvas>;
};
registerRoot(() => <Composition id="PasarSegar" component={Preview} width={1800} height={1000} fps={30} durationInFrames={3} />);
