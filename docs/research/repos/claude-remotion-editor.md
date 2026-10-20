# claude-remotion-editor

- Repo: https://github.com/ytrofr/claude-remotion-editor @ 9f3130c, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #5)
- Lisensi: MIT (file LICENSE, (c) 2026 ytrofr) → kode boleh di-port dengan atribusi
- Putusan: **Ditiru**. Dua alat debug ditulis ulang; editor jalur tangan dan galeri Lottie tidak diambil.

## Isi repo

Toolkit video demo aplikasi: 92 animasi Lottie (tap, swipe, kursor), sistem tangan melayang (`components/FloatingHand/`), SceneDirector (editor jalur tangan visual berbasis Vite, ekspor kode TS), mockup ponsel, capture screenshot dengan Playwright, dan alat debug (`components/debug/`). 752 file, 49 MB (sebagian besar video contoh). Dua file contoh namanya hanya beda huruf besar-kecil, jadi di Windows satu tidak ter-checkout; tidak berpengaruh untuk studi. Tidak ada install hook.

## Cara kerja intinya

- `DebugSceneTimeline`: bar di bawah frame, satu segmen per scene, scene aktif menyala dan terisi sesuai progres, playhead kuning.
- `DebugPathVisualization`: titik di setiap marker jalur dengan nomor, garis putus-putus penghubung, opacity lebih tinggi dekat frame sekarang.
- `DebugCrosshair`, `DebugClickMarkers`, `useDebugCoordinates`: membantu menaruh koordinat klik.
- Semuanya overlay HTML/SVG yang ikut terender ke frame pada composition debug terpisah.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit | Kesimpulan |
|---|---|---|---|
| Grid ukur, thirds, golden | tidak ada | `mk scene stills --grid --region --guides` | MotionKit lebih lengkap |
| Timeline di dalam frame | per scene | tidak ada | **Diambil**: `BeatBar` untuk beat bernama (repo #4), dengan lajur untuk beat yang tumpang tindih |
| Jejak jalur | marker per titik klik | tidak ada; laporan selalu "still tidak membuktikan gerak" | **Diambil**: jejak titik di ruang 3D untuk seluruh shot |
| Editor jalur visual | SceneDirector | tidak ada | Belum: butuh UI interaktif; dicatat |

## Eksperimen

- `packages/core/src/scenes/debug.tsx`: `BeatBar` (umum, untuk `beats()` apa pun).
- `scripts/market-exchange.tsx`: semua nilai gerak dipindah ke `pose(T, f)` murni; prop `debug` menggambar `Paths` (titik setiap 2 frame untuk pergelangan penjual biru, pembeli merah muda, kantong oranye; sudah lewat padat, belum terjadi pudar, sekarang besar; selalu di atas) dan `BeatBar`.
- Composition `MarketExchangeDebug` dan `MarketExchangeHoldDebug`. Still frame 40/76/140 dan Hold 95 dibuka: lintasan tangan dan kantong terbaca dari satu still; beat aktif (raih, serah, turun + langkah, tahan) menyala sesuai frame.
- Versi tanpa debug tetap identik (PSNR tak hingga di frame 80 dan 140 setelah refactor).

## Yang diambil

| Dari repo | Ke MotionKit | Cara |
|---|---|---|
| Timeline segmen + playhead | `BeatBar` | Tulis ulang, dengan lajur |
| Visualisasi jalur | `Paths` di MarketExchange (pola, belum komponen umum) | Tulis ulang untuk 3D |

## Batasan dan catatan

- `Paths` masih khusus MarketExchange; komponen umum butuh fungsi pose murni di setiap adegan. Pola ini dicatat untuk gelombang 3 (karakter).
- Bar beat menutupi bagian bawah frame; hanya untuk composition debug.
