// Model bag charm versi flanel (lembar desain v2), bentuk dan detail dari foto produk pilihan.
// Badan flanel halus sedikit grumbel, jahitan feston benang pilin, sulaman/aplikasi (kelapa, wijen, kismis,
// aksen pandan), dan tab webbing yang melingkari ring pegas.
// 1 unit = ±6 cm. Badan menghadap +Z, pusat badan di titik asal, ring di atas.
// `peta: true`: warna badan dipudarkan dan tiap jenis jahitan diberi warna penanda, untuk lembar desain.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { acak, buatRing, R_RING, TABUNG, type MatWarna } from './charm'
import { teksturFlanel, tinggiFlanel } from './tekstur'

export type CharmRajutId = 'klepon' | 'onde-onde' | 'kue-lapis' | 'kue-lumpur' | 'serabi'
type Peran = 'badan' | 'hias' | 'sisi' | 'aplikasi' | 'tab' | 'ring'
type Ctx = { daftar: MatWarna[]; peta: boolean }
type P2 = (u: number, v: number) => THREE.Vector3

export const PENANDA = { sisi: '#E0362A', aplikasi: '#1F78D8', hias: '#8C3FB8', tab: '#EE9A00', info: '#7A6E64' }

export const PALET: Record<CharmRajutId, Record<string, string>> = {
  klepon: { badan: '#7CB848', kelapa: '#F5F1E6', jahitSisi: '#D6E25A', tab: '#4C8A34', ring: '#4F8C37' },
  'onde-onde': { badan: '#D08A22', wijen: '#F7EBD2', tab: '#D6A12C', ring: '#E1A92F' },
  'kue-lapis': { merah: '#EE4E94', krem: '#F7E7D9', hijau: '#7DC047', tab: '#EC5A9C', ring: '#EE5FA0' },
  'kue-lumpur': { cokelat: '#97461F', kuning: '#F0B226', kismis: '#4A1E13', benang: '#B8673A', tab: '#7E3F20', ring: '#C4652F' },
  serabi: { cup: '#C86A2C', putih: '#FAF8F2', feston: '#E9A3AE', pandan: '#2F8C3B', tab: '#3F8A3C', ring: '#4E8C3C' },
}

const PUDAR = new THREE.Color('#EEE8DF')
const HITAM = new THREE.Color('#120C0A')
const X = new THREE.Vector3(1, 0, 0)

function warna(ctx: Ctx, w: string, peran: Peran) {
  if (!ctx.peta) return w
  if (peran === 'badan' || peran === 'ring') return '#' + new THREE.Color(w).lerp(PUDAR, peran === 'ring' ? 0.55 : 0.68).getHexString()
  return PENANDA[peran]
}

// ---------- tekstur ----------

function kanvas(w: number, h: number, isi: (x: number, y: number) => number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const img = g.createImageData(w, h)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = Math.round(THREE.MathUtils.clamp(isi(x, y), 0, 1) * 255)
      const i = (y * w + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
  g.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

let _pilin: THREE.Texture | undefined
/** Benang terpilin: garis serat miring yang berulang sepanjang benang (u) dan sekali keliling (v). */
function teksturPilin() {
  return (_pilin ??= kanvas(64, 64, (x, y) => {
    const t = (x / 64 * 3 + y / 64) % 1
    return 0.66 + 0.34 * Math.pow(Math.sin(t * Math.PI), 0.7) - 0.05 * (((x * 7 + y * 13) % 5) / 4)
  }))
}

let _webbing: THREE.Texture | undefined
/** Pita webbing anyaman rib: rusuk melintang lebar pita, benang lungsin halus, tepi (selvedge) lebih terang. */
function teksturWebbing() {
  return (_webbing ??= kanvas(128, 128, (x, y) => {
    const rusuk = 0.32 + 0.68 * Math.pow(Math.sin(((x % 8) + 0.5) / 8 * Math.PI), 0.8)
    const lungsin = (Math.floor(y / 4) + Math.floor(x / 8)) % 2 ? 0.85 : 1
    const tepi = y < 7 || y > 120 ? 1.12 : 1
    return rusuk * lungsin * tepi
  }))
}

let _jahit: THREE.Texture | undefined
/** Benang sulam/jahit dua lilit: alur gelap di antara lilitan, serat halus di permukaannya. */
function teksturJahit() {
  return (_jahit ??= kanvas(64, 64, (x, y) => {
    const t = (x / 64 + (y / 64) * 2) % 1
    const lilit = Math.pow(Math.sin(t * Math.PI), 0.45)
    const serat = 0.08 * Math.sin(x * 2.3 + y * 0.7) * Math.sin(y * 1.9 - x * 0.4)
    return 0.42 + 0.58 * lilit + serat
  }))
}

// ---------- bahan ----------

/** Benang sulam bergulung (kismis): lilitan rapat, doff. */
function bahanBenang(ctx: Ctx, w: string, peran: Peran) {
  const tampak = new THREE.Color(warna(ctx, w, peran))
  const m = new THREE.MeshPhysicalMaterial({
    color: tampak,
    map: teksturPilin(),
    bumpMap: teksturPilin(),
    bumpScale: 1.2,
    roughness: 0.92,
    sheen: 0.7,
    sheenRoughness: 0.75,
    sheenColor: tampak.clone().lerp(new THREE.Color('#ffffff'), 0.35),
  })
  ctx.daftar.push({ m, warna: m.color.clone(), gelap: HITAM, sheen: m.sheen })
  return m
}

/**
 * Flanel jadi: serat sangat halus (±0,5 mm), dari jarak pandang foto produk permukaannya tampak rata dan doff,
 * hanya ada kilau lembut. `ulang` = berapa kali tekstur serat diulang di arah u dan v permukaan.
 */
function bahanFlanel(ctx: Ctx, w: string, ulang: [number, number], warnaTitik = false) {
  const peta = teksturFlanel().clone()
  const tinggi = tinggiFlanel().clone()
  for (const t of [peta, tinggi]) {
    t.repeat.set(ulang[0] * 2, ulang[1] * 2)
    t.needsUpdate = true
  }
  const tampak = new THREE.Color(warna(ctx, w, 'badan'))
  const m = new THREE.MeshPhysicalMaterial({
    color: warnaTitik ? new THREE.Color('#ffffff') : tampak,
    vertexColors: warnaTitik,
    map: peta,
    bumpMap: tinggi,
    bumpScale: 0.06,
    roughness: 1,
    sheen: 0.45,
    sheenRoughness: 0.9,
    sheenColor: tampak.clone().lerp(new THREE.Color('#ffffff'), 0.25),
    side: THREE.DoubleSide,
  })
  ctx.daftar.push({ m, warna: m.color.clone(), gelap: HITAM, sheen: m.sheen })
  return m
}

// ---------- permukaan ----------

const arahDari = (u: number, v: number) => {
  const th = v * Math.PI
  const ph = u * Math.PI * 2
  return new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th))
}

