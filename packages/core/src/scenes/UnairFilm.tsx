// "Kain Kuning Biru" — the founding of Universitas Airlangga. Nine hand-built shots, dissolves between them,
// cut to the recorded voice-over (public/unair-vo.mp3). Drawn from the references in projects/unair-sejarah/refs.md.
//
// How the picture follows the voice: the recording was split at its pauses into ten passages (P1–P10, times
// below). Each shot is as long as its passage plus breathing room (half a second before, about a second after),
// so no passage runs into the next. Inside a shot, `warp` maps the new clock onto the shot's own beat clock, so
// each drawn event (flag down, boards up, signature, label, rope pull) lands on the word that names it. Ambient
// motion (flags, leaves, footsteps) keeps running on real frames.
import React from 'react';
import { Film, type Shot, filmFrames } from './film';
import { Defs2 } from './UnairParts';
import { Defs, FONTS, NiasShot } from './UnairScene';
import { Ceremony, Classroom, Stovit } from './UnairShotsA';
import { ArcaShot, Decree, GateYears, Tugu } from './UnairShotsB';

const LEAD = 30; // frames of picture before the voice comes in
const f = FONTS;

const SHOTS: Shot[] = [
  {
    dur: 810,
    label: 'SURABAYA · 10 NOVEMBER 1954',
    age: 0.14,
    warp: [[0, 0], [493, 400], [810, 780]],
    draw: (u, a) => <Ceremony u={u} f={f} mode="veiled" a={a} />,
    portrait: [[0, 1010, 560, 1.2]],
    fill: ['#8FB7CF', '#3F5A2C'],
    caps: [
      [30, 266, 'Surabaya, 10 November 1954.'],
      [300, 459, 'Selembar kain kuning-biru menutupi sebuah patung.'],
      [493, 760, 'Sebelum kain itu ditarik, ceritanya sudah berjalan 41 tahun.'],
    ],
    vo: [{ at: LEAD, from: 0, to: 11.89 }],
  },
  {
    dur: 630,
    label: 'SURABAYA · 1923',
    age: 0.16,
    draw: (u) => <NiasShot t={u} f={f} dur={630} />,
    portrait: [[0, 980, 560, 1.3]],
    fill: ['#8FB7CF', '#3F5A2C'],
    caps: [
      [30, 368, '1913: NIAS dibuka. Sekolah dokter untuk pemuda Hindia.'],
      [401, 592, 'Sepuluh tahun kemudian, sekolah itu pindah ke gedung ini.'],
    ],
    vo: [{ at: LEAD, from: 12.61, to: 21.82 }],
  },
  {
    dur: 566,
    label: 'RUANG KULIAH NIAS · ± 1925',
    age: 0.16,
    draw: (u, a) => <Classroom u={u} dur={566} a={a} />,
    portrait: [[0, 560, 540, 1.3], [170, 560, 540, 1.3], [400, 1160, 540, 1.3]], // teacher first, then the pupils
    fill: ['#F2EBDA', '#2E2A26'],
    caps: [
      [30, 181, 'Murid berjas putih, guru dari Belanda.'],
      [209, 526, 'Lulusan pertamanya, 1923, bergelar Indisch Arts.'],
    ],
    vo: [{ at: LEAD, from: 22.34, to: 30.44 }],
  },
  {
    dur: 600,
    label: 'SURABAYA · 1928',
    age: 0.12,
    warp: [[0, 0], [335, 150], [600, 415]], // the count of 21 starts on "Angkatan pertamanya"
    draw: (u, a, P) => <Stovit u={u} dur={415} f={f} a={a} P={P} />,
    portrait: [[0, 960, 540, 1.3]],
    fill: ['#3F8FD0', '#3F5A2C'],
    caps: [
      [30, 307, '1928: menyusul STOVIT, sekolah dokter gigi.'],
      [335, 572, 'Angkatan pertamanya: 21 siswa.'],
    ],
    vo: [{ at: LEAD, from: 30.93, to: 38.44 }],
  },
  {
    dur: 1262,
    age: 0.18,
    // "Tahun 1942" · "Jepang datang" · "NIAS ditutup" · "Tahun 1945" · "Tahun 1948" · "dibuka lagi"
    warp: [[0, 0], [267, 158], [410, 200], [489, 230], [560, 290], [572, 350], [640, 420], [794, 500], [824, 508], [900, 532], [1060, 600], [1262, 780]],
    draw: (u, a, P) => <GateYears u={u} f={f} a={a} P={P} />,
    portrait: [[0, 1040, 620, 1.0]],
    fill: ['#8FB7CF', '#3F5A2C'],
    caps: [
      [30, 238, 'Penguasa berganti. Papan nama ikut berganti.'],
      [267, 543, '1942: Jepang datang. NIAS ditutup.'],
      [572, 794, '1945: Indonesia merdeka.'],
      [824, 1212, '1948: dibuka lagi, sebagai cabang Universitas Indonesia.'],
    ],
    vo: [{ at: LEAD, from: 38.98, to: 58.52 }],
  },
  {
    dur: 869,
    label: 'DJAKARTA · 1 NOVEMBER 1954',
    age: 0.1,
    // signature on "menandatangani"; the map arrives for the second sentence; "hukum" · "pendidikan guru" · "jadi satu"
    warp: [[0, 0], [282, 150], [372, 240], [420, 330], [480, 402], [495, 420], [644, 490], [710, 550], [750, 600], [869, 720]],
    draw: (u, a, P) => <Decree u={u} f={f} a={a} P={P} />,
    // the document, then back off for the whole map, then in on East Java and the name
    portrait: [[0, 700, 560, 1.2], [420, 700, 560, 1.2], [500, 1060, 540, 0.7], [690, 1060, 540, 0.7], [790, 1130, 720, 1.02]],
    fill: ['#5E3F27', '#5E3F27'],
    caps: [
      [30, 448, '1 November 1954: Presiden Soekarno menandatangani PP No. 57.'],
      [475, 822, 'Kedokteran, kedokteran gigi, hukum, pendidikan guru: jadi satu universitas.'],
    ],
    vo: [{ at: LEAD, from: 59.0, to: 71.98 }],
  },
  {
    dur: 738,
    label: 'ARCA BELAHAN · ABAD KE-11',
    age: 0.06,
    // "Airlangga" · "Wisnu menunggang Garuda" · "guci amerta" · "Air kehidupan"
    warp: [[0, 0], [60, 190], [75, 230], [260, 300], [310, 330], [419, 420], [524, 470], [738, 700]],
    draw: (u, a, P) => <ArcaShot u={u} f={f} a={a} P={P} />,
    portrait: [[0, 960, 640, 0.92]],
    fill: ['#0E0A07', '#0E0A07'],
    caps: [
      [30, 243, 'Namanya dari Airlangga, raja Jawa Timur abad ke-11.'],
      [265, 502, 'Lambangnya: Wisnu menunggang Garuda, membawa guci amerta.'],
      [524, 692, 'Air kehidupan. Ilmu yang tak habis.'],
    ],
    vo: [{ at: LEAD, from: 72.39, to: 83.03 }],
  },
  {
    dur: 700,
    label: 'SURABAYA · 10 NOVEMBER 1954',
    age: 0.14,
    // the rope is pulled on "Kain itu ditarik"; from there the cloth runs in real time (it is a physics run)
    warp: [[0, 0], [270, 150], [290, 170], [700, 580]],
    draw: (u, a) => <Ceremony u={u} f={f} mode="unveil" a={a} />,
    // statue, then follow the cloth down to the right, then left to the flag going up
    portrait: [[0, 1000, 600, 1.15], [300, 1000, 600, 1.15], [360, 1130, 640, 1.15], [450, 1130, 640, 1.15], [540, 900, 560, 1.15]],
    fill: ['#8FB7CF', '#3F5A2C'],
    caps: [
      [30, 264, '10 November 1954, Hari Pahlawan.'],
      [290, 370, 'Kain itu ditarik.'],
      [381, 600, 'Kuning dan birunya menjadi warna universitas.'],
    ],
    vo: [{ at: LEAD, from: 83.42, to: 91.87 }],
  },
  {
    dur: 790,
    label: 'KAMPUS C · HARI INI',
    age: 0,
    // the gold line runs on "Airnya masih mengalir"; the title comes up with its own line of voice-over
    warp: [[0, 0], [249, 480], [330, 528], [400, 560], [420, 590], [790, 780]],
    draw: (u, a, P) => <Tugu u={u} f={f} dur={780} a={a} P={P} />,
    portrait: [[0, 960, 560, 1.05]],
    fill: ['#3F8FD0', '#E9E4D8'],
    caps: [
      [30, 229, 'Hari ini, sosok yang sama menyambut di gerbang kampus.'],
      [249, 380, 'Airnya masih mengalir.'],
    ],
    vo: [
      { at: LEAD, from: 92.3, to: 97.43 },
      { at: 404, from: 97.79, to: 102.81 },
    ],
  },
];

export const UNAIR_SCENE_FRAMES = filmFrames(SHOTS);

/** `vo`: file name of the recording in the public dir (see scenes/manifest.ts); null renders the film silent */
export const UnairScene: React.FC<{ vo?: string | null; portrait?: boolean }> = ({ vo = null, portrait = false }) => (
  <Film
    width={portrait ? 1080 : 1920}
    height={portrait ? 1920 : 1080}
    shots={SHOTS}
    fonts={FONTS}
    vo={vo}
    defs={
      <>
        <Defs />
        <Defs2 />
      </>
    }
  />
);
