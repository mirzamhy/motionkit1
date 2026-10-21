// Lab for wave 2 (Poly Haven CC0 via `mk asset polyhaven get`): the six market models side by side on a 10 cm grid,
// to check scale, orientation and materials before they go on a stall. The scale bar is 50 cm.
// npx remotion still scripts/lab/polyhaven-lab.tsx PolyhavenLineup out/repo-lab/ph-lineup.png --public-dir=projects/vendor-action/public --gl=angle
import React, { Suspense, useEffect, useState } from 'react';
import { Composition, registerRoot, staticFile, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VendorStall } from '../vendor-stall';
import { rng } from '../../packages/core/src/scenes/kit';


export const PH = ['bananas', 'food_ginger_01', 'food_lime_01', 'yellow_onion', 'sweet_potato', 'wooden_cutting_board'] as const;
export const phUrl = (id: string) => staticFile(`polyhaven/${id}/${id}_1k.gltf`);

/** a Poly Haven model placed with its base on y = 0 and centred on x/z; reports its measured size once */
export const PhModel = ({ id, position = [0, 0, 0], rotation = 0, scale = 1, onSize, only }: { id: string; position?: [number, number, number]; rotation?: number; scale?: number; onSize?: (s: Vector3) => void; only?: string }) => {
  const gltf = useLoader(GLTFLoader, phUrl(id));
  const [obj] = useState(() => {
    const o = gltf.scene.clone(true);
    // keep one named node of a multi-part scan (e.g. the bunch without the loose bananas)
    if (only) o.traverse((m) => { if (m.parent === o && m.name !== only) m.visible = false; });
    o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; });
    // bounds of what is shown: hidden parts must not shift the centre or lift the base
    const b = new Box3();
    o.updateMatrixWorld(true);
    o.children.filter((m) => m.visible).forEach((m) => b.expandByObject(m, true));
    const c = b.getCenter(new Vector3());
    o.position.set(-c.x, -b.min.y, -c.z);
    onSize?.(b.getSize(new Vector3()));
    return o;
  });
  return <group position={position} rotation={[0, rotation, 0]} scale={scale}><primitive object={obj} /></group>;
};

const Ready = ({ ready, look }: { ready: () => void; look: [number, number, number] }) => {
  const { gl, scene, camera } = useThree();
  camera.lookAt(...look); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready]);
  return null;
};

const Lineup = () => {
  const [handle] = useState(() => delayRender('Poly Haven models'));
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const xs = [-0.95, -0.45, -0.12, 0.12, 0.36, 0.85];
  return <>
    <ThreeCanvas width={1600} height={800} shadows camera={{ position: [0, 0.75, 1.55], fov: 30 }}>
      <color attach="background" args={['#d3d7cc']} />
      <hemisphereLight args={['#fff6e8', '#5c726b', 1.5]} />
      <directionalLight position={[-2, 4, 3]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[6, 6]} /><meshStandardMaterial color="#b9bda9" /></mesh>
      <gridHelper args={[3, 30, '#6d7364', '#9a9f8e']} position={[0, 0.001, 0]} />
      <mesh position={[0, 0.004, 0.42]}><boxGeometry args={[0.5, 0.004, 0.012]} /><meshBasicMaterial color="#b0302a" /></mesh>
      <Suspense fallback={null}>
        {PH.map((id, i) => <PhModel key={id} id={id} position={[xs[i], 0, 0]} onSize={(s) => setSizes((o) => ({ ...o, [id]: `${(s.x * 100).toFixed(0)}×${(s.y * 100).toFixed(0)}×${(s.z * 100).toFixed(0)} cm` }))} />)}
        <Ready look={[0, 0.08, 0]} ready={() => continueRender(handle)} />
      </Suspense>
    </ThreeCanvas>
    <div style={{ position: 'absolute', left: 24, bottom: 18, font: '18px monospace', color: '#1d1f1b', whiteSpace: 'pre' }}>
      {PH.map((id) => `${id}: ${sizes[id] ?? '…'}`).join('\n')}{'\n'}red bar = 50 cm, grid = 10 cm
    </div>
  </>;
};