/** Jari-jari superelipsoid ke arah d. e = kotak di bidang XY (2 = bulat), f = profil arah Z. */
function superElips(a: number, b: number, c: number, e = 2, f = 2, goyang = 0, seed = 1) {
  const r = acak(seed)
  const fase = [r() * 6, r() * 6, r() * 6]
  return (d: THREE.Vector3) => {
    const xy = Math.pow(Math.pow(Math.abs(d.x / a), e) + Math.pow(Math.abs(d.y / b), e), f / e)
    const R = Math.pow(xy + Math.pow(Math.abs(d.z / c), f), -1 / f)
    return R * (1 + goyang * (Math.sin(d.x * 3 + fase[0]) * Math.cos(d.y * 4 + fase[1]) + 0.6 * Math.sin(d.z * 5 + d.y * 2 + fase[2])))
  }
}

/** Badan berbentuk bintang dari pusat: u = putaran di sekitar Z, v = 0 depan … 1 belakang. */
const bintang = (R: (d: THREE.Vector3) => number, pusat = new THREE.Vector3()): P2 => (u, v) => {
  const d = arahDari(u, v)
  return d.multiplyScalar(R(d)).add(pusat)
}

function permukaanGeo(P: P2, nu: number, nv: number, v0 = 0, v1 = 1, warnaTitik?: (p: THREE.Vector3) => THREE.Color, tutupU = true) {
  const pos: number[] = []
  const uv: number[] = []
  const col: number[] = []
  const idx: number[] = []
  for (let j = 0; j <= nv; j++)
    for (let i = 0; i <= nu; i++) {
      const p = P(i / nu, v0 + ((v1 - v0) * j) / nv)
      pos.push(p.x, p.y, p.z)
      uv.push(i / nu, j / nv)
      if (warnaTitik) {
        const c = warnaTitik(p)
        col.push(c.r, c.g, c.b)
      }
    }
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i
      idx.push(a, a + nu + 1, a + 1, a + 1, a + nu + 1, a + nu + 2)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  if (warnaTitik) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  if (tutupU) {
    // samakan normal di sambungan u = 0 / u = 1 supaya tidak ada garis terang
    const n = geo.getAttribute('normal')
    const v = new THREE.Vector3()
    for (let j = 0; j <= nv; j++) {
      const a = j * (nu + 1)
      const b = a + nu
      v.set(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize()
      n.setXYZ(a, v.x, v.y, v.z)
      n.setXYZ(b, v.x, v.y, v.z)
    }
  }
  return geo
}

// ---------- jahitan & sulaman ----------

let _manik: THREE.BufferGeometry | undefined
const geoManik = () => (_manik ??= new THREE.CapsuleGeometry(0.5, 1, 4, 10))

/** Butir sulaman (wijen, kelapa) di permukaan badan bintang, disebar dengan titik Fibonacci. */
function taburan(
  _ctx: Ctx,
  o: {
    R: (d: THREE.Vector3) => number
    normal: (p: THREE.Vector3) => THREE.Vector3
    calon: number
    saring: (d: THREE.Vector3, r: () => number) => boolean
    geo: THREE.BufferGeometry
    bahan: THREE.Material
    ukuran: THREE.Vector3
    seed: number
    angkat: number
    arah?: (p: THREE.Vector3, n: THREE.Vector3, r: () => number) => THREE.Vector3
  },
) {
  const r = acak(o.seed)
  const emas = Math.PI * (3 - Math.sqrt(5))
  const mats: THREE.Matrix4[] = []
  for (let k = 0; k < o.calon; k++) {
    const y = 1 - ((k + 0.5) / o.calon) * 2
    const rad = Math.sqrt(1 - y * y)
    const a = k * emas + (r() - 0.5) * 0.6
    const d = new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad).normalize()
    if (!o.saring(d, r)) continue
    const p = d.clone().multiplyScalar(o.R(d))
    const N = o.normal(p)
    let T = o.arah ? o.arah(p, N, r) : new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5)
    T = T.addScaledVector(N, -T.dot(N)).normalize()
    const B = new THREE.Vector3().crossVectors(T, N)
    const s = 0.8 + r() * 0.35
    const m = new THREE.Matrix4().makeBasis(B.multiplyScalar(o.ukuran.x * s), T.multiplyScalar(o.ukuran.y * s), N.clone().multiplyScalar(o.ukuran.z * s))
    m.setPosition(p.addScaledVector(N, o.angkat))
    mats.push(m)
  }
  const mesh = new THREE.InstancedMesh(o.geo, o.bahan, mats.length)
  mats.forEach((m, i) => mesh.setMatrixAt(i, m))
  mesh.instanceMatrix.needsUpdate = true
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}

/** Benang sulam satin/rantai: satu tabung yang menempel di permukaan. */
function benangSulam(titik: THREE.Vector3[], jari: number, bahan: THREE.Material) {
  const kurva = new THREE.CatmullRomCurve3(titik)
  const L = kurva.getLength()
  const geo = new THREE.TubeGeometry(kurva, Math.max(8, Math.ceil(L / (jari * 1.2))), jari, 8, false)
  // satu ulangan tekstur = dua lilitan; jarak lilitan ±2,5 × tebal benang
  const uv = geo.getAttribute('uv')
  const ulang = L / (jari * 10)
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * ulang)
  const m = new THREE.Mesh(geo, bahan)
  m.castShadow = true
  return m
}

/** Bahan benang jahit/sulam (bukan tusuk rajut): lilitan jelas, sedikit berkilau seperti benang katun mercerisasi. */
function bahanJahit(ctx: Ctx, w: string, peran: Peran) {
  const tampak = new THREE.Color(warna(ctx, w, peran))
  const m = new THREE.MeshPhysicalMaterial({
    color: tampak,
    map: teksturJahit(),
    bumpMap: teksturJahit(),
    bumpScale: 2.2,
    roughness: 0.62,
    sheen: 0.6,
    sheenRoughness: 0.5,
    sheenColor: tampak.clone().lerp(new THREE.Color('#ffffff'), 0.4),
  })
  ctx.daftar.push({ m, warna: m.color.clone(), gelap: HITAM, sheen: m.sheen })
  return m
}

