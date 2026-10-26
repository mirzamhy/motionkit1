// Proof scene: "the pizza arrives" — one bespoke, code-only illustrated scene (no assets). Four shots in 14 s:
//   A1 the room from the side: Laszlo typing, the monitor edge-on, its light on his face         0 – 150
//   A2 dissolve to the screen, over his shoulder: the post being written  150 – 360
//   B  back in the room: he looks up, pan to the door, a knock, the courier with two boxes     360 – 590
//   C  top-down on the desk: the open box, a procedural pizza, a slice pulled away with cheese 590 – 830
// The room keeps its own clock (rt = t − TURN_HOLD after the screen shot), so B and C are timed as before.
// Everything is layered SVG: gradients for form, seeded procedural detail, a static grain filter, parallax by depth.
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { fontsFor, useFontsReady } from '../engine/fonts';
import { inOut, outE, prog, typed } from '../engine/util';

const TURN_AT = 150; // room → screen
const TURN_HOLD = 170; // frames the room clock is paused for the screen shot
const BACK_AT = TURN_AT + TURN_HOLD + 40; // screen → room
export const PIZZA_SCENE_FRAMES = 660 + TURN_HOLD;
const W = 1920;
const H = 1080;
const FLOOR = 880;
const HOT = '#E8770B';

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const n1 = (x: number) => x.toFixed(1);
const rad = (a: number) => (a * Math.PI) / 180;
/** eased bump 0 → 1 → 0 over [a, b] */
const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * prog(t, a, b, (x) => x));
/** two-bone arm: returns the elbow for a shoulder, a hand target and two bone lengths (elbow hangs down) */
const ik = (sx: number, sy: number, hx: number, hy: number, a: number, b: number): [number, number] => {
  const d = Math.max(1, Math.min(a + b - 1, Math.hypot(hx - sx, hy - sy)));
  const e = Math.atan2(hy - sy, hx - sx) + Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  return [sx + a * Math.cos(e), sy + a * Math.sin(e)];
};
const blink = (t: number, offset = 0) => {
  const u = (t + offset) % 170;
  return 1 - 0.92 * bump(u, 150, 164);
};
const steam = (x: number, y: number, t: number, ph: number, h = 90, amp = 9) => {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const k = i / 8;
    return `${n1(x + amp * (0.3 + k) * Math.sin(t / 17 + ph + k * 4.2))} ${n1(y - h * k)}`;
  });
  return `M ${pts.join(' L ')}`;
};

// ───────────────────────────────────────────── defs ─────────────────────────────────────────────
export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="ps-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2F4248" />
      <stop offset="1" stopColor="#1B272C" />
    </linearGradient>
    <linearGradient id="ps-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5E3F27" />
      <stop offset="1" stopColor="#2E1D12" />
    </linearGradient>
    <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0B1630" />
      <stop offset="1" stopColor="#2B4468" />
    </linearGradient>
    <linearGradient id="ps-hoodie" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#5A848B" />
      <stop offset="1" stopColor="#2C474C" />
    </linearGradient>
    <radialGradient id="ps-skin" cx="0.62" cy="0.38" r="0.75">
      <stop offset="0" stopColor="#F3CFA8" />
      <stop offset="0.7" stopColor="#E0B089" />
      <stop offset="1" stopColor="#B98660" />
    </radialGradient>
    <radialGradient id="ps-skin2" cx="0.5" cy="0.4" r="0.75">
      <stop offset="0" stopColor="#D9A67C" />
      <stop offset="0.7" stopColor="#C08A5E" />
      <stop offset="1" stopColor="#8F6040" />
    </radialGradient>
    <radialGradient id="ps-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#A9D2FF" stopOpacity="0.55" />
      <stop offset="1" stopColor="#A9D2FF" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="ps-lamp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFD890" stopOpacity="0.55" />
      <stop offset="1" stopColor="#FFD890" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="ps-hall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FBE7B8" />
      <stop offset="1" stopColor="#E2A75A" />
    </linearGradient>
    <linearGradient id="ps-door" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#6B3F24" />
      <stop offset="0.5" stopColor="#8A5632" />
      <stop offset="1" stopColor="#5E361E" />
    </linearGradient>
    <linearGradient id="ps-jacket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#D0503C" />
      <stop offset="1" stopColor="#8E2A1C" />
    </linearGradient>
    <linearGradient id="ps-desk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#B07A48" />
      <stop offset="1" stopColor="#7A5230" />
    </linearGradient>
    <radialGradient id="ps-crust" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.8" stopColor="#E9B863" />
      <stop offset="0.93" stopColor="#D09443" />
      <stop offset="1" stopColor="#9C6222" />
    </radialGradient>
    <radialGradient id="ps-cheese" cx="0.42" cy="0.38" r="0.7">
      <stop offset="0" stopColor="#FBE38C" />
      <stop offset="0.7" stopColor="#F2C85C" />
      <stop offset="1" stopColor="#E0A63E" />
    </radialGradient>
    <radialGradient id="ps-pep" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#D2553F" />
      <stop offset="0.75" stopColor="#A93122" />
      <stop offset="1" stopColor="#771C12" />
    </radialGradient>
    <linearGradient id="ps-basil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#6FA04A" />
      <stop offset="1" stopColor="#2F5A26" />
    </linearGradient>
    <linearGradient id="ps-card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#D9B988" />
      <stop offset="1" stopColor="#B48C58" />
    </linearGradient>
    <linearGradient id="ps-wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8C5E36" />
      <stop offset="0.5" stopColor="#A06C3E" />
      <stop offset="1" stopColor="#7C5230" />
    </linearGradient>
    <radialGradient id="ps-warm" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FBD98E" stopOpacity="1" />
      <stop offset="1" stopColor="#FBD98E" stopOpacity="0" />
    </radialGradient>
    <pattern id="ps-paper" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 32 6 L 44 32 L 32 58 L 20 32 Z" fill="none" stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="2" fill="#FFFFFF" fillOpacity="0.04" />
      <circle cx="64" cy="64" r="2" fill="#FFFFFF" fillOpacity="0.04" />
    </pattern>
    {/* static textures: never animated, so they cost nothing frame to frame */}
    <filter id="ps-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0" />
    </filter>
    <filter id="ps-woodgrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.22" numOctaves="3" seed="9" />
      <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.08  0 0 0 0 0.02  0 0 0 0.9 -0.25" />
    </filter>
    <filter id="ps-rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" />
    </filter>
    <filter id="ps-melt" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
    <filter id="ps-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <filter id="ps-defocus" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3" />
    </filter>
    <linearGradient id="ps-beam" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stopColor="#A9D2FF" stopOpacity="0.5" />
      <stop offset="1" stopColor="#A9D2FF" stopOpacity="0" />
    </linearGradient>
    <filter id="ps-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
  </defs>
);

// ───────────────────────────────────────────── shot A / B: the room ─────────────────────────────────────────────
type RoomData = ReturnType<typeof buildRoom>;
const buildRoom = () => {
  const r = rng(11);
  const stars = Array.from({ length: 46 }, () => ({ x: 196 + r() * 348, y: 150 + r() * 210, s: 0.8 + r() * 1.6, ph: r() * 6.3 }));
  const towers = Array.from({ length: 9 }, (_, i) => {
    const w = 34 + r() * 40;
    const h = 60 + r() * 150;
    return { x: 186 + i * 42 + r() * 10, w, h, win: Array.from({ length: 24 }, () => r()) };
  });
  const cols = ['#B4432E', '#D9A441', '#3F5E63', '#E8DCC4', '#44476B', '#8E6A3E', '#A8402C', '#6F8E7A'];
  let bx = 652;
  const books = Array.from({ length: 15 }, () => {
    const w = 16 + r() * 18;
    const b = { x: bx, w, h: 70 + r() * 46, c: cols[Math.floor(r() * cols.length)], lean: r() > 0.86 ? 8 : 0, band: r() };
    bx += w + 2;
    return b;
  });
  const leaves = Array.from({ length: 11 }, (_, i) => ({ a: -80 + i * 16 + r() * 8, l: 110 + r() * 90, ph: r() * 6 }));
  const planks = Array.from({ length: 16 }, (_, i) => ({ x: -200 + i * 240 + r() * 60, row: i % 3 }));
  return { stars, towers, books, leaves, planks };
};

