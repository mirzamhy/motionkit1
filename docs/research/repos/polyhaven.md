# Poly Haven + polyhaven-skill

- Sumber: https://polyhaven.com (API https://api.polyhaven.com) dan https://github.com/MaksPyn/polyhaven-skill @ 25fd240, dipelajari 21 Oktober 2026
- Gelombang: 2, asset dan optimasi
- Lisensi:
  - Asset Poly Haven: CC0, tanpa kewajiban atribusi.
  - API: gratis untuk semua penggunaan termasuk komersial; setiap panggilan wajib membawa User-Agent/Referer unik bernama software; kredit ringan hanya bila konten ditampilkan lewat API di dalam software (ToS dibaca langsung dari github.com/Poly-Haven/Public-API, 21 Okt 2026).
  - polyhaven-skill: tanpa lisensi → hanya ide.
- Putusan: **Diambil** (asset) + **Ditiru** (alur cari/unduh).

## Cara kerja

- `GET /assets?type=models&categories=…` → daftar id; `GET /info/{id}` → nama, penulis, polycount, dimensi (mm); `GET /files/{id}` → pohon varian; glTF 1k berisi `.gltf` + `include` (bin, tekstur diff/nor/arm) dengan ukuran dan md5.
- polyhaven-skill membungkus ini sebagai CLI (search, info, files, download) dan mencatat syarat API.

## Masuk ke MotionKit

- `apps/cli/asset.ts` + `node bin/mk.mjs asset polyhaven search <kata>` dan `… get <id…> [--res 1k] [--project p]`: unduh glTF + semua include, cek md5 setiap file (yang sudah ada dan cocok dilewati), tulis `<id>.asset.json` sesuai `asset-contract.md` (sumber, lisensi CC0-1.0, penulis, resolusi, satuan meter, bounds dari mm → m, polycount, daftar file + md5, tanggal).
- Lab `scripts/lab/polyhaven-lab.tsx`: `PhModel` (alas di y = 0, dipusatkan dari bagian yang terlihat, opsi `only` untuk satu node), `PolyhavenLineup` (grid 10 cm, bar 50 cm, ukuran terukur), `StockedProcedural` vs `StockedReal` (lapak dengan sayur prosedural vs produk Poly Haven). `VendorStall` mendapat `stock={false}`.

## Eksperimen

- 6 model (bananas, food_ginger_01, food_lime_01, yellow_onion, sweet_potato, wooden_cutting_board), 1k: 30 file, 8,9 MB, semua md5 cocok.
- Lineup dibuka: jeruk nipis 6×8 cm, bawang 7×9 cm, ubi 10 cm, talenan 45 cm wajar. **Jahe 57 cm berdiri tegak**: metadata Poly Haven sendiri mencatat 574 mm, jadi skala scan-nya yang salah. Dikoreksi di lab (×0,26, direbahkan). Dimensi dari sumber tetap harus dicek dengan render.
- Model "bananas" berisi satu sisir + 4 pisang lepas berjajar; di lapak hanya node `bananas_bunch` yang dipakai. Versi pertama sisirnya melayang karena batas dihitung termasuk bagian yang disembunyikan; diperbaiki.
- Papan hijau yang tampak "miring" di render pertama ternyata papan bawaan lapak dengan bayangan diagonal, bukan bug.
- Hasil akhir dibuka: tumpukan bawang, ubi, jeruk nipis, dua sisir pisang, jahe di talenan.

## Batasan

- Produk foto-scan realistis di atas lapak bergaya flat: gaya bertabrakan. Perlu dipilih: lapak ke material PBR atau asset di-toon-shade.
- Belum dikompres: 1 sisir pisang 46.868 poligon; setiap tumpukan menyalin mesh (belum instancing). Dikerjakan di repo optimasi gelombang 2.
- Asset tidak di-commit (folder `projects/`), hanya metadata dan alatnya.
