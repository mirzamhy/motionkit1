// Bingkai kunci teaser v5 "Di Bawah Tudung Saji" versi misterius (±40 detik), satu frame per bingkai.
// Memakai dunia pasar teaser v4 (Dunia) dengan malam 04.30, lampu petromaks, dan charm flanel lembar desain v2
// yang berdiri melingkar di bawah tudung. Charm tidak pernah diperlihatkan utuh: hanya kilasan lewat anyaman
// dan bayangan di terpal. Bingkai 7-8 di luar dunia pasar: kantong kraft di gelap dan kartu logo.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { buatKantong } from '../../../three/src/jajan/kantong';
import { labelSiap } from '../../../three/src/jajan/tekstur';
import { Dunia, type KunciV5, type Pose } from './JajanTeaserTudung';
import { Bunyi, BunyiPanjang } from './JajanTeaserLapak';
import logoUrl from '../../../three/src/jajan/logo-jajandulu.webp';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const K = (p: [number, number, number], l: [number, number, number], fov: number, roll = 0) => ({ p: V(...p), l: V(...l), fov, roll });

type Bingkai =
  | { jenis: 'dunia'; detik: string; kunci: KunciV5; teks?: string; bisik?: string }
  | { jenis: 'kantong'; detik: string; teks?: string }
  | { jenis: 'logo'; detik: string; bisik: string };

// Tampah di (12; 8,455; -6), meja lapak x 9-15, penjual di x 17,2 menghadap jalan (-X), terpal di y 24.
const BINGKAI: Bingkai[] = [
  { jenis: 'dunia', detik: '0-5', teks: 'PASAR LAMA, 04.30', kunci: { detik: 2, gelap: 1, dalam: 0, kamera: K([-2.5, 5, 16], [6, 9, -14], 46) } },
  { jenis: 'dunia', detik: '5-11', kunci: { detik: 8.4, gelap: 1, dalam: 6, kamera: K([0.5, 12.5, -1], [13, 9.2, -9.5], 44) } },
  { jenis: 'dunia', detik: '11-15', teks: 'klik.', kunci: { detik: 16, gelap: 1, dalam: 70, kamera: K([4.2, 9.4, -2.2], [12, 9.6, -6], 40) } },
  { jenis: 'dunia', detik: '15-20', bisik: '"Yang itu… nggak dijual."', kunci: { detik: 25.1, gelap: 1, dalam: 60, kamera: K([3.5, 14.5, -7.5], [14, 10.5, -6], 42) } },
  { jenis: 'dunia', detik: '20-24', kunci: { detik: 20, gelap: 1, dalam: 140, angkat: 0.3, petromaks: 0.15, kamera: K([7.6, 8.62, -5.3], [12, 8.66, -6.2], 21) } },
  { jenis: 'dunia', detik: '24-28', kunci: { detik: 20, gelap: 1, dalam: 1400, rendah: true, petromaks: 0, kamera: K([9.6, 11.2, -10.6], [12, 24, -6.2], 82) } },
  { jenis: 'dunia', detik: '28-32', kunci: { detik: 26.3, gelap: 1, dalam: 520, angkat: 0.35, petromaks: 0.3, kamera: K([5.2, 8.9, -3.6], [12, 9.2, -6], 38) } },
  // tudung jatuh menutup lagi, kamera mundur ke tengah lorong: lampu sudah padam, tinggal tudung yang berdenyut
  { jenis: 'dunia', detik: '32-37', kunci: { detik: 22, gelap: 1, dalam: 420, petromaks: 0, pendar: 2.4, kamera: K([0, 34, 30], [7, 5, -14], 52) } },
  { jenis: 'kantong', detik: '37-41' },
  { jenis: 'logo', detik: '41-44', bisik: '"Berani buka?"' },
];

export const TEASER_MISTERI_FRAMES = BINGKAI.length;

