// Rig tubuh untuk adegan Jajan Dulu!: tangan dan kaki dengan rangka (forward kinematics) dan IK dua tulang.
// Dibangun sekali; tiap frame hanya memutar sendi, jadi tidak ada geometri baru per frame.
//
// Satuan: 1 unit = 10 cm. Tangan dewasa panjang Â±19 cm (pergelangan sampai ujung jari tengah) = 1,9 unit
// tidak dipakai di sini karena tangan di adegan tampah memakai skala charm (charm 6 cm = 1 unit). Proporsi di
// bawah relatif: panjang jari tengah â‰ˆ 0,9 Ã— panjang telapak, ruas jari 1 : 0,62 : 0,48 (proksimal : tengah : distal).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// ---------------------------------------------------------------------------------------------------------------
// Bahan

export function bahanKulit(warna = '#D99C76') {
  return new THREE.MeshPhysicalMaterial({
    color: warna,
    roughness: 0.52,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#ffd2b8'),
    clearcoat: 0.06,
    side: THREE.DoubleSide,
  });
}

/** Kapsul meruncing (lebih besar di pangkal) sepanjang +Y dari 0 sampai `panjang`. */
function ruasRuncing(panjang: number, rPangkal: number, rUjung: number, bahan: THREE.Material) {
  const n = 10;
  const titik: THREE.Vector2[] = [];
  // Setengah bola di pangkal, badan meruncing, setengah bola di ujung: profil lathe yang mulus.
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * (Math.PI / 2);
    titik.push(new THREE.Vector2(Math.cos(a) * rPangkal, Math.sin(a) * rPangkal));
  }
  for (let i = 1; i <= n; i++) {
    const a = (i / n) * (Math.PI / 2);
    titik.push(new THREE.Vector2(Math.cos(a) * rUjung, panjang + Math.sin(a) * rUjung));
  }
  const m = new THREE.Mesh(new THREE.LatheGeometry(titik, 20), bahan);
  m.castShadow = true;
  return m;
}

// ---------------------------------------------------------------------------------------------------------------
// Tangan

export type Jari = 'telunjuk' | 'tengah' | 'manis' | 'kelingking';
const JARI: Jari[] = ['telunjuk', 'tengah', 'manis', 'kelingking'];

/** Sudut tekuk satu jari (radian): MCP (pangkal), PIP (tengah); DIP mengikuti 0,7 Ã— PIP seperti tendon asli. */
export type TekukJari = { mcp: number; pip: number; rentang?: number };
export type PoseTangan = {
  jari: Record<Jari, TekukJari>;
  /** ibu jari: aduksi (mendekat ke telapak), oposisi (memutar menghadap jari), tekuk MCP, tekuk IP */
  jempol: { aduksi: number; oposisi: number; mcp: number; ip: number };
  /** pergelangan: tekuk ke arah telapak (+) / punggung tangan (-), dan miring ke arah kelingking/jempol */
  pergelangan: { tekuk: number; miring: number };
};

