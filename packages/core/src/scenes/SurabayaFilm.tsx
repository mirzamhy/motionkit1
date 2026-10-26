import React from 'react';
import { Film, type Shot, filmFrames } from './film';
import { inOut, prog } from './motion';
import { Kalimas1911, KalimasProofDefs } from './SurabayaKalimasProof';

const noise = (n: number) => {
  const x = Math.sin(n * 183.37 + 71.81) * 47453.24;
  return x - Math.floor(x);
};

const FilmDefs: React.FC = () => <>
  <KalimasProofDefs />
  <defs>
    <linearGradient id="su-sky" x2="0" y2="1"><stop stopColor="#172d3c" /><stop offset=".55" stopColor="#786b55" /><stop offset="1" stopColor="#ddb06a" /></linearGradient>
    <linearGradient id="su-deep" x2="0" y2="1"><stop stopColor="#29747d" /><stop offset=".5" stopColor="#0d4857" /><stop offset="1" stopColor="#082b36" /></linearGradient>
    <linearGradient id="su-shark" x2="0" y2="1"><stop stopColor="#778c8b" /><stop offset=".52" stopColor="#304f55" /><stop offset="1" stopColor="#153943" /></linearGradient>
    <linearGradient id="su-mud" x2="0" y2="1"><stop stopColor="#7c7352" /><stop offset="1" stopColor="#2d392f" /></linearGradient>
    <linearGradient id="su-copper" x2="0" y2="1"><stop stopColor="#d4ae74" /><stop offset=".24" stopColor="#8b6845" /><stop offset=".7" stopColor="#9a764c" /><stop offset="1" stopColor="#3a2d25" /></linearGradient>
    <linearGradient id="su-modern-sky" x2="0" y2="1"><stop stopColor="#cadbdc" /><stop offset="1" stopColor="#f0dcb2" /></linearGradient>
    <linearGradient id="su-modern-water" x2="0" y2="1"><stop stopColor="#697d72" /><stop offset=".3" stopColor="#455e5d" /><stop offset="1" stopColor="#183c43" /></linearGradient>
    <radialGradient id="su-glow"><stop stopColor="#f8dc93" stopOpacity=".72" /><stop offset="1" stopColor="#f8dc93" stopOpacity="0" /></radialGradient>
  </defs>
</>;

