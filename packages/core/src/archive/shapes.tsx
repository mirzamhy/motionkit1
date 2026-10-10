// Paper-cut illustrations for the cutout widget, each drawn in a 100×100 box from layered flats: a base colour, a
// darker shade on one side, a lighter highlight, then ink details. `v` picks a variant (skin / hair / clothes for
// people) so two people on one sheet never look like the same icon.
import React from 'react';

export type ShapePal = { ink: string; paper: string; hot: string };
type Draw = (p: ShapePal, v: number) => React.ReactNode;

const SKIN = ['#E3B58E', '#C68E63', '#F0CFAB', '#A9744E'];
const SKIN_SH = ['#C99570', '#A97248', '#D9B08A', '#8A5B3A'];
const HAIR = ['#2A1F18', '#5B3A22', '#1B1714', '#8A5A2E'];
const TOP = ['#3F5E63', '#A8402C', '#44476B', '#C99632'];
const TOP_SH = ['#2E474B', '#84301F', '#32355A', '#A67A22'];

const rad = (a: number) => (a * Math.PI) / 180;

/** a whole pizza seen from above, centred on (cx, cy) with outer radius r */
const pizza = (cx: number, cy: number, r: number) => {
  const k = r / 42;
  const pep: [number, number][] = [[-14, -16], [12, -19], [22, 2], [-24, 4], [-4, 2], [9, 20], [-14, 21]];
  const olive: [number, number][] = [[2, -27], [-27, -9], [26, -14], [20, 17], [-3, 28], [-22, 14], [9, -6], [-10, -6]];
  const basil: [number, number, number][] = [[-6, -14, 30], [17, -8, -40], [3, 13, 70], [-19, -3, -20], [16, 26, 10]];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      {/* crust: base, baked edge, blisters */}
      <circle r={42} fill="#D6A150" />
      <circle r={42} fill="none" stroke="#B4772C" strokeWidth={2.2} />
      <circle r={38.5} fill="none" stroke="#E7BE78" strokeWidth={1.6} />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={39.5 * Math.cos(rad(i * 25.7 + 8))} cy={39.5 * Math.sin(rad(i * 25.7 + 8))} rx={i % 3 ? 2.2 : 3.2} ry={1.3} fill="#9C6222" opacity={0.75} transform={`rotate(${i * 25.7 + 98} ${39.5 * Math.cos(rad(i * 25.7 + 8))} ${39.5 * Math.sin(rad(i * 25.7 + 8))})`} />
      ))}
      {/* sauce rim + cheese with lighter and browned patches */}
      <circle r={35.5} fill="#A93A26" />
      <circle r={33.5} fill="#F0C95F" />
      {[[-12, -8, 13, 9], [14, 10, 12, 8], [8, -18, 9, 6], [-16, 16, 10, 7]].map(([x, y, a, b], i) => (
        <ellipse key={i} cx={x} cy={y} rx={a} ry={b} fill="#F8E19A" opacity={0.75} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      {[[-26, -14, 4, 2.4], [24, -22, 3.4, 2], [27, 12, 3, 2], [-8, 30, 4, 2], [-29, 10, 2.6, 1.8], [2, -31, 3, 1.6]].map(([x, y, a, b], i) => (
        <ellipse key={i} cx={x} cy={y} rx={a} ry={b} fill="#CF8E2E" opacity={0.7} transform={`rotate(${i * 51} ${x} ${y})`} />
      ))}
      {/* pepperoni: disc, curled rim, fat specks, highlight */}
      {pep.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={6.4} fill="#7E2218" />
          <circle r={5.6} fill="#B5372A" />
          <circle cx={-1.6} cy={-1.2} r={1} fill="#8E271C" />
          <circle cx={2} cy={1.6} r={0.9} fill="#8E271C" />
          <circle cx={1.4} cy={-2.4} r={0.7} fill="#D9654F" />
          <path d="M -4 -2.4 A 4.6 4.6 0 0 1 -0.6 -4.5" fill="none" stroke="#E08A72" strokeWidth={0.9} strokeLinecap="round" />
        </g>
      ))}
      {olive.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={2.5} fill="#1E1B16" />
          <circle r={0.95} fill="#F0C95F" />
        </g>
      ))}
      {basil.map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d="M -4.6 0 Q 0 -3.4 4.6 0 Q 0 3.4 -4.6 0 Z" fill="#4E7B38" />
          <path d="M -4 0 L 4 0" stroke="#33592A" strokeWidth={0.5} />
        </g>
      ))}
      {/* eight slices */}
      {[0, 45, 90, 135].map((a) => (
        <line key={a} x1={41 * Math.cos(rad(a))} y1={41 * Math.sin(rad(a))} x2={-41 * Math.cos(rad(a))} y2={-41 * Math.sin(rad(a))} stroke="#8A5A1E" strokeWidth={0.7} opacity={0.75} />
      ))}
      {/* soft light from the top-left */}
      <path d="M -36 -10 A 38 38 0 0 1 -6 -37" fill="none" stroke="#FFF3CF" strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};

