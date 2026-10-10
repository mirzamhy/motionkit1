// The video spec: the ONLY thing a builder model writes. The engine (src/engine, src/widgets) owns every
// motion/layout decision, so a cheap model can't make it look cheap. Text limits here are deliberately tight —
// they are the first guardrail against overflowing cards.
import { z } from 'zod';

// A cue points at a moment in the voice-over:
//   "m01"            start of line m01
//   "m01:baru"       first spoken word in m01 containing "baru" (case/punctuation-insensitive)
//   "m01:baru#2"     second match
//   "m01:baru+0.3"   0.3 s after that word starts (also -0.2)
//   "end"            end of the last VO line
export const Cue = z
  .string()
  .regex(/^(end|[a-z0-9_]+(:[^#+\-\s]+(#\d+)?)?)([+-]\d+(\.\d+)?)?$/i, 'cue must look like "m01", "m01:word", "m01:word#2", "m01:word+0.3" or "end"');
export type Cue = z.infer<typeof Cue>;

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'hex colour like #E7010A');
const short = (n: number) => z.string().min(1).max(n);

export const LOOK_IDS = ['graphite-studio', 'midnight-glass', 'paper-ink', 'aurora-soft', 'mono-lab', 'ember-noir', 'archive-desk'] as const;
export const ENGINE_IDS = ['flythrough', 'poster', 'kinetic', 'archive'] as const;
export const PATH_IDS = ['dolly', 'serpentine', 'staircase', 'zigzag', 'strip', 'zoom', 'turns', 'stack'] as const;
/** which camera journeys each engine understands */
export const ENGINE_PATHS: Record<(typeof ENGINE_IDS)[number], readonly (typeof PATH_IDS)[number][]> = {
  flythrough: ['dolly', 'serpentine', 'staircase'],
  poster: ['zigzag', 'strip'],
  kinetic: ['zoom', 'turns'],
  archive: ['stack'],
};
/** scene-change overlays. 'camera' = the engine's own camera move only (no overlay). One family per film. */
export const TRANSITION_IDS = ['camera', 'fade', 'flash', 'color', 'bar', 'streak', 'iris', 'blinds'] as const;
export const TRANSITION_COLORS = ['accent', 'brand', 'ground', 'ink', 'white'] as const;
export const ARCHETYPE_IDS = ['launch', 'problem-solution', 'versus', 'demo', 'reasons', 'one-number'] as const;

const Timed = z.object({ text: short(14), at: Cue, accent: z.boolean().optional(), strike: Cue.optional().describe('headline only: a line strikes this word out on that cue (put the replacement word next)') });

export const Hero = z.object({
  type: z.literal('hero'),
  badge: short(14).describe('pill, e.g. "MODEL BARU"'),
  kicker: short(16).optional().describe('provider / category in caps, e.g. "XIAOMI"'),
  kickerAt: Cue.optional(),
  name: z.array(Timed).min(1).max(5).describe('name pieces revealed on cues; total ≤ 12 chars'),
  accentWord: Timed.optional().describe('gradient word after the name, e.g. "Pro"'),
  id: short(30).optional().describe('typed id chip, e.g. "xiaomi/mimo-v2.6-pro"'),
  status: short(32).optional(),
});

export const Stat = z.object({
  type: z.literal('stat'),
  label: short(14),
  chip: short(14).optional(),
  value: z.number().nonnegative(),
  prefix: short(4).optional(),
  suffix: short(6).optional(),
  caption: short(42),
  from: Cue,
  to: Cue,
  chips: z.array(short(12)).max(3).optional().describe('small mono chips that sink into the bar'),
  reveal: z.enum(['count', 'scramble']).default('count').describe('count up, or scramble random digits that settle left → right'),
});

export const Vision = z.object({
  type: z.literal('vision'),
  label: short(14),
  chip: short(16).optional(),
  scene: z.enum(['dashboard', 'document']).default('dashboard'),
  scanFrom: Cue,
  scanTo: Cue,
  detect: z.array(short(10)).min(1).max(3),
  result: short(26).optional(),
});

export const Code = z.object({
  type: z.literal('code'),
  label: short(14),
  chip: short(16).optional(),
  lines: z.array(z.string().max(34)).min(4).max(6),
  from: Cue,
  done: short(24).optional(),
  doneAt: Cue.optional(),
});

export const Price = z.object({
  type: z.literal('price'),
  title: short(26),
  idLabel: short(30).optional(),
  officialLabel: short(14),
  oursLabel: short(12),
  rows: z
    .array(
      z.object({
        label: short(10),
        sub: z.string().max(12).optional(),
        official: short(11),
        officialSub: z.string().max(9).optional(),
        ours: short(9),
      }),
    )
    .min(1)
    .max(3),
  cutAt: Cue,
  badge: z.object({ top: short(8), value: short(5), at: Cue, ring: z.number().min(0).max(1).optional() }).optional(),
  finePrint: z.string().max(220),
});

export const Agents = z.object({
  type: z.literal('agents'),
  headline: z.array(Timed).min(1).max(3),
  items: z.array(z.object({ name: short(12), task: short(26) })).min(2).max(4),
  meta: short(28).optional(),
  goAt: Cue,
  effect: z.enum(['whip', 'bolt', 'none']).default('whip'),
});

export const Lockup = z.object({
  type: z.literal('lockup'),
  wordmark: short(16).describe('"vikey.ai" — text after the last dot is accented'),
  chips: z.array(z.object({ text: short(30), style: z.enum(['dark', 'accent']) })).max(2).default([]),
  cta: short(22).optional(),
  finePrint: z.string().max(220).optional(),
  logoAt: Cue,
  stack: z.boolean().default(false).describe('appear in place over the previous beat instead of flying to a new station'),
});

export const Headline = z.object({
  type: z.literal('headline'),
  lines: z.array(z.array(Timed).min(1).max(4)).min(1).max(2),
  sub: z.string().max(48).optional(),
});

export const Chat = z.object({
  type: z.literal('chat'),
  title: short(20),
  messages: z.array(z.object({ from: z.enum(['user', 'ai']), text: z.string().min(1).max(90), at: Cue })).min(1).max(4),
});

export const Bars = z.object({
  type: z.literal('bars'),
  title: short(30),
  unit: z.string().max(8).optional(),
  items: z.array(z.object({ label: short(16), value: z.number(), display: short(10), highlight: z.boolean().optional() })).min(2).max(5),
  from: Cue,
  finePrint: z.string().max(160).optional(),
});

export const Checklist = z.object({
  type: z.literal('checklist'),
  title: short(24),
  items: z.array(z.object({ text: short(34), at: Cue })).min(2).max(5),
});

export const Takeover = z.object({
  type: z.literal('takeover'),
  label: short(16).optional().describe('mono caption above the word, e.g. "01 / MASALAH"'),
  word: short(10).describe('one oversized word that slams in and holds, e.g. "LAMBAT"'),
  at: Cue,
  sub: z.string().max(40).optional(),
  reveal: z.enum(['slam', 'scramble']).default('slam'),
  echo: z.boolean().default(false).describe('outlined copies of the word drift behind it'),
  flash: z.boolean().default(false).describe('an accent panel swells behind the word on its cue'),
});

export const Versus = z.object({
  type: z.literal('versus'),
  label: short(18).optional().describe('mono caption, e.g. "WAKTU BUILD"'),
  before: z.object({ value: short(10), caption: short(22) }).describe('the old number — shown grey, then struck out'),
  after: z.object({ value: short(10), caption: short(22) }).describe('the new number — scrambles in, in the accent'),
  at: Cue.describe('the word that announces the new number: strike + reveal start here'),
});

export const Dots = z.object({
  type: z.literal('dots'),
  label: short(18),
  total: z.number().int().min(10).max(100).default(100).describe('dots in the grid (100 = percent)'),
  value: z.number().min(0).describe('how many dots fill; ≤ total'),
  display: short(8).describe('the big number shown, e.g. "80%" or "4 / 5"'),
  caption: short(42),
  from: Cue,
  to: Cue,
});

export const Rotate = z.object({
  type: z.literal('rotate'),
  lead: short(14).describe('the fixed word, e.g. "Beli"'),
  items: z.array(z.object({ text: short(16), at: Cue })).min(2).max(6).describe('nouns that roll through the slot, each on the word that says it'),
  final: z.object({ text: short(26), at: Cue }).optional().describe('the generalising line that lands after the list, e.g. "saham apa pun."'),
});

export const Leaderboard = z.object({
  type: z.literal('leaderboard'),
  title: short(24),
  items: z.array(z.object({ name: short(16), score: short(8) })).min(3).max(6).describe('rows in their order BEFORE the climb'),
  ours: short(16).describe('the name (from items) that climbs to #1'),
  climbAt: Cue,
});

export const Notify = z.object({
  type: z.literal('notify'),
  app: short(16).describe('app name shown on each notification'),
  items: z.array(z.object({ title: short(28), body: z.string().max(60).optional(), at: Cue })).min(1).max(4),
});

export const Prompt = z.object({
  type: z.literal('prompt'),
  label: short(20).optional(),
  text: z.string().min(1).max(80).describe('what gets typed into the box'),
  at: Cue,
  result: z.object({ title: short(26), lines: z.array(z.string().max(40)).min(1).max(3) }).optional(),
  resultAt: Cue.optional(),
});

export const Integrations = z.object({
  type: z.literal('integrations'),
  title: short(26).optional(),
  center: short(14).describe('the product, in the middle'),
  items: z.array(short(14)).min(3).max(8).describe('what it connects to'),
  at: Cue,
});

export const Ring = z.object({
  type: z.literal('ring'),
  text: short(40).describe('words set around a circle, repeated to fill it, e.g. "DESIGN · CODE · SHIP"'),
  center: short(12),
  at: Cue,
});

const InkMark = z.object({ kind: z.enum(['circle', 'underline', 'strike']), at: Cue, replace: short(10).optional().describe('strike only: handwritten word that replaces it') });

export const Document = z.object({
  type: z.literal('document'),
  meta: short(44).describe('mono archive line, e.g. "BITCOINTALK · MEI 2010"'),
  title: z.string().min(1).max(70).describe('serif title, typed in'),
  titleAt: Cue,
  titleMark: InkMark.optional(),
  lines: z.array(z.object({ text: z.string().min(1).max(56), at: Cue, mark: InkMark.optional() })).max(4).default([]),
  layout: z.enum(['note', 'forum', 'paper']).default('note').describe('note = typed memo; forum = a post (avatar, author, byline, quoted body); paper = a centred academic paper (abstract + section)'),
  author: short(24).optional().describe('forum: the user name'),
  avatar: z.number().int().min(0).max(11).optional().describe('forum: person variant for the avatar (match the cutout `look`)'),
  byline: short(44).optional().describe('forum: post date; paper: the line under the author'),
  body: z.array(z.string().min(1).max(190)).max(2).default([]).describe('real body copy, written out after the title — a verbatim quote or the abstract; must be in facts'),
});

export const Newspaper = z.object({
  type: z.literal('newspaper'),
  masthead: short(20),
  date: short(32),
  headline: z.string().min(1).max(90).describe('printed line by line from `at`'),
  at: Cue,
  sub: z.string().max(60).optional(),
});

export const CUTOUT_SHAPES = ['person', 'computer', 'pizza', 'pizzabox', 'bank', 'plaque', 'coin', 'phone', 'paper', 'house'] as const;
export const Cutout = z.object({
  type: z.literal('cutout'),
  meta: short(44).optional(),
  figures: z.array(z.object({ shape: z.enum(CUTOUT_SHAPES), label: short(16).optional(), at: Cue, look: z.number().int().min(0).max(11).optional().describe('person variant (skin / hair / clothes); keep the same number for the same person across beats') })).min(1).max(4),
  link: z.object({ from: z.number().int().min(0), to: z.number().int().min(0), at: Cue }).optional().describe('an ink line drawn between two figures'),
  strike: z.object({ index: z.number().int().min(0), at: Cue }).optional().describe('an ink cross over one figure'),
  caption: z.string().max(60).optional(),
  captionAt: Cue.optional(),
});

export const Receipt = z.object({
  type: z.literal('receipt'),
  title: short(24),
  rows: z.array(z.object({ k: short(14), v: short(26) })).min(2).max(5),
  at: Cue,
});

export const Widget = z.discriminatedUnion('type', [Hero, Stat, Vision, Code, Price, Agents, Lockup, Headline, Chat, Bars, Checklist, Takeover, Versus, Dots, Rotate, Leaderboard, Notify, Prompt, Integrations, Ring, Document, Newspaper, Cutout, Receipt]);
export type Widget = z.infer<typeof Widget>;

export const Beat = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/),
  at: Cue.describe('the moment the camera must be settled on this beat'),
  group: z.string().optional().describe('consecutive beats with the same group sit side by side at one station'),
  widget: Widget,
  camera: z
    .object({
      zoom: z.number().min(0.6).max(1.6).optional().describe('>1 = further away'),
      open: z.enum(['closeup']).optional().describe('first beat only: start on a close-up of the badge'),
      revealAt: Cue.optional().describe('closeup: when to pull back to the full card'),
      moves: z
        .array(z.object({ at: Cue, zoom: z.number().min(0.8).max(1.1).optional().describe('multiplier on the beat framing: 0.94 = 6% closer'), dx: z.number().min(-300).max(300).optional(), dy: z.number().min(-300).max(300).optional() }))
        .max(3)
        .optional()
        .describe('push-ins on key words (e.g. toward a price badge); 14 frames after the cue'),
    })
    .optional(),
  punches: z.array(Cue).max(4).optional(),
  transition: z.enum([...TRANSITION_IDS, 'none']).optional().describe("override the film's transition into this beat; 'none' = plain camera move"),
  date: short(20).optional().describe('archive engine: the date label for this sheet (scrambles when it changes)'),
  stamp: z.object({ text: short(14), at: Cue, tone: z.enum(['accent', 'red']).default('accent') }).optional().describe('an ink stamp that lands on this beat'),
});
export type Beat = z.infer<typeof Beat>;

