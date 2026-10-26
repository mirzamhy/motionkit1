// Pohon dan rumpun daun (ilustrasi): pembungkus Foliage dari scenes/kit.tsx, rumpun cakram daun dua warna yang
// bergoyang pelan. Varian `muda` adalah pohon muda dari bidikan NIAS (batang, dua dahan, tiga rumpun); varian
// `rumpun` satu rumpun rendah untuk semak dan pagar tanaman. 75 satuan per meter. Titik (x, y) ada di kaki.
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Foliage } from '../../scenes/kit';

export const meta: ItemMeta = {
  id: 'pohon-ilustrasi',
  name: 'Pohon muda dan rumpun daun bulat (ilustrasi)',
  benda: 'pohon',
  gaya: 'ilustrasi',
  category: 'alam',
  tags: ['pohon', 'rumpun', 'daun', 'semak', 'pagar tanaman', 'tanaman', 'tree', 'foliage', 'bush', 'hedge', 'plant', 'taman'],
  region: 'Surabaya',
  size: [3, 6, 3],
  variants: ['muda', 'rumpun'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/pohon-ilustrasi.tsx',
  komponen: [{ nama: 'Foliage', dari: 'kit' }],
  invented: ['bukan spesies tertentu', 'tinggi 6 m dan rumpun 1,2 m dipilih agar pas dengan tokoh 1,65 m'],
};

const PER_M = 75;

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'muda', flip }) => {
  const k = s / PER_M;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      {variant === 'rumpun' ? (
        <>
          <ellipse cx={0} cy={2} rx={52} ry={7} fill="#000" opacity={0.18} />
          <Foliage x={0} y={-30} r={45} seed={20 + seed} t={t} dark="#3F5A2C" light="#5E7C40" n={9} />
        </>
      ) : (
        <g transform="translate(-1620 -870)">
          <ellipse cx={1620} cy={872} rx={40} ry={7} fill="#000" opacity={0.18} />
          <path d="M 1620 870 C 1612 720, 1630 640, 1622 560" fill="none" stroke="#5E4A36" strokeWidth={9} strokeLinecap="round" />
          <path d="M 1622 640 L 1580 590 M 1624 610 L 1672 560" stroke="#5E4A36" strokeWidth={5} strokeLinecap="round" />
          <Foliage x={1622} y={520} r={86} seed={9 + seed} t={t} dark="#4A6A34" light="#7A9A54" n={16} />
          <Foliage x={1570} y={590} r={44} seed={10 + seed} t={t} dark="#4A6A34" light="#7A9A54" n={8} />
          <Foliage x={1690} y={566} r={48} seed={11 + seed} t={t} dark="#4A6A34" light="#7A9A54" n={8} />
        </g>
      )}
    </g>
  );
};
