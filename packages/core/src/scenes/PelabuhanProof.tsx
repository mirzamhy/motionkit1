// Proof shot: an invented Nusantara harbour in the 1920s, illustrated. Not a real place; the outrigger boat, the
// warehouse and the Dutch schooner are drawn from general knowledge, not from reference photos (say so on screen).
// Composition: horizon on the golden line (y 412); the pier runs from the lower left towards the right third and
// leads the eye to the moored boat; palms and warehouse frame the left; people walk out along the pier.
import React from 'react';
import { inOut, prog } from '../engine/util';
import { Film, filmFrames, type Shot } from './film';
import { Cloud, Foliage, Palm, n1, rng } from './kit';
import { OUTFITS_1954, Walker } from './UnairParts';
import { beats } from './beats';
import { LowerThird } from './titles';

const W = 1920, H = 1080, HZ = 412;
const T = beats([['buka', 60], ['dorong', 480, -60], ['tahan', 120]] as const);

/** pier from near (bottom left) to far (by the right third): point at depth k (0 near, 1 far), across u (-1 left edge, 1 right edge) */
const pier = (k: number, u: number): [number, number] => {
  const cx = 420 + (1210 - 420) * k ** 0.85, cy = 1130 + (585 - 1130) * k ** 0.7, half = 330 * (1 - k) + 46 * k;
  return [cx + u * half, cy - u * half * 0.18];
};