export const POSE: Record<'rileks' | 'jepit' | 'pegang' | 'terbuka' | 'kepal', PoseTangan> = {
  rileks: {
    jari: {
      telunjuk: { mcp: 0.25, pip: 0.35, rentang: 0.05 },
      tengah: { mcp: 0.3, pip: 0.42 },
      manis: { mcp: 0.38, pip: 0.5, rentang: -0.04 },
      kelingking: { mcp: 0.45, pip: 0.58, rentang: -0.1 },
    },
    jempol: { aduksi: 0.35, oposisi: 0.35, mcp: 0.15, ip: 0.2 },
    pergelangan: { tekuk: 0.1, miring: 0 },
  },
  // Menjepit dengan ujung telunjuk dan ibu jari; jari lain terlipat santai ke telapak.
  jepit: {
    jari: {
      telunjuk: { mcp: 0.62, pip: 0.62, rentang: 0.02 },
      tengah: { mcp: 0.95, pip: 1.25 },
      manis: { mcp: 1.1, pip: 1.35, rentang: -0.03 },
      kelingking: { mcp: 1.2, pip: 1.4, rentang: -0.08 },
    },
    jempol: { aduksi: 0.62, oposisi: 0.95, mcp: 0.3, ip: 0.25 },
    pergelangan: { tekuk: 0.15, miring: 0.1 },
  },
  // Memegang bibir tampah: semua jari menekuk sedang, ibu jari di atas.
  pegang: {
    jari: {
      telunjuk: { mcp: 0.75, pip: 0.9 },
      tengah: { mcp: 0.8, pip: 0.95 },
      manis: { mcp: 0.85, pip: 1.0 },
      kelingking: { mcp: 0.9, pip: 1.05, rentang: -0.06 },
    },
    jempol: { aduksi: 0.2, oposisi: 0.5, mcp: 0.1, ip: 0.1 },
    pergelangan: { tekuk: -0.2, miring: 0 },
  },
  terbuka: {
    jari: {
      telunjuk: { mcp: 0.05, pip: 0.08, rentang: 0.12 },
      tengah: { mcp: 0.05, pip: 0.08 },
      manis: { mcp: 0.08, pip: 0.1, rentang: -0.1 },
      kelingking: { mcp: 0.1, pip: 0.12, rentang: -0.22 },
    },
    jempol: { aduksi: 0.05, oposisi: 0.15, mcp: 0.05, ip: 0.05 },
    pergelangan: { tekuk: -0.05, miring: 0 },
  },
  kepal: {
    jari: {
      telunjuk: { mcp: 1.4, pip: 1.6 },
      tengah: { mcp: 1.45, pip: 1.65 },
      manis: { mcp: 1.5, pip: 1.65 },
      kelingking: { mcp: 1.5, pip: 1.6 },
    },
    jempol: { aduksi: 0.8, oposisi: 1.0, mcp: 0.6, ip: 0.5 },
    pergelangan: { tekuk: 0.1, miring: 0 },
  },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Campur dua pose (t 0..1). */
export function campurPose(a: PoseTangan, b: PoseTangan, t: number): PoseTangan {
  const jari = {} as Record<Jari, TekukJari>;
  for (const j of JARI)
    jari[j] = { mcp: lerp(a.jari[j].mcp, b.jari[j].mcp, t), pip: lerp(a.jari[j].pip, b.jari[j].pip, t), rentang: lerp(a.jari[j].rentang ?? 0, b.jari[j].rentang ?? 0, t) };
  return {
    jari,
    jempol: {
      aduksi: lerp(a.jempol.aduksi, b.jempol.aduksi, t),
      oposisi: lerp(a.jempol.oposisi, b.jempol.oposisi, t),
      mcp: lerp(a.jempol.mcp, b.jempol.mcp, t),
      ip: lerp(a.jempol.ip, b.jempol.ip, t),
    },
    pergelangan: { tekuk: lerp(a.pergelangan.tekuk, b.pergelangan.tekuk, t), miring: lerp(a.pergelangan.miring, b.pergelangan.miring, t) },
  };
}

type SendiJari = { mcp: THREE.Group; pip: THREE.Group; dip: THREE.Group };
export type RigTangan = {
  /** titik asal = sendi siku; lengan bawah mengarah +Y ke pergelangan */
  akar: THREE.Group;
  pergelangan: THREE.Group;
  jari: Record<Jari, SendiJari>;
  jempol: { abduksi: THREE.Group; fleksi: THREE.Group; puntir: THREE.Group; mcp: THREE.Group; ip: THREE.Group };
  ujungTelunjuk: THREE.Object3D;
  ujungJempol: THREE.Object3D;
  /** panjang lengan bawah dari siku ke pergelangan */
  lengan: number;
};

/**
 * Tangan kanan menghadap: jari ke +Y, punggung tangan ke +Z, telapak ke -Z, ibu jari ke +X.
 * `sisi = -1` membuat tangan kiri (dicerminkan di X; bahan DoubleSide supaya permukaan tetap terlihat).
 * Proporsi telapak 1 (lebar 0,85) dengan jari tengah 0,9.
 */
export function buatTangan(sisi: 1 | -1 = 1, opsi: { kulit?: string; lengan?: number; lenganBaju?: string; skala?: number } = {}): RigTangan {
  const kulit = bahanKulit(opsi.kulit);
  const ujungKulit = bahanKulit('#E2A486');
  const kuku = new THREE.MeshPhysicalMaterial({ color: '#F2C9BC', roughness: 0.3, clearcoat: 0.6, side: THREE.DoubleSide });
  const panjangLengan = opsi.lengan ?? 2.4;

  const akar = new THREE.Group();
  const k = opsi.skala ?? 1;
  akar.scale.set(sisi * k, k, k);

  // Lengan bawah: meruncing dari siku ke pergelangan, sedikit pipih (radius dan ulna).
  const lengan = ruasRuncing(panjangLengan, 0.27, 0.19, kulit);
  lengan.scale.z = 0.78;
  akar.add(lengan);
  if (opsi.lenganBaju) {
    const baju = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, panjangLengan * 0.55, 24, 1, true), new THREE.MeshStandardMaterial({ color: opsi.lenganBaju, roughness: 0.95, side: THREE.DoubleSide }));
    baju.position.y = panjangLengan * 0.22;
    akar.add(baju);
  }

  const pergelangan = new THREE.Group();
  pergelangan.position.y = panjangLengan;
  akar.add(pergelangan);

  // Telapak: kotak membulat yang pipih, menyempit ke arah pergelangan dan sedikit cekung di sisi telapak.
  const geoTelapak = new RoundedBoxGeometry(0.84, 0.95, 0.28, 8, 0.135);
  const pt = geoTelapak.attributes.position;
  for (let i = 0; i < pt.count; i++) {
    const v = (pt.getY(i) + 0.475) / 0.95; // 0 di pergelangan, 1 di pangkal jari
    const x = pt.getX(i) * (0.78 + 0.22 * v);
    const z = pt.getZ(i) < 0 ? pt.getZ(i) * (1 - 0.25 * Math.sin(v * Math.PI) * (1 - Math.abs(x) / 0.42)) : pt.getZ(i);
    pt.setXYZ(i, x, pt.getY(i), z);
  }
  geoTelapak.computeVertexNormals();
  const telapak = new THREE.Mesh(geoTelapak, kulit);
  telapak.position.set(0, 0.5, 0);
  telapak.castShadow = true;
  pergelangan.add(telapak);
  const bantal = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.6, 6, 16), kulit);
  bantal.rotation.z = Math.PI / 2;
  bantal.position.set(-0.02, 0.88, -0.03);
  bantal.scale.z = 0.9;
  pergelangan.add(bantal);
  const thenar = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), kulit);
  thenar.scale.set(0.18, 0.28, 0.14);
  thenar.position.set(0.25, 0.32, -0.06);
  thenar.rotation.z = -0.4;
  pergelangan.add(thenar);
  const hipotenar = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), kulit);
  hipotenar.scale.set(0.14, 0.3, 0.12);
  hipotenar.position.set(-0.3, 0.42, -0.04);
  pergelangan.add(hipotenar);

  // Jari: pangkal, panjang ruas, dan radius.
  const UKUR: Record<Jari, { x: number; y: number; p: [number, number, number]; r: number; arah: number }> = {
    telunjuk: { x: 0.27, y: 0.98, p: [0.42, 0.26, 0.2], r: 0.085, arah: 0.06 },
    tengah: { x: 0.08, y: 1.02, p: [0.47, 0.3, 0.21], r: 0.088, arah: 0 },
    manis: { x: -0.11, y: 0.98, p: [0.43, 0.28, 0.2], r: 0.082, arah: -0.05 },
    kelingking: { x: -0.29, y: 0.9, p: [0.33, 0.21, 0.17], r: 0.072, arah: -0.13 },
  };

  const jari = {} as Record<Jari, SendiJari>;
  let ujungTelunjuk: THREE.Object3D = new THREE.Object3D();
  for (const j of JARI) {
    const u = UKUR[j];
    const mcp = new THREE.Group();
    mcp.position.set(u.x, u.y, 0);
    mcp.rotation.z = -u.arah;
    pergelangan.add(mcp);
    const ruas1 = ruasRuncing(u.p[0], u.r, u.r * 0.92, kulit);
    mcp.add(ruas1);
    const pip = new THREE.Group();
    pip.position.y = u.p[0];
    mcp.add(pip);
    pip.add(ruasRuncing(u.p[1], u.r * 0.92, u.r * 0.85, kulit));
    const dip = new THREE.Group();
    dip.position.y = u.p[1];
    pip.add(dip);
    dip.add(ruasRuncing(u.p[2] - u.r * 0.6, u.r * 0.85, u.r * 0.78, ujungKulit));
    // Kuku di punggung ruas ujung.
    const k = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), kuku);
    k.scale.set(u.r * 0.75, u.p[2] * 0.42, u.r * 0.25);
    k.position.set(0, u.p[2] * 0.62, u.r * 0.72);
    dip.add(k);
    const ujung = new THREE.Object3D();
    ujung.position.set(0, u.p[2] - u.r * 0.1, -u.r * 0.35);
    dip.add(ujung);
    if (j === 'telunjuk') ujungTelunjuk = ujung;
    jari[j] = { mcp, pip, dip };
  }

  // Ibu jari: sendi CMC di pangkal telapak sisi +X. CMC dipecah jadi tiga sendi berurutan supaya tidak bergantung
  // pada urutan Euler: abduksi (menjauh dari telunjuk), fleksi (ke depan telapak), lalu puntir (memutar kuku).
  const cmcAbduksi = new THREE.Group();
  cmcAbduksi.position.set(0.3, 0.2, -0.06);
  pergelangan.add(cmcAbduksi);
  const cmcFleksi = new THREE.Group();
  cmcAbduksi.add(cmcFleksi);
  const cmc = new THREE.Group();
  cmcFleksi.add(cmc);
  cmc.add(ruasRuncing(0.36, 0.13, 0.11, kulit));
  const mcpJ = new THREE.Group();
  mcpJ.position.y = 0.36;
  cmc.add(mcpJ);
  mcpJ.add(ruasRuncing(0.27, 0.105, 0.095, kulit));
  const ip = new THREE.Group();
  ip.position.y = 0.27;
  mcpJ.add(ip);
  ip.add(ruasRuncing(0.19, 0.095, 0.085, ujungKulit));
  const kukuJ = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), kuku);
  kukuJ.scale.set(0.07, 0.1, 0.025);
  kukuJ.position.set(0, 0.16, 0.08);
  ip.add(kukuJ);
  const ujungJempol = new THREE.Object3D();
  ujungJempol.position.set(0, 0.24, -0.04);
  ip.add(ujungJempol);

  return { akar, pergelangan, jari, jempol: { abduksi: cmcAbduksi, fleksi: cmcFleksi, puntir: cmc, mcp: mcpJ, ip }, ujungTelunjuk, ujungJempol, lengan: panjangLengan };
}