const person: Draw = (p, v) => {
  const s = v % SKIN.length;
  const h = (v + 1) % HAIR.length;
  const c = v % TOP.length;
  return (
    <>
      {/* hood / collar behind the neck */}
      <ellipse cx={50} cy={63} rx={25} ry={11} fill={TOP_SH[c]} />
      {/* torso + shaded side */}
      <path d="M 8 100 C 8 74, 26 64, 50 64 C 74 64, 92 74, 92 100 Z" fill={TOP[c]} />
      <path d="M 50 64 C 74 64, 92 74, 92 100 L 62 100 C 64 86, 60 72, 50 64 Z" fill={TOP_SH[c]} />
      {/* neck */}
      <path d="M 42 50 L 58 50 L 59 66 Q 50 73 41 66 Z" fill={SKIN_SH[s]} />
      {v % 2 === 0 ? (
        <>
          {/* hoodie: zip + drawstrings */}
          <path d="M 50 70 L 50 100" stroke={p.ink} strokeWidth={0.9} opacity={0.55} />
          <path d="M 44 68 L 43 84 M 56 68 L 57 84" stroke="#EFE6D3" strokeWidth={1.3} strokeLinecap="round" />
          <circle cx={43} cy={85} r={1.3} fill="#EFE6D3" />
          <circle cx={57} cy={85} r={1.3} fill="#EFE6D3" />
        </>
      ) : (
        <>
          {/* shirt: collar + buttons */}
          <path d="M 41 65 L 50 76 L 44 82 L 36 68 Z M 59 65 L 50 76 L 56 82 L 64 68 Z" fill="#EFE6D3" />
          {[84, 92].map((y) => (
            <circle key={y} cx={50} cy={y} r={1.1} fill={p.ink} opacity={0.6} />
          ))}
        </>
      )}
      {/* ears, head, jaw shade */}
      <circle cx={32.5} cy={37} r={3.6} fill={SKIN_SH[s]} />
      <circle cx={67.5} cy={37} r={3.6} fill={SKIN_SH[s]} />
      <ellipse cx={50} cy={35} rx={17.5} ry={20.5} fill={SKIN[s]} />
      <path d="M 50 14.5 C 62 14.5 67.5 24 67.5 35 C 67.5 46 60 55.5 50 55.5 C 58 50 61 42 61 34 C 61 25 57 18 50 14.5 Z" fill={SKIN_SH[s]} opacity={0.55} />
      {/* hair: three cuts */}
      {v % 3 === 0 && <path d="M 31.5 34 C 27 10, 73 8, 68.5 34 C 65 25, 60 21, 52 22 C 44 23, 37 24, 31.5 34 Z" fill={HAIR[h]} />}
      {v % 3 === 1 && <path d="M 30.5 40 C 24 6, 76 6, 69.5 40 C 68 30, 64 24, 58 21 C 50 27, 40 27, 34 25 C 32 29, 31 34, 30.5 40 Z" fill={HAIR[h]} />}
      {v % 3 === 2 && (
        <>
          <path d="M 31.5 31 C 30 10, 70 10, 68.5 31 Z" fill={TOP_SH[(c + 1) % TOP.length]} />
          <path d="M 30 31 L 78 31 Q 80 34.5 76 35 L 30 34 Z" fill={TOP[(c + 1) % TOP.length]} />
        </>
      )}
      {/* brows, eyes, nose, mouth */}
      <path d="M 39.5 31.5 L 45.5 30.6 M 54.5 30.6 L 60.5 31.5" stroke={HAIR[h]} strokeWidth={1.3} strokeLinecap="round" />
      <circle cx={42.8} cy={36} r={1.35} fill={p.ink} />
      <circle cx={57.2} cy={36} r={1.35} fill={p.ink} />
      <path d="M 50 37 L 48.6 43 L 51 43.4" fill="none" stroke={SKIN_SH[s]} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 45 48 Q 50 50.6 55 48" fill="none" stroke={p.ink} strokeWidth={1.1} strokeLinecap="round" opacity={0.75} />
      {v % 2 === 0 && (
        <>
          {/* glasses */}
          <rect x={37} y={32} width={11.4} height={8.4} rx={2.6} fill="#FFFFFF" fillOpacity={0.18} stroke={p.ink} strokeWidth={1.3} />
          <rect x={51.6} y={32} width={11.4} height={8.4} rx={2.6} fill="#FFFFFF" fillOpacity={0.18} stroke={p.ink} strokeWidth={1.3} />
          <path d="M 48.4 35.4 L 51.6 35.4 M 37 35 L 33 34 M 63 35 L 67 34" stroke={p.ink} strokeWidth={1.2} />
        </>
      )}
      {v % 4 === 3 && <path d="M 40 46 C 40 56, 60 56, 60 46 C 56 50, 44 50, 40 46 Z" fill={HAIR[h]} opacity={0.85} />}
    </>
  );
};

