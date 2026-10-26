# MotionKit

Programmatic motion graphics and video synthesis framework extending [Remotion](https://www.remotion.dev) with high-level cinematic primitives, procedural asset pipelines, and dual-clock choreography.

MotionKit sits on top of Remotion's low-level frame synthesis and bundler engine. While Remotion provides deterministic video rendering in React, MotionKit introduces the higher-level abstraction layer needed to build narrative animated films, explainers, and 3D scenes without writing boilerplate animation math from scratch.

---

## Why MotionKit on top of Remotion?

Remotion is an exceptional low-level foundation for rendering React into video frames. However, authoring narrative films directly in vanilla Remotion often leads to:
- Slide-deck feel (static text fades over flat cards).
- Complex time retiming whenever voice-over pacing changes.
- Manual positioning of repetitive visual elements.

MotionKit extends Remotion with:
- **Cinematic Shot Choreography**: Native camera rigs with easing pushes, parallax tracking, and scene transitions.
- **Dual-Clock Architecture**: Decouples audio-synced narrative beats (`u`) from monotonic physical simulation clocks (`a`).
- **Integrated Three.js Pipeline**: Seamless embedding of WebGL/3D canvases (`@react-three/fiber`) within 2D multi-plane compositions.
- **Workflow-first CLI**: Frame-targeted proofing stills, compositional grids (Rule of Thirds/Golden Ratio), and automated asset inspection.
- **Modular Asset Library**: Standardized contracts for reusable 2D vector and 3D low-poly props, vehicles, and characters.

---

## Architecture

MotionKit separates video generation into three core primitives:

1. **Dual-Clock Scene Runner (`Film`)**
   - **Beat Clock (`u`)**: Normalized narrative time. Stretches or compresses via time-warping curves to snap visual cues directly to speech syllables or voice-over markers.
   - **Ambient Clock (`a`)**: Monotonic real-time frame counter. Drives continuous physical systems (wind, cloth simulation, secondary foliage oscillation, walking cycles, lighting shifts) independently of editorial cuts.

2. **Hybrid Visual Pipeline**
   - **2D Layered Vectors**: Multi-plane SVG depth stacks (sky, background, midground, subjects, foreground occlusion) with procedural seedable detail.
   - **3D Low-Poly & WebGL (`@react-three/fiber`)**: Hardware-accelerated 3D viewports (`ThreeCanvas`) embedded directly into scenes for spatial cameras, architectural staging, and volumetric vehicles.

3. **Parametric Asset System**
   - Centralized, style-consistent asset catalog (`library/`) providing ready-to-use 2D/3D props, characters, architecture, and vehicles across defined style tags (`poly3d`, `stik`, `ilustrasi`, `flanel`).

---

## Installation

### Prerequisites
- Node.js >= 22.0.0
- npm / pnpm
- Chromium / Chrome (auto-resolved via Remotion for headless rendering)

```bash
git clone https://github.com/mirzamhy/motionkit.git
cd motionkit
npm install
```

---

## CLI Usage (`mk`)

MotionKit includes a dedicated CLI (`bin/mk.mjs`) to manage assets, inspect frames, and render compositions.

### 1. Asset Library Management
Inspect, search, and scaffold reusable modular assets before building shots:

```bash
# List supported visual styles
node bin/mk.mjs gaya list

# Search assets across all styles
node bin/mk.mjs aset find <keyword>

# Scaffold a new asset skeleton
node bin/mk.mjs aset baru <asset-name> <style>
# Example: node bin/mk.mjs aset baru tank poly3d

# Render an orthographic 4-axis preview sheet (0°, 90°, 180°, 270°) with human scale guide
node bin/mk.mjs item preview <asset-id>

# Rebuild the asset index and mapping documentation
node bin/mk.mjs aset peta
```

### 2. Scene Development & Proofing
Iterate on animation keyframes by rendering target stills rather than full videos:

```bash
# List registered scenes
node bin/mk.mjs scene list

# Render proof stills (individual frames + contact sheet)
node bin/mk.mjs scene stills <SceneName> <frame1,frame2,frame3>
# Example: node bin/mk.mjs scene stills ExplainerScene 120,340,650

# Render with compositional alignment overlays (Rule of Thirds & Golden Ratio grids)
node bin/mk.mjs scene stills <SceneName> 150 --grid
```

### 3. Production Video Export
Export the full timeline to high-bitrate MP4:

```bash
node bin/mk.mjs scene video <SceneName>
# Output lands in: out/scenes/<SceneName>/<SceneName>.mp4
```

### 4. Audio & Voice-over Synchronization
Analyze audio tracks to generate editorial cut boundaries and warp cues:

```bash
node bin/mk.mjs vo-cut path/to/voiceover.mp3
```

---

## Directory Structure

```
motionkit/
├── bin/
│   └── mk.mjs                  # Primary developer CLI entrypoint
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── library/        # Multi-style asset components (poly3d, stik, etc.)
│   │   │   ├── scenes/         # Composed scene runners and timeline manifests
│   │   │   ├── templates/      # Specialized simulation templates
│   │   │   └── kit/            # Core shaders, cameras, materials, and SVG primitives
│   │   └── package.json
│   ├── dna/                    # Visual rhythm and style-vector extraction
│   └── qa/                     # Quality gates, schema verification, and motion-energy linting
├── out/                        # Build artifacts, render sheets, and exported MP4s (git-ignored)
└── package.json
```

---

## Quality Rules

Every MotionKit scene adheres to production constraints:
- **No Zero-Frame Jumps**: State and position transforms interpolate smoothly across $\ge 5$ frames.
- **Pure Frame Computability**: Every frame must render deterministically in isolation. No hidden mutation or state accumulation across frames.
- **Static Heavy Filters**: Complex SVG noise or turbulence filters remain non-animated to maintain stable Chromium raster performance.
- **Type Safety**: The entire codebase strictly enforces TypeScript verification (`npm run typecheck`).

---

## License

[MIT License](LICENSE) &copy; 2026 Mirza Muhyidin
