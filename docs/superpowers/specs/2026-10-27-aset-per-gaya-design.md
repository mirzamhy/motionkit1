# Aset per gaya: MotionKit plug-and-play

Tanggal: 2026-10-27. Status: disetujui; rencana di docs/superpowers/plans/2026-10-27-aset-per-gaya.md. Spec pertama dari empat (lihat "Urutan kerja").

## Masalah

Gaya video yang sudah dicoba (stickman, low-poly 3D, flanel 3D, ilustrasi SVG) menyimpan asetnya di tempat berbeda dan
dengan kontrak berbeda. Aset yang sama digambar berulang:

| Benda | Sudah ada di | Bisa dicari `mk item find`? |
|---|---|---|
| bumi | `simulif-gravity` (hanya tekstur procedural `makeEarthTextures`; bola dibuat di scene) | tidak |
| gedung | `simulif-gravity` `City` (satu blok kota, tanpa props) | tidak |
| rumput | `simulif-gravity` `Grass` (satu hamparan global, parameter `time`) | tidak |
| gunung | `volcano-whatif` `Volcano` (radius, tinggi, warna, seed) dan `RainierSet` | tidak, proyek di luar MotionKit |
| bus | `volcano-whatif` `SchoolBus` (`position`, `rot`) | tidak |
| pohon | `volcano-whatif` `Tree` dan `simulif-gravity` `Tree` (dua versi) | tidak |

Akibatnya setiap video baru mulai dari nol atau menyalin kode dari proyek lama. Pustaka `library/` sudah ada dan kontrak
`Item2D`/`Item3D` sudah jalan, tapi hanya berisi tiga item pelabuhan dan 14 item Stik Polos.

## Tujuan

1. Satu pustaka pusat, dinamai `<benda>-<gaya>` (`gedung-stik`, `gedung-poly3d`, `bus-poly3d`), bisa dicari per benda dan per gaya.
2. Tiap gaya punya katalog: DNA, film contoh acuan, daftar aset, resep. Ide baru dimulai dari film contoh terdekat.
3. Film memakai aset lewat id (`<Aset>`, `<Aset3D>`), bukan menggambar ulang. Id tak terdaftar membuat render gagal dengan petunjuk, sehingga aset baru **harus** masuk pustaka lebih dulu ("pustaka dulu").
4. Peta aset ter-generate otomatis (`docs/aset/PETA.md`): matriks benda × gaya dan film yang memakainya.
5. Bukti end-to-end dengan lima aset yang disebut pengguna (bumi, gedung, rumput, gunung, bus) plus pohon, semuanya `poly3d`.

## Bukan tujuan (spec ini)

- Memindah aset `flanel` (Jajan Dulu) dan `ilustrasi` (Unair, Pelabuhan, kit lama): spec 2 dan 3.
- Menyatukan `orang-poly3d`: `Person` (volcano: look, jalan, lari, duduk) dan `Character` (simulif: T-pose) punya rig berbeda. Ditunda ke spec sendiri.
- Membuat aset `poly` (low-poly 2D) dan `model3d` (GLB): hanya slot gaya dan matriks yang disiapkan. Belum ada contoh `poly` di proyek pengguna.
- Mengubah proyek `volcano-whatif` dan `simulif-gravity` yang berdiri sendiri. Kodenya disalin ke MotionKit dengan catatan sumber; proyek aslinya tidak disentuh.
- Mendeteksi "bagian" dari kode film secara otomatis. Alat tidak bisa menebak batas satu aset; pencatatan dijamin lewat aturan dan kegagalan render, bukan tebakan.
- Mengganti nama id lama (`perahu-kajang`, `gudang-pelabuhan`, `tiang-tambat`): dibebaskan dari aturan penamaan lewat daftar `LEGACY_IDS`.

## Desain

### 1. Gaya dan penamaan

Slug gaya, satu daftar di `packages/core/src/styles/index.ts`:

