// UNAIR film, shots 5–7 and 9: the gate through the 1940s, the 1954 decree and map, the statue, the campus today.
import React from 'react';
import { inOut, outE, prog, typed } from '../engine/util';
import { Cloud, Foliage, bump, lerp, n1, rng } from './kit';
import { Arca, Flag, GOLD, JAR, MERAH_PUTIH, OUTFITS, OUTFITS_1954, UNAIR_BANDS, Walker } from './UnairParts';
import { JavaMap } from './UnairMap';
import { type F, GROUND, H, NiasBuilding, W } from './UnairScene';

// ───────────────────────────── the gate, 1941 → 1948 ─────────────────────────────
const NL = ['#AE1C28', '#FFFFFF', '#21468B'];

export const GateYears: React.FC<{ u: number; f: F; a?: number }> = ({ u, f, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  // beats: 1941 (Dutch flag, school open) · 1942 (Japanese flag, door boarded) · 1945 (flag comes down) · 1948 (new name, door open)
  const y42 = prog(u, 150, 190, inOut);
  const up42 = prog(u, 200, 250, inOut);
  const board = prog(u, 230, 280, outE) * (1 - prog(u, 520, 570, inOut));
  const down45 = prog(u, 350, 410, inOut);
  const sign = prog(u, 540, 590, inOut);
  const year = u < 170 ? 1941 : u < 370 ? 1942 : u < 520 ? 1945 : 1948;
  const yearSwap = Math.max(bump(u, 160, 180), bump(u, 360, 380), bump(u, 510, 530));
  const flagY = lerp(lerp(lerp(440, 700, y42), 440, up42), 700, down45);
  const japan = u >= 195;
  const z = lerp(2.5, 2.9, prog(u, 0, 780, inOut));
  return (
    <g>
      <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(-1110 -610)`}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#un-sky)" />
        <rect x={-300} y={GROUND} width={W + 600} height={600} fill="url(#un-lawn)" />
        <NiasBuilding
          f={f}
          plate={
            <>
              <g opacity={1 - sign}>
                <text x={1076} y={546} textAnchor="middle" fontFamily={f.disp} fontSize={16} fontWeight={700} letterSpacing={2.4} fill="#2A2018">NED-INDISCHE</text>
                <text x={1076} y={566} textAnchor="middle" fontFamily={f.disp} fontSize={16} fontWeight={700} letterSpacing={2} fill="#2A2018">ARTSENSCHOOL</text>
              </g>
              <g opacity={sign}>
                <text x={1076} y={544} textAnchor="middle" fontFamily={f.disp} fontSize={13.5} fontWeight={700} letterSpacing={1.6} fill="#2A2018">UNIVERSITEIT</text>
                <text x={1076} y={562} textAnchor="middle" fontFamily={f.disp} fontSize={13.5} fontWeight={700} letterSpacing={1.2} fill="#2A2018">VAN INDONESIË</text>
                <text x={1076} y={576} textAnchor="middle" fontFamily={f.disp} fontSize={8} fontWeight={600} letterSpacing={1.6} fill="#5E4A36">FACULTEIT DER GENEESKUNDE</text>
              </g>
            </>
          }
        />
        <path d="M 1010 802 L 1150 802 L 1260 1300 L 900 1300 Z" fill="url(#un-drive)" />
        {/* the door, boarded up in 1942 */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${n1((1 - board) * (i % 2 ? 140 : -140))} 0) rotate(${[-9, 7, -4][i]} 1076 ${690 + i * 36})`} opacity={board}>
            <rect x={1018} y={680 + i * 36} width={116} height={17} fill="#8A6238" />
            <rect x={1018} y={680 + i * 36} width={116} height={4} fill="#B08A56" />
            <circle cx={1026} cy={688 + i * 36} r={2.2} fill="#2A2018" />
            <circle cx={1126} cy={688 + i * 36} r={2.2} fill="#2A2018" />
          </g>
        ))}
        {/* flagpole beside the gate */}
        <rect x={1232} y={424} width={6} height={GROUND - 424 + 10} fill="#E8E0CC" />
        <rect x={1236} y={424} width={2} height={GROUND - 424 + 10} fill="#9A8C72" />
        <circle cx={1235} cy={420} r={6} fill="#C9A24E" />
        <g opacity={1 - prog(u, 404, 412)}>
          {japan ? (
            <g>
              <Flag x={1240} y={flagY} w={96} h={60} bands={['#FAFAF5']} t={am} />
              <circle cx={1288} cy={flagY + 30 + 2.5 * Math.sin(u / 8 - 3)} r={17} fill="#BC002D" />
            </g>
          ) : (
            <Flag x={1240} y={flagY} w={96} h={60} bands={NL} t={am} />
          )}
        </g>
        {/* 1948: students come back through the gate */}
        {[0, 1, 2].map((i) => {
          const p = prog(u, 560 + i * 70, 800 + i * 70, (x) => x);
          if (p <= 0) return null;
          return (
            <g key={i} opacity={1 - prog(p, 0.88, 1, (x) => x)}>
              <Walker x={lerp(1010 + i * 70, 1076, p)} y={lerp(1010, 812, p)} s={lerp(1.1, 0.5, p)} t={am} ph={i * 2} o={OUTFITS_1954[(i + 1) % 4]} />
            </g>
          );
        })}
      </g>
      {/* the year, big, typewritten: it jumps as the regime changes */}
      <g opacity={1 - 0.6 * yearSwap} transform={`translate(0 ${n1(-10 * yearSwap)})`}>
        <text x={96} y={246} fontFamily={f.mono} fontSize={170} fill="#1A120A" opacity={0.45}>{year}</text>
        <text x={90} y={240} fontFamily={f.mono} fontSize={170} fill="#FBF6EA">{year}</text>
      </g>
    </g>
  );
};