/** Sampel titik merata menurut luas segitiga (bukan per vertex, supaya kutub tidak menumpuk). */
function sampelPermukaan(geo: THREE.BufferGeometry, jumlah: number, seed: number) {
  const pos = geo.getAttribute('position')
  const idx = geo.getIndex()!
  const r = acak(seed)
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const kum: number[] = []
  let total = 0
  for (let i = 0; i < idx.count; i += 3) {
    a.fromBufferAttribute(pos, idx.getX(i))
    b.fromBufferAttribute(pos, idx.getX(i + 1))
    c.fromBufferAttribute(pos, idx.getX(i + 2))
    total += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2
    kum.push(total)
  }
  const hasil: { p: THREE.Vector3; n: THREE.Vector3 }[] = []
  for (let k = 0; k < jumlah; k++) {
    const s = r() * total
    let lo = 0
    let hi = kum.length - 1
    while (lo < hi) {
      const m = (lo + hi) >> 1
      if (kum[m] < s) lo = m + 1
      else hi = m
    }
    a.fromBufferAttribute(pos, idx.getX(lo * 3))
    b.fromBufferAttribute(pos, idx.getX(lo * 3 + 1))
    c.fromBufferAttribute(pos, idx.getX(lo * 3 + 2))
    let u = r()
    let v = r()
    if (u + v > 1) {
      u = 1 - u
      v = 1 - v
    }
    const p = a.clone().addScaledVector(b.clone().sub(a), u).addScaledVector(c.clone().sub(a), v)
    const n = b.clone().sub(a).cross(c.clone().sub(a)).normalize()
    hasil.push({ p, n })
  }
  return hasil
}

/**
 * Permukaan flanel yang sedikit "grumbel": butir serat menggumpal (pilling) yang sangat kecil dan serat pendek
 * yang mencuat. Ukurannya di bawah 0,5 mm, jadi dari jauh kain tetap tampak rata.
 */
function grumbelFlanel(ctx: Ctx, mesh: THREE.Mesh, w: string | ((p: THREE.Vector3) => string), luas: number, seed: number, luar: ((p: THREE.Vector3) => THREE.Vector3) | 'dua') {
  const g = new THREE.Group()
  const warnaDi = (p: THREE.Vector3) => warna(ctx, typeof w === 'function' ? w(p) : w, 'badan')
  const tampak = warnaDi(new THREE.Vector3())
  const r = acak(seed + 7)
  const pasang = (geo: THREE.BufferGeometry, jumlah: number, ukuran: () => THREE.Vector3, angkat: number, terang: [number, number]) => {
    const titik = sampelPermukaan(mesh.geometry, jumlah, seed)
    const bahan = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 1, sheen: 0.5, sheenColor: new THREE.Color(tampak).lerp(new THREE.Color('#ffffff'), 0.3) })
    ctx.daftar.push({ m: bahan, warna: bahan.color.clone(), gelap: HITAM, sheen: 0.5 })
    const im = new THREE.InstancedMesh(geo, bahan, titik.length)
    const q = new THREE.Quaternion()
    const putar = new THREE.Quaternion()
    const Z = new THREE.Vector3(0, 0, 1)
    titik.forEach(({ p, n }, i) => {
      // 'dua': lembaran tipis yang terlihat dari dua sisi, sampel dibagi rata ke kedua sisi
      if (luar === 'dua' ? i % 2 === 1 : n.dot(luar(p)) < 0) n.negate()
      q.setFromUnitVectors(Z, n)
      putar.setFromAxisAngle(Z, r() * Math.PI * 2)
      q.multiply(putar)
      im.setMatrixAt(i, new THREE.Matrix4().compose(p.clone().addScaledVector(n, angkat), q, ukuran()))
      im.setColorAt(i, new THREE.Color(warnaDi(p)).multiplyScalar(terang[0] + r() * (terang[1] - terang[0])))
    })
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    g.add(im)
  }
  // butir gumpalan serat: bulat pipih 0,15–0,3 mm
  pasang(new THREE.SphereGeometry(1, 7, 5), Math.round(luas * 6500), () => {
    const k = 0.0018 + r() * 0.0016
    return new THREE.Vector3(k, k * (0.7 + r() * 0.5), k * 0.32)
  }, -0.0002, [0.95, 1.06])
  // serat pendek melengkung yang mencuat
  const serat = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 0.1, 0.35), new THREE.Vector3(0.75, -0.05, 0.55), new THREE.Vector3(1, 0.1, 0.5)]),
    5,
    0.035,
    3,
    false,
  )
  pasang(serat, Math.round(luas * 4200), () => {
    const k = 0.006 + r() * 0.006
    return new THREE.Vector3(k, k, k)
  }, 0, [0.95, 1.2])
  return g
}

// ---------- tab webbing + ring ----------

/**
 * Pita webbing dilipat dua melingkari tabung bawah ring; kedua ujung masuk ke sambungan atas badan.
 * `atasY` = titik tertinggi badan, `z0` = posisi sambungan atas di sumbu Z.
 */
