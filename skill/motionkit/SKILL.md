---
name: motionkit
description: "Buat dan revisi video dengan MotionKit dan Remotion: cerita, sejarah, explainer, pelajaran, animasi, dan promo produk. Gunakan untuk brief video, storyboard, pustaka aset, pemeriksaan still, dan render film di repo MotionKit."
---

# MotionKit

MotionKit mengubah brief menjadi film melalui riset, treatment, storyboard, pustaka aset, dan pemeriksaan visual. Agen membangun shot dalam React, SVG, atau Three.js; Remotion menghitung frame dan merender film. Aset dan pelajaran dari film selesai menjadi bekal film berikutnya.

## 0. Buka repo, pilih mode

Baca `AGENTS.md` aktual sebelum bekerja. Semua contoh perintah dijalankan dari root repo; `mk` berarti `node bin/mk.mjs`. Periksa `git status --short` dan pertahankan pekerjaan pengguna yang sudah ada.

**Harus bisa menjalankan shell dan membuka JPEG/PNG lokal.** Jika tidak bisa melihat gambar, berhenti sebelum membangun video dan jelaskan keterbatasannya. Render sukses saja tidak cukup untuk menilai hasil.

| Brief | Mode | Baca |
|---|---|---|
| Cerita, sejarah, dokumenter, explainer, pelajaran, orang/tempat/benda | **Scene mode**, pilihan default | `docs/scenes/WORKFLOW.md`, `CRAFT.md`, `KIT.md` |
| Promo produk/model berbasis angka, UI, klaim, dan tipografi | Spec mode jika layout tetap cocok dengan brief | `prompts/builder.md` |

Scene mode membangun shot khusus. Spec mode mengisi layout engine dari JSON dan bisa terasa seperti slide untuk narasi. Jangan memilihnya hanya karena lebih cepat.

### Kebutuhan lokal

Node.js >= 22, npm, ffmpeg, dan ffprobe. Jika dependency belum tersedia, gunakan lockfile repo dengan `npm ci`; jangan memasang ulang tanpa kebutuhan. Render pertama mungkin mengunduh browser Remotion.

```bash
node --version
ffmpeg -version
ffprobe -version
node bin/mk.mjs scene list
```

Scene mode lokal tidak memerlukan API berbayar tambahan, `mk init`, atau perubahan `.env`. Pipeline spec dan agen API punya konfigurasi terpisah. Jangan meminta API key untuk scene mode biasa, dan jangan mencetak rahasia ke log.

## 1. Brief, fakta, referensi

Ambil dari percakapan: tujuan, audiens, satu pesan, durasi, rasio layar, bahasa, suasana, suara, dan materi wajib. Tanyakan hanya informasi yang menentukan hasil dan belum tersedia. Buat format yang diminta; dua rasio tidak wajib untuk setiap proyek.

Simpan materi di `projects/<slug>/`:

| Berkas | Isi |
|---|---|
| `facts.md` | Fakta per butir, URL sumber, tanggal akses |
| `refs.md` dan `refs/` | Referensi visual, lisensi, foto, serta catatan apa yang terlihat |
| `treatment.md` | Brief, kerangka cerita, blok tiap shot |
| `script.md` | Narasi final dan timing |
| `public/` | VO, musik, model, tekstur, media proyek |

Fakta berasal dari sumber yang dibuka, bukan ingatan. Utamakan sumber primer. Jika sumber berbeda, catat keduanya dan beri tahu pengguna pilihan yang dipakai. Jangan membuat kutipan, tanggal, angka, atau klaim sendiri.

Untuk benda nyata, buka foto lalu catat proporsi, bentuk, material, warna, dan detail yang terlihat. Tandai bagian tanpa referensi sebagai **rekaan**. Jangan menyalin logo/seal resmi atau tanda tangan orang nyata; gunakan emblem sendiri atau flourish generik.

## 2. Treatment dan storyboard sebelum kode

