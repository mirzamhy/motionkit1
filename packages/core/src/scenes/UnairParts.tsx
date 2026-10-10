// Drawn parts shared by the UNAIR shots: flags, people, the Wisnu-on-Garuda statue, extra gradients.
import React from 'react';
import { n1, rng } from './kit';

export const YELLOW = '#FFC20E';
export const BLUE = '#1B4B8F';
export const UNAIR_BANDS = [YELLOW, BLUE, YELLOW];
export const MERAH_PUTIH = ['#D62828', '#FAFAF5'];
export const GOLD = '#E9B03A';

export const Defs2: React.FC = () => (
  <defs>
    <linearGradient id="u2-day" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3F8FD0" />
      <stop offset="1" stopColor="#CFE6F2" />
    </linearGradient>
    <linearGradient id="u2-stone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F1ECE0" />
      <stop offset="1" stopColor="#CFC7B6" />
    </linearGradient>
    <linearGradient id="u2-wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5E3F27" />
      <stop offset="0.5" stopColor="#74502F" />
      <stop offset="1" stopColor="#4E3420" />
    </linearGradient>
    <radialGradient id="u2-spot" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stopColor="#6B5136" />
      <stop offset="0.6" stopColor="#2A1F15" />
      <stop offset="1" stopColor="#0E0A07" />
    </radialGradient>
    <linearGradient id="u2-paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F6EFDD" />
      <stop offset="1" stopColor="#E4D8BC" />
    </linearGradient>
    <linearGradient id="u2-room" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#F2EBDA" />
      <stop offset="1" stopColor="#DCD2BC" />
    </linearGradient>
    <linearGradient id="u2-shaft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFF6D8" stopOpacity="0.5" />
      <stop offset="1" stopColor="#FFF6D8" stopOpacity="0" />
    </linearGradient>
    <filter id="u2-woodgrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.2" numOctaves="3" seed="12" />
      <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.03  0 0 0 0.9 -0.25" />
    </filter>
    <filter id="u2-stonegrain" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="5" result="n" />
      <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.12" result="g" />
      <feComposite in="g" in2="SourceAlpha" operator="in" result="gi" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="gi" />
      </feMerge>
    </filter>
    <filter id="u2-blur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="u2-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
);

/** a waving flag: vertical slices that ride a travelling sine, more at the free end */
export const Flag: React.FC<{ x: number; y: number; w: number; h: number; bands: string[]; t: number; ph?: number; vertical?: boolean }> = ({ x, y, w, h, bands, t, ph = 0, vertical }) => {
  const N = 14;
  const sw = w / N;
  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const k = i / (N - 1);
        const wave = Math.sin(t / 8 - i * 0.55 + ph);
        const dy = 0.1 * h * k * wave;
        const shade = 0.14 * Math.cos(t / 8 - i * 0.55 + ph);
        return (
          <g key={i} transform={`translate(${n1(x + i * sw)} ${n1(y + dy)})`}>
            {bands.map((c, j) =>
              vertical ? null : <rect key={j} x={0} y={(j * h) / bands.length} width={sw + 0.7} height={h / bands.length + 0.5} fill={c} />,
            )}
            {vertical && <rect x={0} y={0} width={sw + 0.7} height={h} fill={bands[Math.min(bands.length - 1, Math.floor(k * bands.length))]} />}
            <rect x={0} y={0} width={sw + 0.7} height={h} fill={shade > 0 ? '#000' : '#FFF'} opacity={Math.abs(shade)} />
          </g>
        );
      })}
    </g>
  );
};

