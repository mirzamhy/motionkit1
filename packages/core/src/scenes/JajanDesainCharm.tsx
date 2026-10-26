// Lembar desain bag charm versi rajut, satu frame per varian (0 klepon … 4 serabi).
// Kiri: render 3D empat arah (FRONT, LEFT, BACK, RIGHT) seperti foto produk.
// Kanan atas: peta jahitan (warna penanda) tampak depan dan samping, dengan nomor keterangan.
// Kanan bawah: detail ring pegas dan kain penghubung (webbing), plus pola potong pita.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { buatCharmRajut, PALET, PENANDA, titikCharm, type CharmRajutId } from '../../../three/src/jajan/charmRajut';

export const DESAIN_CHARM_FRAMES = 5;
const URUT: CharmRajutId[] = ['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'];
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Segoe UI", Arial, sans-serif';
const TINTA = '#3B2F27';

type Kam = { pos: [number, number, number]; target: [number, number, number]; fov: number };
type Jenis = keyof typeof PENANDA;
type Jahit = { jenis: Jenis; judul: string; teks: string; kunci?: string };

const NAMA_WARNA: Record<string, string> = {
  badan: 'Flanel badan', kelapa: 'Flanel kelapa', jahitSisi: 'Benang jahit sisi', wijen: 'Wijen', merah: 'Flanel merah muda', krem: 'Flanel krem',
  hijau: 'Flanel hijau', cokelat: 'Flanel cokelat', kuning: 'Flanel kuning', benang: 'Benang jahit', kismis: 'Kismis', cup: 'Flanel cup', putih: 'Flanel putih', feston: 'Benang feston',
  pandan: 'Aksen pandan', tab: 'Kain penghubung', ring: 'Ring pegas',
};