const computer: Draw = (p) => (
  <>
    {/* desk */}
    <rect x={2} y={88} width={96} height={5} rx={1} fill="#8A6238" />
    <rect x={2} y={92} width={96} height={2} fill="#6B4A28" />
    {/* monitor: bezel, screen, reflection */}
    <rect x={12} y={12} width={62} height={48} rx={3.5} fill="#2A2622" />
    <rect x={12} y={12} width={62} height={48} rx={3.5} fill="none" stroke="#4A443C" strokeWidth={1} />
    <rect x={16} y={16} width={54} height={38} rx={1.5} fill="#16232A" />
    {/* terminal: title bar + lines of code */}
    <rect x={16} y={16} width={54} height={4.4} fill="#24353E" />
    {[18, 20.5, 23].map((x, i) => (
      <circle key={i} cx={x} cy={18.2} r={0.9} fill={['#D9654F', '#E0B34A', '#6FAE6A'][i]} />
    ))}
    {[
      [19, 24, 14, p.hot],
      [35, 24, 20, '#9CC3C9'],
      [22, 28.5, 26, '#D9D2C0'],
      [22, 33, 12, '#9CC3C9'],
      [36, 33, 17, '#E0B34A'],
      [22, 37.5, 31, '#D9D2C0'],
      [19, 42, 9, p.hot],
      [30, 42, 22, '#6FAE6A'],
      [19, 46.5, 18, '#D9D2C0'],
    ].map(([x, y, w, c], i) => (
      <rect key={i} x={x as number} y={y as number} width={w as number} height={1.9} rx={0.9} fill={c as string} opacity={0.9} />
    ))}
    <rect x={39} y={46} width={2.4} height={3} fill={p.hot} />
    <path d="M 16 16 L 40 16 L 22 54 L 16 54 Z" fill="#FFFFFF" opacity={0.05} />
    <circle cx={43} cy={57} r={1} fill={p.hot} />
    {/* stand */}
    <path d="M 37 60 L 49 60 L 51 74 L 35 74 Z" fill="#3A342E" />
    <rect x={27} y={74} width={32} height={4} rx={2} fill="#2A2622" />
    {/* keyboard with key rows */}
    <path d="M 14 81 L 66 81 L 70 88 L 10 88 Z" fill="#D8CFBC" />
    <path d="M 14 81 L 66 81 L 66.6 82 L 13.4 82 Z" fill="#F3ECDD" />
    {[82.8, 84.6, 86.2].map((y, r) => Array.from({ length: 13 }, (_, i) => <rect key={`${r}-${i}`} x={15 + i * 3.9 - r * 0.4} y={y} width={2.9} height={1.1} rx={0.3} fill="#8E8576" />))}
    {/* mouse */}
    <ellipse cx={77} cy={85.5} rx={3.6} ry={2.6} fill="#D8CFBC" />
    <path d="M 77 83 L 77 85" stroke="#8E8576" strokeWidth={0.6} />
    {/* mug with steam */}
    <rect x={83} y={73} width={11} height={15} rx={1.6} fill={p.hot} />
    <rect x={83} y={73} width={11} height={3} rx={1.5} fill="#3A2416" />
    <path d="M 94 77 C 99 77, 99 85, 94 85" fill="none" stroke={p.hot} strokeWidth={1.8} />
    <path d="M 86 69 C 84 66, 88 64, 86 61 M 91 69 C 89 66, 93 64, 91 61" fill="none" stroke={p.ink} strokeWidth={0.8} strokeLinecap="round" opacity={0.35} />
    {/* sticky note on the bezel */}
    <rect x={60} y={7} width={13} height={11} fill="#F0D56A" transform="rotate(7 66 12)" />
  </>
);

