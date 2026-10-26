// The looks MotionKit can shoot in. One entry per look; the library folder holds that look's assets
// (`mk gaya list`, `mk gaya show <slug>`). Naming: an asset is `<benda>-<gaya>`. See docs/superpowers/specs/2026-10-27-aset-per-gaya-design.md.
export type GayaSlug = 'stik' | 'poly' | 'poly3d' | 'model3d' | 'flanel' | 'ilustrasi';

export type Gaya = {
  slug: GayaSlug;
  nama: string;
  dimensi: '2d' | '3d';
  ringkas: string;
  /** folder under packages/core/src/library; null = the old per-category folders */
  folder: string | null;
  /** scene ids (manifest.ts) to copy from */
  contoh: string[];
  /** the look's recipe, relative to packages/core/src */
  resep?: string;
};

export const GAYA: Gaya[] = [
  { slug: 'stik', nama: 'Stik Polos', dimensi: '2d', ringkas: 'Stickman abu-abu tanpa wajah, garis tebal, palet dingin dengan satu aksen hangat.', folder: 'stik-polos', contoh: ['StikAndaiRumah', 'StikAndaiOjol'], resep: 'styles/stik-polos/README.md' },
  { slug: 'poly3d', nama: 'Low-poly 3D', dimensi: '3d', ringkas: 'Bentuk low-poly flat-shaded di ThreeCanvas, tekstur prosedural, kamera bebas.', folder: 'poly3d', contoh: ['WhatIfGravity'], resep: 'templates/whatif-sim/README.md' },
  { slug: 'poly', nama: 'Low-poly 2D', dimensi: '2d', ringkas: 'Segitiga datar berwarna di SVG. Belum ada contoh.', folder: 'poly', contoh: [] },
  { slug: 'model3d', nama: 'Model GLB realistis', dimensi: '3d', ringkas: 'Model glTF (Poly Haven dsb.) dibungkus Item3D. Belum ada contoh.', folder: 'model3d', contoh: [] },
  { slug: 'flanel', nama: 'Kain flanel 3D (Jajan Dulu)', dimensi: '3d', ringkas: 'Tokoh dan benda dari kain flanel, rig badan di packages/three/src/jajan.', folder: 'flanel', contoh: ['TeaserTudung', 'TeaserLapak'] },
  { slug: 'ilustrasi', nama: 'Ilustrasi SVG berlapis', dimensi: '2d', ringkas: 'Gambar SVG bersumber foto acuan: pelabuhan, kampus, pasar.', folder: 'ilustrasi', contoh: ['PelabuhanIlustrasi', 'UnairScene'] },
];

export const gayaBySlug = (s: string) => GAYA.find((g) => g.slug === s);
