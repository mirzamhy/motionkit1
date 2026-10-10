// "Kain Kuning Biru" — the founding of Universitas Airlangga, as hand-built illustrated shots (code only, no assets).
// Every building is drawn from the reference notes in projects/unair-sejarah/refs.md, not from imagination.
// Built shot by shot; so far:
//   NIAS 1923 — the new school building on (today's) Jl. Moestopo: steep stacked hip roofs, white walls, arched gate
import React from 'react';
import { loadFont as josefin } from '@remotion/google-fonts/JosefinSans';
import { loadFont as baskerville } from '@remotion/google-fonts/LibreBaskerville';
import { loadFont as elite } from '@remotion/google-fonts/SpecialElite';
import { inOut, prog } from '../engine/util';
import { Cloud, Foliage, lerp, n1, rng } from './kit';

export const W = 1920;
export const H = 1080;
export const GROUND = 800;
export type F = { mono: string; ui: string; disp: string };
// Period type: a 1920s geometric sans for painted building signs, a typewriter for dates and file labels, and a
// book Baskerville for the narration — the three kinds of lettering you would actually meet in that archive.
const L = { subsets: ['latin'] as ['latin'] };
export const FONTS: F = {
  disp: josefin('normal', { weights: ['600', '700'], ...L }).fontFamily,
  mono: elite('normal', { weights: ['400'], ...L }).fontFamily,
  ui: baskerville('normal', { weights: ['400', '700'], ...L }).fontFamily,
};

export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="un-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8FB7CF" />
      <stop offset="0.7" stopColor="#E9DFC4" />
      <stop offset="1" stopColor="#F2E3BE" />
    </linearGradient>
    <linearGradient id="un-roof" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#A9573A" />
      <stop offset="0.55" stopColor="#8E452C" />
      <stop offset="1" stopColor="#5E2C1C" />
    </linearGradient>
    <linearGradient id="un-roof-far" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8A5A48" />
      <stop offset="1" stopColor="#5E3A2E" />
    </linearGradient>
    <linearGradient id="un-wall" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#FBF6EA" />
      <stop offset="1" stopColor="#E4DAC6" />
    </linearGradient>
    <linearGradient id="un-wall-shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5A4A3A" stopOpacity="0.45" />
      <stop offset="1" stopColor="#5A4A3A" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="un-lawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7E9A52" />
      <stop offset="1" stopColor="#3F5A2C" />
    </linearGradient>
    <linearGradient id="un-drive" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#E6D6B4" />
      <stop offset="1" stopColor="#C9B48A" />
    </linearGradient>
    <radialGradient id="un-arch" cx="0.5" cy="0.9" r="0.9">
      <stop offset="0" stopColor="#4A3A2C" />
      <stop offset="1" stopColor="#15100C" />
    </radialGradient>
    {/* roof tiles: staggered rows of small scallops */}
    <pattern id="un-tile" width="22" height="14" patternUnits="userSpaceOnUse">
      <path d="M 0 7 Q 5.5 13 11 7 Q 16.5 13 22 7" fill="none" stroke="#3A1A10" strokeOpacity="0.4" strokeWidth="1.4" />
      <path d="M -5.5 0 Q 0 6 5.5 0 Q 11 6 16.5 0 Q 22 6 27.5 0" fill="none" stroke="#3A1A10" strokeOpacity="0.4" strokeWidth="1.4" />
      <path d="M 0 8.5 Q 5.5 14.5 11 8.5" fill="none" stroke="#FFD2B0" strokeOpacity="0.14" strokeWidth="1" />
    </pattern>
    <filter id="un-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0" />
    </filter>
    <filter id="un-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
    <radialGradient id="un-vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stopColor="#1A120A" stopOpacity="0" />
      <stop offset="1" stopColor="#1A120A" stopOpacity="0.6" />
    </radialGradient>
  </defs>
);

