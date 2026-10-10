// Cloth reveal: the veil over the statue is a simulated sheet, not a drawn shape. A disc of 1,409 points with
// distance constraints (Verlet integration) is dropped onto a collision shape standing in for the statue, which
// gives the draped pose; for the unveiling the hem on the rope's side is hauled sideways and down, and the
// rest follows: it slides off the stone, ripples, and settles on the ground. The whole run is computed once and
// cached, so every frame is a pure lookup (Remotion renders frames in any order).
import React from 'react';
import { inOut } from '../engine/util';
import { BLUE, YELLOW } from './UnairParts';

const RAD = 500; // the sheet is a disc: its hem hangs level all round, and colour rings stay clean circles
const M = 22; // rings
const K = 64; // spokes
const DR = RAD / M;
const COUNT = 1 + M * K;
const CX = 960;
const CY = 604;
const A = 206; // collision ellipsoid radii (x, y, z)
const B = 250;
const C = 140;
const PLINTH_TOP = 842;
const FLOOR = 938;
const SUB = 2; // substeps per frame
const TILT = 0.22; // the camera looks slightly down: nearer (z > 0) reads lower on screen, so the cloth lands in FRONT of the stage
const G = 0.11; // gravity per substep²
export const PULL_FROM = 176; // frame (in the unveil shot) the rope starts to carry the cloth
const PULL_TO = 262;
const SIM_FROM = 150;
const SIM_TO = 520;

type State = { p: Float32Array; q: Float32Array };
/** node index ×3: ring 0 is the single centre point, rings 1..M have K points each */
const idx = (r: number, a: number) => (r === 0 ? 0 : (1 + (r - 1) * K + (((a % K) + K) % K)) * 3);
const flat = (r: number, a: number): [number, number] => [r * DR * Math.cos((a / K) * Math.PI * 2), r * DR * Math.sin((a / K) * Math.PI * 2)];
const rest = (r1: number, a1: number, r2: number, a2: number) => {
  const [x1, z1] = flat(r1, a1);
  const [x2, z2] = flat(r2, a2);
  return Math.hypot(x2 - x1, z2 - z1);
};

const LINKS: [number, number, number][] = [];
for (let a = 0; a < K; a++) LINKS.push([0, idx(1, a), DR]);
for (let r = 1; r <= M; r++)
  for (let a = 0; a < K; a++) {
    LINKS.push([idx(r, a), idx(r, a + 1), rest(r, a, r, a + 1)]);
    if (r < M) {
      LINKS.push([idx(r, a), idx(r + 1, a), DR]);
      LINKS.push([idx(r, a), idx(r + 1, a + 1), rest(r, a, r + 1, a + 1)]);
      LINKS.push([idx(r + 1, a), idx(r, a + 1), rest(r + 1, a, r, a + 1)]);
    }
  }
// the rope is tied to the hem on the podium side (spoke 0 points +x): a short stretch of the two outer rings
const GRAB: number[] = [];
for (let a = -3; a <= 3; a++) GRAB.push(idx(M, a), idx(M - 1, a));
const KNOT = idx(M, 0);

const collide = (s: State, k: number) => {
  const { p, q } = s;
  let x = p[k];
  let y = p[k + 1];
  let z = p[k + 2];
  if (y < CY) {
    const v = ((x - CX) / A) ** 2 + ((y - CY) / B) ** 2 + (z / C) ** 2;
    if (v < 1) {
      const m = 1 / Math.sqrt(v || 1e-6);
      x = CX + (x - CX) * m;
      y = CY + (y - CY) * m;
      z *= m;
      // a little drag where the cloth lies on the stone
      q[k] += (x - q[k]) * 0.04;
      q[k + 2] += (z - q[k + 2]) * 0.04;
    }
  } else if (y < PLINTH_TOP + 96) {
    const v = ((x - CX) / A) ** 2 + (z / C) ** 2;
    if (v < 1) {
      const m = 1 / Math.sqrt(v || 1e-6);
      x = CX + (x - CX) * m;
      z *= m;
    }
  }
  if (y > FLOOR) {
    y = FLOOR;
    q[k] += (x - q[k]) * 0.5; // ground friction
    q[k + 2] += (z - q[k + 2]) * 0.5;
  }
  p[k] = x;
  p[k + 1] = y;
  p[k + 2] = z;
};

