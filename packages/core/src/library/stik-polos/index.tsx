// The "Stik Polos" parts library: every person, vehicle, building and prop drawn in the style, saved so the next film
// starts from them. They join the main item library (library/index.ts), so `mk item find`, `mk item preview <id>` and
// `mk kit find` see them. Recipe and rules: packages/core/src/styles/stik-polos/README.md.
//
// World: 1 m = 150 px (a stickman is about 1.7 m, 255 px). Each part is drawn at the coordinates it has in a film's
// world and wrapped here, so Item2D takes the shared props (x, y = where it meets the ground, s = px per metre).
// `t` is a frame number in 30-fps units: pass the film's own frame, or the preview's frame.
import React from 'react';
import type { Item2DProps, ItemMeta, LibraryItem } from '../types';
import { SANS } from '../../styles/stik-polos/kit';
import { OrangStik, POSE_ORANG } from './orang';
import { Car, Couple, Hospital, Kiosk, KioskGuy, LampuLaluLintas, MotorOjol, Ojol } from './set-jalan';
import { Kos, KprHouse, Lamp, Mansion, Petak } from './set-rumah';

export const STYLE_ID = 'stik-polos';
const PX_PER_M = 150;
const SEPIA = { cream: '#F6EEDC', scooter: '#C9A46A', box: '#B48A55' };

type Def = {
  id: string;
  nama: string;
  kategori: ItemMeta['category'];
  tags: string[];
  /** where the part sits in world pixels: [x0, y0, x1, y1] */
  bbox: [number, number, number, number];
  /** the point that meets the ground, in the same world pixels */
  anchor: [number, number];
  variants?: string[];
  invented?: string[];
  draw: (a: { t: number; variant: string }) => React.ReactNode;
};

