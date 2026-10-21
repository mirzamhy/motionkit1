# Khronos glTF (Validator, Sample Assets), ModKit, Quaternius

Dipelajari 21 Oktober 2026 (gelombang 2, lanjutan dari pemakaian sebelumnya).

## Khronos

- **glTF-Validator** (npm `gltf-validator` 2.0.0-dev.3.10, Apache-2.0, tanpa dependency dan install script), dipasang sebagai devDependency terkunci. → **Diambil**.
- `node bin/mk.mjs asset check <model…> [--expect m]` (`apps/cli/asset.ts`): error/warning validator, jumlah segitiga dan material, lalu **ukuran dunia nyata** dari min/max accessor POSITION lewat semua transform node (dengan dequantize KHR_mesh_quantization). Dengan `--expect` memberi tanda bila meleset lebih dari 2×.
  - Menangkap otomatis yang sebelumnya ketahuan dari render: jahe Poly Haven "OFF by 3.83x: scale it by 0.26" (koreksi manual waktu itu juga 0,26), bawang Kenney "scale it by 0.32".
  - Bug sendiri yang ketemu: GLB ter-quantize terbaca 19 km karena min/max masih bilangan bulat; diperbaiki, tiga versi pisang sekarang sama-sama 60,0 × 17,9 × 24,4 cm.
  - `apps/cli/asset.test.ts`: 4 test (tanpa transform, skala + translasi anak, rotasi 90°, quantized).
  - Warning yang umum di Poly Haven: `MESH_PRIMITIVE_GENERATED_TANGENT_SPACE` (tangent dibuat saat runtime), tidak memblokir.
- **glTF Sample Assets**: lisensi per model (repo tidak punya satu lisensi); Fox dan CesiumMan dipakai sebelumnya, dengan atribusi animasi Fox.

## ModKit (JaronKBragg7337/asset-pack-ue-threejs-blender-unity, CC0)

- 39 GLB; props pasar: `SM_Crate_Small/Large/Stack/Broken`, `SM_Pallet`, `SM_Barrel(_Dented/_Open)`. Diunduh 5 file ke `projects/vendor-action/public/modkit`, provenance lewat `mk asset note`. → **Asset**.
- `mk asset check`: 0 error, 0 warning; peti 64 cm, palet 120 × 80 cm (ukuran palet EUR), tong 94 cm. Skala sudah akurat.

## Quaternius

- Lisensi sekarang **Quaternius Asset License (QAL) v1.0** (halaman quaternius.com/license.html, diperbarui 28 Agustus 2026): gratis untuk proyek pribadi, edukasi dan komersial, tanpa kredit; **tidak boleh dijual ulang atau didistribusikan sebagai asset**. Catatan "CC0" di 3d-asset-server tidak lagi tepat untuk lisensi ini.
- Unduhan lewat folder Google Drive per pack; tidak otomatis. → **Dipelajari**, belum diambil.
- Untuk MotionKit: boleh muncul di video; file tidak boleh di-commit (aman: `projects/` di-gitignore). Pack berguna untuk gelombang 3: `animatedmen`, `animatedwomen`, `backgroundposedhumans`. Ambil manual lalu catat dengan `mk asset note <dir> --license QAL-1.0 --source <url>`.

## Instancing (dari repo optimasi, diuji di sini)

- `PhInstances` (`scripts/lab/polyhaven-lab-parts.tsx`): satu `InstancedMesh` per mesh model, penempatan `[x, y, z, yaw, skala]`.
- 150 bawang Poly Haven, 30 frame: salinan biasa 18,3 s, instanced 13,8 s (termasuk bundling); gambar sama (PSNR 82,8 dB). Bawang saling tembus karena penempatan acak; tumpukan alami perlu simulasi yang dihitung sekali dan disimpan.

## Proof gelombang 2

`StallWave2` (`scripts/polyhaven-stall.tsx`): lapak flat dengan produk Kenney (bawang instanced), peti di atas palet dan tong ModKit. Dua revisi: peti saling tembus, tong terpotong kamera.