const step = (s: State, pin: ((n: number) => [number, number, number]) | null) => {
  const { p, q } = s;
  const count = COUNT * 3;
  for (let k = 0; k < count; k += 3) {
    const vx = (p[k] - q[k]) * 0.992;
    const vy = (p[k + 1] - q[k + 1]) * 0.992;
    const vz = (p[k + 2] - q[k + 2]) * 0.992;
    q[k] = p[k];
    q[k + 1] = p[k + 1];
    q[k + 2] = p[k + 2];
    p[k] += vx;
    p[k + 1] += vy + G;
    p[k + 2] += vz;
  }
  for (let it = 0; it < 6; it++) {
    for (let l = 0; l < LINKS.length; l++) {
      const [a, b, len] = LINKS[l];
      const dx = p[b] - p[a];
      const dy = p[b + 1] - p[a + 1];
      const dz = p[b + 2] - p[a + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const f = ((d - len) / d) * 0.5;
      p[a] += dx * f;
      p[a + 1] += dy * f;
      p[a + 2] += dz * f;
      p[b] -= dx * f;
      p[b + 1] -= dy * f;
      p[b + 2] -= dz * f;
    }
    if (pin)
      GRAB.forEach((k, n) => {
        const t = pin(n);
        p[k] = t[0];
        p[k + 1] = t[1];
        p[k + 2] = t[2];
      });
    for (let k = 0; k < count; k += 3) collide(s, k);
  }
};

type Run = { veiled: Float32Array; frames: Float32Array[] };
let cache: Run | null = null;

const simulate = (): Run => {
  if (cache) return cache;
  const p = new Float32Array(COUNT * 3);
  for (let r = 0; r <= M; r++)
    for (let a = 0; a < (r === 0 ? 1 : K); a++) {
      const k = idx(r, a);
      const [x, z] = flat(r, a);
      p[k] = CX + x;
      p[k + 1] = CY - B - 16 + 0.03 * r * DR; // a shallow cone, so it starts sliding down at once
      p[k + 2] = z;
    }
  const s: State = { p, q: new Float32Array(p) };
  for (let n = 0; n < 700; n++) step(s, null); // drop and settle: the draped pose
  s.q.set(s.p);
  const veiled = new Float32Array(s.p);
  const grab0 = GRAB.map((k) => [s.p[k], s.p[k + 1], s.p[k + 2]]);
  const frames: Float32Array[] = [];
  for (let f = SIM_FROM; f <= SIM_TO; f++) {
    for (let n = 0; n < SUB; n++) {
      const t = f + n / SUB;
      const pulling = t >= PULL_FROM && t < PULL_TO;
      const r = inOut(Math.min(1, Math.max(0, (t - PULL_FROM) / (PULL_TO - PULL_FROM))));
      // the hem is hauled sideways toward the podium and down to the ground in front of it; the rest of the sheet
      // is dragged across the statue and, once most of it hangs on that side, slides off under its own weight
      step(s, pulling ? (n2) => [grab0[n2][0] + 400 * r, grab0[n2][1] + (FLOOR - grab0[n2][1]) * r * r - 46 * Math.sin(Math.PI * r), grab0[n2][2] + 300 * r] : null);
    }
    frames.push(new Float32Array(s.p));
  }
  cache = { veiled, frames };
  return cache;
};

const poseAt = (u: number | null): Float32Array => {
  const run = simulate();
  if (u === null || u < SIM_FROM) return run.veiled;
  return run.frames[Math.min(run.frames.length - 1, Math.round(u) - SIM_FROM)];
};

/** where the rope is tied: the hem on the podium side */
export const clothKnot = (u: number | null): [number, number] => {
  const p = poseAt(u);
  return [p[KNOT], p[KNOT + 1] + p[KNOT + 2] * TILT];
};

const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const YEL = hex(YELLOW);
const BLU = hex(BLUE);
const LIGHT = (() => {
  const l = [-0.42, -0.58, 0.7];
  const m = Math.hypot(l[0], l[1], l[2]);
  return l.map((v) => v / m);
})();

/** draw the sheet. `half`: "back" = the far side (drawn before the statue), "front" = the near side (drawn after).
 *  `breeze` adds a slow ripple for the still, veiled pose. */
export const Cloth: React.FC<{ u: number | null; half: 'back' | 'front'; breeze?: number }> = ({ u, half, breeze = 0 }) => {
  const p = poseAt(u);
  const P = (r: number, a: number): [number, number, number] => {
    const k = idx(r, a);
    const y = p[k + 1];
    const w = breeze ? 3.2 * Math.sin(breeze / 19 + y * 0.018 + a * 0.3) * Math.max(0, (y - 360) / 480) : 0;
    return [p[k] + w, y + p[k + 2] * TILT, p[k + 2]];
  };
  // one normal per face, then a lit value per ring-cell averaged with its neighbours: soft folds instead of facets
  const lam = new Float32Array(M * K);
  const cells: { z: number; d: string; r: number; a: number }[] = [];
  for (let r = 0; r < M; r++)
    for (let a = 0; a < K; a++) {
      const A0 = P(r, a);
      const B0 = P(r + 1, a);
      const C0 = P(r + 1, a + 1);
      const D0 = r === 0 ? A0 : P(r, a + 1);
      const e1 = [C0[0] - A0[0], C0[1] - A0[1], C0[2] - A0[2]];
      const e2 = r === 0 ? [B0[0] - A0[0], B0[1] - A0[1], B0[2] - A0[2]] : [D0[0] - B0[0], D0[1] - B0[1], D0[2] - B0[2]];
      const nx = e1[1] * e2[2] - e1[2] * e2[1];
      const ny = e1[2] * e2[0] - e1[0] * e2[2];
      const nz = e1[0] * e2[1] - e1[1] * e2[0];
      const nl = Math.hypot(nx, ny, nz) || 1;
      lam[r * K + a] = Math.abs((nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) / nl);
      const z = (A0[2] + B0[2] + C0[2] + D0[2]) / 4;
      if ((half === 'front') !== z >= 0) continue;
      const pt = (q: [number, number, number]) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
      cells.push({ z, r, a, d: r === 0 ? `M${pt(A0)}L${pt(B0)}L${pt(C0)}Z` : `M${pt(A0)}L${pt(B0)}L${pt(C0)}L${pt(D0)}Z` });
    }
  cells.sort((m, n) => m.z - n.z);
  const soft = (r: number, a: number) => {
    let sum = 2 * lam[r * K + a];
    let n = 2;
    for (const [dr, da] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
      const rr = r + dr;
      if (rr < 0 || rr >= M) continue;
      sum += lam[rr * K + ((a + da + K) % K)];
      n++;
    }
    return sum / n;
  };
  return (
    <g>
      {cells.map((c, i) => {
        const shade = 0.44 + 0.62 * Math.pow(soft(c.r, c.a), 0.8);
        // yellow – blue – yellow as rings of the disc: level bands once it hangs
        const k = (c.r + 0.5) / M;
        const base = k < 0.36 || k >= 0.72 ? YEL : BLU;
        const fill = `rgb(${base.map((v) => Math.min(255, Math.round(v * shade))).join(',')})`;
        return <path key={i} d={c.d} fill={fill} stroke={fill} strokeWidth={0.9} strokeLinejoin="round" />;
      })}
    </g>
  );
};