| slug | nama | dimensi | folder pustaka | film contoh | status awal |
|---|---|---|---|---|---|
| `stik` | Stik Polos | 2d | `library/stik-polos` | `StikAndaiRumah`, `StikAndaiOjol` | lengkap (14 aset) |
| `poly3d` | Low-poly 3D | 3d | `library/poly3d` | `WhatIfGravity` | sebagian (6 aset setelah spec ini) |
| `poly` | Low-poly 2D | 2d | `library/poly` | (belum ada) | kosong |
| `model3d` | Model GLB realistis | 3d | `library/model3d` | (belum ada) | kosong |
| `flanel` | Kain flanel 3D (Jajan Dulu) | 3d | `library/flanel` | `TeaserTudung`, `TeaserLapak` | kosong (spec 2) |
| `ilustrasi` | SVG berlapis bersumber referensi | 2d | `library/<kategori>` (lama) | `PelabuhanIlustrasi`, `UnairScene` | sebagian (3 item lama) |

```ts
type GayaSlug = 'stik' | 'poly' | 'poly3d' | 'model3d' | 'flanel' | 'ilustrasi';
type Gaya = {
  slug: GayaSlug; nama: string; dimensi: '2d' | '3d'; ringkas: string;
  folder: string;          // relatif ke packages/core/src/library
  contoh: string[];        // id scene di manifest.ts
  resep?: string;          // README gaya, relatif ke packages/core/src
};
export const GAYA: Gaya[];
```

Nama aset: `<benda>-<gaya>`; `benda` huruf kecil, boleh berstrip (`motor-ojol`, `rumah-sakit`). Daftar kosakata benda dijaga
tidak di kode, tetapi di `docs/aset/PETA.md` yang ter-generate, supaya benda yang sama dipakai konsisten (`gedung`, bukan
`bangunan` di satu gaya dan `gedung` di gaya lain). Sinonim masuk `tags`.

`ItemMeta` (`library/types.ts`) menambah dua field:

```ts
benda: string;    // 'gedung'
gaya: GayaSlug;   // 'poly3d'
```

`ItemMeta` juga mendapat `aliases?: string[]` dan `komponen?: { nama: string; dari: string }[]` (komponen asli yang dibungkus; `dari` adalah akhiran path modul tanpa ekstensi; `mk aset peta` menganggap film yang meng-import `nama` dari modul berakhiran `dari` sebagai pemakai aset, sehingga komponen senama dari modul lain tidak dihitung, karena film lama memakai komponen asli, bukan `<Aset3D>`). Tes memakai `node:test` (`npx tsx --test`), runner repo ini, bukan vitest. Varian pohon: `bulat` dan `taman`.

`style?: string` yang ditambahkan untuk Stik Polos diganti `gaya`. Aturan gate: id harus sama dengan `benda` + `-` + `gaya`, kecuali id
ada di `LEGACY_IDS`. Item Stik Polos yang ada sudah mengikuti aturan (`benda` = id tanpa akhiran `-stik`).

### 2. Pemakaian dalam film

```tsx
// 2D, di dalam <svg>
<Aset id="mobil-stik" x={510} y={880} s={150} t={frame} variant="..." flip />
// 3D, di dalam <ThreeCanvas>
<Aset3D id="bus-poly3d" position={[0, 0, -8]} rotation={[0, 0.4, 0]} scale={1} t={frame} variant="..." seed={3} />
```

- Lokasi: `packages/core/src/library/aset.tsx`. Keduanya mencari lewat `itemById`.
- Kontrak yang sudah ada tetap: `Item2D` (x, y di tempat menyentuh tanah, `s` px/m) dan `Item3D` (meter, titik asal di tengah alas, +y atas).
- `t` di kedua dimensi adalah frame dalam satuan 30 fps. Item yang butuh detik membagi 30 sendiri (rumput: `time = t / 30`).
- Id tak dikenal: lempar `Error` berisi tiga id terdekat dan perintah `mk aset baru <benda> <gaya>`. Dimensi salah
  (`Aset3D` pada id yang hanya punya `Item2D`): lempar `Error` yang menyebut dimensi yang tersedia. Render berhenti, tidak diam-diam kosong.
- `itemById` menerima alias (`meta.aliases?: string[]`), agar rename di masa depan tidak mematahkan film lama.

### 3. Perintah CLI

Semua baru kecuali `item preview`, yang tetap dipakai.

| Perintah | Fungsi |
|---|---|
| `mk gaya list` | tiap gaya: dimensi, jumlah aset, film contoh, status |
| `mk gaya show <slug>` | DNA singkat, tautan resep, film contoh, daftar aset gaya itu |
| `mk aset find <kata> [--gaya <slug>]` | pencarian yang sudah ada (`findKit`) dibatasi ke item, lalu **matriks per benda**: `gedung: stik ✔ poly3d ✔ poly ✗ model3d ✗` |
| `mk aset baru <benda> <gaya>` | membuat kerangka di `library/<folder>/`, mendaftar di `index`, dan mengisi `refs.md` template. Kerangka menggambar kotak berlabel "BELUM DIGAMBAR" supaya `mk item preview` langsung jalan |
| `mk aset peta` | menulis ulang `docs/aset/PETA.md` |

