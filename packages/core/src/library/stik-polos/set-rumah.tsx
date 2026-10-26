import React from 'react';
import { C, CURB, ColdLines, Limb } from '../../styles/stik-polos/kit';

// Street for "Rumah", left to right on one curb (y = 800):
//   kos 0–360 · lamp 390 · KPR house 420–860 · lamp 890 · mansion 920–1560 · lamp 1590 · rumah petak 1612–1908

const R = {
  wallKos: '#2C313A',
  roomKos: '#3B4250',
  wallKpr: '#3A3D44',
  roof: '#4B3A34',
  roomKpr: '#4A4540',
  wallMansion: '#30343C',
  roomMansion: '#4D5560',
  wallPetak: '#3B3732',
  seng: '#5A5F66',
  wood: '#6B5340',
  door: '#3B2F26',
  hedge: '#1E2A26',
  cloth: '#E3E3E0',
  mat: '#B5523A',
};

const Sheen: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g opacity={0.1} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round">
    <line x1={x + w * 0.55} y1={y + 10} x2={x + w * 0.35} y2={y + h * 0.45} />
    <line x1={x + w * 0.68} y1={y + 10} x2={x + w * 0.5} y2={y + h * 0.35} />
  </g>
);

/** Window frame drawn over an interior. */
const Frame: React.FC<{ x: number; y: number; w: number; h: number; mullions?: number[] }> = ({ x, y, w, h, mullions = [] }) => (
  <g>
    <Sheen x={x} y={y} w={w} h={h} />
    {mullions.map((m) => (
      <line key={m} x1={m} y1={y} x2={m} y2={y + h} stroke={C.out} strokeWidth={4} />
    ))}
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.out} strokeWidth={5} />
    <rect x={x - 8} y={y + h} width={w + 16} height={10} fill="#3A404A" stroke={C.out} strokeWidth={3} />
  </g>
);

// ─────────────────────────── 1. kos ───────────────────────────
export const KosRoom: React.FC<{ frame: number }> = ({ frame }) => {
  const bob = Math.sin(frame * 0.4) * 1;
  // a drip falls from the stain into the bucket every 24 frames
  const t = (frame % 24) / 24;
  const dropY = 468 + t * t * 172;
  const splash = frame % 24 < 4 ? (frame % 24) / 4 : -1;
  const dropOp = Math.min(1, t * 10);
  return (
    <g>
      <defs>
        <clipPath id="kosClip">
          <rect x={30} y={450} width={300} height={250} />
        </clipPath>
      </defs>
      <g clipPath="url(#kosClip)">
        <rect x={30} y={450} width={300} height={250} fill={R.roomKos} />
        <rect x={30} y={682} width={300} height={18} fill="#2A2F38" />
        <ellipse cx={270} cy={456} rx={34} ry={9} fill="#2C323C" />
        <path d="M30 486 Q120 504 220 484" stroke="#9AA2AD" strokeWidth={2} fill="none" />
        <path d="M66 490 h28 l6 10 -8 4 v26 h-24 v-26 l-8 -4 z" fill="#6A7F95" stroke={C.out} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M150 497 h26 l6 10 -8 4 v22 h-22 v-22 l-8 -4 z" fill="#8A7D6B" stroke={C.out} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={214} y={530} width={40} height={52} fill="#6B5A7A" stroke={C.out} strokeWidth={2.5} />
        {/* laptop light */}
        <circle cx={172} cy={632} r={70} fill="#9FC4FF" opacity={0.12} />
        <rect x={44} y={662} width={154} height={22} rx={6} fill="#8090A8" stroke={C.out} strokeWidth={3} />
        <rect x={50} y={650} width={40} height={15} rx={6} fill="#C9CFD8" stroke={C.out} strokeWidth={2.5} />
        <g transform={`translate(0 ${bob})`}>
          <Limb d="M128 658 L98 666 L142 670" w={11} c={C.body} />
          <Limb d="M132 622 L128 658" w={14} c={C.body} />
          <Limb d="M131 632 L152 650" w={9} c={C.body} />
          <circle cx={133} cy={600} r={22} fill={C.head} stroke={C.out} strokeWidth={3.5} />
        </g>
        <path d="M168 654 L176 622 L184 624 L176 656 Z" fill="#CFE3FF" stroke={C.out} strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={140} y1={655} x2={178} y2={655} stroke={C.out} strokeWidth={5} strokeLinecap="round" />
        {/* bucket + drip */}
        <path d="M246 640 L294 640 L288 682 L252 682 Z" fill="#4F6F8A" stroke={C.out} strokeWidth={3} strokeLinejoin="round" />
        <ellipse cx={270} cy={642} rx={21} ry={4} fill="#7E9BB4" />
        <path d={`M270 ${dropY - 7} Q275 ${dropY} 270 ${dropY + 3} Q265 ${dropY} 270 ${dropY - 7} Z`} fill="#A9C2D8" opacity={dropOp} />
        {splash >= 0 && (
          <g stroke="#A9C2D8" strokeWidth={2} strokeLinecap="round" opacity={Math.sin(Math.PI * splash)}>
            <line x1={262} y1={636} x2={256 - splash * 4} y2={628 - splash * 6} />
            <line x1={278} y1={636} x2={284 + splash * 4} y2={628 - splash * 6} />
          </g>
        )}
      </g>
      <ColdLines x={133} y={562 + bob} frame={frame} />
      <Frame x={30} y={450} w={300} h={250} />
    </g>
  );
};

