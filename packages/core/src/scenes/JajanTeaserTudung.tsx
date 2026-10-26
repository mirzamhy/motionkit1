// Teaser v4 Jajan Dulu! "Di Bawah Tudung Saji", 60 detik, 9:16, narasi bisik (brief: jajan_dulu/konten/brief/00-teaser.md).
// Satu dunia pasar dan satu kamera tanpa potong. Satu-satunya sambungan tersembunyi ada di gelap dalam tudung saji
// (detik 27,3). Skala dunia 1 unit = 10 cm. Jalan pasar membentang di sumbu Z, lapak utama di sisi kanan (x > 9).
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
import { buatCharmRajut } from '../../../three/src/jajan/charmRajut';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { aturTangan, buatTangan, campurPose, kunciJepit, POSE } from '../../../three/src/jajan/tubuh';
import { buatBadan, raih } from '../../../three/src/jajan/badan';
import { inOut, kf, outE, pop, prog } from './motion';
import { rng } from './kit';
import { terapkanTampilan, type Tampilan } from './tampilan';
import { kanvasTekstur, teksturAnyam, teksturDaun } from './JajanLapak';
import { aturPejalan, buatBerkas, buatDebu, buatPejalan, buatTampahDaun, Bunyi, BunyiPanjang, LANGKAH, teksturKayuCat, teksturTulisan, teksturUbin } from './JajanTeaserLapak';
import { Img } from 'remotion';
import logoUrl from '../../../three/src/jajan/logo-jajandulu.webp';
import { logoSiap, teksturLogo } from '../../../three/src/jajan/tekstur';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);
export const TEASER_TUDUNG_FRAMES = s(60);

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Tata letak dunia

export const MEJA_Y = 8.35; // permukaan meja lapak utama
export const MEJA = { x0: 9, x1: 15, z0: -18, z1: -1 }; // depan meja menghadap jalan (-X)
const TAMPAH = V(12, MEJA_Y + 0.105, -6); // pusat permukaan daun di tampah
const SKALA_TAMPAH = 0.8;
const R_TAMPAH = 3.6;
const ATAP_DEPAN = 8.5; // tepi depan atap terpal lapak utama (x)

/** Enam tempat di tampah. Urutan searah jarum jam dilihat dari atas (atas layar = +X, kanan layar = +Z). */
const ISI: { id: CharmId; nama: string }[] = [
  { id: 'klepon', nama: 'Klepon' },
  { id: 'onde-onde', nama: 'Onde-onde' },
  { id: 'kue-lapis', nama: 'Kue Lapis' },
  { id: 'kue-lumpur', nama: 'Kue Lumpur' },
  { id: 'serabi', nama: 'Serabi' },
  { id: 'secret', nama: '' },
];
const SUDUT = (i: number) => (i * Math.PI) / 3; // arah dalam bidang XZ: (cos, sin)

// Jadwal babak (detik). Potong tersembunyi di dalam tudung pada P.atas.
const P = { potong: 27.3, atas: 27.3, satu: 31.0, rahasia: 43.0, tutup: 47.9, langit: 54.0 } as const;
const CHARM_MULAI = (i: number) => P.satu + i * 2.4;
const CHARM_AKHIR = (i: number) => (i === 4 ? P.rahasia : CHARM_MULAI(i + 1));

/** Narasi (edge-tts id-ID-ArdiNeural, tempo -18%, nada -6 Hz, gema; berkas public/vo/vNN.wav). d = durasi berkas. */
const NARASI: { t: number; teks: string; d: number; tanpaTeks?: boolean }[] = [
  { t: 1.2, teks: 'Setiap pagi... pasar ini selalu sama.', d: 2.86 },
  { t: 5.4, teks: 'Risol, pastel, dadar gulung.', d: 3.46 },
  { t: 9.2, teks: 'Dua ribu lima ratus... seperti biasa.', d: 2.72 },
  { t: 12.4, teks: 'Tapi ada satu tampah...', d: 1.72 },
  { t: 14.4, teks: '...yang nggak pernah dibuka.', d: 1.71 },
  { t: 17.0, teks: 'Kata orang...', d: 1.18 },
  { t: 18.6, teks: '...isinya bukan buat dimakan.', d: 2.07 },
  { t: 21.4, teks: 'Coba... lihat lebih dekat.', d: 1.89 },
  { t: 27.6, teks: 'Bukan jajanan...', d: 1.49 },
  { t: 29.3, teks: '...tapi gantungan tas.', d: 1.68 },
  { t: 31.3, teks: 'Klepon.', d: 0.97, tanpaTeks: true },
  { t: 33.7, teks: 'Onde-onde.', d: 1.16, tanpaTeks: true },
  { t: 36.1, teks: 'Kue lapis.', d: 1.17, tanpaTeks: true },
  { t: 38.5, teks: 'Kue lumpur.', d: 1.19, tanpaTeks: true },
  { t: 40.9, teks: 'Serabi.', d: 1.03, tanpaTeks: true },
  { t: 43.6, teks: 'Dan yang satu ini...', d: 1.57 },
  { t: 45.5, teks: '...belum boleh kami kasih tahu.', d: 1.92 },
  { t: 48.2, teks: 'Dibuat tangan, satu per satu.', d: 2.76 },
  { t: 51.3, teks: 'Dibungkus kantong kertas tertutup...', d: 2.23 },
  { t: 53.8, teks: '...kamu nggak akan tahu dapat yang mana.', d: 2.28 },
  { t: 56.6, teks: 'Jajan Dulu!', d: 1.31, tanpaTeks: true },
  { t: 58.2, teks: 'Ikuti seriesnya.', d: 1.53, tanpaTeks: true },
];

/** Seberapa narasi sedang berbicara (0..1), dengan ancang-ancang dan ekor, untuk merendahkan latar. */
const bicara = (f: number) =>
  NARASI.reduce((m, n) => {
    const a = s(n.t);
    const b = s(n.t + n.d);
    return Math.max(m, prog(f, a - 10, a, inOut) * (1 - prog(f, b, b + 18, inOut)));
  }, 0);

/** Waktu jalan pejalan kaki: setengah kecepatan di awal (gerak lambat), kembali normal di detik 4-6,5. */
const tJalan = (t: number) => {
  const a = s(4.0);
  const b = s(6.5);
  if (t < a) return t * 0.45;
  if (t < b) return a * 0.45 + (t - a) * 0.45 + (0.55 * (t - a) ** 2) / (2 * (b - a));
  return a * 0.45 + (b - a) * 0.45 + (0.55 * (b - a)) / 2 + (t - b);
};

// ---------------------------------------------------------------------------------------------------------------
// Tekstur

const teksturTaplak = () =>
  kanvasTekstur(
    256,
    256,
    (g) => {
      g.fillStyle = '#F2EEE6';
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = 'rgba(200,52,46,0.85)';
      for (let i = 0; i < 8; i++) {
        g.fillRect(i * 32, 0, 16, 256);
        g.fillRect(0, i * 32, 256, 16);
      }
    },
    5,
  );

const teksturLangit = () =>
  kanvasTekstur(16, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#5E9BD6');
    gr.addColorStop(0.32, '#9CC6E8');
    gr.addColorStop(0.46, '#F6D3A4');
    gr.addColorStop(0.5, '#F2B27A');
    gr.addColorStop(0.56, '#C9A07C');
    gr.addColorStop(1, '#6E5442');
    g.fillStyle = gr;
    g.fillRect(0, 0, 16, 512);
  });

const teksturAwan = (seed: number) =>
  kanvasTekstur(256, 128, (g) => {
    const R = rng(seed);
    for (let i = 0; i < 14; i++) {
      const x = 40 + R() * 176;
      const y = 50 + R() * 40;
      const r = 20 + R() * 34;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,248,238,0.85)');
      gr.addColorStop(1, 'rgba(255,240,225,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 128);
    }
  });

const teksturKilau = () =>
  kanvasTekstur(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,236,170,1)');
    gr.addColorStop(0.25, 'rgba(255,214,120,0.5)');
    gr.addColorStop(1, 'rgba(255,200,100,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = 'rgba(255,245,210,0.9)';
    g.fillRect(31, 4, 2, 56);
    g.fillRect(4, 31, 56, 2);
  });

// ---------------------------------------------------------------------------------------------------------------
// Orang utuh: rig kaki dari tubuh.ts, badan dan lengan sederhana yang mengayun berlawanan dengan kaki

type Orang = {
  g: THREE.Group;
  atur: (t: number) => THREE.Vector3;
};

function buatOrang(o: { sandal: string; celana: string; baju: string; kulit: string; asal: THREE.Vector3; arah: THREE.Vector3; periode: number; fase: number; kantong?: string; pikul?: boolean; kerudung?: string; rambut?: string; aksesori?: 'peci' | 'topi' | 'caping'; warnaTopi?: string; tas?: string; skala?: number }): Orang {
  const g = new THREE.Group();
  const p = buatPejalan(o.sandal, o.celana, o.asal, o.arah, o.periode, o.fase, o.kulit);
  g.add(p.kiri.akar, p.kanan.akar);
  // badan proporsional dari badan.ts; perempuan berjilbab sedikit diperkecil terhadap rig kaki yang sama
  const b = buatBadan({ pria: !o.kerudung, baju: o.baju, kulit: o.kulit, jilbab: o.kerudung, lenganSederhana: true, rambut: o.rambut, aksesori: o.kerudung ? undefined : o.aksesori, warnaTopi: o.warnaTopi, tas: o.tas });
  if (o.kerudung) b.akar.scale.setScalar(0.96);
  const badan = b.akar;
  const lengan = b.ayun!;
  if (o.kantong) {
    const kresek = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), new THREE.MeshStandardMaterial({ color: o.kantong, roughness: 0.4 }));
    kresek.scale.set(0.9, 1.2, 0.7);
    kresek.position.set(0, -(b.LENGAN_ATAS + b.LENGAN_BAWAH + 1.3), 0.5);
    lengan[0].add(kresek);
  }
  if (o.pikul) {
    const pikulan = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 15, 8), new THREE.MeshStandardMaterial({ color: '#9C7A4A', roughness: 0.8 }));
    pikulan.rotation.x = Math.PI / 2;
    pikulan.position.set(1.4, 6.0, 0);
    b.batang.add(pikulan);
    for (const z of [-6.8, 6.8]) {
      const bakul = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.4, 2.2, 18), new THREE.MeshStandardMaterial({ map: teksturAnyam(), roughness: 0.9 }));
      bakul.position.set(1.4, 0.2, z);
      b.batang.add(bakul);
      const tali = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 4), new THREE.MeshStandardMaterial({ color: '#4a3a2a' }));
      tali.position.set(1.4, 3.6, z);
      b.batang.add(tali);
    }
  }
  badan.traverse((m) => ((m as THREE.Mesh).isMesh ? ((m as THREE.Mesh).castShadow = true) : null));
  g.add(badan);
  // anak kecil: seluruh orang (kaki dan badan) diperkecil dari lantai
  if (o.skala) g.scale.setScalar(o.skala);
  const hadap = Math.atan2(o.arah.x, o.arah.z);
  const arah = o.arah.clone().normalize();
  return {
    g,
    atur: (t) => {
      aturPejalan(p, t);
      const pinggul = p.kiri.akar.position.clone().add(p.kanan.akar.position).multiplyScalar(0.5);
      badan.position.copy(pinggul);
      badan.rotation.y = hadap;
      const fase = ((t + p.fase) % p.periode) / p.periode;
      lengan.forEach((l, i) => {
        // tangan kiri maju bersama kaki kanan
        const ayun = o.pikul && i === 1 ? -1.2 : Math.cos(Math.PI * 2 * (fase + (i ? 0 : 0.5))) * 0.32;
        l.rotation.x = -ayun;
        l.rotation.z = (i ? 1 : -1) * 0.08;
      });
      b.batang.rotation.z = Math.sin(Math.PI * 2 * fase) * 0.02;
      return pinggul.addScaledVector(arah, 0);
    },
  };
}

