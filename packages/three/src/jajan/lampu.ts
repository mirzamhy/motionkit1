import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const cache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

/** Lampu dasar dan pantulan ruangan untuk adegan Jajan Dulu! (sama dengan versi web). */
export function lampuStandar(scene: THREE.Scene, renderer: THREE.WebGLRenderer, kekuatan = 1) {
  let env = cache.get(renderer);
  if (!env) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    cache.set(renderer, env);
  }
  scene.environment = env;
  scene.environmentIntensity = 0.45 * kekuatan;
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#fff1dc', '#3a2418', 0.9 * kekuatan));
  const kunci = new THREE.DirectionalLight('#fff4e6', 2.2 * kekuatan);
  kunci.position.set(-2.5, 4, 5);
  g.add(kunci);
  const pinggir = new THREE.DirectionalLight('#ffcf94', 1.6);
  pinggir.position.set(3, 2.5, -4);
  g.add(pinggir);
  return g;
}
