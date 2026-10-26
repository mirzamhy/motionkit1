// Teaser Jajan Dulu! (brief: jajan_dulu/konten/brief/00-teaser.md). 3D lewat @remotion/three memakai model yang
// sama dengan web (packages/three/src/jajan). Semua nilai dihitung dari frame, tanpa state antar frame.
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { buatKantong, buatBayangan, buatSorot } from '../../../three/src/jajan/kantong';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { inOut, kf, outE, pop, prog } from './motion';
import { rng } from './kit';
import { TanganMemegang, Tokoh } from './JajanTokoh';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['400', '500'], subsets: ['latin'] });

const FPS = 60;
const s = (detik: number) => Math.round(detik * FPS);

export const JAJAN_TEASER_PROOF_FRAMES = s(5.5);

/** Satu nilai yang naik halus dari a ke b di antara dua frame. */
const antara = (t: number, f0: number, f1: number, a: number, b: number, ease = inOut) => a + (b - a) * prog(t, f0, f1, ease);

/** Getaran singkat yang mereda: dipakai untuk kantong yang "bergerak sendiri". */
const getar = (t: number, mulai: number, lama: number, kuat: number) => {
  if (t < mulai || t > mulai + lama) return 0;
  const p = (t - mulai) / lama;
  return Math.sin(p * Math.PI * 7) * kuat * (1 - p) * Math.min(1, p * 8);
};

const Adegan: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();

  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.22));
    // Lampu sorot hangat dari atas: satu-satunya cahaya kuat di ruangan gelap.
    gl.toneMappingExposure = 0.82;
    const sorotAtas = new THREE.SpotLight('#ffd6a0', 120, 14, 0.4, 0.75, 1.3);
    sorotAtas.position.set(-2.2, 6.2, 1.6);
    sorotAtas.target.position.set(0, 0.9, 0);
    g.add(sorotAtas, sorotAtas.target);
    const kantong = buatKantong();
    const wadah = new THREE.Group();
    wadah.add(kantong.grup);
    g.add(wadah);
    g.add(buatSorot(5));
    g.add(buatBayangan(2.6));
    return { g, kantong, wadah };
  }, [gl, scene]);

  // Kamera: dorongan pelan di shot 1, lalu dekat ke tutup di shot 2.
  const shot2 = prog(t, s(2.9), s(3.3), inOut);
  const z = antara(t, 0, s(3.0), 11.5, 9.2) * (1 - shot2) + antara(t, s(3.0), s(5.5), 7.6, 7.0) * shot2;
  const y = 2.7 * (1 - shot2) + 3.4 * shot2;
  const lihatY = 1.0 * (1 - shot2) + 1.85 * shot2;
  camera.position.set(0, y, z);
  camera.lookAt(0, lihatY, 0);

  // Kantong berputar seperempat putaran sampai label menghadap depan.
  // Berhenti di sudut tiga-perempat supaya sisi kantong terlihat dan bentuknya terasa 3D.
  const putar = antara(t, 0, s(2.6), -1.3, -0.32, outE);
  const g1 = getar(t, s(3.4), s(0.5), 1);
  const g2 = getar(t, s(4.3), s(0.55), 1.3);
  isi.wadah.rotation.set(0, putar + (g1 + g2) * 0.03, (g1 + g2) * 0.045);
  isi.wadah.position.y = Math.abs(g1 + g2) * 0.05;

  // Tutup terangkat sedikit tiap kali kantong bergetar, cahaya hangat bocor dari celahnya.
  const celah = Math.max(0, Math.abs(g1) * 0.09 + Math.abs(g2) * 0.13) + antara(t, s(3.3), s(5.5), 0, 0.06);
  isi.kantong.setBuka(celah);
  isi.kantong.setCahaya(Math.min(1.4, celah * 14));

  return <primitive object={isi.g} />;
};