const DATA: Record<CharmRajutId, { nama: string; bahan?: string; ukuran: string; jahit: Jahit[] }> = {
  klepon: {
    nama: 'KLEPON',
    ukuran: '±6 × 6 × 4,4 cm',
    jahit: [
      { jenis: 'sisi', kunci: 'sisi', judul: 'Jahitan sisi keliling', teks: 'Dua potong flanel hijau (depan dan belakang) disatukan tusuk feston keliling dengan benang hijau muda, lalu diisi dakron. Dari samping terlihat sebagai garis jahitan tegak di tengah.' },
      { jenis: 'hias', kunci: 'hias', judul: 'Kelapa parut', teks: 'Potongan flanel putih kecil ±3 × 7 mm dengan ujung membulat, dijahit di sepertiga atas depan dan belakang. Arahnya menjuntai ke bawah dan tidak menutupi jahitan sisi.' },
      { jenis: 'tab', kunci: 'tab', judul: 'Tab di sambungan atas', teks: 'Ujung pita diselipkan di antara dua potong flanel sebelum jahitan sisi ditutup.' },
    ],
  },
  'onde-onde': {
    nama: 'ONDE-ONDE',
    ukuran: '±6 × 5,9 × 5,3 cm',
    jahit: [
      { jenis: 'sisi', kunci: 'sisi', judul: 'Jahitan sisi keliling', teks: 'Dua potong flanel oranye disatukan tusuk feston keliling dengan benang senada (sedikit lebih gelap), lalu diisi dakron sampai membulat.' },
      { jenis: 'hias', kunci: 'hias', judul: 'Wijen sulam satin', teks: 'Butir krem lonjong ±3,5 × 1,5 mm, ±110 per sisi, arah acak, merata sampai ke tepi. Disulam sebelum kedua potong dijahit.' },
      { jenis: 'tab', kunci: 'tab', judul: 'Tab di sambungan atas', teks: 'Diselipkan di puncak, di antara dua potong flanel.' },
    ],
  },
  'kue-lapis': {
    nama: 'KUE LAPIS',
    ukuran: '±5,6 × 6 × 3,2 cm',
    jahit: [
      { jenis: 'sisi', kunci: 'sisi', judul: 'Jahitan sisi keliling', teks: 'Panel depan dan belakang (sudut membulat) dijahit tusuk feston keliling. Warna benang mengikuti tiap lapis, sedikit lebih gelap dari kainnya.' },
      { jenis: 'aplikasi', kunci: 'aplikasi', judul: 'Sambungan lima pita', teks: 'Tiap panel terdiri dari lima pita flanel: merah muda, krem, hijau, krem, merah muda. Pita disambung, lalu tiap batas diberi tusuk jelujur (putih di batas merah muda, hijau muda di batas hijau).' },
      { jenis: 'tab', kunci: 'tab', judul: 'Tab di sambungan atas', teks: 'Diselipkan di tengah sisi atas, di pita merah muda.' },
    ],
  },
  'kue-lumpur': {
    nama: 'KUE LUMPUR',
    bahan: 'versi flanel',
    ukuran: '±6 × 6 × 2,8 cm',
    jahit: [
      { jenis: 'aplikasi', kunci: 'aplikasi', judul: 'Isi kuning ditempel', teks: 'Lingkaran flanel kuning Ø5,2 cm diisi dakron tipis supaya menggembung, dijahit tusuk feston benang cokelat muda ke muka depan. Sisa bingkai cokelat ±4 mm.' },
      { jenis: 'hias', kunci: 'hias', judul: 'Kismis di tengah', teks: 'Sulam satin bergulung cokelat tua ±1 × 0,6 cm dengan tepi rantai, jahit sebelum isi kuning ditempel.' },
      { jenis: 'sisi', kunci: 'sisi', judul: 'Dua jahitan sisi', teks: 'Lingkaran depan dan belakang (flanel cokelat Ø6 cm) disambung ke pita dinding 2,4 × 19 cm dengan tusuk feston. Dari samping terlihat dua garis jahitan di tepi depan dan belakang.' },
      { jenis: 'tab', kunci: 'tab', judul: 'Tab di dinding atas', teks: 'Ujung pita diselipkan di sambungan pita dinding sebelum jahitan ditutup, lalu dijahit palang.' },
    ],
  },
  serabi: {
    nama: 'SERABI',
    ukuran: '±6,4 × 6,4 × 2,6 cm',
    jahit: [
      { jenis: 'aplikasi', kunci: 'aplikasi', judul: 'Kubah putih ke cup', teks: 'Kubah flanel putih dijahit tusuk feston benang merah muda ke dasar cup, titik-titik kecil terlihat di sepanjang tepi.' },
      { jenis: 'hias', kunci: 'hias', judul: 'Aksen pandan "^"', teks: 'Dua potong flanel hijau ±1,4 × 0,3 cm ditempel membentuk "^" di tengah kubah, dijahit jelujur kecil benang hijau.' },
      { jenis: 'info', kunci: 'info', judul: 'Cup bergelombang', teks: 'Flanel oranye kecokelatan: lingkaran dasar dan dinding yang dikerut jadi delapan lekuk lembut. Bibir atas dijahit tusuk feston benang senada, lekuk rendah di tengah atas untuk tab.' },
      { jenis: 'tab', kunci: 'tab', judul: 'Tab di lekuk atas', teks: 'Diselipkan di dinding luar cup dan dijahit tembus.' },
    ],
  },
};

let _linen: THREE.Texture | undefined;
function teksturLinen() {
  if (_linen) return _linen;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ECE6DC';
  g.fillRect(0, 0, 512, 512);
  let s = 3;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 512; i += 2) {
    g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '120,100,80'},${0.05 + r() * 0.07})`;
    g.fillRect(0, i, 512, 1);
    g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '120,100,80'},${0.04 + r() * 0.06})`;
    g.fillRect(i, 0, 1, 512);
  }
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = `rgba(110,90,70,${0.05 + r() * 0.08})`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 5, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 5);
  t.colorSpace = THREE.SRGBColorSpace;
  return (_linen = t);
}

const Panggung: React.FC<{ id: CharmRajutId; sudut: number; peta?: boolean; kam: Kam; polos?: string }> = ({ id, sudut, peta, kam, polos }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.6));
    const kunci = new THREE.DirectionalLight('#fff6ea', 1.5);
    kunci.position.set(-1.6, 2.6, 4);
    kunci.castShadow = true;
    kunci.shadow.mapSize.set(2048, 2048);
    kunci.shadow.radius = 8;
    kunci.shadow.bias = -0.0004;
    kunci.shadow.normalBias = 0.01;
    Object.assign(kunci.shadow.camera, { left: -1.8, right: 1.8, top: 2.2, bottom: -1.4, near: 0.5, far: 12 });
    g.add(kunci);
    const isian = new THREE.DirectionalLight('#f3eadf', 0.5);
    isian.position.set(3, 0.5, 3);
    g.add(isian);
    scene.background = new THREE.Color(polos ?? '#ECE6DC');
    const latar = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshStandardMaterial(polos ? { color: polos, roughness: 1 } : { map: teksturLinen(), roughness: 1 }),
    );
    latar.position.z = -0.75;
    latar.receiveShadow = true;
    g.add(latar);
    const charm = buatCharmRajut(id, { peta });
    charm.rotation.y = sudut;
    g.add(charm);
    return g;
  }, [gl, scene, id, sudut, peta, polos]);
  camera.position.set(...kam.pos);
  camera.lookAt(...kam.target);
  (camera as THREE.PerspectiveCamera).fov = kam.fov;
  camera.updateProjectionMatrix();
  return <primitive object={isi} />;
};

