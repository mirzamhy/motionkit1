# Breakdown — "What if we lost gravity for 5 seconds?" (simulif.world)

Source: `C:\Users\mirza\Downloads\Video by simulif.world.mp4`
720×1280 (9:16), 30 fps, 111.5 s = 3345 frame. Konten asli selesai ~106 s; 106–111.5 s = iklan Higgsfield (buang).
Target remake: 1080×1920 @ 30 fps. Semua angka posisi di bawah sudah dikali 1.5 ke 1080p.

---

## 1. Design system

### Tipografi
- Satu keluarga serif klasik: **EB Garamond** (atau Cormorant Garamond). Tidak ada sans kecuali outro iklan.
- **Label HUD**: small caps / uppercase, letter-spacing ~0.3em, ~20px @1080. Contoh: `GRAVITY BACK IN`, `SLOWED 25×`, `PRESSURE · EARTH'S CENTRE`.
- **Angka besar**: regular, ~84px (timer) / ~66px (stat). Tabular numerals wajib, supaya angka tidak goyang saat berubah.
- **Sub-label** di bawah angka: uppercase, ~16px, spacing 0.25em, opacity 0.75. Contoh: `SWITCHED OFF · EVERYWHERE`.
- **Caption narasi**: italic, ~46px, center, max-width ~88%, ada text-shadow lembut (0 2px 12px rgba(0,0,0,.6)). Posisi **tengah layar (y ≈ 990/1920)**, bukan di bawah.
- Kata kunci di judul diwarnai merah (`gravity`, `float`).

### Warna (estimasi visual)
| Token | Hex | Dipakai |
|---|---|---|
| white | `#F4F1EA` | timer normal, stat, caption |
| red | `#E5452E` | timer saat gravity off, label `GRAVITY BACK IN`, pin "YOU", stamp RESULT |
| gold | `#E2B04A` | stamp "NOTHING", highlight leaderboard, label "SAME-SIZE PUSH" |
| navy dip | `#11223A` | warna dip-transition (bukan hitam murni) |
| space bg | `#05040B` | scene diagram (penampang bumi, bulan) |

### Layout HUD (1080×1920)
- Blok HUD kiri atas: x = 72, label pertama di y ≈ 345.
- Stack vertikal: label merah → timer → sub-label → (gap 30) → label stat → angka stat → sub-label → stat ke-2...
- Stat baru muncul **append ke bawah** (fade+slide-up 8px, ~8 frame). Stat lama fade out kalau scene ganti.

### HUD state machine (inti video)
| Fase | Label | Warna | Kecepatan timer |
|---|---|---|---|
| Pre | `GRAVITY OFF IN` / `REAL TIME` | putih | real-time, 13.180 → 0 |
| Off | `GRAVITY BACK IN` / `SLOWED 25×` | merah | 5.000 turun 1/25 real-time (≈1.3 ms per frame) |
| Myth | `PAUSED · THE MYTH` | merah | freeze 4.750 |
| Ground | `SLOWED 3.7×` | merah | lebih cepat, sampai 0 |
| After | `SINCE GRAVITY CAME BACK` / `TIME-LAPSE 5× → 480×` | putih | naik, makin cepat |
| End | `GRAVITY WAS OFF FOR` / `NOBODY FELT A THING` | putih | freeze 0:05.000 |

Format timer `m:ss.mmm` (`0:04.948`). Satu komponen `<Countdown>` dengan input `fase` + `rate` cukup untuk seluruh video.

### Komponen berulang
1. **Stamp** (`YOU FEEL NOTHING`, `RESULT · MYTH`, `ASTRONAUTS FEEL NOTHING`, `RESULT · EARTH RINGS`)
   - Box border 3px, label kecil di atas, kata besar bold serif di bawah, rotasi −3°.
   - Gold = "nothing", merah = "result".
   - **Animasi slam (dari analisis per frame @18.13 s):**
     f0: scale 1.6, opacity 0.3 → f1: 1.3 / 0.7 → f2: 1.15 / 1 → f3: 1.05 → f4: 1.0. Ease-out tanpa overshoot, total 5 frame.
     Hold ~35–40 frame, lalu fade out 6 frame.
   - Saat stamp masuk, stat terakhir di HUD ikut fade out.