const Room: React.FC<{ t: number; d: RoomData; cx: number; f: { mono: string; ui: string; disp: string } }> = ({ t, d, cx, f }) => {
  const par = (k: number) => `translate(${n1((cx - 960) * k)} 0)`; // far layers lag behind the camera
  // Laszlo's performance
  const typing = 1 - prog(t, 200, 222, inOut);
  const look = prog(t, 206, 236, inOut); // hears the knock: head up, brows up
  const h1: [number, number] = [1104 + 10 * Math.sin(t / 23), 641 - 6 * typing * Math.max(0, Math.sin(t * 0.52))];
  const h2: [number, number] = [1168 + 8 * Math.sin(t / 19 + 2), 641 - 6 * typing * Math.max(0, Math.sin(t * 0.47 + 1.9))];
  const e1 = ik(960, 545, h1[0], h1[1], 118, 118);
  const e2 = ik(988, 540, h2[0], h2[1], 118, 122);
  const breathe = 2.2 * Math.sin(t / 34);
  const headRot = -3 * Math.sin(t / 61) * typing - 9 * look;
  // door
  const knocks = [262, 278, 294];
  const shake = knocks.reduce((a, k) => a + (t < k ? 0 : prog(t, k, k + 3, inOut) * Math.exp(-(t - k) / 5)), 0);
  const open = prog(t, 308, 356, inOut);
  const ds = 1 - 0.84 * open;
  const bob = 2.5 * Math.sin(t / 13);
  return (
    <>
      {/* wall, wallpaper, baseboard, floor */}
      <rect x={-400} y={-200} width={3800} height={FLOOR + 200} fill="url(#ps-wall)" />
      <rect x={-400} y={-200} width={3800} height={FLOOR + 200} fill="url(#ps-paper)" />
      <rect x={-400} y={FLOOR - 34} width={3800} height={34} fill="#3B2A1E" />
      <rect x={-400} y={FLOOR - 34} width={3800} height={4} fill="#5A4130" />
      <rect x={-400} y={FLOOR} width={3800} height={400} fill="url(#ps-floor)" />
      {d.planks.map((p, i) => (
        <path key={i} d={`M ${p.x} ${FLOOR + p.row * 70} L ${p.x - 60} ${FLOOR + p.row * 70 + 70}`} stroke="#22150C" strokeWidth={2} opacity={0.6} />
      ))}
      {[70, 140, 210].map((y) => (
        <rect key={y} x={-400} y={FLOOR + y} width={3800} height={2} fill="#22150C" opacity={0.5} />
      ))}

      {/* window: sky, stars, moon, skyline (deepest layer), frame, curtains */}
      <g>
        <rect x={180} y={130} width={380} height={440} fill="url(#ps-sky)" />
        <g clipPath="url(#ps-win)"><g transform={par(0.5)}>
          {d.stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFFFFF" opacity={0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t / 19 + s.ph))} />
          ))}
          <circle cx={470} cy={220} r={34} fill="#F4EBD0" />
          <circle cx={456} cy={212} r={31} fill="#16264A" opacity={0.9} />
          <circle cx={470} cy={220} r={70} fill="#F4EBD0" opacity={0.07} />
        </g></g>
        <g clipPath="url(#ps-win)"><g transform={par(0.35)}>
          {d.towers.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={570 - b.h} width={b.w} height={b.h} fill={i % 2 ? '#101C30' : '#16243C'} />
              {b.win.map((w, j) => {
                const col = j % 3;
                const row = Math.floor(j / 3);
                if (row * 18 + 26 > b.h || w < 0.55) return null;
                return <rect key={j} x={b.x + 6 + col * (b.w - 12) * 0.36} y={570 - b.h + 10 + row * 18} width={6} height={9} fill="#F6CE7A" opacity={0.55 + 0.35 * Math.sin(t / 47 + w * 40)} />;
              })}
            </g>
          ))}
        </g></g>
        <clipPath id="ps-win">
          <rect x={180} y={130} width={380} height={440} />
        </clipPath>
        <rect x={180} y={130} width={380} height={440} fill="#9CC3FF" opacity={0.05} />
        <path d="M 180 130 L 330 130 L 210 570 L 180 570 Z" fill="#FFFFFF" opacity={0.04} />
        <rect x={166} y={116} width={408} height={468} fill="none" stroke="#E8DCC4" strokeWidth={16} />
        <rect x={362} y={130} width={12} height={440} fill="#E8DCC4" />
        <rect x={180} y={340} width={380} height={10} fill="#E8DCC4" />
        <rect x={150} y={584} width={440} height={20} rx={4} fill="#D5C7AA" />
        <rect x={150} y={600} width={440} height={6} fill="#000" opacity={0.25} />
        {/* curtains: folded strips with a slow sway */}
        {[0, 1].map((side) => (
          <g key={side} transform={`translate(${side ? 574 : 166} 96) skewX(${n1((side ? -1 : 1) * (1.2 + 0.9 * Math.sin(t / 53 + side)))})`}>
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={i} x={(side ? -1 : 1) * i * 19 - (side ? 19 : 0)} y={0} width={19} height={520 - i * 9} fill={i % 2 ? '#8E3A28' : '#B04A34'} />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <rect key={`h${i}`} x={(side ? -1 : 1) * i * 19 - (side ? 19 : 0)} y={0} width={4} height={520 - i * 9} fill="#D06A50" opacity={0.5} />
            ))}
          </g>
        ))}
        <rect x={140} y={86} width={460} height={12} rx={6} fill="#2A1F18" />
      </g>

      {/* shelf with books */}
      <g transform="translate(-70 -110)">
        <rect x={630} y={330} width={400} height={14} rx={3} fill="#8A5E38" />
        <rect x={630} y={342} width={400} height={5} fill="#000" opacity={0.3} />
        <path d="M 660 344 L 660 372 L 690 344 Z M 1000 344 L 1000 372 L 970 344 Z" fill="#5E3F27" />
        {d.books.map((b, i) => (
          <g key={i} transform={`rotate(${b.lean} ${b.x} 330)`}>
            <rect x={b.x} y={330 - b.h} width={b.w} height={b.h} fill={b.c} />
            <rect x={b.x} y={330 - b.h} width={3} height={b.h} fill="#FFFFFF" opacity={0.18} />
            <rect x={b.x + b.w - 4} y={330 - b.h} width={4} height={b.h} fill="#000" opacity={0.22} />
            <rect x={b.x} y={330 - b.h + 12 + b.band * 20} width={b.w} height={5} fill="#F2E6C8" opacity={0.75} />
            <rect x={b.x} y={330 - 18} width={b.w} height={3} fill="#F2E6C8" opacity={0.5} />
          </g>
        ))}
      </g>

      {/* wall clock */}
      <g transform="translate(1420 210)">
        <circle r={62} fill="#000" opacity={0.25} cx={5} cy={7} />
        <circle r={60} fill="#3A2A1E" />
        <circle r={52} fill="#F2E9D5" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-1.5} y={-48} width={3} height={i % 3 ? 7 : 12} fill="#2A1F18" transform={`rotate(${i * 30})`} />
        ))}
        <rect x={-3} y={-30} width={6} height={32} rx={3} fill="#2A1F18" transform="rotate(8)" />
        <rect x={-2} y={-42} width={4} height={44} rx={2} fill="#2A1F18" transform={`rotate(${n1(205 + t * 0.012)})`} />
        <rect x={-1} y={-44} width={2} height={54} fill={HOT} transform={`rotate(${n1(t * 0.1)})`} />
        <circle r={4} fill={HOT} />
      </g>

      {/* framed chart + floor plant (between desk and door) */}
      <g>
        <rect x={1846} y={176} width={250} height={290} fill="#000" opacity={0.25} />
        <rect x={1840} y={170} width={250} height={290} fill="#2A1F18" />
        <rect x={1854} y={184} width={222} height={262} fill="#EFE6D3" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={1870} y={230 + i * 46} width={190} height={1.5} fill="#1F1A14" opacity={0.15} />
        ))}
        <path d="M 1870 400 L 1905 392 L 1935 398 L 1965 360 L 1995 368 L 2025 300 L 2060 240" fill="none" stroke={HOT} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={2060} cy={240} r={7} fill={HOT} />
        <rect x={1870} y={200} width={90} height={8} fill="#1F1A14" opacity={0.7} />
        <path d="M 1854 184 L 1960 184 L 1880 446 L 1854 446 Z" fill="#FFFFFF" opacity={0.12} />
      </g>
      <g transform={`translate(2130 ${FLOOR})`}>
        <ellipse cx={0} cy={2} rx={70} ry={12} fill="#000" opacity={0.35} />
        {d.leaves.map((l, i) => {
          const a = l.a + 2.5 * Math.sin(t / 41 + l.ph);
          return (
            <g key={i} transform={`translate(0 -120) rotate(${n1(a)})`}>
              <path d={`M 0 0 Q ${-l.l * 0.22} ${-l.l * 0.55} 0 ${-l.l} Q ${l.l * 0.22} ${-l.l * 0.55} 0 0 Z`} fill={i % 2 ? '#3F6B3A' : '#4F8347'} />
              <path d={`M 0 0 L 0 ${-l.l * 0.9}`} stroke="#2A4A28" strokeWidth={2} />
            </g>
          );
        })}
        <path d="M -52 -124 L 52 -124 L 40 0 L -40 0 Z" fill="#B4532E" />
        <path d="M 10 -124 L 52 -124 L 40 0 L 14 0 Z" fill="#8E3A1E" />
        <rect x={-58} y={-136} width={116} height={16} rx={4} fill="#C9643A" />
      </g>

      {/* rug */}
      <ellipse cx={1010} cy={FLOOR + 44} rx={420} ry={62} fill="#7A2E22" />
      <ellipse cx={1010} cy={FLOOR + 44} rx={380} ry={52} fill="none" stroke="#E0B34A" strokeWidth={4} strokeDasharray="14 10" />
      <ellipse cx={1010} cy={FLOOR + 44} rx={300} ry={38} fill="#8E3A28" />

      {/* chair */}
      <g>
        <ellipse cx={950} cy={FLOOR + 6} rx={110} ry={14} fill="#000" opacity={0.4} />
        <path d={`M 950 ${FLOOR - 26} L 860 ${FLOOR} M 950 ${FLOOR - 26} L 1040 ${FLOOR} M 950 ${FLOOR - 26} L 950 ${FLOOR + 6}`} stroke="#1F1A14" strokeWidth={12} strokeLinecap="round" />
        {[860, 950, 1040].map((x) => (
          <circle key={x} cx={x} cy={FLOOR + 2} r={11} fill="#0F0D0B" />
        ))}
        <rect x={940} y={742} width={20} height={116} fill="#4A443C" />
        <rect x={862} y={716} width={180} height={30} rx={14} fill="#2A2622" />
        <rect x={862} y={716} width={180} height={8} rx={4} fill="#4A443C" />
        <rect x={846} y={500} width={34} height={230} rx={16} fill="#2A2622" transform="rotate(-5 863 716)" />
        <rect x={850} y={506} width={9} height={214} rx={4} fill="#4A443C" transform="rotate(-5 863 716)" />
      </g>

      {/* Laszlo — far arm, legs, torso, head, near arm */}
      <g transform={`translate(0 ${n1(breathe * 0.4)})`}>
        <path d={`M 988 540 L ${n1(e2[0])} ${n1(e2[1])} L ${n1(h2[0])} ${n1(h2[1])}`} fill="none" stroke="#28403F" strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx={h2[0] + 14} cy={h2[1] + 2} rx={19} ry={12} fill="#C99570" />
        {/* legs */}
        <path d="M 946 712 L 1082 716" stroke="#33415F" strokeWidth={56} strokeLinecap="round" />
        <path d="M 1082 716 L 1092 850" stroke="#3B4A6B" strokeWidth={46} strokeLinecap="round" />
        <path d="M 946 700 L 1082 704" stroke="#4A5C82" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        <path d="M 1068 852 L 1150 852 Q 1162 868 1150 876 L 1068 876 Z" fill="#E8DCC4" />
        <rect x={1066} y={872} width={90} height={8} rx={3} fill="#1F1A14" />
        <path d="M 1100 852 L 1112 866 M 1114 852 L 1126 866" stroke="#B4432E" strokeWidth={3} />
        {/* torso */}
        <ellipse cx={944} cy={506} rx={50} ry={30} fill="#2C474C" transform="rotate(-24 944 506)" />
        <path d={`M 896 724 C 884 610, 906 ${n1(528 - breathe)}, 962 ${n1(506 - breathe)} C 1012 ${n1(500 - breathe)}, 1036 540, 1032 604 L 1026 724 Z`} fill="url(#ps-hoodie)" />
        <path d="M 896 724 C 890 660, 894 600, 912 560 C 916 620, 920 680, 932 724 Z" fill="#000" opacity={0.18} />
        <rect x={894} y={704} width={134} height={22} rx={8} fill="#28403F" />
        <path d="M 958 640 Q 990 628 1022 644" fill="none" stroke="#28403F" strokeWidth={4} />
        {/* head */}
        <g transform={`rotate(${n1(headRot)} 974 496)`}>
          <path d="M 958 462 L 996 458 L 1000 512 Q 978 524 956 510 Z" fill="#B98660" />
          <ellipse cx={986} cy={420} rx={57} ry={63} fill="url(#ps-skin)" />
          <path d="M 1040 410 Q 1058 432 1040 440 Z" fill="#E0B089" />
          <ellipse cx={956} cy={430} rx={10} ry={15} fill="#C99570" />
          <path d="M 954 424 Q 960 430 955 438" fill="none" stroke="#9A6A48" strokeWidth={2} />
          {/* hair: mass, fringe, highlight */}
          <path d="M 930 426 C 918 344, 992 326, 1040 370 C 1012 364, 990 370, 978 392 C 968 402, 958 400, 952 428 C 946 446, 934 446, 930 426 Z" fill="#5B3A22" />
          <path d="M 944 372 C 960 344, 1004 344, 1028 364" fill="none" stroke="#8A5E3A" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          {/* screen light on the face */}
          <ellipse cx={1016} cy={428} rx={40} ry={52} fill="#A9D2FF" opacity={0.2} style={{ mixBlendMode: 'screen' }} />
          {/* brow, eye, glasses, mouth */}
          <path d={`M 1002 ${n1(402 - 6 * look)} L 1030 ${n1(399 - 8 * look)}`} stroke="#4A2E1A" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={1016} cy={420} rx={5} ry={6.5 * blink(t)} fill="#1F1A14" />
          <circle cx={1018} cy={418} r={1.6} fill="#FFFFFF" opacity={blink(t)} />
          <rect x={996} y={404} width={38} height={31} rx={8} fill="#CFE6FF" fillOpacity={0.22} stroke="#1F1A14" strokeWidth={4.5} />
          <path d="M 1002 410 L 1012 408 L 1004 430 Z" fill="#FFFFFF" opacity={0.3} />
          <path d="M 996 416 L 958 422 M 1034 416 L 1044 414" stroke="#1F1A14" strokeWidth={4.5} strokeLinecap="round" />
          <path d={`M 1012 ${n1(458 - 3 * look)} Q 1026 ${n1(462 + 7 * look)} 1036 ${n1(454 - 2 * look)}`} fill="none" stroke="#7A4A34" strokeWidth={4} strokeLinecap="round" />
        </g>
        {/* drawstrings + near arm */}
        <path d="M 998 520 L 1002 580 M 1014 518 L 1022 574" stroke="#E8DCC4" strokeWidth={3.5} strokeLinecap="round" />
        <path d={`M 960 545 L ${n1(e1[0])} ${n1(e1[1])} L ${n1(h1[0])} ${n1(h1[1])}`} fill="none" stroke="#4E767C" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M 960 545 L ${n1(e1[0])} ${n1(e1[1])}`} fill="none" stroke="#6C979D" strokeWidth={8} strokeLinecap="round" opacity={0.5} transform="translate(-6 -14)" />
        <circle cx={lerp(e1[0], h1[0], 0.86)} cy={lerp(e1[1], h1[1], 0.86)} r={24} fill="#28403F" />
        <ellipse cx={h1[0] + 16} cy={h1[1] + 1} rx={22} ry={13} fill="#E0B089" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={h1[0] + 24 + i * 5} y={h1[1] - 2 + (i % 2) * 3 * typing * Math.sin(t * 0.6 + i)} width={16} height={7} rx={3.5} fill="#E0B089" />
        ))}
      </g>

      {/* side cabinet against the back wall (it faces the room): drawers, lamp, mug, papers */}
      <g>
        <rect x={1552} y={720} width={266} height={160} fill="#6B4628" />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={1564} y={732 + i * 70} width={242} height={60} rx={4} fill="#7E5632" />
            <rect x={1564} y={732 + i * 70} width={242} height={5} fill="#9A6E44" opacity={0.7} />
            <rect x={1662} y={756 + i * 70} width={46} height={8} rx={4} fill="#D9A441" />
          </g>
        ))}
        <rect x={1564} y={872} width={14} height={8} fill="#3B2A1E" />
        <rect x={1792} y={872} width={14} height={8} fill="#3B2A1E" />
        <rect x={1540} y={704} width={290} height={18} rx={4} fill="url(#ps-desk)" />
        <rect x={1540} y={704} width={290} height={4} rx={2} fill="#D29A62" opacity={0.7} />
        <rect x={1552} y={722} width={266} height={6} fill="#000" opacity={0.3} />
        <g transform="translate(50 44)">
          {/* mug with moving steam */}
          <rect x={1548} y={618} width={36} height={42} rx={5} fill={HOT} />
          <rect x={1548} y={618} width={10} height={42} rx={5} fill="#F59B3A" />
          <ellipse cx={1566} cy={620} rx={18} ry={5} fill="#3A2416" />
          <path d="M 1584 628 C 1602 628, 1602 652, 1584 652" fill="none" stroke={HOT} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={steam(1556 + i * 10, 610, t, i * 2.1, 70, 7)} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.16} filter="url(#ps-soft)" />
          ))}
  
          {/* papers */}
          <rect x={1620} y={644} width={96} height={6} fill="#EFE6D3" transform="rotate(-2 1668 647)" />
          <rect x={1616} y={650} width={100} height={6} fill="#D9CDB4" />
          <rect x={1622} y={655} width={96} height={5} fill="#EFE6D3" />
  
          {/* desk lamp: base, two-part arm, shade, cone of light */}
          <rect x={1696} y={648} width={56} height={12} rx={6} fill="#1F1C19" />
          <path d="M 1724 650 L 1746 520 L 1660 452" fill="none" stroke="#3A3632" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={1746} cy={520} r={8} fill="#1F1C19" />
          <path d="M 1690 430 L 1650 478 L 1600 446 L 1652 414 Z" fill="#B4432E" />
          <path d="M 1690 430 L 1650 478 L 1640 472 L 1680 424 Z" fill="#8E2A1C" />
          <ellipse cx={1626} cy={462} rx={26} ry={10} fill="#FFE7A8" transform="rotate(32 1626 462)" />
          <path d="M 1604 448 L 1648 476 L 1700 660 L 1500 660 Z" fill="url(#ps-lamp)" style={{ mixBlendMode: 'screen' }} />
          <ellipse cx={1600} cy={662} rx={110} ry={10} fill="#FFD890" opacity={0.25} style={{ mixBlendMode: 'screen' }} />
        </g>
      </g>

      {/* desk, seen from its end like Laszlo: a narrow top on two legs, the tower underneath */}
      <g>
        <rect x={1040} y={684} width={18} height={196} fill="#5A3A20" />
        <rect x={1404} y={684} width={18} height={196} fill="#5A3A20" />
        <rect x={1058} y={812} width={346} height={12} fill="#4A2F1A" />
        {/* PC tower under the desk */}
        <g transform="translate(-112 0)">
          <rect x={1400} y={740} width={96} height={140} rx={6} fill="#22201D" />
          <rect x={1410} y={752} width={76} height={6} rx={3} fill="#3A3632" />
          <rect x={1410} y={766} width={76} height={6} rx={3} fill="#3A3632" />
          <circle cx={1448} cy={800} r={9} fill="#3A3632" />
          <circle cx={1448} cy={800} r={4} fill="#6FE08A" opacity={0.5 + 0.5 * Math.sin(t / 9)} />
          <circle cx={1474} cy={800} r={3} fill={HOT} opacity={0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t / 3.7))} />
        </g>
        <rect x={1016} y={660} width={424} height={26} rx={5} fill="url(#ps-desk)" />
        <rect x={1016} y={660} width={424} height={5} rx={2} fill="#D29A62" opacity={0.7} />
        <rect x={1016} y={684} width={424} height={8} fill="#000" opacity={0.3} />

        {/* monitor, edge-on: the screen faces Laszlo, we only see its light */}
        <path d="M 1300 404 L 1052 330 L 1052 690 L 1300 600 Z" fill="url(#ps-beam)" opacity={0.5 + 0.05 * Math.sin(t / 6)} style={{ mixBlendMode: 'screen' }} />
        <rect x={1318} y={590} width={18} height={66} fill="#2A2622" />
        <path d="M 1322 600 L 1372 650 L 1372 660 L 1310 660 Z" fill="#1F1C19" />
        <rect x={1268} y={652} width={120} height={9} rx={4.5} fill="#1F1C19" />
        <path d="M 1300 396 L 1316 396 Q 1348 410 1350 500 Q 1348 592 1316 606 L 1300 606 Z" fill="#1B1917" />
        <path d="M 1316 396 Q 1348 410 1350 500 Q 1348 592 1316 606 Z" fill="#2E2A26" />
        <path d="M 1322 420 Q 1338 440 1340 500" fill="none" stroke="#4A443C" strokeWidth={2} />
        <circle cx={1336} cy={540} r={4} fill="#4A443C" />
        <rect x={1296} y={400} width={6} height={202} rx={2} fill="#CFE6FF" opacity={0.85 + 0.1 * Math.sin(t / 6)} />
        <rect x={1290} y={396} width={10} height={210} rx={3} fill="#A9D2FF" opacity={0.35} filter="url(#ps-soft)" />
        {/* cable down to the tower */}
        <path d="M 1340 560 C 1396 600, 1300 680, 1336 742" fill="none" stroke="#151311" strokeWidth={4} />
        <ellipse cx={1150} cy={480} rx={300} ry={250} fill="url(#ps-glow)" opacity={0.5 + 0.04 * Math.sin(t / 7)} style={{ mixBlendMode: 'screen' }} />

        {/* keyboard + mouse */}
        <path d="M 1076 648 L 1250 648 L 1258 660 L 1068 660 Z" fill="#D8CFBC" />
        <rect x={1076} y={646} width={174} height={4} rx={2} fill="#F3ECDD" />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={1080 + i * 12} y={650} width={9} height={3} fill="#8E8576" />
        ))}
        <ellipse cx={1292} cy={654} rx={16} ry={7} fill="#D8CFBC" />
      </g>

      {/* door: hallway + courier clipped to the opening, then the swinging panel, then light */}
      <g>
        <clipPath id="ps-opening">
          <rect x={2250} y={300} width={300} height={580} />
        </clipPath>
        <rect x={2232} y={282} width={336} height={598} fill="#E8DCC4" />
        <rect x={2232} y={282} width={336} height={598} fill="none" stroke="#B9AB8C" strokeWidth={3} />
        <g clipPath="url(#ps-opening)">
          <rect x={2250} y={300} width={300} height={580} fill="url(#ps-hall)" />
          <rect x={2250} y={800} width={300} height={80} fill="#B07A48" />
          <circle cx={2400} cy={330} r={150} fill="#FFFFFF" opacity={0.35} filter="url(#ps-soft)" />
          {/* courier */}
          <g transform={`translate(0 ${n1(bob)})`}>
            <ellipse cx={2400} cy={878} rx={100} ry={12} fill="#000" opacity={0.3} />
            <rect x={2360} y={738} width={34} height={126} rx={8} fill="#2A3350" />
            <rect x={2406} y={738} width={34} height={126} rx={8} fill="#232B45" />
            <path d="M 2352 858 L 2396 858 L 2396 876 L 2344 876 Q 2342 864 2352 858 Z M 2404 858 L 2448 858 Q 2458 864 2456 876 L 2404 876 Z" fill="#1F1A14" />
            <path d="M 2338 566 Q 2400 536 2462 566 L 2454 756 L 2346 756 Z" fill="url(#ps-jacket)" />
            <path d="M 2400 552 L 2400 756" stroke="#5E1A10" strokeWidth={3} />
            <path d="M 2378 548 L 2400 580 L 2422 548 L 2412 540 L 2400 556 L 2388 540 Z" fill="#F2E6C8" />
            <rect x={2350} y={600} width={34} height={22} rx={3} fill="#F2E6C8" />
            <circle cx={2367} cy={611} r={6} fill="#B4382A" />
            <path d="M 2346 580 L 2318 664 L 2334 700" fill="none" stroke="#B4382A" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 2454 580 L 2482 664 L 2466 700" fill="none" stroke="#8E2A1C" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" />
            {/* head + cap */}
            <rect x={2384} y={516} width={32} height={34} fill="#8F6040" />
            <ellipse cx={2400} cy={490} rx={44} ry={50} fill="url(#ps-skin2)" />
            <ellipse cx={2356} cy={494} rx={8} ry={12} fill="#A97248" />
            <ellipse cx={2444} cy={494} rx={8} ry={12} fill="#A97248" />
            <path d="M 2356 478 C 2352 418, 2448 418, 2444 478 Z" fill="#B4382A" />
            <path d="M 2400 432 C 2428 434, 2444 452, 2444 478 L 2420 478 C 2420 458, 2412 442, 2400 432 Z" fill="#8E2A1C" />
            <ellipse cx={2400} cy={478} rx={56} ry={10} fill="#8E2A1C" />
            <ellipse cx={2400} cy={475} rx={56} ry={8} fill="#C9463A" />
            <circle cx={2400} cy={454} r={11} fill="#F2E6C8" />
            <path d="M 2400 454 L 2410 449 A 11 11 0 0 1 2408 462 Z" fill="#B4382A" />
            <ellipse cx={2384} cy={496} rx={4.5} ry={5.5 * blink(t, 60)} fill="#1F1A14" />
            <ellipse cx={2416} cy={496} rx={4.5} ry={5.5 * blink(t, 60)} fill="#1F1A14" />
            <path d="M 2376 486 L 2392 484 M 2408 484 L 2424 486" stroke="#3A2416" strokeWidth={3.5} strokeLinecap="round" />
            <path d="M 2400 498 L 2396 512 L 2403 513" fill="none" stroke="#8F6040" strokeWidth={3} strokeLinecap="round" />
            <path d="M 2384 522 Q 2400 536 2416 522" fill="#FFFFFF" stroke="#5E2A1A" strokeWidth={3} strokeLinejoin="round" />
            <circle cx={2372} cy={512} r={7} fill="#D9654F" opacity={0.3} />
            <circle cx={2428} cy={512} r={7} fill="#D9654F" opacity={0.3} />
            {/* two boxes */}
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(0 ${-i * 40})`}>
                <rect x={2300} y={676} width={200} height={40} fill="url(#ps-card)" />
                <rect x={2300} y={676} width={200} height={6} fill="#EAD2A6" />
                <rect x={2484} y={676} width={16} height={40} fill="#96703F" />
                <rect x={2300} y={712} width={200} height={4} fill="#7A5A30" />
                <circle cx={2338} cy={697} r={11} fill="none" stroke="#8E3A28" strokeWidth={3} />
                <path d="M 2338 697 L 2348 692 A 11 11 0 0 1 2346 705 Z" fill="#8E3A28" />
                <text x={2362} y={703} fontFamily={f.mono} fontSize={17} fontWeight={600} letterSpacing={4} fill="#8E3A28">PIZZA</text>
              </g>
            ))}
            <path d="M 2300 636 L 2500 636 L 2488 626 L 2312 626 Z" fill="#EAD2A6" />
            <ellipse cx={2312} cy={690} rx={15} ry={22} fill="#C08A5E" />
            <ellipse cx={2488} cy={690} rx={15} ry={22} fill="#A97248" />
            {[0, 1, 2].map((i) => (
              <path key={i} d={steam(2350 + i * 50, 620, t, i * 1.7, 90, 9)} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.45 * open} filter="url(#ps-soft)" />
            ))}
          </g>
        </g>
        {/* swinging panel, hinged on the left */}
        <g transform={`translate(${n1(2250 + 2.6 * shake * Math.sin(t * 1.7))} 590) skewY(${n1(-(1 - ds) * 7)}) scale(${ds.toFixed(4)} 1) translate(0 -590)`}>
          <rect x={0} y={300} width={300} height={580} fill="url(#ps-door)" />
          {[
            [28, 330, 244, 200],
            [28, 560, 244, 290],
          ].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#5E361E" />
              <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} fill="#7C4C2C" />
              <rect x={x + 8} y={y + 8} width={w - 16} height={5} fill="#9A6A42" opacity={0.6} />
            </g>
          ))}
          <rect x={110} y={540} width={80} height={12} rx={3} fill="#D9A441" />
          <circle cx={262} cy={600} r={15} fill="#8E6A1E" />
          <circle cx={259} cy={597} r={12} fill="#E0B34A" />
          <circle cx={255} cy={593} r={4} fill="#FFF1C4" opacity={0.8} />
          <rect x={0} y={300} width={300} height={580} fill="#000" opacity={0.25 * open} />
        </g>
        {/* knock: three arcs per knock, eased in and out */}
        {knocks.map((k) =>
          [0, 1, 2].map((i) => {
            const p = prog(t, k + i * 2, k + 18 + i * 2, (x) => x);
            return <path key={`${k}-${i}`} d={`M ${2222 - i * 16 - 26 * p} ${520 - 20 * (i + 1)} Q ${2196 - i * 20 - 30 * p} 560 ${2222 - i * 16 - 26 * p} ${600 + 20 * (i + 1)}`} fill="none" stroke="#F2E6C8" strokeWidth={6} strokeLinecap="round" opacity={0.85 * Math.sin(Math.PI * p)} />;
          }),
        )}
        {/* light spilling into the room */}
        <path d="M 2250 880 L 2550 880 L 2420 1100 L 1700 1100 Z" fill="#FBD98E" opacity={0.34 * open} filter="url(#ps-soft)" style={{ mixBlendMode: 'screen' }} />
        <ellipse cx={2400} cy={600} rx={760} ry={620} fill="url(#ps-warm)" opacity={0.3 * open} style={{ mixBlendMode: 'screen' }} />
      </g>
    </>
  );
};