/** Terapkan pose. Fleksi = menekuk ke arah telapak (-Z) = rotasi X negatif. */
export function aturTangan(rig: RigTangan, pose: PoseTangan) {
  rig.pergelangan.rotation.set(-pose.pergelangan.tekuk, 0, pose.pergelangan.miring);
  for (const j of JARI) {
    const t = pose.jari[j];
    const s = rig.jari[j];
    const dasar = { telunjuk: -0.06, tengah: 0, manis: 0.05, kelingking: 0.13 }[j];
    s.mcp.rotation.set(-t.mcp, 0, dasar + (t.rentang ?? 0));
    s.pip.rotation.x = -t.pip;
    s.dip.rotation.x = -t.pip * 0.7;
  }
  const j = pose.jempol;
  // Istirahat: ibu jari condong Â±40Â° ke luar dari arah jari, sedikit di depan bidang telapak, kuku menghadap samping.
  // Aduksi merapatkan ke telunjuk; oposisi membawa ibu jari ke depan telapak dan memutar bantalannya ke arah jari.
  rig.jempol.abduksi.rotation.z = -0.75 + j.aduksi * 0.55;
  rig.jempol.fleksi.rotation.x = -0.2 - j.oposisi * 0.85;
  rig.jempol.puntir.rotation.y = -0.55 - j.oposisi * 0.75;
  rig.jempol.mcp.rotation.x = -j.mcp;
  rig.jempol.ip.rotation.x = -j.ip;
}

