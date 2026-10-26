// Teaser "Lapak Baru" Jajan Dulu! (brief: jajan_dulu/konten/brief/00-teaser.md).
// Shot 4: dua jari mengangkat "klepon" dari tampah. Ring yang tersembunyi di belakangnya ikut terangkat,
// dan penonton baru sadar ukurannya. Adegan 3D penuh; semua nilai dihitung dari frame.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { buatCharm } from '../../../three/src/jajan/charm';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { inOut, outE, prog } from './motion';
import { aturTangan, buatTangan as rigBuatTangan, campurPose, kunciJepit, letakkanJepit, POSE } from '../../../three/src/jajan/tubuh';
import { rng } from './kit';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);
export const LAPAK_SHOT4_FRAMES = s(3.5);

// ---------- tekstur yang digambar ke canvas ----------

export function kanvasTekstur(w: number, h: number, gambar: (g: CanvasRenderingContext2D) => void, ulang = 1) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  gambar(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(ulang, ulang);
  t.anisotropy = 8;
  return t;
}

/** Anyaman bambu: bilah selang-seling terang dan gelap. */
export const teksturAnyam = () =>
  kanvasTekstur(
    256,
    256,
    (g) => {
      const R = rng(3);
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          const atas = (x + y) % 2 === 0;
          g.fillStyle = atas ? '#C9A066' : '#A97C47';
          g.fillRect(x * 32, y * 32, 32, 32);
          g.strokeStyle = 'rgba(70,45,20,0.45)';
          g.lineWidth = 2;
          for (let k = 0; k < 4; k++) {
            g.beginPath();
            if (atas) {
              g.moveTo(x * 32, y * 32 + 4 + k * 8 + R() * 2);
              g.lineTo(x * 32 + 32, y * 32 + 4 + k * 8 + R() * 2);
            } else {
              g.moveTo(x * 32 + 4 + k * 8 + R() * 2, y * 32);
              g.lineTo(x * 32 + 4 + k * 8 + R() * 2, y * 32 + 32);
            }
            g.stroke();
          }
        }
    },
    6,
  );

/** Daun pisang: hijau dengan tulang daun di tengah dan urat sejajar. */
export const teksturDaun = () =>
  kanvasTekstur(1024, 1024, (g) => {
    const R = rng(21);
    g.fillStyle = '#4F7A2B';
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 260; i++) {
      const y = (i / 260) * 1024 + R() * 3;
      g.strokeStyle = R() > 0.5 ? 'rgba(120,163,70,0.55)' : 'rgba(40,70,20,0.5)';
      g.lineWidth = 1 + R() * 1.4;
      g.beginPath();
      g.moveTo(0, y + 40);
      g.lineTo(512, y);
      g.lineTo(1024, y + 40);
      g.stroke();
    }
    g.fillStyle = '#9CBF63';
    g.fillRect(500, 0, 24, 1024);
    g.fillStyle = 'rgba(196,219,142,0.7)';
    g.fillRect(505, 0, 6, 1024);
  });

// ---------- tangan bergaya tanah liat ----------

const KULIT = new THREE.MeshPhysicalMaterial({ color: '#E2A47C', roughness: 0.55, sheen: 0.5, sheenColor: new THREE.Color('#ffd6b8') });

/** Kapsul yang terbentang dari titik a ke titik b. */
export function ruas(a: THREE.Vector3, b: THREE.Vector3, r: number) {
  const panjang = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, panjang), 8, 16), KULIT);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  m.castShadow = true;
  return m;
}

/** Jari telunjuk dan ibu jari yang bertemu di titik asal (titik jepit), dibangun ulang tiap frame. */
export function buatTangan(rapat: number) {
  const g = new THREE.Group();
  const celah = 0.05 + (1 - rapat) * 0.12;
  // Telunjuk dari depan, ibu jari dari belakang; pangkalnya di telapak di kanan atas.
  const pangkalT = new THREE.Vector3(0.42, 0.62, 0.12);
  const ruasT = new THREE.Vector3(0.18, 0.32, celah + 0.05);
  const ujungT = new THREE.Vector3(0.02, 0.02, celah);
  g.add(ruas(pangkalT, ruasT, 0.072), ruas(ruasT, ujungT, 0.066));
  const pangkalI = new THREE.Vector3(0.44, 0.4, -0.16);
  const ujungI = new THREE.Vector3(0.03, 0.03, -celah);
  g.add(ruas(pangkalI, ujungI, 0.08));
  // Jari tengah yang terlipat dan telapak.
  g.add(ruas(new THREE.Vector3(0.5, 0.7, 0.05), new THREE.Vector3(0.3, 0.45, 0.14), 0.07));
  const telapak = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), KULIT);
  telapak.scale.set(0.28, 0.3, 0.17);
  telapak.position.set(0.62, 0.78, 0);
  telapak.rotation.z = -0.6;
  telapak.castShadow = true;
  g.add(telapak);
  // Pergelangan dan lengan kaos.
  g.add(ruas(new THREE.Vector3(0.7, 0.9, 0), new THREE.Vector3(1.3, 1.9, -0.1), 0.2));
  const lengan = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.9, 20), new THREE.MeshStandardMaterial({ color: '#6C7A5A', roughness: 0.95 }));
  lengan.position.set(1.55, 2.35, -0.1);
  lengan.rotation.z = 0.55;
  g.add(lengan);
  return g;
}

