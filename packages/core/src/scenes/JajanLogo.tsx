// Logo "Jajan Dulu!" gaya huruf balon (seperti balon foil yang ditiup penuh), satu frame per varian warna.
// Tiap huruf jadi balon sendiri: huruf Modak digambar ke kanvas, ditebalkan dan dibulatkan (blur + ambang),
// lalu ditiup: tinggi = akar jarak ke tepi, jadi sisinya tegak membulat dan tengahnya menggembung seperti balon.
// Huruf disusun dua baris, sedikit miring dan saling tumpang-tindih supaya playful.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadModak } from '@remotion/google-fonts/Modak';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { lampuStandar } from '../../../three/src/jajan/lampu';

const modak = loadModak('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['500'], subsets: ['latin'] });

type Varian = {
  nama: string;
  latar: [string, string];
  /** warna tiap huruf J-a-j-a-n-D-u-l-u-! (kalau lebih pendek, warna terakhir dipakai untuk sisanya) */
  huruf: string[];
  awan?: boolean;
  bintang?: string;
};

export const VARIAN_LOGO: Varian[] = [
  { nama: 'A · Balon pink di langit', latar: ['#A9D8FA', '#6FB4EE'], huruf: ['#FF2E93'], awan: true },
  { nama: 'B · Warna jajanan', latar: ['#FFF4E4', '#F7D9B4'], huruf: ['#4DB33D', '#FF9A1F', '#FF3F8E', '#FFC21A', '#E8742A', '#FF3F8E', '#4DB33D', '#FFC21A', '#FF9A1F', '#FF3F8E'], bintang: '#E8742A' },
  { nama: 'C · Krem & pink di cokelat', latar: ['#5A3427', '#2A1712'], huruf: ['#FFE2A8', '#FFE2A8', '#FFE2A8', '#FFE2A8', '#FFE2A8', '#FF3F8E'], bintang: '#FFE2A8' },
];
export const LOGO_FRAMES = VARIAN_LOGO.length;

const SKALA = 0.0052; // unit dunia per piksel kanvas
const UK = 640; // kanvas per huruf
const LEBAR_LUBANG = 11; // piksel pelebaran lubang huruf (a, D) dari dalam; bentuk luar huruf tidak berubah

/** Jarak Euclid kuadrat 1D (Felzenszwalb & Huttenlocher). */
function edt1d(f: Float64Array, n: number) {
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  let k = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
  return d;
}

function jarakKeTepi(mask: Uint8Array, w: number, h: number) {
  const g = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = mask[i] ? 1e12 : 0;
  const kol = new Float64Array(h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) kol[y] = g[y * w + x];
    const d = edt1d(kol, h);
    for (let y = 0; y < h; y++) g[y * w + x] = d[y];
  }
  const bar = new Float64Array(w);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) bar[x] = g[y * w + x];
    const d = edt1d(bar, w);
    for (let x = 0; x < w; x++) g[y * w + x] = Math.sqrt(d[x]);
  }
  return g;
}