export const Kos: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <g stroke={C.out} strokeWidth={4}>
      <line x1={256} y1={336} x2={256} y2={370} />
      <line x1={294} y1={336} x2={294} y2={370} />
    </g>
    <rect x={238} y={292} width={74} height={50} rx={18} fill="#6B7A86" stroke={C.out} strokeWidth={4} />
    <line x1={242} y1={312} x2={308} y2={312} stroke={C.out} strokeWidth={2} opacity={0.5} />
    <rect x={10} y={378} width={340} height={422} fill={R.wallKos} stroke={C.out} strokeWidth={4} />
    <rect x={0} y={366} width={360} height={16} fill="#3A3F48" stroke={C.out} strokeWidth={4} />
    <path d="M300 382 q8 40 -4 70 M60 720 q-6 30 4 60" stroke="#262A31" strokeWidth={10} fill="none" strokeLinecap="round" />
    <KosRoom frame={frame} />
    <rect x={40} y={728} width={100} height={52} rx={3} fill={C.winDark} stroke={C.out} strokeWidth={3} />
    <rect x={228} y={716} width={72} height={84} fill={R.door} stroke={C.out} strokeWidth={4} />
    <circle cx={288} cy={760} r={4} fill={C.hub} />
  </g>
);

// ─────────────────────────── 2. KPR house ───────────────────────────
export const KprRoom: React.FC<{ frame: number }> = ({ frame }) => {
  const sway = Math.sin(frame * 0.07) * 2.5;
  const shake = Math.sin(frame * 0.9) * 0.8;
  return (
    <g>
      <defs>
        <clipPath id="kprClip">
          <rect x={470} y={585} width={250} height={180} />
        </clipPath>
      </defs>
      <g clipPath="url(#kprClip)">
        <rect x={470} y={585} width={250} height={180} fill={R.roomKpr} />
        <circle cx={600 + sway} cy={632} r={80} fill="#FFD98A" opacity={0.13} />
        <rect x={680} y={606} width={30} height={36} fill="#E6E2D8" stroke={C.out} strokeWidth={2} />
        <rect x={680} y={606} width={30} height={9} fill="#D04A3A" stroke={C.out} strokeWidth={2} />
        <g transform={`rotate(${sway} 600 585)`}>
          <line x1={600} y1={585} x2={600} y2={612} stroke={C.out} strokeWidth={3} />
          <path d="M586 626 L600 610 L614 626 Z" fill="#6D6457" stroke={C.out} strokeWidth={2.5} strokeLinejoin="round" />
          <circle cx={600} cy={628} r={5} fill="#FFE7A8" />
        </g>
        <line x1={544} y1={696} x2={544} y2={765} stroke={C.out} strokeWidth={6} strokeLinecap="round" />
        <g transform={`translate(${shake} 0)`}>
          <Limb d="M562 730 L594 736 L594 765" w={12} c={C.body} />
          <Limb d="M566 688 L561 731" w={15} c={C.body} />
          <Limb d="M564 696 Q540 682 552 652" w={9} c={C.body} />
          <Limb d="M570 696 Q592 684 580 654" w={9} c={C.body} />
          <circle cx={566} cy={664} r={22} fill={C.head} stroke={C.out} strokeWidth={3.5} />
        </g>
        <rect x={520} y={712} width={176} height={10} fill={R.wood} stroke={C.out} strokeWidth={3} />
        <line x1={532} y1={722} x2={532} y2={765} stroke={C.out} strokeWidth={5} />
        <line x1={684} y1={722} x2={684} y2={765} stroke={C.out} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={604 + i * 2} y={702 - i * 4} width={42} height={5} fill="#ECEAE3" stroke={C.out} strokeWidth={1.5} />
        ))}
        <rect x={656} y={700} width={22} height={12} rx={2} fill="#59606B" stroke={C.out} strokeWidth={2} />
      </g>
      <ColdLines x={566} y={626} frame={frame} />
      <Frame x={470} y={585} w={250} h={180} />
    </g>
  );
};