// ───────────────────────────────────────────── shot C: top-down on the desk ─────────────────────────────────────────────
const PC = { x: 860, y: 600, r: 270 }; // pizza centre / radius
const SL = { a0: 20, a1: 65 }; // the slice that gets pulled (degrees, y down)

type PizzaData = ReturnType<typeof buildPizza>;
export const buildPizza = () => {
  const r = rng(77);
  const inDisc = (rmax: number, rmin = 0): [number, number] => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(lerp((rmin / rmax) ** 2, 1, r())) * rmax;
    return [d * Math.cos(a), d * Math.sin(a)];
  };
  const spaced = (n: number, rmax: number, min: number, taken: [number, number][] = []) => {
    const out: [number, number][] = [];
    for (let i = 0; i < 4000 && out.length < n; i++) {
      const p = inDisc(rmax);
      if ([...out, ...taken].every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > min)) out.push(p);
    }
    return out;
  };
  const pep = spaced(15, 186, 78).map((p) => ({ p, rot: r() * 360, s: 0.9 + r() * 0.25, specks: Array.from({ length: 5 }, () => [(r() - 0.5) * 34, (r() - 0.5) * 34, 2 + r() * 2.4]) }));
  const taken = pep.map((x) => x.p);
  return {
    blisters: Array.from({ length: 46 }, () => ({ a: r() * 360, d: 240 + r() * 24, rx: 5 + r() * 12, ry: 3 + r() * 5, dark: r() > 0.45 })),
    blobs: Array.from({ length: 34 }, () => ({ p: inDisc(205), rx: 20 + r() * 34, ry: 14 + r() * 22, rot: r() * 180 })),
    browned: Array.from({ length: 30 }, () => ({ p: inDisc(214), rx: 6 + r() * 14, ry: 4 + r() * 8, rot: r() * 180 })),
    pep,
    olives: spaced(16, 200, 44, taken).map((p) => ({ p, rot: r() * 180 })),
    mush: spaced(9, 196, 60, taken).map((p) => ({ p, rot: r() * 360 })),
    basil: spaced(9, 190, 70).map((p) => ({ p, rot: r() * 360, s: 0.8 + r() * 0.5 })),
    flecks: Array.from({ length: 150 }, () => ({ p: inDisc(218), c: r() > 0.5 ? '#3F6B2A' : r() > 0.5 ? '#8E2A1C' : '#5E3A16', s: 1.2 + r() * 2 })),
    oil: Array.from({ length: 22 }, () => ({ p: inDisc(210), s: 3 + r() * 6 })),
    crumbs: Array.from({ length: 40 }, () => ({ p: inDisc(250), s: 1.5 + r() * 3 })),
    grain: Array.from({ length: 26 }, () => ({ y: r() * H, w: 300 + r() * 900, x: r() * W, o: 0.05 + r() * 0.1 })),
  };
};

