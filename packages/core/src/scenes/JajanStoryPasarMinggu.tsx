// Storytelling "Pasar Minggu": bingkai kunci (satu frame per bingkai) sebelum dijadikan video.
// Laras, mahasiswi rantau, rindu jajanan pasar neneknya; karena tidak bisa memasak di kos, ia menjahit klepon
// dari flanel, dan dari situ lahir Jajan Dulu!. Gaya 3D sama dengan teaser v4 (bukan paper craft):
// dunia pasar dipakai ulang, ditambah set kamar kos dan kampus. Skala dunia 1 unit = 10 cm.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AbsoluteFill, Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { buatBadan, raih, type Badan } from '../../../three/src/jajan/badan';
import { aturTangan, buatTangan, POSE } from '../../../three/src/jajan/tubuh';
import { buatCharmRajut, type CharmRajutId } from '../../../three/src/jajan/charmRajut';
import { buatCharm } from '../../../three/src/jajan/charm';
import { logoSiap } from '../../../three/src/jajan/tekstur';
import logoUrl from '../../../three/src/jajan/logo-jajandulu.webp';
import { rng } from './kit';
import { kanvasTekstur, teksturAnyam, teksturDaun } from './JajanLapak';
import { buatLapakLain, buatLapakUtama, MEJA, MEJA_Y } from './JajanTeaserTudung';
import { Bunyi, BunyiPanjang, teksturUbin } from './JajanTeaserLapak';

const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Kam = { p: THREE.Vector3; l: THREE.Vector3; fov: number };
const K = (p: [number, number, number], l: [number, number, number], fov: number): Kam => ({ p: V(...p), l: V(...l), fov });

// ---------------------------------------------------------------------------------------------------------------
// Tokoh

const KULIT_LARAS = '#C68A62';
const KULIT_NENEK = '#B07A58';

/** Orang berdiri (rok menutup kaki) atau duduk (badan diturunkan di balik meja). Menghadap +Z sebelum diputar. */
export function tokoh(o: { baju: string; rok: string; jilbab?: string; rambut?: string; kulit: string; celemek?: string; skala?: number; lenganIK?: boolean }) {
  const b = buatBadan({ baju: o.baju, rok: o.rok, jilbab: o.jilbab, rambut: o.rambut, kulit: o.kulit, celemek: o.celemek, lenganSederhana: !o.lenganIK });
  const holder = new THREE.Group();
  b.akar.position.y = 7.8;
  holder.add(b.akar);
  if (o.skala) holder.scale.setScalar(o.skala);
  return { b, holder };
}

/** Putar lengan sederhana: maju (radian, + = ke depan/atas) dan buka ke samping. 0 = kanan, 1 = kiri. */
export function lengan(b: Badan, i: 0 | 1, maju: number, samping = 0, tekuk?: number) {
  const a = b.ayun![i];
  a.rotation.x = -maju;
  a.rotation.z = (i ? 1 : -1) * (0.08 + samping);
  if (tekuk !== undefined) a.getObjectByName('siku')?.rotation.set(-tekuk, 0, 0);
}

const posisiTangan = (b: Badan, i: 0 | 1) => {
  b.akar.updateWorldMatrix(true, true);
  return b.ayun![i].getObjectByName('tangan')!.getWorldPosition(new THREE.Vector3());
};

/** Cari sudut lengan (maju, samping) yang menempatkan telapak tangan sedekat mungkin ke titik dunia `target`. */
function raihTitik(b: Badan, i: 0 | 1, target: THREE.Vector3, batas = { maju: [-0.6, 2.4], samping: [-0.4, 1.4] }) {
  let terbaik = { d: Infinity, maju: 0, samping: 0 };
  for (let maju = batas.maju[0]; maju <= batas.maju[1]; maju += 0.04)
    for (let samping = batas.samping[0]; samping <= batas.samping[1]; samping += 0.04) {
      lengan(b, i, maju, samping);
      const d = posisiTangan(b, i).distanceTo(target);
      if (d < terbaik.d) terbaik = { d, maju, samping };
    }
  lengan(b, i, terbaik.maju, terbaik.samping);
  return terbaik.d;
}

/** Seperti raihTitik, tapi siku ikut ditekuk: untuk tangan yang dibawa dekat ke badan (HP di telinga). */
function raihTekuk(b: Badan, i: 0 | 1, target: THREE.Vector3) {
  let terbaik = { d: Infinity, maju: 0, samping: 0, tekuk: 0 };
  for (let tekuk = 0.6; tekuk <= 2.9; tekuk += 0.1)
    for (let maju = 0; maju <= 3.2; maju += 0.06)
      for (let samping = -1.2; samping <= 1.2; samping += 0.06) {
        lengan(b, i, maju, samping, tekuk);
        const d = posisiTangan(b, i).distanceTo(target);
        if (d < terbaik.d) terbaik = { d, maju, samping, tekuk };
      }
  lengan(b, i, terbaik.maju, terbaik.samping, terbaik.tekuk);
  return terbaik.d;
}

// ---------------------------------------------------------------------------------------------------------------
// Benda kecil

/**
 * Bungkus snack pabrik: kantong plastik metalik yang menggembung, segel bergerigi di atas dan bawah,
 * dan desain kemasan (merek, gambar keripik, lencana rasa, berat bersih).
 */
