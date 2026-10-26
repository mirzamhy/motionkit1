# Building model lab — 2026-10-20

## Source audit and selection

ModKit: https://github.com/JaronKBragg7337/asset-pack-ue-threejs-blender-unity

The repository contains 38 individual GLBs plus an assembled Industrial Outpost GLB and layout JSON. Export convention: metres, Y-up, modular grid. Source LICENSE was downloaded and inspected: CC0 1.0 Universal. Only the assembled GLB and license were downloaded; no repository clone or dependency installation.

Asset URL: https://raw.githubusercontent.com/JaronKBragg7337/asset-pack-ue-threejs-blender-unity/main/examples/industrial_outpost/ModKit_Industrial_Outpost.glb

Local file: `projects/building-lab/public/outpost.glb` (ignored).

SHA256: `5FC8168D4D06453AE1923A2EDC5D5E04E95B91079A356AE05D5478D3542E9D9C`.

This scene is the source author's industrial building assembly, not a MotionKit-authored shop. It is the technical baseline before creating a shop from individual pieces. Ground plane and camera/light setup in the preview are invented test fixtures.

## Wadi correction

Current README: https://github.com/bijoor/wadi

The Blender/Python pipeline is retired. Current implementation uses TypeScript, React, Three.js, a WDL compiler and a schema. README describes app scaffolding as MIT-style but explicitly says house designs are not licensed for reuse. Do not import its house designs as free assets. No Wadi code or design has been copied or executed.

## Reproduce

Entry: `scripts/building-lab.tsx`. Uses existing GLTFLoader and ThreeCanvas, preserves source materials and metre scale, recenters the assembly and places its minimum Y at ground level. Bounding box determines camera placement. Loading is held with delayRender until explicit canvas render.

```powershell
npx tsc --noEmit -p .
npx remotion still scripts/building-lab.tsx Building-overview out/building-lab/overview.png --public-dir=projects/building-lab/public --gl=angle
npx remotion still scripts/building-lab.tsx Building-front out/building-lab/front.png --public-dir=projects/building-lab/public --gl=angle
npx remotion still scripts/building-lab.tsx Building-detail out/building-lab/detail.png --public-dir=projects/building-lab/public --gl=angle
```

## Observed results

Typecheck passed and all three still renders succeeded. Opened each image. Roof seams, teal door, wall trim, openings, vents, pipes, railings, barrels, crates and cast shadows are visible. Detail view confirms geometry beyond a flat facade. Fine repeated striping appears on wall/floor surfaces; investigate shadow bias or overlapping surfaces before accepting closeups. Current materials are flat placeholders, not detailed PBR textures. No storefront, retail interior, weather, night lighting, grid/region QA or motion has been validated.

Next: inspect the individual doorway/window/roof pieces and their pivots; assemble an original small shop with clear dimensions; resolve surface striping; then compare front, three-quarter and detail views before lighting variants.
