// Badan manusia untuk adegan Jajan Dulu!: kerangka (titik sendi) dulu, lalu bentuk, lalu baju di atasnya.
// Satuan 1 unit = 10 cm. Badan menghadap +Z, kanan orang = -X. Titik asal `akar` = sendi pinggul (tengah panggul).
//
// Proporsi dipakai dari kanon figur 7,5 kepala (Loomis), dengan kepala perempuan dewasa ±21 cm:
//   puncak kepala 7,5 kepala dari lantai, dagu 6,5, garis bahu ±6,1, puting 5,5, siku dan pinggang 4,6,
//   pangkal paha 3,75 (separuh tinggi), lutut 2, mata di tengah tinggi kepala.
//   Lebar bahu ±2 kepala (pria 2,3), lebar pinggul ±1,7 kepala (pria 1,5), pinggang paling sempit di setinggi siku.
//   Lengan atas ±1,4 kepala, lengan bawah ±1,2 kepala, telapak + jari ±0,9 kepala; ujung jari menggantung di
//   tengah paha. Leher menurun dari belakang ke depan; dada paling depan di setinggi puting.
// Bentuk badan dibuat dengan loft: penampang superelips (antara elips dan kotak) di sejumlah ketinggian,
// diinterpolasi Catmull-Rom supaya garis tubuh mengalir tanpa sambungan. Baju adalah loft yang sama, sedikit
// lebih besar dan lebih longgar, jadi badan di bawahnya tidak perlu dirender sama sekali.
import * as THREE from 'three';
import { bahanKulit, letakkanJepit, type RigTangan } from './tubuh';

/** [y, lebar (X), tebal (Z), geser depan, kotak (2 = elips, makin besar makin kotak)] */
export type Cincin = [number, number, number, number?, number?];

