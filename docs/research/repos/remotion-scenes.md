# remotion-scenes

- Repo: https://github.com/lifeprompt-team/remotion-scenes @ 02c7a84, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #2)
- Lisensi: MIT (file LICENSE, © 2026 lifeprompt-team) → kode boleh di-port dengan atribusi
- Putusan: **Diambil** (dua transisi, ditulis ulang untuk `Film`), sisanya dicatat sebagai calon

## Isi repo

201 scene demo Remotion di 16 kategori (`src/scenes/<Kategori>/*.tsx`, 224 file tsx, 1,5 MB). Dependency: remotion, @remotion/three, three, R3F + drei. Tidak ada install hook. Helper bersama di `src/common` (`EASE`, `lerp`, warna, font) dan `LiquidAnimations/shared/blobUtils.ts`.

## Cara kerja intinya

Setiap file adalah **scene demo dengan isi tertanam** (teks "LIGHT LEAKS", "ZOOM OUT"), bukan komponen yang menerima konten. Mekanismenya sederhana: `interpolate`/`spring` per frame + CSS (`filter: blur`, `mixBlendMode: screen`, radial-gradient) atau SVG path. Jadi yang berguna adalah **resepnya**, bukan file-nya; untuk dipakai harus diekstrak menjadi komponen.

Contoh resep yang dibaca:

- `EffectLightLeak.tsx`: dua elips radial-gradient hangat (oranye, magenta) yang menyapu layar dengan `mixBlendMode: screen`, `filter: blur(40–60px)`, opacity naik-tahan-turun.
- `LiquidInkSplash.tsx` + `shared/blobUtils.ts`: blob tertutup dari n titik dengan radius acak ber-seed, disambung kurva Bézier halus; beberapa lapis membesar dengan spring.
- `TransitionZoomBlur.tsx`: shot lama scale 1→3 + blur 0→30 px, shot baru masuk dari scale 0.8.
- `EffectDepthOfField.tsx`: tiga layer teks, blur tiap layer = jarak titik fokus ke layer × 8 px (rack focus).

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit | Kesimpulan |
|---|---|---|---|
| Transisi spec mode | 10 transisi demo | `engines/transitions.tsx`: fade, flash, color, bar, streak, iris, blinds | Spec mode sudah setara; blinds/iris sudah ada |
| Transisi scene mode | — | `Film` hanya dissolve 24 frame | **Diambil**: ink dan leak |
| Easing | `EASE.out` = bezier(0.16, 1, 0.3, 1) | `outE` sama | Sudah ada |
| Grain, VHS, chromatic | scene demo | `Film` grain statis + wash "foto lama" | Grain cukup; VHS/chromatic tidak cocok untuk film sejarah |
| Partikel (salju, asap, sakura, kembang api) | 10 demo | `kit/fx.tsx`: Burst, Confetti | Calon gelombang 4 (VFX), terutama asap dan hujan/salju |
| Rack focus | 3 layer CSS blur | tidak ada | Calon gelombang 4; butuh struktur layer per shot dan uji kecepatan blur CSS animasi |
| Cinematic title (documentary, vintage) | 10 demo | label mesin ketik di `Film` | Bisa jadi referensi gaya judul nanti |

## Eksperimen

- Kode baru: `packages/core/src/scenes/cuts.tsx` (`InkClip`, `Leak`, `CUT_SPAN`) + prop `cut` per shot di `film.tsx`.
- Lab: `scripts/lab/remotion-scenes-lab.tsx`, composition `CutsLab` (3 shot × 180 frame, 60 fps; shot 2 `cut: 'ink'`, shot 3 `cut: 'leak'`).
- Render: `npx remotion still scripts/lab/remotion-scenes-lab.tsx CutsLab out/repo-lab/cut-<f>.png --frame=<f>`
- Yang dilihat:
  - Ink versi 1 (frame 186–234): tetesan satelit sudah besar di frame 196 sementara noda utama belum terlihat. Diperbaiki: noda utama memimpin dari frame pertama, tetesan menyusul (`at` 0.12–0.42).
  - Ink versi 2: terlalu cepat, layar tertutup sekitar frame 198 dari 54 frame. Diperbaiki: kurva `1-(1-x)^1.5`, jangkauan 1.15× jarak sudut.
  - Ink versi 3 (frame 190/200/212/226): menyebar bertahap, tepi tidak beraturan, layar penuh di frame 226.
  - Leak (frame 368/380/392): kilau hangat oranye-merah muda paling kuat di tengah dissolve, hilang di akhir.
  - Still tidak membuktikan geraknya mulus.
- Regresi: `UnairScene` frame 520/3126/3640 dirender ulang dan dibandingkan dengan still lama: PSNR 44,5–46,1 dB (setara noise JPEG, tidak ada beda yang terlihat). Frame 822 (tengah dissolve) dibuka: dissolve biasa. `PizzaScene` tidak memakai `Film`.

## Yang diambil

| Dari repo | Ke MotionKit | Cara |
|---|---|---|
| Blob ber-seed (`blobUtils.ts`) + ide splash berlapis | `InkClip` di `cuts.tsx`: clipPath noda utama + 7 tetesan | Tulis ulang dengan `rng` MotionKit; clipPath, bukan filter |
| Light leak screen-blend | `Leak` di `cuts.tsx` | Tulis ulang; kelembutan dari gradien, **tanpa** blur animasi (aturan 8 AGENTS.md) |
| — | prop `cut` di `Shot`, `CUT_SPAN` | Baru; default tetap dissolve 24 frame |

## Batasan dan catatan

- Ink memakai garis tepi keras; belum ada tepi basah/berserat. Bisa ditambah dengan tekstur statis kalau diperlukan.
- Leak memakai warna tetap (oranye, merah muda); belum mengikuti palet film.
- Waktu SFX di `Film` masih memakai `FADE` 24 untuk ekor suara, belum `CUT_SPAN`.
- Rack focus, partikel asap/hujan/salju dan zoom-blur dicatat untuk gelombang 4.
