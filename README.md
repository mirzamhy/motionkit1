# MotionKit

Reference-driven motion graphics. Point it at a video you like, give it a brief and sourced facts, and it
renders a launch film, explainer or kinetic piece that moves like the reference — not like a slide deck.

Three layers:

1. **Reference → Style DNA** (`packages/dna`): palette, cut tempo, ground, transition family, theme.
2. **Generation** (`packages/spec`, `engine`, `widgets`, `looks`, `three`, `audio`): the model writes a spec;
   the engine owns every motion and layout decision. A limited *custom scene* escape hatch covers one-off moments.
3. **Quality gate** (`packages/qa`): schema lint, anti-slideshow rules, motion energy per second, distance to the
   reference DNA, frame-jump scan, review stills.

## Quick start

```bash
npm ci
node bin/mk.mjs example
node bin/mk.mjs render mimo-example
```

Status: phase 1a (port) done. See [docs/plan.md](docs/plan.md). Research behind it: [references/](references/).

## Credits

The engine, widgets and CLI started as a port of
[remotion-opus-skill](https://github.com/direkturcrypto/remotion-opus-skill) (MIT, © 2026 direkturcrypto); see
[LICENSE](LICENSE).
