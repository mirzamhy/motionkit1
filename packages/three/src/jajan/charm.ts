import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
export type CharmId = 'klepon' | 'onde-onde' | 'kue-lapis' | 'kue-lumpur' | 'serabi' | 'secret'
import { teksturBenang, teksturFlanel, teksturKlepon, tinggiFlanel, teksturTanya } from './tekstur'

const HITAM = new THREE.Color('#120C0A')
const HITAM_RING = new THREE.Color('#3A2C26')

export type MatWarna = { m: THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial; warna: THREE.Color; gelap: THREE.Color; sheen: number }

export type Charm3 = {
  grup: THREE.Group
  /** 0 = siluet hitam, 1 = warna asli. */
  setWarna: (t: number) => void
}

export function acak(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

export function flanel(warna: string, daftar: MatWarna[], opsi: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  const felt = teksturFlanel()
  const m = new THREE.MeshPhysicalMaterial({
    color: warna,
    map: felt,
    bumpMap: tinggiFlanel(),
    roughness: 1,
    sheen: 0.38,
    sheenRoughness: 1,
    sheenColor: new THREE.Color(warna).lerp(new THREE.Color('#ffffff'), 0.16),
    ...opsi,
    bumpScale: Math.min(0.14, opsi.bumpScale ?? 0.12),
  })
  daftar.push({ m, warna: new THREE.Color(warna), gelap: HITAM, sheen: m.sheen })
  return m
}

/** Logam bercat mengilap untuk ring pegas. Butuh scene.environment supaya kilapnya terlihat. */
export function logam(warna: string, daftar: MatWarna[], kasar = 0.22, metal = 0.25) {
  const m = new THREE.MeshStandardMaterial({ color: warna, roughness: kasar, metalness: metal })
  daftar.push({ m, warna: new THREE.Color(warna), gelap: HITAM_RING, sheen: 0 })
  return m
}

export function benang(warna: string, daftar: MatWarna[]) {
  const m = new THREE.MeshStandardMaterial({ color: warna, roughness: 1 })
  daftar.push({ m, warna: new THREE.Color(warna), gelap: HITAM, sheen: 0 })
  return m
}

function jahitOval(g: THREE.Group, rx: number, ry: number, z: number, warna: string, daftar: MatWarna[], jumlah = 64, gelombang = 0) {
  const titik = Array.from({ length: 97 }, (_, i) => {
    const a = i * Math.PI * 2 / 96
    const k = 1 + gelombang * Math.sin(a * 7)
    return new THREE.Vector3(rx * Math.cos(a) * k, ry * Math.sin(a) * k, z)
  })
  const bahan = benang(warna, daftar)
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(titik, true), 128, 0.006, 5, true), bahan))
  const jahitan = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.004, 0.014, 4, 6), bahan, jumlah)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  for (let i = 0; i < jumlah; i++) {
    const a = (i + 0.35) * Math.PI * 2 / jumlah
    const k = 1 + gelombang * Math.sin(a * 7)
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a - Math.PI / 2)
    m4.compose(new THREE.Vector3(rx * Math.cos(a) * k, ry * Math.sin(a) * k, z + 0.009), q, new THREE.Vector3(1, 1, 1))
    jahitan.setMatrixAt(i, m4)
  }
  jahitan.instanceMatrix.needsUpdate = true
  g.add(jahitan)
}

function jahitKlepon(g: THREE.Group, badan: THREE.Mesh, daftar: MatWarna[]) {
  const permukaan = new THREE.Mesh(badan.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
  const ray = new THREE.Raycaster()
  const arah = new THREE.Vector3()
  const jahitan = 72
  const titik: THREE.Vector3[] = []
  for (let i = 0; i < jahitan; i++) {
    const a = i * Math.PI * 2 / jahitan
    arah.set(Math.cos(a), Math.sin(a), 0.08).normalize()
    ray.set(arah.clone().multiplyScalar(2), arah.clone().negate())
    const hit = ray.intersectObject(permukaan, false)[0]
    if (hit) titik.push(hit.point.addScaledVector(arah, 0.003))
  }
  permukaan.material.dispose()
  if (titik.length < 3) return

  const benangJahit = benang('#6FA843', daftar)
  const silang = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.0018, 0.011, 4, 6), benangJahit, titik.length)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1))
  for (let i = 0; i < titik.length; i++) {
    m4.compose(titik[i], q, new THREE.Vector3(1, 1, 1))
    silang.setMatrixAt(i, m4)
  }
  silang.instanceMatrix.needsUpdate = true
  g.add(silang)
}

