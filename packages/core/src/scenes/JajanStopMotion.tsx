// Teaser gaya "Stop-motion flanel" Jajan Dulu!, 24 detik, 9:16. Gerak dibuat patah-patah 12 langkah per detik
// seperti animasi boneka yang difoto satu per satu: charm melompat keluar dari kantong kraft, berbaris di alas
// flanel, lalu berpose bersama satu karakter yang masih ditutup kain. Satuan dunia charm: 1 unit = 6 cm.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { type CharmId } from '../../../three/src/jajan/charm';
import { buatKantong, KANTONG } from '../../../three/src/jajan/kantong';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { inOut, prog } from './motion';
import { rng } from './kit';
import { terapkanTampilan, type Tampilan } from './tampilan';
import { kanvasTekstur } from './JajanLapak';
import { Bunyi, BunyiPanjang } from './JajanTeaserLapak';
import { charmBerdiri, teksturFlanel, teksturKayu } from './JajanGayaTeaser';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['500'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);
export const STOP_MOTION_FRAMES = s(24);
/** 12 gambar per detik: tiap gambar ditahan 5 frame */
const LANGKAH = 5;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const URUT: CharmId[] = ['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'];
const KANTONG_POS = V(0, 0.06, -2.4);
const MULUT = KANTONG_POS.clone().add(V(0, KANTONG.H + 0.15, 0));
// Jadwal (detik)
const T = { buka: 2.0, intip: 4.0, lompat: 5.4, jarak: 1.15, jalan: 11.6, pose: 16.4, kain: 18.2, judul: 20.4 } as const;
const MENDARAT = [V(-0.8, 0.06, -0.9), V(0.8, 0.06, -0.6), V(-0.8, 0.06, 0.3), V(0.8, 0.06, 0.6), V(0, 0.06, 1.3)];
const BERJALAN = URUT.map((_, i) => V(-1.2 + i * 0.6, 0.06, 0.95 - i * 0.4));
const POSE = [V(-1.0, 0.06, 0.9), V(-0.85, 0.06, -0.3), V(0.85, 0.06, -0.3), V(1.0, 0.06, 0.9), V(0, 0.06, 1.2)];
const POSE_RAHASIA = V(0, 0.06, -0.65);