export const KprHouse: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={440} y={540} width={400} height={260} fill={R.wallKpr} stroke={C.out} strokeWidth={4} />
    <path d="M418 552 L640 398 L862 552 Z" fill={R.roof} stroke={C.out} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={640 - (i + 1) * 46} y1={430 + i * 32} x2={640 + (i + 1) * 46} y2={430 + i * 32} stroke={C.out} strokeWidth={2} opacity={0.35} />
    ))}
    <rect x={620} y={470} width={40} height={40} rx={20} fill="#2E2A28" stroke={C.out} strokeWidth={3} />
    <KprRoom frame={frame} />
    <rect x={752} y={650} width={66} height={150} fill={R.door} stroke={C.out} strokeWidth={4} />
    <circle cx={806} cy={726} r={4} fill={C.hub} />
    <rect x={744} y={792} width={82} height={8} fill="#4A4F57" stroke={C.out} strokeWidth={2} />
  </g>
);

// ─────────────────────────── 3. mansion ───────────────────────────
export const MansionRoom: React.FC<{ frame: number }> = ({ frame }) => {
  const flick = 0.85 + 0.15 * Math.sin(frame * 0.6) * Math.sin(frame * 0.23);
  const bob = Math.sin(frame * 0.35) * 0.8;
  return (
    <g>
      <defs>
        <clipPath id="mansionClip">
          <rect x={990} y={575} width={360} height={195} />
        </clipPath>
      </defs>
      <g clipPath="url(#mansionClip)">
        <rect x={990} y={575} width={360} height={195} fill={R.roomMansion} />
        <rect x={990} y={740} width={360} height={30} fill="#3F464F" />
        <circle cx={1170} cy={612} r={110} fill="#E8F0FF" opacity={0.08} />
        <rect x={1022} y={612} width={72} height={50} fill="#4B5A52" stroke="#A08A55" strokeWidth={4} />
        <path d="M1030 652 L1050 632 L1064 646 L1076 636 L1088 652 Z" fill="#6A7B6C" />
        <line x1={1170} y1={575} x2={1170} y2={598} stroke={C.out} strokeWidth={3} />
        <ellipse cx={1170} cy={604} rx={32} ry={8} fill="#C9B27A" stroke={C.out} strokeWidth={2.5} />
        {[-24, -12, 0, 12, 24].map((d) => (
          <circle key={d} cx={1170 + d} cy={616} r={3.5} fill="#F4F0E2" />
        ))}
        {[1040, 1085, 1130, 1175, 1220, 1262].map((x) => (
          <rect key={x} x={x} y={666} width={18} height={50} rx={8} fill="#5B4436" stroke={C.out} strokeWidth={2.5} />
        ))}
        <rect x={1018} y={712} width={304} height={12} fill={R.cloth} stroke={C.out} strokeWidth={3} />
        <rect x={1022} y={724} width={296} height={18} fill="#CFCFCB" stroke={C.out} strokeWidth={2} />
        {[1150, 1170, 1190].map((x, i) => (
          <g key={x}>
            <rect x={x - 2} y={694 + (i % 2) * 4} width={4} height={18 - (i % 2) * 4} fill="#EFE9D8" />
            <ellipse cx={x} cy={690 + (i % 2) * 4} rx={3} ry={5} fill="#FFC861" opacity={flick} />
          </g>
        ))}
        <ellipse cx={1276} cy={710} rx={15} ry={4} fill="#F4F4F2" stroke={C.out} strokeWidth={2} />
        <g transform={`translate(0 ${bob})`}>
          <Limb d="M1302 678 L1298 722" w={14} c={C.body} />
          <Limb d="M1299 690 L1280 706" w={9} c={C.body} />
          <circle cx={1303} cy={656} r={22} fill={C.head} stroke={C.out} strokeWidth={3.5} />
        </g>
      </g>
      <Frame x={990} y={575} w={360} h={195} mullions={[1110, 1230]} />
    </g>
  );
};

