// Teaser gaya "Gacha summon" Jajan Dulu!, 20 detik, 9:16. Kantong kraft diperlakukan seperti layar tarik di game
// gacha: ditekan, bergetar, meledak cahaya, lalu satu karakter keluar dengan bintang kelangkaan. Tarikan ketiga
// memunculkan SECRET. Satuan dunia charm: 1 unit = 6 cm.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Sequence, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { type CharmId } from '../../../three/src/jajan/charm';
import { buatKantong } from '../../../three/src/jajan/kantong';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { inOut, kf, outE, pop, prog } from './motion';
import { rng } from './kit';
import { terapkanTampilan, type Tampilan } from './tampilan';
import { kanvasTekstur } from './JajanLapak';
import { Bunyi, BunyiPanjang } from './JajanTeaserLapak';
import { cahayaBulat, charmBerdiri, sprite, teksturRadial } from './JajanGayaTeaser';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['500', '700'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);
export const GACHA_FRAMES = s(20);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Jadwal (detik)
const T = { tekan: 2.6, getar: 3.0, ledak: 6.5, lagi: 10.2, cepat: 11.0, tekan3: 14.0, getar3: 14.4, ledak3: 15.6, akhir: 18.3 } as const;

/** Urutan tarikan: [mulai, id, bintang, nama, label]. Tarikan 2-5 adalah montase cepat. */
const TARIKAN: { dari: number; sampai: number; id: CharmId; bintang: number; nama: string; label: string }[] = [
  { dari: 6.6, sampai: 10.2, id: 'onde-onde', bintang: 4, nama: 'Onde-onde', label: 'SR' },
  { dari: 11.0, sampai: 11.75, id: 'klepon', bintang: 3, nama: 'Klepon', label: 'R' },
  { dari: 11.75, sampai: 12.5, id: 'kue-lapis', bintang: 4, nama: 'Kue Lapis', label: 'SR' },
  { dari: 12.5, sampai: 13.25, id: 'kue-lumpur', bintang: 3, nama: 'Kue Lumpur', label: 'R' },
  { dari: 13.25, sampai: 14.0, id: 'serabi', bintang: 4, nama: 'Serabi', label: 'SR' },
  { dari: 15.7, sampai: 18.3, id: 'secret', bintang: 5, nama: 'SECRET', label: '???' },
];
const tarikanSaat = (d: number) => TARIKAN.find((x) => d >= x.dari && d < x.sampai);

// ---------------------------------------------------------------------------------------------------------------

