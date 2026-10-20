# Rencana belajar repo untuk MotionKit

Tujuan: setiap repo di katalog (`repos.md`, docx "Rencana dan Status Riset MotionKit") dipelajari satu per satu, dicoba di dalam MotionKit, lalu bagian yang berguna diambil dan menjadi kemampuan MotionKit. Katalog berubah dari daftar bacaan menjadi fitur.

## Siklus per repo

Setiap repo melewati delapan langkah yang sama. Satu repo kira-kira satu sesi kerja; repo besar (Infinigen, Three.js) dipelajari per bagian yang relevan saja.

1. **Baca.** README, LICENSE, struktur folder, dependency, tanggal commit terakhir, contoh yang tersedia.
2. **Gerbang lisensi.**
   - MIT, Apache-2.0, BSD, CC0: kode boleh di-port dengan atribusi.
   - GPL/AGPL: ambil idenya saja, tulis ulang sendiri; jangan salin kode.
   - Tanpa lisensi: dianggap tidak boleh dipakai; ide saja.
   - Asset CC-BY: boleh dipakai, wajib dicatat di kredit video.
3. **Clone terisolasi.** `node scripts/repo-study.mjs <owner/repo>`: shallow clone ke `references/repos/<nama>` (di-gitignore) dan laporan lisensi, ukuran, tipe file, serta install hook yang akan menjalankan kode (`references/repos/<nama>.study.txt`). `npm install --ignore-scripts`; jangan jalankan postinstall atau binary yang tidak dikenal. Repo Blender hanya dijalankan headless bila memang perlu.
4. **Jalankan contohnya** (bila ada) untuk melihat hasil aslinya.
5. **Eksperimen kecil di MotionKit.** Satu file `scripts/lab/<nama>-lab.tsx`, satu composition, render satu still (dan video pendek bila menyangkut gerak). Buka gambarnya dan nilai.
6. **Putusan**, salah satu dari:
   - **Ambil**: kode di-port ke MotionKit.
   - **Tiru**: konsepnya ditulis ulang dengan gaya MotionKit.
   - **Asset**: hanya file model/tekstur/suara yang dipakai.
   - **Lewati**: tidak cocok, dengan alasannya.
7. **Kartu belajar** `docs/research/repos/<nama>.md`: isi repo, cara kerja intinya, apa yang diambil, file MotionKit yang berubah, batasan, lisensi/atribusi, still hasil eksperimen.
8. **Perbarui status** di `repos.md` dan docx: Kandidat → Dipelajari → Diambil / Ditiru / Asset / Dilewati.

## Aturan masuk ke MotionKit

- Hasil "Ambil"/"Tiru" masuk dulu ke `scripts/lab/`. Pindah ke `packages/three` atau `packages/core/src/kit` hanya setelah lolos proof gelombangnya.
- Perubahan kode bersama mengikuti AGENTS.md: `tsc` bersih, render ulang still `UnairScene` dan `PizzaScene`, bandingkan dengan sheet lama.
- Setiap komponen baru punya satu contoh pemanggilan dan satu baris di `docs/scenes/KIT.md`.

## Gelombang

Urutan "pondasi dulu": alat kerja, cara agent bekerja dan jalur asset disiapkan lebih dulu, baru isi adegan (karakter, cahaya, suara, bangunan, kendaraan). Setiap gelombang ditutup dengan **proof gabungan**: satu adegan yang memakai semua yang diambil, dibandingkan dengan versi sebelum gelombang.

