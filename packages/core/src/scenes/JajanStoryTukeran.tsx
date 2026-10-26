// Storytelling pendek "Tukeran Yuk" (±25 detik): bingkai kunci, satu frame per bingkai.
// Raka pengen klepon tapi dapat onde-onde; Sasa sebaliknya. Mereka saling lirik di bazar kampus, tukeran di kantin,
// dan sejak itu membuka seri baru bareng. Gaya 3D sama dengan "Pasar Minggu". Skala dunia 1 unit = 10 cm.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AbsoluteFill, Img, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { buatBadan, raih, type Badan } from '../../../three/src/jajan/badan';
import { aturTangan, buatTangan, letakkanJepit, POSE, titikJepit, type RigTangan } from '../../../three/src/jajan/tubuh';
import { buatKantong } from '../../../three/src/jajan/kantong';
import { type CharmRajutId } from '../../../three/src/jajan/charmRajut';
import { labelSiap, logoSiap } from '../../../three/src/jajan/tekstur';
import logoUrl from '../../../three/src/jajan/logo-jajandulu.webp';
import { kanvasTekstur } from './JajanLapak';
import { teksturUbin } from './JajanTeaserLapak';
import { charm, ransel, setPenutup } from './JajanStoryPasarMinggu';

const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Kam = { p: THREE.Vector3; l: THREE.Vector3; fov: number };
const K = (p: [number, number, number], l: [number, number, number], fov: number): Kam => ({ p: V(...p), l: V(...l), fov });

const MEJA_Y = 7.75; // permukaan meja (75 cm)
const KULIT_RAKA = '#B57E5A';
const KULIT_SASA = '#D9A27E';

// ---------------------------------------------------------------------------------------------------------------
// Tokoh duduk di balik meja (kaki tertutup meja), lengan rig tangan + IK

type Duduk = { b: Badan; tangan: [RigTangan, RigTangan] };

function duduk(g: THREE.Group, o: { pria?: boolean; baju: string; kulit: string; jilbab?: string; rambut?: string; x: number; z: number }): Duduk {
  const b = buatBadan({ pria: o.pria, baju: o.baju, kulit: o.kulit, jilbab: o.jilbab, rambut: o.rambut, rok: o.pria ? '#2F3A4A' : '#3B4A5C' });  // pria: celana panjang lurus dari kain yang sama, terlihat di bawah meja
  b.akar.position.set(o.x, 5.2, o.z);
  g.add(b.akar, ...b.lenganAtas);
  const tangan: [RigTangan, RigTangan] = [
    buatTangan(1, { kulit: o.kulit, lenganBaju: o.baju, lengan: b.LENGAN_BAWAH }),
    buatTangan(-1, { kulit: o.kulit, lenganBaju: o.baju, lengan: b.LENGAN_BAWAH }),
  ];
  tangan.forEach((r) => g.add(r.akar));
  return { b, tangan };
}

const arahBadan = (b: Badan, v: THREE.Vector3) => v.applyQuaternion(b.akar.getWorldQuaternion(new THREE.Quaternion()));

/** Tangan i bertumpu di meja (lokal badan: x ke samping, z ke depan). Kanan orang = -X. */
function tumpu(d: Duduk, i: 0 | 1, maju = 2.4) {
  const s = i ? 1 : -1;
  d.b.akar.updateWorldMatrix(true, true);
  aturTangan(d.tangan[i], POSE.rileks);
  const T = d.b.akar.localToWorld(V(s * 1.5, 0, maju));
  T.y = MEJA_Y + 0.25;
  raih(d.b, i, d.tangan[i], T, s * -0.2, arahBadan(d.b, V(s * 0.8, -0.4, -0.6)));
}

/** Tangan i menjepit ring charm di titik dunia T; charm menggantung di bawah jepitan. */
function pegangCharm(g: THREE.Group, d: Duduk, i: 0 | 1, T: THREE.Vector3, id: CharmRajutId) {
  const s = i ? 1 : -1;
  d.b.akar.updateWorldMatrix(true, true);
  aturTangan(d.tangan[i], POSE.jepit);
  raih(d.b, i, d.tangan[i], T, s * -1.4, arahBadan(d.b, V(s * 0.7, -1, -0.2)));
  const jepit = titikJepit(d.tangan[i]);
  const c = charm(id);
  // puncak dalam ring charm 0,714 x 0,6 di atas pusat badan charm
  c.position.copy(jepit).add(V(0, -0.714 * 0.6 + 0.04, 0));
  c.rotation.y = s * 0.2;
  g.add(c);
  return c;
}

