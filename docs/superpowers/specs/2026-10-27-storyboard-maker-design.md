# Storyboard maker dan catatan film: desain

Status: draf untuk ditinjau. Belum ada kode.

## Tujuan

Agen yang mulai video baru tidak lagi menulis `treatment.md` dari nol. `mk storyboard "<brief>"` menulis draf
dari brief satu paragraf, dengan gaya, aset, gaya kamera, dan kerangka cerita yang dipilih dari film-film
sebelumnya. Draf lalu disunting dan disetujui orang sebelum menggambar (aturan 3 di AGENTS.md tetap).

## Di luar cakupan

- Migrasi aset lama (UNAIR, Pizza, Jajan) ke pustaka.
- QA scene mode dan pengukuran gerak dari render.
- Still pratinjau per shot.
- Pemanggilan LLM atau API apa pun dari dalam kode. Semua pemilihan berbasis aturan dan deterministik.

## Bagian 1: catatan film

File data: `packages/core/src/scenes/catatan.ts`, satu entri per `id` di `manifest.ts`.

```ts
export type Kamera = 'tetap' | 'satu-ambilan' | 'lompat-antar-tokoh' | 'orbit' | 'dorong-masuk' | 'potong-cepat';
export type Ritme = 'beat-sheet' | 'hook-hold-payoff' | 'masalah-solusi' | 'peta-energi';
export type CatatanFilm = {
  gaya: GayaSlug;          // dari styles/index.ts
  format: string;          // 'rantai-andai', 'teaser', 'explainer', 'uji', ...
  kamera: Kamera[];
  ritme: Ritme;
  detik: number;           // panjang film; manifest.ts tidak menyimpannya
  pelajaran?: string;      // satu atau dua kalimat: apa yang berhasil atau gagal
};
export const CATATAN: Record<string, CatatanFilm> = { /* id film -> catatan */ };
```

Film varian (`StikAndaiOjolGerimis`) mewarisi catatan film yang namanya menjadi awalannya (`catatanFilm`).

Perintah baru `mk film`:

- `mk film list`: satu baris per film di `manifest.ts`: id, ukuran, fps, durasi, gaya, aset yang dipakai, ritme.
  Kolom otomatis dari `manifest.ts` dan dari pemindaian aset yang sama dengan `PETA.md` (`peta.ts pemakai`).
  Film tanpa catatan tetap tampil, bertanda `belum dicatat`.
- `mk film show <id>`: semua kolom di atas ditambah `pelajaran`.

`mk gate` memberi peringatan (bukan kegagalan) untuk film di `manifest.ts` tanpa entri `CATATAN`.

Catatan awal saya isi untuk 10 film: StikAndaiOjol, StikAndaiRumah, WhatIfGravity, UnairScene, PizzaScene,
SurabayaFilm, TeaserTudung, TeaserLapak, StoryPasarMinggu, PelabuhanIlustrasi. Sisanya ditandai `belum dicatat`.

Langkah baru di akhir `docs/scenes/WORKFLOW.md`: setelah film selesai, agen menambah entri `CATATAN`.

## Bagian 2: `mk storyboard`

```
mk storyboard "<brief>" [--format 9:16|16:9] [--detik N] [--gaya <slug>] [--slug <nama>]
```

Keluaran: `projects/<slug>/treatment.md` mengikuti `docs/scenes/TREATMENT.md` (brief, skeleton, blok per shot).
Kalau berkasnya sudah ada, perintah berhenti kecuali `--timpa`.

Modul baru `apps/cli/storyboard.ts` (logika murni di `packages/core/src/library/storyboard.ts`, supaya bisa dites):

1. **Kata kunci**: pecah brief jadi kata; cocokkan dengan `benda` dan `aliases` semua aset (`cariAset` dari `matriks.ts`).
   Kata yang tidak cocok tetap dicatat sebagai `benda tanpa aset`.
