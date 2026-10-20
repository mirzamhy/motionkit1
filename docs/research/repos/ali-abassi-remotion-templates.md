# ali-abassi/remotion-templates

- Repo: https://github.com/ali-abassi/remotion-templates @ 6430d42, dipelajari 21 Oktober 2026
- Gelombang: 1, Remotion, editor, agent (repo #6)
- Lisensi: **tidak ada** (tanpa file LICENSE, `package.json` tanpa field license) → hanya ide; tidak ada kode, teks atau preview yang disalin
- Putusan: **Ditiru**. Gerbang QA dan katalog untuk agent ditulis baru untuk MotionKit.

## Isi repo

Pustaka 1.000 template dari 100 "family engine" (`src/families/*.tsx` + `*.registry.json`), `src/registry.json` gabungan, preview MP4 dan thumbnail per template (378 MB, sebagian besar PNG), situs statis untuk menjelajah, `SKILL.md` untuk agent, catatan riset dan provenance (`research/provenance-ledger.md`). Script: `gate.mjs`, `build-agent-catalog.mjs`, `render-previews.mjs`, `render-thumbs.mjs`, `merge-registry.mjs`.

## Cara kerja intinya

- **Gate** (`scripts/gate.mjs`): `tsc --noEmit` → bundle Remotion sekali → untuk setiap entri registry pilih composition dan render 2 still (25% dan 75%) pada skala kecil → tulis `dist/failures.json` dan keluar dengan kode gagal bila ada yang rusak.
- **Katalog agent** (`build-agent-catalog.mjs`): per kategori ditulis peran, kegunaan, urutan, padanan, cara menyerahkan ke scene berikutnya, dan batasan; registry tetap sumber kebenaran untuk id, durasi, props.
- **Provenance**: catatan dari mana mekanik setiap family berasal.

## Dibandingkan dengan MotionKit

| Hal | Repo | MotionKit sebelum | Kesimpulan |
|---|---|---|---|
| Cek bahwa semua scene masih bisa dirender | gate | manual, per scene (`mk scene stills`) | **Ditiru**: `mk gate` |
| Unit test di gate | tidak ada | `beats.test.ts` (repo #4) | MotionKit menambahkannya ke gate |
| Katalog untuk agent | per kategori template | tabel KIT.md | **Ditiru** bersama repo #7: `catalog.ts` dengan peran / kapan dipakai / kapan dihindari |
| Provenance | ledger per family | `refs.md`, `facts.md` per proyek | Dicatat untuk gelombang 2 (asset-contract) |

## Eksperimen

- `apps/cli/gate.ts` + perintah `node bin/mk.mjs gate [--only A,B] [--no-render]`: `tsc`, semua `*.test.ts` di `packages/` dan `apps/` lewat `tsx --test`, lalu 2 still lebar 480 px untuk setiap scene di `manifest.ts` (voice-over dimatikan agar rekaman yang hilang tidak menggagalkan gate). Hasil: `out/gate/report.json` dan `out/gate/index.html`.
- **Run penuh**: 27/27 scene lolos dalam 861 detik (± 14 menit; scene 3D 25–54 detik masing-masing). Lembar kontak semua scene: `out/gate/sheet.jpg` (dibuka).
- Run `--only UnairScene,PizzaScene` setelah perubahan `Film` berikutnya: 2/2 lolos, 3 file test lolos.

## Batasan dan catatan

- Gate hanya membuktikan scene bisa dirender, bukan bahwa hasilnya benar; still tetap harus dibuka.
- Run penuh lama karena scene 3D; pakai `--only` untuk yang disentuh.
- `--only` menimpa `index.html` dengan subset itu.