// ---------------------------------------------------------------------------------------------------------------
// Benda

function meja(lebar: number, dalam: number, warna = '#9A6A44') {
  const g = new THREE.Group();
  const serat = kanvasTekstur(512, 256, (c) => {
    c.fillStyle = warna;
    c.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 60; i++) {
      c.strokeStyle = `rgba(${i % 2 ? '70,40,20' : '200,150,100'},0.18)`;
      c.lineWidth = 1 + (i % 3);
      const y = (i * 37) % 256;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) c.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
      c.stroke();
    }
  });
  const kayu = new THREE.MeshStandardMaterial({ map: serat, roughness: 0.55 });
  const atas = new THREE.Mesh(new THREE.BoxGeometry(lebar, 0.4, dalam), kayu);
  atas.position.y = MEJA_Y - 0.2;
  g.add(atas);
  for (const x of [-lebar / 2 + 0.4, lebar / 2 - 0.4])
    for (const z of [-dalam / 2 + 0.4, dalam / 2 - 0.4]) {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.4, MEJA_Y - 0.4, 0.4), new THREE.MeshStandardMaterial({ color: '#3A3A3E', metalness: 0.5, roughness: 0.4 }));
      k.position.set(x, (MEJA_Y - 0.4) / 2, z);
      g.add(k);
    }
  g.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = (o as THREE.Mesh).receiveShadow = true) : null));
  return g;
}

/** Kantong kraft Jajan Dulu! di atas meja (skala dunia). */
function kantong(buka: number) {
  const k = buatKantong();
  k.setBuka(buka);
  k.setCahaya(0);
  k.grup.scale.setScalar(0.6);
  k.grup.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = true) : null));
  const g = new THREE.Group();
  g.add(k.grup);
  k.grup.updateMatrixWorld(true);
  const kotak = new THREE.Box3().setFromObject(k.grup);
  k.grup.position.y = -kotak.min.y;
  return g;
}

function esTeh() {
  const g = new THREE.Group();
  const gelas = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 1.3, 28, 1, true), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.9, roughness: 0.05, thickness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  gelas.position.y = 0.65;
  const teh = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.33, 1.0, 28), new THREE.MeshStandardMaterial({ color: '#B8561A', roughness: 0.2, transparent: true, opacity: 0.88 }));
  teh.position.y = 0.52;
  g.add(gelas, teh);
  const es = new THREE.MeshPhysicalMaterial({ color: '#F4F8FF', roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.8 });
  [[0.1, 0.95, 0.05], [-0.12, 0.9, -0.08], [0.02, 0.8, 0.14]].forEach(([x, y, z], i) => {
    const kubus = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), es);
    kubus.position.set(x, y, z);
    kubus.rotation.set(i, i * 0.7, 0.3);
    g.add(kubus);
  });
  const sedotan = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 8), new THREE.MeshStandardMaterial({ color: '#E8423A', roughness: 0.5 }));
  sedotan.position.set(0.12, 1.2, 0);
  sedotan.rotation.z = -0.25;
  g.add(sedotan);
  return g;
}

function ruang(scene: THREE.Scene, gl: THREE.WebGLRenderer, dinding: string, papan?: string) {
  const g = new THREE.Group();
  lampuStandar(scene, gl, 0.8);
  scene.environmentIntensity = 0.5;
  scene.background = new THREE.Color(dinding);
  const lantai = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ map: teksturUbin(), roughness: 0.5 }));
  lantai.rotation.x = -Math.PI / 2;
  lantai.receiveShadow = true;
  g.add(lantai);
  const belakang = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), new THREE.MeshStandardMaterial({ color: dinding, roughness: 0.95 }));
  belakang.position.set(0, 20, -12);
  belakang.receiveShadow = true;
  g.add(belakang);
  if (papan) {
    const tex = kanvasTekstur(1024, 256, (c) => {
      c.fillStyle = '#F2B124';
      c.fillRect(0, 0, 1024, 256);
      c.fillStyle = '#3B2620';
      c.font = 'bold 120px Arial';
      c.textAlign = 'center';
      c.fillText(papan, 512, 170);
      c.fillStyle = '#E8423A';
      for (let x = 0; x < 1024; x += 64) {
        c.beginPath();
        c.moveTo(x, 256);
        c.lineTo(x + 32, 220);
        c.lineTo(x + 64, 256);
        c.fill();
      }
    });
    const spanduk = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
    spanduk.position.set(0, 19, -11.8);
    g.add(spanduk);
  }
  const sinar = new THREE.DirectionalLight('#FFF1DC', 2.4);
  sinar.position.set(-10, 30, 22);
  sinar.castShadow = true;
  sinar.shadow.mapSize.set(2048, 2048);
  Object.assign(sinar.shadow.camera, { left: -25, right: 25, top: 25, bottom: -10, near: 1, far: 100 });
  g.add(sinar, new THREE.HemisphereLight('#FFF6E8', '#7A6450', 0.7));
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Set

