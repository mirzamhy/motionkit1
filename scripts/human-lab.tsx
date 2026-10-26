import React, { Suspense, useMemo, useEffect, useState } from 'react';
import { registerRoot, Composition, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { AnimationMixer, Box3, Vector3, Mesh, MeshStandardMaterial } from 'three';

const Human: React.FC<{ ready: () => void }> = ({ ready }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { camera, gl, scene } = useThree();
  const gltf = useLoader(GLTFLoader, staticFile('CesiumMan.glb'));
  const subject = useMemo(() => {
    const model = clone(gltf.scene);
    // Replace branded texture with a neutral surface for the rig test.
    model.traverse((node) => {
      if (node instanceof Mesh) {
        node.material = new MeshStandardMaterial({ color: '#bd9475', roughness: 0.85 });
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = 1.8 / size.y;
    const mixer = new AnimationMixer(model);
    if (!gltf.animations[0]) throw new Error('Human asset has no animation clip');
    mixer.clipAction(gltf.animations[0]).play();
    return { model, mixer, scale, offset: [-center.x * scale, -bounds.min.y * scale, -center.z * scale] as [number, number, number] };
  }, [gltf]);
  subject.mixer.setTime(frame / fps);
  subject.model.updateMatrixWorld(true);
  camera.lookAt(0, 0.9, 0);
  camera.updateMatrixWorld();
  useEffect(() => {
    gl.render(scene, camera);
    ready();
  }, [gl, scene, camera, ready, frame, subject]);
  return <group position={subject.offset}><primitive object={subject.model} scale={subject.scale} /></group>;
};

const Preview: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading human rig'));
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  return <ThreeCanvas width={1280} height={720} shadows camera={{ position: [2.4, 1.6, 4], fov: 32 }}>
    <color attach="background" args={['#24323d']} />
    <hemisphereLight args={['#dcecff', '#343b45', 1.3]} />
    <directionalLight position={[3, 5, 4]} intensity={3} castShadow shadow-mapSize={[2048, 2048]} />
    <directionalLight position={[-3, 2, -2]} intensity={2} color="#95cfff" />
    <Suspense fallback={null}><Human ready={ready} /></Suspense>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} /><meshStandardMaterial color="#46515b" roughness={1} />
    </mesh>
  </ThreeCanvas>;
};

registerRoot(() => <Composition id="AssetLabHuman" component={Preview} width={1280} height={720} fps={30} durationInFrames={90} />);
