# MotionKit scene mode dan pustaka aset mandiri

Status: rancangan teknis untuk persetujuan. Tanggal: 2026-10-27.

## Tujuan dan keputusan pengguna

Pengguna ingin MotionKit tidak memakai kode dari repo direkturcrypto. Fokus produk yang telah dipilih adalah scene mode dan pustaka aset. Jalur brief, riset, treatment, storyboard, proof shot, pemeriksaan grid, film dan render dipertahankan. Promo dapat dibangun sebagai scene khusus; pipeline spec dan generasi kode/model API lama dilepas.

Ini perubahan lintas subsistem, bukan penggantian nama. Jangan menyatakan implementasi baru independen hanya karena teksnya berbeda. Riwayat lokal mencatat port pada c46eb2a; inventaris awal berada di docs/research/scene-only-port-inventory.md. File port yang sudah dimodifikasi juga masuk cakupan, bukan hanya file identik.

## Cakupan yang dilepas

- Kode port di core engine, engines, widgets, kinetic, code, spec, dan kit lama; bagian tambahan yang hanya melayani pipeline itu juga dilepas setelah pemeriksaan pemakai.
- CLI concept, plan, lint spec, audio API, review model, render spec, run, code, doctor API, balance, usage dan agent API. Lepaskan modul pendukung yang tidak lagi mempunyai pemakai.
- Prompt dan contoh MiMo khusus pipeline lama, script demo spec, konfigurasi alias code-mode, serta environment template khusus penyedia API lama.
- Dokumentasi aktif dan skill diperbarui menjadi scene-only. Catatan riset historis dibedakan dari instruksi produksi; jangan menghapus atribusi pihak lain secara massal.

## Yang dipertahankan

- Scene, Film runner, shot, catatan film, storyboard, katalog gaya, library Item2D/Item3D, registri Aset, preview item, peta, grid/region, gate, beat detection, scene SFX, dan asset discovery/validation.
- Pekerjaan pengguna, termasuk file belum di-commit, proyek/media lokal, script eksperimen, dan aset baru. File terkait pipeline lama hanya dihapus bila teridentifikasi secara eksplisit; jangan menjalankan git clean/reset atau penghapusan folder kerja umum.
- Modul baru kit/assets.ts, atmosphere.ts dan atmosphere-layer.tsx. Export surface baru tidak boleh mengekspor kode kit port.
- Dependensi React, Remotion, Three.js dan lisensi masing-masing. Kepemilikan baru tidak berarti bebas dari semua lisensi pihak ketiga.

## Arsitektur pengganti

1. CLI scene-only baru, dengan dispatch perintah scene, storyboard, film, gaya, aset, item, kit, beats, asset, gate dan vo-cut. Help tidak mengiklankan perintah yang dihapus. Perintah tidak dikenal mengembalikan error dan exit nonzero.
2. Root Remotion baru hanya mendaftarkan SceneCompositions. Entry baru dan konfigurasi build tidak memuat Spot, CodeSpot, schema atau alias lama.
3. Bundler scene baru memakai API bundler Remotion, cache yang memiliki lifecycle jelas, publicDir proyek, dan cleanup folder sementara yang dibuatnya sendiri. Tidak memuat pipeline/API/model atau spec.
4. Helper gerak scene baru dirancang dari kebutuhan pemakai: progress berbatas, easing eksplisit, keyframe, overshoot dan reveal teks. Dokumentasikan kontrak edge case: keyframe kosong/duplikat, durasi nol, waktu sebelum/sesudah rentang, sampling acak. Pemakai scene dialihkan dari engine/util; kurva baru boleh berbeda secara disengaja dan harus dilaporkan serta diperiksa visual.
5. PizzaScene memuat font editorial yang benar-benar dipakai langsung melalui fasilitas font Remotion, tanpa registry pasangan font port. Loading/error ditangani agar render tidak menggantung.
6. Paths baru hanya berisi lokasi yang diperlukan scene/library, tanpa alias ROS atau layout spec. Pertahankan perilaku proyek yang benar-benar dipakai atau dokumentasikan perubahannya.
7. Modul yang ditambahkan setelah port ditelusuri untuk import dan potongan kode warisan. QA/DNA dipertahankan hanya bila berguna secara mandiri dan tidak menyertakan kode turunan yang belum diganti; jangan membiarkannya gagal typecheck karena schema yang dihapus.
8. Ekstrak fungsi grid/region dari sceneAgent.ts ke modul scene-only sebelum melepas agen API. Pertahankan kemampuan membuka grid tanpa model/API. Audit dependensi gambar fungsi itu. Perbarui baris catalog.ts yang menunjuk kit/fx.tsx dan engine/util.ts agar pencarian tidak mengarahkan pengguna ke file yang telah dihapus.

