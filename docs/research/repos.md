# MotionKit Research Repository Map

Status mengikuti siklus di [rencana-belajar-repo.md](rencana-belajar-repo.md): `Kandidat` → `Dipelajari` → `Diambil` / `Ditiru` / `Asset` / `Dilewati`. Kartu belajar tiap repo ada di [repos/](repos/). Clone untuk dipelajari: `node scripts/repo-study.mjs <owner/repo>`.

## Remotion, components, dan editor

- `Ditiru` [remotion-bits](https://github.com/av/remotion-bits) — komponen animated text, transition, chart, particle, dan scene 3D. [Kartu](repos/remotion-bits.md)
- `Ditiru` [reactvideoeditor/remotion-templates](https://github.com/reactvideoeditor/remotion-templates) — 81 komponen standalone untuk chart, text, background, transition, branding, dan media. [Kartu](repos/reactvideoeditor-remotion-templates.md)
- `Ditiru` [ali-abassi/remotion-templates](https://github.com/ali-abassi/remotion-templates) — katalog 1.000 template, registry, preview, recipe agent, provenance, dan QA gate. [Kartu](repos/ali-abassi-remotion-templates.md)
- `Diambil` [remotion-scenes](https://github.com/lifeprompt-team/remotion-scenes) — 201+ scene reusable untuk text, shape, UI, data, particle, cinematic, dan layout. [Kartu](repos/remotion-scenes.md)
- `Ditiru` [remotion-cinematic](https://github.com/codeverbojan/remotion-cinematic) — product-demo engine dengan props choreography, camera, cursor, UI state, audio, dan visual editor. [Kartu](repos/remotion-cinematic.md)
- `Ditiru` [claude-remotion-editor](https://github.com/ytrofr/claude-remotion-editor) — hand-path editor, Lottie gestures, phone mockups, screenshot capture, dan cursor choreography. [Kartu](repos/claude-remotion-editor.md)
- `Ditiru` [claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) — workflow agent motion graphics dan render-inspect-fix loop. [Kartu](repos/claude-remotion-skill.md)
- `Ditiru` [claude-remotion-flow](https://github.com/sellersessions/claude-remotion-flow) — pipeline treatment, voice-over, music bed, ambience, dan beat timing. [Kartu](repos/claude-remotion-flow.md)
- `Ditiru` [remotion-captions-themes](https://github.com/vshukla7/remotion-captions-themes) — word-level animated caption dan kinetic typography. [Kartu](repos/remotion-captions-themes.md)
- `Ditiru` [Vanta](https://github.com/itsjwill/vanta) — blueprint platform video AI lengkap di atas Remotion. [Kartu](repos/vanta.md)

## 3D, karakter, dan animasi

- `Dipakai sebagian` [Three.js](https://github.com/mrdoob/three.js) — engine 3D WebGL/WebGPU.
- `Kandidat` [MPFB2](https://github.com/makehumancommunity/mpfb2) — human generator open source untuk Blender.
- `Kandidat` [Ossos](https://github.com/sketchpunklabs/ossos) — skinning, skeleton, pose, dan IK di web.
- `Kandidat` [three-ws/retarget](https://github.com/nirholas/retarget) — retarget animation antar rig humanoid.
- `Kandidat` [auto-rig-web](https://github.com/nff747/auto-rig-web) — eksperimen automatic rigging berbasis ONNX dan Three.js.
- `Kandidat` [walking-characters-remotion](https://github.com/uxfreak/walking-characters-remotion) — karakter 3D berjalan, dialog, camera shots, dan JSON config.
- `Kandidat` [Blender-Crowd](https://github.com/bgyss/Blender-Crowd) — crowd simulation deterministic untuk pedestrian.

## Gedung, environment, dan geodata

- `Diaudit` [Wadi](https://github.com/bijoor/wadi) — generator rumah/gedung berbasis data dengan viewer React + Three.js.
- `Kandidat` [ProceduralCityGeneration](https://github.com/Grzybojad/ProceduralCityGeneration) — kota procedural berbasis Blender.
- `Kandidat` [Infinigen](https://github.com/princeton-vl/infinigen) — procedural natural dan indoor environments.
- `Kandidat` [ProcFunc](https://github.com/princeton-vl/procfunc) — abstraction untuk procedural 3D generation di Blender.
- `Kandidat` [BlenderProc](https://github.com/DLR-RM/BlenderProc) — pipeline procedural scene dan rendering Blender.
- `Kandidat` [ProceduralTerrains](https://github.com/ZyFou/ProceduralTerrains) — terrain, planet, water, clouds, dan GLB export.
- `Kandidat` [Route2World](https://github.com/AiiluoChen/Route2World) — terrain dan environment berdasarkan GPX/GPS.
- `Kandidat` [BlenderGIS](https://github.com/domlysz/BlenderGIS) — OpenStreetMap, elevation, terrain, dan data GIS ke Blender.
- `Kandidat` [VoxCity](https://github.com/kunifujiwara/VoxCity) — city model berbasis geospatial data.
- `Kandidat` [Streets GL](https://github.com/strandedkitty/streets-gl) — renderer kota 3D berbasis OpenStreetMap dan Three.js.

## Asset, props, material, dan discovery

- `Kandidat` [holokat/game-assets](https://github.com/holokat/game-assets) — GLB, Blender source, karakter, farm, structures, creatures, motion, dan VFX.
- `Dipakai sebagian` [ModKit](https://github.com/JaronKBragg7337/asset-pack-ue-threejs-blender-unity) — modular building kit dan props CC0.
- `Kandidat` [fps-buildings-env-kit](https://github.com/petroulacl/fps-buildings-env-kit) — buildings, vegetation, props, dan environment.
- `Kandidat` [awesome-3d-assets](https://github.com/glbkit-tools/awesome-3d-assets) — katalog model, texture, PBR, HDRI, dan environment.
- `Dipakai sebagian` [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) — asset uji GLTF/GLB, material, animation, dan skinning.
- `Kandidat` [Kenney](https://github.com/KenneyNL) — stylized game assets dan UI.
- `Kandidat` [Quaternius](https://github.com/Quaternius) — low-poly characters, animals, vehicles, props, dan environment.
- `Diambil` [Poly Haven](https://polyhaven.com) — CC0 HDRI, model, texture, dan material. [Kartu](repos/polyhaven.md)
- `Ditiru` [polyhaven-skill](https://github.com/MaksPyn/polyhaven-skill) — pencarian/download asset Poly Haven. [Kartu](repos/polyhaven.md)
- `Kandidat` [3d-asset-server](https://github.com/arielshad/3d-asset-server) — asset API dan MCP dengan filter tipe serta lisensi.

## Kendaraan dan traffic

- `Kandidat` [threejs-driving-simulator](https://github.com/sandeshs0/threejs-driving-simulator) — mobil, interior, physics, camera, road, weather, dan audio.
- `Kandidat` [drive-sim](https://github.com/Vasiwe98/drive-sim) — kendaraan procedural Three.js + Cannon-es.
- `Kandidat` [three-js-car-example](https://github.com/manuelhintermayr/three-js-car-example) — car physics berbasis Rapier.
- `Kandidat` [traffic-flow-simulation](https://github.com/TRIZHAX/trizhax-traffic-flow-simulation) — traffic flow, lane, IDM, dan instanced vehicles.
- `Kandidat` [moveet](https://github.com/ivannovazzi/moveet) — fleet simulation dengan car, truck, motorcycle, ambulance, dan bus.
- `Kandidat` [Spectral GT RS](https://github.com/JaronKBragg7337/spectral-gt-rs) — detailed procedural sports-car asset dan GLB export.

## Water, weather, lighting, dan VFX

- `Kandidat` [threejs-water-free](https://github.com/baditaflorin/threejs-water-free) — procedural ocean, sky, underwater, dan buoyancy.
- `Kandidat` [web-ocean-3d](https://github.com/2600th/web-ocean-3d) — ocean, foam, caustics, wakes, island, dan underwater transitions.
- `Terpasang, belum diuji` [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) — bloom, LUT, color grading, DOF, vignette, noise, glitch, SSAO, dan god rays.
- `Kandidat` [three-volumetric-pass](https://github.com/Ameobea/three-volumetric-pass) — volumetric fog dan cloud.
- `Kandidat` [three.js-volume-renderer](https://github.com/Donitzo/three.js-volume-renderer) — volumetric smoke, mist, dan procedural volumes.
- `Kandidat` [react-weather-effects](https://github.com/rauschermate/react-weather-effects) — rain, snow, lightning, dan fog.
- `Kandidat` [3d-weather-codrops](https://github.com/cartuhok/3d-weather-codrops) — weather scene, dynamic lighting, clouds, dan lens flare.
- `Kandidat` [Plume](https://github.com/travisdmathis/plume) — GPU VFX untuk fire, smoke, rain, snow, sparks, portal, dan fireworks.
- `Kandidat` [three-vfx](https://github.com/0xFlan/three-vfx) — GPU particle system untuk Three.js/WebGPU.
- `Kandidat` [wawa-vfx](https://github.com/wass08/wawa-vfx) — VFX engine untuk Three.js/R3F.

## Audio dan SFX

- `Kandidat` [@remotion/sfx](https://github.com/remotion-dev/remotion) — SFX resmi Remotion.
- `Kandidat` [quiet-fx](https://github.com/filipeafns/quiet-fx) — procedural UI/motion sounds.
- `Kandidat` [foley](https://github.com/eakbulut/foley) — Web Audio interface sounds.
- `Kandidat` [cacophony](https://github.com/ctoth/cacophony) — Web Audio dan audio sprites.

## Optimasi GLB

- `Ditiru` [gltf-slipstream](https://github.com/juanmgh3/gltf-slipstream) — Draco dan WebP compression lokal. [Kartu](repos/gltf-optimizers.md)
- `Ditiru` [LightLoad](https://github.com/ImDxni/LightLoad) — Draco, Meshopt, KTX2, resize, dan simplification. [Kartu](repos/gltf-optimizers.md)
- `Ditiru` [meshify](https://github.com/lxie-leo/meshify) — LOD, conversion, splitting, texturing, dan optimization CLI. [Kartu](repos/gltf-optimizers.md)
- `Ditiru` [3d-asset-pipeline](https://github.com/Sensus-AI-FZCO/3d-asset-pipeline) — Blender headless dan glTF transform pipeline. [Kartu](repos/gltf-optimizers.md)