export const R_RING = 0.255
export const TABUNG = 0.045

/**
 * Ring pegas (spring gate ring) bercat sesuai warna varian: sambungan gate di kanan atas,
 * dan bagian engsel yang sedikit lebih tebal dengan paku keling di kiri.
 */
export function buatRing(daftar: MatWarna[], warna: string) {
  const g = new THREE.Group()
  const krom = logam(warna, daftar)
  const gelap = '#' + new THREE.Color(warna).multiplyScalar(0.55).getHexString()
  g.add(new THREE.Mesh(new THREE.TorusGeometry(R_RING, TABUNG, 24, 96), krom))

  // Selubung engsel: busur pendek yang sedikit lebih tebal.
  const awal = THREE.MathUtils.degToRad(168)
  const busur = THREE.MathUtils.degToRad(42)
  const selubung = new THREE.Mesh(new THREE.TorusGeometry(R_RING, TABUNG * 1.18, 24, 24, busur), krom)
  selubung.rotation.z = awal
  g.add(selubung)

  // Paku keling engsel, menonjol di sisi depan dan belakang.
  const sudutPaku = THREE.MathUtils.degToRad(186)
  const paku = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, TABUNG * 2.7, 20), logam('#c9cad0', daftar, 0.25, 1))
  paku.rotation.x = Math.PI / 2
  paku.position.set(Math.cos(sudutPaku) * R_RING, Math.sin(sudutPaku) * R_RING, 0)
  g.add(paku)

  // Celah gate: irisan tipis gelap yang memotong tabung.
  const celah = (sudut: number) => {
    const s = THREE.MathUtils.degToRad(sudut)
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(TABUNG * 1.04, TABUNG * 1.04, 0.006, 20),
      logam(gelap, daftar, 0.5),
    )
    m.position.set(Math.cos(s) * R_RING, Math.sin(s) * R_RING, 0)
    m.rotation.z = s
    return m
  }
  g.add(celah(62), celah(awal * (180 / Math.PI) + 42))
  const engsel = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.12, 0.11, 3, 0.02), krom)
  engsel.position.set(-0.254, -0.021, 0)
  engsel.rotation.z = -0.22
  g.add(engsel)
  const tombol = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 8), logam(gelap, daftar, 0.42))
  tombol.position.set(-0.254, -0.021, 0.061)
  g.add(tombol)
  return g
}

function ringDanTab(atasY: number, warna: string, daftar: MatWarna[]) {
  const g = new THREE.Group()
  const ring = buatRing(daftar, warna)
  ring.position.y = atasY + 0.38
  g.add(ring)
  // Pita webbing yang melingkar di bagian bawah ring.
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.26, 0.06, 2, 0.02), flanel(warna, daftar, { sheen: 0.4 }))
  tab.position.y = atasY + 0.1
  g.add(tab)
  const ribs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.125, 0.004, 0.004), benang(new THREE.Color(warna).lerp(new THREE.Color('#ffffff'), 0.1).getStyle(), daftar), 19)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < 19; i++) {
    m4.makeTranslation(0, atasY - 0.005 + i * 0.012, 0.033)
    ribs.setMatrixAt(i, m4)
  }
  ribs.instanceMatrix.needsUpdate = true
  g.add(ribs)
  for (const x of [-0.068, 0.068]) {
    const seam = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.21, 4, 6), benang(new THREE.Color(warna).multiplyScalar(0.74).getStyle(), daftar))
    seam.position.set(x, atasY + 0.1, 0.033)
    g.add(seam)
  }
  return g
}

