// Documentary widgets: a typed document with ink marks, a newspaper page that prints line by line, paper cut-out
// figures with ink links / crosses, and a receipt. They render into a box (KCtx), so the archive engine draws them
// on paper sheets, the kinetic engine on its fields, and the card engines inside a paper card.
import React from 'react';
import { Chars, Caret } from '../engine/atoms';
import { fitSize } from '../engine/fit';
import type { Sfx } from '../engine/types';
import { inOut, outE, pop, prog, typed } from '../engine/util';
import type { KCtx, KOut } from '../kinetic/renderers';
import type { Widget } from '../spec/schema';
import { SHAPE, type ShapePal } from './shapes';

type Mark = { kind: 'circle' | 'underline' | 'strike'; at: string; replace?: string };

/** hand-drawn ink over its parent (position: relative): drawn with stroke-dashoffset over 12 frames */
const Ink: React.FC<{ mark: Mark; at: number; t: number; color: string; font: string }> = ({ mark, at, t, color, font }) => {
  const p = prog(t, at, at + 12, inOut);
  if (p <= 0) return null;
  const d = mark.kind === 'circle' ? 'M 8 50 C 8 12, 92 8, 95 46 C 98 84, 18 96, 6 58 C 2 44, 16 26, 34 20' : mark.kind === 'underline' ? 'M 2 96 C 30 90, 60 100, 98 92' : 'M 0 58 C 30 52, 70 60, 100 50';
  const inset = mark.kind === 'circle' ? '-22% -8%' : '0';
  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset, width: mark.kind === 'circle' ? '116%' : '100%', height: mark.kind === 'circle' ? '144%' : '100%', left: mark.kind === 'circle' ? '-8%' : 0, top: mark.kind === 'circle' ? '-22%' : 0, overflow: 'visible', pointerEvents: 'none' }}>
        <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={mark.kind === 'strike' ? 5 : 4} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - p} />
      </svg>
      {mark.kind === 'strike' && mark.replace && (
        <span style={{ position: 'absolute', left: '100%', top: '-0.55em', marginLeft: '0.3em', fontFamily: font, fontStyle: 'italic', fontWeight: 600, color, whiteSpace: 'nowrap', transform: `rotate(-6deg) scale(${pop(t, at + 10, 4).toFixed(3)})`, transformOrigin: 'left bottom', opacity: t >= at + 10 ? 1 : 0 }}>{mark.replace}</span>
      )}
    </>
  );
};

const Shell: React.FC<{ box: KCtx['box']; children: React.ReactNode; center?: boolean }> = ({ box, children, center }) => (
  <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: center ? 'center' : 'flex-start' }}>{children}</div>
);

