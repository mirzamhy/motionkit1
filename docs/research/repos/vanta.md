# Vanta

- Repo: https://github.com/itsjwill/vanta @ 350b053, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #10)
- Lisensi: MIT (file LICENSE, (c) 2026 itsjwill)
- Putusan: **Ditiru (cara kerja saja)**. Tidak ada kode yang diambil; isinya peta integrasi dan audit lisensi.

## Isi repo

30 file. Showcase Remotion kecil (`src/scenes`: data viz, kinetic text, partikel, waveform) dan 13 file `src/integrations/*.ts` yang hanya berisi tipe dan daftar repo luar (voice clone, avatar, caption, video AI, musik AI, hapus latar, editor, timeline, transisi). `ENHANCEMENTS.md`: audit setiap repo kandidat lewat GitHub API (bintang, push terakhir, lisensi), dengan tanda aman / bersyarat / tidak boleh komersial, ditambah daftar repo mati atau berubah lisensi.

## Yang dipelajari

- **Audit dari sumber, bukan ingatan**: setiap kandidat dicek lisensi dan aktivitasnya lewat API sebelum dipakai. Ini sama dengan aturan 1 AGENTS.md; script `repo-study.mjs` sudah membaca file LICENSE, tetapi belum mengecek aktivitas.
- **Lisensi bisa berubah** (contoh di audit: react-video-editor direlisensi, fish-speech jadi berbayar). Status lisensi di kartu MotionKit perlu tanggal.
- Kandidat gratis dan lokal yang relevan untuk MotionKit, dicatat untuk dicek nanti:
  - **whisper.cpp** (MIT menurut audit): waktu per kata untuk rekaman suara manusia; menutup batasan repo #3.
  - **kokoro-js** (Apache-2.0 menurut audit): TTS di dalam proses TypeScript, alternatif offline untuk edge-tts.
- Model berat (avatar, video AI, voice clone) butuh GPU dan tidak cocok dengan pipeline MotionKit saat ini.

## Eksperimen

Tidak ada render: repo ini tidak berisi teknik gambar yang belum dimiliki MotionKit. Data lisensi whisper.cpp dan kokoro-js di atas berasal dari audit Vanta (Juli 2026) dan belum dicek ulang.

## Lanjutan

- Tambahkan bintang, push terakhir dan lisensi dari GitHub API ke `repo-study.mjs`, lalu audit semua repo di `repos.md` sebelum gelombang 2.
- Uji whisper.cpp untuk caption per kata dari rekaman (perlu mengunduh model; minta izin dulu).
