// Dev check for phase 4c widgets on the mimo example. Two sets because the example VO is short:
//   set a: prompt, leaderboard, notify      set b: integrations, ring
// usage: npx tsx scripts/demo-4c.ts [engine] [a|b]
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PROJECTS, ROOT } from '../apps/cli/paths';
import { Spec } from '../packages/core/src/spec/schema';

const engine = (process.argv[2] ?? 'flythrough') as Spec['engine'];
const set = process.argv[3] ?? 'a';
const slug = `demo-4c${set}-${engine}`;
const ex = path.join(ROOT, 'examples/mimo-v2.6-pro');
const dir = path.join(PROJECTS, slug);
mkdirSync(dir, { recursive: true });
for (const f of ['brief.md', 'facts.md', 'words.json']) cpSync(path.join(ex, f), path.join(dir, f));
const raw = JSON.parse(readFileSync(path.join(ex, 'spec.json'), 'utf8'));
const by = (id: string) => raw.beats.find((b: { id: string }) => b.id === id);
const middle =
  set === 'a'
    ? [
        { id: 'ask', at: 'm02:sejuta', widget: { type: 'prompt', label: 'Coba', text: 'Baca repo ini, perbaiki tes yang gagal', at: 'm02:sejuta', result: { title: '3 tes diperbaiki', lines: ['auth.spec.ts', 'api.spec.ts'] }, resultAt: 'm02:jago' } },
        { id: 'rank', at: 'm03:harga', widget: { type: 'leaderboard', title: 'Harga input / 1M', items: [{ name: 'Model A', score: '$3,00' }, { name: 'Model B', score: '$1,10' }, { name: 'MiMo resmi', score: '$0,435' }, { name: 'Vikey', score: 'Rp3.600' }], ours: 'Vikey', climbAt: 'm03:pangkas' } },
        { id: 'pings', at: 'm04', widget: { type: 'notify', app: 'Vikey', items: [{ title: 'Agen selesai', body: 'refactor modul auth', at: 'm04:pecut' }, { title: 'Semua tes lulus', body: '12 / 12', at: 'm04:agen' }] } },
      ]
    : [
        { id: 'works', at: 'm02:sejuta', widget: { type: 'integrations', title: 'Jalan di agen favoritmu', center: 'Vikey', items: ['hermes', 'opencode', 'claude code', 'codex cli', 'cursor', 'cline'], at: 'm02:sejuta' } },
        { id: 'loop', at: 'm03:harga', widget: { type: 'ring', text: 'baca · koding · hemat', center: '±54%', at: 'm03:pangkas' } },
        by('agents'),
      ];
const spec = { ...raw, slug, engine, path: engine === 'kinetic' ? 'zoom' : engine === 'poster' ? 'zigzag' : raw.path, beats: [by('hero'), ...middle, by('lockup')] };
writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(Spec.parse(spec), null, 1));
console.log(`✓ projects/${slug}`);
