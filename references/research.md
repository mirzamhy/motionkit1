# Style research: 20 viral Opus 5.5 videos (skillry.dev, Oct 2026)

Source: `media.skillry.dev/opus-5-5/<id>/original.mp4`, sampled to 20-frame contact sheets + ffmpeg scene-cut count
(`select='gt(scene,0.3)'`). Videos kept in scratch only, not in the repo.

Per-video data (168 videos: palette hex, cuts, duration, type, theme, transition): [style-catalog.md](catalog.md) / [style-catalog.json](catalog.json).

## Hard numbers

- Hard cuts are rare: 9 of 20 videos have 0 detectable cuts, the rest 1–9. Everything else is a continuous
  transition (push, morph, mask wipe, portal, blur-through). Our flythrough already fits this.
- Length 14–58 s; 30 fps and 60 fps both common; ~25% vertical (720×1280).
- Text per screen: 1–6 words headline + optional one mono sub-line. Never a paragraph.

## Recurring styles (by frequency)

1. **Dark editorial + one hot accent** (dheepanratnam, tankazunori, envoldev, smitjain dark scene, xenit).
   Near-black/warm-brown gradient ground, white type, ONE accent colour for the key word only.
   Serif display (dheepanratnam, xenit) or condensed grotesk (tankazunori).
2. **HUD frame chrome** (humzaakhalid, tankazunori, leowenai, dheepanratnam): tiny mono labels in all four corners
   (`WEEKDAY.CHECK // 01`, date, `BAR 03 · BEAT 2`, timecode), thin progress line at the bottom.
   Cheap, makes every frame read "designed". We have none of this.
3. **Kinetic one-word takeovers** ("SEE." "ACT." "THINKS" "SHIP." "FRIDAY" "Ratios." "Memes.") — huge word,
   period at the end, ghost/outline echo of the word repeated in the background (tankazunori marquee
   "FRIDAY — FRIDAY —", humzaakhalid stacked "SHIP." outlines). → our `takeover` widget; add the echo.
4. **Halftone / dot-raster field** (leowenai full film, humzaakhalid particle torus, argbeknwn particles):
   concentric halftone rings as background that pulse on beat; text sits on top in solid colour.
5. **Real UI, staged in 3D** (envoldev, tetsu, apoorvjain, xenit, saadpastadev, maxhirsch): actual app
   screens/phone mockups tilted slightly, headline above, the cursor/typing actually happens. Screens get a
   soft floor shadow. Headline structure "X. Y." or "Every A. Every B." with the 2nd half in accent.
6. **Typing as a reveal** (dheepanratnam "Ask me an|", tankazunori, ideavim, apoorvjain URL bar, maxhirsch):
   a caret types the first line; the caret often stays as the brand's end mark ("Claude|", "@maxhirsch13|").
7. **Light minimal** (ideavim, saadpastadev, smitjain, tetsu): off-white ground, lots of empty space,
   small mono kicker, single accent. Ends by flipping to black for the logo (ideavim, saadpastadev).
8. **List cycling** (saadpastadev "Buy ▸ Lucky Cement / Meezan Bank / OGDC… ▸ every Pakistani company";
   leowenai harness list): fixed verb, rotating noun with logo, vertical slot-machine roll, then generalise.

## Structural pattern shared by almost all

hook question/pain (typed) → brand reveal → 3–6 capability beats (one word or one short line each, real UI
or a concrete visual) → number punch (counter/odometer) → "works with what you have" list → CTA end card
with URL chip and tiny fine print.

## Round 2: 30 more videos (50 total)

Cut counts vary more here: 12 of 30 have 0 cuts, but character/story pieces cut a lot (justinbuilds 23,
emollick 22, adamdesgns 16, washow 15). Product launches stay continuous; narrative/explainer pieces cut.

New styles seen:
9. **Scramble / decode numbers & words** (1littlecoder "5,7¥7", allodev "$166,X40", techhalla "PFS8130UD"):
   digits/letters cycle random glyphs before settling. Replaces plain count-up. Very common.
10. **Kinetic poster stack** (techhalla, jackfriks, washow): 2–3 line ALL-CAPS wide extended grotesk,
    lines different sizes, one line in neon accent (lime/pink), audio-waveform or HUD line under it.