const Kanvas: React.FC<{ w: number; h: number; id: CharmRajutId; sudut: number; peta?: boolean; kam: Kam; polos?: string }> = ({ w, h, ...p }) => (
  <ThreeCanvas width={w} height={h} shadows camera={{ fov: p.kam.fov, near: 0.05, far: 60 }} gl={{ antialias: true }}>
    <Panggung {...p} />
  </ThreeCanvas>
);

function proyeksi(p: THREE.Vector3, sudut: number, kam: Kam, w: number, h: number) {
  const c = new THREE.PerspectiveCamera(kam.fov, w / h, 0.05, 60);
  c.position.set(...kam.pos);
  c.lookAt(...kam.target);
  c.updateMatrixWorld();
  const v = p.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), sudut).project(c);
  return [((v.x + 1) / 2) * w, ((1 - v.y) / 2) * h] as const;
}

const KAM_EMPAT: Kam = { pos: [0, 0.39, 5.1], target: [0, 0.39, 0], fov: 24 };
const KAM_PETA: Kam = { pos: [0, 0.33, 4.7], target: [0, 0.33, 0], fov: 24 };
const SUDUT_EMPAT: [string, number][] = [['FRONT', 0], ['LEFT', -Math.PI / 2], ['BACK', Math.PI], ['RIGHT', Math.PI / 2]];