export const VoLine = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  text: z.string().min(1).max(90).describe('what is SPOKEN, spelled for TTS (numbers as words, "Mimo" not "MiMo")'),
  tts: z.string().max(140).optional().describe('text sent to TTS incl. audio tags like [excited]; defaults to text'),
  caption: z.string().min(1).max(70).describe('what is SHOWN, with proper spelling/digits'),
});

export const Spec = z.object({
  version: z.literal(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().max(80),
  language: z.string().default('id'),
  fps: z.literal(60).default(60),
  holdSec: z.number().min(0.5).max(4).default(2.2),
  brand: z.object({ name: short(24), url: short(40), mark: z.enum(['vikey', 'monogram']).default('monogram'), color: Hex.optional() }),
  engine: z.enum(ENGINE_IDS).default('flythrough').describe('visual language: 3D card fly-through, 2D editorial poster, or full-bleed kinetic type'),
  archetype: z.enum(ARCHETYPE_IDS).default('launch'),
  look: z.object({ preset: z.enum(LOOK_IDS), accent: z.tuple([Hex, Hex]).optional(), hot: Hex.optional() }),
  path: z.enum(PATH_IDS).default('dolly'),
  hud: z
    .object({ label: short(24).optional().describe('top-left mono label; defaults to the brand name'), right: short(16).optional().describe('bottom-right tag next to the beat meter') })
    .optional()
    .describe('showreel frame chrome: corner marks, timecode, section counter, progress line, beat meter'),
  transition: z
    .object({ family: z.enum(TRANSITION_IDS).default('camera'), color: z.enum(TRANSITION_COLORS).optional() })
    .default({ family: 'camera' })
    .describe('one transition family for the whole film, drawn over every scene change'),
  vo: z.object({
    voiceId: z.string().optional(),
    tempo: z.number().min(0.9).max(1.25).default(1.1),
    lines: z.array(VoLine).min(1).max(30),
  }),
  beats: z.array(Beat).min(2).max(40),
  facts: z.array(z.object({ text: z.string(), source: z.string() })).default([]),
});
export type Spec = z.infer<typeof Spec>;

// words.json written by `ros vo` (ElevenLabs STT). Without it the engine estimates timings from the text.
export const Words = z.object({
  dur: z.record(z.number()),
  words: z.record(z.array(z.tuple([z.string(), z.number(), z.number()]))),
  text: z.record(z.string()).optional().describe('the spoken text each line was recorded from (stale-check)'),
});
export type Words = z.infer<typeof Words>;
