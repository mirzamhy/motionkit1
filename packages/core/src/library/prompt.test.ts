import assert from 'node:assert/strict';
import test from 'node:test';
import { susunPrompt } from './prompt';
import { ITEMS } from './index';

const serupa = (benda: string) => ITEMS.filter((i) => i.meta.benda === benda);

test('kode prompt names the file contract, the preview loop and the look rules', () => {
  const p = susunPrompt({ benda: 'bangku', gaya: 'stik', target: 'kode', serupa: [] });
  assert.match(p, /bangku-stik/);
  assert.match(p, /Item2D/);
  assert.match(p, /item preview bangku-stik/);
  assert.match(p, /maksimal 3 putaran/);
  assert.match(p, /#060A13/);
});

test('3d look uses Item3D and poly count for poly3d', () => {
  assert.match(susunPrompt({ benda: 'pos-ronda', gaya: 'poly3d', target: 'kode', serupa: [] }), /Item3D/);
  assert.match(susunPrompt({ benda: 'pos-ronda', gaya: 'poly3d', target: '3d', serupa: [] }), /500–3000 segitiga/);
});

test('similar assets in other looks are listed as proportion references', () => {
  const p = susunPrompt({ benda: 'gunung', gaya: 'stik', target: 'gambar', serupa: serupa('gunung') });
  assert.match(p, /gunung-poly3d \(poly3d\)/);
  assert.match(susunPrompt({ benda: 'sepeda', gaya: 'stik', target: 'gambar', serupa: [] }), /belum ada aset serupa/);
});

test('ukuran and catatan are carried through; bad input is refused', () => {
  const p = susunPrompt({ benda: 'bangku', gaya: 'stik', target: '3d', ukuran: '1,6 × 0,9 × 0,5 m', catatan: 'kayu', serupa: [] });
  assert.match(p, /1,6 × 0,9 × 0,5 m/);
  assert.match(p, /Catatan: kayu/);
  assert.throws(() => susunPrompt({ benda: '3d', gaya: 'stik', target: 'kode', serupa: [] }), /huruf/);
  assert.throws(() => susunPrompt({ benda: 'bangku', gaya: 'xx', target: 'kode', serupa: [] }), /gaya/);
  assert.throws(() => susunPrompt({ benda: 'bangku', gaya: 'stik', target: 'xx' as never, serupa: [] }), /target/);
});
