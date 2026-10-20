# remotion-captions-themes

- Repo: https://github.com/vshukla7/remotion-captions-themes @ c2cfe29, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #3)
- Lisensi: MIT (file LICENSE, © 2026 Vinayak Shukla) → kode boleh di-port dengan atribusi
- Putusan: **Ditiru**. Konsep caption per kata ditulis ulang untuk `Film`; tidak ada kode yang disalin.

## Isi repo

Paket React kecil: `<CaptionTheme data theme primaryColor secondaryColor fontSize />` dengan 13 tema (`pop`, `karaoke`, `kinetic-01/02`, `podcast`, `beast`, `simple-one-word`, …) di `src/themes/`, layout engine untuk tema kinetik (`src/layout/`: ukur teks dengan canvas `measureText`, anchor, relasi, deteksi tabrakan), dan contoh player Vite. 41 file, tidak ada install hook, dependency hanya react/remotion.

## Cara kerja intinya

- Data: `{ lines: [{ words: [{ text, start, end, emphasis? }] }] }`, waktu dalam detik.
- `useWordTiming`: dari `frame / fps`, tandai tiap kata `isActive` / `isPast`.
- Tema memilih baris aktif, lalu menggambar katanya. `karaoke` mengisi warna kata secara kontinu dengan `clipPath: inset(...)` sesuai progres kata. `kinetic-01` memecah baris lebih dari 4 kata menjadi kelompok 3–4 dan menata kata dengan layout engine.
- Repo ini **tidak membuat timing**: data waktu kata harus datang dari luar.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit | Kesimpulan |
|---|---|---|---|
| Sumber waktu kata | tidak ada | `apps/cli/edge_say.py` sudah menulis `[kata, mulai, selesai]` dari edge-tts (dipakai spec mode) | MotionKit sudah punya sumbernya |
| Caption scene mode | — | `Film` `caps`: kalimat per baris, frame ditulis manual | **Ditambah** caption per kata |
| Pergantian warna kata | `pop`: warna berganti dalam 1 frame, mengandalkan CSS `transition` | aturan 8: tidak ada lompatan 1 frame | CSS transition tidak dirender Remotion (setiap frame dirender terpisah); MotionKit memakai easing per frame |
| Pemecahan halaman | > 4 kata dipecah 3/4 | — | Ditiru, diperbaiki: dibagi rata per frasa (5 → 3 + 2) |
| Ukur teks | canvas `measureText` | belum ada | Calon untuk aturan "spasi teks pakai px" (repo #1); belum diambil |

## Eksperimen

- Suara: `python apps/cli/edge_say.py id-ID-ArdiNeural +0% projects/repo-lab/public/vo-pasar.txt … vo-pasar.mp3 vo-pasar.json` → 15 kata, 7,5 detik. edge-tts tidak menyertakan tanda baca di kata, jadi halaman dipotong berdasarkan jeda (> 0,25 s; jeda koma di sini 0,31 s).
- Lab: `scripts/lab/remotion-captions-themes-lab.tsx`, composition `WordCapsLab` (2 shot, passage VO dipetakan lewat `vo`, `words` dari JSON).
- Yang dilihat:
  - Still frame 70/100/250/322/340/430: kata yang menyala sesuai jadwal JSON. Versi 1 menyisakan "ramai" sendirian (4 + 1); diperbaiki jadi 3 + 2.
  - Frame 62 tepat di batas "itu" dan "pasar": keduanya setengah menyala (crossfade 4–6 frame, disengaja).
  - Video pertama: di 6,2 s halaman lama dan baru bertumpuk saat ganti halaman di tengah kalimat. Diperbaiki: halaman yang menyambung tanpa jeda berganti bergiliran (keluar 5 frame, lalu masuk 5 frame); frame 365–378 dibuka, tidak bertumpuk lagi.
  - Sinkron: awal suara terdeteksi (silencedetect −35 dB) di 0,68 / 3,53 / 5,44 s; frame MP4 di 0,70 / 3,55 / 5,45 s menunjukkan "Pagi" / "Penjual" / "lalu" menyala. Batas kata edge-tts 0,12–0,18 s lebih awal dari awal suara yang terdeteksi; belum bisa dipastikan apakah itu dari TTS atau dari ambang detektor. Sinkron belum didengar langsung oleh orang.
  - Lembar 12 frame dari MP4 (`out/repo-lab/wordcaps-check.png`) dibuka.

## Yang diambil

| Dari repo | Ke MotionKit | Cara |
|---|---|---|
| Caption per kata dari data waktu | `packages/core/src/scenes/wordcaps.tsx` (`WordCaps`, tipe `Word`) | Tulis ulang: waktu rekaman dipetakan ke frame film lewat passage `vo` tiap shot |
| Pemecahan baris panjang | `paginate()`: frasa di tanda baca/jeda, halaman ≤ 4 kata dibagi rata | Tulis ulang, diperbaiki |
| Penanda kata aktif (pop/karaoke) | warna emas + naik 4 px, easing 4 frame masuk / 6 keluar; kata yang belum diucapkan lebih redup | Tulis ulang tanpa CSS transition |
| — | prop `words` di `Film` (menggantikan `caps` bila diisi) | Baru |

## Batasan dan catatan

- edge-tts membuang tanda baca dari kata; caption tampil tanpa titik/koma. Bisa diperbaiki dengan mencocokkan kata ke teks sumber di `edge_say.py`, tapi itu mengubah JSON spec mode, jadi belum dilakukan.
- Untuk rekaman manusia (bukan TTS) perlu sumber waktu lain, misalnya whisper.cpp; belum diuji.
- Hanya satu gaya (kotak gelap, kata emas). Tema kinetik repo ini cocok untuk reels, belum diambil.
- `UnairScene` tidak memakai `words`, jadi captionnya tidak berubah (`captions && !words`).