/** a hip roof in two pitches (steep cap over a flared skirt), with tile texture, hip lines and finials */
export const HipRoof: React.FC<{ x0: number; x1: number; eave: number; kink: number; top: number; r0: number; r1: number; far?: boolean }> = ({ x0, x1, eave, kink, top, r0, r1, far }) => {
  const k0 = x0 + (r0 - x0) * 0.36;
  const k1 = x1 - (x1 - r1) * 0.36;
  const skirt = `M ${x0} ${eave} L ${x1} ${eave} L ${k1} ${kink} L ${k0} ${kink} Z`;
  const cap = `M ${k0} ${kink} L ${k1} ${kink} L ${r1} ${top} L ${r0} ${top} Z`;
  const g = far ? 'url(#un-roof-far)' : 'url(#un-roof)';
  return (
    <g>
      <path d={skirt} fill={g} />
      <path d={cap} fill={g} />
      <path d={skirt} fill="url(#un-tile)" />
      <path d={cap} fill="url(#un-tile)" />
      {/* the pitch change, the ridge and the two hips catch light */}
      <path d={`M ${k0} ${kink} L ${k1} ${kink}`} stroke="#2E140C" strokeWidth={3} opacity={0.5} />
      <path d={`M ${k0} ${kink + 3} L ${k1} ${kink + 3}`} stroke="#E0A080" strokeWidth={1.5} opacity={0.5} />
      <path d={`M ${r0} ${top} L ${r1} ${top}`} stroke="#3A1A10" strokeWidth={7} strokeLinecap="round" />
      <path d={`M ${x0} ${eave} L ${k0} ${kink} L ${r0} ${top}`} fill="none" stroke="#D99272" strokeWidth={3} opacity={0.55} />
      <path d={`M ${x1} ${eave} L ${k1} ${kink} L ${r1} ${top}`} fill="none" stroke="#2E140C" strokeWidth={4} opacity={0.6} />
      {/* finials */}
      {[r0, r1].map((x) => (
        <g key={x}>
          <path d={`M ${x} ${top} L ${x} ${top - 34}`} stroke="#2A1A12" strokeWidth={3} strokeLinecap="round" />
          <circle cx={x} cy={top - 12} r={4} fill="#2A1A12" />
        </g>
      ))}
      {/* eave: thick dark fascia with a soft shadow under it */}
      <rect x={x0 - 6} y={eave - 4} width={x1 - x0 + 12} height={9} fill="#3A2416" />
    </g>
  );
};

/** small oval vents in groups under the eaves */
export const Vents: React.FC<{ x: number; y: number; groups: number; gap: number; per?: number }> = ({ x, y, groups, gap, per = 3 }) => (
  <>
    {Array.from({ length: groups }, (_, g) =>
      Array.from({ length: per }, (_, i) => <ellipse key={`${g}-${i}`} cx={x + g * gap + i * 13} cy={y} rx={4.2} ry={5.5} fill="#2A2018" opacity={0.85} />),
    )}
  </>
);

