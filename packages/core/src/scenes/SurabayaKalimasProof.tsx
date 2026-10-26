import React from 'react';
import { Film, type Shot, filmFrames } from './film';
import { inOut, prog } from './motion';

const DUR = 660;
const seed = (n: number) => {
  const x = Math.sin(n * 127.1 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const KalimasProofDefs: React.FC = () => (
  <defs>
    <linearGradient id="sb-sky" x2="0" y2="1">
      <stop stopColor="#d2c7aa" />
      <stop offset="0.65" stopColor="#e5d8b8" />
      <stop offset="1" stopColor="#c6b28f" />
    </linearGradient>
    <linearGradient id="sb-river" x2="0" y2="1">
      <stop stopColor="#8c8c77" />
      <stop offset="0.48" stopColor="#aaa38b" />
      <stop offset="1" stopColor="#665e4e" />
    </linearGradient>
    <linearGradient id="sb-street" x2="0" y2="1">
      <stop stopColor="#9b8d75" />
      <stop offset="1" stopColor="#574d40" />
    </linearGradient>
    <linearGradient id="sb-wall" x2="0" y2="1">
      <stop stopColor="#f0e4c9" />
      <stop offset="0.68" stopColor="#c9baa0" />
      <stop offset="1" stopColor="#a3957d" />
    </linearGradient>
    <linearGradient id="sb-roof" x2="0" y2="1">
      <stop stopColor="#756b5d" />
      <stop offset="1" stopColor="#3e3c38" />
    </linearGradient>
    <linearGradient id="sb-canopy" x2="0" y2="1">
      <stop stopColor="#746e5e" />
      <stop offset="1" stopColor="#403f38" />
    </linearGradient>
    <pattern id="sb-rooflines" width="23" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 19 H23 M10 0 V19" stroke="#d0c2a8" strokeOpacity=".17" strokeWidth="1.5" />
    </pattern>
  </defs>
);

const Person: React.FC<{ x: number; y: number; s: number; shade?: string }> = ({ x, y, s, shade = '#3e3e38' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="3" rx="12" ry="3" fill="#38352d" opacity=".3" />
    <path d="M-3-3 L-5-20 L-1-21 L1-5 M3-3 L5-20 L1-21 L-1-5" fill="none" stroke={shade} strokeWidth="3" strokeLinecap="round" />
    <path d="M-5-22 L-7-37 Q0-42 7-37 L5-22Z" fill={shade} />
    <path d="M-4-36 Q0-38 4-36 L3-22 H-3Z" fill="#b6a589" opacity=".55" />
    <path d="M-6-35 L-11-24 M6-35 L11-23" fill="none" stroke={shade} strokeWidth="3" strokeLinecap="round" />
    <ellipse cy="-44" rx="5.5" ry="6.5" fill="#665a4a" />
    <path d="M-7-48 Q0-53 7-48Z" fill="#484239" />
    <path d="M-10-48 H10" stroke="#373a34" strokeWidth="2" />
  </g>
);

const DockWorker: React.FC<{ x: number; y: number; s: number; pose: 'carry' | 'rope' | 'walk' }> = ({ x, y, s, pose }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="5" cy="4" rx="28" ry="7" fill="#2e332f" opacity=".34" />
    <path d="M-10-4 L-12-40 L-1-40 L-1-5 M5-5 L5-39 L15-38 L17-4" fill="#3e423a" stroke="#2c302d" strokeWidth="2" />
    <path d="M-12-6 l12 1 M5-5 l13 1" stroke="#c6b492" strokeWidth="4" />
    <path d="M-13-37 L-17-75 Q1-83 20-73 L17-38Z" fill={pose === 'rope' ? '#a29072' : '#6a725d'} stroke="#3b4037" strokeWidth="2.5" />
    <path d="M-11-70 Q1-76 14-70 M-14-42 H17" stroke="#d3c09d" strokeWidth="3" opacity=".72" />
    <path d="M-17-75 Q-25-69-26-51 M19-73 Q28-64 25-51" fill="none" stroke="#73634b" strokeWidth="7" strokeLinecap="round" />
    <path d={pose === 'carry' ? 'M-26-52 L-34-70 M25-51 L32-72' : pose === 'rope' ? 'M-26-51 L-7-60 M25-51 L40-63' : 'M-26-51 L-23-37 M25-51 L30-38'} fill="none" stroke="#8c7554" strokeWidth="4.5" strokeLinecap="round" />
    <ellipse cx="2" cy="-91" rx="10" ry="13" fill="#9b8160" stroke="#66583f" strokeWidth="2" />
    <path d="M-12-99 Q2-111 16-98 L14-94 H-11Z" fill="#48473c" />
    <path d="M-20-96 H22" stroke="#44453d" strokeWidth="4" />
    {pose === 'carry' && <g>
      <path d="M-40-101 H41 V-76 H-40Z" fill="#a99268" stroke="#4b483c" strokeWidth="3" />
      <path d="M-40-89 H41 M0-101 V-76" stroke="#695b43" strokeWidth="2" />
      <path d="M-34-76 L-32-71 M32-76 L30-71" stroke="#6c5c43" strokeWidth="3" />
    </g>}
    {pose === 'rope' && <path d="M38-63 Q70-63 93-44" fill="none" stroke="#c9b895" strokeWidth="3" />}
  </g>
);

const Boat: React.FC<{ x: number; y: number; s: number; phase: number; cover?: boolean }> = ({ x, y, s, phase, cover = true }) => (
  <g transform={`translate(${x} ${y + Math.sin(phase) * 2}) scale(${s})`}>
    <ellipse cx="0" cy="54" rx="113" ry="17" fill="#423e35" opacity=".2" />
    <path d="M-101 3 Q0 18 101 3 L72 48 Q0 75-72 48Z" fill="#373731" stroke="#232923" strokeWidth="4" />
    <path d="M-85 10 Q0 31 85 10 L65 40 Q0 60-65 40Z" fill="#666052" />
    <path d="M-79 31 Q0 56 79 31 M-69 42 Q0 65 68 43" fill="none" stroke="#c6b596" strokeWidth="2" opacity=".68" />
    <path d="M-98 3 Q0 17 98 3" fill="none" stroke="#dec8a1" strokeWidth="4" />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-66 + i * 22} ${18 + Math.sin(i / 6 * Math.PI) * 11} l${(-66 + i * 22) * .08} ${24 - Math.sin(i / 6 * Math.PI) * 5}`} stroke="#3b392f" strokeWidth="2" opacity=".65" />)}
    {cover && <>
      <path d="M-75 3 L-4-62 L74 2 L58 9 L-4-48 L-59 9Z" fill="url(#sb-canopy)" stroke="#2e322d" strokeWidth="3" />
      <path d="M-4-62 L18-67 L95-3 L74 2Z" fill="#57554a" stroke="#2e322d" strokeWidth="3" />
      <path d="M-57 8 L-4-47 L58 8Z" fill="#252b27" />
      <path d="M-46 8 L-4-34 L46 8Z" fill="#5c5546" />
      <path d="M-4-60 L-4-48 M-74 4 L-59 9 M75 3 L58 9" stroke="#d9c8a4" strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => <g key={i}>
        <path d={`M${-68 + i * 9} ${-3 - i * 7.5} L${-54 + i * 9} ${4 - i * 7.5}`} stroke="#bdb092" strokeWidth="3" opacity=".8" />
        <path d={`M${5 + i * 9} ${-54 + i * 8} l18 3`} stroke="#c0b093" strokeWidth="3" opacity=".68" />
      </g>)}
      <path d="M-64 7 L-64 20 M64 7 L64 20" stroke="#2d312b" strokeWidth="3" />
    </>}
    {!cover && <>
      <path d="M-34 3 Q0 13 34 3" fill="none" stroke="#b8a989" strokeWidth="3" />
      <rect x="-23" y="-10" width="22" height="15" fill="#89765b" stroke="#4c473c" strokeWidth="2" />
      <rect x="3" y="-8" width="25" height="13" fill="#ad9875" stroke="#4c473c" strokeWidth="2" />
    </>}
    <path d="M-96 0 L-129-10 M96 0 L126-13" stroke="#413d34" strokeWidth="2" />
    <path d="M-78 59 Q-5 75 78 58" fill="none" stroke="#dfd0aa" strokeWidth="2" opacity=".35" />
  </g>
);

const DockTree: React.FC<{ x: number; y: number; s: number; n: number }> = ({ x, y, s, n }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="10" cy="6" rx="125" ry="23" fill="#343b34" opacity=".2" />
    <path d="M-15 0 Q-10-70-24-175 M0-55 Q-52-148-114-180 M-1-72 Q64-140 104-204" stroke="#544e3e" strokeWidth="15" fill="none" strokeLinecap="round" />
    <path d="M-16 0 Q-5-80-12-167" stroke="#9b8d6c" strokeWidth="4" fill="none" />
    {Array.from({ length: n }, (_, i) => {
      const ang = seed(i + x) * Math.PI * 2;
      const rr = Math.sqrt(seed(i + y + 31));
      const cx = Math.cos(ang) * rr * 150;
      const cy = -185 + Math.sin(ang) * rr * 72;
      const r = 12 + seed(i + x + 99) * 32;
      return <g key={i}>
        <ellipse cx={cx + 5} cy={cy + 7} rx={r * 1.1} ry={r * .65} fill="#363e36" opacity=".5" />
        <ellipse cx={cx} cy={cy} rx={r} ry={r * .67} fill={i % 4 === 0 ? '#8c9072' : i % 3 === 0 ? '#576449' : '#687456'} opacity={.82 + seed(i + 22) * .16} />
        <path d={`M${cx - r * .5} ${cy - r * .15} q${r * .35} ${-r * .45} ${r * .8} ${-r * .2}`} fill="none" stroke="#b9b390" strokeWidth="2" opacity=".35" />
      </g>;
    })}
  </g>
);

const DockStall: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="10" rx="101" ry="24" fill="#36372f" opacity=".2" />
    <path d="M-77 0 V-71 M75 0 V-71 M0 0 V-100" stroke="#514b3f" strokeWidth="5" />
    <path d="M-96-71 L0-108 L94-71Z" fill="#d3c4a3" stroke="#534f43" strokeWidth="4" />
    <path d="M0-108 L94-71 L74-65 L0-89Z" fill="#8e8269" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-92 + i * 23}-70 l${i % 2 ? 6 : -6} 15 h20 l7-15`} fill={i % 2 ? '#9c896b' : '#e5d4ae'} stroke="#8b7b61" strokeWidth="1" />)}
    <Person x={-19} y={-19} s={1.1} shade="#545042" />
    <rect x="-67" y="-28" width="135" height="27" fill="#716752" stroke="#49483d" strokeWidth="3" />
    <path d="M-63-28 H64 M-55-3 V19 M55-3 V19" stroke="#c7b490" strokeWidth="3" />
    {Array.from({ length: 11 }, (_, i) => <g key={i}>
      <ellipse cx={-54 + i * 11} cy={-33 - seed(i + x) * 8} rx="6" ry="6" fill={i % 2 ? '#b09b74' : '#5c664e'} />
      <path d={`M${-54 + i * 11}-38 v-4`} stroke="#494d3c" strokeWidth="1" />
    </g>)}
    <path d="M-77-4 Q-85 3-75 11 H-54 Q-45 3-54-4Z M53-4 Q45 3 54 11 H75 Q85 3 77-4Z" fill="#aa9774" stroke="#5b5546" strokeWidth="2" />
  </g>
);