| # | Gelombang | Repo | Proof penutup |
|---|---|---|---|
| 0 | Persiapan (selesai 21 Okt 2026) | — | Folder `references/repos/` (gitignore), template kartu, kolom status di `repos.md` |
| 1 | Remotion, editor, agent | claude-remotion-skill, remotion-scenes, remotion-captions-themes, remotion-cinematic, claude-remotion-editor, ali-abassi/remotion-templates, remotion-bits, reactvideoeditor/remotion-templates, claude-remotion-flow, Vanta | MarketExchange versi 2 (detail di bawah) |
| 2 | Asset dan optimasi | Poly Haven, polyhaven-skill, Kenney, Quaternius, ModKit (lanjutan), Khronos (lanjutan), holokat/game-assets, fps-buildings-env-kit, awesome-3d-assets, 3d-asset-server, gltf-slipstream, LightLoad, meshify, 3d-asset-pipeline | Lapak dengan props/tekstur asset nyata lewat jalur unduh → lisensi → kompres → pakai |
| 3 | Karakter dan gerak | walking-characters-remotion, Ossos, three-ws/retarget, auto-rig-web, Blender-Crowd, MPFB2 | FullMarket ulang: tokoh bervariasi, kaki tidak meluncur, keramaian deterministik |
| 4 | Cahaya, cuaca, VFX | pmndrs/postprocessing, three-volumetric-pass, three.js-volume-renderer, react-weather-effects, 3d-weather-codrops, Plume, three-vfx, wawa-vfx, threejs-water-free, web-ocean-3d | Pasar pagi: sinar dari celah atap, debu, kabut, satu varian hujan |
| 5 | Audio dan SFX | @remotion/sfx, quiet-fx, foley, cacophony | MarketExchange dengan ambience pasar, langkah, kantong kertas, mix seimbang |
| 6 | Bangunan dan geodata | Wadi (sudah diaudit), Streets GL, ProceduralTerrains, Route2World, BlenderGIS, VoxCity, ProceduralCityGeneration, Infinigen, ProcFunc, BlenderProc | Jalan depan pasar dengan deretan bangunan dari data atau procedural |
| 7 | Kendaraan dan lalu lintas | threejs-driving-simulator, drive-sim, three-js-car-example, traffic-flow-simulation, moveet, Spectral GT RS | Motor dan angkot lewat di depan pasar, jalur deterministik |
| 8 | Integrasi | — | Brief pendek → video pasar lengkap memakai komponen gelombang 1–7 (tahap 5–6 docx) |

## Gelombang 1 secara rinci: Remotion, editor, agent

**Status 21 Oktober 2026:** repo #1–#10 selesai (kartu di `repos/`). Belum: proof penutup MarketExchange versi 2.

Fokus: bukan isi adegan, tetapi **cara MotionKit membuat video**: aturan gerak, katalog komponen yang bisa dicari agent, gerbang QA, timing berdasarkan beat, caption, kamera dan audio. Data lisensi/bintang diambil dari GitHub API 21 Oktober 2026; repo yang lisensinya tidak terdeteksi wajib dicek file LICENSE-nya di langkah 2.