const bank: Draw = (p) => (
  <>
    {/* pediment with an inner field and a coin emblem */}
    <path d="M 50 6 L 96 30 L 4 30 Z" fill="#DCD2BD" />
    <path d="M 50 12 L 82 28 L 18 28 Z" fill="#C4B79E" />
    <circle cx={50} cy={22} r={4.2} fill="#DCD2BD" stroke="#9A8C72" strokeWidth={0.8} />
    <path d="M 50 6 L 96 30 L 90 30 L 50 9.4 Z" fill="#A99B80" opacity={0.6} />
    {/* frieze with lettering */}
    <rect x={6} y={30} width={88} height={9} fill="#CFC4AC" />
    <rect x={6} y={30} width={88} height={1.6} fill="#EDE5D3" />
    <text x={50} y={37.2} textAnchor="middle" fontSize={6} fontWeight={700} letterSpacing={3.2} fill="#5E5443" fontFamily="Georgia, serif">BANK</text>
    {/* back wall + door */}
    <rect x={12} y={39} width={76} height={41} fill="#B3A78E" />
    <path d="M 43 80 L 43 56 Q 50 49 57 56 L 57 80 Z" fill="#3A2E22" />
    <path d="M 50 54 L 50 80" stroke="#5E4A36" strokeWidth={0.8} />
    <circle cx={48.4} cy={68} r={0.8} fill="#C9A24E" />
    <circle cx={51.6} cy={68} r={0.8} fill="#C9A24E" />
    {/* four fluted columns: capital, shaft, shade, base */}
    {[13, 29, 61, 77].map((x) => (
      <g key={x}>
        <rect x={x - 1.5} y={39} width={13} height={3} fill="#EDE5D3" />
        <rect x={x} y={42} width={10} height={36} fill="#E4DAC6" />
        <rect x={x + 6.4} y={42} width={3.6} height={36} fill="#B9AD94" />
        <path d={`M ${x + 2.4} 43 L ${x + 2.4} 77 M ${x + 4.6} 43 L ${x + 4.6} 77`} stroke="#C8BCA4" strokeWidth={0.6} />
        <rect x={x - 1.5} y={78} width={13} height={2.6} fill="#CFC4AC" />
      </g>
    ))}
    {/* steps */}
    <rect x={7} y={80.6} width={86} height={4} fill="#DCD2BD" />
    <rect x={4} y={84.6} width={92} height={4} fill="#C4B79E" />
    <rect x={1} y={88.6} width={98} height={4.4} fill="#A99B80" />
    <path d="M 7 80.6 L 93 80.6" stroke="#EDE5D3" strokeWidth={0.8} />
    <path d="M 12 39 L 88 39 L 88 41 L 12 41 Z" fill={p.ink} opacity={0.18} />
  </>
);