11. **Brand-colour full-bleed flash** (deedydas "WASTE." on blue, designbyfusun pink "DEVELOPMENT",
    kentcdodds red "EASY."): a whole frame flips to the accent colour for one punch word, then back.
12. **Editorial infographic / data story** (itsahmedharoon Japan heat on paper texture, itsolelehmann
    "Electricity Trap" on black, parkerrex token-bucket): thin rules, mono labels, step charts, icon grids
    filling in, big number + red unit ("49,651 MW"), handwritten-serif headlines on paper.
13. **Circular text rings / orbits** (motiondsgnr "DESIGN·ZOOM·SPIN" rings, kzmucx icons orbiting a word,
    allodev avatars orbiting "every post."). Text on a circle path, rotating slowly.
14. **Glow line / light trail** connecting elements (allodev neon path, envoldev laser sweep).
15. **Line-icon explainer** (washow mastra×ZenRows): white page, single-weight line drawings that draw
    on (stroke-dashoffset) beside a code panel, one sentence caption below. "01 / 06" step counter.
16. **Vertical Japanese / mixed-script editorial** (washow CM): red block + kanji, BPM counter, square
    progress dots ■■■□□□ as beat meter.
17. **Character/mascot** (kikelopez koala, jackfriks cats, nehalmax robot, groundcontrol box) — outside
    our scope (needs illustration), skip.

## Round 3: 30 more (80 total)

~8 of 30 are not launch videos at all (playable Three.js games, 3D scenes, interactive pages screen-recorded)
— skillry tags them "video" anyway. Of the real promos, the patterns from rounds 1–2 hold. New ones:

18. **Strikethrough correction** (jayjohnson "Too busy. Too technical. Too late." → stamped EXPIRED;
    vince-builds "vibe ~~coder~~ → vibe engineer"; henritoivar Lumail "-$89 / -$149 / **-$228**/mo" rolling
    list with the middle one in focus). Line draws across the old word, new word replaces it.
19. **Connector line / journey thread** (ProcesoClaro): one thick accent line snakes down the frame linking
    numbered step cards "01 · DIAGNÓSTICO … 06"; it's the spine of the whole video. Vertical format.
20. **Before → after number pair** (Lysa "6 hours" grey → "10 sec" accent; BridgeMind "69 → 205").
21. **Dot-matrix stat** (Lumail "80% never open": grid of hollow/filled dots; Jay "590+ days" filled-square
    calendar grid; ProcesoClaro 10%→100% dot grid). Counting units instead of a bar.
22. **Warm radial gradient blob** behind type (Lysa orange/red, Muse soft green): soft, big, slow-drifting.
23. **Editorial print layout** (Signalz: magazine page chrome — section label, page no. "p.04", rules,
    vertical Japanese headline, big numerals "400本以上"). Paper ground, one red square accent.
24. **Code tutorial split** (codocular): STEP 1/3 title, code panel typing on top, live result below, line
    highlighted as it's explained.
25. **Countdown as structure** (Boa Vista Farm: "15…0" seconds counter in the HUD drives the whole edit).

Hard-cut counts again split by genre: product promos 0–4, social/hype edits 10–46.

## Transitions (frame-by-frame, 30 fps strips around the 3 biggest scene changes of 22 videos)

Durations are in frames @30fps (double for our 60fps).

