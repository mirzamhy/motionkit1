import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { LOOK_IDS } from '../../packages/core/src/spec/schema';
import { ensureSfxAssets } from './audio';
import { cfg } from './env';
import { lintSpec } from './lint';
import { ROOT, proj } from './paths';
import { checkScene, codeRender, runCode, writeScene } from './code';
import { setDuration, targetDuration } from './target';
import { getBalance } from './balance';
import { concept, exampleProject, fix, latestRound, loadSpec, loadWords, plan, prepareAudio, dnaCmd, qaReport, recentFor, remember, renderFinal, renderStills, run, usageSummary, verify, type Review } from './pipeline';
import type { AspectId } from './render';
import { gridView } from './sceneAgent';
import { sceneAudio, sceneList, sceneStills, sceneVideo, voCut } from './scene';
import { sceneAgent } from './sceneAgent';
import { gate } from './gate';
import { itemFind, itemList, itemPreview } from './item';
import { asetBaru, asetFind, asetPeta, gayaList, gayaShow } from './aset';
import { decode, detectOnsets, snapShots } from './onsets';
import { ambientcgFetch, ambientcgSearch, checkModel, listAssets, noteAsset, optimizeModel, polyhavenFetch, polyhavenSearch } from './asset';
import { findKit, KIT } from '../../packages/core/src/scenes/catalog';

const HELP = `mk — Opus-grade Remotion launch videos from cheap models (Vikey API)

  mk init                      create .env, synthesize SFX, check tools
  mk doctor                    check keys, models, ffmpeg
  mk new <slug> [--brief "…"] [--duration 30]   scaffold projects/<slug>/ (length optional: else the director picks)
  mk concept <slug>            director (${cfg.director}) picks engine/look/story, different from recent films
  mk plan <slug>               builder model (${cfg.builder}) writes spec.json from the concept
  mk lint <slug>               validate spec.json (schema + facts + cues + pacing)
  mk audio <slug> [--only m02] voice-over + music (ElevenLabs) + SFX
  mk remember <slug>           record spec.json (+ concept angle) in projects/.history.json
  mk dna <slug> <video|url>     Style DNA of a reference film (palette, tempo, ground, transition) → plan follows it
  mk qa <slug>                  quality gate: slideshow patterns in the spec + motion energy / frame jumps in renders
  mk stills <slug>             render review frames → projects/<slug>/review/round-N/
  mk verify <slug>             verifier (${cfg.verifier}) reviews the latest frames
  mk review <slug> [--rounds 3] stills → verify → fix, until it passes
  mk render <slug> [--aspect landscape|portrait]
  mk run <slug>                everything: plan → audio → review loop → render (spec mode: fixed engines)
  mk code <slug>               CODE MODE: concept → script → audio → Opus writes a bespoke scene → review → render
  mk code-scene|code-check|code-render <slug>   code-mode steps
  mk example                   copy the reference MiMo spec into projects/mimo-example

  SCENE MODE (hand-built illustrated scenes — read docs/scenes/WORKFLOW.md first)
  mk scene list                          registered scene compositions
  mk scene stills <Id> <f1,f2,…>         render frames + a contact sheet → out/scenes/<Id>/   (LOOK at them)
  mk scene stills <Id> <frames> --grid [--region x,y,w,h] [--guides thirds,phi,center,diag,spiral,spiralx]
                                         the same, plus a measuring grid and composition guides (zoomed to a region)
  mk scene video <Id>                    render the film → out/scenes/<Id>/<Id>.mp4
  mk kit find <words>                    search the scene kit (Indonesian or English) before drawing something new
  mk beats <music> [--fps 60] [--durs a,b,…]   music onsets; with --durs, snap shot cuts to the nearest beat
  mk asset polyhaven search <words> | get <id…> [--res 1k] [--project p]   CC0 models with provenance
  mk asset ambientcg search <words> | get <id…> [--res 1K-JPG] [--project p]   CC0 PBR materials
  mk asset list [--project p] | note <dir> --license L --source URL   provenance of what is on disk
  mk asset check <model…> [--expect 0.08]   Khronos glTF-Validator + size in cm (flag > 2x off the expected metres)
  mk asset optimize <model.gltf|glb> [--ratio 0.5]   glTF-Transform: quantize + simplify to a GLB
  mk item list | find <words> | preview <id>   the item library: researched, reusable 2D/3D things
  mk gaya list | show <slug>   the looks (stik, poly3d, …) with their assets and example films
  mk aset find <kata> [--gaya <slug>]   which looks already have a thing (matrix per benda)
  mk gate [--only A,B] [--no-render]     tsc + unit tests + two small stills of every scene → out/gate/index.html
  mk scene audio <Id>                    re-render only the sound and put it under that mp4 (voice / effects changed)
  mk vo-cut <file.mp3> [--pause 0.22]    list the pauses in a voice-over, to split it into passages
  mk agent <slug> --model <id> [--steps 80] [--task "…"] [--forbid A.tsx,B.tsx]
                                         let any chat-completions model build the film from projects/<slug>/ papers
                                         (endpoint: AGENT_BASE_URL + AGENT_API_KEY in .env) → composition Gen-<slug>
  mk usage <slug>              token usage per model
  mk balance                   Vikey balance (free check)
`;