export function bungkusSnack(warna: string, merek: string, rasa: string, aksen: string) {
  const W = 512;
  const H = 704;
  const tex = kanvasTekstur(W, H, (g) => {
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, warna);
    gr.addColorStop(1, '#' + new THREE.Color(warna).multiplyScalar(0.62).getHexString());
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    // garis-garis cahaya diagonal khas kemasan metalik
    g.globalAlpha = 0.12;
    g.fillStyle = '#ffffff';
    for (let i = -4; i < 10; i++) {
      g.beginPath();
      g.moveTo(i * 90, 0);
      g.lineTo(i * 90 + 40, 0);
      g.lineTo(i * 90 + 260, H);
      g.lineTo(i * 90 + 220, H);
      g.fill();
    }
    g.globalAlpha = 1;
    // segel atas dan bawah: perak dengan gerigi
    for (const y0 of [0, H - 70]) {
      g.fillStyle = '#C9CED6';
      g.fillRect(0, y0, W, 70);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      for (let x = 0; x < W; x += 12) g.fillRect(x, y0, 5, 70);
    }
    // gambar keripik: lembaran bergelombang keemasan bertumpuk
    const R = rng(merek.length * 13);
    for (let i = 0; i < 9; i++) {
      const cx = 140 + R() * 240;
      const cy = 400 + R() * 150;
      const rx = 70 + R() * 30;
      const ry = 46 + R() * 20;
      g.save();
      g.translate(cx, cy);
      g.rotate(R() * Math.PI);
      const c = g.createRadialGradient(-20, -15, 5, 0, 0, rx);
      c.addColorStop(0, '#FFE39A');
      c.addColorStop(1, '#D98E2B');
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(150,80,20,0.45)';
      g.lineWidth = 3;
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.moveTo(-rx * 0.8, k * 14);
        g.quadraticCurveTo(0, k * 14 + 10, rx * 0.8, k * 14);
        g.stroke();
      }
      // bumbu
      g.fillStyle = 'rgba(190,40,20,0.55)';
      for (let k = 0; k < 14; k++) g.fillRect((R() - 0.5) * rx * 1.4, (R() - 0.5) * ry * 1.4, 4, 4);
      g.restore();
    }
    // merek besar bergaris tepi
    g.save();
    g.translate(W / 2, 205);
    g.rotate(-0.08);
    g.font = '900 104px Arial Black, Arial';
    g.textAlign = 'center';
    g.lineJoin = 'round';
    g.lineWidth = 16;
    g.strokeStyle = '#1A1A1A';
    g.strokeText(merek, 0, 0);
    g.fillStyle = '#FFF6D8';
    g.fillText(merek, 0, 0);
    g.restore();
    // lencana rasa
    g.fillStyle = aksen;
    g.beginPath();
    g.arc(W - 105, 330, 72, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#fff';
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = '#fff';
    g.font = 'bold 30px Arial';
    g.textAlign = 'center';
    g.fillText('RASA', W - 105, 318);
    g.font = 'bold 34px Arial';
    g.fillText(rasa, W - 105, 356);
    // berat bersih dan keterangan kecil
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.font = 'bold 26px Arial';
    g.textAlign = 'left';
    g.fillText('NETTO 68 g', 36, H - 100);
    g.font = '18px Arial';
    g.fillText('Keripik kentang renyah', 36, 300);
  });
  // kantong menggembung: bantal di tengah, kerutan halus, segel pipih bergerigi di ujung
  const w = 1.6;
  const h = 2.2;
  const geo = new THREE.BoxGeometry(w, h, 0.5, 24, 32, 2);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const R = rng(merek.length);
  const fase = R() * 6;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2);
    const y = p.getY(i) / (h / 2);
    const z = p.getZ(i);
    const segel = Math.abs(y) > 0.86;
    let k = segel ? 0.06 : Math.pow(Math.max(0, 1 - Math.pow(Math.abs(x), 4)), 0.5) * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(y) / 0.86, 6)), 0.5);
    // kerutan plastik
    k *= 1 + 0.08 * Math.sin(x * 9 + y * 5 + fase) * Math.sin(y * 11 - x * 3);
    let zBaru = z * k;
    // gerigi segel
    if (segel) zBaru += Math.sign(z || 1) * 0.015 * Math.sign(Math.sin(x * 60));
    p.setZ(i, zBaru);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.22, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }));
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Jajanan asli di tampah: klepon (hijau, kelapa parut), serabi (putih berpinggir cokelat), onde-onde (wijen). */
function tampahJajanan() {
  const g = new THREE.Group();
  const R = rng(5);
  const tampah = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.0, 0.3, 48), new THREE.MeshStandardMaterial({ map: teksturAnyam(), roughness: 0.9 }));
  g.add(tampah);
  const daun = new THREE.Mesh(new THREE.CircleGeometry(2.9, 40), new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.6 }));
  daun.rotation.x = -Math.PI / 2;
  daun.position.y = 0.17;
  g.add(daun);
  const klepon = new THREE.MeshPhysicalMaterial({ color: '#5E9E3A', roughness: 0.35, clearcoat: 0.6 });
  const kelapa = new THREE.MeshStandardMaterial({ color: '#F4F0E6', roughness: 0.9 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), klepon);
    b.position.set(Math.cos(a) * 1.9, 0.55, Math.sin(a) * 1.9);
    b.scale.y = 0.9;
    g.add(b);
    for (let k = 0; k < 14; k++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.05), kelapa);
      const u = R() * Math.PI * 2;
      const v = R() * 1.2;
      s.position.copy(b.position).add(V(Math.cos(u) * Math.sin(v) * 0.42, Math.cos(v) * 0.38, Math.sin(u) * Math.sin(v) * 0.42));
      s.rotation.set(R() * 3, R() * 3, R() * 3);
      g.add(s);
    }
  }
  const serabiPutih = new THREE.MeshStandardMaterial({ color: '#F5F1E4', roughness: 0.8 });
  const serabiPinggir = new THREE.MeshStandardMaterial({ color: '#B8682C', roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const s = new THREE.Group();
    const pinggir = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.55, 0.16, 28), serabiPinggir);
    const tengah = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), serabiPutih);
    tengah.scale.y = 0.35;
    tengah.position.y = 0.06;
    s.add(pinggir, tengah);
    s.position.set(Math.cos(a) * 0.75, 0.3, Math.sin(a) * 0.75);
    g.add(s);
  }
  g.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = (o as THREE.Mesh).receiveShadow = true) : null));
  return g;
}

/** Charm flanel dalam skala dunia (1 unit charm = 6 cm, dunia 1 unit = 10 cm). */
export function charm(id: CharmRajutId) {
  const g = new THREE.Group();
  const c = buatCharmRajut(id);
  g.add(c);
  g.scale.setScalar(0.6);
  return g;
}

/**
 * Ransel kanvas klasik (mengikuti foto referensi): badan berpuncak membulat, alas bawah biru tua, kantong depan
 * dengan ritsleting mendatar, patch kulit belah ketupat, ritsleting atas melengkung dengan dua penarik tali,
 * pegangan atas, tab kulit di samping, tali bahu di belakang. Titik asal di tengah badan, depan menghadap +Z.
 * `pasangCharm` memasukkan ring charm ke lingkaran lipatan tali kulit penarik ritsleting kantong depan.
 */
