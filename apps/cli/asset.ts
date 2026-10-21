// Assets from Poly Haven (CC0) into a project, with the provenance the asset contract asks for
// (docs/research/asset-contract.md). Pattern studied in MaksPyn/polyhaven-skill (search, files tree, terms);
// written fresh. Poly Haven API terms (checked 21 Oct 2026, github.com/Poly-Haven/Public-API ToS.md): free for any
// use, every call must carry a user agent naming the software; the assets themselves are CC0, no attribution needed.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT } from './paths';

const API = 'https://api.polyhaven.com';
const UA = { 'User-Agent': 'MotionKit/1.0 (scene kit; asset fetch)' };
const log = (s: string) => console.log(s);

const get = async (path: string) => {
  const r = await fetch(`${API}${path}`, { headers: UA });
  if (!r.ok) throw new Error(`Poly Haven ${path}: HTTP ${r.status}`);
  return r.json();
};

type PhAsset = { name: string; categories: string[]; tags: string[]; type: number; polycount?: number };

/** models whose id, name, tags or categories contain every query word */
export const polyhavenSearch = async (query: string, type = 'models') => {
  const all = (await get(`/assets?type=${type}`)) as Record<string, PhAsset>;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return Object.entries(all)
    .filter(([id, a]) => words.every((w) => `${id} ${a.name} ${a.tags.join(' ')} ${a.categories.join(' ')}`.toLowerCase().includes(w)))
    .map(([id, a]) => ({ id, name: a.name, polycount: a.polycount, categories: a.categories.filter((c) => !c.startsWith('collection')) }));
};

/** download a model's glTF at one resolution with its textures and buffers, check every md5, write <id>.asset.json */
export const polyhavenFetch = async (id: string, { res = '1k', project = 'asset-lab' } = {}) => {
  const info = await get(`/info/${id}`);
  if (info.type !== 2) throw new Error(`${id} is not a model (type ${info.type})`);
  const files = await get(`/files/${id}`);
  const g = files.gltf?.[res]?.gltf;
  if (!g) throw new Error(`${id}: no glTF at ${res} (has ${Object.keys(files.gltf ?? {}).join(', ')})`);
  const dir = join(ROOT, 'projects', project, 'public', 'polyhaven', id);
  const parts: [string, { url: string; size: number; md5: string }][] = [[`${id}_${res}.gltf`, g], ...Object.entries(g.include as Record<string, { url: string; size: number; md5: string }>)];
  let bytes = 0;
  for (const [rel, f] of parts) {
    const out = join(dir, rel);
    mkdirSync(dirname(out), { recursive: true });
    const have = existsSync(out) && createHash('md5').update(readFileSync(out)).digest('hex') === f.md5;
    if (!have) {
      const r = await fetch(f.url, { headers: UA });
      if (!r.ok) throw new Error(`${rel}: HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      const md5 = createHash('md5').update(buf).digest('hex');
      if (md5 !== f.md5) throw new Error(`${rel}: md5 ${md5} ≠ ${f.md5}`);
      writeFileSync(out, buf);
    }
    bytes += f.size;
    log(`  ${have ? 'kept' : 'got '} ${rel} (${(f.size / 1024).toFixed(0)} KB)`);
  }
  // Poly Haven gives dimensions in millimetres; glTF scenes are in metres
  const meta = {
    id: `polyhaven/${id}`,
    type: 'prop',
    name: info.name,
    source: `https://polyhaven.com/a/${id}`,
    license: 'CC0-1.0',
    authors: Object.keys(info.authors ?? {}),
    model: `polyhaven/${id}/${id}_${res}.gltf`,
    resolution: res,
    scale: 1,
    unit: 'metre',
    bounds: info.dimensions ? (info.dimensions as number[]).map((d) => +(d / 1000).toFixed(4)) : undefined,
    polycount: info.polycount,
    files: parts.map(([rel, f]) => ({ path: rel, size: f.size, md5: f.md5 })),
    fetched: new Date().toISOString().slice(0, 10),
    note: 'Fetched through the Poly Haven API (User-Agent MotionKit/1.0). CC0: no attribution required.',
  };
  writeFileSync(join(dir, `${id}.asset.json`), JSON.stringify(meta, null, 2));
  log(`  ${info.name}: ${parts.length} files, ${(bytes / 1048576).toFixed(1)} MB, ${info.polycount ?? '?'} polys, bounds ${meta.bounds?.join(' × ') ?? '?'} m → ${dir}`);
  return meta;
};
