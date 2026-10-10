# Studi ulang 01: tiga video, elemen dan transisi

Tanggal studi: 10 Oktober 2026. Sumber yang ditinjau adalah video **Original**, bukan video Remake di halaman Skillry. Salinan penuh, hash sumber, lembar frame, cuplikan perbandingan, dan source Remotion disimpan bersama proyek ini.

| Referensi | Video asli | Frame asli | Studi Remotion yang dibuat |
|---|---|---|---|
| [TechHalla](https://skillry.dev/ai-videos/opus-5-5/techhalla-498547) | 1080×1080, 20 detik | 1200, 60 fps | Scramble teks, layout poster, pergantian teks dengan band dan wipe, masuknya kata aksen; sumber 5,8–9,4 dtk |
| [Dheepanratnam / Claude](https://skillry.dev/ai-videos/opus-5-5/dheepanratnam-706454) | 1280×720, 58 detik | 1740, 30 fps | Blur dissolve menuju panel reasoning; sumber 7,4–10,2 dtk. Tambahan slot roll bahasa; 44,6–45,4 dtk |
| [LeowenAI / LongCat](https://skillry.dev/ai-videos/opus-5-5/leowenai-125931) | 1280×720, 25 detik | 750, 30 fps | Ring halftone, mata sebagai penghubung, iris putih, perubahan bentuk mata dan kedipan; sumber 20,8–23,1 dtk |

## Membuka hasil

- [Galeri video dan perbandingan](../../../projects/style-study-01/index.html)
- [Bedah TechHalla](techhalla.md)
- [Bedah Claude](dheepanratnam.md)
- [Bedah LongCat](leowenai.md)
- [Recipe terstruktur](recipes.json)
- Video penuh: `projects/style-study-01/originals/`.
- Render, potongan sumber, video berdampingan, dan review sheet: `projects/style-study-01/out/`.
- Bukti frame seluruh film, **32 jendela transisi**, metadata, pengukuran iris, hash sumber, dan scan render: `projects/style-study-01/evidence/`.

Video berdampingan memakai cuplikan asli di kiri dan hasil Remotion di kanan, dengan waktu awal sumber tercantum di atas. Audio yang terdengar pada video perbandingan berasal dari referensi. Render Remotion sendiri tidak menyertakan musik atau SFX baru.

## Apa yang sudah dipelajari

TechHalla mengganti pesan melalui gerakan huruf, decode, band teks, dan perubahan skala. Claude menjaga suasana lewat latar hangat yang bertahan, mengosongkan foreground sejenak, lalu membangun informasi baru secara bertahap. LongCat memakai mata, titik, dan lingkaran sebagai penghubung; warna latar sering berbalik, tetapi bentuk yang diikuti mata penonton tetap terbaca.

Hasilnya berupa studi komponen dan cuplikan transisi yang dapat dijalankan. Keempat render merupakan rekonstruksi terpilih dari tiga film; setiap video penuh juga mempunyai peta adegan dan bukti transisi. Catatan katalog lama tetap disimpan. Temuan yang memperjelas atau membatasi label lama dijelaskan dalam masing-masing studi.

## Tingkat kepastian

**Teramati:** urutan visual, lokasi objek, arah wipe/roll, foreground yang hilang, perubahan warna, frame dan waktu pada lembar bukti. **Diukur:** resolusi, fps, jumlah frame, durasi stream, luas piksel putih pada iris, perubahan antarframe hasil render. **Perkiraan implementasi:** fungsi easing asli, font asli, jumlah subframe blur, shader, jumlah partikel, dan algoritma glyph. Video tidak menyediakan source code aslinya.

Kurva Bezier, band clip, grain SVG, dan ring SVG dalam rekonstruksi adalah cara kita mendekati gerakan yang terlihat. Font serif Claude memakai Georgia sebagai pendekatan; poster memakai Syne/Archivo Black; LongCat memakai Inter. Ukuran teks diukur dengan canvas setelah font selesai dimuat. Tidak ada klaim bahwa font atau shader ini identik dengan sumber.

Semua studi dirender pada 60 fps. Video 30 fps memiliki ketelitian observasi 1/30 detik; rendering ulang pada 60 fps tidak menambah detail yang tidak ada di sumber. Beberapa jendela bukti menggunakan setiap dua atau empat frame; langkahnya tercatat di `strip-windows.json` dan laporan masing-masing.

## Menjalankan kembali

Jalankan dari root MotionKit:

```powershell
npm run typecheck
node scripts/study-01.mjs
npx --no-install remotion studio packages/core/src/studies/index.tsx
python references/studies/batch-01/tools/compare.py projects/style-study-01
```

Render satu studi saja dapat memakai `node scripts/study-01.mjs TechStudy`. Komposisi lain: `ClaudeStudy`, `ClaudeRollStudy`, `LongCatStudy`.

Source studi terpisah berada di `packages/core/src/studies/`. `primitives.tsx` menyediakan `decode`, `FitText`, `WordBands`, `BlurDissolve`, `SlotRoll`, dan `ObjectIris`. Nilai `progress` adalah 0–1 dan tidak bergantung pada state dari frame sebelumnya. Contoh pemakaiannya ada di `Scenes.tsx`.

Analisis dapat diulang dengan `analyze.py`, `strips.py`, dan `measure.py` dalam folder `tools/`. Analisis memerlukan ffmpeg, ffprobe, Python, Pillow, dan NumPy. Render memakai dependensi Remotion yang sudah tersedia; font Google diambil pada render pertama. Tidak ada panggilan model Vikey atau ElevenLabs dalam studi ini.

## Verifikasi

Typecheck dijalankan sebelum dan sesudah penambahan source studi. Empat komposisi dirender menjadi MP4 dan still. Review sheet memeriksa keadaan sebelum, selama, dan setelah transisi. Scan seluruh frame mencatat durasi, perubahan terbesar, dan frame yang benar-benar kosong; hasilnya ada di `render-scan.json`.

Puncak perubahan pada iris putih adalah perubahan layar yang disengaja dan juga terlihat pada sumber. Scan ini membantu menemukan lompatan, tetapi tidak membuktikan kemiripan visual. Ambang slideshow dari `packages/qa` memakai crop 1920×900/1080×1600 dan kalibrasi film promo panjang; ambang tersebut tidak cocok untuk cuplikan studi 1080 persegi atau 1280×720. Penilaian akhir studi memakai bukti berdampingan dan scan dengan ukuran yang sesuai.

Materi media berada di `projects/`, yang sudah diabaikan Git. Source komponen dan laporan tetap dapat disimpan dalam version control sesuai aturan proyek.
