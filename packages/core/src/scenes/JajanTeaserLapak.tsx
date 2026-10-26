// Teaser "Lapak Baru" Jajan Dulu!, 30 detik, 9:16 (brief: jajan_dulu/konten/brief/00-teaser.md).
// Tiap shot punya set 3D dan kameranya sendiri di dalam <Sequence>, jadi hanya satu kanvas WebGL yang hidup
// pada satu waktu. Shot 4 memakai adegan dari JajanLapak.tsx. Semua nilai dihitung dari frame.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { buatCharm, type CharmId } from '../../../three/src/jajan/charm';
import { buatKantong } from '../../../three/src/jajan/kantong';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { inOut, kf, outE, pop, prog } from './motion';
import { rng } from './kit';
import { AdeganAngkat, kanvasTekstur, teksturAnyam, teksturDaun } from './JajanLapak';
import { aturKaki as aturKakiRig, aturTangan, buatKaki as buatKakiRig, buatTangan, campurPose, kunciJepit, letakkanJepit, POSE, siklusJalan, type RigKaki } from '../../../three/src/jajan/tubuh';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);

// Jadwal shot (detik), mengikuti brief.
const SHOT = {
  hook: [0, 0.4],
  pasar: [0.4, 3.0],
  kakiMeja: [3.0, 6.0],
  label: [6.0, 9.0],
  angkat: [9.0, 12.0],
  makro: [12.0, 18.0],
  kartu: [18.0, 22.0],
  simpan: [22.0, 26.0],
  penutup: [26.0, 30.0],
} as const;
export const TEASER_LAPAK_FRAMES = s(30);

export const URUT: CharmId[] = ['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'];
const MIRING_BELAKANG = THREE.MathUtils.degToRad(-115);

// ---------------------------------------------------------------------------------------------------------------
// Bahan bersama

/** Ubin semen pasar yang masih basah. */
export const teksturUbin = () =>
  kanvasTekstur(
    512,
    512,
    (g) => {
      const R = rng(31);
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          const v = 120 + R() * 30;
          g.fillStyle = `rgb(${v},${v - 6},${v - 14})`;
          g.fillRect(x * 128, y * 128, 128, 128);
          for (let i = 0; i < 300; i++) {
            g.fillStyle = `rgba(0,0,0,${R() * 0.08})`;
            g.fillRect(x * 128 + R() * 128, y * 128 + R() * 128, 2, 2);
          }
        }
      g.strokeStyle = 'rgba(40,32,26,0.8)';
      g.lineWidth = 5;
      for (let i = 0; i <= 4; i++) {
        g.beginPath();
        g.moveTo(i * 128, 0);
        g.lineTo(i * 128, 512);
        g.stroke();
        g.beginPath();
        g.moveTo(0, i * 128);
        g.lineTo(512, i * 128);
        g.stroke();
      }
    },
    8,
  );

/** Kayu meja dengan cat hijau yang mengelupas. */
export const teksturKayuCat = () =>
  kanvasTekstur(256, 512, (g) => {
    const R = rng(17);
    g.fillStyle = '#7A5634';
    g.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 90; i++) {
      g.strokeStyle = `rgba(40,24,12,${0.15 + R() * 0.25})`;
      g.lineWidth = 1 + R() * 2;
      const x = R() * 256;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + 10, 170, x - 10, 340, x + 4, 512);
      g.stroke();
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = '#4F7A5A';
      g.beginPath();
      g.ellipse(R() * 256, R() * 512, 10 + R() * 40, 20 + R() * 70, R(), 0, Math.PI * 2);
      g.fill();
    }
  });

