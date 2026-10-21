// Assets from Poly Haven (CC0) into a project, with the provenance the asset contract asks for
// (docs/research/asset-contract.md). Pattern studied in MaksPyn/polyhaven-skill (search, files tree, terms);
// written fresh. Poly Haven API terms (checked 21 Oct 2026, github.com/Poly-Haven/Public-API ToS.md): free for any
// use, every call must carry a user agent naming the software; the assets themselves are CC0, no attribution needed.
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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

/** Optimize a glTF/GLB with glTF-Transform (MIT; the library under gltf-slipstream, LightLoad and meshify): dedup,
 *  weld, prune, quantize and meshoptimizer simplify to `ratio` of the triangles. Textures are left as they are:
 *  WebP conversion failed on Windows in testing (sharp: "colourspace: parameter space not set").
 *  Measured on Poly Haven bananas: 50 % looked the same as the original up close, 15 % showed a lumpy silhouette. */
const GLTF_TRANSFORM = ['--yes', '@gltf-transform/cli@4.1.1'];
export const optimizeModel = (input: string, { ratio = 0.5, out }: { ratio?: number; out?: string } = {}) => {
  const dest = out ?? input.replace(/\.(gltf|glb)$/i, `_s${Math.round(ratio * 100)}.glb`);
  const args = ['optimize', input, dest, '--compress', 'quantize', '--texture-compress', 'false', ...(ratio < 1 ? ['--simplify', 'true', '--simplify-ratio', String(ratio), '--simplify-error', ratio < 0.3 ? '0.01' : '0.001'] : ['--simplify', 'false'])];
  // npx is a .cmd on Windows, which needs a shell
  const win = process.platform === 'win32';
  // (cmd.exe treats a line that starts with a quote specially, so only arguments with spaces are quoted)
  if (win) execSync(['npx', ...GLTF_TRANSFORM, ...args].map((x) => (/\s/.test(x) ? `"${x}"` : x)).join(' '), { stdio: ['ignore', 'ignore', 'inherit'] });
  else execFileSync('npx', [...GLTF_TRANSFORM, ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
  const tris = (j: { meshes: { primitives: { indices?: number; attributes: { POSITION: number } }[] }[]; accessors: { count: number }[] }) =>
    Math.round(j.meshes.reduce((s, m) => s + m.primitives.reduce((a, p) => a + j.accessors[p.indices ?? p.attributes.POSITION].count / 3, 0), 0));
  const glbJson = (file: string) => { const b = readFileSync(file); return JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString()); };
  const before = input.toLowerCase().endsWith('.glb') ? glbJson(input) : JSON.parse(readFileSync(input, 'utf8'));
  const after = glbJson(dest);
  log(`  ${tris(before)} → ${tris(after)} triangles, ${(statSync(dest).size / 1048576).toFixed(2)} MB → ${dest}`);
  return dest;
};

// ---- ambientCG (CC0 materials; licence page checked 21 Oct 2026). Endpoint shape from arielshad/3d-asset-server
// (Apache-2.0): v3 `GET /api/v3/assets?q=&type=&include=`, downloads are `ambientcg.com/get?file=<id>_<res>.zip`. ----
const ACG = 'https://ambientcg.com/api/v3/assets';
type AcgDownload = { url: string; size: number };

export const ambientcgSearch = async (query: string, type = 'material') => {
  const r = await fetch(`${ACG}?q=${encodeURIComponent(query)}&type=${type}&limit=12&include=title,tags`, { headers: UA });
  if (!r.ok) throw new Error(`ambientCG search: HTTP ${r.status}`);
  const j = (await r.json()) as { assets: { id: string; title: string; tags?: string[] }[] };
  return j.assets.map((a) => ({ id: a.id, title: a.title, tags: (a.tags ?? []).slice(0, 6) }));
};

/** download one material zip (default 1K-JPG), extract it into projects/<p>/public/ambientcg/<id>, write asset.json */
export const ambientcgFetch = async (id: string, { res = '1K-JPG', project = 'asset-lab' } = {}) => {
  const r = await fetch(`${ACG}?id=${encodeURIComponent(id)}&include=title,tags,downloads`, { headers: UA });
  if (!r.ok) throw new Error(`ambientCG ${id}: HTTP ${r.status}`);
  const a = ((await r.json()) as { assets: { id: string; title: string; tags?: string[]; downloads?: AcgDownload[] }[] }).assets[0];
  if (!a) throw new Error(`ambientCG: no asset ${id}`);
  const dl = (a.downloads ?? []).find((d) => d.url.endsWith(`_${res}.zip`));
  if (!dl) throw new Error(`${id}: no ${res} zip (has ${(a.downloads ?? []).map((d) => d.url.split('_').pop()).join(', ')})`);
  const dir = join(ROOT, 'projects', project, 'public', 'ambientcg', id);
  mkdirSync(dir, { recursive: true });
  const zip = join(dir, `${id}_${res}.zip`);
  if (!existsSync(zip) || statSync(zip).size !== dl.size) {
    const z = await fetch(dl.url, { headers: UA, redirect: 'follow' });
    if (!z.ok) throw new Error(`${id}: HTTP ${z.status}`);
    writeFileSync(zip, Buffer.from(await z.arrayBuffer()));
  }
  if (statSync(zip).size !== dl.size) throw new Error(`${id}: got ${statSync(zip).size} bytes, expected ${dl.size}`);
  // bsdtar reads zip. On Windows call the system one: Git's GNU tar comes first on PATH and reads "C:" as a host
  const sysTar = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe');
  execFileSync(process.platform === 'win32' && existsSync(sysTar) ? sysTar : 'tar', ['-xf', zip, '-C', dir]);
  const maps = readdirSync(dir).filter((f) => /\.(jpg|png)$/i.test(f));
  const meta = { id: `ambientcg/${id}`, type: 'material', name: a.title, source: `https://ambientcg.com/view?id=${id}`, license: 'CC0-1.0', resolution: res, maps, zip: { file: `${id}_${res}.zip`, size: dl.size }, fetched: new Date().toISOString().slice(0, 10), note: 'ambientCG assets are CC0 1.0 (ambientcg.com/license).' };
  writeFileSync(join(dir, `${id}.asset.json`), JSON.stringify(meta, null, 2));
  log(`  ${a.title}: ${maps.length} maps (${maps.map((m) => m.replace(`${id}_${res}_`, '').replace(/\.\w+$/, '')).join(', ')}), ${(dl.size / 1048576).toFixed(1)} MB → ${dir}`);
  return meta;
};