// ───────────────────────────── the decree, 1 November 1954, then the map ─────────────────────────────

// the signature flourish as sampled points, so the pen can follow it by arc length exactly as the ink does
const SIG = [[70, 372], [110, 320], [130, 400], [160, 350], [180, 316], [196, 398], [226, 352], [250, 316], [262, 392], [300, 350], [330, 320], [350, 372], [392, 344]];
const SIG_PATH = `M ${SIG[0].join(' ')} ` + [0, 1, 2, 3].map((k) => `C ${SIG[k * 3 + 1].join(' ')}, ${SIG[k * 3 + 2].join(' ')}, ${SIG[k * 3 + 3].join(' ')}`).join(' ');
const SIG_SAMPLES = (() => {
  const pts: [number, number, number][] = [];
  let len = 0;
  for (let k = 0; k < 4; k++) {
    const [p0, c1, c2, p3] = [SIG[k * 3], SIG[k * 3 + 1], SIG[k * 3 + 2], SIG[k * 3 + 3]];
    for (let i = k === 0 ? 0 : 1; i <= 40; i++) {
      const q = i / 40;
      const m = 1 - q;
      const x = m * m * m * p0[0] + 3 * m * m * q * c1[0] + 3 * m * q * q * c2[0] + q * q * q * p3[0];
      const y = m * m * m * p0[1] + 3 * m * m * q * c1[1] + 3 * m * q * q * c2[1] + q * q * q * p3[1];
      if (pts.length) len += Math.hypot(x - pts[pts.length - 1][0], y - pts[pts.length - 1][1]);
      pts.push([x, y, len]);
    }
  }
  return pts;
})();
const sigAt = (p: number): [number, number] => {
  const target = p * SIG_SAMPLES[SIG_SAMPLES.length - 1][2];
  for (let i = 1; i < SIG_SAMPLES.length; i++) {
    if (SIG_SAMPLES[i][2] >= target) {
      const [a, b] = [SIG_SAMPLES[i - 1], SIG_SAMPLES[i]];
      const k = (target - a[2]) / (b[2] - a[2] || 1);
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    }
  }
  return [SIG_SAMPLES[SIG_SAMPLES.length - 1][0], SIG_SAMPLES[SIG_SAMPLES.length - 1][1]];
};

