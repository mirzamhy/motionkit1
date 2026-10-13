// `mk agent <slug>`: let ANY chat-completions model build a scene-mode film by itself. The model gets the repo's own
// instructions (AGENTS.md + docs/scenes), the project's papers and reference photos, and a handful of tools:
// read and list files, write files in its own folder, type-check, render frames and LOOK at them, finish.
// Its work lands in packages/core/src/scenes/gen/<slug>/ and is registered automatically as "Gen-<slug>".
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { runAgent, type AgentTool } from './agent';
import { cfg } from './env';
import { ROOT } from './paths';
import { sceneStills } from './scene';

const SCENES_DIR = path.join(ROOT, 'packages', 'core', 'src', 'scenes');
const READABLE = ['packages/core/src/scenes', 'packages/core/src/engine/util.ts', 'docs/scenes', 'examples', 'AGENTS.md'];
const doc = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
const rel = (p: string) => path.relative(ROOT, p).replace(/\\/g, '/');

// images travel inside the request as base64; many gateways cap the body at a few MB, so keep them small
const small = (file: string, width: number, q = 7) => {
  const out = `${file}.agent.jpg`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, '-vf', `scale='min(${width},iw)':-2`, '-q:v', String(q), out]);
  return out;
};

// blind: the model may not read or import anyone else's scenes, only the Film runner and the engine helpers
const BLIND_READABLE = ['packages/core/src/scenes/film.tsx', 'packages/core/src/engine/util.ts', 'docs/scenes/CRAFT.md', 'docs/scenes/WORKFLOW.md', 'AGENTS.md'];
const BLIND_IMPORTS = /^(react|remotion|@remotion\/[\w-]+(\/[\w-]+)*|\.\/[\w.-]+|\.\.\/\.\.\/film|\.\.\/\.\.\/\.\.\/engine\/util)$/;

