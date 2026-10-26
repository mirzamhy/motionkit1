// Teaser gaya "ASMR unboxing" Jajan Dulu!, 30 detik, 9:16. Tanpa musik dan narasi: lensa makro di meja gelap,
// satu lampu hangat. Tutup kantong kraft diangkat pelan, ring klepon dijepit dan diangkat keluar, flanelnya diusap.
// Gelombang suara di layar mengikuti bunyi yang sedang terdengar. Satuan dunia charm: 1 unit = 6 cm.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { buatCharm } from '../../../three/src/jajan/charm';
import { buatKantong, KANTONG } from '../../../three/src/jajan/kantong';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { aturTangan, buatTangan, campurPose, kunciJepit, letakkanJepit, POSE } from '../../../three/src/jajan/tubuh';
import { inOut, kf, outE, prog } from './motion';
import { rng } from './kit';
import { Bunyi, BunyiPanjang } from './JajanTeaserLapak';
import { teksturKayu } from './JajanGayaTeaser';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['500'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);
export const ASMR_FRAMES = s(30);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const { H, D } = KANTONG;

// Jadwal (detik)
const T = { tanganTutup: 3.0, jepitTutup: 4.0, angkat: 4.2, lepasTutup: 8.0, intip: 9.6, tanganRing: 12.0, klik: 13.0, naik: 13.3, usap: 21.4, akhir: 25.5 } as const;

/** Bunyi yang terdengar: [mulai, lama, kekuatan], dipakai juga untuk gelombang suara di layar. */
const BUNYI: [number, number, number][] = [
  [4.2, 3.8, 0.7],
  [13.0, 0.25, 1],
  [13.05, 1.0, 0.6],
  [14.0, 0.25, 0.5],
  [21.4, 3.0, 0.55],
  [25.6, 2.5, 0.6],
];
const kekuatan = (f: number) =>
  BUNYI.reduce((m, [a, l, k]) => Math.max(m, prog(f, s(a), s(a) + 6) * (1 - prog(f, s(a + l) - 10, s(a + l))) * k), 0.06);

/** Interpolasi jalur kamera per komponen dengan kunci [detik, posisi, sasaran, fov]. */
type Kunci = [number, [number, number, number], [number, number, number], number];
function jalur(t: number, kunci: Kunci[]) {
  const n = (i: number, c: number) => kf(t, kunci.map((k) => [s(k[0]), i === 0 ? k[1][c] : i === 1 ? k[2][c] : k[3]] as [number, number]));
  return { p: V(n(0, 0), n(0, 1), n(0, 2)), l: V(n(1, 0), n(1, 1), n(1, 2)), fov: n(2, 0) };
}
const KAMERA: Kunci[] = [
  [0, [1.3, 2.4, 6.0], [0, 1.4, 0], 30],
  [4.0, [-1.4, 2.8, 4.5], [0, 1.75, 0.2], 28],
  [8.0, [-1.1, 3.0, 4.2], [0, 1.9, 0.1], 28],
  [10.8, [0.4, 4.4, 2.3], [0, 1.6, 0], 30],
  [13.0, [0.6, 3.7, 2.8], [0, 2.2, 0], 30],
  [16.2, [1.0, 2.9, 3.3], [0, 2.55, 0.1], 26],
  [20.8, [-1.0, 2.8, 3.2], [0, 2.5, 0.1], 26],
  [25.0, [0.3, 2.7, 3.0], [0, 2.45, 0.2], 24],
  [30.0, [1.8, 2.8, 7.0], [0, 2.1, 0], 32],
];

