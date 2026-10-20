// mk gate: one command that says whether the scene kit still works. Idea from ali-abassi/remotion-templates'
// acceptance gate (typecheck, one bundle, render smoke of every registry entry, a failures file); written fresh here
// because that repo has no licence. Steps: tsc, unit tests, then two small stills of every registered scene, a
// report and an HTML contact page to look at.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { renderStill, selectComposition } from '@remotion/renderer';
import { SCENES } from '../../packages/core/src/scenes/manifest';
import { ROOT } from './paths';
import { getBundle } from './render';
import { ensureSceneSfx } from './sceneSfx';

const log = (s: string) => console.log(s);
type Result = { id: string; ok: boolean; ms: number; files: string[]; error?: string; size: string };

const testFiles = (dir: string, out: string[] = []) => {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) testFiles(p, out);
    else if (e.endsWith('.test.ts')) out.push(p);
  }
  return out;
};

export const gate = async (opts: { only?: string[]; skipRender?: boolean } = {}) => {
  const outDir = join(ROOT, 'out', 'gate');
  mkdirSync(outDir, { recursive: true });

  log('[gate] typecheck');
  const tsc = spawnSync('npx', ['tsc', '--noEmit', '-p', '.'], { cwd: ROOT, encoding: 'utf8', shell: true });
  if (tsc.status !== 0) {
    log(tsc.stdout.slice(-3000));
    throw new Error('[gate] typecheck failed');
  }

  const tests = [...testFiles(join(ROOT, 'packages')), ...testFiles(join(ROOT, 'apps'))];
  log(`[gate] unit tests (${tests.length} file${tests.length === 1 ? '' : 's'})`);
  if (tests.length) {
    const t = spawnSync('npx', ['tsx', '--test', ...tests.map((f) => `"${f}"`)], { cwd: ROOT, encoding: 'utf8', shell: true });
    if (t.status !== 0) {
      log((t.stdout + t.stderr).slice(-3000));
      throw new Error('[gate] unit tests failed');
    }
  }
  if (opts.skipRender) return log('[gate] render smoke skipped');

  const list = opts.only ? SCENES.filter((s) => opts.only!.includes(s.id)) : SCENES;
  log(`[gate] render smoke: ${list.length} scenes, frames at 25% and 75%, 480 px wide`);
  const results: Result[] = [];
  for (const info of list) {
    const t0 = Date.now();
    const files: string[] = [];
    try {
      const pub = info.project ? join(ROOT, 'projects', info.project, 'public') : null;
      const publicDir = pub && existsSync(pub) ? pub : join(ROOT, 'out', 'scenes');
      mkdirSync(publicDir, { recursive: true });
      if (info.sfx) ensureSceneSfx(publicDir);
      // smoke the picture only: a missing voice-over must not fail the gate
      const inputProps = { ...(info.props ?? {}), ...(info.vo ? { vo: null } : {}) };
      const serveUrl = await getBundle(publicDir);
      const composition = await selectComposition({ serveUrl, id: info.id, inputProps, chromiumOptions: { gl: 'angle' } });
      const scale = Math.min(1, 480 / composition.width);
      for (const q of [0.25, 0.75]) {
        const f = Math.floor((composition.durationInFrames - 1) * q);
        const output = join(outDir, `${info.id}-f${f}.jpg`);
        await renderStill({ composition, serveUrl, frame: f, output, scale, imageFormat: 'jpeg', jpegQuality: 80, inputProps, chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000 });
        files.push(output);
      }
      results.push({ id: info.id, ok: true, ms: Date.now() - t0, files, size: `${info.width}×${info.height}` });
      log(`  ok   ${info.id} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    } catch (e) {
      const error = String(e instanceof Error ? e.message : e).split('\n')[0].slice(0, 300);
      results.push({ id: info.id, ok: false, ms: Date.now() - t0, files, error, size: `${info.width}×${info.height}` });
      log(`  FAIL ${info.id}: ${error}`);
    }
  }

  writeFileSync(join(outDir, 'report.json'), JSON.stringify(results, null, 2));
  const card = (r: Result) => `<figure class="${r.ok ? '' : 'fail'}">${r.files.map((f) => `<img src="${relative(outDir, f).replace(/\\/g, '/')}" loading="lazy">`).join('')}<figcaption><b>${r.id}</b> ${r.size} · ${(r.ms / 1000).toFixed(1)} s${r.error ? `<br><code>${r.error.replace(/</g, '&lt;')}</code>` : ''}</figcaption></figure>`;
  writeFileSync(
    join(outDir, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>mk gate</title><style>body{font:14px system-ui;background:#15130f;color:#eee;margin:24px}figure{display:inline-block;vertical-align:top;margin:0 12px 18px 0;background:#222;padding:8px;border-radius:8px}figure.fail{outline:2px solid #e5484d}img{height:150px;margin-right:4px}code{color:#ff8a80}</style><h1>mk gate: ${results.filter((r) => r.ok).length}/${results.length} scenes render</h1>${results.map(card).join('')}`,
  );
  const failed = results.filter((r) => !r.ok);
  log(`[gate] ${results.length - failed.length}/${results.length} scenes render · report → ${join(outDir, 'index.html')}`);
  if (failed.length) throw new Error(`[gate] ${failed.length} scene(s) failed: ${failed.map((r) => r.id).join(', ')}`);
};