export const Decree: React.FC<{ u: number; f: F; a?: number }> = ({ u, f, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  const R = rng(81);
  const grain = Array.from({ length: 24 }, () => ({ y: R() * H, x: R() * W, w: 300 + R() * 900, o: 0.05 + R() * 0.1 }));
  const sig = prog(u, 150, 230, inOut);
  const stamp = prog(u, 246, 254, outE);
  const map = prog(u, 330, 400, inOut);
  const mu = u - 400;
  const z = lerp(1.0, 1.06, prog(u, 0, 780, inOut));
  // the pen follows the signature
  const [penX, penY] = sigAt(sig);
  return (
    <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(-960 -540)`}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#u2-wood)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 400} filter="url(#u2-woodgrain)" opacity={0.8} />
      {grain.map((g, i) => (
        <rect key={i} x={g.x} y={g.y} width={g.w} height={2} rx={1} fill="#2A1A10" opacity={g.o} />
      ))}
      <ellipse cx={700} cy={380} rx={1200} ry={800} fill="#FFD890" opacity={0.14} style={{ mixBlendMode: 'screen' }} />
      {/* inkwell and blotter */}
      <circle cx={1700} cy={220} r={70} fill="#000" opacity={0.4} filter="url(#u2-blur)" />
      <circle cx={1700} cy={210} r={64} fill="#1F1A14" />
      <circle cx={1700} cy={210} r={40} fill="#0B0B14" />
      <path d="M 1676 196 A 30 30 0 0 1 1706 180" fill="none" stroke="#5A6A9A" strokeWidth={5} strokeLinecap="round" />
      {/* the document */}
      <g transform="translate(700 560) rotate(-2)">
        <rect x={-416} y={-470} width={840} height={960} fill="#000" opacity={0.4} filter="url(#u2-blur)" />
        <rect x={-420} y={-480} width={840} height={960} fill="url(#u2-paper)" />
        <text x={0} y={-390} textAnchor="middle" fontFamily={f.mono} fontSize={40} fill="#1F1A14">{typed('PERATURAN PEMERINTAH', u, 14, 0.6)}</text>
        <text x={0} y={-334} textAnchor="middle" fontFamily={f.mono} fontSize={34} fill="#1F1A14">{typed('No. 57 TAHUN 1954', u, 52, 0.6)}</text>
        <text x={0} y={-282} textAnchor="middle" fontFamily={f.mono} fontSize={24} fill="#5E4A36">{typed('tentang', u, 84, 0.6)}</text>
        <text x={0} y={-228} textAnchor="middle" fontFamily={f.mono} fontSize={30} fill="#1F1A14">{typed('PENDIRIAN UNIVERSITAS AIRLANGGA', u, 96, 0.7)}</text>
        <text x={0} y={-186} textAnchor="middle" fontFamily={f.mono} fontSize={30} fill="#1F1A14">{typed('DI SURABAJA', u, 142, 0.7)}</text>
        <rect x={-150} y={-160} width={300} height={2} fill="#1F1A14" opacity={0.5} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-340} y={-110 + i * 30} width={[680, 640, 676, 600, 0, 668, 630, 680, 420][i] * prog(u, 20 + i * 8, 60 + i * 8, inOut)} height={7} rx={2} fill="#1F1A14" opacity={0.3} />
        ))}
        <text x={60} y={214} fontFamily={f.mono} fontSize={22} fill="#1F1A14" opacity={prog(u, 110, 124)}>Ditetapkan di Djakarta</text>
        <text x={60} y={246} fontFamily={f.mono} fontSize={22} fill="#1F1A14" opacity={prog(u, 118, 132)}>pada tanggal 1 Nopember 1954</text>
        <text x={60} y={292} fontFamily={f.mono} fontSize={20} fill="#1F1A14" opacity={prog(u, 126, 140)}>PRESIDEN REPUBLIK INDONESIA,</text>
        {/* a signature flourish (generic loops, not a copy of the real one) */}
        <path d={SIG_PATH} pathLength={1} fill="none" stroke="#14213A" strokeWidth={4.5} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - sig} />
        <text x={60} y={420} fontFamily={f.mono} fontSize={22} fill="#1F1A14" opacity={prog(u, 236, 250)}>SOEKARNO</text>
        {/* fountain pen: its nib rides the end of the ink line */}
        <g transform={`translate(${n1(penX)} ${n1(penY)}) rotate(-52)`} opacity={prog(u, 130, 146) * (1 - prog(u, 236, 256))}>
          <ellipse cx={150} cy={22} rx={150} ry={10} fill="#000" opacity={0.18} />
          <path d="M 0 0 L 34 -8 L 34 8 Z" fill="#C9A24E" />
          <path d="M 4 0 L 30 0" stroke="#5E4A1E" strokeWidth={1.4} />
          <rect x={34} y={-10} width={250} height={20} rx={10} fill="#14213A" />
          <rect x={34} y={-10} width={250} height={6} rx={3} fill="#3A4A7A" />
          <rect x={170} y={-11} width={12} height={22} fill="#C9A24E" />
        </g>
        <g transform={`translate(-240 330) rotate(-12) scale(${(1.6 - 0.6 * stamp).toFixed(3)})`} opacity={u >= 246 ? 0.75 : 0}>
          <circle r={74} fill="none" stroke="#7A2A2A" strokeWidth={6} />
          <circle r={58} fill="none" stroke="#7A2A2A" strokeWidth={2} />
          <text y={-8} textAnchor="middle" fontFamily={f.mono} fontSize={17} fill="#7A2A2A">REPUBLIK</text>
          <text y={16} textAnchor="middle" fontFamily={f.mono} fontSize={17} fill="#7A2A2A">INDONESIA</text>
        </g>
      </g>
      {/* the map slides over: four schools, one city */}
      <g transform={`translate(${n1(lerp(2300, 1060, map))} 560) rotate(${n1(lerp(10, 3, map))})`}>
        <rect x={-744} y={-384} width={1500} height={800} fill="#000" opacity={0.4} filter="url(#u2-blur)" />
        <JavaMap mu={mu} f={f} />
        <text x={0} y={318} textAnchor="middle" fontFamily={f.disp} fontSize={58} fontWeight={700} letterSpacing={6} fill="#1B4B8F" opacity={prog(mu, 230, 260)} style={{ paintOrder: 'stroke' }} stroke="#EFE3C4" strokeWidth={10} strokeLinejoin="round">UNIVERSITAS AIRLANGGA</text>
        <path d="M -400 340 L 400 340" pathLength={1} stroke="#E9B03A" strokeWidth={8} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(mu, 250, 290, inOut)} />
      </g>
    </g>
  );
};

// ───────────────────────────── the statue: Airlangga as Wisnu on Garuda, and the jar of amerta ─────────────────────────────
export const ArcaShot: React.FC<{ u: number; f: F; a?: number }> = ({ u, f, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  const R = rng(91);
  const dust = Array.from({ length: 60 }, () => ({ x: 560 + R() * 800, y: 100 + R() * 860, s: 1 + R() * 2.4, ph: R() * 6 }));
  const carve = prog(u, 0, 190, inOut);
  const z = lerp(1.0, 1.14, prog(u, 0, 780, inOut));
  const S = 1.45;
  const BX = 960;
  const BY = 978;
  const jx = BX + JAR.x * S;
  const jy = BY + JAR.y * S;
  const flow = prog(u, 470, 640, inOut);
  const label = (x: number, y: number, tx: number, ty: number, a: string, b: string, at: number, anchor: 'start' | 'end') => (
    <g opacity={prog(u, at, at + 16)}>
      <path d={`M ${x} ${y} L ${tx} ${ty}`} pathLength={1} stroke="#E8DCC4" strokeWidth={2.5} strokeDasharray="1 1" strokeDashoffset={1 - prog(u, at, at + 24, inOut)} />
      <circle cx={x} cy={y} r={6} fill="#E8DCC4" />
      <text x={tx + (anchor === 'start' ? 14 : -14)} y={ty - 4} textAnchor={anchor} fontFamily={f.disp} fontSize={40} fontWeight={700} letterSpacing={3} fill="#FBF6EA">{a}</text>
      <text x={tx + (anchor === 'start' ? 14 : -14)} y={ty + 36} textAnchor={anchor} fontFamily={f.ui} fontSize={28} fontStyle="italic" fill="#E8DCC4">{b}</text>
    </g>
  );
  return (
    <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(-960 -560)`}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#u2-spot)" />
      {/* temple wall behind: courses of stone blocks, barely lit */}
      {Array.from({ length: 12 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => <rect key={`${r}-${c}`} x={-120 + c * 250 + (r % 2 ? 125 : 0)} y={-40 + r * 96} width={244} height={90} fill="#FFFFFF" opacity={0.018 + ((r * 7 + c * 3) % 5) * 0.006} />),
      )}
      <ellipse cx={BX} cy={BY + 30} rx={520} ry={50} fill="#000" opacity={0.6} filter="url(#u2-blur)" />
      {/* the figure appears from the base upward, as if cut out of the stone */}
      <clipPath id="ar-carve">
        <rect x={0} y={BY + 60 - 1000 * carve} width={W} height={1000 * carve + 40} />
      </clipPath>
      <g clipPath="url(#ar-carve)">
        <g transform={`translate(${BX} ${BY}) scale(${S})`}>
          <Arca jarGlow={prog(u, 440, 480, inOut)} />
        </g>
      </g>
      <rect x={520} y={BY + 60 - 1000 * carve - 6} width={880} height={12} fill="#FFE7A8" opacity={0.5 * bump(u, 0, 196)} filter="url(#u2-glow)" />
      {dust.map((d, i) => (
        <circle key={i} cx={d.x + 20 * Math.sin(u / 50 + d.ph)} cy={d.y + ((u * 0.25 + d.ph * 60) % 120)} r={d.s} fill="#E8DCC4" opacity={(0.2 + 0.2 * Math.sin(u / 13 + d.ph)) * (1 - prog(u, 200, 300))} />
      ))}
      {/* warm raking light */}
      <path d="M 300 -100 L 900 -100 L 1500 1200 L 600 1200 Z" fill="#FFD890" opacity={0.07} style={{ mixBlendMode: 'screen' }} />
      {label(BX - 30 * S, BY - 470 * S, 560, 250, 'AIRLANGGA', 'raja di Jawa Timur, 1019–1042', 230, 'end')}
      {label(BX - 120 * S, BY - 240 * S, 520, 640, 'GARUDA', 'tunggangan Wisnu', 330, 'end')}
      {label(jx + 18, jy, 1380, 210, 'GUCI AMERTA', 'air kehidupan', 420, 'start')}
      {/* the water of life runs from the jar: down the stone, across the floor */}
      <path d={`M ${jx} ${jy + 14} C ${jx + 210} ${jy + 30}, ${jx + 330} ${jy + 420}, ${jx + 330} ${BY - 90} S ${jx + 520} ${BY + 30}, 2200 ${BY + 10}`} pathLength={1} fill="none" stroke={GOLD} strokeWidth={16} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - flow} opacity={0.45} filter="url(#u2-glow)" />
      <path d={`M ${jx} ${jy + 14} C ${jx + 210} ${jy + 30}, ${jx + 330} ${jy + 420}, ${jx + 330} ${BY - 90} S ${jx + 520} ${BY + 30}, 2200 ${BY + 10}`} pathLength={1} fill="none" stroke="#FFE08A" strokeWidth={6} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - flow} />
    </g>
  );
};