/**
 * Solver jepit: setelah pose diterapkan, geser sendi ibu jari (abduksi, fleksi, MCP, IP) dengan penurunan
 * koordinat sampai bantalan ujung ibu jari menyentuh bantalan ujung telunjuk. `kuat` 0..1 mencampur hasilnya.
 */
export function kunciJepit(rig: RigTangan, kuat = 1) {
  if (kuat <= 0) return;
  const sendi: [THREE.Object3D, 'x' | 'z', number, number][] = [
    [rig.jempol.abduksi, 'z', -1.2, 0.2],
    [rig.jempol.fleksi, 'x', -1.6, 0.2],
    [rig.jempol.mcp, 'x', -1.0, 0.2],
    [rig.jempol.ip, 'x', -1.2, 0.2],
  ];
  const awal = sendi.map(([o, s]) => o.rotation[s]);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const jarak = () => {
    rig.pergelangan.updateWorldMatrix(true, true);
    rig.ujungTelunjuk.getWorldPosition(a);
    rig.ujungJempol.getWorldPosition(b);
    return a.distanceTo(b);
  };
  let langkah = 0.2;
  let terbaik = jarak();
  for (let iter = 0; iter < 60 && terbaik > 0.02; iter++) {
    let membaik = false;
    for (const [o, s, min, maks] of sendi) {
      for (const arah of [1, -1]) {
        const lama = o.rotation[s];
        o.rotation[s] = THREE.MathUtils.clamp(lama + arah * langkah, min, maks);
        const d = jarak();
        if (d < terbaik) {
          terbaik = d;
          membaik = true;
          break;
        }
        o.rotation[s] = lama;
      }
    }
    if (!membaik) langkah *= 0.5;
  }
  sendi.forEach(([o, s], i) => (o.rotation[s] = lerp(awal[i], o.rotation[s], kuat)));
}

