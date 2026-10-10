// Wisnu riding Garuda, after the Belahan statue (refs 11.jpg, airlangga-arca.jpg), drawn as a carved relief:
// every form has a lit edge (top-left) and a shadow under it, ornaments are beaded, feathers are ribbed, the stone
// is pitted and cracked. Origin: centre of the base; up is negative y; about 420 wide and 590 tall.
import React from 'react';
import { rng } from './kit';

export const JAR = { x: 96, y: -476 }; // where the raised hand holds the jar of amerta
const GOLD = '#E9B03A';
const rd = (a: number) => (a * Math.PI) / 180;
const f1 = (x: number) => x.toFixed(1);

type Pal = { b: string; d: string; l: string; k: string; h: string };

/** a carved form: shadow under, body, then a lit rim on the upper-left */
const Cut: React.FC<{ d: string; fill: string; p: Pal; rim?: boolean }> = ({ d, fill, p, rim = true }) => (
  <>
    <path d={d} fill={p.k} opacity={0.45} transform="translate(3.5 4.5)" />
    <path d={d} fill={fill} />
    {rim && <path d={d} fill="none" stroke={p.h} strokeWidth={1.6} opacity={0.55} transform="translate(-1 -1.2)" />}
  </>
);

const beads = (pts: [number, number][], r: number, p: Pal, key: string) =>
  pts.map(([x, y], i) => (
    <g key={`${key}${i}`}>
      <circle cx={x + 1} cy={y + 1.4} r={r} fill={p.k} opacity={0.5} />
      <circle cx={x} cy={y} r={r} fill={p.l} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill={p.h} opacity={0.8} />
    </g>
  ));
const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = rd(a0 + ((a1 - a0) * i) / (n - 1));
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

/** one long flight feather with rib and barbs, lying along +x from the origin */
const Feather: React.FC<{ L: number; w: number; p: Pal; alt: boolean }> = ({ L, w, p, alt }) => {
  const d = `M 0 0 C ${f1(L * 0.3)} ${f1(-w)}, ${f1(L * 0.8)} ${f1(-w)}, ${f1(L)} 0 C ${f1(L * 0.8)} ${f1(w * 0.8)}, ${f1(L * 0.3)} ${f1(w * 0.8)}, 0 0 Z`;
  return (
    <>
      <path d={d} fill={p.k} opacity={0.45} transform="translate(3 5)" />
      <path d={d} fill={alt ? p.b : p.l} />
      <path d={`M 4 0 L ${f1(L - 4)} 0`} stroke={p.d} strokeWidth={2.2} />
      {Array.from({ length: Math.floor(L / 16) }, (_, i) => (
        <path key={i} d={`M ${12 + i * 16} 0 l 9 ${f1(-w * 0.62)} M ${12 + i * 16} 0 l 9 ${f1(w * 0.5)}`} stroke={p.d} strokeWidth={1.2} opacity={0.7} />
      ))}
      <path d={`M 2 ${f1(-w * 0.25)} C ${f1(L * 0.3)} ${f1(-w * 0.95)}, ${f1(L * 0.75)} ${f1(-w * 0.95)}, ${f1(L - 3)} -1`} fill="none" stroke={p.h} strokeWidth={1.4} opacity={0.6} />
    </>
  );
};

const FLAME = 'M -7 2 Q -9 -10 -1 -20 Q 1 -12 8 -15 Q 5 -7 7 2 Z';