/** Karton dengan tulisan tangan spidol, untuk label lapak dan kartu nomor. */
export function teksturTulisan(teks: string, opsi: { w?: number; h?: number; latar?: string; font?: string; warna?: string; ukuran?: number } = {}) {
  const { w = 512, h = 256, latar = '#E9D9B8', font = gochi.fontFamily, warna = '#1E1411', ukuran = 120 } = opsi;
  return kanvasTekstur(w, h, (g) => {
    const R = rng(teks.length * 7);
    g.fillStyle = latar;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(90,60,30,${R() * 0.12})`;
      g.fillRect(R() * w, R() * h, 3, 1);
    }
    g.fillStyle = warna;
    g.font = `${ukuran}px "${font}"`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.save();
    g.translate(w / 2, h / 2 + 6);
    g.rotate(-0.04);
    g.fillText(teks, 0, 0);
    g.restore();
  });
}

export function lampuPagi(g: THREE.Group, kuat = 1) {
  const matahari = new THREE.DirectionalLight('#ffd9a6', 3.2 * kuat);
  matahari.position.set(-4, 3.2, 2.5);
  matahari.castShadow = true;
  matahari.shadow.mapSize.set(2048, 2048);
  const c = matahari.shadow.camera;
  c.left = c.bottom = -6;
  c.right = c.top = 6;
  matahari.shadow.bias = -0.0005;
  matahari.shadow.radius = 4;
  g.add(matahari);
  const tepi = new THREE.DirectionalLight('#ffc27a', 2 * kuat);
  tepi.position.set(2.5, 2.5, -4);
  g.add(tepi);
}

/** Bulatan cahaya hangat di latar (pengganti bokeh) dan kabut pasar. */
export function latarPasar(g: THREE.Group, scene: THREE.Scene, seed: number, jauh = -6) {
  const R = rng(seed);
  const bulat = kanvasTekstur(128, 128, (c) => {
    const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,220,160,0.9)');
    gr.addColorStop(0.55, 'rgba(255,200,130,0.45)');
    gr.addColorStop(1, 'rgba(255,190,120,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, 128, 128);
  });
  for (let i = 0; i < 22; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bulat, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.3 + R() * 0.4 }));
    const k = 0.6 + R() * 1.2;
    sp.scale.set(k, k, 1);
    sp.position.set(-6 + R() * 12, 1 + R() * 4, jauh - R() * 5);
    g.add(sp);
  }
  for (let i = 0; i < 12; i++) {
    const peti = new THREE.Mesh(new THREE.BoxGeometry(0.8 + R() * 1.4, 0.6 + R() * 1.6, 0.8), new THREE.MeshStandardMaterial({ color: R() > 0.5 ? '#6B4A2E' : '#4A6B3A', roughness: 0.9 }));
    peti.position.set(-7 + R() * 14, 0.2 + R(), jauh - R() * 5);
    g.add(peti);
  }
  scene.fog = new THREE.Fog('#4a3020', 6, 18);
}

/** Debu yang melayang di berkas sinar; posisi dihitung dari frame. */
export function buatDebu(n: number, seed: number) {
  const R = rng(seed);
  const tex = kanvasTekstur(32, 32, (c) => {
    const gr = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,236,200,1)');
    gr.addColorStop(1, 'rgba(255,236,200,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, 32, 32);
  });
  const g = new THREE.Group();
  const data = Array.from({ length: n }, () => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 + R() * 0.4 }));
    const k = 0.03 + R() * 0.05;
    sp.scale.set(k, k, 1);
    g.add(sp);
    return { sp, x: -2 + R() * 4, y: R() * 4, z: -1 + R() * 3, v: 0.002 + R() * 0.004, f: R() * 100 };
  });
  const atur = (t: number) => {
    for (const d of data) d.sp.position.set(d.x + Math.sin((t + d.f) / 70) * 0.2, (d.y + t * d.v) % 4, d.z + Math.cos((t + d.f) / 90) * 0.15);
  };
  return { g, atur };
}

/** Berkas sinar pagi: bidang tipis bercahaya yang memudar ke tepi. */
export function buatBerkas(lebar: number, tinggi: number) {
  const tex = kanvasTekstur(64, 256, (c) => {
    const gr = c.createLinearGradient(0, 0, 64, 0);
    gr.addColorStop(0, 'rgba(255,220,160,0)');
    gr.addColorStop(0.5, 'rgba(255,220,160,0.55)');
    gr.addColorStop(1, 'rgba(255,220,160,0)');
    c.fillStyle = gr;
    c.fillRect(0, 0, 64, 256);
    const gv = c.createLinearGradient(0, 0, 0, 256);
    gv.addColorStop(0, 'rgba(0,0,0,0)');
    gv.addColorStop(0.3, 'rgba(0,0,0,1)');
    c.globalCompositeOperation = 'destination-in';
    c.fillStyle = gv;
    c.fillRect(0, 0, 64, 256);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(lebar, tinggi),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
  );
}

/** Tampah bambu beralas daun pisang, berpusat di titik asal, permukaan daun di y = 0. */
export function buatTampahDaun(r = 3.4) {
  const g = new THREE.Group();
  const tampah = new THREE.Mesh(new THREE.CylinderGeometry(r, r - 0.1, 0.12, 64), new THREE.MeshStandardMaterial({ map: teksturAnyam(), roughness: 0.85 }));
  tampah.position.y = -0.07;
  tampah.receiveShadow = true;
  const bibir = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 12, 80), new THREE.MeshStandardMaterial({ color: '#8C6237', roughness: 0.8 }));
  bibir.rotation.x = Math.PI / 2;
  const daun = new THREE.Mesh(new THREE.CircleGeometry(r - 0.5, 48), new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.55 }));
  daun.rotation.x = -Math.PI / 2;
  daun.rotation.z = 0.5;
  daun.position.y = 0.001;
  daun.receiveShadow = true;
  g.add(tampah, bibir, daun);
  return g;
}

/** Charm yang rebah di daun: ring di belakang badan, jadi dari depan terlihat seperti jajanan. */
export function charmRebah(id: CharmId) {
  const c = buatCharm(id);
  const poros = new THREE.Group();
  c.grup.rotation.x = MIRING_BELAKANG;
  poros.add(c.grup);
  poros.position.y = 0.335;
  return poros;
}

/** Barisan lima jajanan di tampah, kartu 01-05 di depannya, dan tempat keenam yang ditutup kertas cokelat. */
function buatBarisan() {
  const g = new THREE.Group();
  g.add(buatTampahDaun(3.6));
  const posisi = (i: number) => new THREE.Vector3(-2.6 + i * 1.04, 0, 0.3);
  URUT.forEach((id, i) => {
    const c = charmRebah(id);
    c.position.add(posisi(i));
    c.rotation.y = (i % 2 ? -1 : 1) * 0.12;
    g.add(c);
  });
  // Kartu nomor 01-05 berdiri di depan tiap jajanan. Tempat keenam hanya punya kertas penutup "06 / ?".
  const kartu: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.3),
      new THREE.MeshStandardMaterial({ map: teksturTulisan(`0${i + 1}`, { w: 256, h: 168, latar: '#F3E9D4', ukuran: 110 }), roughness: 0.9 }),
    );
    m.position.copy(posisi(i)).add(new THREE.Vector3(0, 0.16, 0.95));
    m.rotation.x = -0.25;
    m.castShadow = true;
    g.add(m);
    kartu.push(m);
  }
  // Tempat keenam: kertas kraft dilipat seperti tenda dengan tulisan "06 / ?".
  const kraft = new THREE.MeshStandardMaterial({ map: teksturTulisan('06 / ?', { w: 512, h: 384, latar: '#C89B6D', ukuran: 130 }), roughness: 0.95, side: THREE.DoubleSide });
  const kraftPolos = new THREE.MeshStandardMaterial({ color: '#B88A5C', roughness: 0.95, side: THREE.DoubleSide });
  const tenda = new THREE.Group();
  const depan = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.75), kraft);
  depan.position.set(0, 0.32, 0.17);
  depan.rotation.x = -0.45;
  const belakang = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.75), kraftPolos);
  belakang.position.set(0, 0.32, -0.17);
  belakang.rotation.x = 0.45;
  depan.castShadow = belakang.castShadow = true;
  tenda.add(depan, belakang);
  tenda.position.copy(posisi(5));
  g.add(tenda);
  return { g, posisi, kartu, tenda };
}

// ---------------------------------------------------------------------------------------------------------------
// Kaki pejalan untuk shot pasar: rig dua kaki (IK dua tulang) dengan siklus jalan dari tubuh.ts.

export const PINGGUL = 9.2;
export const LANGKAH = 3.2;

type Pejalan = { kiri: RigKaki; kanan: RigKaki; asal: THREE.Vector3; arah: THREE.Vector3; periode: number; fase: number };

export function buatPejalan(warnaSandal: string, celana: string, asal: THREE.Vector3, arah: THREE.Vector3, periode: number, fase: number, kulit?: string): Pejalan {
  const kiri = buatKakiRig(warnaSandal, { celana, kulit });
  const kanan = buatKakiRig(warnaSandal, { celana, kulit });
  return { kiri, kanan, asal, arah: arah.clone().normalize(), periode, fase };
}

/**
 * Tubuh maju dengan kecepatan tetap. Kecepatan dipilih sama dengan kecepatan kaki tumpu mundur relatif terhadap
 * pinggul (langkah / lama fase tumpu), jadi telapak yang menapak benar-benar diam di lantai (tidak tergelincir).
 */
export function aturPejalan(p: Pejalan, t: number) {
  const kec = LANGKAH / (0.62 * p.periode);
  const maju = t * kec;
  const fase = ((t + p.fase) % p.periode) / p.periode;
  const pinggul = p.asal.clone().addScaledVector(p.arah, maju);
  const hadap = Math.atan2(p.arah.x, p.arah.z);
  const samping = new THREE.Vector3(p.arah.z, 0, -p.arah.x);
  const bob = Math.abs(Math.sin(fase * Math.PI * 2)) * 0.15;
  [p.kiri, p.kanan].forEach((kaki, i) => {
    const s = siklusJalan((fase + i * 0.5) % 1, LANGKAH, PINGGUL);
    aturKakiRig(kaki, s.target, s.pitch, s.jari);
    kaki.akar.position.copy(pinggul).addScaledVector(samping, i ? 0.48 : -0.48);
    kaki.akar.position.y = PINGGUL + bob;
    kaki.akar.rotation.y = hadap;
  });
}
// ---------------------------------------------------------------------------------------------------------------
// Pengaturan render bersama untuk tiap kanvas

export function useDasar(paparan = 0.95) {
  const { gl } = useThree();
  gl.toneMappingExposure = paparan;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
}

export const Kanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ fov: 28, near: 0.05, far: 80 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
      {children}
    </ThreeCanvas>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 1: pasar dari ketinggian semut

const AdeganPasar: React.FC<{ t: number }> = ({ t }) => {
  useDasar(1);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.4));
    lampuPagi(g);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: teksturUbin(), roughness: 0.35, metalness: 0.05 }));
    lantai.rotation.x = -Math.PI / 2;
    lantai.receiveShadow = true;
    g.add(lantai);
    // Sampah pasar: potongan daun pisang dan karet gelang.
    const R = rng(4);
    for (let i = 0; i < 10; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + R(), 0.5 + R() * 0.6), new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.6, side: THREE.DoubleSide }));
      d.rotation.set(-Math.PI / 2, 0, R() * 6);
      d.position.set(-6 + R() * 12, 0.01, -2 - R() * 18);
      g.add(d);
    }
    for (let i = 0; i < 6; i++) {
      const k = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 20), new THREE.MeshStandardMaterial({ color: ['#D9423A', '#E8B030', '#3E7AC2'][i % 3], roughness: 0.6 }));
      k.rotation.x = Math.PI / 2;
      k.position.set(-4 + R() * 8, 0.03, -1 - R() * 10);
      g.add(k);
    }
    latarPasar(g, scene, 8, -14);
    const berkas = buatBerkas(3, 9);
    berkas.position.set(-1.2, 3.5, -5);
    berkas.rotation.set(0, 0.3, -0.45);
    g.add(berkas);
    const debu = buatDebu(40, 3);
    debu.g.position.set(-1, 0, -4);
    g.add(debu.g);
    // Pejalan: sandal hijau yang diikuti kamera, dan dua pasang lain yang memotong frame.
    const pejalan = [
      buatPejalan('#3E8A4A', '#3B4A5C', new THREE.Vector3(0.2, 0, 2), new THREE.Vector3(0, 0, -1), 72, 0),
      buatPejalan('#2B5DAA', '#6B4A3A', new THREE.Vector3(-11, 0, -2.5), new THREE.Vector3(1, 0, 0.05), 58, 20, '#B57E5A'),
      buatPejalan('#B03A2E', '#2E3A2A', new THREE.Vector3(11, 0, -7), new THREE.Vector3(-1, 0, 0), 64, 9, '#D9A27E'),
    ];
    pejalan.forEach((p) => g.add(p.kiri.akar, p.kanan.akar));
    return { g, debu, pejalan };
  }, [gl, scene]);

  isi.pejalan.forEach((p) => aturPejalan(p, t));
  isi.debu.atur(t);
  // Kamera di ketinggian semut, mengikuti sandal hijau dari belakang.
  const ikut = isi.pejalan[0].kiri.akar.position.z;
  camera.position.set(0.6, 0.3, ikut + 6.5);
  camera.lookAt(0.2, 0.55, ikut - 2);
  (camera as THREE.PerspectiveCamera).fov = 52;
  camera.updateProjectionMatrix();
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 2: kamera naik menyusuri kaki meja sampai tangan meletakkan tampah

const AdeganKakiMeja: React.FC<{ t: number }> = ({ t }) => {
  useDasar(1);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.4));
    lampuPagi(g);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: teksturUbin(), roughness: 0.4 }));
    lantai.rotation.x = -Math.PI / 2;
    lantai.receiveShadow = true;
    g.add(lantai);
    const kayu = new THREE.MeshStandardMaterial({ map: teksturKayuCat(), roughness: 0.85 });
    const TINGGI = 8;
    for (const x of [-4, 4])
      for (const z of [-2.5, 2]) {
        const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.5, TINGGI, 0.5), kayu);
        kaki.position.set(x, TINGGI / 2, z);
        kaki.castShadow = true;
        g.add(kaki);
      }
    const papan = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.35, 5.6), kayu);
    papan.position.set(0, TINGGI + 0.17, -0.25);
    papan.castShadow = papan.receiveShadow = true;
    g.add(papan);
    // Kolong meja: karung beras dan keranjang bambu.
    const karung = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshStandardMaterial({ color: '#CDBB93', roughness: 1, map: teksturAnyam() }));
    karung.scale.set(1.3, 1.6, 1.1);
    karung.position.set(-1.6, 1.5, -1);
    const keranjang = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.8, 1.4, 24, 1, true), new THREE.MeshStandardMaterial({ map: teksturAnyam(), roughness: 0.9, side: THREE.DoubleSide }));
    keranjang.position.set(1.4, 0.7, -0.6);
    g.add(karung, keranjang);
    latarPasar(g, scene, 9, -10);
    // Tampah yang diletakkan, dan dua tangan penjual yang memegang bibirnya.
    const tampah = new THREE.Group();
    const set = buatBarisan();
    tampah.add(set.g);
    tampah.scale.setScalar(0.8);
    // Dua tangan penjual (skala 1: set meja memakai 1 unit = 10 cm) memegang bibir tampah dari depan.
    const tanganKiri = buatTangan(-1, { lenganBaju: '#8A6A4A', kulit: '#C68A62' });
    const tanganKanan = buatTangan(1, { lenganBaju: '#8A6A4A', kulit: '#C68A62' });
    aturTangan(tanganKiri, POSE.pegang);
    aturTangan(tanganKanan, POSE.pegang);
    g.add(tampah, tanganKiri.akar, tanganKanan.akar);
    return { g, tampah, TINGGI, tanganKiri, tanganKanan };
  }, [gl, scene]);

  // Kamera: dari dekat lantai menyusuri kaki meja depan-kanan sampai di atas tepi meja.
  const naik = prog(t, s(0.1), s(2.3), inOut);
  // Naik cepat melewati tebal papan meja (tidak berlama-lama sejajar tepi papan), lalu melihat tampah dari atas.
  const naikCepat = naik < 0.55 ? naik : 0.55 + (naik - 0.55) * 0.6;
  camera.position.set(6.2 - naik * 4.6, 0.7 + naikCepat * 15.5, 9 + naik * 1.2);
  camera.lookAt(4 - naik * 4, 1.4 + naik * 7.1, 2 - naik * 2.2);
  (camera as THREE.PerspectiveCamera).fov = 40;
  camera.updateProjectionMatrix();
  // Tampah turun ke meja dan berhenti dengan sedikit pantulan; tangan lalu terangkat pergi.
  const turun = prog(t, s(1.5), s(2.35), outE);
  const atasMeja = isi.TINGGI + 0.35 + 0.1;
  isi.tampah.position.set(0, atasMeja + (1 - turun) * 1.6, 0);
  // Tangan ikut turun bersama tampah, lalu melepas (jari membuka) dan terangkat pergi.
  const lepas = prog(t, s(2.45), s(3.0), inOut);
  const yBibir = isi.tampah.position.y + 0.05 + lepas * 2.5;
  [
    { rig: isi.tanganKiri, x: -2.7, arah: new THREE.Vector3(0.55, -0.25, -0.8) },
    { rig: isi.tanganKanan, x: 2.7, arah: new THREE.Vector3(-0.55, -0.25, -0.8) },
  ].forEach(({ rig, x, arah }) => {
    aturTangan(rig, campurPose(POSE.pegang, POSE.terbuka, prog(t, s(2.35), s(2.6), inOut)));
    letakkanJepit(rig, new THREE.Vector3(x, yBibir, 0.7), arah, 0);
  });
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 3: makro menyamping melewati label tulisan tangan

const AdeganLabel: React.FC<{ t: number }> = ({ t }) => {
  useDasar(0.95);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.35));
    lampuPagi(g);
    const set = buatBarisan();
    g.add(set.g);
    // Label karton di lidi, berdiri di depan tampah.
    ['Klepon', 'Onde-onde', 'Kue Lapis'].forEach((teks, i) => {
      const papan = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.36), new THREE.MeshStandardMaterial({ map: teksturTulisan(teks, { ukuran: 96 }), roughness: 0.95, side: THREE.DoubleSide }));
      const x = set.posisi(i).x;
      papan.position.set(x, 0.55, 2.0);
      papan.rotation.set(-0.08, (i - 1) * 0.08, (i % 2 ? 1 : -1) * 0.05);
      papan.castShadow = true;
      const lidi = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 6), new THREE.MeshStandardMaterial({ color: '#C9A15C', roughness: 0.8 }));
      lidi.position.set(x, 0.2, 1.99);
      g.add(papan, lidi);
    });
    latarPasar(g, scene, 10, -8);
    // Tangan yang menggeser selembar daun.
    const tangan = buatTangan(1, { skala: 1.6, lenganBaju: '#8A6A4A', kulit: '#C68A62' });
    g.add(tangan.akar);
    return { g, tangan, set };
  }, [gl, scene]);

  const geser = prog(t, 0, s(3.0), inOut);
  camera.position.set(-3.4 + geser * 3.6, 1.25, 6.2);
  camera.lookAt(-2.4 + geser * 3.6, 0.35, 0.8);
  // Tangan masuk dari kanan atas, menyentuh daun di depan onde-onde, lalu pergi.
  const datang = prog(t, s(0.8), s(1.6), outE) * (1 - prog(t, s(2.2), s(2.9), inOut));
  // Tangan menyentuh daun di belakang barisan label supaya tidak menutupi tulisannya.
  const target = isi.set.posisi(1).clone().add(new THREE.Vector3(0.55, 0.05, -0.35));
  // Jari menyentuh daun lalu sedikit menggeser; telapak membuka santai.
  aturTangan(isi.tangan, campurPose(POSE.rileks, POSE.terbuka, 0.5));
  const titikSentuh = new THREE.Vector3(3.2, 3.4, -0.6).lerp(target, datang).add(new THREE.Vector3(-prog(t, s(1.6), s(2.2), inOut) * 0.25, 0, 0));
  letakkanJepit(isi.tangan, titikSentuh, new THREE.Vector3(-0.55, -1, -0.15), -1.6);
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 5: lima potongan makro dengan gerak mikro

// Kamera makro sekitar 2-2,6 unit dari badan: cukup dekat untuk memenuhi frame dengan tekstur, tapi tidak masuk
// ke dalam benda. `lihat` relatif ke posisi slot di tampah.
const KAMERA_MAKRO: { id: CharmId; i: number; dari: [number, number, number]; ke: [number, number, number]; lihat: [number, number, number] }[] = [
  { id: 'onde-onde', i: 1, dari: [-1.2, 1.5, 1.9], ke: [-0.6, 1.4, 1.7], lihat: [0, 0.45, 0.2] },
  { id: 'kue-lapis', i: 2, dari: [0.2, 1.9, 1.6], ke: [0.2, 0.9, 2.0], lihat: [0, 0.4, 0.2] },
  { id: 'kue-lumpur', i: 3, dari: [0.3, 1.8, 2.4], ke: [0.1, 1.4, 1.7], lihat: [0, 0.4, 0.1] },
  { id: 'klepon', i: 0, dari: [1.5, 1.6, 2.8], ke: [1.0, 1.45, 2.5], lihat: [0.2, 0.6, 0.4] },
  { id: 'serabi', i: 4, dari: [-1.4, 1.3, 1.6], ke: [1.4, 1.3, 1.6], lihat: [0, 0.35, 0.1] },
];

const AdeganMakro: React.FC<{ t: number; ke: number }> = ({ t, ke }) => {
  useDasar(0.95);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.4));
    lampuPagi(g);
    const set = buatBarisan();
    g.add(set.g);
    scene.fog = new THREE.Fog('#4a3020', 4, 11);
    // Jarum dan benang krem untuk potongan klepon.
    const jarum = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.008, 0.6, 12), new THREE.MeshStandardMaterial({ color: '#D8D8DE', metalness: 1, roughness: 0.2 }));
    g.add(jarum);
    const benangMat = new THREE.MeshStandardMaterial({ color: '#F4EBD5', roughness: 0.9 });
    const benang = new THREE.Mesh(new THREE.BufferGeometry(), benangMat);
    g.add(benang);
    return { g, set, jarum, benang };
  }, [gl, scene]);

  const k = KAMERA_MAKRO[ke];
  const pusat = isi.set.posisi(k.i);
  const p = prog(t, 0, s(1.2), (x) => x);
  const dari = new THREE.Vector3(...k.dari);
  const keV = new THREE.Vector3(...k.ke);
  camera.position.copy(pusat).add(dari.lerp(keV, p));
  camera.lookAt(pusat.clone().add(new THREE.Vector3(...k.lihat)));
  camera.rotation.z += (ke % 2 ? 1 : -1) * 0.04 * p;

  // Jarum menarik benang keluar dari jahitan tepi klepon.
  const tampakJarum = k.id === 'klepon';
  isi.jarum.visible = isi.benang.visible = tampakJarum;
  if (tampakJarum) {
    const tarik = prog(t, s(0.1), s(1.1), outE);
    const asal = pusat.clone().add(new THREE.Vector3(0.32, 0.55, 0.62));
    const ujung = asal.clone().add(new THREE.Vector3(0.25 + tarik * 0.35, 0.3 + tarik * 0.4, 0.15));
    isi.jarum.position.copy(ujung).add(new THREE.Vector3(0.05, 0.12, 0));
    isi.jarum.rotation.z = -0.6;
    isi.benang.geometry.dispose();
    isi.benang.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(asal, asal.clone().lerp(ujung, 0.5).add(new THREE.Vector3(0, -0.06, 0)), ujung), 20, 0.016, 8);
  }
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 6: kamera menyusuri kartu 01-05 dan berhenti di tempat keenam

const AdeganKartu: React.FC<{ t: number }> = ({ t }) => {
  useDasar(0.9);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.3));
    lampuPagi(g, 0.7);
    const set = buatBarisan();
    g.add(set.g);
    latarPasar(g, scene, 11, -7);
    // Satu garis cahaya sempit yang jatuh di kertas 06.
    const sorot = new THREE.SpotLight('#ffd9a0', 0, 8, 0.16, 0.5, 1.2);
    sorot.position.copy(set.posisi(5)).add(new THREE.Vector3(-0.6, 4, 1.4));
    sorot.target.position.copy(set.posisi(5)).add(new THREE.Vector3(0, 0.3, 0.1));
    g.add(sorot, sorot.target);
    return { g, set, sorot };
  }, [gl, scene]);

  const sisir = prog(t, 0, s(3.2), (x) => 1 - Math.pow(1 - x, 2.4));
  const x0 = isi.set.posisi(0).x - 0.4;
  const x1 = isi.set.posisi(5).x;
  camera.position.set(x0 + (x1 - x0) * sisir, 1.5, 5.6 - sisir * 1.4);
  camera.lookAt(x0 + (x1 - x0) * sisir, 0.35, 0.6);
  isi.sorot.intensity = prog(t, s(2.4), s(3.4), inOut) * 30;
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 7: tangan berhenti di atas kertas 06; tangan lain memasukkan satu gantungan ke kantong

const AdeganSimpan: React.FC<{ t: number }> = ({ t }) => {
  useDasar(0.95);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.35));
    lampuPagi(g, 0.8);
    const set = buatBarisan();
    g.add(set.g);
    scene.fog = new THREE.Fog('#4a3020', 5, 14);
    // Kantong kecil di depan tampah, di sebelah kiri tempat keenam.
    const kantong = buatKantong();
    kantong.grup.scale.setScalar(0.55);
    kantong.grup.position.copy(set.posisi(5)).add(new THREE.Vector3(-1.3, 0, 1.7));
    kantong.grup.rotation.y = 0.25;
    g.add(kantong.grup);
    const tanganTahan = buatTangan(1, { skala: 1.6, lenganBaju: '#8A6A4A', kulit: '#C68A62' });
    const tanganAmbil = buatTangan(-1, { skala: 1.6, lenganBaju: '#5C6B7A' });
    g.add(tanganTahan.akar, tanganAmbil.akar);
    // Gantungan yang dimasukkan: hanya ring yang terlihat, badannya gelap (karakter rahasia).
    const rahasia = buatCharm('secret');
    // Hanya ring dan pitanya yang boleh terlihat; badan karakter rahasia disembunyikan.
    const isiRahasia = rahasia.grup.children[0];
    const badanRahasia = isiRahasia.children.find((o) => (o as THREE.Mesh).isMesh);
    if (badanRahasia) badanRahasia.visible = false;
    const poros = new THREE.Group();
    rahasia.grup.position.y = -0.785;
    poros.add(rahasia.grup);
    g.add(poros);
    return { g, set, kantong, tanganTahan, tanganAmbil, poros };
  }, [gl, scene]);

  const p6 = isi.set.posisi(5);
  // Tangan penjual mendekati kertas 06, lalu berhenti dan tertahan.
  const dekat = prog(t, 0, s(1.0), outE);
  // Jari sedikit menekuk ragu; telapak gemetar halus tepat sebelum menyentuh kertas.
  aturTangan(isi.tanganTahan, campurPose(POSE.terbuka, POSE.rileks, 0.4 + 0.25 * dekat));
  const titikTahan = new THREE.Vector3(p6.x + 0.6, 3.2, 0.9).lerp(p6.clone().add(new THREE.Vector3(0.55, 1.55, 0.15)), dekat);
  titikTahan.y += Math.sin(t / 7) * 0.012 * dekat;
  letakkanJepit(isi.tanganTahan, titikTahan, new THREE.Vector3(0.15, -1, -0.35), -1.4);

  // Gantungan masuk dari atas ke mulut kantong, lalu tutup terlipat dan stiker ditekan.
  const mulut = isi.kantong.grup.position.clone().add(new THREE.Vector3(0, 1.9 * 0.55, 0));
  const masuk = prog(t, s(1.1), s(2.2), inOut);
  const titik = new THREE.Vector3(mulut.x + 0.8, mulut.y + 2.6, mulut.z + 0.6).lerp(mulut.clone().add(new THREE.Vector3(0, 0.6, 0)), masuk);
  titik.y -= prog(t, s(2.2), s(2.5), inOut) * 0.9;
  isi.poros.position.copy(titik);
  isi.poros.rotation.z = Math.sin(t / 12) * 0.08 * (1 - masuk);
  isi.poros.visible = t < s(2.55);
  isi.poros.scale.setScalar(0.7);
  // Tangan kedua menjepit ring selama turun, melepas di mulut kantong, lalu terangkat pergi.
  const lepasAmbil = prog(t, s(2.45), s(2.7), inOut);
  aturTangan(isi.tanganAmbil, campurPose(POSE.jepit, POSE.terbuka, lepasAmbil));
  kunciJepit(isi.tanganAmbil, 1 - lepasAmbil);
  const titikAmbil = titik.clone().add(new THREE.Vector3(0, prog(t, s(2.55), s(3.4), inOut) * 3.2, 0));
  letakkanJepit(isi.tanganAmbil, titikAmbil, new THREE.Vector3(-0.3, -1, 0.25), -1.9);
  const tutup = prog(t, s(2.6), s(3.2), inOut);
  isi.kantong.setBuka(1 - tutup);
  isi.kantong.setCahaya(0);

  camera.position.set(p6.x - 0.6, 3.3, 8.6);
  camera.lookAt(p6.x - 0.55, 1.2, 1.1);
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 8: kantong menunggu di tepi tampah

const AdeganPenutup: React.FC<{ t: number }> = ({ t }) => {
  useDasar(0.95);
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.35));
    lampuPagi(g, 0.85);
    const set = buatBarisan();
    g.add(set.g);
    scene.fog = new THREE.Fog('#4a3020', 4, 11);
    const kantong = buatKantong();
    kantong.grup.scale.setScalar(0.75);
    kantong.grup.position.set(set.posisi(5).x - 0.2, 0, 2.6);
    kantong.grup.rotation.y = -0.25;
    g.add(kantong.grup);
    const debu = buatDebu(30, 8);
    debu.g.position.set(set.posisi(5).x - 1, 0, 1.5);
    g.add(debu.g);
    return { g, set, kantong, debu };
  }, [gl, scene]);

  isi.debu.atur(t);
  const dorong = prog(t, 0, s(4), (x) => x) * 0.4;
  const pusat = isi.kantong.grup.position;
  // Kantong di sepertiga atas frame, ruang bawah untuk logo dan ajakan.
  camera.position.set(pusat.x + 0.3, 1.1, pusat.z + 7.2 - dorong);
  camera.lookAt(pusat.x, 0.25, pusat.z - 0.5);
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Teks di layar

export const TeksTangan: React.FC<{ t: number; teks: string; masuk: number; keluar?: number; bawah?: number; kiri?: boolean }> = ({ t, teks, masuk, keluar, bawah = 330, kiri = true }) => {
  const o = prog(t, masuk, masuk + 18) * (keluar ? 1 - prog(t, keluar - 14, keluar, inOut) : 1);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: kiri ? 'flex-start' : 'center', padding: `0 80px ${bawah}px` }}>
      <div
        style={{
          fontFamily: gochi.fontFamily,
          fontSize: 66,
          lineHeight: 1.1,
          color: '#FFF8F1',
          textShadow: '0 3px 16px rgba(0,0,0,0.6)',
          opacity: o,
          transform: `translateY(${(1 - prog(t, masuk, masuk + 24, outE)) * 18}px) rotate(-2deg)`,
          maxWidth: 820,
        }}
      >
        {teks}
      </div>
    </AbsoluteFill>
  );
};

const KartuPenutup: React.FC<{ t: number }> = ({ t }) => {
  const logo = pop(t, s(2.0), 5);
  const sub1 = prog(t, s(2.5), s(2.9));
  const sub2 = prog(t, s(3.0), s(3.4));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300 }}>
      <div style={{ fontFamily: bagel.fontFamily, fontSize: 132, color: '#FFF8F1', textShadow: '0 6px 0 #6b3a2a, 0 12px 30px rgba(0,0,0,0.4)', transform: `scale(${Math.max(0, logo)})`, lineHeight: 1 }}>Jajan Dulu!</div>
      <div style={{ fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 40, color: '#F6D77A', marginTop: 26, opacity: sub1 }}>Segera. Pre-order via WA</div>
      <div style={{ fontFamily: gochi.fontFamily, fontSize: 46, color: '#FFF8F1', marginTop: 14, opacity: sub2, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Tebak isi nomor 06 di komen.</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Suara (bank sintetis MotionKit: crowd, morning, tick, ping, cloth, knock, thud, whoosh, chime)

export const Bunyi: React.FC<{ file: string; dari: number; lama: number; vol?: number | ((f: number) => number); loop?: boolean }> = ({ file, dari, lama, vol = 0.5, loop }) => (
  <Sequence from={dari} durationInFrames={lama} layout="none">
    <Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} loop={loop} />
  </Sequence>
);

/**
 * Bunyi panjang dari file pendek yang diulang. Tidak memakai loop karena di <Audio loop> nomor frame pada fungsi
 * volume kembali ke 0 setiap pengulangan, jadi kurva volume ikut terulang. Di sini tiap potongan tahu offsetnya.
 */
export const BunyiPanjang: React.FC<{ file: string; dari: number; lama: number; durasiFile: number; vol: (f: number) => number; mulaiFile?: number }> = ({ file, dari, lama, durasiFile, vol, mulaiFile = 0 }) => {
  const potong = s(durasiFile) - s(mulaiFile) - 2;
  const n = Math.ceil(lama / potong);
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <Sequence key={k} from={dari + k * potong} durationInFrames={Math.min(potong, lama - k * potong)} layout="none">
          <Audio src={staticFile(`sfx/${file}.wav`)} startFrom={s(mulaiFile)} volume={(f) => vol(f + k * potong)} />
        </Sequence>
      ))}
    </>
  );
};

const Suara: React.FC = () => {
  const [p0] = SHOT.pasar;
  const klikAngkat = s(SHOT.angkat[0] + 1.35);
  const redam = s(SHOT.kartu[0] + 0.3);
  // Riuh pasar: penuh di awal, turun saat klik, teredam di babak misteri, hilang di penutup.
  const keramaian = (f: number) => {
    const t = f + s(p0);
    return kf(t, [
      [s(0.4), 0],
      [s(0.7), 1.0],
      [s(6), 0.9],
      [s(9), 0.55],
      [klikAngkat, 0.55],
      [klikAngkat + 12, 0.1],
      [s(18), 0.12],
      [redam, 0.02],
      [s(26), 0.02],
      [s(27.5), 0],
    ]);
  };
  return (
    <>
      <Bunyi file="ping" dari={0} lama={s(1.2)} vol={0.55} />
      <Bunyi file="tick" dari={0} lama={s(0.2)} vol={0.9} />
      <BunyiPanjang file="crowd" dari={s(p0)} lama={s(27.5)} durasiFile={8} vol={keramaian} />
      {/* lapisan kerumunan kedua, digeser supaya pola tremolonya tidak sama: riuh pasar lebih padat */}
      <BunyiPanjang file="crowd" dari={s(p0)} lama={s(27.5)} durasiFile={8} mulaiFile={3.3} vol={(f) => keramaian(f) * 0.9} />
      <BunyiPanjang file="morning" dari={s(p0)} lama={s(17)} durasiFile={20} vol={(f) => 0.12 * (1 - prog(f, s(8.5), s(10), inOut))} />
      <Bunyi file="knock" dari={s(SHOT.kakiMeja[0] + 2.35)} lama={s(0.4)} vol={0.7} />
      <Bunyi file="cloth" dari={s(SHOT.label[0] + 1.0)} lama={s(2)} vol={0.35} />
      <Bunyi file="ping" dari={klikAngkat} lama={s(1.2)} vol={0.6} />
      <Bunyi file="tick" dari={klikAngkat} lama={s(0.2)} vol={0.9} />
      {[0, 1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <Bunyi file={i % 2 ? 'cloth' : 'tick'} dari={s(SHOT.makro[0] + i * 1.2)} lama={s(1)} vol={i % 2 ? 0.45 : 0.7} />
          <Bunyi file="knock" dari={s(SHOT.makro[0] + i * 1.2 + 0.6)} lama={s(0.3)} vol={0.25} />
        </React.Fragment>
      ))}
      <BunyiPanjang file="room" dari={redam} lama={s(8)} durasiFile={8} vol={() => 0.1} />
      <Bunyi file="cloth" dari={s(SHOT.simpan[0] + 2.6)} lama={s(1.2)} vol={0.5} />
      <Bunyi file="knock" dari={s(SHOT.simpan[0] + 3.3)} lama={s(0.4)} vol={0.6} />
      <Bunyi file="chime" dari={s(SHOT.penutup[0] + 2.0)} lama={s(2.5)} vol={0.8} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Film

const Potong: React.FC<{ dari: number; ke: number; children: (t: number) => React.ReactNode }> = ({ dari, ke, children }) => {
  const f = useCurrentFrame();
  return (
    <Sequence from={s(dari)} durationInFrames={s(ke - dari)} layout="none">
      <AbsoluteFill>{children(f - s(dari))}</AbsoluteFill>
    </Sequence>
  );
};

/** Grade bersama: butiran film statis dan vinyet. Saturasi turun di babak misteri. */
export const Grade: React.FC<{ t: number }> = ({ t }) => {
  const misteri = prog(t, s(SHOT.kartu[0]), s(SHOT.kartu[0] + 0.8), inOut) * (1 - prog(t, s(SHOT.penutup[0]), s(SHOT.penutup[0] + 0.6), inOut));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: '#2a3a55', mixBlendMode: 'color', opacity: misteri * 0.22 }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(26,14,8,0.55) 100%)' }} />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <filter id="tl-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tl-grain)" opacity={0.1} style={{ mixBlendMode: 'overlay' }} />
      </svg>
    </AbsoluteFill>
  );
};

export const TeaserLapak: React.FC<{ sfx?: boolean }> = ({ sfx = false }) => {
  const t = useCurrentFrame();
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font Jajan Dulu!'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#1E1411' }} />;

  return (
    <AbsoluteFill style={{ background: '#1E1411' }}>
      <Potong dari={SHOT.pasar[0]} ke={SHOT.pasar[1]}>
        {(f) => (
          <Kanvas>
            <AdeganPasar t={f} />
          </Kanvas>
        )}
      </Potong>
      <Potong dari={SHOT.kakiMeja[0]} ke={SHOT.kakiMeja[1]}>
        {(f) => (
          <Kanvas>
            <AdeganKakiMeja t={f} />
          </Kanvas>
        )}
      </Potong>
      <Potong dari={SHOT.label[0]} ke={SHOT.label[1]}>
        {(f) => (
          <>
            <Kanvas>
              <AdeganLabel t={f} />
            </Kanvas>
            <TeksTangan t={f} teks="Ada lapak baru pagi ini." masuk={s(0.6)} keluar={s(3.0)} />
          </>
        )}
      </Potong>
      <Potong dari={SHOT.angkat[0]} ke={SHOT.angkat[1]}>
        {(f) => (
          <>
            <Kanvas>
              <AdeganAngkat t={f} />
            </Kanvas>
            <TeksTangan t={f} teks="Jajanannya bisa ikut ke mana-mana." masuk={s(1.9)} keluar={s(3.0)} />
          </>
        )}
      </Potong>
      {KAMERA_MAKRO.map((_, i) => (
        <Potong key={i} dari={SHOT.makro[0] + i * 1.2} ke={SHOT.makro[0] + (i + 1) * 1.2}>
          {(f) => (
            <Kanvas>
              <AdeganMakro t={f} ke={i} />
            </Kanvas>
          )}
        </Potong>
      ))}
      <Potong dari={SHOT.kartu[0]} ke={SHOT.kartu[1]}>
        {(f) => (
          <>
            <Kanvas>
              <AdeganKartu t={f} />
            </Kanvas>
            <TeksTangan t={f} teks="Tapi lapak ini menyimpan satu lagi." masuk={s(2.4)} keluar={s(4.0)} />
          </>
        )}
      </Potong>
      <Potong dari={SHOT.simpan[0]} ke={SHOT.simpan[1]}>
        {(f) => (
          <Kanvas>
            <AdeganSimpan t={f} />
          </Kanvas>
        )}
      </Potong>
      <Potong dari={SHOT.penutup[0]} ke={SHOT.penutup[1]}>
        {(f) => (
          <>
            <Kanvas>
              <AdeganPenutup t={f} />
            </Kanvas>
            <KartuPenutup t={f} />
          </>
        )}
      </Potong>
      <Grade t={t} />
      {sfx && <Suara />}
    </AbsoluteFill>
  );
};
