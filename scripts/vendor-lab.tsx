import React, { useEffect, useState } from 'react';
import { Composition, registerRoot, delayRender, continueRender, useCurrentFrame, Audio, staticFile } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';
import { Vendor } from './vendor-character';
import { Vegetable } from './market-produce';
import { VendorStall, MARKET_PICK, MARKET_PAN } from './vendor-stall';
import { FullMarket } from './market-world';
import { MarketExchange, exchangeFrames, type ExchangeTiming } from './market-exchange';
import { MarketExchangeV2, V2_FRAMES } from './market-exchange-v2';

type V = [number, number, number];
const Ready = ({ ready }: { ready: () => void }) => {
  const { gl, scene, camera } = useThree();
  camera.lookAt(0, 0.95, 0); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready]);
  return null;
};
const Preview = ({ poses = false }: { poses?: boolean }) => {
  const [handle] = useState(() => delayRender('Vendor character'));
  return <ThreeCanvas width={poses ? 1800 : 1200} height={1200} shadows camera={{ position: poses ? [2.4, 2, 7.4] : [2.1, 1.65, 4.2], fov: 29 }}>
    <color attach="background" args={['#d0d6cc']} />
    <hemisphereLight args={['#fff6e8', '#5c726b', 1.7]} />
    <directionalLight position={[-3, 5, 4]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.025} />
    {poses ? (['idle', 'reach', 'bag'] as const).map((pose, i) => <group key={pose} position={[(i - 1) * 1.15, 0, 0]}><Vendor pose={pose} /></group>) : <Vendor />}
    <Ready ready={() => continueRender(handle)} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#a6b3a5" roughness={1} /></mesh>
  </ThreeCanvas>;
};
const ease = (f: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (f - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a: V, b: V, t: number): V => a.map((v, i) => v + (b[i] - v) * t) as V;
const ActionScene = ({ ready, weigh = false }: { ready: () => void; weigh?: boolean }) => {
  const f = useCurrentFrame();
  const { gl, scene, camera } = useThree();
  const rest: V = [0.255, 0.855, 0.08], pick: V = weigh ? [MARKET_PICK[0], MARKET_PICK[1] + 0.045, MARKET_PICK[2] - 0.085] : [0.23, 1.12, 0.37], lift: V = [0.15, 1.32, 0.33], drop: V = weigh ? [MARKET_PAN[0], MARKET_PAN[1] + 0.045, MARKET_PAN[2] - 0.085] : [-0.06, 1.19, 0.37];
  let wrist = mix(rest, pick, ease(f, 12, 36));
  if (f >= 46) wrist = mix(pick, lift, ease(f, 46, 65));
  if (f >= 65) wrist = mix(lift, drop, ease(f, 65, 88));
  if (f >= 104) wrist = mix(drop, rest, ease(f, 104, 132));
  const grip = ease(f, 34, 44) * (1 - ease(f, 90, 100));
  const angle = -0.18 - 0.97 * ease(f, 12, 36) * (1 - ease(f, 104, 132));
  const graspOffset: V = [0, -0.045, 0.085];
  const carried = wrist.map((v, i) => v + graspOffset[i]) as V;
  const onTable = pick.map((v, i) => v + graspOffset[i]) as V;
  const vegetable = f < 44 ? onTable : f < 90 ? carried : mix(drop.map((v, i) => v + graspOffset[i]) as V, weigh ? MARKET_PAN : [-0.06, 0.99, 0.43], ease(f, 90, 101));
  camera.lookAt(0, 1, 0.12); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready, f]);
  return <>
    <Vendor target={wrist} grip={grip} angle={angle} />
    {weigh ? <><VendorStall load={ease(f, 92, 106)} /><group position={vegetable} scale={0.65} rotation={[0, 0.35, 0]}><Vegetable kind={1} seed={0} /></group></> : <>
    <mesh position={[0.06, 0.91, 0.46]} castShadow><boxGeometry args={[0.85, 0.12, 0.52]} /><meshStandardMaterial color="#94744d" /></mesh>
    {[-0.31, 0.43].map((x) => <mesh key={x} position={[x, 0.43, 0.46]} castShadow><boxGeometry args={[0.065, 0.86, 0.42]} /><meshStandardMaterial color="#715537" /></mesh>)}
    <mesh position={vegetable} scale={[0.065, 0.06, 0.065]} castShadow><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#8ba66d" /></mesh>
    {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[vegetable[0], vegetable[1], vegetable[2]]} rotation={[0.2, i * 1.256, 0.3]} scale={[0.067, 0.057, 0.04]}><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={i % 2 ? '#aec58b' : '#739458'} /></mesh>)}
    <group position={[-0.06, 0.97, 0.43]}>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.105, 0.075, 0]} castShadow><boxGeometry args={[0.018, 0.21, 0.2]} /><meshStandardMaterial color="#be9665" /></mesh>)}
      {[-1, 1].map((s) => <mesh key={s} position={[0, 0.075, s * 0.1]} castShadow><boxGeometry args={[0.22, 0.21, 0.012]} /><meshStandardMaterial color="#bc9060" /></mesh>)}
      <mesh position={[0, -0.025, 0]}><boxGeometry args={[0.22, 0.015, 0.2]} /><meshStandardMaterial color="#96734c" /></mesh>
    </group>
    {[-0.8, 0.8].map((x) => <mesh key={x} position={[x, 1.1, -0.28]} castShadow><boxGeometry args={[0.07, 2.2, 0.07]} /><meshStandardMaterial color="#80603f" /></mesh>)}
    <mesh position={[0, 2.15, -0.28]}><boxGeometry args={[1.7, 0.09, 0.08]} /><meshStandardMaterial color="#80603f" /></mesh>
    </>}
  </>;
};
const ActionPreview = ({ weigh = false }: { weigh?: boolean }) => {
  const [handle] = useState(() => delayRender('Vendor action'));
  return <>
    <Audio src={staticFile('market-sound.wav')} volume={0.6} />
    <ThreeCanvas width={1280} height={960} shadows camera={{ position: weigh ? [0.8, 1.95, 4.3] : [2.5, 2, 3.7], fov: 34 }}>
      <color attach="background" args={['#d0d6cc']} /><hemisphereLight args={['#fff6e8', '#5c726b', 1.7]} />
      <directionalLight position={[-3, 5, 4]} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} shadow-normalBias={0.025} />
      <ActionScene ready={() => continueRender(handle)} weigh={weigh} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#a6b3a5" /></mesh>
    </ThreeCanvas>
  </>;
};
const MarketPreview = () => <FullMarket Character={Vendor} />;
const ExchangePreview = ({ timing, debug }: { timing?: ExchangeTiming; debug?: boolean }) => <MarketExchange Character={Vendor} timing={timing} debug={debug} />;
registerRoot(() => <><Composition id="VendorCharacter" component={Preview} width={1200} height={1200} fps={30} durationInFrames={1} /><Composition id="VendorPoses" component={Preview} defaultProps={{ poses: true }} width={1800} height={1200} fps={30} durationInFrames={1} /><Composition id="VendorAction" component={ActionPreview} width={1280} height={960} fps={24} durationInFrames={144} /><Composition id="VendorWeigh" component={ActionPreview} defaultProps={{ weigh: true }} width={1280} height={960} fps={24} durationInFrames={144} /><Composition id="FullMarket" component={MarketPreview} width={1280} height={720} fps={24} durationInFrames={240} /><Composition id="MarketExchange" component={ExchangePreview} width={1280} height={960} fps={24} durationInFrames={exchangeFrames()} /><Composition id="MarketExchangeHold" component={ExchangePreview} defaultProps={{ timing: { hold: 14 } }} width={1280} height={960} fps={24} durationInFrames={exchangeFrames({ hold: 14 })} /><Composition id="MarketExchangeFast" component={ExchangePreview} defaultProps={{ timing: { tempo: 0.75 } }} width={1280} height={960} fps={24} durationInFrames={exchangeFrames({ tempo: 0.75 })} /><Composition id="MarketExchangeV2" component={() => <MarketExchangeV2 Character={Vendor} />} width={1280} height={960} fps={24} durationInFrames={V2_FRAMES} /><Composition id="MarketExchangeV2Arsip" component={() => <MarketExchangeV2 Character={Vendor} look="arsip" />} width={1280} height={960} fps={24} durationInFrames={V2_FRAMES} /><Composition id="MarketExchangeDebug" component={ExchangePreview} defaultProps={{ debug: true }} width={1280} height={960} fps={24} durationInFrames={exchangeFrames()} /><Composition id="MarketExchangeHoldDebug" component={ExchangePreview} defaultProps={{ debug: true, timing: { hold: 14 } }} width={1280} height={960} fps={24} durationInFrames={exchangeFrames({ hold: 14 })} /></>);