/** Waktu jalan yang melambat sampai berhenti: t0 + D(1 - e^(-(t - t0)/D)). */
const melambat = (t: number, t0: number, D: number) => (t < t0 ? t : t0 + D * (1 - Math.exp(-(t - t0) / D)));

// ---------------------------------------------------------------------------------------------------------------
// Lapak

function terpal(lebar: number, panjang: number, warna: string, garis?: string) {
  const tex = kanvasTekstur(128, 128, (g) => {
    g.fillStyle = warna;
    g.fillRect(0, 0, 128, 128);
    if (garis) {
      g.fillStyle = garis;
      for (let i = 0; i < 4; i++) g.fillRect(i * 32, 0, 14, 128);
    }
    const R = rng(warna.length * 13);
    for (let i = 0; i < 200; i++) {
      g.fillStyle = `rgba(0,0,0,${R() * 0.08})`;
      g.fillRect(R() * 128, R() * 128, 3, 3);
    }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(lebar, panjang, 8, 8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.97 }));
  // sedikit melendut di tengah
  const pos = m.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (lebar / 2);
    const y = pos.getY(i) / (panjang / 2);
    pos.setZ(i, -(1 - x * x) * (1 - y * y) * 0.5);
  }
  m.geometry.computeVertexNormals();
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Lapak tetangga dengan muka meja di x = sisi * 8 menghadap jalan. */
export function buatLapakLain(R: () => number, sisi: 1 | -1, zPusat: number) {
  const g = new THREE.Group();
  const panjang = 13 + R() * 3;
  const dalam = 5 + R() * 1.5;
  const xDepan = sisi * 8;
  const xTengah = xDepan + sisi * dalam * 0.5;
  const kayu = new THREE.MeshStandardMaterial({ map: teksturKayuCat(), roughness: 0.85, color: R() > 0.5 ? '#ffffff' : '#c9b8a0' });
  const meja = new THREE.Mesh(new THREE.BoxGeometry(dalam, 0.4, panjang), kayu);
  meja.position.set(xTengah, 7.6, zPusat);
  const kain = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, panjang), new THREE.MeshStandardMaterial({ color: ['#2F6DB3', '#C8442F', '#3E8A4A', '#E2B23A'][Math.floor(R() * 4)], roughness: 0.9 }));
  kain.position.set(xDepan, 6.1, zPusat);
  g.add(meja, kain);
  // dagangan: tumpukan buah, sayur, karung, baskom
  const warna = ['#E25B2A', '#F2C14E', '#7FB24A', '#B83A3A', '#E9E2CF', '#8E5A3A'];
  for (let k = 0; k < 7; k++) {
    const z = zPusat - panjang / 2 + 1.6 + (k / 6) * (panjang - 3.2);
    const jenis = R();
    const w = warna[Math.floor(R() * warna.length)];
    if (jenis < 0.5) {
      const baskom = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1, 0.9, 18), new THREE.MeshStandardMaterial({ color: ['#3C7DD0', '#D04C3C', '#E9E2CF'][Math.floor(R() * 3)], roughness: 0.4 }));
      baskom.position.set(xTengah + (R() - 0.5) * 2, 8.25, z);
      g.add(baskom);
      for (let b = 0; b < 6; b++) {
        const buah = new THREE.Mesh(new THREE.SphereGeometry(0.4 + R() * 0.15, 10, 8), new THREE.MeshStandardMaterial({ color: w, roughness: 0.55 }));
        buah.position.set(baskom.position.x + (R() - 0.5) * 1.4, 8.8 + R() * 0.4, z + (R() - 0.5) * 1.4);
        g.add(buah);
      }
    } else {
      const tumpuk = new THREE.Mesh(new RoundedBoxGeometry(1.4 + R(), 1 + R() * 1.6, 1.4 + R(), 2, 0.3), new THREE.MeshStandardMaterial({ color: w, roughness: 0.85 }));
      tumpuk.position.set(xTengah + (R() - 0.5) * 2, 8.4 + 0.5, z);
      g.add(tumpuk);
    }
  }
  // tiang dan atap terpal
  const tiangMat = new THREE.MeshStandardMaterial({ color: '#6B5A48', roughness: 0.8 });
  for (const dx of [0, dalam + 2])
    for (const dz of [-panjang / 2, panjang / 2]) {
      const tiang = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 23, 8), tiangMat);
      tiang.position.set(xDepan + sisi * dx, 11.5, zPusat + dz);
      g.add(tiang);
    }
  const warnaAtap = [['#E2772E'], ['#2F6DB3'], ['#3E8A4A'], ['#D9D2C2', '#C8442F'], ['#E2772E', '#F2C14E']][Math.floor(R() * 5)];
  const atap = terpal(dalam + 4, panjang + 1.5, warnaAtap[0], warnaAtap[1]);
  atap.rotation.x = -Math.PI / 2;
  atap.rotation.y = sisi * 0.16;
  atap.position.set(xDepan + sisi * (dalam + 4) * 0.5 - sisi * 0.5, 23.6, zPusat);
  g.add(atap);
  // dinding belakang gelap supaya lorong terasa tertutup
  const dinding = new THREE.Mesh(new THREE.BoxGeometry(0.4, 26, panjang + 2), new THREE.MeshStandardMaterial({ color: '#5a4636', roughness: 1 }));
  dinding.position.set(xDepan + sisi * (dalam + 2.4), 13, zPusat);
  g.add(dinding);
  g.traverse((m) => {
    if ((m as THREE.Mesh).isMesh) m.castShadow = m.receiveShadow = true;
  });
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Jajanan asli

/** Permukaan gorengan: dasar keemasan, remah roti (risol) atau gelembung kulit (pastel). Peta warna dipakai juga
 *  sebagai bump supaya remahnya menonjol. */
function bahanGoreng(dasar: string, seed: number, remah: boolean) {
  const gambar = (warna: boolean) =>
    kanvasTekstur(512, 512, (g) => {
      const R = rng(seed);
      g.fillStyle = warna ? dasar : '#808080';
      g.fillRect(0, 0, 512, 512);
      // gosong halus di beberapa bagian
      for (let i = 0; i < 30; i++) {
        const x = R() * 512;
        const y = R() * 512;
        const r = 30 + R() * 70;
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, warna ? 'rgba(130,70,20,0.35)' : 'rgba(90,90,90,0.4)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr;
        g.fillRect(0, 0, 512, 512);
      }
      const n = remah ? 5200 : 900;
      for (let i = 0; i < n; i++) {
        const x = R() * 512;
        const y = R() * 512;
        const terang = R();
        const k = remah ? 1.5 + R() * 4 : 3 + R() * 9;
        g.fillStyle = warna
          ? terang > 0.55
            ? `rgba(240,190,105,${0.5 + R() * 0.5})`
            : terang > 0.2
              ? `rgba(170,98,34,${0.5 + R() * 0.4})`
              : `rgba(95,48,14,${0.5 + R() * 0.4})`
          : `rgba(${terang > 0.4 ? 230 : 40},${terang > 0.4 ? 230 : 40},${terang > 0.4 ? 230 : 40},0.8)`;
        g.beginPath();
        g.ellipse(x, y, k, k * (0.5 + R() * 0.6), R() * 3, 0, Math.PI * 2);
        g.fill();
      }
    });
  return new THREE.MeshPhysicalMaterial({ map: gambar(true), bumpMap: gambar(false), bumpScale: remah ? 3 : 1.5, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 });
}

/** Risol: gulungan pipih dengan ujung terlipat, permukaan bergerindil remah roti. Sumbu panjang di Y. */
function geoRisol(seed: number) {
  const geo = new THREE.CapsuleGeometry(0.42, 1.55, 10, 20);
  const R = rng(seed + 101);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const acak = Array.from({ length: 64 }, () => R());
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // pipih dan ujung sedikit menyempit
    const ujung = Math.max(0, Math.abs(y) - 0.6) * 0.18;
    const benjol = 1 + (acak[(i * 7) % 64] - 0.5) * 0.06;
    pos.setXYZ(i, x * (1 - ujung) * benjol, y, z * 0.78 * (1 - ujung) * benjol);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Pastel: setengah lingkaran menggembung dengan pinggiran dipilin di sisi lengkung. Alas di y = 0. */
function buatPastel(bahan: THREE.Material) {
  const g = new THREE.Group();
  const bentuk = new THREE.Shape();
  bentuk.absarc(0, 0, 0.92, 0, Math.PI, false);
  bentuk.lineTo(0.92, 0);
  const badan = new THREE.Mesh(new THREE.ExtrudeGeometry(bentuk, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.16, bevelSegments: 5, curveSegments: 28 }), bahan);
  badan.rotation.x = -Math.PI / 2;
  badan.position.set(0, 0.2, 0.3);
  g.add(badan);
  // pilinan: deretan lipatan miring di sepanjang tepi lengkung
  const pilinGeo = new THREE.SphereGeometry(0.13, 10, 8);
  for (let i = 0; i <= 15; i++) {
    const a = (i / 15) * Math.PI;
    const p = new THREE.Mesh(pilinGeo, bahan);
    p.scale.set(1.7, 0.75, 0.95);
    p.position.set(Math.cos(a) * 1.09, 0.26, 0.3 - Math.sin(a) * 1.09);
    p.rotation.set(0.5, -a + Math.PI / 2, 0.6);
    g.add(p);
  }
  return g;
}

/** Kulit dadar gulung: hijau pandan dengan pori-pori kecil dan bercak lebih tua bekas wajan. */
function bahanDadar() {
  const tex = kanvasTekstur(512, 512, (g) => {
    const R = rng(88);
    g.fillStyle = '#5FA847';
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40; i++) {
      const x = R() * 512;
      const y = R() * 512;
      const r = 20 + R() * 60;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(60,110,40,0.35)');
      gr.addColorStop(1, 'rgba(60,110,40,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 512, 512);
    }
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(40,85,30,0.45)' : 'rgba(150,200,110,0.35)';
      g.beginPath();
      g.arc(R() * 512, R() * 512, 0.8 + R() * 1.8, 0, Math.PI * 2);
      g.fill();
    }
  });
  return new THREE.MeshPhysicalMaterial({ map: tex, bumpMap: tex, bumpScale: 0.8, roughness: 0.62, sheen: 0.3, sheenColor: new THREE.Color('#bfe0a0') });
}

