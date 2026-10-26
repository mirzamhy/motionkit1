# Peta aset

<!-- Dibuat oleh `node bin/mk.mjs aset peta`. Jangan disunting; `mk gate` gagal bila berbeda. -->

Cari dulu: `mk aset find <benda>`. Buat yang belum ada: `mk aset baru <benda> <gaya>`.

## Matriks benda × gaya

| benda | stik | poly3d | poly | model3d | flanel | ilustrasi |
|---|---|---|---|---|---|---|
| atap-limas | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `atap-limas-ilustrasi` |
| awan | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `awan-ilustrasi` |
| bambu-runcing | ✗ | ✔ `bambu-runcing-poly3d` | ✗ | ✗ | ✗ | ✗ |
| bangku | ✔ `bangku-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| bendera | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `bendera-ilustrasi` |
| bumi | ✗ | ✔ `bumi-poly3d` | ✗ | ✗ | ✗ | ✗ |
| bus | ✗ | ✔ `bus-poly3d` | ✗ | ✗ | ✗ | ✗ |
| gedung | ✗ | ✔ `gedung-poly3d` | ✗ | ✗ | ✗ | ✗ |
| gedung-nias | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `gedung-nias-ilustrasi` |
| gudang | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `gudang-pelabuhan` |
| gunung | ✔ `gunung-stik` | ✔ `gunung-poly3d` | ✗ | ✗ | ✗ | ✗ |
| jembatan-merah | ✗ | ✔ `jembatan-merah-poly3d` | ✗ | ✗ | ✗ | ✗ |
| kos | ✔ `kos-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| lampu-jalan | ✔ `lampu-jalan-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| lampu-lalu-lintas | ✔ `lampu-lalu-lintas-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| mobil | ✔ `mobil-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| motor-ojol | ✔ `motor-ojol-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| murid | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `murid-ilustrasi` |
| ojol | ✔ `ojol-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| orang | ✔ `orang-stik` | ✗ | ✗ | ✗ | ✗ | ✔ `orang-ilustrasi` |
| palem | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `palem-ilustrasi` |
| pasangan-poncho | ✔ `pasangan-poncho-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| pejuang | ✗ | ✔ `pejuang-poly3d` | ✗ | ✗ | ✗ | ✗ |
| penjual-kopi | ✔ `penjual-kopi-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| perahu | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `perahu-kajang` |
| pizza | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `pizza-ilustrasi` |
| pohon | ✗ | ✔ `pohon-poly3d` | ✗ | ✗ | ✗ | ✔ `pohon-ilustrasi` |
| pos-ronda | ✗ | ✔ `pos-ronda-poly3d` | ✗ | ✗ | ✗ | ✗ |
| rumah-kpr | ✔ `rumah-kpr-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumah-mewah | ✔ `rumah-mewah-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumah-petak | ✔ `rumah-petak-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumah-sakit | ✔ `rumah-sakit-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |
| rumput | ✗ | ✔ `rumput-poly3d` | ✗ | ✗ | ✗ | ✗ |
| semak | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `semak-ilustrasi` |
| tank | ✗ | ✔ `tank-poly3d` | ✗ | ✗ | ✗ | ✗ |
| tentara-sekutu | ✗ | ✔ `tentara-sekutu-poly3d` | ✗ | ✗ | ✗ | ✗ |
| tiang-tambat | ✗ | ✗ | ✗ | ✗ | ✗ | ✔ `tiang-tambat` |
| warung-kopi | ✔ `warung-kopi-stik` | ✗ | ✗ | ✗ | ✗ | ✗ |

## Aset

### atap-limas-ilustrasi
- 2D · 12.5 × 8.5 × 10 m · varian: utama, kecil, jauh
- dipakai: UnairShotsA
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### awan-ilustrasi
- 2D · 6.3 × 2.9 × 1 m · varian: putih, senja, kelabu
- dipakai: PelabuhanProof, UnairScene, UnairShotsA, UnairShotsB
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### bambu-runcing-poly3d
- 3D · 0.8 × 2.4 × 0.8 m · varian: ikatan, tunggal
- dipakai: -
- acuan: `packages/core/src/library/poly3d/refs.md`

### bangku-stik
- 2D · 1.6 × 0.87 × 0.5 m · varian: sandaran, tanpa-sandaran
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### bendera-ilustrasi
- 2D · 1.3 × 4.7 × 0.1 m · varian: merah-putih, unair, putih
- dipakai: UnairShotsA, UnairShotsB
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### bumi-poly3d
- 3D · 2 × 2 × 2 m · varian: berawan, polos
- dipakai: WhatIfGravity, aset-uji/AsetUji3D
- acuan: `packages/core/src/library/poly3d/refs.md`

### bus-poly3d
- 3D · 11.5 × 3.1 × 2.65 m · varian: kuning
- dipakai: aset-uji/AsetUji3D
- acuan: `packages/core/src/library/poly3d/refs.md`

### gedung-nias-ilustrasi
- 2D · 48.5 × 16.7 × 20 m · varian: bernama, polos
- dipakai: UnairShotsA, UnairShotsB
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### gedung-poly3d
- 3D · 11 × 70 × 11 m · varian: rendah, sedang, menara
- dipakai: WhatIfGravity, aset-uji/AsetUji3D
- acuan: `packages/core/src/library/poly3d/refs.md`

### gudang-pelabuhan
- 2D · 30 × 8.2 × 14 m · varian: panjang, pendek, tutup
- dipakai: PelabuhanProof
- acuan: `packages/core/src/library/bangunan/gudang-pelabuhan/refs.md`

### gunung-poly3d
- 3D · 660 × 170 × 660 m · varian: vesuvius, sakura, rainier
- dipakai: aset-uji/AsetUji3D
- acuan: `packages/core/src/library/poly3d/refs.md`

### gunung-stik
- 2D · 200 × 110 × 40 m · varian: salju, polos
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### jembatan-merah-poly3d
- 3D · 16 × 3.6 × 6 m · varian: utuh, perang
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

### murid-ilustrasi
- 2D · 0.6 × 1.7 × 0.3 m · varian: buku, topi, polos
- dipakai: -
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### ojol-stik
- 2D · 1.48 × 1.89 × 0.6 m · varian: dingin, impian
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### orang-ilustrasi
- 2D · 0.6 × 1.7 × 0.3 m · varian: kemeja-putih, hijab-merah-muda, kemeja-biru, jaket-unair, peci-1954, coklat-1954, sanggul-1954, peci-gelap-1954
- dipakai: PelabuhanProof, UnairShotsA, UnairShotsB
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### orang-stik
- 2D · 0.61 × 1.76 × 0.6 m · varian: berdiri, berjalan, duduk, menunduk, tertawa
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### palem-ilustrasi
- 2D · 6 × 8.8 × 6 m · varian: tinggi, sedang, pendek
- dipakai: PelabuhanProof, UnairShotsA
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### pasangan-poncho-stik
- 2D · 1.39 × 1.67 × 0.6 m · varian: dingin, tenang
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### pejuang-poly3d
- 3D · 0.7 × 1.75 × 0.5 m · varian: siap, serang
- dipakai: -
- acuan: `packages/core/src/library/poly3d/refs.md`

### penjual-kopi-stik
- 2D · 1.17 × 1.32 × 0.6 m · varian: bangku, tanpa-bangku
- dipakai: -
- acuan: `packages/core/src/library/stik-polos/refs.md`

### perahu-kajang
- 2D+3D · 12.5 × 11.5 × 3 m · varian: tergulung, terkembang, darat
- dipakai: PelabuhanProof
- acuan: `packages/core/src/library/kendaraan-air/perahu-kajang/refs.md`

### pizza-ilustrasi
- 2D · 0.35 × 0.35 × 0.04 m · varian: utuh
- dipakai: index
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### pohon-ilustrasi
- 2D · 3 × 6 × 3 m · varian: muda, rumpun
- dipakai: UnairScene, UnairShotsA, UnairShotsB
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### pohon-poly3d
- 3D · 2.6 × 3.7 × 2.6 m · varian: bulat, taman
- dipakai: WhatIfGravity, aset-uji/AsetUji3D
- acuan: `packages/core/src/library/poly3d/refs.md`

### pos-ronda-poly3d
- 3D · 3 × 3 × 3 m · varian: kayu, seng
- dipakai: -
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

### rumput-poly3d
- 3D · 10.5 × 0.8 × 10.5 m · varian: hijau
- dipakai: WhatIfGravity, aset-uji/AsetUji3D
- acuan: `packages/core/src/library/poly3d/refs.md`

### semak-ilustrasi
- 2D · 2.6 × 1.1 × 1.5 m · varian: besar, kecil
- dipakai: PelabuhanProof
- acuan: `packages/core/src/library/ilustrasi/refs.md`

### tank-poly3d
- 3D · 6 × 2.6 × 2.8 m · varian: sekutu, bkr
- dipakai: -
- acuan: `packages/core/src/library/poly3d/refs.md`

### tentara-sekutu-poly3d
- 3D · 0.7 × 1.76 × 0.5 m · varian: siap, bidik
- dipakai: -
- acuan: `packages/core/src/library/poly3d/refs.md`

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
