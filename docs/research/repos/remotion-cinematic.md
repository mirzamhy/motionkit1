# remotion-cinematic

- Repo: https://github.com/codeverbojan/remotion-cinematic @ 18dbb50, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #4)
- Lisensi: MIT (file LICENSE, (c) 2026 remotion-cinematic contributors) → kode boleh di-port dengan atribusi
- Putusan: **Ditiru**. Konsep "waktu mengacu ke nama" ditulis ulang sebagai `beats()`; pola fungsi murni + unit test diambil.

## Isi repo

Template video demo produk: engine (`src/engine/`: camera, choreography, cursor, layout, ui-state, audio), primitives app-UI, editor visual di Studio, CLI import Figma, 509 test vitest. 169 file, 8 mp3 contoh. Tidak ada install hook.

## Cara kerja intinya

- `SceneTiming = { id, durationInFrames }`; `getSceneStartFrame(scenes, id, overlap)` menjumlah durasi.
- Keyframe kamera `{ scene: 'intro', at: 'start' | 'end' | 0.5, x, y, scale }` diubah sekali menjadi frame oleh `resolveTimeline` (`engine/camera/resolveTimeline.ts`), lalu `interpolateCamera` meng-ease di antaranya.
- SFX cue `{ scene, at, sfx }` di-resolve dengan cara yang sama (`engine/audio/resolveCues.ts`); musik diredam dalam rentang ducking dengan ramp linear 8 frame.
- Semua resolver adalah **fungsi murni** dan dites tanpa render (`__tests__/resolveTimeline.test.ts`).

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit | Kesimpulan |
|---|---|---|---|
| Waktu dalam shot | nama scene + posisi | angka frame mentah (`ease(f, 66, 86)`) | **Diambil** sebagai `beats()` |
| Antar shot | durasi scene berurutan | `Film` (`dur`, dissolve) + beat clock/warp ke VO | MotionKit sudah setara atau lebih |
| Ducking | ramp linear 8 frame | `bed.duck` (repo #1): easing 15 frame | Milik MotionKit lebih halus |
| Unit test | vitest, 509 test | tidak ada | **Diambil** polanya: `node:test` + `tsx`, tanpa dependency baru |
| Editor Studio, kursor, UI app | ada | tidak ada | Untuk demo produk; tidak relevan untuk scene mode |

## Eksperimen

- `packages/core/src/scenes/beats.ts` + `beats.test.ts` (5 test lolos: `npx tsx --test packages/core/src/scenes/beats.test.ts`).
- `scripts/market-exchange.tsx` ditulis ulang dengan 9 beat bernama (`jual`, `raih`, `serah`, `tahan`, `kembali`, `tarik`, `angkat`, `turun`, `langkah`).
- **Identitas**: 12 still (frame 0–167) sebelum dan sesudah dibandingkan: PSNR tak hingga (identik per piksel), juga setelah refactor kedua (`pose()` murni).
- **Variasi gaya** (composition di `scripts/vendor-lab.tsx`):
  - `MarketExchange` asli, 168 frame.
  - `MarketExchangeHold`: `hold: 14`, diam 14 frame setelah serah-terima (aturan hold dari repo #1). Semua beat sesudahnya bergeser otomatis, 182 frame.
  - `MarketExchangeFast`: `tempo: 0.75`, 132 frame.
  - Ketiganya dirender dan digabung berdampingan (`out/repo-lab/beats-compare.mp4`). Lembar 1 frame per detik dibuka: versi Tahan masih memegang kantong berdua saat versi asli sudah lepas; versi Cepat selalu mendahului.

## Yang diambil

| Dari repo | Ke MotionKit | Cara |
|---|---|---|
| Waktu mengacu ke nama, di-resolve sekali | `beats()`: `[nama, panjang, jeda]`, jeda negatif = tumpang tindih; `T.p`, `T.span`, `T.a`, `T.b` | Tulis ulang |
| Resolver murni + test | `beats.test.ts` dengan `node:test` | Tulis ulang |

## Batasan dan catatan

- `beats()` baru dipakai di MarketExchange (lab). `Film` dan film lama tidak berubah.
- Variasi tempo membulatkan panjang beat ke frame; tempo sangat kecil bisa membuat beat 0 frame.
- `tahan` tidak menahan gerak latar karena adegan ini belum punya ambient clock.
