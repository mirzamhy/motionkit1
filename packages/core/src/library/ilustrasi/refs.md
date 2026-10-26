# Ilustrasi SVG berlapis: referensi

Aset di folder ini adalah pembungkus tipis di atas komponen gambar lama di `packages/core/src/scenes/` (`UnairParts.tsx`,
`UnairScene.tsx`, `kit.tsx`, `PizzaScene.tsx`). Gambarnya tidak digambar ulang: `Item2D` hanya memetakan `(x, y, s)` ke
koordinat komponen asli supaya film bisa memanggilnya lewat `<Aset id="...">`.

## Sumber acuan komponen asli

- Gedung NIAS, atap limas, murid, dan orang 1954: digambar dari catatan acuan film Unair di `projects/unair-sejarah/refs.md`
  (foto NIAS 1925 dan keadaan sekarang di Jl. Moestopo, Surabaya). Proporsi dibaca dari foto itu, bukan ukuran terukur.
- Awan, pohon, palem, semak: komponen `kit.tsx` yang dipakai bidikan pelabuhan dan kampus; tidak ada foto khusus.
- Pizza: komponen `PizzaScene.tsx` untuk film "pizza arrives"; topping acak berbenih.
- Bendera: kain berkibar dari `UnairParts.tsx`; warna Unair dan merah putih mengikuti konstanta film.

## Skala yang dipakai

| Aset | Satuan gambar per meter | Dasar |
|---|---|---|
| orang, murid, bendera, pohon, palem, semak | 75 | Walker dan Student setinggi ±124 satuan untuk tokoh 1,65 m |
| gedung NIAS, atap limas, awan | 40 | pilihan agar gedung ±48 m lebar; tidak diukur dari foto |
| pizza | 1543 | jari-jari 270 satuan = 0,175 m (pizza 35 cm) |

## Rekaan

- Ukuran gedung, atap, dan awan adalah **nominal**: dipilih agar terbaca terhadap tokoh 1,65 m, bukan hasil pengukuran.
- Tiang bendera, bayangan tanah pohon, dan bayangan gedung ditambahkan di pembungkus; selebihnya persis komponen film.
- Tidak ada wajah pada orang dan murid (tampak belakang).
- Ruangan (`Room` di `PizzaScene.tsx`) sengaja belum dibungkus: terikat ke waktu film.

## orang-ilustrasi
Walker: orang dari belakang, berjalan di tempat; delapan pakaian dari `OUTFITS` (masa kini) dan `OUTFITS_1954`.

## murid-ilustrasi
Student: murid NIAS, jaket putih tertutup, celana pendek putih, kaus kaki hitam; varian buku, topi, polos.

## gedung-nias-ilustrasi
NiasBuilding lengkap dengan gradien `un-*` dan bayangan tanah; varian `polos` menghilangkan papan nama.

## atap-limas-ilustrasi
HipRoof dengan tiga parameter yang dipakai di NiasBuilding (`utama`, `kecil`, `jauh`).

## bendera-ilustrasi
Flag pada tiang tambahan; varian merah putih, Unair (kuning-biru-kuning), putih.

## awan-ilustrasi
Cloud dengan tiga warna.

## pohon-ilustrasi
Foliage: pohon muda bertiga rumpun dan satu rumpun rendah.

## palem-ilustrasi
Palm dengan tinggi seperti di bidikan pelabuhan.

## semak-ilustrasi
Shrub dengan dua ukuran.

## pizza-ilustrasi
Pizza utuh tampak atas, dengan `Defs` `ps-*` dari `PizzaScene.tsx`.
