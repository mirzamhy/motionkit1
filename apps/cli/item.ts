// mk item: the item library (packages/core/src/library). find searches it, list shows it, preview renders an item's
// sheet to look at. Workflow in docs/scenes/ITEMS.md.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ITEMS, itemById } from '../../packages/core/src/library';
import { findKit } from '../../packages/core/src/scenes/catalog';
import { ROOT } from './paths';

const log = (s: string) => console.log(s);

export const itemList = () => {
  for (const { meta, Item2D, Item3D } of ITEMS) log(`  ${meta.id.padEnd(24)} ${[Item2D && '2D', Item3D && '3D'].filter(Boolean).join('+').padEnd(6)} ${meta.size.join('×')} m  ${meta.era ?? ''}  ${meta.name}`);
  log(`  ${ITEMS.length} items · packages/core/src/library`);
};

export const itemFind = (q: string) => {
  const hits = findKit(q).filter((e) => e.kind === 'item');
  if (!hits.length) return log(`  no item for "${q}": research references, build it, register it (docs/scenes/ITEMS.md)`);
  for (const e of hits) log(`\n  ${e.id}  ${e.file}\n    ${e.role}\n    use: ${e.use}`);
};

/** render the 2D preview sheet (and later the 3D turntable) for an item into out/items/<id>/ */
export const itemPreview = (id: string, frame = 30) => {
  const item = itemById(id);
  if (!item) throw new Error(`no item "${id}" (mk item list)`);
  const dir = join(ROOT, 'out', 'items', id);
  mkdirSync(dir, { recursive: true });
  const props = JSON.stringify({ id }).replace(/"/g, '\\"');
  if (item.Item2D) {
    const out = join(dir, 'preview-2d.jpg');
    execSync(`npx remotion still packages/core/src/library/preview.tsx ItemPreview2D "${out}" --props="${props}" --frame=${frame} --log=error`, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
    log(`  2D → ${out}`);
  }
  if (item.Item3D) {
    const out = join(dir, 'preview-3d.jpg');
    execSync(`npx remotion still packages/core/src/library/preview.tsx ItemPreview3D "${out}" --props="${props}" --frame=0 --gl=angle --log=error`, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
    log(`  3D → ${out}`);
  }
};