const Adegan: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  const isi = useMemo(() => {
    const g = new THREE.Group();
    lampuStandar(scene, gl, 0.6);
    scene.environmentIntensity = 0.12;
    scene.background = new THREE.Color('#0E0906');
    const kayu = teksturKayu();
    const meja = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: kayu, color: '#5A4030', roughness: 0.55 }));
    meja.rotation.x = -Math.PI / 2;
    meja.receiveShadow = true;
    g.add(meja);
    const kantong = buatKantong();
    kantong.grup.rotation.y = 0.3;
    g.add(kantong.grup);
    const klepon = buatCharm('klepon');
    // sedikit lebih kecil dari lebar dalam kantong supaya tidak menembus dinding kertas
    klepon.grup.scale.setScalar(0.85);
    g.add(klepon.grup);
    const kotak = new THREE.Box3().setFromObject(klepon.grup);
    const atasRing = kotak.max.y;
    const tangan = buatTangan(1, { skala: 1.6, kulit: '#C98E66', lenganBaju: '#2E3A4A' });
    const tanganKiri = buatTangan(-1, { skala: 1.6, kulit: '#C98E66', lenganBaju: '#2E3A4A' });
    g.add(tangan.akar, tanganKiri.akar);
    const lampu = new THREE.SpotLight('#FFC88A', 140, 24, 0.42, 0.75, 1.4);
    lampu.castShadow = true;
    lampu.shadow.mapSize.set(2048, 2048);
    lampu.shadow.bias = -0.0005;
    const tepi = new THREE.DirectionalLight('#8FB0FF', 0.7);
    tepi.position.set(4, 3, -5);
    g.add(lampu, lampu.target, tepi, new THREE.AmbientLight('#3A2A20', 0.22));
    g.traverse((m) => ((m as THREE.Mesh).isMesh ? ((m as THREE.Mesh).castShadow = true) : null));
    meja.castShadow = false;
    return { g, kantong, klepon, atasRing, tangan, tanganKiri, lampu };
  }, [gl, scene]);

  // ---- tutup kantong diangkat pelan oleh jari yang menjepit lidahnya
  const buka = prog(t, s(T.angkat), s(T.lepasTutup), inOut) * 0.62;
  isi.kantong.setBuka(buka);
  isi.kantong.setCahaya(prog(t, s(7.0), s(10.5), inOut) * 0.8);
  isi.kantong.grup.updateMatrixWorld(true);
  const sudut = buka * THREE.MathUtils.degToRad(208);
  const lidah = isi.kantong.grup.localToWorld(V(0, H - 0.12 * Math.cos(sudut) + (D + 0.03) * Math.sin(sudut), -D / 2 + 0.12 * Math.sin(sudut) + (D + 0.03) * Math.cos(sudut)));

  // ---- klepon: di dalam kantong (ring di dekat mulut), lalu diangkat keluar dari ring-nya dan berayun pelan
  const naik = prog(t, s(T.naik), s(15.8), inOut);
  const titikRing = isi.kantong.grup.localToWorld(V(0, H - 0.25, 0)).add(V(0, naik * 1.55, naik * 0.2));
  const ayun = naik * Math.sin(t / 34) * 0.08;
  titikRing.x += ayun * 0.4;
  isi.klepon.grup.position.copy(titikRing).add(V(0, -(isi.atasRing - 0.07), 0));
  isi.klepon.grup.rotation.set(0, -0.4 + Math.sin(t / 60) * 0.15 * naik, ayun);
  const pusatBadan = isi.klepon.grup.position.clone().add(V(0, -0.24, 0));

  // ---- tangan kanan: pegang lidah tutup (3-8,6 s), lalu jepit ring (12-30 s)
  const tutupDatang = prog(t, s(T.tanganTutup), s(T.jepitTutup), outE) * (1 - prog(t, s(T.lepasTutup + 0.4), s(T.lepasTutup + 1.4), inOut));
  const tutupJepit = prog(t, s(T.jepitTutup - 0.25), s(T.jepitTutup), inOut) * (1 - prog(t, s(T.lepasTutup), s(T.lepasTutup + 0.3), inOut));
  const ringDatang = prog(t, s(T.tanganRing), s(T.klik), outE);
  const ringJepit = prog(t, s(T.klik - 0.25), s(T.klik), inOut);
  const tahapRing = t >= s(T.tanganRing - 0.5);
  const jepit = tahapRing ? ringJepit : tutupJepit;
  aturTangan(isi.tangan, campurPose(POSE.rileks, POSE.jepit, jepit));
  kunciJepit(isi.tangan, jepit);
  const jauh = V(2.6, 4.2, 2.4);
  if (tahapRing) letakkanJepit(isi.tangan, jauh.clone().lerp(titikRing, ringDatang), V(-0.25, -1, 0.3), -1.9);
  else letakkanJepit(isi.tangan, jauh.clone().lerp(lidah, tutupDatang), V(-0.9, -0.35, -0.25), -1.2);
  isi.tangan.akar.visible = t > s(T.tanganTutup - 0.2) && (t < s(T.lepasTutup + 1.5) || t > s(T.tanganRing - 0.4));

  // ---- tangan kiri: ujung jari mengusap permukaan flanel dari kiri ke kanan
  const usapDatang = prog(t, s(T.usap - 0.8), s(T.usap), outE) * (1 - prog(t, s(T.usap + 3.2), s(T.usap + 4.0), inOut));
  const usap = prog(t, s(T.usap), s(T.usap + 3.0), inOut);
  isi.tanganKiri.akar.visible = usapDatang > 0.001;
  if (isi.tanganKiri.akar.visible) {
    aturTangan(isi.tanganKiri, campurPose(POSE.rileks, POSE.terbuka, 0.6));
    const sentuh = pusatBadan.clone().add(V(-0.28 + usap * 0.5, 0.04 + Math.sin(usap * Math.PI) * 0.05, 0.43));
    const target = V(-2.6, 3.4, 2.0).lerp(sentuh, usapDatang);
    letakkanJepit(isi.tanganKiri, target, V(0.75, -0.35, -0.55), 1.3);
    // geser supaya yang menyentuh adalah ujung telunjuk, bukan titik jepit
    const ujung = isi.tanganKiri.ujungTelunjuk.getWorldPosition(V(0, 0, 0));
    isi.tanganKiri.akar.position.add(target.clone().sub(ujung));
  }

  // ---- lampu mengikuti benda yang sedang disorot
  const sorot = t < s(T.intip) ? V(0, 1.8, 0.2) : t < s(T.naik) ? V(0, 1.7, 0) : pusatBadan;
  isi.lampu.target.position.copy(sorot);
  isi.lampu.position.copy(sorot).add(V(-2.4, 6, 2.6));

  const k = jalur(t, KAMERA);
  camera.position.copy(k.p);
  camera.lookAt(k.l);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = k.fov;
  cam.updateProjectionMatrix();
  gl.toneMappingExposure = 1.05;
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------

