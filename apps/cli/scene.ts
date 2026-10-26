// Scene mode: render hand-built scene compositions (packages/core/src/scenes) and cut a voice-over into passages.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { SCENES } from '../../packages/core/src/scenes/manifest';
import { ROOT } from './paths';
import { forgetBundle, getBundle } from './render';
import { ensureSceneSfx } from './sceneSfx';

const log = (s: string) => console.log(s);

const setupPublic = (id: string) => {
  const project = SCENES.find((s) => s.id === id)?.project ?? (id.startsWith('Gen-') ? id.slice(4) : null);
  const p = project ? join(ROOT, 'projects', project, 'public') : null;
  return p && existsSync(p) ? p : join(ROOT, 'out', 'scenes');
};

const setup = async (id: string) => {
  // films written by `mk agent` are registered as Gen-<slug> and keep their assets in projects/<slug>/public
  const info = SCENES.find((s) => s.id === id) ?? (id.startsWith('Gen-') ? { id, about: '', width: 1920, height: 1080, project: id.slice(4) } : undefined);
  if (!info) throw new Error(`unknown scene "${id}" â€” known: ${SCENES.map((s) => s.id).join(', ')} (add yours to packages/core/src/scenes/manifest.ts)`);
  // assets (voice-over, music) live in the scene's project folder, which is never committed
  const projectPublic = info.project ? join(ROOT, 'projects', info.project, 'public') : null;
  const publicDir = projectPublic && existsSync(projectPublic) ? projectPublic : join(ROOT, 'out', 'scenes');
  mkdirSync(publicDir, { recursive: true });
  const hasVo = !!info.vo && existsSync(join(publicDir, info.vo));
  const withSfx = 'sfx' in info && !!info.sfx;
  if (withSfx) {
    const made = ensureSceneSfx(publicDir);
    if (made) log(`  Â· synthesised ${made} sound effects into ${join(publicDir, 'sfx')}`);
  }
  const inputProps = { ...(info.props ?? {}), ...(info.vo ? { vo: hasVo ? info.vo : null } : {}), ...(withSfx ? { sfx: true } : {}) };
  if (info.vo && !hasVo) log(`  Â· no voice-over at ${join(publicDir, info.vo)} â€” rendering silent`);
  const outDir = join(ROOT, 'out', 'scenes', id);
  mkdirSync(outDir, { recursive: true });
  const serveUrl = await getBundle(publicDir);
  const composition = await selectComposition({ serveUrl, id, inputProps, chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000 });
  return { serveUrl, composition, inputProps, outDir };
};

export const sceneList = () => SCENES.forEach((s) => log(`  ${s.id.padEnd(22)} ${s.width}Ã—${s.height}  ${s.about}`));

/** render single frames; with `sheet`, also tile them into one contact sheet to look at */
export const sceneStills = async (id: string, frames: number[], sheet = true) => {
  forgetBundle(setupPublic(id)); // sources may have changed since the last call in this process
  const { serveUrl, composition, inputProps, outDir } = await setup(id);
  const files: string[] = [];
  for (const f of frames) {
    if (f < 0 || f >= composition.durationInFrames) throw new Error(`frame ${f} is outside 0â€“${composition.durationInFrames - 1}`);
    // MK_PNG=1: lossless PNG for print/design sheets instead of review JPEGs
    const png = process.env.MK_PNG === '1';
    const output = join(outDir, `f${String(f).padStart(5, '0')}.${png ? 'png' : 'jpg'}`);
    await renderStill({ composition, serveUrl, frame: f, output, imageFormat: png ? 'png' : 'jpeg', ...(png ? {} : { jpegQuality: 88 }), inputProps, chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 180_000 });
    files.push(output);
    log(`  ${output}`);
  }
  if (sheet && files.length > 1) {
    const cols = Math.min(files.length, composition.height > composition.width ? 5 : 3);
    const out = join(outDir, 'sheet.jpg');
    const w = composition.height > composition.width ? 432 : 960;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap((x) => ['-i', x]), '-filter_complex', `${files.map((_, i) => `[${i}:v]scale=${w}:-1[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * Math.round((w * composition.height) / composition.width)}`).join('|')}:fill=black`, out]);
    log(`  sheet â†’ ${out}`);
  }
  return files;
};