export function ransel(warna: string) {
  const g = new THREE.Group();
  const kanvas = kanvasTekstur(256, 256, (c) => {
    c.fillStyle = '#808080';
    c.fillRect(0, 0, 256, 256);
    // anyaman kanvas: garis lungsin dan pakan halus
    for (let i = 0; i < 256; i += 3) {
      c.fillStyle = i % 6 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
      c.fillRect(0, i, 256, 1);
      c.fillRect(i, 0, 1, 256);
    }
  });
  kanvas.repeat.set(4, 4);
  const kain = new THREE.MeshStandardMaterial({ color: warna, roughness: 0.9, bumpMap: kanvas, bumpScale: 0.6 });
  const tua = new THREE.MeshStandardMaterial({ color: '#1C2436', roughness: 0.85, bumpMap: kanvas, bumpScale: 0.6 });
  const kulit = new THREE.MeshStandardMaterial({ color: '#C2814A', roughness: 0.6 });
  const logam = new THREE.MeshStandardMaterial({ color: '#B8BCC2', metalness: 0.85, roughness: 0.3 });
  const gigi = new THREE.MeshStandardMaterial({ color: '#141824', roughness: 0.5 });

  // badan: bentuk depan persegi panjang dengan puncak setengah elips, diekstrusi dengan tepi membulat
  const W = 3.0;
  const H = 4.4;
  const bentuk = new THREE.Shape();
  const rb = 0.35;
  const yAtas = H / 2 - 1.3;
  bentuk.moveTo(-W / 2 + rb, -H / 2);
  bentuk.lineTo(W / 2 - rb, -H / 2);
  bentuk.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + rb);
  bentuk.lineTo(W / 2, yAtas);
  bentuk.absellipse(0, yAtas, W / 2, 1.3, 0, Math.PI, false);
  bentuk.lineTo(-W / 2, -H / 2 + rb);
  bentuk.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + rb, -H / 2);
  const geoBadan = new THREE.ExtrudeGeometry(bentuk, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.2, bevelSegments: 8, curveSegments: 40 });
  geoBadan.translate(0, 0, -0.5);
  const badan = new THREE.Mesh(geoBadan, kain);
  g.add(badan);
  const dFront = 0.72; // permukaan depan badan

  // alas bawah biru tua
  const alas = new THREE.Mesh(new RoundedBoxGeometry(W + 0.42, 0.85, 1.48, 4, 0.22), tua);
  alas.position.set(0, -H / 2 + 0.38, 0);
  g.add(alas);
  const loopBawah = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 20, Math.PI), tua);
  loopBawah.position.set(0, -H / 2 - 0.05, dFront + 0.05);
  loopBawah.rotation.set(Math.PI / 2, 0, Math.PI);
  g.add(loopBawah);

  // kantong depan dan ritsleting mendatar di tepi atasnya
  const kantong = new THREE.Mesh(new RoundedBoxGeometry(W - 0.25, 1.65, 0.5, 4, 0.16), kain);
  const kantongZ = dFront + 0.2;
  kantong.position.set(0, -0.95, kantongZ);
  g.add(kantong);
  const ritsKantong = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 0.07, 0.04), gigi);
  ritsKantong.position.set(0, -0.32, kantongZ + 0.25);
  g.add(ritsKantong);
  const kantongDepan = kantongZ + 0.25;

  // patch kulit belah ketupat dengan dua celah
  const patch = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.05, 2, 0.06), kulit);
  patch.rotation.z = Math.PI / 4;
  patch.position.set(0, 1.0, dFront + 0.02);
  g.add(patch);
  for (const x of [-0.07, 0.07]) {
    const celah = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.02), gigi);
    celah.position.set(x, 1.0, dFront + 0.055);
    g.add(celah);
  }

  // ritsleting atas: mengikuti lengkung puncak di sisi depan
  const titikRits: THREE.Vector3[] = [];
  for (let k = 0; k <= 40; k++) {
    const a = Math.PI * (0.05 + 0.9 * (k / 40));
    titikRits.push(new THREE.Vector3(Math.cos(a) * (W / 2 + 0.12), yAtas + Math.sin(a) * 1.42, 0.62));
  }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(titikRits), 80, 0.04, 6, false), gigi));
  // dua penarik tali di kiri atas: kepala logam + tali bersimpul putih-abu
  const tali = new THREE.MeshStandardMaterial({ color: '#D8D8D2', roughness: 0.9 });
  [0.62, 0.68].forEach((t, i) => {
    const a = Math.PI * t;
    const x = Math.cos(a) * (W / 2 + 0.12);
    const y = yAtas + Math.sin(a) * 1.42;
    const kepala = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.1), logam);
    kepala.position.set(x, y, 0.66);
    const simpul = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(x, y - 0.05, 0.7), V(x + 0.05, y - 0.22, 0.74), V(x - 0.03, y - 0.38, 0.72), V(x + 0.02, y - 0.5, 0.7)]), 16, 0.045, 6, false), tali);
    const ujung = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), tali);
    ujung.position.set(x + 0.02, y - 0.52, 0.7);
    g.add(kepala, simpul, ujung);
    void i;
  });

  // pegangan atas di belakang, tab kulit di sisi kanan, tali bahu di punggung
  const pegangan = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 8, 24, Math.PI), tua);
  pegangan.position.set(0, H / 2 + 0.15, -0.2);
  g.add(pegangan);
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.38, 0.2, 2, 0.03), kulit);
  tab.position.set(W / 2 + 0.2, -0.4, 0.3);
  g.add(tab);
  for (const s of [-1, 1]) {
    const bahu = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(s * 0.75, H / 2 - 0.4, -0.75), V(s * 0.85, 0.6, -1.15), V(s * 0.95, -0.8, -1.05), V(s * 1.15, -H / 2 + 0.7, -0.75)]), 30, 0.18, 10, false),
      tua,
    );
    bahu.scale.set(1, 1, 1);
    g.add(bahu);
  }

  // penarik kulit ritsleting kantong depan: tali kulit dilipat dua membentuk lingkaran kecil di ujung bawah.
  // Ring charm langsung masuk ke lingkaran kulit itu (tanpa cincin logam), seperti mata rantai.
  const xTarik = 0.78;
  const slider = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.13, 0.1), logam);
  slider.position.set(xTarik, -0.32, kantongDepan + 0.03);
  const rLipat = 0.075; // jari-jari lingkaran lipatan
  const tebalKulit = 0.022;
  const zc = kantongDepan + 0.03 + rLipat; // bidang tengah lipatan
  const yLipat = -0.68; // pusat lingkaran lipatan
  const yAtasTali = -0.36;
  for (const s of [-1, 1]) {
    // dua lapis tali: rapat di slider, membuka ke lingkaran di bawah
    const panjang = yAtasTali - yLipat;
    const lapis = new THREE.Mesh(new RoundedBoxGeometry(0.14, panjang, tebalKulit * 2, 2, 0.01), kulit);
    const miring = Math.atan2(rLipat - 0.02, panjang);
    lapis.position.set(xTarik, (yAtasTali + yLipat) / 2, zc + s * (rLipat + 0.02) / 2);
    lapis.rotation.x = s * miring;
    g.add(lapis);
  }
  const lipatan = new THREE.Mesh(new THREE.TorusGeometry(rLipat, tebalKulit, 10, 24, Math.PI), kulit);
  // setengah lingkaran bagian bawah, di bidang YZ; dipipihkan jadi tali selebar 0,14
  lipatan.rotation.set(0, Math.PI / 2, Math.PI);
  lipatan.scale.set(1, 1, 1);
  lipatan.position.set(xTarik, yLipat, zc);
  const lebar = new THREE.Group();
  lebar.add(lipatan);
  lebar.scale.x = 0.07 / tebalKulit;
  lebar.position.x = xTarik * (1 - lebar.scale.x);
  // lebar.scale melebarkan sepanjang X dengan titik tetap di xTarik
  g.add(slider, lebar);
  const yKait = yLipat - rLipat; // pusat tabung kulit paling bawah, tempat ring charm bertumpu
  const zKait = zc;

  g.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = (o as THREE.Mesh).receiveShadow = true) : null));
  const pasangCharm = (id: CharmRajutId) => {
    const c = charm(id);
    // puncak dalam ring charm 0,714 di atas pusat badan charm; badan charm rebah menempel di muka kantong
    const zPusat = kantongDepan + 0.22 + 0.01;
    const miring = Math.asin(Math.min(0.9, (zPusat - zKait) / 0.714));
    c.rotation.x = -miring;
    c.position.set(xTarik, yKait + tebalKulit - 0.714 * Math.cos(miring), zPusat);
    g.add(c);
    return c;
  };
  return { g, pasangCharm };
}

// ---------------------------------------------------------------------------------------------------------------
// Set