`mk aset baru` menolak bila id sudah ada, bila `<gaya>` bukan slug terdaftar, atau bila `<benda>` tidak huruf kecil/strip.

### 4. Peta otomatis dan gate

`docs/aset/PETA.md` (di-commit, di-generate) berisi:

1. Matriks benda × gaya: ✔ dengan tautan ke item, ✗ untuk "belum ada".
2. Per aset: dimensi (2D/3D), ukuran meter, varian, dan **film yang memakainya**. "Memakai" dideteksi dengan memindai
   `packages/core/src/scenes/**` untuk `id="<id>"` pada `<Aset>`/`<Aset3D>` dan `itemById('<id>')`.
3. Daftar gaya dengan film contoh.

`mk gate` (yang sudah ada) ditambah pemeriksaan statis, selalu jalan, termasuk `--no-render`:

- tiap item punya `benda` dan `gaya` valid, id sesuai aturan (kecuali `LEGACY_IDS`);
- `refs.md` ada;
- `PETA.md` mutakhir (gate gagal bila hasil generate beda dari file di repo, dengan pesan "jalankan `mk aset peta`");
- tiap id yang dipakai film terdaftar.

Tanpa `--no-render`, gate juga merender `mk item preview` untuk item yang baru atau berubah.

### 5. Aturan "pustaka dulu"

Ditambahkan ke `AGENTS.md` (aturan scene mode): benda yang bisa dipakai ulang (kendaraan, bangunan, tanaman, orang, alam, properti)
dibuat di `library/<gaya>/` dengan `mk aset baru`, dilihat lewat `mk item preview`, **baru** dipakai film lewat
`<Aset>`/`<Aset3D>`. Film tidak menggambar benda semacam itu langsung di file scene. Sebelum menggambar apa pun:
`mk aset find <benda>`; jika gaya lain sudah punya benda itu, tiru proporsi dan variannya.

Langkah awal tiap video baru: `mk gaya show <gaya>`, buka film contoh gaya itu, lalu `mk aset find` untuk tiap benda di storyboard.

### 6. Adopsi lima aset poly3d (bukti end-to-end) dan pohon

Kode disalin ke `library/poly3d/`, dibungkus dengan kontrak `Item3D`, dan diberi `refs.md` yang menyebut sumber
(`volcano-whatif/src/...`, `simulif-gravity/src/three/...`). Di `templates/whatif-sim/three/` file lama berubah menjadi
re-export dari pustaka, sehingga tidak ada dua salinan.

| id | Sumber | Pembungkus `Item3D` | Varian |
|---|---|---|---|
| `bus-poly3d` | `SchoolBus` (`rainier.tsx`) | titik asal di tengah alas; `position`/`rot` dibuang (diatur `Aset3D`) | `kuning` (asli); lainnya diputuskan saat rencana, dari warna yang dipakai Shot01–08 |
| `gunung-poly3d` | `Volcano` (`kit.tsx`, radius, tinggi, warna, seed) | `radius`/`height`/`color` jadi preset bernama; `seed` dari prop | preset dari gunung yang sudah dipakai (Rainier, Sakurajima, dst.) |
| `pohon-poly3d` | dua `Tree`: volcano (`size`, `color`) dan simulif (`s`, `seed`) | satu versi; dua tampilan lama jadi varian | `pinus` (volcano), `taman` (simulif) |
| `rumput-poly3d` | `Grass` + `useGrass` (hamparan global, `time`) | hamparan tetap, luas ditentukan saat rencana (kira-kira 10×10 m), `time = t / 30` | `hijau`, `kering` bila warnanya sudah ada di shader |
| `gedung-poly3d` | satu bangunan yang diekstrak dari perulangan `City` | satu blok beige berpola jendela; `seed` memilih tinggi dan jendela | `rendah`, `sedang`, `menara` |
| `bumi-poly3d` | `makeEarthTextures` (mengembalikan `map` dan `clouds`) + bola yang dibuat di scene | **komponen baru**: bola jari-jari 1 m dengan tekstur `map`, lapisan awan `clouds` sebagai bola kedua sedikit lebih besar; rotasi dari `t` | `berawan` (dengan lapisan awan), `polos` (tanpa awan) |

