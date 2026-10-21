# Kenney (+ Quaternius)

- Sumber: https://kenney.nl/assets (organisasi GitHub https://github.com/KenneyNL), dipelajari 21 Oktober 2026 (gelombang 2)
- Lisensi: pack Food Kit 2.0 → `License.txt` di dalam zip: Creative Commons Zero (CC0). Halaman pack juga menyatakan CC0.
- Putusan: **Asset**. Satu pack dipakai; tidak ada kode yang diambil.

## Cara memperoleh

Tidak ada API. Halaman pack memuat link zip langsung (`#donate-text`, "Continue without donating…") di balik ajakan donasi. Pola ini dipelajari dari adapter Kenney di 3d-asset-server; MotionKit tidak membuat scraper, pack diambil satu per satu dari halamannya.

**Quaternius** (CC0/QAL menurut 3d-asset-server): unduhannya lewat Google Drive/itch.io, tidak bisa otomatis; belum diambil.

## Eksperimen

- Food Kit 2.0: zip 4,6 MB, 200 GLB (+ FBX, OBJ), diekstrak ke `projects/vendor-action/public/kenney/food-kit` (tidak di-commit).
- `KenneyLineup` (`scripts/lab/polyhaven-lab.tsx`), grid 10 cm, dibuka: **skala Kenney ≈ 3× ukuran asli** (bawang 21–25 cm, paprika 17 cm, wortel 72 cm, pisang 63 cm, ikan 62 cm). Di lapak diskala 0,28–0,5 per jenis.
- `StockedKenney` (`scripts/polyhaven-stall.tsx`): lapak flat dengan kol, terong, wortel, bawang, paprika, ikan. Gaya low-poly Kenney cocok dengan lapak flat MotionKit; ini juga pertama kalinya ada ikan di lapak.
- Bug yang ketemu: model yang direbahkan setelah alasnya diletakkan di y = 0 tenggelam separuh ke papan (wortel hanya tampak daunnya). Diperbaiki di `PhModel` dengan prop `tilt` yang diterapkan sebelum batas dihitung. Ikan Kenney sudah rebah di modelnya, jadi tidak dirotasi.

## Perbandingan empat gaya lapak

`out/repo-lab/stall-4way.jpg`: prosedural · Kenney (low-poly) · Poly Haven di lapak flat · Poly Haven di lapak kayu PBR. Untuk gaya MotionKit yang sekarang, Kenney paling serasi; Poly Haven cocok bila lapaknya ikut PBR.

## Batasan

- Ikan satu papan dengan sayur: secara makna perlu lapak ikan tersendiri.
- Tumpukan masih menyalin objek satu per satu (belum instancing).