export const Arca: React.FC<{ wing?: number; dark?: boolean; jarGlow?: number }> = ({ wing = 1, dark, jarGlow = 0 }) => {
  const p: Pal = dark ? { b: '#6C685F', d: '#4A4740', l: '#8C887D', k: '#211F1B', h: '#B4B0A4' } : { b: '#A69C87', d: '#746B5B', l: '#C6BCA5', k: '#352F26', h: '#EEE6D2' };
  const R = rng(17);
  const pores = Array.from({ length: 210 }, () => {
    const up = R() > 0.62;
    return { x: (R() - 0.5) * (up ? 200 : 370), y: up ? -255 - R() * 280 : -4 - R() * 250, r: 0.8 + R() * 1.9, l: R() > 0.7 };
  });
  // flames around the arch: up the left side, over the top, down the right
  const flames: { x: number; y: number; a: number }[] = [];
  for (let i = 0; i < 9; i++) flames.push({ x: -124, y: -262 - i * 19, a: -90 });
  for (let i = 0; i <= 20; i++) {
    const a = 180 + i * 9;
    flames.push({ x: 124 * Math.cos(rd(a)), y: -424 + 124 * Math.sin(rd(a)), a: a + 90 });
  }
  for (let i = 0; i < 9; i++) flames.push({ x: 124, y: -414 + i * 19, a: 90 });
  // rows of snail curls on Garuda's head
  const curls: { x: number; y: number; r: number }[] = [];
  [50, 68, 86].forEach((rr, row) => {
    const n = 7 + row * 2;
    for (let i = 0; i < n; i++) {
      const a = rd(-178 + (200 * i) / (n - 1));
      curls.push({ x: 14 + rr * Math.cos(a), y: -246 + rr * 0.84 * Math.sin(a), r: 10.5 - row * 0.6 });
    }
  });
  return (
    <g filter="url(#u2-stonegrain)">
      {/* lower slab: a rough-edged block */}
      <Cut p={p} fill={p.d} d="M -202 0 L -206 -120 L -198 -232 Q -196 -262 -168 -264 L 170 -264 Q 198 -262 200 -234 L 206 -110 L 202 0 Z" />
      {/* wings: scalloped coverts, then long ribbed flight feathers fanning out */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`scale(${sd} 1)`}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = -84 + i * 9.5 * Math.min(1.25, 0.82 + wing * 0.22);
            return (
              <g key={i} transform={`translate(${f1(74 + i * 5)} ${f1(-214 + i * 9)}) rotate(${f1(a)})`}>
                <Feather L={(168 - i * 5) * wing} w={15 + i * 0.6} p={p} alt={i % 2 === 0} />
              </g>
            );
          })}
          {[0, 1, 2].map((row) =>
            Array.from({ length: 5 - row }, (_, i) => (
              <g key={`${row}-${i}`}>
                <path d={`M ${f1(66 + row * 20 + i * 5)} ${f1(-196 + i * 22 - row * 6)} q 24 -9 26 12 q -14 12 -26 -12 Z`} fill={p.k} opacity={0.4} transform="translate(2 3)" />
                <path d={`M ${f1(66 + row * 20 + i * 5)} ${f1(-196 + i * 22 - row * 6)} q 24 -9 26 12 q -14 12 -26 -12 Z`} fill={(i + row) % 2 ? p.l : p.b} />
              </g>
            )),
          )}
        </g>
      ))}
      {/* prabha: arched back-slab, flame border, beaded inner line, finial */}
      {flames.map((fl, i) => (
        <g key={i} transform={`translate(${f1(fl.x)} ${f1(fl.y)}) rotate(${f1(fl.a)})`}>
          <path d={FLAME} fill={p.k} opacity={0.4} transform="translate(2 3)" />
          <path d={FLAME} fill={i % 2 ? p.l : p.b} />
          <path d="M 0 0 Q -2 -8 0 -15" fill="none" stroke={p.d} strokeWidth={1.2} />
        </g>
      ))}
      <Cut p={p} fill={p.b} d="M -124 -252 L -124 -424 A 124 124 0 0 1 124 -424 L 124 -252 Z" />
      <path d="M -108 -254 L -108 -424 A 108 108 0 0 1 108 -424 L 108 -254" fill="none" stroke={p.d} strokeWidth={3} />
      {beads([...Array.from({ length: 9 }, (_, i): [number, number] => [-108, -262 - i * 18]), ...arcPts(0, -424, 108, 108, 184, 356, 22), ...Array.from({ length: 9 }, (_, i): [number, number] => [108, -406 + i * 18])], 3.4, p, 'pb')}
      <path d="M -94 -256 L -94 -422 A 94 94 0 0 1 94 -422 L 94 -256 Z" fill={p.d} opacity={0.42} />
      <path d="M -9 -548 Q -14 -566 0 -586 Q 4 -572 12 -574 Q 8 -560 9 -548 Z" fill={p.l} />
      {/* halo: an oval with a beaded rim and rays */}
      <ellipse cx={0} cy={-474} rx={54} ry={58} fill={p.k} opacity={0.35} transform="translate(3 4)" />
      <ellipse cx={0} cy={-474} rx={54} ry={58} fill={p.b} />
      {Array.from({ length: 22 }, (_, i) => (
        <path key={i} d={`M ${f1(30 * Math.cos(rd(i * 16.4)))} ${f1(-474 + 32 * Math.sin(rd(i * 16.4)))} L ${f1(46 * Math.cos(rd(i * 16.4)))} ${f1(-474 + 50 * Math.sin(rd(i * 16.4)))}`} stroke={p.d} strokeWidth={1.4} opacity={0.7} />
      ))}
      {beads(arcPts(0, -474, 54, 58, 0, 343, 22), 3, p, 'hb')}

      {/* ── Wisnu ── raised arms with attributes */}
      <Cut p={p} fill={p.b} d="M -40 -438 Q -66 -430 -84 -402 Q -92 -392 -84 -386 L -70 -396 Q -58 -414 -36 -422 Z" />
      <Cut p={p} fill={p.l} d="M -90 -398 Q -104 -430 -98 -462 L -84 -462 Q -86 -432 -76 -404 Z" />
      <Cut p={p} fill={p.b} d="M 40 -438 Q 66 -430 84 -402 Q 92 -392 84 -386 L 70 -396 Q 58 -414 36 -422 Z" />
      <Cut p={p} fill={p.l} d="M 90 -398 Q 104 -430 100 -458 L 86 -458 Q 88 -432 76 -404 Z" />
      {beads([[-78, -402], [-70, -410], [78, -402], [70, -410]], 3.2, p, 'ab')}
      {/* chakra in the left raised hand: a spoked wheel with three flames */}
      <g transform="translate(-92 -484)">
        <circle r={21} fill={p.k} opacity={0.4} cx={2.5} cy={3.5} />
        <circle r={21} fill={p.l} />
        <circle r={14} fill={p.b} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M 0 0 L ${f1(14 * Math.cos(rd(i * 45)))} ${f1(14 * Math.sin(rd(i * 45)))}`} stroke={p.d} strokeWidth={2} />
        ))}
        <circle r={4.5} fill={p.l} />
        {[-90, 30, 150].map((a) => (
          <path key={a} d={FLAME} fill={p.l} transform={`rotate(${a + 90}) translate(0 -21) scale(0.6)`} />
        ))}
      </g>
      {/* the jar of amerta in the right raised hand */}
      <circle cx={JAR.x} cy={JAR.y} r={30} fill={GOLD} opacity={jarGlow * 0.6} filter="url(#u2-glow)" />
      {[p.l, GOLD].map((c, i) => (
        <g key={i} opacity={i ? jarGlow : 1} transform={`translate(${JAR.x} ${JAR.y})`}>
          {i === 0 && <path d="M -14 14 Q -22 -2 -9 -10 L -8 -17 L -12 -21 L 12 -21 L 8 -17 L 9 -10 Q 22 -2 14 14 Q 0 20 -14 14 Z" fill={p.k} opacity={0.45} transform="translate(3 4)" />}
          <path d="M -14 14 Q -22 -2 -9 -10 L -8 -17 L -12 -21 L 12 -21 L 8 -17 L 9 -10 Q 22 -2 14 14 Q 0 20 -14 14 Z" fill={c} />
          {i === 0 && <path d="M -15 0 Q 0 6 15 0 M -9 -10 L 9 -10" fill="none" stroke={p.d} strokeWidth={1.6} />}
          {i === 0 && <path d="M -9 -3 Q -13 4 -8 10" fill="none" stroke={p.h} strokeWidth={1.6} opacity={0.7} />}
        </g>
      ))}
      {/* legs folded on the lotus, dhoti pleats, feet */}
      <Cut p={p} fill={p.b} d="M -84 -340 Q -70 -372 -20 -372 L 20 -372 Q 70 -372 84 -340 Q 78 -320 40 -318 L -40 -318 Q -78 -320 -84 -340 Z" />
      <path d="M -66 -338 Q -30 -358 0 -350 Q 30 -358 66 -338" fill="none" stroke={p.d} strokeWidth={2.4} />
      {[-52, -34, 34, 52].map((x) => (
        <path key={x} d={`M ${x} -352 Q ${x * 1.06} -338 ${x * 1.1} -324`} fill="none" stroke={p.d} strokeWidth={1.3} opacity={0.7} />
      ))}
      <ellipse cx={-22} cy={-330} rx={17} ry={7} fill={p.l} />
      <ellipse cx={22} cy={-330} rx={17} ry={7} fill={p.l} />
      {/* torso: slim waist, belt with clasp, sacred thread, two necklaces */}
      <Cut p={p} fill={p.l} d="M -42 -440 Q 0 -452 42 -440 Q 40 -410 26 -384 L 28 -366 L -28 -366 L -26 -384 Q -40 -410 -42 -440 Z" />
      <path d="M 6 -448 Q 42 -442 42 -440 Q 40 -410 26 -384 L 28 -366 L 12 -366 Q 16 -410 6 -448 Z" fill={p.b} opacity={0.75} />
      <path d="M -30 -436 Q 4 -404 20 -368" fill="none" stroke={p.d} strokeWidth={3} />
      {beads(arcPts(0, -440, 24, 20, 20, 160, 9), 2.6, p, 'n1')}
      {beads(arcPts(0, -438, 32, 34, 28, 152, 11), 2.2, p, 'n2')}
      <rect x={-30} y={-374} width={60} height={9} rx={2} fill={p.b} />
      {beads([[-20, -369.5], [-10, -369.5], [10, -369.5], [20, -369.5]], 2.2, p, 'bl')}
      <circle cx={0} cy={-369.5} r={6.5} fill={p.l} stroke={p.d} strokeWidth={1.4} />
      {/* lower arms meet in the lap */}
      <Cut p={p} fill={p.b} d="M -42 -430 Q -60 -404 -50 -376 Q -30 -360 -4 -360 L -4 -350 Q -40 -350 -62 -372 Q -72 -404 -54 -436 Z" />
      <Cut p={p} fill={p.b} d="M 42 -430 Q 60 -404 50 -376 Q 30 -360 4 -360 L 4 -350 Q 40 -350 62 -372 Q 72 -404 54 -436 Z" />
      <ellipse cx={0} cy={-355} rx={17} ry={9} fill={p.l} />
      <path d="M -10 -356 Q 0 -350 10 -356" fill="none" stroke={p.d} strokeWidth={1.4} />
      {beads([[-58, -388], [58, -388], [-52, -420], [52, -420]], 3, p, 'br')}
      {/* neck, face, long ears with earrings */}
      <rect x={-9} y={-452} width={18} height={14} fill={p.b} />
      <ellipse cx={-27} cy={-464} rx={5} ry={13} fill={p.b} />
      <ellipse cx={27} cy={-464} rx={5} ry={13} fill={p.b} />
      {beads([[-27, -448], [27, -448]], 4.4, p, 'er')}
      <Cut p={p} fill={p.l} d="M -24 -478 Q -26 -448 0 -442 Q 26 -448 24 -478 Q 22 -500 0 -500 Q -22 -500 -24 -478 Z" />
      <path d="M 2 -500 Q 22 -500 24 -478 Q 26 -448 0 -442 Q 14 -456 12 -476 Q 12 -492 2 -500 Z" fill={p.b} opacity={0.6} />
      <path d="M -17 -480 Q -9 -486 -2 -479 M 2 -479 Q 9 -486 17 -480" fill="none" stroke={p.k} strokeWidth={1.8} />
      <path d="M -15 -473 Q -9 -469 -3 -473 M 3 -473 Q 9 -469 15 -473" fill="none" stroke={p.k} strokeWidth={2} strokeLinecap="round" />
      <path d="M 0 -476 L -3 -461 Q 0 -458 3 -461" fill="none" stroke={p.d} strokeWidth={1.6} />
      <path d="M -8 -453 Q 0 -448 8 -453 M -6 -453 Q 0 -456 6 -453" fill="none" stroke={p.k} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={0} cy={-487} r={1.8} fill={p.d} />
      {/* crown: jewelled band, three tiers, knob; ribbons at the sides */}
      <path d="M -27 -494 q -16 -4 -22 10 q 12 -2 18 6 Z M 27 -494 q 16 -4 22 10 q -12 -2 -18 6 Z" fill={p.b} />
      <Cut p={p} fill={p.b} d="M -27 -492 L -24 -508 L 24 -508 L 27 -492 Z" />
      {beads([[-18, -500], [-9, -500], [9, -500], [18, -500]], 2.4, p, 'cb')}
      <path d="M 0 -492 L -7 -503 L 0 -514 L 7 -503 Z" fill={p.l} stroke={p.d} strokeWidth={1.2} />
      <Cut p={p} fill={p.l} d="M -22 -508 L -17 -524 L 17 -524 L 22 -508 Z" />
      <Cut p={p} fill={p.b} d="M -16 -524 L -11 -538 L 11 -538 L 16 -524 Z" />
      <Cut p={p} fill={p.l} d="M -10 -538 L -5 -550 L 5 -550 L 10 -538 Z" />
      <circle cx={0} cy={-555} r={5.5} fill={p.l} stroke={p.d} strokeWidth={1.2} />
      {/* double lotus seat */}
      <Cut p={p} fill={p.l} d="M -100 -318 L 100 -318 L 84 -300 L -84 -300 Z" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${-96 + i * 21.4} -318 q 10.7 22 21.4 0`} fill="none" stroke={p.d} strokeWidth={2} />
      ))}
      {beads(Array.from({ length: 15 }, (_, i): [number, number] => [-84 + i * 12, -297]), 2.6, p, 'lb')}
      <Cut p={p} fill={p.b} d="M -84 -294 L 84 -294 L 96 -278 L -96 -278 Z" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M ${-90 + i * 20} -280 q 10 -18 20 0`} fill="none" stroke={p.d} strokeWidth={2} />
      ))}

      {/* ── Garuda ── tail fan on the left */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`translate(-122 -96) rotate(${-168 + i * 21})`}>
          <path d="M 0 0 C 20 -16, 62 -16, 70 0 C 62 14, 20 14, 0 0 Z" fill={p.k} opacity={0.4} transform="translate(2 4)" />
          <path d="M 0 0 C 20 -16, 62 -16, 70 0 C 62 14, 20 14, 0 0 Z" fill={i % 2 ? p.l : p.b} />
          <path d="M 6 0 L 62 0" stroke={p.d} strokeWidth={1.6} />
          <ellipse cx={54} cy={0} rx={8} ry={6} fill="none" stroke={p.d} strokeWidth={1.4} />
        </g>
      ))}
      {/* far (right) leg, kneeling back */}
      <Cut p={p} fill={p.d} d="M 26 -116 Q 110 -122 156 -84 Q 170 -66 160 -52 L 96 -76 Q 60 -84 30 -78 Z" />
      <Cut p={p} fill={p.d} d="M 160 -52 Q 182 -40 178 -18 L 120 -10 Q 112 -30 132 -58 Z" />
      {/* near (left) leg, knee forward, clawed foot on the snake */}
      <Cut p={p} fill={p.b} d="M -30 -118 Q -110 -136 -160 -104 Q -176 -88 -166 -70 L -96 -72 Q -56 -72 -24 -78 Z" />
      <path d="M -150 -106 Q -100 -122 -44 -110" fill="none" stroke={p.h} strokeWidth={3} opacity={0.5} />
      <Cut p={p} fill={p.l} d="M -166 -72 Q -176 -40 -160 -18 L -108 -16 Q -104 -44 -112 -72 Z" />
      {beads([[-158, -30], [-146, -28], [-134, -28], [-122, -28], [-112, -30]], 3.2, p, 'ak')}
      <Cut p={p} fill={p.l} d="M -164 -18 L -182 2 L -160 -4 L -150 8 L -136 -6 L -120 8 L -112 -8 L -100 -16 Z" />
      {beads([[-150, -100], [-158, -90], [-162, -78]], 3, p, 'kn')}
      {/* loincloth between the legs, pleated */}
      <Cut p={p} fill={p.l} d="M -26 -112 L 26 -112 L 34 -44 Q 0 -30 -34 -44 Z" />
      {[-16, -5, 6, 17].map((x) => (
        <path key={x} d={`M ${x} -108 L ${f1(x * 1.3)} -42`} stroke={p.d} strokeWidth={1.5} opacity={0.7} />
      ))}
      {/* torso: broad chest, belly, belt with a flower clasp */}
      <Cut p={p} fill={p.b} d="M -84 -200 Q 0 -222 88 -200 Q 92 -160 70 -118 L -66 -118 Q -90 -160 -84 -200 Z" />
      <path d="M 14 -214 Q 88 -204 88 -200 Q 92 -160 70 -118 L 34 -118 Q 50 -170 14 -214 Z" fill={p.d} opacity={0.6} />
      <path d="M -50 -176 Q -20 -160 0 -176 Q 20 -160 52 -176" fill="none" stroke={p.d} strokeWidth={2.6} />
      <path d="M 0 -176 L 0 -128" stroke={p.d} strokeWidth={1.6} opacity={0.6} />
      <path d="M -70 -196 Q -10 -150 56 -122" fill="none" stroke={p.l} strokeWidth={6} />
      <path d="M -70 -196 Q -10 -150 56 -122" fill="none" stroke={p.d} strokeWidth={1.2} strokeDasharray="3 5" />
      {beads(arcPts(2, -202, 60, 34, 14, 166, 15), 3.6, p, 'gn')}
      {beads(arcPts(2, -200, 44, 20, 20, 160, 9), 2.4, p, 'gm')}
      <rect x={-68} y={-128} width={138} height={14} rx={3} fill={p.l} />
      <rect x={-68} y={-128} width={138} height={14} rx={3} fill="none" stroke={p.d} strokeWidth={1.4} />
      {beads(Array.from({ length: 9 }, (_, i): [number, number] => [-58 + i * 14.6, -121]).filter((_, i) => i !== 4), 2.4, p, 'gb')}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={f1(13 * Math.cos(rd(i * 45))) as unknown as number} cy={f1(-121 + 13 * Math.sin(rd(i * 45))) as unknown as number} rx={6.5} ry={4} fill={p.l} stroke={p.d} strokeWidth={1} transform={`rotate(${i * 45} ${f1(13 * Math.cos(rd(i * 45)))} ${f1(-121 + 13 * Math.sin(rd(i * 45)))})`} />
      ))}
      <circle cx={0} cy={-121} r={6} fill={p.b} stroke={p.d} strokeWidth={1.2} />
      {/* arms: left fist on the thigh, right hand raised to the shoulder; armlets and bracelets */}
      <Cut p={p} fill={p.l} d="M -84 -198 Q -112 -186 -118 -150 Q -116 -128 -96 -118 L -84 -132 Q -96 -146 -92 -164 Q -86 -180 -70 -186 Z" />
      <Cut p={p} fill={p.l} d="M -98 -120 Q -70 -98 -46 -104 L -44 -122 Q -66 -120 -84 -134 Z" />
      <circle cx={-42} cy={-112} r={13} fill={p.l} stroke={p.d} strokeWidth={1.4} />
      <path d="M -50 -116 L -36 -116 M -50 -110 L -36 -110" stroke={p.d} strokeWidth={1.4} />
      <Cut p={p} fill={p.b} d="M 86 -198 Q 122 -184 126 -150 Q 122 -132 104 -130 L 98 -146 Q 106 -160 96 -172 Q 88 -180 74 -184 Z" />
      <Cut p={p} fill={p.b} d="M 124 -148 Q 132 -186 108 -212 L 94 -204 Q 108 -182 104 -152 Z" />
      <circle cx={100} cy={-214} r={12} fill={p.l} stroke={p.d} strokeWidth={1.4} />
      {beads([[-112, -172], [-108, -182], [114, -172], [110, -182], [-60, -112], [116, -200]], 3.2, p, 'gr')}
      {/* head: rows of snail curls, diadem, bulging eye, ear ring, hooked open beak with teeth */}
      {curls.map((c, i) => (
        <g key={i}>
          <circle cx={c.x + 1.5} cy={c.y + 2} r={c.r} fill={p.k} opacity={0.45} />
          <circle cx={c.x} cy={c.y} r={c.r} fill={i % 2 ? p.b : p.l} />
          <path d={`M ${f1(c.x + c.r * 0.6)} ${f1(c.y)} a ${f1(c.r * 0.6)} ${f1(c.r * 0.6)} 0 1 0 ${f1(-c.r * 0.6)} ${f1(c.r * 0.55)} a ${f1(c.r * 0.3)} ${f1(c.r * 0.3)} 0 1 0 ${f1(-c.r * 0.1)} ${f1(-c.r * 0.55)}`} fill="none" stroke={p.d} strokeWidth={1.3} />
        </g>
      ))}
      <Cut p={p} fill={p.b} d="M -60 -246 Q -62 -288 -16 -292 Q 34 -292 48 -252 Q 54 -214 28 -196 Q -8 -184 -44 -198 Q -62 -214 -60 -246 Z" />
      <path d="M -4 -292 Q 34 -292 48 -252 Q 54 -214 28 -196 Q 10 -190 0 -192 Q 28 -220 24 -252 Q 20 -280 -4 -292 Z" fill={p.d} opacity={0.5} />
      <path d="M -58 -276 Q -10 -296 44 -272 L 46 -262 Q -8 -284 -60 -264 Z" fill={p.l} />
      {beads(arcPts(-6, -262, 50, 16, 196, 344, 9), 2.8, p, 'dm')}
      {/* upper beak, lower beak, mouth, teeth, nostril */}
      <Cut p={p} fill={p.l} d="M -54 -262 Q -104 -268 -134 -236 Q -146 -220 -140 -202 Q -126 -214 -110 -214 Q -82 -214 -58 -222 Z" />
      <path d="M -54 -262 Q -104 -268 -134 -236" fill="none" stroke={p.h} strokeWidth={2.4} opacity={0.7} />
      <path d="M -60 -220 L -112 -212 Q -124 -204 -118 -192 L -60 -200 Z" fill={p.k} opacity={0.85} />
      {[-106, -70].map((x, i) => (
        <path key={x} d={`M ${x} ${-213 + i * 0.6} l 4 9 l 4 -9 Z`} fill={p.h} />
      ))}
      <Cut p={p} fill={p.b} d="M -58 -202 Q -92 -196 -120 -190 Q -108 -176 -84 -178 Q -66 -180 -52 -190 Z" />
      <ellipse cx={-104} cy={-240} rx={5} ry={3} fill={p.k} opacity={0.7} transform="rotate(-20 -104 -240)" />
      <path d="M -56 -214 q -14 14 -30 10 q 10 -2 12 -12" fill="none" stroke={p.d} strokeWidth={2.4} strokeLinecap="round" />
      {/* eye and brow */}
      <path d="M -56 -258 Q -34 -282 -2 -262 Q -26 -268 -50 -252 Z" fill={p.d} />
      <ellipse cx={-28} cy={-250} rx={13} ry={9} fill={p.k} opacity={0.4} transform="translate(2 3)" />
      <ellipse cx={-28} cy={-250} rx={13} ry={9} fill={p.l} />
      <ellipse cx={-28} cy={-250} rx={13} ry={9} fill="none" stroke={p.d} strokeWidth={1.6} />
      <circle cx={-30} cy={-250} r={5} fill={p.k} />
      <circle cx={-31.5} cy={-251.5} r={1.6} fill={p.h} />
      <path d="M -44 -232 Q -28 -224 -12 -232" fill="none" stroke={p.d} strokeWidth={2} />
      {/* ear with a big floral ring */}
      <circle cx={42} cy={-226} r={21} fill={p.k} opacity={0.4} transform="translate(2 3)" />
      <circle cx={42} cy={-226} r={21} fill={p.l} />
      <circle cx={42} cy={-226} r={13} fill={p.b} stroke={p.d} strokeWidth={1.4} />
      {beads(arcPts(42, -226, 17, 17, 0, 330, 12), 2.4, p, 'eo')}
      <circle cx={42} cy={-226} r={5} fill={p.l} stroke={p.d} strokeWidth={1.2} />

      {/* nagas: two bodies knotted along the base, crowned heads raised at the corners */}
      {[0, 1].map((k) => (
        <g key={k}>
          <path d={k ? 'M -170 -22 C -110 -52, -60 12, 0 -18 C 60 -48, 110 10, 172 -22' : 'M -172 -10 C -112 20, -62 -44, -2 -12 C 58 20, 112 -42, 170 -12'} fill="none" stroke={p.k} strokeWidth={17} strokeLinecap="round" opacity={0.4} transform="translate(2 4)" />
          <path d={k ? 'M -170 -22 C -110 -52, -60 12, 0 -18 C 60 -48, 110 10, 172 -22' : 'M -172 -10 C -112 20, -62 -44, -2 -12 C 58 20, 112 -42, 170 -12'} fill="none" stroke={k ? p.l : p.b} strokeWidth={15} strokeLinecap="round" />
          <path d={k ? 'M -170 -22 C -110 -52, -60 12, 0 -18 C 60 -48, 110 10, 172 -22' : 'M -172 -10 C -112 20, -62 -44, -2 -12 C 58 20, 112 -42, 170 -12'} fill="none" stroke={p.d} strokeWidth={15} strokeLinecap="butt" strokeDasharray="1.4 7" opacity={0.6} />
        </g>
      ))}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 184} -40) scale(${sd} 1)`}>
          <path d="M -16 22 Q -22 -6 -6 -22 Q 14 -30 22 -10 Q 28 4 16 10 L 4 4 L 12 16 Q 0 28 -16 22 Z" fill={p.k} opacity={0.4} transform="translate(2 4)" />
          <path d="M -16 22 Q -22 -6 -6 -22 Q 14 -30 22 -10 Q 28 4 16 10 L 4 4 L 12 16 Q 0 28 -16 22 Z" fill={p.l} />
          <circle cx={4} cy={-10} r={4} fill={p.k} />
          <path d="M -10 -22 l 4 -14 l 6 10 l 6 -12 l 4 16 Z" fill={p.b} stroke={p.d} strokeWidth={1} />
          <path d="M 16 10 l 12 2 M 16 10 l 10 8" stroke={p.k} strokeWidth={1.6} />
        </g>
      ))}
      {/* weathering: pits, three cracks, a little lichen */}
      {pores.map((o, i) => (
        <circle key={i} cx={f1(o.x) as unknown as number} cy={f1(o.y) as unknown as number} r={o.r} fill={o.l ? p.h : p.k} opacity={o.l ? 0.22 : 0.3} />
      ))}
      <path d="M -150 -256 l 8 30 l -6 22 l 10 28 M 120 -250 l -6 34 l 8 20 M -60 -530 l 6 22 l -4 18" fill="none" stroke={p.k} strokeWidth={1.4} opacity={0.5} />
      <ellipse cx={-150} cy={-40} rx={40} ry={16} fill="#6E7A4A" opacity={0.14} />
      <ellipse cx={150} cy={-210} rx={30} ry={22} fill="#6E7A4A" opacity={0.12} />
      {/* moulded base */}
      <rect x={-212} y={-2} width={424} height={10} fill={p.l} />
      <rect x={-206} y={8} width={412} height={14} fill={p.d} />
      <rect x={-216} y={22} width={432} height={10} fill={p.b} />
      {beads(Array.from({ length: 27 }, (_, i): [number, number] => [-195 + i * 15, 15]), 2.6, p, 'bs')}
    </g>
  );
};
