// Teaser "DICARI!" Jajan Dulu! (brief: jajan_dulu/konten/brief/00-teaser.md).
// Shot 3: dari atas, daun pisang di tampah. Kaca pembesar menemukan serutan kelapa, lalu biji wijen.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { loadFont as loadElite } from '@remotion/google-fonts/SpecialElite';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { inOut, kf, outE, pop, prog } from './motion';
import { n1, rng } from './kit';

const elite = loadElite('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['500'], subsets: ['latin'] });

const FPS = 60;
const s = (d: number) => Math.round(d * FPS);
export const DICARI_SHOT3_FRAMES = s(3.5);

const DAUN = '#4F7A2B';
const DAUN_GELAP = '#37581D';
const DAUN_TERANG = '#78A346';

// Posisi barang bukti di atas daun.
const KELAPA = { x: 400, y: 720 };
const WIJEN = { x: 660, y: 1250 };

/** Tampah bambu anyam di bawah daun; hanya terlihat di sudut dan di sobekan daun. */
const Tampah: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#B88A55" />
    <rect width={1080} height={1920} fill="url(#dc-anyam)" />
    <circle cx={540} cy={960} r={1180} fill="none" stroke="#8C6237" strokeWidth={60} />
  </g>
);

/** Daun pisang dari atas: tulang daun di tengah, urat sejajar, dan dua sobekan khas daun pisang. */
const Daun: React.FC = () => {
  const R = rng(21);
  // Tulang daun: diagonal dari kiri atas ke kanan bawah.
  const ax = 140;
  const ay = -120;
  const bx = 960;
  const by = 2050;
  const panjang = Math.hypot(bx - ax, by - ay);
  const ux = (bx - ax) / panjang;
  const uy = (by - ay) / panjang;
  const nx = -uy;
  const ny = ux;
  const urat = Array.from({ length: 120 }, (_, i) => {
    const t = (i + R() * 0.6) / 120;
    const px = ax + (bx - ax) * t;
    const py = ay + (by - ay) * t;
    const gelap = R() > 0.55;
    return (
      <g key={i} opacity={0.5 + R() * 0.3}>
        <line x1={px} y1={py} x2={px + nx * 900 + ux * 160} y2={py + ny * 900 + uy * 160} stroke={gelap ? DAUN_GELAP : DAUN_TERANG} strokeWidth={gelap ? 2.2 : 1.6} />
        <line x1={px} y1={py} x2={px - nx * 900 + ux * 160} y2={py - ny * 900 + uy * 160} stroke={gelap ? DAUN_GELAP : DAUN_TERANG} strokeWidth={gelap ? 2.2 : 1.6} />
      </g>
    );
  });
  // Sobekan: celah sempit sejajar urat yang memperlihatkan anyaman di bawahnya.
  const sobek = (t: number, sisi: number, len: number) => {
    const px = ax + (bx - ax) * t;
    const py = ay + (by - ay) * t;
    const dx = (nx * sisi + ux * 0.18) * len;
    const dy = (ny * sisi + uy * 0.18) * len;
    const s0 = 70 * sisi;
    return `M${n1(px + nx * s0)} ${n1(py + ny * s0)} L${n1(px + nx * s0 + dx)} ${n1(py + ny * s0 + dy)} L${n1(px + nx * s0 + dx + ux * 14)} ${n1(py + ny * s0 + dy + uy * 14)} Z`;
  };
  return (
    <g>
      <rect x={-200} y={-200} width={1480} height={2320} fill={DAUN} />
      <rect x={-200} y={-200} width={1480} height={2320} fill="url(#dc-kilap)" />
      {urat}
      <path d={sobek(0.2, 1, 620)} fill="#5A3E22" />
      <path d={sobek(0.72, -1, 520)} fill="#5A3E22" />
      {/* tulang daun: lebar, lebih terang, dengan bayangan di satu sisi */}
      <path d={`M${ax + nx * 16} ${ay + ny * 16} L${bx + nx * 16} ${by + ny * 16}`} stroke={DAUN_GELAP} strokeWidth={10} opacity={0.6} />
      <path d={`M${ax} ${ay} L${bx} ${by}`} stroke="#9CBF63" strokeWidth={26} strokeLinecap="round" />
      <path d={`M${ax - nx * 6} ${ay - ny * 6} L${bx - nx * 6} ${by - ny * 6}`} stroke="#C4DB8E" strokeWidth={6} opacity={0.7} />
    </g>
  );
};