export const sceneVideo = async (id: string) => {
  const { serveUrl, composition, inputProps, outDir } = await setup(id);
  const m = process.env.MK_FRAMES?.match(/^(\d+)-(\d+)$/);
  const rentang: [number, number] | null = m ? [Number(m[1]), Number(m[2])] : null;
  const output = join(outDir, rentang ? `${id}-${rentang[0]}-${rentang[1]}.mp4` : `${id}.mp4`);
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: output,
    crf: 18,
    inputProps,
    // Adegan 3D (Three.js) butuh waktu menyiapkan tekstur dan bayangan di tiap tab baru; 30 s bawaan terlalu pendek.
    timeoutInMilliseconds: 180_000,
    // Remotion menyarankan renderer ANGLE untuk Three.js; renderer bawaan Chromium tidak andal untuk WebGL.
    chromiumOptions: { gl: 'angle' },
    // MK_CONCURRENCY=2 dan seterusnya untuk membatasi tab paralel saat GPU/CPU berat; kosong = bawaan Remotion.
    ...(process.env.MK_CONCURRENCY ? { concurrency: Number(process.env.MK_CONCURRENCY) } : {}),
    // MK_FRAMES=210-600 merender sebagian saja (proof shot), keluaran diberi akhiran rentang itu.
    ...(rentang ? { frameRange: rentang } : {}),
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== last) log(`  ${(last = pct)}%`);
    },
  });
  log(`  ${(composition.durationInFrames / composition.fps).toFixed(1)} s â†’ ${output}`);
  return output;
};

/** re-render only the sound track and put it under the existing picture: for when nothing but voice or effects changed */
export const sceneAudio = async (id: string) => {
  const { serveUrl, composition, inputProps, outDir } = await setup(id);
  const video = join(outDir, `${id}.mp4`);
  if (!existsSync(video)) throw new Error(`no ${video} yet: run "mk scene video ${id}" first`);
  const wav = join(outDir, `${id}.wav`);
  // Batas waktu dan renderer sama dengan render video: adegan 3D tetap dimuat walau yang diambil hanya suaranya.
  await renderMedia({ composition, serveUrl, codec: 'wav', outputLocation: wav, inputProps, timeoutInMilliseconds: 180_000, chromiumOptions: { gl: 'angle' } });
  const tmp = join(outDir, `${id}.remux.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', tmp]);
  renameSync(tmp, video);
  log(`  new sound â†’ ${video}`);
  return video;
};

/** print where a recording pauses, so it can be split into passages (one per shot) and its sentences timed */
export const voCut = (file: string, minPause = 0.22) => {
  if (!existsSync(file)) throw new Error(`no such file: ${file}`);
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
  const err = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', `silencedetect=noise=-35dB:d=${minPause}`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr ?? '';
  const starts = [...err.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
  const ends = [...err.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  const pauses = starts.map((s, i) => ({ s, e: ends[i] ?? dur })).filter((p) => p.e - p.s >= minPause);
  log(`  ${file}\n  length ${dur.toFixed(2)} s, ${pauses.length} pauses â‰¥ ${minPause} s\n`);
  log('  speech from â†’ to      (len)    pause after');
  let from = pauses[0] && pauses[0].s < 0.05 ? pauses[0].e : 0;
  for (const p of pauses) {
    if (p.s <= from) continue;
    const len = p.e - p.s;
    log(`  ${from.toFixed(2).padStart(7)} â†’ ${p.s.toFixed(2).padStart(7)}  (${(p.s - from).toFixed(2).padStart(5)})   ${len.toFixed(2)}${len >= 0.5 ? '  â† long: likely a paragraph break' : ''}`);
    from = p.e;
  }
  if (from < dur - 0.05) log(`  ${from.toFixed(2).padStart(7)} â†’ ${dur.toFixed(2).padStart(7)}  (${(dur - from).toFixed(2).padStart(5)})`);
  log('\n  Match the rows to your script by reading it against the lengths; put each passage in Shot.vo as { at, from, to }.');
};