/** the whole pizza around (0, 0) */
export const Pizza: React.FC<{ d: PizzaData }> = ({ d }) => (
  <>
    {/* crust: rough edge, baked gradient, blisters */}
    <circle r={PC.r} fill="url(#ps-crust)" filter="url(#ps-rough)" />
    {d.blisters.map((b, i) => (
      <ellipse key={i} cx={b.d * Math.cos(rad(b.a))} cy={b.d * Math.sin(rad(b.a))} rx={b.rx} ry={b.ry} fill={b.dark ? '#7A4614' : '#F6D795'} opacity={b.dark ? 0.55 : 0.6} transform={`rotate(${b.a + 90} ${b.d * Math.cos(rad(b.a))} ${b.d * Math.sin(rad(b.a))})`} />
    ))}
    <circle r={PC.r - 6} fill="none" stroke="#FCE3A6" strokeWidth={3} opacity={0.35} strokeDasharray="60 90 120 40" />
    {/* sauce rim, then melted cheese with lighter pools and browned spots */}
    <circle r={234} fill="#A2301E" filter="url(#ps-rough)" />
    <circle r={226} fill="#C44A30" opacity={0.5} filter="url(#ps-rough)" />
    <circle r={222} fill="url(#ps-cheese)" filter="url(#ps-rough)" />
    <g filter="url(#ps-melt)">
      {d.blobs.map((b, i) => (
        <ellipse key={i} cx={b.p[0]} cy={b.p[1]} rx={b.rx} ry={b.ry} fill="#FFF0B4" opacity={0.6} transform={`rotate(${b.rot} ${b.p[0]} ${b.p[1]})`} />
      ))}
      {d.browned.map((b, i) => (
        <ellipse key={i} cx={b.p[0]} cy={b.p[1]} rx={b.rx} ry={b.ry} fill="#C47A22" opacity={0.6} transform={`rotate(${b.rot} ${b.p[0]} ${b.p[1]})`} />
      ))}
    </g>
    {d.oil.map((o, i) => (
      <circle key={i} cx={o.p[0]} cy={o.p[1]} r={o.s} fill="#F08A2A" opacity={0.35} />
    ))}
    {/* mushrooms */}
    {d.mush.map((m, i) => (
      <g key={i} transform={`translate(${n1(m.p[0])} ${n1(m.p[1])}) rotate(${n1(m.rot)})`}>
        <path d="M -22 2 C -22 -22, 22 -22, 22 2 L 8 4 L 8 20 Q 0 26 -8 20 L -8 4 Z" fill="#5E3A16" opacity={0.35} transform="translate(3 4)" />
        <path d="M -22 2 C -22 -22, 22 -22, 22 2 L 8 4 L 8 20 Q 0 26 -8 20 L -8 4 Z" fill="#EADBC0" />
        <path d="M -16 0 C -14 -14, 14 -14, 16 0" fill="none" stroke="#B89A72" strokeWidth={3} />
        <path d="M -4 6 L -4 18 M 3 6 L 3 18" stroke="#C9B08A" strokeWidth={1.5} />
      </g>
    ))}
    {/* pepperoni: shadow, cupped disc, rim, fat, shine */}
    {d.pep.map((p, i) => (
      <g key={i} transform={`translate(${n1(p.p[0])} ${n1(p.p[1])}) rotate(${n1(p.rot)}) scale(${p.s.toFixed(2)})`}>
        <circle r={33} cx={3} cy={4} fill="#5E1A0C" opacity={0.4} />
        <circle r={32} fill="url(#ps-pep)" />
        <circle r={30} fill="none" stroke="#6E170E" strokeWidth={4} opacity={0.7} />
        <circle r={25} fill="none" stroke="#E0705A" strokeWidth={1.5} opacity={0.5} />
        {p.specks.map(([x, y, s], j) => (
          <circle key={j} cx={x} cy={y} r={s} fill={j % 2 ? '#F0A090' : '#7A1C12'} opacity={0.7} />
        ))}
        <path d="M -20 -10 A 23 23 0 0 1 -4 -22" fill="none" stroke="#FFC7B5" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        <ellipse cx={8} cy={10} rx={9} ry={5} fill="#F08A2A" opacity={0.35} />
      </g>
    ))}
    {/* olives */}
    {d.olives.map((o, i) => (
      <g key={i} transform={`translate(${n1(o.p[0])} ${n1(o.p[1])}) rotate(${n1(o.rot)})`}>
        <ellipse rx={13} ry={11} cx={2} cy={3} fill="#000" opacity={0.3} />
        <ellipse rx={13} ry={11} fill="#221E18" />
        <ellipse rx={5.5} ry={4.5} fill="#EFC257" />
        <path d="M -9 -5 A 11 9 0 0 1 2 -9" fill="none" stroke="#6A6258" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    ))}
    {/* basil */}
    {d.basil.map((b, i) => (
      <g key={i} transform={`translate(${n1(b.p[0])} ${n1(b.p[1])}) rotate(${n1(b.rot)}) scale(${b.s.toFixed(2)})`}>
        <path d="M -30 0 C -14 -22, 16 -20, 32 0 C 16 18, -14 20, -30 0 Z" fill="#1F3A1A" opacity={0.35} transform="translate(3 4)" />
        <path d="M -30 0 C -14 -22, 16 -20, 32 0 C 16 18, -14 20, -30 0 Z" fill="url(#ps-basil)" />
        <path d="M -28 0 L 30 0 M -10 0 L -2 -11 M 4 0 L 12 -10 M -8 0 L 0 10 M 8 0 L 15 9" fill="none" stroke="#244A1E" strokeWidth={1.6} />
        <path d="M -20 -5 C -8 -14, 8 -14, 20 -6" fill="none" stroke="#A6D07A" strokeWidth={2} opacity={0.6} />
      </g>
    ))}
    {d.flecks.map((fl, i) => (
      <rect key={i} x={fl.p[0]} y={fl.p[1]} width={fl.s * 1.8} height={fl.s} fill={fl.c} opacity={0.7} transform={`rotate(${i * 37} ${fl.p[0]} ${fl.p[1]})`} />
    ))}
    {/* cuts */}
    {[20, 65, 110, 155].map((a) => (
      <g key={a}>
        <line x1={266 * Math.cos(rad(a))} y1={266 * Math.sin(rad(a))} x2={-266 * Math.cos(rad(a))} y2={-266 * Math.sin(rad(a))} stroke="#6E3E10" strokeWidth={3} opacity={0.55} />
        <line x1={266 * Math.cos(rad(a))} y1={266 * Math.sin(rad(a)) - 2} x2={-266 * Math.cos(rad(a))} y2={-266 * Math.sin(rad(a)) - 2} stroke="#FFF0B4" strokeWidth={1.2} opacity={0.5} />
      </g>
    ))}
  </>
);