const plaque: Draw = () => (
  <>
    {/* brick wall */}
    <rect x={2} y={4} width={96} height={92} fill="#8C4A35" />
    {Array.from({ length: 9 }, (_, r) => (
      <g key={r}>
        <rect x={2} y={4 + r * 10.2} width={96} height={1} fill="#C9B39A" opacity={0.75} />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={2 + i * 19.2 + (r % 2 ? 9.6 : 0)} y={4 + r * 10.2} width={1} height={10.2} fill="#C9B39A" opacity={0.75} />
        ))}
        <rect x={(r * 37) % 80 + 4} y={5.6 + r * 10.2} width={16} height={8} fill="#6F3626" opacity={0.45} />
      </g>
    ))}
    {/* bronze plate: shadow, body, bevel, engraved frame */}
    <rect x={17} y={23} width={70} height={58} rx={3} fill="#000" opacity={0.35} />
    <rect x={14} y={20} width={72} height={58} rx={3} fill="#A8732F" />
    <path d="M 14 23 Q 14 20 17 20 L 83 20 Q 86 20 86 23 L 86 30 L 14 44 Z" fill="#D2A257" opacity={0.55} />
    <rect x={18} y={24} width={64} height={50} rx={1.6} fill="none" stroke="#6E4A1A" strokeWidth={1.1} />
    {[
      [18.5, 24.5],
      [81.5, 24.5],
      [18.5, 73.5],
      [81.5, 73.5],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={2} fill="#6E4A1A" />
        <path d={`M ${x - 1.2} ${y} L ${x + 1.2} ${y}`} stroke="#D2A257" strokeWidth={0.5} />
      </g>
    ))}
    {/* emblem: a tiny pizza, then engraved lines */}
    {pizza(50, 36, 8)}
    {[
      [30, 48, 40],
      [26, 54, 48],
      [32, 60, 36],
      [36, 66, 28],
    ].map(([x, y, w], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={2.4} rx={1} fill="#5E3E14" />
        <rect x={x} y={y + 2.4} width={w} height={0.6} fill="#E0B870" opacity={0.6} />
      </g>
    ))}
  </>
);

const box = (y: number, open: boolean) => (
  <g transform={`translate(0 ${y})`}>
    {open && (
      <>
        {/* lid, standing open, with a printed stamp */}
        <path d="M 12 40 L 88 40 L 82 4 L 18 4 Z" fill="#C7A06C" />
        <path d="M 12 40 L 88 40 L 87 34 L 13 34 Z" fill="#A9834F" />
        <circle cx={50} cy={20} r={10} fill="none" stroke="#8E3A28" strokeWidth={1.3} />
        <path d="M 50 20 L 59 15 A 10 10 0 0 1 58 26 Z" fill="#8E3A28" />
        <text x={50} y={36.5} textAnchor="middle" fontSize={3.6} letterSpacing={1.4} fontWeight={700} fill="#8E3A28" fontFamily="Georgia, serif">HOT · FRESH</text>
      </>
    )}
    {/* tray */}
    <path d="M 6 40 L 94 40 L 98 92 L 2 92 Z" fill="#B88F5A" />
    <path d="M 10 43 L 90 43 L 93.4 89 L 6.6 89 Z" fill="#D9BD8E" />
    <path d="M 2 92 L 98 92 L 98 97 L 2 97 Z" fill="#96703F" />
    {/* grease paper */}
    <path d="M 14 46 L 86 46 L 88 86 L 12 86 Z" fill="#EFE3C8" opacity={0.75} />
  </g>
);

/** two pizzas: one in an open box, the second box closed underneath */
const pizzabox: Draw = () => (
  <>
    <g transform="translate(5 14) scale(0.9)">
      <path d="M 2 86 L 98 86 L 98 98 L 2 98 Z" fill="#A9834F" />
      <path d="M 2 86 L 98 86 L 98 88 L 2 88 Z" fill="#D9BD8E" />
      <path d="M 44 90 L 56 90 L 56 94 L 44 94 Z" fill="#8E3A28" opacity={0.8} />
    </g>
    <g transform="translate(5 0) scale(0.9)">
      {box(0, true)}
      <g transform="translate(50 66) scale(1 0.56)">{pizza(0, 0, 37)}</g>
    </g>
    {/* steam */}
    <path d="M 36 40 C 32 34, 40 31, 36 25 M 50 38 C 46 32, 54 29, 50 23 M 64 40 C 60 34, 68 31, 64 25" fill="none" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" opacity={0.55} />
  </>
);

