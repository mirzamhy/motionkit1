import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Easing, interpolate } from 'remotion';
import { C, SERIF } from '../../templates/whatif-sim/style';
import { F, FPS, Shot, weightKg, worldTime } from './timeline';
import { Character, Dog, Hand } from '../../templates/whatif-sim/three/Actors';
import { Grass } from '../../templates/whatif-sim/three/Grass';
import { City, Fountain, Ground, Trees } from '../../templates/whatif-sim/three/Park';
import { rng } from '../../templates/whatif-sim/three/util';

type V3 = [number, number, number];
type Cam = { pos: V3; look: V3; fov: number };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// One camera per shot. Values tuned by eye against the reference frames.
const CAMS: Record<'wide' | 'close' | 'pov' | 'wide2', Cam> = {
  wide: { pos: [0, 1.95, 8.5], look: [0, 1.7, -2], fov: 50 },
  close: { pos: [0.2, 1.25, 2.3], look: [0, 1.45, 0], fov: 50 },
  pov: { pos: [0, 1.62, 0], look: [0.35, 1.15, -8], fov: 58 },
  wide2: { pos: [1.3, 1.35, 10.5], look: [-0.9, 1.7, 0], fov: 50 },
};

/* ---------- Scene 6: the myth ---------- */

const mythRise = (f: number) => {
  const s = Math.max(0, (f - 665) / FPS);
  return Math.pow(s, 1.4) * 0.8; // metres
};