export const JajanTeaserProof: React.FC = () => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font Jajan Dulu!'));

  // Tekstur label digambar ke canvas, jadi font harus sudah ada sebelum model dibuat.
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);

  const teks1 = prog(t, s(0.8), s(1.2)) * (1 - prog(t, s(2.7), s(3.0), inOut));

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, #3a2219 0%, #1E1411 55%, #120b09 100%)' }}>
      {siap && (
        <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true }}>
          <Adegan t={t} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 240 }}>
        <div
          style={{
            fontFamily: poppins.fontFamily,
            fontWeight: 500,
            fontSize: 58,
            color: '#FFF8F1',
            opacity: teks1,
            transform: `translateY(${(1 - prog(t, s(0.8), s(1.3), outE)) * 20}px)`,
            textAlign: 'center',
            maxWidth: 860,
          }}
        >
          Ada sesuatu di dalam kantong ini.
        </div>
      </AbsoluteFill>
      {/* Butiran film tipis, statis. */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <filter id="jt-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#jt-grain)" opacity={0.12} style={{ mixBlendMode: 'overlay' }} />
        </svg>
      </AbsoluteFill>
      <span style={{ display: 'none' }}>{gochi.fontFamily}{bagel.fontFamily}</span>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Shot 7: wajah tokoh diterangi cahaya dari kantong yang dibuka. Gelembung pikiran (klepon, onde-onde) pecah.

export const JAJAN_SHOT7_FRAMES = s(3.5);

const KantongTerbuka: React.FC<{ cahaya: number; t: number }> = ({ cahaya, t }) => {
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.25));
    gl.toneMappingExposure = 0.85;
    const kantong = buatKantong();
    g.add(kantong.grup);
    return { g, kantong };
  }, [gl, scene]);
  // Kamera di atas mulut kantong: kantong berada di bawah frame, wajah di atasnya.
  // Jarak 9: lebar kantong sekitar setengah layar, mulutnya jatuh di sekitar y 1500 dari 1920.
  camera.position.set(0, 4.1, 9 - prog(t, 0, s(3.5), inOut) * 0.4);
  camera.lookAt(0, 3.25, 0);
  isi.kantong.grup.rotation.y = -0.12;
  // Tutup terbuka penuh dan menggantung di belakang supaya tidak menutupi leher tokoh.
  isi.kantong.setBuka(1);
  isi.kantong.setCahaya(cahaya);
  return <primitive object={isi.g} />;
};

/** Gelembung pikiran berisi klepon dan onde-onde, digambar sederhana. */
const Gelembung: React.FC<{ t: number; pecah: number }> = ({ t, pecah }) => {
  const R = rng(4);
  const serpih = Array.from({ length: 12 }, () => ({ a: R() * Math.PI * 2, d: 140 + R() * 120, r: 8 + R() * 14 }));
  const skala = 1 + 0.12 * prog(t, s(1.2), s(1.45), outE);
  const terlihat = 1 - prog(pecah, 0, 0.15, inOut);
  return (
    <g>
      <g transform={`translate(800 330) scale(${skala})`} opacity={terlihat}>
        <circle cx={-170} cy={250} r={18} fill="#FFF8F1" />
        <circle cx={-120} cy={190} r={28} fill="#FFF8F1" />
        {[
          [0, 0, 150],
          [-110, 20, 95],
          [110, 25, 100],
          [-60, -80, 90],
          [70, -85, 95],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#FFF8F1" />
        ))}
        {/* klepon */}
        <circle cx={-55} cy={10} r={58} fill="#86BC4E" />
        <circle cx={-72} cy={-8} r={20} fill="#A9D27A" opacity={0.7} />
        {[[-80, -25], [-50, -35], [-30, -15], [-65, 5], [-40, 10]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={18} height={6} rx={3} fill="#FFFFFF" transform={`rotate(${i * 37} ${x + 9} ${y + 3})`} />
        ))}
        {/* onde-onde */}
        <circle cx={60} cy={20} r={56} fill="#EAA53C" />
        <circle cx={44} cy={2} r={18} fill="#F5C676" opacity={0.7} />
        {[[40, -10], [70, -15], [85, 15], [55, 35], [30, 25], [75, 45], [60, 5]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={7} ry={3} fill="#FBF0D8" transform={`rotate(${i * 50} ${x} ${y})`} />
        ))}
        {/* uap */}
        <path d="M-60 -70 c -10 -20 10 -30 0 -50 M60 -60 c -10 -20 10 -30 0 -50" fill="none" stroke="#D8C7B8" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      </g>
      {pecah > 0 &&
        serpih.map((p, i) => {
          const k = prog(pecah, 0, 1, outE);
          return (
            <circle
              key={i}
              cx={800 + Math.cos(p.a) * p.d * k}
              cy={330 + Math.sin(p.a) * p.d * k}
              r={p.r * (1 - k)}
              fill="#FFF8F1"
              opacity={1 - k}
            />
          );
        })}
    </g>
  );
};

