# Stik Polos

Flat, faceless grey stickmen with thick dark outlines, a cold muted palette with one warm accent, and a camera that
hops along one wide street. Made for short reflective reels (9:16, 10–15 s). The look is the style; weather, parts
and story are separate, so each can be swapped.

| Layer | What it is | Where |
|---|---|---|
| **Style** | palette, outline rules, camera, thought bubble, quote, sound | `styles/stik-polos/kit.tsx`, `style.ts` |
| **Weather** (`cuaca`) | `hujan`, `gerimis`, `cerah`, `kabut`: a film parameter | `styles/stik-polos/cuaca.tsx` |
| **Library** (`pustaka`) | people, vehicles, buildings, props, saved as items | `library/stik-polos/` (`mk item find stik`) |
| **Story format** | *Rantai Andai*: a chain of characters, each imagining the next one's life | `scenes/stik-polos/` |

Finished films (copy one to start):

| Scene id | Chain |
|---|---|
| `StikAndaiOjol` (+ `…Gerimis`) | ojol → car driver → couple in a poncho → man at a coffee stall → hospital patient, who dreams of the ojol |
| `StikAndaiRumah` (+ `…Cerah`, `…Kabut`) | kos → KPR house → empty mansion → rumah petak, where the family wants nothing and the window glows |

```bash
node bin/mk.mjs item find stik            # every saved part
node bin/mk.mjs item preview ojol-stik    # look at one: variants beside a 1.65 m person
node bin/mk.mjs scene stills StikAndaiRumahCerah 80,300,500,770 --grid
node bin/mk.mjs scene video StikAndaiRumah
```

## The route: from a new idea to a saved part to a film

1. **Search first**: `mk item find stik <word>`. If a part is close, add a variant to it instead of drawing a second one.
2. **Draw what is missing** in `library/stik-polos/set-*.tsx` (or a new `set-<name>.tsx`), as a component that draws at
   fixed world coordinates, taking `frame` (30-fps units). Follow the drawing rules below.
3. **Save it**: add one `part({...})` entry in `library/stik-polos/index.tsx` with its bbox, the ground anchor, tags in
   both languages and variants. It then appears in `mk item find`, `mk item preview` and `mk kit find`.
4. **Preview and look**: `mk item preview <id>`. Open the sheet; fix proportions, outline, variants.
5. **Write the film**: copy `StikAndaiRumah.tsx`, pick parts, set the camera keys, bubbles, labels and quote, then
   register it in `scenes/manifest.ts` and `scenes/index.tsx`. Weather variants are one more registry line with
   `props: { cuaca: 'cerah' }`.
6. **Stills on every hold and every camera move**, look at them, then `scene video`.

A part is saved when it is in `ITEMS_STIK_POLOS`; the style is saved when it is in `STIK_POLOS` (`style.ts`).

## The library (`mk item find stik`)

| Group | Items |
|---|---|
| orang | `orang-stik` (berdiri, berjalan, duduk, menunduk, tertawa), `ojol-stik`, `pasangan-poncho-stik`, `penjual-kopi-stik` |
| kendaraan | `motor-ojol-stik`, `mobil-stik` |
| bangunan | `rumah-sakit-stik`, `warung-kopi-stik`, `kos-stik`, `rumah-kpr-stik`, `rumah-mewah-stik`, `rumah-petak-stik` |
| properti | `lampu-jalan-stik`, `lampu-lalu-lintas-stik` |

Use a part in a film in two ways: import the drawing (`import { Car } from '../../library/stik-polos/set-jalan'`)
when it sits at its original world position, or go through the library
(`itemById('mobil-stik')!.Item2D`: `x, y` where it meets the ground, `s` px per metre, `t` frame, `variant`, `flip`)
when you place it somewhere new. 1 m = 150 px.

## Timing grammar (f30 frames; the registry renders at 60 fps via `useStikFrame`)

| Beat | Length |
|---|---|
| establish a character before its bubble | 25 |
| bubble pop (`popAt`) | 5 |
| bubble hold | 40–45 |
| bubble fade (`fadeAt`), just before the camera moves | 5 |
| camera move to the next character | 10–16, ease in-out |
| label fade-in after the camera lands | 5 |
| last character: warm highlight ramps | 6–12 |
| hold on the last character | 30–40 |
| pull back to the whole street | 13–16, scale ≈ 0.4–0.55 |
| quote: one word every 6, 4-frame fade, 6 px rise | — |
| hold the finished quote | ≥ 30 |

## Drawing rules

- Outline `C.out` (#060A13), 4 units on everything, 2.5–3 on small parts. Flat fills; gradients only on window glass and
  warm interiors.
- People: grey round head (r 22–27, **no face**), limbs with `Limb` (outline under fill), torso width 14–17. Mood is pose:
  head down, hands on the head, leaning back. `ColdLines` mark cold or tired.
- Muted cold palette. Exactly one warm accent per film (the yellow bubble or a lit window); nothing earlier may be that warm.
- Labels: one word in caps, wide tracking, 60% opacity (`OJOL`, `CICILAN`, `KPR`, `SENDIRI`).
- Wet road (rain, drizzle): the street flipped about `GROUND`/`CURB`, 13–14% opacity, `softBlur`. Dry road (cerah, kabut): 5%.
- Quote: Plus Jakarta Sans 800, white, one phrase in `C.orange`, quoted with ‘ ’ like `‘andai’-nya`.

## Weather

A film takes `cuaca` and draws `<CuacaBelakang/>` (stars, moon), `<CuacaDepan/>` (rain, fog), `<Genangan/>` (ripples,
wet road only) and plays `CUACA[cuaca].suara`. Add a weather in `cuaca.tsx`: one entry in `CUACA`, one branch in each layer.
The look does not change; the mood does.

## Sound

`Soundtrack` plays the scene SFX bank (`apps/cli/sceneSfx.ts` → `projects/stik-polos/public/sfx/`): the weather loop,
`room` bed, `pop` on each bubble, `whoosh` ~16 frames before each camera move, `chime` on the warm payoff, `drip` for leaks.
Put a real recording with the same name in that folder to replace one.

## Motion rules this style keeps

Every value eases over ≥ 5 frames (bubble opacity starts at 0, the traffic light cross-fades, ripples and splashes follow a
sine). `softBlur` is static. Rain, stars, ripples and the city are seeded, so any frame renders alone.