export type Outfit = { top: string; topSh: string; bottom: string; leg: string; shoe: string; skin: string; hair: string; head?: 'peci' | 'hijab' | 'bun' | 'none'; headCol?: string; bag?: string; long?: boolean };
export const OUTFITS: Outfit[] = [
  { top: '#F4F1E8', topSh: '#D8D2C2', bottom: '#2B3448', leg: '#2B3448', shoe: '#1F1A14', skin: '#B98660', hair: '#1F1A14', head: 'none', bag: '#B4432E', long: true },
  { top: '#F6C9D0', topSh: '#E0A9B2', bottom: '#3A3632', leg: '#3A3632', shoe: '#FAFAF5', skin: '#C99570', hair: '#1F1A14', head: 'hijab', headCol: '#F1E4C8', bag: '#3F5E63', long: true },
  { top: '#3F6FA8', topSh: '#2E5484', bottom: '#D9CDB4', leg: '#D9CDB4', shoe: '#1F1A14', skin: '#A9744E', hair: '#1F1A14', head: 'none', bag: '#1F1A14', long: true },
  { top: '#FFC20E', topSh: '#D9A20A', bottom: '#1B4B8F', leg: '#1B4B8F', shoe: '#FAFAF5', skin: '#B98660', hair: '#1F1A14', head: 'hijab', headCol: '#1B4B8F', long: true },
];
export const OUTFITS_1954: Outfit[] = [
  { top: '#F4F1E8', topSh: '#D8D2C2', bottom: '#E4DCC8', leg: '#E4DCC8', shoe: '#1F1A14', skin: '#B98660', hair: '#1F1A14', head: 'peci', long: true },
  { top: '#D8CDB0', topSh: '#B9AD8E', bottom: '#5E4A36', leg: '#5E4A36', shoe: '#1F1A14', skin: '#A9744E', hair: '#1F1A14', head: 'none', long: true },
  { top: '#9C4A3A', topSh: '#7A3528', bottom: '#5E3A22', leg: '#5E3A22', shoe: '#1F1A14', skin: '#C99570', hair: '#1F1A14', head: 'bun', long: true },
  { top: '#F4F1E8', topSh: '#D8D2C2', bottom: '#3A3632', leg: '#3A3632', shoe: '#1F1A14', skin: '#B98660', hair: '#1F1A14', head: 'peci', long: true },
];

/** a person seen from behind, walking (move = 1) or standing (move = 0) */
export const Walker: React.FC<{ x: number; y: number; s: number; t: number; ph: number; o: Outfit; move?: number; cheer?: number }> = ({ x, y, s, t, ph, o, move = 1, cheer = 0 }) => {
  const sw = Math.sin(t * 0.105 + ph) * move;
  const bobY = -2.5 * Math.abs(Math.cos(t * 0.105 + ph)) * move + 1.2 * Math.sin(t / 27 + ph) * (1 - move);
  // applause: about two in three people raise bent arms and bring their hands together over their heads,
  // unhurried (one clap every 0.8 s) and each on their own beat
  const claps = Math.floor(ph * 7) % 3 !== 0;
  const c = claps ? cheer : 0;
  const gap = 2 + 9 * (0.5 + 0.5 * Math.sin(t * 0.13 + ph * 3));
  return (
    <g transform={`translate(${n1(x)} ${n1(y + bobY * s)}) scale(${s.toFixed(3)})`}>
      <ellipse cx={0} cy={2} rx={22} ry={5} fill="#000" opacity={0.22} />
      {[1, -1].map((d) => {
        const fx = d * 6 + d * sw * 7;
        const lift = Math.max(0, d * sw) * 5;
        return (
          <g key={d}>
            <path d={`M ${d * 6} -50 L ${n1(d * 6 + (fx - d * 6) * 0.5)} -26 L ${n1(fx)} ${n1(-4 - lift)}`} fill="none" stroke={o.leg} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx={fx} cy={-2 - lift} rx={7} ry={4} fill={o.shoe} />
          </g>
        );
      })}
      {/* arms: swing, or raised and clapping when cheering */}
      {[-1, 1].map((d) => {
        const ex = d * (15 + 11 * c);
        const ey = -74 - 30 * c;
        const hx = d * ((16 + sw * 5) * (1 - c) + gap * c);
        const hy = -56 - 80 * c;
        return (
          <g key={d}>
            <path d={`M ${d * 13} -92 L ${n1(ex)} ${n1(ey)} L ${n1(hx)} ${n1(hy)}`} fill="none" stroke={o.topSh} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            {c > 0.02 && <circle cx={hx} cy={hy - 3} r={5} fill={o.skin} opacity={c} />}
          </g>
        );
      })}
      <rect x={-14} y={-98} width={28} height={52} rx={7} fill={o.top} />
      <rect x={3} y={-98} width={11} height={52} rx={5} fill={o.topSh} />
      {o.bag && <rect x={-10} y={-92} width={20} height={30} rx={5} fill={o.bag} />}
      {o.bag && <path d="M -8 -92 L -11 -98 M 8 -92 L 11 -98" stroke={o.bag} strokeWidth={3} />}
      <rect x={-5} y={-104} width={10} height={8} fill={o.skin} />
      <circle cx={0} cy={-112} r={11} fill={o.skin} />
      {o.head === 'hijab' ? (
        <path d="M -13 -112 C -13 -130, 13 -130, 13 -112 L 16 -90 Q 0 -84 -16 -90 Z" fill={o.headCol} />
      ) : (
        <path d="M -11 -110 C -12 -128, 12 -128, 11 -110 C 6 -106, -6 -106, -11 -110 Z" fill={o.hair} />
      )}
      {o.head === 'peci' && <path d="M -11 -116 L -9 -127 L 9 -127 L 11 -116 Z" fill="#14110E" />}
      {o.head === 'bun' && <circle cx={0} cy={-104} r={7} fill={o.hair} />}
    </g>
  );
};

