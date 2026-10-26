# Scene mode: the kit

Import from one place:

```tsx
import { Film, type Shot, Walker, Flag, Foliage, Palm, Cloud, rng, lerp, prog, inOut } from './lib';
```

Everything is drawn in a 1920 × 1080 space (y down), 60 fps. `t` arguments want the **ambient clock** `a`.

## Film runner — `film.tsx`

```tsx
const SHOTS: Shot[] = [
  {
    dur: 600,                                   // frames
    label: 'SURABAYA · 1923',                   // typewritten corner label (optional)
    age: 0.16,                                  // warm "old photo" wash, 0 for today
    warp: [[0, 0], [335, 150], [600, 415]],     // optional: [film frame, beat-clock frame]
    draw: (u, a) => <MyShot u={u} a={a} />,
    caps: [[30, 290, 'First narration line.'], [305, 580, 'Second line.']],
    vo: [{ at: 30, from: 12.61, to: 21.82 }],   // optional: seconds in the recording
  },
];
export const MY_FRAMES = filmFrames(SHOTS);
export const MyFilm: React.FC<{ vo?: string | null }> = ({ vo = null }) => <Film shots={SHOTS} fonts={FONTS} vo={vo} defs={<MyDefs />} />;
```

`Film` handles 24-frame dissolves, captions, label, grade (wash, vignette, grain) and placing each voice passage.
Props: `shots`, `fonts {mono, ui}`, `defs`, `vo`, `captions` (default true), `width`, `height`, `background`.
`words` (from `apps/cli/edge_say.py`: `[word, start s, end s]` in the recording) replaces the shots' `caps` with
word-by-word captions (`wordcaps.tsx`): pages of up to 4 words split evenly at pauses, the spoken word lit in gold.
A shot's `over(u, a, W, H)` draws in screen space above the grade (titles, letterbox), so the portrait window does not
crop it. Title parts in `titles.tsx`: `LowerThird` (name + role), `ChapterCard`, `Letterbox`; styles `'modern' | 'arsip'`.
A shot's `cut` sets how it enters: `'dissolve'` (default, 24 frames), `'ink'` (a spreading blot with satellite drops,
54 frames, from `cuts.tsx`), `'leak'` (40-frame dissolve under a warm light leak). One cut family per film; ink suits
painted/archive films, leak a change of time or mood.
`sfx` plays each shot's sound effects; `bed={{ file, vol, duck? }}` loops a quiet bed under the film, and `duck` (0–1) scales
it while a voice passage plays (0.3 ≈ −10 dB, eased over 15 frames).

Register: `scenes/index.tsx` (`COMPONENTS`) and `scenes/manifest.ts` (`SCENES`; add `project` and `vo` if it has
a voice-over at `projects/<project>/public/<vo>`).

## Maths and timing

| Name | What |
|---|---|
| `prog(t, a, b, ease?)` | 0→1 between frames a and b, clamped. Default ease-out. |
| `inOut`, `outE` | easings to pass to `prog` |
| `pop(t, at, k)` | springy 0→1 overshoot starting at `at` |
| `bump(t, a, b)` | 0→1→0 over [a, b] |
| `typed(text, t, at, cps)` | typewriter substring |
| `lerp(a, b, p)`, `rad(deg)`, `n1(x)` | interpolate, degrees→radians, one-decimal string for SVG |
| `beats([[name, len, gap?], …])` | named beats in order (`scenes/beats.ts`); gap < 0 overlaps the previous beat. `T.p(t, 'serah', from?, to?, ease?)`, `T.span(t, k1, k2)`, `T.a(k)`, `T.b(k)`. Lengthen one beat and every later beat moves. Tests: `npx tsx --test packages/core/src/scenes/beats.test.ts` |
| `<BeatBar at={T.at} t={f} total width />` | debug overlay (`scenes/debug.tsx`): beat lanes, active beat lit, playhead. Pair it with a pure `pose(T, f)` to draw motion paths into a still (see `scripts/market-exchange.tsx`) |
| `rng(seed)` | returns a function giving the same pseudo-random sequence every frame |
| `warped(shot, u)` | apply a shot's warp by hand (the runner does it for you) |

## Nature — `kit.tsx`