const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/** Loft penampang superelips sepanjang Y. Normal mengarah keluar. `tutup` menutup ujung atas dengan kipas. */
export function loft(
  kunci: Cincin[],
  opsi: {
    keliling?: number;
    sela?: number;
    tutupAtas?: boolean;
    tutupBawah?: boolean;
    /** lipatan kain: n gelombang di keliling, amplitudo relatif, makin dalam ke arah ujung bawah di bawah `dari` */
    lipat?: { n: number; amp: number; dari: number };
    /** ujung bawah tidak rata: turun sejauh `depan` di tengah depan dan `belakang` di tengah belakang, mulai dari `dari` */
    kelim?: { depan: number; belakang: number; dari: number };
  } = {},
) {
  const { keliling = 48, sela = 6, tutupAtas = false, tutupBawah = false, lipat, kelim } = opsi;
  const yMin = kunci[0][0];
  const dalam = (y: number, dari: number) => THREE.MathUtils.clamp((dari - y) / (dari - yMin || 1), 0, 1);
  const k = kunci.map(([y, w, d, dz = 0, n = 2.4]) => [y, w, d, dz, n]);
  const baris: number[][] = [];
  for (let i = 0; i < k.length - 1; i++)
    for (let j = 0; j < sela; j++) {
      const t = j / sela;
      const a = k[Math.max(0, i - 1)];
      const b = k[i];
      const c = k[i + 1];
      const d = k[Math.min(k.length - 1, i + 2)];
      baris.push(b.map((_, f) => cr(a[f], b[f], c[f], d[f], t)));
    }
  baris.push(k[k.length - 1]);
  const pos: number[] = [];
  const uv: number[] = [];
  baris.forEach(([y, w, d, dz, n], r) => {
    for (let c = 0; c <= keliling; c++) {
      const a = (c / keliling) * Math.PI * 2;
      const co = Math.cos(a);
      const si = Math.sin(a);
      const x = (Math.sign(co) * Math.abs(co) ** (2 / n) * w) / 2;
      // bagian depan (+Z) ikut digeser `dz`, bagian belakang tidak: dada maju tanpa punggung ikut maju
      const z = (Math.sign(si) * Math.abs(si) ** (2 / n) * d) / 2 + dz * Math.max(0, si);
      let r = 1;
      if (lipat) r += lipat.amp * Math.sin(lipat.n * a) * dalam(y, lipat.dari) ** 1.5;
      const turun = kelim ? dalam(y, kelim.dari) * (kelim.depan * Math.max(0, si) ** 1.6 + kelim.belakang * Math.max(0, -si) ** 1.6) : 0;
      pos.push(x * r, y - turun, z * r);
      uv.push(c / keliling, r / (baris.length - 1));
    }
  });
  const idx: number[] = [];
  const L = keliling + 1;
  for (let r = 0; r < baris.length - 1; r++)
    for (let c = 0; c < keliling; c++) {
      const a = r * L + c;
      idx.push(a, a + L, a + 1, a + 1, a + L, a + L + 1);
    }
  const kipas = (r: number, atas: boolean) => {
    const pusat = pos.length / 3;
    const [y, , , dz] = baris[r];
    pos.push(0, y, dz * 0.5);
    uv.push(0.5, atas ? 1 : 0);
    for (let c = 0; c < keliling; c++) {
      const a = r * L + c;
      if (atas) idx.push(a, pusat, a + 1);
      else idx.push(a, a + 1, pusat);
    }
  };
  if (tutupAtas) kipas(baris.length - 1, true);
  if (tutupBawah) kipas(0, false);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Kain: sedikit kilap serat, dua sisi (tepi kelim terlihat dari dalam). */
export function bahanKain(warna: string, kilap = 0.35) {
  return new THREE.MeshPhysicalMaterial({ color: warna, roughness: 0.82, sheen: kilap, sheenRoughness: 0.7, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide });
}

export type OpsiBadan = {
  pria?: boolean;
  kulit?: string;
  baju: string;
  /** warna rok panjang; tanpa rok bila kosong (kaki dari rig kaki) */
  rok?: string;
  celemek?: string;
  jilbab?: string;
  rambut?: string;
  /** lengan bawah dan telapak sederhana yang ikut berayun (pejalan); kosongkan bila memakai rig tangan + IK */
  lenganSederhana?: boolean;
  /** penutup kepala (hanya tanpa jilbab) */
  aksesori?: 'peci' | 'topi' | 'caping';
  /** warna topi (bila aksesori topi) */
  warnaTopi?: string;
  /** tas selempang menyilang dada */
  tas?: string;
};

export type Badan = {
  akar: THREE.Group;
  /** poros di pinggul: putar X untuk membungkuk ke depan */
  batang: THREE.Group;
  kepala: THREE.Group;
  /** penanda sendi bahu [kanan, kiri] */
  bahu: [THREE.Object3D, THREE.Object3D];
  /** lengan baju atas [kanan, kiri]; tambahkan ke adegan bila memakai IK, lalu atur dengan `aturLenganAtas` */
  lenganAtas: [THREE.Group, THREE.Group];
  /** poros lengan sederhana [kanan, kiri] (hanya bila `lenganSederhana`) */
  ayun: [THREE.Group, THREE.Group] | null;
  /** panjang lengan atas (bahu ke siku) */
  LENGAN_ATAS: number;
  /** panjang yang disarankan untuk `buatTangan({ lengan })` (siku ke pergelangan) */
  LENGAN_BAWAH: number;
};

/** Lengan baju atas: loft dari bahu (y = 0) ke siku (y = -1), diskalakan ke panjang sebenarnya. */
function lenganBaju(bahan: THREE.Material, pria: boolean) {
  const g = new THREE.Group();
  const w = pria ? 1.15 : 1.0;
  const m = new THREE.Mesh(
    loft(
      [
        [-1.0, w * 0.82, w * 0.82, 0, 2],
        [-0.55, w * 0.9, w * 0.88, 0, 2],
        [-0.12, w * 1.05, w * 0.98, 0, 2],
        [0.05, w * 0.95, w * 0.9, 0, 2],
        [0.12, w * 0.4, w * 0.4, 0, 2],
      ],
      { keliling: 24, sela: 4, tutupAtas: true },
    ),
    bahan,
  );
  m.castShadow = true;
  m.name = 'kain';
  const siku = new THREE.Mesh(new THREE.SphereGeometry(w * 0.43, 16, 12), bahan);
  siku.name = 'siku';
  siku.castShadow = true;
  g.add(m, siku);
  return g;
}

/** Atur panjang lengan baju atas: kain direntang, bola siku dipindah ke ujung. */
function panjangLengan(g: THREE.Group, panjang: number) {
  g.getObjectByName('kain')!.scale.set(1, panjang, 1);
  g.getObjectByName('siku')!.position.y = -panjang;
}

export function buatBadan(o: OpsiBadan): Badan {
  const pria = !!o.pria;
  const kulit = bahanKulit(o.kulit ?? '#C68A62');
  const baju = bahanKain(o.baju);
  const akar = new THREE.Group();
  const batang = new THREE.Group();
  akar.add(batang);

  // Kepala (H) dan titik-titik kerangka relatif ke pinggul. Perempuan: tinggi 15,6, pinggul 7,8 dari lantai.
  const H = pria ? 2.3 : 2.08;
  const yBahu = pria ? 2.4 * H : 2.25 * H; // garis bahu di atas pinggul
  const lebarBahu = pria ? 2.3 * H : 2.0 * H;
  const yDagu = yBahu + (pria ? 0.32 : 0.45) * H;

  // --- baju atas: baju kurung longgar (perempuan) atau kemeja (pria), kelim di paha atas
  const atas: Cincin[] = pria
    ? [
        [-0.9, 3.7, 2.5, 0, 2.6],
        [0.2, 3.65, 2.45, 0, 2.6],
        [1.6, 3.5, 2.3, 0.05, 2.6],
        [3.2, 3.85, 2.45, 0.15, 2.6],
        [4.6, 4.1, 2.35, 0.05, 2.8],
        [yBahu - 0.15, lebarBahu - 0.6, 2.1, 0, 3.0],
        [yBahu + 0.3, 2.6, 1.7, -0.05, 2.4],
        [yBahu + 0.55, 1.35, 1.3, -0.05, 2],
      ]
    : [
        [-1.7, 3.9, 2.85, 0.05, 2.2],
        [-0.9, 3.8, 2.7, 0.05, 2.3],
        [0.3, 3.75, 2.6, 0, 2.4],
        [1.2, 3.35, 2.3, 0, 2.4],
        [1.9, 3.05, 2.15, 0.05, 2.4],
        [2.7, 3.2, 2.3, 0.12, 2.4],
        [3.4, 3.35, 2.5, 0.25, 2.4],
        [4.0, 3.45, 2.3, 0.12, 2.6],
        [yBahu - 0.12, lebarBahu - 0.55, 2.0, 0, 3.0],
        [yBahu + 0.3, 2.5, 1.65, -0.05, 2.4],
        [yBahu + 0.55, 1.3, 1.25, -0.05, 2],
      ];
  const badanBaju = new THREE.Mesh(loft(atas, { keliling: 72, sela: 6, lipat: pria ? { n: 7, amp: 0.02, dari: 0.6 } : { n: 9, amp: 0.035, dari: 1.4 } }), baju);
  batang.add(badanBaju);
  // lipatan kelim dan kancing depan memberi tanda bahwa ini kain, bukan badan
  const kelim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 56), baju);
  kelim.rotation.x = Math.PI / 2;
  kelim.scale.set(atas[0][1] / 2, atas[0][2] / 2 + 0.02, 1);
  kelim.position.set(0, atas[0][0] + 0.03, 0.03);
  batang.add(kelim);
  if (pria) {
    const kancing = new THREE.MeshStandardMaterial({ color: '#F2EDE2', roughness: 0.4 });
    for (let i = 0; i < 4; i++) {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), kancing);
      k.position.set(0, 0.6 + i * 1.05, 1.2 + (i === 2 ? 0.12 : 0.04));
      batang.add(k);
    }
  }

  // --- leher dan kepala
  const leher = new THREE.Mesh(new THREE.CylinderGeometry(0.42 * (pria ? 1.15 : 1), 0.5 * (pria ? 1.15 : 1), 0.9, 16), kulit);
  leher.position.set(0, yBahu + (pria ? 0.4 : 0.55), -0.05);
  leher.rotation.x = 0.15;
  batang.add(leher);
  const kepala = new THREE.Group();
  kepala.position.set(0, yDagu + H * 0.47, 0.05);
  batang.add(kepala);
  const tengkorak = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 30), kulit);
  tengkorak.scale.set(H * 0.36, H * 0.5, H * 0.43);
  // rahang menyempit ke dagu
  const pt = tengkorak.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pt.count; i++) {
    const y = pt.getY(i);
    if (y < 0) {
      const s = 1 - (-y) ** 2 * 0.28;
      pt.setX(i, pt.getX(i) * s);
      pt.setZ(i, pt.getZ(i) * (1 - (-y) ** 2 * 0.12));
    }
  }
  tengkorak.geometry.computeVertexNormals();
  kepala.add(tengkorak);
  // wajah: sederhana, sesuai gaya tangan (lilin), tapi cukup untuk terbaca sebagai wajah
  const gelap = new THREE.MeshStandardMaterial({ color: '#2A1C16', roughness: 0.5 });
  const zW = H * 0.43;
  for (const s of [-1, 1]) {
    const mata = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), gelap);
    mata.scale.set(1, 1.25, 0.6);
    mata.position.set(s * H * 0.14, 0, zW * 0.93);
    const alis = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.2, 2, 6), new THREE.MeshStandardMaterial({ color: o.rambut ?? '#2A1C16', roughness: 0.8 }));
    alis.rotation.z = Math.PI / 2 + s * 0.12;
    alis.position.set(s * H * 0.14, H * 0.1, zW * 0.92);
    const pipi = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshBasicMaterial({ color: '#E08A7A', transparent: true, opacity: 0.35 }));
    pipi.position.set(s * H * 0.19, -H * 0.12, zW * 0.86);
    pipi.rotation.y = s * 0.5;
    kepala.add(mata, alis, pipi);
    const telinga = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), kulit);
    telinga.scale.set(0.5, 1, 0.8);
    telinga.position.set(s * H * 0.35, 0, -0.05);
    if (!o.jilbab) kepala.add(telinga);
  }
  const hidung = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), kulit);
  hidung.scale.set(0.9, 1.1, 1);
  hidung.position.set(0, -H * 0.12, zW * 0.98);
  const mulut = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.18, 2, 8), new THREE.MeshStandardMaterial({ color: '#8A3E36', roughness: 0.6 }));
  mulut.rotation.z = Math.PI / 2;
  mulut.position.set(0, -H * 0.27, zW * 0.88);
  kepala.add(hidung, mulut);

  // --- penutup kepala: jilbab (tudung + juntai menutup bahu dan dada) atau rambut
  if (o.jilbab) {
    const kain = bahanKain(o.jilbab, 0.45);
    const r = 1.08;
    // tudung: puncak utuh, sisi dan belakang dengan bukaan wajah di depan
    const puncak = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 12, 0, Math.PI * 2, 0, Math.PI * 0.3), kain);
    const sisi = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 18, Math.PI / 2 + 0.72, Math.PI * 2 - 1.44, Math.PI * 0.3, Math.PI * 0.55), kain);
    for (const m of [puncak, sisi]) {
      m.scale.set(H * 0.36 * r, H * 0.5 * r, H * 0.43 * r);
      m.position.y = 0.04;
      kepala.add(m);
    }
    // juntai: dari bawah dagu melebar menutup bahu, sedikit maju di dada
    const juntai = new THREE.Mesh(
      loft(
        [
          [yBahu - 1.0, 3.6, 2.75, 0.22, 2.2],
          [yBahu - 0.5, 3.75, 2.75, 0.15, 2.3],
          [yBahu + 0.05, lebarBahu + 0.1, 2.55, 0.05, 2.6],
          [yBahu + 0.45, 2.7, 2.15, 0.05, 2.2],
          [yBahu + 0.9, 1.75, 1.95, 0.05, 2],
          [yDagu + 0.35, 1.55, 1.85, 0.0, 2],
        ],
        { keliling: 72, sela: 6, lipat: { n: 8, amp: 0.03, dari: yBahu }, kelim: { depan: 1.0, belakang: 0.45, dari: yBahu - 0.2 } },
      ),
      kain,
    );
    juntai.castShadow = true;
    batang.add(juntai);
  } else {
    const rambut = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: o.rambut ?? '#1E1612', roughness: 0.85 }));
    rambut.scale.set(H * 0.38, H * 0.52, H * 0.45);
    rambut.position.set(0, 0.05, -0.06);
    rambut.rotation.x = -0.25;
    kepala.add(rambut);
    // poni tipis di dahi supaya rambut tidak terlihat seperti helm
    const poni = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 8, -1.1, 2.2, 0, Math.PI * 0.18), rambut.material);
    poni.scale.set(H * 0.4, H * 0.5, H * 0.47);
    poni.position.set(0, 0.08, 0);
    poni.rotation.x = 0.55;
    kepala.add(poni);
    if (o.aksesori === 'peci') {
      const peci = new THREE.Mesh(new THREE.CylinderGeometry(H * 0.36, H * 0.39, H * 0.34, 32), new THREE.MeshStandardMaterial({ color: '#141114', roughness: 0.75 }));
      peci.position.set(0, H * 0.4, -0.05);
      peci.rotation.x = -0.12;
      kepala.add(peci);
    } else if (o.aksesori === 'topi') {
      const bahanTopi = new THREE.MeshStandardMaterial({ color: o.warnaTopi ?? '#2E4A7A', roughness: 0.7 });
      const kubah = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), bahanTopi);
      kubah.scale.set(H * 0.4, H * 0.36, H * 0.46);
      kubah.position.set(0, H * 0.14, -0.04);
      const pet = new THREE.Mesh(new THREE.CylinderGeometry(H * 0.32, H * 0.32, 0.05, 24, 1, false, -Math.PI / 2, Math.PI), bahanTopi);
      pet.scale.set(1, 1, 1.4);
      pet.position.set(0, H * 0.16, H * 0.3);
      pet.rotation.x = 0.12;
      kepala.add(kubah, pet);
    } else if (o.aksesori === 'caping') {
      const caping = new THREE.Mesh(new THREE.ConeGeometry(H * 1.05, H * 0.5, 36, 1, true), new THREE.MeshStandardMaterial({ color: '#C9A86A', roughness: 0.9, side: THREE.DoubleSide }));
      caping.position.set(0, H * 0.55, 0);
      kepala.add(caping);
    }
  }

  // --- tas selempang: tali menyilang dari bahu kiri ke pinggul kanan, kantong kecil di sisi
  if (o.tas) {
    const bahanTas = new THREE.MeshStandardMaterial({ color: o.tas, roughness: 0.7 });
    const tali = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-lebarBahu * 0.36, yBahu + 0.15, 0.4),
          new THREE.Vector3(-lebarBahu * 0.15, yBahu - 0.6, 1.42),
          new THREE.Vector3(lebarBahu * 0.25, yBahu - 2.4, 1.38),
          new THREE.Vector3(lebarBahu * 0.5, yBahu - 3.4, 0.7),
        ]),
        24,
        0.09,
        6,
        false,
      ),
      bahanTas,
    );
    const kantong = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.45), bahanTas);
    kantong.position.set(lebarBahu * 0.55, yBahu - 3.9, 0.55);
    kantong.rotation.y = 0.5;
    batang.add(tali, kantong);
  }

  // --- rok panjang dan celemek
  if (o.rok) {
    // cincin penutup di dalam kelim baju: dari bawah (kolong meja) bagian dalam baju tidak terlihat berongga
    const [yk, wk, dk] = atas[0];
    const tutup = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 56), baju);
    tutup.rotation.x = Math.PI / 2;
    tutup.scale.set(wk / 2, dk / 2 + 0.05, 1);
    tutup.position.set(0, yk + 0.15, 0.03);
    batang.add(tutup);
    const rok = new THREE.Mesh(
      loft(
        [
          [-7.75, 3.85, 3.15, 0.05, 2.2],
          [-5.5, 3.65, 2.95, 0.05, 2.2],
          [-3.0, 3.5, 2.75, 0.05, 2.3],
          [-1.0, 3.6, 2.6, 0, 2.4],
          [0.3, 3.5, 2.45, 0, 2.4],
        ],
        { keliling: 72, sela: 5, lipat: { n: 12, amp: 0.04, dari: -1.0 } },
      ),
      bahanKain(o.rok),
    );
    rok.castShadow = true;
    akar.add(rok);
  }
  if (o.celemek) {
    // celemek mengikuti lengkung depan baju: z dihitung dari tebal loft di tiap ketinggian
    const geo = new THREE.PlaneGeometry(2.5, 5.6, 20, 24);
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const yAsli = p.getY(i) - 1.0; // atas di 1,8 (pinggang), bawah di -3,8
      // sudut bawah membulat: titik di dekat tepi bawah terangkat makin ke samping
      const y = yAsli + (Math.abs(x) / 1.25) ** 4 * 0.6 * THREE.MathUtils.clamp((-2.2 - yAsli) / 1.6, 0, 1);
      // di atas kelim baju menempel di baju, di bawahnya maju melewati lipatan rok supaya rok tidak menembus
      const depan = 1.42 + Math.max(0, 1.9 - y) * 0.03 + (y > 1.9 ? 0.1 : 0) + THREE.MathUtils.clamp((-1.2 - y) / 1.0, 0, 1) * 0.4;
      // kerutan dari tali pinggang yang melebar ke bawah
      const kerut = Math.sin(x * 7.5) * 0.015 * THREE.MathUtils.clamp((1.9 - y) / 3, 0.2, 1);
      p.setXYZ(i, x * (y > 1.4 ? 0.9 : 1), y, depan + 0.06 - (x / 1.4) ** 2 * 0.25 + kerut);
    }
    geo.computeVertexNormals();
    const celemek = new THREE.Mesh(geo, bahanKain(o.celemek, 0.2));
    celemek.castShadow = true;
    batang.add(celemek);
    const tali = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 6, 48), bahanKain(o.celemek, 0.2));
    tali.rotation.x = Math.PI / 2;
    tali.scale.set(1.57, 1.12, 1);
    tali.position.y = 1.85;
    batang.add(tali);
  }

  // --- bahu dan lengan baju atas
  const bahu: [THREE.Object3D, THREE.Object3D] = [new THREE.Object3D(), new THREE.Object3D()];
  bahu[0].position.set(-(lebarBahu / 2 - 0.55), yBahu - 0.3, -0.05);
  bahu[1].position.set(lebarBahu / 2 - 0.55, yBahu - 0.3, -0.05);
  batang.add(...bahu);
  const lenganAtas: [THREE.Group, THREE.Group] = [lenganBaju(baju, pria), lenganBaju(baju, pria)];
  const LENGAN_ATAS = 1.4 * H;
  const LENGAN_BAWAH = 1.15 * H;
  let ayun: [THREE.Group, THREE.Group] | null = null;
  if (o.lenganSederhana) {
    ayun = [new THREE.Group(), new THREE.Group()];
    ayun.forEach((p, i) => {
      p.position.copy(bahu[i].position);
      const la = lenganAtas[i];
      panjangLengan(la, LENGAN_ATAS);
      p.add(la);
      // lengan bawah dan telapak dalam satu loft kulit, sedikit menekuk ke depan di siku
      const siku = new THREE.Group();
      siku.name = 'siku';
      siku.position.y = -LENGAN_ATAS;
      siku.rotation.x = -0.25;
      const bawah = new THREE.Mesh(
        loft(
          [
            [-LENGAN_BAWAH - 0.05, 0.42, 0.32, 0, 2],
            [-LENGAN_BAWAH, 0.5, 0.36, 0, 2.2],
            [-LENGAN_BAWAH * 0.6, 0.62, 0.55, 0, 2],
            [0, 0.72, 0.68, 0, 2],
            [0.15, 0.3, 0.3, 0, 2],
          ],
          { keliling: 20, sela: 4, tutupAtas: true, tutupBawah: true },
        ),
        kulit,
      );
      bawah.castShadow = true;
      siku.add(bawah);
      // tangan: telapak, empat jari yang sedikit menekuk, dan ibu jari menghadap depan
      const tangan = new THREE.Group();
      tangan.name = 'tangan';
      tangan.position.y = -LENGAN_BAWAH - 0.05;
      const telapak = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), kulit);
      telapak.scale.set(0.27, 0.36, 0.15);
      telapak.position.y = -0.3;
      tangan.add(telapak);
      const sisiLuar = i ? 1 : -1;
      for (let j = 0; j < 4; j++) {
        const jari = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.32 - Math.abs(j - 1.5) * 0.05, 3, 8), kulit);
        const ruas = new THREE.Group();
        ruas.position.set((j - 1.5) * 0.13 * sisiLuar, -0.62, 0);
        ruas.rotation.x = 0.45;
        jari.position.y = -0.2;
        ruas.add(jari);
        tangan.add(ruas);
      }
      const jempol = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.26, 3, 8), kulit);
      jempol.position.set(-0.2 * sisiLuar, -0.32, 0.12);
      jempol.rotation.set(0.5, 0, -0.6 * sisiLuar);
      tangan.add(jempol);
      tangan.traverse((m) => ((m as THREE.Mesh).isMesh ? ((m as THREE.Mesh).castShadow = true) : null));
      siku.add(tangan);
      p.add(siku);
      batang.add(p);
    });
  }

  akar.traverse((m) => {
    if ((m as THREE.Mesh).isMesh) m.castShadow = true;
  });
  return { akar, batang, kepala, bahu, lenganAtas, ayun, LENGAN_ATAS, LENGAN_BAWAH };
}

