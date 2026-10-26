// Gudang pelabuhan: a colonial-era harbour warehouse (pakhuis), long and low, whitewashed walls under a dark
// corrugated-iron gable roof, a row of big sliding wooden doors and small high windows. Drawn from the Tropenmuseum
// photo of the North Pier at Surabaya, about 1925, and the warehouses behind the Madurese prauw (1932); see refs.md.
// Front elevation: (x, y) is the middle of the ground line.
import React from 'react';
import { rng } from '../../../scenes/kit';
import type { Item2DProps, ItemMeta } from '../../types';

export const meta: ItemMeta = {
  id: 'gudang-pelabuhan',
  name: 'Gudang pelabuhan kolonial (pakhuis, 1920-an)',
  benda: 'gudang',
  gaya: 'ilustrasi',
  category: 'bangunan',
  tags: ['gudang', 'pakhuis', 'warehouse', 'pelabuhan', 'harbour', 'kolonial', 'kade', 'bangunan', 'building', 'atap seng'],
  era: '1910-1940',
  region: 'Surabaya, Batavia',
  size: [30, 8.2, 14],
  variants: ['panjang', 'pendek', 'tutup'],
  refs: 'packages/core/src/library/bangunan/gudang-pelabuhan/refs.md',
  invented: ['nama di papan (generik)', 'warna (foto hitam-putih)', 'jumlah dan jarak jendela'],
};

const C = { wall: '#ECE4D2', wallShade: '#CFC5AE', wallLit: '#F7F2E6', plinth: '#8E8676', roof: '#4B4D4C', roofLit: '#6C706D', roofDark: '#333534', door: '#6E5136', doorDark: '#4C3622', doorLit: '#8C6A46', window: '#2E2A26', frame: '#F4EEE0', sign: '#2F3B33', signText: '#EDE3C6', stain: '#9D9276', gutter: '#5A5D5B' };

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, seed = 0, variant = 'panjang' }) => {
  const bays = variant === 'pendek' ? 3 : 6;
  const W = bays * 5, wallH = 5.2, ridge = 8.2, eave = 0.45, R = rng(seed + 9);
  const open = variant !== 'tutup';
  return (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`}>
      <ellipse cx={0} cy={0.05} rx={W * 0.55} ry={0.35} fill="#000" opacity={0.15} />
      {/* gable roof seen from the front long side: a sloped band with corrugations, lit top edge, dark eave line */}
      <path d={`M ${-W / 2 - eave} ${-wallH} L ${-W / 2 + 1.2} ${-ridge} L ${W / 2 - 1.2} ${-ridge} L ${W / 2 + eave} ${-wallH} Z`} fill={C.roof} />
      {Array.from({ length: Math.round(W * 2.2) }, (_, i) => {
        const xx = -W / 2 - eave + (i + 0.5) * ((W + 2 * eave) / Math.round(W * 2.2));
        const top = Math.max(-ridge, -ridge + Math.max(0, Math.abs(xx) - (W / 2 - 1.2)) * ((ridge - wallH) / (1.2 + eave)));
        return <path key={i} d={`M ${xx.toFixed(2)} ${-wallH} L ${xx.toFixed(2)} ${top.toFixed(2)}`} stroke={i % 2 ? C.roofDark : C.roofLit} strokeWidth={0.12} opacity={0.6} />;
      })}
      <path d={`M ${-W / 2 + 1.2} ${-ridge} L ${W / 2 - 1.2} ${-ridge}`} stroke={C.roofLit} strokeWidth={0.22} />
      {/* rust streaks on the iron */}
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${(-W / 2 + R() * W).toFixed(2)} ${-wallH - 0.1} v ${-(0.6 + R() * 1.4).toFixed(2)}`} stroke="#7A5A3C" strokeWidth={0.18} opacity={0.35} />)}
      <path d={`M ${-W / 2 - eave} ${-wallH} H ${W / 2 + eave}`} stroke={C.gutter} strokeWidth={0.22} />
      {/* wall: lit face, a shadow band under the eave, darker plinth */}
      <rect x={-W / 2} y={-wallH} width={W} height={wallH} fill={C.wall} />
      <rect x={-W / 2} y={-wallH} width={W} height={0.9} fill={C.wallShade} />
      <rect x={-W / 2} y={-0.7} width={W} height={0.7} fill={C.plinth} />
      <rect x={-W / 2} y={-wallH + 0.9} width={W * 0.08} height={wallH - 1.6} fill={C.wallLit} opacity={0.6} />
      {/* weathering stains below windows and from the gutter, seeded */}
      {Array.from({ length: bays * 2 }, (_, i) => <path key={i} d={`M ${(-W / 2 + 1 + R() * (W - 2)).toFixed(2)} ${-wallH + 0.9} q 0.1 ${(0.8 + R()).toFixed(2)} 0 ${(1.4 + R() * 1.4).toFixed(2)}`} stroke={C.stain} strokeWidth={0.3 + R() * 0.3} opacity={0.18} fill="none" />)}
      {/* bays: pilaster lines, a big sliding plank door with its rail, a small high window with a shutter */}
      {Array.from({ length: bays }, (_, b) => {
        const cx = -W / 2 + 2.5 + b * 5;
        const dw = 2.8, dh = 3.4, slide = open && b % 2 === 0 ? 1.1 : 0;
        return (
          <g key={b}>
            <path d={`M ${cx - 2.5} ${-wallH} V -0.7`} stroke={C.wallShade} strokeWidth={0.18} />
            <path d={`M ${cx - dw / 2 - 0.3} ${-dh - 0.1} H ${cx + dw / 2 + 1.4}`} stroke={C.gutter} strokeWidth={0.1} />
            {slide > 0 && <rect x={cx - dw / 2} y={-dh} width={dw} height={dh - 0.05} fill="#241D16" />}
            <g transform={`translate(${slide} 0)`}>
              <rect x={cx - dw / 2} y={-dh} width={dw} height={dh} fill={C.door} />
              {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M ${cx - dw / 2 + (k + 0.5) * (dw / 7)} ${-dh} V 0`} stroke={k % 2 ? C.doorDark : C.doorLit} strokeWidth={0.05} />)}
              <path d={`M ${cx - dw / 2} ${-dh} L ${cx + dw / 2} 0 M ${cx - dw / 2} ${-dh * 0.5} H ${cx + dw / 2}`} stroke={C.doorDark} strokeWidth={0.12} />
              <rect x={cx - dw / 2} y={-dh} width={dw} height={dh} fill="none" stroke={C.doorDark} strokeWidth={0.12} />
            </g>
            <rect x={cx - 0.55} y={-wallH + 1.0} width={1.1} height={0.62} fill={C.window} stroke={C.frame} strokeWidth={0.12} />
            <path d={`M ${cx} ${-wallH + 1.0} v 0.62`} stroke={C.frame} strokeWidth={0.08} />
          </g>
        );
      })}
      {/* sign board over the middle bay (generic name, not a real firm) */}
      <rect x={-3.6} y={-wallH + 0.15} width={7.2} height={0.7} fill={C.sign} />
      <text x={0} y={-wallH + 0.66} textAnchor="middle" fontFamily="'Josefin Sans', 'Arial Narrow', sans-serif" fontSize={0.5} letterSpacing={0.12} fill={C.signText}>PAKHUIS No. {(seed % 9) + 2}</text>
      {/* downpipes at both ends */}
      {[-1, 1].map((d) => <path key={d} d={`M ${d * (W / 2 - 0.25)} ${-wallH} V -0.3`} stroke={C.gutter} strokeWidth={0.16} />)}
    </g>
  );
};