const coin: Draw = () => (
  <>
    <ellipse cx={52} cy={54} rx={41} ry={41} fill="#8A5A12" />
    <circle cx={50} cy={50} r={41} fill="#E9A62A" />
    <circle cx={50} cy={50} r={41} fill="none" stroke="#B87A14" strokeWidth={2} />
    <circle cx={50} cy={50} r={33} fill="#F3BC48" />
    <circle cx={50} cy={50} r={33} fill="none" stroke="#C98A1A" strokeWidth={1} strokeDasharray="1.4 2.2" />
    <text x={50} y={66} textAnchor="middle" fontSize={46} fontWeight={700} fill="#8A5A12" fontFamily="Georgia, serif">₿</text>
    <path d="M 20 34 A 34 34 0 0 1 46 12" fill="none" stroke="#FFF1C4" strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
  </>
);

const phone: Draw = (p) => (
  <>
    <rect x={27} y={5} width={46} height={90} rx={8} fill="#2A2622" />
    <rect x={31} y={12} width={38} height={72} rx={3} fill="#16232A" />
    <rect x={44} y={7.6} width={12} height={2} rx={1} fill="#4A443C" />
    <circle cx={50} cy={89.5} r={2.6} fill="none" stroke="#4A443C" strokeWidth={0.9} />
    <rect x={35} y={18} width={30} height={16} rx={2} fill={p.hot} />
    {[40, 46, 52, 58, 64].map((y, i) => (
      <rect key={y} x={35} y={y} width={i % 2 ? 22 : 30} height={2.6} rx={1.3} fill="#9CC3C9" opacity={0.8} />
    ))}
    <rect x={35} y={72} width={30} height={7} rx={3.5} fill="#6FAE6A" />
    <path d="M 31 12 L 50 12 L 36 84 L 31 84 Z" fill="#FFFFFF" opacity={0.06} />
  </>
);

const paper: Draw = (p) => (
  <>
    <path d="M 24 9 L 66 9 L 83 26 L 83 96 L 24 96 Z" fill="#000" opacity={0.2} />
    <path d="M 20 5 L 62 5 L 79 22 L 79 92 L 20 92 Z" fill="#F6F0E2" />
    <path d="M 62 5 L 79 22 L 62 22 Z" fill="#D5C9B0" />
    <rect x={28} y={16} width={26} height={4} rx={1} fill={p.ink} />
    {[30, 36, 42, 48, 60, 66, 72, 78].map((y, i) => (
      <rect key={y} x={28} y={y} width={i % 4 === 3 ? 26 : 43} height={2.2} rx={1.1} fill={p.ink} opacity={0.4} />
    ))}
    <rect x={28} y={41.4} width={30} height={3.4} fill={p.hot} opacity={0.45} />
    <path d="M 52 82 C 56 76, 60 88, 64 80 S 70 84, 73 79" fill="none" stroke={p.hot} strokeWidth={1.2} strokeLinecap="round" />
  </>
);

const house: Draw = (p) => (
  <>
    <rect x={22} y={46} width={56} height={46} fill="#E4DAC6" />
    <rect x={56} y={46} width={22} height={46} fill="#C4B79E" />
    <path d="M 50 10 L 92 46 L 8 46 Z" fill="#A8402C" />
    <path d="M 50 10 L 92 46 L 78 46 L 50 22 Z" fill="#84301F" />
    <rect x={64} y={16} width={8} height={18} fill="#84301F" />
    <rect x={43} y={66} width={14} height={26} fill="#5B3A22" />
    <circle cx={54} cy={80} r={1} fill="#E9A62A" />
    {[28, 62].map((x) => (
      <g key={x}>
        <rect x={x} y={56} width={11} height={11} fill="#9CC3C9" />
        <path d={`M ${x + 5.5} 56 L ${x + 5.5} 67 M ${x} 61.5 L ${x + 11} 61.5`} stroke="#F6F0E2" strokeWidth={1} />
      </g>
    ))}
    <rect x={10} y={92} width={80} height={3} fill={p.ink} opacity={0.3} />
  </>
);

export const SHAPE: Record<string, Draw> = { person, computer, pizza: () => pizza(50, 50, 44), pizzabox, bank, plaque, coin, phone, paper, house };
