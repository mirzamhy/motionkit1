// Ganti "kulit" render sebuah adegan Three.js tanpa mengubah model, kamera, atau gerak:
//   'asli'   : bahan PBR seperti dibuat (flanel, logam bercat, kertas kraft)
//   'kartun' : cel-shaded (toon) dengan 3 tingkat terang dan garis tepi hitam (inverted hull)
//   'kertas' : papercraft, geometri disederhanakan jadi bidang-bidang datar, permukaan serat kertas, tanpa kilap
// Bahan MeshBasic (latar, cahaya tambahan, sprite) dibiarkan karena bukan benda yang disinari.
import * as THREE from 'three';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type Tampilan = 'asli' | 'kartun' | 'kertas';

type BahanPbr = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | THREE.MeshLambertMaterial | THREE.MeshPhongMaterial;
const pbr = (m: THREE.Material): m is BahanPbr => 'color' in m && !(m as THREE.MeshBasicMaterial).isMeshBasicMaterial;

function gradasiToon() {
  // tiga tingkat: bayangan, tengah, terang; NearestFilter supaya batasnya tegas
  const data = new Uint8Array([45, 45, 45, 255, 150, 150, 150, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

function seratKertas() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 256, 256);
  let x = 1;
  const R = () => ((x = (x * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) {
    g.strokeStyle = R() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
    g.lineWidth = 0.6 + R();
    const px = R() * 256;
    const py = R() * 256;
    const a = R() * Math.PI;
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(px + Math.cos(a) * (3 + R() * 9), py + Math.sin(a) * (3 + R() * 9));
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

/** Garis tepi: salinan mesh dengan sisi belakang hitam yang digelembungkan sepanjang normal. */
function bahanGaris(tebal: number) {
  const m = new THREE.MeshBasicMaterial({ color: '#1A1210', side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  transformed += normalize(normal) * ${tebal.toFixed(4)};`);
  };
  return m;
}

/** Warna rata-rata tekstur kanvas dikali warna bahan: dipakai untuk kertas polos pengganti flanel. */
function rataRata(map: THREE.Texture | null, warna: THREE.Color) {
  const img = map?.image as HTMLCanvasElement | undefined;
  if (!img || !(img instanceof HTMLCanvasElement)) return warna.clone();
  const d = img.getContext('2d')!.getImageData(0, 0, img.width, img.height).data;
  let r = 0, gr = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 17) {
    r += d[i];
    gr += d[i + 1];
    b += d[i + 2];
    n++;
  }
  return new THREE.Color().setRGB(r / n / 255, gr / n / 255, b / n / 255, THREE.SRGBColorSpace).multiply(warna);
}

/** Simpangan baku kecerahan tekstur kanvas: serat flanel rendah, motif bergaris tinggi. */
function keragaman(map: THREE.Texture | null) {
  const img = map?.image as HTMLCanvasElement | undefined;
  if (!img || !(img instanceof HTMLCanvasElement)) return 0;
  const d = img.getContext('2d')!.getImageData(0, 0, img.width, img.height).data;
  let s = 0, s2 = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 13) {
    const l = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
    s += l;
    s2 += l * l;
    n++;
  }
  return Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2));
}

const ukuran = (geo: THREE.BufferGeometry) => {
  if (!geo.boundingSphere) geo.computeBoundingSphere();
  return geo.boundingSphere?.radius ?? 0;
};

export async function terapkanTampilan(root: THREE.Object3D, jenis: Tampilan, opsi: { tebalGaris?: number; batasBesar?: number } = {}) {
  if (jenis === 'asli') return;
  const { tebalGaris = 0.035, batasBesar = 6 } = opsi;
  const toon = gradasiToon();
  const serat = seratKertas();
  const garis = bahanGaris(tebalGaris);
  const sederhana = new SimplifyModifier();
  const cacheGeo = new Map<THREE.BufferGeometry, Promise<THREE.BufferGeometry>>();
  const cacheBahan = new Map<THREE.Material, THREE.Material>();
  const mesh: THREE.Mesh[] = [];
  const tunggu: Promise<void>[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && !(o as THREE.Sprite).isSprite) mesh.push(m);
  });

  const ganti = (b: THREE.Material): THREE.Material => {
    if (!pbr(b)) return b;
    const ada = cacheBahan.get(b);
    if (ada) return ada;
    const umum = { color: b.color.clone(), map: b.map, alphaMap: b.alphaMap, alphaTest: b.alphaTest, transparent: b.transparent, opacity: b.opacity, side: b.side };
    let baru: THREE.Material;
    if (jenis === 'kartun') {
      baru = new THREE.MeshToonMaterial({ ...umum, gradientMap: toon, emissive: (b as THREE.MeshStandardMaterial).emissive?.clone(), emissiveMap: (b as THREE.MeshStandardMaterial).emissiveMap, emissiveIntensity: (b as THREE.MeshStandardMaterial).emissiveIntensity ?? 1 });
    } else {
      // kertas berwarna polos: tekstur flanel dibuang, kecuali bahan putih/terang yang biasanya label bertulisan
      const terang = b.color.r + b.color.g + b.color.b > 2.6;
      const flanel = ((b as THREE.MeshPhysicalMaterial).sheen ?? 0) > 0;
      // tekstur bermotif (garis kue lapis) dipertahankan; tekstur serat flanel yang rata diganti warna kertas polos
      const bermotif = flanel && keragaman(b.map) > 0.08;
      const warna = flanel && !bermotif ? rataRata(b.map, b.color) : b.color.clone();
      baru = new THREE.MeshStandardMaterial({ ...umum, color: warna, map: (terang && !flanel) || bermotif ? b.map : null, roughness: 1, metalness: 0, flatShading: true, bumpMap: serat, bumpScale: 1.6, emissive: (b as THREE.MeshStandardMaterial).emissive?.clone(), emissiveMap: (b as THREE.MeshStandardMaterial).emissiveMap, emissiveIntensity: (b as THREE.MeshStandardMaterial).emissiveIntensity ?? 1 });
    }
    cacheBahan.set(b, baru);
    return baru;
  };

  for (const m of mesh) {
    const besar = ukuran(m.geometry) * Math.max(...m.getWorldScale(new THREE.Vector3()).toArray());
    // garis tepi hanya untuk benda padat bersisi satu (bukan bidang cahaya, latar, atau kain dua sisi)
    // InstancedMesh (taburan wijen/kelapa) tidak bisa diberi garis dengan salinan biasa: salinannya jadi satu bola di titik asal
    const padat = !(m as THREE.InstancedMesh).isInstancedMesh && !Array.isArray(m.material) && pbr(m.material) && m.material.side !== THREE.DoubleSide && !m.material.transparent;
    m.material = Array.isArray(m.material) ? m.material.map(ganti) : ganti(m.material);

    if (jenis === 'kertas' && besar < batasBesar) {
      // bentuk lengkung jadi bidang-bidang datar seperti kertas dilipat
      const asal = m.geometry;
      let janji = cacheGeo.get(asal);
      if (!janji) {
        const n = asal.attributes.position.count;
        const datar = ['PlaneGeometry', 'CircleGeometry', 'RingGeometry'].includes(asal.type);
        // bahan bergambar (anyaman berlubang, taplak, label) butuh UV utuh: jangan disederhanakan
        const bergambar = !Array.isArray(m.material) && !!((m.material as THREE.MeshStandardMaterial).map || (m.material as THREE.MeshStandardMaterial).alphaMap || (m.material as THREE.MeshStandardMaterial).emissiveMap);
        janji =
          datar || bergambar || n <= 120
            ? Promise.resolve(asal)
            : (async () => {
                try {
                  const gabung = mergeVertices(asal.clone().deleteAttribute('normal').deleteAttribute('uv') as THREE.BufferGeometry, 1e-4);
                  const sisa = Math.max(20, Math.round(gabung.attributes.position.count * 0.05));
                  const hasil = await sederhana.modify(gabung, gabung.attributes.position.count - sisa);
                  hasil.computeVertexNormals();
                  return hasil;
                } catch {
                  return asal;
                }
              })();
        cacheGeo.set(asal, janji);
      }
      tunggu.push(janji.then((geo) => void (m.geometry = geo)));
    }

    if (jenis === 'kartun') {
      const datar = ['PlaneGeometry', 'CircleGeometry', 'RingGeometry'].includes(m.geometry.type);
      const bening = !Array.isArray(m.material) && (m.material as THREE.Material).opacity < 0.99;
      if (padat && !datar && !bening && besar < batasBesar && m.geometry.attributes.normal) {
        const g = new THREE.Mesh(m.geometry, garis);
        g.raycast = () => {};
        m.add(g);
      }
    }
  }
  await Promise.all(tunggu);
}
