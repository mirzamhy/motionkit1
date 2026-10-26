# Scene mode: the treatment

A first draft can be generated: `node bin/mk.mjs storyboard "<brief>" --format 9:16 --detik 15` fills this template with a look, assets and rhythm chosen from the library and finished films (`mk film list`), leaving ISI where a person must write. Edit the draft; do not treat it as decided.

Copy this into `projects/<slug>/treatment.md` at step 3 of [WORKFLOW.md](WORKFLOW.md), before the script is final.
It holds the brief, the shape of the story and one block per shot, so the storyboard, the code and the sound all
come from one page. The three-layer form (brief → skeleton → per-scene treatment) is an idea from
sellersessions/claude-remotion-flow, adapted to scene mode: every shot names its references, its composition on
the grid, its beats and its sounds.

## Layer 1: brief

| | |
|---|---|
| Goal | What the viewer knows or feels at the end, in one sentence |
| Audience | Who watches, where (phone feed, class, museum screen) |
| One line | The single takeaway |
| Tone | e.g. warm documentary, quiet observational, playful |
| Length and formats | e.g. 60 s, 1920×1080 + 1080×1920 |
| Voice | edge-tts voice and rate, or a recording |
| Sources | `facts.md`, `refs.md` |

## Layer 2: skeleton

Pick one and say why.

- **Beat sheet**: setup, turn, consequence, resolution. For a story through one person.
- **Hook, hold, payoff**: the image that grabs, three or four holds that build, the moment that pays off. For short
  social cuts.
- **Problem, agitate, solve**: for persuasive pieces.
- **Energy map**: music drives the cut; plan the rises and drops first. For pieces without narration.

Then list the shots with their job and rough length:

```
Shot 1 (~6 s)   HOOK     the market before dawn, one stall lighting up
Shot 2 (~9 s)   HOLD 1   the vendor weighs carrots
…
```

## Layer 3: one block per shot

### Shot N: name (start–end s, frames at 60 fps)

| | |
|---|---|
| In frame | Subject and what it does. Near, middle and far planes. |
| Reference | The `refs.md` lines it is drawn from, or "invented" |
| Camera | Eye height, focal length, move (push, pan, static), and how it differs from the last shot |
| Grid | Horizon on (thirds / golden line); subject on (which intersection); what leads the eye |
| Beats | `beats([[…]])` names and lengths, holds included (hit, hold 15–20 frames, build) |
| Narration | The VO line it carries (and, with `words`, nothing else to time) |
| Sound | Bed; SFX with frames, each 2–3 frames before its visual lands; cut on a music beat (`mk beats`) |
| Text on screen | Lower third, chapter card, label (`titles.tsx`), or none |
| Cut in | `dissolve` / `ink` / `leak`, one family for the film |

## Sound envelope

Open on a short whoosh or riser into the first picture and close on a low boom under the last frame, from the
synthesised bank (`apps/cli/sceneSfx.ts`: `whoosh`, `riser`, `boom`) or real recordings. Duck the bed under the
voice (`bed.duck`).

## Gate

The user has read the treatment and said yes. Then write the script and the storyboard from it.
