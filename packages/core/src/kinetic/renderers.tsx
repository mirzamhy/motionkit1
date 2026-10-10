// Typographic versions of every widget for the kinetic engine: no cards, giant fitted type on a colour field,
// everything revealed on its VO word. Each scene leaves room for the "portal" disc the camera zooms through next.
import React from 'react';
import { Easing } from 'remotion';
import { Caret, Chars, Mark, Odo, Strike, scrambleText } from '../engine/atoms';
import { fitSize } from '../engine/fit';
import { GREEN } from '../engine/looks';
import type { Ctx, Hit, Sfx } from '../engine/types';
import { clamp01, inOut, lin, pop, prog, typed } from '../engine/util';
import type { Widget } from '../spec/schema';
import { archiveWidget } from '../archive/renderers';

export type KPal = { bg: string; fg: string; muted: string; hot: string; line: string; inset: string };
export type Box = { x: number; y: number; w: number; h: number };
export type KCtx = Ctx & { pal: KPal; box: Box; fw: number; fh: number };
export type KOut = { node: (t: number) => React.ReactNode; hits?: Hit[]; sfx?: Sfx[] };

/** the scene's text block, vertically centred in its box so tall frames (portrait) don't leave a hole */
const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', ...style }}>
    <div style={{ position: 'relative', width: '100%' }}>{children}</div>
  </div>
);

/** a giant line: measured to the box, glyphs rise on their cues */
const Big: React.FC<{ k: KCtx; parts: { text: string; at: number; accent?: boolean; strike?: number }[]; max: number; t: number; color?: string; gap?: number; ghost?: boolean }> = ({ k, parts, max, t, color, gap = 0.22, ghost }) => {
  const f = k.f;
  const str = parts.map((p) => p.text).join(gap ? ' ' : '');
  // 4 % slack: glyph-by-glyph spans and the column gap measure a hair wider than the plain string
  const size = fitSize(str, f.disp, f.dispWeight, max, k.box.w * 0.96, f.dispTrack);
  return (
    <div data-fit="1" style={{ position: 'relative', display: 'flex', columnGap: size * gap, whiteSpace: 'nowrap', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.02, color: color ?? k.pal.fg, maxWidth: k.box.w }}>
      {/* faint outline of the full line, so a scene is never empty before its words are spoken */}
      {ghost && <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', columnGap: size * gap, color: 'transparent', WebkitTextStroke: `2px ${color ?? k.pal.fg}`, opacity: 0.18 * (1 - prog(t, parts[0].at - 4, parts[parts.length - 1].at + 10)) }}>{parts.map((p, i) => <span key={i}>{p.text}</span>)}</div>}
      {parts.map((p, i) => (
        <span key={i} style={{ position: 'relative', opacity: p.strike !== undefined ? 1 - 0.5 * prog(t, p.strike, p.strike + 12) : 1 }}>
          <Chars text={p.text} t={t} at={p.at - 4} step={1.8} style={p.accent ? { color: k.pal.hot } : undefined} />
          {p.strike !== undefined && <Strike t={t} at={p.strike} color={k.pal.hot} />}
        </span>
      ))}
    </div>
  );
};

const Kicker: React.FC<{ k: KCtx; text: string; t: number; at: number }> = ({ k, text, t, at }) => (
  <div style={{ fontFamily: k.f.mono, fontWeight: 500, fontSize: k.P ? 30 : 30, letterSpacing: '0.32em', color: k.pal.muted, height: 40, whiteSpace: 'nowrap' }}>{typed(text, t, at, 0.7)}</div>
);

const Tag: React.FC<{ k: KCtx; text: string; t: number; at: number; solid?: boolean }> = ({ k, text, t, at, solid }) => {
  const p = pop(t, at, 4);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, background: solid ? k.pal.hot : 'transparent', border: `3px solid ${solid ? k.pal.hot : k.pal.fg}`, color: solid ? k.pal.bg.startsWith('linear') ? '#111' : k.pal.bg : k.pal.fg, fontFamily: k.f.ui, fontWeight: 700, fontSize: 28, letterSpacing: '0.12em', transform: `scale(${p.toFixed(3)}) rotate(-3deg)`, transformOrigin: 'left center', whiteSpace: 'nowrap' }}>
      {text}
    </div>
  );
};

const Dash: React.FC<{ k: KCtx; p: number; h?: number }> = ({ k, p, h = 10 }) => (
  <div style={{ width: k.box.w, height: h, background: k.pal.line, borderRadius: h }}>
    <div style={{ width: `${(clamp01(p) * 100).toFixed(2)}%`, height: '100%', borderRadius: h, background: k.pal.hot }} />
  </div>
);

/** text colour for something filled with pal.fg: the field colour when it is solid, else whatever contrasts with fg */
const onFg = (pal: KPal) => {
  if (!pal.bg.startsWith('linear') && !pal.bg.startsWith('radial')) return pal.bg;
  const m = /^#([0-9a-f]{6})$/i.exec(pal.fg);
  if (!m) return '#111214';
  const n = parseInt(m[1], 16);
  const l = 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return l < 140 ? '#FFFFFF' : '#111214';
};

