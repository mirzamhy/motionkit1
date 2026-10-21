// Lab for wave 2 (Poly Haven CC0 via `mk asset polyhaven get`): the six market models side by side on a 10 cm grid,
// to check scale, orientation and materials before they go on a stall. The scale bar is 50 cm.
// npx remotion still scripts/lab/polyhaven-lab.tsx PolyhavenLineup out/repo-lab/ph-lineup.png --public-dir=projects/vendor-action/public --gl=angle
import React, { Suspense, useState } from 'react';
import { Composition, registerRoot, delayRender, continueRender, staticFile } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { PH, PhModel, Ready } from './polyhaven-lab-parts';

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


/** the same banana bunch as fetched, simplified to 50 % and to 15 % (glTF-Transform optimize, quantized) */
const Optimized = () => {
  const [handle] = useState(() => delayRender('Optimized bananas'));
  const v = [['bananas_1k.gltf', -0.66], ['bananas_s50.glb', 0], ['bananas_s15.glb', 0.66]] as const;
  return <>
    <ThreeCanvas width={1500} height={600} shadows camera={{ position: [0, 0.55, 1.15], fov: 38 }}>
      <color attach="background" args={['#d3d7cc']} />
      <hemisphereLight args={['#fff6e8', '#5c726b', 1.5]} />
      <directionalLight position={[-1.5, 3, 2]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4, 4]} /><meshStandardMaterial color="#b9bda9" /></mesh>
      <Suspense fallback={null}>
        {v.map(([f, x]) => <PhModel key={f} id="bananas" url={staticFile(`polyhaven/bananas/${f}`)} position={[x, 0, 0]} />)}
        <Ready look={[0, 0.07, 0]} ready={() => continueRender(handle)} />
      </Suspense>
    </ThreeCanvas>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'space-around', font: '20px monospace', color: '#1d1f1b' }}>
      <span>asli 46.868 segitiga</span><span>50% · 23.434</span><span>15% · 7.030</span>
    </div>
  </>;
};

registerRoot(() => <>
  <Composition id="PolyhavenLineup" component={Lineup} width={1600} height={800} fps={30} durationInFrames={1} />
  <Composition id="OptimizedBananas" component={Optimized} width={1500} height={600} fps={30} durationInFrames={1} />
</>);