function geoDadar(seed: number) {
  const geo = new THREE.CapsuleGeometry(0.42, 1.5, 8, 20);
  const R = rng(seed + 7);
  const lekuk = R() * 6;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // ujung dilipat: sedikit pipih, dan satu garis lipatan memanjang
    const a = Math.atan2(z, x);
    const lipat = 1 - 0.05 * Math.exp(-(((a - lekuk) % (Math.PI * 2)) ** 2) * 8);
    pos.setXYZ(i, x * lipat, y, z * 0.9 * lipat);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Penampang dadar gulung: cincin kulit hijau tipis berisi unti kelapa cokelat. */
function bahanPotongDadar() {
  const tex = kanvasTekstur(256, 256, (g) => {
    const R = rng(12);
    g.fillStyle = '#5FA847';
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#7A4A22';
    g.beginPath();
    g.arc(128, 128, 104, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 700; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(230,200,150,0.7)' : 'rgba(80,40,15,0.7)';
      const a = R() * Math.PI * 2;
      const r = Math.sqrt(R()) * 100;
      g.fillRect(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 2 + R() * 5, 1 + R() * 2);
    }
    // lapisan kulit yang tergulung
    g.strokeStyle = 'rgba(95,168,71,0.9)';
    g.lineWidth = 3;
    g.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.05) g.lineTo(128 + Math.cos(a) * (60 + a * 3.5), 128 + Math.sin(a) * (60 + a * 3.5));
    g.stroke();
  });
  return new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 1.5, roughness: 0.75 });
}

export function buatLapakUtama() {
  const g = new THREE.Group();
  const kayu = new THREE.MeshStandardMaterial({ map: teksturKayuCat(), roughness: 0.85 });
  const dx = MEJA.x1 - MEJA.x0;
  const dz = MEJA.z1 - MEJA.z0;
  const xm = (MEJA.x0 + MEJA.x1) / 2;
  const zm = (MEJA.z0 + MEJA.z1) / 2;
  for (const x of [MEJA.x0 + 0.5, MEJA.x1 - 0.5])
    for (const z of [MEJA.z0 + 0.5, MEJA.z1 - 0.5]) {
      const kaki = new THREE.Mesh(new THREE.BoxGeometry(0.5, MEJA_Y - 0.35, 0.5), kayu);
      kaki.position.set(x, (MEJA_Y - 0.35) / 2, z);
      g.add(kaki);
    }
  const papan = new THREE.Mesh(new THREE.BoxGeometry(dx, 0.35, dz), kayu);
  papan.position.set(xm, MEJA_Y - 0.175, zm);
  g.add(papan);
  // taplak plastik kotak-kotak: permukaan dan juntaian di depan
  const taplakMat = new THREE.MeshStandardMaterial({ map: teksturTaplak(), roughness: 0.35, side: THREE.DoubleSide });
  const taplak = new THREE.Mesh(new THREE.PlaneGeometry(dx + 0.3, dz + 0.3), taplakMat);
  taplak.rotation.x = -Math.PI / 2;
  taplak.position.set(xm, MEJA_Y + 0.01, zm);
  const juntai = new THREE.Mesh(new THREE.PlaneGeometry(dz + 0.3, 2.2), taplakMat);
  juntai.rotation.y = -Math.PI / 2;
  juntai.position.set(MEJA.x0 - 0.15, MEJA_Y - 1.1, zm);
  g.add(taplak, juntai);
  // kolong meja: keranjang bambu
  const keranjang = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1, 1.8, 24, 1, true), new THREE.MeshStandardMaterial({ map: teksturAnyam(), roughness: 0.9, side: THREE.DoubleSide }));
  keranjang.position.set(11.5, 0.9, -8.5);
  g.add(keranjang);

  // jajanan asli: digambar sebagai makanan sungguhan (berminyak, renyah), beda dari dunia flanel bag charm
  const seng = new THREE.MeshPhysicalMaterial({ color: '#F1EEE6', roughness: 0.22, clearcoat: 0.7 });
  const bibirSeng = new THREE.MeshStandardMaterial({ color: '#2E5A9C', roughness: 0.3 });
  const piring = (x: number, z: number) => {
    const p = new THREE.Group();
    const d = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.6, 0.22, 48), seng);
    const b = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.07, 6, 56), bibirSeng);
    b.rotation.x = Math.PI / 2;
    b.position.y = 0.11;
    p.add(d, b);
    // kertas minyak di bawah gorengan
    const kertas = new THREE.Mesh(new THREE.CircleGeometry(1.55, 7), new THREE.MeshStandardMaterial({ color: '#EFE6CF', roughness: 0.6, transparent: true, opacity: 0.92 }));
    kertas.rotation.set(-Math.PI / 2, 0, x);
    kertas.position.y = 0.115;
    p.add(kertas);
    p.position.set(x, MEJA_Y + 0.11, z);
    g.add(p);
    return p;
  };
  const risolMat = bahanGoreng('#C98A3A', 41, true);
  const pRisol = piring(11.6, -15);
  const risol: THREE.Mesh[] = [];
  const letakRisol: [number, number, number, number][] = [
    [-0.75, 0.42, -0.55, 0.25],
    [0.25, 0.42, -0.75, 0.15],
    [-0.55, 0.42, 0.45, -0.1],
    [0.55, 0.42, 0.3, -0.25],
    [-0.1, 1.08, -0.15, 0.3],
    [0.1, 1.08, 0.75, -0.05],
  ];
  letakRisol.forEach(([x, y, z, ry], i) => {
    const r = new THREE.Mesh(geoRisol(i), risolMat);
    r.position.set(x, y, z);
    r.rotation.set(0, ry + Math.PI / 2, Math.PI / 2);
    pRisol.add(r);
    risol.push(r);
  });
  const pastelMat = bahanGoreng('#D69A48', 57, false);
  const pPastel = piring(11.6, -10.8);
  [
    [-0.6, 0.12, -0.45, 0.3],
    [0.55, 0.12, -0.35, -0.4],
    [-0.35, 0.12, 0.7, 2.6],
    [0.7, 0.12, 0.75, 3.4],
    [0.05, 0.62, 0.1, 1.2],
  ].forEach(([x, y, z, ry]) => {
    const p = buatPastel(pastelMat);
    p.position.set(x, y, z);
    p.rotation.set(0, ry, y > 0.5 ? 0.12 : 0);
    pPastel.add(p);
  });
  // nampan dadar gulung beralas daun pisang, satu dipotong memperlihatkan unti kelapa
  const nampan = new THREE.Mesh(new RoundedBoxGeometry(3.0, 0.3, 4.6, 2, 0.08), new THREE.MeshStandardMaterial({ color: '#B8B4AA', metalness: 0.7, roughness: 0.3 }));
  nampan.position.set(13.8, MEJA_Y + 0.15, -13);
  g.add(nampan);
  const daunNampan = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 4.3), new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.5 }));
  daunNampan.rotation.x = -Math.PI / 2;
  daunNampan.position.set(13.8, MEJA_Y + 0.31, -13);
  g.add(daunNampan);
  const dadarMat = bahanDadar();
  for (let i = 0; i < 4; i++) {
    const d = new THREE.Mesh(geoDadar(i), dadarMat);
    d.rotation.set(Math.PI / 2, 0, (i % 2 ? 1 : -1) * 0.06);
    d.position.set(13.2 + (i % 2) * 1.1, MEJA_Y + 0.72, -14.2 + Math.floor(i / 2) * 2.4);
    g.add(d);
  }
  const potong = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.85, 32, 1), [dadarMat, bahanPotongDadar(), dadarMat]);
  potong.rotation.z = Math.PI / 2;
  potong.rotation.y = -0.5;
  potong.position.set(13.3, MEJA_Y + 0.75, -10.9);
  g.add(potong);
  // label harga karton di depan piring
  [
    ['Risol 2.500', -15],
    ['Pastel 2.500', -10.8],
  ].forEach(([teks, z]) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0), new THREE.MeshStandardMaterial({ map: teksturTulisan(teks as string, { w: 512, h: 220, ukuran: 92 }), roughness: 0.95, side: THREE.DoubleSide }));
    l.rotation.y = -Math.PI / 2;
    l.rotation.x = -0.12;
    l.position.set(9.5, MEJA_Y + 0.55, z as number);
    g.add(l);
  });
  // tiang, atap terpal oranye, papan nama
  const tiangMat = new THREE.MeshStandardMaterial({ color: '#6B5A48', roughness: 0.8 });
  for (const x of [ATAP_DEPAN + 0.4, 18.5])
    for (const z of [MEJA.z0 - 0.4, MEJA.z1 + 0.4]) {
      const tiang = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 24, 8), tiangMat);
      tiang.position.set(x, 12, z);
      g.add(tiang);
    }
  const atap = terpal(11.5, dz + 2.5, '#E2772E');
  atap.rotation.x = -Math.PI / 2;
  atap.rotation.y = 0.2;
  atap.position.set(ATAP_DEPAN + 5.5, 24.1, zm);
  g.add(atap);
  const papanNama = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.0), new THREE.MeshStandardMaterial({ map: teksturLogo('#F6E7C8', 640, 246), roughness: 0.9, side: THREE.DoubleSide }));
  papanNama.rotation.y = -Math.PI / 2;
  papanNama.position.set(ATAP_DEPAN + 0.1, 15.5, MEJA.z0 + 2.2);
  g.add(papanNama);
  g.traverse((m) => {
    if ((m as THREE.Mesh).isMesh) m.castShadow = m.receiveShadow = true;
  });
  atap.castShadow = true;
  return { g, risol };
}

/**
 * Tudung saji anyaman bambu: kubah lonceng dengan pucuk kayu, bilah anyaman miring, dua pita bilah berwarna di
 * dekat bibir, dan celah-celah kecil antar bilah yang meloloskan titik-titik cahaya. Titik asal di tengah bibir.
 */