const Adegan: React.FC<{ t: number; tampilan: Tampilan }> = ({ t, tampilan }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  const isi = useMemo(() => {
    const g = new THREE.Group();
    lampuStandar(scene, gl, 0.6);
    scene.background = new THREE.Color('#3A2A1E');
    const meja = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: teksturKayu(), roughness: 0.75 }));
    meja.rotation.x = -Math.PI / 2;
    meja.receiveShadow = true;
    g.add(meja);
    const alas = new THREE.Mesh(new RoundedBoxGeometry(10, 0.06, 7, 2, 0.03), new THREE.MeshStandardMaterial({ map: teksturFlanel('#6E9C5A'), roughness: 1 }));
    alas.position.set(0, 0.03, 0.3);
    alas.receiveShadow = true;
    g.add(alas);
    // jahitan tepi alas
    const jahit = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 4, 160), new THREE.MeshStandardMaterial({ color: '#F4EBD5' }));
    jahit.rotation.x = Math.PI / 2;
    jahit.scale.set(4.7, 3.2, 1);
    jahit.position.set(0, 0.065, 0.3);
    g.add(jahit);
    const kantong = buatKantong();
    kantong.grup.position.copy(KANTONG_POS);
    kantong.grup.rotation.y = 0;
    g.add(kantong.grup);
    // gulungan benang, jarum, gunting kecil, potongan flanel
    const gulungan = new THREE.Group();
    const inti = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 24), new THREE.MeshStandardMaterial({ map: teksturFlanel('#E05A6A'), roughness: 0.9 }));
    const tepi = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), new THREE.MeshStandardMaterial({ color: '#D9B98A', roughness: 0.6 }));
    tepi.position.y = 0.51;
    const tepi2 = tepi.clone();
    tepi2.position.y = -0.51;
    gulungan.add(inti, tepi, tepi2);
    gulungan.rotation.z = Math.PI / 2;
    g.add(gulungan);
    const jarum = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.006, 1.6, 10), new THREE.MeshStandardMaterial({ color: '#DADAE0', metalness: 1, roughness: 0.2 }));
    jarum.position.set(-1.7, 0.09, 2.3);
    jarum.rotation.set(0, 0.7, Math.PI / 2);
    g.add(jarum);
    const benang = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-1.6, 0.07, 2.2), V(-1.0, 0.08, 2.7), V(-0.2, 0.07, 2.5), V(0.4, 0.08, 2.9)]), 40, 0.022, 6), new THREE.MeshStandardMaterial({ color: '#E05A6A', roughness: 0.9 }));
    g.add(benang);
    const R = rng(21);
    ['#E8B030', '#D2923F', '#EC7FA6', '#74B33E'].forEach((w, i) => {
      const p = new THREE.Mesh(new RoundedBoxGeometry(0.5 + R() * 0.4, 0.02, 0.35 + R() * 0.3, 1, 0.01), new THREE.MeshStandardMaterial({ map: teksturFlanel(w), roughness: 1 }));
      p.position.set(-1.9 + R() * 0.4, 0.075, -2.6 + i * 0.5);
      p.rotation.y = R() * 3;
      g.add(p);
    });
    const charm = URUT.map((id) => {
      const c = charmBerdiri(id);
      c.scale.setScalar(0.95);
      g.add(c);
      return c;
    });
    // yang keenam: ditutup kain flanel ungu tua, hanya tanda tanya yang terlihat
    const rahasia = new THREE.Group();
    const kain = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ map: teksturFlanel('#3A2C40'), roughness: 1, side: THREE.DoubleSide }));
    kain.scale.set(1, 1.55, 1);
    kain.castShadow = true;
    const tanya = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: kanvasTekstur(128, 128, (c) => {
      c.fillStyle = '#F6D77A';
      c.font = '110px "Bagel Fat One"';
      c.textAlign = 'center';
      c.fillText('?', 64, 108);
    }), transparent: true }));
    tanya.position.set(0, 0.62, 0.64);
    rahasia.add(kain, tanya);
    g.add(rahasia);
    const jendela = new THREE.DirectionalLight('#FFF0DA', 2.6);
    jendela.position.set(-6, 9, 4);
    jendela.castShadow = true;
    jendela.shadow.mapSize.set(2048, 2048);
    Object.assign(jendela.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
    jendela.shadow.radius = 4;
    const langit = new THREE.HemisphereLight('#FFF6E8', '#8A6A4A', 0.9);
    g.add(jendela, langit);
    g.traverse((m) => ((m as THREE.Mesh).isMesh ? ((m as THREE.Mesh).castShadow = true) : null));
    meja.castShadow = false;
    return { g, kantong, gulungan, charm, rahasia, jendela, langit };
  }, [gl, scene]);
  // tampilan kartun/kertas diterapkan async (penyederhanaan geometri); render ditahan sampai selesai
  const { advance } = useThree();
  const [tahan] = useState(() => (tampilan === 'asli' ? null : delayRender('tampilan ' + tampilan)));
  useEffect(() => {
    if (tahan === null) return;
    terapkanTampilan(isi.g, tampilan).then(() => {
      advance(performance.now());
      continueRender(tahan);
    });
  }, [isi, tahan, tampilan, advance]);

  // waktu bertangga 12 fps dan acak kecil per gambar (kamera dan cahaya tidak pernah persis sama di tiap foto)
  const tq = Math.floor(t / LANGKAH) * LANGKAH;
  const langkah = tq / LANGKAH;
  const R = rng(langkah * 7 + 1);
  const goyang = () => (R() - 0.5) * 2;

  // kantong bergoyang, tutup terbuka bertahap
  const goyangKantong = tq >= s(T.buka) && tq < s(T.intip) ? 1 : 0;
  isi.kantong.grup.rotation.set(0, 0, goyangKantong * (langkah % 2 ? 0.06 : -0.06));
  isi.kantong.setBuka(prog(tq, s(T.buka + 0.6), s(T.intip), (x) => x));
  isi.kantong.setCahaya(0.2);

  isi.charm.forEach((c, i) => {
    const a = s(T.lompat + i * T.jarak);
    const lama = s(0.9);
    // sebelum melompat: di dalam kantong; yang pertama mengintip dulu
    if (tq < a) {
      const intip = i === 0 ? prog(tq, s(T.intip), s(T.intip + 0.8), (x) => x) : 0;
      c.position.copy(KANTONG_POS).add(V(0, 0.55 + intip * 0.9, 0));
      c.rotation.set(0, (i === 0 && tq > s(T.intip + 0.8) ? (langkah % 6 < 3 ? 0.5 : -0.5) : 0), 0);
      c.scale.set(0.95, 0.95, 0.95);
      c.visible = i === 0 || tq > s(T.intip);
      return;
    }
    c.visible = true;
    const awal = KANTONG_POS.clone().add(V(0, 1.45, 0));
    if (tq < a + lama) {
      // busur lompatan dengan putaran kecil
      const p = (tq - a) / lama;
      c.position.copy(awal).lerp(MENDARAT[i], p);
      c.position.y += Math.sin(p * Math.PI) * 1.8;
      c.rotation.set(0, 0, Math.sin(p * Math.PI * 2) * 0.35);
      c.scale.set(0.95, 0.95 * (p < 0.15 ? 1.15 : 1), 0.95);
      return;
    }
    // mendarat: gepeng sebentar, lalu berjalan berbaris, lalu menuju posisi foto bersama
    const sejakDarat = tq - (a + lama);
    const gepeng = sejakDarat < LANGKAH * 2 ? 0.8 : 1;
    let pos = MENDARAT[i].clone();
    let miring = 0;
    let hadap = 0;
    if (tq >= s(T.jalan)) {
      const p = prog(tq, s(T.jalan), s(T.pose), (x) => x);
      pos = MENDARAT[i].clone().lerp(BERJALAN[i], p);
      if (p > 0 && p < 1) {
        miring = (langkah + i) % 2 ? 0.16 : -0.16;
        pos.y += (langkah + i) % 2 ? 0.08 : 0;
      }
      hadap = 0.25;
    }
    if (tq >= s(T.pose)) {
      const p = prog(tq, s(T.pose), s(T.kain), inOut);
      pos = BERJALAN[i].clone().lerp(POSE[i], p);
      if (p > 0 && p < 1) miring = (langkah + i) % 2 ? 0.12 : -0.12;
      hadap = 0.25 * (1 - p) - POSE[i].x * 0.2 * p;
    }
    c.position.copy(pos);
    c.rotation.set(0, hadap, miring);
    c.scale.set(0.95 / Math.sqrt(gepeng), 0.95 * gepeng, 0.95 / Math.sqrt(gepeng));
  });

  // gulungan benang menggelinding pelan di belakang barisan
  const gul = prog(tq, s(T.jalan), s(T.pose), (x) => x);
  isi.gulungan.position.set(1.9 - gul * 0.5, 0.55, -2.0 + gul * 0.5);
  isi.gulungan.rotation.x = gul * 4;

  // kain rahasia meluncur masuk dari kiri
  const masuk = prog(tq, s(T.kain), s(T.kain + 1.4), (x) => x);
  isi.rahasia.visible = masuk > 0;
  isi.rahasia.position.copy(V(-3.5, 0.06, -0.65).lerp(POSE_RAHASIA, masuk));
  isi.rahasia.rotation.z = masuk < 1 ? (langkah % 2 ? 0.1 : -0.1) : 0;

  // cahaya jendela sedikit berkedip antar foto
  isi.jendela.intensity = 2.6 * (1 + goyang() * 0.03);
  isi.langit.intensity = 0.9 * (1 + goyang() * 0.03);

  // kamera: tripod tetap, sedikit bergeser tiap foto; setelah berbaris, pindah ke sudut foto bersama
  const foto = tq >= s(T.pose);
  const p = foto ? V(0, 4.0, 5.4) : V(0, 5.6, 4.2);
  const l = foto ? V(0, 0.75, 0.0) : V(0, 0.45, -1.1);
  camera.position.copy(p).add(V(goyang() * 0.012, goyang() * 0.012, 0));
  camera.lookAt(l);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = foto ? 46 : 40;
  cam.updateProjectionMatrix();
  gl.toneMappingExposure = 1 + goyang() * 0.015;
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------