/** a NIAS student seen from behind, walking away: white closed-collar jacket, white shorts, black knee socks */
export const Student: React.FC<{ x: number; y: number; s: number; t: number; ph: number; hat?: boolean; book?: boolean }> = ({ x, y, s, t, ph, hat, book }) => {
  const sw = Math.sin(t * 0.105 + ph);
  const bobY = -2.5 * Math.abs(Math.cos(t * 0.105 + ph));
  return (
    <g transform={`translate(${n1(x)} ${n1(y + bobY * s)}) scale(${s.toFixed(3)})`}>
      <ellipse cx={0} cy={2} rx={22} ry={5} fill="#000" opacity={0.25} />
      {[1, -1].map((d) => {
        const fx = d * 6 + d * sw * 7;
        const lift = Math.max(0, d * sw) * 5;
        return (
          <g key={d}>
            <path d={`M ${d * 6} -50 L ${n1(d * 6 + (fx - d * 6) * 0.5)} -26`} stroke="#F4EEDD" strokeWidth={13} strokeLinecap="round" />
            <path d={`M ${n1(d * 6 + (fx - d * 6) * 0.5)} -26 L ${n1(fx)} ${n1(-4 - lift)}`} stroke="#1F1A14" strokeWidth={8} strokeLinecap="round" />
            <ellipse cx={fx} cy={-2 - lift} rx={7} ry={4} fill={ph > 2 ? '#F4EEDD' : '#1F1A14'} />
          </g>
        );
      })}
      {/* arms swing against the legs */}
      <path d={`M -13 -92 L ${n1(-16 - sw * 5)} -56`} stroke="#E8E0CC" strokeWidth={8} strokeLinecap="round" />
      <path d={`M 13 -92 L ${n1(16 + sw * 5)} -56`} stroke="#E8E0CC" strokeWidth={8} strokeLinecap="round" />
      <rect x={-14} y={-98} width={28} height={52} rx={7} fill="#F8F3E6" />
      <rect x={3} y={-98} width={11} height={52} rx={5} fill="#DDD3BC" />
      <path d="M 0 -96 L 0 -48" stroke="#CFC4AA" strokeWidth={1.2} />
      {book && <rect x={n1(14 + sw * 5) as unknown as number} y={-66} width={9} height={16} fill="#6B3A2A" />}
      <rect x={-5} y={-104} width={10} height={8} fill="#A9744E" />
      <circle cx={0} cy={-112} r={11} fill="#B98660" />
      <path d="M -11 -112 C -11 -128, 11 -128, 11 -112 C 6 -118, -6 -118, -11 -112 Z" fill="#1F1A14" />
      {hat && (
        <>
          <ellipse cx={0} cy={-119} rx={17} ry={4.5} fill="#EFE6D3" />
          <path d="M -10 -120 C -10 -132, 10 -132, 10 -120 Z" fill="#F8F3E6" />
        </>
      )}
    </g>
  );
};

