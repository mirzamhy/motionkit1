// A survey-style map of Java for the decree shot. The coast is traced from real longitude / latitude points
// (about sixty around Java, plus Madura and the west end of Bali), projected flat; volcanoes, the two great rivers
// of East Java, province lines, towns, graticule, compass and scale are drawn on top.
import React from 'react';
import { inOut, outE, prog, typed } from '../engine/util';
import type { F } from './UnairScene';

/** lon / lat → map units (150 per degree); origin at 105°E, 5.6°S */
export const PJ = (lon: number, lat: number): [number, number] => [(lon - 105) * 150, (-lat - 5.6) * 150];
const ring = (pts: number[][], close = true) => `M ${pts.map(([a, b]) => PJ(a, b).map((v) => v.toFixed(1)).join(' ')).join(' L ')}${close ? ' Z' : ''}`;

const JAVA = [
  [105.2, -6.75], [105.45, -6.6], [105.82, -6.37], [105.88, -6.07], [106.0, -5.93], [106.15, -5.95], [106.25, -6.02], [106.6, -6.02], [106.83, -6.1], [107.0, -5.93],
  [107.2, -5.95], [107.45, -6.0], [107.8, -6.2], [108.1, -6.3], [108.3, -6.25], [108.37, -6.33], [108.57, -6.72], [108.85, -6.8], [109.13, -6.85], [109.4, -6.86],
  [109.67, -6.87], [110.0, -6.92], [110.2, -6.9], [110.42, -6.95], [110.6, -6.85], [110.65, -6.55], [110.75, -6.42], [110.95, -6.4], [111.1, -6.6], [111.35, -6.7],
  [111.5, -6.65], [111.7, -6.75], [112.05, -6.9], [112.4, -6.87], [112.55, -6.88], [112.62, -7.05], [112.7, -7.2], [112.78, -7.3], [112.85, -7.5], [112.9, -7.63],
  [113.2, -7.73], [113.45, -7.72], [113.7, -7.7], [114.0, -7.66], [114.3, -7.7], [114.45, -7.8], [114.38, -8.0], [114.4, -8.2], [114.38, -8.45], [114.6, -8.72],
  [114.4, -8.75], [114.2, -8.62], [113.95, -8.55], [113.7, -8.5], [113.47, -8.4], [113.2, -8.3], [113.0, -8.3], [112.85, -8.4], [112.67, -8.44], [112.4, -8.38],
  [112.2, -8.35], [111.95, -8.3], [111.7, -8.34], [111.4, -8.28], [111.1, -8.25], [110.85, -8.2], [110.6, -8.15], [110.33, -8.02], [110.0, -7.9], [109.6, -7.78],
  [109.3, -7.74], [109.0, -7.73], [108.8, -7.69], [108.66, -7.74], [108.6, -7.68], [108.3, -7.8], [108.0, -7.74], [107.68, -7.67], [107.3, -7.5], [106.95, -7.42],
  [106.5, -7.4], [106.38, -7.3], [106.5, -7.05], [106.42, -6.98], [106.25, -6.97], [106.0, -6.82], [105.75, -6.85], [105.5, -6.87], [105.3, -6.83],
];
const MADURA = [[112.68, -7.05], [112.78, -6.9], [113.1, -6.88], [113.5, -6.88], [113.9, -6.87], [114.1, -6.97], [113.95, -7.1], [113.6, -7.22], [113.3, -7.22], [113.05, -7.2], [112.78, -7.16]];
const BALI = [[114.43, -8.17], [114.6, -8.12], [114.9, -8.18], [115.2, -8.06], [115.5, -8.15], [115.7, -8.38], [115.45, -8.6], [115.22, -8.82], [115.1, -8.84], [115.15, -8.65], [114.9, -8.45], [114.6, -8.4]];
const BRANTAS = [[112.6, -7.92], [112.4, -8.1], [112.2, -8.12], [111.95, -8.08], [111.92, -7.9], [112.02, -7.8], [112.2, -7.6], [112.43, -7.47], [112.6, -7.38], [112.74, -7.26]];
const SOLO = [[110.9, -7.85], [110.82, -7.57], [111.05, -7.42], [111.45, -7.4], [111.65, -7.22], [111.88, -7.15], [112.2, -7.05], [112.45, -6.98], [112.56, -6.9]];
const BORDERS = [
  [[108.75, -6.78], [108.85, -7.1], [108.75, -7.35], [108.7, -7.68]],
  [[111.68, -6.75], [111.5, -7.0], [111.2, -7.25], [111.15, -7.55], [111.2, -7.9], [111.0, -8.22]],
];
const VOLCANOES: [number, number, string][] = [
  [106.73, -6.72, 'Salak'], [107.6, -6.76, ''], [108.4, -6.9, ''], [109.21, -7.24, 'Slamet'], [110.44, -7.54, 'Merapi'], [111.19, -7.63, 'Lawu'],
  [111.76, -7.81, ''], [112.31, -7.93, 'Kelud'], [112.59, -7.73, ''], [112.95, -7.94, 'Bromo'], [112.92, -8.11, ''], [114.05, -8.12, 'Raung'],
];
const TOWNS: [number, number, string, number, number][] = [
  [107.6, -6.92, 'Bandung', 12, -8], [110.42, -6.97, 'Semarang', -10, -14], [110.83, -7.57, 'Surakarta', 12, -8], [108.56, -6.73, 'Tjirebon', 12, 22],
];
export const CITY = { jkt: PJ(106.83, -6.18), yog: PJ(110.37, -7.8), sby: PJ(112.75, -7.27), mlg: PJ(112.63, -7.98) };