/** Kamar kos malam: meja belajar menghadap kamera, laptop menyala, jendela kota, lampu meja. */
function setKos(scene: THREE.Scene, mode: 'laptop' | 'telepon' | 'jahit') {
  const g = new THREE.Group();
  scene.background = new THREE.Color('#0E0C12');
  g.add(new THREE.HemisphereLight('#5A5A7A', '#2A1E16', 0.9));
  const lampuKamar = new THREE.PointLight('#FFD9A8', 140, 60, 1.6);
  lampuKamar.position.set(-4, 27, 6);
  g.add(lampuKamar);
  const dinding = new THREE.MeshStandardMaterial({ color: '#C9B8A2', roughness: 0.95 });
  const lantai = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: teksturUbin(), roughness: 0.5 }));
  lantai.rotation.x = -Math.PI / 2;
  lantai.receiveShadow = true;
  g.add(lantai);
  const belakang = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), dinding);
  belakang.position.set(0, 15, -12);
  belakang.receiveShadow = true;
  const kiri = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), dinding);
  kiri.rotation.y = Math.PI / 2;
  kiri.position.set(-18, 15, 6);
  kiri.receiveShadow = true;
  g.add(belakang, kiri);
  // jendela: langit kota malam dengan jendela gedung menyala
  const kota = kanvasTekstur(256, 256, (c) => {
    const gr = c.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#0B1430');
    gr.addColorStop(1, '#2A2440');
    c.fillStyle = gr;
    c.fillRect(0, 0, 256, 256);
    const R = rng(4);
    for (let i = 0; i < 9; i++) {
      const x = i * 30 + R() * 6;
      const h = 70 + R() * 120;
      c.fillStyle = '#141522';
      c.fillRect(x, 256 - h, 26, h);
      for (let y = 256 - h + 6; y < 250; y += 12)
        for (let k = 0; k < 3; k++) if (R() > 0.55) {
          c.fillStyle = R() > 0.5 ? '#F2C66A' : '#E9E2B8';
          c.fillRect(x + 3 + k * 8, y, 4, 5);
        }
    }
  });
  const jendela = new THREE.Mesh(new THREE.PlaneGeometry(9, 8), new THREE.MeshBasicMaterial({ map: kota }));
  jendela.position.set(6, 17, -11.9);
  const bingkai = new THREE.Mesh(new THREE.BoxGeometry(9.6, 8.6, 0.3), new THREE.MeshStandardMaterial({ color: '#E8E2D6', roughness: 0.6 }));
  bingkai.position.set(6, 17, -12.05);
  g.add(bingkai, jendela);
  // meja belajar dan kursi
  const seratKayu = kanvasTekstur(512, 256, (c) => {
    c.fillStyle = '#9A6A44';
    c.fillRect(0, 0, 512, 256);
    const R = rng(21);
    for (let i = 0; i < 70; i++) {
      c.strokeStyle = `rgba(${R() > 0.5 ? '70,40,20' : '190,140,90'},${0.15 + R() * 0.2})`;
      c.lineWidth = 1 + R() * 2.5;
      const y = R() * 256;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) c.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (R() - 0.5) * 2);
      c.stroke();
    }
    // mata kayu
    c.strokeStyle = 'rgba(70,40,20,0.35)';
    for (let r = 4; r < 22; r += 4) {
      c.beginPath();
      c.ellipse(360, 120, r * 2.2, r, 0, 0, Math.PI * 2);
      c.stroke();
    }
  });
  const kayu = new THREE.MeshStandardMaterial({ map: seratKayu, roughness: 0.55 });
  const meja = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 7), kayu);
  meja.position.set(0, 7.5, 0);
  meja.castShadow = meja.receiveShadow = true;
  g.add(meja);
  for (const x of [-7.4, 7.4])
    for (const z of [-3, 3]) {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.3, 0.5), kayu);
      k.position.set(x, 3.65, z);
      g.add(k);
    }
  // laptop: alas dan layar menghadap Laras (ke -Z), cahaya biru dari layar
  const laptop = new THREE.Group();
  const abu = new THREE.MeshStandardMaterial({ color: '#9AA0A8', roughness: 0.35, metalness: 0.6 });
  const alas = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.15, 2.3), abu);
  const layar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.1), abu);
  layar.position.set(0, 1.1, -1.15);
  layar.rotation.x = -0.25;
  const kaca = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.9), new THREE.MeshBasicMaterial({ color: '#BFD6FF' }));
  kaca.position.set(0, 1.1, -1.08);
  kaca.rotation.set(-0.25, Math.PI, 0);
  laptop.add(alas, layar, kaca);
  laptop.position.set(-1.5, 7.85, 0.8);
  laptop.rotation.y = Math.PI;
  laptop.visible = mode !== 'jahit';
  g.add(laptop);
  const sinarLayar = new THREE.PointLight('#9FC0FF', mode === 'jahit' ? 0 : 18, 12, 2);
  sinarLayar.position.set(-1.5, 9.5, -0.6);
  g.add(sinarLayar);
  // lampu meja hangat
  const lampuMeja = new THREE.SpotLight('#FFD39A', mode === 'jahit' ? 260 : 120, 30, 0.7, 0.6, 1.6);
  lampuMeja.position.set(5.5, 14, 1.5);
  lampuMeja.target.position.set(1, 7.6, 0.5);
  lampuMeja.castShadow = true;
  lampuMeja.shadow.mapSize.set(2048, 2048);
  g.add(lampuMeja, lampuMeja.target);
  const tiangLampu = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 10), new THREE.MeshStandardMaterial({ color: '#2A2A2A', metalness: 0.5, roughness: 0.4 }));
  tiangLampu.position.set(6.5, 10.8, 1.8);
  tiangLampu.rotation.z = 0.35;
  const kapLampu = new THREE.Mesh(new THREE.ConeGeometry(1, 1.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#2A2A2A', side: THREE.DoubleSide }));
  kapLampu.position.set(5.6, 13.9, 1.5);
  kapLampu.rotation.z = 0.6;
  g.add(tiangLampu, kapLampu);
  // tumpukan bungkus snack dan buku
  const snack: THREE.Mesh[] = [];
  ([['#D9332E', 'KRIUK', 'BALADO', '#7A1A14'], ['#F2B124', 'CHIPSY', 'KEJU', '#2E6FD9'], ['#2E6FD9', 'SNAKO', 'RUMPUT LAUT', '#2E8B57']] as const).forEach(([w, t, r, a], i) => {
    const b = bungkusSnack(w, t, r, a);
    b.rotation.set(-Math.PI / 2 + 0.1, 0, 0.4 * i - 0.5);
    b.position.set(3.2 + i * 1.1, 8.0 + i * 0.05, -0.5 + i * 0.6);
    g.add(b);
    snack.push(b);
  });
  const buku = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 2.4), new THREE.MeshStandardMaterial({ color: '#3E6B8A', roughness: 0.8 }));
  buku.position.set(-6, 8.05, -1.5);
  buku.rotation.y = 0.2;
  g.add(buku);

  // Laras duduk di balik meja menghadap kamera (+Z)
  const laras = tokoh({ baju: '#E9DCC8', rok: '#3B4A5C', jilbab: '#7FA0B8', kulit: KULIT_LARAS, lenganIK: mode === 'telepon' });
  laras.holder.position.set(0, -2.6, -3.2);
  laras.b.batang.rotation.x = 0.12;
  g.add(laras.holder);
  const bahan: THREE.Object3D[] = [];
  if (mode === 'laptop') {
    lengan(laras.b, 0, 0.9, 0.05);
    lengan(laras.b, 1, 0.9, 0.05);
  } else if (mode === 'telepon') {
    // lengan berupa rig tangan + IK dua tulang (seperti penjual di teaser): tangan kanan memegang HP di telinga,
    // siku turun ke bawah-depan; tangan kiri bertumpu di meja
    const b = laras.b;
    g.add(...b.lenganAtas);
    b.kepala.rotation.set(0.12, 0, 0.12);
    g.updateMatrixWorld(true);
    const tangan = [
      buatTangan(1, { kulit: KULIT_LARAS, lenganBaju: '#E9DCC8', lengan: b.LENGAN_BAWAH }),
      buatTangan(-1, { kulit: KULIT_LARAS, lenganBaju: '#E9DCC8', lengan: b.LENGAN_BAWAH }),
    ];
    tangan.forEach((r) => g.add(r.akar));
    // kanan orang = -X lokal badan
    const kepala = b.kepala;
    const keDunia = (v: THREE.Vector3) => b.akar.localToWorld(v);
    const arah = (v: THREE.Vector3) => v.applyQuaternion(b.akar.getWorldQuaternion(new THREE.Quaternion()));
    aturTangan(tangan[0], POSE.pegang);
    raih(b, 0, tangan[0], kepala.localToWorld(V(-1.0, -0.55, 0.25)), -1.6, arah(V(-0.4, -1, 0.5)));
    aturTangan(tangan[1], POSE.rileks);
    raih(b, 1, tangan[1], keDunia(V(1.3, 2.75, 2.2)), 0.2, arah(V(1, -0.3, -0.5)));
    // HP tegak menempel di pipi kanan, digenggam tangan kanan
    const hp = new THREE.Group();
    const badanHp = new THREE.Mesh(new RoundedBoxGeometry(0.85, 1.75, 0.1, 2, 0.08), new THREE.MeshStandardMaterial({ color: '#2A2A30', roughness: 0.35, metalness: 0.4 }));
    const kameraHp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), new THREE.MeshStandardMaterial({ color: '#0A0A0C', roughness: 0.2 }));
    kameraHp.rotation.x = Math.PI / 2;
    kameraHp.position.set(0.22, 0.65, -0.07);
    hp.add(badanHp, kameraHp);
    hp.position.copy(kepala.localToWorld(V(-0.82, -0.2, 0.25)));
    hp.quaternion.copy(kepala.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0.3)));
    g.add(hp);
  } else {
    // menjahit: kepala menunduk, kedua tangan di atas meja
    laras.b.batang.rotation.x = 0.3;
    lengan(laras.b, 0, 1.15, 0.12);
    lengan(laras.b, 1, 1.15, 0.12);
    // kain flanel, gunting, benang, dan klepon flanel setengah jadi
    const flanel = (w: string, x: number, z: number, r: number) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), new THREE.MeshStandardMaterial({ color: w, roughness: 1 }));
      m.rotation.set(-Math.PI / 2, 0, r);
      m.position.set(x, 7.77, z);
      m.receiveShadow = true;
      return m;
    };
    bahan.push(flanel('#74B33E', -4, 0.5, 0), flanel('#74B33E', -2.6, 1.6, 0.3), flanel('#FBF8F0', 3.8, 1.8, 0));
    const lembar = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.4), new THREE.MeshStandardMaterial({ color: '#74B33E', roughness: 1, side: THREE.DoubleSide }));
    lembar.rotation.set(-Math.PI / 2, 0, -0.25);
    lembar.position.set(-4.8, 7.76, -1.6);
    bahan.push(lembar);
    const gunting = new THREE.Group();
    const besi = new THREE.MeshStandardMaterial({ color: '#C9CDD2', metalness: 0.9, roughness: 0.25 });
    const pegang = new THREE.MeshStandardMaterial({ color: '#D9332E', roughness: 0.5 });
    for (const s of [-1, 1]) {
      const bilah = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 2.4), besi);
      bilah.position.set(s * 0.08, 0, -1.1);
      bilah.rotation.y = s * 0.12;
      const lubang = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.12, 8, 20), pegang);
      lubang.rotation.x = Math.PI / 2;
      lubang.position.set(s * 0.45, 0, 0.5);
      gunting.add(bilah, lubang);
    }
    gunting.position.set(2.2, 7.85, 2.2);
    gunting.rotation.y = -0.7;
    bahan.push(gunting);
    const gulungan = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.9, 20), new THREE.MeshStandardMaterial({ color: '#D6E25A', roughness: 0.8 }));
    gulungan.position.set(5.2, 8.2, 0.2);
    bahan.push(gulungan);
    // alas potong hijau bergaris, tempat klepon flanel yang baru jadi direbahkan
    const alasPotong = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.06, 4.2),
      new THREE.MeshStandardMaterial({
        map: kanvasTekstur(384, 270, (c) => {
          c.fillStyle = '#2F6B4E';
          c.fillRect(0, 0, 384, 270);
          c.strokeStyle = 'rgba(255,255,255,0.35)';
          c.lineWidth = 1;
          for (let x = 0; x < 384; x += 16) {
            c.beginPath();
            c.moveTo(x, 0);
            c.lineTo(x, 270);
            c.stroke();
          }
          for (let y = 0; y < 270; y += 16) {
            c.beginPath();
            c.moveTo(0, y);
            c.lineTo(384, y);
            c.stroke();
          }
          c.strokeStyle = 'rgba(255,230,120,0.6)';
          c.lineWidth = 2;
          c.strokeRect(8, 8, 368, 254);
        }),
        roughness: 0.8,
      }),
    );
    alasPotong.position.set(0.4, 7.78, 1.0);
    alasPotong.receiveShadow = true;
    bahan.push(alasPotong);
    const k = charm('klepon');
    k.rotation.set(-Math.PI / 2, 0, 0.35);
    k.position.set(0.4, 0, 1.0);
    k.updateMatrixWorld(true);
    const kotak = new THREE.Box3().setFromObject(k);
    k.position.y = 7.81 - kotak.min.y + 0.005;
    bahan.push(k);
    // gulungan benang berbingkai, bantalan jarum dengan jarum pentul, meteran kain
    const bingkai = new THREE.MeshStandardMaterial({ color: '#E8DCC6', roughness: 0.6 });
    ['#D6E25A', '#F27FA2', '#FBF8F0'].forEach((w, i) => {
      const gul = new THREE.Group();
      const isi = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.8, 24), new THREE.MeshStandardMaterial({ color: w, roughness: 0.85 }));
      const atas = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), bingkai);
      atas.position.y = 0.46;
      const bawah = atas.clone();
      bawah.position.y = -0.46;
      gul.add(isi, atas, bawah);
      gul.position.set(4.6 + (i % 2) * 1.2, 8.3, -1.2 + i * 0.9);
      gul.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = true) : null));
      bahan.push(gul);
    });
    const bantal = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 16), new THREE.MeshStandardMaterial({ color: '#D9332E', roughness: 0.8 }));
    bantal.scale.y = 0.75;
    bantal.position.set(-4.4, 8.3, 2.2);
    bantal.castShadow = true;
    bahan.push(bantal);
    const pentul = new THREE.MeshStandardMaterial({ color: '#C9CDD2', metalness: 0.9, roughness: 0.25 });
    ['#2E6FD9', '#F2B124', '#2E8B57', '#FBF8F0'].forEach((w, i) => {
      const a = i * 1.4 + 0.3;
      const jarum = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), pentul);
      jarum.position.set(-4.4 + Math.cos(a) * 0.35, 8.75, 2.2 + Math.sin(a) * 0.35);
      jarum.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
      const kepala = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshStandardMaterial({ color: w, roughness: 0.3 }));
      kepala.position.set(0, 0.35, 0);
      jarum.add(kepala);
      bahan.push(jarum);
    });
    const meteran = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.13, 6, 40), new THREE.MeshStandardMaterial({ color: '#F2D24A', roughness: 0.6 }));
    meteran.rotation.x = Math.PI / 2;
    meteran.scale.z = 0.4;
    meteran.position.set(-2.4, 7.82, 2.9);
    bahan.push(meteran);
    // jarum dengan benang hijau muda yang menjuntai ke klepon
    const jarumJahit = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.1, 6), pentul);
    jarumJahit.rotation.set(Math.PI / 2, 0, 0.6);
    jarumJahit.position.set(1.9, 7.84, 1.9);
    bahan.push(jarumJahit);
    const benangJahit = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(1.7, 7.84, 2.3), V(1.3, 7.86, 2.1), V(1.0, 7.9, 1.6), V(0.75, 8.0, 1.3)]), 24, 0.02, 5, false),
      new THREE.MeshStandardMaterial({ color: '#D6E25A', roughness: 0.8 }),
    );
    bahan.push(benangJahit);
    snack.forEach((s) => (s.visible = false));
    bahan.forEach((b) => g.add(b));
  }
  return g;
}