/** Serutan kelapa parut: potongan putih panjang, sebagian bertumpuk, dengan bayangan kecil. */
const Kelapa: React.FC = () => {
  const R = rng(5);
  return (
    <g>
      {Array.from({ length: 46 }, (_, i) => {
        // Serutan menumpuk di tengah dan makin jarang ke pinggir; tiap serutan sedikit melengkung.
        const a = R() * Math.PI * 2;
        const d = Math.pow(R(), 1.4) * 90;
        const x = KELAPA.x + Math.cos(a) * d;
        const y = KELAPA.y + Math.sin(a) * d * 0.8;
        const rot = R() * 180;
        const w = 12 + R() * 12;
        const lengkung = (R() - 0.5) * 8;
        const jalur = `M${n1(-w / 2)} 0 Q 0 ${n1(lengkung)} ${n1(w / 2)} 0`;
        return (
          <g key={i} transform={`translate(${n1(x)} ${n1(y)}) rotate(${rot.toFixed(0)})`}>
            <path d={jalur} transform="translate(2 2.5)" fill="none" stroke="#1F3110" strokeOpacity={0.35} strokeWidth={5} strokeLinecap="round" />
            <path d={jalur} fill="none" stroke="#FBF8F0" strokeWidth={5} strokeLinecap="round" />
            <path d={jalur} transform="translate(0 -1.2)" fill="none" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" />
          </g>
        );
      })}
      {/* sebutir remah ketan hijau di dekatnya */}
      <circle cx={KELAPA.x + 70} cy={KELAPA.y + 60} r={7} fill="#86BC4E" />
      <circle cx={KELAPA.x + 72} cy={KELAPA.y + 62} r={7} fill="#1F3110" opacity={0.25} />
    </g>
  );
};

/** Biji wijen: lonjong kecil krem dengan ujung meruncing. */
const Wijen: React.FC = () => {
  const R = rng(8);
  return (
    <g>
      {Array.from({ length: 26 }, (_, i) => {
        const a = R() * Math.PI * 2;
        const d = Math.sqrt(R()) * 85;
        const x = WIJEN.x + Math.cos(a) * d;
        const y = WIJEN.y + Math.sin(a) * d;
        const rot = R() * 180;
        return (
          <g key={i} transform={`translate(${n1(x)} ${n1(y)}) rotate(${rot.toFixed(0)})`}>
            <ellipse cx={1.5} cy={2} rx={7} ry={3.4} fill="#1F3110" opacity={0.35} />
            <ellipse rx={7} ry={3.4} fill="#F4E4C1" />
            <ellipse cx={-1.5} cy={-0.8} rx={3.5} ry={1.2} fill="#FFF8E8" />
          </g>
        );
      })}
    </g>
  );
};

const Meja: React.FC = () => (
  <g>
    <Tampah />
    <Daun />
    <Kelapa />
    <Wijen />
  </g>
);

/** Label kertas barang bukti yang diikat benang ke temuan. */
const Label: React.FC<{ x: number; y: number; ke: { x: number; y: number }; judul: string; muncul: number; miring: number }> = ({ x, y, ke, judul, muncul, miring }) => {
  if (muncul <= 0) return null;
  const k = Math.min(1.05, muncul);
  return (
    <g opacity={Math.min(1, muncul * 2)}>
      <path d={`M${ke.x} ${ke.y} Q ${(ke.x + x) / 2} ${Math.max(ke.y, y) + 60} ${x} ${y}`} fill="none" stroke="#E9DDC4" strokeWidth={3} />
      <g transform={`translate(${x} ${y}) rotate(${miring}) scale(${k})`}>
        <rect x={-150} y={-62} width={300} height={124} rx={6} fill="#000" opacity={0.25} transform="translate(8 10)" />
        <rect x={-150} y={-62} width={300} height={124} rx={6} fill="#F3EAD8" />
        <rect x={-150} y={-62} width={300} height={124} rx={6} fill="none" stroke="#C9B48E" strokeWidth={3} />
        <circle cx={-122} cy={0} r={9} fill="#B88A55" stroke="#8C6237" strokeWidth={3} />
        <text x={-96} y={-14} fontFamily={elite.fontFamily} fontSize={26} fill="#9E2A1E" letterSpacing={2}>
          BARANG BUKTI
        </text>
        <text x={-96} y={30} fontFamily={elite.fontFamily} fontSize={36} fill="#3B2620">
          {judul}
        </text>
      </g>
    </g>
  );
};

const KacaPembesar: React.FC<{ x: number; y: number; r: number; zoom: number }> = ({ x, y, r, zoom }) => (
  <g>
    <defs>
      <clipPath id="dc-lensa">
        <circle cx={x} cy={y} r={r} />
      </clipPath>
    </defs>
    {/* bayangan kaca pembesar di atas daun */}
    <circle cx={x + 46} cy={y + 60} r={r + 14} fill="#000" opacity={0.2} />
    <path d={`M${x + 46 + r * 0.72} ${y + 60 + r * 0.72} l 300 300`} stroke="#000" strokeWidth={60} strokeLinecap="round" opacity={0.18} />
    {/* isi lensa: meja yang sama, diperbesar di sekitar pusat lensa */}
    <g clipPath="url(#dc-lensa)">
      <g transform={`translate(${n1(x)} ${n1(y)}) scale(${zoom}) translate(${n1(-x)} ${n1(-y)})`}>
        <Meja />
      </g>
      <circle cx={x} cy={y} r={r} fill="url(#dc-kaca)" />
    </g>
    {/* gagang kayu dan cincin kuningan */}
    <path d={`M${x + r * 0.74} ${y + r * 0.74} l 300 300`} stroke="#3B2418" strokeWidth={56} strokeLinecap="round" />
    <path d={`M${x + r * 0.74} ${y + r * 0.74} l 300 300`} stroke="#5A3826" strokeWidth={20} strokeLinecap="round" transform="translate(-10 -6)" />
    <path d={`M${x + r * 0.7} ${y + r * 0.7} l 40 40`} stroke="url(#dc-kuningan)" strokeWidth={64} />
    <circle cx={x} cy={y} r={r + 13} fill="none" stroke="url(#dc-kuningan)" strokeWidth={26} />
    <circle cx={x} cy={y} r={r} fill="none" stroke="#5E4520" strokeWidth={3} />
    {/* kilau kaca */}
    <path d={`M${x - r * 0.62} ${y - r * 0.35} A ${r * 0.75} ${r * 0.75} 0 0 1 ${x - r * 0.1} ${y - r * 0.72}`} fill="none" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" opacity={0.45} />
  </g>
);