const system = (slug: string, forbid: string[], blind: boolean) => `You are a motion designer and React/SVG illustrator working in the MotionKit repository through tools. You build one film in SCENE MODE, entirely by yourself, and you judge your own work by rendering frames and looking at them.

# Where you work
- Write ONLY inside packages/core/src/scenes/gen/${slug}/ (tool paths are relative to the repo root).
- The entry file is packages/core/src/scenes/gen/${slug}/index.tsx. It MUST export:
    export const FRAMES: number            // total length in frames at 60 fps
    export const Scene: React.FC           // the whole film, 1920×1080
  Build it with the Film runner: \`import { Film, filmFrames, type Shot, … } from '${blind ? '../../film' : '../../lib'}';\`
  Split shots into several files in your folder; keep each file under ~300 lines.
- It is registered automatically as the composition "Gen-${slug}".
- Other imports: ${blind ? "`'../../../engine/util'` (prog, easings, clamp)" : "`'../../../engine/util'` is re-exported by lib"}; fonts via \`@remotion/google-fonts/<Family>\`.
${blind ? `- FROM SCRATCH: there is no kit and there are no example scenes in this run. Every shape, texture, figure and motion is yours to write. You may import only react, remotion, @remotion/*, your own files, '../../film' and '../../../engine/util'; other imports are rejected. Read packages/core/src/scenes/film.tsx first to learn the Shot type.
` : ''}${forbid.length ? `- You may READ every file in packages/core/src/scenes to learn technique, but you must NOT import from or copy these (this run tests whether you can produce the work yourself): ${forbid.join(', ')}. Importing from lib.ts and kit.tsx is encouraged.\n` : ''}
# How to work
1. Read the project papers you are given, then \`read_file\` docs you need (they are summarised below, the full text is in the repo).
2. Plan the shots in one short message (shot, seconds, what is seen, what moves). No approval step in this run: go on.
3. Build ONE shot first, \`check\`, \`render\` two or three frames of it, LOOK, fix. Then the next shot. Never write the whole film blind.
4. After every change that affects a picture: \`check\`, \`render\`, look. For an action render several frames across it.
5. When all shots are in and you have looked at frames from every shot, call \`finish\` with an honest summary: what works, what is weak, what is invented.
Write at most 2 files per reply. Keep replies short; spend your effort in the files.

# Repository instructions (AGENTS.md)
${doc('AGENTS.md')}

# docs/scenes/CRAFT.md
${doc('docs/scenes/CRAFT.md')}

${blind ? '' : `# docs/scenes/KIT.md
${doc('docs/scenes/KIT.md')}`}
`;

const tools = (slug: string, blind: boolean): AgentTool[] => {
  const home = path.join(SCENES_DIR, 'gen', slug);
  const id = `Gen-${slug}`;
  mkdirSync(home, { recursive: true });
  const safeRead = (p: string) => {
    const abs = path.resolve(ROOT, p);
    const r = rel(abs);
    const READ = blind ? [...BLIND_READABLE, `packages/core/src/scenes/gen/${slug}`] : READABLE;
    if (r.startsWith('..') || !(READ.some((x) => r === x || r.startsWith(`${x}/`)) || r.startsWith(`projects/${slug}/`))) throw new Error(`not readable: ${p}. Readable: ${READ.join(', ')}, projects/${slug}/`);
    return abs;
  };
  let renders = 0;
  return [
    {
      name: 'list_files',
      description: 'List a directory (repo-relative).',
      parameters: { type: 'object', properties: { dir: { type: 'string' } }, required: ['dir'] },
      run: async ({ dir }) => {
        const abs = safeRead(String(dir));
        return { text: readdirSync(abs).map((f) => { const st = statSync(path.join(abs, f)); return st.isDirectory() ? `${f}/` : `${f}  (${readFileSync(path.join(abs, f), 'utf8').split('\n').length} lines)`; }).join('\n') || '(empty)' };
      },
    },
    {
      name: 'read_file',
      description: 'Read a text file (repo-relative). Optionally a line range; at most 400 lines per call.',
      parameters: { type: 'object', properties: { path: { type: 'string' }, from: { type: 'number' }, to: { type: 'number' } }, required: ['path'] },
      run: async ({ path: p, from, to }) => {
        const lines = readFileSync(safeRead(String(p)), 'utf8').split('\n');
        const a = Math.max(1, Number(from ?? 1));
        const b = Math.min(lines.length, Number(to ?? a + 399), a + 399);
        return { text: `${p} lines ${a}–${b} of ${lines.length}\n${lines.slice(a - 1, b).map((l, i) => `${a + i}\t${l}`).join('\n')}` };
      },
    },
    {
      name: 'write_file',
      description: `Create or replace a file inside packages/core/src/scenes/gen/${slug}/ . Give the file name only (e.g. "index.tsx", "ShotRoom.tsx") and its full content.`,
      parameters: { type: 'object', properties: { name: { type: 'string' }, content: { type: 'string' } }, required: ['name', 'content'] },
      run: async ({ name, content }) => {
        const n = path.basename(String(name));
        if (!/\.(tsx|ts|md)$/.test(n)) throw new Error('only .tsx, .ts or .md files');
        if (blind) {
          const bad = [...String(content).matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]).filter((x) => !BLIND_IMPORTS.test(x));
          if (bad.length) throw new Error(`not allowed in a from-scratch run: import from ${bad.join(', ')}. Write it yourself.`);
        }
        writeFileSync(path.join(home, n), String(content));
        return { text: `wrote gen/${slug}/${n} (${String(content).split('\n').length} lines)` };
      },
    },
    {
      name: 'check',
      description: 'Type-check the project. Returns compiler errors in your files (fix them before rendering).',
      parameters: { type: 'object', properties: {} },
      run: async () => {
        try {
          execFileSync('npx', ['tsc', '--noEmit', '-p', '.'], { cwd: ROOT, stdio: 'pipe', shell: true });
          return { text: 'no type errors' };
        } catch (e) {
          const out = String((e as { stdout?: Buffer }).stdout ?? '');
          const mine = out.split('\n').filter((l) => l.includes(`gen/${slug}/`));
          return { text: (mine.length ? mine : out.split('\n')).slice(0, 40).join('\n') || 'type check failed (no output)' };
        }
      },
    },
    {
      name: 'render',
      description: 'Render frames of your film and look at them. Up to 6 frame numbers. You get each frame back as an image.',
      parameters: { type: 'object', properties: { frames: { type: 'array', items: { type: 'number' } } }, required: ['frames'] },
      run: async ({ frames }) => {
        const list = (frames as number[]).slice(0, 6).map((f) => Math.max(0, Math.round(f)));
        if (!existsSync(path.join(home, 'index.tsx'))) return { text: 'no index.tsx yet' };
        try {
          const files = await sceneStills(id, list, false);
          renders++;
          return { text: `rendered frames ${list.join(', ')} (render #${renders}). Look closely: recognisable? anything clipped, overlapping, floating, in the wrong draw order, empty?`, images: files.map((f, i) => ({ label: `frame ${list[i]}`, file: small(f, list.length > 3 ? 720 : 960) })) };
        } catch (e) {
          return { text: `render failed: ${String(e instanceof Error ? e.message : e).slice(0, 1200)}` };
        }
      },
    },
    {
      name: 'finish',
      description: 'Call when the film is complete and you have looked at frames from every shot. Give an honest summary.',
      parameters: { type: 'object', properties: { summary: { type: 'string' } }, required: ['summary'] },
      run: async ({ summary }) => ({ text: String(summary), done: true }),
    },
  ];
};

export const sceneAgent = async (slug: string, o: { model: string; task?: string; maxSteps: number; forbid: string[]; blind?: boolean }) => {
  // any OpenAI-compatible endpoint: AGENT_BASE_URL / AGENT_API_KEY, else the default gateway
  if (process.env.AGENT_BASE_URL) cfg.baseUrl = process.env.AGENT_BASE_URL.replace(/\/$/, '');
  if (process.env.AGENT_API_KEY) cfg.vikeyKey = process.env.AGENT_API_KEY;
  const proj = path.join(ROOT, 'projects', slug);
  const papers = ['brief.md', 'script.md', 'facts.md', 'refs.md'].filter((f) => existsSync(path.join(proj, f)));
  if (!papers.length && !o.task) throw new Error(`nothing to work from: put brief.md (and facts.md, refs.md, script.md) in projects/${slug}/ or pass --task "…"`);
  const refDir = path.join(proj, 'refs');
  const refs = existsSync(refDir) ? readdirSync(refDir).filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.includes('.agent.')).slice(0, 16) : [];
  const task = `${o.task ?? `Build the film for project "${slug}".`}\n\n${papers.map((f) => `## projects/${slug}/${f}\n${readFileSync(path.join(proj, f), 'utf8')}`).join('\n\n')}\n\n${refs.length ? `Reference photos follow (the file names match refs.md). Draw the real things from these.` : 'No reference photos were supplied: say in your summary what you had to invent.'}`;
  const dir = path.join(proj, 'agent', o.model.replace(/[^\w.-]+/g, '_'));
  console.log(`▸ scene agent ${o.model} on "${slug}" — up to ${o.maxSteps} steps; session in ${rel(dir)}`);
  const r = await runAgent({ model: o.model, system: system(slug, o.forbid, !!o.blind), task, taskImages: refs.map((f) => ({ label: `REF ${f}`, file: small(path.join(refDir, f), 520, 9) })), tools: tools(slug, !!o.blind), dir, usageFile: path.join(dir, 'usage.jsonl'), maxSteps: o.maxSteps, tag: 'scene' });
  console.log(`  ${r.done ? '✓ finished' : '⚠ stopped'} after ${r.steps} steps — ${r.summary.slice(0, 600)}`);
  console.log(`  look: node bin/mk.mjs scene stills Gen-${slug} <frames>   ·   render: node bin/mk.mjs scene video Gen-${slug}`);
  return r;
};