const KantongGelap: React.FC<{ maju?: number; sorot?: number }> = ({ maju = 0, sorot: terang = 1 }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  const g = useMemo(() => {
    const g = new THREE.Group();
    scene.background = new THREE.Color('#0B0908');
    const k = buatKantong();
    k.setBuka(0);
    k.setCahaya(0);
    g.add(k.grup);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: '#1A1512', roughness: 0.9 }));
    lantai.rotation.x = -Math.PI / 2;
    lantai.receiveShadow = true;
    g.add(lantai);
    const sorot = new THREE.SpotLight('#FFD9A8', 90, 20, 0.33, 0.7, 1.4);
    sorot.position.set(-1.2, 6, 2.2);
    sorot.target.position.set(0, 0.9, 0);
    sorot.castShadow = true;
    sorot.shadow.mapSize.set(2048, 2048);
    g.add(sorot, sorot.target);
    const pinggir = new THREE.DirectionalLight('#8FA4C8', 0.35);
    pinggir.position.set(4, 3, -4);
    g.add(pinggir, new THREE.HemisphereLight('#3a3040', '#000000', 0.15));
    k.grup.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = true) : null));
    return { g, sorot };
  }, [gl, scene]);
  // logo label dimuat asinkron: tahan frame sampai logo tergambar, lalu gambar ulang kanvas
  const { advance } = useThree();
  useEffect(() => {
    const h = delayRender('label kantong');
    labelSiap().then(() => {
      advance(performance.now());
      continueRender(h);
    });
  }, [advance]);
  g.sorot.intensity = 90 * terang;
  camera.position.set(0.9 - 0.25 * maju, 1.4 - 0.1 * maju, 6.6 - 1.4 * maju);
  camera.lookAt(0, 0.9, 0);
  (camera as THREE.PerspectiveCamera).fov = 34;
  camera.updateProjectionMatrix();
  return <primitive object={g.g} />;
};

const gaya = {
  judul: { fontFamily: bagel.fontFamily, color: '#F6E7C8', letterSpacing: 6, textAlign: 'center' as const },
  bisik: { fontFamily: poppins.fontFamily, fontStyle: 'italic' as const, color: '#EADCC6', textAlign: 'center' as const },
};

/** Vinyet gelap dan butiran halus seperti film. */
const Grade: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 38%, rgba(6,4,3,0.55) 78%, rgba(4,3,2,0.85) 100%)', pointerEvents: 'none' }} />
);

export const TeaserMisteriFrame: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = BINGKAI[Math.min(f, BINGKAI.length - 1)];
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font teaser misteri'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#0B0908' }} />;
  return (
    <AbsoluteFill style={{ background: '#0B0908' }}>
      {b.jenis === 'dunia' && (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.05, far: 1500 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
          <Dunia t={0} tampilan="asli" v5={b.kunci} />
        </ThreeCanvas>
      )}
      {b.jenis === 'kantong' && (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 34, near: 0.05, far: 100 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
          <KantongGelap />
        </ThreeCanvas>
      )}
      {b.jenis !== 'logo' && <Grade />}
      {b.jenis === 'dunia' && b.teks && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: b.teks === 'klik.' ? 1180 : 300, ...gaya.judul, fontSize: b.teks === 'klik.' ? 64 : 58, opacity: b.teks === 'klik.' ? 0.8 : 0.92, fontFamily: b.teks === 'klik.' ? poppins.fontFamily : bagel.fontFamily, fontStyle: b.teks === 'klik.' ? 'italic' : 'normal' }}>{b.teks}</div>
      )}
      {b.jenis === 'dunia' && b.bisik && <div style={{ position: 'absolute', left: 80, right: 80, bottom: 330, ...gaya.bisik, fontSize: 46 }}>{b.bisik}</div>}
      {b.jenis === 'kantong' && b.teks && <div style={{ position: 'absolute', left: 0, right: 0, top: 250, ...gaya.judul, fontSize: 68, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{b.teks}</div>}
      {b.jenis === 'logo' && (
        <AbsoluteFill style={{ background: '#0B0908', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 }}>
          <Img src={logoUrl} style={{ width: 640 }} />
          <div style={{ ...gaya.judul, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 44, letterSpacing: 18 }}>SEGERA</div>
          <div style={{ ...gaya.bisik, fontSize: 44, marginTop: 120, opacity: 0.85 }}>{b.bisik}</div>
        </AbsoluteFill>
      )}
      <div style={{ position: 'absolute', left: 36, top: 36, fontFamily: poppins.fontFamily, fontSize: 28, color: 'rgba(255,255,255,0.55)' }}>
        {f + 1}/{BINGKAI.length} · detik {b.detik}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Video teaser v5 (±44 detik): bingkai kunci di atas jadi shot yang bergerak halus, dengan suara subuh dan bisikan.

const FPS = 60;
const DURASI = 44;
export const TEASER_MISTERI_VIDEO_FRAMES = DURASI * FPS;
const det = (d: number) => Math.round(d * FPS);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const halus = (t: number) => Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, t)));
const kamera = (a: Pose, b: Pose, t: number): Pose => ({
  p: a.p.clone().lerp(b.p, t),
  l: a.l.clone().lerp(b.l, t),
  fov: lerp(a.fov, b.fov, t),
  roll: lerp(a.roll, b.roll, t),
});
/** detak jantung: dua ketukan cepat tiap 0,9 detik, 0..1 */
const detak = (sec: number) => {
  const x = (sec % 0.9) / 0.9;
  return Math.exp(-((x - 0.05) ** 2) / 0.002) + 0.7 * Math.exp(-((x - 0.22) ** 2) / 0.002);
};

