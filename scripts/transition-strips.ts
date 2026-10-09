// Dev check: render the frames around one scene change for every transition family, so a change to
// engines/transitions.tsx can be eyeballed. usage: npx tsx scripts/transition-strips.ts [engine] [beatIndex]
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../apps/cli/paths';
import { propsFor, stills } from '../apps/cli/render';
import { buildTimeline } from '../packages/core/src/engine/timeline';
import { Spec, TRANSITION_IDS, Words } from '../packages/core/src/spec/schema';

const engine = (process.argv[2] ?? 'flythrough') as Spec['engine'];
const beatIx = Number(process.argv[3] ?? 4);
const ex = path.join(ROOT, 'examples/mimo-v2.6-pro');
const raw = JSON.parse(readFileSync(path.join(ex, 'spec.json'), 'utf8'));
const words = Words.parse(JSON.parse(readFileSync(path.join(ex, 'words.json'), 'utf8')));
const out = path.join(ROOT, 'out/transitions', engine);
mkdirSync(out, { recursive: true });

for (const family of TRANSITION_IDS) {
  const spec = Spec.parse({ ...raw, engine, path: engine === 'kinetic' ? 'zoom' : engine === 'poster' ? 'zigzag' : raw.path, transition: { family } });
  const tl = buildTimeline(spec, words);
  const peak = tl.cue(spec.beats[beatIx].at) + 2 - 12;
  const frames = Array.from({ length: 9 }, (_, k) => peak - 16 + k * 4);
  await stills({ publicDir: path.join(out, '_pub'), props: propsFor(spec, words, path.join(out, '_pub')), aspect: 'landscape', frames, outDir: out, prefix: family });
  console.log(`✓ ${family}: frames ${frames[0]}…${frames[frames.length - 1]} (peak ${peak})`);
}