/** Bazar kampus: satu meja panjang, Raka (kiri) dan Sasa (kanan) duduk di belakangnya menghadap kamera. */
function setBazar(scene: THREE.Scene, gl: THREE.WebGLRenderer, lirik: boolean) {
  const g = ruang(scene, gl, '#E9E0CF', 'BAZAR KAMPUS');
  g.add(meja(30, 6));
  // tumpukan kantong yang belum dibuka di tengah meja
  [[-1.4, 0], [0, -0.6], [1.4, 0], [-0.7, 1.2], [0.7, 1.2]].forEach(([x, z], i) => {
    const k = kantong(0);
    k.position.set(x, MEJA_Y, z);
    k.rotation.y = (i - 2) * 0.2;
    g.add(k);
  });
  // saat saling lirik keduanya digeser lebih dekat supaya muat satu bingkai potret
  const jarak = lirik ? 4.6 : 7;
  const raka = duduk(g, { pria: true, baju: '#5B7BA8', kulit: KULIT_RAKA, rambut: '#1E1612', x: -jarak, z: -4.2 });
  const sasa = duduk(g, { baju: '#F08AA0', kulit: KULIT_SASA, jilbab: '#F2D9A6', x: jarak, z: -4.2 });
  g.updateMatrixWorld(true);
  // kantong mereka yang sudah dibuka di depan masing-masing
  for (const x of [-(jarak + 0.6), jarak + 0.6]) {
    const k = kantong(1);
    k.position.set(x, MEJA_Y, 1.5);
    k.rotation.y = x < 0 ? 0.4 : -0.4;
    g.add(k);
  }
  // charm diangkat sejajar dagu, sedikit ke samping supaya wajah tetap terlihat
  const angkat = (d: Duduk, i: 0 | 1, id: CharmRajutId) => {
    const s = i ? 1 : -1;
    pegangCharm(g, d, i, d.b.kepala.localToWorld(V(s * 1.5, -1.0, 2.2)), id);
  };
  angkat(raka, 1, 'onde-onde');
  tumpu(raka, 0);
  angkat(sasa, 0, 'klepon');
  tumpu(sasa, 1);
  if (lirik) {
    // saling lirik: kepala menoleh ke arah satu sama lain
    raka.b.kepala.rotation.y = 0.75;
    sasa.b.kepala.rotation.y = -0.75;
  } else {
    raka.b.kepala.rotation.x = 0.2;
    sasa.b.kepala.rotation.x = 0.2;
  }
  return g;
}

/** Kantin: satu meja kecil, duduk bersebelahan, saling menyodorkan charm di tengah meja. */
function setKantin(scene: THREE.Scene, gl: THREE.WebGLRenderer) {
  const g = ruang(scene, gl, '#D8E4D4', 'KANTIN');
  g.add(meja(14, 6, '#B07A4E'));
  const raka = duduk(g, { pria: true, baju: '#5B7BA8', kulit: KULIT_RAKA, rambut: '#1E1612', x: -2.7, z: -4.2 });
  const sasa = duduk(g, { baju: '#F08AA0', kulit: KULIT_SASA, jilbab: '#F2D9A6', x: 2.7, z: -4.2 });
  g.updateMatrixWorld(true);
  pegangCharm(g, raka, 1, V(-0.55, 10.3, 0.4), 'onde-onde');
  pegangCharm(g, sasa, 0, V(0.55, 10.3, 0.6), 'klepon');
  tumpu(raka, 0);
  tumpu(sasa, 1);
  raka.b.kepala.rotation.set(0.15, 0.5, 0);
  sasa.b.kepala.rotation.set(0.15, -0.5, 0);
  for (const x of [-4.5, 4.5]) {
    const e = esTeh();
    e.position.set(x, MEJA_Y, 1.6);
    g.add(e);
  }
  // dua kantong kraft yang sudah dibuka
  for (const x of [-1.8, 1.8]) {
    const k = kantong(1);
    k.position.set(x, MEJA_Y, 1.8);
    k.rotation.y = x < 0 ? 0.5 : -0.5;
    g.add(k);
  }
  return g;
}