/** a row of the crowd, close to the lens: heads and shoulders from behind */
export const CrowdRow: React.FC<{ y: number; s: number; n: number; seed: number; t: number; cheer?: number; dim?: number }> = ({ y, s, n, seed, t, cheer = 0, dim = 0 }) => {
  const R = rng(seed);
  const people = Array.from({ length: n }, (_, i) => ({ x: (i + 0.5) * (1920 / n) + (R() - 0.5) * 50, o: OUTFITS_1954[Math.floor(R() * OUTFITS_1954.length)], ph: R() * 6, h: R() * 26 }));
  return (
    <g>
      {people.map((p, i) => {
        const claps = Math.floor(p.ph * 7) % 3 !== 0;
        const up = claps ? cheer : 0;
        const gap = 6 + 22 * (0.5 + 0.5 * Math.sin(t * 0.13 + p.ph * 3));
        return (
          <g key={i} transform={`translate(${n1(p.x)} ${n1(y - p.h + 2 * Math.sin(t / 23 + p.ph))}) scale(${s})`}>
            {up > 0.01 &&
              [-1, 1].map((d) => (
                <g key={d}>
                  <path d={`M ${d * 44} 40 L ${n1(d * (58 + 12 * up))} ${n1(30 - 50 * up)} L ${n1(d * (40 * (1 - up) + gap * up))} ${n1(20 - 126 * up)}`} fill="none" stroke={p.o.topSh} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={d * (40 * (1 - up) + gap * up)} cy={12 - 126 * up} r={12} fill={p.o.skin} />
                </g>
              ))}
            <path d="M -62 140 C -62 40, -40 14, 0 14 C 40 14, 62 40, 62 140 Z" fill={p.o.top} />
            <path d="M 0 14 C 40 14, 62 40, 62 140 L 24 140 C 26 80, 20 40, 0 14 Z" fill={p.o.topSh} />
            <rect x={-12} y={-6} width={24} height={24} fill={p.o.skin} />
            <ellipse cx={0} cy={-34} rx={30} ry={34} fill={p.o.skin} />
            <path d="M -30 -30 C -34 -78, 34 -78, 30 -30 C 18 -16, -18 -16, -30 -30 Z" fill={p.o.hair} />
            {p.o.head === 'peci' && <path d="M -29 -44 L -24 -76 L 24 -76 L 29 -44 Z" fill="#14110E" />}
            {p.o.head === 'bun' && <circle cx={0} cy={-8} r={17} fill={p.o.hair} />}
            <ellipse cx={-32} cy={-28} rx={5} ry={9} fill={p.o.skin} />
            <ellipse cx={32} cy={-28} rx={5} ry={9} fill={p.o.skin} />
          </g>
        );
      })}
      {dim > 0 && <rect x={0} y={y - 140} width={1920} height={400} fill="#000" opacity={0} />}
    </g>
  );
};

export { Arca, JAR } from './UnairArca';