function tabDanRing(ctx: Ctx, wTab: string, wRing: string, atasY: number, z0 = 0) {
  const g = new THREE.Group()
  const lebar = 0.16
  const tebal = 0.018
  const cy = atasY + 0.22
  const rr = TABUNG + tebal * 0.5 + 0.004
  const titik: THREE.Vector3[] = []
  const kaki = (s: number) => [
    new THREE.Vector3(0, atasY - 0.12, z0 + s * 0.024),
    new THREE.Vector3(0, atasY + 0.0, z0 + s * 0.025),
    new THREE.Vector3(0, atasY + 0.11, z0 + s * 0.036),
  ]
  titik.push(...kaki(1))
  for (let k = 0; k <= 12; k++) {
    const a = (k / 12) * Math.PI
    titik.push(new THREE.Vector3(0, cy + rr * Math.sin(a), z0 + rr * Math.cos(a)))
  }
  titik.push(...kaki(-1).reverse())
  const kurva = new THREE.CatmullRomCurve3(titik, false, 'centripetal')

  // pita bertebal: empat sisi (luar, tepi, dalam, tepi), vertex dobel supaya sudutnya tajam
  const n = 140
  const Ltot = kurva.getLength()
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const sisi: [number, number][] = [[-1, 1], [1, 1], [1, 1], [1, -1], [1, -1], [-1, -1], [-1, -1], [-1, 1]]
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = kurva.getPointAt(t)
    const T = kurva.getTangentAt(t)
    const N = new THREE.Vector3().crossVectors(X, T).normalize()
    sisi.forEach(([sx, sn], j) => {
      const q = p.clone().addScaledVector(X, (sx * lebar) / 2).addScaledVector(N, (sn * tebal) / 2)
      pos.push(q.x, q.y, q.z)
      uv.push((t * Ltot) / 0.1, j < 2 || (j >= 4 && j < 6) ? (sx + 1) / 2 : 0.5)
    })
  }
  for (let i = 0; i < n; i++)
    for (let f = 0; f < 4; f++) {
      const a = i * 8 + f * 2
      const b = a + 8
      idx.push(a, b, a + 1, a + 1, b, b + 1)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  const web = teksturWebbing()
  const bahanTab = new THREE.MeshPhysicalMaterial({
    color: warna(ctx, wTab, 'tab'),
    map: web,
    bumpMap: web,
    bumpScale: 1.5,
    roughness: 0.75,
    sheen: 0.4,
    sheenColor: new THREE.Color(wTab).lerp(new THREE.Color('#ffffff'), 0.3),
    side: THREE.DoubleSide,
  })
  ctx.daftar.push({ m: bahanTab, warna: bahanTab.color.clone(), gelap: HITAM, sheen: 0.4 })
  const tab = new THREE.Mesh(geo, bahanTab)
  tab.castShadow = tab.receiveShadow = true
  g.add(tab)

  // jahitan palang: dua baris tusuk balik di atas badan, depan dan belakang
  const benangTab = bahanJahit(ctx, '#' + new THREE.Color(wTab).multiplyScalar(0.7).getHexString(), 'tab')
  for (const s of [1, -1])
    for (const y of [atasY + 0.03, atasY + 0.055]) {
      const z = z0 + s * (0.025 + tebal / 2 + 0.002)
      const titikJahit = Array.from({ length: 9 }, (_, k) => new THREE.Vector3(-0.066 + (k * 0.132) / 8, y + (k % 2) * 0.002, z + s * 0.0015))
      g.add(benangSulam(titikJahit, 0.0042, benangTab))
    }

  const ring = buatRing(ctx.daftar, warna(ctx, wRing, 'ring'))
  ring.position.set(0, cy + R_RING, z0)
  g.add(ring)
  return g
}

// ---------- varian ----------

const ELIPS_NORMAL = (a: number, b: number, c: number) => (p: THREE.Vector3) => new THREE.Vector3(p.x / (a * a), p.y / (b * b), p.z / (c * c)).normalize()

/**
 * Jahitan feston pada sambungan dua potong flanel: tiap tusuk melompati sambungan dengan sedikit miring,
 * lalu benang penghubung berjalan di satu sisi (ciri tusuk feston/blanket stitch).
 */
function jahitFlanel(
  ctx: Ctx,
  o: {
    C: (s: number) => THREE.Vector3
    normal: (s: number, p: THREE.Vector3) => THREE.Vector3
    jumlah: number
    lebar: number
    benang: (p: THREE.Vector3) => string
    peran?: Peran
    jari?: number
  },
) {
  const g = new THREE.Group()
  const { jumlah, lebar, peran = 'sisi', jari = 0.0046 } = o
  const bahan = new Map<string, THREE.Material>()
  const ambil = (w: string) => {
    let m = bahan.get(w)
    if (!m) bahan.set(w, (m = bahanJahit(ctx, w, peran)))
    return m
  }
  const pinggir: THREE.Vector3[] = []
  let warnaPinggir = ''
  for (let i = 0; i < jumlah; i++) {
    const s = i / jumlah
    const p = o.C(s)
    const T = o.C((s + 0.002) % 1).sub(o.C((s + 0.998) % 1)).normalize()
    const N = o.normal(s, p)
    N.addScaledVector(T, -N.dot(T)).normalize()
    const B = new THREE.Vector3().crossVectors(T, N)
    const tusuk = [
      p.clone().addScaledVector(B, lebar).addScaledVector(T, lebar * 0.25).addScaledVector(N, jari * 0.6),
      p.clone().addScaledVector(N, jari * 1.6),
      p.clone().addScaledVector(B, -lebar).addScaledVector(N, jari * 0.6),
    ]
    const w = o.benang(p)
    warnaPinggir ||= w
    g.add(benangSulam(tusuk, jari, ambil(w)))
    pinggir.push(tusuk[2].clone())
  }
  pinggir.push(pinggir[0].clone())
  g.add(benangSulam(pinggir, jari * 0.85, ambil(warnaPinggir)))
  return g
}

/** Badan flanel dari dua lingkaran (depan dan belakang) yang dijahit keliling lalu diisi dakron. */
function bolaFlanel(ctx: Ctx, R: (d: THREE.Vector3) => number, abc: [number, number, number], wBadan: string, seed: number) {
  const g = new THREE.Group()
  const P = bintang(R)
  const badan = new THREE.Mesh(permukaanGeo(P, 160, 100), bahanFlanel(ctx, wBadan, [14, 6]))
  badan.castShadow = badan.receiveShadow = true
  g.add(badan)
  const [a, b, c] = abc
  g.add(grumbelFlanel(ctx, badan, wBadan, 4 * Math.PI * Math.pow((a * b + a * c + b * c) / 3, 1), seed, (p) => p))
  const C = (s: number) => P(s, 0.5)
  const normal = (_: number, p: THREE.Vector3) => ELIPS_NORMAL(a, b, c)(p)
  return { g, P, C, normal }
}