// ---------- adegan ----------

const DOF = false;
// Puntiran lengan supaya telapak menghadap ring dan jari tidak menutupi klepon dari kamera.
const PUTAR_TANGAN = -1.9;
const BADAN_Y = 0.47; // pusat badan klepon saat terbaring di atas daun
// Di model web, isi charm digeser -0.32. Pusat ring klepon ada di y 0.54 dan puncak ring di 0.785,
// sedangkan pusat badan di -0.32, jadi jarak pusat badan ke puncak ring 1.105.
const PUNCAK_RING = 0.785;
const RING_ATAS = 1.105;

export const AdeganAngkat: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();

  const isi = useMemo(() => {
    gl.toneMappingExposure = 0.95;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.35));

    // Matahari pagi rendah dari kiri, menembus celah terpal.
    const matahari = new THREE.DirectionalLight('#ffd9a6', 3.2);
    matahari.position.set(-4, 3.2, 2.5);
    matahari.castShadow = true;
    matahari.shadow.mapSize.set(2048, 2048);
    matahari.shadow.camera.left = -3;
    matahari.shadow.camera.right = 3;
    matahari.shadow.camera.top = 3;
    matahari.shadow.camera.bottom = -3;
    matahari.shadow.bias = -0.0005;
    matahari.shadow.radius = 4;
    g.add(matahari);
    const tepi = new THREE.DirectionalLight('#ffc27a', 2);
    tepi.position.set(2.5, 2.5, -4);
    g.add(tepi);

    // Tampah bambu dan daun pisang.
    const tampah = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.1, 0.12, 64), new THREE.MeshStandardMaterial({ map: teksturAnyam(), roughness: 0.85 }));
    tampah.position.y = -0.07;
    tampah.receiveShadow = true;
    const bibir = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.09, 12, 80), new THREE.MeshStandardMaterial({ color: '#8C6237', roughness: 0.8 }));
    bibir.rotation.x = Math.PI / 2;
    const daun = new THREE.Mesh(new THREE.CircleGeometry(2.7, 48), new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.55, metalness: 0 }));
    daun.rotation.x = -Math.PI / 2;
    daun.rotation.z = 0.5;
    daun.position.y = 0.001;
    daun.receiveShadow = true;
    g.add(tampah, bibir, daun);

    // Jajanan lain di tampah, ringnya tersembunyi di belakang badan.
    const tetangga: { id: Parameters<typeof buatCharm>[0]; x: number; z: number; ry: number }[] = [
      { id: 'onde-onde', x: 1.25, z: 0.15, ry: -0.4 },
      { id: 'kue-lapis', x: -1.3, z: 0.05, ry: 0.35 },
      { id: 'kue-lumpur', x: 0.7, z: -1.3, ry: -0.2 },
      { id: 'serabi', x: -0.8, z: -1.4, ry: 0.3 },
    ];
    // Dimiringkan -115Â° di sekitar pusat model: badan tetap di atas daun, ring rebah di belakang badan
    // tepat di permukaan daun, jadi tertutup badan dari arah kamera.
    const lain = tetangga.map((x) => {
      const c = buatCharm(x.id);
      const poros = new THREE.Group();
      poros.position.set(x.x, 0.335, x.z);
      poros.rotation.y = x.ry;
      c.grup.rotation.x = THREE.MathUtils.degToRad(-115);
      c.grup.position.y = 0;
      poros.add(c.grup);
      g.add(poros);
      return poros;
    });

    // Klepon yang akan diangkat: poros di puncak ring.
    const klepon = buatCharm('klepon');
    klepon.grup.position.y = -PUNCAK_RING; // puncak ring tepat di titik poros (titik jepit)
    const poros = new THREE.Group();
    poros.add(klepon.grup);
    g.add(poros);

    // Tangan berangka (rig) dibangun sekali. Skala 1,6: tangan dewasa ±19 cm di dunia tempat charm 6 cm = 1 unit.
    const rigTangan = rigBuatTangan(1, { skala: 1.6, lenganBaju: '#6C7A5A', lengan: 2.6 });
    g.add(rigTangan.akar);

    // Pasar di latar: peti kayu, terpal, dan bohlam yang akan menjadi bokeh hangat.
    const R = rng(12);
    for (let i = 0; i < 14; i++) {
      const peti = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 + R() * 1.2, 0.6 + R() * 1.4, 0.8),
        new THREE.MeshStandardMaterial({ color: R() > 0.5 ? '#6B4A2E' : '#4A6B3A', roughness: 0.9 }),
      );
      peti.position.set(-6 + R() * 12, 0.2 + R() * 0.8, -6 - R() * 5);
      g.add(peti);
    }
    // Bulatan cahaya lembut sebagai pengganti bokeh (postprocessing tidak jalan di render Remotion).
    const bulat = kanvasTekstur(128, 128, (c) => {
      const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,220,160,0.9)');
      gr.addColorStop(0.55, 'rgba(255,200,130,0.45)');
      gr.addColorStop(1, 'rgba(255,190,120,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, 128, 128);
    });
    for (let i = 0; i < 22; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bulat, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0.35 + R() * 0.4 }));
      const k = 0.6 + R() * 1.1;
      sp.scale.set(k, k, 1);
      sp.position.set(-5 + R() * 10, 1.5 + R() * 3.5, -6 - R() * 5);
      g.add(sp);
    }
    scene.fog = new THREE.Fog('#4a3020', 6, 17);

    // Lipatan daun kecil yang menutupi ring klepon. Berengsel di tepi kanan, terbalik saat ring ditarik.
    const LEBAR_LIPAT = 1.5;
    const geoLipat = new THREE.PlaneGeometry(LEBAR_LIPAT, 1.45, 16, 6);
    const posL = geoLipat.attributes.position;
    // Melengkung depan-belakang (bukan kiri-kanan) supaya tepi depannya menempel ke daun dan ring tidak terlihat
    // dari kamera yang rendah. Sedikit lengkung kiri-kanan menambah kesan daun lemas.
    for (let i = 0; i < posL.count; i++) {
      const u = (posL.getX(i) + LEBAR_LIPAT / 2) / LEBAR_LIPAT;
      const v = (posL.getY(i) + 0.725) / 1.45;
      posL.setZ(i, Math.sin(v * Math.PI) * 0.17 + Math.sin(u * Math.PI) * 0.04);
    }
    geoLipat.computeVertexNormals();
    const lipat = new THREE.Mesh(geoLipat, new THREE.MeshStandardMaterial({ map: teksturDaun(), roughness: 0.55, side: THREE.DoubleSide }));
    lipat.rotation.x = -Math.PI / 2;
    lipat.position.set(-LEBAR_LIPAT / 2, 0.02, 0);
    lipat.castShadow = true;
    lipat.receiveShadow = true;
    const engselLipat = new THREE.Group();
    engselLipat.position.set(LEBAR_LIPAT / 2, 0.0, 1.0);
    engselLipat.add(lipat);
    g.add(engselLipat);
    const terpal = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), new THREE.MeshStandardMaterial({ color: '#C2612F', roughness: 1, side: THREE.DoubleSide }));
    terpal.position.set(0, 4.2, -8);
    terpal.rotation.x = 0.3;
    g.add(terpal);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#5A4A3A', roughness: 1 }));
    lantai.rotation.x = -Math.PI / 2;
    lantai.position.y = -1.2;
    g.add(lantai);

    return { g, poros, rigTangan, lain, engselLipat };
  }, [gl, scene]);

  // --- Jari datang, menjepit, mengangkat ---
  const datang = prog(t, s(0.15), s(0.75), outE);
  const jepit = prog(t, s(0.75), s(0.95), inOut);
  const angkat = prog(t, s(0.95), s(1.85), inOut);

  // Pose terbaring: klepon miring 115Â° sehingga sisi berkelapa menghadap kamera, ring rebah ke depan di atas
  // daun dan tertutup lipatan daun. Puncak ring (titik poros) ada di permukaan daun.
  const MIRING = THREE.MathUtils.degToRad(115);
  const P0 = new THREE.Vector3(0, 0.02, RING_ATAS * Math.sin(MIRING));
  // Pose tergantung: diangkat ke atas dan sedikit mendekat ke kamera.
  const P1 = new THREE.Vector3(0.05, 2.7, 0.4);
  const busur = Math.sin(angkat * Math.PI) * 0.35;
  const P = P0.clone().lerp(P1, angkat);
  P.z -= busur * 0.4;
  isi.poros.position.copy(P);

  // Ayunan bandul setelah terangkat, meredam sendiri.
  const tAyun = t - s(1.85);
  const ayun = tAyun > 0 ? Math.exp(-tAyun / 55) * Math.sin(tAyun * 0.17) : 0;
  isi.poros.rotation.set(MIRING * (1 - angkat) + ayun * 0.18, Math.sin(t / 50) * 0.25 * angkat, ayun * 0.32);

  // Lipatan daun terbalik ke kanan saat ring ditarik keluar dari bawahnya.
  isi.engselLipat.rotation.z = -2.7 * prog(t, s(0.9), s(1.35), inOut);

  // Bunyi "klik": ring klepon menyenggol ring onde-onde, onde-onde ikut bergetar sebentar.
  const tKlik = t - s(1.35);
  const getar = tKlik > 0 ? Math.exp(-tKlik / 10) * Math.sin(tKlik * 0.9) : 0;
  isi.lain[0].rotation.z = getar * 0.06;

  // Tangan: jari terbuka saat mendekat, menutup menjadi jepit tepat di puncak ring, lalu ikut terangkat.
  const rig = isi.rigTangan;
  aturTangan(rig, campurPose(POSE.terbuka, POSE.jepit, Math.min(1, datang * 0.5 + jepit * 0.5)));
  kunciJepit(rig, jepit);
  // Turun dari atas dengan siku di belakang-atas: tidak menembus badan klepon dan tidak menghalangi kamera.
  const asalJepit = P0.clone().add(new THREE.Vector3(0.5, 3.2, 0.35));
  const titik = asalJepit.clone().lerp(P, datang);
  // Lengan datang dari kanan atas belakang, jari mengarah turun ke ring.
  letakkanJepit(rig, titik, new THREE.Vector3(-0.2, -1, 0.3), PUTAR_TANGAN);

  // --- Kamera: mulai rendah sejajar badan klepon, lalu crane naik ke sudut atas ---
  const crane = prog(t, s(0.7), s(2.3), inOut);
  const posAwal = new THREE.Vector3(0.15, 1.0, 6.6);
  const posAkhir = new THREE.Vector3(0.5, 3.4, 6.4);
  camera.position.copy(posAwal.clone().lerp(posAkhir, crane));
  const lihatAwal = new THREE.Vector3(0, 0.45, 0.35);
  const lihatAkhir = new THREE.Vector3(0.05, 1.9, 0.3);
  const lihat = lihatAwal.clone().lerp(lihatAkhir, crane);
  camera.lookAt(lihat);

  // Titik fokus mengikuti klepon.
  const fokus = new THREE.Vector3(P.x, P.y - RING_ATAS * 0.6 * angkat, P.z + RING_ATAS * (1 - angkat));
  return (
    <>
      <primitive object={isi.g} />
      {DOF && (
        <EffectComposer multisampling={4}>
          <DepthOfField target={[fokus.x, fokus.y, fokus.z]} focalLength={0.02} bokehScale={6} height={960} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
};

export const LapakShot4: React.FC = () => {
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

  const teks = prog(t, s(2.0), s(2.4)) ;

  return (
    <AbsoluteFill style={{ background: '#3A2A1E' }}>
      {siap && (
        <ThreeCanvas width={width} height={height} shadows camera={{ fov: 28, near: 0.1, far: 60 }} gl={{ antialias: true }}>
          <AdeganAngkat t={t} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 80px 330px' }}>
        <div
          style={{
            fontFamily: gochi.fontFamily,
            fontSize: 64,
            lineHeight: 1.1,
            color: '#FFF8F1',
            textShadow: '0 3px 14px rgba(0,0,0,0.55)',
            opacity: teks,
            transform: `translateY(${(1 - prog(t, s(2.0), s(2.5), outE)) * 18}px) rotate(-2deg)`,
            maxWidth: 760,
          }}
        >
          Jajanannya bisa ikut ke mana-mana.
        </div>
      </AbsoluteFill>
      {/* butiran film statis */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <filter id="lp-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#lp-grain)" opacity={0.1} style={{ mixBlendMode: 'overlay' }} />
        </svg>
      </AbsoluteFill>
      <span style={{ display: 'none' }}>{bagel.fontFamily}{poppins.fontFamily}</span>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Uji model: klepon dan onde-onde dari dekat, untuk dibandingkan dengan foto jajanan asli.

const UjiAdegan: React.FC = () => {
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    gl.toneMappingExposure = 1;
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.6));
    const sinar = new THREE.DirectionalLight('#ffe2b8', 2.4);
    sinar.position.set(-3, 4, 4);
    g.add(sinar);
    const a = buatCharm('klepon');
    a.grup.position.set(0, 0.85, 0);
    a.grup.rotation.set(0.35, -0.3, 0);
    const b = buatCharm('onde-onde');
    b.grup.position.set(0, -0.85, 0);
    b.grup.rotation.set(0.2, 0.4, 0);
    g.add(a.grup, b.grup);
    return g;
  }, [gl, scene]);
  camera.position.set(0, 0, 5.4);
  camera.lookAt(0, 0, 0);
  return <primitive object={isi} />;
};

export const UjiCharm: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#C9A574' }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.1, far: 30 }} gl={{ antialias: true }}>
        <UjiAdegan />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
