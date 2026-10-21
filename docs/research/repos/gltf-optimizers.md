# Optimasi GLB: gltf-slipstream, LightLoad, meshify, 3d-asset-pipeline

- Repo, dipelajari 21 Oktober 2026 (gelombang 2):
  - https://github.com/juanmgh3/gltf-slipstream @ d308f8e: MIT; punya postinstall hook (`node scripts/copy-draco-wasm.mjs`), tidak di-install.
  - https://github.com/ImDxni/LightLoad @ dd5858d: file LICENSE ada, `package.json` tanpa field lisensi.
  - https://github.com/lxie-leo/meshify @ 131b2d5: MIT (monorepo CLI + core + kernel-ts).
  - https://github.com/Sensus-AI-FZCO/3d-asset-pipeline @ 2415ca3: tanpa lisensi; isinya hanya laporan studi kelayakan + viewer Flask.
- Putusan: **Ditiru**. Ketiganya membungkus **glTF-Transform** (MIT, Don McCurdy); MotionKit memakai CLI glTF-Transform langsung, versi terkunci, lewat `mk asset optimize`.

## Cara kerja intinya

Hitungan kata kunci di kode sumber: gltf-slipstream (webp 34, draco 17, quantize 10, ktx 10, prune, dedup, weld), LightLoad (instance 173, ktx 77, simplify 30, weld, prune, dedup, meshoptimizer), meshify (simplify 135, instance 39, dedup 36, sharp 32, weld 29, draco 19). Urutan yang sama di semua: dedup → weld → prune → (instance) → simplify (meshoptimizer) → quantize atau Draco/meshopt → tekstur ke WebP/KTX2 (sharp).

## Masuk ke MotionKit

`apps/cli/asset.ts` `optimizeModel` + `node bin/mk.mjs asset optimize <model> [--ratio 0.5]`: `npx @gltf-transform/cli@4.1.1 optimize` dengan `--compress quantize` (KHR_mesh_quantization, dibaca three tanpa decoder tambahan), simplify ke rasio target, tekstur dibiarkan; mencetak segitiga sebelum/sesudah dan ukuran GLB.

## Eksperimen

- Pisang Poly Haven, asli 46.868 segitiga / 2,36 MB (gltf + bin + 3 JPG):
  - quantize saja: 46.868 / 2,07 MB
  - simplify 50%: 23.434 / 1,70 MB
  - simplify 15%: 7.030 / 1,44 MB
  - Ukuran didominasi tekstur (1,38 MB JPG).
- Render berdampingan (`OptimizedBananas` di `scripts/lab/polyhaven-lab.tsx`) dan zoom dibuka: dari jarak kamera lapak ketiganya sama; dari dekat 50% tidak terbedakan, 15% siluet satu pisang menggembung. **Default 50%, 15% hanya untuk props jauh/tumpukan.**
- Kompresi tekstur WebP gagal di Windows (`colourspace: parameter space not set`, dari sharp/libvips) untuk JPG Poly Haven → dimatikan.
- `--simplify-error` membatasi pemangkasan: jeruk nipis dengan target 30% hanya turun 8.100 → 7.397 karena batas error tercapai lebih dulu.
- Setelah optimize, nama dan struktur node berubah (digabung): opsi `only` (memilih satu node) tidak lagi berlaku pada GLB hasil optimize. Pilih node sebelum optimize.
- Bug yang ketemu di alat sendiri: `npx` di Windows butuh shell, dan cmd.exe salah membaca baris yang diawali tanda kutip; sekarang hanya argumen berspasi yang dikutip. Diuji dengan path relatif dan path absolut berspasi.

## Batasan

- Instancing untuk tumpukan (satu mesh, banyak salinan) belum dipakai di lab: setiap salinan masih objek terpisah.
- Tekstur belum dikecilkan; KTX2/WebP perlu jalur lain di Windows.