function klepon(ctx: Ctx) {
  const W = PALET.klepon
  const abc: [number, number, number] = [0.5, 0.505, 0.37]
  const R = superElips(...abc, 2, 2, 0.012, 4)
  const { g, C, normal } = bolaFlanel(ctx, R, abc, W.badan, 21)
  g.add(jahitFlanel(ctx, { C, normal, jumlah: 96, lebar: 0.016, benang: () => W.jahitSisi }))
  // kelapa parut: potongan benang putih tebal yang ujungnya menggembung, di sepertiga atas depan dan belakang
  const geoKelapa = new RoundedBoxGeometry(1, 1, 1, 3, 0.3)
  const pk = geoKelapa.getAttribute('position')
  for (let i = 0; i < pk.count; i++) {
    const x = pk.getX(i)
    const k = 1 + 0.55 * Math.pow(Math.abs(x) * 2, 6)
    pk.setXYZ(i, x, pk.getY(i) * k + 0.05 * Math.sin(x * 9), pk.getZ(i) * k)
  }
  geoKelapa.computeVertexNormals()
  // RoundedBox memanjang di X; taburan memakai sumbu Y sebagai arah panjang
  geoKelapa.rotateZ(Math.PI / 2)
  g.add(
    taburan(ctx, {
      R,
      normal: ELIPS_NORMAL(...abc),
      calon: 190,
      saring: (d, r) => d.y > 0.3 - 0.14 * r() && Math.abs(d.z) > 0.16 && r() < 0.8,
      geo: geoKelapa,
      bahan: bahanFlanel(ctx, W.kelapa, [1, 1]),
      ukuran: new THREE.Vector3(0.042, 0.112, 0.036),
      seed: 8,
      angkat: 0.022,
      // kelapa cenderung menjuntai ke bawah dari puncak
      arah: (_p, n, r) => new THREE.Vector3(0, -1, 0).applyAxisAngle(n, (r() - 0.5) * 2.2),
    }),
  )
  g.add(tabDanRing(ctx, W.tab, W.ring, 0.505))
  return g
}

function ondeOnde(ctx: Ctx) {
  const W = PALET['onde-onde']
  const abc: [number, number, number] = [0.5, 0.49, 0.44]
  const R = superElips(...abc, 2, 2, 0.01, 9)
  const { g, C, normal } = bolaFlanel(ctx, R, abc, W.badan, 31)
  const gelap = '#' + new THREE.Color(W.badan).multiplyScalar(0.86).getHexString()
  g.add(jahitFlanel(ctx, { C, normal, jumlah: 96, lebar: 0.016, benang: () => gelap }))
  // wijen: sulam satin krem, lonjong, tersebar rata di kedua belahan tapi tidak di atas jahitan sisi
  g.add(
    taburan(ctx, {
      R,
      normal: ELIPS_NORMAL(...abc),
      calon: 230,
      saring: (d) => Math.abs(d.z) > 0.09,
      geo: new THREE.SphereGeometry(1, 16, 10),
      bahan: bahanJahit(ctx, W.wijen, 'hias'),
      ukuran: new THREE.Vector3(0.019, 0.036, 0.015),
      seed: 12,
      angkat: 0.02,
    }),
  )
  g.add(tabDanRing(ctx, W.tab, W.ring, 0.49))
  return g
}

const LAPIS = { a: 0.47, b: 0.5, c: 0.27, e: 5, f: 2.6 }

function lapisWarna(y: number) {
  const W = PALET['kue-lapis']
  const i = THREE.MathUtils.clamp(Math.floor(((y + LAPIS.b) / (2 * LAPIS.b)) * 5), 0, 4)
  return [W.merah, W.krem, W.hijau, W.krem, W.merah][i]
}

/** Panel depan (s = 1) atau belakang (s = -1) kue lapis sebagai medan tinggi di atas garis luar superelips. */
const panelLapis = (s: number): P2 => (u, v) => {
  const { a, b, c, e, f } = LAPIS
  const y = b * Math.sin((2 * v - 1) * (Math.PI / 2)) * 0.9995
  const xm = a * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(y / b), e)), 1 / e)
  const x = xm * Math.sin((2 * u - 1) * (Math.PI / 2))
  const gg = Math.pow(Math.pow(Math.abs(x / a), e) + Math.pow(Math.abs(y / b), e), f / e)
  return new THREE.Vector3(x, y, s * c * Math.pow(Math.max(0, 1 - gg), 1 / f))
}

const garisLapis = (s: number) => {
  const { a, b, e } = LAPIS
  const ps = s * Math.PI * 2
  const co = Math.cos(ps)
  const si = Math.sin(ps)
  const rho = Math.pow(Math.pow(Math.abs(co / a), e) + Math.pow(Math.abs(si / b), e), -1 / e)
  return new THREE.Vector3(rho * co, rho * si, 0)
}

function lapis(ctx: Ctx) {
  const W = PALET['kue-lapis']
  const g = new THREE.Group()
  const warnaPita = (p: THREE.Vector3) => new THREE.Color(warna(ctx, lapisWarna(p.y), 'badan'))
  const bahanPanel = bahanFlanel(ctx, W.krem, [6, 6], true)
  for (const s of [1, -1]) {
    // tiap panel: lima pita flanel yang disambung mendatar
    const P = panelLapis(s)
    const panel = new THREE.Mesh(permukaanGeo(P, 120, 160, 0, 1, warnaPita, false), bahanPanel)
    panel.castShadow = panel.receiveShadow = true
    g.add(panel)
    g.add(grumbelFlanel(ctx, panel, (p) => lapisWarna(p.y), 0.95, s > 0 ? 41 : 42, (p) => new THREE.Vector3(p.x, p.y, p.z + s * 0.05)))
  }
  // garis pergantian warna: tusuk jelujur tipis di depan dan belakang
  const benangJelujur = [bahanJahit(ctx, '#FFF4EC', 'aplikasi'), bahanJahit(ctx, '#B9DD5E', 'aplikasi')]
  ;[-0.6, -0.2, 0.2, 0.6].forEach((t, i) => {
    const yb = LAPIS.b * t
    const bahan = benangJelujur[i === 0 || i === 3 ? 0 : 1]
    for (const s of [1, -1]) {
      const P = panelLapis(s)
      const v = (Math.asin(THREE.MathUtils.clamp(yb / (LAPIS.b * 0.9995), -1, 1)) / (Math.PI / 2) + 1) / 2
      for (let k = 0; k < 26; k++) {
        const u0 = 0.04 + (k / 26) * 0.92
        const u1 = u0 + 0.018
        const titik = [u0, (u0 + u1) / 2, u1].map((u) => {
          const p = P(u, v)
          return p.add(new THREE.Vector3(0, 0, s * 0.004))
        })
        g.add(benangSulam(titik, 0.0045, bahan))
      }
    }
  })
  const normal = (_: number, p: THREE.Vector3) => {
    const { a, b, e } = LAPIS
    return new THREE.Vector3((Math.sign(p.x) * Math.pow(Math.abs(p.x / a), e - 1)) / a, (Math.sign(p.y) * Math.pow(Math.abs(p.y / b), e - 1)) / b, 0).normalize()
  }
  g.add(
    jahitFlanel(ctx, {
      C: garisLapis,
      normal,
      jumlah: 110,
      lebar: 0.016,
      benang: (p) => '#' + new THREE.Color(lapisWarna(p.y)).multiplyScalar(0.82).getHexString(),
    }),
  )
  g.add(tabDanRing(ctx, W.tab, W.ring, 0.5))
  return g
}

