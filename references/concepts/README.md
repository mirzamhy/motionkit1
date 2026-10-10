# Komposisi tema dan percobaan gerak

Source ada di `packages/core/src/concepts/`. Hasil render dan gambar review ditulis ke `projects/style-concepts-01/`, yang tidak dilacak Git.

## Tema

| Komposisi | Isi | Durasi |
|---|---|---|
| BooksConcept | Satu Bab Lagi | 20 detik |
| CoffeeConcept | Perjalanan Secangkir Kopi | 36 detik |
| SignalConcept | Sinyal dari Jauh | 25 detik |
| BooksMotionProbe | Huruf bertahap, band wipe, headline menjadi judul halaman | 8 detik |
| SignalMotionProbe | Denyut, terowongan, iris planet, orbit dan gelombang penerima | 8 detik |

`index.tsx` menyimpan draft pertama; `index-v2.tsx` menyimpan draft kedua. Kedua draft belum memenuhi arah gerak yang diinginkan. Dua motion probe adalah percobaan lanjutan, bukan revisi lengkap ketiga video.

## Preview dan render

Jalankan dari root repo setelah `npm install`:

```powershell
npm run typecheck
npx --no-install remotion studio packages/core/src/concepts/SignalMotionProbe.tsx
node scripts/render-motion-probe.mjs signal
node scripts/render-motion-probe.mjs
node scripts/concept-preview.mjs --v2 --force
python scripts/concept-tools/make-sheets.py --v2
node scripts/concept-render.mjs
```

Untuk render satu tema, berikan ID: `node scripts/concept-render.mjs CoffeeConcept`.
Semua video H.264, 60 fps, tanpa audio. Font Google dimuat sebelum frame dirender.

## Review

```powershell
python scripts/concept-tools/check-render.py books coffee
python scripts/concept-tools/check-render.py signal
python scripts/concept-tools/finish-render.py
```

Review memerlukan ffmpeg, ffprobe, Python, Pillow dan NumPy. Tool Python menggunakan font Windows. Scan memeriksa jumlah frame, durasi, frame gelap dan perubahan piksel; kualitas desain tetap perlu ditinjau secara visual.

Studi sumber dan catatan transisi ada di `references/studies/batch-01/`.