const Teks: React.FC<{ t: number; dari: number; sampai: number; teks: string; atas?: number; miring?: number }> = ({ t, dari, sampai, teks, atas = 210, miring = -3 }) => {
  const tq = Math.floor(t / LANGKAH) * LANGKAH;
  if (tq < s(dari) || tq >= s(sampai)) return null;
  // muncul huruf demi huruf, mengikuti tangga 12 fps
  const n = Math.min(teks.length, Math.floor((tq - s(dari)) / LANGKAH) + 1);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: atas, textAlign: 'center', fontFamily: gochi.fontFamily, fontSize: 78, color: '#FFF4E0', textShadow: '0 3px 14px rgba(0,0,0,0.55)', transform: `rotate(${miring}deg)` }}>
      {teks.slice(0, n)}
    </div>
  );
};

const Judul: React.FC<{ t: number }> = ({ t }) => {
  const tq = Math.floor(t / LANGKAH) * LANGKAH;
  if (tq < s(T.judul)) return null;
  // papan flanel jatuh dari atas dalam 4 gambar, lalu memantul
  const k = (tq - s(T.judul)) / LANGKAH;
  const y = [-500, -260, -60, 30, -10, 0][Math.min(5, k)];
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 220 + y, padding: '28px 0', borderRadius: 26, background: '#C8442F', border: '6px dashed #FFE7C2', outline: '12px solid #C8442F', textAlign: 'center', fontFamily: bagel.fontFamily, fontSize: 104, color: '#FFE7C2', transform: `rotate(${k % 2 ? -1.5 : 1.5}deg)` }}>Jajan Dulu!</div>
      {k > 8 && <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: gochi.fontFamily, fontSize: 60, color: '#FFF4E0', textShadow: '0 3px 12px rgba(0,0,0,0.6)' }}>6 karakter · 1 rahasia</div>}
      {k > 14 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 200, textAlign: 'center', fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 38, color: '#FFF4E0', textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>Dijahit tangan · Segera · Pre-order via WA</div>}
    </AbsoluteFill>
  );
};

