# Template: what-if simulation (`whatif-sim`)

Portrait (1080×1920, 30 fps) science "what if…" shorts in the style of simulif.world: a calm low-poly 3D world,
an elegant serif HUD that counts down to an impossible event, one fact per chapter, a stamp that lands the point,
and an ending that loops back to the first frame.

Example film: `scenes/whatif-gravity/` (composition `WhatIfGravity`, 106 s, 15 scenes). Its `BREAKDOWN.md` is the
frame-by-frame study of the reference this style was measured from.

## Style DNA

| | |
|---|---|
| Type | One serif family: EB Garamond. Labels uppercase, tracking 0.3em, ~20 px. Big numbers 70–96 px with tabular numerals. Captions italic ~48 px, centred, mid-frame (not at the bottom). |
| Colour | White `#F4F1EA` for HUD and captions. Red `#E5452E` for the running countdown, RESULT stamps and the key word in titles. Gold `#E2B04A` for "nothing happened" stamps and highlights. Navy `#11223A` for dips. |
| HUD | Top-left column at (72, 332): header (label / big number / sub-label), stats stacked under it. A stat fades + slides in over 8 frames and fades out over 8. Never jump a number: count it. |
| Header state machine | The countdown is the spine. Typical phases: `X IN · REAL TIME` (white) → `X BACK IN · SLOWED 25×` (red) → `PAUSED · THE MYTH` → `SINCE X CAME BACK · TIME-LAPSE N×` (white clock h:mm:ss) → `X WAS OFF FOR` (frozen). |
| Stamp | Bordered box, small label over a bold word, −3°. Slam in 5 frames: scale 1.6 → 1.3 → 1.15 → 1.05 → 1.0, opacity 0.3 → 1. Hold ~1 s, fade 8 frames. Gold = "nothing", red = "result". When it lands, the newest stat fades out. |
| Captions | Crossfade 7 frames, no slide. ≤ 2 lines. |
| Chapters | 8–12 s each: one fact, one counting number, one stamp. Separate chapters with a dip: fade to navy (or black when changing worlds) ~18 frames, hold 4–6, fade in 8–12. |
| Event moment | One-frame flash (`Flash`) that decays over ~10 frames, and the HUD switches colour on the same frame. |
| 3D look | Low-poly, flat shading, box people and voxel animals, instanced swaying grass, beige window-grid blocks with towers lost in fog. CSS overcast sky behind a transparent canvas; fog colour = horizon colour. Calm cameras, no shake, no motion blur. Slow motion = scale the world clock, not the frame rate. |
| Diagrams | When a fact needs a mechanism (cross-section, orbit, ruler), switch to flat SVG on dark space with sparse stars, uppercase spaced labels, white arrows, red for "you" and for the key line, gold for the answer. |
| Ending | Ranked recap list (row 1 = YOU, gold rule), then a comment-bait CTA ("Did you think you'd *float*?" + two small lines), then glide the camera back to the opening shot and fade the title in so the last frame loops into frame 0. |

## Parts

```ts
import { C, SERIF, Sky, Vignette, HudFrame, HudHeader, Stat, Ms2, fmtTimer, fmtClock,
         Captions, Title, Stamp, Flash, Dips, Leaderboard, Cta,
         Grass, City, Trees, Ground, Fountain, Character, Dog, Hand, makeEarthTextures, makeMoonTexture, rng } from '../../templates/whatif-sim';
```

- `style.ts` tokens, `hud.tsx` HUD pieces, `overlays.tsx` captions/title/stamp/flash/vignette/dips, `recap.tsx`
  leaderboard + CTA, `sky.tsx` overcast backdrop.
- `three/` the park kit (grass with a sway shader, city, trees, ground + plinth, fountain), actors (`Character` with
  T-pose `armLift` and shirt colour, `Dog` with run cycle / `stretch` mid-air, first-person `Hand` glued to the
  camera) and procedural Earth/Moon textures (no image files).

## Making a new video in this style

1. Study the reference (or write the script) as a frame table like `whatif-gravity/BREAKDOWN.md`.
2. Copy `scenes/whatif-gravity/` to `scenes/whatif-<topic>/`. Keep the structure:
   - `timeline.ts`: every frame number (`F`), dips, and the functions that drive numbers (countdown, curves).
   - `captions.ts`: the caption list.
   - `Hud.tsx`: which header shows when, and the stats.
   - `World.tsx`: 3D shots and cameras; extra 2D/space scenes as their own components.
   - The film component: layers in this order — world, diagrams, recap, flash, title, captions, CTA, HUD, stamps, dips.
3. Register it in `scenes/index.tsx` as its own `<Composition fps={30}>` (scene compositions default to 60 fps) and
   add a line to `manifest.ts`.
4. Check with `mk scene stills <Id> <frames>`, render with `mk scene video <Id>`.

Facts on screen still need sources (`projects/<slug>/facts.md`), as everywhere in MotionKit. The gravity film's numbers
were copied from the reference video, not checked.

## Gotchas

- `ThreeCanvas` never runs `useFrame`; mutate cameras/uniforms during render from `useCurrentFrame()`.
- A planet sphere in an orthographic canvas pokes toward the camera by its radius: put anything in front of it at
  `z > radius`.
- Everything is computed from the frame number: the recap shifts its clock by `F.end` so the last frame equals frame 0.