function buatTudung() {
  const g = new THREE.Group();
  const profil = [
    [3.15, 0],
    [3.12, 0.35],
    [3.0, 0.9],
    [2.75, 1.45],
    [2.3, 1.9],
    [1.65, 2.2],
    [0.9, 2.36],
    [0.25, 2.42],
    [0.0, 2.43],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const kurvaProfil = new THREE.SplineCurve(profil);
  const geo = new THREE.LatheGeometry(kurvaProfil.getPoints(40), 96);
  // canvas atas = puncak (v = 1), bawah = bibir (v = 0)
  const W = 1024;
  const H = 512;
  const SEL = 32;
  const warna = kanvasTekstur(W, H, (c) => {
    const R = rng(64);
    c.fillStyle = '#B98D52';
    c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += SEL)
      for (let x = 0; x < W; x += SEL) {
        // anyaman kepar: arah bilah berganti tiap dua sel secara diagonal
        const datar = Math.floor((x / SEL + y / SEL) / 2) % 2 === 0;
        const v = 190 + R() * 40;
        // dua pita bilah berwarna di dekat bibir
        const pita = y > H - 150 && y < H - 110 ? 'merah' : y > H - 90 && y < H - 60 ? 'hijau' : null;
        c.fillStyle = pita === 'merah' ? `rgb(${150 + R() * 30},${45 + R() * 15},${35})` : pita === 'hijau' ? `rgb(${50},${105 + R() * 20},${60})` : `rgb(${v},${v * 0.78},${v * 0.48})`;
        c.fillRect(x + 1, y + 1, SEL - 2, SEL - 2);
        c.strokeStyle = 'rgba(80,50,20,0.35)';
        c.lineWidth = 1.5;
        for (let k = 1; k < 4; k++) {
          c.beginPath();
          if (datar) {
            c.moveTo(x + 2, y + k * 8);
            c.lineTo(x + SEL - 2, y + k * 8 + (R() - 0.5) * 2);
          } else {
            c.moveTo(x + k * 8, y + 2);
            c.lineTo(x + k * 8 + (R() - 0.5) * 2, y + SEL - 2);
          }
          c.stroke();
        }
        // bayangan di tepi bilah supaya anyaman terlihat bertumpuk
        c.fillStyle = 'rgba(60,35,12,0.35)';
        if (datar) c.fillRect(x + 1, y + SEL - 4, SEL - 2, 3);
        else c.fillRect(x + SEL - 4, y + 1, 3, SEL - 2);
      }
  });
  const lubang = kanvasTekstur(W, H, (c) => {
    c.fillStyle = '#fff';
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#000';
    // celah kecil di sudut pertemuan bilah; tidak ada di pita bibir dan di sekitar pucuk
    for (let y = SEL; y < H - 40; y += SEL) for (let x = 0; x < W; x += SEL) if (y > 30) c.fillRect(x - 3, y - 3, 6, 6);
  });
  warna.repeat.set(3, 1);
  lubang.repeat.set(3, 1);
  const bahan = new THREE.MeshStandardMaterial({ map: warna, alphaMap: lubang, alphaTest: 0.5, bumpMap: warna, bumpScale: 1.2, roughness: 0.85, side: THREE.DoubleSide });
  const kubah = new THREE.Mesh(geo, bahan);
  const rotan = new THREE.MeshStandardMaterial({ color: '#6E4421', roughness: 0.7 });
  const bibir = new THREE.Mesh(new THREE.TorusGeometry(3.16, 0.11, 10, 96), rotan);
  bibir.rotation.x = Math.PI / 2;
  bibir.position.y = 0.04;
  const ikat = new THREE.Mesh(new THREE.TorusGeometry(3.08, 0.05, 6, 96), rotan);
  ikat.rotation.x = Math.PI / 2;
  ikat.position.y = 0.55;
  const pucuk = new THREE.Group();
  const alas = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.12, 20), rotan);
  const batang = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.42, 12), rotan);
  batang.position.y = 0.25;
  const bulat = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), rotan);
  bulat.scale.y = 0.85;
  bulat.position.y = 0.55;
  pucuk.add(alas, batang, bulat);
  pucuk.position.y = 2.43;
  g.add(kubah, bibir, ikat, pucuk);
  g.traverse((m) => ((m as THREE.Mesh).isMesh ? ((m as THREE.Mesh).castShadow = true) : null));
  return { g, pucuk };
}

/** Tampah berisi enam charm berbaring melingkar, ring mengarah keluar. Tidak ada kartu atau label. */
/** Charm flanel lembar desain v2; karakter rahasia tetap model lama. Titik asal sama dengan buatCharm. */
function buatCharmPakai(id: CharmId) {
  if (id === 'secret') return buatCharm(id);
  const isi = buatCharmRajut(id);
  isi.position.y = -0.32;
  const grup = new THREE.Group();
  grup.add(isi);
  return { grup };
}

