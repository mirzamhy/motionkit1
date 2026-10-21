# 3d-asset-server (+ ambientCG, 3DAssets.dev, Kenney, Quaternius)

- Repo: https://github.com/arielshad/3d-asset-server @ 0b1cf49, dipelajari 21 Oktober 2026 (gelombang 2)
- Lisensi: Apache-2.0 (file LICENSE, `package.json`) → boleh port dengan atribusi
- Putusan: **Ditiru**. Pola adapter per sumber + etiket; adapter ambientCG ditulis ulang di MotionKit.

## Isi repo

Satu server (HTTP API, MCP, web UI, CLI) yang mencari 24 situs asset sekaligus dan mengunduh pilihan ke folder proyek. `src/providers/*.ts`: satu adapter per sumber (Poly Haven, ambientCG, Kenney, Quaternius, 3DAssets.dev, Sketchfab, BlenderKit, OpenGameArt, …), masing-masing menyatakan cara cari (API, scrape, link saja), apakah ada unduhan langsung, dan lisensinya.

## Yang dipelajari

- **Lisensi di setiap hasil**, termasuk apakah atribusi wajib.
- **Etiket**: cache, sedikit request per pencarian, User-Agent yang mengenalkan diri; konten berbayar, perlu login atau hotlink-protected tidak pernah diterobos, hanya diberi link; ShareTextures melarang unduhan otomatis, jadi cari saja.
- **Kenney**: pack zip CC0 bisa diunduh langsung. **Quaternius**: CC0/QAL tetapi unduhannya lewat Google Drive/itch.io, tidak otomatis.
- **3DAssets.dev**: REST `/api/v1/assets?q=`, GLB langsung dari CDN, tanda `aiGenerated`; syaratnya boleh mengambil sesuai kebutuhan proyek, tidak boleh me-mirror katalog.
- **ambientCG**: API v3 `/api/v3/assets?q=&type=&include=`, unduhan `ambientcg.com/get?file=<id>_<res>.zip`.

## Masuk ke MotionKit

- `mk asset ambientcg search <kata>` dan `… get <id…> [--res 1K-JPG] [--project p]` (`apps/cli/asset.ts`): unduh zip, cek ukuran byte, ekstrak dengan bsdtar, tulis `<id>.asset.json` (CC0-1.0, daftar map). Lisensi CC0 dicek langsung di ambientcg.com/license.
- `scripts/vendor-stall.tsx`: `WoodLook` context; bila diberi map PBR, papan cokelat memakai tekstur kayu (diulang ± setiap 40 cm), papan hijau dan timbangan tetap cat datar. Tanpa context, lapak sama seperti sebelumnya (PSNR 87 dB terhadap render lama).

## Eksperimen

- 3DAssets.dev: HTTP 503 "no available server" saat dicoba (21 Okt 2026); adapter belum dibuat.
- ambientCG: Planks037A (8 map, 5,6 MB) dan WoodSiding011 (5 map, 6,1 MB) diunduh.
- Dua bug di alat sendiri, dibetulkan: `tar` yang terpanggil adalah GNU tar dari Git, yang membaca "C:" sebagai host (sekarang memakai `System32\tar.exe` di Windows); escape path `C:\Windows`.
- Render tiga gaya lapak dibuka (`out/repo-lab/stall-3way.jpg`): prosedural · produk Poly Haven di lapak flat · produk Poly Haven di lapak kayu PBR. Versi PBR pertama terlalu gelap dan ikut mengubah papan hijau + timbangan jadi kayu; diperbaiki (hanya papan cokelat, warna lebih terang). Planks037A tetap kayu gelap.

## Batasan

- Belum ada pencarian gabungan lintas sumber di MotionKit; dua sumber (Poly Haven, ambientCG) terpisah.
- Kenney dan Quaternius belum diuji unduh.