/** Pasar Minggu dalam kenangan: pagi keemasan, lapak dengan tampah jajanan asli, Nenek menggandeng Laras kecil. */
function setPasar(scene: THREE.Scene, gl: THREE.WebGLRenderer, mode: 'jalan' | 'suap') {
  const g = new THREE.Group();
  lampuStandar(scene, gl, 0.7);
  scene.environmentIntensity = 0.35;
  scene.background = new THREE.Color('#F2D6A8');
  scene.fog = new THREE.Fog('#E9C896', 40, 160);
  const matahari = new THREE.DirectionalLight('#FFD39A', 3.2);
  matahari.position.set(-30, 40, 20);
  matahari.target.position.set(6, 5, -8);
  matahari.castShadow = true;
  matahari.shadow.mapSize.set(2048, 2048);
  Object.assign(matahari.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  g.add(matahari, matahari.target, new THREE.HemisphereLight('#FFE8C8', '#5A4030', 0.7));
  const ubin = teksturUbin();
  ubin.repeat.set(36, 36);
  const lantai = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: ubin, roughness: 0.4 }));
  lantai.rotation.x = -Math.PI / 2;
  lantai.receiveShadow = true;
  g.add(lantai);
  g.add(buatLapakUtama().g);
  const R = rng(12);
  for (const z of [14, 32, -28, -46, -64]) g.add(buatLapakLain(R, 1, z));
  for (const z of [24, 6, -12, -30, -48]) g.add(buatLapakLain(R, -1, z));
  const tampah = tampahJajanan();
  tampah.position.set(12, MEJA_Y + 0.15, -6);
  tampah.scale.setScalar(0.85);
  g.add(tampah);

  // Nenek: kebaya cokelat, jarik, kerudung putih. Laras kecil: baju merah muda, rok kuning.
  const nenek = tokoh({ baju: '#8A5A3E', rok: '#4A3426', jilbab: '#F1ECE2', kulit: KULIT_NENEK });
  const kecil = tokoh({ baju: '#F08AA0', rok: '#F2CF6A', rambut: '#2A1C16', kulit: KULIT_LARAS, skala: 0.6 });
  g.add(nenek.holder, kecil.holder);
  if (mode === 'jalan') {
    // berjalan di lorong ke arah kamera (+Z); Nenek di kanan layar menggandeng tangan kiri Laras
    nenek.holder.position.set(4.4, 0, -14);
    kecil.holder.position.set(0.6, 0, -13.4);
    g.updateMatrixWorld(true);
    // kedua tangan bertemu di satu titik di antara mereka: tangan kanan Nenek turun, tangan kiri Laras naik
    lengan(nenek.b, 1, 0, 0.04);
    lengan(kecil.b, 0, 0.05, 0.05);
    const temu = V(2.15, 6.6, -13.3);
    raihTitik(nenek.b, 0, temu.clone().add(V(0.15, 0.05, 0)), { maju: [-0.3, 0.8], samping: [0, 0.9] });
    raihTitik(kecil.b, 1, temu.clone().add(V(-0.15, -0.05, 0)), { maju: [-0.3, 1.0], samping: [0, 1.4] });
    kecil.b.kepala.rotation.set(-0.25, 0.45, 0);
  } else {
    // di depan lapak: Nenek membungkuk menyuapkan klepon ke Laras kecil
    nenek.holder.position.set(5.6, 0, -5.2);
    nenek.holder.rotation.y = -Math.PI / 2 - 0.35;
    nenek.b.batang.rotation.x = 0.28;
    kecil.holder.position.set(1.8, 0, -6.6);
    kecil.holder.rotation.y = Math.PI / 2 + 0.25;
    kecil.b.kepala.rotation.set(-0.35, 0, 0);
    lengan(nenek.b, 1, 0.1, 0.05);
    lengan(kecil.b, 0, 0.35, 0.1);
    lengan(kecil.b, 1, 0.35, 0.1);
    g.updateMatrixWorld(true);
    // klepon tepat di depan mulut Laras kecil, tangan kanan Nenek dibawa ke sana
    const mulut = kecil.b.kepala.localToWorld(V(0, -0.45, 1.0));
    raihTitik(nenek.b, 0, mulut.clone().add(V(0.15, -0.25, 0)), { maju: [0.2, 2.2], samping: [-0.6, 0.6] });
    const klepon = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshPhysicalMaterial({ color: '#5E9E3A', roughness: 0.35, clearcoat: 0.6 }));
    klepon.position.copy(mulut);
    klepon.scale.setScalar(0.75);
    g.add(klepon);
  }
  return g;
}