export const Mansion: React.FC<{ frame: number }> = ({ frame }) => {
  const arch = (x: number) => `M${x} 530 L${x} 450 A40 40 0 0 1 ${x + 80} 450 L${x + 80} 530 Z`;
  return (
    <g>
      <rect x={960} y={334} width={560} height={28} fill="#2B2F36" stroke={C.out} strokeWidth={3} />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={976 + i * 39} y={338} width={10} height={22} rx={4} fill="#3D424B" />
      ))}
      <rect x={940} y={380} width={600} height={420} fill={R.wallMansion} stroke={C.out} strokeWidth={4} />
      <rect x={925} y={358} width={630} height={24} fill="#3D424B" stroke={C.out} strokeWidth={4} />
      <rect x={940} y={548} width={600} height={10} fill="#3D424B" stroke={C.out} strokeWidth={3} />
      {[975, 1085, 1195, 1305, 1415].map((x) => (
        <g key={x}>
          <path d={arch(x)} fill="#252A32" stroke={C.out} strokeWidth={3.5} />
          <line x1={x + 40} y1={412} x2={x + 40} y2={530} stroke={C.out} strokeWidth={2.5} opacity={0.7} />
        </g>
      ))}
      <MansionRoom frame={frame} />
      {/* portico */}
      <path d="M1368 600 L1450 562 L1532 600 Z" fill="#3D424B" stroke={C.out} strokeWidth={3.5} strokeLinejoin="round" />
      <rect x={1388} y={600} width={18} height={200} fill="#C9CDD2" stroke={C.out} strokeWidth={3} />
      <rect x={1494} y={600} width={18} height={200} fill="#C9CDD2" stroke={C.out} strokeWidth={3} />
      <rect x={1420} y={658} width={60} height={142} fill={R.door} stroke={C.out} strokeWidth={4} />
      <line x1={1450} y1={658} x2={1450} y2={800} stroke={C.out} strokeWidth={2.5} />
      {/* hedges + iron fence */}
      <path d="M940 800 Q950 768 980 772 Q1000 756 1024 774 Q1046 768 1050 800 Z" fill={R.hedge} stroke={C.out} strokeWidth={3} />
      <path d="M1356 800 Q1360 776 1372 778 L1372 800 Z" fill={R.hedge} stroke={C.out} strokeWidth={3} />
      <g stroke="#1A1E24" strokeWidth={3}>
        <line x1={930} y1={768} x2={1380} y2={768} />
        <line x1={1520} y1={768} x2={1552} y2={768} />
        {Array.from({ length: 23 }).map((_, i) => (
          <line key={i} x1={934 + i * 20} y1={760} x2={934 + i * 20} y2={800} />
        ))}
        <line x1={1530} y1={760} x2={1530} y2={800} />
        <line x1={1548} y1={760} x2={1548} y2={800} />
      </g>
    </g>
  );
};

