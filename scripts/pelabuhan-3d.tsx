// Proof shot, 3D low-poly: an invented Nusantara harbour in the 1920s. Kenney Pirate Kit (CC0) for the dock, palms,
// boats and cargo, rescaled to a 1.75 m person (`mk asset check` measured the kit at game scale); the procedural market
// people walk the dock. Not a real place: the archive lower third says so.
// npx remotion still scripts/pelabuhan-3d.tsx Pelabuhan3D out/pelabuhan/p3d.png --frame=120 --public-dir=projects/pelabuhan/public --gl=angle
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { AbsoluteFill, Audio, Composition, registerRoot, staticFile, delayRender, continueRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { PlaneGeometry } from 'three';
import { PhModel } from './lab/polyhaven-lab-parts';
import { Vendor } from './vendor-character';
import { beats } from '../packages/core/src/scenes/beats';
import { rng } from '../packages/core/src/scenes/kit';
import { Letterbox, LowerThird } from '../packages/core/src/scenes/titles';

const FPS = 24, DUR = 264;
const T = beats([['buka', 24], ['dorong', 216, -24], ['tahan', 48]] as const);
const kit = (f: string) => staticFile(`kenney/pirate-kit/Models/GLB format/${f}.glb`);
const DECK = 0.72; // dock top above the water
const TILE = 2.25;

/** water: a grid whose heights are a pure function of the frame (no state between frames) */
const Water = ({ f }: { f: number }) => {
  const geo = useMemo(() => { const g = new PlaneGeometry(80, 80, 160, 160); g.rotateX(-Math.PI / 2); return g; }, []);
  const p = geo.attributes.position;
  const t = f / FPS;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    p.setY(i, 0.05 * Math.sin(x * 0.9 + t * 1.6) + 0.035 * Math.sin(z * 1.3 - t * 1.1) + 0.02 * Math.sin((x + z) * 2.1 + t * 2.3));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return <mesh geometry={geo} receiveShadow><meshStandardMaterial color="#3f6b68" roughness={0.35} metalness={0.05} /></mesh>;
};

/** one walker: from x0 along the dock to x1 at 1.25 m/s, starting at frame s; stride cycle tied to distance (feet still slide) */
const Walker3D = ({ f, s, x0, x1, z, peci, shirt, trousers }: { f: number; s: number; x0: number; x1: number; z: number; peci: boolean; shirt: string; trousers: string }) => {
  const d = Math.max(0, Math.min(Math.abs(x1 - x0), ((f - s) / FPS) * 1.25)), dir = Math.sign(x1 - x0);
  const walking = f > s && d < Math.abs(x1 - x0);
  const gait = walking ? Math.sin((d / 0.75) * Math.PI) * 0.45 : 0;
  return <group position={[x0 + dir * d, DECK, z]} rotation={[0, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}><Vendor gait={gait} apron={false} peci={peci} shirtColor={shirt} trousers={trousers} /></group>;
};

const Scene = ({ ready }: { ready: () => void }) => {
  const f = useCurrentFrame();
  const { gl, scene, camera } = useThree();
  const push = T.p(f, 'dorong');
  camera.position.set(-21 + push * 2.5, 8.5 - push * 1.0, 18.5 - push * 3);
  camera.lookAt(0.5, 2.6, -2.5); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready, f]);
  const R = rng(7);
  const people = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    s: i * 14 - 60 + Math.floor(R() * 10), back: i % 3 === 2, z: -0.7 + (i % 4) * 0.55 + (R() - 0.5) * 0.2,
    peci: i % 2 === 0, shirt: ['#EEE8DA', '#D8CDB0', '#9C4A3A', '#EEE8DA', '#C9B48E'][i % 5], trousers: ['#E4DCC8', '#5E4A36', '#3A3632'][i % 3],
  })), []); // eslint-disable-line react-hooks/exhaustive-deps
  const bob = (ph: number) => Math.sin(f / 30 + ph) * 0.06;
  return <>
    <Water f={f} />
    {/* shore: sand bank on the left, palms rescaled to about 8 m */}
    <mesh position={[-12, 0.25, -1]} receiveShadow><boxGeometry args={[12, 0.5, 30]} /><meshStandardMaterial color="#d8c59a" /></mesh>
    {/* a sand spit behind the dock root, where the palms stand */}
    <mesh position={[-5.8, 0.06, -9.6]} scale={[1, 1, 0.75]} receiveShadow><cylinderGeometry args={[4.6, 5.4, 0.5, 40]} /><meshStandardMaterial color="#d8c59a" /></mesh>
    <PhModel id="spit-shrub" url={kit('grass-plant')} position={[-5.2, 0.5, -8.2]} rotation={1} scale={1.4} />
    {/* straight palms behind the dock root (bent ones leaned their fronds into the lens) */}
    <PhModel id="palm1" url={kit('palm-detailed-straight')} position={[-6.2, 0.5, -7.4]} rotation={0.6} scale={1.9} />
    <PhModel id="palm2" url={kit('palm-detailed-straight')} position={[-4.4, 0.5, -10.2]} rotation={2} scale={2.1} />
    <PhModel id="palm3" url={kit('palm-detailed-straight')} position={[-7.6, 0.5, -11.6]} rotation={-1.2} scale={1.7} />
    {/* shrubs on the sand near the dock root: Kenney grass-plant scaled to 60-80 cm clumps */}
    {([[-7.2, -2.8, 1.3, 0.4], [-8.4, -0.4, 1.55, 2.1], [-7.4, 2.6, 1.2, 1.2], [-9.6, 1.4, 1.45, 3.0], [-8.9, -3.9, 1.35, 5.1]] as const).map(([x, z, k, r], i) => (
      <PhModel key={`shrub${i}`} id={`shrub${i}`} url={kit('grass-plant')} position={[x, 0.5, z]} rotation={r} scale={k} />
    ))}
    {/* dock: seven tiles out from the shore, two wide */}
    {Array.from({ length: 7 }, (_, i) => [0, 1].map((j) => <PhModel key={`${i}-${j}`} id={`dock${i}${j}`} url={kit('structure-platform-dock')} position={[-6 + i * TILE, DECK - 1.31, -1.1 + j * TILE]} />))}
    {/* boats: a sailing boat moored alongside, a rowing boat at the end */}
    <group position={[6, bob(0), -7]} rotation={[bob(1) * 0.3, Math.PI / 2, bob(2) * 0.4]}><PhModel id="ship" url={kit('ship-small')} scale={1.1} /></group>
    <group position={[10.5, bob(3) - 0.15, 3.3]} rotation={[0, 0.4, bob(4) * 0.5]}><PhModel id="row" url={kit('boat-row-small')} scale={1.2} /></group>
    {/* cargo on the dock */}
    <PhModel id="crate1" url={kit('crate')} position={[-2.4, DECK, 1.9]} rotation={0.2} scale={0.45} />
    <PhModel id="crate2" url={kit('crate')} position={[-1.8, DECK, 2.2]} rotation={-0.3} scale={0.45} />
    <PhModel id="crate3" url={kit('crate')} position={[-2.1, DECK + 0.35, 2.0]} rotation={0.6} scale={0.45} />
    <PhModel id="barrel1" url={kit('barrel')} position={[3.2, DECK, 2.4]} scale={0.6} />
    <PhModel id="barrel2" url={kit('barrel')} position={[3.9, DECK, 2.1]} scale={0.6} />
    {people.map((p, i) => <Walker3D key={i} f={f} s={p.s} x0={p.back ? 8.5 : -7} x1={p.back ? -7 : 8.5} z={p.z} peci={p.peci} shirt={p.shirt} trousers={p.trousers} />)}
  </>;
};