const Gelombang: React.FC<{ t: number }> = ({ t }) => {
  const a = kekuatan(t);
  const R = rng(Math.floor(t / 3) + 5);
  return (
    <div style={{ position: 'absolute', left: 250, right: 250, bottom: 190, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.9 }}>
      {Array.from({ length: 30 }, (_, i) => {
        const tengah = 1 - Math.abs(i - 14.5) / 15;
        return <div key={i} style={{ width: 7, borderRadius: 4, background: 'rgba(255,220,170,0.85)', height: 6 + (R() * 0.6 + 0.4) * a * 84 * (0.4 + 0.6 * tengah) }} />;
      })}
    </div>
  );
};

const Keterangan: React.FC<{ t: number; dari: number; sampai: number; teks: string }> = ({ t, dari, sampai, teks }) => {
  if (t < s(dari) || t > s(sampai)) return null;
  const o = prog(t, s(dari), s(dari) + 18) * (1 - prog(t, s(sampai) - 18, s(sampai)));
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 320, textAlign: 'center', fontFamily: gochi.fontFamily, fontSize: 72, color: '#FFF4E6', opacity: o, textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>{teks}</div>;
};

const Penutup: React.FC<{ t: number }> = ({ t }) => {
  if (t < s(T.akhir)) return null;
  const a = s(T.akhir);
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 230, fontFamily: bagel.fontFamily, fontSize: 120, color: '#FFF4E0', opacity: prog(t, a, a + 30), textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>Jajan Dulu!</div>
      <div style={{ marginTop: 14, fontFamily: gochi.fontFamily, fontSize: 56, color: '#FFE2B8', opacity: prog(t, a + 30, a + 55) }}>klepon · 1 dari 6</div>
      <div style={{ position: 'absolute', bottom: 120, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 34, color: 'rgba(255,240,220,0.85)', opacity: prog(t, a + 55, a + 80) }}>Flanel dijahit tangan · Segera · Pre-order via WA</div>
    </AbsoluteFill>
  );
};