/** Halaman kampus siang: paving, pohon, bangku, dinding gedung. Teman menunjuk klepon flanel di ransel Laras. */
function setKampus(scene: THREE.Scene, gl: THREE.WebGLRenderer) {
  const g = new THREE.Group();
  lampuStandar(scene, gl, 0.9);
  scene.background = new THREE.Color('#BFDDF2');
  const matahari = new THREE.DirectionalLight('#FFF1D8', 2.8);
  matahari.position.set(20, 40, 25);
  matahari.castShadow = true;
  matahari.shadow.mapSize.set(2048, 2048);
  Object.assign(matahari.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  g.add(matahari, new THREE.HemisphereLight('#DDEBFF', '#6A7A5A', 0.8));
  const paving = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: teksturUbin(), roughness: 0.8, color: '#D8CFC2' }));
  paving.rotation.x = -Math.PI / 2;
  paving.receiveShadow = true;
  g.add(paving);
  const gedung = new THREE.Mesh(new THREE.BoxGeometry(80, 40, 2), new THREE.MeshStandardMaterial({ color: '#E8DCC6', roughness: 0.9 }));
  gedung.position.set(0, 20, -30);
  gedung.receiveShadow = true;
  g.add(gedung);
  for (let i = 0; i < 6; i++) {
    const kaca = new THREE.Mesh(new THREE.PlaneGeometry(6, 8), new THREE.MeshStandardMaterial({ color: '#7FA6C2', roughness: 0.2, metalness: 0.3 }));
    kaca.position.set(-30 + i * 12, 18, -28.9);
    g.add(kaca);
  }
  const daun = new THREE.MeshStandardMaterial({ color: '#4E8A3A', roughness: 0.9 });
  for (const [x, z] of [[-16, -14], [18, -18]]) {
    const batang = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 14, 12), new THREE.MeshStandardMaterial({ color: '#6B4A32', roughness: 0.9 }));
    batang.position.set(x, 7, z);
    batang.castShadow = true;
    g.add(batang);
    for (let k = 0; k < 5; k++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(4 + (k % 2), 16, 12), daun);
      s.position.set(x + Math.cos(k * 1.3) * 3, 16 + (k % 3) * 1.5, z + Math.sin(k * 1.3) * 3);
      s.castShadow = true;
      g.add(s);
    }
  }
  const bangku = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 3), new THREE.MeshStandardMaterial({ color: '#8A5E3C', roughness: 0.8 }));
  bangku.position.set(-9, 4.5, -6);
  bangku.castShadow = true;
  g.add(bangku);

  // Laras membelakangi kamera sedikit menyamping (ransel terlihat), teman di depannya menunjuk
  const laras = tokoh({ baju: '#E9DCC8', rok: '#3B4A5C', jilbab: '#7FA0B8', kulit: KULIT_LARAS });
  laras.holder.position.set(-0.6, 0, 2.5);
  // punggung (ransel dan klepon) menghadap kamera, wajah ke arah teman
  laras.holder.rotation.y = Math.PI + 0.62;
  lengan(laras.b, 0, 0.1, 0.05);
  lengan(laras.b, 1, 0.1, 0.05);
  const tas = ransel('#3B5A8F');
  // puncak ransel setinggi bahu (bahu ±12,5 di atas lantai), punggung ransel menempel ke punggung Laras
  tas.g.position.set(0, 10.2, -2.0);
  tas.g.rotation.y = Math.PI;
  laras.b.akar.add(tas.g);
  tas.g.position.y -= 7.8;
  tas.pasangCharm('klepon');
  // tali bahu yang dipakai: dari puncak ransel melewati atas bahu, turun di dada, lalu masuk ke bawah ketiak
  // kembali ke sisi bawah ransel. Koordinat di ruang batang supaya ikut badan.
  laras.b.akar.updateMatrixWorld(true);
  const bahanTali = new THREE.MeshStandardMaterial({ color: '#1C2436', roughness: 0.85 });
  [0, 1].forEach((i) => {
    const bahu = laras.b.batang.worldToLocal(laras.b.bahu[i].getWorldPosition(V(0, 0, 0)));
    const s = Math.sign(bahu.x) || (i ? 1 : -1);
    const x = Math.abs(bahu.x);
    const kurva = new THREE.CatmullRomCurve3([
      V(s * 0.7, bahu.y - 0.3, -1.6),
      V(s * x * 0.7, bahu.y + 0.55, -0.9),
      V(s * x * 0.62, bahu.y + 0.6, 0.2),
      V(s * x * 0.6, bahu.y - 0.2, 1.45),
      V(s * x * 0.78, bahu.y - 1.4, 1.35),
      V(s * Math.max(x * 1.1, 1.55), bahu.y - 1.95, 0.25),
      // keluar di samping ransel (ransel lebih lebar dari badan), lalu masuk ke sudut bawahnya
      V(s * 1.95, bahu.y - 2.7, -0.9),
      V(s * 1.85, 1.15, -1.45),
      V(s * 1.62, 0.75, -1.6),
    ]);
    const tali = new THREE.Mesh(new THREE.TubeGeometry(kurva, 80, 0.15, 10, false), bahanTali);
    tali.castShadow = true;
    laras.b.batang.add(tali);
    // gesper pengatur panjang di bagian tali bawah, di samping badan
    const titikGesper = kurva.getPointAt(0.84);
    const gesper = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.12), new THREE.MeshStandardMaterial({ color: '#15171C', roughness: 0.4 }));
    gesper.position.copy(titikGesper);
    gesper.lookAt(laras.b.batang.localToWorld(kurva.getPointAt(0.9)));
    laras.b.batang.add(gesper);
  });
  const teman = tokoh({ baju: '#F2B124', rok: '#5A4A6A', jilbab: '#C9A27E', kulit: '#B57E5A' });
  teman.holder.position.set(3.6, 0, -4.2);
  teman.holder.rotation.y = -0.35;
  lengan(teman.b, 0, 1.25, -0.25);
  lengan(teman.b, 1, 0.1, 0.05);
  teman.b.kepala.rotation.set(0.12, -0.2, 0);
  g.add(laras.holder, teman.holder);
  return g;
}

/** Ransel di gantungan dinding kamar dengan klepon flanel tergantung (close-up). */
function setTas(scene: THREE.Scene, gl: THREE.WebGLRenderer) {
  const g = new THREE.Group();
  lampuStandar(scene, gl, 0.7);
  scene.background = new THREE.Color('#D9C7AE');
  const dinding = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshStandardMaterial({ color: '#D9C7AE', roughness: 0.95 }));
  dinding.position.z = -2.2;
  dinding.receiveShadow = true;
  g.add(dinding);
  const pagi = new THREE.DirectionalLight('#FFE2B0', 2.6);
  pagi.position.set(-8, 10, 12);
  pagi.castShadow = true;
  pagi.shadow.mapSize.set(2048, 2048);
  Object.assign(pagi.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
  g.add(pagi);
  const tas = ransel('#3B5A8F');
  g.add(tas.g);
  tas.pasangCharm('klepon');
  return g;
}

