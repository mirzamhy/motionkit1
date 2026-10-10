# LongCat: mata, titik, dan iris menjadi penghubung

[Sumber Original](https://skillry.dev/ai-videos/opus-5-5/leowenai-125931). ID katalog `leowenai-125931`. Stream visual 25,000 detik, 750 frame pada 30 fps; container 25,045 detik. Nomor frame dimulai dari nol.

## Peta seluruh video

| Waktu sumber, kira-kira | Isi dan gerak |
|---|---|
| 0–2 dtk | Bidang radial hijau/halftone menyerupai dua sisi mata, dengan grid dan label kecil |
| 2–6 | Dua mata hijau kecil, teks pengantar bertambah, ground raster di bawah |
| 6–6,9 | Impact sangat terang menuju brand; radial field tumbuh di belakang headline |
| 6,9–7,3 | Panel hijau dengan blok raster dan pernyataan agentic |
| 7,3–8,0 | Ring konsentris hitam/hijau dan capability visual pertama |
| 8,0–8,35 | Pembalikan hijau untuk capability berikutnya |
| 8,35–8,9 | Statistik besar di kiri, sphere raster di kanan |
| 8,9–9,95 | Panel API hijau dan tunnel radial |
| 9,95–13,9 | Iris gelap menuju tunnel; counter bertumbuh, label kapasitas sekunder masuk belakangan |
| 13,9–15,0 | Titik hijau berkembang menjadi ground hijau; capability berganti sementara motif ring bertahan |
| 15–17 | Blok raster dan capability aksi; mata tetap menjadi motif |
| 17–20 | Iris gelap menuju integrasi; teks kiri, bentuk kepala kucing kanan, daftar tools dibangun bertahap |
| 20–21,35 | Layout tunnel kembali, tiga kualitas ditulis bertahap |
| 21,35–23,15 | Field radial hilang, mata pindah menjadi pusat, iris putih berkembang, mata berubah menjadi bentuk gelap besar |
| 23,15–25 | Bentuk kepala kucing masuk dari kanan/besar, kemudian mengecil menuju brand lockup |

Lembar keseluruhan: [0–20](../../../projects/style-study-01/evidence/leowenai/overview-sheet-1.jpg), [20–25](../../../projects/style-study-01/evidence/leowenai/overview-sheet-2.jpg). Sejumlah capability berlangsung kurang dari satu detik dan terlewat jika hanya meninjau satu still per detik.

## Elemen penyusun

Bidang raster terdiri dari dots yang membentuk ring, sphere, strip, dan blok. Hijau jenuh menjadi bentuk sekaligus ground; teks berubah putih/hitam untuk mengikuti ground. Dua mata berukuran kecil maupun besar menjadi tanda yang mudah diikuti. Headline singkat diletakkan di sisi kiri, sementara bentuk radial menguasai kanan atau tengah.

Rekonstruksi memakai pattern dots SVG dan ring konsentris dengan radius, dash, dan opacity berbeda. Ini pendekatan geometris terhadap raster yang terlihat; shader asli, depth, jumlah partikel, dan konstruksi sphere belum diketahui. Noise/raster sumber jauh lebih kompleks daripada ring SVG studi.

## Ragam transisi yang teramati

| Bukti | Mekanisme |
|---|---|
| [Intro → brand](../../../projects/style-study-01/evidence/leowenai/intro-brand.jpg) | Teks pengantar mengecil/hilang, titik tetap, lalu impact nyaris putih pada f180 / 6,000. Radial hijau dibangun kembali dalam beberapa frame. Label umum “iris” tidak cukup menjelaskan impact ini |
| [Brand → capability](../../../projects/style-study-01/evidence/leowenai/brand-sees.jpg) | Pesan brand blur, panel hijau bergeser masuk, raster blok menguasai kanan; kemudian field berubah ke ring hitam/hijau |
| [Ring → stat](../../../projects/style-study-01/evidence/leowenai/sees-stat.jpg) | Capability ring lebih dulu membalik ground menjadi hijau; sphere/stat baru masuk sesudahnya. Ada dua beat visual dalam satu detik |
| [Stat → API](../../../projects/style-study-01/evidence/leowenai/stat-api.jpg) | Foreground blur, panel hijau masuk dari sisi kiri dan tunnel meluas |
| [API → counter](../../../projects/style-study-01/evidence/leowenai/api-counter.jpg) | Disc hitam berkembang dari area tengah; tunnel dan counter baru terbaca di dalamnya |
| [Counter → green](../../../projects/style-study-01/evidence/leowenai/ring-see.jpg) | Titik hijau membesar cepat menjadi disc, menutup angka, kemudian menjadi ground scene baru |
| [Capability → aksi](../../../projects/style-study-01/evidence/leowenai/see-act.jpg) | Ring/raster mengganti bentuk; headline dan background hijau bertahan sebagai bahasa visual |
| [Aksi → integrasi](../../../projects/style-study-01/evidence/leowenai/act-integrations.jpg) | Foreground aksi menghilang, disc gelap berkembang dari mata menuju scene integrasi; kepala kucing muncul sesudahnya |
| [Integrasi → ring](../../../projects/style-study-01/evidence/leowenai/integrations-summary.jpg) | Field radial mengambil alih, lalu headline dibangun per baris |
| [Iris putih](../../../projects/style-study-01/evidence/leowenai/eye-iris.jpg) | Field lama dilepas, mata menjadi anchor di pusat; disc putih tumbuh di belakang mata gelap, sehingga mata bertahan melewati perubahan ground |
| [Mata → brand](../../../projects/style-study-01/evidence/leowenai/eyes-logo.jpg) | Bentuk kepala kucing hijau bergerak masuk dan kemudian mengecil; eyes menjadi bagian dari logo |

Seluruh jendela LongCat memakai setiap frame native 30 fps. Iris dominan mempunyai beberapa varian: disc hijau menuju capability, disc gelap menuju integrasi, serta disc putih menuju penutup. Ada juga panel sweep, blur, dan impact warna yang sangat cepat.

## Iris putih: urutan frame

F636–640 / 21,200–21,333 masih memperlihatkan tunnel dan headline lama. Pada f641 / 21,367 foreground memudar dan titik/mata menjadi pusat. Pada f642–644 / 21,400–21,467 putih berkembang di belakang dua mata. F645 / 21,500 menunjukkan disc sangat besar. F646 / 21,533 sudah menutup seluruh ukuran frame; mata tetap terlihat. Sesudahnya, rounded eyes berubah menjadi bentuk lebih tajam dan terdapat kedipan sekitar 22,0 detik.

Pengukuran mask `min(R,G,B) > 220`, pada source penuh 1280×720:

| Frame | Detik | Bagian frame di atas threshold putih |
|---|---|---|
| 641 | 21,367 | 0,22% |
| 642 | 21,400 | 0,15% |
| 643 | 21,433 | 1,94% |
| 644 | 21,467 | 8,87% |
| 645 | 21,500 | 45,76% |
| 646 | 21,533 | 72,01% |

Nilai f642 lebih kecil karena mata/layer gelap menutupi bagian putih. Persentase ini bukan radius iris dan tidak harus monoton. Setelah disc memenuhi frame, vignette dan mata juga membuat persentase putih kurang dari 100%. Data bounds dan centroid mentah ada di `evidence/iris-geometry.json`; centroid mask yang terpotong mata tidak sama dengan pusat lingkaran.

Dari tepi disc yang masih terlihat, pendekatan radius untuk rekonstruksi adalah 25 px pada 21,36, 50 pada 21,40, 105 pada 21,433, 192 pada 21,467, 432 pada 21,50, lalu 810 pada 21,533. Angka radius adalah fit visual, dengan pusat sekitar (640,360). Percepatan sangat kuat; radius yang bergerak linear sepanjang interval akan terasa jauh lebih lambat di awal dan kurang meledak di akhir.

## Cara membangun ulang

Urutan layer adalah ring lama → foreground lama → disc iris → mata yang bertahan → chrome. Foreground lama mempunyai fade/blur sendiri; mata yang dipertahankan tidak ditempatkan di dalam wrapper outgoing tersebut. Disc adalah bidang bundar yang tumbuh di belakang mata. Radius maksimum harus melewati sudut terjauh (`sqrt((W/2)^2+(H/2)^2)`, sekitar 734 px pada ukuran ini).

Source `ObjectIris` menerima center, maxRadius, color, dan progress. `LongCatStudy` memasukkan fit radius terukur, lalu mengubah scale mata dan rounding secara terpisah. Kedipan dibuat lewat scaleY yang kembali ke satu. Semua fungsi bergantung pada nomor frame, sehingga seek ke frame mana pun memberi keadaan yang sama.

## Hasil dan batas

[Perbandingan 20,8–23,1 detik](../../../projects/style-study-01/out/leowenai-comparison.mp4) · [Render Remotion](../../../projects/style-study-01/out/leowenai-remotion.mp4) · [Review sheet](../../../projects/style-study-01/out/leowenai-review.jpg).

Rekonstruksi mencakup field ring, headline, pasangan mata, pelepasan foreground, iris putih, perubahan rounding/perspective mata, dan kedipan. Raster, blur, kontras, radius antarframe, eye geometry, dan vignette masih mendekati sumber. Logo kucing, sphere, counter lengkap, integrasi, serta soundtrack belum dibuat ulang dalam cuplikan ini.

Pelajaran yang dapat dipakai ulang: iris mempunyai posisi awal, objek penghubung, dan urutan layer. Overlay lingkaran di atas seluruh scene akan ikut menutup mata dan menghilangkan kontinuitas yang membuat transisi sumber mudah diikuti.
