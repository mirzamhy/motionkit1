# MotionKit Scene-Only Independent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inherited launch-video pipeline with a MotionKit-owned scene-mode and asset-library runtime while preserving the user's films, assets, previews, grids, and rendering workflow.

**Architecture:** A small scene-only CLI dispatches into focused modules for rendering, grid inspection, library/catalog operations, audio analysis, and validation. Remotion's root registers only scene compositions. Motion helpers and PizzaScene font loading move into scene-owned modules before the inherited engine/spec/code/widget tree is removed.

**Tech Stack:** TypeScript, React 19, Remotion 4, Three.js, Node.js 22, ffmpeg/ffprobe, node:test.

**Spec:** `docs/superpowers/specs/2026-10-27-scene-only-independent-design.md`

## Global Constraints

- Preserve all user work already present in the dirty worktree; do not reset, clean, overwrite projects, or delete media.
- Keep one render job active at a time and inspect rendered images with the grid.
- Do not require a model API or paid service for scene mode.
- Do not claim clean-room authorship or a legal conclusion; audit against the local port inventory and retain third-party notices until applicable code is gone.
- Remove `ROS_PROJECTS`; retain and test `MK_PROJECTS` and manifest project media lookup.
- Do not commit `.env`, `projects/`, `out/`, `node_modules/`, media, or reference photos.

## Review Focus

- A scene using a manifest `project` must resolve its own public directory, with and without `MK_PROJECTS`.
- `--grid` and `--region` must still emit usable inspection images after sceneAgent removal.
- Motion helpers must behave deterministically at bounds, duplicate keyframes, zero spans, and arbitrary frame order.
- Catalog search results must only return paths and imports that still exist.
- Separate Remotion entries must continue to preview one 2D and one 3D asset after root/config changes.

---

### Task 1: Record the baseline and pin scene contracts

**Files:**
- Create: `packages/core/src/scenes/motion.test.ts`
- Create: `apps/cli/scenePaths.test.ts`
- Modify: `docs/research/scene-only-port-inventory.md`

**Interfaces:**
- Consumes: current scene renderer, manifest, `engine/util` behavior, and project path behavior.
- Produces: baseline stills under ignored `out/migration-baseline/`, behavioral assertions for the replacement, and a complete disposition table.

- [ ] Run `npx tsc --noEmit -p .` and all current `*.test.ts`; record failures as baseline rather than editing unrelated user work.
- [ ] Render representative UnairScene and PizzaScene stills with `--grid`; open the sheets and record the exact frames and observations in the inventory.
- [ ] Add tests that specify the scene-required behavior for bounded progress, keyframes, overshoot, typed text, deterministic seeds, and project public-directory resolution.
- [ ] Run the new tests and confirm they fail because scene-owned modules do not exist yet.

### Task 2: Create scene-owned motion, fonts, paths, and grid modules

**Files:**
- Create: `packages/core/src/scenes/motion.ts`
- Create: `packages/core/src/scenes/fonts.ts`
- Create: `apps/cli/scenePaths.ts`
- Create: `apps/cli/grid.ts`
- Modify: scene/library/script imports currently targeting `engine/util`, `engine/fonts`, `sceneAgent.ts`, or port kit helpers.
- Modify: `packages/core/src/scenes/catalog.ts`

**Interfaces:**
- Consumes: contracts pinned in Task 1.
- Produces: `clamp01`, `outE`, `inOut`, `prog`, `pop`, `kf`, `typed`, `seeded`, `KP`, `loadEditorialFonts`, `resolveScenePublicDir`, and `gridView`.

- [ ] Implement motion primitives from their declared mathematical contracts and explicit edge-case policy, without copying the inherited implementation.
- [ ] Implement direct loading of only the editorial fonts PizzaScene uses, including render delay and failure release.
- [ ] Extract grid/region rendering into a scene-only module and preserve all currently documented guide options.
- [ ] Implement scene/project paths using `MK_PROJECTS` only and migrate every scene-mode caller.
- [ ] Retarget scene, library, experiment, and catalog imports; remove catalog entries whose implementations are being removed.
- [ ] Run focused tests, typecheck, `mk kit find`, and one grid plus one region render.

### Task 3: Replace the Remotion root, bundler, and scene-only CLI