const Shark: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
  <path d="M-352-3 Q-236-27-126-36 Q32-64 192-25 Q289-7 346 12 Q264 39 111 50 Q-54 61-170 30 Q-251 22-352-3Z" fill="url(#su-shark)" stroke="#122f39" strokeWidth="5" />
  <path d="M-43-41 Q17-147 80-172 Q65-99 95-44Z" fill="#244a53" stroke="#122f39" strokeWidth="4" />
  <path d="M-251-18 Q-295-59-353-58 L-326-10Z M-255 7 Q-305 54-368 52 L-327 6Z" fill="#254d55" stroke="#12343c" strokeWidth="4" />
  <path d="M35 42 Q-34 108-121 117 L-64 49Z M-176 31 Q-204 88-254 92 L-228 29Z" fill="#244650" stroke="#12343c" strokeWidth="4" />
  <path d="M-55 23 Q112 41 285 12" fill="none" stroke="#aac2b8" strokeWidth="6" opacity=".5" />
  <circle cx="278" cy="-11" r="5" fill="#0b2730" />
  {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${195 - i * 13} -17 q-6 21 2 34`} fill="none" stroke="#15323a" strokeWidth="3" opacity=".7" />)}
</g>;

const Croc: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
  <path d="M-275 0 Q-230-42-135-48 Q-25-47 84-31 Q167-24 265-15 L397-2 Q329 28 199 31 Q64 45-79 35 Q-208 37-275 0Z" fill="#303c32" stroke="#162921" strokeWidth="5" />
  <path d="M-267 0 Q-323-10-350 16 Q-343 31-295 23 L-239 19Z" fill="#434b39" />
  <path d="M-345 18 Q-300 31-254 11" fill="none" stroke="#1e2e25" strokeWidth="4" />
  {Array.from({ length: 31 }, (_, i) => {
    const xx = -161 + i * 16;
    const yy = -44 + Math.max(0, i - 16) * .9;
    return <path key={i} d={`M${xx} ${yy + 8} l8 -${13 - i * .12} l9 ${13 - i * .12}Z`} fill={i % 2 ? '#455643' : '#66725a'} stroke="#26382e" strokeWidth="1" />;
  })}
  {Array.from({ length: 44 }, (_, i) => <circle key={i} cx={-170 + (i % 22) * 17} cy={-22 + Math.floor(i / 22) * 15} r={3 + noise(i) * 4} fill="#869178" opacity=".35" />)}
  <circle cx="-308" cy="3" r="4" fill="#e0d3a9" />
</g>;

const Reeds: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#172e2c" strokeWidth="5" fill="none" strokeLinecap="round">
  {Array.from({ length: 14 }, (_, i) => {
    const dx = (i - 7) * 13;
    const bend = Math.sin(t / 80 + i) * 8;
    return <path key={i} d={`M${dx} 0 Q${dx + bend * .3} -${70 + noise(i + x) * 80} ${dx + bend} -${170 + noise(i + 30) * 110}`} opacity={.5 + noise(i) * .4} />;
  })}
</g>;

const Estuary: React.FC<{ u: number; a: number }> = ({ u, a }) => {
  const drift = prog(u, 0, 540, inOut);
  return <>
    <rect width="1920" height="1080" fill="url(#su-sky)" />
    <circle cx="990" cy="490" r="510" fill="url(#su-glow)" opacity=".6" />
    <path d="M0 470 Q290 372 480 425 Q760 340 1020 445 Q1310 348 1590 425 Q1780 390 1920 440 V650 H0Z" fill="#233b3e" />
    {Array.from({ length: 18 }, (_, i) => <g key={i} opacity=".35">
      <path d={`M${i * 120 - 80} 475 v-${90 + noise(i) * 120} M${i * 120 - 80} 425 q${-50 + noise(i + 11) * 100} -65 ${-64 + noise(i + 9) * 128} -76`} stroke="#172d30" strokeWidth="8" fill="none" />
      <circle cx={i * 120 - 80} cy={370 - noise(i) * 80} r={38 + noise(i + 8) * 25} fill="#294a45" />
    </g>)}
    <rect y="485" width="1920" height="595" fill="url(#su-deep)" />
    <path d="M0 489 Q340 462 650 498 T1270 492 T1920 495" fill="none" stroke="#f2c47a" strokeWidth="14" opacity=".65" />
    {Array.from({ length: 105 }, (_, i) => {
      const x = noise(i + 90) * 1920;
      const y = 505 + noise(i + 180) * 560;
      return <circle key={i} cx={x + Math.sin(a / 90 + i) * 2} cy={y} r={1 + noise(i + 19) * 4} fill={i % 4 ? '#a6bfaa' : '#eed59a'} opacity=".12" />;
    })}
    <g transform={`translate(${20 + drift * 115} ${Math.sin(a / 34) * 3})`}><Shark x={740} y={770} s={1.22} o={.88} /></g>
    <path d="M1270 610 Q1510 560 1920 590 V1080 H1550 Q1445 920 1340 760Z" fill="url(#su-mud)" />
    <path d="M1295 604 Q1530 548 1920 582" stroke="#dec484" strokeWidth="10" fill="none" opacity=".7" />
    <ellipse cx="1595" cy="664" rx="392" ry="57" fill="#102b2f" opacity=".45" />
    <Croc x={1480 - drift * 43} y={660} s={1.14} />
    {Array.from({ length: 19 }, (_, i) => {
      const x = 1220 + i * 35;
      const yy = 666 + Math.sin(i * 2.2 + a / 38) * 5;
      return <path key={`wake-${i}`} d={`M${x} ${yy} q${12 + i} -5 ${22 + i * 1.2} 0`} fill="none" stroke="#b8c59d" strokeOpacity={.18 + noise(i) * .24} strokeWidth="3" />;
    })}
    {Array.from({ length: 45 }, (_, i) => <path key={i} d={`M${1270 + noise(i + 41) * 650} ${615 + noise(i + 63) * 400} q${10 + noise(i) * 40} -9 ${16 + noise(i + 4) * 50} 4`} stroke={i % 3 ? '#77846c' : '#d9ba7d'} strokeOpacity=".23" strokeWidth="3" fill="none" />)}
    <Reeds x={1570} y={990} s={1.45} t={a} /><Reeds x={1880} y={785} s={1.1} t={a + 40} /><Reeds x={80} y={1060} s={1.5} t={a + 70} />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${noise(i + 3) * 1900} ${505 + i * 21} q${80 + noise(i + 7) * 130} ${Math.sin(a / 50 + i) * 5} ${170 + noise(i) * 230} 0`} fill="none" stroke="#eac784" strokeOpacity={.09 + noise(i + 2) * .11} strokeWidth="3" />)}
  </>;
};

