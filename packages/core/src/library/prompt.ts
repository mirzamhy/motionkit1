// `mk aset prompt <benda> <gaya> --target kode|gambar|3d`: a ready-to-paste prompt for making an asset. Pure: the CLI
// passes in what the library already knows; nothing here calls a model or an API.
import { gayaBySlug, type Gaya } from '../styles';
import type { LibraryItem } from './types';

export type TargetPrompt = 'kode' | 'gambar' | '3d';
export const TARGET_PROMPT: TargetPrompt[] = ['kode', 'gambar', '3d'];

/** drawing rules per look, one line each; the look's README/refs hold the full recipe */
const ATURAN: Record<string, string[]> = {
  stik: [
    'garis luar #060A13 setebal 4 unit (2,5–3 untuk bagian kecil), isi datar, gradien hanya untuk kaca atau interior hangat',
    'palet dingin gelap dengan satu aksen hangat; tidak ada wajah pada tokoh',
    '1 m = 150 px dunia gaya (benda sangat besar boleh memakai pxPerM)',
  ],
  poly3d: [
    'low-poly, flat shading, tekstur prosedural bila perlu; satuan meter, titik asal di tengah dasar, +y ke atas',
    'bentuk dibaca dari jauh: siluet jelas, detail kecil seperlunya',
  ],
};

export type BahanPrompt = {
  benda: string;
  gaya: string;
  target: TargetPrompt;
  ukuran?: string;
  catatan?: string;
  /** the same benda in other looks (for proportions and variants) */
  serupa: LibraryItem[];
};

const acuanSerupa = (b: BahanPrompt) =>
  b.serupa.length
    ? b.serupa.map(({ meta }) => `- ${meta.id} (${meta.gaya}): ${meta.size.join(' × ')} m${meta.variants?.length ? `, varian ${meta.variants.join(', ')}` : ''}`).join('\n')
    : '- belum ada aset serupa di gaya lain';

const ukuranBaris = (b: BahanPrompt) => (b.ukuran ? `Ukuran nyata: ${b.ukuran}.` : 'Ukuran nyata: tentukan yang masuk akal dan tulis di meta.size.');

const kode = (b: BahanPrompt, g: Gaya) => {
  const id = `${b.benda}-${g.slug}`;
  const kontrak = g.dimensi === '3d' ? 'Item3D (meter, asal di tengah dasar, +y atas; `t` = frame 30 fps)' : 'Item2D (x, y = titik menyentuh tanah; s = piksel per meter; `t` = frame 30 fps)';
  return `Buat aset pustaka MotionKit \`${id}\` (gaya ${g.nama}).

Kerja:
1. Baca AGENTS.md bagian "Pustaka dulu (aset per gaya)", docs/scenes/ITEMS.md, packages/core/src/library/types.ts${g.resep ? ` dan resep gaya: packages/core/src/${g.resep}` : ''}.
2. Jalankan \`node bin/mk.mjs aset baru ${b.benda} ${g.slug}\` untuk kerangkanya, lalu gambar isinya.
3. Lihat hasilnya: \`node bin/mk.mjs item preview ${id}\`, BUKA gambar preview dan nilai proporsi, garis, palet. Perbaiki, maksimal 3 putaran.
4. Tandai bagian yang direka di refs.md; tulis acuan bila ada. Jalankan \`node bin/mk.mjs aset peta\` dan tes: \`npx tsx --test packages/core/src/library/*.test.ts\`.

Kontrak: ${kontrak}.
${ukuranBaris(b)}
Gaya: ${g.ringkas}
Aturan gaya:
${(ATURAN[g.slug] ?? ['lihat `mk gaya show ' + g.slug + '`']).map((a) => `- ${a}`).join('\n')}
Aset serupa sebagai acuan proporsi dan varian:
${acuanSerupa(b)}${b.catatan ? `\nCatatan: ${b.catatan}` : ''}

Jangan menyalin logo, merek, atau tanda tangan nyata. Model yang disarankan untuk menggambar: Sonnet atau lebih tinggi; Haiku cukup untuk kerangka dan varian.`;
};

const gambar = (b: BahanPrompt, g: Gaya) => `Gambar acuan satu benda: ${b.benda}.
Gaya: ${g.ringkas}
Satu benda saja, di tengah, latar polos terang, sudut pandang tetap (depan atau tiga perempat), pencahayaan merata.
Tanpa teks, merek, logo, atau orang.${b.ukuran ? `\nUkuran nyata: ${b.ukuran}.` : ''}${b.catatan ? `\nCatatan: ${b.catatan}` : ''}
Aset serupa untuk dibandingkan:
${acuanSerupa(b)}
Pakai hasilnya hanya sebagai acuan; catat sumber dan lisensinya di refs.md.`;

const model3d = (b: BahanPrompt, g: Gaya) => `Model 3D satu benda: ${b.benda}, ${g.slug === 'poly3d' ? 'low-poly flat-shaded' : 'realistis'}.
Satu benda, pose netral, tanpa alas, latar, atau teks. ${g.slug === 'poly3d' ? 'Sekitar 500–3000 segitiga, warna datar.' : 'Maksimal 50.000 segitiga, tekstur PBR.'}
Skala dalam meter, asal di tengah dasar, +y ke atas. Keluaran: GLB.${b.ukuran ? `\nUkuran nyata: ${b.ukuran}.` : ''}${b.catatan ? `\nCatatan: ${b.catatan}` : ''}
Aset serupa untuk dibandingkan:
${acuanSerupa(b)}
Periksa lisensi keluaran sebelum dipakai (paket gratis sering tidak boleh komersial); catat di refs.md.`;

export const susunPrompt = (b: BahanPrompt) => {
  const g = gayaBySlug(b.gaya);
  if (!g) throw new Error(`gaya "${b.gaya}" bukan slug terdaftar (mk gaya list)`);
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(b.benda)) throw new Error(`benda "${b.benda}" harus diawali huruf, lalu huruf kecil/angka dengan strip`);
  if (!TARGET_PROMPT.includes(b.target)) throw new Error(`--target harus salah satu: ${TARGET_PROMPT.join(', ')}`);
  return (b.target === 'kode' ? kode : b.target === 'gambar' ? gambar : model3d)(b, g);
};