/** `tegak`: charm berdiri melingkar menghadap keluar (teaser v5), bukan rebah di daun. */
function buatTampahCharm(tegak = false) {
  const g = buatTampahDaun(R_TAMPAH);
  const pusat: THREE.Vector3[] = [];
  const holders: THREE.Group[] = [];
  let tanya: THREE.MeshPhysicalMaterial | null = null;
  ISI.forEach(({ id }, i) => {
    const c = buatCharmPakai(id);
    const dalam = new THREE.Group();
    if (!tegak) c.grup.rotation.x = -Math.PI / 2;
    dalam.add(c.grup);
    const φ = SUDUT(i);
    dalam.rotation.y = tegak ? Math.atan2(Math.cos(φ), Math.sin(φ)) : Math.atan2(-Math.cos(φ), -Math.sin(φ));
    const kotak = new THREE.Box3().setFromObject(dalam);
    const jari = tegak ? 1.35 : 1.75;
    dalam.position.set(Math.cos(φ) * jari, -kotak.min.y + 0.01, Math.sin(φ) * jari);
    g.add(dalam);
    holders.push(dalam);
    if (id === 'secret')
      c.grup.traverse((m) => {
        const mat = (m as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
        if (mat && mat.emissiveMap) tanya = mat;
      });
  });
  g.scale.setScalar(SKALA_TAMPAH);
  g.position.copy(TAMPAH);
  g.updateMatrixWorld(true);
  // pusat badan tiap charm di dunia: sedikit ke dalam dari pusat kotak (ring ada di sisi luar)
  holders.forEach((h, i) => {
    const k = new THREE.Box3().setFromObject(h);
    const c = k.getCenter(new THREE.Vector3());
    const φ = SUDUT(i);
    c.add(V(-Math.cos(φ) * 0.25, 0, -Math.sin(φ) * 0.25));
    pusat.push(c);
  });
  return { g, pusat, tanya: tanya as THREE.MeshPhysicalMaterial | null };
}

// ---------------------------------------------------------------------------------------------------------------
// Kamera: rangkaian rig, dicampur halus di jendela transisi (jendela 0 = potong)

export type Pose = { p: THREE.Vector3; l: THREE.Vector3; fov: number; roll: number };
type Rig = (f: number) => Pose;
type Kunci = [number, [number, number, number], [number, number, number], number, number?];

/** Kurva Hermite dengan tangen yang memperhitungkan jarak waktu antar kunci (C1 terhadap waktu). Ujung diam. */
function kurva(kunci: Kunci[]): Rig {
  const T = kunci.map((k) => s(k[0]));
  const nilai = kunci.map((k) => [...k[1], ...k[2], k[3], k[4] ?? 0]);
  const m = nilai.map((v, i) =>
    v.map((_, c) => (i === 0 || i === nilai.length - 1 ? 0 : (nilai[i + 1][c] - nilai[i - 1][c]) / (T[i + 1] - T[i - 1]))),
  );
  return (f) => {
    let i = 0;
    while (i < T.length - 2 && f > T[i + 1]) i++;
    const h = T[i + 1] - T[i];
    const u = Math.max(0, Math.min(1, (f - T[i]) / h));
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    const v = nilai[i].map((a, c) => h00 * a + h10 * h * m[i][c] + h01 * nilai[i + 1][c] + h11 * h * m[i + 1][c]);
    return { p: V(v[0], v[1], v[2]), l: V(v[3], v[4], v[5]), fov: v[6], roll: v[7] };
  };
}

function campur(a: Pose, b: Pose, w: number): Pose {
  return { p: a.p.clone().lerp(b.p, w), l: a.l.clone().lerp(b.l, w), fov: a.fov + (b.fov - a.fov) * w, roll: a.roll + (b.roll - a.roll) * w };
}

function rangkai(urutan: { rig: Rig; sampai: number; jendela: number }[]): Rig {
  return (f) => {
    for (let k = 0; k < urutan.length; k++) {
      const { rig, sampai, jendela } = urutan[k];
      const a = s(sampai - jendela / 2);
      const b = s(sampai + jendela / 2);
      if (k === urutan.length - 1 || f < a) return rig(f);
      if (f < b) return campur(rig(f), urutan[k + 1].rig(f), inOut((f - a) / (b - a)));
    }
    return urutan[urutan.length - 1].rig(f);
  };
}

/** Kamera mengitari satu charm dari arah pusat tampah, jadi ring (di sisi luar) ada di atas layar. */
function orbit(pusat: THREE.Vector3, i: number, dari: number, ke: number, jarak: [number, number], elevasi: number, sapu: number, fov: number): Rig {
  const φ = SUDUT(i);
  const dalam = V(-Math.cos(φ), 0, -Math.sin(φ));
  return (f) => {
    const u = (f - s(dari)) / (s(ke) - s(dari));
    const a = (u - 0.5) * sapu;
    const d = jarak[0] + (jarak[1] - jarak[0]) * outE(Math.max(0, Math.min(1, u)));
    const h = dalam.clone().applyAxisAngle(V(0, 1, 0), a).multiplyScalar(Math.cos(elevasi) * d);
    return { p: pusat.clone().add(h).add(V(0, Math.sin(elevasi) * d, 0)), l: pusat.clone().add(V(0, 0.08, 0)), fov, roll: 0 };
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Dunia

/** Satu bingkai kunci teaser v5: waktu animasi v4 yang dipinjam, lalu kamera dan cahaya ditimpa. */
export type KunciV5 = {
  detik: number;
  kamera: Pose;
  /** 0 = subuh hangat v4, 1 = subuh biru 04.30 (jam biru, lampu petromaks sisa malam) */
  gelap: number;
  /** kekuatan cahaya dari dalam tudung (90 = puncak v4) */
  dalam: number;
  /** tinggi angkat tudung dalam unit dunia (0,1 = 1 cm) */
  angkat?: number;
  /** cahaya dalam diletakkan rendah di tengah lingkaran charm, supaya bayangannya terlempar ke atas */
  rendah?: boolean;
  /** pengali terang lampu petromaks (bawaan 1) */
  petromaks?: number;
  /** pengali besar dan terang pendar di atas tudung (bawaan 1) */
  pendar?: number;
  /** amplitudo getar tudung (radian), seperti ada yang mendorong dari dalam */
  goyang?: number;
};

export const Dunia: React.FC<{ t: number; tampilan: Tampilan; v5?: KunciV5 }> = ({ t: tMasuk, tampilan, v5 }) => {
  const t = v5 ? s(v5.detik) : tMasuk;
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  gl.toneMappingExposure = 1;

  const isi = useMemo(() => {
    const g = new THREE.Group();
    lampuStandar(scene, gl, 0.5);
    scene.environmentIntensity = 0.14;
    scene.fog = new THREE.Fog('#9C8068', 30, 170);
    const langitAtas = new THREE.HemisphereLight('#CFE2F5', '#3E3226', 0.35);
    // matahari tinggi dari sisi jalan: lorong terang, lapak di bawah terpal tertutup bayangan atap
    const matahari = new THREE.DirectionalLight('#FFD3A0', 2.6);
    matahari.castShadow = true;
    matahari.shadow.mapSize.set(2048, 2048);
    matahari.shadow.bias = -0.0004;
    matahari.shadow.normalBias = 0.02;
    matahari.shadow.radius = 3;
    const isian = new THREE.DirectionalLight('#FFC88A', 0.15);
    isian.position.set(30, 20, 40);
    g.add(langitAtas, matahari, matahari.target, isian);
    // satu berkas sempit dari celah terpal, jatuh di piring risol
    const celah = new THREE.SpotLight('#FFD9A8', 700, 40, 0.16, 0.45, 1.2);
    celah.position.set(9.3, 26, -13.6);
    celah.target.position.set(11.6, MEJA_Y, -14.6);
    g.add(celah, celah.target);

    // langit, awan
    const langit = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 24), new THREE.MeshBasicMaterial({ map: teksturLangit(), side: THREE.BackSide, fog: false, depthWrite: false }));
    g.add(langit);
    const Ra = rng(77);
    const awanSemua: THREE.Sprite[] = [];
    for (let i = 0; i < 9; i++) {
      const awan = new THREE.Sprite(new THREE.SpriteMaterial({ map: teksturAwan(i + 3), fog: false, transparent: true, opacity: 0.75, depthWrite: false }));
      const k = 160 + Ra() * 200;
      awan.scale.set(k, k / 2, 1);
      awan.position.set(-260 + Ra() * 520, 170 + Ra() * 200, -320 - Ra() * 200);
      g.add(awan);
      awanSemua.push(awan);
    }
    // burung kecil: dua sayap yang mengepak
    const burung = Array.from({ length: 3 }, () => {
      const b = new THREE.Group();
      const sayapMat = new THREE.MeshBasicMaterial({ color: '#3a2e2a', side: THREE.DoubleSide, fog: false });
      const sayap = [-1, 1].map((sisi) => {
        const p = new THREE.Group();
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.45), sayapMat);
        m.position.x = sisi * 0.8;
        p.add(m);
        b.add(p);
        return p;
      });
      g.add(b);
      return { b, sayap };
    });

    // lantai
    const ubin = teksturUbin();
    ubin.repeat.set(36, 36);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: ubin, roughness: 0.35, metalness: 0.05 }));
    lantai.rotation.x = -Math.PI / 2;
    lantai.receiveShadow = true;
    g.add(lantai);
    const R = rng(12);
    // sampah pasar di jalan
    const daunMat = new THREE.MeshStandardMaterial({ color: '#5E8A34', roughness: 0.6, side: THREE.DoubleSide });
    for (let i = 0; i < 26; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + R() * 1.2, 0.4 + R() * 0.6), daunMat);
      d.rotation.set(-Math.PI / 2, 0, R() * 6);
      d.position.set(-6 + R() * 12, 0.01, 18 - R() * 110);
      d.receiveShadow = true;
      g.add(d);
    }
    for (let i = 0; i < 10; i++) {
      const k = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 20), new THREE.MeshStandardMaterial({ color: ['#D9423A', '#E8B030', '#3E7AC2'][i % 3], roughness: 0.6 }));
      k.rotation.x = Math.PI / 2;
      k.position.set(-5 + R() * 10, 0.03, 12 - R() * 40);
      g.add(k);
    }
    // genangan kecil yang memantulkan cahaya
    for (let i = 0; i < 8; i++) {
      const air = new THREE.Mesh(new THREE.CircleGeometry(0.6 + R() * 1.4, 24), new THREE.MeshStandardMaterial({ color: '#8C7A68', roughness: 0.05, metalness: 0.3 }));
      air.rotation.x = -Math.PI / 2;
      air.scale.x = 1.6;
      air.position.set(-5 + R() * 10, 0.02, 14 - R() * 50);
      g.add(air);
    }

    // lapak-lapak
    const lapakUtama = buatLapakUtama();
    g.add(lapakUtama.g);
    for (const z of [14, 32, -28, -46, -64, -82, -100]) g.add(buatLapakLain(R, 1, z));
    for (const z of [24, 6, -12, -30, -48, -66, -84, -102]) g.add(buatLapakLain(R, -1, z));
    // bangunan di belakang deretan lapak
    for (const sisi of [-1, 1])
      for (let z = 50; z > -140; z -= 14) {
        const tinggi = 30 + R() * 30;
        const b = new THREE.Mesh(new THREE.BoxGeometry(12, tinggi, 13), new THREE.MeshStandardMaterial({ color: ['#C9B79C', '#D8C9AE', '#B59E86', '#E2D5C0'][Math.floor(R() * 4)], roughness: 1 }));
        b.position.set(sisi * 25, tinggi / 2, z);
        b.receiveShadow = true;
        g.add(b);
      }
    // atap pasar besar di kejauhan (seng)
    // berkas sinar dan debu di lapak
    // berkas cahaya yang terlihat di kabut: sejajar dengan sorot celah terpal
    const berkas = new THREE.Group();
    const bidangBerkas = buatBerkas(2.4, 18);
    bidangBerkas.rotation.y = Math.PI / 2;
    berkas.add(bidangBerkas);
    berkas.position.set(10.45, 17.2, -14.1);
    berkas.rotation.z = 0.13;
    g.add(berkas);
    const debu = buatDebu(70, 5);
    debu.g.position.set(10, 7, -8);
    debu.g.scale.set(2.5, 2.5, 3);
    g.add(debu.g);

    // tampah, tudung, tangan penjual
    const tampah = buatTampahCharm(!!v5);
    g.add(tampah.g);
    const tudung = buatTudung();
    g.add(tudung.g);
    // penjual: perempuan berjilbab, baju kurung, rok panjang, celemek; menghadap jalan (-X)
    const penjual = buatBadan({ baju: '#3E5C8A', rok: '#4A3A5A', celemek: '#E8D6B0', jilbab: '#5B7B6A', kulit: '#C68A62' });
    penjual.akar.rotation.y = -Math.PI / 2;
    g.add(penjual.akar, ...penjual.lenganAtas);
    const tanganKiri = buatTangan(-1, { lenganBaju: '#3E5C8A', kulit: '#C68A62', lengan: penjual.LENGAN_BAWAH });
    g.add(tanganKiri.akar);
    const tangan = buatTangan(1, { lenganBaju: '#3E5C8A', kulit: '#C68A62', lengan: penjual.LENGAN_BAWAH });
    const tanganRisol = buatTangan(1, { lenganBaju: '#3E5C8A', kulit: '#C68A62', lengan: penjual.LENGAN_BAWAH });
    g.add(tanganRisol.akar);
    const risol = lapakUtama.risol[4];
    const risolAsal = risol.position.clone();
    g.add(tangan.akar);

    // kilau kecil di sekitar charm rahasia
    const kilauTex = teksturKilau();
    const Rk = rng(9);
    const kilau = Array.from({ length: 9 }, () => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: kilauTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
      const a = Rk() * Math.PI * 2;
      const r = 0.55 + Rk() * 0.5;
      g.add(sp);
      return { sp, off: V(Math.cos(a) * r, 0.2 + Rk() * 0.7, Math.sin(a) * r), f: Rk() * 6, k: 0.18 + Rk() * 0.2 };
    });
    const sorot = new THREE.SpotLight('#FFD9A0', 0, 30, 0.12, 0.6, 1.2);
    sorot.position.copy(tampah.pusat[5]).add(V(-2, 14, 1));
    sorot.target.position.copy(tampah.pusat[5]);
    g.add(sorot, sorot.target);
    // cahaya hangat di dalam tudung: bayangannya menembus lubang anyaman jadi titik-titik cahaya di sekitarnya
    const cahayaDalam = new THREE.PointLight('#FFB25A', 0, 14, 2);
    cahayaDalam.position.copy(TAMPAH).add(V(0, 1.2, 0));
    cahayaDalam.castShadow = true;
    cahayaDalam.shadow.mapSize.set(1024, 1024);
    cahayaDalam.shadow.bias = -0.003;
    cahayaDalam.shadow.radius = 2;
    g.add(cahayaDalam);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: kilauTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: 0 }));
    halo.scale.setScalar(9);
    g.add(halo);
    // sapuan cahaya yang menyalakan enam bentuk satu per satu di tampak atas
    const sapu = new THREE.SpotLight('#FFE2B0', 0, 40, 0.2, 0.55, 1.2);
    g.add(sapu, sapu.target);
    // lampu petromaks yang menggantung di tiap lapak (hanya menyala di malam v5)
    const petromaks = [
      V(ATAP_DEPAN + 1.6, 16.5, -9.5),
      ...[14, -28, -46, -64].map((z) => V(8.9, 15.5, z)),
      ...[24, 6, -12, -30, -48].map((z) => V(-8.9, 15.5, z)),
    ].map((p) => {
      const lampu = new THREE.Group();
      const kaca = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFE2A8' }));
      kaca.scale.y = 1.25;
      const tutup = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.45, 16), new THREE.MeshStandardMaterial({ color: '#3A3430', metalness: 0.6, roughness: 0.4 }));
      tutup.position.y = 0.75;
      const tali = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 8, 4), new THREE.MeshStandardMaterial({ color: '#2a2420' }));
      tali.position.y = 4.9;
      const cahaya = new THREE.PointLight('#FFB45C', 0, 30, 1.6);
      const pendar = new THREE.Sprite(new THREE.SpriteMaterial({ map: teksturKilau(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false }));
      pendar.scale.setScalar(4.5);
      lampu.add(kaca, tutup, tali, cahaya, pendar);
      lampu.position.copy(p);
      lampu.visible = false;
      g.add(lampu);
      return { lampu, cahaya, pendar };
    });

    // orang-orang
    const kulitList = ['#C98E66', '#B57E5A', '#D9A27E', '#A86F4C'];
    const orang: { o: Orang; lambat?: [number, number] }[] = [
      // sandal hijau yang diikuti kamera, berhenti di depan lapak utama
      { o: buatOrang({ sandal: '#3E8A4A', celana: '#3B4A5C', baju: '#C9D6E2', kulit: '#C98E66', asal: V(5.5, 0, -9.2), arah: V(0, 0, -1), periode: 66, fase: 44, kantong: '#D9423A', kerudung: '#7A5A8A' }), lambat: [100, 25] },
      // menyeberang sangat dekat lensa
      { o: buatOrang({ sandal: '#2B5DAA', celana: '#6B4A3A', baju: '#E2B23A', kulit: '#B57E5A', asal: V(8.5, 0, -5.5), arah: V(-1, 0, 0.03), periode: 58, fase: 20 }) },
      // menjauh
      { o: buatOrang({ sandal: '#B03A2E', celana: '#2E3A2A', baju: '#7FA0B8', kulit: '#D9A27E', asal: V(-2.5, 0, -4), arah: V(0, 0, -1), periode: 70, fase: 9, kantong: '#3E7AC2' }) },
    ];
    // keramaian lorong untuk crane di akhir
    const Ro = rng(5);
    for (let i = 0; i < 16; i++) {
      const maju = Ro() > 0.5;
      const z = maju ? 30 - Ro() * 30 : -60 - Ro() * 50;
      orang.push({
        o: buatOrang({
          sandal: ['#3E8A4A', '#2B5DAA', '#B03A2E', '#E2B23A', '#222'][Math.floor(Ro() * 5)],
          celana: ['#3B4A5C', '#2E3A2A', '#6B4A3A', '#5A5A62'][Math.floor(Ro() * 4)],
          baju: ['#E2B23A', '#C8442F', '#7FA0B8', '#E9E2CF', '#3E8A4A', '#B85C8A'][Math.floor(Ro() * 6)],
          kulit: kulitList[Math.floor(Ro() * 4)],
          asal: V(-7 + Ro() * 3.5, 0, z),
          arah: V((Ro() - 0.5) * 0.06, 0, maju ? -1 : 1),
          periode: 58 + Ro() * 16,
          fase: Ro() * 60,
          kantong: Ro() > 0.5 ? ['#D9423A', '#3E7AC2', '#E9E2CF'][Math.floor(Ro() * 3)] : undefined,
          kerudung: Ro() > 0.55 ? ['#7A5A8A', '#5B7B6A', '#C9A27E', '#2E3A4A'][Math.floor(Ro() * 4)] : undefined,
          pikul: i === 3,
        }),
      });
    }
    // lalu-lalang di sekitar lapak utama saat tudung ditutup dan kamera naik: posisi awal dihitung mundur dari
    // tempat mereka di detik 54, jadi lorong di bawah kamera tidak kosong
    const Rr = rng(31);
    const t54 = tJalan(s(54));
    // dua jalur searah (menjauh di kiri, mendekat di kanan), jarak antarorang tetap, kecepatan hampir sama:
    // tidak ada yang saling menembus
    for (let i = 0; i < 18; i++) {
      const maju = i % 2 === 0;
      const urut = Math.floor(i / 2);
      const periode = 60 + (Rr() - 0.5) * 2;
      const kec = LANGKAH / (0.62 * periode);
      const zDi54 = -50 + urut * 7.4 + (Rr() - 0.5) * 2;
      const arah = V(0, 0, maju ? -1 : 1);
      const asal = V(maju ? -6.6 + Rr() * 1.6 : -3.0 + Rr() * 1.6, 0, zDi54 - arah.z * kec * t54);
      const perempuan = Rr() > 0.5;
      const anak = Rr() > 0.85;
      orang.push({
        o: buatOrang({
          sandal: ['#3E8A4A', '#2B5DAA', '#B03A2E', '#E2B23A', '#222'][Math.floor(Rr() * 5)],
          celana: ['#3B4A5C', '#2E3A2A', '#6B4A3A', '#5A5A62', '#7A6A52'][Math.floor(Rr() * 5)],
          baju: ['#E2B23A', '#C8442F', '#7FA0B8', '#E9E2CF', '#3E8A4A', '#B85C8A', '#5B7BA8', '#D98A4A'][Math.floor(Rr() * 8)],
          kulit: kulitList[Math.floor(Rr() * 4)],
          asal,
          arah,
          periode,
          fase: Rr() * 60,
          kantong: Rr() > 0.55 ? ['#D9423A', '#3E7AC2', '#E9E2CF', '#2E8B57'][Math.floor(Rr() * 4)] : undefined,
          kerudung: perempuan && !anak ? ['#7A5A8A', '#5B7B6A', '#C9A27E', '#2E3A4A', '#B85C6A'][Math.floor(Rr() * 5)] : undefined,
          rambut: Rr() > 0.8 ? '#8E8A86' : undefined,
          aksesori: !perempuan ? (['peci', 'topi', 'caping', undefined] as const)[Math.floor(Rr() * 4)] : undefined,
          warnaTopi: ['#2E4A7A', '#C8442F', '#3E8A4A'][Math.floor(Rr() * 3)],
          skala: anak ? 0.68 : undefined,
        }),
      });
    }
    orang.forEach(({ o }) => g.add(o.g));
    // gerobak dorong: bak kayu dan dua roda
    const gerobak = new THREE.Group();
    const bak = new THREE.Mesh(new THREE.BoxGeometry(4, 2.2, 6), new THREE.MeshStandardMaterial({ map: teksturKayuCat(), roughness: 0.8 }));
    bak.position.y = 3.2;
    gerobak.add(bak);
    const roda = [-1, 1].map((sisi) => {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.35, 24), new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.7 }));
      r.rotation.z = Math.PI / 2;
      r.position.set(sisi * 2.2, 1.5, 1.2);
      gerobak.add(r);
      return r;
    });
    gerobak.traverse((m) => ((m as THREE.Mesh).isMesh ? ((m as THREE.Mesh).castShadow = true) : null));
    g.add(gerobak);

    // ---- jalur kamera ----
    const C = tampah.pusat;
    const ikut: Rig = (f) => {
      const w = orang[0].o.atur(melambat(tJalan(f), 100, 25));
      return { p: V(w.x + 1.0, 1.5, w.z + 6.8), l: V(w.x + 0.1, 2.0, w.z - 3), fov: 64, roll: 0 };
    };
    // babak 1-2: kolong meja, naik pelan, risol, geser ke tudung, diam, dorong pelan, mengintip celah, masuk
    const lapak = kurva([
      [4.4, [5.5, 1.6, -12.5], [12, 2.0, -9.5], 58],
      [5.8, [4.0, 4.5, -12.8], [12, 4.5, -12.8], 52],
      [7.2, [1.5, 9.2, -13.0], [12, 8.0, -13.0], 46],
      [9.6, [-1.0, 11.4, -13.0], [12, 8.7, -12.9], 44],
      [10.6, [-1.1, 11.4, -12.5], [12, 8.8, -12.3], 44],
      [13.2, [-1.6, 11.6, -7.0], [12, 9.4, -6.3], 42],
      [14.8, [-1.8, 11.6, -6.6], [12, 9.6, -6.2], 42],
      [19.6, [4.6, 10.6, -6.4], [12.5, 9.6, -6.1], 36],
      [23.6, [8.0, 9.5, -5.9], [12.0, 9.3, -6.0], 30],
      [25.0, [6.6, 10.8, -6.0], [12.5, 10.2, -6.0], 40],
      [26.4, [7.6, 9.9, -6.1], [13, 9.2, -6.0], 44],
      [27.3, [10.7, 8.9, -6.1], [15, 8.75, -6.0], 48],
    ]);
    const atas = kurva([
      [27.3, [TAMPAH.x - 0.35, TAMPAH.y + 13.5, TAMPAH.z], [TAMPAH.x, TAMPAH.y, TAMPAH.z], 54, -0.05],
      [31.0, [TAMPAH.x - 0.3, TAMPAH.y + 12, TAMPAH.z], [TAMPAH.x, TAMPAH.y, TAMPAH.z], 44, 0.12],
    ]);
    const satu = ISI.slice(0, 5).map((_, i) => orbit(C[i], i, CHARM_MULAI(i), CHARM_AKHIR(i), [3.8, 3.3], 0.95, 0.44, 30));
    const rahasia = orbit(C[5], 5, P.rahasia, P.tutup, [4.8, 3.8], 1.05, 0.2, 30);
    // babak 4: tampak atas saat tudung diturunkan, lalu naik keluar dari bawah atap dan crane ke langit
    const tutup = kurva([
      [48.0, [TAMPAH.x - 0.35, TAMPAH.y + 13.0, TAMPAH.z], [TAMPAH.x, TAMPAH.y, TAMPAH.z], 50, 0.05],
      [50.6, [TAMPAH.x - 0.6, TAMPAH.y + 13.4, TAMPAH.z + 0.3], [TAMPAH.x, TAMPAH.y, TAMPAH.z], 52],
      [52.2, [9.5, 19, -6.5], [12, 8.4, -7.5], 48],
      [54.2, [4.0, 30, -6.5], [11, 8.4, -9.5], 50],
      [56.8, [-1, 52, 3], [1, 0, -30], 56],
      [60.0, [-2, 60, 6], [-2, 120, -90], 62],
    ]);
    const kamera = rangkai([
      { rig: ikut, sampai: 4.6, jendela: 1.2 },
      { rig: lapak, sampai: P.potong, jendela: 0 },
      { rig: atas, sampai: P.satu, jendela: 0.6 },
      ...satu.map((rig, i) => ({ rig, sampai: CHARM_AKHIR(i), jendela: 0.5 })),
      { rig: rahasia, sampai: P.tutup, jendela: 0.8 },
      { rig: tutup, sampai: 60, jendela: 0 },
    ]);
    return { g, langit, awanSemua, petromaks, celah, cahayaDalam, halo, sapu, penjual, tanganKiri, tanganRisol, risol, risolAsal, matahari, langitAtas, isian, tampah, tudung, tangan, kilau, sorot, orang, gerobak, roda, burung, debu, kamera };
  }, [gl, scene, v5 ? 1 : 0]);
  // tampilan papercraft/kartun diterapkan async (penyederhanaan geometri); render ditahan sampai selesai
  const { advance } = useThree();
  // logo di papan nama dimuat asinkron: gambar ulang kanvas setelah logo tergambar
  useEffect(() => {
    const h = delayRender('logo papan nama');
    logoSiap().then(() => {
      advance(performance.now());
      continueRender(h);
    });
  }, [advance]);
  const [tahan] = useState(() => (tampilan === 'asli' ? null : delayRender('tampilan ' + tampilan, { timeoutInMilliseconds: 170000 })));
  useEffect(() => {
    if (tahan === null) return;
    terapkanTampilan(isi.g, tampilan, { batasBesar: 30, tebalGaris: 0.05 }).then(() => {
      advance(performance.now());
      continueRender(tahan);
    });
  }, [isi, tahan, tampilan, advance]);

  // ---- animasi per frame ----
  const tj = tJalan(t);
  // pejalan utama berhenti di depan lapak, lalu melanjutkan langkah setelah tudung ditutup (detik 50,5)
  const tjLanjut = tJalan(s(50.5));
  isi.orang.forEach(({ o, lambat }) => {
    if (!lambat) return void o.atur(tj);
    const berhenti = melambat(tjLanjut, lambat[0], lambat[1]);
    o.atur(tj < tjLanjut ? melambat(tj, lambat[0], lambat[1]) : berhenti + (tj - tjLanjut) * Math.min(1, (tj - tjLanjut) / 60));
  });
  isi.gerobak.position.set(-3.6, 0, -24 + tj * 0.09);
  isi.roda.forEach((r) => (r.rotation.x = (tj * 0.09) / 1.5));
  isi.debu.atur(t * 0.6);

  // penjual: merapikan risol (7,3-9,6), bergeser ke tampah (10,5-12), mengangkat tudung (24-27), menurunkannya (48-51)
  const zPenjual = kf(t, [
    [s(10.5), -11],
    [s(12.0), -5.5],
  ]);
  const condong = kf(t, [
    [s(7.2), 0.05],
    [s(7.8), 0.36],
    [s(8.8), 0.36],
    [s(9.5), 0.08],
    [s(24.0), 0.08],
    [s(25.0), 0.3],
    [s(27.3), 0.12],
    [s(47.6), 0.12],
    [s(48.4), 0.3],
    [s(50.4), 0.32],
    [s(51.3), 0.08],
  ]);
  isi.penjual.akar.position.set(17.2, 7.8, zPenjual);
  isi.penjual.batang.rotation.x = condong;
  isi.penjual.akar.updateWorldMatrix(true, true);
  // tangan istirahat menggantung di sisi badan (setinggi tengah paha), dalam ruang badan lalu ke dunia
  const lokal = (x: number, y: number, z: number) => isi.penjual.akar.localToWorld(V(x, y, z));
  const istirahat = lokal(-1.95, -2.1, 0.35);
  // siku menekuk ke belakang dan sedikit ke luar badan
  const kutub = (sisi: number) => V(sisi * 0.3, 0, -1).applyQuaternion(isi.penjual.akar.quaternion);
  aturTangan(isi.tanganKiri, POSE.rileks);
  raih(isi.penjual, 1, isi.tanganKiri, lokal(1.95, -2.1, 0.35), 0.2, kutub(1));

  // tangan merapikan satu risol di piring
  const geser = prog(t, s(8.2), s(8.7), inOut);
  isi.risol.position.copy(isi.risolAsal).add(V(0.05 * geser, 0, -0.32 * geser));
  isi.risol.rotation.x = 0.18 * geser;
  const titikRisol = isi.risol.getWorldPosition(V(0, 0, 0)).add(V(0, 0.3, 0));
  const datangR = prog(t, s(7.3), s(8.0), outE) * (1 - prog(t, s(8.9), s(9.6), inOut));
  const genggamR = prog(t, s(7.9), s(8.2), inOut) * (1 - prog(t, s(8.7), s(8.9), inOut));
  aturTangan(isi.tanganRisol, campurPose(POSE.terbuka, POSE.jepit, genggamR));
  kunciJepit(isi.tanganRisol, genggamR);
  isi.tanganRisol.akar.visible = t < s(10);
  if (isi.tanganRisol.akar.visible) raih(isi.penjual, 0, isi.tanganRisol, istirahat.clone().lerp(titikRisol, datangR), -1.3, kutub(-1));

  // tudung: dipegang 25,0, jeda, diangkat sangat pelan 26,0 (kamera masuk dan potong 27,3);
  // muncul lagi di tangan 47,9 dan diturunkan menutup tampah 48,4-50,4
  const awal = t < s(40);
  const angkat = awal ? prog(t, s(26.0), s(28.0), inOut) : 1 - prog(t, s(48.4), s(50.4), inOut);
  const tersembunyi = t >= s(P.atas) && t < s(P.tutup);
  isi.tudung.g.visible = !tersembunyi;
  isi.tudung.g.position.set(TAMPAH.x + angkat * 1.6, TAMPAH.y + 0.02 + angkat * 4.8, TAMPAH.z);
  isi.tudung.g.rotation.z = -angkat * 0.55;
  isi.tudung.g.updateMatrixWorld(true);
  const pucuk = isi.tudung.pucuk.getWorldPosition(V(0, 0, 0)).add(V(0, 0.55, 0));
  const datang = awal ? prog(t, s(24.0), s(25.0), outE) : (t >= s(P.tutup) ? 1 : 0) * (1 - prog(t, s(50.7), s(51.6), inOut));
  const genggam = awal ? prog(t, s(24.8), s(25.2), inOut) : (t >= s(P.tutup) ? 1 : 0) * (1 - prog(t, s(50.4), s(50.7), inOut));
  aturTangan(isi.tangan, campurPose(POSE.terbuka, POSE.jepit, genggam));
  kunciJepit(isi.tangan, genggam);
  isi.tangan.akar.visible = t >= s(10);
  if (isi.tangan.akar.visible) raih(isi.penjual, 0, isi.tangan, istirahat.clone().lerp(pucuk, tersembunyi ? 0 : datang), -1.2, kutub(-1));

  // ---- cahaya ----
  // subuh: lapak gelap dengan satu berkas dari celah terpal; pagi penuh baru datang saat tudung ditutup
  const pagi = prog(t, s(50.5), s(55), inOut);
  const redup = kf(t, [
    [s(42.9), 0],
    [s(43.6), 1],
    [s(47.4), 1],
    [s(48.2), 0],
  ]);
  // lampu kerja menyala setelah sapuan cahaya, supaya charm terbaca jelas di babak perkenalan
  const lampu = kf(t, [
    [s(29.6), 0],
    [s(30.8), 1],
  ]);
  isi.matahari.intensity = (2.6 + 1.0 * pagi) * (1 - 0.8 * redup);
  isi.langitAtas.intensity = (0.35 + 0.55 * pagi + 0.3 * lampu * (1 - pagi)) * (1 - 0.75 * redup);
  isi.isian.intensity = (0.15 + 0.65 * pagi + 0.55 * lampu * (1 - pagi)) * (1 - 0.8 * redup);
  scene.environmentIntensity = (0.14 + 0.21 * pagi + 0.12 * lampu) * (1 - 0.7 * redup);
  const kabut = scene.fog as THREE.Fog;
  kabut.color.set('#9C8068').lerp(new THREE.Color('#D7B48E'), pagi);
  kabut.near = 30 + 15 * pagi;
  kabut.far = 170 + 90 * pagi;
  gl.toneMappingExposure = 0.95 + 0.08 * pagi;
  isi.celah.intensity = 700 * (1 - pagi) * (1 - redup);
  // cahaya dari dalam tudung: muncul 13,5, berdenyut, paling terang saat tudung dibuka; redup lagi setelah ditutup
  const bocor = t < s(P.atas) ? prog(t, s(13.5), s(19), inOut) * (1 + 0.25 * prog(t, s(25.0), s(26.2), inOut)) * (1 - 0.7 * prog(t, s(26.4), s(27.2), inOut)) : t >= s(P.tutup) ? 0.7 * (1 - prog(t, s(50.6), s(53), inOut)) : 0;
  const denyut = 0.85 + 0.15 * Math.sin(t / 14) + 0.05 * Math.sin(t / 3.7);
  isi.cahayaDalam.intensity = 90 * bocor * denyut;
  isi.cahayaDalam.position.copy(TAMPAH).add(V(0, 1.2, 0));
  isi.halo.position.copy(isi.tudung.g.position).add(V(0, 1.1, 0));
  (isi.halo.material as THREE.SpriteMaterial).opacity = 0.3 * bocor * denyut * (isi.tudung.g.visible ? 1 : 0);
  // sapuan cahaya menyalakan enam bentuk satu per satu dari kiri layar (27,6-29,8)
  const sapuan = prog(t, s(27.6), s(29.8), inOut);
  isi.sapu.intensity = t >= s(P.atas) && t < s(31.5) ? 420 * prog(t, s(27.4), s(27.8)) * (1 - prog(t, s(30.4), s(31.4), inOut)) : 0;
  isi.sapu.target.position.set(TAMPAH.x + 0.2, TAMPAH.y, TAMPAH.z - 3.2 + sapuan * 6.4);
  isi.sapu.position.copy(isi.sapu.target.position).add(V(-3, 12, -2));
  isi.sorot.intensity = redup * 260;
  if (isi.tampah.tanya) isi.tampah.tanya.emissiveIntensity = 0.45 + 0.35 * redup + Math.sin(t / 9) * 0.1;
  isi.kilau.forEach(({ sp, off, f, k }) => {
    sp.position.copy(isi.tampah.pusat[5]).add(off);
    const kedip = Math.max(0, Math.sin(t / 11 + f * 3));
    (sp.material as THREE.SpriteMaterial).opacity = kedip * (0.25 + 0.75 * redup) * (tersembunyi ? 1 : 0);
    sp.scale.setScalar(k * (0.6 + kedip * 0.6));
  });

  // burung melintas di langit pada detik 56-60
  const terbang = prog(t, s(56.0), s(60), (x) => x);
  isi.burung.forEach(({ b, sayap }, i) => {
    b.visible = terbang > 0;
    b.position.set(-60 + terbang * 90 + i * 4, 140 + i * 3 - terbang * 6, -150 - i * 3);
    b.rotation.y = -0.3;
    const kepak = Math.sin(t / 3.2 + i) * 0.6;
    sayap[0].rotation.z = kepak;
    sayap[1].rotation.z = -kepak;
    b.scale.setScalar(3);
  });

  // kamera
  const k = isi.kamera(t);
  camera.position.copy(k.p);
  camera.up.set(0, 1, 0);
  camera.lookAt(k.l);
  camera.rotateZ(k.roll);
  const cam = camera as THREE.PerspectiveCamera;
  cam.fov = k.fov;
  cam.near = 0.05;
  cam.far = 1500;
  cam.updateProjectionMatrix();

  // matahari dan kotak bayangannya mengikuti titik yang dilihat (rendah dari sisi jalan, kiri layar di lapak)
  const fokus = k.l.clone();
  if (k.p.y > 25) fokus.copy(k.p).add(V(0, -k.p.y, -20));
  const luas = 14 + Math.max(0, k.p.y - 18) * 1.4;
  isi.matahari.target.position.copy(fokus);
  isi.matahari.position.copy(fokus).add(V(-22, 60, 12));
  const sc = isi.matahari.shadow.camera;
  sc.left = sc.bottom = -luas;
  sc.right = sc.top = luas;
  sc.near = 1;
  sc.far = 200;
  sc.updateProjectionMatrix();

  if (v5) {
    // subuh biru (jam biru): matahari belum terbit, cahaya datang dari langit yang biru; dunia dingin dan sepi,
    // supaya cahaya oranye dari tudung jadi satu-satunya titik hangat
    const g5 = v5.gelap;
    const lerpC = (c: THREE.Color, ke: string) => c.lerp(new THREE.Color(ke), g5);
    isi.matahari.intensity = THREE.MathUtils.lerp(isi.matahari.intensity, 0.35, g5);
    lerpC(isi.matahari.color.set('#FFD3A0'), '#A9BDE6');
    isi.langitAtas.intensity = THREE.MathUtils.lerp(isi.langitAtas.intensity, 0.8, g5);
    lerpC(isi.langitAtas.color.set('#CFE2F5'), '#7D98D2');
    lerpC(isi.langitAtas.groundColor.set('#3E3226'), '#262832');
    isi.isian.intensity *= 1 - g5;
    scene.environmentIntensity = THREE.MathUtils.lerp(scene.environmentIntensity, 0.1, g5);
    isi.celah.intensity *= 1 - 0.7 * g5;
    lerpC(isi.celah.color.set('#FFD9A8'), '#C9D8FF');
    kabut.color.set('#9C8068').lerp(new THREE.Color('#4E5E80'), g5);
    kabut.near = 30 - 14 * g5;
    kabut.far = 170 - 40 * g5;
    // pasar belum buka: belum ada pembeli, langit masih malam
    isi.orang.forEach(({ o }) => (o.g.visible = g5 < 0.5));
    isi.gerobak.visible = g5 < 0.5;
    (isi.langit.material as THREE.MeshBasicMaterial).color.set('#ffffff').lerp(new THREE.Color('#5E78B4'), g5);
    isi.awanSemua.forEach((a) => (a.visible = g5 < 0.5));
    const terangLampu = v5.petromaks ?? 1;
    isi.petromaks.forEach(({ lampu, cahaya, pendar }, i) => {
      lampu.visible = g5 > 0 && terangLampu > 0;
      // lampu lapak utama lebih redup supaya cahaya dari tudung tetap jadi yang paling terang di meja
      cahaya.intensity = (i === 0 ? 20 : 45) * g5 * terangLampu;
      (pendar.material as THREE.SpriteMaterial).opacity = 0.55 * g5 * Math.min(1, terangLampu + 0.3);
    });
    gl.toneMappingExposure = 0.95 + 0.05 * g5;
    // tudung hanya terangkat sedikit; cahaya dari dalam ditentukan bingkai
    const naik = v5.angkat ?? 0;
    isi.tudung.g.visible = true;
    isi.tudung.g.position.set(TAMPAH.x, TAMPAH.y + 0.02 + naik, TAMPAH.z);
    isi.tudung.g.rotation.z = naik > 0 ? -0.02 : 0;
    if (v5.goyang) {
      // getar memakai nomor frame asli (tMasuk), bukan waktu animasi v4 yang dipinjam
      isi.tudung.g.rotation.x = v5.goyang * Math.sin(tMasuk * 1.9);
      isi.tudung.g.rotation.z += v5.goyang * Math.cos(tMasuk * 2.7) * 0.8;
      isi.tudung.g.position.y += Math.abs(Math.sin(tMasuk * 1.3)) * v5.goyang * 0.6;
    } else isi.tudung.g.rotation.x = 0;
    isi.cahayaDalam.intensity = v5.dalam;
    isi.cahayaDalam.position.copy(TAMPAH).add(V(0, v5.rendah ? 0.35 : 1.2, 0));
    isi.cahayaDalam.distance = v5.rendah ? 40 : 14;
    isi.halo.position.copy(isi.tudung.g.position).add(V(0, 1.1, 0));
    const pendar = v5.pendar ?? 1;
    isi.halo.scale.setScalar(9 * pendar);
    // di dunia subuh yang biru, pendar tudung harus terbaca sebagai cahaya hangat, bukan kilau putih
    (isi.halo.material as THREE.SpriteMaterial).color.set('#ffffff').lerp(new THREE.Color('#FF9A3C'), g5);
    (isi.halo.material as THREE.SpriteMaterial).opacity = v5.rendah ? 0 : Math.min(1, (Math.min(0.9, v5.dalam / 200) * (naik > 0 ? 1.6 : 0.6)) * pendar);
    isi.sapu.intensity = 0;
    isi.sorot.intensity = 0;
    isi.kilau.forEach(({ sp }) => ((sp.material as THREE.SpriteMaterial).opacity = 0));
    const kp = v5.kamera;
    camera.position.copy(kp.p);
    camera.up.set(0, 1, 0);
    camera.lookAt(kp.l);
    camera.rotateZ(kp.roll);
    cam.fov = kp.fov;
    cam.updateProjectionMatrix();
    isi.matahari.target.position.copy(kp.l);
    isi.matahari.position.copy(kp.l).add(V(-22, 60, 12));
  }

  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Lapisan 2D

