# claude-remotion-flow

- Repo: https://github.com/sellersessions/claude-remotion-flow @ fc59163, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #9)
- Lisensi: `package.json` "UNLICENSED", tanpa file LICENSE → hanya ide; tidak ada kode atau teks yang disalin
- Putusan: **Ditiru**. Treatment 3 lapis menjadi template scene mode; snap potongan ke ketukan musik ditulis baru tanpa Python.

## Isi repo

Pipeline video explainer: treatment Markdown (`treatments/*.md`) → komposisi Remotion (`src/*Explainer.tsx`), VO ElevenLabs per scene, durasi scene dihitung dari panjang MP3 VO lewat `calculateMetadata`, kartu bab disisipkan oleh `computeTimeline`, musik diredam dengan `buildMusicVolume`, deteksi onset musik dengan librosa (`scripts/music/detect-onsets.py`) dan `auto-snap.ts` yang memindahkan awal scene ke ketukan terdekat. 184 file.

## Cara kerja intinya

- **Treatment 3 lapis**: brief (tujuan, penonton, pesan, nada, referensi, format) → kerangka (Beat Sheet, PAS, Hook-Hold-Payoff, Energy Map) → tabel per scene (layar, VO, jumlah karakter, file).
- **Beat-snap** (`src/explainer-shared/metadata.ts`, `scripts/music/auto-snap.ts`): untuk setiap scene kecuali yang pertama, cari onset dalam jendela ±25 frame, setiap onset dipakai sekali, geser dengan mengubah durasi scene sebelumnya, jangan sampai lebih pendek dari VO-nya.
- **Amplop SFX**: whoosh di awal, boom di akhir, bed musik penuh.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit sebelum | Kesimpulan |
|---|---|---|---|
| Treatment | 3 lapis | WORKFLOW langkah 3 menyebut "dua atau tiga treatment" tanpa format | **Ditiru**: `docs/scenes/TREATMENT.md`, dengan kolom referensi, grid, beats, suara |
| Durasi dari VO | per MP3 | `mk vo-cut` + warp beat clock | MotionKit sudah punya padanannya |
| Onset musik | librosa (Python) | tidak ada | **Ditulis baru**: `apps/cli/onsets.ts` (ffmpeg + energy flux) |
| Snap potongan | auto-snap | tidak ada | **Ditulis baru**: `snapShots` + `mk beats` |
| Ducking | `buildMusicVolume` | `bed.duck` (repo #1) | Sudah ada |
| Whoosh/boom | file SFX | sintetis di `sceneSfx.ts` | Sudah ada; konvensi amplop ditulis di TREATMENT.md |

## Eksperimen

- `apps/cli/onsets.ts`: `decode` (ffmpeg → PCM mono), `detectOnsets` (flux log-energi, ambang bergerak ±0,25 s, jarak minimum 0,12 s), `snapShots`.
- `onsets.test.ts` (4 test lolos): deretan klik ditemukan dalam 30 ms; sunyi tanpa onset; snap memakai onset terdekat sekali saja dan shot pertama tetap; tidak ada snap bila tidak ada onset dekat atau shot sebelumnya jadi terlalu pendek. Dua kegagalan pertama dari test sendiri: waktu onset 36 ms terlalu awal (dipakai awal jendela, diganti ujung jendela) dan ekspektasi saya yang salah.
- Dua trek ketukan sintetis 12 s (kick + pad): `mk beats` membaca 99 BPM untuk trek 100 BPM dan 129 BPM untuk trek 128 BPM.
- Shot 160/175/190/150 frame: 100 BPM → potongan 160→145, 320→325, 515→504; 128 BPM → 160→170, 345→339, 529→535.
- Lab `scripts/lab/claude-remotion-flow-lab.tsx`: `RawLab` dan `SnapLab`, 4 shot di atas trek 128 BPM. Ketukan sebenarnya setiap 28,125 frame (168,75; 337,5; 534,4): potongan hasil snap (170, 339, 535) meleset ≤ 1,5 frame, potongan asli (160, 335, 525) sampai 9 frame. Onset yang terdeteksi di MP4 sekitar 3 frame lebih lambat dari ketukan di kedua versi (jeda encoder dan detektor). Frame 168/176/184/192 dari MP4 dibuka: dissolve mulai di 170.
- Grafik timeline kedua tempo: `out/repo-lab/snap-chart.png`.

## Batasan dan catatan

- Detektor sederhana: cocok untuk ketukan jelas (kick, perkusi), belum diuji pada musik tanpa transien.
- `mk beats` mencetak durasi baru; belum menulis ke file adegan.
- Sinkron potongan dengan ketukan belum didengar langsung oleh orang.
