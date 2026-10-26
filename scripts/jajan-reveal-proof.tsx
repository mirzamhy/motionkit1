import React, { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { Composition, continueRender, delayRender, registerRoot, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { buatCharm, type CharmId } from '../packages/three/src/jajan/charm';
import { aturTangan, buatTangan, POSE } from '../packages/three/src/jajan/tubuh';
import { buatTampahDaun } from '../packages/core/src/scenes/JajanTeaserLapak';
import { teksturAnyam, teksturDaun } from '../packages/core/src/scenes/JajanLapak';

const ease = (f: number, a: number, b: number) => {
  const u = THREE.MathUtils.clamp((f - a) / (b - a), 0, 1);
  return u * u * (3 - 2 * u);
};
const mat = (color: string, roughness = 0.86) => new THREE.MeshStandardMaterial({ color, roughness });
const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

function makeCover() {
  const cover = new THREE.Group();
  const shape = [
    [0.7, 0], [0.69, 0.07], [0.66, 0.2], [0.58, 0.33], [0.45, 0.43],
    [0.26, 0.49], [0.07, 0.51], [0, 0.51],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(new THREE.SplineCurve(shape).getPoints(48), 96);
  const woven = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: teksturAnyam(), side: THREE.DoubleSide, roughness: 0.9 }));
  woven.castShadow = true;
  woven.receiveShadow = true;
  cover.add(woven);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.026, 12, 96), mat('#80552c'));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.015;
  cover.add(rim);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.069, 24, 16), mat('#694328'));
  knob.scale.y = 0.82;
  knob.position.y = 0.56;
  knob.castShadow = true;
  cover.add(knob);
  return cover;
}

function makeTray() {
  const tray = buatTampahDaun(0.73);
  tray.position.set(0, 1.085, 0);
  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.645, 64), new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.72, side: THREE.DoubleSide }));
  leaf.rotation.x = -Math.PI / 2;
  leaf.position.y = 0.005;
  leaf.receiveShadow = true;
  tray.add(leaf);
  const ids: CharmId[] = ['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'];
  ids.forEach((id, i) => {
    const angle = i * Math.PI / 3 - Math.PI / 2;
    const charm = buatCharm(id).grup;
    charm.rotation.x = -Math.PI / 2;
    charm.rotation.z = angle + Math.PI / 2;
    charm.scale.setScalar(0.28);
    const item = new THREE.Group();
    item.add(charm);
    const bounds = new THREE.Box3().setFromObject(charm);
    charm.position.y = -bounds.min.y + 0.012;
    item.position.set(Math.cos(angle) * 0.415, 0.01, Math.sin(angle) * 0.415);
    tray.add(item);
  });
  // The sixth area is opaque fabric. No secret model or recognisable silhouette is instantiated.
  const sixth = new THREE.Group();
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.32), mat('#49453e'));
  cloth.rotation.y = 0.3;
  cloth.position.y = 0.03;
  cloth.castShadow = true;
  sixth.add(cloth);
  const fold = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.008, 0.03), mat('#3c3933'));
  fold.rotation.y = 0.3;
  fold.position.y = 0.045;
  sixth.add(fold);
  sixth.position.set(Math.cos(5 * Math.PI / 3 - Math.PI / 2) * 0.415, 0.01, Math.sin(5 * Math.PI / 3 - Math.PI / 2) * 0.415);
  tray.add(sixth);
  return tray;
}

function makeWorld() {
  const world = new THREE.Group();
  const floor = box(8, 0.08, 8, '#a19a85', 0, -0.045, 0);
  const counter = box(2.4, 0.14, 3, '#9e7448', 0, 0.955, -0.55);
  world.add(floor, counter);
  for (let i = 0; i < 15; i++) world.add(box(0.147, 0.77, 0.035, i % 3 === 0 ? '#7d5938' : '#916b43', -1.06 + i * 0.151, 0.51, 0.955));
  const cloth = box(0.64, 0.012, 0.64, '#547844', 0, 1.035, 0);
  world.add(cloth);
  for (const side of [-1, 1]) {
    world.add(box(0.09, 2.6, 0.09, '#765234', side * 1.13, 1.34, -1.65));
  }
  world.add(box(2.34, 0.12, 0.13, '#765234', 0, 2.57, -1.65));
  world.add(box(2.4, 0.08, 0.62, '#887051', 0, 2.69, -1.72));
  const tray = makeTray();
  world.add(tray);
  const cover = makeCover();
  cover.position.set(0, 1.1, 0);
  world.add(cover);

  // Food props belong to the neighbouring plate, so this remains one market counter.
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 40), mat('#b7b8ad', 0.48));
  plate.position.set(-0.85, 1.045, -0.11);
  world.add(plate);
  for (let i = 0; i < 3; i++) {
    const pastry = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.17, 8, 16), mat(i === 2 ? '#ba783a' : '#c9904d'));
    pastry.rotation.z = Math.PI / 2;
    pastry.position.set(-1.01 + i * 0.15, 1.09, -0.12 + (i % 2) * 0.09);
    pastry.castShadow = true;
    world.add(pastry);
  }

  const hand = new THREE.Group();
  const grip = buatTangan(1, { kulit: '#bc8769', lenganBaju: '#677a5b', lengan: 1.7, skala: 0.18 });
  aturTangan(grip, POSE.jepit);
  grip.akar.position.set(0.3, 0.6, 0);
  grip.akar.rotation.z = Math.PI - 0.45;
  hand.add(grip.akar);
  world.add(hand);
  return { world, cover, hand };
}

const Scene = ({ ready }: { ready: () => void }) => {
  const frame = useCurrentFrame();
  const { gl, scene, camera } = useThree();
  const { world, cover, hand } = useMemo(makeWorld, []);
  const lift = ease(frame, 80, 260);
  const top = ease(frame, 260, 540);
  cover.position.set(1.8 * lift, 1.1 + 1.18 * lift, 0);
  cover.rotation.z = -0.28 * lift;
  hand.position.set(cover.position.x - 0.1, cover.position.y + 0.45, 0);
  hand.visible = frame >= 20 && frame < 390;
  const perspective = new THREE.Vector3(1.2, 1.85, 3.2);
  const overhead = new THREE.Vector3(0, 4.55, 0.001);
  camera.position.copy(perspective.lerp(overhead, top));
  camera.lookAt(new THREE.Vector3(0, 1.15, 0));
  camera.updateMatrixWorld();
  useEffect(() => { gl.render(scene, camera); ready(); }, [gl, scene, camera, frame, ready]);
  return <>
    <primitive object={world} />
    <color attach="background" args={['#c9c2aa']} />
    <ambientLight intensity={1.2} color="#ecdfc4" />
    <directionalLight position={[-2, 5, 3]} intensity={2.5} color="#ffe1a8" castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02} />
    <directionalLight position={[2, 4, -2]} intensity={0.65} color="#a9c3c3" />
  </>;
};

const RevealProof: React.FC = () => {
  const [handle] = useState(() => delayRender('Jajan reveal proof'));
  return <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: 50, near: 0.05, far: 50 }}>
    <Scene ready={() => continueRender(handle)} />
  </ThreeCanvas>;
};

registerRoot(() => <Composition id="JajanRevealProof" component={RevealProof} durationInFrames={660} fps={60} width={1080} height={1920} />);
