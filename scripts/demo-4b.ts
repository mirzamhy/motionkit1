// Dev check for phase 4b: HUD chrome, rotate and dots on the mimo example. usage: npx tsx scripts/demo-4b.ts [engine]
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PROJECTS, ROOT } from '../apps/cli/paths';
import { Spec } from '../packages/core/src/spec/schema';

const engine = (process.argv[2] ?? 'flythrough') as Spec['engine'];
const slug = `demo-4b-${engine}`;
const ex = path.join(ROOT, 'examples/mimo-v2.6-pro');
const dir = path.join(PROJECTS, slug);
mkdirSync(dir, { recursive: true });
for (const f of ['brief.md', 'facts.md', 'words.json']) cpSync(path.join(ex, f), path.join(dir, f));
const raw = JSON.parse(readFileSync(path.join(ex, 'spec.json'), 'utf8'));
const by = (id: string) => raw.beats.find((b: { id: string }) => b.id === id);
const spec = {
  ...raw,
  slug,
  engine,
  path: engine === 'kinetic' ? 'zoom' : engine === 'poster' ? 'zigzag' : raw.path,
  hud: { label: 'Vikey · MiMo', right: 'launch' },
  beats: [
    by('hero'),
    { id: 'caps', at: 'm02:sejuta', widget: { type: 'rotate', lead: 'Baca', items: [{ text: '1M token', at: 'm02:sejuta' }, { text: 'gambar', at: 'm02:baca' }, { text: 'kode', at: 'm02:jago' }], final: { text: 'semuanya.', at: 'm02:ngoding' } } },
    { id: 'save', at: 'm03:harga', widget: { type: 'dots', label: 'Hemat', total: 100, value: 54, display: '±54%', caption: 'lebih murah dari harga resmi', from: 'm03:pangkas', to: 'm03:persen' } },
    by('agents'),
    by('lockup'),
  ],
};
writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(Spec.parse(spec), null, 1));
console.log(`✓ projects/${slug}`);