// ───────────────────────────── today: the monument at Kampus C (refs 6.jpg, 8.jpg) ─────────────────────────────
const FLAGSETS = [UNAIR_BANDS, UNAIR_BANDS, ['#1B4B8F', '#FFC20E'], UNAIR_BANDS, ['#2E7D4F', '#FFC20E', '#2E7D4F'], UNAIR_BANDS, ['#FFC20E', '#D62828', '#1B4B8F']];

export const Tugu: React.FC<{ u: number; f: F; dur: number; a?: number }> = ({ u, f, dur, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  const z = lerp(1.0, 1.14, prog(u, 0, dur, inOut));
  const cy = lerp(560, 500, prog(u, 0, dur, inOut));
  const poles = Array.from({ length: 14 }, (_, i) => {
    const k = (i < 7 ? i : i + 1) / 14; // leave the centre for the national flag
    const a = Math.PI * (0.08 + 0.84 * k);
    return { x: 960 - 640 * Math.cos(a), base: 700 - 70 * Math.sin(a), top: 330 - 110 * Math.sin(a), i };
  });
  const end = prog(u, dur - 250, dur - 190, inOut);
  const gold = prog(u, dur - 300, dur - 200, inOut);
  return (
    <g>
      <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(-960 ${n1(-cy)})`}>
        <rect x={-200} y={-300} width={W + 400} height={H + 600} fill="url(#u2-day)" />
        <Cloud x={300 + am * 0.08} y={170} s={1.5} opacity={0.9} />
        <Cloud x={1450 + am * 0.05} y={110} s={1.1} opacity={0.8} />
        <Cloud x={900 + am * 0.1} y={60} s={0.7} opacity={0.6} />
        {/* trees behind */}
        {[80, 300, 520, 1400, 1640, 1860].map((x, i) => (
          <g key={x}>
            <rect x={x - 8} y={560} width={16} height={180} fill="#5E4A36" />
            <Foliage x={x} y={520 - (i % 2) * 30} r={150} seed={100 + i} t={am} dark="#2F6B33" light="#4F9A48" n={18} />
          </g>
        ))}
        <rect x={-200} y={720} width={W + 400} height={700} fill="#E9E4D8" />
        {/* paving pattern */}
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={-200} y={840 + i * i * 4} width={W + 400} height={3} fill="#B9B2A4" opacity={0.7} />
        ))}
        {Array.from({ length: 25 }, (_, i) => (
          <path key={i} d={`M ${960 + (i - 12) * 90} 840 L ${960 + (i - 12) * 230} 1400`} stroke="#B9B2A4" strokeWidth={2} opacity={0.7} />
        ))}
        {/* flagpoles in a half circle: faculty colours, Merah Putih highest in the middle */}
        {poles.map((p) => (
          <g key={p.i}>
            <rect x={p.x - 3} y={p.top} width={6} height={p.base - p.top} fill="#D8D8D8" />
            <rect x={p.x + 1} y={p.top} width={2} height={p.base - p.top} fill="#9A9A9A" />
            <Flag x={p.x + 4} y={p.top + 6} w={78} h={50} bands={FLAGSETS[p.i % FLAGSETS.length]} t={am} ph={p.i * 0.9} />
          </g>
        ))}
        <rect x={956} y={120} width={8} height={560} fill="#E4E4E4" />
        <Flag x={966} y={128} w={120} h={78} bands={MERAH_PUTIH} t={am} ph={1} />
        {/* stepped base with the inscription, the statue on top */}
        <path d="M 250 800 L 1670 800 L 1730 850 L 190 850 Z" fill="#DAD3C4" />
        <path d="M 300 760 L 1620 760 L 1670 800 L 250 800 Z" fill="#E9E2D2" />
        <path d="M 350 724 L 1570 724 L 1620 760 L 300 760 Z" fill="#F4EEDD" />
        <rect x={470} y={610} width={980} height={116} fill="url(#u2-stone)" />
        <rect x={470} y={610} width={980} height={10} fill="#FFFFFF" opacity={0.6} />
        <path d="M 1450 610 L 1480 630 L 1480 726 L 1450 726 Z" fill="#B9AD94" />
        <text x={960} y={654} textAnchor="middle" fontFamily={f.ui} fontSize={34} fontWeight={700} letterSpacing={8} fill="#2A2622">UNIVERSITAS AIRLANGGA</text>
        <text x={960} y={684} textAnchor="middle" fontFamily={f.ui} fontSize={20} fontWeight={700} letterSpacing={5} fill="#2A2622">KAMPUS MERR-C</text>
        <text x={960} y={710} textAnchor="middle" fontFamily={f.ui} fontSize={20} fontWeight={700} letterSpacing={5} fill="#2A2622">SURABAYA - INDONESIA</text>
        <rect x={840} y={586} width={240} height={26} fill="#5A564E" />
        <g transform="translate(960 588) scale(0.47)">
          <Arca dark wing={1.5} jarGlow={gold} />
        </g>
        {/* low side walls */}
        <path d="M 60 720 L 250 660 L 250 800 L 60 860 Z" fill="#CFC7B6" />
        <path d="M 1860 720 L 1670 660 L 1670 800 L 1860 860 Z" fill="#B9B2A4" />
        {/* students cross the plaza */}
        {[0, 1, 2, 3, 4].map((i) => {
          const p = prog(am, -120 + i * 70, 620 + i * 70, (x) => x);
          const dir = i % 2 ? 1 : -1;
          return <Walker key={i} x={960 + dir * lerp(900, 120 + i * 60, p)} y={lerp(1060, 870, p) + i * 8} s={lerp(1.9, 1.05, p)} t={am} ph={i * 1.4} o={OUTFITS[i % 4]} />;
        })}
      </g>
      {/* the water of life crosses the frame, then the title */}
      <rect width={W} height={H} fill="#0E1A2E" opacity={0.72 * end} />
      <path d="M -40 640 C 400 560, 700 720, 960 640 S 1560 560, 1960 640" pathLength={1} fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - gold} opacity={0.4} filter="url(#u2-glow)" />
      <path d="M -40 640 C 400 560, 700 720, 960 640 S 1560 560, 1960 640" pathLength={1} fill="none" stroke="#FFE08A" strokeWidth={5} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - gold} />
      <g opacity={prog(u, dur - 200, dur - 160, inOut)} transform={`translate(0 ${n1(14 * (1 - prog(u, dur - 200, dur - 150, outE)))})`}>
        <text x={960} y={500} textAnchor="middle" fontFamily={f.disp} fontSize={104} fontWeight={700} letterSpacing={10} fill="#FBF6EA">UNIVERSITAS AIRLANGGA</text>
        <text x={960} y={574} textAnchor="middle" fontFamily={f.ui} fontSize={42} fontStyle="italic" fill="#FFE08A">sejak 10 November 1954</text>
      </g>
    </g>
  );
};