const NamaCharm: React.FC<{ t: number }> = ({ t }) => (
  <>
    {ISI.slice(0, 5).map(({ nama }, i) => {
      const a = s(CHARM_MULAI(i) + 0.25);
      const b = s(CHARM_AKHIR(i) - 0.15);
      if (t < a - 2 || t > b + 2) return null;
      const o = prog(t, a, a + 14) * (1 - prog(t, b - 12, b, inOut));
      return (
        <AbsoluteFill key={nama} style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300 }}>
          <div style={{ fontFamily: gochi.fontFamily, fontSize: 72, color: '#FFF8F1', opacity: o, textShadow: '0 3px 16px rgba(0,0,0,0.55)', transform: `translateY(${(1 - o) * 14}px) rotate(-2deg)` }}>{nama}</div>
        </AbsoluteFill>
      );
    })}
  </>
);

const Penutup: React.FC<{ t: number }> = ({ t }) => {
  const t0 = s(56.6);
  const logo = pop(t, t0, 5);
  const sub1 = prog(t, t0 + s(0.5), t0 + s(0.9));
  const sub2 = prog(t, t0 + s(0.9), t0 + s(1.3));
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 260 }}>
      <Img src={logoUrl} style={{ width: 620, transform: `scale(${Math.max(0, logo)})`, filter: 'drop-shadow(0 14px 30px rgba(60,30,10,0.35))' }} />
      <div style={{ fontFamily: gochi.fontFamily, fontSize: 64, color: '#FFF8F1', marginTop: 30, opacity: sub1, textShadow: '0 2px 14px rgba(60,30,10,0.45)' }}>Ikuti keseruan series Jajan Dulu!</div>
      <div style={{ fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 38, color: '#FFF1C9', marginTop: 18, opacity: sub2, textShadow: '0 2px 10px rgba(60,30,10,0.4)' }}>Segera. Pre-order via WA</div>
    </AbsoluteFill>
  );
};