| Urutan | Repo | Lisensi (API) | Yang dipelajari | Calon yang diambil ke MotionKit |
|---|---|---|---|---|
| 1 | haidrrrry/claude-remotion-skill | MIT | 10 aturan gerak (spring/bezier, entrance 3 properti, stagger 3–6 frame), 17 pola gerak, design rules, loop render-periksa | Bandingkan dengan AGENTS.md dan `docs/scenes/CRAFT.md`; aturan yang belum ada ditambahkan; preset easing/spring ke `kit` |
| 2 | lifeprompt-team/remotion-scenes | MIT | 201 scene di 16 kategori: transisi, efek (grain, VHS, chromatic), partikel, background, liquid | Transisi dan efek yang belum dimiliki `engines/transitions.tsx` dan `kit/fx.tsx` |
| 3 | vshukla7/remotion-captions-themes | MIT | Caption per kata dari JSON timing (start/end per kata), tema kinetik | Komponen caption yang membaca timing dari VO MotionKit (`kit/vo.tsx`, `mk vo-cut`) |
| 4 | codeverbojan/remotion-cinematic | MIT | Kamera relatif terhadap nama scene (bukan nomor frame), koreografi lewat props yang bisa diedit di Studio, audio manager dengan ducking, push transition, 509 test | **Timeline berbasis beat**: `MarketExchange` sekarang memakai angka frame keras (12, 50, 66…); diganti beat bernama. Ducking musik saat VO |
| 5 | ytrofr/claude-remotion-editor | MIT | SceneDirector: editor jalur visual + ekspor kode, alat debug (coordinate picker, crosshair, timeline) | Ide editor jalur untuk tangan/kamera; alat debug melengkapi `--grid`/`--region` |
| 6 | ali-abassi/remotion-templates | tidak terdeteksi | Registry 1.000 template dari 100 family, katalog untuk agent (peran, input, timing, batasan), gerbang typecheck + bundle + render smoke, catatan provenance | Katalog komponen `kit` yang bisa dibaca agent; perintah `mk gate`; format provenance untuk `asset-contract.md` |
| 7 | av/remotion-bits | tidak terdeteksi | Paket komponen + CLI `find`/`fetch` + server MCP untuk mencari bit | Pola `mk kit find <kata>` agar agent menemukan komponen sebelum menulis ulang |
| 8 | reactvideoeditor/remotion-templates | tidak terdeteksi | 81 template mandiri (chart, teks, background, transisi, branding) | Cek tumpang tindih dengan widget spec-mode; ambil yang belum ada |
| 9 | sellersessions/claude-remotion-flow | tidak terdeteksi | Treatment doc → kode, beat-sync, pustaka SFX berkategori, "SFX bookends" | Template treatment untuk `projects/<slug>/`; konsep beat-sync dan bookend untuk gelombang 5 |
| 10 | itsjwill/vanta | MIT (README) | Arsitektur pipeline 40+ repo, audit lisensi (ENHANCEMENTS.md), GL Transitions | Peta integrasi dan cara audit lisensi; sebagian besar model AI berat (GPU) tidak diambil |

Urutan dipilih supaya yang MIT dan paling dekat dengan cara kerja MotionKit duluan; repo tanpa lisensi terdeteksi ditaruh belakang karena kemungkinan hanya diambil idenya.

**Hasil yang ditargetkan di MotionKit setelah gelombang 1:**

1. AGENTS.md/CRAFT.md diperbarui dengan aturan gerak yang belum ada.
2. Timeline berbasis beat bernama untuk adegan (pengganti angka frame keras).
3. Komponen caption per kata yang tersambung ke VO.
4. Transisi dan efek tambahan di `kit`.
5. Audio: ducking musik saat VO.
6. Katalog `kit` + `mk kit find` + `mk gate` (typecheck, bundle, render smoke semua scene).
7. Template treatment untuk proyek baru.

**Proof penutup:** MarketExchange versi 2, 10–15 detik: beat bernama, satu transisi masuk, grade + grain, caption dari VO edge-tts pendek, musik dengan ducking, lolos `mk gate`. Dibandingkan berdampingan dengan versi sekarang.

## Catatan teknis yang sudah diketahui

- `ThreeCanvas` tidak menjalankan `useFrame`, jadi `EffectComposer` dari postprocessing tidak merender. Di gelombang 3 perlu diuji render composer manual di `useEffect` per frame; kalau gagal, pakai fog dan sprite.
- Semua gerak harus bisa dihitung per frame tanpa state (AGENTS.md aturan 8). Physics (Cannon, Rapier) dan simulasi crowd/traffic harus di-precompute dan di-cache, bukan berjalan realtime.
- Repo berbasis Blender (MPFB2, Infinigen, BlenderProc, BlenderGIS, ProceduralCity, Blender-Crowd) butuh Blender terpasang; hasilnya diekspor ke GLB lalu dipakai di Three.js.
- Animasi Fox butuh atribusi walau modelnya CC0. Wadi: desain rumah tidak otomatis bebas dipakai.

## Ukuran selesai

- Setiap repo punya kartu belajar dan putusan.
- Setiap gelombang punya proof gabungan yang stillnya dibuka dan dibandingkan.
- Komponen yang lolos sudah pindah dari `scripts/` ke library, dengan contoh pemanggilan.