/** Bola yang tidak sempurna, seperti adonan yang dibulatkan tangan. */
function bolaTakRata(skala: THREE.Vector3, seed: number, amp: number) {
  const geo = new THREE.SphereGeometry(1, 72, 48)
  const pos = geo.attributes.position
  const r = acak(seed)
  const f = [1 + r() * 2, 2 + r() * 2, 3 + r() * 3]
  const fase = [r() * 6, r() * 6, r() * 6]
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const d =
      1 +
      amp * Math.sin(v.x * f[0] + fase[0]) * Math.cos(v.y * f[1] + fase[1]) +
      amp * 0.6 * Math.sin(v.z * f[2] + fase[2] + v.y * 2)
    v.multiplyScalar(d).multiply(skala)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

export function benangKeriting(badan: THREE.Mesh, warna: string, daftar: MatWarna[], seed: number, jumlah = 15000) {
  const posisi = badan.geometry.getAttribute('position')
  const normal = badan.geometry.getAttribute('normal')
  const rng = acak(seed)
  const lengkung = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.009, -0.004, 0),
    new THREE.Vector3(-0.004, 0.005, 0.003),
    new THREE.Vector3(0.002, -0.003, 0.004),
    new THREE.Vector3(0.009, 0.004, 0),
  ])
  const serat = new THREE.InstancedMesh(
    new THREE.TubeGeometry(lengkung, 6, 0.0012, 3, false),
    benang(warna, daftar),
    jumlah,
  )
  const depan = new THREE.Vector3(0, 0, 1)
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const q = new THREE.Quaternion()
  const putar = new THREE.Quaternion()
  const m4 = new THREE.Matrix4()
  const warnaSerat = new THREE.Color()
  for (let i = 0; i < jumlah; i++) {
    const idx = Math.floor(rng() * posisi.count)
    p.fromBufferAttribute(posisi, idx)
    n.fromBufferAttribute(normal, idx).normalize()
    p.addScaledVector(n, 0.003)
    q.setFromUnitVectors(depan, n)
    putar.setFromAxisAngle(depan, rng() * Math.PI * 2)
    q.multiply(putar)
    const ukuran = 0.75 + rng() * 0.65
    m4.compose(p, q, new THREE.Vector3(ukuran, ukuran, ukuran))
    serat.setMatrixAt(i, m4)
    serat.setColorAt(i, warnaSerat.setScalar(0.87 + rng() * 0.13))
  }
  serat.instanceMatrix.needsUpdate = true
  if (serat.instanceColor) serat.instanceColor.needsUpdate = true
  serat.castShadow = false
  return serat
}

/**
 * Taburan padat di permukaan bola (titik Fibonacci yang digeser acak, jadi merata tanpa gumpalan aneh).
 * `peluang` mengatur kerapatan per arah normal, `tegak` seberapa jauh butir boleh mencuat dari permukaan,
 * `warna` memberi variasi warna per butir.
 */
function taburanPadat(opsi: {
  geo: THREE.BufferGeometry
  mat: THREE.Material
  jumlah: number
  skala: THREE.Vector3
  ukuran: THREE.Vector3
  seed: number
  surface?: THREE.BufferGeometry
  peluang?: (n: THREE.Vector3) => number
  tegak?: number
  angkat?: number
  /** jarak minimum butir dari permukaan bola dasar, untuk mengimbangi badan yang tidak rata */
  dasar?: number
  warna?: string[]
}) {
  const { geo, mat, jumlah, skala, ukuran, seed, surface, peluang = () => 1, tegak = 0, angkat = 0, dasar = 0, warna } = opsi
  const mesh = new THREE.InstancedMesh(geo, mat, jumlah)
  const r = acak(seed)
  const atas = new THREE.Vector3(0, 1, 0)
  const q = new THREE.Quaternion()
  const putar = new THREE.Quaternion()
  const miring = new THREE.Quaternion()
  const m4 = new THREE.Matrix4()
  const c = new THREE.Color()
  const emas = Math.PI * (3 - Math.sqrt(5))
  const surfaceMesh = surface ? new THREE.Mesh(surface, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })) : null
  const raycaster = new THREE.Raycaster()
  const origin = new THREE.Vector3()
  let i = 0
  // Semua titik kandidat disebar ke seluruh bola dulu, baru disaring dengan `peluang`. Kalau kuota dipakai
  // sambil berjalan dari atas, butir habis sebelum sampai ke bagian bawah.
  for (let k = 0; k < jumlah; k++) {
    // Titik ke-k dari titik Fibonacci, digeser sedikit supaya tidak tampak berpola.
    const y = 1 - ((k + 0.5) / jumlah) * 2
    const rad = Math.sqrt(1 - y * y)
    const a = k * emas + (r() - 0.5) * 0.9
    const n = new THREE.Vector3(Math.cos(a) * rad, y + (r() - 0.5) * 0.04, Math.sin(a) * rad).normalize()
    if (r() > peluang(n)) continue
    const p = n.clone().multiply(skala)
    // Normal pada elipsoid, supaya butir rebah mengikuti permukaan yang dipipihkan.
    const normal = new THREE.Vector3(n.x / skala.x, n.y / skala.y, n.z / skala.z).normalize()
    if (surfaceMesh) {
      raycaster.set(origin, n)
      const hit = raycaster.intersectObject(surfaceMesh, false)[0]
      if (!hit) continue
      p.copy(hit.point)
      normal.set(p.x / (skala.x * skala.x), p.y / (skala.y * skala.y), p.z / (skala.z * skala.z)).normalize()
    }
    // Dorong keluar sedikit lebih dari tebal butir: permukaan badan bergelombang sampai beberapa persen.
    p.addScaledVector(normal, ukuran.y * 0.4 + dasar + r() * angkat)
    q.setFromUnitVectors(atas, normal)
    putar.setFromAxisAngle(atas, r() * Math.PI * 2)
    miring.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (r() - 0.5) * 2 * tegak)
    q.multiply(putar).multiply(miring)
    m4.compose(p, q, ukuran.clone().multiply(new THREE.Vector3(0.7 + r() * 0.6, 0.8 + r() * 0.4, 0.8 + r() * 0.4)))
    mesh.setMatrixAt(i, m4)
    if (warna) mesh.setColorAt(i, c.set(warna[Math.floor(r() * warna.length)]))
    i++
  }
  mesh.count = i
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  surfaceMesh?.material.dispose()
  mesh.castShadow = true
  return mesh
}

