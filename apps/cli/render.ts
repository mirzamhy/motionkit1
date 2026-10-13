// Rendering via @remotion/renderer: bundle once per command, then stills / media for both aspects.
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import type { Spec, Words } from '../../packages/core/src/spec/schema';
import type { SpotProps } from '../../packages/core/src/Spot';
import type { CodeProps } from '../../packages/core/src/code/CodeSpot';
import { ROOT, SRC } from './paths';

export type AspectId = 'landscape' | 'portrait';
export const COMP: Record<AspectId, string> = { landscape: 'Spot', portrait: 'SpotPortrait' };
export const CODE_COMP: Record<AspectId, string> = { landscape: 'CodeSpot', portrait: 'CodeSpotPortrait' };

const bundles = new Map<string, Promise<string>>();
// every bundle is a ~40 MB folder in the temp dir (it copies the public dir): remove ours when dropped and on exit
const made = new Set<string>();
const drop = (dir: string) => {
  made.delete(dir);
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // still in use: the next run leaves it, the OS temp cleaner takes it
  }
};
process.on('exit', () => made.forEach(drop));
/** one bundle per (public dir, scene file). `scene` points @scene at a code-mode scene; otherwise the placeholder. */
export const getBundle = (publicDir: string, scene?: string) => {
  const key = `${publicDir}|${scene ?? ''}`;
  if (!bundles.has(key))
    bundles.set(
      key,
      bundle({
        entryPoint: path.join(SRC, 'index.ts'),
        publicDir,
        onProgress: () => undefined,
        webpackOverride: (config) => ({
          ...config,
          resolve: {
            ...config.resolve,
            modules: [...(config.resolve?.modules ?? ['node_modules']), path.join(ROOT, 'node_modules')],
            alias: { ...((config.resolve?.alias as Record<string, string>) ?? {}), '@scene': scene ?? path.join(SRC, 'code/placeholder.tsx'), '@kit': path.join(SRC, 'kit/index.ts') },
          },
        }),
      }).then((dir) => {
        made.add(dir);
        return dir;
      }),
    );
  return bundles.get(key)!;
};
/** drop a cached bundle (the scene file changed) */
export const forgetBundle = (publicDir: string, scene?: string) => {
  const key = `${publicDir}|${scene ?? ''}`;
  const old = bundles.get(key);
  bundles.delete(key);
  void old?.then(drop, () => undefined);
};

export const propsFor = (spec: Spec, words: Words | null, publicDir: string, qa = false): SpotProps => {
  const voDir = path.join(publicDir, 'vo');
  const hasVo = existsSync(voDir) && spec.vo.lines.every((l) => existsSync(path.join(voDir, `${l.id}.mp3`)));
  const sfxDir = path.join(publicDir, 'sfx');
  const sfx = existsSync(sfxDir) && readdirSync(sfxDir).some((f) => f.endsWith('.wav'));
  return { spec, words, hasVo, hasMusic: existsSync(path.join(publicDir, 'music.mp3')), sfx, qa };
};

export const stills = async (opts: { publicDir: string; props: SpotProps | CodeProps; aspect: AspectId; frames: number[]; outDir: string; prefix: string; scene?: string }) => {
  const serveUrl = await getBundle(opts.publicDir, opts.scene);
  const composition = await selectComposition({ serveUrl, id: (opts.scene ? CODE_COMP : COMP)[opts.aspect], inputProps: opts.props });
  mkdirSync(opts.outDir, { recursive: true });
  const qa: string[] = [];
  const files: string[] = [];
  for (const frame of opts.frames) {
    const f = Math.max(0, Math.min(composition.durationInFrames - 1, Math.round(frame)));
    const output = path.join(opts.outDir, `${opts.prefix}-${String(f).padStart(4, '0')}.jpg`);
    await renderStill({
      serveUrl,
      composition,
      inputProps: opts.props,
      frame: f,
      output,
      imageFormat: 'jpeg',
      jpegQuality: 88,
      onBrowserLog: (log) => {
        if (log.text.includes('[ROS-QA]')) qa.push(log.text.replace(/^.*\[ROS-QA\]\s*/, ''));
      },
    });
    files.push(output);
  }
  return { files, qa: [...new Set(qa)], durationInFrames: composition.durationInFrames };
};

export const media = async (opts: { publicDir: string; props: SpotProps | CodeProps; aspect: AspectId; output: string; concurrency?: number; onProgress?: (p: number) => void; scene?: string }) => {
  const serveUrl = await getBundle(opts.publicDir, opts.scene);
  const composition = await selectComposition({ serveUrl, id: (opts.scene ? CODE_COMP : COMP)[opts.aspect], inputProps: opts.props });
  mkdirSync(path.dirname(opts.output), { recursive: true });
  await renderMedia({
    serveUrl,
    composition,
    inputProps: opts.props,
    codec: 'h264',
    outputLocation: opts.output,
    concurrency: opts.concurrency ?? 4,
    onProgress: ({ progress }) => opts.onProgress?.(progress),
  });
  return { durationInFrames: composition.durationInFrames };
};
