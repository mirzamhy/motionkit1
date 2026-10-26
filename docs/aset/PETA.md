# Peta aset

<!-- Dibuat oleh `node bin/mk.mjs aset peta`. Jangan disunting; `mk gate` gagal bila berbeda. -->

Cari dulu: `mk aset find <benda>`. Buat yang belum ada: `mk aset baru <benda> <gaya>`.

## Matriks benda × gaya

| benda | stik | poly3d | poly | model3d | flanel | ilustrasi |
|---|---|---|---|---|---|---|
| bumi | ✗ | ✔ `bumi-poly3d` | ✗ | ✗ | ✗ | ✗ |
| bus | ✗ | ✔ `bus-poly3d` | ✗ | ✗ | ✗ | ✗ |
| gudang | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `gudang-pelabuhan` |
| gunung | ✗ | ✔ `gunung-poly3d` | ✗ | ✗ | ✗ | ✗ |
| kos | ✔ `kos-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| lampu-jalan | ✔ `lampu-jalan-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| lampu-lalu-lintas | ✔ `lampu-lalu-lintas-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| mobil | ✔ `mobil-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| motor-ojol | ✔ `motor-ojol-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| ojol | ✔ `ojol-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| orang | ✔ `orang-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| pasangan-poncho | ✔ `pasangan-poncho-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| penjual-kopi | ✔ `penjual-kopi-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| perahu | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `perahu-kajang` |
| pohon | ✗ | ✔ `pohon-poly3d` | ✗ | ✗ | ✗ | ✗ |
| rumah-kpr | ✔ `rumah-kpr-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumah-mewah | ✔ `rumah-mewah-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumah-petak | ✔ `rumah-petak-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumah-sakit | ✔ `rumah-sakit-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| tiang-tambat | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `tiang-tambat` |
| warung-kopi | ✔ `warung-kopi-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |

## Aset

### bumi-poly3d
- 3D · 2 × 2 × 2 m · varian: berawan, polos
- dipakai: WhatIfGravity
- acuan: `packages/core/src/library/poly3d/refs.md`

### bus-poly3d
- 3D · 11.5 × 3.1 × 2.65 m · varian: kuning
- dipakai: -
- acuan: `packages/core/src/library/poly3d/refs.md`

### gudang-pelabuhan
- 2D · 30 × 8.2 × 14 m · varian: panjang, pendek, tutup
- dipakai: PelabuhanProof
- acuan: `packages/core/src/library/bangunan/gudang-pelabuhan/refs.md`

### gunung-poly3d
- 3D · 660 × 170 × 660 m · varian: vesuvius, sakura, rainier
- dipakai: -
- acuan: `packages/core/src/library/poly3d/refs.md`

### kos-stik
- 2D · 2.41 × 3.41 × 0.6 m · varian: -
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### lampu-jalan-stik
- 2D · 0.89 × 2.31 × 0.6 m · varian: -
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### lampu-lalu-lintas-stik
- 2D · 0.31 × 2.63 × 0.6 m · varian: merah, hijau
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### mobil-stik
- 2D · 2.85 × 1.52 × 0.6 m · varian: -
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### motor-ojol-stik
- 2D · 1.48 × 1.27 × 0.6 m · varian: biru, emas
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### ojol-stik
- 2D · 1.48 × 1.89 × 0.6 m · varian: dingin, impian
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### orang-stik
- 2D · 0.61 × 1.76 × 0.6 m · varian: berdiri, berjalan, duduk, menunduk, tertawa
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### pasangan-poncho-stik
- 2D · 1.39 × 1.67 × 0.6 m · varian: dingin, tenang
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### penjual-kopi-stik
- 2D · 1.17 × 1.32 × 0.6 m · varian: bangku, tanpa-bangku
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### perahu-kajang
- 2D+3D · 12.5 × 11.5 × 3 m · varian: tergulung, terkembang, darat
- dipakai: PelabuhanProof
- acuan: `packages/core/src/library/kendaraan-air/perahu-kajang/refs.md`

### pohon-poly3d
- 3D · 2.6 × 3.7 × 2.6 m · varian: bulat, taman
- dipakai: WhatIfGravity
- acuan: `packages/core/src/library/poly3d/refs.md`

### rumah-kpr-stik
- 2D · 2.99 × 2.71 × 0.6 m · varian: -
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### rumah-mewah-stik
- 2D · 4.23 × 3.13 × 0.6 m · varian: -
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### rumah-petak-stik
- 2D · 2.01 × 1.47 × 0.6 m · varian: -
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### rumah-sakit-stik
- 2D · 3.09 × 5.73 × 0.6 m · varian: lampu-merah, lampu-hijau, jendela-hangat
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### tiang-tambat
- 2D+3D · 0.45 × 1.2 × 0.45 m · varian: kayu, besi
- dipakai: PelabuhanProof
- acuan: `packages/core/src/library/properti/tiang-tambat/refs.md`

### warung-kopi-stik
- 2D · 1.95 × 1.91 × 0.6 m · varian: dengan-orang, kosong
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

## Gaya

- **stik** Stik Polos (2d): StikAndaiRumah, StikAndaiOjol
- **poly3d** Low-poly 3D (3d): WhatIfGravity
- **poly** Low-poly 2D (2d): belum ada film contoh
- **model3d** Model GLB realistis (3d): belum ada film contoh
- **flanel** Kain flanel 3D (Jajan Dulu) (3d): TeaserTudung, TeaserLapak
- **ilustrasi** Ilustrasi SVG berlapis (2d): PelabuhanIlustrasi, UnairScene
