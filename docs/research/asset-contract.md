# MotionKit Asset Contract

Semua asset yang masuk ke MotionKit perlu memiliki metadata dan provenance yang jelas.

```ts
type MotionKitAsset = {
  id: string;
  type:
    | "character"
    | "vehicle"
    | "building"
    | "prop"
    | "environment"
    | "effect"
    | "audio";
  source: string;
  license: string;
  model?: string;
  preview?: string;
  scale: number;
  origin: [number, number, number];
  bounds?: [number, number, number];
  animations?: string[];
  variants?: string[];
  materials?: string[];
  dependencies?: string[];
};
```

## Aturan teknis

- Model 3D diprioritaskan dalam GLB/GLTF.
- Origin, unit, forward axis, dan skala harus dicatat.
- Animasi harus memiliki nama stabil dan dapat dipanggil berdasarkan frame.
- Asset harus dapat dimuat tanpa network saat render final.
- Asset berat harus memiliki LOD atau versi terkompresi.
- Lisensi harus dicatat pada metadata dan tidak boleh diasumsikan dari nama situs.
- Preview still harus dibuat sebelum asset dipakai dalam video.
- Asset eksternal tidak boleh disalin ke repository tanpa pemeriksaan lisensi.

## Mood contract

Scene dapat memilih preset suasana yang mengatur visual dan audio secara bersama:

```ts
type AtmospherePreset = {
  id: string;
  lighting: string;
  weather?: string;
  colorGrade?: string;
  ambience?: string;
  music?: string;
  sfx?: string[];
  cameraMood?: string;
};
```
