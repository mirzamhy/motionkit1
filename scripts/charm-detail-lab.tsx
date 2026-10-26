import React, { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { Composition, continueRender, delayRender, registerRoot, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { buatCharm, type CharmId } from '../packages/three/src/jajan/charm';

const IDS: CharmId[] = ['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'];
const POS: [number, number][] = [[-1.42, 0.85], [0, 0.85], [1.42, 0.85], [-0.72, -0.82], [0.72, -0.82]];

const Study = ({ ready }: { ready: () => void }) => {
  const { gl, scene, camera } = useThree();
  const models = useMemo(() => IDS.map((id, i) => {
    const group = buatCharm(id).grup;
    group.position.set(POS[i][0], POS[i][1], 0);
    return group;
  }), []);
  camera.position.set(0, 0, 6.9);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready]);
  return <>
    <color attach="background" args={['#d6cbbb']} />
    <ambientLight intensity={1.4} color="#fff3e4" />
    <directionalLight position={[-3, 5, 6]} intensity={2.4} color="#fff0d5" />
    <directionalLight position={[4, -1, 3]} intensity={0.65} color="#d5e5e1" />
    {models.map((model, i) => <primitive key={IDS[i]} object={model} />)}
  </>;
};

const CharmDetailLab: React.FC = () => {
  const [handle] = useState(() => delayRender('Charm details'));
  return <ThreeCanvas width={1500} height={1500} camera={{ fov: 38, near: 0.05, far: 30 }}>
    <Study ready={() => continueRender(handle)} />
  </ThreeCanvas>;
};

const KleponStudy = ({ ready }: { ready: () => void }) => {
  const { gl, scene, camera } = useThree();
  const model = useMemo(() => buatCharm('klepon').grup, []);
  camera.position.set(0, 0, 2.95);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  useEffect(() => {
    const timer = window.setTimeout(() => { gl.render(scene, camera); ready(); }, 650);
    return () => window.clearTimeout(timer);
  }, [gl, scene, camera, ready]);
  return <>
    <color attach="background" args={['#d6cbbb']} />
    <ambientLight intensity={1.15} color="#fff3e4" />
    <directionalLight position={[-3, 5, 6]} intensity={2.3} color="#fff0d5" />
    <directionalLight position={[4, -1, 3]} intensity={0.5} color="#d5e5e1" />
    <primitive object={model} />
  </>;
};

const KleponCloseup: React.FC = () => {
  const [handle] = useState(() => delayRender('Klepon closeup'));
  return <ThreeCanvas width={1200} height={1200} camera={{ fov: 38, near: 0.05, far: 30 }}>
    <KleponStudy ready={() => continueRender(handle)} />
  </ThreeCanvas>;
};

const KleponOrbitStudy = ({ ready }: { ready: () => void }) => {
  const frame = useCurrentFrame();
  const { gl, scene, camera } = useThree();
  const model = useMemo(() => buatCharm('klepon').grup, []);
  model.rotation.y = (frame / 72) * Math.PI * 2;
  camera.position.set(0, 0.16, 3.15);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  useEffect(() => {
    const timer = window.setTimeout(() => { gl.render(scene, camera); ready(); }, 100);
    return () => window.clearTimeout(timer);
  }, [gl, scene, camera, frame, ready]);
  return <>
    <color attach="background" args={['#d6cbbb']} />
    <ambientLight intensity={1.15} color="#fff3e4" />
    <directionalLight position={[-3, 5, 6]} intensity={2.3} color="#fff0d5" />
    <directionalLight position={[4, -1, 3]} intensity={0.5} color="#d5e5e1" />
    <primitive object={model} />
  </>;
};

const KleponTurntable: React.FC = () => {
  const [handle] = useState(() => delayRender('Klepon turntable'));
  return <ThreeCanvas width={720} height={720} camera={{ fov: 38, near: 0.05, far: 30 }}>
    <KleponOrbitStudy ready={() => continueRender(handle)} />
  </ThreeCanvas>;
};

registerRoot(() => <>
  <Composition id="CharmDetailLab" component={CharmDetailLab} durationInFrames={1} fps={30} width={1500} height={1500} />
  <Composition id="KleponCloseup" component={KleponCloseup} durationInFrames={1} fps={30} width={1200} height={1200} />
  <Composition id="KleponTurntable" component={KleponTurntable} durationInFrames={72} fps={24} width={720} height={720} />
</>);