const Nomor: React.FC<{ no: number; warna: string; size?: number }> = ({ no, warna, size = 34 }) => (
  <div style={{ width: size, height: size, borderRadius: size, background: warna, color: '#fff', fontFamily: SANS, fontWeight: 700, fontSize: size * 0.55, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', flexShrink: 0 }}>{no}</div>
);

const PanelPeta: React.FC<{ id: CharmRajutId; sudut: number; label: string; samping: boolean; x: number; y: number; w: number; h: number }> = ({ id, sudut, label, samping, x, y, w, h }) => {
  const titik = titikCharm(id);
  const jahit = DATA[id].jahit;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h + 44 }}>
      <div style={{ position: 'absolute', inset: 0, height: h, borderRadius: 8, overflow: 'hidden' }}>
        <Kanvas w={w} h={h} id={id} sudut={sudut} peta kam={KAM_PETA} polos="#F1ECE4" />
      </div>
      {jahit.map((j, i) => {
        const p = j.kunci && (titik[j.kunci + (samping ? 'Samping' : 'Depan')] ?? titik[j.kunci]);
        if (!p) return null;
        const [px, py] = proyeksi(p, sudut, KAM_PETA, w, h);
        const arah = new THREE.Vector2(px - w / 2, py - h * 0.55);
        if (arah.lengthSq() < 1) arah.set(1, 0);
        arah.normalize();
        const bx = THREE.MathUtils.clamp(px + arah.x * 70, 22, w - 22);
        const by = THREE.MathUtils.clamp(py + arah.y * 70, 22, h - 22);
        return (
          <React.Fragment key={i}>
            <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
              <line x1={px} y1={py} x2={bx} y2={by} stroke={PENANDA[j.jenis]} strokeWidth={3} />
              <circle cx={px} cy={py} r={6} fill="#fff" stroke={PENANDA[j.jenis]} strokeWidth={3} />
            </svg>
            <div style={{ position: 'absolute', left: bx - 17, top: by - 17 }}>
              <Nomor no={i + 1} warna={PENANDA[j.jenis]} />
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', top: h + 8, width: w, textAlign: 'center', fontFamily: SERIF, fontSize: 22, letterSpacing: 5, color: TINTA }}>{label}</div>
    </div>
  );
};

const PolaPita: React.FC<{ warna: string; w: number }> = ({ warna, w }) => {
  // pita 5,5 cm × 1 cm; skala 1 cm = s px
  const s = (w - 40) / 5.5;
  const x0 = 20;
  const y0 = 40;
  const t = s * 0.7;
  const garis = (cm: number) => x0 + cm * s;
  return (
    <svg width={w} height={196}>
      <defs>
        <pattern id="arsir" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(0,0,0,0.28)" strokeWidth="3" />
        </pattern>
      </defs>
      <rect x={x0} y={y0} width={5.5 * s} height={t} fill={warna} rx={3} />
      <rect x={x0} y={y0} width={1 * s} height={t} fill="url(#arsir)" />
      <rect x={garis(4.5)} y={y0} width={1 * s} height={t} fill="url(#arsir)" />
      {[1.2, 1.4, 4.1, 4.3].map((cm) => (
        <line key={cm} x1={garis(cm)} y1={y0 + 4} x2={garis(cm)} y2={y0 + t - 4} stroke="#fff" strokeWidth={2.5} strokeDasharray="5 4" />
      ))}
      <line x1={garis(2.75)} y1={y0 - 10} x2={garis(2.75)} y2={y0 + t + 10} stroke={TINTA} strokeWidth={2} strokeDasharray="7 5" />
      <text x={garis(2.75)} y={y0 - 16} textAnchor="middle" fontFamily={SANS} fontSize={17} fill={TINTA}>lipat di sini (ring)</text>
      <text x={x0} y={y0 + t + 26} textAnchor="start" fontFamily={SANS} fontSize={16} fill={TINTA}>masuk badan 1 cm</text>
      <text x={garis(5.5)} y={y0 + t + 26} textAnchor="end" fontFamily={SANS} fontSize={16} fill={TINTA}>masuk badan 1 cm</text>
      <text x={garis(2.75)} y={y0 + t + 50} textAnchor="middle" fontFamily={SANS} fontSize={16} fill={TINTA}>garis putus putih = jahit palang 2 baris</text>
      <line x1={x0} y1={y0 + t + 66} x2={x0 + 5.5 * s} y2={y0 + t + 66} stroke={TINTA} strokeWidth={1.5} />
      <text x={garis(2.75)} y={y0 + t + 86} textAnchor="middle" fontFamily={SANS} fontSize={16} fill={TINTA}>potong 5,5 cm × lebar 1 cm</text>
    </svg>
  );
};

export const DesainCharm: React.FC = () => {
  const frame = useCurrentFrame();
  const id = URUT[Math.min(frame, URUT.length - 1)];
  const d = DATA[id];
  const palet = PALET[id];
  const cellW = 715;
  const cellH = 640;
  const atasY = { klepon: 0.505, 'onde-onde': 0.49, 'kue-lapis': 0.5, 'kue-lumpur': 0.5, serabi: 0.52 }[id];
  const kamDekat: Kam = { pos: [0.25, atasY + 0.34, 1.3], target: [0, atasY + 0.17, 0], fov: 24 };
  return (
    <AbsoluteFill style={{ background: '#F5F0E8', color: TINTA, fontFamily: SANS }}>
      {/* kepala */}
      <div style={{ position: 'absolute', left: 48, top: 30 }}>
        <div style={{ fontFamily: SERIF, fontSize: 64, letterSpacing: 8 }}>{d.nama}</div>
        <div style={{ fontSize: 23, color: '#7A6B5E', marginTop: 4 }}>Lembar desain bag charm · {d.bahan ?? 'versi flanel'} · Jajan Dulu! · ukuran jadi {d.ukuran} (tanpa ring)</div>
      </div>
      <div style={{ position: 'absolute', right: 40, top: 34, display: 'flex', gap: 20 }}>
        {Object.entries(palet).map(([k, hex]) => (
          <div key={k} style={{ width: 118, textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: 54, background: hex, margin: '0 auto', border: '2px solid rgba(0,0,0,0.08)' }} />
            <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.2 }}>{NAMA_WARNA[k] ?? k}</div>
            <div style={{ fontSize: 14, color: '#8A7B6E', fontFamily: 'Consolas, monospace' }}>{hex.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* empat arah */}
      {SUDUT_EMPAT.map(([label, sudut], i) => {
        const x = 40 + (i % 2) * (cellW + 20);
        const y = 160 + Math.floor(i / 2) * (cellH + 60);
        return (
          <div key={label} style={{ position: 'absolute', left: x, top: y, width: cellW }}>
            <div style={{ width: cellW, height: cellH, borderRadius: 8, overflow: 'hidden' }}>
              <Kanvas w={cellW} h={cellH} id={id} sudut={sudut} kam={KAM_EMPAT} />
            </div>
            <div style={{ textAlign: 'center', fontFamily: SERIF, fontSize: 28, letterSpacing: 7, marginTop: 10 }}>{label}</div>
          </div>
        );
      })}

      {/* peta jahitan */}
      <div style={{ position: 'absolute', left: 1530, top: 160, width: 990 }}>
        <div style={{ fontFamily: SERIF, fontSize: 30, letterSpacing: 5 }}>PETA JAHITAN</div>
        <div style={{ display: 'flex', gap: 18, fontSize: 16, marginTop: 6, color: '#6B5D51' }}>
          {([['sisi', 'jahitan sisi'], ['aplikasi', 'sambungan / aplikasi'], ['hias', 'sulaman'], ['tab', 'tab & jahit palang']] as [Jenis, string][]).map(([k, t]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: 14, background: PENANDA[k], display: 'inline-block' }} />
              {t}
            </span>
          ))}
        </div>
      </div>
      <PanelPeta id={id} sudut={0} label="DEPAN" samping={false} x={1530} y={240} w={485} h={460} />
      <PanelPeta id={id} sudut={-Math.PI / 2} label="SAMPING" samping x={2035} y={240} w={485} h={460} />
      <div style={{ position: 'absolute', left: 1530, top: 760, width: 990, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {d.jahit.map((j, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Nomor no={i + 1} warna={PENANDA[j.jenis]} size={30} />
            <div style={{ fontSize: 18, lineHeight: 1.32 }}>
              <b>{j.judul}.</b> {j.teks}
            </div>
          </div>
        ))}
      </div>

      {/* ring dan kain penghubung */}
      <div style={{ position: 'absolute', left: 1530, top: 1090, width: 990, fontFamily: SERIF, fontSize: 30, letterSpacing: 5 }}>RING & KAIN PENGHUBUNG</div>
      <div style={{ position: 'absolute', left: 1530, top: 1140, width: 470, height: 420, borderRadius: 8, overflow: 'hidden' }}>
        <Kanvas w={470} h={420} id={id} sudut={-0.55} kam={kamDekat} />
      </div>
      <div style={{ position: 'absolute', left: 2020, top: 1130, width: 500 }}>
        <PolaPita warna={palet.tab} w={500} />
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 22, fontSize: 17, lineHeight: 1.36 }}>
          <li><b>Ring pegas</b> (spring gate) Ø luar ±3,6 cm, tebal 5 mm, cat mengilap {palet.ring.toUpperCase()}. Tombol di kiri, celah buka di kiri atas.</li>
          <li><b>Kain penghubung</b>: pita webbing anyaman rib, lebar 1 cm, warna {palet.tab.toUpperCase()}, dilipat dua melingkari bagian bawah ring.</li>
          <li>Tinggi pita yang terlihat ±1,2 cm. Kedua ujung masuk 1 cm ke sambungan atas, dijahit palang 2 baris tembus badan.</li>
        </ul>
      </div>
    </AbsoluteFill>
  );
};

// Uji makro flanel dan benang jahit: tepi isi kuning kue lumpur dan tepi kubah serabi dari jarak ±3 cm.
const KAM_MAKRO: [CharmRajutId, Kam, number][] = [
  ['kue-lumpur', { pos: [0.45, -0.45, 1.75], target: [0.2, -0.2, 0.1], fov: 24 }, 0],
  ['kue-lumpur', { pos: [1.7, -0.25, 0.5], target: [0.3, -0.15, 0.0], fov: 24 }, -0.35],
  ['serabi', { pos: [0.3, -0.5, 1.75], target: [0.1, -0.2, 0.12], fov: 24 }, 0],
]
export const UjiFlanel: React.FC = () => (
  <AbsoluteFill style={{ background: '#F5F0E8', flexDirection: 'row' }}>
    {KAM_MAKRO.map(([id, kam, sudut], i) => (
      <div key={i} style={{ width: 640, height: 1080, position: 'relative' }}>
        <Kanvas w={640} h={1080} id={id} sudut={sudut} kam={kam} />
      </div>
    ))}
  </AbsoluteFill>
);
