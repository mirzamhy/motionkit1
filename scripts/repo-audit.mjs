// Licence and activity of every GitHub repo in docs/research/repos.md, from the GitHub API (not from memory: the
// method from itsjwill/vanta's ENHANCEMENTS.md). Writes docs/research/repo-audit.md.
// usage: node scripts/repo-audit.mjs        (unauthenticated: 60 requests an hour; set GITHUB_TOKEN for more)
import { readFileSync, writeFileSync } from 'node:fs';

const md = readFileSync('docs/research/repos.md', 'utf8');
const rows = [...md.matchAll(/^- `([^`]+)` \[([^\]]+)\]\((https:\/\/github\.com\/[^)\s]+)\)/gm)].map((m) => ({ status: m[1], name: m[2], url: m[3] }));
const today = new Date();
// licences that allow taking code into an MIT-style project with attribution
const OPEN = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'CC0-1.0', 'Unlicense', 'MPL-2.0', 'Zlib', '0BSD']);
const COPYLEFT = new Set(['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'LGPL-2.1', 'LGPL-3.0']);

const verdict = (spdx) => (!spdx || spdx === 'NOASSERTION' ? 'ide saja (lisensi tidak terdeteksi; cek README/package.json)' : OPEN.has(spdx) ? 'boleh port kode + atribusi' : COPYLEFT.has(spdx) ? 'copyleft: ide saja, tulis ulang' : `cek manual (${spdx})`);
const ago = (iso) => {
  const months = (today - new Date(iso)) / (30.44 * 864e5);
  return months < 1 ? '< 1 bln' : months < 12 ? `${Math.round(months)} bln` : `${(months / 12).toFixed(1)} thn`;
};

const out = [];
for (const r of rows) {
  const path = new URL(r.url).pathname.replace(/^\/|\/$/g, '').split('/').slice(0, 2).join('/');
  if (!path.includes('/')) { out.push({ ...r, path, note: 'organisasi, bukan repo: dicek per repo saat dipakai' }); continue; }
  const res = await fetch(`https://api.github.com/repos/${path}`, { headers: { 'User-Agent': 'motionkit-audit', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) } });
  if (res.status === 403 || res.status === 429) { out.push({ ...r, path, note: 'batas API tercapai, jalankan lagi nanti' }); continue; }
  if (!res.ok) { out.push({ ...r, path, note: `HTTP ${res.status} (repo hilang atau privat?)` }); continue; }
  const j = await res.json();
  out.push({ ...r, path, stars: j.stargazers_count, pushed: j.pushed_at?.slice(0, 10), age: ago(j.pushed_at), archived: j.archived, spdx: j.license?.spdx_id ?? null, lang: j.language });
}

const line = (x) => x.note
  ? `| ${x.name} | ${x.status} | — | — | — | ${x.note} |`
  : `| [${x.name}](${x.url}) | ${x.status} | ${x.stars} | ${x.pushed} (${x.age})${x.archived ? ' **arsip**' : ''} | ${x.spdx ?? '—'} | ${verdict(x.spdx)} |`;
const stale = out.filter((x) => x.age && (x.archived || /thn/.test(x.age) && parseFloat(x.age) >= 1.5));
writeFileSync('docs/research/repo-audit.md', [
  '# Audit repo katalog',
  '',
  `Dari GitHub API, ${today.toISOString().slice(0, 10)}, oleh \`node scripts/repo-audit.mjs\`. Lisensi di sini adalah yang dideteksi GitHub; repo tanpa deteksi bisa saja menyatakan lisensi di README atau package.json (lihat kartu repo). Lisensi dapat berubah: cek ulang sebelum mengambil kode.`,
  '',
  '| Repo | Status | Bintang | Push terakhir | Lisensi | Boleh diambil |',
  '|---|---|---|---|---|---|',
  ...out.map(line),
  '',
  `**Tidak aktif ≥ 1,5 tahun atau diarsipkan:** ${stale.length ? stale.map((x) => x.name).join(', ') : 'tidak ada'}.`,
  '',
].join('\n'));
console.log(`${out.length} entries, ${out.filter((x) => x.note).length} with notes → docs/research/repo-audit.md`);
for (const x of out) console.log(`  ${x.name.padEnd(36)} ${x.note ?? `${x.spdx ?? '—'}  ★${x.stars}  ${x.age}`}`);