| # | Transition | Seen in | Mechanics |
|---|---|---|---|
| T1 | **Iris / circle reveal** | leowenai ×3 | a disc (often an existing element: eye pupil, logo dot) scales from ~5% to past the frame corners in 4–6 f with strong ease-in; inside it is the next scene. Reverse version: next scene's disc grows *out of* a small object. |
| T2 | **Shape morph carries over** | humzaakhalid (circle → triangle logo), leowenai (eyes stay, background swaps) | one object stays on screen and changes shape/scale while everything around it is replaced. No cut is visible because the eye follows the object. |
| T3 | **Light flash / white-out** | humzaakhalid (starburst grows to fill → white → particles), tankazunori (frame washes to light grey 3–4 f, next scene fades up from it) | 2–4 f to near-white, 4–8 f back down into the new scene. Only at section boundaries. |
| T4 | **Blur-dissolve + word-by-word rebuild** | dheepanratnam (headline + panel blur out ~8 f, ~6 f of empty ground, next headline types/fades in word by word over ~20 f) | the "calm" transition: nothing moves, things just defocus and refocus. Empty ground between scenes is a feature. |
| T5 | **Vertical roll / slot-machine** | dheepanratnam (こんにちは rolls up, Merhaba rolls in from below, 3–4 f overlap, clipped to a line box) | same position, content swaps by vertical scroll inside a mask. |
| T6 | **Motion-blur letter fly-in** | techhalla, humzaakhalid "REPEAT." | each letter enters from below/side with directional blur, staggered 2–3 f per letter, settles with no bounce. Exit: whole block smears sideways with blur + RGB split in 3–4 f. |
| T7 | **Scramble decode** | techhalla | between two headlines the text becomes random glyphs for ~8 f, then resolves to the new word. Doubles as the transition. |
| T8 | **Diagonal wipe / slab** | maxhirsch ("Thought leadership" white slab is pushed off by a dark diagonal panel "Actual leadership" over ~8 f) | hard-edged angled panel slides across; both halves readable mid-wipe → used for A vs B. |
| T9 | **Glitch slice out** | maxhirsch (LinkedIn card tears into horizontal slices with RGB offset, collapses to a line, black) | 6–8 f, ends on black, next scene starts from black. Used once, for the "negative" thing. |
| T10 | **Match on background** | maxhirsch (Ratios. → Memes.: label chip stays, background grid of numbers cross-fades to grid of thumbnails, chip squashes 2 f and re-expands with new word) | layout constant, content replaced. |
| T11 | **Element subtraction** | envoldev (grid of 6 cards → filter → 2 cards remain, others fade out in place) | the transition is the product action (filtering). |
| T12 | **Light sweep + 3D tilt exit** | envoldev (laser line sweeps diagonally across the UI panel, then the panel tilts away in perspective and the next one is already behind it) | sweep 8–10 f, tilt-out 6 f. |
| T13 | **Speed-lines burst cut** | henritoivar/vince (2 frames of black radial speed lines between scenes = hard cut "punctuation") | comic-style, 2 f only. |
| T14 | **Particle assemble → logo** | envoldev (noise particles converge into app icon, then glow ring + light rays) | end card only. |