const Sea: React.FC<{ a: number }> = ({ a }) => {
  const R = rng(5);
  const strokes = Array.from({ length: 90 }, () => ({ y: HZ + 8 + R() ** 1.8 * (H - HZ), x: R() * W, l: 20 + R() * 60, ph: R() * 6 }));
  return (
    <g>
      <defs><linearGradient id="pl-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FAEA2" /><stop offset="1" stopColor="#3E6460" /></linearGradient></defs>
      <rect y={HZ} width={W} height={H - HZ} fill="url(#pl-sea)" />
      {strokes.map((s, i) => {
        const d = (s.y - HZ) / (H - HZ); // farther strokes are shorter, thinner and slower
        const x = (s.x + a * (0.15 + d * 0.5) + Math.sin(a / 40 + s.ph) * 6) % (W + 80) - 40;
        return <path key={i} d={`M ${n1(x)} ${n1(s.y)} q ${n1(s.l * d * 0.5)} ${n1(-3 * d)} ${n1(s.l * d)} 0`} stroke="#DCE6DA" strokeOpacity={0.25 + 0.35 * d} strokeWidth={1 + 2.5 * d} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

/** traditional outrigger sailing boat (invented, generic Nusantara), bobbing; x, y at the waterline */
const Perahu: React.FC<{ x: number; y: number; s: number; a: number; ph: number }> = ({ x, y, s, a, ph }) => {
  const bob = Math.sin(a / 34 + ph) * 3, roll = Math.sin(a / 47 + ph) * 1.6;
  return (
    <g transform={`translate(${n1(x)} ${n1(y + bob)}) rotate(${n1(roll)}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={170} ry={10} fill="#2C4A47" opacity={0.35} />
      {/* outriggers */}
      <path d="M -150 4 L 150 4" stroke="#3B2A1C" strokeWidth={5} />
      <path d="M -60 -16 L -70 4 M 60 -16 L 70 4" stroke="#4A3524" strokeWidth={4} />
      {/* hull: dark planking, a lighter sheer line, upswept ends */}
      <path d="M -175 -30 Q -120 8 0 10 Q 120 8 178 -34 L 160 -26 Q 100 -12 0 -12 Q -100 -12 -158 -24 Z" fill="#5A3B23" />
      <path d="M -165 -27 Q -100 -10 0 -10 Q 100 -10 168 -30" stroke="#C9A36A" strokeWidth={4} fill="none" />
      {/* mast and tanja sail (a tilted quadrilateral sail) */}
      <path d="M -10 -12 L -6 -230" stroke="#3B2A1C" strokeWidth={5} />
      <path d="M -40 -40 L -4 -228 L 120 -170 L 70 -36 Z" fill="#E9DCC0" stroke="#B9A57E" strokeWidth={2} />
      <path d="M -24 -120 L 96 -100 M -14 -170 L 108 -140" stroke="#C9B48C" strokeWidth={1.5} />
    </g>
  );
};

/** a two-masted Dutch schooner on the horizon (silhouette, invented) */
const Schooner: React.FC<{ x: number; a: number }> = ({ x, a }) => (
  <g transform={`translate(${n1(x - a * 0.04)} ${HZ + 4})`} opacity={0.55} fill="#5F6B6A">
    <path d="M -70 0 L 74 0 L 60 -10 L -62 -10 Z" />
    <path d="M -20 -10 L -20 -96 M 26 -10 L 26 -110" stroke="#5F6B6A" strokeWidth={2.5} />
    <path d="M -20 -92 L -54 -16 L -20 -16 Z M 26 -106 L -8 -16 L 26 -16 Z M 30 -100 L 64 -18 L 30 -18 Z" />
  </g>
);

const Pier: React.FC = () => {
  const plank = (k0: number, k1: number, i: number) => {
    const [a, b, c, d] = [pier(k0, -1), pier(k0, 1), pier(k1, 1), pier(k1, -1)];
    return <path key={i} d={`M ${a.map(n1).join(' ')} L ${b.map(n1).join(' ')} L ${c.map(n1).join(' ')} L ${d.map(n1).join(' ')} Z`} fill={i % 3 ? '#9C7A52' : '#8C6B45'} stroke="#5E4429" strokeWidth={1.2 * (1 - k0) + 0.3} />;
  };
  const ks = Array.from({ length: 48 }, (_, i) => (i / 48) ** 1.15);
  return (
    <g>
      {/* posts into the water under both edges, with short reflections */}
      {ks.filter((_, i) => i % 4 === 0).flatMap((k, i) => [-1, 1].map((u) => {
        const [x, y] = pier(k, u), len = 70 * (1 - k) + 10, w = 12 * (1 - k) + 3;
        return <g key={`${i}${u}`}><rect x={x - w / 2} y={y} width={w} height={len} fill="#4A3524" /><rect x={x - w / 2} y={y + len} width={w} height={len * 0.6} fill="#4A3524" opacity={0.25} /></g>;
      }))}
      {ks.slice(0, -1).map((k, i) => plank(k, ks[i + 1], i))}
      {/* side beams */}
      {[-1, 1].map((u) => <path key={u} d={`M ${ks.map((k) => pier(k, u).map(n1).join(' ')).join(' L ')}`} stroke="#4A3524" strokeWidth={6} fill="none" opacity={0.8} />)}
    </g>
  );
};

/** crates and sacks at depth k on the pier */
const Cargo: React.FC<{ k: number; u: number; seed: number }> = ({ k, u, seed }) => {
  const [x, y] = pier(k, u), s = 1 - k * 0.8, R = rng(seed);
  return (
    <g transform={`translate(${n1(x)} ${n1(y)}) scale(${n1(s)})`}>
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${i * 46 - 46} ${-(i === 1 ? 44 : 0)})`}><rect x={-22} y={-44} width={44} height={44} fill={i === 1 ? '#B08A58' : '#9D774A'} stroke="#5E4429" strokeWidth={2} /><path d="M -22 -22 L 22 -22 M 0 -44 L 0 0" stroke="#7A5A36" strokeWidth={2} /></g>)}
      {Array.from({ length: 3 }, (_, i) => <ellipse key={i} cx={90 + i * 34 + R() * 6} cy={-18 - (i === 1 ? 20 : 0)} rx={20} ry={18} fill="#CDBB92" stroke="#9E8A60" strokeWidth={2} />)}
    </g>
  );
};

const Warehouse: React.FC = () => (
  <g>
    <rect x={-40} y={300} width={420} height={170} fill="#D9C7A2" />
    <path d="M -60 306 L 170 210 L 400 306 Z" fill="#7C4A32" />
    <path d="M -60 306 L 400 306" stroke="#5A3322" strokeWidth={6} />
    {[30, 130, 230, 330].map((x) => <rect key={x} x={x} y={352} width={46} height={70} fill="#5B4632" />)}
    <text x={170} y={286} textAnchor="middle" fontFamily="'Josefin Sans', sans-serif" fontSize={22} letterSpacing="4" fill="#F1E6CC">GOEDANG</text>
  </g>
);

const People: React.FC<{ u: number; a: number }> = ({ u, a }) => {
  const R = rng(11);
  // sixteen people spread along the whole pier, walking out at about one stride a second. Each fades out near the far
  // end and comes back in below the frame edge (k = 0 is off screen), so the wrap is never seen. Lanes keep clear of
  // the cargo on both edges.
  // nearly one speed for everyone and alternating lanes, so nobody catches up with and merges into someone else
  const people = Array.from({ length: 16 }, (_, i) => ({ k0: (i + R() * 0.5) / 16, lane: (i % 2 ? -0.32 : 0.22) + (R() - 0.5) * 0.18, speed: 0.0005 * (0.97 + R() * 0.06), ph: R() * 6, o: OUTFITS_1954[Math.floor(R() * 4)] }));
  return (
    <g>
      {people
        .map((p) => ({ ...p, k: (p.k0 + u * p.speed) % 0.95 }))
        .sort((x, y) => y.k - x.k) // far people first, near ones drawn over them
        .map((p, i) => {
          const [x, y] = pier(p.k, p.lane), s = 1.5 * (1 - p.k) ** 1.6 + 0.1;
          return <g key={i} opacity={1 - prog(p.k, 0.8, 0.93, inOut)}><Walker x={x} y={y} s={s} t={a} ph={p.ph} o={p.o} /></g>;
        })}
    </g>
  );
};

const draw = (u: number, a: number) => {
  const z = 1 + 0.05 * T.p(u, 'dorong'), cx = 1100, cy = 560;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`}>
      <defs><linearGradient id="pl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E6D3A8" /><stop offset="1" stopColor="#F4E9CF" /></linearGradient></defs>
      <rect width={W} height={HZ + 2} fill="url(#pl-sky)" />
      <Cloud x={500 + a * 0.05} y={150} s={1.6} fill="#FBF3E0" opacity={0.8} />
      <Cloud x={1400 + a * 0.04} y={110} s={1.2} fill="#FBF3E0" opacity={0.7} />
      {/* far headland */}
      <path d={`M 0 ${HZ} Q 220 ${HZ - 70} 520 ${HZ - 30} T 900 ${HZ} Z`} fill="#8E9C84" opacity={0.8} />
      <Schooner x={1560} a={a} />
      <Sea a={a} />
      <Perahu x={1420} y={700} s={1.05} a={a} ph={0} />
      <Perahu x={1740} y={560} s={0.55} a={a} ph={2.2} />
      {/* shore, warehouse, palms */}
      <path d={`M 0 ${HZ + 30} L 640 ${HZ + 50} Q 560 600 380 760 L 0 820 Z`} fill="#D8C59A" />
      <g transform="translate(110 0)"><Warehouse /></g>
      <Foliage x={470} y={540} r={80} seed={3} t={a} dark="#3E5E3A" light="#6E8F55" />
      <Palm x={40} base={640} h={470} t={a} seed={4} />
      <Palm x={560} base={545} h={360} t={a} seed={7} />
      <Palm x={660} base={505} h={280} t={a} seed={9} s={0.85} />
      <Pier />
      <Cargo k={0.3} u={0.82} seed={2} />
      <Cargo k={0.6} u={-0.86} seed={5} />
      <People u={u} a={a} />
    </g>
  );
};

const SHOTS: Shot[] = [
  {
    dur: T.end + 60,
    label: 'PELABUHAN · 1920-AN',
    age: 0.16,
    fill: ['#E6D3A8', '#3E6460'],
    portrait: [[0, 1170, 770, 1.12], [600, 1200, 750, 1.17]],
    draw: (u, a) => draw(u, a),
    over: (u, _a, Wd, Hd) => <LowerThird u={u} at={70} until={330} name="Pelabuhan rekaan, 1920-an" role="Ilustrasi, bukan lokasi nyata" W={Wd} H={Hd} style="arsip" side="right" />,
    sfx: [{ at: 0, file: 'wind', vol: 0.18, loop: true }, { at: 0, file: 'crowd', vol: 0.12, loop: true }, { at: 40, file: 'birds', vol: 0.1, len: 300 }],
  },
];

export const PELABUHAN_FRAMES = filmFrames(SHOTS);
const FONTS = { mono: "'Special Elite', monospace", ui: "'Josefin Sans', sans-serif" };
export const PelabuhanIlustrasi: React.FC<{ sfx?: boolean }> = ({ sfx = false }) => <Film shots={SHOTS} fonts={FONTS} captions={false} sfx={sfx} />;
export const PelabuhanIlustrasiTall: React.FC<{ sfx?: boolean }> = ({ sfx = false }) => <Film shots={SHOTS} fonts={FONTS} captions={false} sfx={sfx} width={1080} height={1920} />;