/** NIAS, 1923 — drawn from refs/2.jpg, 3.jpg (1925) and 4.jpg (today) */
export const NiasBuilding: React.FC<{ f: F; plate?: React.ReactNode }> = ({ f, plate }) => (
  <g>
    {/* left wing (further away): low wall, long roof, a small second gate */}
    <path d="M 60 600 L 600 600 L 600 470 L 170 470 Z" fill="url(#un-roof-far)" />
    <path d="M 60 600 L 600 600 L 600 470 L 170 470 Z" fill="url(#un-tile)" opacity={0.7} />
    <rect x={54} y={596} width={552} height={8} fill="#3A2416" />
    <rect x={80} y={604} width={500} height={196} fill="#EDE5D3" />
    <rect x={80} y={604} width={500} height={34} fill="url(#un-wall-shade)" />
    {[120, 420, 500].map((x) => (
      <g key={x}>
        <rect x={x} y={660} width={44} height={96} fill="#2A2018" />
        <rect x={x + 20} y={660} width={3} height={96} fill="#5E4A36" />
      </g>
    ))}
    <path d="M 232 800 L 232 664 Q 232 622 290 614 Q 348 622 348 664 L 348 800 Z" fill="#F4EEDD" />
    <path d="M 258 800 L 258 712 Q 290 676 322 712 L 322 800 Z" fill="url(#un-arch)" />
    <circle cx={236} cy={668} r={9} fill="none" stroke="#B9AD94" strokeWidth={3} />
    <circle cx={344} cy={668} r={9} fill="none" stroke="#B9AD94" strokeWidth={3} />

    {/* right wing: long roof, vent band, colonnaded gallery */}
    <path d="M 1150 566 L 1990 566 L 1990 392 L 1310 392 Z" fill="url(#un-roof)" />
    <path d="M 1150 566 L 1990 566 L 1990 392 L 1310 392 Z" fill="url(#un-tile)" />
    <path d="M 1310 392 L 1990 392" stroke="#3A1A10" strokeWidth={6} />
    <path d="M 1150 566 L 1310 392" stroke="#D99272" strokeWidth={3} opacity={0.5} />
    <rect x={1150} y={562} width={850} height={9} fill="#3A2416" />
    <rect x={1190} y={571} width={800} height={229} fill="url(#un-wall)" />
    <rect x={1190} y={571} width={800} height={40} fill="url(#un-wall-shade)" />
    <Vents x={1240} y={596} groups={7} gap={108} />
    <rect x={1190} y={622} width={800} height={7} fill="#D5C9B0" />
    {Array.from({ length: 7 }, (_, i) => (
      <g key={i}>
        <rect x={1232 + i * 108} y={648} width={70} height={126} fill="#241A12" />
        <rect x={1232 + i * 108} y={648} width={70} height={30} fill="#000" opacity={0.35} />
        <rect x={1232 + i * 108} y={746} width={70} height={28} fill="#CFC4AC" />
        {[0, 1, 2, 3].map((b) => (
          <rect key={b} x={1238 + i * 108 + b * 16} y={748} width={5} height={24} fill="#9A8C72" />
        ))}
      </g>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <g key={i}>
        <rect x={1204 + i * 108} y={636} width={26} height={142} fill="#FBF6EA" />
        <rect x={1222 + i * 108} y={636} width={8} height={142} fill="#D5C9B0" />
        <rect x={1200 + i * 108} y={636} width={34} height={8} fill="#EFE6D3" />
      </g>
    ))}
    <rect x={1190} y={776} width={800} height={24} fill="#C9BEA6" />

    {/* centre block: two storeys under the two stacked hip roofs */}
    <HipRoof x0={520} x1={1020} eave={436} kink={340} top={132} r0={700} r1={872} />
    <HipRoof x0={950} x1={1222} eave={436} kink={352} top={168} r0={1058} r1={1126} />
    <rect x={548} y={441} width={648} height={359} fill="url(#un-wall)" />
    <rect x={548} y={441} width={648} height={46} fill="url(#un-wall-shade)" />
    {/* vent band under the eaves */}
    <Vents x={590} y={462} groups={6} gap={92} />
    {/* upper floor: a thin canopy slab, five tall windows between pilasters */}
    <rect x={566} y={484} width={410} height={10} fill="#FFFFFF" />
    <rect x={566} y={494} width={410} height={7} fill="#5A4A3A" opacity={0.3} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={582 + i * 76} y={501} width={16} height={130} fill="#EFE6D3" />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x={610 + i * 76} y={512} width={36} height={112} fill="#1F1A14" />
        <rect x={610 + i * 76} y={512} width={36} height={112} fill="none" stroke="#3A2E22" strokeWidth={3} />
        <path d={`M ${628 + i * 76} 512 L ${628 + i * 76} 624 M ${610 + i * 76} 548 L ${646 + i * 76} 548`} stroke="#5E4A36" strokeWidth={2.5} />
        <path d={`M ${612 + i * 76} 514 L ${626 + i * 76} 514 L ${614 + i * 76} 546 Z`} fill="#9CB8C4" opacity={0.35} />
      </g>
    ))}
    <rect x={548} y={636} width={648} height={8} fill="#D5C9B0" />
    {/* ground floor: three shuttered doors */}
    {Array.from({ length: 3 }, (_, i) => (
      <g key={i}>
        <rect x={624 + i * 96} y={668} width={62} height={112} fill="#1F1712" />
        {Array.from({ length: 9 }, (_, r) => (
          <rect key={r} x={628 + i * 96} y={674 + r * 12} width={54} height={3} fill="#4A3A2C" />
        ))}
        <rect x={654 + i * 96} y={668} width={3} height={112} fill="#0F0B08" />
        <rect x={618 + i * 96} y={660} width={74} height={8} fill="#EFE6D3" />
      </g>
    ))}
    <rect x={548} y={780} width={648} height={20} fill="#C9BEA6" />

    {/* the gate: a projecting porch with a curved, scrolled gable carrying the school's name */}
    <rect x={978} y={592} width={196} height={208} fill="#FBF6EA" />
    <rect x={1150} y={592} width={24} height={208} fill="#D5C9B0" />
    <path d="M 968 600 L 968 578 Q 968 566 982 562 Q 1010 486 1076 480 Q 1142 486 1170 562 Q 1184 566 1184 578 L 1184 600 Z" fill="#FBF6EA" />
    <path d="M 982 562 Q 1010 486 1076 480 Q 1142 486 1170 562" fill="none" stroke="#C9BEA6" strokeWidth={5} />
    <path d="M 994 566 Q 1018 500 1076 494 Q 1134 500 1158 566" fill="none" stroke="#D5C9B0" strokeWidth={2} />
    {[978, 1174].map((x) => (
      <g key={x}>
        <circle cx={x} cy={580} r={13} fill="#EFE6D3" stroke="#B9AD94" strokeWidth={3} />
        <circle cx={x} cy={580} r={5} fill="none" stroke="#B9AD94" strokeWidth={2.5} />
      </g>
    ))}
    <rect x={1056} y={504} width={40} height={18} rx={3} fill="#3A2E22" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={1061 + i * 9} y={507} width={4} height={12} fill="#EFE6D3" opacity={0.7} />
    ))}
    {plate ?? (
      <>
        <text x={1076} y={546} textAnchor="middle" fontFamily={f.disp} fontSize={16} fontWeight={700} letterSpacing={2.4} fill="#2A2018">NED-INDISCHE</text>
        <text x={1076} y={566} textAnchor="middle" fontFamily={f.disp} fontSize={16} fontWeight={700} letterSpacing={2} fill="#2A2018">ARTSENSCHOOL</text>
      </>
    )}
    <rect x={968} y={598} width={216} height={8} fill="#D5C9B0" />
    <path d="M 1030 800 L 1030 690 Q 1030 644 1076 640 Q 1122 644 1122 690 L 1122 800 Z" fill="url(#un-arch)" />
    <path d="M 1030 800 L 1030 690 Q 1030 644 1076 640 Q 1122 644 1122 690 L 1122 800" fill="none" stroke="#C9BEA6" strokeWidth={5} />
    <rect x={1066} y={716} width={20} height={84} fill="#3A2E22" opacity={0.7} />
    <rect x={978} y={786} width={196} height={14} fill="#C9BEA6" />
  </g>
);