// ---- the stall stocked with Poly Haven produce (wave-2 proof preview) ----

/** per-asset corrections found in the lineup: the ginger scan is about four times too big and stands on end */
const FIX: Record<string, { scale?: number; tilt?: number }> = { food_ginger_01: { scale: 0.26, tilt: Math.PI / 2 } };
const Item = ({ id, p, r = 0, s = 1, only }: { id: string; p: [number, number, number]; r?: number; s?: number; only?: string }) => {
  const f = FIX[id] ?? {};
  return <group position={p} rotation={[f.tilt ?? 0, r, 0]}><PhModel id={id} scale={(f.scale ?? 1) * s} only={only} /></group>;
};
/** a seeded heap: n copies jittered on a disc of radius rad, the second layer raised */
const Heap = ({ id, at, n, rad, seed, s = 1 }: { id: string; at: [number, number, number]; n: number; rad: number; seed: number; s?: number }) => {
  const R = rng(seed);
  return <>{Array.from({ length: n }, (_, i) => {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * rad, up = i > n * 0.6 ? 0.035 : 0;
    return <Item key={i} id={id} p={[at[0] + Math.cos(a) * d, at[1] + up, at[2] + Math.sin(a) * d]} r={R() * Math.PI * 2} s={s * (0.9 + R() * 0.2)} />;
  })}</>;
};
const TOP = 0.975 + 0.035; // table top plus the green display boards

const Stocked = ({ real }: { real: boolean }) => {
  const [handle] = useState(() => delayRender('Stocked stall'));
  return <ThreeCanvas width={1280} height={720} shadows camera={{ position: [0.15, 1.75, 2.35], fov: 32 }}>
    <color attach="background" args={['#c4cbb7']} />
    <hemisphereLight args={['#fff5dc', '#576b5d', 1.4]} />
    <directionalLight position={[-2, 5, 3]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} />
    <directionalLight position={[1, 3, -2]} intensity={1.1} color="#d7e5cf" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#9da58e" /></mesh>
    <mesh position={[0, 1.45, -0.9]} receiveShadow><boxGeometry args={[4, 2.9, 0.06]} /><meshStandardMaterial color="#b6b9a0" /></mesh>
    <VendorStall load={0.35} stock={!real} />
    <Suspense fallback={null}>
      {real && <>
        <Heap id="yellow_onion" at={[0.36, TOP, 0.4]} n={14} rad={0.1} seed={3} />
        <Heap id="sweet_potato" at={[0.58, TOP, 0.42]} n={9} rad={0.09} seed={5} />
        <Heap id="food_lime_01" at={[0.46, TOP, 0.62]} n={12} rad={0.07} seed={8} />
        <Item id="bananas" only="bananas_bunch" p={[-0.62, TOP, 0.4]} r={2.2} />
        <Item id="bananas" only="bananas_bunch" p={[-0.52, TOP, 0.5]} r={-0.6} s={0.95} />
        <Item id="wooden_cutting_board" p={[-0.5, 0.975, 0.66]} r={0.1} s={0.7} />
        <Item id="food_ginger_01" p={[-0.5, 0.975 + 0.03, 0.66]} r={1.2} />
      </>}
      <Ready look={[0, 1.0, 0.45]} ready={() => continueRender(handle)} />
    </Suspense>
  </ThreeCanvas>;
};
export const StockedProcedural = () => <Stocked real={false} />;
export const StockedReal = () => <Stocked real />;

registerRoot(() => <>
  <Composition id="PolyhavenLineup" component={Lineup} width={1600} height={800} fps={30} durationInFrames={1} />
  <Composition id="StockedProcedural" component={StockedProcedural} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StockedReal" component={StockedReal} width={1280} height={720} fps={30} durationInFrames={1} />
</>);
