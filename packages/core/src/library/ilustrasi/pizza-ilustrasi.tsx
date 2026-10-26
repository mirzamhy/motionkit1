// Pizza (ilustrasi): pembungkus Pizza dari scenes/PizzaScene.tsx, pizza utuh dilihat dari atas dengan pinggiran
// bergelembung, keju meleleh, pepperoni, zaitun, jamur, dan basil. Digambar dengan jari-jari 270 satuan (PC.r),
// yaitu 0,175 m, jadi pizza berdiameter 0,35 m. Titik (x, y) ada di tepi bawah pizza (tempat menyentuh meja);
// pusatnya satu jari-jari di atasnya.
import React, { useMemo } from 'react';
import type { Item2DProps, ItemMeta } from '../types';
import { Defs, Pizza, buildPizza } from '../../scenes/PizzaScene';

export const meta: ItemMeta = {
  id: 'pizza-ilustrasi',
  name: 'Pizza utuh tampak atas (ilustrasi)',
  benda: 'pizza',
  gaya: 'ilustrasi',
  category: 'properti',
  tags: ['pizza', 'makanan', 'pepperoni', 'keju', 'tampak atas', 'bitcoin pizza', 'food', 'cheese', 'top-down', 'meal'],
  size: [0.35, 0.35, 0.04],
  variants: ['utuh'],
  refs: 'packages/core/src/library/ilustrasi/refs.md',
  file: 'packages/core/src/library/ilustrasi/pizza-ilustrasi.tsx',
  komponen: [{ nama: 'PizzaScene', dari: 'PizzaScene' }],
  invented: ['topping dan penempatannya acak berbenih (seed 77), bukan foto pizza tertentu', 'diameter 0,35 m dipilih (pizza ukuran sedang)'],
};

const R_UNITS = 270; // PC.r di PizzaScene
const R_METRES = 0.175;

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, flip }) => {
  const d = useMemo(() => buildPizza(), []);
  const k = s * (R_METRES / R_UNITS);
  return (
    <g transform={`translate(${x} ${y - R_METRES * s}) scale(${flip ? -k : k} ${k})`}>
      <Defs />
      <Pizza d={d} />
    </g>
  );
};
