// mk storyboard "<brief>": writes a draft projects/<slug>/treatment.md (rules in packages/core/src/library/storyboard.ts).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT } from './paths';
import { ITEMS } from '../../packages/core/src/library';
import { gayaBySlug, type GayaSlug } from '../../packages/core/src/styles';
import { SCENES } from '../../packages/core/src/scenes/manifest';
import { susunStoryboard, type Rasio } from '../../packages/core/src/library/storyboard';

const log = (s: string) => console.log(s);

export type OpsiStoryboard = { format?: string; detik?: string; gaya?: string; slug?: string; timpa?: boolean };

const slugDari = (brief: string) => brief.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim().split(/\s+/).slice(0, 4).join('-') || 'film-baru';

export const storyboard = (brief: string, o: OpsiStoryboard) => {
  const rasio = (o.format ?? '9:16') as Rasio;
  if (rasio !== '9:16' && rasio !== '16:9') throw new Error('--format harus 9:16 atau 16:9');
  const detik = Number(o.detik ?? 15);
  if (!Number.isFinite(detik) || detik < 3 || detik > 600) throw new Error('--detik harus antara 3 dan 600');
  if (o.gaya && !gayaBySlug(o.gaya)) throw new Error(`gaya "${o.gaya}" bukan slug terdaftar (mk gaya list)`);
  const slug = o.slug ?? slugDari(brief);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error('--slug hanya huruf kecil, angka, dan strip');
  const r = susunStoryboard({ brief, rasio, detik, gaya: o.gaya as GayaSlug | undefined }, ITEMS, SCENES);
  const dir = join(ROOT, 'projects', slug);
  const file = join(dir, 'treatment.md');
  if (existsSync(file) && !o.timpa) throw new Error(`${relative(ROOT, file)} sudah ada; pakai --timpa untuk menggantinya`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, r.md);
  log(`  ✓ ${relative(ROOT, file)}
    gaya ${r.gaya} · ritme ${r.ritme} · acuan ${r.acuan ?? '-'} · ${r.shots.length} shot
    benda: ${r.benda.join(', ') || '-'}${r.hilang.length ? `\n    belum ada di ${r.gaya}: ${r.hilang.join(', ')}` : ''}
    lengkapi bagian ISI, lalu minta persetujuan sebelum menggambar`);
};
