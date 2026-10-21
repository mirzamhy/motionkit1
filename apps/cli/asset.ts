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

// ---- mk asset check: Khronos glTF-Validator (Apache-2.0) plus a real-world size check ----
type GltfNode = { mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] };
type GltfJson = { scene?: number; scenes?: { nodes: number[] }[]; nodes?: GltfNode[]; meshes?: { primitives: { attributes: { POSITION: number } }[] }[]; accessors?: { min?: number[]; max?: number[]; normalized?: boolean; componentType?: number }[] };

// KHR_mesh_quantization stores normalized integers; min/max are in that integer space
const UNNORM: Record<number, number> = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };

/** column-major 4x4 from a node's matrix or TRS */
const nodeMatrix = (n: GltfNode) => {
  if (n.matrix) return n.matrix;
  const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1], [sx, sy, sz] = n.scale ?? [1, 1, 1], [tx, ty, tz] = n.translation ?? [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ];
};
const mul = (a: number[], b: number[]) => Array.from({ length: 16 }, (_, i) => [0, 1, 2, 3].reduce((s, k) => s + a[k * 4 + (i % 4)] * b[Math.floor(i / 4) * 4 + k], 0));

/** world-space size of the default scene from accessor min/max through every node transform (metres if the asset follows glTF) */
export const gltfSize = (j: GltfJson) => {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const visit = (i: number, parent: number[]) => {
    const n = j.nodes![i], m = mul(parent, nodeMatrix(n));
    if (n.mesh != null) for (const p of j.meshes![n.mesh].primitives) {
      const a = j.accessors![p.attributes.POSITION];
      if (!a.min || !a.max) continue;
      const d = a.normalized ? UNNORM[a.componentType ?? 0] ?? 1 : 1;
      const mn = a.min.map((x) => Math.max(x / d, -1)), mx = a.max.map((x) => x / d);
      for (const cx of [mn[0], mx[0]]) for (const cy of [mn[1], mx[1]]) for (const cz of [mn[2], mx[2]]) {
        const v = [0, 1, 2].map((r) => m[r] * cx + m[4 + r] * cy + m[8 + r] * cz + m[12 + r]);
        v.forEach((x, k) => { lo[k] = Math.min(lo[k], x); hi[k] = Math.max(hi[k], x); });
      }
    }
    for (const c of n.children ?? []) visit(c, m);
  };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (const r of j.scenes?.[j.scene ?? 0]?.nodes ?? []) visit(r, I);
  return hi.map((h, k) => h - lo[k]);
};

/** validate a .gltf/.glb; with `expect` (metres, the object's largest real dimension) flag a size more than 2x off */
export const checkModel = async (file: string, { expect }: { expect?: number } = {}) => {
  const { validateBytes } = await import('gltf-validator');
  const bytes = new Uint8Array(readFileSync(file));
  const report = await validateBytes(bytes, {
    uri: file,
    maxIssues: 50,
    externalResourceFunction: (uri: string) => Promise.resolve(new Uint8Array(readFileSync(join(dirname(file), decodeURIComponent(uri))))),
  });
  const json: GltfJson = file.toLowerCase().endsWith('.glb') ? JSON.parse(Buffer.from(bytes.subarray(20, 20 + new DataView(bytes.buffer, bytes.byteOffset).getUint32(12, true))).toString()) : JSON.parse(Buffer.from(bytes).toString());
  const size = gltfSize(json), big = Math.max(...size);
  const { numErrors, numWarnings, numInfos, messages } = report.issues;
  log(`  ${file}`);
  log(`    validator: ${numErrors} errors, ${numWarnings} warnings, ${numInfos} infos · ${report.info?.totalTriangleCount ?? '?'} triangles · ${report.info?.materialCount ?? '?'} materials`);
  for (const m of messages.filter((x: { severity: number }) => x.severity <= 1).slice(0, 6)) log(`    ${m.severity === 0 ? 'ERROR' : 'warn '} ${m.code}: ${m.message}${m.pointer ? ` (${m.pointer})` : ''}`);
  const ratio = expect ? big / expect : 1;
  log(`    size: ${size.map((s) => (s * 100).toFixed(1)).join(' × ')} cm${expect ? ` · expected ≈ ${(expect * 100).toFixed(0)} cm → ${ratio > 2 || ratio < 0.5 ? `OFF by ${ratio.toFixed(2)}x: scale it by ${(1 / ratio).toFixed(2)}` : 'ok'}` : ''}`);
  return { errors: numErrors, warnings: numWarnings, size, scaleFix: expect && (ratio > 2 || ratio < 0.5) ? 1 / ratio : 1 };
};

// ---- registry: what is on disk and where it came from ----
const findMeta = (dir: string, out: string[] = []) => {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) findMeta(p, out);
    else if (e.endsWith('.asset.json')) out.push(p);
  }
  return out;
};

/** every asset.json under projects/<p>/public (all projects when none is given) */
export const listAssets = (project?: string) => {
  const roots = project ? [join(ROOT, 'projects', project, 'public')] : readdirSync(join(ROOT, 'projects')).map((p) => join(ROOT, 'projects', p, 'public'));
  const rows = roots.flatMap((r) => findMeta(r)).map((f) => ({ file: f, ...(JSON.parse(readFileSync(f, 'utf8')) as { id: string; type: string; license: string; source: string; bounds?: number[]; polycount?: number }) }));
  for (const a of rows) log(`  ${a.id.padEnd(36)} ${a.type.padEnd(8)} ${a.license.padEnd(10)} ${a.bounds ? a.bounds.map((b) => (b * 100).toFixed(0)).join('×') + ' cm' : ''.padEnd(0)}  ${a.source}`);
  log(`  ${rows.length} assets with provenance`);
  return rows;
};

/** provenance for a pack fetched by hand (e.g. a Kenney zip): writes <dir>/<name>.asset.json */
export const noteAsset = (dir: string, { license, source, type = 'pack', name }: { license: string; source: string; type?: string; name?: string }) => {
  const id = name ?? dir.split(/[\\/]/).filter((x) => x && x !== 'public').slice(-2).join('/');
  const files = readdirSync(dir).filter((f) => !f.endsWith('.asset.json'));
  const meta = { id, type, license, source, files: files.length, fetched: new Date().toISOString().slice(0, 10), note: 'Recorded by hand with mk asset note; licence as stated by the source.' };
  writeFileSync(join(dir, `${id.split('/').pop()}.asset.json`), JSON.stringify(meta, null, 2));
  log(`  ${id}: ${license}, ${source}`);
};