type Shot = { dari: number; sampai: number; kunci: (u: number, sec: number) => KunciV5 };
const SHOT: Shot[] = [
  // 1. lorong pasar subuh, kamera maju pelan
  { dari: 0, sampai: 5, kunci: (u) => ({ detik: 2, gelap: 1, dalam: 0, kamera: kamera(K([-2.5, 5, 16], [6, 9, -14], 46), K([-1.6, 6.2, 9.5], [6.5, 9, -14], 44), halus(u)) }) },
  // 2. penjual menata dagangan; tudung di pojok tidak disentuh
  { dari: 5, sampai: 11, kunci: (u, sec) => ({ detik: 7.2 + 2.4 * u, gelap: 1, dalam: 8 + 4 * Math.sin(sec * 2), kamera: kamera(K([0.5, 12.5, -1], [13, 9.2, -9.5], 44), K([1.6, 12, -3.2], [13, 9.2, -8], 42), halus(u)) }) },
  // 3. cahaya berdenyut dari bawah tudung, lalu "klik" (12,5)
  { dari: 11, sampai: 15, kunci: (u, sec) => ({ detik: 16, gelap: 1, dalam: 45 + 40 * detak(sec) + (sec > 12.5 && sec < 12.85 ? 120 : 0), kamera: kamera(K([4.2, 9.4, -2.2], [12, 9.6, -6], 40), K([5.6, 9.3, -3.1], [12, 9.5, -6], 38), halus(u)) }) },
  // 4. sudut pandang pembeli; tangan penjual menahan tudung
  { dari: 15, sampai: 20, kunci: (u) => ({ detik: 24 + Math.min(1, u * 2.2) * 1.1, gelap: 1, dalam: 60, kamera: kamera(K([3.5, 14.5, -7.5], [14, 10.5, -6], 42), K([4.6, 13.8, -7.1], [14, 10.3, -6], 40), halus(u)) }) },
  // 5. tudung terangkat sendiri sedikit; kilasan charm dari celah bawah
  { dari: 20, sampai: 24, kunci: (u, sec) => ({ detik: 20, gelap: 1, dalam: 120 + 50 * detak(sec), angkat: 0.3 * halus(u * 3), petromaks: 0.15, kamera: kamera(K([7.6, 8.62, -5.0], [12, 8.66, -6.0], 22), K([7.6, 8.62, -6.4], [12, 8.66, -6.4], 20), halus(u)) }) },
  // 6. mendongak ke terpal: lingkaran titik cahaya berdenyut
  { dari: 24, sampai: 28, kunci: (u, sec) => ({ detik: 20, gelap: 1, dalam: 1000 + 600 * detak(sec), rendah: true, petromaks: 0, kamera: kamera(K([9.6, 11.2, -10.6], [12, 24, -6.2], 82), K([9.8, 11.0, -10.2], [12.2, 24, -6.0], 80, 0.12), halus(u)) }) },
  // 7. tudung bergetar (28-30), terangkat dan cahaya menyembur (30), lalu potong ke hitam (31,4)
  {
    dari: 28,
    sampai: 32,
    kunci: (u, sec) => {
      const lepas = Math.min(1, Math.max(0, (sec - 30) / 0.6));
      return { detik: 26.3, gelap: 1, dalam: 300 + 1100 * lepas, angkat: 0.35 * halus(lepas), goyang: sec < 30 ? 0.03 * ((sec - 28) / 2) : 0, petromaks: 0.3, kamera: kamera(K([5.2, 8.9, -3.6], [12, 9.2, -6], 38), K([6.2, 8.9, -4.2], [12, 9.2, -6], 34), halus(u)) };
    },
  },
  // 8. tudung sudah menutup lagi; kamera mundur ke lorong, tudung tinggal satu-satunya cahaya lalu meredup
  { dari: 32, sampai: 37, kunci: (u) => ({ detik: 22, gelap: 1, dalam: 420 * (1 - halus((u - 0.7) / 0.3)), petromaks: 0, pendar: 2.4 * (1 - halus((u - 0.7) / 0.3)), kamera: kamera(K([6.8, 11.5, -2.5], [12, 9, -6], 40), K([0, 34, 30], [7, 5, -14], 52), halus(u / 0.85)) }) },
];

