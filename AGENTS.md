# Agent instructions

MotionKit is a CLI (`apps/cli`) over npm workspaces in `packages/`. Read [docs/plan.md](docs/plan.md) first.

- The spec contract lives in `packages/spec`. Keep `prompts/` (widget catalog + limits) and `packages/qa` lint in
  sync with it.
- The model writes specs, not Remotion code — except inside a `custom` scene, which must pass `packages/qa`.
- Engine changes affect every video: type-check, render the example, look at the review sheets, and make sure the
  frame-jump scan is clean before calling it done.
- Never toggle CSS filters on/off per frame, never step a transform in one frame (ease over ≥5 frames), and measure
  text instead of estimating widths.
- One transition family per video; something must survive every scene change (object, HUD, layout or ground).
- `references/` is research data. Reference videos themselves are never committed.
- Never commit `.env`, `projects/`, `out/`, `node_modules/`, or media files.
