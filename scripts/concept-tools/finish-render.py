import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]/'projects'/'style-concepts-01';out=root/'out-v2'
verified={}
for file in ['verification-books.json','verification-signal.json']:
    verified.update(json.loads((out/file).read_text(encoding='utf8')))
assert set(verified)=={'books','coffee','signal'}
for name,result in verified.items():
    assert not result['dark_frames'],(name,'unpainted frames')
    assert (out/result['file']).stat().st_size>10000
    result['quality_review']='Encoded video decoded in full; reviewed six scene frames; large changes inspected against the declared scene boundaries.'
    if name=='coffee':
        result['reviewed_slow_moments']={'28':'Near the diagnostic threshold (0.2384 vs 0.25); the pour shot retains slow camera movement and moving water highlights. Accepted as a quiet visual moment.'}
(out/'verification.json').write_text(json.dumps(verified,indent=2),encoding='utf8')
manifest=[{'id':{'books':'BooksConcept','coffee':'CoffeeConcept','signal':'SignalConcept'}[name],**{key:r[key] for key in ['file','width','height','fps','frames','duration_s','audio']}} for name,r in verified.items()]
(out/'render-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
text='''# Render versi kedua

Ketiga video menggunakan visual revisi 02 yang telah disetujui, dengan gerak kamera dan objek yang diperbaiki setelah pemeriksaan render pertama. File H.264, 60 fps, tanpa audio.

| Video | Durasi | Resolusi | File |
|---|---|---|---|
| Satu Bab Lagi | 20 detik | 1080×1080 | [MP4](satu-bab-lagi-v2.mp4) |
| Perjalanan Secangkir Kopi | 36 detik | 1920×1080 | [MP4](perjalanan-secangkir-kopi-v2.mp4) |
| Sinyal dari Jauh | 25 detik | 1920×1080 | [MP4](sinyal-dari-jauh-v2.mp4) |

## Pemeriksaan

Durasi dan jumlah frame diverifikasi menggunakan ffprobe: 1200, 2160, dan 1500 frame. Seluruh video didekode menggunakan ffmpeg; tidak ditemukan frame kosong pada scan. Review sheet berasal dari MP4 yang dienkode, bukan gambar preview. Pemeriksaan TypeScript selesai tanpa error.

[Review buku](books-render-review.jpg) · [Review kopi](coffee-render-review.jpg) · [Review sinyal](signal-render-review.jpg) · [Data verifikasi](verification.json)

Scan gerak adalah diagnosis, bukan skor kemiripan dengan referensi. Momen kopi pada detik 28 berada sedikit di bawah ambang diagnosis dan dipertahankan karena kamera serta highlight air masih bergerak. Penutup dibolehkan menetap agar pesan akhir terbaca. Perubahan besar pada pergantian adegan sesuai dengan fade/iris yang dirancang.

Pada antariksa, layer lama dilepas setelah iris adegan berikutnya menutup seluruh layar. Ini menghindari perhitungan ring yang terus membesar di balik adegan lain. Titik signal dan pergantian iris tetap dipertahankan.

## Membuat ulang

Dari root MotionKit:

```powershell
node scripts/concept-render.mjs
```

Satu video saja dapat memakai ID `BooksConcept`, `CoffeeConcept`, atau `SignalConcept` sebagai argumen. Versi render awal untuk perbandingan berada di `first-pass/`.
'''
(out/'README.md').write_text(text,encoding='utf8')
print(json.dumps(manifest,indent=2))
