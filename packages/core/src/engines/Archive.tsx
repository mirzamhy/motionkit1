// Engine 4 — "archive": a documentary desk. Every beat is a paper sheet that slides onto the pile; older sheets stay
// underneath, dimmed and pushed back, so the world never changes — the pile just grows. A slow camera push runs
// through each sheet and eases back as the next one lands. Corner label = the archive date, scrambling on change.
// Widgets render on the paper through the kinetic renderers (pal = paper ink), the documentary ones through
// archive/renderers. A beat with transition "flash" lands under a flash instead of sliding (the one hard cut).
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { scrambleText } from '../engine/atoms';
import { ASPECTS } from '../engine/director';
import { fontsFor } from '../engine/fonts';
import { resolveLook } from '../engine/looks';
import { buildTimeline, type Timeline } from '../engine/timeline';
import type { Aspect, Ctx, Hit, Sfx } from '../engine/types';
import { inOut, lin, outE, pop, prog } from '../engine/util';
import { Captions } from '../engine/world';
import { kineticWidget, type KPal } from '../kinetic/renderers';
import type { Spec } from '../spec/schema';
import { DeskLight, DeskProps, PAPER_TINTS, SheetAttach, SheetChrome } from '../archive/dress';
import { HudOverlay } from './hud';
import { AudioBed, HitOverlays, useHitFx, useQA, type EngineProps } from './shared';
import { TransitionOverlay } from './transitions';

const SHEET: Record<Aspect, { w: number; h: number; cx: number; cy: number; pad: number }> = {
  landscape: { w: 1380, h: 830, cx: 960, cy: 490, pad: 76 },
  portrait: { w: 960, h: 1330, cx: 540, cy: 840, pad: 64 },
};
const ENTER = 24; // frames a sheet takes to slide in

export const paperPal = (hot: string): KPal => ({ bg: '#EFE6D3', fg: '#1F1A14', muted: 'rgba(31,26,20,0.58)', hot, line: 'rgba(31,26,20,0.16)', inset: '#E4D9C3' });

const buildArchive = (spec: Spec, tl: Timeline, aspect: Aspect) => {
  const A = ASPECTS[aspect];
  const P = aspect === 'portrait';
  const S = SHEET[aspect];
  const look = resolveLook(spec.look);
  const f = fontsFor(look.fonts);
  const pal = paperPal(look.hot);
  const arrive = spec.beats.map((b) => tl.cue(b.at) + 2);
  const hits: Hit[] = [];
  const sfx: Sfx[] = [];
  const sheets = spec.beats.map((b, i) => {
    const ctx: Ctx = { P, A, look, f, tl, cue: tl.cue, spec, beat: b, index: i, arrive: arrive[i], exitAt: null, groupSize: 1 };
    const out = kineticWidget(b.widget, { ...ctx, pal, box: { x: S.pad, y: S.pad, w: S.w - S.pad * 2, h: S.h - S.pad * 2 }, fw: S.w, fh: S.h });
    hits.push(...(out.hits ?? []));
    sfx.push(...(out.sfx ?? []));
    (b.punches ?? []).forEach((c) => hits.push({ at: tl.cue(c), kind: 'punch' }));
    if (b.stamp) {
      hits.push({ at: tl.cue(b.stamp.at) + 4, kind: 'punch' });
      sfx.push([tl.cue(b.stamp.at), 'stamp', 0.5]);
    }
    const cut = b.transition === 'flash';
    if (i > 0 && !cut) sfx.push([arrive[i] - ENTER, 'whoosh', 0.22]);
    // alternate the side each sheet comes from, and its resting tilt
    const from = i === 0 ? { x: 0, y: 0, r: 0 } : i % 2 ? { x: A.W * 0.95, y: 40, r: 7 } : { x: -40, y: A.H * 1.05, r: -6 };
    return { b, i, node: out.node, cut, from, tilt: i === 0 ? -0.6 : i % 2 ? 1.1 : -1.3, enter: i === 0 ? -1e9 : cut ? arrive[i] - 12 : arrive[i] - ENTER };
  });
  // the date label: the latest beat with a date at or before t
  const dates = spec.beats.map((b, i) => ({ at: arrive[i] - ENTER / 2, d: b.date })).filter((x): x is { at: number; d: string } => !!x.d);
  return { A, P, S, look, f, pal, arrive, hits, sfx, sheets, dates, total: tl.total };
};

