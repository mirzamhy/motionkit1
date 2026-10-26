// The saved definition of the "Stik Polos" style. A style is a look (this file + kit.tsx), plus its parts library
// (library/stik-polos) and the weather it can be shot in (cuaca.tsx). Films pick a story, parts and a weather.
import { C } from './kit';
import { CUACA_IDS } from './cuaca';

export const STIK_POLOS = {
  id: 'stik-polos',
  nama: 'Stik Polos',
  ringkas: 'Stickman abu-abu tanpa wajah, garis luar tebal, warna dingin dengan satu aksen hangat, kamera meloncat antar tokoh.',
  /** story formats that suit the look */
  format: ['rantai-andai'],
  /** weather it can be shot in: a parameter of the film, not part of the look */
  cuaca: CUACA_IDS,
  /** 9:16 reels, 10–15 s at 30-fps beats */
  layar: { lebar: 1080, tinggi: 1920, detik: [10, 15] },
  /** world units: 1 m = 150 px, ground at y = 880 (vehicles) / 800 (buildings) */
  dunia: { pxPerMeter: 150, ground: 880, curb: 800 },
  palet: C,
  /** where each layer lives, relative to packages/core/src */
  lokasi: {
    gaya: 'styles/stik-polos/kit.tsx',
    cuaca: 'styles/stik-polos/cuaca.tsx',
    pustaka: 'library/stik-polos/index.tsx',
    film: 'scenes/stik-polos/',
    resep: 'styles/stik-polos/README.md',
  },
} as const;
