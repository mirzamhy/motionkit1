# reactvideoeditor/remotion-templates

- Repo: https://github.com/reactvideoeditor/remotion-templates @ 6209b72, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #8)
- Lisensi: tidak ada file LICENSE; README bagian License menyatakan MIT, header file "free to use, credit appreciated" → diperlakukan MIT, atribusi di kode
- Putusan: **Ditiru**. Tiga template ditulis ulang sebagai komponen yang menerima isi.

## Isi repo

81 template mandiri (`templates/*.tsx`) dalam 9 kategori: chart, teks, animasi konten, background, sinematik, transisi, logo, intro/outro, gambar/media. Setiap file satu komponen default tanpa props, isi tertanam ("CINEMATIC", warna biru tetap). 82 file, 0,2 MB, tanpa package.json.

## Cara kerja intinya

- `lower-third.tsx`: garis aksen masuk dengan spring, bar menyusul 5 frame kemudian, teks muncul 15 frame kemudian.
- `letterbox-reveal.tsx`: tinggi bar atas-bawah diinterpolasi dari 50% ke 12% dalam 2 detik, isi memudar masuk.
- `chapter-title.tsx`, `film-burn.tsx`, `polaroid-frame.tsx`, `ken-burns.tsx`, `credits-roll.tsx`: pola serupa, semua berbasis `interpolate`/`spring` per frame.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit sebelum | Kesimpulan |
|---|---|---|---|
| Label tempat/waktu | — | label mesin ketik di pojok `Film` | Tetap ada |
| Nama + peran tokoh | `lower-third` | tidak ada | **Ditiru**: `LowerThird`, gaya modern dan arsip |
| Kartu bab | `chapter-title` | tidak ada | **Ditiru**: `ChapterCard` |
| Bar sinematik | `letterbox-reveal` | tidak ada | **Ditiru**: `Letterbox` (2.39:1 landscape, 3:4 portrait) |
| Chart, logo, UI | banyak | widget spec mode | Tidak diambil untuk scene mode |
| Film burn, polaroid, credits | ada | — | Calon untuk film arsip berikutnya |

## Eksperimen

- `packages/core/src/scenes/titles.tsx`: `LowerThird`, `ChapterCard`, `Letterbox` (SVG, beat clock `u`, keluar lebih cepat dari masuk).
- `Film`: prop baru `Shot.over(u, a, W, H)` untuk overlay di ruang layar di atas grade, sehingga judul tidak ikut terpotong jendela portrait; ikut dissolve antar shot.
- Lab `scripts/lab/remotion-templates-rve-lab.tsx`: `TitlesLab` (1920×1080) dan `TitlesLabTall` (1080×1920): shot 1 letterbox + lower third modern, shot 2 kartu bab arsip, shot 3 lower third arsip dengan wash foto lama.
- Yang dilihat: still 150/300/520/600 landscape dan 150/300/600 portrait. Versi 1: teks peran gaya modern ("PENJUAL SAYUR, PASAR KAPASAN") keluar dari bar. Diperbaiki dengan perkiraan lebar huruf kapital berjarak (0,72 em); crop landscape dan portrait dibuka: muat.
- Regresi: `UnairScene` frame 822 (tengah dissolve) identik dengan sebelum perubahan (PSNR tak hingga); gate Unair + Pizza lolos.

## Batasan dan catatan

- Lebar bar diperkirakan dari jumlah huruf (SVG tidak mengukur teks saat render); nama dengan huruf sangat lebar bisa melewati bar sedikit.
- Font Special Elite dan Libre Baskerville harus dimuat oleh film; di lab jatuh ke fallback.
- Di portrait, shot lab tanpa `fill` menyisakan pita latar di atas dan bawah; itu sifat `Film`, bukan judul.
