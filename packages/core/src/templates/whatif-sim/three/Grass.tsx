import React, { useMemo } from 'react';
import * as THREE from 'three';
import { rng } from './util';

// Keep-outs: stone plinth under the character, fountain.
const HOLES: { x: number; z: number; r: number }[] = [
  { x: 0, z: 0, r: 1.15 },
  { x: -4.5, z: -2.5, r: 1.4 },
];

const bladeGeometry = () => {
  const g = new THREE.BufferGeometry();
  // 3-triangle tapered blade, height 1, bends toward +z at the tip.
  const v = new Float32Array([
    -0.035, 0, 0, 0.035, 0, 0, -0.024, 0.5, 0.03, 0.024, 0.5, 0.03, 0, 1, 0.1,
  ]);
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
  const n = new Float32Array(15);
  for (let i = 0; i < 5; i++) n.set([0, 1, 0], i * 3); // lit like the ground: stylised, no blade flicker
  g.setAttribute('normal', new THREE.BufferAttribute(n, 3));
  return g;
};

export const useGrass = () =>
  useMemo(() => {
    const uTime = { value: 0 };
    const mat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
    mat.onBeforeCompile = (s) => {
      s.uniforms.uTime = uTime;
      s.vertexShader = s.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying float vH;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vH = position.y;
          vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
          float sway = sin(uTime * 1.6 + ip.x * 0.7 + ip.z * 0.5) * 0.10 + sin(uTime * 3.1 + ip.x * 1.9) * 0.03;
          transformed.x += sway * position.y * position.y;
          transformed.z += sway * 0.5 * position.y * position.y;`,
        );
      s.fragmentShader = s.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vH;')
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(0.5, 1.15, vH);');
    };

    const r = rng(7);
    const zones = [
      { n: 130000, x0: -11, x1: 11, z0: -17, z1: 11 }, // dense around the action
      { n: 60000, x0: -32, x1: 32, z0: -32, z1: 12 }, // far field
    ];
    const total = zones.reduce((a, z) => a + z.n, 0);
    const mesh = new THREE.InstancedMesh(bladeGeometry(), mat, total);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    let i = 0;
    for (const zn of zones) {
      for (let k = 0; k < zn.n; k++) {
        const x = zn.x0 + r() * (zn.x1 - zn.x0);
        const z = zn.z0 + r() * (zn.z1 - zn.z0);
        if (HOLES.some((h) => (x - h.x) ** 2 + (z - h.z) ** 2 < h.r * h.r)) {
          m.makeScale(0, 0, 0);
        } else {
          e.set((r() - 0.5) * 0.5, r() * Math.PI * 2, (r() - 0.5) * 0.5);
          q.setFromEuler(e);
          const h = 0.3 + r() * 0.45;
          const w = 0.8 + r() * 0.8;
          m.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(w, h, w));
        }
        mesh.setMatrixAt(i, m);
        col.setHSL(0.21 + r() * 0.06, 0.42 + r() * 0.18, 0.2 + r() * 0.16, THREE.SRGBColorSpace);
        mesh.setColorAt(i, col);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    return { mesh, uTime };
  }, []);

export const Grass: React.FC<{ time: number }> = ({ time }) => {
  const { mesh, uTime } = useGrass();
  uTime.value = time;
  return <primitive object={mesh} />;
};
