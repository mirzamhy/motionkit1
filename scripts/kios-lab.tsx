import React, { useEffect, useState } from 'react';
import { Composition, registerRoot, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';

const Box: React.FC<{ p: [number, number, number]; s: [number, number, number]; c: string }> = ({ p, s, c }) => <mesh position={p} castShadow receiveShadow><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={0.8} /></mesh>;
const Cylinder: React.FC<{ p: [number, number, number]; r: number; h: number; c: string }> = ({ p, r, h, c }) => <mesh position={p} castShadow><cylinderGeometry args={[r, r, h, 20]} /><meshStandardMaterial color={c} roughness={0.4} /></mesh>;

function signTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#17534b'; ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = '#e6c583'; ctx.lineWidth = 10; ctx.strokeRect(14, 14, 996, 228);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff0ca'; ctx.font = 'bold 78px Arial'; ctx.fillText('KIOS BU SARI', 512, 114);
  ctx.font = '32px Arial'; ctx.fillText('SEMBAKO  •  MINUMAN  •  KEBUTUHAN HARIAN', 512, 187);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}

const Shop: React.FC<{ ready: () => void }> = ({ ready }) => {
  const { gl, scene, camera } = useThree();
  const [sign] = useState(signTexture);
  camera.lookAt(0, 1.4, 0); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready]);
  const colors = ['#d44636', '#e6b52c', '#31795b', '#e7d8b2', '#497da0'];
  return <>
    <Box p={[0, -0.12, 0.4]} s={[8, 0.24, 7]} c="#9c9889" />
    <Box p={[0, 0.1, 0]} s={[5.3, 0.2, 3.8]} c="#c7b99c" />
    <Box p={[0, 1.6, -1.65]} s={[5.1, 3, 0.16]} c="#d9c8a6" />
    <Box p={[-2.5, 1.6, 0]} s={[0.16, 3, 3.4]} c="#baa785" />
    <Box p={[2.5, 1.6, -0.5]} s={[0.16, 3, 2.4]} c="#cfbb97" />
    {[-2.35, 2.35].map((x) => <Box key={x} p={[x, 1.55, 1.5]} s={[0.14, 3, 0.14]} c="#365f54" />)}
    <Box p={[0, 3.15, 0]} s={[5.6, 0.16, 4]} c="#626b66" />
    <mesh position={[0, 3.65, 1.65]}><planeGeometry args={[4.8, 0.95]} /><meshStandardMaterial map={sign} roughness={0.8} /></mesh>
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} position={[-2.6 + i * 0.4, 2.65, 2]} rotation={[0.16, 0, 0]} castShadow><boxGeometry args={[0.4, 0.05, 1.4]} /><meshStandardMaterial color={i % 2 ? '#e8d2a3' : '#a64735'} /></mesh>)}
    {[-1.65, -0.25].map((x) => <group key={x}>
      <Box p={[x, 1.55, -1.4]} s={[1.25, 2.5, 0.15]} c="#5b4330" />
      {[0.45, 1, 1.55, 2.1, 2.65].map((y, row) => <group key={y}>
        <Box p={[x, y, -1.15]} s={[1.3, 0.055, 0.65]} c="#866340" />
        {Array.from({ length: 7 }, (_, i) => <group key={i}>
          <Box p={[x - 0.53 + i * 0.175, y + 0.18, -1.07]} s={[0.14, 0.3, 0.22]} c={colors[(row + i) % 5]} />
          <Box p={[x - 0.53 + i * 0.175, y + 0.18, -0.951]} s={[0.1, 0.09, 0.007]} c="#f4e5b9" />
        </group>)}
      </group>)}
    </group>)}
    <Box p={[1.65, 1.35, -1.13]} s={[1.05, 2.4, 0.8]} c="#e6e5d8" />
    <Box p={[1.65, 1.43, -0.71]} s={[0.84, 1.82, 0.04]} c="#254348" />
    {[0.75, 1.2, 1.65, 2.1].map((y) => <group key={y}>{[1.37, 1.65, 1.93].map((x, i) => <Cylinder key={x} p={[x, y, -0.66]} r={0.085} h={0.28} c={colors[i]} />)}</group>)}
    <Box p={[2.04, 1.4, -0.62]} s={[0.035, 0.45, 0.06]} c="#d8ded8" />
    <Box p={[-0.6, 0.65, 1.05]} s={[2.7, 1.05, 0.8]} c="#765034" />
    <Box p={[-0.6, 1.2, 1.05]} s={[2.85, 0.08, 0.95]} c="#b89059" />
    <mesh position={[-0.6, 0.77, 1.462]}><boxGeometry args={[2.45, 0.66, 0.015]} /><meshPhysicalMaterial color="#a3d6d1" transparent opacity={0.24} roughness={0.1} /></mesh>
    {[-1.75, -0.6, 0.55].map((x) => <Box key={x} p={[x, 0.76, 1.48]} s={[0.035, 0.85, 0.04]} c="#d1c9ac" />)}
    {Array.from({ length: 9 }, (_, i) => <Box key={i} p={[-1.6 + i * 0.25, 0.6, 1.12]} s={[0.19, 0.22, 0.3]} c={colors[i % 5]} />)}
    <Box p={[0.4, 1.32, 1.03]} s={[0.32, 0.2, 0.28]} c="#334440" />
    {Array.from({ length: 12 }, (_, i) => <Box key={i} p={[-1.9 + i * 0.32, 2.13 - (i % 3) * 0.1, 1.52]} s={[0.2, 0.32, 0.045]} c={colors[i % 5]} />)}
    {[1.2, 1.7, 2.2].map((x) => <group key={x}><Cylinder p={[x, 0.55, 1.6]} r={0.21} h={0.65} c="#6292a1" /><Cylinder p={[x, 0.93, 1.6]} r={0.08} h={0.12} c="#427186" /></group>)}
    {[1.3, 1.8].map((x) => <group key={x}><Cylinder p={[x, 0.36, 2.4]} r={0.2} h={0.45} c="#719141" /><Cylinder p={[x, 0.64, 2.4]} r={0.09} h={0.13} c="#718246" /></group>)}
    <Box p={[-2.1, 0.4, 2.1]} s={[0.65, 0.55, 0.65]} c="#b08a55" />
    <Box p={[-2.08, 0.87, 2.1]} s={[0.52, 0.4, 0.5]} c="#cfaa70" />
    <pointLight position={[0, 2.7, 0]} intensity={12} color="#ffe4b6" />
  </>;
};
const Preview: React.FC = () => {
  const [handle] = useState(() => delayRender('Kios geometry'));
  return <ThreeCanvas width={1600} height={1000} shadows camera={{ position: [8, 5, 11], fov: 38 }}>
    <color attach="background" args={['#b9c7c5']} />
    <hemisphereLight args={['#e8f3ff', '#82765d', 1.6]} />
    <directionalLight position={[-5, 9, 6]} intensity={3} color="#ffe2ae" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-normalBias={0.03} />
    <Shop ready={() => continueRender(handle)} />
  </ThreeCanvas>;
};
registerRoot(() => <Composition id="KiosKelontong" component={Preview} width={1600} height={1000} fps={30} durationInFrames={1} />);