// Kue lumpur versi flanel (bukan rajut): lingkaran depan dan belakang + pita dinding samping, isi kuning ditempel.
const LUMPUR = { a: 0.5, c: 0.17, f: 4, ay: 0.43, cy: 0.12, fy: 2, zy: 0.13 }
const tinggiKuning = (x: number, y: number) => {
  const rho = Math.hypot(x, y)
  return LUMPUR.zy + LUMPUR.cy * Math.pow(Math.max(0, 1 - Math.pow(rho / LUMPUR.ay, LUMPUR.fy)), 1 / LUMPUR.fy)
}
/** v (sudut dari depan, 0…1) tempat muka flanel bertemu pita dinding: arah sudut kotak superelips. */
const V_TEPI_LUMPUR = Math.atan2(LUMPUR.a, LUMPUR.c) / Math.PI
const PC_LUMPUR = bintang(superElips(LUMPUR.a, LUMPUR.a, LUMPUR.c, 2, LUMPUR.f))

function lumpur(ctx: Ctx) {
  const W = PALET['kue-lumpur']
  const g = new THREE.Group()
  const Pc = PC_LUMPUR
  // badan flanel cokelat: dua lingkaran Ø6 cm dan pita dinding 2,4 cm, diisi dakron
  const badan = new THREE.Mesh(permukaanGeo(Pc, 160, 100), bahanFlanel(ctx, W.cokelat, [14, 6]))
  badan.castShadow = badan.receiveShadow = true
  g.add(badan)
  g.add(grumbelFlanel(ctx, badan, W.cokelat, 2.5, 53, (p) => p))
  // isi kuning: lingkaran flanel Ø5,2 cm yang menggembung
  const pusatK = new THREE.Vector3(0, 0, LUMPUR.zy)
  const Pk = bintang(superElips(LUMPUR.ay, LUMPUR.ay, LUMPUR.cy, 2, LUMPUR.fy), pusatK)
  const kuning = new THREE.Mesh(permukaanGeo(Pk, 120, 48, 0, 0.5), bahanFlanel(ctx, W.kuning, [12, 3]))
  kuning.castShadow = kuning.receiveShadow = true
  g.add(kuning)
  g.add(grumbelFlanel(ctx, kuning, W.kuning, 0.65, 54, (p) => p.clone().sub(pusatK)))
  // tusuk feston di tepi kuning: tiap tusuk masuk 3 mm di kuning lalu keluar di muka cokelat
  const bahanFeston = bahanJahit(ctx, W.benang, 'aplikasi')
  const nF = 56
  const tepiKuning: THREE.Vector3[] = []
  for (let i = 0; i < nF; i++) {
    const a = (i / nF) * Math.PI * 2
    const c = Math.cos(a)
    const sn = Math.sin(a)
    const dalam = LUMPUR.ay - 0.045
    const luarR = LUMPUR.ay + 0.012
    const titik = [
      new THREE.Vector3(c * dalam, sn * dalam, tinggiKuning(c * dalam, sn * dalam) + 0.004),
      new THREE.Vector3(c * (LUMPUR.ay - 0.012), sn * (LUMPUR.ay - 0.012), tinggiKuning(c * (LUMPUR.ay - 0.012), sn * (LUMPUR.ay - 0.012)) + 0.008),
      new THREE.Vector3(c * luarR, sn * luarR, LUMPUR.zy + 0.012),
    ]
    g.add(benangSulam(titik, 0.0048, bahanFeston))
    tepiKuning.push(new THREE.Vector3(c * (LUMPUR.ay + 0.004), sn * (LUMPUR.ay + 0.004), LUMPUR.zy + 0.016))
  }
  tepiKuning.push(tepiKuning[0].clone())
  g.add(benangSulam(tepiKuning, 0.004, bahanFeston))
  // dua jahitan sisi: muka depan dan belakang ke pita dinding, tusuk feston yang melompati tepi
  const bahanSisi = bahanJahit(ctx, W.benang, 'sisi')
  for (const vt of [V_TEPI_LUMPUR, 1 - V_TEPI_LUMPUR]) {
    const nS = 54
    const garis: THREE.Vector3[] = []
    for (let i = 0; i < nS; i++) {
      const u = i / nS
      const angkat = (v: number) => {
        const p = Pc(u, v)
        return p.addScaledVector(p.clone().normalize(), 0.0035)
      }
      g.add(benangSulam([angkat(vt - 0.022), angkat(vt), angkat(vt + 0.022)], 0.0048, bahanSisi))
      garis.push(angkat(vt + (vt < 0.5 ? 0.022 : -0.022)))
    }
    garis.push(garis[0].clone())
    g.add(benangSulam(garis, 0.004, bahanSisi))
  }
  // kismis: sulam satin mendatar + garis tepi rantai, cokelat tua, di tengah kubah
  const bahanKismis = bahanBenang(ctx, W.kismis, 'hias')
  const rx = 0.088
  const ry = 0.054
  // isi: baris manik pilin miring bergantian (sulam satin bergulung), tepi: rantai manik mengikuti oval
  const posKismis: THREE.Matrix4[] = []
  const Z = new THREE.Vector3(0, 0, 1)
  const pasang = (x: number, y: number, T: THREE.Vector3, ukuran: number, angkat: number) => {
    const B = new THREE.Vector3().crossVectors(T, Z)
    const m = new THREE.Matrix4().makeBasis(B.multiplyScalar(ukuran), T.clone().multiplyScalar(ukuran * 0.85), Z.clone().multiplyScalar(ukuran * 0.8))
    m.setPosition(x, y, tinggiKuning(x, y) + angkat)
    posKismis.push(m)
  }
  for (let j = 0; j < 4; j++) {
    const y = (-1 + (j + 0.5) / 2) * ry * 0.72
    const hx = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)) * 0.78
    const n = Math.max(2, Math.round((2 * hx) / 0.026) + 1)
    for (let k = 0; k < n; k++) {
      const x = -hx + (k / Math.max(1, n - 1)) * 2 * hx
      pasang(x, y, new THREE.Vector3(1, 0, 0).applyAxisAngle(Z, (j % 2 ? 1 : -1) * 0.6), 0.019, 0.016)
    }
  }
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2
    const T = new THREE.Vector3(-Math.sin(a) * rx, Math.cos(a) * ry, 0).normalize().applyAxisAngle(Z, (k % 2 ? 1 : -1) * 0.45)
    pasang(Math.cos(a) * rx, Math.sin(a) * ry, T, 0.017, 0.012)
  }
  const kismis = new THREE.InstancedMesh(geoManik(), bahanKismis, posKismis.length)
  posKismis.forEach((m, i) => kismis.setMatrixAt(i, m))
  kismis.instanceMatrix.needsUpdate = true
  kismis.castShadow = true
  g.add(kismis)
  g.add(tabDanRing(ctx, W.tab, W.ring, 0.5))
  return g
}

