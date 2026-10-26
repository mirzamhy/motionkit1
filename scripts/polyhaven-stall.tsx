// The stall stocked with Poly Haven produce (wave-2 proof preview). Lives beside the other market lab files, which
// are not committed yet. npx remotion still scripts/polyhaven-stall.tsx StockedReal out/repo-lab/StockedReal.png --public-dir=projects/vendor-action/public --gl=angle
import React, { Suspense, useState } from 'react';
import { Composition, registerRoot, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { VendorStall, WoodLook } from './vendor-stall';
import { useLoader } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader } from 'three';
import { staticFile } from 'remotion';
import { rng } from '../packages/core/src/scenes/kit';
import { PhInstances, PhModel, Ready } from './lab/polyhaven-lab-parts';


/** per-asset corrections found in the lineup: the ginger scan is about four times too big and stands on end */
const FIX: Record<string, { scale?: number; tilt?: number }> = { food_ginger_01: { scale: 0.26, tilt: Math.PI / 2 } };
const Item = ({ id, p, r = 0, s = 1, only }: { id: string; p: [number, number, number]; r?: number; s?: number; only?: string }) => {
  const f = FIX[id] ?? {};
  return <group position={p} rotation={[0, r, 0]}><PhModel id={id} scale={(f.scale ?? 1) * s} only={only} tilt={f.tilt ?? 0} /></group>;
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

/** ambientCG Planks037A (CC0) as the stall's wood */
const PbrWood = ({ children }: { children: React.ReactNode }) => {
  const base = (m: string) => staticFile(`ambientcg/Planks037A/Planks037A_1K-JPG_${m}.jpg`);
  const [map, normalMap, roughnessMap] = useLoader(TextureLoader, [base('Color'), base('NormalGL'), base('Roughness')]);
  map.colorSpace = SRGBColorSpace;
  return <WoodLook.Provider value={{ map, normalMap, roughnessMap }}>{children}</WoodLook.Provider>;
};

const Stocked = ({ real, pbr = false }: { real: boolean; pbr?: boolean }) => {
  const [handle] = useState(() => delayRender('Stocked stall'));
  return <ThreeCanvas width={1280} height={720} shadows camera={{ position: [0.15, 1.75, 2.35], fov: 32 }}>
    <color attach="background" args={['#c4cbb7']} />
    <hemisphereLight args={['#fff5dc', '#576b5d', 1.4]} />
    <directionalLight position={[-2, 5, 3]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} />
    <directionalLight position={[1, 3, -2]} intensity={1.1} color="#d7e5cf" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#9da58e" /></mesh>
    <mesh position={[0, 1.45, -0.9]} receiveShadow><boxGeometry args={[4, 2.9, 0.06]} /><meshStandardMaterial color="#b6b9a0" /></mesh>
    <Suspense fallback={null}>
      {pbr ? <PbrWood><VendorStall load={0.35} stock={!real} /></PbrWood> : <VendorStall load={0.35} stock={!real} />}
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
export const StockedPbr = () => <Stocked real pbr />;


// ---- Kenney Food Kit (CC0, low-poly): about 3x real size, so everything is scaled by ~0.33 ----
const kUrl = (id: string) => staticFile(`kenney/food-kit/Models/GLB format/${id}.glb`);
const KScale: Record<string, number> = { carrot: 0.28, cabbage: 0.4, eggplant: 0.4, onion: 0.36, paprika: 0.5, radish: 0.3, fish: 0.45, corn: 0.4, banana: 0.33 };
const KHeap = ({ id, at, n, rad, seed, lie = false }: { id: string; at: [number, number, number]; n: number; rad: number; seed: number; lie?: boolean }) => {
  const R = rng(seed);
  return <>{Array.from({ length: n }, (_, i) => {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * rad, up = i > n * 0.6 ? 0.03 : 0, k = (KScale[id] ?? 0.33) * (0.9 + R() * 0.2);
    return <group key={i} position={[at[0] + Math.cos(a) * d, at[1] + up, at[2] + Math.sin(a) * d]} rotation={[0, R() * Math.PI * 2, 0]}><PhModel id={id} url={kUrl(id)} scale={k} tilt={lie ? Math.PI / 2 : 0} /></group>;
  })}</>;
};
const StockedKenney = () => {
  const [handle] = useState(() => delayRender('Kenney stall'));
  return <ThreeCanvas width={1280} height={720} shadows camera={{ position: [0.15, 1.75, 2.35], fov: 32 }}>
    <color attach="background" args={['#c4cbb7']} />
    <hemisphereLight args={['#fff5dc', '#576b5d', 1.4]} />
    <directionalLight position={[-2, 5, 3]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} />
    <directionalLight position={[1, 3, -2]} intensity={1.1} color="#d7e5cf" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#9da58e" /></mesh>
    <mesh position={[0, 1.45, -0.9]} receiveShadow><boxGeometry args={[4, 2.9, 0.06]} /><meshStandardMaterial color="#b6b9a0" /></mesh>
    <VendorStall load={0.35} stock={false} />
    <Suspense fallback={null}>
      <KHeap id="cabbage" at={[-0.62, TOP, 0.42]} n={4} rad={0.06} seed={2} />
      <KHeap id="eggplant" at={[-0.5, TOP, 0.6]} n={6} rad={0.06} seed={4} lie />
      <KHeap id="carrot" at={[0.34, TOP, 0.42]} n={9} rad={0.08} seed={6} lie />
      <KHeap id="onion" at={[0.6, TOP, 0.42]} n={10} rad={0.08} seed={9} />
      <KHeap id="paprika" at={[0.4, TOP, 0.62]} n={6} rad={0.06} seed={11} />
      <KHeap id="fish" at={[0.62, TOP, 0.64]} n={4} rad={0.05} seed={13} />
      <Ready look={[0, 1.0, 0.45]} ready={() => continueRender(handle)} />
    </Suspense>
  </ThreeCanvas>;
};

// ---- wave-2 proof: Kenney produce (onions instanced), ModKit crates, pallet and barrel round the stall ----
const mk = (f: string) => staticFile(`modkit/${f}.glb`);
const onionHeap = (() => { const R = rng(31); return Array.from({ length: 22 }, () => { const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.09; return [0.6 + Math.cos(a) * d, TOP + (R() > 0.6 ? 0.03 : 0), 0.42 + Math.sin(a) * d, R() * Math.PI * 2, 0.36 * (0.9 + R() * 0.2)] as [number, number, number, number, number]; }); })();
const StallWave2 = () => {
  const [handle] = useState(() => delayRender('Wave 2 stall'));
  return <ThreeCanvas width={1280} height={720} shadows camera={{ position: [0.6, 1.6, 3.4], fov: 36 }}>
    <color attach="background" args={['#c4cbb7']} />
    <hemisphereLight args={['#fff5dc', '#576b5d', 1.4]} />
    <directionalLight position={[-2, 5, 3]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} />
    <directionalLight position={[1, 3, -2]} intensity={1.1} color="#d7e5cf" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#9da58e" /></mesh>
    <mesh position={[0, 1.45, -0.9]} receiveShadow><boxGeometry args={[5, 2.9, 0.06]} /><meshStandardMaterial color="#b6b9a0" /></mesh>
    <VendorStall load={0.35} stock={false} />
    <Suspense fallback={null}>
      <KHeap id="cabbage" at={[-0.62, TOP, 0.42]} n={4} rad={0.06} seed={2} />
      <KHeap id="eggplant" at={[-0.5, TOP, 0.6]} n={6} rad={0.06} seed={4} lie />
      <KHeap id="carrot" at={[0.34, TOP, 0.42]} n={9} rad={0.08} seed={6} lie />
      <PhInstances url={kUrl('onion')} at={onionHeap} />
      <KHeap id="paprika" at={[0.4, TOP, 0.62]} n={6} rad={0.06} seed={11} />
      {/* beside the stall: a pallet with two crates, a third crate on top, a barrel on the other side */}
      <PhModel id="pallet" url={mk('SM_Pallet')} position={[-1.45, 0, 0.55]} rotation={0.2} scale={0.8} />
      <PhModel id="crate1" url={mk('SM_Crate_Small')} position={[-1.68, 0.098, 0.48]} rotation={0.2} scale={0.6} />
      <PhModel id="crate2" url={mk('SM_Crate_Small')} position={[-1.24, 0.098, 0.6]} rotation={0.2} scale={0.6} />
      <PhModel id="crate3" url={mk('SM_Crate_Small')} position={[-1.45, 0.47, 0.55]} rotation={-0.3} scale={0.6} />
      <KHeap id="cabbage" at={[-1.45, 0.84, 0.55]} n={3} rad={0.06} seed={17} />
      <PhModel id="barrel" url={mk('SM_Barrel')} position={[1.15, 0, 0.15]} scale={0.75} />
      <Ready look={[-0.1, 0.85, 0.5]} ready={() => continueRender(handle)} />
    </Suspense>
  </ThreeCanvas>;
};

registerRoot(() => <>
  <Composition id="StockedProcedural" component={StockedProcedural} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StockedReal" component={StockedReal} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StockedKenney" component={StockedKenney} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StallWave2" component={StallWave2} width={1280} height={720} fps={30} durationInFrames={1} />
  <Composition id="StockedPbr" component={StockedPbr} width={1280} height={720} fps={30} durationInFrames={1} />
</>);