const LegendMap: React.FC<{ u: number; a: number }> = ({ u, a }) => {
  const reveal = prog(u, 210, 560, inOut);
  return <>
    <rect width="1920" height="1080" fill="#102e37" />
    <path d="M0 0 H565 Q411 280 583 501 Q739 707 584 1080 H0Z" fill="#465c48" />
    <path d="M1920 0 H1450 Q1592 264 1400 531 Q1269 722 1420 1080 H1920Z" fill="#3c5449" />
    {Array.from({ length: 100 }, (_, i) => <circle key={i} cx={noise(i + 10) * 1920} cy={noise(i + 53) * 1080} r={2 + noise(i + 67) * 11} fill={i % 4 ? '#7e967d' : '#d2a36a'} opacity=".12" />)}
    <g transform={`translate(${50 + 25 * Math.sin(a / 80)} 0) rotate(-21 790 590)`} opacity={1 - .24 * reveal}><Shark x={790} y={650} s={.72} /></g>
    <g transform={`translate(${-25 * Math.sin(a / 110)} 0) rotate(18 1250 430)`} opacity={1 - .24 * reveal}><Croc x={1245} y={430} s={.68} /></g>
    {[130, 210, 295].map((r, i) => <ellipse key={i} cx="930" cy="540" rx={r + Math.sin(a / 38) * 5} ry={r * .53 + Math.sin(a / 48) * 4} fill="none" stroke="#a4c0a5" strokeWidth="5" opacity={.16 - i * .025} />)}
    <path d="M964-20 Q784 112 1025 230 Q1290 345 986 478 Q632 637 917 738 Q1189 851 950 1104" fill="none" stroke="#b48d58" strokeWidth={5 + reveal * 24} strokeLinecap="round" opacity={.35 + reveal * .4} />
    <path d="M961-20 Q777 111 1021 229 Q1285 343 983 475 Q633 636 913 736 Q1185 853 949 1104" fill="none" stroke="#e0c182" strokeWidth="4" opacity={reveal} />
    <g opacity={prog(u, 340, 420)}>
      <text x="960" y="155" fill="#f1e0bd" fontFamily="Georgia, serif" fontSize="62" textAnchor="middle">Dari cerita, menuju jejak tertulis.</text>
    </g>
  </>;
};

const Inscription: React.FC<{ u: number; a: number }> = ({ u, a }) => {
  const pull = prog(u, 0, 720, inOut);
  const words = prog(u, 200, 280);
  return <>
    <rect width="1920" height="1080" fill="#191f1e" />
    <circle cx="520" cy="420" r="750" fill="url(#su-glow)" opacity=".38" />
    <g transform={`translate(${30 + pull * 28} ${-30 + pull * 20}) scale(${1.04 - pull * .08})`}>
      <ellipse cx="790" cy="700" rx="690" ry="108" fill="#080f11" opacity=".67" />
      <path d="M130 244 Q740 219 1288 245 L1309 647 Q727 675 137 647Z" fill="url(#su-copper)" stroke="#cfac72" strokeWidth="9" />
      <path d="M151 262 Q740 239 1288 263 M155 623 Q770 649 1280 628" fill="none" stroke="#e5c38a" strokeWidth="4" opacity=".64" />
      {Array.from({ length: 9 }, (_, row) => <g key={row}>
        {Array.from({ length: 45 }, (_, col) => {
          const xx = 180 + col * 23 + noise(row * 77 + col) * 5;
          const yy = 288 + row * 36 + noise(row * 11 + col) * 5;
          return <path key={col} d={`M${xx} ${yy} q6 -7 10 1 q3 6 8-2 m-8 2 q-2 8 6 9`} fill="none" stroke={row % 2 ? '#392e25' : '#4d382b'} strokeOpacity={.55 + noise(col) * .25} strokeWidth={1.8 + noise(row + col) * .8} />;
        })}
      </g>)}
      <path d={`M${-90 + pull * 1380} 225 l130 0 l80 470 l-130 0Z`} fill="#f9ddaa" opacity=".09" />
    </g>
    <g opacity={words} fill="#f0d8a9">
      <text x="1430" y="345" fontFamily="Arial, sans-serif" fontSize="31" letterSpacing="5">PRASASTI CANGGU</text>
      <text x="1430" y="445" fontFamily="Georgia, serif" fontSize="78">Śūrabhaya</text>
      <path d="M1430 480 H1820" stroke="#d4ac70" strokeWidth="4" />
      <text x="1430" y="552" fontFamily="Arial, sans-serif" fontSize="44" letterSpacing="6">1358</text>
      <text x="1430" y="615" fontFamily="Arial, sans-serif" fontSize="24">transkripsi grafis</text>
    </g>
    <path d="M130 856 Q590 804 1090 860 Q1465 909 1830 822" fill="none" stroke="#64867e" strokeWidth="46" opacity=".25" />
    <path d="M130 856 Q590 804 1090 860 Q1465 909 1830 822" fill="none" stroke="#d6c797" strokeWidth="4" strokeDasharray="12 18" opacity={prog(u, 370, 510)} />
    <text x="180" y="957" fontFamily="Arial, sans-serif" fontSize="28" letterSpacing="3" fill="#b8c1ad" opacity={prog(u, 420, 500)}>TEPI SUNGAI · TEMPAT PENYEBERANGAN</text>
  </>;
};