const Pelabuhan3D: React.FC<{ arsip?: boolean }> = ({ arsip = true }) => {
  const [handle] = useState(() => delayRender('Harbour 3D'));
  const t = useCurrentFrame();
  const W = 1280, H = 720;
  return <AbsoluteFill style={{ background: '#111' }}>
    <ThreeCanvas width={W} height={H} shadows camera={{ fov: 38, near: 0.1, far: 200 }}>
      <color attach="background" args={['#e6d3a8']} />
      <fog attach="fog" args={['#e6d3a8', 25, 70]} />
      <hemisphereLight args={['#fff2d6', '#4d655f', 1.3]} />
      <directionalLight position={[-12, 18, 8]} intensity={2.6} color="#fff0d0" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={0.03} />
      <Suspense fallback={null}><Scene ready={() => continueRender(handle)} /></Suspense>
    </ThreeCanvas>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="h3-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#120d08" stopOpacity="0" /><stop offset="1" stopColor="#120d08" stopOpacity="0.5" /></radialGradient>
        <filter id="h3-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0" /></filter>
      </defs>
      {arsip && <rect width={W} height={H} fill="#808080" opacity={0.55} style={{ mixBlendMode: 'saturation' }} />}
      {arsip && <rect width={W} height={H} fill="#A9834C" opacity={0.35} style={{ mixBlendMode: 'color' }} />}
      <rect width={W} height={H} fill="url(#h3-vig)" />
      <rect width={W} height={H} filter="url(#h3-grain)" opacity={0.22} style={{ mixBlendMode: 'overlay' }} />
      <Letterbox u={t} at={0} W={W} H={H} aspect={2.2} />
      <LowerThird u={t} at={30} until={170} name="Pelabuhan rekaan, 1920-an" role="Rekonstruksi bergaya, bukan lokasi nyata" W={W} H={H + 60} style="arsip" side="right" />
    </svg>
    <AbsoluteFill style={{ background: '#000', opacity: 1 - Math.min(1, t / 12) }} />
    <Audio src={staticFile('sfx/wind.wav')} loop volume={0.16} />
    <Audio src={staticFile('sfx/crowd.wav')} loop volume={0.1} />
  </AbsoluteFill>;
};

registerRoot(() => <>
  <Composition id="Pelabuhan3D" component={Pelabuhan3D} width={1280} height={720} fps={FPS} durationInFrames={DUR} />
  <Composition id="Pelabuhan3DWarna" component={() => <Pelabuhan3D arsip={false} />} width={1280} height={720} fps={FPS} durationInFrames={DUR} />
</>);