const Warehouse: React.FC<{ x: number; y: number; w: number; h: number; variant: number }> = ({ x, y, w, h, variant }) => {
  const d = w * 0.28;
  return <g>
    <path d={`M${x} ${y - h} L${x + w * .14} ${y - h - d * .55} L${x + w * 1.07} ${y - h - d * .45} L${x + w} ${y - h}Z`} fill="url(#sb-roof)" stroke="#504b42" strokeWidth="3" />
    <path d={`M${x} ${y - h} L${x + w * .14} ${y - h - d * .55} L${x + w * .29} ${y - h - d * .48} L${x + w * .24} ${y - h}Z`} fill="#9c9380" opacity=".5" />
    <path d={`M${x} ${y - h} H${x + w} V${y} H${x}Z`} fill="url(#sb-wall)" stroke="#9b8b73" strokeWidth="3" />
    <path d={`M${x + w * .8} ${y - h} L${x + w} ${y - h} V${y} H${x + w * .8}Z`} fill="#9d907b" opacity=".34" />
    <path d={`M${x} ${y - h * .52} H${x + w} M${x} ${y - h * .57} H${x + w}`} stroke="#927f66" strokeWidth="4" opacity=".6" />
    {Array.from({ length: variant === 0 ? 5 : 3 }, (_, i) => {
      const wx = x + w * (.08 + i * (variant === 0 ? .15 : .25));
      const ww = w * (variant === 0 ? .09 : .14);
      return <g key={i}>
        <rect x={wx} y={y - h * .84} width={ww} height={h * .25} fill="#625f55" />
        <rect x={wx + 4} y={y - h * .82} width={ww - 8} height={h * .22} fill="#929183" />
        <path d={`M${wx + ww / 2} ${y - h * .84} V${y - h * .59} M${wx} ${y - h * .72} H${wx + ww}`} stroke="#d9ccb1" strokeWidth="2" />
      </g>;
    })}
    {Array.from({ length: variant === 0 ? 4 : 3 }, (_, i) => {
      const dx = x + w * (.08 + i * (variant === 0 ? .2 : .27));
      const dw = w * .11;
      return <g key={i}>
        <path d={`M${dx} ${y} V${y - h * .37} Q${dx + dw / 2} ${y - h * .48} ${dx + dw} ${y - h * .37} V${y}Z`} fill="#645e50" />
        <path d={`M${dx + 5} ${y} V${y - h * .36} Q${dx + dw / 2} ${y - h * .44} ${dx + dw - 5} ${y - h * .36} V${y}Z`} fill="#343a36" />
        <path d={`M${dx - 6} ${y - h * .42} H${dx + dw + 6}`} stroke="#f4e8cc" strokeWidth="8" />
      </g>;
    })}
    <path d={`M${x} ${y - h} H${x + w} M${x} ${y - h * .5} H${x + w}`} stroke="#f6ecd8" strokeWidth="7" opacity=".68" />
  </g>;
};

