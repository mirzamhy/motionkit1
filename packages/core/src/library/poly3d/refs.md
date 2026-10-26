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

## pos-ronda-poly3d
Tidak ada foto acuan; dibuat dari pengetahuan umum tentang pos ronda / pos kamling kampung di Indonesia. Ukuran 3 x 3 x 3 m
(terukur di preview 3,00 x 3,01 x 3,00 m): lantai panggung 2,2 x 2,2 m setinggi 0,63 m, tiang kayu, dinding papan setinggi
0,62 m di tiga sisi, teralis di bagian atas dinding belakang, bangku di sepanjang dinding belakang, kentongan tergantung
di bawah atap, dua anak tangga di sisi depan (+z) yang terbuka, atap limas.

Varian: `kayu` (kayu cokelat, genteng tanah liat) dan `seng` (papan kelabu lapuk, atap seng).

Rekaan (semuanya, tidak ada replika):
- proporsi dan ukuran, bukan ukur dari satu bangunan nyata; pos ronda nyata amat beragam (ada yang berdinding penuh, beratap joglo, bercat merah-putih);
- warna, jumlah papan, bentuk bangku dan kentongan (silinder polos dengan celah hitam);
- tanpa tekstur, tanpa lampu atau papan nama.

## tank-poly3d
Tank era Pertempuran Surabaya 1945 (Sherman M4 / Stuart M3 style).
Proporsi: panjang bodi ~6 m (dengan laras ~7 m), lebar 2,8 m, tinggi 2,6 m. Dua roda rantai (treads), bodi lapis baja tebal, kubah meriam putar dan laras meriam arah depan (+X).
Varian: `sekutu` (warna hijau zaitun tentara Sekutu / British Indian Army dengan bintang identitas) dan `bkr` (warna cokelat usang hasil rampasan pejuang Surabaya dengan lambang Merah Putih).

## bambu-runcing-poly3d
Senjata rakyat pejuang arek-arek Suroboyo. Batang bambu beruas setinggi ~2 m dengan ujung potongan serong runcing tajam, diikat tali tambang dan pita Merah Putih.
Varian: `ikatan` (5 batang kokoh saling silang dengan bendera Merah Putih) dan `tunggal` (satu bilah tegak).

## jembatan-merah-poly3d
Jembatan Merah Surabaya di atas Kali Mas, situs pertempuran utama Oktober-November 1945. Struktur pilar bata merah kolonial Belanda, trotoar batu, aspal hitam, pilar gerbang, dan pagar besi merah di kedua sisi.
Ukuran: 16 m panjang x 3,6 m tinggi x 6 m lebar.
Varian: `utuh` (kondisi awal) dan `perang` (dilengkapi barikade karung pasir dan pertahanan tempur).

## pejuang-poly3d
Karakter pemuda pejuang arek Suroboyo (laskar rakyat / BKR). Postur berdiri proporsi 7 kepala (~1,72 m). Memakai ikat kepala dwiwarna Merah Putih, kemeja khaki/cokelat pejuang kemerdekaan, celana katun, selempang tas amunisi, dan bambu runcing.
Varian: `siap` (berdiri sigap memegang bambu runcing tegak) dan `serang` (pose maju menusukkan bambu runcing ke depan).

## tentara-sekutu-poly3d
Prajurit militer Sekutu (British Indian Army / brigade ke-49 di bawah Brigadir Mallaby). Memakai helm baja piringan Brodie khas tentara Persemakmuran Inggris (Commonwealth), seragam militer drill hijau zaitun, sabuk perlengkapan webbing, sepatu lars hitam, dan senapan Lee-Enfield dengan bayonet baja.
Varian: `siap` (senapan tersandang di bahu) dan `bidik` (senapan diangkat membidik ke arah depan).