/** tirai hitam: masuk dari hitam, potong di 31,4, buka lagi 32, tutup 36,4-37, kantong 37,2, tutup 40,6-41 */
const hitam = (sec: number) =>
  interpolate(sec, [0, 0.8, 31.35, 31.4, 32.0, 32.5, 36.4, 37.0, 37.25, 37.6, 40.6, 41.0], [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const muncul = (sec: number, a: number, b: number, fade = 0.4) =>
  interpolate(sec, [a, a + fade, b - fade, b], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const naikTurun = (a: number, b: number, puncak: number) => (f: number) =>
  interpolate(f, [0, det(1), det(b - a) - det(1), det(b - a)], [0, puncak, puncak, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const SuaraV5: React.FC = () => (
  <>
    {/* angin subuh dan kicau burung di kejauhan; padam saat potong ke hitam */}
    <BunyiPanjang file="wind" dari={0} lama={det(31.4)} durasiFile={10} vol={naikTurun(0, 31.4, 0.28)} />
    <BunyiPanjang file="birds" dari={0} lama={det(12)} durasiFile={8.06} vol={naikTurun(0, 12, 0.1)} />
    {/* dengung yang pelan-pelan naik sejak cahaya muncul */}
    <BunyiPanjang file="pad" dari={det(9)} lama={det(22.4)} durasiFile={30.24} vol={(f) => interpolate(f, [0, det(3), det(21.8), det(22.4)], [0, 0.12, 0.3, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    {/* klik dari bawah tudung */}
    <Bunyi file="tick" dari={det(12.5)} lama={det(0.5)} vol={0.9} />
    <Bunyi file="clunk" dari={det(12.52)} lama={det(0.5)} vol={0.35} />
    {/* bisikan penjual */}
    <Sequence from={det(16)} durationInFrames={det(3.2)} layout="none">
      <Audio src={staticFile('vo/v5-penjual.wav')} volume={0.95} />
    </Sequence>
    {/* detak jantung saat kilasan dan bayangan di terpal */}
    {Array.from({ length: 9 }, (_, i) => 20 + i * 0.9).map((t) => (
      <React.Fragment key={t}>
        <Bunyi file="thud" dari={det(t)} lama={det(0.6)} vol={0.45} />
        <Bunyi file="thud" dari={det(t + 0.17)} lama={det(0.6)} vol={0.3} />
      </React.Fragment>
    ))}
    {/* tudung bergetar: gemuruh dan riser naik, ledakan cahaya di 30, lalu hening total di 31,4 */}
    <Bunyi file="rumble" dari={det(28)} lama={det(3.4)} vol={(f) => interpolate(f, [0, det(2)], [0.1, 0.6], { extrapolateRight: 'clamp' })} />
    <Bunyi file="riser" dari={det(27.4)} lama={det(4.0)} vol={0.5} />
    <Bunyi file="boom" dari={det(30)} lama={det(1.4)} vol={0.75} />
    {/* lorong sepi setelah potongan */}
    <BunyiPanjang file="wind" dari={det(32)} lama={det(5)} durasiFile={10} vol={naikTurun(32, 37, 0.22)} />
    <BunyiPanjang file="pad" dari={det(32)} lama={det(5)} durasiFile={30.24} vol={naikTurun(32, 37, 0.12)} />
    {/* lampu sorot menyala di kantong */}
    <Bunyi file="clunk" dari={det(37.3)} lama={det(0.5)} vol={0.7} />
    <BunyiPanjang file="room" dari={det(37.3)} lama={det(3.7)} durasiFile={8} vol={naikTurun(37.3, 41, 0.18)} />
    {/* logo */}
    <Bunyi file="shimmer" dari={det(41.1)} lama={det(2.9)} vol={0.45} />
    <Sequence from={det(42.3)} durationInFrames={det(1.7)} layout="none">
      <Audio src={staticFile('vo/v5-berani.wav')} volume={1} />
    </Sequence>
  </>
);

export const TeaserMisteriVideo: React.FC<{ sfx?: boolean }> = ({ sfx = false }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sec = f / FPS;
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font teaser misteri video'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#0B0908' }} />;
  const shot = SHOT.find((x) => sec >= x.dari && sec < x.sampai);
  const kunci = shot ? shot.kunci((sec - shot.dari) / (shot.sampai - shot.dari), sec) : null;
  const diKantong = sec >= 37 && sec < 41;
  const diLogo = sec >= 41;
  const logoMasuk = interpolate(sec, [41.0, 41.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ background: '#0B0908' }}>
      {kunci && (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.05, far: 1500 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
          <Dunia t={f} tampilan="asli" v5={kunci} />
        </ThreeCanvas>
      )}
      {diKantong && (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 34, near: 0.05, far: 100 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
          <KantongGelap maju={halus((sec - 37) / 4)} sorot={sec < 37.3 ? 0 : 1} />
        </ThreeCanvas>
      )}
      {!diLogo && <Grade />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, ...gaya.judul, fontSize: 58, opacity: 0.92 * muncul(sec, 1.0, 4.6, 0.6) }}>PASAR LAMA, 04.30</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, ...gaya.judul, fontFamily: poppins.fontFamily, fontStyle: 'italic', fontSize: 64, opacity: 0.8 * muncul(sec, 12.5, 13.6, 0.15) }}>klik.</div>
      <div style={{ position: 'absolute', left: 80, right: 80, bottom: 330, ...gaya.bisik, fontSize: 46, opacity: muncul(sec, 16.0, 19.4, 0.3) }}>"Yang itu… nggak dijual."</div>
      <AbsoluteFill style={{ background: '#000', opacity: hitam(sec) }} />
      {diLogo && (
        <AbsoluteFill style={{ background: '#0B0908', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 }}>
          <Img src={logoUrl} style={{ width: 660, transform: `scale(${0.7 + 0.3 * logoMasuk})`, opacity: Math.min(1, logoMasuk * 1.5) }} />
          <div style={{ ...gaya.judul, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 44, letterSpacing: 18, opacity: muncul(sec, 41.6, 44.5, 0.4) }}>SEGERA</div>
          <div style={{ ...gaya.bisik, fontSize: 44, marginTop: 100, opacity: 0.85 * muncul(sec, 42.3, 44.5, 0.3) }}>"Berani buka?"</div>
        </AbsoluteFill>
      )}
      {sfx && <SuaraV5 />}
    </AbsoluteFill>
  );
};
