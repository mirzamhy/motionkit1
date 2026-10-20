# claude-remotion-skill

- Repo: https://github.com/haidrrrry/claude-remotion-skill @ 1dcbe5e, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #1)
- Lisensi: MIT (file LICENSE, © 2025 haidrrrry) → kode boleh di-port dengan atribusi
- Putusan: **Tiru**. Aturannya diambil dan ditulis ulang untuk scene mode; tidak ada kode yang disalin.

## Isi repo

Skill Claude untuk motion graphics di Remotion. 33 file; sebagian besar ukurannya (15 MB) cuma gif/mp4 demo. Isinya:

- `remotion-motion-graphics/SKILL.md`: 10 aturan wajib + alur 5 langkah (scope, setup, build, render, verify).
- `references/motion-patterns.md`: 17 pola siap salin (entrance, stagger, word reveal, bg mesh, grade, grain, vignette, Ken Burns, counter, exit, idle breathing, parallax, transisi, motion blur, sinkron SFX, caption).
- `references/design-rules.md`: palet, tipografi, struktur reel 30 detik, sound design, checklist sebelum kirim.
- `assets/theme.ts`: satu objek tema (warna, easing, preset spring).
- `examples/`: 6 composition promo dan dua script yang menyintesis SFX/musik dengan Node.

Tidak ada install hook. Dependency contoh: remotion, @remotion/cli, @remotion/google-fonts.

## Cara kerja intinya

Skill ini tidak berisi engine. Nilainya ada di aturan kerajinan: tidak ada easing linear, entrance menggerakkan 2–3 properti sekaligus, semua di-stagger, exit lebih cepat dari entrance, tumpukan 5 layer (bg, asset, grafis, grade, grain + vignette), dan wajib render → ekstrak frame → lihat → perbaiki.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit | Kesimpulan |
|---|---|---|---|
| Easing keluar | `bezier(0.16, 1, 0.3, 1)` | `outE`, kurva yang sama persis (`engine/util.ts`) | Sudah ada |
| Keyframe | tidak ada | `kf()` dengan easing per segmen | MotionKit lebih lengkap |
| Timing | "semua dari fps, tanpa angka frame" | beat clock `u` + warp ke VO, ambient clock `a` | MotionKit lebih kuat untuk film ber-VO |
| Grain/grade/vignette | div + data-URI noise | `Film` sudah menggradasi; `kit/fx.tsx` Grain statis | Sudah ada; grain MotionKit statis sesuai aturan filter |
| Verifikasi | render, ekstrak, lihat | aturan 5 dan 6 AGENTS.md + `--grid`/`--region` | MotionKit lebih ketat |
| Hold di antara gerakan | ada | tidak tertulis; CRAFT justru minta "selalu ada yang bergerak" | **Diambil**, disatukan: hold di beat clock, ambient tetap jalan |
| Stagger 3–6 frame | ada | hanya untuk tepuk tangan | **Diambil** sebagai aturan umum |
| Exit lebih cepat | ada | tidak tertulis | **Diambil** |
| SFX 2–3 frame sebelum visual | ada | `hitEnv` naik sebelum hit (visual), SFX diletakkan manual | **Diambil** sebagai aturan |
| Ducking musik di bawah VO | ada (aturan) | bed hanya fade in/out | **Diambil**: kode baru di `Film` |
| Spasi teks pakai px | ada | tidak tertulis | **Diambil**; bug yang sama muncul di eksperimen |
| Bg mesh, satu hero color, Ken Burns | ada | — | Tidak diambil untuk scene mode: gaya motion-graphics, bukan ilustrasi. Calon untuk spec mode |
| Motion blur (`@remotion/motion-blur`) | ada | belum terpasang | Ditunda ke gelombang 4 (VFX); perlu diuji dengan ThreeCanvas |

## Eksperimen

- File: `scripts/lab/claude-remotion-skill-lab.tsx`, composition `DuckLab` dan `NoDuckLab` (`Film` 2 shot, 10 detik, 60 fps).
- Public: `projects/repo-lab/public` (pad dari unair-sejarah, `vo-silent.wav` 12 detik sunyi, jadi trek hasil render hanya berisi bed).
- Render: `npx remotion render scripts/lab/claude-remotion-skill-lab.tsx DuckLab out/repo-lab/DuckLab.wav --codec=wav --public-dir=projects/repo-lab/public`
- Level RMS per 0,5 detik (dB):
  - NoDuck: `-46 -36 -33 -32 -32 -32 -32 -33 -34 -34 -35 -36 -37 -38 -38 -38 -39 -41 -44 -51`
  - Duck 0.3: `-46 -36 -33 -34 -42 -43 -43 -43 -37 -34 -35 -36 -37 -40 -48 -48 -49 -51 -51 -51`
  - Passage 2,0–4,3 s dan 7,0–9,3 s turun sekitar 10 dB (target 0.3 ≈ −10,5 dB), dengan transisi bertahap, tanpa lompatan.
- Still frame 28/40/120/254/258 dibuka. Versi pertama: kata saling bertabrakan (langkah 300 px untuk huruf 110 px). Setelah diperbaiki (slot 480 px, `textAnchor="middle"`), frame 40 dan 258 dibuka: stagger masuk dan keluar terlihat, tidak ada tabrakan. Still tidak membuktikan geraknya mulus.

## Yang diambil

| Dari repo | Ke MotionKit | Cara |
|---|---|---|
| Aturan ducking | `Film` prop `bed.duck` + `voCover()` di `packages/core/src/scenes/film.tsx` | Tulis ulang; opt-in, film lama tidak berubah |
| Hold, stagger, exit cepat, SFX mendahului, spasi px | `docs/scenes/CRAFT.md` bagian "Timing a beat" + satu baris tabel kesalahan | Tulis ulang, disesuaikan dengan dua clock |
| Dokumentasi prop | `docs/scenes/KIT.md` | — |

## Batasan dan catatan

- Perubahan `film.tsx` hanya menyentuh audio dan bersifat opt-in. `tsc` bersih. `UnairScene` tidak memberi `duck`, jadi suaranya tidak berubah; still Unair/Pizza tidak dirender ulang karena gambar tidak tersentuh.
- Ducking hanya berlaku untuk bed, bukan untuk SFX per shot.
- Aturan gaya promo (bg mesh, hero color, Ken Burns, struktur reel) dicatat untuk spec mode, belum dimasukkan ke `prompts/`.
