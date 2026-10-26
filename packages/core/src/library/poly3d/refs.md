# Low-poly 3D: acuan

Aset low-poly 3D disalin dari dua proyek pengguna dan tidak memakai foto acuan; bentuknya stilisasi sendiri.
Sumber kode: `C:\Mirza Personal\volcano-whatif\src` (bus, gunung, pohon bulat) dan `C:\Mirza Personal\simulif-gravity`
(taman, rumput, gedung, bumi; kini di `packages/core/src/templates/whatif-sim/three`). Proyek asal tidak diubah.

## bumi-poly3d

Bola jari-jari 1 m, tekstur dari `planet.ts`. Tidak ada foto; benua dan awan reka dari noise.

## bus-poly3d
Dari `volcano-whatif/src/scenes/rainier.tsx` (`SchoolBus`). Hanya warna kuning dipakai di Shot01–08, jadi satu varian.

## pohon-poly3d
`bulat` dari `volcano-whatif/src/three/kit.tsx` (`Tree`), `taman` dari `Park.tsx` simulif-gravity. Dua tampilan lama = dua varian.

## gunung-poly3d
`Volcano` dari `volcano-whatif/src/three/kit.tsx`. Preset: `vesuvius` (Shot01, r 140 h 48), `sakura` (r 240 h 150), `rainier` (r 330 h 170 + tudung salju). `meta.size` memuat preset terbesar (rainier); ukuran terukur di preview adalah baris pertama (vesuvius).

## rumput-poly3d
`Grass` + `useGrass` dari simulif-gravity (`three/Grass.tsx`, kini di sini). Film taman memakai hamparan global (dua zona, dengan lubang untuk alas dan air mancur); item ini hamparan 10 × 10 m tanpa lubang, `time = t / 30`. Satu warna (hijau): warna kering tidak ada di shader.

## gedung-poly3d
Satu bangunan dari perulangan `City` (`three/Park.tsx`). Rentang ukuran: baris depan tinggi 6–10 dan 10–16 m, menara belakang 30–70 m.