const ModernTree: React.FC<{ x: number; y: number; s: number; seedOffset: number }> = ({ x, y, s, seedOffset }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M0 5 Q-16-108 2-220 M-3-150 Q-87-239-159-226 M1-177 Q77-255 149-227" stroke="#364637" strokeWidth="17" fill="none" strokeLinecap="round" />
  <path d="M-3 0 Q-8-95 0-188" stroke="#9c9570" strokeWidth="4" fill="none" opacity=".55" />
  {Array.from({ length: 55 }, (_, i) => {
    const theta = noise(i + seedOffset) * Math.PI * 2;
    const rr = Math.sqrt(noise(i + seedOffset + 55));
    const cx = Math.cos(theta) * rr * 175;
    const cy = -228 + Math.sin(theta) * rr * 65;
    const r = 17 + noise(i + seedOffset + 99) * 37;
    return <g key={i}>
      <ellipse cx={cx + 5} cy={cy + 6} rx={r * 1.08} ry={r * .68} fill="#28483b" opacity=".7" />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * .67} fill={i % 4 ? '#41634f' : '#6e8664'} opacity={.78 + noise(i + 33) * .2} />
      <path d={`M${cx - r * .55} ${cy - r * .12} q${r * .4} ${-r * .3} ${r * .8} ${-r * .1}`} fill="none" stroke="#a6b08b" strokeWidth="2" opacity=".3" />
    </g>;
  })}
</g>;