/** Blur kotak berulang (mendekati Gaussian); nilai di luar huruf tetap 0 supaya tepinya tidak melebar. */
function haluskan(src: Float64Array, w: number, h: number, r: number, ulang: number, jagaTepi = true) {
  const a = Float64Array.from(src);
  const b = new Float64Array(w * h);
  for (let u = 0; u < ulang; u++) {
    for (let y = 0; y < h; y++) {
      let jum = 0;
      for (let x = -r; x <= r; x++) jum += a[y * w + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[y * w + x] = jum / (2 * r + 1);
        jum += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let jum = 0;
      for (let y = -r; y <= r; y++) jum += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = jum / (2 * r + 1);
        jum += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  if (jagaTepi) for (let i = 0; i < w * h; i++) if (src[i] <= 0) a[i] = 0;
  return a;
}

/** Masker satu huruf: digambar tebal, lalu di-blur dan diambang supaya sudutnya membulat seperti balon. */
function maskerHuruf(ch: string, putar: number) {
  const c = document.createElement('canvas');
  c.width = c.height = UK;
  const g = c.getContext('2d')!;
  g.font = `440px "${modak.fontFamily}"`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  // goresan tipis saja: Modak sudah gemuk, goresan tebal menutup lubang a, u, n
  g.lineWidth = 6;
  g.fillStyle = g.strokeStyle = '#fff';
  g.translate(UK / 2, UK / 2);
  g.rotate(putar);
  // Modak punya ruang atas yang tinggi: geser ke bawah supaya badan huruf di tengah kanvas
  g.fillText(ch, 0, 70);
  g.strokeText(ch, 0, 70);
  const b = document.createElement('canvas');
  b.width = b.height = UK;
  const gb = b.getContext('2d')!;
  gb.filter = 'blur(5px)';
  gb.drawImage(c, 0, 0);
  const data = gb.getImageData(0, 0, UK, UK).data;
  const mask = new Uint8Array(UK * UK);
  for (let i = 0; i < UK * UK; i++) mask[i] = data[i * 4 + 3] > 128 ? 1 : 0;
  // celah u (dari atas) dan n (dari bawah) di Modak cuma segaris; dipahat jadi alur yang jelas
  if (ch === 'u') pahatCelah(mask, -1, putar);
  if (ch === 'n') pahatCelah(mask, 1, putar);
  return mask;
}

/** Alur membulat di tengah huruf: arah -1 dari atas (u), 1 dari bawah (n). Ikut kemiringan huruf. */
function pahatCelah(mask: Uint8Array, arah: number, putar: number) {
  let x0 = UK;
  let x1 = 0;
  let y0 = UK;
  let y1 = 0;
  for (let y = 0; y < UK; y++)
    for (let x = 0; x < UK; x++)
      if (mask[y * UK + x]) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const tinggi = y1 - y0;
  const r = (x1 - x0) * 0.07; // setengah lebar alur
  const ujung = cy + arah * tinggi * 0.5 + arah * 20; // mulai di luar huruf
  const dasar = cy + arah * tinggi * -0.12; // berhenti sedikit lewat tengah
  const c = Math.cos(-putar);
  const sn = Math.sin(-putar);
  for (let y = 0; y < UK; y++)
    for (let x = 0; x < UK; x++) {
      // koordinat dalam bingkai huruf yang tidak dimiringkan
      const lx = (x - cx) * c - (y - cy) * sn;
      const ly = (x - cx) * sn + (y - cy) * c + cy;
      const a = Math.min(ujung, dasar);
      const b = Math.max(ujung, dasar);
      const t = Math.min(b, Math.max(a, ly));
      if (lx * lx + (ly - t) * (ly - t) <= r * r) mask[y * UK + x] = 0;
    }
}

/** Satu balon huruf. Titik asal di tengah kanvas huruf. */
function balonHuruf(ch: string, putar: number, warna: string) {
  const asli = maskerHuruf(ch, putar);
  // lubang huruf (a, D) di Modak sangat kecil: dilebarkan dari dalam supaya tetap terbuka setelah ditiup
  const luar = new Uint8Array(UK * UK);
  const antre: number[] = [];
  for (let i = 0; i < UK; i++) antre.push(i, (UK - 1) * UK + i, i * UK, i * UK + UK - 1);
  for (const i of antre) luar[i] = asli[i] ? 0 : 1;
  for (let q = 0; q < antre.length; q++) {
    const i = antre[q];
    if (!luar[i]) continue;
    const x = i % UK;
    const y = (i - x) / UK;
    for (const j of [x > 0 ? i - 1 : -1, x < UK - 1 ? i + 1 : -1, y > 0 ? i - UK : -1, y < UK - 1 ? i + UK : -1])
      if (j >= 0 && !luar[j] && !asli[j]) {
        luar[j] = 1;
        antre.push(j);
      }
  }
  const mask = new Uint8Array(UK * UK);
  const bukanLubang = new Uint8Array(UK * UK);
  let adaLubang = false;
  for (let i = 0; i < UK * UK; i++) {
    const lubang = !asli[i] && !luar[i];
    bukanLubang[i] = lubang ? 0 : 1;
    if (lubang) adaLubang = true;
  }
  const keLubang = adaLubang ? jarakKeTepi(bukanLubang, UK, UK) : null;
  for (let i = 0; i < UK * UK; i++) mask[i] = asli[i] && (!keLubang || keLubang[i] > LEBAR_LUBANG) ? 1 : 0;
  // medan halus 0..1 dari masker: kontur 0,5-nya jadi garis tepi huruf yang mulus (bukan tangga piksel)
  const medan = haluskan(Float64Array.from(mask), UK, UK, 2, 2, false);
  for (let i = 0; i < UK * UK; i++) mask[i] = medan[i] > 0.5 ? 1 : 0;
  const d = haluskan(jarakKeTepi(mask, UK, UK), UK, UK, 9, 4);
  // kotak batas supaya mesh hanya mencakup huruf
  let x0 = UK;
  let x1 = 0;
  let y0 = UK;
  let y1 = 0;
  for (let y = 0; y < UK; y++)
    for (let x = 0; x < UK; x++)
      if (mask[y * UK + x]) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  x0 = Math.max(0, x0 - 1);
  y0 = Math.max(0, y0 - 1);
  x1 = Math.min(UK - 1, x1 + 1);
  y1 = Math.min(UK - 1, y1 + 1);
  const nx = x1 - x0 + 1;
  const ny = y1 - y0 + 1;
  const pos = new Float32Array(nx * ny * 3);
  const nor = new Float32Array(nx * ny * 3);
  const dalam = new Uint8Array(nx * ny);
  // tinggi balon per piksel; normal dihitung dari medan ini (bukan dari segitiga) supaya dinding curam tidak bergerigi
  // profil akar yang digeser: tetap menggembung seperti balon, tapi kemiringan di tepi terbatas (tidak tegak lurus)
  const H = (k: number) => 7.8 * (Math.sqrt(Math.max(0, d[k]) + 1.5) - Math.sqrt(1.5));
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const k = (y0 + j) * UK + (x0 + i);
      const n = j * nx + i;
      const px = x0 + i;
      const py = y0 + j;
      // balon: tinggi sebanding akar jarak ke tepi (sisi tegak, puncak membulat)
      let tinggi = H(k);
      let sx = px;
      let sy = py;
      const tepi = mask[k] && px > 0 && py > 0 && px < UK - 1 && py < UK - 1 && (!mask[k - 1] || !mask[k + 1] || !mask[k - UK] || !mask[k + UK]);
      {
        // normal permukaan dari turunan tinggi; di tepi (tinggi 0) normal mendatar menghadap keluar
        let nxw = 0;
        let nyw = 0;
        let nzw = 1;
        if (px > 0 && py > 0 && px < UK - 1 && py < UK - 1) {
          const dhx = (H(k + 1) - H(k - 1)) / 2;
          const dhy = (H(k + UK) - H(k - UK)) / 2;
          nxw = -dhx;
          nyw = dhy;
          nzw = 1;
          // peralihan bertahap menurut jarak ke tepi: makin dekat tepi, normal makin mendatar menghadap keluar
          const wJarak = tepi ? 1 : Math.max(0, 1 - Math.max(0, d[k]) / 3.5);
          if (wJarak > 0) {
            const fx = (medan[k + 1] - medan[k - 1]) / 2;
            const fy = (medan[k + UK] - medan[k - UK]) / 2;
            const L = Math.hypot(fx, fy) || 1;
            // campur ke arah keluar mendatar untuk dinding yang sangat curam
            const w = wJarak * wJarak * (3 - 2 * wJarak);
            const L2 = Math.hypot(nxw, nyw, nzw);
            nxw = (nxw / L2) * (1 - w) + (-fx / L) * w;
            nyw = (nyw / L2) * (1 - w) + (fy / L) * w;
            nzw = (nzw / L2) * (1 - w) + 0.15 * w;
          }
        }
        const Ln = Math.hypot(nxw, nyw, nzw) || 1;
        nor[n * 3] = nxw / Ln;
        nor[n * 3 + 1] = nyw / Ln;
        nor[n * 3 + 2] = nzw / Ln;
      }
      if (tepi) {
        // titik tepi digeser sepanjang gradien medan sampai tepat di kontur 0,5
        const gx = (medan[k + 1] - medan[k - 1]) / 2;
        const gy = (medan[k + UK] - medan[k - UK]) / 2;
        const g2 = gx * gx + gy * gy;
        if (g2 > 1e-6) {
          const t = -(medan[k] - 0.5) / g2;
          let dx = t * gx;
          let dy = t * gy;
          const L = Math.hypot(dx, dy);
          if (L > 1.2) {
            dx *= 1.2 / L;
            dy *= 1.2 / L;
          }
          sx += dx;
          sy += dy;
        }
        tinggi = 0;
      }
      pos[n * 3] = (sx - UK / 2) * SKALA;
      pos[n * 3 + 1] = (UK / 2 - sy) * SKALA;
      pos[n * 3 + 2] = tinggi * SKALA;
      dalam[n] = mask[k];
    }
  // haluskan posisi XY titik di dinding samping (dekat tepi): rata-rata dengan tetangga, supaya dinding yang terlihat
  // kamera tidak mengikuti tangga piksel. Titik tepi (sudah menempel di kontur) dan tinggi tidak diubah.
  const dekat: number[] = [];
  for (let j = 1; j < ny - 1; j++)
    for (let i = 1; i < nx - 1; i++) {
      const n = j * nx + i;
      const k = (y0 + j) * UK + (x0 + i);
      if (dalam[n] && pos[n * 3 + 2] > 0 && d[k] < 4.5) dekat.push(n);
    }
  for (let u = 0; u < 4; u++) {
    const baru = new Float32Array(dekat.length * 2);
    dekat.forEach((n, q) => {
      let sx = 0;
      let sy = 0;
      let c = 0;
      for (const m of [n - 1, n + 1, n - nx, n + nx])
        if (dalam[m]) {
          sx += pos[m * 3];
          sy += pos[m * 3 + 1];
          c++;
        }
      baru[q * 2] = c ? 0.5 * pos[n * 3] + 0.5 * (sx / c) : pos[n * 3];
      baru[q * 2 + 1] = c ? 0.5 * pos[n * 3 + 1] + 0.5 * (sy / c) : pos[n * 3 + 1];
    });
    dekat.forEach((n, q) => {
      pos[n * 3] = baru[q * 2];
      pos[n * 3 + 1] = baru[q * 2 + 1];
    });
  }
  const idx: number[] = [];
  for (let j = 0; j < ny - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i;
      const b = a + 1;
      const c = a + nx;
      const e = c + 1;
      // kotak penuh: dua segitiga. Kotak dengan tiga titik di dalam: satu segitiga dari ketiga titik itu
      // (diagonal dipilih sesuai titik yang hilang), supaya tepi huruf miring tidak bertakik di tiap anak tangga.
      const isi = dalam[a] + dalam[b] + dalam[c] + dalam[e];
      if (isi === 4) idx.push(a, c, b, b, c, e);
      else if (isi === 3) {
        if (!dalam[a]) idx.push(b, c, e);
        else if (!dalam[e]) idx.push(a, c, b);
        else if (!dalam[b]) idx.push(a, c, e);
        else idx.push(a, e, b);
      }
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setIndex(idx);
  const m = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({ color: warna, roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 0.25, sheenColor: new THREE.Color(warna).lerp(new THREE.Color('#ffffff'), 0.5) }),
  );
  m.castShadow = true;
  return m;
}

/** Dua baris: "Jajan" di atas, "Dulu!" di bawah; huruf sedikit miring, naik-turun, dan bertumpuk. */
const SUSUNAN: { ch: string; x: number; y: number; putar: number; z: number }[] = [
  { ch: 'J', x: -2.55, y: 1.15, putar: -0.1, z: 0.0 },
  { ch: 'a', x: -1.38, y: 0.95, putar: 0.08, z: 0.06 },
  { ch: 'j', x: -0.3, y: 1.08, putar: -0.06, z: 0.0 },
  { ch: 'a', x: 0.8, y: 0.9, putar: 0.07, z: 0.06 },
  { ch: 'n', x: 2.0, y: 1.02, putar: -0.05, z: 0.0 },
  { ch: 'D', x: -2.0, y: -1.0, putar: 0.07, z: 0.08 },
  { ch: 'u', x: -0.68, y: -1.16, putar: -0.06, z: 0.0 },
  { ch: 'l', x: 0.35, y: -0.9, putar: 0.05, z: 0.06 },
  { ch: 'u', x: 1.4, y: -1.12, putar: -0.07, z: 0.0 },
  { ch: '!', x: 2.48, y: -0.92, putar: 0.12, z: 0.06 },
]

function buatLogo(v: Varian) {
  const g = new THREE.Group();
  SUSUNAN.forEach((s, i) => {
    const m = balonHuruf(s.ch, s.putar, v.huruf[Math.min(i, v.huruf.length - 1)]);
    m.position.set(s.x, s.y, s.z);
    g.add(m);
  });
  return g;
}

function awan(x: number, y: number, k: number) {
  const g = new THREE.Group();
  const bahan = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.55 });
  [
    [0, 0, 0.55],
    [0.55, 0.12, 0.62],
    [1.15, -0.02, 0.5],
    [-0.5, -0.08, 0.42],
    [0.3, 0.45, 0.48],
    [0.85, 0.42, 0.4],
  ].forEach(([px, py, r]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), bahan);
    b.position.set(px, py, 0);
    b.castShadow = true;
    g.add(b);
  });
  g.scale.setScalar(k);
  g.position.set(x, y, 0.2);
  return g;
}