const Hand: React.FC<{ x: number; y: number; rot: number; curl: number }> = ({ x, y, rot, curl }) => (
  <g transform={`translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})`}>
    <ellipse cx={30} cy={20} rx={120} ry={70} fill="#000" opacity={0.3} filter="url(#ps-shadow)" />
    {/* sleeve + cuff */}
    <rect x={44} y={-58} width={1200} height={116} rx={30} fill="url(#ps-hoodie)" />
    <rect x={44} y={-58} width={1200} height={22} rx={11} fill="#6C979D" opacity={0.45} />
    <rect x={30} y={-62} width={44} height={124} rx={16} fill="#28403F" />
    {[40, 50, 60].map((cx) => (
      <rect key={cx} x={cx} y={-60} width={3} height={120} fill="#1B2E2F" opacity={0.6} />
    ))}
    {/* fingers, palm, thumb, knuckles */}
    {[-33, -11, 11, 33].map((fy, i) => (
      <g key={i}>
        <rect x={-128 + curl * 22 + Math.abs(i - 1.5) * 13} y={fy - 10.5} width={110} height={21} rx={10.5} fill="#E0B089" />
        <rect x={-128 + curl * 22 + Math.abs(i - 1.5) * 13} y={fy - 10.5} width={110} height={8} rx={4} fill="#F3CFA8" />
        <rect x={-124 + curl * 22 + Math.abs(i - 1.5) * 13} y={fy - 6.5} width={15} height={13} rx={5} fill="#F8E2CB" opacity={0.85} />
        <path d={`M ${-84 + curl * 14} ${fy - 9} L ${-84 + curl * 14} ${fy + 9}`} stroke="#B98660" strokeWidth={1.5} opacity={0.7} />
      </g>
    ))}
    <ellipse cx={0} cy={0} rx={50} ry={46} fill="url(#ps-skin)" />
    <rect x={-56} y={36} width={62} height={24} rx={12} fill="url(#ps-skin)" transform="rotate(28 -20 48)" />
    <path d="M -34 -34 Q -44 0 -34 34" fill="none" stroke="#C99570" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
  </g>
);