/** Titik tengah antara ujung telunjuk dan ujung ibu jari, di ruang dunia. */
export function titikJepit(rig: RigTangan, keluar = new THREE.Vector3()) {
  rig.akar.updateWorldMatrix(true, true);
  const a = rig.ujungTelunjuk.getWorldPosition(new THREE.Vector3());
  const b = rig.ujungJempol.getWorldPosition(new THREE.Vector3());
  return keluar.copy(a).add(b).multiplyScalar(0.5);
}

/**
 * Letakkan tangan supaya titik jepitnya tepat di `target`, dengan arah lengan dari `asalSiku`.
 * Lengan diputar menghadap target lebih dulu, lalu digeser sisa selisihnya.
 */
export function letakkanJepit(rig: RigTangan, target: THREE.Vector3, arahLengan: THREE.Vector3, putarSumbu = 0) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), arahLengan.clone().normalize());
  rig.akar.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), putarSumbu));
  rig.akar.position.set(0, 0, 0);
  const sekarang = titikJepit(rig);
  const induk = rig.akar.parent;
  const targetLokal = induk ? induk.worldToLocal(target.clone()) : target.clone();
  const sekarangLokal = induk ? induk.worldToLocal(sekarang.clone()) : sekarang;
  rig.akar.position.add(targetLokal.sub(sekarangLokal));
}

// ---------------------------------------------------------------------------------------------------------------
// Kaki dengan IK dua tulang dan siklus jalan

export type RigKaki = {
  akar: THREE.Group;
  paha: THREE.Group;
  lutut: THREE.Group;
  pergelangan: THREE.Group;
  jariKaki: THREE.Group;
  sandal: THREE.Group;
  panjangPaha: number;
  panjangBetis: number;
};

/**
 * Satu kaki dari pinggul. Kaki menghadap +Z. Panjang paha 4,4 dan betis 4,2 (unit 10 cm),
 * telapak 2,5 dengan sandal jepit warna `warnaSandal`.
 */