const part = (d: Def): LibraryItem => {
  const [x0, y0, x1, y1] = d.bbox;
  const meta: ItemMeta = {
    id: d.id,
    name: d.nama,
    category: d.kategori,
    tags: ['stik polos', 'stickman', 'gaya', ...d.tags],
    style: STYLE_ID,
    size: [Math.round(((x1 - x0) / PX_PER_M) * 100) / 100, Math.round(((y1 - y0) / PX_PER_M) * 100) / 100, 0.6],
    variants: d.variants,
    refs: 'packages/core/src/library/stik-polos/refs.md',
    file: 'packages/core/src/library/stik-polos/index.tsx',
    invented: d.invented ?? ['seluruh gambar adalah stilisasi sendiri, bukan replika benda nyata'],
  };
  const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, variant, flip }) => {
    const k = s / PX_PER_M;
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) translate(${-d.anchor[0]} ${-d.anchor[1]})`}>
        {d.draw({ t, variant: variant ?? d.variants?.[0] ?? 'default' })}
      </g>
    );
  };
  return { meta, Item2D };
};

export const ITEMS_STIK_POLOS: LibraryItem[] = [
  // ── orang ──
  part({
    id: 'orang-stik', nama: 'Orang stik (tokoh dasar, lima pose)', kategori: 'orang',
    tags: ['orang', 'manusia', 'tokoh', 'karakter', 'person', 'character', 'berdiri', 'jalan', 'duduk', 'sedih', 'tertawa', 'stress'],
    bbox: [-46, -260, 46, 4], anchor: [0, 0], variants: POSE_ORANG,
    draw: ({ t, variant }) => <OrangStik t={t} pose={variant as (typeof POSE_ORANG)[number]} />,
  }),
  part({
    id: 'ojol-stik', nama: 'Ojol: pengendara bermotor dengan box kirim', kategori: 'orang',
    tags: ['ojol', 'ojek online', 'kurir', 'driver', 'delivery', 'motor', 'pengendara', 'helm'],
    bbox: [30, 602, 252, 886], anchor: [141, 880], variants: ['dingin', 'impian'],
    draw: ({ t, variant }) => <Ojol frame={t} pal={variant === 'impian' ? SEPIA : {}} cold={variant !== 'impian'} />,
  }),
  part({
    id: 'pasangan-poncho-stik', nama: 'Pasangan dan anak satu motor berjas hujan', kategori: 'orang',
    tags: ['pasangan', 'keluarga', 'anak', 'jas hujan', 'poncho', 'boncengan', 'couple', 'family', 'motor', 'hujan'],
    bbox: [772, 636, 980, 886], anchor: [876, 880], variants: ['dingin', 'tenang'],
    draw: ({ t, variant }) => <Couple frame={t} cold={variant !== 'tenang'} />,
  }),
  part({
    id: 'penjual-kopi-stik', nama: 'Orang duduk santai minum kopi', kategori: 'orang',
    tags: ['santai', 'kopi', 'duduk', 'bangku', 'bebas', 'relax', 'coffee', 'bench'],
    bbox: [1082, 598, 1258, 796], anchor: [1170, 792], variants: ['bangku', 'tanpa-bangku'],
    draw: ({ t, variant }) => <KioskGuy frame={t} bench={variant !== 'tanpa-bangku'} />,
  }),

  // ── kendaraan ──
  part({
    id: 'motor-ojol-stik', nama: 'Motor matic ojol dengan box kirim', kategori: 'kendaraan-darat',
    tags: ['motor', 'matic', 'skuter', 'scooter', 'ojol', 'box', 'kurir', 'sepeda motor'],
    bbox: [30, 696, 252, 886], anchor: [141, 880], variants: ['biru', 'emas'],
    draw: ({ t, variant }) => <MotorOjol pal={variant === 'emas' ? SEPIA : {}} spin={t * 12} />,
  }),
  part({
    id: 'mobil-stik', nama: 'Mobil kecil dengan sopir dan tagihan', kategori: 'kendaraan-darat',
    tags: ['mobil', 'car', 'sopir', 'cicilan', 'tagihan', 'kredit', 'sedan', 'kendaraan'],
    bbox: [294, 658, 722, 886], anchor: [508, 880],
    draw: ({ t }) => <Car frame={t} spin={t * 6} />,
  }),

  // ── bangunan ──
  part({
    id: 'rumah-sakit-stik', nama: 'Rumah sakit: gedung dengan jendela pasien di ranjang', kategori: 'bangunan',
    tags: ['rumah sakit', 'hospital', 'pasien', 'infus', 'jendela', 'gedung', 'sakit', 'ranjang'],
    bbox: [753, -58, 1217, 802], anchor: [985, 800], variants: ['lampu-merah', 'lampu-hijau', 'jendela-hangat'],
    draw: ({ t, variant }) => <Hospital frame={t} red={variant === 'lampu-hijau' ? 0 : 1} glow={variant === 'jendela-hangat' ? 1 : 0} font={SANS} />,
  }),
  part({
    id: 'warung-kopi-stik', nama: 'Warung kopi bertenda belang', kategori: 'bangunan',
    tags: ['warung', 'kios', 'kopi', 'tenda', 'toko', 'kedai', 'stall', 'kiosk', 'coffee', 'awning'],
    bbox: [1028, 510, 1320, 796], anchor: [1174, 792], variants: ['dengan-orang', 'kosong'],
    draw: ({ t, variant }) => <Kiosk frame={t} penjual={variant !== 'kosong'} />,
  }),
  part({
    id: 'kos-stik', nama: 'Kos-kosan sempit: kamar atap bocor, ember, laptop', kategori: 'bangunan',
    tags: ['kos', 'kosan', 'kamar', 'sempit', 'bocor', 'ember', 'mahasiswa', 'room', 'leak', 'student'],
    bbox: [0, 290, 362, 802], anchor: [180, 800],
    draw: ({ t }) => <Kos frame={t} />,
  }),
  part({
    id: 'rumah-kpr-stik', nama: 'Rumah KPR: genteng, meja, tumpukan tagihan', kategori: 'bangunan',
    tags: ['rumah', 'kpr', 'cicilan', 'kredit', 'tagihan', 'house', 'mortgage', 'genteng', 'bapak'],
    bbox: [416, 396, 864, 802], anchor: [640, 800],
    draw: ({ t }) => <KprHouse frame={t} />,
  }),
  part({
    id: 'rumah-mewah-stik', nama: 'Rumah mewah dua lantai: meja makan panjang, pagar besi', kategori: 'bangunan',
    tags: ['rumah mewah', 'mansion', 'kaya', 'villa', 'pagar', 'meja makan', 'sepi', 'sendiri', 'rich'],
    bbox: [923, 332, 1557, 802], anchor: [1240, 800],
    draw: ({ t }) => <Mansion frame={t} />,
  }),
  part({
    id: 'rumah-petak-stik', nama: 'Rumah petak: jendela hangat, keluarga ngobrol di atas tikar', kategori: 'bangunan',
    tags: ['rumah petak', 'kontrakan', 'sederhana', 'keluarga', 'hangat', 'tikar', 'cukup', 'family', 'warm', 'home'],
    bbox: [1610, 582, 1912, 802], anchor: [1761, 800],
    draw: ({ t }) => <Petak frame={t} glow={1} />,
  }),

  // ── properti ──
  part({
    id: 'lampu-jalan-stik', nama: 'Lampu jalan melengkung dengan cahaya hangat', kategori: 'properti',
    tags: ['lampu jalan', 'lampu', 'street lamp', 'tiang', 'cahaya', 'malam', 'light'],
    bbox: [-34, 456, 100, 802], anchor: [0, 800],
    draw: ({ t }) => <Lamp x={0} frame={t} />,
  }),
  part({
    id: 'lampu-lalu-lintas-stik', nama: 'Lampu lalu lintas (merah / hijau)', kategori: 'properti',
    tags: ['lampu merah', 'lampu lalu lintas', 'traffic light', 'rambu', 'persimpangan', 'perempatan'],
    bbox: [983, 407, 1029, 802], anchor: [1006, 800], variants: ['merah', 'hijau'],
    draw: ({ variant }) => <LampuLaluLintas red={variant === 'hijau' ? 0 : 1} />,
  }),
];