| T15 | **Shape-mask reveal (non-circle)** | allodev (orange hexagon outline grows from a small badge, inside it the next scene; hexagon matches the product's NFT-hex motif) | same as iris but the mask is a brand shape; 6–8 f. Also used *in reverse* to punch into a detail. |
| T16 | **Lens / magnifier wipe** | designbyfusun (small circle appears on a letter of "DEVELOPMENT", grows, inside it the next scene's rotated marquee text) | iris that starts on a specific glyph, 6 f. |
| T17 | **Dot → line → full-frame** | motiondsgnr (orange dot stretches to a horizontal line over 4 f, line thickens to fill the frame in 3 f, new word letters drop in rotated) | the accent colour itself becomes the next background. |
| T18 | **Particles disperse** | motiondsgnr ("CLAUDE" made of particles blows apart into streaks → dark → next scene grows from a dot) | 10–12 f out, 4 f of empty, then entry. |
| T19 | **Cards fall/squash out** | motiondsgnr (3 cards shrink vertically into thin bars and drop below the frame edge, staggered 2 f) | exit only; entry of next is from black. |
| T20 | **Shatter** | 1littlecoder (screen cracks radiate from a hit point 4 f, white burst fills 6 f, shards fly) | narrative climax only. |
| T21 | **Light-streak wipe** | jayjohnson (a thin bright diagonal streak crosses the frame; content on the leading side is gone after it passes; next text types in) | 4–6 f; works on any background; cheap. |
| T22 | **Brand-colour hard cut on the beat** | deedydas (blue "WASTE." → white page in 1 f; next sentence types word by word), techhalla | a true cut, but always on a music hit and always to a *different background colour*, so it reads as intentional. |
| T23 | **Blur zoom-through (camera dolly into an element)** | monokern (pushes into the eye's pupil until it fills the frame, flash, next scene), xenit (phone tilts and the camera passes through it to blank, then next phone rises) | 8–14 f. Basically our flythrough with a target. |

### Transition sweep over the other 57 videos (2 biggest changes each)

New kinds seen:

| # | Transition | Seen in | Mechanics |
|---|---|---|---|
| T24 | **Slanted bar wipe** | falcong-j (purple slanted bar slides across, briefly fills, slides out revealing next; orange bar for the next one) | parallelogram, accent colour, 6–8 f in, 2–3 f hold, 6 f out. Very "editorial YouTube". |
| T25 | **Horizontal-blind / scanline wipe** | ambiguous-ai (next scene revealed through black horizontal strips that thin out), saadpastadev (black bar drops over the card, then next) | 4–6 f, strips staggered top→bottom. |
| T26 | **Slide-push (both move)** | 0xlangeai, codrops, kikelopez (whole screen pushed up/left by next), jackfriks | classic; both scenes move together with the same easing. |
| T27 | **Card-as-camera dolly** | imthatcarlos, devarshukani (camera pulls out of a card into a grid, then pushes into another card) | our flythrough already does this. |
| T28 | **Fade through background (soft)** | timguignard, wustep, explorations-iq, tetsu, colecornelll, 0xlangeai | 6–10 f out to the plain ground, 0–4 f empty, 6–10 f in. Most common transition overall in calm/explainer videos. |
| T29 | **Typewriter rebuild over same layout** | parkerrex, sonali (headline wipes letter-by-letter right→left, new one types in) | text-only, layout stays. |
| T30 | **Cross-dissolve + scale** | xamfonos, washow, pauloalonso (old scales 1→0.96 and fades, new 1.04→1 and fades in, ~10 f overlap) | the "default" premium dissolve. |
| T31 | **Full-bleed colour cut on word** | moritzkremb (yellow → red → white, one word each), voxyz (cream → black → red with vertical kanji), signalz | hard cut every word; colour changes = rhythm. |
| T32 | **Ripple / ring pulse** | demitiyageekzen (ring expands from character; next background starts inside the ring), monokern | iris variant with an outlined ring leading the mask. |
| T33 | **Glow bloom swap** | op7418 (logo glows until frame is white, cools down into next), jackfriks (legendary chest bloom) | = T3 flash, but anchored on an object. |
| T34 | **Ticker / counter as connector** | itsahmedharoon (49,649 → 49,651 MW keeps ticking across the cut) | a number that keeps counting bridges two scenes. |
| T35 | **Match position** | aylmerth, dengent (data-viz rows keep position while values/labels change), ideavim (code panels stay, content swaps) | layout is the anchor; no movement. |

Counts (rough, over all 80): soft fade-through-background ~30%, cross-dissolve+scale ~15%, iris/mask ~12%,
camera dolly/push ~12%, slide-push ~8%, hard colour cut on beat ~8%, wipes (bar/diagonal/blind/streak) ~8%,
flash/bloom ~5%, other (shatter, particles, glitch) <5%.

Rules that hold across all of them:
- One dominant transition family per video (leowenai = iris, dheepanratnam = blur/roll, techhalla = blur
  letters + scramble). They don't mix 10 kinds.
- Transitions are short: 4–10 f @30 (8–20 f @60). The *hold* after is long; text never moves while it is meant
  to be read.
- Something always survives the change (an object, the HUD chrome, the layout grid, the background) — that is
  what makes "0 hard cuts" possible.
- Strong ease-in on the exit, strong ease-out on the entry; no bounce/overshoot except on small chips.

Mapping to our engine: flythrough already does T2-like continuity (camera moves between stations). Missing and
cheap: T1 iris (we have a portal in kinetic), T3 flash, T4 blur-dissolve (do it with opacity + scale, *not* by
toggling CSS blur per frame), T5 roll, T6 letter fly-in, T7 scramble, T8 diagonal wipe.

## Round 4: themes (47 more videos, 127 total, 6-frame strips)

Examples for themes we lack:
- Neon brutalist: marklaunches ("EVERY STEP COUNTS", lime on black), spearwtf (CHAIN.WTF, bold italic caps),
  levon96 (FF Dispatch, "EVERY LOAD." yellow + HUD), techhalla.
- Full-bleed colour block: heymrzak (gofy: peach / cream / yellow / indigo per scene), yarhmm (Arabic RTL, teal /
  black / cream blocks), dustindavis (EnvelopeBudget: navy → blue → purple), raphaelaubryy (coral/cream showreel).
- Halftone / print texture: leowenai, moritzkremb, cboyack (gold-on-black money, halftone dollar bill).
- Editorial print / paper: salmanr2d2 (parchment timeline "4046 BC … 1973"), theviableedge (paper + sticky notes),
  l3d1c (dark serif newsletter), signalz.

New themes found:
11. **Gold-on-black luxury** (cboyack "END THE FED", jasperdeboer Antkeeper): black, warm gold display type,
    vignette, grain, big years/numbers.
12. **Retro sport / arcade** (kenjiphang "SEAL THE DAY": slanted pink-white stripes, italic condensed caps, kanji
    stamp; spearwtf; mappletour neon waves): diagonal stripes, italic, stamps, score HUD.
13. **Vintage collage / surreal** (koldo2k: antique clock, camera, mirror, magnifier framing landscapes):
    cut-out objects as portals between scenes.
14. **Chalkboard / lesson** (linearuncle: dark slate, hand-drawn-looking plots, pastel chalk colours, step titles
    "第一步…"). Fits the remotion-claude "video pembelajaran" use case.
15. **Playful sticker / emoji** (heymrzak gofy: emoji stickers, pastel blocks, rounded bold sans; danilowm Meu
    Pet: mint + map pins).
16. **Glossy 3D spheres / bubbles** (georgejimenez98: teal glossy spheres floating, white disc reveals).
17. **Cosmic / starfield** (viktoroddy motionsites: purple-black space, star particles, glowing numbers).
18. **Paper storybook illustration** (garmdotcom Headroom, samissudo penicillin): flat illustration on paper
    texture — out of scope (needs art) but the paper ground + hand-lettered title is reusable.
19. **Isometric** (tony-tt trading house) — out of scope.
20. **RTL / Arabic & vertical CJK typography** (yarhmm, voxyz, signalz): huge single glyph-word on colour block.

## Round 5: 40 more (167 total)

New themes:
21. **Ink-wash (sumi-e / shuimo)** — amberpromptai: rice-paper ground, ink mountains drawing on, vertical
    calligraphy, red seal stamp, moon. rakhsh-tech: single kanji per frame in brush style on paper.
22. **Pop collage / tape labels** — als-link (Spanish vertical: yellow/blue/magenta blocks, halftone dots,
    sticker labels, burst rays), papaneco-life (JP: pastel blocks, tape strips, tilted label boxes "28%").
23. **Neon timeline** — rpa-dake: navy ground, years in neon outline glow (1996 / 1998 / 2008 / 2015), icon
    per era, progress dots at the bottom.
24. **Flat illustration on paper, step-numbered** — t4k1ra-cg, itakahashikun (shochu process: each step its
    own colour block — amber, teal, red, navy — with serif JP headline + numbered step).
25. **Linework / blueprint explainer** — tardigrade111: architect drawing lines draw on, materials table,
    timer, flow nodes; white + black lines + one orange accent.
26. **Math visual explainer** — miguel07code (Fourier circles drawing a wave, dark, yellow accent),
    linearuncle. Good for "video pembelajaran".
27. **Celebration / confetti** — lnkiai (M3E: "7,469 stars on GitHub" with confetti stars on black).
28. **Pastel pixel gradient** — pisajeski (AgentaOS: blurred pink-blue gradient with pixel squares).

Recurring pattern: **"Claude — Motion Designer" showreel** appears 6+ times (friskyggg, genelab, tequilafunks,
codestackr, seflless, motiondsgnr): HUD corners + timecode, sections TYPE / MOTION / SPACE / SHAPE / DATA,
orange accent, ends on "CLAUDE. Motion Designer". Clearly a shared prompt — the HUD-showreel look is a genre.

Product launches seen (more refs for type 1): aschapmann RedShip (dark + red, Reddit posts as cards),
joao-felixl Kinai (mint light, serif italic + strikethrough "papelada"), fr-sorrentino (smartwatch + Claude Code),
inoue-aix LoreOS (lavender light, JP, service icons orbiting), kingokings Reactive Resume (3D paper page),
djadkison (one memory, every AI tool), thayto-dev AjustaCV, thallisribeiro Licita (navy + orange vertical),
thuggy-juice Rounders (dark + orange, timer UI), priyansh0327 (flights: clouds → tables → Dubai photo → count).

More 3D: aayush4soni (interior walkthrough), chudry223 (lens machine + terrarium), irinatoxi (phone teardown →
molecules), kgonia7 (Earth → solar system → galaxy zoom-out), nybobs (physics sim: 100k bodies, cloth, bricks),
vectorcrossprod (hardware enclosure exploded view with callout labels — great product-3D ref), jarvis11x,
lribes4, truenyl (landscapes/towns), per-simmons (drink brand site with 3D cans).

## Three.js / 3D references (~1/4 of the gallery)

Kept as reference for future 3D work (@remotion/three). What each one shows that 2D can't:

| Video | Scene | Useful technique |
|---|---|---|
| dengent-412996 (Cardilife) | 3D opener inside a Remotion launch film | React Three Fiber + @remotion/three mixed with 2D UI — closest to our stack |
| colecornelll-047465 | glass objects refracting light | transmission/refraction material, studio lighting |
| argbeknwn-466818 | particle field, abstract | GPU particles driven by frame, GLSL |
| arumii-movie-622720 / 249613 | fictional console boot logo, corporate CM logo | 3D logo reveal: extrude, bevel, light sweep, reflection floor |
| humzaakhalid-537875 | particle torus, starburst | particles + bloom, logo finale |
| monokern-613142 | kaleidoscope eye tunnel | shader tunnel, zoom-through transition |
| 0xsolty-735200 (Pocket Planet) | Earth with day/night terminator, clouds | textured sphere, atmosphere glow, slow orbit camera |
| georgejimenez98-431559 | glossy teal spheres floating around UI | physical material, soft shadows behind flat UI |
| stefanostraus-971191 | engine pistons / magnets explainer | mechanical model + UI side panel = 3D product explainer |
| kum1ta-740521 (Workspace) | low-poly office with characters | isometric-ish room as a "world" for a product |
| tony-tt-872147 | isometric trading house | toy-like isometric diorama |
| aijipusi75693-284735 | 3D pigeon festival opening synced to lyrics | 3D + per-character lyric timing |
| maxthelion-649723 | subway interior walk-through | first-person camera path through a built scene |
| mgfeller-779161 / mrblock-096062 | sailing, racing game | water shader, speed lines, motion blur, HUD |
| nathanwilbanks-981110 | campfire | fire particles, warm point light flicker |
| nicolamanzini-156628 | fishbowl | glass + water caustics |
| stephanferraro-224281 | procedural terrain | heightmap terrain, slow orbit |
| brenbuilds-386902, zacxbt-234711 | walkable landscapes (geyser, beach day→night) | time-of-day lighting change as a transition |
| petert-540960 / 635793 / 350098 | Meta VR promo, fictional drink ad (HyperFrames + Three.js + Gemini) | 3D product hero shots for ads |
| llama3dstudio-012980, demitiyageekzen-818523 | cinematic 3D scenes, WebGL shader landscape | full-frame shader worlds, procedural sky/water |
| pwntastickev-664257 | architectural interior tour | camera path through real-ish building |

Takeaways for us: (1) a 3D *opener or logo reveal* inside an otherwise 2D film is the common, cheap use
(dengent, arumii); (2) glass/refraction + bloom is what makes 3D read "premium"; (3) camera paths through a
scene double as transitions (zoom-through, time-of-day change).

## What to add to the engine (ranked by payoff / effort)

1. HUD chrome overlay (corner mono labels + bottom progress) as a look option — every engine, low effort.
2. `takeover`: background echo of the word (outline, low opacity, slow horizontal drift).
3. `rotate` widget: fixed lead word + noun list rolling vertically, ending on a summary line.
4. Caret end-mark on the lockup wordmark.
5. Halftone rings background that breathes on punches (static pattern, animate scale/opacity only).
6. Device mockup widget (phone/browser frame around a screenshot) with soft floor shadow.
7. Scramble/decode reveal for `stat` values and `takeover` words (seeded glyphs, settle left→right).
8. Accent full-bleed flash option on `takeover` (background eases to accent over ≥5 frames, not a step).
9. Text-on-circle ring element (SVG textPath) for orbit/"works with" beats.
10. Square beat-meter ■■■□□ in the HUD chrome.
11. `versus`-style before→after number pair widget (grey old value, accent new value, arrow/strike).
12. Strikethrough correction on headline parts (`strike: true` on a Timed piece + replacement text).
13. Dot-matrix variant for `stat` (units filled on the count instead of a bar).