export function buatKaki(warnaSandal: string, opsi: { kulit?: string; celana?: string } = {}): RigKaki {
  const kulit = bahanKulit(opsi.kulit ?? '#C98E66');
  const PAHA = 4.4;
  const BETIS = 4.2;
  const akar = new THREE.Group();
  const paha = new THREE.Group();
  akar.add(paha);
  // Paha dan betis menggantung ke -Y.
  const tulangPaha = ruasRuncing(PAHA, 0.62, 0.42, opsi.celana ? new THREE.MeshStandardMaterial({ color: opsi.celana, roughness: 0.9 }) : kulit);
  tulangPaha.rotation.x = Math.PI;
  paha.add(tulangPaha);
  const lutut = new THREE.Group();
  lutut.position.y = -PAHA;
  paha.add(lutut);
  // Betis: profil dengan tonjolan otot betis di belakang atas.
  const profil: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const r = 0.36 + 0.12 * Math.sin(Math.min(1, t * 1.6) * Math.PI) * (t < 0.62 ? 1 : 0) - 0.14 * t;
    profil.push(new THREE.Vector2(Math.max(0.2, r), -t * BETIS));
  }
  const betis = new THREE.Mesh(new THREE.LatheGeometry(profil, 24), kulit);
  betis.scale.z = 0.92;
  betis.castShadow = true;
  lutut.add(betis);
  const tempurung = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), kulit);
  tempurung.position.set(0, 0, 0.08);
  lutut.add(tempurung);

  const pergelangan = new THREE.Group();
  pergelangan.position.y = -BETIS;
  lutut.add(pergelangan);
  // Mata kaki di kedua sisi dan tumit di belakang.
  for (const s of [-1, 1]) {
    const mata = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), kulit);
    mata.position.set(s * 0.25, -0.05, 0);
    pergelangan.add(mata);
  }
  const tumit = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), kulit);
  tumit.scale.set(0.3, 0.3, 0.36);
  tumit.position.set(0, -0.32, -0.12);
  pergelangan.add(tumit);
  // Punggung kaki: dari pergelangan menurun ke pangkal jari.
  const punggung = ruasRuncing(1.55, 0.33, 0.3, kulit);
  punggung.scale.x = 1.35;
  punggung.rotation.x = Math.PI / 2 + 0.22;
  punggung.position.set(0, -0.3, 0.05);
  pergelangan.add(punggung);

  // Jari kaki: menekuk di pangkal (sendi bola kaki) saat jinjit.
  const jariKaki = new THREE.Group();
  jariKaki.position.set(0, -0.58, 1.6);
  pergelangan.add(jariKaki);
  const jariUkur = [
    { x: 0.27, r: 0.15, p: 0.42 },
    { x: 0.06, r: 0.1, p: 0.36 },
    { x: -0.1, r: 0.095, p: 0.32 },
    { x: -0.25, r: 0.09, p: 0.28 },
    { x: -0.38, r: 0.08, p: 0.22 },
  ];
  for (const u of jariUkur) {
    const j = ruasRuncing(u.p, u.r, u.r * 0.9, kulit);
    j.rotation.x = Math.PI / 2;
    j.position.set(u.x, u.r - 0.1, 0);
    jariKaki.add(j);
  }

  // Sandal jepit: sol mengikuti telapak, tali V dari sela jempol kaki.
  const sandal = new THREE.Group();
  const bahanSandal = new THREE.MeshStandardMaterial({ color: warnaSandal, roughness: 0.65 });
  const solBentuk = new THREE.Shape();
  solBentuk.moveTo(0, -0.45);
  solBentuk.bezierCurveTo(0.42, -0.45, 0.45, 0.4, 0.38, 1.3);
  solBentuk.bezierCurveTo(0.35, 2.05, 0.15, 2.3, -0.05, 2.3);
  solBentuk.bezierCurveTo(-0.35, 2.3, -0.5, 2.0, -0.48, 1.3);
  solBentuk.bezierCurveTo(-0.45, 0.4, -0.4, -0.45, 0, -0.45);
  const sol = new THREE.Mesh(new THREE.ExtrudeGeometry(solBentuk, { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }), bahanSandal);
  sol.rotation.x = Math.PI / 2;
  sol.castShadow = true;
  sandal.add(sol);
  const tali = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.44, 0.06, 0.85), new THREE.Vector3(-0.3, 0.62, 1.15), new THREE.Vector3(0.1, 0.62, 1.55), new THREE.Vector3(0.16, 0.06, 1.72)]), 20, 0.055, 8),
    bahanSandal,
  );
  const tali2 = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.46, 0.06, 0.9), new THREE.Vector3(0.42, 0.6, 1.2), new THREE.Vector3(0.1, 0.62, 1.55)]), 16, 0.055, 8),
    bahanSandal,
  );
  sandal.add(tali, tali2);
  // Poros sandal di tali jepit (sela jempol kaki): saat tumit terangkat, ujung depan ikut, tumit sandal tertinggal.
  const porosSandal = new THREE.Group();
  porosSandal.position.set(0, -0.8, 1.32);
  sandal.position.set(0, 0, -1.62);
  porosSandal.add(sandal);
  pergelangan.add(porosSandal);

  akar.traverse((o) => ((o as THREE.Mesh).isMesh ? ((o as THREE.Mesh).castShadow = true) : null));
  return { akar, paha, lutut, pergelangan, jariKaki, sandal: porosSandal, panjangPaha: PAHA, panjangBetis: BETIS };
}

