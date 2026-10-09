// Dev check for phase 4a widgets: builds projects/<slug> from the mimo example with scramble stat, takeover v2
// (scramble + echo + flash), versus, and a struck-out headline word. usage: npx tsx scripts/demo-4a.ts [engine]
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PROJECTS, ROOT } from '../apps/cli/paths';
import { Spec } from '../packages/core/src/spec/schema';

const engine = (process.argv[2] ?? 'flythrough') as Spec['engine'];
const slug = `demo-4a-${engine}`;
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
  beats: [
    by('hero'),
    { ...by('context'), group: undefined, widget: { ...by('context').widget, reveal: 'scramble' } },
    { id: 'vision', at: 'm02:baca', widget: { type: 'takeover', label: '02 / BACA GAMBAR', word: 'VISION', at: 'm02:baca', sub: 'judul, grafik, tombol', reveal: 'scramble', echo: true, flash: true } },
    { ...by('coding'), group: undefined },
    { id: 'price', at: 'm03:harga', widget: { type: 'versus', label: 'Input / 1M token', before: { value: 'Rp7.830', caption: 'harga resmi' }, after: { value: 'Rp3.600', caption: 'di Vikey' }, at: 'm03:pangkas' } },
    { id: 'agents', at: 'm04', widget: { type: 'headline', lines: [[{ text: 'Lambat.', at: 'm04:pecut', strike: 'm04:agen' }, { text: 'Kencang.', at: 'm04:agen', accent: true }]] } },
    by('lockup'),
  ],
};
writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(Spec.parse(spec), null, 1));
console.log(`✓ projects/${slug}`);