Nilai yang masih terbuka di tabel (isi varian `bus`, `gunung`, `rumput`, luas hamparan rumput) diputuskan di rencana
implementasi dengan membaca sumbernya: itu pekerjaan membaca kode, bukan keputusan desain. Yang tetap di spec: nama id,
sumber, dan bentuk kontrak.

`orang-poly3d` sengaja tidak di sini (lihat "Bukan tujuan").

Ukuran `meta.size` diisi dari pengukuran `Box3` pada preview 3D (sudah ada di `preview.tsx`), bukan ditebak.

## Alur data

```
ide → mk gaya show <gaya> → buka film contoh → mk aset find <benda> (matriks)
        ├─ ada  → <Aset id=...> + ubah varian/props
        └─ belum → mk aset baru <benda> <gaya> → gambar → mk item preview → lihat → <Aset id=...>
render → mk gate → mk aset peta (PETA.md diperbarui) → commit
```

## Penanganan kesalahan

- Id tak dikenal atau dimensi salah: `Error` yang jelas saat render (bagian 2).
- `mk aset baru` pada id yang ada: berhenti, tidak menimpa.
- Aset 3D yang butuh `canvas` (tekstur Bumi) dipanggil di luar Chromium: dilindungi `typeof document`, error menyebut harus dirender lewat Remotion.
- Gate gagal dengan pesan yang menyebut file dan perintah perbaikannya.

## Pengujian

Otomatis (vitest, seperti `catalog.test.ts`):
- `itemById` dengan alias; `Aset`/`Aset3D` melempar `Error` yang benar (id tak dikenal, dimensi salah);
- aturan penamaan `<benda>-<gaya>` dan `LEGACY_IDS`;
- generator matriks (`mk aset find`): benda dengan satu gaya, banyak gaya, tanpa hasil;
- `mk aset baru`: menolak duplikat, slug salah; hasilnya lolos `tsc`;
- generator `PETA.md` deterministik (dua kali jalan, hasil sama).

Visual (dilihat, bukan otomatis; aturan MotionKit 5):
- `mk item preview` untuk keenam aset poly3d, dibandingkan dengan tampilannya di film asal;
- regresi: `mk scene stills WhatIfGravity` pada frame yang sama sebelum dan sesudah re-export harus identik;
- satu komposisi uji `AsetUji3D` yang menaruh bus, gunung, pohon, rumput, gedung, dan bumi dalam satu adegan lewat `<Aset3D>`.

## Kriteria selesai

1. `mk gaya list` menampilkan enam gaya dengan jumlah aset yang benar; `mk gaya show poly3d` menampilkan enam aset dan `WhatIfGravity`.
2. `mk aset find bus` menampilkan matriks dengan `poly3d ✔` dan gaya lain `✗`.
3. `AsetUji3D` merender keenam aset; id salah membuat render gagal dengan saran.
4. `mk aset baru gedung model3d` menghasilkan kerangka yang lolos `tsc` dan bisa di-preview.
5. `mk gate --no-render` lulus; `PETA.md` mutakhir dan menyebut `WhatIfGravity` sebagai pemakai.
6. Stills `WhatIfGravity` identik sebelum dan sesudah; semua `tsc` bersih.
7. `AGENTS.md` memuat aturan "pustaka dulu".

## Urutan kerja

1. **Spec ini**: fondasi (penamaan, `<Aset>`, CLI, peta, gate) + enam aset poly3d.
2. Adopsi `flanel`: rig badan/tangan/kaki, charm, kantong, lampu.
3. Adopsi `ilustrasi`: pejalan, palem, bendera, kain, bangunan kolonial dari kit lama.
4. Galeri preview per gaya (lembar kontak di `docs/aset/`), dan `orang-poly3d`.

## Keputusan yang sudah diambil

- Pendekatan C: pustaka pusat + "pustaka dulu"; aset lama dipindah saat dipakai ulang, kecuali enam di atas yang dipindah sekarang.
- `poly` = low-poly 2D, `poly3d` = low-poly 3D, `model3d` = GLB realistis (jawaban pengguna).
- Pencatatan dijamin lewat kegagalan render dan peta ter-generate, bukan deteksi otomatis.