2. **Caption italic**: crossfade 6–8 frame antar kalimat, tanpa slide.
3. **Dip transition**: fade ke navy `#11223A` 18–20 frame → hold 4–6 frame → fade in 8–10 frame. Total ≈ 1 detik. Dipakai di semua pergantian bab.
4. **Countdown "3… 2… 1…"**: italic kecil, tengah layar, di bawah horizon.

---

## 2. Timeline per scene (frame @30 fps)

| # | Waktu | Frame | Scene | Visual | Kamera / gerak | HUD & teks |
|---|---|---|---|---|---|---|
| 1 | 0.0–9.0 | 0–270 | Taman, hook | 3D low-poly: karakter kotak (kaos merah, jeans), anjing voxel, rumput tinggi instanced, gedung grid + tower kabur di fog, langit mendung | Wide statis, karakter idle | Judul 3 baris tengah atas: "What if we lost **gravity** for 5 seconds?". Caption ganti di f160, f225 |
| 2 | 9.0–13.7 | 270–411 | POV | f270 cut ke over-shoulder, f285 cut ke POV first-person: tangan kotak di kiri bawah, anjing lari di rumput | Handheld ringan | "3… 2… 1…" kecil di tengah |
| 3 | 13.7 | 411 | **Gravity off** | Flash: frame wash putih/kontras turun (rumput pucat) lalu pulih ~10 frame | — | HUD flip putih→merah, label jadi `GRAVITY BACK IN · SLOWED 25×` di frame yang sama |
| 4 | 13.7–16.5 | 411–495 | POV lanjut | Anjing slow-mo | — | Stat `GRAVITY` count 9.8 → 0.0 m/s² cepat (~15 frame). f480: `YOUR SCALE 70.0 kg` |
| 5 | 16.5–19.3 | 495–580 | Wide + anjing | Hard cut ke wide, horizon lebih rendah, sky gelap di kiri atas (vignette) | Statis | Caption "And you feel… nothing at all." Stamp gold slam di f544 |
| — | 19.3–20.5 | 580–615 | Dip navy | | | |
| 6 | 20.5–28.7 | 615–860 | **Myth** | Karakter T-pose melayang, air mancur berubah partikel naik, orang-orang lain melayang | Tilt-up / crane mundur pelan, horizon turun sampai rumput keluar frame | Timer freeze 4.750 `PAUSED · THE MYTH`. Stat `YOUR SCALE 0.0 kg · IMAGINED`. f822: stamp merah `RESULT · MYTH` |
| — | 28.7–29.6 | 860–888 | Dip navy | | | |
| 7 | 29.6–41.3 | 888–1240 | **Penampang bumi** | 2D vector: irisan (wedge) crust hijau, mantle coklat-oranye, outer core oranye, inner core kuning glow. Bintang kecil di bg hitam. Label uppercase spaced: `YOU` + pin merah, `CRUST`, `MANTLE`… | Zoom-out dari dekat crust ke wedge penuh (f888→930, ease-out). Panah putih ke dalam (pressure) | f1020: `PRESSURE · EARTH'S CENTRE` count 0 → 3,500,000 atm (~45 frame, ease-out) `≈ 360 GPa`. f1140: panah flip ke luar, ring cahaya (shockwave) jalan dari core ke crust |
| 8 | 41.3–44.5 | 1240–1335 | Push = pull | Zoom ke permukaan: panah abu `GRAVITY'S PULL` (bawah) vs panah gold `SAME-SIZE PUSH` (atas), pin merah besar | Zoom-in cepat ~10 frame | Stat `OUTWARD PUSH 9.8 m/s²` |
| — | 44.5–45.8 | 1335–1375 | Dip hitam | | | |
| 9 | 45.8–54.0 | 1375–1620 | **Bulan** | Space: bumi kecil di bawah, orbit dashed lengkung, bulan. Garis merah lurus "STRAIGHT LINE" keluar tangen orbit | f1530 zoom ke bulan (~15 frame) | `THE MOON'S SPEED 1.0 km/s`, `OFF COURSE AFTER 5s 3.4 cm`, label gold "3.4 cm OFF COURSE" |
| 10 | 54.0–58.7 | 1620–1760 | ISS | Crossfade ~10 frame ke ISS 3D di atas bumi besar | Drift pelan | Stamp gold `ASTRONAUTS FEEL NOTHING` f1722 |
| — | 58.7–59.5 | 1760–1785 | Dip hitam | | | |
| 11 | 59.5–71.5 | 1785–2145 | **Tanah naik** | Side-section 2.5D: langit + awan blur, barisan pohon, danau, lapisan tanah. Penggaris vertikal 0–120 m kanan. Siluet Patung Liberty dashed. Garis merah putus-putus `WHERE THE GROUND WAS` | Seluruh dunia (tanah + pohon + "YOU") geser naik terhadap penggaris; penggaris dan siluet diam | `GROUND HAS RISEN +17 → +107 m`, `RISING AT 108 → 165 km/h`. Caption ganti f1950, f2085 |
| — | 71.5–72.4 | 2145–2172 | Dip hitam | | | |
| 12 | 72.4–88.3 | 2172–2650 | **Bumi bergetar** | Globe 3D tengah, cincin dashed konsentris berdenyut di sekitar, label `SWELL EXAGGERATED 90×` | Globe pulse scale ±2% | Timer ke 0 → mode putih `SINCE GRAVITY CAME BACK`, timelapse makin cepat (0:00:01 → 1:04:13). `PLANET SWELL +1.6 → +8.0 → +1.7 km`, `ONE SWING 20.5 min`. Stamp merah `RESULT · EARTH RINGS` f2610 |
| — | 88.3–89.0 | 2650–2670 | Dip hitam | | | |
| 13 | 89.0–95.8 | 2670–2875 | **Timbangan** | Close-up low angle kaki di timbangan digital, angka hijau LCD 71.5 → 68.5 → 69.5 | f2800: cut ke medium (badan penuh), f2810: wide dengan anjing melompat ke kamera | `YOUR SCALE`, `SWING ± 1.5 kg · EVERY 20 MINUTES` |
| — | 95.8–96.5 | 2875–2895 | Dip hitam | | | |
| 14 | 96.5–104.5 | 2895–3135 | **Recap** | Aerial taman (high angle), karakter kecil di plinth | Statis lalu pelan turun | Timer freeze `GRAVITY WAS OFF FOR 0:05.000`. Leaderboard 6 baris (nomor kecil, nama uppercase kiri, hasil italic gold kanan, garis tipis antar baris). Muncul stagger ~6 frame/baris. Lalu baris 2–6 dim, `YOU` tetap disorot dengan garis gold |
| 15 | 102–106 | 3060–3180 | **CTA + loop** | Teks "Did you think you'd **float**?", `COMMENT YES OR NO`, `DID THE DOG NOTICE?` (merah). | f3135: kamera dolly balik ke komposisi persis scene 1 | Frame terakhir sama dengan frame pertama, jadi video loop mulus |

