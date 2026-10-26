import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { registerRoot, Composition, staticFile, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Vector3, Mesh } from 'three';

type View = 'overview' | 'front' | 'detail';
const Building: React.FC<{ ready: () => void; view: View }> = ({ ready, view }) => {
  const source = useLoader(GLTFLoader, staticFile('outpost.glb'));
  const { camera, gl, scene } = useThree();
  const model = useMemo(() => {
    const root = source.scene.clone(true);
    root.traverse((node) => { if (node instanceof Mesh) { node.castShadow = true; node.receiveShadow = true; } });
    const bounds = new Box3().setFromObject(root);
    const center = bounds.getCenter(new Vector3());
    root.position.set(-center.x, -bounds.min.y, -center.z);
    return { root, size: bounds.getSize(new Vector3()) };
  }, [source]);
  const distance = Math.max(model.size.x, model.size.z);
  const target = new Vector3(0, model.size.y * 0.35, 0);
  if (view === 'front') camera.position.set(0, model.size.y * 0.9, distance * 1.7);
  else if (view === 'detail') {
    target.set(model.size.x * 0.2, model.size.y * 0.3, model.size.z * 0.2);
    camera.position.set(distance * 0.6, model.size.y * 0.85, distance * 0.7);
  } else camera.position.set(distance * 1.15, distance * 0.8, distance * 1.3);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, model, ready, view]);
  return <primitive object={model.root} />;
};

const Preview: React.FC<{ view?: View }> = ({ view = 'overview' }) => {
  const [handle] = useState(() => delayRender('Building GLB'));
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  return <ThreeCanvas width={1600} height={1000} shadows camera={{ fov: 36, near: 0.1, far: 1000 }}>
    <color attach="background" args={['#c0cbd0']} />
    <hemisphereLight args={['#eff7ff', '#746951', 1.4]} />
    <directionalLight position={[15, 24, 12]} intensity={3} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35} shadow-camera-far={100} shadow-bias={-0.0003} />
    <Suspense fallback={null}><Building ready={ready} view={view} /></Suspense>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} /><meshStandardMaterial color="#9b9d8b" roughness={1} />
    </mesh>
  </ThreeCanvas>;
};
registerRoot(() => <>{(['overview', 'front', 'detail'] as const).map((view) => <Composition key={view} id={`Building-${view}`} component={Preview} defaultProps={{ view }} width={1600} height={1000} fps={30} durationInFrames={1} />)}</>);