/** Bentangkan lengan baju atas (berada langsung di adegan) dari sendi bahu ke titik siku, dalam koordinat dunia. */
export function aturLenganAtas(badan: Badan, i: 0 | 1, siku: THREE.Vector3) {
  const bahu = badan.bahu[i].getWorldPosition(new THREE.Vector3());
  const la = badan.lenganAtas[i];
  const ruas = siku.clone().sub(bahu);
  la.position.copy(bahu);
  la.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), ruas.clone().normalize());
  // skala dunia: badan bisa diskalakan, lengan baju di adegan tidak
  const k = badan.akar.getWorldScale(new THREE.Vector3()).x;
  la.scale.setScalar(k);
  panjangLengan(la, ruas.length() / k);
}

/** Posisi siku dari IK dua tulang: bahu S, ujung T, panjang lengan atas a dan sisa (siku ke titik jepit) b. */
export function sikuIK(S: THREE.Vector3, T: THREE.Vector3, a: number, b: number, kutub: THREE.Vector3) {
  const arah = T.clone().sub(S);
  const d = THREE.MathUtils.clamp(arah.length(), Math.abs(a - b) + 1e-3, (a + b) * 0.999);
  arah.normalize();
  const x = (a * a - b * b + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const k = kutub.clone().addScaledVector(arah, -kutub.dot(arah)).normalize();
  return S.clone().addScaledVector(arah, x).addScaledVector(k, h);
}

/**
 * Lengan lengkap: rig tangan (siku ke jari, dari tubuh.ts) diletakkan supaya titik jepitnya di `T`, sikunya dari IK
 * dua tulang terhadap bahu badan, lalu lengan baju atas dibentangkan dari bahu ke siku. Rig harus anak langsung adegan.
 * `kutub` = arah tekukan siku (biasanya ke bawah, ke luar, dan ke belakang).
 */
export function raih(badan: Badan, i: 0 | 1, rig: RigTangan, T: THREE.Vector3, putar: number, kutub: THREE.Vector3) {
  badan.akar.updateWorldMatrix(true, true);
  const bahu = badan.bahu[i].getWorldPosition(new THREE.Vector3());
  const k = badan.akar.getWorldScale(new THREE.Vector3()).x;
  letakkanJepit(rig, T, T.clone().sub(bahu), putar);
  const sisa = rig.akar.getWorldPosition(new THREE.Vector3()).distanceTo(T);
  const siku = sikuIK(bahu, T, badan.LENGAN_ATAS * k, sisa, kutub);
  letakkanJepit(rig, T, T.clone().sub(siku), putar);
  aturLenganAtas(badan, i, rig.akar.getWorldPosition(new THREE.Vector3()));
}
