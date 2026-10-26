import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, SERIF } from '../../templates/whatif-sim/style';
import { F, H, W, riseAt } from './timeline';
import { rng } from '../../templates/whatif-sim/three/util';

const PXM = 6.66; // pixels per metre (ruler 0-120 m measured on the reference)

/** Screen y of the 0 m line: the camera slowly pans with the rising ground. */
const zeroY = (f: number) => 1478 + (f - 1890) * 0.947;

/* ---------- Ground layers, drawn relative to the surface (y = 0, +y down) ---------- */

const BANDS: [number, string][] = [
  [0, '#4a2f1d'],
  [38, '#6b4630'],
  [120, '#5a3a26'],
  [210, '#7a5638'],
  [320, '#664630'],
  [470, '#87664a'],
  [700, '#7a5c40'],
  [1100, '#8e7253'],
];

const wavy = (y: number, seed: number) => {
  const r = rng(seed);
  const ph = r() * 6;
  let d = `M 0 ${y}`;
  for (let x = 0; x <= W; x += 40) d += ` L ${x} ${y + Math.sin(x / 90 + ph) * 7 + Math.sin(x / 31 + ph * 2) * 3}`;
  return `${d} L ${W} 2600 L 0 2600 Z`;
};

const PEBBLES = (() => {
  const r = rng(55);
  return Array.from({ length: 320 }, () => ({
    x: r() * W,
    y: 45 + r() * 1500,
    rx: 3 + r() * 7,
    ry: 2 + r() * 4,
    light: r() > 0.5,
  }));
})();

const TREES = (() => {
  const r = rng(66);
  const list: { x: number; y: number; rad: number; shade: number }[] = [];
  for (let x = -20; x < W + 40; x += 30 + r() * 22) list.push({ x, y: -14 - r() * 10, rad: 32 + r() * 14, shade: r() });
  for (let x = -10; x < W + 40; x += 34 + r() * 26) list.push({ x, y: -6 - r() * 6, rad: 26 + r() * 12, shade: r() });
  return list;
})();

const Pin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) scale(0.75)`}>
    <path d="M0 0 C -9 -14 -16 -22 -16 -33 A 16 16 0 1 1 16 -33 C 16 -22 9 -14 0 0 Z" fill={C.red} />
  </g>
);

/* ---------- Statue of Liberty silhouette (metres: x from centre, y up) ---------- */

const STATUE: [number, number][] = [
  [-13, 0], [-13, 3], [-11.5, 4], [-11.5, 26], [-9, 28], [-9, 45], [-10, 47], [-5, 47], [-5.5, 52], [-5.2, 60],
  [-6.2, 63], [-6.2, 68], [-4.5, 69], [-3.6, 74], [-2.4, 77], [-2.2, 79], [-2.6, 80], [-2, 83], [-1, 85], [0, 84.5],
  [1, 85], [2, 83], [2.6, 80], [2.2, 79], [2.6, 77], [3.6, 75.5], [4.6, 80], [5.4, 86], [4.8, 87], [5.2, 89],
  [6.6, 93], [7.6, 89], [6.9, 87], [6.3, 86], [5.6, 79], [4.6, 73], [4.6, 64], [5.2, 52], [5, 47], [10, 47],
  [9, 45], [9, 28], [11.5, 26], [11.5, 4], [13, 3], [13, 0],
];

const label = (size: number, color: string = C.white): React.SVGProps<SVGTextElement> => ({
  fontFamily: SERIF,
  fontSize: size,
  fontWeight: 500,
  letterSpacing: size * 0.3,
  fill: color,
});

export const GroundRise: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < F.ground || frame >= F.ring + 8) return null;
  const z = zeroY(frame);
  const surface = z - riseAt(frame) * PXM;
  const cloudY = z - 640 + (frame - 1890) * 0.53;
  const drift = (frame - F.ground) * 0.3;
  const statueX = 633;
  const statuePath =
    STATUE.map(([x, y], i) => `${i ? 'L' : 'M'} ${statueX + x * PXM} ${z - y * PXM}`).join(' ') + ' Z';

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #46536d 0%, #6d7a92 35%, #97a2b2 60%, #aab3be 100%)' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="cloudBlur" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation={26} />
          </filter>
          <radialGradient id="crown" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#6aa851" />
            <stop offset="60%" stopColor="#3b7330" />
            <stop offset="100%" stopColor="#24481f" />
          </radialGradient>
          <radialGradient id="crownDark" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#5b9445" />
            <stop offset="60%" stopColor="#30632a" />
            <stop offset="100%" stopColor="#1d3c19" />
          </radialGradient>
        </defs>

        {/* clouds */}
        <g filter="url(#cloudBlur)" opacity={0.8}>
          <ellipse cx={180 + drift} cy={cloudY} rx={260} ry={70} fill="#eef1f4" />
          <ellipse cx={620 + drift} cy={cloudY - 40} rx={300} ry={85} fill="#e6eaef" />
          <ellipse cx={980 + drift} cy={cloudY + 10} rx={240} ry={65} fill="#eef1f4" />
          <ellipse cx={420 + drift} cy={cloudY + 60} rx={220} ry={50} fill="#dfe4ea" />
        </g>

        {/* the rising world */}
        <g transform={`translate(0 ${surface})`}>
          {TREES.map((t, i) => (
            <g key={i}>
              <rect x={t.x - 3} y={t.y - 6} width={6} height={-t.y + 8} fill="#4a3220" />
              <circle cx={t.x} cy={t.y - t.rad * 0.9} r={t.rad} fill={t.shade > 0.5 ? 'url(#crown)' : 'url(#crownDark)'} />
            </g>
          ))}
          <path d={`M 0 -18 L 290 -18 Q 320 -10 300 2 L 0 2 Z`} fill="#4f7fae" />
          <rect x={0} y={-6} width={W} height={10} fill="#4d7a31" />
          {BANDS.map(([d, c], i) => (
            <path key={d} d={wavy(d, i + 3)} fill={c} />
          ))}
          {PEBBLES.map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={p.light ? '#c6aa86' : '#2e1d12'} opacity={0.3} />
          ))}
          <Pin x={508} y={-2} />
          <text {...label(18)} x={508} y={-48} textAnchor="middle">
            YOU
          </text>
        </g>

        {/* fixed references */}
        <line x1={0} y1={z} x2={W} y2={z} stroke={C.red} strokeWidth={3} strokeDasharray="14 10" />
        <text {...label(17, C.red)} x={54} y={z - 22}>
          WHERE THE GROUND WAS
        </text>

        <path d={statuePath} fill="rgba(236,241,246,0.24)" stroke="#f4f1ea" strokeWidth={2.5} strokeDasharray="8 6" />
        <text {...label(16)} x={statueX} y={z - 93 * PXM - 30} textAnchor="middle" opacity={0.9}>
          STATUE OF LIBERTY
        </text>

        <line x1={795} y1={z} x2={795} y2={z - 120 * PXM} stroke="#f4f1ea" strokeWidth={2.5} />
        {[0, 20, 40, 60, 80, 100, 120].map((m) => (
          <g key={m}>
            <line x1={795} y1={z - m * PXM} x2={809} y2={z - m * PXM} stroke="#f4f1ea" strokeWidth={2.5} />
            <text {...label(17)} letterSpacing={0} x={816} y={z - m * PXM + 6}>
              {m === 0 ? '0' : `${m} m`}
            </text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