/** Subtitle per frasa narasi: tulisan tangan di sepertiga bawah, muncul dan hilang lembut. */
const Subtitle: React.FC<{ t: number }> = ({ t }) => {
  const n = NARASI.find((x) => !x.tanpaTeks && t >= s(x.t) - 6 && t < s(x.t + x.d) + 24);
  if (!n) return null;
  const a = s(n.t) - 6;
  const b = s(n.t + n.d) + 24;
  const o = prog(t, a, a + 12) * (1 - prog(t, b - 14, b, inOut));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', padding: '0 90px 330px' }}>
      <div style={{ fontFamily: gochi.fontFamily, fontSize: 64, lineHeight: 1.15, textAlign: 'center', color: '#FFF4E6', opacity: o, textShadow: '0 2px 18px rgba(0,0,0,0.75)', transform: `translateY(${(1 - o) * 10}px)` }}>{n.teks}</div>
    </AbsoluteFill>
  );
};

const Grade: React.FC<{ t: number }> = ({ t }) => {
  const pagi = prog(t, s(50.5), s(55), inOut);
  // dingin dan pudar di babak rahasia, sedikit di babak cahaya bocor
  const misteri = kf(t, [
    [s(13.5), 0],
    [s(16), 0.45],
    [s(27.3), 0.45],
    [s(27.6), 0],
    [s(42.9), 0],
    [s(43.6), 1],
    [s(47.4), 1],
    [s(48.2), 0],
  ]);
  // buka dari hitam, dan gelap sesaat di dalam tudung (sambungan tersembunyi)
  const gelap = Math.max(
    1 - prog(t, s(0.2), s(1.6), inOut),
    kf(t, [
      [s(26.9), 0],
      [s(P.potong), 1],
      [s(P.atas + 0.05), 1, (x) => x],
      [s(P.atas + 0.4), 0, outE],
    ]),
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: '#22324d', mixBlendMode: 'color', opacity: misteri * 0.25 }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(18,10,6,${0.68 - 0.3 * pagi}) 100%)` }} />
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <filter id="tt-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tt-grain)" opacity={0.12} style={{ mixBlendMode: 'overlay' }} />
      </svg>
      <AbsoluteFill style={{ background: '#0d0805', opacity: gelap }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Suara (bank sintetis MotionKit). Riuh pasar penuh, mengecil saat tudung diangkat, teredam di babak rahasia,
// naik lagi saat kamera mundur, lalu memudar ke langit. Klik ring yang sama di detik 0 dan saat tampak atas.

const Suara: React.FC = () => {
  const latar = (f: number) =>
    kf(f, [
      [0, 0],
      [s(1.2), 0.8],
      [s(13), 0.8],
      [s(15.5), 0.4],
      [s(20), 0.25],
      [s(27.3), 0.22],
      [s(31), 0.3],
      [s(42.9), 0.3],
      [s(43.6), 0.04],
      [s(47.6), 0.04],
      [s(49.5), 0.5],
      [s(54), 0.6],
      [s(60), 0.15],
    ]);
  // riuh direndahkan 45% saat narasi berbicara
  const riuh = (f: number) => latar(f) * (1 - 0.45 * bicara(f));
  return (
    <>
      {NARASI.map((n, i) => (
        <Sequence key={i} from={s(n.t)} durationInFrames={s(n.d) + 12} layout="none">
          <Audio src={staticFile(`vo/v${String(i + 1).padStart(2, '0')}.wav`)} volume={1} />
        </Sequence>
      ))}
      <BunyiPanjang file="crowd" dari={0} lama={s(60)} durasiFile={8} vol={riuh} />
      <BunyiPanjang file="crowd" dari={0} lama={s(60)} durasiFile={8} mulaiFile={3.3} vol={(f) => riuh(f) * 0.85} />
      <BunyiPanjang file="morning" dari={0} lama={s(60)} durasiFile={20} vol={(f) => 0.14 * (riuh(f) / 0.8)} />
      {/* klik ring samar di awal: petunjuk pertama */}
      <Bunyi file="tick" dari={s(0.5)} lama={s(0.2)} vol={0.45} />
      <Bunyi file="ping" dari={s(0.5)} lama={s(1.2)} vol={0.3} />
      {/* langkah sandal dalam gerak lambat */}
      {[0.6, 1.9, 3.2, 4.3].map((d) => (
        <Bunyi key={d} file="knock" dari={s(d)} lama={s(0.3)} vol={0.15} />
      ))}
      {/* risol dirapikan di piring seng */}
      <Bunyi file="knock" dari={s(8.5)} lama={s(0.3)} vol={0.3} />
      {/* cahaya bocor dari tudung: dengung rendah naik sampai tudung dibuka, kilau tipis */}
      <BunyiPanjang file="rumble" dari={s(14)} lama={s(13.3)} durasiFile={10} vol={(f) => 0.05 + 0.2 * prog(f, 0, s(13), inOut)} />
      <Bunyi file="shimmer" dari={s(14.6)} lama={s(4)} vol={0.14} />
      <Bunyi file="shimmer" dari={s(19.6)} lama={s(4)} vol={0.12} />
      {/* ring berkilau di balik anyaman */}
      <Bunyi file="tick" dari={s(22.6)} lama={s(0.2)} vol={0.5} />
      <Bunyi file="ping" dari={s(22.6)} lama={s(1.2)} vol={0.3} />
      {/* tudung dipegang, diangkat pelan */}
      <Bunyi file="knock" dari={s(25.1)} lama={s(0.3)} vol={0.2} />
      <Bunyi file="scratch" dari={s(26.0)} lama={s(1.4)} vol={0.3} />
      <Bunyi file="cloth" dari={s(26.0)} lama={s(1.4)} vol={0.3} />
      <Bunyi file="whoosh" dari={s(26.9)} lama={s(1.0)} vol={0.35} />
      {/* sapuan cahaya di tampak atas: klik ring jelas */}
      <Bunyi file="shimmer" dari={s(27.6)} lama={s(3)} vol={0.16} />
      <Bunyi file="tick" dari={s(28.2)} lama={s(0.2)} vol={0.85} />
      <Bunyi file="ping" dari={s(28.2)} lama={s(1.2)} vol={0.55} />
      {/* satu per satu: kain disentuh, ring beradu */}
      {[0, 1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <Bunyi file="cloth" dari={s(CHARM_MULAI(i) + 0.05)} lama={s(1.2)} vol={0.2} />
          <Bunyi file="tick" dari={s(CHARM_MULAI(i) + 1.6)} lama={s(0.2)} vol={0.45} />
        </React.Fragment>
      ))}
      {/* rahasia: pasar seperti dari balik dinding, dengung rendah, kilau tipis */}
      <BunyiPanjang file="room" dari={s(43.0)} lama={s(5)} durasiFile={8} vol={(f) => 0.07 * prog(f, 0, s(0.5)) * (1 - prog(f, s(4.4), s(5), inOut))} />
      <Bunyi file="rumble" dari={s(43.0)} lama={s(5)} vol={(f) => 0.12 * prog(f, 0, s(0.6)) * (1 - prog(f, s(4.2), s(5), inOut))} />
      <Bunyi file="shimmer" dari={s(44.0)} lama={s(3.5)} vol={0.12} />
      {/* tudung diturunkan dan menyentuh tampah */}
      <Bunyi file="scratch" dari={s(48.4)} lama={s(2.0)} vol={0.25} />
      <Bunyi file="knock" dari={s(50.35)} lama={s(0.3)} vol={0.35} />
      {/* crane ke langit */}
      <Bunyi file="whoosh" dari={s(52.0)} lama={s(1.4)} vol={0.25} />
      <Bunyi file="birds" dari={s(54.0)} lama={s(6)} vol={(f) => 0.22 * prog(f, 0, s(1.5))} />
      <Bunyi file="chime" dari={s(56.6)} lama={s(3.0)} vol={0.7} />
    </>
  );
};

export const TeaserTudung: React.FC<{ sfx?: boolean; tampilan?: Tampilan }> = ({ sfx = false, tampilan = 'asli' }) => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
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
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.05, far: 1500 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Dunia t={t} tampilan={tampilan} />
      </ThreeCanvas>
      <Subtitle t={t} />
      <NamaCharm t={t} />
      <Penutup t={t} />
      <Grade t={t} />
      {sfx && <Suara />}
    </AbsoluteFill>
  );
};

