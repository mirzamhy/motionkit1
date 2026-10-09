# MotionKit plan

## Why

Three existing approaches each solve one part:

| Source | Strength we take | Weakness we avoid |
|---|---|---|
| `remotion-video` (ros) | Spec-only model output, engine owns motion, VO + word cues, lint, review stills, frame-jump scan | Fixed set of widgets/looks → limited variety |
| bang-motion (MIT) | Anti-slideshow laws that can be checked mechanically, opener concept menu, explainer styles | Agent writes all code → quality depends on the model |
| NullMotion (no license — ideas only, no code) | Splitting a reference into sections at real cuts, studying it beat by beat, template ideas | Not a generator |
| Our research (168 videos, `references/`) | Styles, 35 transitions, 28 themes, palettes, cut tempo, 3D refs | — |

## Architecture

```
reference video ──► dna ──► Style DNA (palette, tempo, ground, transition family, theme)
brief + facts ────────────► concept (opener menu / archetype)
                                │
                                ▼
                      spec (widgets, transitions, look from DNA, ≤2 custom scenes)
                                │
                     engine + widgets + looks + three + audio  (Remotion)
                                │
                                ▼
                     qa: schema lint · anti-slideshow · motion energy/sec ·
                         DNA distance · frame-jump · review stills
                                │ fail → model revises spec
                                ▼
                               MP4
```

## Packages

| Package | Job |
|---|---|
| `apps/cli` | `mk new --ref <url>`, `mk dna`, `mk spec`, `mk render`, `mk review` |
| `spec` | zod schema: beats, widgets, `transition`, look, `custom` scene |
| `engine` | camera, layout, transitions (ported from ros) |
| `widgets` | hero, stat, takeover, scramble, before-after, dot-matrix, leaderboard, notification, … |
| `looks` | presets + look generated from Style DNA |
| `three` | `logo3d`, `device3d` via @remotion/three (optional dependency) |
| `audio` | TTS, STT word cues, music bed, beat grid, SFX |
| `dna` | reference analysis (seeded from `references/tools/extract.py`) |
| `qa` | all automatic checks |

## Phases

1a. **Port (done).** ros copied as-is: `packages/core/src` (engine, widgets, spec, kit, engines), `apps/cli`, CLI
   renamed `ros` → `mk`. Verified: typecheck, `mk example`, stills, render; portrait output bit-identical to ros,
   landscape SSIM 0.9997 (encoder noise on the blurred lockup only, no visible difference). Splitting `core` into
   the packages below happens per phase, when each one gets new code.
1b. **Transitions (done).** `spec.transition = {family, color?}` + per-beat override (`"none"` skips). Families:
   camera (default, = ros), fade, flash, color, bar, streak, iris, blinds — overlays in `engines/transitions.tsx`,
   mounted in all three engines under the captions. Lint warns on mixed families and >4 loud covers. Dev check:
   `npx tsx scripts/transition-strips.ts <engine> <beat>`. Not yet: transition SFX, dissolve+scale (needs per-scene
   opacity inside each engine), iris from a chosen element instead of the centre.
2. **Quality gate (done, first pass).** `packages/qa`:
   - `structure.ts` (runs in `mk lint`): no event for > 3.5 s while the VO runs; same widget 3× in a row;
     stock hook → card ×3 → logo skeleton with no punch / camera move / takeover / transition.
   - `motion.ts` (runs after `mk render`): motion energy per second from frame diffs; < 0.25 dead, < 0.5 slow,
     closing hold excluded. Calibrated on the mimo example (content seconds 0.87–13).
   - `mk qa <slug>`: structure + frame-jump + energy on existing renders.
   Still to do: text-level count per beat (needs widget metadata), feeding qa failures back into the
   `mk review` fix loop, a "something survives each cut" check for custom scenes (phase 5).
3. **Style DNA.** `mk dna <video|url>` → palette (fix accent: most saturated small cluster, not mean),
   cut tempo, ground, transition family. Generate a look from DNA. Report distance to reference after render.
4. **Widgets.** scramble, HUD frame, takeover echo + colour flash, before→after number, dot-matrix stat,
   strikethrough correction, leaderboard, notification, prompt composer, integrations grid, text ring.
5. **Custom scenes.** ≤2 per video, agent-written component inside a fixed box/duration, must pass qa.
6. **3D.** `logo3d` (extrude, bevel, glass, bloom, light sweep), `device3d` (phone/laptop with screenshot).
7. **Audio polish.** Beat grid from music, snap cuts to beats, auto SFX on punches, duck under VO.

## Open decisions

- Custom-scene freedom: none / limited (≤2, recommended) / full.
- Scope beyond launch films: explainer + lesson styles (chalkboard, editorial, paper) in phase 4 or later.
- Paid APIs (ElevenLabs etc.) vs free-only path (edge-tts) as default.