export const archiveWidget = (w: Widget, k: KCtx): KOut | null => {
  const { cue, f, pal, box } = k;
  const P = k.P;
  switch (w.type) {
    case 'document': {
      const tAt = cue(w.titleAt);
      const cps = 1.5;
      const paper = w.layout === 'paper';
      const forum = w.layout === 'forum';
      const fs = paper ? (P ? 58 : 60) : w.title.length > 26 ? (P ? 68 : 72) : P ? 84 : 92;
      const tm = w.titleMark ? cue(w.titleMark.at) : 0;
      const lineAts = w.lines.map((l) => cue(l.at));
      const markAts = w.lines.map((l) => (l.mark ? cue(l.mark.at) : 0));
      const bodyAt = tAt + Math.ceil(w.title.length / cps) + 8;
      const bcps = 2.6;
      const bodyAts = w.body.reduce<number[]>((a, b, i) => [...a, i === 0 ? bodyAt : a[i - 1] + Math.ceil(w.body[i - 1].length / bcps) + 8], []);
      const greekAt = w.body.length ? bodyAts[bodyAts.length - 1] + Math.ceil(w.body[w.body.length - 1].length / bcps) + 6 : bodyAt;
      const sp: ShapePal = { ink: pal.fg, paper: pal.bg, hot: pal.hot };
      const mono = { fontFamily: f.mono, fontWeight: 500, letterSpacing: '0.12em', color: pal.muted, whiteSpace: 'nowrap' as const };
      const bfs = paper ? (P ? 30 : 27) : P ? 36 : 33;
      const greekRows = Math.max(2, (P ? 9 : 5) - w.lines.length * 2 - w.body.length);
      const BODY = [96, 88, 100, 72, 94, 100, 84, 60, 90];
      const greek = (cols: number, rows: number, start: number, hlRow = -1) => (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 40 }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {BODY.slice(0, rows).map((bw, r) => {
                const a0 = start + (c * rows + r) * 9;
                const hl = c === 0 && r === hlRow;
                return <div key={r} style={{ height: 9, borderRadius: 2, width: `${(BODY[(r + c * 3) % BODY.length] * prog(t0(), a0, a0 + 20, inOut)).toFixed(2)}%`, background: hl ? pal.hot : pal.fg, opacity: hl ? 0.55 : 0.2 }} />;
              })}
            </div>
          ))}
        </div>
      );
      // `greek` reads the frame through this cell so it can stay a plain helper
      let now = 0;
      const t0 = () => now;
      return {
        node: (t) => {
          now = t;
          const shownTitle = typed(w.title, t, tAt, cps);
          return (
            <Shell box={box} center={paper}>
              <div style={{ ...mono, fontSize: P ? 26 : 24, letterSpacing: '0.18em', height: 36, alignSelf: 'flex-start' }}>{typed(w.meta.toUpperCase(), t, k.arrive - 18, 1.2)}</div>
              <div style={{ width: '100%', height: 2, background: pal.line, margin: forum ? '10px 0 18px' : '12px 0 24px' }} />
              {forum && (
                // forum post header: avatar, user, rank pips, post date, post number
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 22, padding: '14px 18px', boxSizing: 'border-box', background: pal.inset, border: `1px solid ${pal.line}`, borderRadius: 6, marginBottom: 22, opacity: prog(t, k.arrive - 12, k.arrive + 4) }}>
                  <div style={{ width: P ? 96 : 84, height: P ? 96 : 84, borderRadius: 6, background: '#D9CDB4', overflow: 'hidden', flex: 'none', border: `2px solid ${pal.fg}` }}>
                    <svg viewBox="0 8 100 92" width="100%" height="100%">{SHAPE.person(sp, w.avatar ?? 0)}</svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontFamily: f.mono, fontWeight: 600, fontSize: P ? 36 : 32, color: pal.fg, whiteSpace: 'nowrap' }}>{w.author ?? 'anonim'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: i < 3 ? pal.hot : pal.line }} />
                      ))}
                      <span style={{ ...mono, fontSize: P ? 20 : 18, marginLeft: 6 }}>ANGGOTA</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ ...mono, fontSize: P ? 22 : 20, color: pal.fg }}>{(w.byline ?? '').toUpperCase()}</div>
                    <div style={{ ...mono, fontSize: P ? 20 : 18 }}>POST #1 · TOPIK BARU</div>
                  </div>
                </div>
              )}
              <div style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: fs, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.1, color: pal.fg, maxWidth: box.w, textAlign: paper ? 'center' : 'left' }}>
                <span style={{ position: 'relative' }}>
                  {shownTitle}
                  {t < tAt + w.title.length / cps + 8 && t >= tAt - 10 && <Caret t={t} h={fs * 0.8} color={pal.hot} />}
                  <span style={{ opacity: 0.13 }}>{w.title.slice(shownTitle.length)}</span>
                  {w.titleMark && <Ink mark={w.titleMark} at={tm} t={t} color={pal.hot} font={f.ui} />}
                </span>
              </div>
              {w.lines.length > 0 && (
                <div style={{ marginTop: paper ? 16 : 26, display: 'flex', flexDirection: 'column', gap: 12, alignItems: paper ? 'center' : 'flex-start' }}>
                  {w.lines.map((l, i) => (
                    <div key={i} style={{ fontFamily: f.ui, fontWeight: 500, fontSize: paper ? (P ? 34 : 30) : P ? 42 : 38, lineHeight: 1.3, color: pal.fg, opacity: 0.13 + 0.87 * prog(t, lineAts[i] - 4, lineAts[i] + 8), transform: `translateY(${((1 - prog(t, lineAts[i] - 4, lineAts[i] + 10, outE)) * 14).toFixed(1)}px)` }}>
                      <span style={{ position: 'relative' }}>
                        {l.text}
                        {l.mark && <Ink mark={l.mark} at={markAts[i]} t={t} color={pal.hot} font={f.ui} />}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {paper && w.byline && <div style={{ ...mono, fontSize: P ? 22 : 19, marginTop: 8, opacity: prog(t, bodyAt - 8, bodyAt + 8) }}>{w.byline}</div>}
              {w.body.length > 0 && (
                // real body copy, written out; in a paper it is the justified abstract block, in a post a quoted block
                <div style={{ marginTop: paper ? 22 : 24, width: paper ? '84%' : '100%', boxSizing: 'border-box', paddingLeft: paper ? 0 : 26, borderLeft: paper ? 'none' : `5px solid ${pal.hot}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {w.body.map((b, i) => {
                    const shown = typed(b, t, bodyAts[i], bcps);
                    return (
                      <div key={i} style={{ fontFamily: f.ui, fontStyle: paper ? 'normal' : 'italic', fontWeight: 500, fontSize: bfs, lineHeight: 1.36, color: pal.fg, textAlign: paper ? 'justify' : 'left' }}>
                        {paper && i === 0 && <b style={{ fontWeight: 700 }}>Abstract. </b>}
                        {shown}
                        <span style={{ opacity: 0.13 }}>{b.slice(shown.length)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {forum && (
                <div style={{ marginTop: 20, display: 'flex', gap: 14, opacity: prog(t, greekAt, greekAt + 12) }}>
                  {['KUTIP', 'BALAS', 'LAPORKAN'].map((x) => (
                    <div key={x} style={{ ...mono, fontSize: P ? 20 : 17, padding: '7px 16px', border: `1.5px solid ${pal.line}`, borderRadius: 5 }}>{x}</div>
                  ))}
                </div>
              )}
              {paper && <div style={{ alignSelf: 'flex-start', marginTop: 22, fontFamily: f.ui, fontWeight: 700, fontSize: P ? 32 : 28, color: pal.fg, opacity: prog(t, greekAt, greekAt + 10) }}>1. Introduction</div>}
              <div style={{ marginTop: paper ? 14 : 24, width: '100%' }}>{greek(P ? 1 : 2, paper ? (P ? 6 : 3) : greekRows, greekAt + 6, paper ? -1 : 1)}</div>
            </Shell>
          );
        },
        hits: [...(w.titleMark ? [{ at: tm + 6, kind: 'punch' as const }] : []), ...w.lines.filter((l) => l.mark).map((l) => ({ at: cue(l.mark!.at) + 6, kind: 'punch' as const }))],
        sfx: [[tAt, 'type', 0.3] as Sfx, ...bodyAts.map((a): Sfx => [a, 'type', 0.22]), ...markAts.filter(Boolean).map((a): Sfx => [a, 'slash', 0.25])],
      };
    }
    case 'newspaper': {
      const at = cue(w.at);
      // break the headline into ~3 printed lines by words
      const words = w.headline.split(/\s+/);
      const per = Math.ceil(words.length / (w.headline.length > 40 ? 3 : 2));
      const lines: string[] = [];
      for (let i = 0; i < words.length; i += per) lines.push(words.slice(i, i + per).join(' '));
      const hs = Math.min(...lines.map((l) => fitSize(l, f.disp, 700, P ? 92 : 84, box.w, -0.02)));
      const ms = fitSize(w.masthead.toUpperCase(), f.disp, 700, P ? 110 : 96, box.w, 0.02);
      return {
        node: (t) => (
          <Shell box={box} center>
            <div style={{ fontFamily: f.disp, fontWeight: 700, fontSize: ms, letterSpacing: '0.02em', color: pal.fg, whiteSpace: 'nowrap', lineHeight: 1 }}>{w.masthead.toUpperCase()}</div>
            <div style={{ width: '100%', borderTop: `3px solid ${pal.fg}`, borderBottom: `1px solid ${pal.fg}`, height: 6, margin: '18px 0 10px' }} />
            <div style={{ fontFamily: f.mono, fontSize: P ? 24 : 22, letterSpacing: '0.16em', color: pal.muted, whiteSpace: 'nowrap' }}>{w.date.toUpperCase()}</div>
            <div style={{ width: '100%', borderTop: `1px solid ${pal.fg}`, margin: '10px 0 34px' }} />
            {lines.map((l, i) => {
              const p = prog(t, at + i * 12, at + i * 12 + 14, inOut);
              return (
                <div key={i} data-fit="1" style={{ position: 'relative', fontFamily: f.disp, fontWeight: 700, fontSize: hs, letterSpacing: '-0.02em', lineHeight: 1.08, color: pal.fg, whiteSpace: 'nowrap' }}>
                  <span style={{ opacity: 0.1 }}>{l}</span>
                  <span style={{ position: 'absolute', left: 0, top: 0, clipPath: `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)` }}>{l}</span>
                </div>
              );
            })}
            {w.sub && <div style={{ marginTop: 24, fontFamily: f.ui, fontStyle: 'italic', fontSize: P ? 36 : 32, color: pal.muted, opacity: prog(t, at + lines.length * 12 + 8, at + lines.length * 12 + 20) }}>{w.sub}</div>}
            {/* column filler: grey body-text bars */}
            <div style={{ marginTop: 30, width: '100%', display: 'grid', gridTemplateColumns: P ? '1fr 1fr' : '1fr 1fr 1fr', gap: 28 }}>
              {Array.from({ length: P ? 2 : 3 }, (_, c) => (
                <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c === 0 && <div style={{ height: P ? 150 : 96, background: 'linear-gradient(140deg, #3A3128, #7A6A56), radial-gradient(rgba(31,26,20,0.3) 1.6px, transparent 1.8px) 0 0 / 8px 8px', backgroundBlendMode: 'multiply', opacity: prog(t, at + 6, at + 30) }} />}
                  {Array.from({ length: c === 0 ? (P ? 6 : 4) : P ? 14 : 11 }, (_, r) => {
                    const a0 = at + 20 + (c * 4 + r) * 9;
                    return <div key={r} style={{ height: 8, borderRadius: 2, background: pal.fg, opacity: 0.22, width: `${((100 - ((r * 13 + c * 7) % 30)) * prog(t, a0, a0 + 18, inOut)).toFixed(2)}%` }} />;
                  })}
                </div>
              ))}
            </div>
          </Shell>
        ),
        hits: [{ at, kind: 'punch' }],
        sfx: lines.map((_, i): Sfx => [at + i * 12, 'type', 0.3]),
      };
    }
    case 'cutout': {
      const n = w.figures.length;
      const ats = w.figures.map((x) => cue(x.at));
      const size = Math.min(P ? 300 : 320, (box.w - (n - 1) * 70) / n, box.h * 0.5);
      const capAt = w.captionAt ? cue(w.captionAt) : ats[n - 1] + 10;
      const linkAt = w.link ? cue(w.link.at) : 0;
      const strikeAt = w.strike ? cue(w.strike.at) : 0;
      const gap = (box.w - n * size) / Math.max(1, n + 1);
      const cx = (i: number) => gap + i * (size + gap) + size / 2;
      const rowY = box.h * (w.caption ? 0.42 : 0.5);
      const sp: ShapePal = { ink: pal.fg, paper: pal.bg, hot: pal.hot };
      const vOf = (i: number) => w.figures[i].look ?? i;
      return {
        node: (t) => (
          <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h }}>
            {w.meta && <div style={{ position: 'absolute', left: 0, top: 0, fontFamily: f.mono, fontWeight: 500, fontSize: P ? 26 : 24, letterSpacing: '0.18em', color: pal.muted, whiteSpace: 'nowrap' }}>{typed(w.meta.toUpperCase(), t, k.arrive - 18, 1.2)}</div>}
            {w.figures.map((fig, i) => {
              const p = pop(t, ats[i], 4);
              const on = t >= ats[i] - 1;
              if (!on)
                return (
                  <svg key={i} viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', left: cx(i) - size / 2, top: rowY - size / 2, opacity: 0.1 }}>
                    {SHAPE[fig.shape](sp, vOf(i))}
                  </svg>
                );
              return (
                <div key={i} style={{ position: 'absolute', left: cx(i) - size / 2, top: rowY - size / 2, width: size, height: size, transform: `translateY(${((1 - Math.min(1, p)) * 30).toFixed(1)}px) rotate(${((1 - Math.min(1, p)) * (i % 2 ? 6 : -6)).toFixed(2)}deg) scale(${Math.max(0, p).toFixed(3)})` }}>
                  <div style={{ position: 'absolute', left: -size * 0.09, top: -size * 0.09, width: size * 1.18, height: size * 1.18, background: `radial-gradient(rgba(31,26,20,0.16) 1.6px, transparent 1.8px) 0 0 / 10px 10px, ${pal.inset}`, boxShadow: '0 14px 22px -12px rgba(0,0,0,0.5)', transform: `rotate(${i % 2 ? 2.2 : -2.6}deg)` }}>
                    <div style={{ position: 'absolute', left: '50%', top: -16, width: 90, height: 30, marginLeft: -45, background: 'rgba(226,205,150,0.85)', transform: `rotate(${i % 2 ? -4 : 3}deg)` }} />
                  </div>
                  <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(5px 7px 0 rgba(0,0,0,0.22))' }}>{SHAPE[fig.shape](sp, vOf(i))}</svg>
                  {fig.label && <div style={{ position: 'absolute', left: -40, right: -40, top: size * 1.09 + 14, textAlign: 'center', fontFamily: f.mono, fontWeight: 500, fontSize: P ? 26 : 24, letterSpacing: '0.1em', color: pal.fg, whiteSpace: 'nowrap' }}>{fig.label.toUpperCase()}</div>}
                  {w.strike && w.strike.index === i && (
                    <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                      <path d="M 6 8 L 94 92" pathLength={1} stroke={pal.hot} strokeWidth={9} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(t, strikeAt, strikeAt + 8, inOut)} />
                      <path d="M 94 8 L 6 92" pathLength={1} stroke={pal.hot} strokeWidth={9} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(t, strikeAt + 6, strikeAt + 14, inOut)} />
                    </svg>
                  )}
                </div>
              );
            })}
            {w.link && w.link.from < n && w.link.to < n && (
              <svg width={box.w} height={box.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                <path d={`M ${cx(w.link.from)} ${rowY} Q ${(cx(w.link.from) + cx(w.link.to)) / 2} ${rowY - size * 0.9} ${cx(w.link.to)} ${rowY}`} pathLength={1} fill="none" stroke={pal.hot} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - prog(t, linkAt, linkAt + 16, inOut)} />
              </svg>
            )}
            {w.caption && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: rowY + size * 0.59 + (w.figures.some((x) => x.label) ? 70 : 34), textAlign: 'center', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: P ? 54 : 50, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.15, color: pal.fg }}>
                <span style={{ position: 'relative' }}>
                  <span style={{ opacity: 0.12 }}>{w.caption}</span>
                  <span style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}>
                    <Chars text={w.caption} t={t} at={capAt - 4} step={0.9} />
                  </span>
                </span>
              </div>
            )}
          </div>
        ),
        hits: [...(w.link ? [{ at: linkAt + 14, kind: 'punch' as const }] : []), ...(w.strike ? [{ at: strikeAt + 10, kind: 'punch' as const }] : [])],
        sfx: [...ats.map((a): Sfx => [a, 'pop', 0.35]), ...(w.strike ? [[strikeAt, 'slash', 0.35] as Sfx] : [])],
      };
    }
    case 'receipt': {
      const at = cue(w.at);
      const rw = Math.min(box.w, P ? 820 : 780);
      return {
        node: (t) => (
          <Shell box={box} center>
            <div style={{ width: rw, background: '#FBF7EE', boxShadow: '0 24px 40px -20px rgba(0,0,0,0.45)', padding: '40px 46px 54px', boxSizing: 'border-box', clipPath: 'polygon(0 0, 100% 0, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%)', transform: `rotate(-1.5deg) translateY(${((1 - prog(t, k.arrive - 20, k.arrive + 4, outE)) * 60).toFixed(1)}px)` }}>
              <div style={{ textAlign: 'center', fontFamily: f.mono, fontWeight: 600, fontSize: P ? 34 : 32, letterSpacing: '0.2em', color: '#1F1A14' }}>{w.title.toUpperCase()}</div>
              <div style={{ borderTop: '2px dashed rgba(31,26,20,0.4)', margin: '22px 0' }} />
              {w.rows.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontFamily: f.mono, fontSize: P ? 38 : 36, lineHeight: 1.65, color: '#1F1A14', opacity: 0.18 + 0.82 * prog(t, at + i * 7, at + i * 7 + 6) }}>
                  <span style={{ opacity: 0.6 }}>{r.k}</span>
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {typed(r.v, t, at + i * 7, 2.2)}
                    <span style={{ opacity: 0.25 }}>{r.v.slice(typed(r.v, t, at + i * 7, 2.2).length)}</span>
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '2px dashed rgba(31,26,20,0.4)', margin: '22px 0 18px' }} />
              <div style={{ display: 'flex', alignItems: 'stretch', height: P ? 70 : 62, gap: 0, opacity: prog(t, at + w.rows.length * 7, at + w.rows.length * 7 + 14) }}>
                {Array.from({ length: 56 }, (_, i) => (
                  <div key={i} style={{ flex: 1 + ((i * 7 + w.title.length) % 3), background: i % 2 ? 'transparent' : '#1F1A14' }} />
                ))}
              </div>
            </div>
          </Shell>
        ),
        hits: [{ at: at + w.rows.length * 7, kind: 'punch' }],
        sfx: w.rows.map((_, i): Sfx => [at + i * 7, 'tick', 0.3]),
      };
    }
    default:
      return null;
  }
};
