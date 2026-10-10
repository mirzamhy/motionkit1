# TechHalla: poster yang berubah lewat huruf

[Sumber Original](https://skillry.dev/ai-videos/opus-5-5/techhalla-498547). ID katalog: `techhalla-498547`. Stream visual 20,000 detik, 1200 frame pada 60 fps; container 20,053 detik karena audio. Frame dalam laporan dihitung dari nol.

## Peta seluruh video

| Waktu sumber, kira-kira | Isi visual | Gerakan utama |
|---|---|---|
| 0–2,4 dtk | Hook poster dua baris | Huruf masuk bergantian dari bawah, blur dan jejak magenta; ruler bawah bertumbuh |
| 2,4–6,5 | Klaim pertama, tiga baris | Hook terlempar ke kiri, glyph hijau decode; headline terbentuk baris demi baris |
| 6,5–10,4 | Koreksi klaim dengan kata aksen besar | Teks saling menimpa lewat band, lalu wipe membuka pesan baru; kata hijau masuk belakangan |
| 10,4–12,0 | Kontras proses dan harapan | Foreground kosong sebentar, kemudian huruf muncul secara bergantian |
| 12,0–13,1 | Panel kode dan label kecil | Headline mengecil ke kiri atas, box masuk dan mengetik; elemen lama bertahan dalam layout baru |
| 13,1–14,4 | Ajakan singkat dua baris | Garis panel memanjang menjadi underline, huruf headline masuk dengan blur |
| 14,4–16,3 | Identitas akun | Headline hilang, batang magenta muncul, huruf nama dibangun satu per satu |
| 16,3–20,0 | Penutup | Lockup bertahan, underline hijau dan teks mono kecil |

Interval tabel adalah batas editorial yang dibaca dari sampel, bukan daftar semua onset huruf. Lembar keseluruhan: [overview](../../../projects/style-study-01/evidence/techhalla/overview-sheet-1.jpg).

## Susunan elemen

1. Latar mendekati hitam. Ia bertahan melalui pergantian pesan.
2. Corner marks, footer mono, dan label kecil memberi koordinat visual tetap.
3. Headline memakai sans tebal dan lebar, beberapa baris berukuran berbeda. Baris tidak dipaksa mempunyai ukuran font yang sama.
4. Lime menjadi highlight dan underline. Magenta muncul pada jejak huruf, tanda kecil, dan batang brand.
5. Lapisan duplikat dan blur hanya kuat di sekitar impact; glyph yang sudah selesai kembali tajam.

Ruang kosong di atas teks tetap besar. Headline merupakan pusat energi; chrome relatif kecil. Rekonstruksi memakai `FitText` untuk mengecilkan font jika hasil ukur melebihi lebar yang disediakan, sehingga pergantian glyph tidak meluber keluar frame.

## Transisi yang dibaca lebih rapat

| Bukti | Yang terlihat | Ketelitian dan timing |
|---|---|---|
| [Exit → decode](../../../projects/style-study-01/evidence/techhalla/exit-decode.jpg) | Pesan lama mulai berjejak, terdorong ke kiri, kemudian glyph hijau di tengah menggantinya | Stable pada f141 (2,350); trail pada f143 (2,383); sisa pesan lama pada f145 (2,417); hilang pada f147 (2,450). Sampling setiap 2 frame; onset berada di antara sampel |
| [Pergantian klaim](../../../projects/style-study-01/evidence/techhalla/thesis-swap.jpg) | Decode berhenti, dua pesan bertumpuk dan pecah menurut baris/band, kemudian batas vertikal menyapu ke kiri | Klaim lama bersih f390 (6,500); tumpukan jelas f392–400 (6,533–6,667); wipe lanjut hingga sekitar f420 (7,000). Sekitar 0,5 detik; langkah 2 frame |
| [Headline → kode](../../../projects/style-study-01/evidence/techhalla/stack-to-code.jpg) | Headline mengecil sambil pindah ke kiri atas; box muncul di bawah; label mengelilingi box | f720 (12,000) masih besar; f723 (12,050) berjejak; f732 (12,200) sudah kecil. Langkah 3 frame; seluruh pemindahan sekitar 0,2 detik |
| [Masuknya proof](../../../projects/style-study-01/evidence/techhalla/proof-entry.jpg) | Foreground lama menghilang dahulu; huruf baru masuk secara bergantian | Jendela 10,1–11,2 detik, langkah 4 frame |
| [Garis menjadi underline](../../../projects/style-study-01/evidence/techhalla/steal-entry.jpg) | Box dan teks kecil tersisa saat huruf besar mulai masuk; garis hijau sudah menjadi fondasi teks baru | 12,8–13,5 detik, langkah 3 frame |
| [Masuknya brand](../../../projects/style-study-01/evidence/techhalla/brand-entry.jpg) | Teks ajakan hilang, batang magenta bertahan, glyph brand masuk dari bawah dengan blur | 14,3–15,8 detik, langkah 5 frame |

Prompt halaman menyebut mask yang berasal dari outline huruf. Raster yang ditinjau membuktikan adanya overlap, band, dan wipe; ia belum membuktikan bagaimana mask dibuat di source. Karena itu studi memakai **clip band sebagai pendekatan yang dapat diperiksa**, bukan menganggap algoritma outline tersebut sudah terverifikasi.

## Cara membangun ulang

- Decode dibuat deterministik: karakter dipilih dari hash indeks glyph dan nomor frame. Tidak memakai `Math.random()` saat rendering.
- Layer klaim lama ditutup dari kanan; klaim baru dibuka dari kanan ke kiri pada garis batas yang sama.
- Lima band mempunyai offset kecil yang berbeda supaya baris tidak berubah serentak seperti kartu slide.
- Jejak teks ditambahkan lewat duplikasi dengan pergeseran mendatar dan blur; opasitasnya mengikuti `sin(progress × π)` sehingga nol saat sebelum dan sesudah transisi.
- Kata aksen mempunyai reveal tersendiri setelah klaim utama terbaca. Kejadiannya dimulai sekitar 8,0 detik.

Dalam studi, `progress = smooth(t, 6.52, 7.02)`. Batas wipe adalah `x = width × (1 − progress)`. Nilai easing merupakan pendekatan Bezier/cubic dari pengamatan, bukan koefisien yang diekstrak dari source asli.

## Hasil dan batas kemiripan

[Video perbandingan 5,8–9,4 detik](../../../projects/style-study-01/out/techhalla-comparison.mp4) · [Render Remotion](../../../projects/style-study-01/out/techhalla-remotion.mp4) · [Review sheet](../../../projects/style-study-01/out/techhalla-review.jpg).

Rekonstruksi mencakup chrome, poster type, decode, wipe band, dan kata aksen. Pola glitch, susunan band, offset blur, serta ukuran glyph belum identik dengan sumber. Clip band tidak merekonstruksi outline font asli. Musik dan motion blur dari akumulasi subframe tidak dibuat ulang. Bagian shrink-to-code dipelajari melalui bukti, tetapi tidak termasuk cuplikan Remotion ini.

Pelajaran yang dapat dipakai ulang: arah keluar pesan lama, reveal pesan baru, dan urutan aksen harus ditentukan bersama. Mengganti seluruh foreground dengan satu fade menghilangkan hierarki temporal yang membuat poster ini terasa bergerak.
