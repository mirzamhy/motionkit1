# Scene mode: the workflow

This is the procedure that produced the two example films. Follow the order. Each step has a gate; do not pass a
gate by assumption.

## 0. Set up

```bash
mkdir -p projects/<slug>/public projects/<slug>/refs
```

`projects/` is never committed. Everything about one video lives there: `facts.md`, `refs.md`, `refs/` (photos),
`script.md`, `public/` (voice-over, music).

## 1. Facts

Fetch them (web search / fetch). For each fact write one line in `projects/<slug>/facts.md` with its source.

- Prefer the subject's own site and primary documents; use an encyclopedia to cross-check.
- When two sources disagree (a date, a list), keep both, pick one for the film, and **tell the user**.
- Quotes must be verbatim from a source you fetched. If you could not verify one, do not put it on screen.

Gate: every number, date, name and quote in the script traces to a line in `facts.md`.

## 2. References

For every real thing that will be drawn (building, statue, uniform, vehicle, map, document), get a picture.

1. Search for images; **open them and look**. Wikimedia Commons and museum collections are good for history.
2. If you cannot find one, ask the user. People who know the place usually have a photo within a minute.
3. In `projects/<slug>/refs.md`, write what is *visible*: proportions, roof shape, number of windows, lettering,
   colours, what stands next to what. This note, not your memory, is what you draw from.
4. List what has no reference. Those parts are invented, and the user must be told which.

See `examples/unair-sejarah/refs.md` for the level of detail that works.

Gate: `refs.md` covers every real object in the storyboard, or names it as invented.

## 3. Script

Write the narration as short sentences, one idea each. Aim at 2.2–2.5 spoken words per second.

- Open on a concrete image, not on a date. Carry one object or motif through the film and pay it off at the end
  (the pizza box; the yellow-and-blue cloth and the water of the jar).
- Offer the user two or three treatments (through one person / documentary / pure motion) before writing in full.
  Write the chosen one as a full treatment from [TREATMENT.md](TREATMENT.md): brief, skeleton, one block per shot.
- Put the script in `projects/<slug>/script.md`.

Gate: the user has read the script and said yes.

## 4. Storyboard

One row per shot: time, what is in frame, what moves, the narration it carries, which reference it is drawn from.

Start from a draft: `node bin/mk.mjs storyboard "<brief>" --format 9:16 --detik 15` writes `projects/<slug>/treatment.md` with a look, library assets per shot, rhythm and camera borrowed from the closest finished film (`mk film list`), and ISI where a person must fill in. Edit it; it is a draft, not a decision.

Check the board against these before showing it:

- Every shot has a subject doing something, not a title over a background.
- Camera position changes between consecutive shots (wide → inside → close → top-down).
- Something recurs across the cut (a building, a figure, a colour).
- No shot is only text. Text supports a picture.

Gate: the user has seen the board and said yes.

## 5. One proof shot

Pick the shot with the best reference. Build it alone, render two or three stills, **open them**, fix what is
wrong, then show the user one still. Ask for a reaction to the drawing style before building the other shots.

## 6. Build the shots

- One component per shot: `(props: { u: number; a?: number; … })`. `u` is the beat clock, `a` the ambient clock
  (see [CRAFT.md](CRAFT.md#two-clocks)).
- Compose them in a `Shot[]` and hand it to `<Film>` (`packages/core/src/scenes/film.tsx`). Copy the shape of
  `UnairFilm.tsx`.
- Register the composition: add it to `COMPONENTS` in `scenes/index.tsx` and to `SCENES` in `scenes/manifest.ts`.
- Import shared parts from `scenes/lib.ts`. Read [KIT.md](KIT.md) first; do not redraw a walker or a flag.

## 7. Look, fix, repeat

```bash
npx tsc --noEmit -p .
node bin/mk.mjs scene stills <Id> <one or two frames per shot, plus the middle of every action>
```

Open `out/scenes/<Id>/sheet.jpg`, and open single frames at full size when something looks off. Go through the
checklist in [CRAFT.md](CRAFT.md#checklist-for-every-sheet). For an action (a fall, a door, a signature), render
four to six frames across it, not one.

Tell the user what you saw and what you could not judge. Stills cannot show tempo, rhythm or smoothness.

## 8. Render and hand over

```bash
node bin/mk.mjs scene video <Id>
```

One render at a time. After it finishes, pull a few frames out of the mp4 and look at those too, then send the
file with a list of what is still weak. Then record the film for the next storyboard: add an entry to `packages/core/src/scenes/catatan.ts` (look, format, camera, rhythm, seconds, one lesson). `mk gate` warns about films without one.

The user's notes come back as specifics ("people pile up at the door",
"the pen is not on the line"); fix each, re-check its stills, render again.

## 9. Voice-over

Works with any voice: the user's own recording, any TTS, or none (the captions carry the story).

1. Give the user the script as one block of plain text, numbers spelled out, one paragraph per shot.
2. Put the recording at `projects/<slug>/public/vo.mp3` and set `project` and `vo` in `manifest.ts`.
3. `node bin/mk.mjs vo-cut projects/<slug>/public/vo.mp3` lists the pauses. Long pauses are paragraph breaks.
   Read the script against the segment lengths to find where each sentence starts.
4. For each shot set `dur` = passage length + 0.5 s before + about 1 s after, put the passage in `vo`, move the
   captions to the sentence times, and add a `warp` so each drawn event lands on its word.
5. Render stills at the cue frames and check the event is happening there. You cannot hear the result; say so.

## 10. Portrait

Same scenes, different framing: one subject per shot, about 1.7× closer, captions larger and higher. Pass a
`portrait` prop and adjust camera and layout per shot (see `PizzaScene.tsx`). Re-check every shot's stills; things
fall out of frame.

## What it costs

A shot is 150–300 lines. The UNAIR film is about 2,500 lines for 116 s and took many look-fix rounds. Reusing
`lib.ts` is what keeps the next film cheaper; when you draw something general (a vehicle, an animal, a room),
put it where the next film can import it and add it to [KIT.md](KIT.md).