const SERABI = { ay: 0.41, cy: 0.16, fy: 2.3, zy: 0.05 }
/** Lekuk tepi cup: 0 di tengah atas (tempat tab), puncak di lima lekuk. */
const lekuk = (ph: number) => 0.5 - 0.5 * Math.cos(8 * (ph - Math.PI / 2))

function catmull(pts: [number, number][], t: number): [number, number] {
  const n = pts.length - 1
  const x = THREE.MathUtils.clamp(t, 0, 1) * n
  const i = Math.min(n - 1, Math.floor(x))
  const f = x - i
  const p0 = pts[Math.max(0, i - 1)]
  const p1 = pts[i]
  const p2 = pts[i + 1]
  const p3 = pts[Math.min(n, i + 2)]
  const h = (k: 0 | 1) =>
    0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * f + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * f * f + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * f * f * f)
  return [h(0), h(1)]
}

/** Cup serabi: profil dari pusat belakang, dinding luar, bibir bergelombang, dinding dalam, sampai tepi kubah putih. */
const cupSerabi: P2 = (u, v) => {
  const ph = u * Math.PI * 2
  const w = lekuk(ph)
  const pts: [number, number][] = [
    [0, -0.16],
    [0.2, -0.17],
    [0.38, -0.16],
    [0.48, -0.11],
    [0.525, -0.02],
    [0.535 + 0.004 * w, 0.08 + 0.012 * w],
    [0.535 + 0.01 * w, 0.15 + 0.035 * w],
    [0.5 + 0.01 * w, 0.18 + 0.04 * w],
    [0.455 + 0.005 * w, 0.14 + 0.028 * w],
    [0.43, 0.085],
    [0.405, 0.05],
  ]
  const [rho, z] = catmull(pts, v)
  return new THREE.Vector3(rho * Math.cos(ph), rho * Math.sin(ph), z)
}

function serabi(ctx: Ctx) {
  const W = PALET.serabi
  const g = new THREE.Group()
  // cup flanel: dasar bulat + dinding bergelombang, bibir atas dijahit feston benang senada
  const cup = new THREE.Mesh(permukaanGeo(cupSerabi, 200, 110), bahanFlanel(ctx, W.cup, [16, 4]))
  cup.castShadow = cup.receiveShadow = true
  g.add(cup)
  g.add(grumbelFlanel(ctx, cup, W.cup, 4.4, 61, 'dua'))
  const benangCup = bahanJahit(ctx, '#' + new THREE.Color(W.cup).multiplyScalar(0.8).getHexString(), 'aplikasi')
  for (let i = 0; i < 110; i++) {
    const u = i / 110
    g.add(benangSulam([cupSerabi(u + 0.002, 0.62), cupSerabi(u, 0.7).add(new THREE.Vector3(0, 0, 0.006)), cupSerabi(u - 0.002, 0.78)], 0.0042, benangCup))
  }
  // kubah putih: flanel/fleece, bukan rajut
  const pusat = new THREE.Vector3(0, 0, SERABI.zy)
  const Pk = bintang(superElips(SERABI.ay, SERABI.ay, SERABI.cy, 2, SERABI.fy), pusat)
  const kubah = new THREE.Mesh(permukaanGeo(Pk, 120, 48, 0, 0.5), bahanFlanel(ctx, W.putih, [12, 3]))
  kubah.castShadow = kubah.receiveShadow = true
  g.add(kubah)
  g.add(grumbelFlanel(ctx, kubah, W.putih, 0.6, 66, (p) => p.clone().sub(pusat)))
  const tinggiKubah = (x: number, y: number) => {
    const rho = Math.hypot(x, y)
    return SERABI.zy + SERABI.cy * Math.pow(Math.max(0, 1 - Math.pow(rho / SERABI.ay, SERABI.fy)), 1 / SERABI.fy)
  }
  // tusuk feston merah muda di tepi kubah
  const bahanFeston = bahanJahit(ctx, W.feston, 'aplikasi')
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    const dalam = SERABI.ay - 0.03
    g.add(benangSulam([new THREE.Vector3(c * dalam, s * dalam, tinggiKubah(c * dalam, s * dalam) + 0.004), new THREE.Vector3(c * (SERABI.ay - 0.008), s * (SERABI.ay - 0.008), SERABI.zy + 0.045), new THREE.Vector3(c * (SERABI.ay + 0.01), s * (SERABI.ay + 0.01), SERABI.zy + 0.02)], 0.0045, bahanFeston))
  }
  // aksen pandan "^": dua potong flanel hijau yang ditempel, dijahit jelujur kecil di tepinya
  const bahanPandan = bahanFlanel(ctx, W.pandan, [1, 1])
  const benangPandan = bahanJahit(ctx, '#' + new THREE.Color(W.pandan).multiplyScalar(0.8).getHexString(), 'hias')
  for (const s of [-1, 1]) {
    const awal = new THREE.Vector2(s * 0.13, -0.04)
    const akhir = new THREE.Vector2(s * 0.004, 0.078)
    const tengah = awal.clone().add(akhir).multiplyScalar(0.5)
    const panjang = awal.distanceTo(akhir) + 0.03
    const sudut = Math.atan2(akhir.y - awal.y, akhir.x - awal.x)
    const potong = new THREE.Mesh(new RoundedBoxGeometry(panjang, 0.05, 0.014, 2, 0.006), bahanPandan)
    potong.position.set(tengah.x, tengah.y, tinggiKubah(tengah.x, tengah.y) + 0.004)
    potong.rotation.z = sudut
    potong.castShadow = true
    g.add(potong)
    const T = new THREE.Vector2(Math.cos(sudut), Math.sin(sudut))
    const N = new THREE.Vector2(-T.y, T.x)
    for (const sisi of [-1, 1])
      for (let k = 0; k < 6; k++) {
        const q = tengah.clone().addScaledVector(T, (k / 5 - 0.5) * (panjang - 0.03)).addScaledVector(N, sisi * 0.019)
        const z = tinggiKubah(q.x, q.y) + 0.012
        g.add(benangSulam([new THREE.Vector3(q.x, q.y, z), new THREE.Vector3(q.x + T.x * 0.008, q.y + T.y * 0.008, z + 0.001)], 0.0028, benangPandan))
      }
  }
  g.add(tabDanRing(ctx, W.tab, W.ring, 0.52, 0.04))
  return g
}

