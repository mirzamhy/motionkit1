# Agent instructions

MotionKit turns a brief into a finished video with Remotion. It works with any coding agent that can run shell
commands **and look at image files**. If you cannot open the JPEGs you render, stop and say so: the method below
depends on looking.

## Pick the mode first

| The user wants… | Mode | Start here |
|---|---|---|
| a story, history, explainer, documentary, lesson, anything with people / places / objects | **Scene mode** | [docs/scenes/WORKFLOW.md](docs/scenes/WORKFLOW.md) |
| a product / model launch promo built from numbers, UI and claims | Spec mode | [prompts/builder.md](prompts/builder.md), `mk run <slug>` |

When in doubt, use scene mode. Spec mode fills fixed layouts from a JSON spec; it is fast and cheap but it looks
like animated slides, and users reject that for narrative videos.

## Scene mode in one paragraph

You draw each shot as layered SVG in a React component (`packages/core/src/scenes/`), compose shots with the
`Film` runner, render single frames with `mk scene stills`, **open the frames and judge them**, fix, and only then
render the video. Two finished films are the quality bar and the pattern to copy:

- `PizzaScene.tsx` — one 14 s scene, three camera set-ups, landscape and portrait.
- `UnairFilm.tsx` + `UnairShotsA/B.tsx` + `UnairScene.tsx` — a 116 s nine-shot film cut to a recorded voice-over.

Read [docs/scenes/CRAFT.md](docs/scenes/CRAFT.md) before drawing anything and
[docs/scenes/KIT.md](docs/scenes/KIT.md) before writing a component that may already exist (`mk kit find <words>`
searches it).

## Rules that are not negotiable

1. **Facts come from sources, not memory.** Fetch them, record source per fact in `projects/<slug>/facts.md`, and
   tell the user where two sources disagree. Never present a guessed date, name or quote as fact.
2. **Draw real things from references, and keep them.** Buildings, boats, statues, uniforms, maps: find or ask for
   photos, write what you see, draw from that, and mark anything without a reference as invented. Things a film needs
   go in the item library: search it first (`mk item find`), research and build what is missing, preview it
   (`mk item preview`), register it. Follow [docs/scenes/ITEMS.md](docs/scenes/ITEMS.md).
3. **Script and storyboard before code**, and get the user's yes on them.
4. **One proof shot first.** Show a still, get a reaction, then build the rest.
5. **Look at every shot's stills before you render video**, and again after every change. Report only what you
   actually saw; a still does not prove motion is right, so say that too.
6. **Compose and measure with the grid, every time you look.** Plan each shot on paper first: where the horizon sits
   (a thirds or golden line), where the subject sits (a thirds or golden intersection), what leads the eye there,
   and what fills the near, middle and far planes. Build depth with a real camera (eye height, focal length,
   things sized by their distance) and people with a skeleton (joints in metres, limbs solved to where hands go),
   not loose shapes. Then check every render with `--grid`, and `--region` on people and small things.
7. Never copy an official logo, seal or a real person's signature. Draw your own emblem; use a generic flourish.
8. Motion rules: no value may jump in one frame (ease over ≥ 5 frames); SVG filters are static (never animated,
   never toggled); every frame must be computable on its own, in any order (no state carried between frames —
   simulations are precomputed and cached, see `UnairCloth.tsx`).
9. Never commit `.env`, `projects/`, `out/`, `node_modules/`, media files, or the user's reference photos.
   Commit locally only; never push or add a remote unless the user asks.

## Commands

```bash
node bin/mk.mjs scene list                       # registered scenes
node bin/mk.mjs scene stills <Id> 120,600,1400   # frames + contact sheet → out/scenes/<Id>/sheet.jpg
node bin/mk.mjs scene stills <Id> 600 --grid [--region x,y,w,h]   # + measuring grid, thirds (green) and golden lines (magenta)
node bin/mk.mjs scene video <Id>                 # the film → out/scenes/<Id>/<Id>.mp4
node bin/mk.mjs vo-cut path/to/voice.mp3         # where the recording pauses (to cut it into passages)
npx tsc --noEmit -p .                            # must be clean before every render
node bin/mk.mjs item find <words>                # the item library (boats, buildings, props) before drawing one
node bin/mk.mjs kit find <words>                 # search the kit (Indonesian or English) before drawing a new part
node bin/mk.mjs gate                             # tsc + unit tests + small stills of every scene → out/gate/index.html
```

Render one job at a time. Two renders at once starve each other and neither finishes.

## Repo map

- `packages/core/src/scenes/` — scene mode: `film.tsx` (runner), `lib.ts` (everything reusable), `manifest.ts` +
  `index.tsx` (registry), the two example films.
- `packages/core/src/{engine,engines,widgets,kinetic,archive,spec}` — spec mode engines and widgets.
- `packages/qa`, `packages/dna` — spec-mode lint, motion energy, style analysis of reference videos.
- `apps/cli` — the `mk` command. `prompts/` — spec-mode model prompts. `references/` — research on 168 reference
  videos (styles, transitions, themes); the videos themselves are never committed.
- `examples/unair-sejarah/` — the script, timings, facts and reference notes behind the UNAIR film.
- `docs/plan.md` — roadmap and the reasoning behind the two modes.

## If you change shared code

Anything under `engine/`, `engines/`, `widgets/`, `scenes/film.tsx` or `scenes/kit.tsx` affects existing videos:
type-check, re-render stills of `UnairScene` and `PizzaScene` (and `mk example` + `mk stills mimo-example` for
spec-mode changes), and compare with the previous sheet before calling it done.