const Suara: React.FC = () => (
  <>
    {/* ruangan sunyi: hanya dengung ruang sangat tipis */}
    <BunyiPanjang file="room" dari={0} lama={s(30)} durasiFile={8} vol={(f) => 0.05 * prog(f, 0, s(1.5)) * (1 - prog(f, s(28.5), s(30)))} />
    {/* kertas kraft: lidah tutup terkelupas pelan */}
    <Bunyi file="scratch" dari={s(T.angkat)} lama={s(3.8)} vol={(f) => 0.55 * prog(f, 0, s(0.4)) * (1 - prog(f, s(3.2), s(3.8)))} />
    <Bunyi file="cloth" dari={s(T.angkat + 0.5)} lama={s(2.2)} vol={0.25} />
    <Bunyi file="knock" dari={s(T.lepasTutup + 0.1)} lama={s(0.3)} vol={0.2} />
    {/* ring pegas dibuka dan dijepit */}
    <Bunyi file="tick" dari={s(T.klik)} lama={s(0.2)} vol={1} />
    <Bunyi file="ping" dari={s(T.klik + 0.05)} lama={s(1.2)} vol={0.45} />
    <Bunyi file="tick" dari={s(14.0)} lama={s(0.2)} vol={0.6} />
    {/* kain flanel bergesek saat klepon keluar dari kantong */}
    <Bunyi file="cloth" dari={s(T.naik + 0.4)} lama={s(2.2)} vol={0.3} />
    {/* jari mengusap flanel */}
    <Bunyi file="cloth" dari={s(T.usap)} lama={s(2.2)} vol={0.55} />
    <Bunyi file="cloth" dari={s(T.usap + 1.4)} lama={s(2.0)} vol={0.4} />
    <Bunyi file="chime" dari={s(T.akhir + 0.2)} lama={s(3)} vol={0.4} />
  </>
);

export const TeaserAsmr: React.FC<{ sfx?: boolean }> = ({ sfx = false }) => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font asmr'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#0E0906' }} />;
  const gelap = Math.max(1 - prog(t, s(0.3), s(1.8), inOut), prog(t, s(29.3), s(30)));
  return (
    <AbsoluteFill style={{ background: '#0E0906' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 30, near: 0.02, far: 200 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(8,5,3,0.7) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 30, color: 'rgba(255,240,220,0.7)', letterSpacing: 6, opacity: 1 - prog(t, s(T.akhir - 1), s(T.akhir)) }}>PAKAI EARPHONE</div>
      <Keterangan t={t} dari={4.4} sampai={8.2} teks="sreeek..." />
      <Keterangan t={t} dari={13.0} sampai={14.8} teks="klik." />
      <Keterangan t={t} dari={21.6} sampai={24.6} teks="lembut..." />
      <Gelombang t={t} />
      <Penutup t={t} />
      <AbsoluteFill style={{ background: '#000', opacity: gelap }} />
      {sfx && <Suara />}
    </AbsoluteFill>
  );
};