/** Dua ransel bersandar di bangku, masing-masing dengan charm yang akhirnya mereka dapat. */
function setRansel(scene: THREE.Scene, gl: THREE.WebGLRenderer) {
  const g = ruang(scene, gl, '#E9E0CF');
  const bangku = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 5), new THREE.MeshStandardMaterial({ color: '#8A5E3C', roughness: 0.7 }));
  bangku.position.set(0, 4.5, 0);
  bangku.castShadow = bangku.receiveShadow = true;
  g.add(bangku);
  const a = ransel('#3B5A8F');
  a.g.position.set(-2.1, 4.8 + 2.6, -0.5);
  a.g.rotation.set(-0.08, 0.12, 0.05);
  a.pasangCharm('klepon');
  const b = ransel('#8F3B4E');
  b.g.position.set(2.1, 4.8 + 2.6, -0.5);
  b.g.rotation.set(-0.08, -0.12, -0.05);
  b.pasangCharm('onde-onde');
  g.add(a.g, b.g);
  return g;
}

/**
 * Fungsi: charm dipindah dari ransel ke kunci motor. Tangan memegang kunci, ring pegas charm mengait gantungan kunci.
 */
function setKunci(scene: THREE.Scene, gl: THREE.WebGLRenderer) {
  const g = ruang(scene, gl, '#D9CBB6');
  g.add(meja(14, 8, '#7A5236'));
  const besi = new THREE.MeshStandardMaterial({ color: '#C9CDD2', metalness: 0.9, roughness: 0.25 });
  // kunci motor: kepala plastik hitam, bilah logam ke atas
  const kunci = new THREE.Group();
  const kepala = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.8, 0.16, 3, 0.12), new THREE.MeshStandardMaterial({ color: '#16181C', roughness: 0.45 }));
  const bilah = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.05), besi);
  bilah.position.y = 0.92;
  for (let k = 0; k < 4; k++) {
    const gerigi = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.05), besi);
    gerigi.position.set(0.09, 0.6 + k * 0.18, 0);
    bilah.add(gerigi);
  }
  const lubang = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 20), besi);
  lubang.position.y = -0.32;
  kunci.add(kepala, bilah, lubang);
  kunci.position.set(0.3, 10.15, 0);
  kunci.rotation.z = 0.15;
  g.add(kunci);
  // gantungan kunci (ring logam) di bidang YZ, tegak lurus ring charm seperti mata rantai
  const gantungan = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 32), besi);
  gantungan.rotation.y = Math.PI / 2;
  const yG = 9.58;
  gantungan.position.set(0.25, yG, 0);
  g.add(gantungan);
  const c = charm('klepon');
  c.position.set(0.25, yG - 0.24 + 0.02 - 0.714 * 0.6 + 0.06, 0);
  c.rotation.y = 0.35;
  g.add(c);
  // tangan memegang kepala kunci dari kanan atas
  const tangan = buatTangan(1, { kulit: KULIT_RAKA, lenganBaju: '#5B7BA8', lengan: 2.6 });
  g.add(tangan.akar);
  aturTangan(tangan, POSE.jepit);
  letakkanJepit(tangan, V(0.62, 10.2, 0.12), V(0.75, 0.55, 0.35), -1.2);
  // kantong-kantong dan ransel samar di belakang
  const k = kantong(1);
  k.position.set(-3.2, MEJA_Y, -1.5);
  k.rotation.y = 0.4;
  g.add(k);
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Bingkai

type Set = 'bazar' | 'bazar-lirik' | 'kantin' | 'kunci' | 'ransel' | 'penutup';
type Bingkai = { set: Set; kam: Kam; teks: string; detik: string };

