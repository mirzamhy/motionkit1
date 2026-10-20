# remotion-bits

- Repo: https://github.com/av/remotion-bits @ de35fda, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #7)
- Lisensi: tidak ada file LICENSE; `package.json` menyatakan MIT → diperlakukan MIT, tapi tidak ada kode yang disalin
- Putusan: **Ditiru**. Pola pencarian katalog ditulis ulang sebagai `mk kit find`.

## Isi repo

Paket komponen animasi Remotion (`src/components`, `src/compositions`), CLI `remotion-bits find|fetch`, server MCP, registry jsrepo (`registry.json`) dan inventaris bit yang dihasilkan otomatis (`src/catalog/inventory.generated.json`: id, nama, deskripsi, tag, durasi, ukuran, dependensi). 264 file, tidak ada install hook.

## Cara kerja intinya

- Inventaris dibuat sekali dari kode sumber; CLI dan MCP membaca inventaris yang sama (`src/catalog/runtime.ts`).
- `findBits` (`src/catalog/shared.ts`): query dinormalisasi, lalu skor per field: id persis 1400, id mengandung 500, nama persis 1200, awalan 800, mengandung 650, tag persis 420, tag mengandung 280, deskripsi lebih kecil. Diurutkan, dibatasi `--limit`.
- `fetch` mengembalikan kode bit untuk disalin ke proyek.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit sebelum | Kesimpulan |
|---|---|---|---|
| Daftar komponen yang bisa dicari | inventaris + `find` | tabel di `docs/scenes/KIT.md`, harus dibaca manual | **Ditiru**: `catalog.ts` + `mk kit find` |
| Bahasa query | Inggris | — | Tag MotionKit dwibahasa (Indonesia + Inggris) |
| MCP | ada | — | Belum perlu: agent MotionKit memakai shell |
| `fetch` kode | ada | — | Tidak perlu: komponen di-import dari kit |

## Eksperimen

- `packages/core/src/scenes/catalog.ts`: 23 entri (Film, cut, words, bed.duck, beats, BeatBar, util easing, rng, alam, orang, bendera, kain, arsitektur, peta, interior, fx, rig 3D, lab pasar), masing-masing dengan peran, kapan dipakai, kapan dihindari, contoh, tag.
- `scoreKit`: per kata query: id persis 100, bagian id 60, tag persis 50, id mengandung 35, tag mengandung 25, prosa 10; dijumlah.
- `catalog.test.ts` (4 test lolos): semua file yang dirujuk ada, id unik, kata Indonesia menemukan bagian yang benar di urutan pertama, kata asing tidak menemukan apa-apa.
- `node bin/mk.mjs kit find transisi tinta` → `Shot.cut`; `kit find pohon` → `Foliage`; `kit find orang jalan pasar` → `Walker`, `CrowdRow`, rig 3D, lab pasar; `kit find 3d karakter` → `tubuh`.
- AGENTS.md: perintah `kit find` dan `gate` ditambahkan ke daftar perintah dan ke kalimat "baca KIT.md".

## Batasan dan catatan

- Katalog ditulis tangan; harus diperbarui setiap ada bagian baru (test memeriksa file yang dirujuk masih ada, tidak memeriksa bagian yang belum tercatat).
- Entri lab pasar menunjuk `scripts/` yang belum di-commit; test melewatinya.
