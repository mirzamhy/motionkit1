// Shared helpers for hand-built illustrated scenes: seeded randomness, small maths, and a few drawn atoms.
import React from 'react';
import { prog } from './motion';

export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const n1 = (x: number) => x.toFixed(1);
export const rad = (a: number) => (a * Math.PI) / 180;
/** eased bump 0 → 1 → 0 over [a, b] */
export const bump = (t: number, a: number, b: number) => Math.sin(Math.PI * prog(t, a, b, (x) => x));

/** a soft cloud: overlapping ellipses on a flat base, drawn around (0, 0) */
export const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string; opacity?: number }> = ({ x, y, s = 1, fill = '#FFFFFF', opacity = 0.9 }) => (
  <g transform={`translate(${n1(x)} ${n1(y)}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={120} ry={34} fill={fill} />
    <ellipse cx={-50} cy={-22} rx={56} ry={36} fill={fill} />
    <ellipse cx={20} cy={-36} rx={70} ry={46} fill={fill} />
    <ellipse cx={84} cy={-14} rx={48} ry={28} fill={fill} />
  </g>
);

/** foliage: a clump of seeded leaf discs in two tones, swaying a little */
export const Foliage: React.FC<{ x: number; y: number; r: number; seed: number; t: number; dark: string; light: string; n?: number }> = ({ x, y, r, seed, t, dark, light, n = 14 }) => {
  const R = rng(seed);
  const blobs = Array.from({ length: n }, () => ({ a: R() * Math.PI * 2, d: Math.sqrt(R()) * r * 0.75, s: r * (0.32 + R() * 0.3), l: R() > 0.55, ph: R() * 6 }));
  return (
    <g transform={`translate(${n1(x + 2 * Math.sin(t / 47 + seed))} ${n1(y)})`}>
      {blobs.map((b, i) => (
        <circle key={i} cx={b.d * Math.cos(b.a) + 1.5 * Math.sin(t / 31 + b.ph)} cy={b.d * Math.sin(b.a) * 0.8} r={b.s} fill={b.l ? light : dark} />
      ))}
    </g>
  );
};

/** a feather palm: ringed, slightly leaning trunk; a crown of arched fronds, each a rib with hanging leaflets */
export const Palm: React.FC<{ x: number; base: number; h: number; t: number; seed: number; s?: number }> = ({ x, base, h, t, seed, s = 1 }) => {
  const R = rng(seed);
  const lean = (R() - 0.5) * 70;
  const tx = x + lean;
  const ty = base - h;
  const at = (k: number): [number, number] => {
    const m = 1 - k;
    return [m * m * x + 2 * m * k * (x + lean * 0.15) + k * k * tx, m * m * base + 2 * m * k * (base - h * 0.55) + k * k * ty];
  };
  const fronds = Array.from({ length: 13 }, (_, i) => ({ a: -205 + i * 19 + (R() - 0.5) * 8, L: h * (0.4 + R() * 0.1), back: i % 2 === 0, ph: R() * 6 }));
  const frond = (fr: (typeof fronds)[number], key: number) => {
    const a = ((fr.a + 3 * Math.sin(t / 37 + fr.ph)) * Math.PI) / 180;
    const droop = fr.L * (0.2 + 0.45 * Math.abs(Math.cos(a)));
    const c: [number, number] = [tx + fr.L * 0.55 * Math.cos(a), ty + fr.L * 0.55 * Math.sin(a) - fr.L * 0.12];
    const e: [number, number] = [tx + fr.L * Math.cos(a), ty + fr.L * Math.sin(a) + droop];
    const col = fr.back ? '#2F5A30' : '#4F8A42';
    return (
      <g key={key}>
        <path d={`M ${n1(tx)} ${n1(ty)} Q ${n1(c[0])} ${n1(c[1])} ${n1(e[0])} ${n1(e[1])}`} fill="none" stroke={fr.back ? '#3A4A22' : '#6B7A32'} strokeWidth={4 * s} strokeLinecap="round" />
        {Array.from({ length: 13 }, (_, j) => {
          const k = (j + 1.5) / 14.5;
          const m = 1 - k;
          const px = m * m * tx + 2 * m * k * c[0] + k * k * e[0];
          const py = m * m * ty + 2 * m * k * c[1] + k * k * e[1];
          const len = 34 * s * Math.sin(Math.PI * (0.15 + 0.8 * k));
          const sw = 2 * Math.sin(t / 23 + fr.ph + j);
          return <path key={j} d={`M ${n1(px)} ${n1(py)} l ${n1(-len * 0.35 + sw)} ${n1(len)} M ${n1(px)} ${n1(py)} l ${n1(len * 0.45 + sw)} ${n1(len * 0.85)}`} stroke={j % 2 ? col : fr.back ? '#3F6B3A' : '#6FA24E'} strokeWidth={5 * s} strokeLinecap="round" />;
        })}
      </g>
    );
  };
  return (
    <g>
      <ellipse cx={x} cy={base + 4} rx={46 * s} ry={9 * s} fill="#000" opacity={0.25} />
      {fronds.filter((f) => f.back).map(frond)}
      <path d={`M ${x} ${base} Q ${n1(x + lean * 0.15)} ${n1(base - h * 0.55)} ${n1(tx)} ${n1(ty)}`} fill="none" stroke="#6B4E32" strokeWidth={22 * s} strokeLinecap="round" />
      <path d={`M ${x - 5 * s} ${base} Q ${n1(x + lean * 0.15 - 5 * s)} ${n1(base - h * 0.55)} ${n1(tx - 4 * s)} ${n1(ty)}`} fill="none" stroke="#8E6E48" strokeWidth={6 * s} strokeLinecap="round" opacity={0.7} />
      {Array.from({ length: 16 }, (_, i) => {
        const [px, py] = at((i + 0.5) / 16);
        return <path key={i} d={`M ${n1(px - 11 * s)} ${n1(py)} q ${n1(11 * s)} ${n1(5 * s)} ${n1(22 * s)} 0`} fill="none" stroke="#3E2C1A" strokeWidth={2} opacity={0.6} />;
      })}
      <path d={`M ${x - 16 * s} ${base} q ${16 * s} ${-26 * s} ${32 * s} 0 Z`} fill="#5A4028" />
      {[-9, 2, 11].map((dx, i) => (
        <circle key={i} cx={tx + dx * s} cy={ty + (10 + (i % 2) * 7) * s} r={8 * s} fill="#6B5A2A" />
      ))}
      {fronds.filter((f) => !f.back).map(frond)}
    </g>
  );
};

/** tropical shrub: a clump of long blade leaves (pandan, lemongrass, young banana) growing from one point on the
 *  ground, in three tones, with a contact shadow; each blade sways on its own phase. x, y is where it meets the ground. */
export const Shrub: React.FC<{ x: number; y: number; r: number; seed: number; t: number; dark?: string; mid?: string; light?: string; n?: number }> = ({ x, y, r, seed, t, dark = '#2F4B2C', mid = '#4E7440', light = '#7FA25C', n = 24 }) => {
  const R = rng(seed);
  const blades = Array.from({ length: n }, (_, i) => {
    const side = R() < 0.5 ? -1 : 1;
    // fan from nearly upright in the middle to arching over at the sides; back blades first, shorter and darker
    const spread = Math.pow(R(), 0.7) * 78 * side;
    return { a: -90 + spread, L: r * (0.6 + R() * 0.55) * (1 - Math.abs(spread) / 260), w: r * (0.07 + R() * 0.06), bend: side * (0.25 + R() * 0.35), ph: R() * 6, dx: (R() - 0.5) * r * 0.35, tone: i < n * 0.35 ? dark : i < n * 0.75 ? mid : light };
  });
  const blade = (b: (typeof blades)[number], k: number) => {
    const a = ((b.a + 2.5 * Math.sin(t / 41 + b.ph)) * Math.PI) / 180;
    const bx = x + b.dx, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const tipX = bx + ux * b.L + b.bend * b.L * 0.45, tipY = y + uy * b.L + Math.abs(b.bend) * b.L * 0.3; // tips droop
    const midX = bx + ux * b.L * 0.55, midY = y + uy * b.L * 0.55;
    return <path key={k} d={`M ${n1(bx - nx * b.w * 0.3)} ${n1(y)} Q ${n1(midX - nx * b.w)} ${n1(midY - ny * b.w)} ${n1(tipX)} ${n1(tipY)} Q ${n1(midX + nx * b.w)} ${n1(midY + ny * b.w)} ${n1(bx + nx * b.w * 0.3)} ${n1(y)} Z`} fill={b.tone} />;
  };
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={r * 0.95} ry={r * 0.16} fill="#000" opacity={0.18} />
      {blades.map(blade)}
      {/* a few midribs on the front blades read as leaves, not ribbons */}
      {blades.slice(-6).map((b, k) => {
        const a = ((b.a + 2.5 * Math.sin(t / 41 + b.ph)) * Math.PI) / 180, bx = x + b.dx;
        return <path key={`m${k}`} d={`M ${n1(bx)} ${n1(y)} Q ${n1(bx + Math.cos(a) * b.L * 0.55)} ${n1(y + Math.sin(a) * b.L * 0.55)} ${n1(bx + Math.cos(a) * b.L * 0.9 + b.bend * b.L * 0.4)} ${n1(y + Math.sin(a) * b.L * 0.9 + Math.abs(b.bend) * b.L * 0.26)}`} stroke={dark} strokeOpacity={0.35} strokeWidth={1.2} fill="none" />;
      })}
    </g>
  );
};