const BINGKAI: Bingkai[] = [
  { set: 'bazar', detik: '0-3', kam: K([-6, 11.8, 11], [-6, 11.2, -3], 34), teks: 'Raka udah ngincer klepon dari minggu lalu.' },
  { set: 'bazar', detik: '3-6', kam: K([-4.6, 11.4, 4.2], [-5.8, 10.9, -2.0], 26), teks: 'Yang keluar… onde-onde.' },
  { set: 'bazar', detik: '6-10', kam: K([6, 11.8, 11], [6, 11.2, -3], 34), teks: 'Dua meja dari situ, Sasa pengennya onde-onde. Dapetnya klepon.' },
  { set: 'bazar-lirik', detik: '10-13', kam: K([-5, 13.5, 31], [0.5, 11, -4], 40), teks: 'Terus mereka saling lirik.' },
  { set: 'kantin', detik: '13-17', kam: K([0, 12.8, 25], [0, 11, -2], 40), teks: '"Tukeran yuk?"' },
  { set: 'kantin', detik: '17-20', kam: K([0.3, 10.8, 8.5], [0, 10.0, 0.5], 28), teks: 'Kalimat pertama mereka. Belum tahu nama satu sama lain.' },
  // fungsi: ring pegas, pindah tas ke kunci
  { set: 'kunci', detik: '20-24', kam: K([1.0, 9.6, 5.2], [0.35, 9.0, 0], 30), teks: 'Ring pegasnya tinggal ditekan. Dari ransel pindah ke kunci motor, sekali klik.' },
  // daya tahan: makro tab webbing yang dijahit palang dan jahitan feston yang rapat
  { set: 'ransel', detik: '24-28', kam: K([-0.25, 6.6, 3.7], [-0.95, 6.3, 1.0], 22), teks: 'Tab-nya dijahit palang dua baris, jahitan tepinya rapat. Ditarik-tarik tiap hari, tetap kuat.' },
  { set: 'ransel', detik: '28-31', kam: K([0, 9, 19], [0, 7, 0], 34), teks: 'Sebulan kemudian masih rapi. Tiap seri baru, mereka bukanya bareng.' },
  { set: 'penutup', detik: '31-34', kam: K([0, -0.7, 9.5], [0, -0.7, 0], 34), teks: 'Kamu dapat yang mana?' },
];
export const STORY_TUKERAN_FRAMES = BINGKAI.length;

const Adegan: React.FC<{ b: Bingkai; kam?: Kam }> = ({ b, kam }) => {
  const { gl, scene, camera, advance } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const isi = useMemo(() => {
    scene.fog = null;
    if (b.set === 'bazar' || b.set === 'bazar-lirik') return setBazar(scene, gl, b.set === 'bazar-lirik');
    if (b.set === 'kantin') return setKantin(scene, gl);
    if (b.set === 'ransel') return setRansel(scene, gl);
    if (b.set === 'kunci') return setKunci(scene, gl);
    return setPenutup(scene, gl);
  }, [b.set, gl, scene]);
  // label kantong memakai logo yang dimuat asinkron
  useEffect(() => {
    const h = delayRender('logo label');
    const adaKantong = b.set === 'bazar' || b.set === 'bazar-lirik' || b.set === 'kantin' || b.set === 'kunci';
    Promise.all([logoSiap(), adaKantong ? labelSiap() : Promise.resolve()]).then(() => {
      advance(performance.now());
      continueRender(h);
    });
  }, [advance, b.set]);
  const k = kam ?? b.kam;
  camera.position.copy(k.p);
  camera.lookAt(k.l);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = k.fov;
  cam.near = 0.05;
  cam.far = 1500;
  cam.updateProjectionMatrix();
  return <primitive object={isi} />;
};

export const StoryTukeranFrame: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = BINGKAI[Math.min(f, BINGKAI.length - 1)];
  const [siap, setSiap] = useState(false);
  const [h] = useState(() => delayRender('font tukeran'));
  useEffect(() => {
    Promise.all([gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(h);
    });
  }, [h]);
  if (!siap) return <AbsoluteFill style={{ background: '#111' }} />;
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.05, far: 1500 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan b={b} />
      </ThreeCanvas>
      {b.set === 'penutup' && (
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 300 }}>
          <Img src={logoUrl} style={{ width: 640 }} />
        </AbsoluteFill>
      )}
      <div style={{ position: 'absolute', left: 90, right: 90, ...(b.set === 'penutup' ? { top: 760 } : { bottom: 300 }), textAlign: 'center', fontFamily: gochi.fontFamily, fontSize: 58, lineHeight: 1.25, color: '#FFF8F1', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{b.teks}</div>
      <div style={{ position: 'absolute', left: 36, top: 36, fontFamily: poppins.fontFamily, fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>
        {f + 1}/{BINGKAI.length} · detik {b.detik}
      </div>
    </AbsoluteFill>
  );
};