2. **Gaya**: bila `--gaya` tidak diberi, skor tiap gaya =
   `jumlah benda yang sudah ada di gaya itu / jumlah benda diminta`, ditambah bobot kecil bila ada film dengan
   gaya itu yang format dan rasio layarnya sama. Pilih skor tertinggi; seri dipecah dengan gaya yang punya lebih
   banyak film. Alasan dicetak di draf.
3. **Film acuan**: film terdekat dari `CATATAN` (gaya sama, format sama, durasi terdekat). Darinya diambil
   `ritme` dan `kamera`. Tanpa film acuan: ritme `hook-hold-payoff` untuk durasi di bawah 30 detik, `beat-sheet` untuk
   sisanya, kamera `tetap`.
4. **Shot**: durasi dibagi menurut ritme (hook 15 %, hold ≈ 55 % dibagi 2–4 shot, payoff 30 %; beat-sheet:
   setup 20, belokan 30, akibat 30, penutup 20). Benda diurutkan sesuai kemunculan di brief dan dibagi ke shot.
5. **Penandaan**: tiap benda tampil sebagai `` `id-aset` `` bila ada, atau `BELUM ADA — mk aset baru <benda> <gaya>`.
   Gaya yang punya benda tersebut di gaya lain ikut dicantumkan sebagai acuan proporsi.
6. **Draf**: tiap pilihan disertai satu baris alasan, misalnya
   `gaya stik: 4 dari 5 benda sudah ada; film acuan StikAndaiRumah (rantai-andai, 13 s)`.
   Bagian yang butuh manusia (judul, kalimat narasi, fakta) diisi `ISI: ...`, bukan ditebak.

Perintah tidak memanggil LLM dan tidak menulis narasi. Agen atau pengguna melengkapi dan menyetujui.

## Berkas

| Berkas | Peran |
|---|---|
| `packages/core/src/scenes/catatan.ts` | data `CATATAN` dan tipenya |
| `packages/core/src/library/storyboard.ts` | pemilihan gaya, film acuan, pembagian shot (murni) |
| `packages/core/src/library/storyboard.test.ts` | tes unit |
| `apps/cli/film.ts` | `mk film list|show` |
| `apps/cli/storyboard.ts` | `mk storyboard`, menulis `treatment.md` |
| `apps/cli/index.ts`, `apps/cli/gate.ts` | perintah dan peringatan catatan |
| `docs/scenes/WORKFLOW.md`, `AGENTS.md` | langkah catatan film dan pemakaian `mk storyboard` |

## Pengujian dan kriteria selesai

Tes `node:test` (`npx tsx --test`): pemilihan gaya dari brief contoh, seri dipecah, film acuan terdekat, pembagian
durasi berjumlah tepat sama dengan `--detik`, penandaan `BELUM ADA`, penolakan menimpa tanpa `--timpa`.

1. `mk storyboard "ojol bertemu penjual kopi saat hujan" --detik 12` memilih gaya `stik`, memakai `ojol-stik` dan
   `penjual-kopi-stik`, dan merujuk `StikAndaiOjol`.
2. `mk storyboard "gunung meletus di atas kota" --detik 20 --gaya stik` menandai `gedung` sebagai `BELUM ADA` di stik
   dengan acuan `gedung-poly3d`. (Tanpa `--gaya`, gaya dipilih dari benda yang sudah ada; sejak `gunung-stik` ada,
   stik dan poly3d seri untuk brief ini dan stik menang karena punya lebih banyak film.)
3. `mk film list` menampilkan semua film di `manifest.ts`, dengan 10 film tercatat.
4. Semua tes lulus; `mk aset peta` tidak membuat diff.

## Risiko

- Skor gaya yang sederhana bisa salah memilih untuk brief ambigu; karena itu alasannya selalu dicetak dan `--gaya`
  dapat menimpa.
- Catatan film hanya sebagus disiplin mengisinya; langkah di `WORKFLOW.md` dan peringatan di `mk gate` mengurangi itu.
