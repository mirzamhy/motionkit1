// docs/aset/PETA.md: the generated map of the library (benda × gaya, per-asset details, which films use what) and the
// static checks `mk gate` runs on it. Pure functions; apps/cli/aset.ts reads the files.
import { GAYA } from '../styles';
import { masalahMeta } from './naming';
import { matriks } from './matriks';
import type { LibraryItem } from './types';

export type Berkas = { path: string; text: string };

const ASET_TAG = /<Aset(?:3D)?\b[^>]*?\bid=["']([^"']+)["']/g;
const BY_ID = /itemById\(\s*['"]([^'"]+)['"]\s*\)/g;

export const idDipakai = (files: Berkas[]) => {
  const out: { id: string; path: string }[] = [];
  for (const f of files) for (const re of [ASET_TAG, BY_ID]) for (const m of f.text.matchAll(re)) out.push({ id: m[1], path: f.path });
  return out;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const label = (path: string, sceneIds: string[]) => {
  const dir = path.includes('/') ? path.split('/')[0] : '';
  return sceneIds.find((s) => dir && norm(s) === norm(dir)) ?? path.replace(/\.tsx?$/, '');
};
const imports = (text: string, name: string) => new RegExp(`import[^;]*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`).test(text);

export const pemakai = (items: LibraryItem[], files: Berkas[], sceneIds: string[]) => {
  const res = new Map<string, string[]>();
  const add = (id: string, l: string) => res.set(id, [...new Set([...(res.get(id) ?? []), l])].sort());
  for (const u of idDipakai(files)) add(u.id, label(u.path, sceneIds));
  for (const { meta } of items) for (const f of files) if (meta.komponen?.some((n) => imports(f.text, n))) add(meta.id, label(f.path, sceneIds));
  return res;
};

export const petaMd = (items: LibraryItem[], files: Berkas[], sceneIds: string[]) => {
  const sorted = [...items].sort((a, b) => a.meta.id.localeCompare(b.meta.id));
  const m = matriks(sorted);
  const use = pemakai(sorted, files, sceneIds);
  const rows = [...m.keys()].sort().map((b) => `| ${b} | ${GAYA.map((g) => (m.get(b)![g.slug] ? `✔ \`${m.get(b)![g.slug]}\`` : '✗')).join(' | ')} |`);
  const per = sorted.map(({ meta, Item2D, Item3D }) => `### ${meta.id}\n- ${[Item2D && '2D', Item3D && '3D'].filter(Boolean).join('+')} · ${meta.size.join(' × ')} m · varian: ${meta.variants?.join(', ') || '-'}\n- dipakai: ${use.get(meta.id)?.join(', ') || '-'}\n- acuan: \`${meta.refs}\``);
  const gaya = GAYA.map((g) => `- **${g.slug}** ${g.nama} (${g.dimensi}): ${g.contoh.join(', ') || 'belum ada film contoh'}`);
  return `# Peta aset\n\n<!-- Dibuat oleh \`node bin/mk.mjs aset peta\`. Jangan disunting; \`mk gate\` gagal bila berbeda. -->\n\nCari dulu: \`mk aset find <benda>\`. Buat yang belum ada: \`mk aset baru <benda> <gaya>\`.\n\n## Matriks benda × gaya\n\n| benda | ${GAYA.map((g) => g.slug).join(' | ')} |\n|---|${GAYA.map(() => '---').join('|')}|\n${rows.join('\n')}\n\n## Aset\n\n${per.join('\n\n')}\n\n## Gaya\n\n${gaya.join('\n')}\n`;
};

export const periksaPustaka = (o: { items: LibraryItem[]; files: Berkas[]; sceneIds: string[]; refsAda: (p: string) => boolean; petaRepo: string }) => {
  const out: string[] = [];
  for (const { meta } of o.items) {
    out.push(...masalahMeta(meta));
    if (!o.refsAda(meta.refs)) out.push(`${meta.id}: refs.md tidak ada (${meta.refs})`);
  }
  const ids = new Set(o.items.flatMap((i) => [i.meta.id, ...(i.meta.aliases ?? [])]));
  for (const u of idDipakai(o.files)) if (!ids.has(u.id)) out.push(`${u.path}: memakai id "${u.id}" yang tidak ada di pustaka (mk aset baru <benda> <gaya>)`);
  if (petaMd(o.items, o.files, o.sceneIds) !== o.petaRepo) out.push('docs/aset/PETA.md usang: jalankan `mk aset peta` (node bin/mk.mjs aset peta)');
  return out;
};
