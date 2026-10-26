# Bantuan prompting aset: desain

Status: draf untuk ditinjau. Belum ada kode.

## Tujuan

Membuat aset baru tanpa menulis prompt dari nol. `mk aset prompt` menyusun prompt siap salin dari data yang sudah
ada di repo (aturan gaya, palet, skala, aset serupa), untuk tiga cara membuat aset. `mk aset impor` memasukkan hasil
model 3D AI ke pustaka. Tidak ada panggilan API dari kode.

## Di luar cakupan

- Memanggil API model (Tripo, Hunyuan, Meshy, atau lainnya) dari dalam MotionKit.
- Membuat gambar acuan secara otomatis.
- Menilai kualitas hasil secara otomatis.

## Prasyarat (ditemukan saat uji Haiku dan Sonnet)

Dua perbaikan yang sudah ditambal sendiri oleh agen uji di cabang worktree dan perlu masuk lebih dulu:

1. `part()` di `library/stik-polos/index.tsx` mengira 1 m = 150 px. Tambah field opsional `pxPerM` dan `depth`
   (sudah ditulis di cabang `worktree-agent-a4e23fb814b8d43d7`).
2. `mk aset baru <benda> stik` menolak dan meminta `part(...)` ditulis manual. Perintah harus menyisipkan entri
   `part(...)` berlabel "BELUM DIGAMBAR", seperti untuk 3D.

## Perintah 1: `mk aset prompt`

```
mk aset prompt <benda> <gaya> [--target kode|gambar|3d] [--ukuran "<p> x <l> x <t> m"] [--catatan "<teks>"]
```

Mencetak prompt ke layar (dan ke `projects/<slug>/prompt-<benda>-<gaya>.md` bila `--slug` diberi). Bahan:

- registri gaya (`styles/index.ts`): `ringkas`, aturan gambar, palet, jenis (2D atau 3D);
- aturan gambar gaya: untuk stik dari `styles/stik-polos/README.md` (garis 4 unit, isi datar, palet dingin satu
  aksen hangat); untuk poly3d dari `library/poly3d/refs.md` (low-poly datar, meter, asal di dasar, +y atas);
- aset serupa: `cariAset(benda)` di gaya lain, dicantumkan sebagai acuan proporsi dan varian;
- kontrak tipe dari `library/types.ts` (`Item2D` atau `Item3D`) dan nama berkas yang harus dibuat.

Tiga target:

| Target | Untuk siapa | Isi |
|---|---|---|
| `kode` | agen yang menulis komponen (disarankan Sonnet; Haiku untuk kerangka dan varian saja) | perintah kerja: baca berkas acuan, jalankan `mk aset baru`, gambar, `item preview`, lihat, perbaiki maksimal 3 putaran, tandai rekaan di `refs.md`; kontrak tipe; ukuran; daftar varian |
| `gambar` | model gambar untuk acuan | deskripsi satu benda, latar polos, sudut tetap, gaya dari `ringkas`, tanpa teks atau merek; catatan lisensi |
| `3d` | model teks/gambar ke 3D (Tripo, Hunyuan, TRELLIS) | satu benda, pose netral, target jumlah poligon menurut gaya, skala dalam meter, tanpa alas atau latar; format keluaran GLB |

Prompt tidak berisi nama merek atau logo nyata (aturan 7 di AGENTS.md).

## Perintah 2: `mk aset impor`

```
mk aset impor <berkas.glb> <benda> <gaya> --sumber "<model + versi>" --lisensi "<jenis lisensi>"
```

Hanya untuk gaya 3D yang menerima model (`model3d`). Langkah:

1. `mk asset check` (validasi Khronos dan ukuran) lalu `mk asset optimize` (glTF-Transform) pada salinan berkas.
2. Salin hasil ke `packages/core/src/library/model3d/<benda>-<gaya>.glb` dan buat kerangka aset 3D yang memuatnya.
3. Tulis `refs.md` dengan `--sumber`, `--lisensi`, tanggal, dan prompt yang dipakai bila ada.
4. Tolak bila `--lisensi` kosong. Peringatkan bila lisensi tampak non-komersial (kata "free tier", "non-commercial").
5. Jalankan `mk aset peta`.

Berkas `.glb` hasil impor tidak di-commit otomatis; aturan repo melarang media, jadi ukuran dan kebijakan
penyimpanannya diputuskan terpisah sebelum fitur ini dipakai.

## Berkas

| Berkas | Peran |
|---|---|
| `packages/core/src/library/prompt.ts` | penyusunan prompt (murni, bisa dites) |
| `packages/core/src/library/prompt.test.ts` | tes unit |
| `apps/cli/aset.ts` | perintah `prompt` dan `impor` |
| `apps/cli/aset.ts` + `library/scaffold.ts` | perbaikan `aset baru` untuk stik |
| `AGENTS.md` | bagian "Pustaka dulu": langkah memakai `mk aset prompt` |

## Pengujian dan kriteria selesai

Tes `node:test`: prompt `kode` memuat kontrak tipe dan nama berkas yang benar; prompt `3d` memuat target poligon
gaya; benda dengan aset di gaya lain mencantumkan acuan; benda tanpa aset serupa tidak error; `impor` menolak
lisensi kosong dan berkas bukan GLB.

1. `mk aset prompt bangku stik --target kode` mencetak prompt dengan kontrak `Item2D`, palet stik, dan aset acuan.
2. `mk aset prompt pos-ronda poly3d --target 3d` mencetak prompt dengan target poligon dan skala meter.
3. `mk aset baru bangku stik` membuat kerangka stik yang lolos `tsc`.
4. Semua tes lulus; `mk aset peta` tidak membuat diff.

## Risiko

- Prompt yang baik tidak menjamin hasil baik: uji Haiku vs Sonnet menunjukkan kualitas ditentukan oleh model dan
  loop lihat-perbaiki. Prompt `kode` karena itu menuntut loop itu secara eksplisit.
- Harga dan syarat lisensi model 3D berubah; angka tidak ditulis di kode, hanya `--lisensi` yang wajib diisi.