/** Penutup: lima charm flanel berjajar di atas kain krem. */
export function setPenutup(scene: THREE.Scene, gl: THREE.WebGLRenderer) {
  const g = new THREE.Group();
  lampuStandar(scene, gl, 0.85);
  scene.background = new THREE.Color('#F5EBDD');
  const kunci = new THREE.DirectionalLight('#FFF4E6', 2.2);
  kunci.position.set(-4, 8, 10);
  kunci.castShadow = true;
  kunci.shadow.mapSize.set(2048, 2048);
  Object.assign(kunci.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
  g.add(kunci);
  const alas = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.07 }));
  alas.position.z = -0.6;
  alas.receiveShadow = true;
  g.add(alas);
  // dua baris tiga: lima karakter reguler dan karakter rahasia (siluet gelap dengan "?") di ujung
  const posisi: [number, number][] = [[-1.1, -1.2], [0, -1.2], [1.1, -1.2], [-1.1, -2.8], [0, -2.8], [1.1, -2.8]];
  (['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'] as CharmRajutId[]).forEach((id, i) => {
    const c = buatCharmRajut(id);
    c.scale.setScalar(0.5);
    c.position.set(posisi[i][0], posisi[i][1], 0);
    c.rotation.y = posisi[i][0] * 0.15;
    g.add(c);
  });
  const rahasia = buatCharm('secret').grup;
  // titik asal buatCharm di tengah tinggi total; geser supaya badannya sejajar charm lain
  rahasia.scale.setScalar(0.5);
  rahasia.position.set(posisi[5][0], posisi[5][1], 0);
  rahasia.rotation.y = -0.16;
  g.add(rahasia);
  // sorot kecil supaya tanda tanya karakter rahasia tetap terbaca
  const sorotRahasia = new THREE.SpotLight('#FFE9B0', 30, 8, 0.4, 0.6, 1.4);
  sorotRahasia.position.set(posisi[5][0] + 0.5, posisi[5][1] + 1.6, 3);
  sorotRahasia.target.position.set(posisi[5][0], posisi[5][1], 0);
  g.add(sorotRahasia, sorotRahasia.target);
  // ratakan: puncak ring tiap charm dalam satu baris pada ketinggian yang sama
  const semua = g.children.filter((o) => o !== alas && o.type === 'Group');
  [0, 1].forEach((baris) => {
    const anggota = semua.filter((o) => Math.abs(o.position.y - posisi[baris * 3][1]) < 0.6);
    const puncak = anggota.map((o) => new THREE.Box3().setFromObject(o).max.y);
    const target = Math.max(...puncak);
    anggota.forEach((o, k) => (o.position.y += target - puncak[k]));
  });
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Bingkai

type Bingkai = { set: 'kos-laptop' | 'kos-snack' | 'pasar-jalan' | 'pasar-suap' | 'kos-telepon' | 'kos-jahit' | 'tas' | 'kampus' | 'penutup'; kam: Kam; teks: string; detik: string };

const BINGKAI: Bingkai[] = [
  { set: 'kos-laptop', detik: '0-7', kam: K([-7.5, 12.5, 9.5], [0, 12, -3], 40), teks: 'Tiap malam, jajanku selalu sama. Bungkus plastik, rasa pabrik.' },
  { set: 'kos-snack', detik: '7-11', kam: K([6.5, 12.5, 6.5], [4.2, 8.0, 0.2], 32), teks: 'Padahal dulu, tiap Minggu pagi…' },
  { set: 'pasar-jalan', detik: '11-19', kam: K([2.6, 8, 12], [3.0, 8.5, -14], 36), teks: '…Nenek selalu ngajak aku ke pasar.' },
  { set: 'pasar-suap', detik: '19-25', kam: K([2.2, 11, 13.5], [3.6, 9.0, -6], 32), teks: 'Klepon yang gula merahnya meletus di mulut.' },
  { set: 'kos-telepon', detik: '25-31', kam: K([-7.5, 11.6, 10], [-0.8, 10.9, -3.2], 34), teks: '"Nek, aku kangen klepon."' },
  { set: 'kos-jahit', detik: '31-39', kam: K([0.3, 16, 10.5], [0, 7.8, 2.4], 30), teks: 'Di kos nggak ada kompor. Jadi… kenapa nggak dijahit aja?' },
  { set: 'tas', detik: '39-44', kam: K([2.4, -0.7, 7.6], [0.6, -1.6, 1.0], 30), teks: 'Sekarang klepon Nenek ikut ke mana-mana.' },
  { set: 'kampus', detik: '44-52', kam: K([11, 13, 31], [0.6, 10, -1], 30), teks: '"Itu apa?" Dan aku jadi bisa cerita tentang pasar Nenek.' },
  { set: 'penutup', detik: '52-58', kam: K([0, -0.7, 9.5], [0, -0.7, 0], 34), teks: 'Collect it. Taste the story.' },
];
export const STORY_PASAR_FRAMES = BINGKAI.length;

const Adegan: React.FC<{ b: Bingkai; kam?: Kam }> = ({ b, kam }) => {
  const { gl, scene, camera, advance } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const isi = useMemo(() => {
    scene.fog = null;
    switch (b.set) {
      case 'kos-laptop':
      case 'kos-snack':
        return setKos(scene, 'laptop');
      case 'kos-telepon':
        return setKos(scene, 'telepon');
      case 'kos-jahit':
        return setKos(scene, 'jahit');
      case 'pasar-jalan':
        return setPasar(scene, gl, 'jalan');
      case 'pasar-suap':
        return setPasar(scene, gl, 'suap');
      case 'tas':
        return setTas(scene, gl);
      case 'kampus':
        return setKampus(scene, gl);
      default:
        return setPenutup(scene, gl);
    }
  }, [b.set, gl, scene]);
  // papan nama lapak memakai logo yang dimuat asinkron: gambar ulang setelah siap
  useEffect(() => {
    const h = delayRender('logo papan');
    logoSiap().then(() => {
      advance(performance.now());
      continueRender(h);
    });
  }, [advance]);
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

export const StoryPasarFrame: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const b = BINGKAI[Math.min(f, BINGKAI.length - 1)];
  const [siap, setSiap] = useState(false);
  const [h] = useState(() => delayRender('font story'));
  useEffect(() => {
    Promise.all([gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(h);
    });
  }, [h]);
  if (!siap) return <AbsoluteFill style={{ background: '#111' }} />;
  const kenangan = b.set.startsWith('pasar');
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.05, far: 1500 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan b={b} />
      </ThreeCanvas>
      {/* kenangan: warna hangat pudar dan vinyet lembut seperti foto lama */}
      {kenangan && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,220,170,0) 45%, rgba(120,70,30,0.45) 100%)', mixBlendMode: 'multiply' }} />}
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

// ---------------------------------------------------------------------------------------------------------------
// Video "Pasar Minggu" (±51 detik): tiap bingkai jadi satu shot dengan kamera bergerak pelan, narasi Laras.

const FPS = 60;
export const STORY_PASAR_VIDEO_FRAMES = 51 * FPS;
const det = (d: number) => Math.round(d * FPS);
const lancar = (t: number) => Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, t)));

type Shot = { i: number; dari: number; sampai: number; dorong: number; geser: [number, number, number] };
// i = indeks BINGKAI; dorong = seberapa jauh kamera maju ke titik lihat; geser = pergeseran kamera (unit dunia)
const SHOT: Shot[] = [
  { i: 0, dari: 0, sampai: 8, dorong: 0.14, geser: [1.2, 0, 0] },
  { i: 1, dari: 8, sampai: 11.5, dorong: 0.18, geser: [-0.4, 0.3, 0] },
  { i: 2, dari: 11.5, sampai: 16.5, dorong: -0.12, geser: [0, 0.4, 0] },
  { i: 3, dari: 16.5, sampai: 21.5, dorong: 0.16, geser: [0.6, 0, 0] },
  { i: 4, dari: 21.5, sampai: 26, dorong: 0.12, geser: [0.5, 0, 0] },
  { i: 5, dari: 26, sampai: 33.5, dorong: 0.2, geser: [0, 0, 0] },
  { i: 6, dari: 33.5, sampai: 38, dorong: 0.15, geser: [-0.3, 0.2, 0] },
  { i: 7, dari: 38, sampai: 45, dorong: 0.1, geser: [-2.5, 0, 0] },
  { i: 8, dari: 45, sampai: 51, dorong: 0.08, geser: [0, 0, 0] },
];

