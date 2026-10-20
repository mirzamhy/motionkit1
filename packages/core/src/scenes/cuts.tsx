// Shot entrances besides the plain dissolve. Ideas from lifeprompt-team/remotion-scenes (MIT): LiquidInkSplash's
// seeded blob outline and EffectLightLeak's screen-blended warm glows. Rewritten for the Film runner: pure functions
// of the mix value, no animated filters (the leak's softness comes from its gradient, not a blur).
import React from 'react';
import { inOut, prog } from '../engine/util';
import { n1, rng } from './kit';

export type Cut = 'dissolve' | 'ink' | 'leak';
/** frames each entrance takes */
export const CUT_SPAN: Record<Cut, number> = { dissolve: 24, leak: 40, ink: 54 };

/** closed smooth outline around (cx, cy): `n` points at radius r, each pushed in or out by up to `vary` (seeded) */
const blob = (cx: number, cy: number, r: number, seed: number, n = 11, vary = 0.32, turn = 0) => {
  const R = rng(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + turn;
    const k = r * (1 + (R() - 0.5) * 2 * vary);
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k];
  });
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 4)} ${n1(p1[1] + (p2[1] - p0[1]) / 4)} ${n1(p2[0] - (p3[0] - p1[0]) / 4)} ${n1(p2[1] - (p3[1] - p1[1]) / 4)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d + 'Z';
};

/** clip shape for an ink entrance at mix m (0→1): one spreading blot plus satellite drops that join it */
export const InkClip: React.FC<{ id: string; m: number; w: number; h: number; seed: number }> = ({ id, m, w, h, seed }) => {
  const R = rng(seed * 31 + 5);
  const cx = w * (0.35 + R() * 0.3), cy = h * (0.35 + R() * 0.3);
  const far = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.15; // reaches the corners even on the pinched side
  const main = far * prog(m, 0, 1, (x) => 1 - (1 - x) ** 1.5); // leads from the first frame, settles at the corners
  const drops = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + R() * 0.6, dist = far * (0.25 + R() * 0.35), size = far * (0.08 + R() * 0.1), at = 0.12 + R() * 0.3;
    return blob(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, size * prog(m, at, at + 0.35, inOut) + 0.01, seed * 97 + i, 8, 0.3);
  });
  return (
    <clipPath id={id}>
      <path d={blob(cx, cy, main + 0.01, seed, 11, 0.32, m * 0.5)} />
      {drops.map((d, i) => <path key={i} d={d} />)}
    </clipPath>
  );
};

/** warm light leak over the frame, strongest mid-cut; drawn above the shots, below the grade */
export const Leak: React.FC<{ m: number; w: number; h: number; seed: number }> = ({ m, w, h, seed }) => {
  const s = Math.sin(Math.PI * m); // 0 → 1 → 0
  if (s <= 0.001) return null;
  const R = rng(seed * 13 + 3);
  const dir = R() < 0.5 ? 1 : -1;
  const x1 = w * (0.5 + dir * (0.9 - 1.6 * m)), x2 = w * (0.5 - dir * (0.7 - 1.3 * m));
  return (
    <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
      <defs>
        <radialGradient id={`lk-a${seed}`}><stop offset="0" stopColor="#FFB060" stopOpacity="0.85" /><stop offset="1" stopColor="#FF7A30" stopOpacity="0" /></radialGradient>
        <radialGradient id={`lk-b${seed}`}><stop offset="0" stopColor="#FF8AA0" stopOpacity="0.6" /><stop offset="1" stopColor="#FF5070" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={w} height={h} fill="#FFD9A8" opacity={0.18 * s} />
      <ellipse cx={x1} cy={h * (0.25 + R() * 0.2)} rx={w * 0.38} ry={h * 0.75} fill={`url(#lk-a${seed})`} opacity={s} transform={`rotate(-18 ${n1(x1)} ${n1(h * 0.35)})`} />
      <ellipse cx={x2} cy={h * (0.65 + R() * 0.2)} rx={w * 0.3} ry={h * 0.55} fill={`url(#lk-b${seed})`} opacity={s * 0.8} transform={`rotate(24 ${n1(x2)} ${n1(h * 0.7)})`} />
    </g>
  );
};