export const DicariShot3: React.FC = () => {
  const t = useCurrentFrame();

  // Lensa: masuk dari kanan, berhenti di kelapa, lalu meluncur ke wijen.
  const lx = kf(t, [
    [0, 1360],
    [s(0.75), KELAPA.x, outE],
    [s(1.6), KELAPA.x + 8],
    [s(2.35), WIJEN.x, inOut],
    [s(3.5), WIJEN.x + 10],
  ]);
  const ly = kf(t, [
    [0, 1020],
    [s(0.75), KELAPA.y, outE],
    [s(1.6), KELAPA.y - 6],
    [s(2.35), WIJEN.y, inOut],
    [s(3.5), WIJEN.y + 6],
  ]);
  const kamera = 1 + prog(t, 0, s(3.5), inOut) * 0.05;
  const label1 = pop(t, s(1.0), 4);
  const label2 = pop(t, s(2.5), 4);

  const cap1 = prog(t, s(0.3), s(0.55)) * (1 - prog(t, s(1.9), s(2.1), inOut));
  const cap2 = prog(t, s(2.15), s(2.4));

  return (
    <AbsoluteFill style={{ background: '#2A1B12' }}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <defs>
          <pattern id="dc-anyam" width={60} height={60} patternUnits="userSpaceOnUse">
            <rect width={30} height={60} fill="#C99C63" />
            <rect x={30} width={30} height={60} fill="#A97A45" />
            <rect y={0} width={60} height={30} fill="#B88A55" opacity={0.6} />
            <path d="M0 30 H60 M30 0 V60" stroke="#7E5630" strokeWidth={2} />
          </pattern>
          <linearGradient id="dc-kilap" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.16} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="1" stopColor="#000000" stopOpacity={0.18} />
          </linearGradient>
          <radialGradient id="dc-kaca" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.75" stopColor="#E8F2FF" stopOpacity={0.04} />
            <stop offset="1" stopColor="#1A120A" stopOpacity={0.35} />
          </radialGradient>
          <linearGradient id="dc-kuningan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E9C77D" />
            <stop offset="0.5" stopColor="#A9803E" />
            <stop offset="1" stopColor="#6E4F22" />
          </linearGradient>
          <radialGradient id="dc-vinyet" cx="0.42" cy="0.4" r="0.8">
            <stop offset="0.45" stopColor="#1A0F08" stopOpacity={0} />
            <stop offset="1" stopColor="#1A0F08" stopOpacity={0.7} />
          </radialGradient>
          <linearGradient id="dc-pagi" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE2B0" stopOpacity={0.28} />
            <stop offset="0.6" stopColor="#FFE2B0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(540 960) scale(${kamera}) translate(-540 -960)`}>
          <Meja />
          <Label x={KELAPA.x + 170} y={KELAPA.y - 230} ke={KELAPA} judul="kelapa parut" muncul={label1} miring={-6} />
          <Label x={WIJEN.x - 330} y={WIJEN.y - 230} ke={WIJEN} judul="wijen" muncul={label2} miring={5} />
          <KacaPembesar x={lx} y={ly} r={210} zoom={2.6} />
        </g>
        {/* cahaya pagi dari kiri atas dan vinyet */}
        <rect width={1080} height={1920} fill="url(#dc-pagi)" />
        <rect width={1080} height={1920} fill="url(#dc-vinyet)" />
      </svg>

      {[
        { teks: 'Barang bukti pertama: kelapa parut.', o: cap1 },
        { teks: 'Lalu… wijen.', o: cap2 },
      ].map((c) => (
        <div
          key={c.teks}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 230,
            display: 'flex',
            justifyContent: 'center',
            opacity: c.o,
            transform: `translateY(${n1((1 - c.o) * 14)}px)`,
          }}
        >
          <div style={{ padding: '16px 30px', borderRadius: 14, background: 'rgba(18,12,8,0.82)', fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 46, color: '#FFF8F1' }}>{c.teks}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