const mythCam = (f: number): Cam => {
  const k = interpolate(f, [640, 860], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const rise = mythRise(f);
  return {
    pos: [0, 1.7 + k * 1.6, 9 + k * 7],
    look: [0, 1.6 + rise * 0.85, 0],
    fov: 50,
  };
};

const PEOPLE: { p: V3; shirt: string; rate: number; spin: number }[] = [
  { p: [-6, 0.08, -8], shirt: '#d9b23a', rate: 0.75, spin: 0.5 },
  { p: [5, 0.08, -10], shirt: '#3c7a4a', rate: 0.9, spin: -0.4 },
  { p: [-3, 0.08, -15], shirt: '#2f5c9a', rate: 1.1, spin: 0.7 },
  { p: [7.5, 0.08, -5], shirt: '#e9e6df', rate: 0.6, spin: -0.6 },
];

const N_DROPS = 500;
const FOUNTAIN_TOP = new THREE.Vector3(-4.5, 1.3, -2.5);

const WaterDrift: React.FC<{ s: number }> = ({ s }) => {
  const { mesh, seeds } = useMemo(() => {
    const r = rng(41);
    const m = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.07),
      new THREE.MeshLambertMaterial({ color: '#a9d2ec', transparent: true, opacity: 0.85 }),
      N_DROPS,
    );
    m.frustumCulled = false;
    const seeds = Array.from({ length: N_DROPS }, () => ({
      birth: r() * 7,
      a: r() * Math.PI * 2,
      spread: 0.2 + r() * 0.5,
      up: 0.9 + r() * 0.9,
      spin: r() * 6,
    }));
    return { mesh: m, seeds };
  }, []);
  const mat = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const one = new THREE.Vector3(1, 1, 1);
  const zero = new THREE.Vector3(0, 0, 0);
  seeds.forEach((d, i) => {
    const age = s - d.birth;
    if (age < 0) {
      mat.compose(FOUNTAIN_TOP, q.identity(), zero);
    } else {
      const p = new THREE.Vector3(
        FOUNTAIN_TOP.x + Math.cos(d.a) * d.spread * age,
        FOUNTAIN_TOP.y + d.up * age + 0.12 * age * age,
        FOUNTAIN_TOP.z + Math.sin(d.a) * d.spread * age,
      );
      e.set(d.spin * age, d.spin * age * 0.7, 0);
      mat.compose(p, q.setFromEuler(e), one);
    }
    mesh.setMatrixAt(i, mat);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

const Myth: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (frame - F.myth) / FPS;
  const rise = mythRise(frame);
  const arms = interpolate(frame, [625, 660], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tilt = Math.max(0, s - 2) * 0.05;
  return (
    <>
      <Character t={s} armLift={arms} p={[0, 0.08 + rise, 0]} r={[tilt, s * 0.08, -tilt * 0.6]} />
      {PEOPLE.map((h, i) => {
        const up = Math.max(0, s - 1.2 - i * 0.3);
        const y = Math.pow(up, 1.4) * 0.8 * h.rate;
        return (
          <Character
            key={i}
            t={s + i}
            shirt={h.shirt}
            armLift={Math.min(1, up)}
            p={[h.p[0], h.p[1] + y, h.p[2]]}
            r={[up * h.spin * 0.4, up * h.spin, up * h.spin * 0.3]}
          />
        );
      })}
      <Dog
        p={[2.6, 0.1 + Math.max(0, mythRise(frame + 12)) * 0.75, -1.2]}
        yaw={2.4 + s * 0.15}
        roll={-Math.max(0, s - 1.5) * 0.35}
        t={1.3}
        stretch={1}
      />
      <WaterDrift s={Math.max(0, s - 0.8)} />
    </>
  );
};

/* ---------- Scene 13: bathroom scale ---------- */

const PLINTH_TOP = 0.08;
const SCALE_TOP = PLINTH_TOP + 0.0775;

const Scale: React.FC<{ kg: number }> = ({ kg }) => {
  const lcd = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas, ctx: canvas.getContext('2d')!, tex };
  }, []);
  const { ctx, tex } = lcd;
  ctx.fillStyle = '#10261f';
  ctx.fillRect(0, 0, 256, 96);
  ctx.fillStyle = '#86f2c4';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  ctx.font = `600 64px ${SERIF}`;
  ctx.fillText(kg.toFixed(1), 186, 52);
  ctx.font = `500 28px ${SERIF}`;
  ctx.textAlign = 'left';
  ctx.fillText('kg', 196, 58);
  tex.needsUpdate = true;
  return (
    <group position={[0, PLINTH_TOP, 0.06]}>
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.56]} />
        <meshLambertMaterial color="#c3c6cb" />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[0.46, 0.025, 0.52]} />
        <meshLambertMaterial color="#24272d" />
      </mesh>
      <mesh position={[0, 0.0785, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 0.075]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

const scaleCam = (shot: Shot, f: number): Cam => {
  if (shot === 'scale1') {
    const k = (f - F.scale) / (F.cutLow - F.scale);
    return { pos: [0.1, 0.78 - 0.06 * k, 1.4 - 0.12 * k], look: [0, 0.3, 0.05], fov: 52 };
  }
  // stand on the plinth edge so the lens isn't buried in grass
  if (shot === 'scale2') return { pos: [0.15, 0.3, 1.02], look: [0, 1.0, 0], fov: 75 };
  return { pos: [0.3, 1.4, 4.7], look: [0.1, 0.9, 0], fov: 50 };
};

/** Dog bounds toward the camera in the last scale shot. */
const jumpingDog = (f: number) => {
  const s = (f - F.cutDog) / FPS;
  const j = Math.max(0, s - 0.35);
  return {
    p: [0.45 - j * 0.05, Math.max(0, 1.5 * j - 0.75 * j * j), 1.3 + j * 1.6] as V3,
    yaw: -Math.PI / 2 + 0.15,
    roll: 0,
    t: f / FPS,
    stretch: j > 0 ? 1 : 0,
  };
};

/* ---------- Scenes 14-15: aerial recap, then glide back to the opening shot ---------- */

const AERIAL: Cam = { pos: [2.0, 9.0, 11.0], look: [0.6, 0, -10], fov: 50 };

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const recapCam = (f: number): Cam => {
  const d = interpolate(f, [F.recap, F.returnStart], [0, 1], clamp);
  const aerial: Cam = { pos: [AERIAL.pos[0], AERIAL.pos[1] - 0.8 * d, AERIAL.pos[2]], look: AERIAL.look, fov: 50 };
  const k = interpolate(f, [F.returnStart, F.end - 1], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return {
    pos: lerp3(aerial.pos, CAMS.wide.pos, k),
    look: lerp3(aerial.look, CAMS.wide.look, k),
    fov: 50,
  };
};

/* ---------- Scenes 1-5: dog choreography ---------- */

const dogPose = (shot: Shot, frame: number) => {
  const t = worldTime(frame);
  if (shot === 'wide2') {
    // Caught mid-leap when gravity went: hangs in the air, turning very slowly.
    const s = (frame - F.cutWide2) / FPS;
    return { p: [-1.5, 1.15 + s * 0.03, 6.0] as V3, yaw: 0.7 + s * 0.02, roll: -0.15 + s * 0.02, t, stretch: 1 };
  }
  const c = shot === 'pov' ? { x: 1.4, z: -4.6, r: 2.0, w: 1.3 } : { x: 2.6, z: -2.2, r: 1.1, w: 0.7 };
  const a = 1.2 + t * c.w;
  const p: V3 = [c.x + Math.cos(a) * c.r, Math.abs(Math.sin(t * 7)) * 0.1, c.z + Math.sin(a) * c.r];
  if (frame >= F.off) p[1] += ((frame - F.off) / FPS) * 0.05;
  // tangent of the circle -> local +x
  const dx = -Math.sin(a);
  const dz = Math.cos(a);
  return { p, yaw: Math.atan2(-dz, dx), roll: 0, t, stretch: 0 };
};

/* ---------- Camera ---------- */

const target = new THREE.Vector3();

// Camera is mutated during render: ThreeCanvas renders once per frame after React commits.
const CameraRig: React.FC<{ cam: Cam; drift: number; t: number }> = ({ cam, drift, t }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(cam.pos[0] + Math.sin(t * 0.25) * drift, cam.pos[1] + Math.sin(t * 1.3) * drift * 0.3, cam.pos[2]);
  camera.lookAt(target.set(...cam.look));
  if (camera.fov !== cam.fov) {
    camera.fov = cam.fov;
    camera.updateProjectionMatrix();
  }
  camera.updateMatrixWorld();
  return null;
};

export const World: React.FC<{ frame: number; shot: Shot }> = ({ frame, shot }) => {
  if (shot === 'none') return null;
  const myth = shot === 'myth';
  const scaleShot = shot === 'scale1' || shot === 'scale2' || shot === 'scale3';
  const recap = shot === 'recap';
  // Recap runs on the opening's clock shifted by the video length, so the last frame loops into frame 0.
  const t = recap ? (frame - F.end) / FPS : scaleShot ? frame / FPS : worldTime(frame);
  const cam = myth
    ? mythCam(frame)
    : scaleShot
      ? scaleCam(shot, frame)
      : recap
        ? recapCam(frame)
        : CAMS[shot as keyof typeof CAMS];
  const drift = recap ? 0 : shot === 'pov' || scaleShot ? 0.006 : 0.04;
  return (
    <>
      <fog attach="fog" args={[C.fog, 8, 120]} />
      <hemisphereLight args={['#e3e9f2', '#3a4826', 1.5]} />
      <directionalLight position={[-12, 22, 10]} intensity={1.7} />
      <CameraRig cam={cam} drift={drift} t={frame / FPS} />
      <Ground />
      <Grass time={myth ? (frame - F.myth) / FPS : t} />
      <City />
      <Trees />
      <Fountain time={t} spray={!myth} />
      {myth ? (
        <Myth frame={frame} />
      ) : scaleShot ? (
        <>
          <Character t={t} p={[0, SCALE_TOP, 0]} />
          <Scale kg={weightKg(frame)} />
          {shot === 'scale3' && <Dog {...jumpingDog(frame)} />}
        </>
      ) : recap ? (
        <>
          <Character t={t} />
          <Dog {...dogPose('wide', frame - F.end)} />
        </>
      ) : (
        <>
          {shot !== 'pov' && <Character t={t} />}
          <Dog {...dogPose(shot, frame)} />
          {shot === 'pov' && <Hand t={t} />}
        </>
      )}
    </>
  );
};