```bash
node bin/mk.mjs film list
node bin/mk.mjs film show StikAndaiOjol
node bin/mk.mjs storyboard "ojol bertemu penjual kopi saat hujan" --format 9:16 --detik 12 --slug ojol-hujan
```

`storyboard` membuat draf `projects/<slug>/treatment.md` berdasarkan cakupan aset dan catatan film. Pilihan gaya, kamera, ritme, dan pembagian shot berbasis aturan, tanpa panggilan LLM. Gunakan `--gaya <slug>` untuk gaya yang telah dipilih. Perintah menolak menimpa treatment kecuali diberi `--timpa`; lindungi revisi pengguna.

Lengkapi semua penanda `ISI`. Draf bukan keputusan dan tidak menggantikan penulisan cerita. Gunakan struktur `docs/scenes/TREATMENT.md`: brief → kerangka → blok tiap shot. Untuk brief terbuka, tawarkan dua atau tiga treatment sesuai WORKFLOW sebelum menulis penuh.

Setiap shot mencantumkan subjek dan aksinya, near/middle/far planes, referensi atau rekaan, tinggi kamera dan focal length, gerak kamera, komposisi grid, beat, narasi, suara, teks pendukung, serta transisi. Horizon dan subjek ditempatkan terhadap thirds/golden lines; jelaskan apa yang menuntun mata.

Variasikan posisi kamera antar-shot dan bawa satu motif melewati cut. Hindari shot yang hanya judul di atas latar. Titik awal narasi: 2,2–2,5 kata per detik, lalu sesuaikan dengan rekaman.

**Gate:** pengguna menyetujui script dan storyboard sebelum pembangunan shot. Jangan meminta persetujuan ulang yang sudah diberikan kecuali ada perubahan substansial.

## 3. Pustaka dulu

Baca `docs/scenes/ITEMS.md` dan `KIT.md` sebelum menulis komponen reusable.

```bash
node bin/mk.mjs gaya list
node bin/mk.mjs gaya show poly3d
node bin/mk.mjs aset find bus
node bin/mk.mjs item find perahu
node bin/mk.mjs kit find kamera
```

Buka film contoh gaya terpilih. Periksa isi pustaka lewat CLI; slot gaya terdaftar tidak berarti asetnya tersedia. Untuk tiap benda storyboard, gunakan aset yang ada atau tambah varian. Jika hanya ada di gaya lain, pelajari proporsi dan variannya. Benda reusable yang belum ada dibuat di library, bukan langsung di scene.

```bash
node bin/mk.mjs aset prompt bangku stik --target kode
node bin/mk.mjs aset prompt pos-ronda poly3d --target 3d
# Jalankan aset baru hanya untuk id yang belum ada.
node bin/mk.mjs aset baru benda-baru stik
npx tsc --noEmit -p .
node bin/mk.mjs item preview benda-baru-stik
```

`aset prompt` mencetak prompt target `kode`, `gambar`, atau `3d`; perintah ini tidak memanggil model atau menghasilkan GLB sendiri. Nama aset `<benda>-<gaya>`. Isi metadata, ukuran, varian, sumber, lisensi, dan bagian rekaan. Buka preview, bandingkan referensi, perbaiki, lalu preview ulang.

Film memakai `<Aset>` atau `<Aset3D>` dari `packages/core/src/library/aset.tsx`. Kontrak di `library/types.ts`: 2D di dalam SVG, x/y titik menyentuh tanah dan s pixel per meter; 3D di dalam ThreeCanvas, meter, origin tengah alas, +Y ke atas. Waktu aset `t` memakai frame berbasis 30 fps; konversi bila fps komposisi berbeda. Id tidak terdaftar atau dimensi salah membuat render gagal.

```bash
node bin/mk.mjs aset peta
node bin/mk.mjs gate --no-render
```

`docs/aset/PETA.md` dibuat otomatis, jangan disunting manual. Gate statis tidak menggantikan preview visual. Verifikasi implementasi sebelum menganggap fitur di spec desain sudah tersedia, termasuk impor dan preview otomatis gate.