export const JavaMap: React.FC<{ mu: number; f: F }> = ({ mu, f }) => {
  const java = ring(JAVA);
  const link = (a: [number, number], b: [number, number], at: number, bend: number) => (
    <g>
      <path d={`M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + bend} ${b[0]} ${b[1]}`} pathLength={1} fill="none" stroke="#FBF3DC" strokeWidth={9} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(mu, at, at + 50, inOut)} opacity={0.8} />
      <path d={`M ${a[0]} ${a[1]} Q ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + bend} ${b[0]} ${b[1]}`} pathLength={1} fill="none" stroke="#B4432E" strokeWidth={4.5} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(mu, at, at + 50, inOut)} />
    </g>
  );
  const tag = (x: number, y: number, text: string, at: number, size = 24, anchor: 'start' | 'end' | 'middle' = 'start', fill = '#2A2018') => (
    <text x={x} y={y} textAnchor={anchor} fontFamily={f.mono} fontSize={size} fill={fill} opacity={prog(mu, at, at + 14)} style={{ paintOrder: 'stroke' }} stroke="#EFE3C4" strokeWidth={5} strokeLinejoin="round">
      {typed(text, mu, at, 0.7)}
    </text>
  );
  return (
    <g>
      {/* paper: border, neat-line with degree ticks, graticule, folds, a stain */}
      <rect x={-750} y={-400} width={1500} height={800} fill="#EFE3C4" />
      <ellipse cx={520} cy={-250} rx={170} ry={110} fill="#B89A5E" opacity={0.12} />
      <ellipse cx={-560} cy={290} rx={120} ry={70} fill="#B89A5E" opacity={0.1} />
      <rect x={-734} y={-384} width={1468} height={768} fill="none" stroke="#5E4A36" strokeWidth={4} />
      <rect x={-722} y={-372} width={1444} height={744} fill="none" stroke="#5E4A36" strokeWidth={1.2} />
      <g transform="translate(-728 -330)">
        {Array.from({ length: 9 }, (_, i) => {
          const x = PJ(106 + i, 0)[0];
          return (
            <g key={i}>
              <path d={`M ${x} -42 L ${x} 702`} stroke="#8A7A58" strokeWidth={1} opacity={0.35} />
              <text x={x} y={-22} textAnchor="middle" fontFamily={f.mono} fontSize={15} fill="#5E4A36">{106 + i}°</text>
            </g>
          );
        })}
        {[-6, -7, -8, -9].map((lat) => (
          <g key={lat}>
            <path d={`M 6 ${PJ(0, lat)[1]} L 1450 ${PJ(0, lat)[1]}`} stroke="#8A7A58" strokeWidth={1} opacity={0.35} />
            <text x={22} y={PJ(0, lat)[1] - 6} fontFamily={f.mono} fontSize={15} fill="#5E4A36">{-lat}°</text>
          </g>
        ))}
        {/* sea: three fading water-lines hugging every coast */}
        {[58, 40, 22].map((w, i) => (
          <g key={w} opacity={0.1 + i * 0.07}>
            <path d={java} fill="none" stroke="#5E8FA8" strokeWidth={w} strokeLinejoin="round" />
            <path d={ring(MADURA)} fill="none" stroke="#5E8FA8" strokeWidth={w} strokeLinejoin="round" />
            <path d={ring(BALI)} fill="none" stroke="#5E8FA8" strokeWidth={w} strokeLinejoin="round" />
          </g>
        ))}
        {/* land */}
        {[java, ring(MADURA), ring(BALI)].map((d, i) => (
          <g key={i}>
            <path d={d} fill={i === 2 ? '#D9D2B0' : '#CBD6A6'} stroke="#4A5A2E" strokeWidth={3} strokeLinejoin="round" />
            <path d={d} fill="none" stroke="#FBF3DC" strokeWidth={1.2} strokeLinejoin="round" transform="translate(-1.5 -1.5)" opacity={0.7} />
          </g>
        ))}
        {/* highlands along the spine, shaded */}
        {VOLCANOES.map(([lo, la], i) => (
          <ellipse key={i} cx={PJ(lo, la)[0]} cy={PJ(lo, la)[1] + 4} rx={46} ry={22} fill="#A9B47E" opacity={0.55} />
        ))}
        {/* province lines */}
        {BORDERS.map((b, i) => (
          <path key={i} d={ring(b, false)} fill="none" stroke="#6B5A3E" strokeWidth={2} strokeDasharray="10 5 2 5" />
        ))}
        {/* rivers: Bengawan Solo and the Brantas (Airlangga's river) */}
        <path d={ring(SOLO, false)} fill="none" stroke="#4E7F9A" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
        <path d={ring(BRANTAS, false)} fill="none" stroke="#4E7F9A" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <text x={PJ(112.0, -7.62)[0]} y={PJ(112.0, -7.62)[1]} fontFamily={f.ui} fontSize={14} fontStyle="italic" fill="#3A6A84" transform={`rotate(-38 ${PJ(112.0, -7.62)[0]} ${PJ(112.0, -7.62)[1]})`}>K. Brantas</text>
        <text x={PJ(111.2, -7.3)[0]} y={PJ(111.2, -7.3)[1]} fontFamily={f.ui} fontSize={14} fontStyle="italic" fill="#3A6A84" transform={`rotate(-8 ${PJ(111.2, -7.3)[0]} ${PJ(111.2, -7.3)[1]})`}>Bengawan Solo</text>
        {/* volcanoes: hachured cones */}
        {VOLCANOES.map(([lo, la, name], i) => {
          const [x, y] = PJ(lo, la);
          return (
            <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
              <path d="M -13 8 L -3 -9 L 3 -9 L 13 8 Z" fill="#B9A77A" stroke="#5E4A36" strokeWidth={1.4} strokeLinejoin="round" />
              <path d="M -3 -9 L -7 8 M 0 -9 L 0 8 M 3 -9 L 8 8" stroke="#5E4A36" strokeWidth={0.9} opacity={0.7} />
              <path d="M -3 -9 Q 0 -6 3 -9" fill="none" stroke="#5E4A36" strokeWidth={1.2} />
              {name && <text x={0} y={24} textAnchor="middle" fontFamily={f.ui} fontSize={13} fontStyle="italic" fill="#4A3A2A">{name}</text>}
            </g>
          );
        })}
        {/* other towns */}
        {TOWNS.map(([lo, la, name, dx, dy]) => {
          const [x, y] = PJ(lo, la);
          return (
            <g key={name}>
              <rect x={x - 4} y={y - 4} width={8} height={8} fill="#EFE3C4" stroke="#2A2018" strokeWidth={2} />
              <text x={x + dx} y={y + dy} textAnchor={dx < 0 ? 'end' : 'start'} fontFamily={f.mono} fontSize={16} fill="#3A2E22">{name}</text>
            </g>
          );
        })}
        {/* sea names */}
        <text x={900} y={110} textAnchor="middle" fontFamily={f.ui} fontSize={30} fontStyle="italic" letterSpacing={14} fill="#4E7F9A" opacity={0.8}>LAUT DJAWA</text>
        <text x={560} y={560} textAnchor="middle" fontFamily={f.ui} fontSize={30} fontStyle="italic" letterSpacing={14} fill="#4E7F9A" opacity={0.8}>SAMUDERA HINDIA</text>
        <text x={PJ(113.45, -7.5)[0]} y={PJ(113.45, -7.5)[1]} textAnchor="middle" fontFamily={f.ui} fontSize={15} fontStyle="italic" letterSpacing={3} fill="#4E7F9A">Selat Madura</text>
        <text x={PJ(113.45, -7.02)[0]} y={PJ(113.45, -7.02)[1]} textAnchor="middle" fontFamily={f.mono} fontSize={16} letterSpacing={4} fill="#3A2E22">MADURA</text>
        <text x={PJ(115.2, -8.4)[0]} y={PJ(115.2, -8.4)[1]} textAnchor="middle" fontFamily={f.mono} fontSize={15} letterSpacing={3} fill="#5E4A36">BALI</text>
        <text x={PJ(107.3, -7.2)[0]} y={PJ(107.3, -7.2)[1]} textAnchor="middle" fontFamily={f.mono} fontSize={15} letterSpacing={5} fill="#5E6A3A" opacity={0.9}>DJAWA BARAT</text>
        <text x={PJ(110.0, -7.3)[0]} y={PJ(110.0, -7.3)[1]} textAnchor="middle" fontFamily={f.mono} fontSize={15} letterSpacing={5} fill="#5E6A3A" opacity={0.9}>DJAWA TENGAH</text>
        <text x={PJ(113.55, -7.98)[0]} y={PJ(113.55, -7.98)[1]} textAnchor="middle" fontFamily={f.mono} fontSize={15} letterSpacing={5} fill="#5E6A3A" opacity={0.9}>DJAWA TIMUR</text>

        {/* the story: three schools join at Surabaja */}
        {link(CITY.jkt, CITY.sby, 20, -150)}
        {link(CITY.yog, CITY.sby, 90, 70)}
        {link(CITY.mlg, CITY.sby, 150, 0)}
        {(['jkt', 'yog', 'mlg', 'sby'] as const).map((k) => (
          <g key={k}>
            <circle cx={CITY[k][0]} cy={CITY[k][1]} r={k === 'sby' ? 15 : 10} fill="#EFE3C4" stroke={k === 'sby' ? '#B4432E' : '#2A2018'} strokeWidth={4} />
            <circle cx={CITY[k][0]} cy={CITY[k][1]} r={k === 'sby' ? 6 : 4} fill={k === 'sby' ? '#B4432E' : '#2A2018'} />
          </g>
        ))}
        {[0, 1].map((i) => (
          <circle key={i} cx={CITY.sby[0]} cy={CITY.sby[1]} r={22 + 70 * prog((mu - 210 + i * 45) % 90, 0, 90, outE)} fill="none" stroke="#B4432E" strokeWidth={4} opacity={mu > 210 ? 0.7 * Math.sin(Math.PI * prog((mu - 210 + i * 45) % 90, 0, 90, (x) => x)) : 0} />
        ))}
        {tag(CITY.jkt[0] + 18, CITY.jkt[1] - 14, 'DJAKARTA', 10, 22)}
        {tag(CITY.jkt[0] + 18, CITY.jkt[1] - 44, 'Kedokteran · Kedokteran Gigi (UI)', 30, 22, 'start', '#7A2A1A')}
        {tag(CITY.yog[0], CITY.yog[1] + 52, 'JOGJAKARTA', 80, 22, 'middle')}
        {tag(CITY.yog[0], CITY.yog[1] + 82, 'Hukum (Gadjah Mada)', 100, 22, 'middle', '#7A2A1A')}
        {tag(CITY.mlg[0] + 4, CITY.mlg[1] + 96, 'MALANG', 140, 22, 'middle')}
        {tag(CITY.mlg[0] + 4, CITY.mlg[1] + 126, 'Pendidikan Guru', 160, 22, 'middle', '#7A2A1A')}
        {tag(CITY.sby[0] - 24, CITY.sby[1] - 112, 'SURABAJA', 200, 30, 'end', '#B4432E')}
        <path d={`M ${CITY.sby[0] - 20} ${CITY.sby[1] - 100} L ${CITY.sby[0] - 6} ${CITY.sby[1] - 18}`} stroke="#B4432E" strokeWidth={2} opacity={prog(mu, 200, 214)} />
      </g>
      {/* cartouche, compass, scale */}
      <g transform="translate(384 -358)">
        <rect x={0} y={0} width={330} height={84} fill="#EFE3C4" stroke="#5E4A36" strokeWidth={3} />
        <rect x={7} y={7} width={316} height={70} fill="none" stroke="#5E4A36" strokeWidth={1} />
        <text x={165} y={40} textAnchor="middle" fontFamily={f.disp} fontSize={30} fontWeight={700} letterSpacing={6} fill="#2A2018">PULAU DJAWA</text>
        <text x={165} y={64} textAnchor="middle" fontFamily={f.mono} fontSize={14} fill="#5E4A36">dan Madura · 1954</text>
      </g>
      <g transform="translate(-610 250)">
        <circle r={62} fill="#EFE3C4" stroke="#5E4A36" strokeWidth={2} />
        <circle r={50} fill="none" stroke="#5E4A36" strokeWidth={1} strokeDasharray="2 5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d={a % 90 ? 'M 0 -30 L 6 -6 L 0 0 L -6 -6 Z' : 'M 0 -56 L 9 -9 L 0 0 L -9 -9 Z'} fill={a % 90 ? '#8A7A58' : a === 0 ? '#B4432E' : '#2A2018'} transform={`rotate(${a})`} />
        ))}
        <circle r={5} fill="#EFE3C4" stroke="#2A2018" strokeWidth={2} />
        <text x={0} y={-70} textAnchor="middle" fontFamily={f.disp} fontSize={22} fontWeight={700} fill="#2A2018">U</text>
      </g>
      <g transform="translate(440 352)">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 67.5} y={0} width={67.5} height={9} fill={i % 2 ? '#EFE3C4' : '#2A2018'} stroke="#2A2018" strokeWidth={1.5} />
        ))}
        {[0, 100, 200].map((km, i) => (
          <text key={km} x={i * 135} y={-8} textAnchor="middle" fontFamily={f.mono} fontSize={14} fill="#2A2018">{km}</text>
        ))}
        <text x={292} y={10} fontFamily={f.mono} fontSize={14} fill="#2A2018">km</text>
      </g>
      {/* fold creases */}
      <path d="M -250 -400 L -250 400 M 250 -400 L 250 400 M -750 0 L 750 0" stroke="#FFFFFF" strokeWidth={3} opacity={0.3} />
      <path d="M -247 -400 L -247 400 M 253 -400 L 253 400 M -750 3 L 750 3" stroke="#8A7A58" strokeWidth={1.5} opacity={0.25} />
    </g>
  );
};
