# Integration matrix

Audit 2026-10-20. Status refers to evidence collected in this workspace; README claims are not integration proof.

## Existing MotionKit

- `packages/core/src/kit/three.tsx`: DOM/SVG perspective helpers, not a GLB loader.
- Several Jajan scenes already use `@remotion/three` ThreeCanvas.
- `packages/three/src/jajan/`: procedural bodies, IK helpers, food models, textures, lighting.
- `lampu.ts`: RoomEnvironment/PMREM, hemisphere, key and rim lighting already exist.
- Three.js, React Three Fiber, Remotion Three and postprocessing are installed.
- Search found no existing GLTFLoader/useGLTF/AnimationMixer implementation before this experiment.
- Earlier atmosphere proof is hand-authored SVG/CSS. External repository integration and detailed 3D lighting are not demonstrated by that proof.

## First experiment

| Source | Evidence/status | Acquisition | Next acceptance condition |
|---|---|---|---|
| Khronos Fox | Source README checked; GLB downloaded | Individual asset, no clone | Render textured skinned mesh and sample Walk at arbitrary frames |
| Three.js GLTFLoader/SkeletonUtils | Used in `scripts/asset-lab.tsx` | Existing npm dependency | Verify skeleton clone and frame sampling |
| MPFB2 | README research only | Evaluate Blender release when character stage starts | Generate/export one rigged humanoid |
| Ossos / retarget | Candidate descriptions only | Clone selected candidate after source audit | Preserve poses and skeleton compatibility |
| ModKit | CC0 LICENSE inspected; assembled GLB rendered from three angles | Individual GLB downloaded | Original shop assembly and surface artifact investigation; see building-lab.md |
| Wadi | Current README audited: TypeScript/WDL, retired Python; house designs not licensed for reuse | No acquisition | Audit code license and procedural output before any integration |
| postprocessing | Installed, not connected to this experiment | Existing npm dependency | Focused lighting comparison |
| Audio/SFX repositories | Candidates only | Select assets/packages later | Offline audio render with cue/fade timing |

All other entries in repos.md remain discovery candidates. They have not been cloned, executed, or accepted for production.

## Fox provenance

- Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox
- Metadata: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/README.md
- File: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb
- Local: `projects/asset-lab/public/Fox.glb` (ignored; do not commit media).
- SHA256: `D97044E701822BAC5A62696459B27D7B375AADA5DE8574ED4362EDBBA94771F7`.
- Model: PixelMannen, CC0. Rigging and animation: tomkranis, CC BY 4.0. Conversion: AsoboStudio and scurest, CC BY 4.0.
- The complete animated asset must retain attribution; do not label the whole GLB CC0.

## Technical preview

This is an asset loader test, not a narrative scene. Fixed camera; invented neutral ground; no story, real location, or final video.

```powershell
npx tsc --noEmit -p .
npx remotion still scripts/asset-lab.tsx AssetLabFox out/asset-lab/fox-15.png --frame=15 --public-dir=projects/asset-lab/public --gl=angle
```

The preview sets AnimationMixer time from frame/fps directly, instead of accumulating delta time. Visual and nonsequential frame checks are required before promoting it to a shared component.

## Experiment result

- TypeScript check passed.
- Rendered frame 15 followed by frame 0 as separate jobs; both images opened for inspection.
- Fox geometry, orange/white material and skinned poses are visible; the two frames have different leg poses.
- Initial renders captured an empty canvas. Fixed camera target and explicitly rendered the canvas after the loaded primitive committed, before clearing delayRender.
- Outputs: `out/asset-lab/fox-15.png`, `out/asset-lab/fox-0.png`.
- This establishes a basic GLB/rig/clip path only. Contact shadows, accurate ground contact, grid/region inspection, same-session arbitrary seeking, video smoothness and reusable loader error handling remain unverified.
- CLI reports installed Zod 3.25.76 versus expected 4.3.6. Render succeeds; dependency migration is deferred because existing schemas use Zod 3.
- No external repository was cloned and no npm dependency installed in this experiment.
