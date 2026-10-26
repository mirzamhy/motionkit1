// AsetUji3D: one scene with every poly3d asset placed through <Aset3D>, to see that they sit together at the right scale.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Aset3D } from '../../library/aset';

export const ASET_UJI_FRAMES = 90;

export const AsetUji3D: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#bcd4e6' }}>
      <ThreeCanvas width={1280} height={720} camera={{ fov: 40, position: [0, 9, 34], near: 0.1, far: 3000 }}>
        <color attach="background" args={['#bcd4e6']} />
        <hemisphereLight args={['#e3e9f2', '#3a4826', 1.5]} />
        <directionalLight position={[-20, 40, 25]} intensity={2.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshLambertMaterial color="#3d5424" />
        </mesh>
        <Aset3D id="rumput-poly3d" position={[0, 0, 4]} t={t} />
        <Aset3D id="bus-poly3d" position={[-10, 0, 0]} rotation={[0, 0.4, 0]} />
        <Aset3D id="pohon-poly3d" variant="bulat" position={[6, 0, -2]} scale={1.5} />
        <Aset3D id="pohon-poly3d" variant="taman" position={[11, 0, -4]} seed={3} scale={1.5} />
        <Aset3D id="gedung-poly3d" variant="rendah" position={[-14, 0, -30]} seed={1} />
        <Aset3D id="gedung-poly3d" variant="sedang" position={[0, 0, -34]} seed={2} />
        <Aset3D id="gedung-poly3d" variant="menara" position={[16, 0, -60]} seed={3} />
        <Aset3D id="gunung-poly3d" variant="sakura" position={[-60, 0, -500]} />
        <Aset3D id="bumi-poly3d" position={[14, 7, -10]} scale={3} t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