export const Archive: React.FC<EngineProps> = ({ spec, words, hasVo, hasMusic, sfx, qa, aspect }) => {
  const t = useCurrentFrame();
  const tl = useMemo(() => buildTimeline(spec, words), [spec, words]);
  const a = useMemo(() => buildArchive(spec, tl, aspect), [spec, tl, aspect]);
  const { A, P, S, look, f, pal } = a;
  const { sh, punch, flash, flashB } = useHitFx(a.hits, t, P);

  // which sheets are on the desk, and is one still sliding?
  const onDesk = a.sheets.filter((s) => t >= s.enter);
  const top = onDesk[onDesk.length - 1] ?? a.sheets[0];
  const sliding = !top.cut && top.i > 0 && t < top.enter + ENTER;
  useQA(qa, !sliding, t, A, aspect);

  // slow push through each sheet, eased back while the next one lands (continuous across beats)
  let push = 0;
  a.sheets.forEach((s, i) => {
    const next = a.sheets[i + 1];
    const start = i === 0 ? 0 : a.arrive[i];
    const end = next ? next.enter : a.total;
    push += prog(t, start, end, lin) * (next ? 1 - prog(t, next.enter, next.enter + ENTER + 6, inOut) : 1);
  });
  const camS = 1 + 0.055 * push + punch;
  // a slow handheld breath so a held sheet is never a frozen frame (two incommensurate sines, a few px)
  const bx = 9 * Math.sin(t / 47) + 4 * Math.sin(t / 19.3);
  const by = 6 * Math.sin(t / 61 + 1.3) + 3 * Math.sin(t / 23.7);
  const br = 0.22 * Math.sin(t / 83 + 0.4);

  const date = (() => {
    let cur: { at: number; d: string } | null = null;
    for (const d of a.dates) if (t >= d.at) cur = d;
    return cur ? scrambleText(cur.d, t, cur.at, 16) : '';
  })();

  return (
    <AbsoluteFill style={{ background: look.world.bg, overflow: 'hidden' }}>
      {/* desk grain: one static noise layer */}
      <svg width={A.W} height={A.H} style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay' }}>
        <filter id="desk-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#desk-grain)" />
      </svg>
      <DeskLight />
      <AbsoluteFill style={{ transform: `translate(${(sh.x + bx).toFixed(2)}px, ${(sh.y + by).toFixed(2)}px) rotate(${br.toFixed(3)}deg) scale(${camS.toFixed(4)})`, transformOrigin: `${S.cx}px ${S.cy}px` }}>
        <DeskProps S={S} P={P} f={f} hot={look.hot} label={spec.hud?.label ?? spec.title} />
        {onDesk.slice(-4).map((s) => {
          const depth = onDesk.length - 1 - onDesk.indexOf(s); // 0 = top sheet
          // soft start, long settle: the first frame moves a few px, not a fifth of the screen
          const inP = s.i === 0 || s.cut ? 1 : prog(t, s.enter, s.enter + ENTER, (x) => 1 - (1 - x * x * (3 - 2 * x)) ** 2);
          const x = s.from.x * (1 - inP);
          const y = s.from.y * (1 - inP);
          const r = s.tilt + s.from.r * (1 - inP);
          // sheets underneath sink a little and dim; eased as the new one lands
          const sink = depth === 0 ? 0 : Math.min(1, depth - 1 + prog(t, onDesk[onDesk.indexOf(s) + 1].enter, onDesk[onDesk.indexOf(s) + 1].enter + ENTER, inOut));
          const st = s.b.stamp;
          const stAt = st ? spec.beats[s.i] && tl.cue(st.at) : 0;
          return (
            <div key={s.b.id} data-qa-layer={s.b.id} data-qa-focus={depth === 0 ? '1' : '0'} style={{ position: 'absolute', left: S.cx - S.w / 2, top: S.cy - S.h / 2, width: S.w, height: S.h, transform: `translate(${(x - sink * 14).toFixed(1)}px, ${(y + sink * 10).toFixed(1)}px) rotate(${(r - sink * 0.8).toFixed(3)}deg) scale(${(1 - sink * 0.03).toFixed(4)})`, transformOrigin: '50% 50%' }}>
              <div data-card="1" style={{ position: 'absolute', inset: 0, background: PAPER_TINTS[s.i % PAPER_TINTS.length], borderRadius: 4, boxShadow: '0 40px 80px -30px rgba(0,0,0,0.75), 0 6px 14px -6px rgba(0,0,0,0.55)', overflow: 'hidden' }}>
                {/* paper fibres + a faint fold */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,0.35), transparent 60%), linear-gradient(90deg, transparent 49.6%, rgba(31,26,20,0.05) 50%, transparent 50.4%)' }} />
                <SheetChrome S={S} P={P} pal={pal} f={f} index={s.i} count={a.sheets.length} label={spec.hud?.label ?? spec.title} date={s.b.date} source={spec.facts[s.i % Math.max(1, spec.facts.length)]?.source} t={t} at={a.arrive[s.i]} />
                {s.node(t)}
                {st && (
                  <div style={{ position: 'absolute', right: P ? 50 : 70, top: P ? 60 : 56, padding: '10px 22px', border: `5px solid ${st.tone === 'red' ? '#B91C1C' : pal.hot}`, borderRadius: 8, color: st.tone === 'red' ? '#B91C1C' : pal.hot, fontFamily: f.mono, fontWeight: 600, fontSize: P ? 40 : 38, letterSpacing: '0.12em', whiteSpace: 'nowrap', mixBlendMode: 'multiply', opacity: t >= stAt - 2 ? 0.88 : 0, transform: `rotate(-9deg) scale(${(1.7 - 0.7 * Math.min(1, pop(t, stAt - 2, 3))).toFixed(3)})` }}>
                    {st.text.toUpperCase()}
                  </div>
                )}
              </div>
              <SheetAttach S={S} P={P} index={s.i} hot={look.hot} />
              {depth > 0 && <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.3 * Math.min(1, sink), borderRadius: 4 }} />}
            </div>
          );
        })}
      </AbsoluteFill>
      <TransitionOverlay A={A} spec={spec} tl={tl} look={look} t={t} />
      {spec.hud && spec.hud.right && <HudOverlay A={A} spec={spec} tl={tl} look={look} t={t} hits={a.hits} mono={f.mono} />}
      <HitOverlays A={A} P={P} hits={a.hits} t={t} spec={spec} look={look} flash={flash} flashB={flashB} />
      <Captions A={A} tl={tl} look={look} ui={f.ui} t={t} />
      <AudioBed spec={spec} tl={tl} total={a.total} hasVo={hasVo} hasMusic={hasMusic} sfx={sfx} list={a.sfx} />
    </AbsoluteFill>
  );
};
