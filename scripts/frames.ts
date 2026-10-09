// Dev check: render chosen frames of a project (landscape) into out/frames/<slug>/.
// usage: npx tsx scripts/frames.ts <slug> <cue|frame> [offsets…]   e.g. scripts/frames.ts demo m02:baca -6 0 6 12
import path from 'node:path';
import { ROOT, proj } from '../apps/cli/paths';
import { loadSpec, loadWords } from '../apps/cli/pipeline';
import { propsFor, stills } from '../apps/cli/render';
import { buildTimeline } from '../packages/core/src/engine/timeline';

const [slug, at, ...offs] = process.argv.slice(2);
const spec = loadSpec(slug);
const words = loadWords(slug);
const base = /^\d+$/.test(at) ? Number(at) : buildTimeline(spec, words).cue(at);
const frames = (offs.length ? offs : ['0']).map((o) => base + Number(o));
const P = proj(slug);
await stills({ publicDir: P.pub, props: propsFor(spec, words, P.pub), aspect: 'landscape', frames, outDir: path.join(ROOT, 'out/frames', slug), prefix: 'f' });
console.log(`✓ frames ${frames.join(', ')} → out/frames/${slug}`);