const Adegan: React.FC<{ t: number; tampilan: Tampilan }> = ({ t, tampilan }) => {
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    lampuStandar(scene, gl, 0.6);
    scene.environmentIntensity = 0.5;
    scene.background = new THREE.Color('#0E0818');
    const latar = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: teksturRadial('#5B2E8C', '#0E0818'), transparent: true }));
    latar.position.z = -6;
    g.add(latar);
    // berkas cahaya memancar dari belakang kantong; tiap berkas punya warna sendiri untuk mode pelangi
    const texBerkas = kanvasTekstur(64, 512, (c) => {
      const gr = c.createLinearGradient(0, 0, 64, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)');
      gr.addColorStop(0.5, 'rgba(255,255,255,0.9)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr;
      c.fillRect(0, 0, 64, 512);
      const gv = c.createLinearGradient(0, 0, 0, 512);
      gv.addColorStop(0, 'rgba(0,0,0,0)');
      gv.addColorStop(1, 'rgba(0,0,0,1)');
      c.globalCompositeOperation = 'destination-in';
      c.fillStyle = gv;
      c.fillRect(0, 0, 64, 512);
    });
    const berkas = new THREE.Group();
    const bahanBerkas: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.MeshBasicMaterial({ map: texBerkas, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3, color: '#FFD9A0' });
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8 + (i % 3) * 0.45, 16).translate(0, 8, 0), m);
      b.rotation.z = (i / 16) * Math.PI * 2;
      berkas.add(b);
      bahanBerkas.push(m);
    }
    berkas.position.set(0, 1.2, -4);
    g.add(berkas);

    const kantong = buatKantong();
    g.add(kantong.grup);
    const halo = sprite(cahayaBulat('rgba(255,215,140,1)'), 6, 0);
    g.add(halo);
    const charm = new Map<CharmId, THREE.Group>();
    (['onde-onde', 'klepon', 'kue-lapis', 'kue-lumpur', 'serabi', 'secret'] as CharmId[]).forEach((id) => {
      const c = charmBerdiri(id);
      c.scale.setScalar(1.1);
      c.visible = false;
      g.add(c);
      charm.set(id, c);
    });
    const pelangi = new THREE.Group();
    ['rgba(255,120,160,1)', 'rgba(120,200,255,1)', 'rgba(255,230,120,1)', 'rgba(170,140,255,1)'].forEach((w, i) => {
      const sp = sprite(cahayaBulat(w), 3.4, 0.5);
      sp.userData.a = i * 1.57;
      pelangi.add(sp);
    });
    g.add(pelangi);
    // kilau yang melayang naik pelan
    const R = rng(3);
    const texKilau = cahayaBulat('rgba(255,245,210,1)');
    const kilau = Array.from({ length: 60 }, () => {
      const sp = sprite(texKilau, 0.06 + R() * 0.18, 0.9);
      g.add(sp);
      return { sp, x: (R() - 0.5) * 8, y: R() * 9, z: -3 + R() * 4, v: 0.004 + R() * 0.01, f: R() * 50 };
    });
    const kunci = new THREE.PointLight('#FFC98A', 30, 12, 1.5);
    kunci.position.set(0, 3.5, 2.5);
    const ungu = new THREE.PointLight('#A070FF', 25, 12, 1.5);
    ungu.position.set(-3, 1, -1);
    const biru = new THREE.PointLight('#60B0FF', 18, 12, 1.5);
    biru.position.set(3, 2, -1);
    g.add(kunci, ungu, biru, new THREE.AmbientLight('#6040A0', 0.4));
    return { g, berkas, bahanBerkas, kantong, halo, charm, pelangi, kilau, kunci };
  }, [gl, scene]);
  // tampilan kartun/kertas diterapkan async (penyederhanaan geometri); render ditahan sampai selesai
  const { advance } = useThree();
  const [tahan] = useState(() => (tampilan === 'asli' ? null : delayRender('tampilan ' + tampilan)));
  useEffect(() => {
    if (tahan === null) return;
    terapkanTampilan(isi.g, tampilan).then(() => {
      advance(performance.now());
      continueRender(tahan);
    });
  }, [isi, tahan, tampilan, advance]);

  const d = t / FPS;
  // getaran kantong: makin kuat menjelang ledakan
  const getar1 = prog(t, s(T.getar), s(T.ledak), (x) => x * x);
  const getar3 = prog(t, s(T.getar3), s(T.ledak3), (x) => x * x);
  const getar = d < T.ledak ? getar1 : d >= T.getar3 && d < T.ledak3 ? getar3 * 1.4 : 0;
  const R = Math.sin(t * 1.9) * Math.cos(t * 1.3);
  const rahasia = d >= T.getar3;

  // kantong: tertutup, terbuka saat ledakan pertama, menutup lagi untuk tarikan terakhir, terbuka lagi untuk SECRET
  const buka = d < T.ledak ? 0.03 : d < T.tekan3 ? 1 : d < T.ledak3 ? 1 - prog(t, s(T.tekan3), s(T.tekan3 + 0.3), inOut) : 1;
  isi.kantong.setBuka(buka);
  isi.kantong.setCahaya(Math.min(1, 0.35 + getar + (buka > 0.5 ? 0.6 : 0)));
  isi.kantong.grup.visible = d < T.akhir;
  const melayang = Math.sin(t / 26) * 0.08;
  isi.kantong.grup.position.set(R * 0.06 * getar, -1.3 + melayang + Math.abs(R) * 0.05 * getar, 0);
  isi.kantong.grup.rotation.set(0.12, 0.3 - 0.3 * prog(t, s(T.getar), s(T.ledak), inOut) + R * 0.08 * getar, Math.cos(t * 2.3) * 0.05 * getar);

  // berkas cahaya: berputar makin cepat saat getar; mode pelangi di tarikan terakhir
  const putaran = t * 0.002 + getar1 * 0.6 + (d > T.ledak ? (t - s(T.ledak)) * 0.004 : 0) + getar3 * 1.2;
  isi.berkas.rotation.z = putaran;
  const kuatBerkas = 0.18 + getar * 0.35 + (tarikanSaat(d) ? 0.25 : 0);
  isi.bahanBerkas.forEach((m, i) => {
    m.opacity = kuatBerkas;
    if (rahasia) m.color.setHSL((i / 16 + t * 0.003) % 1, 0.8, 0.7);
    else m.color.set('#FFD9A0');
  });
  isi.berkas.scale.setScalar(0.8 + getar * 0.5 + (tarikanSaat(d) ? 0.4 : 0));

  // charm yang sedang tampil naik dari mulut kantong dan berputar pelan
  const sekarang = tarikanSaat(d);
  isi.charm.forEach((c, id) => {
    c.visible = !!sekarang && sekarang.id === id;
    if (!c.visible || !sekarang) return;
    const naik = prog(t, s(sekarang.dari), s(sekarang.dari) + (sekarang.sampai - sekarang.dari > 1 ? 40 : 14), outE);
    c.position.set(0, -0.6 + naik * 0.95 + Math.sin(t / 20) * 0.05, 0.4);
    c.rotation.set(0.08, -0.5 + (t - s(sekarang.dari)) * 0.006, 0);
  });
  isi.halo.material.opacity = sekarang ? 0.85 : 0.25 + getar * 0.6;
  isi.halo.position.set(0, sekarang ? 1.5 : 0.4, -0.6);
  isi.halo.scale.setScalar(sekarang ? 7 : 3.5 + getar * 3);
  isi.pelangi.visible = !!sekarang && sekarang.id === 'secret';
  isi.pelangi.children.forEach((sp) => {
    const a = sp.userData.a + t * 0.02;
    sp.position.set(Math.cos(a) * 1.3, 1.6 + Math.sin(a) * 1.1, -0.6);
  });
  isi.kilau.forEach((k) => {
    k.sp.position.set(k.x + Math.sin((t + k.f) / 40) * 0.2, ((k.y + t * k.v) % 9) - 2, k.z);
    (k.sp.material as THREE.SpriteMaterial).opacity = 0.5 + 0.4 * Math.sin((t + k.f * 9) / 11);
  });
  isi.kunci.intensity = 30 + getar * 40;

  // kamera: dorong maju saat bergetar, sedikit gemetar, lalu naik mengikuti charm
  const dorong = d < T.ledak ? getar1 : d >= T.getar3 && d < T.ledak3 ? getar3 : 0;
  const lihatAtas = sekarang ? 0.15 : 0;
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(R * 0.05 * getar, 1.4 + kf(t, [[0, 0], [s(T.ledak), 0], [s(T.ledak + 0.6), 0.3]]), 9 - dorong * 1.8);
  cam.lookAt(0, 0.9 + lihatAtas, 0);
  cam.rotateZ(Math.sin(t * 2.7) * 0.012 * getar);
  cam.fov = 34;
  cam.updateProjectionMatrix();
  gl.toneMappingExposure = 1;
  return <primitive object={isi.g} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Lapisan 2D