### Aset eksternal

Catat provenance dan lisensi per aset. Simpan media proyek di `projects/<slug>/public/`; final render harus bisa memuatnya secara lokal. Catat unit, origin, forward axis, skala, serta nama clip animasi.

```bash
node bin/mk.mjs asset check projects/contoh/public/model.glb --expect 1.8
node bin/mk.mjs asset optimize projects/contoh/public/model.glb --ratio 0.5
```

Baca opsi CLI sebelum download/optimasi. Lab `scripts/` dan catatan `docs/research/` adalah eksperimen dengan batasan masing-masing, bukan otomatis komponen produksi.

## 4. Satu proof shot dahulu

Pilih shot dengan referensi paling jelas. Bangun shot itu saja, typecheck, render dua atau tiga frame dengan grid, buka, dan perbaiki. Tunjukkan satu still kepada pengguna.

**Gate:** dapatkan reaksi terhadap gaya proof sebelum membangun sisanya. Persetujuan script tidak otomatis menjadi persetujuan gaya gambar.

## 5. Bangun shot dan geraknya

Contoh: `PizzaScene.tsx` untuk scene pendek dan framing portrait; `UnairFilm.tsx`, `UnairShotsA/B.tsx`, dan `UnairScene.tsx` untuk multishot dengan VO. Baca yang relevan, jangan menyalin seluruh film tanpa kebutuhan.

- Satu komponen per shot; susun `Shot[]` melalui `Film` di `scenes/film.tsx`.
- Daftarkan komposisi di `scenes/index.tsx` dan `scenes/manifest.ts`.
- `u`: beat clock yang dapat di-warp untuk VO. `a`: ambient clock untuk gerak dengan kecepatan nyata.
- Frame harus bisa dihitung sendiri dalam urutan acak. Gunakan seed tetap; precompute/cache simulasi, bukan akumulasi delta atau state frame sebelumnya.
- Ease perubahan minimal lima frame; filter SVG statis. Periksa juga pergantian properti/objek agar tidak pop.
- Bangun orang dengan skeleton dan IK sesuai kontak tangan/kaki; ukuran benda dan perspektif mengikuti jarak kamera.
- Ikuti aturan gaya: ilustrasi memakai lapisan, overlap, shadow, dan detail referensi; gaya stik tetap mengikuti aturan gambar datarnya.

## 6. VO, musik, SFX

Suara boleh rekaman pengguna, TTS tersedia, atau tanpa VO. Berikan naskah sebagai teks biasa, angka dieja, satu paragraf per shot. Taruh rekaman di `projects/<slug>/public/vo.mp3`; atur `project` dan `vo` pada manifest.

```bash
node bin/mk.mjs vo-cut projects/contoh/public/vo.mp3
node bin/mk.mjs beats projects/contoh/public/music.mp3 --fps 60
```

Gunakan jeda untuk membagi passage, lalu selaraskan durasi, caption, dan beat melalui warp. Sisakan sekitar 0,5 detik sebelum dan 1 detik sesudah passage sebagai titik awal. SFX dapat mendahului visual 2–3 frame; duck musik di bawah VO dengan `bed.duck`. Periksa cue pada still; jelaskan jika audio belum didengar.

## 7. Lihat, ukur, perbaiki

Typecheck sebelum setiap render. **Satu job render pada satu waktu.**

```bash
npx tsc --noEmit -p .
node bin/mk.mjs scene stills NamaScene 0,60,120 --grid
node bin/mk.mjs scene stills NamaScene 120 --grid --region 400,300,300,400
```

Ganti id/frame/region sesuai scene. Buka `out/scenes/<Id>/sheet.jpg`, gambar grid, dan frame penuh. Gunakan region untuk orang/benda kecil. Periksa tiap shot, awal/akhir transisi, serta 4–6 frame sepanjang aksi penting.

Cek kecocokan referensi, komposisi, perspektif, kontak tanah, occlusion, pose antara, teks terpotong, caption menutup aksi, area kosong, dan konsistensi antar-shot. Setelah perubahan, render dan buka ulang frame terdampak.

