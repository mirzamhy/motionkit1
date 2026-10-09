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
3. **Style DNA (done, first pass).** `packages/dna`:
   - `mk dna <slug> <video|url>` (skillry gallery pages resolve to the original mp4) → `projects/<slug>/dna.json`:
     palette, ground, accent pair, hard cuts / 10 s, flashes, colour-swap cuts, a transition guess.
   - Accent is searched in vivid pixels at 240 px (sat > 0.5, bright), so thin neon type survives — verified on
     techhalla (#B7FC01 lime + #F02BC8 pink), Claude/dheepanratnam (#CB7259), AI In Public (#4E51FB vs brand #3D40FE).
   - `lookFromDna`: nearest preset by ground + accent hue, accent/hot overridden; `resolveLook` now recolours glow,
     hot particles and caption highlight when an accent override is present (no override = unchanged).
   - `mk plan` forces the DNA look + transition onto every attempt, lifts the recent-look rule, and gives the
     builder the DNA summary. `mk render` / `mk qa` print palette / accent / tempo / ground vs the reference.
   Still to do: generate a whole look (fonts, card language, ground texture) instead of mapping to a preset;
   transition guess is a heuristic; detect type style (serif / condensed / mono) from the reference.
4a. **Widgets batch A (done).** `scrambleText` + `Strike` atoms; `stat.reveal: "scramble"`; takeover v2
   (`reveal: "scramble"`, `echo`, `flash`); new `versus` widget (old value struck out, new one scrambles in, slow
   push + one sheen during the hold); headline `strike` cue. Flythrough/poster + kinetic. Fixed on the way: kinetic
   dark chips / AI bubbles / badge text were invisible on gradient grounds (`onFg`). Dev: `scripts/demo-4a.ts`,
   `scripts/frames.ts`.
4b. **Batch B (done).** `spec.hud` → `engines/hud.tsx` overlay in all engines (corner marks, mono label, timecode,
   section counter, progress line, 4-step beat meter pulsing on punches; kinetic follows the scene palette). New
   widgets `dots` (dot grid filling to a share + scrambled display number) and `rotate` (lead word + rolling slot +
   summary line). Dev: `scripts/demo-4b.ts`.
4c. **Batch C (done).** `widgets/product.tsx` + kinetic renderers: `leaderboard` (ours climbs to #1),
   `notify` (stacking phone notifications), `prompt` (typed box + result panel), `integrations` (orbit with
   connector lines; kinetic: chip row), `ring` (text on a turning circle around a centre word). Dev: `scripts/demo-4c.ts`.
4. **Widgets (remaining).** scramble, HUD frame, takeover echo + colour flash, before→after number, dot-matrix stat,
   strikethrough correction, leaderboard, notification, prompt composer, integrations grid, text ring.
5. **Custom scenes.** ≤2 per video, agent-written component inside a fixed box/duration, must pass qa.
6. **3D.** `logo3d` (extrude, bevel, glass, bloom, light sweep), `device3d` (phone/laptop with screenshot).
7. **Audio polish.** Beat grid from music, snap cuts to beats, auto SFX on punches, duck under VO.

## Open decisions

- Custom-scene freedom: none / limited (≤2, recommended) / full.
- Scope beyond launch films: explainer + lesson styles (chalkboard, editorial, paper) in phase 4 or later.
- Paid APIs (ElevenLabs etc.) vs free-only path (edge-tts) as default.