/**
 * IK dua tulang di bidang sagital: pinggul di titik asal `akar`, pergelangan ke `target` (koordinat lokal akar,
 * y negatif ke bawah, z ke depan). Lutut selalu menekuk ke depan. `pitchKaki` = sudut telapak terhadap lantai.
 */
export function aturKaki(rig: RigKaki, target: THREE.Vector2, pitchKaki: number, tekukJari: number) {
  const L1 = rig.panjangPaha;
  const L2 = rig.panjangBetis;
  const dz = target.x;
  const dy = target.y;
  const d = Math.min(Math.hypot(dz, dy), L1 + L2 - 1e-4);
  // Sudut paha dari arah bawah (-Y), positif ke depan.
  const keTarget = Math.atan2(dz, -dy);
  const a1 = Math.acos(THREE.MathUtils.clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a2 = Math.acos(THREE.MathUtils.clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const sudutPaha = keTarget + a1;
  const sudutLutut = -(Math.PI - a2);
  // Rotasi X positif membawa -Y ke arah -Z; kita ingin paha condong ke +Z, jadi pakai tanda negatif.
  rig.paha.rotation.x = -sudutPaha;
  rig.lutut.rotation.x = -sudutLutut;
  // Telapak: kompensasi rotasi kumulatif supaya pitch dunia = pitchKaki (positif = tumit naik, jari tetap turun).
  rig.pergelangan.rotation.x = sudutPaha + sudutLutut + pitchKaki;
  rig.jariKaki.rotation.x = tekukJari;
  // Sandal jepit tertinggal: saat tumit terangkat, sol hanya ikut sebagian dan menggantung di tali jepit.
  rig.sandal.rotation.x = pitchKaki > 0 ? -pitchKaki * 0.55 : 0;
}

/**
 * Siklus jalan satu kaki pada fase p (0..1, 0 = tumit menapak). Mengembalikan posisi pergelangan relatif
 * terhadap pinggul (z ke depan, y ke bawah), pitch telapak, dan tekuk jari. `langkah` = panjang satu langkah.
 */
/** jarak horizontal pergelangan ke sendi bola kaki (pangkal jari kaki) */
const BOLA_KAKI = 1.6;

export function siklusJalan(p: number, langkah: number, tinggiPinggul: number) {
  const tumpu = 0.62;
  let z: number;
  let angkat = 0;
  let pitch = 0;
  let jari = 0;
  if (p < tumpu) {
    // Fase tumpu: kaki diam di lantai, tubuh bergerak maju, jadi relatif terhadap pinggul kaki bergeser ke belakang.
    const u = p / tumpu;
    z = langkah * 0.5 - u * langkah;
    if (u < 0.12) pitch = -0.25 * (1 - u / 0.12); // tumit menapak, jari masih terangkat
    if (u > 0.6) {
      // tumit naik, berguling di bola kaki: pergelangan terangkat sejauh (jarak pergelangan ke bola kaki) Ã— sin(sudut)
      const v = (u - 0.6) / 0.4;
      pitch = v * 0.75;
      jari = -v * 0.7;
      angkat = BOLA_KAKI * Math.sin(pitch);
    }
  } else {
    // Fase ayun: kaki melayang ke depan dengan busur, telapak kembali datar lalu sedikit dorsifleksi.
    const u = (p - tumpu) / (1 - tumpu);
    const e = u * u * (3 - 2 * u);
    z = -langkah * 0.5 + e * langkah;
    pitch = lerp(0.75, -0.25, Math.min(1, u * 1.4));
    // Mulai dari tinggi akhir jinjit supaya tidak ada lompatan, lalu busur ayun.
    angkat = BOLA_KAKI * Math.sin(Math.max(0, pitch)) + Math.sin(u * Math.PI) * 0.9;
    jari = lerp(-0.7, 0.05, Math.min(1, u * 2));
  }
  // Pergelangan berada 0,8 di atas lantai saat menapak (tinggi tumit + sol).
  return { target: new THREE.Vector2(z, -tinggiPinggul + 0.8 + angkat), pitch, jari };
}