---

## 3. Catatan gaya
- 3D-nya low-poly flat shading, tanpa tekstur kecuali rumput. Fog biru-abu tebal di jarak jauh. Sky gradient mendung, vignette gelap di pojok kiri atas supaya HUD terbaca.
- Tidak ada motion blur, tidak ada camera shake keras. Semua gerak pelan dan "simulasi".
- Ritme: tiap bab ±8–12 s, satu fakta, satu angka besar, satu stamp di akhir. Dip navy/hitam jadi pemisah bab.
- Hook: timer berjalan dari frame 0, jadi penonton menunggu angka 0.
- Loop ending: frame akhir kembali ke shot pembuka.
- Audio: ada track audio (kemungkinan VO + musik/ambience). Belum dianalisis isinya.

---

## 4. Tool

**Remotion + `@remotion/three` (ThreeCanvas)**. Alasan:
- 3D low-poly (taman, karakter, anjing, ISS, globe) cocok dibangun di Three.js, frame-deterministic via `useCurrentFrame()`.
- HUD, stamp, caption, dan diagram 2D (penampang bumi, orbit, penggaris) cukup pakai React + SVG di atas canvas.
- Timeline per frame di atas langsung jadi `<Sequence from={...}>`.

HyperFrames (HTML → video) bisa juga, tapi untuk scene 3D + state HUD yang panjang, Remotion lebih rapi.

Struktur komposisi yang disarankan:
```
<Composition id="Gravity" width={1080} height={1920} fps={30} durationInFrames={3180}>
  <Scene3D />            // ThreeCanvas; kamera + objek per scene
  <Diagram2D />          // SVG untuk scene 7-9, 11, 12
  <Hud />                // Countdown state machine + stat stack
  <Caption />            // italic center, crossfade
  <Stamp />              // slam 5 frame
  <Dip />                // navy/black overlay
</Composition>
```
