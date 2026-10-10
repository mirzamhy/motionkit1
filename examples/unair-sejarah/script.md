# Script and cut

116 s, nine shots, 1920×1080, 60 fps. Narration is Indonesian.

## Narration (as given to the voice generator: numbers spelled out, one paragraph per shot)

1. Surabaya, sepuluh November 1954. Selembar kain kuning-biru menutupi sebuah patung. Sebelum kain itu ditarik, ceritanya sudah berjalan empat puluh satu tahun.
2. Tahun 1913, NIAS dibuka. Sekolah dokter untuk pemuda Hindia. Sepuluh tahun kemudian, sekolah itu pindah ke gedung ini.
3. Murid berjas putih, guru dari Belanda. Lulusan pertamanya, tahun 1923, bergelar Indisch Arts.
4. Tahun 1928, menyusul STOVIT, sekolah dokter gigi. Angkatan pertamanya: dua puluh satu siswa.
5. Penguasa berganti. Papan nama ikut berganti. Tahun 1942, Jepang datang. NIAS ditutup. Tahun 1945, Indonesia merdeka. Tahun 1948, sekolah itu dibuka lagi, sebagai cabang Universitas Indonesia.
6. Satu November 1954, Presiden Soekarno menandatangani Peraturan Pemerintah nomor lima puluh tujuh. Kedokteran, kedokteran gigi, hukum, pendidikan guru: jadi satu universitas.
7. Namanya dari Airlangga, raja Jawa Timur abad kesebelas. Lambangnya: Wisnu menunggang Garuda, membawa guci amerta. Air kehidupan. Ilmu yang tak habis.
8. Sepuluh November 1954, Hari Pahlawan. Kain itu ditarik. Kuning dan birunya menjadi warna universitas.
9. Hari ini, sosok yang sama menyambut di gerbang kampus. Airnya masih mengalir.
10. Universitas Airlangga. Sejak sepuluh November 1954.

## Shots

| # | Shot | Length | Camera | What happens | Drawn from |
|---|---|---|---|---|---|
| 1 | Ceremony, veiled | 13.5 s | rises from the crowd, then pushes into the cloth | veil over the statue, bunting, officials, crowd from behind | NIAS photos; ceremony invented |
| 2 | NIAS building | 10.5 s | slow push to the gate | pupils walk in through the arch | 1925 photo |
| 3 | Classroom | 9.4 s | slow pan | pupils write, teacher explains, light shafts | Tropenmuseum photo c. 1925 |
| 4 | STOVIT | 10 s | slow push | dentist walks in; 21 pupils counted onto the lawn | photo of the building |
| 5 | The gate, 1941–48 | 21 s | close on the gate | year changes, flags, door boarded, name changes, pupils return | NIAS gate photo; 1948 sign invented |
| 6 | Decree and map | 14.5 s | top-down on a desk | document typed, signed, stamped; map of Java, three routes meet | facts; map from coordinates |
| 7 | The statue | 12.3 s | push in | relief appears, three labels, gold water from the jar | Belahan statue photos |
| 8 | Unveiling | 11.7 s | on the statue, then to the flagpole | rope pulled, cloth slides off and falls, applause, flag raised | — |
| 9 | Campus today | 13.2 s | slow push | monument, ring of flags, students; gold line; title | photos of the Kampus C monument |

## How it was cut to the voice

`mk vo-cut` listed 44 pauses in the 103 s recording. The long ones (0.5 s or more) marked the paragraph breaks;
reading the script against the segment lengths gave the start of each sentence. Each shot got its passage plus
0.5 s before and about 1 s after, so the pauses between passages grew from 0.3–0.7 s to 1.2–1.7 s. A `warp` per
shot moves the drawn events onto their words:

| Word | Event |
|---|---|
| "Sebelum kain itu ditarik" | camera starts into the cloth |
| "Angkatan pertamanya" | the count to 21 starts |
| "Tahun 1942" / "Jepang datang" / "NIAS ditutup" | year changes / flag goes up / door is boarded |
| "Tahun 1948 … dibuka lagi" | boards come off, the name on the gate changes |
| "menandatangani" | the signature is drawn |
| "hukum" / "pendidikan guru" / "jadi satu" | route from Jogjakarta / from Malang / pulse on Surabaja |
| "Airlangga" / "Garuda" / "guci amerta" | each label |
| "Air kehidupan" | gold water flows |
| "Kain itu ditarik" | the rope is pulled (cloth physics runs at real speed from here) |
| "Airnya masih mengalir" | gold line crosses the frame |

## Notes from the review rounds

The corrections the user gave, in order, are the rows of the mistakes table in `docs/scenes/CRAFT.md`.
