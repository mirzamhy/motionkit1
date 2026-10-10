# Example: "Kain Kuning Biru" — the founding of Universitas Airlangga

The working papers behind `packages/core/src/scenes/UnairFilm.tsx`. Read them next to the code to see how a brief
became a film. The reference photos and the voice recording are not in the repo.

- [refs.md](refs.md) — what each reference photo shows; the drawings were made from these notes.
- [script.md](script.md) — narration, shot list with timings, and how the picture was cut to the voice.
- [facts.md](facts.md) — every claim with its source, and where sources disagree.

Render it:

```bash
node bin/mk.mjs scene stills UnairScene 520,2360,3130,4200,5200,5830,6620
node bin/mk.mjs scene video UnairScene
```

With a voice-over at `projects/unair-sejarah/public/vo.mp3` the film plays it; without one it renders silent with
captions.