function teksturLatar(v: Varian) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(256, 220, 30, 256, 256, 380);
  r.addColorStop(0, v.latar[0]);
  r.addColorStop(1, v.latar[1]);
  g.fillStyle = r;
  g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const Adegan: React.FC<{ v: Varian; transparan: boolean }> = ({ v, transparan }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  // tone mapping netral: warna balon tetap pekat
  gl.toneMapping = THREE.NeutralToneMapping;
  const isi = useMemo(() => {
    const g = new THREE.Group();
    // pantulan ruangan (softbox) yang memberi kilau putih memanjang di permukaan balon
    lampuStandar(scene, gl, 1);
    scene.environmentIntensity = 1.1;
    // versi transparan (file logo): tanpa latar dan tanpa bayangan jatuh, supaya bisa ditempel di warna apa pun
    if (!transparan) {
      const latar = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({ map: teksturLatar(v) }));
      latar.position.z = -1.5;
      g.add(latar);
      const penerima = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.ShadowMaterial({ opacity: 0.22 }));
      penerima.position.z = -0.35;
      penerima.receiveShadow = true;
      g.add(penerima);
    }
    scene.background = null;
    const kunci = new THREE.DirectionalLight('#FFFFFF', 1.6);
    kunci.position.set(-3, 5, 8);
    kunci.castShadow = true;
    kunci.shadow.mapSize.set(2048, 2048);
    kunci.shadow.radius = 14;
    Object.assign(kunci.shadow.camera, { left: -6, right: 6, top: 4, bottom: -4, near: 1, far: 25 });
    g.add(kunci);
    const isian = new THREE.DirectionalLight('#FFFFFF', 0.5);
    isian.position.set(5, -3, 6);
    g.add(isian, new THREE.HemisphereLight('#ffffff', '#806070', 0.4));
    g.add(buatLogo(v));
    if (v.awan) {
      g.add(awan(-4.4, -2.0, 0.85));
      g.add(awan(3.5, -2.15, 1.0));
    }
    return g;
  }, [gl, scene, v, transparan]);
  camera.position.set(0, -0.3, 11.5);
  camera.lookAt(0, 0, 0);
  (camera as THREE.PerspectiveCamera).fov = 30;
  camera.updateProjectionMatrix();
  return <primitive object={isi} />;
};