Laporkan hanya yang terlihat. Still tidak membuktikan tempo, smoothness, foot locking, atau kualitas audio. Exit code sukses tidak membuktikan kualitas visual.

## 8. Render, serahkan, catat

```bash
node bin/mk.mjs scene video NamaScene
```

Hasil: `out/scenes/<Id>/<Id>.mp4`. Ambil beberapa frame dari MP4 dan buka untuk mengecek hasil encode. Serahkan file dan kelemahan yang masih terlihat; jangan mengaku menonton/mendengar jika belum.

Untuk rasio tambahan, susun ulang framing dan periksa semua shot; jangan mengandalkan crop otomatis. Setelah selesai, isi `packages/core/src/scenes/catatan.ts`: gaya, format, kamera, ritme, durasi, satu pelajaran. `film list/show` membaca catatan itu; gate memperingatkan scene tanpa catatan.

## Spec mode untuk promo

Baca `prompts/builder.md`. Konfigurasi model/API mengikuti CLI dan `.env.example`; jangan mencetak `.env`. `mk doctor` memeriksa konfigurasi dan dapat menghubungi penyedia model. Gunakan perintah API berbiaya sesuai otorisasi tugas.

```bash
node bin/mk.mjs new promo-contoh --brief "Produk, audiens, satu pesan, CTA, bahasa, brand" --duration 30
# Lengkapi projects/promo-contoh/facts.md sebelum generasi.
node bin/mk.mjs run promo-contoh
```

Untuk kendali bertahap: `concept` → `plan` → `lint` → `audio` → `review` → `render`. Buka review/contact sheet sendiri. `spec.json` sumber layout dan copy; perbaiki spec untuk satu video sebelum mengubah engine bersama. Sesudah edit: `mk lint <slug>` dan review ulang.

`mk code` adalah pipeline generasi kode API yang berbeda dari scene mode manual; jangan jadikan default untuk narasi.

## Revisi dan troubleshooting

| Gejala | Tindakan |
|---|---|
| Terasa seperti slide | Cek mode/storyboard; beri subjek beraksi dan ruang pada tiap shot |
| Aset tidak ditemukan | `aset find`, cek id/gaya, buat dan daftarkan sebelum render |
| Gate menyebut PETA usang | `aset peta`, gate ulang |
| Teks tertutup / pose janggal | Buka frame penuh/region, perbaiki komposisi atau target IK |
| Gerak berubah saat seek | Cari state, random tanpa seed, akumulasi waktu; hitung dari frame absolut |
| GLB/canvas kosong | Cek path, kamera, skala, loading; baca lab terkait sebelum mengubah loader |
| Render lambat | Pastikan satu render, cek kompleksitas dan ukuran aset |
| Model API tidak tersedia | Untuk pipeline API: cek doctor dan id model konfigurasi |
| Masalah berulang | Simpan frame/error konkret dan cari penyebab sebelum mengulang render sama |

Shared code di engine, engines, widgets, `scenes/film.tsx`, atau `scenes/kit.tsx` perlu typecheck dan perbandingan still UnairScene/PizzaScene dengan sheet sebelumnya. Untuk spec shared code, jalankan juga `mk example` dan `mk stills mimo-example`. Gate tidak menggantikan review visual.

## Penyimpanan dan laporan akhir

Jangan commit `.env`, `projects/`, `out/`, `node_modules/`, media, atau foto pengguna. Kode aset, metadata, dan URL referensi dicatat sesuai aturan repo. Commit lokal sesuai otorisasi; jangan push atau tambah remote tanpa permintaan. Pertahankan pemberitahuan lisensi kode/aset turunan.

Laporan akhir menyebut file hasil, pemeriksaan yang benar-benar dilakukan, temuan visual, dan batasan tersisa. Produksi selesai ketika hasil sesuai brief dan pemeriksaan dilakukan, bukan hanya saat MP4 terbentuk.