**Files:**
- Modify: `packages/core/src/Root.tsx`
- Modify: `remotion.config.ts`
- Create: `apps/cli/bundle.ts`
- Replace: `apps/cli/index.ts`
- Modify: `apps/cli/scene.ts`, `apps/cli/gate.ts`, `apps/cli/item.ts`, `apps/cli/asset.ts`, and other retained commands to use scene-only paths/bundling.
- Test: `apps/cli/index.test.ts`, `apps/cli/bundle.test.ts`

**Interfaces:**
- Consumes: scene-owned modules from Task 2 and existing command implementations for scene, film, storyboard, asset, item, gaya, beats, gate, and vo-cut.
- Produces: a root that registers only `SceneCompositions`, a renderer bundle with owned cleanup/cache behavior, and a CLI exposing only retained commands.

- [ ] Add tests for help output, unknown-command failure, removed-command rejection, bundle cleanup, publicDir selection, and retained command dispatch.
- [ ] Replace Root and Remotion config so no spec/code/Spot alias is imported or registered.
- [ ] Implement the scene-only bundler and migrate scene/gate rendering.
- [ ] Replace CLI imports/help/dispatch, preserving command argument behavior for retained commands.
- [ ] Run focused tests, `scene list`, `film list`, `gaya list`, `item list`, `kit find`, and `gate --no-render`.

### Task 4: Remove the inherited pipeline and repair the source graph

**Files:**
- Delete after verified-unused: `packages/core/src/{engine,engines,widgets,kinetic,code,spec,archive}` and inherited files under `packages/core/src/kit/`.
- Delete after verified-unused: inherited API/spec modules under `apps/cli/`, spec prompts, MiMo example, spec demo scripts, and deprecated QA/DNA modules coupled to spec.
- Modify: `tsconfig.json`, `package.json`, `.env.example`, `docs/plan.md`, active READMEs, and any imports/configuration revealed by typecheck.
- Preserve: `packages/core/src/kit/{assets.ts,atmosphere.ts,atmosphere-layer.tsx}` under an appropriate scene-owned export surface.

**Interfaces:**
- Consumes: the new root/CLI/runtime from Task 3.
- Produces: a source graph with no active inherited launch-pipeline modules.

- [ ] Use `rg` and TypeScript diagnostics to prove each deletion target has no retained caller before deletion.
- [ ] Delete only explicit verified paths; never use a recursive glob, `git clean`, or workspace-wide removal.
- [ ] Remove dependencies and environment variables that have no remaining importer.
- [ ] Update active docs so scene mode and the asset library are the product; mark historical research honestly.
- [ ] Run typecheck, all tests, and repository searches for old provider/product identifiers and deleted paths.

### Task 5: Verify the asset workflow and visual behavior

**Files:**
- Modify as needed: tests or narrow fixes in retained scene/library/CLI code.
- Update: `docs/research/scene-only-port-inventory.md` with observed results and every baseline disposition.

**Interfaces:**
- Consumes: completed scene-only runtime.
- Produces: evidence that scenes, assets, inspection tools, and encoding still work.

- [ ] Run `mk aset peta`, `mk gate --no-render`, typecheck, and all unit tests.
- [ ] Preview one 2D item and one 3D item; open both images and compare against their expected scale/reference notes.
- [ ] Render the baseline frames for UnairScene and PizzaScene plus one 3D scene, with grids and targeted regions; open all results and compare against baseline.
- [ ] Render a short clip spanning at least one transition; extract and inspect frames around the interpolation boundary.
- [ ] Record any visual difference caused by the new motion/font contracts; fix regressions or mark the migration partial.

### Task 6: Finish provenance and project identity

**Files:**
- Modify: `README.md`, `AGENTS.md`, `skill/motionkit/SKILL.md`, `LICENSE` or a replacement notice only if the completed audit supports that change.
- Modify: `docs/research/scene-only-port-inventory.md`

**Interfaces:**
- Consumes: complete disposition and verification evidence from Tasks 1–5.
- Produces: accurate project-facing instructions and provenance status.

- [ ] Audit every baseline path plus relevant post-port additions; record `deleted`, `replaced`, `retained third-party`, or `unresolved` with evidence.
- [ ] Ensure active source/docs contain no stale repo/provider branding except historical audit records and applicable third-party notices.
- [ ] Update the MotionKit skill and validate it with `quick_validate.py`.
- [ ] Change the project license notice only when no applicable inherited source remains; keep dependency/asset licenses intact.
- [ ] Run `git diff --check`, typecheck, all tests, retained CLI smoke checks, and final searches; report complete only when all required checks pass.