export const NiasShot: React.FC<{ t: number; f: F; dur: number }> = ({ t, f, dur }) => {
  const R = rng(5);
  const shrubs = Array.from({ length: 9 }, (_, i) => ({ x: 120 + i * 62 + R() * 30, y: 838 + R() * 24, r: 34 + R() * 26, seed: 20 + i }));
  const z = lerp(1.0, 1.16, prog(t, 0, dur, inOut));
  const cx = lerp(960, 1010, prog(t, 0, dur, inOut));
  const cy = lerp(540, 590, prog(t, 0, dur, inOut));
  // three students and a teacher walk up the drive toward the gate, shrinking with distance
  const walk = (start: number, x0: number) => {
    const p = prog(t, start, start + 1150, (x) => x);
    // each one walks through the arch and is gone: fade over the last stretch so nobody piles up at the door
    return { x: lerp(x0, 1076, p), y: lerp(1060, 812, p), s: lerp(1.9, 0.62, Math.pow(p, 0.8)), o: 1 - prog(p, 0.9, 1, (x) => x) };
  };
  const ws = [walk(-470, 760), walk(-250, 860), walk(-40, 690), walk(-700, 930)];
  return (
    <g transform={`translate(960 540) scale(${z.toFixed(4)}) translate(${n1(-cx)} ${n1(-cy)})`}>
      <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#un-sky)" />
      <circle cx={1560} cy={250} r={300} fill="#FFF3D0" opacity={0.5} filter="url(#un-soft)" />
      <Cloud x={300 + t * 0.09} y={190} s={1.5} opacity={0.85} />
      <Cloud x={1250 + t * 0.06} y={120} s={1.1} opacity={0.7} />
      <Cloud x={1700 + t * 0.12} y={300} s={0.8} opacity={0.6} />
      {/* far trees behind the wings */}
      <Foliage x={40} y={520} r={150} seed={3} t={t} dark="#4E6A3C" light="#6F8A52" n={18} />
      <Foliage x={1880} y={380} r={130} seed={4} t={t} dark="#4E6A3C" light="#6F8A52" n={16} />
      <rect x={-200} y={GROUND} width={W + 400} height={500} fill="url(#un-lawn)" />
      <NiasBuilding f={f} />
      {/* shadow the building throws on the ground */}
      <path d={`M 80 ${GROUND} L 1990 ${GROUND} L 1990 ${GROUND + 26} L 60 ${GROUND + 34} Z`} fill="#2A2018" opacity={0.28} />
      {/* the curved drive with a stone kerb, sweeping from the lower left up to the gate */}
      <path d="M 1010 802 L 1150 802 C 1300 860, 1400 960, 1440 1300 L 300 1300 C 420 1040, 700 860, 1010 802 Z" fill="url(#un-drive)" />
      <path d="M 1010 802 C 700 860, 420 1040, 300 1300" fill="none" stroke="#F4EBD0" strokeWidth={7} />
      <path d="M 1150 802 C 1300 860, 1400 960, 1440 1300" fill="none" stroke="#F4EBD0" strokeWidth={7} />
      <path d="M 1010 806 C 704 864, 426 1044, 306 1300" fill="none" stroke="#8A7A58" strokeWidth={2} opacity={0.6} />
      {Array.from({ length: 40 }, (_, i) => (
        <ellipse key={i} cx={700 + ((i * 97) % 560)} cy={860 + ((i * 53) % 210)} rx={6 + (i % 4) * 3} ry={1.6} fill="#A8936A" opacity={0.35} />
      ))}
      {/* a low mound of sand on the drive, as in the 1925 photograph */}
      <path d="M 1196 874 Q 1250 836 1310 874 Z" fill="#B9A47A" />
      {/* shrubs along the left lawn, a young tree on the right */}
      {shrubs.map((s) => (
        <Foliage key={s.seed} x={s.x} y={s.y} r={s.r} seed={s.seed} t={t} dark="#3F5A2C" light="#5E7C40" n={9} />
      ))}
      <path d={`M 1620 ${GROUND + 70} C 1612 720, 1630 640, 1622 560`} fill="none" stroke="#5E4A36" strokeWidth={9} strokeLinecap="round" />
      <path d="M 1622 640 L 1580 590 M 1624 610 L 1672 560" stroke="#5E4A36" strokeWidth={5} strokeLinecap="round" />
      <Foliage x={1622} y={520} r={86} seed={9} t={t} dark="#4A6A34" light="#7A9A54" n={16} />
      <Foliage x={1570} y={590} r={44} seed={10} t={t} dark="#4A6A34" light="#7A9A54" n={8} />
      <Foliage x={1690} y={566} r={48} seed={11} t={t} dark="#4A6A34" light="#7A9A54" n={8} />
      {/* people: furthest first */}
      {ws
        .map((w, i) => ({ ...w, i }))
        .sort((a, b) => a.y - b.y)
        .map((w) => (
          <g key={w.i} opacity={w.o}>
            <Student x={w.x} y={w.y} s={w.s} t={t} ph={w.i * 1.7} hat={w.i === 3} book={w.i !== 3} />
          </g>
        ))}
      {/* dark foliage close to the lens frames the left edge */}
      <Foliage x={-40} y={760} r={230} seed={12} t={t} dark="#22331A" light="#2E4424" n={20} />
      <Foliage x={170} y={990} r={170} seed={13} t={t} dark="#1C2B16" light="#2A3E20" n={14} />
    </g>
  );
};

