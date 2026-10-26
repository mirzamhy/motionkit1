# Jajan Dulu Reveal Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Produce reviewable portrait stills of the tudung saji lift and six-place top reveal for the approved teaser storyboard.

**Architecture:** Keep the proof in an isolated Remotion entry under `scripts/`. Reuse `buatCharm` and `buatTampahDaun`; construct a local wooden counter, woven cover, hand, and camera path. Do not alter registered shared scenes until the user accepts the visual direction.

**Tech Stack:** React, Remotion, React Three Fiber, Three.js, existing MotionKit 3D models.

**Spec:** `projects/jajan-teaser-recreate/storyboard.md`, shots 3 and 4; `projects/jajan-teaser-recreate/refs.md`.

## Global Constraints

- Portrait 1080 x 1920, target 60 fps, shot 3–4 corresponding to 14–25 seconds of the full film.
- Five known charms; the sixth is covered without a recognizable silhouette.
- Absolute-frame easing with no frame-dependent state; render jobs serially.
- Typecheck before rendering; open each selected still, inspect composition grid and hand/product crop.
- Keep `projects/` and `out/` uncommitted.

## Review Focus

- The lid must cover the contents at the beginning and leave frame cleanly before the top reveal.
- The cover and tampah should read as woven material, not a plain dome and disk.
- The five rings and five materials must be distinguishable at portrait size.
- The sixth location must not expose its form.
- No hand, lid, counter, or charm should visibly intersect or float in the judged stills.

---

### Task 1: Build reveal proof

**Files:** Create `scripts/jajan-reveal-proof.tsx`.

**Interfaces:** Remotion composition ID `JajanRevealProof`, 1080 x 1920, 660 frames at 60 fps. Props none.

- [ ] Create deterministic hand, lid lift, camera move, tampah and charm placement from approved shot 3–4.
- [ ] Typecheck with `npx tsc --noEmit -p .` and fix errors.
- [ ] Render stills at start, lift, and top reveal using `npx remotion still`.
- [ ] Add composition and detail grids to the QA images, open each image, adjust scene if needed, and render again.
- [ ] Show the best proof still to the user with concrete limitations; stop for reaction before building other shots.