const TopDown: React.FC<{ u: number; d: PizzaData; f: { mono: string; ui: string; disp: string }; P?: boolean }> = ({ u, d, f, P }) => {
  const mid = (SL.a0 + SL.a1) / 2;
  const [ux, uy] = [Math.cos(rad(mid)), Math.sin(rad(mid))];
  const pull = 170 * prog(u, 64, 150, inOut);
  const lift = prog(u, 64, 110, inOut);
  const grab = prog(u, 14, 62, inOut);
  // right hand: flies in to the crust end of the slice, then travels with it
  const gx = PC.x + (PC.r + 34 + pull) * ux;
  const gy = PC.y + (PC.r + 34 + pull) * uy;
  const hx = lerp(gx + 520, gx, grab);
  const hy = lerp(gy + 420, gy, grab);
  const sector = (r: number) => `M 0 0 L ${n1(r * Math.cos(rad(SL.a0)))} ${n1(r * Math.sin(rad(SL.a0)))} A ${r} ${r} 0 0 1 ${n1(r * Math.cos(rad(SL.a1)))} ${n1(r * Math.sin(rad(SL.a1)))} Z`;
  const zoom = 1.0 + 0.07 * prog(u, 0, 240, (x) => x);
  const note = '10.000 BTC';
  const strike = prog(u, 168, 184, inOut);
  return (
    <g transform={`translate(960 540) rotate(${n1(-1.5 + 1.5 * prog(u, 0, 240, inOut))}) scale(${zoom.toFixed(4)}) translate(-960 -540)`}>
      {/* desk top: planks, grain, lamp pool */}
      <rect x={-200} y={-200} width={W + 400} height={H + 1000} fill="url(#ps-wood)" />
      <rect x={-200} y={-200} width={W + 400} height={H + 1000} filter="url(#ps-woodgrain)" opacity={0.75} />
      {[250, 560, 870].map((y) => (
        <rect key={y} x={-200} y={y} width={W + 400} height={3} fill="#3A2412" opacity={0.5} />
      ))}
      {d.grain.map((g, i) => (
        <rect key={i} x={g.x} y={g.y} width={g.w} height={2} rx={1} fill="#3A2412" opacity={g.o} />
      ))}
      <ellipse cx={760} cy={480} rx={1300} ry={900} fill="url(#ps-warm)" opacity={0.42} style={{ mixBlendMode: 'screen' }} />

      {/* second box, closed, top-right */}
      <g transform="translate(1560 300) rotate(9)">
        <rect x={-290} y={-290} width={600} height={600} fill="#000" opacity={0.4} filter="url(#ps-shadow)" />
        <rect x={-300} y={-300} width={600} height={600} rx={6} fill="url(#ps-card)" />
        <rect x={-300} y={-300} width={600} height={600} rx={6} fill="none" stroke="#8E6A3E" strokeWidth={4} />
        <rect x={-270} y={-270} width={540} height={540} fill="none" stroke="#8E3A28" strokeWidth={5} />
        <circle r={120} fill="none" stroke="#8E3A28" strokeWidth={9} />
        <path d="M 0 0 L 106 -52 A 118 118 0 0 1 88 80 Z" fill="#8E3A28" />
        <text y={196} textAnchor="middle" fontFamily={f.disp} fontSize={64} fontWeight={700} letterSpacing={10} fill="#8E3A28">PIZZA</text>
        <text y={-170} textAnchor="middle" fontFamily={f.mono} fontSize={26} fontWeight={600} letterSpacing={10} fill="#8E3A28">HOT · FRESH</text>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-300} y={-290 + i * 50} width={600} height={1.5} fill="#7A5A30" opacity={0.25} />
        ))}
      </g>

      {/* mug, top-down */}
      <g transform="translate(250 250)">
        <circle r={96} cx={10} cy={14} fill="#000" opacity={0.4} filter="url(#ps-shadow)" />
        <rect x={70} y={-18} width={70} height={36} rx={18} fill="#C9620A" />
        <circle r={92} fill={HOT} />
        <circle r={78} fill="#F59B3A" />
        <circle r={72} fill="#3A2416" />
        <circle r={64} fill="#5A3A22" />
        <path d="M -44 -30 A 56 56 0 0 1 10 -54" fill="none" stroke="#C9A27A" strokeWidth={7} strokeLinecap="round" opacity={0.6} />
        <path d={`M -20 10 C ${n1(-4 + 8 * Math.sin(u / 23))} -10, ${n1(14 + 8 * Math.cos(u / 19))} 20, 26 -4`} fill="none" stroke="#E8DCC4" strokeWidth={4} strokeLinecap="round" opacity={0.3} />
      </g>

      {/* open box: lid lying open above, tray with grease paper */}
      <g transform={`translate(${PC.x} ${PC.y})`}>
        <rect x={-330} y={-960} width={680} height={1300} fill="#000" opacity={0.45} filter="url(#ps-shadow)" />
        <rect x={-340} y={-1000} width={680} height={660} fill="#C7A06C" />
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={-340} y={-1000 + i * 25} width={680} height={2} fill="#96703F" opacity={0.35} />
        ))}
        <ellipse cx={-80} cy={-470} rx={130} ry={70} fill="#A27A40" opacity={0.35} filter="url(#ps-melt)" />
        <rect x={-340} y={-348} width={680} height={14} fill="#8E6A3E" />
        <rect x={-340} y={-340} width={680} height={680} rx={4} fill="#B88F5A" />
        <rect x={-316} y={-316} width={632} height={632} fill="#D9BD8E" />
        <rect x={-316} y={-316} width={632} height={16} fill="#8E6A3E" opacity={0.4} />
        <rect x={-316} y={-316} width={16} height={632} fill="#8E6A3E" opacity={0.3} />
        <path d="M -296 -300 L 300 -292 L 292 300 L -300 290 Z" fill="#F3E9D2" />
        <ellipse cx={40} cy={20} rx={250} ry={240} fill="#E3C98C" opacity={0.6} filter="url(#ps-melt)" />
        {d.crumbs.map((c, i) => (
          <circle key={i} cx={c.p[0] * 1.08} cy={c.p[1] * 1.08} r={c.s} fill={i % 3 ? '#C98A3A' : '#F2C85C'} opacity={0.8} />
        ))}
        {/* pizza minus the slice */}
        <circle r={PC.r + 6} cx={6} cy={9} fill="#5E3A16" opacity={0.4} filter="url(#ps-melt)" />
        <g mask="url(#ps-rest)">
          <Pizza d={d} />
        </g>
        <mask id="ps-rest">
          <rect x={-400} y={-400} width={800} height={800} fill="#FFFFFF" />
          <path d={sector(320)} fill="#000000" />
        </mask>
        {/* cheese strings between the pie and the slice: they thin and sag as it leaves */}
        {[0.22, 0.4, 0.58, 0.76, 0.9].map((k, i) => {
          const side = i % 2 ? SL.a1 : SL.a0;
          const [sx, sy] = [k * 210 * Math.cos(rad(side)), k * 210 * Math.sin(rad(side))];
          const [ex, ey] = [sx + pull * ux, sy + pull * uy];
          const sag = (i % 2 ? 1 : -1) * 26 * Math.sin(Math.PI * prog(u, 64, 150, (x) => x));
          const wdt = lerp(10, 2.2, prog(u, 64, 150, inOut)) * (1 - 0.3 * (i % 3) * 0.5);
          return <path key={i} d={`M ${n1(sx)} ${n1(sy)} Q ${n1((sx + ex) / 2 - uy * sag)} ${n1((sy + ey) / 2 + ux * sag)} ${n1(ex)} ${n1(ey)}`} fill="none" stroke="#F8DC80" strokeWidth={n1(wdt)} strokeLinecap="round" opacity={prog(u, 64, 78) * (1 - 0.55 * prog(u, 130, 190, inOut))} />;
        })}
        {/* the slice: soft shadow that grows as it lifts, then the wedge itself */}
        <g transform={`translate(${n1(pull * ux)} ${n1(pull * uy)})`}>
          <path d={sector(PC.r + 4)} fill="#3A2412" opacity={0.45 * lift} filter="url(#ps-melt)" transform={`translate(${n1(10 * lift)} ${n1(16 * lift)})`} />
          <g transform={`scale(${(1 + 0.05 * lift).toFixed(4)})`}>
            <g clipPath="url(#ps-slice)">
              <Pizza d={d} />
            </g>
            <path d={`M 0 0 L ${n1(262 * Math.cos(rad(SL.a0)))} ${n1(262 * Math.sin(rad(SL.a0)))}`} stroke="#FFF0B4" strokeWidth={5} strokeLinecap="round" opacity={0.6 * lift} />
          </g>
        </g>
        <clipPath id="ps-slice">
          <path d={sector(320)} />
        </clipPath>
        {/* steam */}
        {[-150, -40, 70, 170].map((sx, i) => (
          <path key={i} d={steam(sx, 60 - i * 30, u, i * 1.9, 260, 26)} fill="none" stroke="#FFFFFF" strokeWidth={22} strokeLinecap="round" opacity={0.13 + 0.05 * Math.sin(u / 29 + i)} filter="url(#ps-soft)" />
        ))}
      </g>

      {/* hands */}
      <Hand x={430} y={900 + 3 * Math.sin(u / 31)} rot={138} curl={0.4} />
      <Hand x={hx} y={hy} rot={mid} curl={grab} />

      {/* the note: the price, struck out and re-written */}
      <g transform={P ? "translate(790 1020) rotate(-4)" : "translate(250 660) rotate(-5)"}>
        <rect x={-196} y={-116} width={400} height={250} fill="#000" opacity={0.35} filter="url(#ps-shadow)" />
        <rect x={-200} y={-125} width={400} height={250} fill="#F6F0E2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={-200} y={-70 + i * 44} width={400} height={1.5} fill="#285AA0" opacity={0.2} />
        ))}
        <rect x={-60} y={-142} width={120} height={36} fill="#E2CD96" opacity={0.85} transform="rotate(3)" />
        <text x={-170} y={-22} fontFamily={f.disp} fontSize={62} fontWeight={700} fill="#1F1A14">{typed(note, u, 112, 0.5)}</text>
        <path d="M -176 -44 C -90 -52, 60 -34, 170 -46" pathLength={1} fill="none" stroke={HOT} strokeWidth={8} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - strike} />
        <text x={-170} y={70} fontFamily={f.ui} fontSize={66} fontStyle="italic" fontWeight={600} fill={HOT} opacity={prog(u, 186, 200)}>= 2 pizza</text>
        <path d="M -168 92 C -80 84, 30 100, 110 88" pathLength={1} fill="none" stroke={HOT} strokeWidth={6} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(u, 200, 216, inOut)} />
      </g>
    </g>
  );
};

