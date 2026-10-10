// UNAIR film, shots 1–4 and 8: the 1954 ceremony (veiled, then unveiled), the NIAS classroom, STOVIT.
import React from 'react';
import { inOut, outE, pop, prog } from '../engine/util';
import { Cloud, Foliage, Palm, bump, lerp, n1, rng } from './kit';
import { Cloth, clothKnot } from './UnairCloth';
import { Arca, CrowdRow, Flag, MERAH_PUTIH, OUTFITS_1954, UNAIR_BANDS, Walker } from './UnairParts';
import { type F, GROUND, H, HipRoof, NiasBuilding, W } from './UnairScene';

// ───────────────────────────── the ceremony, 10 November 1954 (front yard of the NIAS building) ─────────────────────────────
/** mode "veiled": the hook (rise from the crowd, then push into the cloth). mode "unveil": the rope is pulled. */
export const Ceremony: React.FC<{ u: number; f: F; mode: 'veiled' | 'unveil'; a?: number }> = ({ u, f, mode, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  const un = mode === 'unveil';
  const tug = un ? bump(u, 150, 176) : 0;
  const cheer = un ? prog(u, 300, 360, inOut) : 0;
  const cu = un ? u : null; // the cloth simulation only runs in the unveil shot
  const knot = clothKnot(cu);
  const raise = un ? prog(u, 360, 560, inOut) : 0; // a yellow-blue flag goes up the left pole
  // camera
  const rise = prog(u, 0, 300, inOut);
  const into = prog(u, 400, 780, inOut);
  const cx = un ? lerp(960, 760, prog(u, 340, 520, inOut)) : 960;
  const cy = un ? lerp(600, 470, prog(u, 340, 520, inOut)) : lerp(lerp(760, 590, rise), 600, into);
  const z = un ? lerp(1.22, 1.3, prog(u, 0, 300, inOut)) - 0.12 * prog(u, 340, 520, inOut) : lerp(lerp(1.3, 1.08, rise), 2.9, into);
  const bunting = Array.from({ length: 30 }, (_, i) => ({ x: -100 + i * 72, y: 150 + 46 * Math.sin((i / 29) * Math.PI) }));
  return (
    <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(${n1(-cx)} ${n1(-cy)})`}>
      <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#un-sky)" />
      <circle cx={420} cy={220} r={300} fill="#FFF3D0" opacity={0.5} filter="url(#un-soft)" />
      <Cloud x={1300 + am * 0.07} y={170} s={1.4} opacity={0.8} />
      <Cloud x={200 + am * 0.05} y={260} s={0.9} opacity={0.6} />
      <Foliage x={60} y={500} r={170} seed={31} t={am} dark="#4E6A3C" light="#6F8A52" n={18} />
      <Foliage x={1880} y={420} r={150} seed={32} t={am} dark="#4E6A3C" light="#6F8A52" n={16} />
      <rect x={-300} y={GROUND} width={W + 600} height={600} fill="url(#un-lawn)" />
      <NiasBuilding f={f} />
      <path d={`M 80 ${GROUND} L 1990 ${GROUND} L 1990 ${GROUND + 26} L 60 ${GROUND + 34} Z`} fill="#2A2018" opacity={0.25} />
      <path d="M 700 802 L 1240 802 L 1500 1300 L 420 1300 Z" fill="url(#un-drive)" />
      {/* bunting between the trees */}
      <path d={`M ${bunting.map((b) => `${b.x} ${b.y}`).join(' L ')}`} fill="none" stroke="#3A2E22" strokeWidth={2} />
      {bunting.map((b, i) => (
        <path key={i} d={`M ${b.x - 16} ${b.y} L ${b.x + 16} ${b.y} L ${n1(b.x + 3 * Math.sin(u / 13 + i))} ${b.y + 34} Z`} fill={i % 2 ? '#FAFAF5' : '#D62828'} />
      ))}
      {/* two flagpoles: Merah Putih on the right, the university colours raised on the left after the unveiling */}
      {[560, 1360].map((px, i) => (
        <g key={px}>
          <rect x={px - 4} y={250} width={8} height={GROUND - 250 + 60} fill="#E8E0CC" />
          <rect x={px + 1} y={250} width={3} height={GROUND - 250 + 60} fill="#9A8C72" />
          <circle cx={px} cy={246} r={8} fill={GOLDISH} />
          {i === 1 && <Flag x={px + 4} y={262} w={170} h={104} bands={MERAH_PUTIH} t={am} />}
          {i === 0 && raise > 0 && <Flag x={px + 4} y={lerp(GROUND - 60, 262, raise)} w={170} h={104} bands={UNAIR_BANDS} t={am} ph={2} />}
        </g>
      ))}
      {/* plinth, statue, and the cloth over it */}
      <ellipse cx={960} cy={946} rx={270} ry={26} fill="#000" opacity={0.3} />
      <rect x={800} y={842} width={320} height={100} fill="url(#u2-stone)" />
      <rect x={1070} y={842} width={50} height={100} fill="#B9AD94" />
      <rect x={784} y={832} width={352} height={16} fill="#F4EEDD" />
      <rect x={784} y={936} width={352} height={14} fill="#C9BEA6" />
      <Cloth u={cu} half="back" breeze={un ? 0 : am} />
      <g transform="translate(960 834) scale(0.8)">
        <Arca />
      </g>
      {/* the podium and the man who pulls the rope (no face: he stands with his back to us) */}
      <rect x={1430} y={GROUND + 20} width={240} height={90} fill="#8A5E38" />
      <rect x={1430} y={GROUND + 20} width={240} height={30} fill="#D62828" />
      <rect x={1430} y={GROUND + 50} width={240} height={30} fill="#FAFAF5" />
      <rect x={1420} y={GROUND + 10} width={260} height={14} fill="#5E3F27" />
      <path d={`M 1530 ${GROUND + 12} L 1530 ${GROUND - 120}`} stroke="#2A2622" strokeWidth={5} />
      <rect x={1520} y={GROUND - 140} width={20} height={30} rx={8} fill="#2A2622" />
      <g transform={`translate(${n1(1580 + 14 * tug)} ${GROUND + 14})`}>
        <path d={`M -20 -146 L ${n1(-74 + 20 * tug)} ${n1(-170 + 30 * tug)}`} stroke="#D8D2C2" strokeWidth={13} strokeLinecap="round" />
        <circle cx={-78 + 20 * tug} cy={-174 + 30 * tug} r={9} fill="#B98660" />
        <Walker x={0} y={0} s={1.6} t={am} ph={0.4} o={OUTFITS_1954[0]} move={0} />
      </g>
      {/* the veil: a simulated sheet (see UnairCloth). Near half drawn over the statue AND the stage: it comes down in front of both */}
      <Cloth u={cu} half="front" breeze={un ? 0 : am} />
      <circle cx={knot[0]} cy={knot[1]} r={8} fill="#8A6A2E" />
      <path d={`M ${n1(knot[0])} ${n1(knot[1])} Q ${n1((knot[0] + 1502) / 2)} ${n1((knot[1] + 640) / 2 + 80 - 60 * tug + (un ? 120 * prog(u, 232, 300, inOut) : 0))} ${n1(1502 + 34 * tug)} ${n1(640 + 30 * tug)}`} fill="none" stroke="#8A6A2E" strokeWidth={4} />
      {/* officials seated in a row, then the crowd close to the lens */}
      {Array.from({ length: 7 }, (_, i) => (
        <Walker key={i} x={250 + i * 74} y={GROUND + 110 + (i % 2) * 12} s={1.25} t={am} ph={i * 1.3} o={OUTFITS_1954[i % 4]} move={0} cheer={cheer} />
      ))}
      <CrowdRow y={1010} s={1.05} n={11} seed={41} t={am} cheer={cheer} />
      <CrowdRow y={1130} s={1.45} n={8} seed={42} t={am} cheer={cheer * 0.8} />
    </g>
  );
};
const GOLDISH = '#C9A24E';

// ───────────────────────────── NIAS classroom, about 1925 (refs/nias-kelas.jpg) ─────────────────────────────
const SKINS = ['#B98660', '#A9744E', '#C99570', '#9A6A48'];

const Pupil: React.FC<{ x: number; y: number; s: number; t: number; ph: number; k: number }> = ({ x, y, s, t, ph, k }) => {
  const write = 0.5 + 0.5 * Math.sin(t / 26 + ph); // 0 = looking up at the teacher, 1 = bent over the page
  const blink = 1 - 0.9 * bump((t + ph * 40) % 190, 172, 186);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* torso in the white closed-collar jacket */}
      <path d="M -52 0 C -52 -70, -34 -92, 0 -92 C 34 -92, 52 -70, 52 0 Z" fill="#F8F3E6" />
      <path d="M 0 -92 C 34 -92, 52 -70, 52 0 L 20 0 C 22 -40, 16 -70, 0 -92 Z" fill="#DDD3BC" />
      <path d="M 0 -90 L 0 0" stroke="#CFC4AA" strokeWidth={2} />
      {[-70, -50, -30].map((by) => (
        <circle key={by} cx={0} cy={by} r={2.6} fill="#B9AD94" />
      ))}
      <path d="M -12 -92 L 12 -92 L 12 -80 L -12 -80 Z" fill="#EFE6D3" />
      {/* head tips forward while writing */}
      <g transform={`translate(0 ${n1(6 * write)}) rotate(${n1(10 * write - 4)} 0 -100)`}>
        <rect x={-9} y={-104} width={18} height={16} fill={SKINS[(k + 1) % 4]} />
        <ellipse cx={0} cy={-128} rx={25} ry={29} fill={SKINS[k % 4]} />
        <ellipse cx={-26} cy={-124} rx={4.5} ry={8} fill={SKINS[(k + 1) % 4]} />
        <ellipse cx={26} cy={-124} rx={4.5} ry={8} fill={SKINS[(k + 1) % 4]} />
        <path d={k % 2 ? 'M -25 -134 C -30 -168, 30 -168, 25 -134 C 12 -150, -8 -152, -25 -134 Z' : 'M -25 -132 C -30 -168, 30 -168, 25 -136 C 16 -148, -2 -156, -14 -146 C -18 -142, -22 -138, -25 -132 Z'} fill="#1B1714" />
        <path d="M -15 -134 L -6 -135 M 6 -135 L 15 -134" stroke="#1B1714" strokeWidth={2.4} strokeLinecap="round" />
        <ellipse cx={-10} cy={-126} rx={2.6} ry={3.2 * blink * (1 - 0.6 * write)} fill="#1B1714" />
        <ellipse cx={10} cy={-126} rx={2.6} ry={3.2 * blink * (1 - 0.6 * write)} fill="#1B1714" />
        <path d="M 0 -124 L -2 -114 L 2 -114" fill="none" stroke="#7A4A34" strokeWidth={1.6} opacity={0.7} />
        <path d="M -6 -106 Q 0 -103 6 -106" fill="none" stroke="#5E3A2A" strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* writing arm */}
      <path d={`M 40 -60 L 46 -14 L ${n1(8 + 6 * Math.sin(t / 5 + ph) * write)} ${n1(-4)}`} fill="none" stroke="#EFE6D3" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={8 + 6 * Math.sin(t / 5 + ph) * write} cy={-4} r={8} fill={SKINS[k % 4]} />
    </g>
  );
};

const Bench: React.FC<{ x: number; y: number; s: number; n: number; t: number; row: number }> = ({ x, y, s, n, t, row }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <Pupil key={i} x={x + (i + 0.5) * 190 * s} y={y - 6 * s} s={s} t={t} ph={row * 2.3 + i * 1.7} k={row * 3 + i} />
    ))}
    {/* the long desk: sloping top, front board, trestle feet */}
    <path d={`M ${x - 20 * s} ${y - 14 * s} L ${x + (n * 190 + 20) * s} ${y - 14 * s} L ${x + (n * 190 + 30) * s} ${y + 10 * s} L ${x - 30 * s} ${y + 10 * s} Z`} fill="#6B4628" />
    <path d={`M ${x - 20 * s} ${y - 14 * s} L ${x + (n * 190 + 20) * s} ${y - 14 * s} L ${x + (n * 190 + 22) * s} ${y - 9 * s} L ${x - 22 * s} ${y - 9 * s} Z`} fill="#9A6E44" />
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x + (i * 190 + 62) * s} y={y - 12 * s} width={66 * s} height={15 * s} fill="#F4EEDD" transform={`rotate(-2 ${x + (i * 190 + 95) * s} ${y})`} />
    ))}
    <rect x={x - 30 * s} y={y + 10 * s} width={(n * 190 + 60) * s} height={96 * s} fill="#4E3420" />
    <rect x={x - 30 * s} y={y + 10 * s} width={(n * 190 + 60) * s} height={8 * s} fill="#2E1D12" opacity={0.6} />
    {[0, 1].map((e) => (
      <path key={e} d={`M ${x + (e ? n * 190 - 10 : 10) * s} ${y + 106 * s} L ${x + (e ? n * 190 - 10 : 10) * s} ${y + 170 * s} M ${x + (e ? n * 190 - 50 : -30) * s} ${y + 174 * s} L ${x + (e ? n * 190 + 30 : 50) * s} ${y + 174 * s}`} stroke="#3A2416" strokeWidth={14 * s} strokeLinecap="round" />
    ))}
  </g>
);

export const Classroom: React.FC<{ u: number; dur: number; a?: number }> = ({ u, dur, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  const R = rng(61);
  const motes = Array.from({ length: 40 }, () => ({ x: 120 + R() * 760, y: 200 + R() * 620, s: 1 + R() * 2.2, ph: R() * 6 }));
  const cx = lerp(900, 1040, prog(u, 0, dur, inOut));
  const z = lerp(1.06, 1.16, prog(u, 0, dur, inOut));
  const gest = Math.sin(u / 22);
  return (
    <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(${n1(-cx)} -560)`}>
      {/* walls, skirting, the black 20×20 tile floor in perspective */}
      <rect x={-200} y={-200} width={W + 400} height={980} fill="url(#u2-room)" />
      <rect x={-200} y={700} width={W + 400} height={80} fill="#C9BEA6" />
      <rect x={-200} y={776} width={W + 400} height={600} fill="#2E2A26" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={-200} y={776 + i * i * 4.6} width={W + 400} height={2} fill="#4A443C" />
      ))}
      {Array.from({ length: 34 }, (_, i) => (
        <path key={i} d={`M ${960 + (i - 17) * 70} 776 L ${960 + (i - 17) * 190} 1300`} stroke="#4A443C" strokeWidth={2} />
      ))}
      {/* two tall windows on the left wall, with glazing bars; the garden glows outside */}
      {[90, 420].map((wx) => (
        <g key={wx}>
          <rect x={wx - 14} y={120} width={248} height={560} fill="#C9BEA6" />
          <rect x={wx} y={134} width={220} height={532} fill="#DDEBD6" />
          <rect x={wx} y={420} width={220} height={246} fill="#A9C79A" opacity={0.7} />
          <circle cx={wx + 150} cy={240} r={90} fill="#FFFFFF" opacity={0.7} filter="url(#u2-blur)" />
          <rect x={wx + 104} y={134} width={12} height={532} fill="#F4EEDD" />
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={wx} y={134 + (r * 532) / 4 - 5} width={220} height={10} fill="#F4EEDD" />
          ))}
          <rect x={wx - 14} y={674} width={248} height={14} fill="#B9AD94" />
        </g>
      ))}
      {[250, 580].map((lx) => (
        <g key={lx}>
          <circle cx={lx} cy={70} r={24} fill="#3A342E" />
          <circle cx={lx} cy={70} r={15} fill="#F2E6C8" />
        </g>
      ))}
      {/* the row of framed prints */}
      <rect x={760} y={282} width={1300} height={6} fill="#B9AD94" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={770 + i * 180} y={296} width={160} height={96} fill="#3A2E22" />
          <rect x={778 + i * 180} y={304} width={144} height={80} fill={['#B9C7C9', '#C9BFA6', '#A9B7A0', '#C4B4A0'][i % 4]} />
          <path d={`M ${778 + i * 180} 370 L ${810 + i * 180} ${340 + (i % 3) * 8} L ${850 + i * 180} 362 L ${890 + i * 180} ${334 + (i % 2) * 14} L ${922 + i * 180} 356 L ${922 + i * 180} 384 L ${778 + i * 180} 384 Z`} fill="#6B6354" opacity={0.6} />
        </g>
      ))}
      {/* benches, back row first (stepped) */}
      <Bench x={840} y={640} s={0.78} n={6} t={am} row={2} />
      <Bench x={760} y={770} s={0.96} n={5} t={am} row={1} />
      {/* shafts of light and drifting dust */}
      {[90, 420].map((wx) => (
        <path key={wx} d={`M ${wx} 134 L ${wx + 220} 134 L ${wx + 900} 1100 L ${wx + 380} 1100 Z`} fill="url(#u2-shaft)" style={{ mixBlendMode: 'screen' }} />
      ))}
      {motes.map((m, i) => (
        <circle key={i} cx={m.x + 14 * Math.sin(u / 60 + m.ph)} cy={m.y - ((u * 0.12 + m.ph * 40) % 80)} r={m.s} fill="#FFF6D8" opacity={0.35 + 0.25 * Math.sin(u / 17 + m.ph)} />
      ))}
      <Bench x={700} y={940} s={1.2} n={4} t={am} row={0} />
      {/* the teacher: white suit and tie, seated side-on at his table, one hand explaining */}
      <g transform="translate(330 1010)">
        <ellipse cx={20} cy={8} rx={200} ry={18} fill="#000" opacity={0.3} />
        <path d="M -150 0 L -150 -150 M -20 0 L -20 -150 M -160 -150 L -10 -150 M -150 -150 L -160 -330" stroke="#3A2416" strokeWidth={14} strokeLinecap="round" />
        <path d="M -120 -160 L 30 -150 L 40 0" fill="none" stroke="#F4EEDD" strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 10 0 L 90 0 L 96 14 L 4 14 Z" fill="#1F1A14" />
        <path d="M -168 -160 C -176 -300, -150 -356, -86 -360 C -30 -356, -10 -300, -22 -160 Z" fill="#F8F3E6" />
        <path d="M -86 -360 C -30 -356, -10 -300, -22 -160 L -60 -160 C -52 -240, -60 -320, -86 -360 Z" fill="#DDD3BC" />
        <path d="M -56 -346 L -44 -300 L -36 -250" fill="none" stroke="#3A342E" strokeWidth={7} strokeLinecap="round" />
        <rect x={-100} y={-384} width={30} height={30} fill="#D9A98A" />
        <ellipse cx={-82} cy={-416} rx={38} ry={42} fill="#EBC3A4" />
        <path d="M -118 -420 C -124 -470, -50 -476, -44 -430 C -64 -448, -100 -448, -118 -420 Z" fill="#B9B2A4" />
        <path d="M -46 -420 Q -34 -404 -46 -398 Z" fill="#D9A98A" />
        <circle cx={-60} cy={-420} r={3.4} fill="#1F1A14" />
        <path d="M -74 -432 L -52 -434" stroke="#8A8274" strokeWidth={4} strokeLinecap="round" />
        <path d="M -66 -392 Q -56 -388 -48 -392" fill="none" stroke="#7A4A34" strokeWidth={3} strokeLinecap="round" />
        <path d={`M -70 -320 L ${n1(10 + 10 * gest)} ${n1(-250 - 12 * gest)} L ${n1(96 + 16 * gest)} ${n1(-290 - 34 * gest)}`} fill="none" stroke="#F8F3E6" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={104 + 16 * gest} cy={-296 - 34 * gest} r={15} fill="#EBC3A4" />
      </g>
      {/* his table, a thick book, the wicker basket */}
      <g transform="translate(560 1010)">
        <rect x={-150} y={-190} width={300} height={18} fill="#74502F" />
        <rect x={-136} y={-172} width={14} height={172} fill="#4E3420" />
        <rect x={122} y={-172} width={14} height={172} fill="#4E3420" />
        <rect x={-136} y={-172} width={272} height={30} fill="#5E3F27" />
        <rect x={-90} y={-222} width={110} height={32} fill="#3A2E22" />
        <rect x={-86} y={-218} width={102} height={6} fill="#EFE6D3" />
        <rect x={40} y={-198} width={84} height={8} fill="#F4EEDD" transform="rotate(-4 82 -194)" />
        <path d="M 180 -70 L 250 -70 L 240 0 L 190 0 Z" fill="#B48C58" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${184 + i * 15} -70 L ${192 + i * 12} 0`} stroke="#7A5A30" strokeWidth={2.5} />
        ))}
      </g>
    </g>
  );
};

// ───────────────────────────── STOVIT, 1928 (refs/5.jpg) ─────────────────────────────
export const Stovit: React.FC<{ u: number; dur: number; f: F; a?: number }> = ({ u, dur, f, a }) => {
  const am = a ?? u; // ambient clock: real frames, so sway, flags and footsteps keep their pace when the beats are retimed
  const z = lerp(1.0, 1.12, prog(u, 0, dur, inOut));
  const cy = lerp(540, 520, prog(u, 0, dur, inOut));
  const R = rng(73);
  const tufts = Array.from({ length: 90 }, () => ({ x: R() * W, y: GROUND + 20 + R() * 260, h: 6 + R() * 10, l: R() > 0.5 }));
  const walk = prog(u, 10, 640, (x) => x);
  return (
    <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(-960 ${n1(-cy)})`}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#u2-day)" />
      <Cloud x={380 + am * 0.06} y={150} s={1.2} opacity={0.85} />
      <Cloud x={1500 + am * 0.09} y={110} s={0.9} opacity={0.7} />
      <rect x={-200} y={GROUND} width={W + 400} height={500} fill="url(#un-lawn)" />
      {/* long tiled roof behind, side verandas with yellow posts */}
      <path d="M 120 420 L 1800 420 L 1700 190 L 220 190 Z" fill="url(#un-roof)" />
      <path d="M 120 420 L 1800 420 L 1700 190 L 220 190 Z" fill="url(#un-tile)" />
      <rect x={112} y={416} width={1696} height={10} fill="#3A2416" />
      {[0, 1].map((sd) => (
        <g key={sd}>
          <rect x={sd ? 1170 : 150} y={426} width={600} height={374} fill="#8E8572" />
          <rect x={sd ? 1170 : 150} y={426} width={600} height={150} fill="#2A2018" opacity={0.55} />
          {Array.from({ length: 4 }, (_, i) => {
            const wx = (sd ? 1250 : 226) + i * 128;
            return (
              <g key={`w${i}`}>
                <rect x={wx} y={590} width={70} height={150} fill="#2E3A30" />
                {Array.from({ length: 9 }, (_, r) => (
                  <rect key={r} x={wx + 4} y={596 + r * 15} width={62} height={3} fill="#4E6A52" />
                ))}
                <rect x={wx + 33} y={590} width={4} height={150} fill="#1F2A22" />
                <rect x={wx - 6} y={582} width={82} height={8} fill="#D5C9B0" />
                <rect x={wx} y={548} width={70} height={26} fill="#3A4A44" />
                <path d={`M ${wx + 23} 548 L ${wx + 23} 574 M ${wx + 47} 548 L ${wx + 47} 574`} stroke="#D5C9B0" strokeWidth={3} />
              </g>
            );
          })}
          <path d={`M ${sd ? 1150 : 130} 520 L ${sd ? 1790 : 770} 520 L ${sd ? 1770 : 750} 440 L ${sd ? 1170 : 150} 440 Z`} fill="url(#un-roof)" />
          <path d={`M ${sd ? 1150 : 130} 520 L ${sd ? 1790 : 770} 520 L ${sd ? 1770 : 750} 440 L ${sd ? 1170 : 150} 440 Z`} fill="url(#un-tile)" />
          <rect x={sd ? 1146 : 126} y={516} width={648} height={10} fill="#3A2416" />
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <rect x={(sd ? 1220 : 190) + i * 128} y={526} width={22} height={274} fill="#E2C36A" />
              <rect x={(sd ? 1236 : 206) + i * 128} y={526} width={6} height={274} fill="#B89A44" />
            </g>
          ))}
          <rect x={sd ? 1170 : 150} y={760} width={600} height={40} fill="#C9BEA6" />
        </g>
      ))}
      {/* the centre bay: tiled gable, white wall, wrought-iron "1928 stovit", arched door on a grey plinth */}
      <path d="M 700 330 L 1220 330 L 960 96 Z" fill="url(#un-roof)" />
      <path d="M 700 330 L 1220 330 L 960 96 Z" fill="url(#un-tile)" />
      <path d="M 700 330 L 960 96 L 1220 330" fill="none" stroke="#F4EEDD" strokeWidth={12} strokeLinejoin="round" />
      <path d="M 960 96 L 960 70" stroke="#F4EEDD" strokeWidth={8} strokeLinecap="round" />
      <rect x={740} y={330} width={440} height={470} fill="url(#un-wall)" />
      <rect x={740} y={330} width={440} height={50} fill="url(#un-wall-shade)" />
      <rect x={722} y={322} width={476} height={14} fill="#F4EEDD" />
      <rect x={740} y={724} width={440} height={76} fill="#A9A59C" />
      <text x={960} y={452} textAnchor="middle" fontFamily={f.ui} fontSize={84} fontWeight={700} fill="#14110E">1928</text>
      <text x={960} y={500} textAnchor="middle" fontFamily={f.ui} fontSize={50} fontStyle="italic" fontWeight={700} fill="#14110E">stovit</text>
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${960 + sd * 130} 400 q ${sd * 26} -10 ${sd * 22} 16 q ${-sd * 8} 22 ${-sd * 22} 6 M ${960 + sd * 130} 440 q ${sd * 30} 4 ${sd * 22} 30 q ${-sd * 10} 20 ${-sd * 24} 4 M ${960 + sd * 150} 392 L ${960 + sd * 150} 486`} fill="none" stroke="#14110E" strokeWidth={5} strokeLinecap="round" />
      ))}
      <path d="M 880 800 L 880 610 Q 880 540 960 536 Q 1040 540 1040 610 L 1040 800 Z" fill="url(#un-arch)" />
      <path d="M 880 800 L 880 610 Q 880 540 960 536 Q 1040 540 1040 610 L 1040 800" fill="none" stroke="#D5C9B0" strokeWidth={6} />
      <rect x={920} y={640} width={80} height={160} fill="#2A2018" />
      <path d="M 960 640 L 960 800" stroke="#4A3A2C" strokeWidth={3} />
      {/* ridge caps, gable vent, gutters and downpipes, eave brackets */}
      {Array.from({ length: 50 }, (_, i) => 236 + i * 30)
        .filter((x) => x < 840 || x > 1080) // the ridge runs BEHIND the gable, so no caps across its face
        .map((x) => (
          <ellipse key={x} cx={x} cy={190} rx={15} ry={6} fill="#6E3220" />
        ))}
      <circle cx={960} cy={232} r={30} fill="#F4EEDD" />
      <circle cx={960} cy={232} r={22} fill="#2A2018" />
      {[-12, -4, 4, 12].map((dy) => (
        <rect key={dy} x={942} y={230 + dy} width={36} height={3} fill="#D5C9B0" />
      ))}
      {[740, 1174].map((gx) => (
        <g key={gx}>
          <rect x={gx} y={336} width={6} height={392} fill="#8A8478" />
          <rect x={gx - 3} y={470} width={12} height={6} fill="#6E685E" />
          <rect x={gx - 3} y={640} width={12} height={6} fill="#6E685E" />
        </g>
      ))}
      {[766, 860, 1060, 1154].map((bx) => (
        <path key={bx} d={`M ${bx} 336 L ${bx} 362 Q ${bx + 4} 344 ${bx + 20} 336 Z`} fill="#D5C9B0" />
      ))}
      {/* wall lanterns either side of the door, a brass plate, three steps */}
      {[846, 1074].map((lx) => (
        <g key={lx}>
          <path d={`M ${lx} 596 L ${lx} 612`} stroke="#2A2018" strokeWidth={4} />
          <rect x={lx - 9} y={612} width={18} height={26} rx={3} fill="#2A2018" />
          <rect x={lx - 6} y={615} width={12} height={20} fill="#FFE7A8" opacity={0.85} />
        </g>
      ))}
      <rect x={1086} y={660} width={62} height={40} fill="#B08A3E" />
      <rect x={1092} y={670} width={50} height={4} fill="#5E4A1E" />
      <rect x={1092} y={680} width={40} height={4} fill="#5E4A1E" />
      <rect x={1092} y={690} width={46} height={4} fill="#5E4A1E" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={864 - i * 16} y={800 + i * 10} width={192 + i * 32} height={10} fill={['#E4DCC8', '#D5CDB8', '#C4BCA6'][i]} />
          <rect x={864 - i * 16} y={808 + i * 10} width={192 + i * 32} height={2} fill="#8A8478" opacity={0.6} />
        </g>
      ))}
      {/* clipped hedges along both verandas, grass tufts */}
      {[0, 1].map((sd) =>
        Array.from({ length: 9 }, (_, i) => <Foliage key={`${sd}-${i}`} x={(sd ? 1230 : 190) + i * 62} y={GROUND + 4} r={34} seed={200 + sd * 20 + i} t={am} dark="#2F5A30" light="#467A40" n={7} />),
      )}
      {tufts.map((g, i) => (
        <path key={i} d={`M ${n1(g.x)} ${n1(g.y)} l -3 ${n1(-g.h)} M ${n1(g.x)} ${n1(g.y)} l 3 ${n1(-g.h * 0.8)}`} stroke={g.l ? '#8FB060' : '#3F5A2C'} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      ))}
      {/* a bicycle leaning by the bay; two pupils talking on the right */}
      <g transform="translate(650 838)">
        <ellipse cx={0} cy={36} rx={86} ry={7} fill="#000" opacity={0.25} />
        {[-50, 50].map((wx) => (
          <g key={wx}>
            <circle cx={wx} cy={0} r={34} fill="none" stroke="#1F1A14" strokeWidth={4} />
            <circle cx={wx} cy={0} r={30} fill="none" stroke="#8A8478" strokeWidth={1} />
            {[0, 30, 60, 90, 120, 150].map((a) => (
              <path key={a} d={`M ${n1(wx - 30 * Math.cos((a * Math.PI) / 180))} ${n1(-30 * Math.sin((a * Math.PI) / 180))} L ${n1(wx + 30 * Math.cos((a * Math.PI) / 180))} ${n1(30 * Math.sin((a * Math.PI) / 180))}`} stroke="#8A8478" strokeWidth={1} />
            ))}
          </g>
        ))}
        <path d="M -50 0 L -16 -46 L 34 -46 L 50 0 M -16 -46 L 4 0 L 34 -46 M -50 0 L 4 0 M -22 -58 L -10 -58 M 34 -46 L 30 -66 L 44 -70" fill="none" stroke="#2A2018" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={-28} y={-62} width={22} height={6} rx={3} fill="#5E3A22" />
      </g>
      <Walker x={1150} y={846} s={1.05} t={am} ph={0.3} o={{ ...OUTFITS_1954[0], head: 'none' }} move={0} />
      <Walker x={1204} y={852} s={1.05} t={am} ph={2.1} o={{ ...OUTFITS_1954[0], head: 'none', skin: '#A9744E' }} move={0} />
      {/* straight path, lawn, palms on the left, flower pots on the right */}
      <path d="M 880 800 L 1040 800 L 1380 1300 L 540 1300 Z" fill="#DAD3C4" />
      <path d="M 880 800 L 540 1300 M 1040 800 L 1380 1300" stroke="#F4EEDD" strokeWidth={6} />
      <Palm x={560} base={GROUND + 40} h={430} t={am} seed={52} s={0.9} />
      <Palm x={330} base={GROUND + 90} h={520} t={am} seed={51} />
      {[1250, 1380, 1520].map((px, i) => (
        <g key={px}>
          <Foliage x={px} y={GROUND - 20 + i * 30} r={54} seed={70 + i} t={am} dark="#3F6B3A" light="#5E8A4A" n={10} />
          {Array.from({ length: 7 }, (_, k) => (
            <circle key={k} cx={px - 36 + k * 12} cy={GROUND - 50 + i * 30 + (k % 3) * 14} r={8} fill={k % 2 ? '#E78AA6' : '#D9475E'} />
          ))}
          <path d={`M ${px - 34} ${GROUND + 20 + i * 30} L ${px + 34} ${GROUND + 20 + i * 30} L ${px + 26} ${GROUND + 74 + i * 30} L ${px - 26} ${GROUND + 74 + i * 30} Z`} fill="#F4EEDD" />
        </g>
      ))}
      {/* a dentist in a white coat walks in */}
      <Walker x={lerp(1120, 968, walk)} y={lerp(1090, 806, walk)} s={lerp(2.0, 0.9, walk)} t={am} ph={1} o={{ ...OUTFITS_1954[0], head: 'none', bottom: '#F4F1E8', leg: '#E4DCC8' }} />
      {/* the first intake: 21 pupils, counted onto the lawn */}
      {Array.from({ length: 21 }, (_, i) => {
        const at = 150 + i * 9;
        const p = Math.max(0, Math.min(1.15, pop(u, at, 4)));
        const col = i % 7;
        const row = Math.floor(i / 7);
        return (
          <g key={i} transform={`translate(${n1(150 + col * 70 + row * 20)} ${n1(850 + row * 44)}) scale(${(p * (0.66 + row * 0.08)).toFixed(3)})`}>
            <ellipse cx={0} cy={2} rx={20} ry={5} fill="#000" opacity={0.25} />
            <path d="M -17 0 C -17 -44, -10 -54, 0 -54 C 10 -54, 17 -44, 17 0 Z" fill="#F8F3E6" />
            <circle cx={0} cy={-66} r={12} fill={SKINS[i % 4]} />
            <path d="M -12 -66 C -13 -84, 13 -84, 12 -66 C 6 -72, -6 -72, -12 -66 Z" fill="#1B1714" />
          </g>
        );
      })}
      <text x={150} y={770} textAnchor="start" fontFamily={f.ui} fontSize={110} fontWeight={700} fill="#FFFFFF" opacity={prog(u, 150, 170)} style={{ paintOrder: 'stroke' }} stroke="#1F3A1A" strokeWidth={6}>
        {Math.round(21 * prog(u, 150, 150 + 21 * 9, (x) => x))}
      </text>
      <rect x={0} y={0} width={0} height={0} opacity={outE(0)} />
    </g>
  );
};