Temuan audit tambahan: packages/dna/src/look.ts bergantung pada engine/looks dan spec/schema; packages/qa/src/structure.ts bergantung pada timeline dan schema. Modul tersebut harus dilepas atau diganti sesuai kebutuhan scene, tidak sekadar dibiarkan sebagai file mati yang gagal typecheck.

Implementasi tetap TypeScript/React dan memakai dependency yang sudah ada. Tidak perlu install layanan baru, panggilan API berbayar, atau upload source. Ini bukan klaim proses clean-room: agen sudah membaca source lama. Penggantian harus didokumentasikan dengan jujur dan tidak menjanjikan kesimpulan legal otomatis.

## Urutan pekerjaan dan bukti

1. Rekam baseline typecheck, unit tests dan still UnairScene/PizzaScene sebelum perubahan. Buka still dengan grid; simpan di out tanpa commit media.
2. Implementasikan infrastruktur scene baru dengan tes kontrak perilaku, alihkan semua pemakai, lalu lepaskan source pipeline lama. Jangan memodifikasi konten artistik film untuk menyelesaikan masalah infrastruktur.
3. Perbarui README, AGENTS, skill, peta aset bila terpengaruh, panduan aktif dan scripts. Catat kemampuan yang sengaja dihapus.
4. Jalankan typecheck dan seluruh tes relevan; scene/gaya/film/kit/item listing serta gate --no-render harus tetap berjalan. Test perintah lama memastikan tidak tersedia, bukan diam-diam menuju pipeline lain.
5. Render ulang still UnairScene/PizzaScene pada frame baseline dan minimal satu scene 3D. Render satu job tiap waktu; buka setiap still, grid, dan region yang diperlukan. Laporkan perubahan gerak/font yang terlihat; still tidak membuktikan motion penuh.
6. Uji render klip pendek untuk pipeline encoding. Periksa frame hasil encode. Media hilang harus dilaporkan, jangan membuat pengganti diam-diam.
7. Audit akhir: daftar semua file port (termasuk yang berubah), nasib masing-masing, import graph, referensi penyedia lama, serta batas verifikasi. Tidak cukup hanya menjalankan pencarian nama atau menghitung kemiripan teks.
8. Uji preview satu item 2D dan satu item 3D melalui entry library yang terpisah. Pastikan hasil grid dan region benar-benar terbuka dan terbaca; audit path hasil pencarian katalog, bukan hanya exit code listing.

Kontrak publicDir perlu menetapkan lookup proyek manifest, media relatif dan MK_PROJECTS secara eksplisit; penghapusan fallback ROS_PROJECTS dicatat sebagai perubahan. Inventaris helper meliputi seeded, tipe KP dan pemakai script/lab. Sampling klip mencakup frame sekitar transisi ketika kurva interpolasi berubah. Inventaris provenance diperluas ke launcher, config, docs baseline dan penambahan setelah port.

## Lisensi, sejarah dan batas penyelesaian

Selama kode port masih tersisa, pemberitahuan yang menyertainya tidak dihapus. Keputusan mengganti lisensi tingkat proyek baru dilakukan setelah audit source selesai; tidak ada jaminan legal otomatis dari rewrite atau tes. Lisensi material lain tetap dicatat sesuai asalnya.

Riwayat .git tidak ditulis ulang: itu akan mengubah identitas commit dan berada di luar migrasi source ini. Proyek/media pengguna juga tidak dihapus. Source tree aktif dan alur produksi yang dibersihkan menjadi hasil yang dituju. Jika pengguna menghendaki repository baru tanpa sejarah lama, itu tindakan terpisah sesudah hasil penggantian diverifikasi.

## Selesai bila

- Semua file port dalam inventaris punya putusan yang dapat diperiksa: dihapus atau diganti dan diputus dependensinya; file pasca-port yang berkaitan juga sudah ditinjau.
- Tidak ada jalur aktif menuju pipeline lama, tidak ada API key lama yang diperlukan untuk scene mode.
- Scene dan library tetap terdaftar; typecheck, tes, gate statis, preview item, pemeriksaan visual dan klip render lulus. Jika ada hambatan, status adalah parsial dengan hambatan bernama, bukan migrasi selesai.
- Dokumentasi aktif dan skill menjelaskan produk scene-only; hasil audit tidak melebihkan kepastian asal kode atau status lisensi.
