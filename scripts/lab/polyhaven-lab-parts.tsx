// Shared parts of the Poly Haven lab (no registerRoot). Lab for wave 2 (Poly Haven CC0 via `mk asset polyhaven get`): the six market models side by side on a 10 cm grid,
// to check scale, orientation and materials before they go on a stall. The scale bar is 50 cm.
// npx remotion still scripts/lab/polyhaven-lab.tsx PolyhavenLineup out/repo-lab/ph-lineup.png --public-dir=projects/vendor-action/public --gl=angle
import React, { useEffect, useState } from 'react';
import { staticFile } from 'remotion';
import { useLoader, useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export const PH = ['bananas', 'food_ginger_01', 'food_lime_01', 'yellow_onion', 'sweet_potato', 'wooden_cutting_board'] as const;
export const phUrl = (id: string) => staticFile(`polyhaven/${id}/${id}_1k.gltf`);

/** a Poly Haven model placed with its base on y = 0 and centred on x/z; reports its measured size once */
export const PhModel = ({ id, position = [0, 0, 0], rotation = 0, scale = 1, onSize, only, url }: { id: string; position?: [number, number, number]; rotation?: number; scale?: number; onSize?: (s: Vector3) => void; only?: string; url?: string }) => {
  const gltf = useLoader(GLTFLoader, url ?? phUrl(id));
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

export const Ready = ({ ready, look }: { ready: () => void; look: [number, number, number] }) => {
  const { gl, scene, camera } = useThree();
  camera.lookAt(...look); camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, ready]);
  return null;
};

