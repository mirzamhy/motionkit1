// mk film list | show <id>: the registered films with what is known about each (manifest + CATATAN + assets read from the code).
import { ITEMS } from '../../packages/core/src/library';
import { pemakai } from '../../packages/core/src/library/peta';
import { SCENES } from '../../packages/core/src/scenes/manifest';
import { CATATAN, catatanFilm } from '../../packages/core/src/scenes/catatan';
import { sceneFiles } from './aset';

const log = (s: string) => console.log(s);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** asset ids whose users include this film (a user label is a scene id, or the path of the file that uses it) */
export const asetFilm = (id: string, use: Map<string, string[]>) =>
  [...use].filter(([, labels]) => labels.some((l) => norm(l) === norm(id) || norm(l.split('/').pop() ?? '') === norm(id))).map(([a]) => a).sort();

const use = () => pemakai(ITEMS, sceneFiles(), SCENES.map((s) => s.id));

export const filmList = () => {
  const u = use();
  log(`  ${'id'.padEnd(24)} ${'ukuran'.padEnd(10)} ${'detik'.padStart(5)} ${'gaya'.padEnd(10)} ${'ritme'.padEnd(17)} aset`);
  for (const s of SCENES) {
    const c = catatanFilm(s.id);
    log(`  ${s.id.padEnd(24)} ${`${s.width}×${s.height}`.padEnd(10)} ${String(c?.detik ?? '-').padStart(5)} ${(c?.gaya ?? '-').padEnd(10)} ${(c?.ritme ?? 'belum dicatat').padEnd(17)} ${asetFilm(s.id, u).join(', ') || '-'}`);
  }
  log(`\n  ${SCENES.filter((s) => catatanFilm(s.id)).length} dari ${SCENES.length} film tercatat (packages/core/src/scenes/catatan.ts)`);
};

export const filmShow = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`film "${id}" tidak ada di manifest.ts (mk film list)`);
  const c = catatanFilm(id);
  log(`  ${s.id}  ${s.width}×${s.height}\n  ${s.about}`);
  if (!c) return log('  belum dicatat: tambah entri di packages/core/src/scenes/catatan.ts');
  log(`  gaya: ${c.gaya}   format: ${c.format}   ritme: ${c.ritme}   ${c.detik} detik\n  kamera: ${c.kamera.join(', ')}\n  aset: ${asetFilm(id, use()).join(', ') || '-'}\n  pelajaran: ${c.pelajaran ?? '-'}`);
};