function klepon(daftar: MatWarna[], swatch = false) {
  const g = new THREE.Group()
  const skala = new THREE.Vector3(0.5, 0.47, 0.48)
  // Badan dari flanel hijau pandan, diisi dakron sehingga sedikit tidak bulat sempurna.
  const bahanBadan = swatch
    ? flanel('#F7F7EF', daftar, { map: teksturKlepon(), sheenColor: new THREE.Color('#8dbf64'), bumpScale: 0.1 })
    : flanel('#74B33E', daftar, { bumpScale: 0.14 })
  const badan = new THREE.Mesh(bolaTakRata(skala, 4, 0.055), bahanBadan)
  g.add(badan)
  g.add(benangKeriting(badan, '#7EB146', daftar, 104))
  // "Kelapa parut" dari potongan flanel putih yang lebar (desain awal), menumpuk di setengah atas.
  const kelapa = flanel('#FBF8F0', daftar, {
    map: teksturBenang(),
    sheen: 0.15,
    bumpScale: 0.08,
  })
  const seratKelapa = new RoundedBoxGeometry(1, 1, 1, 4, 0.24)
  const seratPos = seratKelapa.getAttribute('position')
  for (let i = 0; i < seratPos.count; i++) {
    const x = seratPos.getX(i)
    const y = seratPos.getY(i)
    const z = seratPos.getZ(i)
    seratPos.setXYZ(i, x * (1 + 0.06 * Math.sin(x * 18 + y * 13)), y + 0.075 * Math.sin(x * 12 + z * 9), z * (1 + 0.08 * Math.sin(x * 20 - y * 16)))
  }
  seratKelapa.computeVertexNormals()
  g.add(
    taburanPadat({
      geo: seratKelapa,
      mat: kelapa,
      jumlah: 300,
      skala,
      surface: badan.geometry,
      ukuran: new THREE.Vector3(0.09, 0.028, 0.043),
      seed: 11,
      peluang: (n) => (n.z > 0.35 ? (n.y > 0.08 ? 1 : n.y > -0.2 ? 0.2 : 0) : 0),
      tegak: 0.2,
      dasar: 0.005,
    }),
  )
  jahitKlepon(g, badan, daftar)
  g.add(ringDanTab(0.48, '#5E8A3C', daftar))
  return g
}

function ondeOnde(daftar: MatWarna[]) {
  const g = new THREE.Group()
  const skala = new THREE.Vector3(0.5, 0.49, 0.49)
  // Badan dari flanel keemasan.
  const badan = new THREE.Mesh(bolaTakRata(skala, 9, 0.02), flanel('#D2923F', daftar, { bumpScale: 1.6 }))
  g.add(badan)
  g.add(benangKeriting(badan, '#D89A50', daftar, 109))
  // Wijen dari butir flanel krem yang besar dan lonjong (desain awal), tersebar merata.
  g.add(
    taburanPadat({
      geo: new THREE.SphereGeometry(1, 14, 8),
      mat: flanel('#FBF0D8', daftar, { sheen: 0.4 }),
      jumlah: 190,
      skala,
      ukuran: new THREE.Vector3(0.042, 0.014, 0.019),
      seed: 5,
      tegak: 0.1,
      dasar: 0.012,
    }),
  )
  jahitOval(g, 0.474, 0.464, 0.175, '#B87831', daftar, 74)
  g.add(ringDanTab(0.49, '#D8A82A', daftar))
  return g
}