// ───────────────────────────────────────────── shot A2: facing the screen ─────────────────────────────────────────────
const SUBJECT = 'Pizza for bitcoins?';
const MSG = ["I'll pay 10,000 bitcoins for a couple of pizzas.. like maybe", '2 large ones so I have some left over for the next day.'];

const ScreenShot: React.FC<{ v: number; f: { mono: string; ui: string; disp: string }; P?: boolean }> = ({ v, f, P }) => {
  const cps = 1.7;
  const m0 = 64;
  const m1 = m0 + Math.ceil(MSG[0].length / cps);
  const mEnd = m1 + Math.ceil(MSG[1].length / cps);
  const typing = prog(v, 20, 26) * (1 - prog(v, mEnd, mEnd + 8));
  const sub = typed(SUBJECT, v, 24, 0.5);
  const l0 = typed(MSG[0], v, m0, cps);
  const l1 = typed(MSG[1], v, m1, cps);
  // the pointer travels to "Post" and clicks
  const go = prog(v, mEnd + 4, mEnd + 26, inOut);
  const mx = lerp(1180, 1450, go);
  const my = lerp(610, 752, go) - 40 * Math.sin(Math.PI * go);
  const clickAt = mEnd + 30;
  const press = bump(v, clickAt, clickAt + 10);
  const done = prog(v, clickAt + 4, clickAt + 16, inOut);
  const caretOn = 0.5 + 0.5 * Math.sin(v / 5);
  const push = 1 + 0.05 * prog(v, 0, 210, (x) => x);
  return (
    <g>
      {/* the room behind, out of focus: wall, window light, lamp bokeh, desk */}
      <rect width={W} height={H} fill="#1C282D" />
      <circle cx={90} cy={230} r={300} fill="#3A5E92" opacity={0.4} filter="url(#ps-shadow)" />
      <circle cx={1790} cy={300} r={210} fill="#FFD890" opacity={0.42} filter="url(#ps-shadow)" />
      <circle cx={1790} cy={300} r={60} fill="#FFE7A8" opacity={0.6} filter="url(#ps-soft)" />
      {[[1700, 560, 26], [1840, 640, 18], [140, 620, 22], [220, 520, 12]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i < 2 ? '#FFD890' : '#9CC3FF'} opacity={0.14 + 0.04 * Math.sin(v / 23 + i)} />
      ))}
      <rect x={0} y={930} width={W} height={150} fill="#5A3A20" />
      <rect x={0} y={930} width={W} height={8} fill="#C08A52" opacity={0.6} />
      <g transform={`translate(960 450) scale(${push.toFixed(4)}) translate(-960 -450)`}>
        {/* monitor: stand, bezel, glass */}
        <rect x={900} y={850} width={120} height={90} fill="#22201D" />
        <rect x={770} y={926} width={380} height={18} rx={9} fill="#151311" />
        <rect x={290} y={40} width={1340} height={820} rx={26} fill="#000" opacity={0.5} filter="url(#ps-shadow)" />
        <rect x={300} y={50} width={1320} height={800} rx={22} fill="#151311" />
        <rect x={300} y={50} width={1320} height={800} rx={22} fill="none" stroke="#3A3632" strokeWidth={3} />
        <rect x={322} y={72} width={1276} height={756} rx={4} fill="#F4F1EA" />
        <circle cx={960} cy={839} r={5} fill="#6FE08A" opacity={0.8} />
        {/* browser chrome: tabs, address bar */}
        <rect x={322} y={72} width={1276} height={46} fill="#232B35" />
        <path d="M 340 118 L 352 80 L 640 80 L 652 118 Z" fill="#3A4553" />
        <circle cx={372} cy={99} r={9} fill={HOT} />
        <text x={390} y={105} fontFamily={f.ui} fontSize={19} fill="#E8EEF4">New topic — Bitcoin Forum</text>
        <path d="M 664 118 L 674 86 L 860 86 L 870 118 Z" fill="#2B3440" />
        <rect x={690} y={97} width={110} height={8} rx={4} fill="#6A7684" />
        {[1512, 1542, 1572].map((x, i) => (
          <circle key={x} cx={x} cy={95} r={8} fill={['#E0B34A', '#6FAE6A', '#D9654F'][i]} />
        ))}
        <rect x={322} y={118} width={1276} height={48} fill="#3A4553" />
        {[352, 388].map((x, i) => (
          <path key={x} d={i ? `M ${x - 6} 132 L ${x + 6} 142 L ${x - 6} 152` : `M ${x + 6} 132 L ${x - 6} 142 L ${x + 6} 152`} fill="none" stroke="#AEB8C4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <rect x={420} y={126} width={1000} height={32} rx={16} fill="#232B35" />
        <rect x={438} y={137} width={10} height={10} rx={2} fill="#6FAE6A" />
        <text x={458} y={149} fontFamily={f.mono} fontSize={19} fill="#DCE4EC">bitcointalk.org</text>
        {/* site header + breadcrumb */}
        <rect x={322} y={166} width={1276} height={70} fill="#2D4B63" />
        <rect x={322} y={232} width={1276} height={4} fill="#1F364A" />
        <circle cx={372} cy={201} r={22} fill={HOT} />
        <text x={372} y={212} textAnchor="middle" fontFamily={f.disp} fontSize={30} fontWeight={700} fill="#FFFFFF">₿</text>
        <text x={408} y={212} fontFamily={f.disp} fontSize={32} fontWeight={700} fill="#FFFFFF">Bitcoin Forum</text>
        <text x={1574} y={208} textAnchor="end" fontFamily={f.mono} fontSize={18} fill="#C9D6E2">Welcome, laszlo</text>
        <rect x={322} y={236} width={1276} height={40} fill="#DDE6EE" />
        <text x={346} y={262} fontFamily={f.mono} fontSize={17} fill="#3A566E">Bitcoin Forum  ›  Bitcoin Discussion  ›  Start new topic</text>
        {/* the form */}
        <rect x={360} y={296} width={1200} height={506} fill="#FFFFFF" stroke="#B9C6D2" strokeWidth={2} />
        <rect x={360} y={296} width={1200} height={44} fill="#C9D6E2" />
        <text x={380} y={326} fontFamily={f.ui} fontSize={23} fontWeight={600} fill="#1F364A">Start new topic</text>
        <text x={384} y={391} fontFamily={f.ui} fontSize={23} fontWeight={600} fill="#1F1A14">Subject:</text>
        <rect x={500} y={360} width={1030} height={46} fill="#FBFAF6" stroke={v < m0 - 4 ? HOT : '#B9C6D2'} strokeWidth={2} />
        <text x={514} y={392} fontFamily={f.ui} fontSize={28} fontWeight={600} fill="#1F1A14">
          {sub}
          {v < m0 - 4 && <tspan fill={HOT} fillOpacity={caretOn}>|</tspan>}
        </text>
        {['B', 'I', 'U', 'S', '“', '#', '@', '☺'].map((g, i) => (
          <g key={i}>
            <rect x={500 + i * 44} y={424} width={36} height={36} rx={4} fill="#EEF2F6" stroke="#B9C6D2" strokeWidth={1.5} />
            <text x={518 + i * 44} y={450} textAnchor="middle" fontFamily={f.ui} fontSize={22} fontWeight={i < 2 ? 700 : 500} fontStyle={i === 1 ? 'italic' : 'normal'} fill="#3A566E">{g}</text>
          </g>
        ))}
        <text x={384} y={506} fontFamily={f.ui} fontSize={23} fontWeight={600} fill="#1F1A14">Message:</text>
        <rect x={500} y={474} width={1030} height={228} fill="#FBFAF6" stroke={v >= m0 - 4 && v < mEnd + 6 ? HOT : '#B9C6D2'} strokeWidth={2} />
        <text x={514} y={516} fontFamily={f.ui} fontSize={31} fill="#1F1A14">
          {l0}
          {v >= m0 - 4 && v < m1 && <tspan fill={HOT} fillOpacity={caretOn}>|</tspan>}
        </text>
        <text x={514} y={560} fontFamily={f.ui} fontSize={31} fill="#1F1A14">
          {l1}
          {v >= m1 && <tspan fill={HOT} fillOpacity={caretOn * (1 - done)}>|</tspan>}
        </text>
        {[604, 640, 676].map((y) => (
          <rect key={y} x={514} y={y} width={1000} height={1} fill="#B9C6D2" opacity={0.4} />
        ))}
        {/* buttons: Post is pressed, then confirms */}
        <g transform={`translate(1460 750) scale(${(1 - 0.06 * press).toFixed(4)}) translate(-1460 -750)`}>
          <rect x={1390} y={726} width={140} height={48} rx={6} fill={HOT} />
          <rect x={1390} y={726} width={140} height={48} rx={6} fill="#3F8F4A" opacity={done} />
          <rect x={1390} y={726} width={140} height={10} rx={5} fill="#FFFFFF" opacity={0.2} />
          <text x={1460} y={759} textAnchor="middle" fontFamily={f.ui} fontSize={25} fontWeight={600} fill="#FFFFFF" opacity={1 - done}>Post</text>
          <text x={1460} y={759} textAnchor="middle" fontFamily={f.ui} fontSize={25} fontWeight={600} fill="#FFFFFF" opacity={done}>Posted ✓</text>
        </g>
        <circle cx={1460} cy={750} r={30 + 70 * prog(v, clickAt, clickAt + 22, outE)} fill="none" stroke={HOT} strokeWidth={4} opacity={0.7 * bump(v, clickAt, clickAt + 22)} />
        <rect x={1234} y={726} width={140} height={48} rx={6} fill="none" stroke="#B9C6D2" strokeWidth={2} />
        <text x={1304} y={759} textAnchor="middle" fontFamily={f.ui} fontSize={25} fill="#3A566E">Preview</text>
        {/* pointer */}
        <g transform={`translate(${n1(mx)} ${n1(my)}) scale(${(1 - 0.12 * press).toFixed(3)})`}>
          <path d="M 0 0 L 0 34 L 9 26 L 16 41 L 22 38 L 15 24 L 27 24 Z" fill="#000" opacity={0.3} transform="translate(3 4)" />
          <path d="M 0 0 L 0 34 L 9 26 L 16 41 L 22 38 L 15 24 L 27 24 Z" fill="#FFFFFF" stroke="#1F1A14" strokeWidth={2.5} strokeLinejoin="round" />
        </g>
        {/* glass: reflection + scan sheen */}
        <path d="M 322 72 L 860 72 L 520 828 L 322 828 Z" fill="#FFFFFF" opacity={0.06} />
        <rect x={322} y={72} width={1276} height={756} fill="#A9D2FF" opacity={0.05} />
      </g>
      {/* Laszlo from behind, close to the lens and soft: shoulder, neck, head, ear, glasses, rim light */}
      <g filter="url(#ps-defocus)" transform={`translate(${P ? 300 : -70} ${n1((P ? 250 : 70) + 2.5 * typing * Math.sin(v * 0.5) + 2 * Math.sin(v / 34))})`}>
        <path d="M -120 1100 C -80 850, 200 770, 440 870 C 560 920, 620 1010, 640 1100 Z" fill="#1C3033" />
        <rect x={-120} y={1096} width={760} height={900} fill="#1C3033" />
        <path d="M -60 900 C 60 800, 300 790, 440 870 C 540 912, 600 980, 630 1070" fill="none" stroke="#8FC0EC" strokeWidth={6} strokeLinecap="round" opacity={0.45} />
        <path d="M 250 840 L 430 830 L 440 900 Q 340 930 240 900 Z" fill="#8A6246" />
        <ellipse cx={330} cy={690} rx={156} ry={176} fill="#3E2616" />
        <path d="M 196 640 C 220 540, 380 500, 470 600" fill="none" stroke="#6A4428" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        <ellipse cx={482} cy={724} rx={22} ry={36} fill="#B98660" />
        <path d="M 478 706 Q 492 724 480 744" fill="none" stroke="#8A5E40" strokeWidth={4} />
        <path d="M 452 704 Q 480 694 492 712 Q 498 730 490 744" fill="none" stroke="#151311" strokeWidth={7} strokeLinecap="round" />
      </g>
    </g>
  );
};

// ───────────────────────────────────────────── the film ─────────────────────────────────────────────
const CAPS: { a: number; b: number; text: string }[] = [
  { a: 16, b: 128, text: '18 Mei 2010 — Laszlo, programmer di Florida.' },
  { a: 184, b: 332, text: 'Dia menulis: 10.000 bitcoin untuk dua pizza.' },
  { a: 250 + TURN_HOLD, b: 408 + TURN_HOLD, text: '22 Mei 2010 — pesanannya datang.' },
  { a: 440 + TURN_HOLD, b: 648 + TURN_HOLD, text: '10.000 bitcoin, untuk dua pizza.' },
];

export const PizzaScene: React.FC<{ portrait?: boolean }> = ({ portrait: P = false }) => {
  const t = useCurrentFrame();
  const f = fontsFor('editorial');
  useFontsReady(f);
  const room = useMemo(buildRoom, []);
  const pizza = useMemo(buildPizza, []);
  const FW = P ? 1080 : W;
  const FH = P ? 1920 : H;
  const first = t < TURN_AT;
  const rt = first ? t : t - TURN_HOLD; // the room's own clock
  // room camera — A1: push in on the monitor's edge; B: start on Laszlo, eased pan to the door, push on the courier.
  // Portrait is the same room through a taller, tighter window: ×1.7 zoom, framed on one subject at a time.
  const pan = prog(rt, 214, 272, inOut);
  const a1 = prog(t, 0, 144, inOut);
  const cx = P ? (first ? lerp(1110, 1170, a1) : lerp(1150, 2400, pan)) : first ? lerp(1090, 1235, a1) : lerp(1150, 2170, pan);
  const cy = P ? (first ? lerp(560, 540, a1) : lerp(540, 600, pan)) : first ? lerp(520, 500, a1) : lerp(500, 560, pan);
  const z = P ? (first ? lerp(1.72, 1.98, a1) : lerp(1.95, 1.8, pan) + 0.14 * prog(rt, 300, 420, inOut)) : first ? lerp(1.0, 1.5, a1) : lerp(1.3, 1.16, pan) + 0.1 * prog(rt, 300, 420, inOut);
  // plain dissolves in and out of the screen shot
  const FADE = 18;
  const screenO = prog(t, TURN_AT - FADE, TURN_AT, inOut) * (1 - prog(t, BACK_AT - FADE, BACK_AT, inOut));
  const showRoom = t < TURN_AT || t >= BACK_AT - FADE;
  const showScreen = t >= TURN_AT - FADE && t < BACK_AT;
  const toC = prog(rt, 404, 428, inOut);
  return (
    <AbsoluteFill style={{ background: '#120E0A' }}>
      <svg viewBox={`0 0 ${FW} ${FH}`} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <Defs />
        {showRoom && rt < 430 && (
          <g transform={`translate(${FW / 2} ${FH / 2}) scale(${z.toFixed(4)}) translate(${n1(-cx)} ${n1(-cy)})`}>
            <Room t={rt} d={room} cx={cx} f={f} />
          </g>
        )}
        {showScreen && (
          <g opacity={screenO}>
            {P ? (
              <>
                {/* portrait: the monitor fills the width in the upper half, wall above, desk and Laszlo below */}
                <rect width={FW} height={FH} fill="#1C282D" />
                <rect x={0} y={1172} width={FW} height={FH - 1172} fill="#5A3A20" />
                <g transform="translate(-286 373) scale(0.86)">
                  <ScreenShot v={t - TURN_AT} f={f} P />
                </g>
              </>
            ) : (
              <ScreenShot v={t - TURN_AT} f={f} />
            )}
          </g>
        )}
        {showRoom && rt >= 402 && (
          <g opacity={toC} transform={P ? 'translate(-535 110) scale(1.25)' : undefined}>
            <TopDown u={rt - 420} d={pizza} f={f} P={P} />
          </g>
        )}
        {/* grade: vignette + film grain over everything */}
        <radialGradient id="ps-vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>
        <rect width={FW} height={FH} fill="url(#ps-vig)" />
        <rect width={FW} height={FH} filter="url(#ps-grain)" opacity={0.16} style={{ mixBlendMode: 'overlay' }} />
      </svg>
      {CAPS.map((c) => (
        <div key={c.a} style={{ position: 'absolute', left: 0, right: 0, bottom: P ? 250 : 64, display: 'flex', justifyContent: 'center', opacity: prog(t, c.a, c.a + 14) * (1 - prog(t, c.b - 14, c.b, inOut)), transform: `translateY(${n1((1 - prog(t, c.a, c.a + 18, outE)) * 16)}px)` }}>
          <div style={{ padding: P ? '18px 30px' : '14px 30px', borderRadius: 14, background: 'rgba(18,14,10,0.82)', fontFamily: f.ui, fontWeight: 600, fontSize: P ? 50 : 44, lineHeight: 1.2, color: '#F4EBD8', whiteSpace: P ? 'normal' : 'nowrap', maxWidth: P ? 880 : undefined, textAlign: 'center' }}>{c.text}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
