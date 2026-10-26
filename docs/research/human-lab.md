# Human rig experiment — 2026-10-20

Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CesiumMan

Downloaded individual GLB to ignored `projects/asset-lab/public/CesiumMan.glb`. No repository clone or new dependency.

Credit: Cesium, 2017, CC BY 4.0. Source metadata separately identifies the Cesium logo; this preview replaces all source materials with an unbranded neutral material. The geometry and animation remain attributed to Cesium. This is a stylized humanoid test asset, not a realistic human generator.

SHA256: `B7001EAEEA8254BD44773BCD247E78696D94169388FBB2A1800FC69434E777D9`.

Entry: `scripts/human-lab.tsx`. SkeletonUtils clones the rig, the first embedded animation is sampled with AnimationMixer.setTime(frame/fps), and rest-pose bounds normalize height to 1.8 scene units. No custom skeleton or new animation was generated.

```powershell
npx tsc --noEmit -p .
npx remotion still scripts/human-lab.tsx AssetLabHuman out/asset-lab/human-15.png --frame=15 --public-dir=projects/asset-lab/public --gl=angle
npx remotion still scripts/human-lab.tsx AssetLabHuman out/asset-lab/human-0.png --frame=0 --public-dir=projects/asset-lab/public --gl=angle
```

Verification: typecheck passed; both still renders succeeded and were opened. Humanoid geometry, bent limbs and ground shadows are visible. The character has a plain disk-like head, no facial detail and one neutral surface; unsuitable as final detailed human artwork. Stills do not establish smoothness, foot locking, or arbitrary seeking within a single mounted renderer. Existing Zod version warning remains.