const NARASI: { t: number; vo: string; teks: string; d: number }[] = [
  { t: 0.7, vo: 'p01', teks: 'Tiap malam, jajanku selalu sama. Bungkus plastik, rasa pabrik.', d: 7.1 },
  { t: 8.2, vo: 'p02', teks: 'Padahal dulu, tiap Minggu pagi…', d: 3.2 },
  { t: 12.2, vo: 'p03', teks: 'Nenek selalu ngajak aku ke pasar.', d: 2.9 },
  { t: 17.2, vo: 'p04', teks: 'Klepon yang gula merahnya meletus di mulut.', d: 3.1 },
  { t: 22.4, vo: 'p05', teks: '"Nek… aku kangen klepon."', d: 2.6 },
  { t: 26.6, vo: 'p06', teks: 'Di kos nggak ada kompor. Jadi… kenapa nggak dijahit aja?', d: 6.4 },
  { t: 34.0, vo: 'p07', teks: 'Sekarang, klepon Nenek ikut ke mana-mana.', d: 3.8 },
  { t: 38.8, vo: 'p08', teks: '"Eh, itu apa?"', d: 1.7 },
  { t: 40.8, vo: 'p09', teks: 'Dan aku jadi bisa cerita, tentang pasar Nenek.', d: 4.2 },
  { t: 45.8, vo: 'p10', teks: 'Collect it. Taste the story.', d: 5.0 },
];

const geraknya = (s: Shot, u: number): Kam => {
  const b = BINGKAI[s.i].kam;
  const k = lancar(u);
  const p = b.p.clone().lerp(b.l, s.dorong * k).add(V(...s.geser).multiplyScalar(k));
  return { p, l: b.l.clone().add(V(...s.geser).multiplyScalar(k * 0.4)), fov: b.fov };
};

/** Tirai antar shot: celup hitam singkat; masuk kenangan (shot 3) dan keluar kenangan (shot 5) memakai kilau hangat. */
const tirai = (sec: number) => {
  let hitam = interpolate(sec, [0, 0.8], [1, 0], { extrapolateRight: 'clamp' });
  let hangat = 0;
  SHOT.slice(1).forEach((s) => {
    const kenangan = s.i === 2 || s.i === 4;
    const v = interpolate(sec, [s.dari - 0.35, s.dari, s.dari + 0.45], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    if (kenangan) hangat = Math.max(hangat, v);
    else hitam = Math.max(hitam, v);
  });
  hitam = Math.max(hitam, interpolate(sec, [50.3, 51], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return { hitam, hangat };
};

const SuaraPasar: React.FC = () => {
  const naikTurun = (lama: number, puncak: number) => (f: number) =>
    interpolate(f, [0, det(0.8), det(lama) - det(0.8), det(lama)], [0, puncak, puncak, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      {/* musik: pad hangat sepanjang video */}
      <BunyiPanjang file="pad" dari={0} lama={det(51)} durasiFile={30.24} vol={naikTurun(51, 0.14)} />
      {/* kamar kos malam: dengung ruangan */}
      <BunyiPanjang file="room" dari={0} lama={det(11.5)} durasiFile={8} vol={naikTurun(11.5, 0.16)} />
      <Bunyi file="type" dari={det(1.2)} lama={det(3)} vol={0.12} />
      {/* bungkus plastik diremas */}
      <Bunyi file="scratch" dari={det(8.3)} lama={det(1.6)} vol={0.18} />
      {/* kenangan pasar pagi: keramaian dan burung */}
      <Bunyi file="shimmer" dari={det(11.2)} lama={det(2.5)} vol={0.3} />
      <BunyiPanjang file="crowd" dari={det(11.5)} lama={det(10)} durasiFile={8} vol={naikTurun(10, 0.2)} />
      <BunyiPanjang file="birds" dari={det(11.5)} lama={det(10)} durasiFile={8.06} vol={naikTurun(10, 0.12)} />
      {/* kembali ke kos */}
      <BunyiPanjang file="room" dari={det(21.5)} lama={det(12)} durasiFile={8} vol={naikTurun(12, 0.15)} />
      {/* gunting dan kain saat menjahit */}
      <Bunyi file="cloth" dari={det(27)} lama={det(2.2)} vol={0.3} />
      <Bunyi file="carve" dari={det(29.6)} lama={det(2)} vol={0.15} />
      {/* klik ring di tas */}
      <Bunyi file="tick" dari={det(33.8)} lama={det(0.3)} vol={0.5} />
      <Bunyi file="clunk" dari={det(33.82)} lama={det(0.4)} vol={0.25} />
      {/* kampus siang */}
      <BunyiPanjang file="birds" dari={det(38)} lama={det(7)} durasiFile={8.06} vol={naikTurun(7, 0.14)} />
      <BunyiPanjang file="crowd" dari={det(38)} lama={det(7)} durasiFile={8} vol={naikTurun(7, 0.1)} />
      {/* penutup */}
      <Bunyi file="chime" dari={det(45.3)} lama={det(3.2)} vol={0.4} />
      {NARASI.map((n) => (
        <Sequence key={n.vo} from={det(n.t)} durationInFrames={det(n.d + 0.4)} layout="none">
          <Audio src={staticFile(`vo/pasar/${n.vo}.wav`)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};

export const StoryPasarVideo: React.FC<{ sfx?: boolean }> = ({ sfx = false }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sec = f / FPS;
  const [siap, setSiap] = useState(false);
  const [h] = useState(() => delayRender('font story video'));
  useEffect(() => {
    Promise.all([gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(h);
    });
  }, [h]);
  if (!siap) return <AbsoluteFill style={{ background: '#111' }} />;
  const shot = SHOT.find((s) => sec >= s.dari && sec < s.sampai) ?? SHOT[SHOT.length - 1];
  const b = BINGKAI[shot.i];
  const kam = geraknya(shot, (sec - shot.dari) / (shot.sampai - shot.dari));
  const kenangan = b.set.startsWith('pasar');
  const { hitam, hangat } = tirai(sec);
  const narasi = NARASI.find((n) => sec >= n.t - 0.15 && sec < n.t + n.d + 0.3);
  const op = narasi ? interpolate(sec, [narasi.t - 0.15, narasi.t + 0.1, narasi.t + narasi.d, narasi.t + narasi.d + 0.3], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const logo = interpolate(sec, [45.3, 46.0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6)) });
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.05, far: 1500 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan b={b} kam={kam} />
      </ThreeCanvas>
      {kenangan && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(255,220,170,0) 45%, rgba(120,70,30,0.45) 100%)', mixBlendMode: 'multiply' }} />}
      {b.set === 'penutup' && (
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 300 }}>
          <Img src={logoUrl} style={{ width: 640, transform: `scale(${0.6 + 0.4 * logo})`, opacity: Math.min(1, logo * 1.5) }} />
        </AbsoluteFill>
      )}
      {narasi && (
        <div style={{ position: 'absolute', left: 90, right: 90, ...(b.set === 'penutup' ? { top: 760 } : { bottom: 300 }), textAlign: 'center', fontFamily: gochi.fontFamily, fontSize: 58, lineHeight: 1.25, color: '#FFF8F1', textShadow: '0 2px 12px rgba(0,0,0,0.6)', opacity: op }}>
          {narasi.teks}
        </div>
      )}
      <AbsoluteFill style={{ background: '#FFE9C4', opacity: hangat * 0.9 }} />
      <AbsoluteFill style={{ background: '#000', opacity: hitam }} />
      {sfx && <SuaraPasar />}
    </AbsoluteFill>
  );
};