function lapis(daftar: MatWarna[]) {
  const g = new THREE.Group()
  const lapisan = ['#EC4E92', '#F6E8D5', '#78B850', '#F6E8D5', '#EC4E92']
  const lebar = [0.94, 0.96, 0.98, 0.96, 0.94]
  lapisan.forEach((warna, i) => {
    const geo = new RoundedBoxGeometry(lebar[i], 0.206, 0.34, 8, 0.065)
    const p = geo.getAttribute('position')
    for (let j = 0; j < p.count; j++) {
      const x = p.getX(j)
      const y = p.getY(j)
      const z = p.getZ(j)
      p.setXYZ(j, x + 0.009 * Math.sin(y * 28 + i * 1.7), y + 0.008 * Math.sin(x * 16 + i), z + 0.013 * Math.sin(x * 14 + y * 9 + i * 2))
    }
    geo.computeVertexNormals()
    const lapis = new THREE.Mesh(geo, flanel(warna, daftar, { bumpScale: 1.8 }))
    lapis.position.y = 0.392 - i * 0.196
    lapis.rotation.z = [0.009, -0.012, 0.006, 0.014, -0.008][i]
    g.add(lapis)
  })
  const jahitan = benang('#D87785', daftar)
  for (let i = 0; i < 4; i++) {
    const y = 0.294 - i * 0.196
    const garis = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.87, 4, 8), jahitan)
    garis.rotation.z = Math.PI / 2
    garis.position.set(0, y, 0.176)
    g.add(garis)
  }
  const sisi = benang('#B93F6C', daftar)
  for (const x of [-0.445, 0.445]) {
    const garis = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.87, 4, 8), sisi)
    garis.position.set(x, 0, 0.179)
    g.add(garis)
  }
  g.add(ringDanTab(0.49, '#EC7FA6', daftar))
  return g
}

function lumpur(daftar: MatWarna[]) {
  const g = new THREE.Group()
  const profil = [
    [0, 0.12],
    [0.47, 0.12],
    [0.53, 0.105],
    [0.565, 0.05],
    [0.565, -0.05],
    [0.53, -0.105],
    [0.47, -0.12],
    [0, -0.12],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  // DoubleSide: urutan titik profil membuat sebagian normal lathe menghadap ke dalam.
  const puck = new THREE.Mesh(new THREE.LatheGeometry(profil, 64), flanel('#9A5A2E', daftar, { side: THREE.DoubleSide, bumpScale: 1.7 }))
  puck.rotation.x = Math.PI / 2
  g.add(puck)
  const isi = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 64), flanel('#F4CB52', daftar))
  isi.rotation.x = Math.PI / 2
  isi.position.z = 0.11
  g.add(isi)
  jahitOval(g, 0.507, 0.507, 0.13, '#7E4527', daftar, 82)
  const kismis = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 16),
    new THREE.MeshStandardMaterial({ color: '#4A2414', roughness: 0.55 }),
  )
  daftar.push({ m: kismis.material, warna: new THREE.Color('#4A2414'), gelap: HITAM, sheen: 0 })
  kismis.scale.set(0.1, 0.07, 0.05)
  kismis.position.z = 0.14
  kismis.rotation.z = -0.15
  g.add(kismis)
  const butir = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), logam('#33190E', daftar, 0.75, 0), 23)
  const rng = acak(77)
  const matriks = new THREE.Matrix4()
  const rotasi = new THREE.Quaternion()
  for (let i = 0; i < 23; i++) {
    const a = rng() * Math.PI * 2
    const r = Math.sqrt(rng())
    rotasi.setFromAxisAngle(new THREE.Vector3(0, 0, 1), a)
    matriks.compose(new THREE.Vector3(Math.cos(a) * r * 0.082, Math.sin(a) * r * 0.052, 0.186 + rng() * 0.008), rotasi, new THREE.Vector3(0.021, 0.011, 0.007))
    butir.setMatrixAt(i, matriks)
  }
  butir.instanceMatrix.needsUpdate = true
  g.add(butir)
  g.add(ringDanTab(0.56, '#9A5A2E', daftar))
  return g
}