const pusatX = (o: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', left: 0, right: 0, textAlign: 'center', ...o });

const Tombol: React.FC<{ t: number; teks: string; tekan: number; muncul: number; hilang: number }> = ({ t, teks, tekan, muncul, hilang }) => {
  if (t < s(muncul) || t > s(hilang)) return null;
  const masuk = pop(t, s(muncul), 4);
  const ditekan = t >= s(tekan) && t < s(tekan) + 10 ? 0.9 : 1;
  const keluar = 1 - prog(t, s(hilang) - 10, s(hilang), inOut);
  return (
    <>
      <div style={{ position: 'absolute', left: 190, right: 190, bottom: 200, padding: '30px 0', borderRadius: 30, background: 'linear-gradient(#FFD36E,#F29A3A)', boxShadow: `0 ${ditekan < 1 ? 3 : 10}px 0 #9A4E1A, 0 0 40px rgba(255,200,100,0.6)`, textAlign: 'center', fontFamily: bagel.fontFamily, fontSize: 64, color: '#5A2A10', transform: `scale(${Math.max(0, masuk) * ditekan}) translateY(${ditekan < 1 ? 7 : 0}px)`, opacity: keluar }}>{teks}</div>
      <div style={pusatX({ bottom: 130, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 32, color: '#E9DCFF', opacity: keluar })}>Rp40.000 · kantong kertas tertutup</div>
    </>
  );
};

const Hasil: React.FC<{ t: number }> = ({ t }) => {
  const d = t / FPS;
  const x = tarikanSaat(d);
  if (!x) return null;
  const a = s(x.dari);
  const cepat = x.sampai - x.dari < 1;
  const secret = x.id === 'secret';
  const nama = pop(t, a + (cepat ? 4 : 24), 4);
  const bintang = Array.from({ length: x.bintang }, (_, i) => Math.max(0, Math.min(1, pop(t, a + (cepat ? 2 : 36) + i * (cepat ? 2 : 14), 3))));
  return (
    <>
      <div style={pusatX({ top: 250, fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: secret ? 66 : 62, letterSpacing: 10 })}>
        {bintang.map((b, i) => (
          <span key={i} style={{ display: 'inline-block', transform: `scale(${b})`, color: secret ? ['#FF8AB0', '#8AD0FF', '#FFE27A', '#B79CFF', '#7CF0B0'][i] : '#FFD86E', textShadow: '0 0 20px rgba(255,200,80,0.8)' }}>
            {secret ? '✦' : '★'}
          </span>
        ))}
      </div>
      <div style={pusatX({ top: 340, fontFamily: bagel.fontFamily, fontSize: secret ? 120 : 100, color: '#FFF4E0', textShadow: secret ? '0 0 34px rgba(200,160,255,0.95)' : '0 6px 0 #6b3a2a', transform: `scale(${Math.max(0, nama)})` })}>{x.nama}</div>
      <div style={pusatX({ top: secret ? 480 : 460, fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: 40, color: secret ? '#E9DCFF' : x.label === 'SR' ? '#FFB86E' : '#7CF0B0', opacity: Math.max(0, Math.min(1, nama)) })}>
        {secret ? '??? · 1 dari 6' : `${x.label}${x.dari < 7 ? ' · NEW!' : ''}`}
      </div>
    </>
  );
};

const Kilat: React.FC<{ t: number }> = ({ t }) => {
  const d = t / FPS;
  const besar = (at: number) => (d >= at ? Math.exp(-(t - s(at)) / 9) : 0);
  const kecil = TARIKAN.slice(1, 5).reduce((m, x) => Math.max(m, d >= x.dari ? Math.exp(-(t - s(x.dari)) / 5) * 0.5 : 0), 0);
  const putih = Math.max(besar(T.ledak), kecil);
  const pelangi = besar(T.ledak3);
  return (
    <>
      <AbsoluteFill style={{ background: '#FFF6E0', opacity: putih }} />
      <AbsoluteFill style={{ background: 'linear-gradient(135deg,#FF8AB0,#8AD0FF,#FFE27A,#B79CFF)', opacity: pelangi }} />
    </>
  );
};

const Penutup: React.FC<{ t: number }> = ({ t }) => {
  if (t < s(T.akhir)) return null;
  const a = s(T.akhir);
  const logo = pop(t, a + 6, 5);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: `rgba(14,8,24,${0.55 * prog(t, a, a + 15)})` }}>
      <div style={{ fontFamily: bagel.fontFamily, fontSize: 150, color: '#FFF4E0', textShadow: '0 6px 0 #6b3a2a, 0 0 40px rgba(255,190,90,0.6)', transform: `scale(${Math.max(0, logo)})` }}>Jajan Dulu!</div>
      <div style={{ fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: 46, color: '#FFE7A8', marginTop: 24, opacity: prog(t, a + 30, a + 45) }}>Gacha versi pasar.</div>
      <div style={{ fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 36, color: '#E9DCFF', marginTop: 16, opacity: prog(t, a + 45, a + 60) }}>Segera · Pre-order via WA</div>
    </AbsoluteFill>
  );
};