/** Debu kecil yang melayang naik di berkas cahaya, posisinya dihitung dari frame. */
const Debu: React.FC<{ t: number; cahaya: number }> = ({ t, cahaya }) => {
  const R = rng(9);
  return (
    <g opacity={cahaya}>
      {Array.from({ length: 26 }, (_, i) => {
        const x0 = 380 + R() * 320;
        const kec = 0.6 + R() * 1.2;
        const fase = R() * 900;
        const y = 1500 - ((t * kec + fase) % 900);
        const r = 2 + R() * 4;
        return <circle key={i} cx={x0 + Math.sin((t + fase) / 40) * 14} cy={y} r={r} fill="#FFE2A6" opacity={0.35 + 0.4 * Math.sin((y / 900) * Math.PI)} />;
      })}
    </g>
  );
};

export const JajanTeaserShot7: React.FC = () => {
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

  // Alur 3,5 detik: cahaya naik, gelembung membesar lalu pecah, wajah berubah kaget.
  const cahaya = kf(t, [
    [0, 0.15],
    [s(0.4), 0.3],
    [s(1.5), 1.0],
    [s(3.5), 1.1],
  ]) * (1 + 0.04 * Math.sin(t / 5));
  const pecah = prog(t, s(1.45), s(2.1), (x) => x);
  const kaget = Math.min(1, pop(t, s(1.55), 5));
  const dorong = 1 + prog(t, 0, s(3.5), inOut) * 0.06;

  return (
    <AbsoluteFill style={{ background: '#1A110D' }}>
      {/* Latar kelas yang sudah gelap: jendela sore di kiri, papan tulis di kanan */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="s7-dinding" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2E201A" />
            <stop offset="1" stopColor="#1A110D" />
          </linearGradient>
          <linearGradient id="s7-jendela" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E8955A" />
            <stop offset="1" stopColor="#A9542E" />
          </linearGradient>
        </defs>
        <g transform={`translate(540 960) scale(${dorong * 1.02}) translate(-540 -960)`}>
          <rect width={1080} height={1920} fill="url(#s7-dinding)" />
          <rect x={-40} y={180} width={300} height={520} fill="url(#s7-jendela)" opacity={0.35} />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={-40} y={200 + i * 56} width={300} height={10} fill="#2A1B14" opacity={0.6} />
          ))}
          <rect x={860} y={240} width={260} height={420} fill="#1F2A22" opacity={0.6} />
          <rect x={860} y={240} width={260} height={420} fill="none" stroke="#3A2A20" strokeWidth={14} />
        </g>
      </svg>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 960) scale(${dorong}) translate(-540 -960)`}>
          <Tokoh kaget={kaget} cahaya={cahaya} lirik={0} />
        </g>
      </svg>

      {siap && (
        <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true }} style={{ position: 'absolute', inset: 0 }}>
          <KantongTerbuka cahaya={cahaya} t={t} />
        </ThreeCanvas>
      )}

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(540 960) scale(${dorong}) translate(-540 -960)`}>
          <TanganMemegang cahaya={cahaya} y={1640} />
          <Debu t={t} cahaya={cahaya} />
          <Gelembung t={t} pecah={pecah} />
        </g>
      </svg>

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <filter id="s7-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#s7-grain)" opacity={0.12} style={{ mixBlendMode: 'overlay' }} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