const Bintang: React.FC<{ warna: string }> = ({ warna }) => {
  const b = (x: number, y: number, s: number, o = 1) => (
    <path key={`${x}-${y}`} d={`M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`} fill={warna} opacity={o} />
  );
  return (
    <svg width="100%" height="100%" viewBox="0 0 1600 1000" style={{ position: 'absolute', inset: 0 }}>
      {b(245, 210, 34)}
      {b(1370, 190, 26, 0.85)}
      {b(1330, 820, 30)}
      {b(215, 790, 18, 0.7)}
    </svg>
  );
};

export const LogoJajan: React.FC<{ transparan?: boolean; varian?: number }> = ({ transparan = false, varian }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const v = VARIAN_LOGO[varian ?? Math.min(f, VARIAN_LOGO.length - 1)];
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font logo'));
  useEffect(() => {
    Promise.all([modak.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  const latar = transparan ? 'transparent' : v.latar[1];
  if (!siap) return <AbsoluteFill style={{ background: latar }} />;
  return (
    <AbsoluteFill style={{ background: latar }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 30, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan v={v} transparan={transparan} />
      </ThreeCanvas>
      {!transparan && v.bintang && <Bintang warna={v.bintang} />}
      {!transparan && <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: poppins.fontFamily, fontSize: 24, color: '#ffffff', opacity: 0.75, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{v.nama}</div>}
    </AbsoluteFill>
  );
};