const Suara: React.FC = () => (
  <>
    <BunyiPanjang file="pad" dari={0} lama={s(20)} durasiFile={30} vol={(f) => 0.22 * prog(f, 0, s(1)) * (1 - prog(f, s(19), s(20)))} />
    <Bunyi file="whoosh" dari={0} lama={s(1.4)} vol={0.4} />
    <Bunyi file="shimmer" dari={s(0.2)} lama={s(3)} vol={0.3} />
    {[T.tekan, T.lagi + 0.4, T.tekan3].map((d) => (
      <React.Fragment key={d}>
        <Bunyi file="tick" dari={s(d)} lama={s(0.2)} vol={0.9} />
        <Bunyi file="knock" dari={s(d)} lama={s(0.3)} vol={0.5} />
      </React.Fragment>
    ))}
    <Bunyi file="riser" dari={s(T.getar + 0.5)} lama={s(3.0)} vol={0.5} />
    <Bunyi file="rumble" dari={s(T.getar)} lama={s(3.5)} vol={(f) => 0.35 * prog(f, 0, s(3.5))} />
    <Bunyi file="boom" dari={s(T.ledak)} lama={s(2)} vol={0.6} />
    <Bunyi file="chime" dari={s(T.ledak + 0.1)} lama={s(3)} vol={0.6} />
    {[0, 1, 2, 3].map((i) => (
      <Bunyi key={i} file="ping" dari={s(TARIKAN[0].dari) + 36 + i * 14} lama={s(1.2)} vol={0.45} />
    ))}
    {TARIKAN.slice(1, 5).map((x) => (
      <React.Fragment key={x.id}>
        <Bunyi file="whoosh" dari={s(x.dari) - 6} lama={s(0.8)} vol={0.3} />
        <Bunyi file="ping" dari={s(x.dari) + 4} lama={s(1)} vol={0.5} />
      </React.Fragment>
    ))}
    <Bunyi file="riser" dari={s(T.getar3 - 2.2)} lama={s(3.4)} vol={(f) => 0.6 * prog(f, s(2.0), s(2.4))} />
    <Bunyi file="rumble" dari={s(T.getar3)} lama={s(1.3)} vol={0.45} />
    <Bunyi file="boom" dari={s(T.ledak3)} lama={s(2)} vol={0.7} />
    <Bunyi file="shimmer" dari={s(T.ledak3)} lama={s(3)} vol={0.5} />
    <Bunyi file="cheer" dari={s(T.ledak3 + 0.3)} lama={s(2.5)} vol={(f) => 0.25 * (1 - prog(f, s(1.8), s(2.5)))} />
    <Bunyi file="chime" dari={s(T.akhir + 0.1)} lama={s(1.7)} vol={0.7} />
  </>
);