function serabi(daftar: MatWarna[]) {
  const g = new THREE.Group()
  const profil = [
    [0, -0.12],
    [0.4, -0.12],
    [0.5, -0.07],
    [0.58, 0.05],
    [0.62, 0.14],
    [0.6, 0.16],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const geoCup = new THREE.LatheGeometry(profil, 120)
  // Pinggiran cup bergelombang seperti flanel yang dilipat.
  const pos = geoCup.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const a = Math.atan2(z, x)
    const naik = THREE.MathUtils.clamp((y + 0.05) / 0.21, 0, 1)
    const k = 1 + naik * (0.07 * Math.sin(a * 7) + 0.035 * Math.sin(a * 3 + 1))
    pos.setXYZ(i, x * k, y + naik * 0.03 * Math.sin(a * 7 + 0.6), z * k)
  }
  geoCup.computeVertexNormals()
  const cup = new THREE.Mesh(geoCup, flanel('#D7792B', daftar, { side: THREE.DoubleSide, bumpScale: 1.7 }))
  cup.rotation.x = Math.PI / 2
  g.add(cup)
  const kubah = new THREE.Mesh(new THREE.SphereGeometry(0.46, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), flanel('#FBFAF6', daftar))
  kubah.scale.y = 0.55
  kubah.rotation.x = Math.PI / 2
  kubah.position.z = -0.02
  g.add(kubah)
  jahitOval(g, 0.55, 0.55, 0.165, '#AF5E29', daftar, 76, 0.045)
  const hijau = flanel('#4E9A3E', daftar, { sheen: 0.5 })
  ;[-1, 1].forEach((s) => {
    const kaki = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.07, 0.05, 2, 0.02), hijau)
    kaki.position.set(s * 0.065, -0.02, 0.255)
    kaki.rotation.z = -s * 0.75
    g.add(kaki)
  })
  g.add(ringDanTab(0.6, '#5E8A3C', daftar))
  return g
}

function rahasia(daftar: MatWarna[]) {
  const g = new THREE.Group()
  const tanya = teksturTanya()
  const m = new THREE.MeshPhysicalMaterial({
    color: '#120C0A',
    roughness: 0.85,
    sheen: 0.6,
    sheenColor: new THREE.Color('#5a4a40'),
    emissive: new THREE.Color('#F6D77A'),
    emissiveMap: tanya,
    emissiveIntensity: 1,
  })
  const badan = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), m)
  badan.scale.set(0.5, 0.49, 0.45)
  g.add(badan)
  // Ring gelap (gunmetal) supaya karakter rahasia tetap misterius.
  const ring = buatRing(daftar, '#3A2C26')
  ring.position.y = 0.87
  g.add(ring)
  const tab = new THREE.Mesh(
    new RoundedBoxGeometry(0.16, 0.26, 0.06, 2, 0.02),
    new THREE.MeshStandardMaterial({ color: '#2A201C', roughness: 0.9 }),
  )
  tab.position.y = 0.59
  g.add(tab)
  return g
}

const PEMBUAT: Record<CharmId, (d: MatWarna[]) => THREE.Group> = {
  klepon,
  'onde-onde': ondeOnde,
  'kue-lapis': lapis,
  'kue-lumpur': lumpur,
  serabi,
  secret: rahasia,
}

/**
 * Model charm 3D. Titik asal grup ada di tengah tinggi total (badan + ring),
 * badan menghadap +Z, tinggi total sekitar 1.2 unit.
 */
export function buatCharm(id: CharmId, opsi: { swatchKlepon?: boolean } = {}): Charm3 {
  const daftar: MatWarna[] = []
  const isi = id === 'klepon' && opsi.swatchKlepon ? klepon(daftar, true) : PEMBUAT[id](daftar)
  isi.position.y = -0.32
  isi.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
    }
  })
  const grup = new THREE.Group()
  grup.add(isi)

  const setWarna = (t: number) => {
    for (const d of daftar) {
      d.m.color.copy(d.gelap).lerp(d.warna, t)
      if ('sheen' in d.m && d.sheen > 0) d.m.sheen = d.sheen * t
    }
  }
  setWarna(1)
  return { grup, setWarna }
}