export const kineticWidget = (w: Widget, k: KCtx): KOut => {
  const { cue, f, pal, box } = k;
  const P = k.P;
  switch (w.type) {
    case 'hero': {
      const nameAt = w.name.map((n) => cue(n.at));
      const accAt = w.accentWord ? cue(w.accentWord.at) : null;
      const kickAt = w.kickerAt ? cue(w.kickerAt) : nameAt[0] - 30;
      const last = accAt ?? nameAt[nameAt.length - 1];
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <Tag k={k} text={w.badge} t={t} at={k.index === 0 ? -8 : k.arrive - 12} solid />
            <div style={{ height: P ? 60 : 44 }} />
            {w.kicker && <Kicker k={k} text={w.kicker} t={t} at={kickAt} />}
            <Big k={k} t={t} max={P ? 210 : 230} gap={0} ghost parts={w.name.map((n, i) => ({ text: n.text, at: nameAt[i], accent: n.accent }))} />
            {w.accentWord && accAt !== null && (
              <div style={{ transform: `scale(${pop(t, accAt - 3, 4).toFixed(3)})`, transformOrigin: 'left center', opacity: t >= accAt - 3 ? 1 : 0 }}>
                <Big k={k} t={t} max={P ? 230 : 210} parts={[{ text: w.accentWord.text, at: accAt - 6 }]} color={pal.hot} />
              </div>
            )}
            {w.id && (
              <div style={{ marginTop: 30, fontFamily: f.mono, fontSize: 34, color: pal.fg, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', opacity: prog(t, nameAt[0] - 6, nameAt[0] + 4) }}>
                <span style={{ color: pal.hot, marginRight: 14 }}>$</span>
                {typed(w.id, t, nameAt[0] - 4, w.id.length / Math.max(24, last - nameAt[0]))}
                <Caret t={t} h={34} color={pal.hot} />
              </div>
            )}
            {w.status && <div style={{ marginTop: 18, fontFamily: f.ui, fontWeight: 600, fontSize: 34, color: pal.muted, opacity: prog(t, last + 4, last + 16) }}>{w.status}</div>}
          </Abs>
        ),
        hits: [...(accAt !== null ? [{ at: accAt, kind: 'shake' as const }, { at: accAt, kind: 'punch' as const }] : []), { at: nameAt[0], kind: 'punch' as const }],
        sfx: [[nameAt[0] - 4, 'type', 0.35], ...(accAt !== null ? ([[accAt - 3, 'impact', 0.5]] as Sfx[]) : [])],
      };
    }
    case 'stat': {
      const from = cue(w.from);
      const to = cue(w.to) + 10;
      const loc = k.spec.language === 'id' ? 'id-ID' : 'en-US';
      const finalTxt = `${w.prefix ?? ''}${w.value.toLocaleString(loc)}${w.suffix ?? ''}`;
      const size = fitSize(finalTxt, f.disp, f.dispWeight, P ? 230 : 250, box.w, f.dispTrack);
      return {
        node: (t) => {
          const fill = prog(t, from - 4, to, Easing.bezier(0.3, 0, 0.2, 1));
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
              <Kicker k={k} text={w.label} t={t} at={k.arrive - 20} />
              <div data-fit="1" style={{ marginTop: 20, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, color: pal.fg, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {w.reveal === 'scramble' ? <span style={{ opacity: prog(t, from - 2, from + 8) }}>{scrambleText(finalTxt, t, to - 24, 24)}</span> : `${w.prefix ?? ''}${Math.round(w.value * fill).toLocaleString(loc)}${w.suffix ?? ''}`}
              </div>
              <div style={{ marginTop: 26, fontFamily: f.ui, fontWeight: 600, fontSize: P ? 44 : 46, color: pal.fg, opacity: prog(t, from + 6, from + 20) }}>{w.caption}</div>
              <div style={{ marginTop: 40 }}>
                <Dash k={k} p={fill} h={14} />
              </div>
              <div style={{ marginTop: 22, display: 'flex', gap: 14 }}>
                {(w.chips ?? []).map((c, i) => (
                  <span key={c} style={{ fontFamily: f.mono, fontSize: 26, color: pal.muted, opacity: prog(t, from + 4 + i * 6, from + 14 + i * 6) }}>
                    + {c}
                  </span>
                ))}
              </div>
            </Abs>
          );
        },
        hits: [{ at: cue(w.to), kind: 'punch' }],
        sfx: [[from, 'roll', 0.35]],
      };
    }
    case 'vision': {
      const s0 = cue(w.scanFrom);
      const s1 = cue(w.scanTo);
      const iw = Math.min(box.w, P ? 900 : 760);
      const ih = iw * 0.52;
      const boxes: [number, number, number, number][] = [
        [0.05, 0.08, 0.42, 0.16],
        [0.05, 0.33, 0.6, 0.6],
        [0.72, 0.72, 0.23, 0.18],
      ];
      return {
        node: (t) => {
          const scan = prog(t, s0 - 2, s1 + 22, lin);
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
              <Kicker k={k} text={w.label} t={t} at={k.arrive - 20} />
              <Big k={k} t={t} max={P ? 150 : 140} parts={(w.chip ?? w.label).split(' ').map((x, i) => ({ text: x, at: s0 + i * 6 }))} />
              <div style={{ position: 'relative', marginTop: 34, width: iw, height: ih, borderRadius: 22, background: '#F4F4F1', overflow: 'hidden', boxShadow: `14px 14px 0 ${pal.hot}` }}>
                <div style={{ position: 'absolute', left: iw * 0.05, top: ih * 0.1, width: iw * 0.38, height: ih * 0.055, borderRadius: 6, background: '#2A2B30' }} />
                <div style={{ position: 'absolute', left: iw * 0.05, top: ih * 0.35, width: iw * 0.6, height: ih * 0.58, display: 'flex', alignItems: 'flex-end', gap: iw * 0.02, borderBottom: '3px solid #2A2B30' }}>
                  {[0.34, 0.46, 0.4, 0.62, 0.74, 0.92].map((b, i, arr) => (
                    <div key={i} style={{ flex: 1, height: `${b * 100}%`, borderRadius: '6px 6px 0 0', background: i === arr.length - 1 ? k.look.hot : '#3A3B41' }} />
                  ))}
                </div>
                <div style={{ position: 'absolute', left: iw * 0.72, top: ih * 0.74, width: iw * 0.23, height: ih * 0.14, borderRadius: 999, background: '#2A2B30' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: scan * ih - 3, height: 5, background: k.look.hot, opacity: scan > 0 && scan < 1 ? 1 : 0, boxShadow: `0 0 22px ${k.look.hot}` }} />
                {w.detect.map((label, i) => {
                  const a = s1 - 10 + i * 7;
                  if (t < a) return null;
                  const [bx, by, bw, bh] = boxes[i];
                  return (
                    <div key={label} style={{ position: 'absolute', left: bx * iw - 6, top: by * ih - 6, width: bw * iw + 12, height: bh * ih + 12, border: `4px solid ${k.look.hot}`, borderRadius: 10, opacity: clamp01(pop(t, a, 3.5) * 1.4), boxSizing: 'border-box' }}>
                      <div style={{ position: 'absolute', left: 4, top: 4, background: k.look.hot, color: '#FFF', fontFamily: f.mono, fontWeight: 600, fontSize: 22, padding: '3px 10px', borderRadius: 6 }}>{label}</div>
                    </div>
                  );
                })}
              </div>
              {w.result && <div style={{ marginTop: 26, fontFamily: f.mono, fontSize: 32, color: pal.fg }}>{typed(w.result, t, s1 - 6, 0.9)}</div>}
            </Abs>
          );
        },
        hits: [{ at: s1, kind: 'punch' }],
        sfx: [[s0 + 2, 'scan', 0.45]],
      };
    }
    case 'code': {
      const from = cue(w.from) - 8;
      const chars = w.lines.reduce((a, l) => a + l.length, 0);
      const doneAt = w.doneAt ? cue(w.doneAt) + 12 : from + Math.ceil(chars / 2.4) + 14;
      const longest = w.lines.reduce((a, l) => (l.length > a.length ? l : a), '');
      const fs = fitSize(longest + '00', f.mono, 500, P ? 46 : 52, box.w);
      return {
        node: (t) => {
          let budget = Math.max(0, Math.floor((t - from) * 2.4));
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
              <Kicker k={k} text={w.label} t={t} at={k.arrive - 20} />
              <div style={{ marginTop: 26, fontFamily: f.mono, fontSize: fs, lineHeight: 1.5, color: pal.fg }}>
                {w.lines.map((ln, i) => {
                  const take = Math.min(ln.length, Math.max(0, budget));
                  budget -= take;
                  return (
                    <div key={i} style={{ whiteSpace: 'pre', height: fs * 1.5 }}>
                      <span style={{ color: pal.muted, marginRight: fs * 0.8 }}>{String(i + 1).padStart(2, ' ')}</span>
                      {ln.slice(0, take)}
                      {take > 0 && take < ln.length ? <Caret t={t} h={fs} color={pal.hot} /> : null}
                    </div>
                  );
                })}
              </div>
              {w.done && (
                <div style={{ marginTop: 30, display: 'inline-flex', alignItems: 'center', gap: 16, fontFamily: f.ui, fontWeight: 700, fontSize: 40, color: pal.bg.startsWith('linear') ? pal.fg : GREEN, opacity: prog(t, doneAt, doneAt + 10), transform: `scale(${pop(t, doneAt, 4).toFixed(3)})`, transformOrigin: 'left center' }}>
                  ✓ {w.done}
                </div>
              )}
            </Abs>
          );
        },
        hits: [{ at: doneAt, kind: 'punch' }],
        sfx: [[from + 2, 'type', 0.35], ...(w.done ? ([[doneAt, 'chime', 0.3]] as Sfx[]) : [])],
      };
    }
    case 'price': {
      const cut = cue(w.cutAt);
      const bAt = w.badge ? cue(w.badge.at) : null;
      const oursSize = Math.min(...w.rows.map((r) => fitSize(r.ours, f.disp, f.dispWeight, P ? 170 : (w.rows.length > 1 ? 150 : 210), box.w * (P ? 0.9 : 0.62), f.dispTrack)));
      const offSize = Math.min(...w.rows.map((r) => fitSize(r.official, f.disp, 500, P ? 64 : 60, box.w * 0.5, -0.03)));
      return {
        node: (t) => {
          const cutP = prog(t, cut - 2, cut + 8, Easing.bezier(0.5, 0, 0.2, 1));
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
              <Kicker k={k} text={w.title} t={t} at={k.arrive - 24} />
              {w.rows.map((r, i) => (
                <div key={r.label} style={{ marginTop: i ? 26 : 22 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: f.ui, fontWeight: 700, fontSize: 40, color: pal.fg }}>{r.label}</span>
                    <span style={{ position: 'relative', fontFamily: f.disp, fontWeight: 500, fontSize: offSize, color: pal.muted, opacity: 1 - clamp01((t - cut) / 6) * 0.4 }}>
                      {r.official}
                      <span style={{ position: 'absolute', left: -8, right: -8, top: '52%', height: 8, borderRadius: 4, background: pal.hot, transform: `scaleX(${cutP.toFixed(3)}) rotate(-4deg)`, transformOrigin: 'left center' }} />
                    </span>
                    {r.officialSub && <span style={{ fontFamily: f.mono, fontSize: 24, color: pal.muted }}>{r.officialSub}</span>}
                  </div>
                  <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: oursSize, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.04, whiteSpace: 'nowrap' }}>
                    <Odo text={r.ours} t={t} at={cut + 2 + i * 6} color={pal.hot} ghost={pal.line} />
                  </div>
                </div>
              ))}
              {w.badge && bAt !== null && (
                <div style={{ position: 'absolute', right: P ? 0 : -40, top: P ? 40 : 0, width: 230, height: 230, borderRadius: 115, background: pal.fg, color: onFg(pal), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `rotate(${(-12 + (1 - pop(t, bAt - 3, 4)) * 40).toFixed(1)}deg) scale(${pop(t, bAt - 3, 4).toFixed(3)})`, opacity: t >= bAt - 3 ? 1 : 0 }}>
                  <div style={{ fontFamily: f.mono, fontWeight: 600, fontSize: 22, letterSpacing: '0.24em' }}>{w.badge.top}</div>
                  <div style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: fitSize(w.badge.value, f.disp, f.dispWeight, 70, 190, f.dispTrack), letterSpacing: `${f.dispTrack}em` }}>{w.badge.value}</div>
                </div>
              )}
              <div style={{ marginTop: 28, maxWidth: box.w, fontFamily: f.mono, fontSize: P ? 20 : 18, lineHeight: 1.5, color: pal.muted }}>{w.finePrint}</div>
            </Abs>
          );
        },
        hits: [{ at: cut, kind: 'flashBrand' }, { at: cut, kind: 'shake' }, { at: cut, kind: 'punch' }, ...(bAt !== null ? [{ at: bAt, kind: 'shake' as const }, { at: bAt, kind: 'punch' as const }] : [])],
        sfx: [[cut - 3, 'slash', 0.6], [cut + 3, 'roll', 0.5], ...(bAt !== null ? ([[bAt - 4, 'stamp', 0.6]] as Sfx[]) : [])],
      };
    }
    case 'agents': {
      const go = cue(w.goAt);
      const headAt = w.headline.map((h) => cue(h.at));
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <Big k={k} t={t} max={P ? 170 : 170} parts={w.headline.map((h, i) => ({ text: h.text, at: headAt[i], accent: h.accent }))} />
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: P ? 26 : 20 }}>
              {w.items.map((it, i) => {
                const st = go + 2 + i * 4;
                const fast = prog(t, st, st + 16, Easing.bezier(0.3, 0, 0.1, 1));
                const slow = 0.08 + 0.1 * prog(t, k.arrive - 30, go, lin);
                const p = slow + (1 - slow) * fast;
                const done = t >= st + 16;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap' }}>
                    <span style={{ width: P ? 230 : 250, fontFamily: f.mono, fontWeight: 600, fontSize: 30, color: pal.fg }}>{it.name}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: f.ui, fontWeight: 600, fontSize: 30, color: pal.muted, marginBottom: 8 }}>{it.task}</div>
                      <div style={{ height: 10, borderRadius: 5, background: pal.line }}>
                        <div style={{ width: `${(p * 100).toFixed(1)}%`, height: '100%', borderRadius: 5, background: pal.hot }} />
                      </div>
                    </div>
                    <span style={{ width: 44, fontSize: 36, color: done ? GREEN : pal.muted }}>{done ? '✓' : ''}</span>
                  </div>
                );
              })}
            </div>
          </Abs>
        ),
        hits: [...(w.effect !== 'none' ? [{ at: go, kind: w.effect === 'bolt' ? ('bolt' as const) : ('whip' as const) }] : []), { at: go, kind: 'flash' }, { at: go + 1, kind: 'shake' }, ...(headAt.length > 1 ? [{ at: headAt[1], kind: 'punch' as const }] : [])],
        sfx: [[go - 8, w.effect === 'bolt' ? 'impact' : 'whip', 0.8], ...w.items.map((_, i): Sfx => [go + 18 + i * 4, 'tick', 0.3])],
      };
    }
    case 'lockup': {
      const logoAt = cue(w.logoAt);
      const dot = w.wordmark.lastIndexOf('.');
      const head = dot > 0 ? w.wordmark.slice(0, dot) : w.wordmark;
      const tail = dot > 0 ? w.wordmark.slice(dot) : '';
      const markSize = P ? 170 : 180;
      const wm = fitSize(w.wordmark, f.disp, f.dispWeight, P ? 150 : 190, k.fw - 260 - markSize, f.dispTrack);
      return {
        node: (t) => {
          const logo = t < logoAt - 4 ? 0 : pop(t, logoAt - 4, 4);
          const chips = prog(t, logoAt + 8, logoAt + 24);
          return (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, color: pal.fg, paddingBottom: P ? 220 : 120 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 36, transform: `scale(${(0.86 + 0.14 * logo).toFixed(3)})` }}>
                <Mark ctx={k} size={markSize} id={`kmk${P ? 'p' : 'l'}`} />
                <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: wm, letterSpacing: `${f.dispTrack}em`, whiteSpace: 'nowrap' }}>
                  {head}
                  <span style={{ color: k.spec.brand.color ?? pal.hot }}>{tail}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: P ? 'column' : 'row', gap: 18, alignItems: 'center', opacity: chips }}>
                {w.chips.map((c, i) => (
                  <div key={i} style={{ whiteSpace: 'nowrap', padding: '16px 30px', borderRadius: 999, fontFamily: c.style === 'dark' ? f.mono : f.ui, fontWeight: c.style === 'dark' ? 500 : 700, fontSize: 34, background: c.style === 'dark' ? pal.fg : pal.hot, color: c.style === 'dark' ? onFg(pal) : '#FFFFFF' }}>
                    {c.text}
                  </div>
                ))}
              </div>
              {w.cta && <div style={{ fontFamily: f.ui, fontWeight: 700, fontSize: 48, opacity: t >= logoAt + 20 ? 1 : 0, transform: `scale(${clamp01(pop(t, logoAt + 20, 5) * 1.1).toFixed(3)})` }}>{w.cta} →</div>}
              {w.finePrint && <div style={{ maxWidth: k.fw - 240, textAlign: 'center', fontFamily: f.mono, fontSize: P ? 18 : 17, lineHeight: 1.5, color: pal.muted, opacity: chips }}>{w.finePrint}</div>}
            </div>
          );
        },
        hits: [{ at: logoAt, kind: 'shake' }, { at: logoAt, kind: 'punch' }],
        sfx: [[logoAt - 3, 'impact', 0.45], ...(w.cta ? ([[logoAt + 18, 'chime', 0.4]] as Sfx[]) : [])],
      };
    }
    case 'headline': {
      const ats = w.lines.map((ln) => ln.map((x) => cue(x.at)));
      const subAt = ats[ats.length - 1][ats[ats.length - 1].length - 1] + 10;
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            {w.lines.map((ln, li) => (
              <Big key={li} k={k} t={t} max={P ? 200 : 220} parts={ln.map((x, i) => ({ text: x.text, at: ats[li][i], accent: x.accent, strike: x.strike ? cue(x.strike) : undefined }))} />
            ))}
            {w.sub && <div style={{ marginTop: 30, fontFamily: f.ui, fontWeight: 600, fontSize: 46, color: pal.muted, opacity: prog(t, subAt, subAt + 14) }}>{w.sub}</div>}
          </Abs>
        ),
        hits: ats.map((a) => ({ at: a[0], kind: 'punch' as const })),
      };
    }
    case 'chat': {
      const ats = w.messages.map((m) => cue(m.at));
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <Kicker k={k} text={w.title.toUpperCase()} t={t} at={k.arrive - 20} />
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>
              {w.messages.map((m, i) => {
                const ai = m.from === 'ai';
                if (t < ats[i] - (ai ? 18 : 6)) return null;
                const typing = ai && t < ats[i];
                return (
                  <div key={i} style={{ alignSelf: ai ? 'flex-start' : 'flex-end', maxWidth: '88%', padding: '22px 30px', borderRadius: 30, background: ai ? pal.fg : pal.hot, color: ai ? onFg(pal) : '#FFFFFF', fontFamily: f.ui, fontWeight: 600, fontSize: P ? 40 : 42, lineHeight: 1.3, transform: `scale(${Math.min(1, 0.85 + 0.15 * pop(t, ats[i] - (ai ? 0 : 6), 4)).toFixed(3)})`, transformOrigin: ai ? 'left bottom' : 'right bottom' }}>
                    {typing ? '•••'.slice(0, 1 + (Math.floor(t / 6) % 3)) : ai ? typed(m.text, t, ats[i], 1.8) : m.text}
                  </div>
                );
              })}
            </div>
          </Abs>
        ),
        sfx: ats.map((a, i): Sfx => [a - (w.messages[i].from === 'ai' ? 0 : 6), 'pop', 0.45]),
      };
    }
    case 'bars': {
      const from = cue(w.from);
      const max = Math.max(...w.items.map((i) => i.value)) || 1;
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <Kicker k={k} text={w.title.toUpperCase()} t={t} at={k.arrive - 20} />
            <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 26 }}>
              {w.items.map((it, i) => {
                const p = prog(t, from + i * 6, from + i * 6 + 28);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: f.ui, fontWeight: it.highlight ? 800 : 600, fontSize: 36, color: it.highlight ? pal.fg : pal.muted }}>
                      <span>{it.label}</span>
                      <span style={{ fontFamily: f.disp, color: it.highlight ? pal.hot : pal.fg, opacity: prog(t, from + i * 6 + 14, from + i * 6 + 24) }}>{it.display}</span>
                    </div>
                    <div style={{ marginTop: 8, height: it.highlight ? 34 : 22, borderRadius: 8, background: pal.line }}>
                      <div style={{ width: `${((it.value / max) * 100 * p).toFixed(1)}%`, height: '100%', borderRadius: 8, background: it.highlight ? pal.hot : pal.muted }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {w.finePrint && <div style={{ marginTop: 24, fontFamily: f.mono, fontSize: 18, color: pal.muted }}>{w.finePrint}</div>}
          </Abs>
        ),
        hits: [{ at: from + 30, kind: 'punch' }],
        sfx: [[from, 'roll', 0.35]],
      };
    }
    case 'checklist': {
      const ats = w.items.map((i) => cue(i.at));
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <Kicker k={k} text={w.title.toUpperCase()} t={t} at={k.arrive - 20} />
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {w.items.map((it, i) => {
                const on = t >= ats[i];
                const size = fitSize(it.text, f.disp, f.dispWeight, P ? 76 : 80, box.w - 110, f.dispTrack);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: on ? 1 : 0.25 }}>
                    <span style={{ width: 70, height: 70, borderRadius: 18, flex: 'none', background: on ? pal.hot : 'transparent', border: `4px solid ${on ? pal.hot : pal.line}`, color: '#FFF', fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? (0.7 + 0.3 * pop(t, ats[i], 4)).toFixed(3) : 1})` }}>{on ? '✓' : ''}</span>
                    <span data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, color: pal.fg, whiteSpace: 'nowrap' }}>{it.text}</span>
                  </div>
                );
              })}
            </div>
          </Abs>
        ),
        sfx: ats.map((a): Sfx => [a, 'tick', 0.35]),
      };
    }
    case 'takeover': {
      const at = cue(w.at);
      const size = fitSize(w.word, f.disp, f.dispWeight, P ? 300 : 340, box.w, f.dispTrack);
      const echo = Math.round(size * 0.6);
      return {
        node: (t) => {
          const p = prog(t, at - 6, at + 4);
          const fl = w.flash ? prog(t, at - 6, at + 8) : 0;
          const word = w.reveal === 'scramble' ? scrambleText(w.word, t, at - 2, 20) : w.word;
          // flash: the field floods with the palette's ink and the word takes the field colour (solid, never a gradient)
          const field = pal.bg.startsWith('linear') ? k.look.accent[0] : pal.bg;
          const ink = w.flash && fl > 0.5 ? field : w.flash ? pal.fg : pal.hot;
          return (
            <>
              {w.flash && <div style={{ position: 'absolute', inset: 0, background: pal.fg, opacity: fl }} />}
              {w.echo &&
                [0, 1, 2].map((row) => (
                  <div key={row} style={{ position: 'absolute', left: 0, top: box.y + box.h / 2 - echo * 1.7 + row * echo * 1.15, whiteSpace: 'nowrap', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: echo, lineHeight: 1.1, color: 'transparent', WebkitTextStroke: `2px ${w.flash && fl > 0.5 ? field : pal.fg}`, opacity: 0.16 * prog(t, at - 10, at + 14), transform: `translateX(${(-((t - at) * 1.2 * (row % 2 ? -1 : 1)) - k.fw * 0.3).toFixed(1)}px)` }}>
                    {`${w.word} · `.repeat(8)}
                  </div>
                ))}
              <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
                {w.label && <Kicker k={k} text={w.label} t={t} at={k.arrive - 20} />}
                <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.02, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: ink, opacity: p, transform: `scale(${(1.3 - 0.3 * p).toFixed(4)})`, transformOrigin: 'left center' }}>{word}</div>
                {w.sub && <div style={{ marginTop: 20, fontFamily: f.ui, fontWeight: 600, fontSize: 40, color: w.flash && fl > 0.5 ? field : pal.fg, opacity: prog(t, at + 10, at + 24), whiteSpace: 'nowrap' }}>{w.sub}</div>}
              </Abs>
            </>
          );
        },
        hits: [{ at, kind: 'punch' }],
        sfx: [[at - 2, 'pop', 0.5]],
      };
    }
    case 'versus': {
      const at = cue(w.at);
      const size = Math.min(fitSize(w.before.value, f.disp, f.dispWeight, P ? 190 : 200, box.w, f.dispTrack), fitSize(w.after.value, f.disp, f.dispWeight, P ? 230 : 250, box.w, f.dispTrack));
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            {w.label && <Kicker k={k} text={w.label.toUpperCase()} t={t} at={k.arrive - 20} />}
            <div data-fit="1" style={{ position: 'relative', display: 'inline-block', marginTop: 16, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size * 0.8, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, whiteSpace: 'nowrap', color: pal.muted, opacity: 1 - 0.4 * prog(t, at, at + 12) }}>
              {w.before.value}
              <Strike t={t} at={at - 2} color={pal.hot} />
            </div>
            <div style={{ fontFamily: f.ui, fontWeight: 600, fontSize: 34, color: pal.muted, marginTop: 8 }}>{w.before.caption}</div>
            <div data-fit="1" style={{ marginTop: 30, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: pal.hot, opacity: prog(t, at + 4, at + 14) }}>{scrambleText(w.after.value, t, at + 4, 22)}</div>
            <div style={{ fontFamily: f.ui, fontWeight: 600, fontSize: 40, color: pal.fg, marginTop: 10, opacity: prog(t, at + 14, at + 26) }}>{w.after.caption}</div>
          </Abs>
        ),
        hits: [{ at: at + 24, kind: 'punch' }],
        sfx: [[at - 2, 'tick', 0.4], [at + 4, 'roll', 0.35]],
      };
    }
    case 'dots': {
      const from = cue(w.from);
      const to = cue(w.to) + 10;
      const cols = w.total >= 50 ? 10 : 5;
      const gridW = P ? box.w * 0.56 : Math.min(460, box.w * 0.45);
      const cell = gridW / cols;
      const numW = P ? box.w : box.w - gridW - 50;
      const size = fitSize(w.display, f.disp, f.dispWeight, P ? 190 : 230, numW, f.dispTrack);
      return {
        node: (t) => {
          const fill = prog(t, from, to, inOut) * Math.min(w.value, w.total);
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
              <Kicker k={k} text={w.label.toUpperCase()} t={t} at={k.arrive - 20} />
              <div style={{ marginTop: 24, display: 'flex', flexDirection: P ? 'column' : 'row', alignItems: P ? 'flex-start' : 'center', gap: P ? 30 : 50 }}>
                <div style={{ width: gridW, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gridAutoRows: `${cell}px`, flex: 'none' }}>
                  {Array.from({ length: w.total }, (_, i) => {
                    const on = Math.max(0, Math.min(1, fill - i));
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: cell * 0.64, height: cell * 0.64 }}>
                          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${pal.line}` }} />
                          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: pal.hot, opacity: on, transform: `scale(${(0.6 + 0.4 * on).toFixed(3)})` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ width: numW }}>
                  <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: pal.fg, opacity: prog(t, from + 4, from + 16) }}>{scrambleText(w.display, t, to - 18, 18)}</div>
                  <div style={{ marginTop: 20, fontFamily: f.ui, fontWeight: 600, fontSize: P ? 44 : 42, color: pal.fg, opacity: prog(t, from + 8, from + 22) }}>{w.caption}</div>
                </div>
              </div>
            </Abs>
          );
        },
        hits: [{ at: to, kind: 'punch' }],
        sfx: [[from, 'roll', 0.35]],
      };
    }
    case 'rotate': {
      const ats = w.items.map((it) => cue(it.at));
      const finAt = w.final ? cue(w.final.at) : null;
      const longest = w.items.reduce((a, it) => (it.text.length > a.length ? it.text : a), '');
      const size = Math.min(fitSize(w.lead, f.disp, f.dispWeight, P ? 200 : 210, box.w, f.dispTrack), fitSize(longest, f.disp, f.dispWeight, P ? 200 : 210, box.w, f.dispTrack));
      const lineH = size * 1.08;
      return {
        node: (t) => {
          let pos = 0;
          ats.forEach((a, i) => {
            if (i > 0) pos += prog(t, a - 6, a + 4, inOut);
          });
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h} style={{ transform: `scale(${(1 + 0.04 * prog(t, ats[0], (finAt ?? ats[ats.length - 1]) + 40, (x) => x)).toFixed(4)})`, transformOrigin: 'left center' }}>
              <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.08, color: pal.fg, whiteSpace: 'nowrap' }}>
                <Chars text={w.lead} t={t} at={ats[0] - 14} step={1.8} />
              </div>
              <div style={{ position: 'relative', height: lineH, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, transform: `translateY(${(-pos * lineH).toFixed(2)}px)` }}>
                  {w.items.map((it, i) => (
                    <div key={i} data-fit="1" style={{ height: lineH, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.08, color: pal.hot, whiteSpace: 'nowrap' }}>{it.text}</div>
                  ))}
                </div>
              </div>
              {w.final && finAt !== null && (
                <div style={{ marginTop: 30, fontFamily: f.ui, fontWeight: 700, fontSize: P ? 64 : 66, color: pal.fg, whiteSpace: 'nowrap' }}>
                  <Chars text={w.final.text} t={t} at={finAt - 4} step={1.4} />
                </div>
              )}
            </Abs>
          );
        },
        hits: [...ats.slice(1).map((a) => ({ at: a, kind: 'punch' as const })), ...(finAt !== null ? [{ at: finAt, kind: 'punch' as const }] : [])],
        sfx: ats.slice(1).map((a): Sfx => [a - 6, 'tick', 0.35]),
      };
    }
    case 'leaderboard': {
      const at = cue(w.climbAt);
      const n = w.items.length;
      const oi = Math.max(0, w.items.findIndex((i) => i.name === w.ours));
      const after = (i: number) => (i === oi ? 0 : i < oi ? i + 1 : i);
      const rh = Math.min(P ? 130 : 110, (box.h - 80) / n);
      return {
        node: (t) => {
          const p = prog(t, at - 4, at + 26, inOut);
          return (
            <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
              <Kicker k={k} text={w.title.toUpperCase()} t={t} at={k.arrive - 20} />
              <div style={{ position: 'relative', marginTop: 24, height: n * rh }}>
                {w.items.map((it, i) => {
                  const ours = i === oi;
                  return (
                    <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: (i + (after(i) - i) * p) * rh, height: rh, display: 'flex', alignItems: 'center', gap: 26, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: rh * 0.56, color: ours ? pal.hot : pal.fg, opacity: ours ? 1 : 0.55, zIndex: ours ? 2 : 1, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: f.mono, fontSize: rh * 0.32, width: rh * 0.6, opacity: 0.7 }}>{Math.round(i + (after(i) - i) * p) + 1}</span>
                      <span style={{ flex: 1 }}>{it.name}</span>
                      <span style={{ fontFamily: f.mono, fontSize: rh * 0.34 }}>{it.score}</span>
                    </div>
                  );
                })}
              </div>
            </Abs>
          );
        },
        hits: [{ at: at + 24, kind: 'punch' }],
        sfx: [[at - 4, 'whoosh', 0.4]],
      };
    }
    case 'notify': {
      const ats = w.items.map((i) => cue(i.at));
      const nh = P ? 190 : 150;
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <Kicker k={k} text={w.app.toUpperCase()} t={t} at={k.arrive - 20} />
            <div style={{ position: 'relative', marginTop: 24, height: w.items.length * (nh + 20) }}>
              {w.items.map((it, i) => {
                const inP = prog(t, ats[i] - 2, ats[i] + 12, inOut);
                if (inP <= 0) return null;
                const below = w.items.reduce((a, _, j) => a + (j > i ? prog(t, ats[j] - 2, ats[j] + 12, inOut) : 0), 0);
                return (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: below * (nh + 20), height: nh, borderRadius: 34, background: pal.fg, color: onFg(pal), padding: '24px 32px', boxSizing: 'border-box', opacity: inP, transform: `translateY(${((1 - inP) * -50).toFixed(1)}px)` }}>
                    <div style={{ fontFamily: f.mono, fontSize: 24, opacity: 0.6 }}>{w.app.toUpperCase()} · now</div>
                    <div style={{ marginTop: 8, fontFamily: f.ui, fontWeight: 800, fontSize: P ? 44 : 40, whiteSpace: 'nowrap' }}>{it.title}</div>
                    {it.body && <div style={{ fontFamily: f.ui, fontSize: P ? 32 : 28, opacity: 0.7, whiteSpace: 'nowrap' }}>{it.body}</div>}
                  </div>
                );
              })}
            </div>
          </Abs>
        ),
        sfx: ats.map((a): Sfx => [a - 2, 'pop', 0.45]),
      };
    }
    case 'prompt': {
      const at = cue(w.at);
      const done = at + Math.ceil(w.text.length / 1.6);
      const resAt = w.resultAt ? cue(w.resultAt) : done + 14;
      const fs = P ? 64 : 62;
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            {w.label && <Kicker k={k} text={w.label.toUpperCase()} t={t} at={k.arrive - 20} />}
            <div style={{ marginTop: 20, fontFamily: f.ui, fontWeight: 700, fontSize: fs, lineHeight: 1.25, color: pal.fg }}>
              <span style={{ color: pal.hot }}>› </span>
              {typed(w.text, t, at, 1.6)}
              {t < done + 10 && <Caret t={t} h={fs * 0.9} color={pal.hot} />}
            </div>
            {w.result && (
              <div style={{ marginTop: 40, opacity: prog(t, resAt, resAt + 12) }}>
                <div style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: P ? 72 : 70, color: pal.hot, whiteSpace: 'nowrap' }}>{w.result.title}</div>
                {w.result.lines.map((l, i) => (
                  <div key={i} style={{ marginTop: 10, fontFamily: f.ui, fontWeight: 600, fontSize: P ? 40 : 38, color: pal.fg, opacity: prog(t, resAt + 8 + i * 6, resAt + 18 + i * 6), whiteSpace: 'nowrap' }}>{l}</div>
                ))}
              </div>
            )}
          </Abs>
        ),
        hits: w.result ? [{ at: resAt, kind: 'punch' }] : [],
        sfx: [[at, 'type', 0.3]],
      };
    }
    case 'integrations': {
      const at = cue(w.at);
      const size = fitSize(w.center, f.disp, f.dispWeight, P ? 170 : 180, box.w, f.dispTrack);
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            {w.title && <Kicker k={k} text={w.title.toUpperCase()} t={t} at={k.arrive - 20} />}
            <div data-fit="1" style={{ marginTop: 16, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, color: pal.fg, whiteSpace: 'nowrap' }}>
              <Chars text={w.center} t={t} at={at - 16} step={1.8} />
            </div>
            <div style={{ marginTop: 34, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {w.items.map((it, i) => (
                <span key={i} style={{ padding: '14px 26px', borderRadius: 999, border: `3px solid ${pal.fg}`, fontFamily: f.ui, fontWeight: 700, fontSize: P ? 38 : 36, color: pal.fg, whiteSpace: 'nowrap', opacity: prog(t, at + i * 5, at + i * 5 + 8), transform: `translateY(${((1 - prog(t, at + i * 5, at + i * 5 + 12)) * 20).toFixed(1)}px)` }}>{it}</span>
              ))}
            </div>
          </Abs>
        ),
        hits: [{ at: at + w.items.length * 5, kind: 'punch' }],
        sfx: w.items.map((_, i): Sfx => [at + i * 5, 'tick', 0.3]),
      };
    }
    case 'ring': {
      const at = cue(w.at);
      const S = Math.min(box.w, box.h) * 0.95;
      const r = S * 0.42;
      const circ = 2 * Math.PI * r;
      const unit = `${w.text.toUpperCase()} · `;
      const reps = Math.max(1, Math.round(circ / (unit.length * 30)));
      const csize = fitSize(w.center, f.disp, f.dispWeight, P ? 160 : 170, r * 1.5, f.dispTrack);
      const id = `kring-${k.beat.id}`;
      const show = Math.min(at, k.arrive) - 10;
      return {
        node: (t) => (
          <Abs x={box.x} y={box.y} w={box.w} h={box.h}>
            <div style={{ position: 'relative', width: S, height: S }}>
              <svg width={S} height={S} style={{ position: 'absolute', left: 0, top: 0, transform: `rotate(${((t - at) * 0.22).toFixed(2)}deg)`, opacity: prog(t, show - 4, show + 12) }}>
                <defs>
                  <path id={id} d={`M ${S / 2},${S / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
                </defs>
                <text fill={pal.fg} style={{ fontFamily: f.mono, fontWeight: 600, fontSize: 44, letterSpacing: '0.2em' }}>
                  <textPath href={`#${id}`} textLength={circ - 4} lengthAdjust="spacing">{unit.repeat(reps)}</textPath>
                </text>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: csize, letterSpacing: `${f.dispTrack}em`, color: pal.hot, whiteSpace: 'nowrap' }}>
                  <Chars text={w.center} t={t} at={show} step={2} />
                </div>
              </div>
            </div>
          </Abs>
        ),
        hits: [{ at, kind: 'punch' }],
        sfx: [[at - 4, 'whoosh', 0.35]],
      };
    }
    case 'document':
    case 'newspaper':
    case 'cutout':
    case 'receipt':
      return archiveWidget(w, k)!;
  }
};