/**
 * Satukan semua potongan benang (TubeGeometry) yang memakai bahan sama jadi satu mesh. Satu charm punya ratusan
 * tusuk feston dan jelujur; tanpa ini tiap tusuk satu draw call dan web tersendat saat charm berganti.
 */
function gabungkanBenang(akar: THREE.Group) {
  akar.updateMatrixWorld(true)
  const balik = akar.matrixWorld.clone().invert()
  const kelompok = new Map<THREE.Material, THREE.Mesh[]>()
  akar.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || (m as THREE.InstancedMesh).isInstancedMesh || Array.isArray(m.material)) return
    if (!(m.geometry instanceof THREE.TubeGeometry)) return
    const daftar = kelompok.get(m.material) ?? []
    daftar.push(m)
    kelompok.set(m.material, daftar)
  })
  for (const [bahan, daftar] of kelompok) {
    if (daftar.length < 2) continue
    const geo = mergeGeometries(daftar.map((m) => m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(balik, m.matrixWorld))))
    if (!geo) continue
    daftar.forEach((m) => {
      m.removeFromParent()
      m.geometry.dispose()
    })
    const satu = new THREE.Mesh(geo, bahan)
    satu.castShadow = true
    akar.add(satu)
  }
}

const PEMBUAT: Record<CharmRajutId, (ctx: Ctx) => THREE.Group> = { klepon, 'onde-onde': ondeOnde, 'kue-lapis': lapis, 'kue-lumpur': lumpur, serabi }

/** Model charm rajut. Pusat badan di titik asal, depan +Z, ring di atas (puncak ring ±y 1,28). */
export function buatCharmRajut(id: CharmRajutId, opsi: { peta?: boolean; daftar?: MatWarna[] } = {}) {
  const ctx: Ctx = { daftar: opsi.daftar ?? [], peta: !!opsi.peta }
  const grup = PEMBUAT[id](ctx)
  gabungkanBenang(grup)
  grup.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true
  })
  return grup
}

/** Titik-titik penting di permukaan (koordinat model) untuk keterangan di lembar desain. */
export function titikCharm(id: CharmRajutId): Record<string, THREE.Vector3> {
  const elips = (a: number, b: number, c: number, x: number, y: number, z: number) => {
    const d = new THREE.Vector3(x, y, z).normalize()
    return d.multiplyScalar(superElips(a, b, c)(d))
  }
  const atas: Record<CharmRajutId, number> = { klepon: 0.505, 'onde-onde': 0.49, 'kue-lapis': 0.5, 'kue-lumpur': 0.5, serabi: 0.52 }
  const t: Record<string, THREE.Vector3> = { tab: new THREE.Vector3(0, atas[id] + 0.05, id === 'serabi' ? 0.07 : 0.03) }
  if (id === 'klepon') {
    Object.assign(t, {
      sisiDepan: elips(0.5, 0.505, 0.37, 0.8, -0.6, 0),
      sisiSamping: elips(0.5, 0.505, 0.37, 1, -0.35, 0),
      hiasDepan: elips(0.5, 0.505, 0.37, -0.25, 0.55, 0.75),
      hiasSamping: elips(0.5, 0.505, 0.37, 0.5, 0.75, 0.42),
    })
  } else if (id === 'onde-onde') {
    Object.assign(t, {
      sisiDepan: elips(0.5, 0.49, 0.44, 0.8, -0.6, 0),
      sisiSamping: elips(0.5, 0.49, 0.44, 1, -0.35, 0),
      hiasDepan: elips(0.5, 0.49, 0.44, -0.3, -0.25, 0.9),
      hiasSamping: elips(0.5, 0.49, 0.44, 0.6, 0.2, 0.75),
    })
  } else if (id === 'kue-lapis') {
    Object.assign(t, {
      sisiDepan: garisLapis(0.93),
      sisiSamping: garisLapis(0.97),
      aplikasiDepan: panelLapis(1)(0.72, (Math.asin(0.2 / 0.9995) / (Math.PI / 2) + 1) / 2),
      aplikasiSamping: panelLapis(1)(0.8, (Math.asin(0.6 / 0.9995) / (Math.PI / 2) + 1) / 2),
    })
  } else if (id === 'kue-lumpur') {
    const a = -Math.PI / 4
    Object.assign(t, {
      aplikasiDepan: new THREE.Vector3(Math.cos(a) * 0.43, Math.sin(a) * 0.43, 0.14),
      aplikasiSamping: new THREE.Vector3(0.43, -0.12, 0.14),
      hiasDepan: new THREE.Vector3(0.06, 0, tinggiKuning(0.06, 0) + 0.02),
      hiasSamping: new THREE.Vector3(0.02, 0, tinggiKuning(0.02, 0) + 0.02),
      sisiDepan: PC_LUMPUR(0.62, V_TEPI_LUMPUR),
      sisiSamping: PC_LUMPUR(0.97, 1 - V_TEPI_LUMPUR),
    })
  } else {
    const a = -Math.PI / 3
    Object.assign(t, {
      aplikasiDepan: new THREE.Vector3(Math.cos(a) * 0.41, Math.sin(a) * 0.41, 0.06),
      aplikasiSamping: new THREE.Vector3(0.38, -0.16, 0.09),
      hiasDepan: new THREE.Vector3(0.07, 0.02, 0.22),
      hiasSamping: new THREE.Vector3(0.05, 0.02, 0.22),
      infoDepan: cupSerabi(0.62, 0.68),
      infoSamping: cupSerabi(0.97, 0.25),
    })
  }
  return t
}