| Component | Props | Notes |
|---|---|---|
| `Cloud` | `x y s? fill? opacity?` | drift it: `x={300 + a * 0.08}` |
| `Foliage` | `x y r seed t dark light n?` | a clump of leaf discs; use for trees, shrubs, hedges, foreground framing |
| `Palm` | `x base h t seed s?` | ringed leaning trunk, arched fronds with leaflets |
| `Shrub` | `x y r seed t dark? mid? light? n?` | tropical clump of long blade leaves (pandan, lemongrass, young banana) from one ground point, three tones, contact shadow, sways; use instead of `Foliage` for low plants on sand or by water |

## People — `UnairParts.tsx`, `UnairScene.tsx`

| Component | Props | Notes |
|---|---|---|
| `Walker` | `x y s t ph o move? cheer?` | person seen from behind. `o` is an `Outfit`. `move=0` stands; `cheer` 0→1 raises bent arms and claps |
| `OUTFITS`, `OUTFITS_1954` | | present-day (backpack, hijab) and 1950s (peci, kebaya) outfit sets |
| `CrowdRow` | `y s n seed t cheer?` | heads and shoulders close to the lens |
| `Student` | `x y s t ph hat? book?` | 1920s pupil: white jacket, shorts, black knee socks |

To walk someone toward a door: move `x, y` and shrink `s` with one `prog`, **stagger the starts**, and fade the
last 10 % so they pass through instead of piling up (`NiasShot`).

Rigged characters facing the camera or side-on (blink, typing arms by two-bone IK, head turn) are in
`PizzaScene.tsx` (`Room`), and seated pupils and a seated teacher in `UnairShotsA.tsx` (`Pupil`, `Classroom`).
Copy and adapt; they are not generic yet.

## Flags and cloth

| Component | Props | Notes |
|---|---|---|
| `Flag` | `x y w h bands t ph?` | waving flag; `bands` = colours top to bottom |
| `Cloth`, `clothKnot` (`UnairCloth.tsx`) | `u half breeze?` | simulated veil over a statue-sized ellipsoid; adapt the constants at the top of the file for another object |

## Architecture — `UnairScene.tsx`

| Component | Props | Notes |
|---|---|---|
| `HipRoof` | `x0 x1 eave kink top r0 r1 far?` | two-pitch tiled hip roof with ridge, hips, finials |
| `Vents` | `x y groups gap per?` | small oval vent holes |
| `NiasBuilding` | `f plate?` | a whole colonial building: read it as the pattern for drawing a real building from photos |

Tile pattern `url(#un-tile)`, wall / roof / lawn gradients and the stone, wood and paper textures come from
`Defs` (`UnairScene.tsx`) and `Defs2` (`UnairParts.tsx`); pass both to `Film` via `defs` if you use them.

## One-off pieces worth reading before you write your own

| Need | Look at |
|---|---|
| a room interior with depth, lamp light, a window at night | `Room` in `PizzaScene.tsx` |
| top-down table shot, hands, food with procedural detail | `TopDown`, `Pizza` in `PizzaScene.tsx` |
| a typed document being signed and stamped | `Decree` in `UnairShotsB.tsx` |
| a map from real coordinates, with routes that draw on | `UnairMap.tsx` |
| a stone statue in relief | `UnairArca.tsx` |
| the same doorway through changing years | `GateYears` in `UnairShotsB.tsx` |
| a monument plaza with a ring of flags | `Tugu` in `UnairShotsB.tsx` |
| a browser / forum screen with typing and a click | `ScreenShot` in `PizzaScene.tsx` |

## Styles: whole looks you can reuse

A style is a look (palette, outline rules, camera, bubble) plus its parts library and the weather it can be shot in.

| Style | What it is | Start here |
|---|---|---|
| `stik-polos` | Short reflective reels (9:16, 10–15 s): flat faceless stickmen, thick outlines, cold palette with one warm accent, camera hopping along one street, chained thought bubbles, word-by-word quote. Weather is a parameter (hujan, gerimis, cerah, kabut). 14 saved parts (`mk item find stik`). Films: `StikAndaiOjol`, `StikAndaiRumah`. | `packages/core/src/styles/stik-polos/README.md` |

## Fonts

`FONTS` in `UnairScene.tsx` is a period set: Josefin Sans (signs), Special Elite (typewriter labels), Libre
Baskerville (narration). Choose type for the era and place of your film; load with
`@remotion/google-fonts/<Family>`.

## When you add to the kit

Put general parts in `kit.tsx` (or a new file), export them from `lib.ts`, add a row here. A part belongs in the
kit when a different film could use it unchanged.