const ModernRiver: React.FC<{ u: number; a: number }> = ({ u, a }) => {
  const p = prog(u, 0, 780, inOut);
  return <>
    <rect width="1920" height="1080" fill="url(#su-modern-sky)" />
    <g transform={`translate(${p * -16} ${p * 8}) scale(${1 + .018 * p})`}>
      <path d="M0 568 Q395 491 790 536 Q1000 497 1160 545 Q1550 469 1920 535 V720 H0Z" fill="#587e6e" />
      <path d="M0 665 Q370 619 825 570 Q1000 549 1115 568 Q1500 601 1920 669 V1080 H0Z" fill="url(#su-modern-water)" />
      {/* concrete banks taper into the same vanishing point as the reference photograph */}
      <path d="M0 606 Q390 582 850 553 L947 570 Q475 618 0 712Z" fill="#a5a697" />
      <path d="M1920 590 Q1560 551 1100 555 L1020 579 Q1484 591 1920 730Z" fill="#a8a795" />
      <path d="M0 670 Q430 610 938 566 M1020 576 Q1480 594 1920 687" fill="none" stroke="#565e58" strokeWidth="10" />
      <path d="M0 709 Q457 639 947 594 M1035 596 Q1478 620 1920 733" fill="none" stroke="#d0c9b0" strokeWidth="7" />
      {Array.from({ length: 42 }, (_, i) => {
        const x = i * 29;
        const y = 695 - i * 2.7;
        return <path key={`block-left-${i}`} d={`M${x} ${y - 25} l29 -4 M${x + 12} ${y - 39} v18`} stroke="#5f6961" strokeWidth="2" opacity=".38" />;
      })}
      {Array.from({ length: 35 }, (_, i) => {
        const x = 1020 + i * 29;
        const y = 599 + i * 2.5;
        return <path key={`block-right-${i}`} d={`M${x} ${y} l30 4 M${x + 12} ${y - 13} v15`} stroke="#536159" strokeWidth="2" opacity=".4" />;
      })}
      {Array.from({ length: 23 }, (_, i) => <path key={`rail-${i}`} d={`M${i * 43} ${646 - i * 3.4} v-${34 - i * .7}`} stroke={i % 2 ? '#d4d9c8' : '#9a3c32'} strokeWidth="7" />)}
      <path d="M0 610 Q460 570 949 549 M0 638 Q460 595 949 566" stroke="#b64236" strokeWidth="5" fill="none" />
      <g opacity=".65"><path d="M880 518 v-94 h62 v94Z" fill="#c0c6be" /><path d="M896 424 v-66 M924 424 v-45" stroke="#8b9792" strokeWidth="3" /><path d="M885 452 h50 M885 480 h50" stroke="#929d96" strokeWidth="3" /></g>
      <ModernTree x={1660} y={620} s={1.78} seedOffset={23} />
      <ModernTree x={1300} y={565} s={.82} seedOffset={132} />
      <ModernTree x={350} y={602} s={.82} seedOffset={232} />
      {/* broken, dark reflections sit below the bank instead of repeating the trees exactly */}
      {Array.from({ length: 75 }, (_, i) => {
        const side = i % 3 === 0;
        const x = side ? 80 + noise(i + 520) * 620 : 1150 + noise(i + 610) * 780;
        const y = 716 + noise(i + 715) * 322;
        const w = 22 + noise(i + 810) * 115;
        return <path key={`reflection-${i}`} d={`M${x} ${y} q${w * .5} ${noise(i + 3) * 10} ${w} 0`} stroke={i % 4 ? '#192f30' : '#7f9d80'} strokeOpacity={.08 + noise(i + 85) * .16} strokeWidth={3 + noise(i + 34) * 13} fill="none" />;
      })}
      {Array.from({ length: 95 }, (_, i) => {
        const x = noise(i + 7) * 1920;
        const y = 670 + noise(i + 110) * 410;
        const len = 20 + noise(i + 80) * 100;
        return <path key={i} d={`M${x + Math.sin(a / 70 + i) * 3} ${y} h${len}`} stroke={i % 3 ? '#adc3ad' : '#182e35'} strokeOpacity={.06 + noise(i + 40) * .16} strokeWidth={1 + noise(i) * 4} />;
      })}
      <path d="M1150 665 Q1430 792 1860 850 M215 727 Q575 833 860 853" fill="none" stroke="#dae4c9" strokeWidth="12" opacity=".06" />
    </g>
    <text x="965" y="190" fontFamily="Georgia, serif" fontSize="92" fill="#243d41" textAnchor="middle" opacity={prog(u, 110, 160)}>31 MEI 1293</text>
    <text x="965" y="245" fontFamily="Arial, sans-serif" fontSize="31" letterSpacing="8" fill="#395b59" textAnchor="middle" opacity={prog(u, 140, 190)}>HARI JADI RESMI</text>
    <text x="965" y="299" fontFamily="Arial, sans-serif" fontSize="25" fill="#435f5d" textAnchor="middle" opacity={prog(u, 270, 320) * (1 - prog(u, 600, 660))}>Memperingati kemenangan Raden Wijaya atas pasukan Mongol</text>
    <text x="95" y="76" fontFamily="Arial, sans-serif" fontSize="24" letterSpacing="4" fill="#435d5a">KALI MAS · ACUAN FOTO 2009</text>
  </>;
};

const SHOTS: Shot[] = [
  { dur: 540, label: 'LEGENDA', age: 0, draw: (u, a) => <Estuary u={u} a={a} />, caps: [[30, 500, 'Konon, Sura sang hiu dan Baya sang buaya bertemu di pertemuan air.']] },
  { dur: 600, label: 'LEGENDA', age: 0, draw: (u, a) => <LegendMap u={u} a={a} />, caps: [[30, 300, 'Cerita itu hidup dalam simbol kota.'], [305, 560, 'Jejak tertulis namanya muncul pada lempeng tembaga.']] },
  { dur: 720, age: .1, draw: (u, a) => <Inscription u={u} a={a} />, caps: [[30, 355, 'Prasasti Canggu dari tahun seribu tiga ratus lima puluh delapan menulis Śūrabhaya.'], [365, 680, 'Namanya tercatat sebagai daerah di tepi sungai, tempat orang menyeberang.']] },
  { dur: 660, age: .08, draw: (u, a) => <Kalimas1911 u={u} a={a} />, caps: [[25, 365, 'Nama itu sering ditafsirkan sebagai “berani menghadapi bahaya”.'], [370, 635, 'Namun, sumber pada masa itu belum menjelaskan maknanya secara pasti.']] },
  { dur: 780, age: 0, draw: (u, a) => <ModernRiver u={u} a={a} />, caps: [[40, 430, 'Surabaya memperingati 31 Mei 1293 sebagai hari jadinya.'], [435, 750, 'Satu kota; legenda, prasasti, dan hari jadi.']] },
];

export const SURABAYA_FILM_FRAMES = filmFrames(SHOTS);
export const SurabayaFilm: React.FC = () => <Film shots={SHOTS} defs={<FilmDefs />} fonts={{ mono: 'Arial, sans-serif', ui: 'Arial, sans-serif' }} />;
