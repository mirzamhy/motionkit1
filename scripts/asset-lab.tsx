import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { registerRoot, Composition, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { AnimationMixer } from 'three';

const Fox: React.FC<{ ready: () => void }> = ({ ready }) => {
  const frame = useCurrentFrame();
  const camera = useThree((state) => state.camera);
  camera.lookAt(0, 1, 0);
  camera.updateMatrixWorld();
  const { fps } = useVideoConfig();
  const gltf = useLoader(GLTFLoader, staticFile('Fox.glb'));
  const { gl, scene } = useThree();
  const model = useMemo(() => clone(gltf.scene), [gltf]);
  const mixer = useMemo(() => {
    const result = new AnimationMixer(model);
    const clip = gltf.animations.find((item) => item.name === 'Walk');
    if (!clip) throw new Error('Fox model is missing Walk animation');
    result.clipAction(clip).play();
    return result;
  }, [model, gltf]);
  mixer.setTime(frame / fps);
  model.updateMatrixWorld(true);
  useEffect(() => {
    gl.render(scene, camera);
    ready();
  }, [gl, scene, camera, model, ready, frame]);
  return <primitive object={model} scale={0.02} />;
};

const Preview: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading Fox GLB'));
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  return (
  <ThreeCanvas width={1280} height={720} camera={{ position: [4, 2.3, 6], fov: 35 }}>
    <color attach="background" args={['#263841']} />
    <hemisphereLight args={['#e5f4ff', '#75624b', 2]} />
    <directionalLight position={[3, 5, 4]} intensity={3} />
    <Suspense fallback={null}><Fox ready={ready} /></Suspense>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[200, 200]} /><meshStandardMaterial color="#586451" roughness={1} />
    </mesh>
  </ThreeCanvas>
  );
};

registerRoot(() => <Composition id="AssetLabFox" component={Preview} width={1280} height={720} fps={30} durationInFrames={90} />);