export const Kalimas1911: React.FC<{ u: number; a: number }> = ({ u, a }) => {
  const pan = prog(u, 0, DUR, inOut);
  const text1 = prog(u, 110, 150) * (1 - prog(u, 405, 440, inOut));
  const text2 = prog(u, 425, 475);
  return <>
    <rect width="1920" height="1080" fill="url(#sb-sky)" />
    <g transform={`translate(${-36 * pan} ${6 * pan}) scale(${1 + .022 * pan})`}>
      {/* distant roofline, then the bridge where the canal disappears */}
      <path d="M1040 394 Q1200 350 1360 389 L1920 355 V532 H1000Z" fill="#9e9a82" opacity=".55" />
      {Array.from({ length: 8 }, (_, i) => {
        const x = 1310 + i * 92 + seed(i + 216) * 22;
        const y = 413 - i * 2.4;
        const w = 74 + seed(i + 17) * 50;
        const h = 31 + seed(i + 39) * 25;
        return <g key={i}>
          <path d={`M${x - 7} ${y - h} L${x + w * .23} ${y - h - 22 - seed(i + 6) * 12} L${x + w + 8} ${y - h + 2}Z`} fill={i % 3 === 0 ? '#65665c' : '#777568'} stroke="#5b5c51" strokeWidth="2" />
          <path d={`M${x} ${y - h} H${x + w} V${y + 18} H${x}Z`} fill={i % 2 ? '#bfb69e' : '#d3c8ae'} stroke="#908a75" strokeWidth="2" />
          {Array.from({ length: Math.max(2, Math.floor(w / 25)) }, (_, j) => <g key={j}>
            <rect x={x + 12 + j * 23} y={y - h + 10} width="9" height="15" fill="#62685f" />
            <path d={`M${x + 16 + j * 23} ${y - h + 10} v15`} stroke="#d9ccb0" strokeWidth="1.2" />
          </g>)}
          {i % 2 === 0 && <g>
            <path d={`M${x + w - 4} ${y + 12} v-36`} stroke="#5b604f" strokeWidth="4" />
            <circle cx={x + w - 5} cy={y - 30} r="15" fill="#747c62" />
            <circle cx={x + w + 7} cy={y - 25} r="12" fill="#596551" />
          </g>}
        </g>;
      })}
      <path d="M1240 432 Q1510 437 1920 452 L1920 485 Q1520 455 1240 450Z" fill="#625f53" />
      <path d="M1240 430 Q1510 435 1920 449" fill="none" stroke="#d7c8a8" strokeWidth="5" />
      {Array.from({ length: 19 }, (_, i) => <path key={i} d={`M${1260 + i * 36} ${433 + i * .8} v27`} stroke="#d7c8a8" strokeWidth="3" />)}
      {/* canal and its varying reflections */}
      <path d="M1278 457 L1920 470 V1080 H1432Z" fill="url(#sb-river)" />
      {Array.from({ length: 72 }, (_, i) => {
        const y = 490 + seed(i + 25) * 570;
        const x = 1350 + seed(i + 326) * 650;
        const w = 13 + seed(i + 456) * 110;
        return <path key={i} d={`M${x + Math.sin(a / 48 + i) * 2} ${y} q${w / 2} ${seed(i) * 5} ${w} 0`} fill="none" stroke={i % 3 === 0 ? '#e4d5b3' : '#4c5149'} strokeOpacity={.08 + seed(i + 1) * .19} strokeWidth={1 + seed(i + 5) * 3} />;
      })}
      {/* quay widens toward us; near paving and mooring edge */}
      <path d="M0 663 L1140 465 L1278 457 L1432 1080 H0Z" fill="url(#sb-street)" />
      <path d="M1258 462 L1435 1080" stroke="#3c403b" strokeWidth="25" opacity=".38" />
      <path d="M1265 462 L1440 1080" stroke="#d7c4a0" strokeWidth="9" />
      <path d="M1277 468 L1464 1080" stroke="#4d5045" strokeWidth="18" opacity=".74" />
      <path d="M1291 494 L1472 1080" stroke="#d9c6a0" strokeWidth="3" opacity=".66" />
      {Array.from({ length: 22 }, (_, i) => {
        const y = 492 + i * 26;
        const x = 1278 + (y - 462) * .28;
        return <g key={`bank-${i}`}>
          <path d={`M${x - 9} ${y} l31 7 M${x + 2} ${y + 2} l4 13`} stroke={i % 2 ? '#252f2d' : '#e8d3ab'} strokeWidth="2.5" opacity=".65" />
          <path d={`M${x - 17} ${y + 8} l18 4`} stroke="#4f4d42" strokeWidth="2" opacity=".5" />
        </g>;
      })}
      <path d="M1331 675 L1400 681 L1442 814 L1371 797Z" fill="#b3a182" stroke="#635b4b" strokeWidth="4" />
      {Array.from({ length: 5 }, (_, i) => <path key={`step-${i}`} d={`M${1339 + i * 8} ${696 + i * 25} l65 4`} stroke="#5e584a" strokeWidth="6" />)}
      <path d="M1383 794 L1504 804 L1504 824 L1387 814Z" fill="#5d5546" stroke="#3b3c34" strokeWidth="4" />
      {Array.from({ length: 5 }, (_, i) => <path key={`plank-${i}`} d={`M${1408 + i * 22} 797 v24`} stroke="#a89979" strokeWidth="3" />)}
      <path d="M1397 815 L1397 850 M1488 823 L1488 855" stroke="#3c3d35" strokeWidth="8" />
      {[660, 895, 1010].map((y, i) => {
        const x = 1280 + (y - 462) * .28;
        return <g key={`bollard-${i}`}>
          <ellipse cx={x - 10} cy={y + 3} rx="18" ry="6" fill="#2e322d" opacity=".45" />
          <path d={`M${x - 16} ${y} v-31 q10-8 21 0 v31Z`} fill="#4c4b40" stroke="#c3b293" strokeWidth="2" />
          <ellipse cx={x - 6} cy={y - 30} rx="12" ry="4" fill="#b6a786" />
        </g>;
      })}
      {Array.from({ length: 190 }, (_, i) => {
        const y = 540 + seed(i + 660) * 530;
        const right = 1275 + (y - 462) * .25;
        const x = 70 + seed(i + 960) * (right - 100);
        return <path key={i} d={`M${x} ${y} l${4 + (y - 540) * .035} ${seed(i + 121) * 3}`} stroke={i % 4 ? '#e0d0ad' : '#393d35'} strokeOpacity=".08" strokeWidth={1 + seed(i) * 2} />;
      })}
      {Array.from({ length: 29 }, (_, i) => {
        const y = 510 + i * 22;
        const x = 1275 + (y - 462) * .27;
        return <path key={i} d={`M${x - 15} ${y} l34 4`} stroke="#4a493f" strokeWidth={1 + i * .05} opacity=".35" />;
      })}
      {/* left warehouses: large foreground facade and progressively smaller blocks */}
      <Warehouse x={-122} y={635} w={840} h={415} variant={0} />
      <path d="M-152 221 L35 37 L456 70 L719 220Z" fill="url(#sb-roof)" stroke="#4b493f" strokeWidth="6" />
      <path d="M-152 221 L35 37 L456 70 L719 220Z" fill="url(#sb-rooflines)" />
      <path d="M-123 627 H708" stroke="#6d695d" strokeWidth="9" />
      <Warehouse x={665} y={544} w={272} h={295} variant={1} />
      <Warehouse x={925} y={499} w={155} h={195} variant={2} />
      <Warehouse x={1069} y={475} w={91} h={130} variant={2} />
      {/* slanting utility poles visible in the photograph */}
      <path d="M285 529 L370 111 M598 580 L667 245 M899 491 L966 310 M1150 474 L1163 337" stroke="#4c4b42" strokeWidth="4" opacity=".7" />
      <path d="M0 97 L780 402 M330 139 L1090 435" stroke="#4c4b42" strokeWidth="2" opacity=".45" />
      {/* foliage in the archival image hides part of the facades and breaks up the dock */}
      <DockTree x={1020} y={598} s={.46} n={33} />
      <DockTree x={777} y={674} s={.72} n={56} />
      <DockTree x={463} y={746} s={.85} n={66} />
      <DockStall x={1094} y={664} s={.74} />
      <DockStall x={988} y={758} s={1.04} />
      <DockStall x={824} y={885} s={1.55} />
      {/* cargo and carts on the dock */}
      {Array.from({ length: 39 }, (_, i) => {
        const x = 170 + seed(i + 11) * 1030;
        const y = 602 + seed(i + 140) * 385;
        const sc = .35 + (y - 600) / 560;
        return <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}>
          <rect x="-17" y="-21" width="34" height="22" fill={i % 3 ? '#776c59' : '#b3a083'} stroke="#5c5649" strokeWidth="2" />
          <path d="M-17-14 H17 M-4-21 V1" stroke="#3e403a" strokeOpacity=".38" strokeWidth="2" />
        </g>;
      })}
      <g transform="translate(600 790)"><ellipse rx="100" ry="19" fill="#45453d" opacity=".2" /><path d="M-68-34 H76 L64-6 H-57Z" fill="#4f4c42" /><path d="M-75-44 H83" stroke="#c4ad8b" strokeWidth="8" /><circle cx="-48" cy="5" r="17" fill="#383a34" /><circle cx="52" cy="5" r="17" fill="#383a34" /><circle cx="-48" cy="5" r="7" fill="#ab9d7f" /><circle cx="52" cy="5" r="7" fill="#ab9d7f" /></g>
      {/* figures are small, anonymous dock activity, not identified historical people */}
      {Array.from({ length: 36 }, (_, i) => {
        const y = 522 + seed(i + 57) * 410;
        const x = 240 + seed(i + 98) * (1365 - (y - 520) * .12);
        const s = .24 + (y - 500) / 630;
        return <Person key={i} x={x} y={y} s={s} shade={i % 4 === 0 ? '#706554' : '#3f4039'} />;
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const row = Math.floor(i / 10);
        const y = 635 + row * 100 + seed(i + 909) * 52;
        const x = 620 + (i % 10) * 55 + seed(i + 202) * 25;
        return <Person key={`crowd-${i}`} x={x} y={y} s={.45 + row * .16} shade={i % 5 === 0 ? '#796a56' : '#363d36'} />;
      })}
      <DockWorker x={1050} y={891} s={1.02} pose="carry" />
      <DockWorker x={1190} y={887} s={1.05} pose="walk" />
      <DockWorker x={1333} y={857} s={.9} pose="rope" />
      <g transform="translate(1175 970)">
        <path d="M-34-29 H28 V-2 H-34Z" fill="#a18c68" stroke="#4c473a" strokeWidth="4" />
        <path d="M-34-17 H28 M-1-29 V-2" stroke="#5e5647" strokeWidth="3" />
      </g>
      {/* tied boats form the crowded right edge from the archival photo */}
      <Boat x={1362} y={533} s={.41} phase={a / 34} />
      <Boat x={1418} y={569} s={.32} phase={a / 37 + 2} cover={false} />
      <Boat x={1508} y={557} s={.57} phase={a / 38 + 1} />
      <Boat x={1694} y={595} s={.72} phase={a / 41 + 2} />
      <Boat x={1812} y={699} s={1.03} phase={a / 44 + 1} />
      <Boat x={1572} y={758} s={1.29} phase={a / 49 + 2} />
      <Boat x={1718} y={809} s={.88} phase={a / 42 + 2} cover={false} />
      <Boat x={1775} y={938} s={1.76} phase={a / 53} />
      <Boat x={1532} y={971} s={1.36} phase={a / 43 + 3} cover={false} />
      <path d="M1374 657 Q1463 685 1544 750 M1440 895 Q1515 920 1595 956" fill="none" stroke="#d8c7a3" strokeWidth="3" opacity=".75" />
      {/* foreground leaf silhouettes frame the open dock */}
      {Array.from({ length: 25 }, (_, i) => <ellipse key={i} cx={-20 + seed(i + 500) * 460} cy={850 + seed(i + 700) * 260} rx={9 + seed(i + 333) * 25} ry={20 + seed(i + 47) * 57} transform={`rotate(${seed(i + 88) * 110 - 60} ${-20 + seed(i + 500) * 460} ${850 + seed(i + 700) * 260})`} fill={i % 3 ? '#41493f' : '#65705d'} opacity=".58" />)}
    </g>
    <g fontFamily="Georgia, serif" textAnchor="end" fill="#2f312d">
      <text x="1855" y="107" fontFamily="Arial, sans-serif" fontSize="27" letterSpacing="4" fill="#43443d">KALI MAS · FOTO TERBIT 1911</text>
      <g opacity={text1}>
        <text x="1835" y="183" fontFamily="Arial, sans-serif" fontSize="28" letterSpacing="2">SERING DITAFSIRKAN SEBAGAI</text>
        <text x="1835" y="246" fontSize="57" fontWeight="bold">Berani menghadapi</text>
        <text x="1835" y="308" fontSize="57" fontWeight="bold">bahaya</text>
        <path d="M1265 325 H1835" stroke="#746b59" strokeWidth="3" opacity=".7" />
      </g>
      <g opacity={text2}>
        <text x="1835" y="188" fontFamily="Arial, sans-serif" fontSize="28" letterSpacing="2">CATATAN SUMBER</text>
        <text x="1835" y="255" fontSize="55" fontWeight="bold">Makna asalnya</text>
        <text x="1835" y="316" fontSize="55" fontWeight="bold">belum pasti</text>
        <path d="M1265 332 H1835" stroke="#746b59" strokeWidth="3" opacity=".7" />
      </g>
    </g>
  </>;
};

const SHOTS: Shot[] = [{
  dur: DUR,
  age: 0.08,
  draw: (u, a) => <Kalimas1911 u={u} a={a} />,
  caps: [
    [25, 365, 'Nama itu sering ditafsirkan sebagai “berani menghadapi bahaya”.'],
    [370, 635, 'Namun, sumber pada masa itu belum menjelaskan maknanya secara pasti.'],
  ],
}];

export const SURABAYA_KALIMAS_PROOF_FRAMES = filmFrames(SHOTS);
export const SurabayaKalimasProof: React.FC = () => <Film shots={SHOTS} defs={<KalimasProofDefs />} fonts={{ mono: 'Arial, sans-serif', ui: 'Arial, sans-serif' }} />;