const Suara: React.FC = () => (
  <>
    <BunyiPanjang file="pad" dari={0} lama={s(24)} durasiFile={30} vol={(f) => 0.16 * prog(f, 0, s(1)) * (1 - prog(f, s(23), s(24)))} />
    <BunyiPanjang file="morning2" dari={0} lama={s(24)} durasiFile={20} vol={() => 0.05} />
    {/* kantong bergoyang dan tutup dibuka */}
    {[2.0, 2.4, 2.8, 3.2].map((d) => (
      <Bunyi key={d} file="knock" dari={s(d)} lama={s(0.3)} vol={0.25} />
    ))}
    <Bunyi file="scratch" dari={s(T.buka + 0.6)} lama={s(1.4)} vol={0.25} />
    {/* tiap lompatan: pegas lepas, mendarat empuk */}
    {URUT.map((_, i) => (
      <React.Fragment key={i}>
        <Bunyi file="ping" dari={s(T.lompat + i * T.jarak)} lama={s(0.8)} vol={0.35} />
        <Bunyi file="thud" dari={s(T.lompat + i * T.jarak + 0.9)} lama={s(0.4)} vol={0.35} />
      </React.Fragment>
    ))}
    {/* langkah kecil saat berbaris */}
    {Array.from({ length: 16 }, (_, k) => (
      <Bunyi key={k} file="tick" dari={s(T.jalan) + k * 18} lama={s(0.15)} vol={0.3} />
    ))}
    <Bunyi file="cloth" dari={s(T.kain)} lama={s(1.6)} vol={0.4} />
    <Bunyi file="shimmer" dari={s(T.kain + 1.4)} lama={s(2.5)} vol={0.2} />
    <Bunyi file="thud" dari={s(T.judul + 0.25)} lama={s(0.5)} vol={0.4} />
    <Bunyi file="chime" dari={s(T.judul + 0.3)} lama={s(3)} vol={0.6} />
  </>
);

export const TeaserStopMotion: React.FC<{ sfx?: boolean; tampilan?: Tampilan }> = ({ sfx = false, tampilan = 'asli' }) => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font stop-motion'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#3A2A1E' }} />;
  const tq = Math.floor(t / LANGKAH) * LANGKAH;
  return (
    <AbsoluteFill style={{ background: '#3A2A1E' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 36, near: 0.05, far: 200 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan t={t} tampilan={tampilan} />
      </ThreeCanvas>
      <Teks t={t} dari={0.4} sampai={3.6} teks="psst..." />
      <Teks t={t} dari={4.0} sampai={7.6} teks="ada yang mau keluar!" miring={2} />
      <Teks t={t} dari={11.6} sampai={16.2} teks="berangkat ke pasar~" />
      <Teks t={t} dari={18.4} sampai={20.4} teks="eh, siapa itu?" miring={2} />
      <AbsoluteFill style={{ pointerEvents: 'none', boxShadow: 'inset 0 0 240px rgba(40,25,10,0.6)', background: 'rgba(255,220,160,0.04)' }} />
      <div style={{ position: 'absolute', right: 50, top: 60, fontFamily: gochi.fontFamily, fontSize: 40, color: '#FFF4E0', opacity: 0.8 }}>frame {String(tq / LANGKAH).padStart(3, '0')}</div>
      <Judul t={t} />
      {sfx && <Suara />}
    </AbsoluteFill>
  );
};