export const TeaserGacha: React.FC<{ sfx?: boolean; tampilan?: Tampilan }> = ({ sfx = false, tampilan = 'asli' }) => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font gacha'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#0E0818' }} />;
  const d = t / FPS;
  return (
    <AbsoluteFill style={{ background: '#0E0818' }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 34, near: 0.05, far: 200 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan t={t} tampilan={tampilan} />
      </ThreeCanvas>
      <div style={pusatX({ top: 110, fontFamily: bagel.fontFamily, fontSize: 84, color: '#FFE7A8', textShadow: '0 0 30px rgba(255,190,90,0.8), 0 6px 0 #5B2E8C', transform: `scale(${Math.max(0, pop(t, 6, 5))})`, opacity: d < T.akhir ? 1 : 0 })}>GACHA PASAR</div>
      {d < T.getar && <div style={pusatX({ top: 220, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 36, color: '#E9DCFF', opacity: prog(t, 20, 40) * (1 - prog(t, s(T.getar) - 10, s(T.getar))) })}>6 karakter · 1 rahasia</div>}
      <Tombol t={t} teks="TARIK ×1" tekan={T.tekan} muncul={0.6} hilang={T.getar} />
      <Tombol t={t} teks="TARIK LAGI" tekan={T.lagi + 0.4} muncul={T.lagi} hilang={T.cepat} />
      <Tombol t={t} teks="TARIK ×1" tekan={T.tekan3} muncul={T.tekan3 - 0.3} hilang={T.getar3} />
      <Hasil t={t} />
      <Kilat t={t} />
      <Penutup t={t} />
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(8,4,16,0.6) 100%)' }} />
      {sfx && (
        <Sequence layout="none">
          <Suara />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