const args = process.argv.slice(2);
const cmd = args[0];
const slug = args[1] && !args[1].startsWith('--') ? args[1] : '';
const flag = (k: string) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] ?? 'true' : undefined;
};
const needSlug = () => {
  if (!slug) throw new Error(`usage: mk ${cmd} <slug>`);
  return slug;
};


const main = async () => {
  switch (cmd) {
    case 'init': {
      const env = path.join(ROOT, '.env');
      if (!existsSync(env)) {
        copyFileSync(path.join(ROOT, '.env.example'), env);
        console.log('✓ created .env — put your VIKEY_API_KEY in it');
      } else console.log('• .env exists');
      console.log(`✓ SFX ready in ${path.relative(process.cwd(), ensureSfxAssets())}`);
      for (const bin of ['ffmpeg', 'ffprobe']) {
        try {
          execFileSync(bin, ['-version'], { stdio: 'ignore' });
          console.log(`✓ ${bin}`);
        } catch {
          console.log(`✗ ${bin} not found — install it (brew install ffmpeg / apt install ffmpeg)`);
        }
      }
      return;
    }
    case 'doctor': {
      console.log(`node ${process.version}`);
      console.log(`VIKEY_BASE_URL ${cfg.baseUrl}`);
      console.log(`VIKEY_API_KEY ${cfg.vikeyKey ? 'set' : 'MISSING'}`);
      console.log(`ELEVENLABS_API_KEY ${cfg.elevenKey ? 'set' : 'not set (videos render without voice-over/music)'}`);
      if (cfg.vikeyKey) {
        const r = await fetch(`${cfg.baseUrl}/models`, { headers: { Authorization: `Bearer ${cfg.vikeyKey}` } });
        const d = (await r.json()) as { data?: { id: string }[] };
        const ids = new Set((d.data ?? []).map((m) => m.id));
        for (const [role, m] of [['builder', cfg.builder], ['verifier', cfg.verifier]]) console.log(`${role} ${m}: ${ids.has(m) ? '✓ available' : '✗ not in /models'}`);
      }
      return;
    }
    case 'new': {
      const s = needSlug();
      if (!/^[a-z0-9-]+$/.test(s)) throw new Error('slug: lowercase letters, digits and dashes only');
      const P = proj(s);
      mkdirSync(P.dir, { recursive: true });
      if (!existsSync(P.brief)) writeFileSync(P.brief, `${flag('brief') ?? '<what is launching, who it is for, the one message, the CTA, language (id/en)>'}\n\nBrand: ${cfg.brandName || '<name>'} (${cfg.brandUrl || '<url>'})\nLength: optional — \"<N> detik\" (or mk new --duration N); leave it out and the director picks\nFormat: landscape + portrait\n`);
      if (!existsSync(P.facts)) writeFileSync(P.facts, '# Facts (every number on screen must appear here, with its source and date)\n\n- <fact> — source: <url>, read <date>\n');
      if (flag('duration')) setDuration(s, Number(flag('duration')));
      console.log(`✓ ${path.relative(process.cwd(), P.dir)}/brief.md + facts.md — fill them in, then \`mk run ${s}\` (or \`mk code ${s}\`)${flag('duration') ? ` · target ${flag('duration')} s` : ' · length: director decides (or --duration N)'}`);
      return;
    }
    case 'concept':
      await concept(needSlug());
      return;
    case 'plan':
      await plan(needSlug());
      return;
    case 'dna': {
      const src = process.argv[4];
      if (!src) throw new Error('usage: mk dna <slug> <video file | url>');
      await dnaCmd(needSlug(), src);
      break;
    }
    case 'qa': {
      qaReport(needSlug());
      break;
    }
    case 'lint': {
      const P = proj(needSlug());
      const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
      const conceptPath = P.concept;
      const res = lintSpec(JSON.parse(read(P.spec)), { facts: read(P.facts), brief: read(P.brief), recent: recentFor(slug), concept: existsSync(conceptPath) ? JSON.parse(read(conceptPath)) : null, words: loadWords(slug), durationSec: targetDuration(slug) });
      res.errors.forEach((e) => console.log(`✗ ${e}`));
      res.warnings.forEach((w) => console.log(`⚠ ${w}`));
      if (!res.errors.length) console.log('✓ spec is valid');
      process.exitCode = res.errors.length ? 1 : 0;
      return;
    }
    case 'audio':
      await prepareAudio(needSlug(), { forceVo: flag('force') !== undefined, only: flag('only')?.split(',') });
      return;
    case 'remember': {
      const P = proj(needSlug());
      const spec = loadSpec(slug);
      const c = existsSync(P.concept) ? JSON.parse(readFileSync(P.concept, 'utf8')) : null;
      remember(slug, spec, c?.angle);
      console.log(`✓ ${slug} recorded in history (${spec.engine}/${spec.path}, ${spec.look.preset}, ${spec.archetype})`);
      return;
    }
    case 'stills': {
      const r = await renderStills(needSlug(), latestRound(slug) + 1);
      console.log(`✓ ${r.tiles.length} tiles in ${path.relative(process.cwd(), r.dir)}${r.qa.length ? `\nQA:\n- ${r.qa.join('\n- ')}` : ''}`);
      return;
    }
    case 'verify': {
      const n = latestRound(needSlug());
      if (!n) throw new Error('run `mk stills` first');
      const { tiles, qa } = JSON.parse(readFileSync(path.join(proj(slug).review, `round-${n}`, 'tiles.json'), 'utf8'));
      await verify(slug, n, tiles, qa);
      return;
    }
    case 'fix': {
      const n = latestRound(needSlug());
      const rv: Review = JSON.parse(readFileSync(path.join(proj(slug).review, `round-${n}`, 'review.json'), 'utf8'));
      await fix(slug, n, rv);
      return;
    }
    case 'review': {
      const rounds = Number(flag('rounds') ?? cfg.maxRounds);
      await run(needSlug(), { rounds, skipRender: true });
      return;
    }
    case 'render': {
      const a = flag('aspect') as AspectId | undefined;
      await renderFinal(needSlug(), a ? [a] : undefined);
      return;
    }
    case 'run':
      if (flag('mode') === 'code') await runCode(needSlug(), { rounds: flag('rounds') ? Number(flag('rounds')) : undefined });
      else await run(needSlug(), { rounds: flag('rounds') ? Number(flag('rounds')) : undefined });
      return;
    case 'code':
      await runCode(needSlug(), { rounds: flag('rounds') ? Number(flag('rounds')) : undefined, skipRender: flag('no-render') !== undefined });
      return;
    case 'code-scene':
      await writeScene(needSlug());
      return;
    case 'code-check': {
      const e = checkScene(needSlug());
      e.forEach((x) => console.log(`✗ ${x}`));
      if (!e.length) console.log('✓ scene passes the checks');
      return;
    }
    case 'code-render':
      await codeRender(needSlug(), flag('aspect') ? [flag('aspect') as AspectId] : undefined);
      return;
    case 'scene': {
      const [, sub, id, list] = args;
      if (sub === 'list' || !sub) sceneList();
      else if (sub === 'stills') {
        const files = await sceneStills(id, (list ?? '0').split(',').map(Number));
        if (args.includes('--grid')) {
          const r = args.indexOf('--region');
          const gi = args.indexOf('--guides');
          const guides = gi > 0 ? args[gi + 1].split(',') : ['thirds', 'phi'];
          for (const f of files) console.log(`  grid → ${gridView(f, r > 0 ? args[r + 1].split(',').map(Number) : undefined, 1600, guides)}`);
        }
      }
      else if (sub === 'video') await sceneVideo(id);
      else if (sub === 'audio') await sceneAudio(id);
      else throw new Error('usage: mk scene list | stills <Id> <frames> | video <Id>');
      break;
    }
    case 'agent': {
      const opt = (k: string) => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : undefined; };
      if (!args[1] || !opt('--model')) throw new Error('usage: mk agent <slug> --model <id> [--steps 80] [--task "…"] [--forbid A.tsx,B.tsx] [--blind]');
      await sceneAgent(args[1], { model: opt('--model')!, task: opt('--task'), maxSteps: Number(opt('--steps') ?? 80), forbid: (opt('--forbid') ?? '').split(',').filter(Boolean), blind: args.includes('--blind') });
      break;
    }
    case 'kit': {
      const q = args.slice(2).join(' ');
      if (args[1] !== 'find' || !q) throw new Error('usage: mk kit find <words>   (search the scene kit before drawing something new)');
      const hits = findKit(q);
      if (!hits.length) console.log(`  nothing in the kit for "${q}" (${KIT.length} parts listed) — draw it, then add it to packages/core/src/scenes/catalog.ts`);
      for (const e of hits) {
        const file = path.relative(ROOT, path.join(ROOT, 'packages/core/src/scenes', e.file)).split(path.sep).join('/');
        console.log(['', `  ${e.id}  [${e.kind}]  ${file}`, `    ${e.role}`, `    use: ${e.use}`, ...(e.avoid ? [`    avoid: ${e.avoid}`] : []), ...(e.example ? [`    e.g. ${e.example}`] : [])].join('\n'));
      }
      break;
    }
    case 'beats': {
      const opt = (k: string) => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : undefined; };
      if (!args[1]) throw new Error('usage: mk beats <music.wav|mp3> [--fps 60] [--durs 600,630,…] [--window 20]');
      const fps = Number(opt('--fps') ?? 60), rate = 22050;
      const on = detectOnsets(decode(args[1], rate), rate);
      const gaps = on.slice(1).map((o, i) => o.sec - on[i].sec).sort((a, b) => a - b);
      const med = gaps[Math.floor(gaps.length / 2)];
      console.log(`  ${on.length} onsets${med ? `, median gap ${med.toFixed(3)} s (≈ ${(60 / med).toFixed(0)} BPM)` : ''}`);
      console.log(`  frames @${fps}: ${on.slice(0, 24).map((o) => Math.round(o.sec * fps)).join(', ')}${on.length > 24 ? ' …' : ''}`);
      if (opt('--durs')) {
        const r = snapShots(opt('--durs')!.split(',').map(Number), on, fps, { window: Number(opt('--window') ?? 20) });
        for (const m of r.moves) console.log(`  shot ${m.shot}: cut ${m.from} → ${m.to} (${m.to - m.from > 0 ? '+' : ''}${m.to - m.from})`);
        console.log(`  durs: ${r.durs.join(',')}`);
      }
      break;
    }
    case 'asset': {
      const [, src, sub, ...rest] = args;
      const opt = (k: string) => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : undefined; };
      if (src === 'list') { listAssets(opt('--project')); break; }
      if (src === 'note') { if (!opt('--license') || !opt('--source')) throw new Error('usage: mk asset note <dir> --license CC0-1.0 --source <url> [--type pack]'); noteAsset(sub, { license: opt('--license')!, source: opt('--source')!, type: opt('--type') }); break; }
      if (src === 'check') { for (const f of [sub, ...rest].filter((x, i, all) => x && !x.startsWith('--') && !all[i - 1]?.startsWith('--'))) await checkModel(f, { expect: opt('--expect') ? Number(opt('--expect')) : undefined }); break; }
      if (src === 'optimize') { optimizeModel(sub, { ratio: Number(opt('--ratio') ?? 0.5) }); break; }
      if (src === 'ambientcg' && sub === 'search') { for (const m of await ambientcgSearch(rest.join(' '))) console.log(`  ${m.id.padEnd(18)} ${m.title}  (${m.tags.join(', ')})`); break; }
      if (src === 'ambientcg' && sub === 'get') { for (const id of rest.filter((x, i) => !x.startsWith('--') && !rest[i - 1]?.startsWith('--'))) await ambientcgFetch(id, { res: opt('--res') ?? '1K-JPG', project: opt('--project') ?? 'asset-lab' }); break; }
      if (src !== 'polyhaven' || !['search', 'get'].includes(sub)) throw new Error('usage: mk asset polyhaven search <words> | mk asset polyhaven get <id> [--res 1k] [--project asset-lab]');
      if (sub === 'search') for (const a of await polyhavenSearch(rest.filter((x) => !x.startsWith('--')).join(' '))) console.log(`  ${a.id.padEnd(28)} ${String(a.polycount ?? '').padStart(7)} polys  ${a.categories.join(', ')}`);
      else for (const id of rest.filter((x, i) => !x.startsWith('--') && !rest[i - 1]?.startsWith('--'))) await polyhavenFetch(id, { res: opt('--res') ?? '1k', project: opt('--project') ?? 'asset-lab' });
      break;
    }
    case 'item': {
      const [, sub, ...rest] = args;
      if (sub === 'list') itemList();
      else if (sub === 'find' && rest.length) itemFind(rest.join(' '));
      else if (sub === 'preview' && rest[0]) itemPreview(rest[0]);
      else throw new Error('usage: mk item list | find <words> | preview <id>   (docs/scenes/ITEMS.md)');
      break;
    }
    case 'gaya': {
      const [, sub, slug2] = args;
      if (sub === 'list') gayaList();
      else if (sub === 'show' && slug2) gayaShow(slug2);
      else throw new Error('usage: mk gaya list | show <slug>');
      break;
    }
    case 'aset': {
      const [, sub, ...rest] = args;
      const gi = rest.indexOf('--gaya');
      const words = rest.filter((x, i) => !x.startsWith('--') && rest[i - 1] !== '--gaya');
      if (sub === 'find' && words.length) asetFind(words.join(' '), gi >= 0 ? rest[gi + 1] : undefined);
      else if (sub === 'baru' && words.length === 2) asetBaru(words[0], words[1]);
      else if (sub === 'peta') asetPeta();
      else throw new Error('usage: mk aset find <kata> [--gaya <slug>] | baru <benda> <gaya> | peta');
      break;
    }
    case 'gate': {
      const i = args.indexOf('--only');
      await gate({ only: i > 0 ? args[i + 1].split(',') : undefined, skipRender: args.includes('--no-render') });
      break;
    }
    case 'vo-cut': {
      const i = args.indexOf('--pause');
      voCut(args[1], i > 0 ? Number(args[i + 1]) : 0.22);
      break;
    }
    case 'example':
      console.log(`✓ ${exampleProject(slug || 'mimo-example')} — try \`mk render ${slug || 'mimo-example'}\``);
      return;
    case 'balance': {
      const b = await getBalance();
      console.log(b === null ? 'could not read the balance' : `Vikey balance: Rp${Math.round(b).toLocaleString('id-ID')}`);
      return;
    }
    case 'usage':
      console.log(usageSummary(needSlug()) || 'no usage logged yet');
      return;
    case 'looks':
      console.log(LOOK_IDS.join('\n'));
      return;
    case 'spec':
      console.log(JSON.stringify(loadSpec(needSlug()), null, 1));
      return;
    default:
      console.log(HELP);
  }
};

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
