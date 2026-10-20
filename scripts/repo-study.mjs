// Shallow-clone a repo into references/repos/<name> for study and print what matters before touching it:
// license file, install hooks that would run code, size and file types. Never installs or runs anything.
// usage: node scripts/repo-study.mjs <owner/repo> [--ref <branch>]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const [slug, ...rest] = process.argv.slice(2);
if (!slug || !/^[\w.-]+\/[\w.-]+$/.test(slug)) {
  console.error('usage: node scripts/repo-study.mjs <owner/repo> [--ref <branch>]');
  process.exit(1);
}
const refAt = rest.indexOf('--ref');
const ref = refAt >= 0 ? rest[refAt + 1] : null;
const [owner, repo] = slug.split('/');
// Two owners can publish repos with the same name: keep the plain name for the first, owner-name for the next.
const plain = join('references', 'repos', repo);
const remoteOf = (d) => { try { return execFileSync('git', ['-C', d, 'remote', 'get-url', 'origin']).toString().trim(); } catch { return null; } };
const sameRepo = (d) => (remoteOf(d) ?? '').toLowerCase().replace(/\.git$/, '').endsWith(`/${slug.toLowerCase()}`);
const name = !existsSync(plain) || sameRepo(plain) ? repo : `${owner}-${repo}`;
const dir = join('references', 'repos', name);

if (!existsSync(dir)) {
  const args = ['clone', '--depth', '1', '--no-tags', ...(ref ? ['--branch', ref] : []), `https://github.com/${slug}.git`, dir];
  execFileSync('git', args, { stdio: 'inherit' });
}
const commit = execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD']).toString().trim();

const SKIP = new Set(['.git', 'node_modules']);
const walk = (d, out = []) => {
  for (const entry of readdirSync(d)) {
    if (SKIP.has(entry)) continue;
    const p = join(d, entry), s = statSync(p);
    s.isDirectory() ? walk(p, out) : out.push({ p, size: s.size });
  }
  return out;
};
const files = walk(dir);
const byExt = {};
for (const f of files) {
  const e = extname(f.p).toLowerCase() || '(none)';
  byExt[e] = byExt[e] ?? { n: 0, bytes: 0 };
  byExt[e].n++; byExt[e].bytes += f.size;
}
const mb = (b) => (b / 1e6).toFixed(1) + ' MB';

const licenseFile = readdirSync(dir).find((f) => /^(licen[cs]e|copying)/i.test(f));
const licenseHead = licenseFile ? readFileSync(join(dir, licenseFile), 'utf8').split('\n').slice(0, 3).join(' ').trim() : null;

// Every package.json, with lifecycle scripts that npm would run on install
const HOOKS = ['preinstall', 'install', 'postinstall', 'prepare', 'prepublish'];
const pkgs = files.filter((f) => f.p.endsWith('package.json')).map((f) => {
  try {
    const j = JSON.parse(readFileSync(f.p, 'utf8'));
    const hooks = HOOKS.filter((h) => j.scripts?.[h]).map((h) => `${h}: ${j.scripts[h]}`);
    return { path: f.p, name: j.name, license: j.license, deps: Object.keys({ ...j.dependencies, ...j.peerDependencies }), scripts: Object.keys(j.scripts ?? {}), hooks };
  } catch { return { path: f.p, error: 'unparseable' }; }
});

const report = [
  `# ${slug} @ ${commit}`,
  `dir: ${dir}`,
  `license file: ${licenseFile ?? 'NONE — treat as all rights reserved (ideas only)'}`,
  licenseHead ? `license head: ${licenseHead.slice(0, 160)}` : null,
  `files: ${files.length}, total ${mb(files.reduce((a, f) => a + f.size, 0))}`,
  'by type: ' + Object.entries(byExt).sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 12).map(([e, v]) => `${e} ${v.n} (${mb(v.bytes)})`).join(', '),
  '',
  ...pkgs.flatMap((p) => p.error ? [`${p.path}: ${p.error}`] : [
    `${p.path}: ${p.name ?? '(no name)'} license=${p.license ?? '-'}`,
    `  scripts: ${p.scripts.join(', ') || '-'}`,
    `  deps: ${p.deps.slice(0, 25).join(', ') || '-'}${p.deps.length > 25 ? ` …+${p.deps.length - 25}` : ''}`,
    ...(p.hooks.length ? [`  INSTALL HOOKS (would run code): ${p.hooks.join(' | ')}`] : []),
  ]),
  '',
  'If you install, use: npm install --ignore-scripts',
].filter((l) => l !== null).join('\n');

writeFileSync(join(dir, '..', `${name}.study.txt`), report + '\n');
console.log(report);