// ─────────────────────────── 4. rumah petak ───────────────────────────
export const PetakRoom: React.FC<{ frame: number }> = ({ frame }) => {
  // four people laughing, each on their own rhythm
  const b = (ph: number, a = 2.4) => Math.abs(Math.sin(frame * 0.32 + ph)) * -a;
  const tilt = (ph: number) => Math.sin(frame * 0.32 + ph) * 6;
  const person = ({ x, y, r, ph, legs = true }: { x: number; y: number; r: number; ph: number; legs?: boolean }) => (
    <g transform={`translate(0 ${b(ph)})`}>
      {legs && <Limb d={`M${x} ${y + r + 34} L${x + (x < 1743 ? 18 : -18)} ${y + r + 40}`} w={r * 0.6} c={C.body} />}
      <Limb d={`M${x} ${y + r + 2} L${x} ${y + r + 34}`} w={r * 0.75} c={C.body} />
      <g transform={`rotate(${tilt(ph)} ${x} ${y + r})`}>
        <circle cx={x} cy={y} r={r} fill={C.head} stroke={C.out} strokeWidth={3} />
      </g>
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id="petakWarm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4C46C" />
          <stop offset="1" stopColor="#C98634" />
        </linearGradient>
        <clipPath id="petakClip">
          <rect x={1648} y={640} width={190} height={135} />
        </clipPath>
      </defs>
      <g clipPath="url(#petakClip)">
        <rect x={1648} y={640} width={190} height={135} fill="url(#petakWarm)" />
        <circle cx={1743} cy={656} r={60} fill="#FFF3B0" opacity={0.35} />
        <line x1={1743} y1={640} x2={1743} y2={650} stroke={C.out} strokeWidth={2.5} />
        <circle cx={1743} cy={655} r={6} fill="#FFFBE0" stroke={C.out} strokeWidth={2} />
        <rect x={1796} y={660} width={30} height={22} rx={3} fill="#7A5A3A" stroke={C.out} strokeWidth={2} />
        {person({ x: 1676, y: 700, r: 17, ph: 0 })}
        {person({ x: 1810, y: 702, r: 16, ph: 1.3 })}
        {person({ x: 1720, y: 724, r: 12, ph: 2.1, legs: false })}
        {person({ x: 1767, y: 726, r: 12, ph: 0.7, legs: false })}
        <rect x={1656} y={758} width={174} height={10} fill={R.mat} stroke={C.out} strokeWidth={2.5} />
        <path d="M1730 758 Q1730 740 1743 738 Q1756 740 1756 758 Z" fill="#D9D2C2" stroke={C.out} strokeWidth={2.5} />
        <ellipse cx={1700} cy={757} rx={10} ry={3} fill="#F4F1EA" stroke={C.out} strokeWidth={1.5} />
        <ellipse cx={1786} cy={757} rx={10} ry={3} fill="#F4F1EA" stroke={C.out} strokeWidth={1.5} />
      </g>
      <Frame x={1648} y={640} w={190} h={135} />
    </g>
  );
};

export const Petak: React.FC<{ frame: number; glow: number }> = ({ frame, glow }) => {
  const pulse = 0.9 + 0.1 * Math.sin(frame * 0.15);
  return (
    <g>
      <rect x={1630} y={612} width={260} height={188} fill={R.wallPetak} stroke={C.out} strokeWidth={4} />
      <path d="M1612 620 L1902 584 L1910 598 L1620 634 Z" fill={R.seng} stroke={C.out} strokeWidth={4} strokeLinejoin="round" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={1640 + i * 30} y1={618 - i * 3.7} x2={1644 + i * 30} y2={630 - i * 3.7} stroke={C.out} strokeWidth={2} opacity={0.4} />
      ))}
      {/* warm light spilling out */}
      <ellipse cx={1743} cy={708} rx={250} ry={190} fill="url(#halo)" opacity={(0.35 + 0.55 * glow) * pulse} />
      <PetakRoom frame={frame} />
      <rect x={1850} y={690} width={34} height={110} fill={R.door} stroke={C.out} strokeWidth={3.5} />
      <path d="M1640 800 L1644 780 L1664 780 L1668 800 Z" fill="#7A5A44" stroke={C.out} strokeWidth={2.5} />
      <path d="M1654 780 Q1644 760 1650 750 M1654 780 Q1660 758 1672 754 M1654 780 Q1652 764 1660 746" stroke="#3E5A44" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ─────────────────────────── street lamp ───────────────────────────
export const Lamp: React.FC<{ x: number; frame: number }> = ({ x, frame }) => {
  const f = 0.92 + 0.08 * Math.sin(frame * 0.5 + x);
  return (
    <g>
      <path d={`M${x + 34} 478 L${x - 30} ${CURB} L${x + 98} ${CURB} Z`} fill="#FFD27A" opacity={0.05 * f} />
      <circle cx={x + 34} cy={480} r={46} fill="url(#halo)" opacity={0.45 * f} />
      <rect x={x - 4} y={470} width={8} height={CURB - 470} fill="#2F343C" stroke={C.out} strokeWidth={2} />
      <path d={`M${x} 474 Q${x} 458 ${x + 22} 460 L${x + 40} 462`} stroke={C.out} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M${x + 22} 462 L${x + 46} 462 L${x + 42} 474 L${x + 26} 474 Z`} fill="#3A3F48" stroke={C.out} strokeWidth={2.5} strokeLinejoin="round" />
      <ellipse cx={x + 34} cy={476} rx={7} ry={3} fill="#FFE7A8" />
    </g>
  );
};
