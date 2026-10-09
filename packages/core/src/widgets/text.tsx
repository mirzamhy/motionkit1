// Kinetic headline (no card, type sits in the world), chat thread, benchmark bars, checklist.
import React from 'react';
import type { z } from 'zod';
import { Card, Chars, Head, Strike, gradText, scrambleText } from '../engine/atoms';
import { fitSize, textW } from '../engine/fit';
import { grad, GREEN } from '../engine/looks';
import type { Ctx, WidgetOut } from '../engine/types';
import { inOut, pop, prog, typed } from '../engine/util';
import type { Bars, Chat, Checklist, Dots, Headline, Rotate, Takeover, Versus } from '../spec/schema';

/** static halftone dot field (no per-frame filters); fades in, never toggles */
export const Halftone: React.FC<{ w: number; h: number; color: string; opacity: number; cell?: number }> = ({ w, h, color, opacity, cell = 18 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, opacity, backgroundImage: `radial-gradient(${color} 28%, transparent 30%)`, backgroundSize: `${cell}px ${cell}px`, WebkitMaskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 72%)', maskImage: 'radial-gradient(ellipse at center, #000 20%, transparent 72%)' }} />
);

/** Title takeover: one oversized word punches in (scale eased over 10 frames, or scramble-decodes) and holds.
 *  echo: outlined copies drift behind it; flash: an accent panel swells behind it on the cue. */
export const takeover = (w: z.infer<typeof Takeover>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const maxW = P ? 980 : 1700;
  const size = fitSize(w.word, f.disp, f.dispWeight, P ? 300 : 360, maxW, f.dispTrack);
  const at = ctx.cue(w.at);
  const h = Math.round(size * 1.1 + (w.label ? 70 : 0) + (w.sub ? 90 : 0) + 40 + (w.flash ? 60 : 0));
  const echoSize = Math.round(size * 0.62);
  const node = (t: number) => {
    const p = prog(t, at - 6, at + 4);
    const fl = w.flash ? prog(t, at - 6, at + 8) : 0;
    const word = w.reveal === 'scramble' ? scrambleText(w.word, t, at - 2, 20) : w.word;
    const wordStyle: React.CSSProperties = w.flash ? { color: '#FFFFFF' } : gradText(ctx);
    const ink = w.flash ? '#FFFFFF' : ctx.look.world.text;
    return (
      <div style={{ position: 'relative', width: maxW, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: ink, overflow: 'hidden', borderRadius: w.flash ? 40 : 0 }}>
        {w.flash && <div style={{ position: 'absolute', inset: 0, background: grad(ctx.look, 120), borderRadius: 40, opacity: fl, transform: `scale(${(0.82 + 0.18 * fl).toFixed(4)})` }} />}
        {!w.flash && <Halftone w={maxW} h={h} color={ctx.look.hot} opacity={0.35 * prog(t, at - 20, at + 10)} />}
        {w.echo &&
          [-1, 1].map((row) => (
            <div key={row} style={{ position: 'absolute', left: 0, top: h / 2 - echoSize * 0.55 + row * echoSize * 0.95, whiteSpace: 'nowrap', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: echoSize, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.1, color: 'transparent', WebkitTextStroke: `2px ${ink}`, opacity: 0.2 * prog(t, at - 10, at + 14), transform: `translateX(${(-((t - at) * 1.1 * row) - maxW * 0.25).toFixed(1)}px)` }}>
              {`${w.word} · `.repeat(6)}
            </div>
          ))}
        {w.label && <div style={{ position: 'relative', fontFamily: f.mono, fontSize: P ? 30 : 28, letterSpacing: '0.3em', opacity: 0.7, height: 50, whiteSpace: 'nowrap' }}>{typed(w.label, t, at - 24, 0.9)}</div>}
        <div data-fit="1" style={{ position: 'relative', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.05, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', opacity: p, transform: `scale(${(1.3 - 0.3 * p).toFixed(4)})`, ...wordStyle }}>{word}</div>
        {w.sub && <div style={{ position: 'relative', marginTop: 20, fontFamily: f.ui, fontWeight: 500, fontSize: P ? 38 : 40, opacity: 0.75 * prog(t, at + 10, at + 24), whiteSpace: 'nowrap' }}>{w.sub}</div>}
      </div>
    );
  };
  return { layers: [{ key: 'text', dx: 0, dy: 0, w: maxW, h, node }], hits: [{ at, kind: 'punch' }], sfx: [[at - 2, 'pop', 0.5]] };
};

/** before → after: the old number in grey gets struck out, the new one scramble-decodes in the accent */
export const versus = (w: z.infer<typeof Versus>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const [cw, ch] = P ? [940, 1000] : [1400, 600];
  const pad = P ? 56 : 60;
  const at = ctx.cue(w.at);
  const colW = P ? cw - pad * 2 : (cw - pad * 2 - 120) / 2;
  const size = Math.min(fitSize(w.before.value, f.disp, f.dispWeight, P ? 170 : 160, colW, f.dispTrack), fitSize(w.after.value, f.disp, f.dispWeight, P ? 170 : 160, colW, f.dispTrack));
  const node = (t: number) => {
    const shown = prog(t, at + 4, at + 14);
    const sheen = prog(t, at + 36, at + 76);
    const col = (v: string, cap: string, after: boolean) => (
      <div style={{ width: colW, display: 'flex', flexDirection: 'column', alignItems: P ? 'center' : 'flex-start' }}>
        <div data-fit="1" style={{ position: 'relative', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', transformOrigin: P ? 'center' : 'left center', ...(after ? { ...gradText(ctx), opacity: shown, transform: `scale(${(1 + 0.05 * prog(t, at + 26, at + 140, (x) => x)).toFixed(4)})` } : { color: ctx.look.card.muted, opacity: 1 - 0.45 * prog(t, at, at + 12) }) }}>
          {after ? scrambleText(v, t, at + 4, 22) : v}
          {!after && <Strike t={t} at={at - 2} color={ctx.look.hot} />}
          {after && sheen > 0 && sheen < 1 && (
            <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <span style={{ position: 'absolute', top: 0, bottom: 0, left: `${(-30 + 140 * sheen).toFixed(1)}%`, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-18deg)', mixBlendMode: 'overlay' }} />
            </span>
          )}
        </div>
        <div style={{ marginTop: 18, fontFamily: f.ui, fontWeight: 500, fontSize: P ? 34 : 30, color: ctx.look.card.muted, whiteSpace: 'nowrap', opacity: after ? prog(t, at + 14, at + 26) : 1 }}>{cap}</div>
      </div>
    );
    return (
      <Card ctx={ctx} w={cw} h={ch} pad={pad}>
        {w.label && <Head ctx={ctx} icon="bars" label={w.label.toUpperCase()} size={P ? 24 : 20} />}
        <div style={{ position: 'absolute', left: 0, right: 0, top: w.label ? (P ? 24 : 20) * 2.6 : 0, bottom: 0, display: 'flex', flexDirection: P ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: P ? 50 : 0 }}>
          {col(w.before.value, w.before.caption, false)}
          <div style={{ width: P ? 'auto' : 120, textAlign: 'center', fontFamily: f.ui, fontWeight: 700, fontSize: P ? 70 : 64, color: ctx.look.hot, opacity: prog(t, at, at + 10), transform: P ? 'rotate(90deg)' : undefined }}>→</div>
          {col(w.after.value, w.after.caption, true)}
        </div>
      </Card>
    );
  };
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], hits: [{ at: at + 24, kind: 'punch' }], sfx: [[at - 2, 'tick', 0.4], [at + 4, 'roll', 0.35]] };
};

export const headline = (w: z.infer<typeof Headline>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const maxW = P ? 960 : 1600;
  const sizes = w.lines.map((ln) => fitSize(ln.map((x) => x.text).join(' '), f.disp, f.dispWeight, P ? 120 : 150, maxW, f.dispTrack));
  const size = Math.min(...sizes);
  const h = w.lines.length * size * 1.12 + (w.sub ? 90 : 0) + 20;
  const ats = w.lines.map((ln) => ln.map((x) => ctx.cue(x.at)));
  const subAt = ats[ats.length - 1][ats[ats.length - 1].length - 1] + 10;
  const node = (t: number) => (
    <div style={{ width: maxW, display: 'flex', flexDirection: 'column', alignItems: 'center', color: ctx.look.world.text }}>
      {w.lines.map((ln, li) => (
        <div key={li} data-fit="1" style={{ display: 'flex', gap: size * 0.28, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.12, whiteSpace: 'nowrap' }}>
          {ln.map((x, i) => (
            <span key={i} style={{ position: 'relative', opacity: x.strike ? 1 - 0.5 * prog(t, ctx.cue(x.strike), ctx.cue(x.strike) + 12) : 1 }}>
              <Chars text={x.text} t={t} at={ats[li][i] - 4} step={2} style={x.accent ? gradText(ctx) : undefined} />
              {x.strike && <Strike t={t} at={ctx.cue(x.strike)} color={ctx.look.hot} />}
            </span>
          ))}
        </div>
      ))}
      {w.sub && <div style={{ marginTop: 26, fontFamily: f.ui, fontWeight: 500, fontSize: P ? 38 : 40, opacity: 0.75 * prog(t, subAt, subAt + 14), textAlign: 'center' }}>{w.sub}</div>}
    </div>
  );
  return { layers: [{ key: 'text', dx: 0, dy: 0, w: maxW, h, node }], hits: ats.map((a) => ({ at: a[0], kind: 'punch' as const })) };
};

export const chat = (w: z.infer<typeof Chat>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const [cw, ch] = P ? [940, 900] : [1000, 660];
  const pad = P ? 48 : 44;
  const f = ctx.f;
  const ats = w.messages.map((m) => ctx.cue(m.at));
  const fs = P ? 32 : 28;
  const node = (t: number) => (
    <Card ctx={ctx} w={cw} h={ch} pad={pad}>
      <Head ctx={ctx} icon="chat" label={w.title.toUpperCase()} size={P ? 24 : 20} />
      <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'flex-end', height: ch - pad * 2 - 80 }}>
        {w.messages.map((m, i) => {
          const a = ats[i];
          const isAi = m.from === 'ai';
          const show = isAi ? a : a - 6;
          if (t < show - 18) return null;
          const p = pop(t, show, 4);
          const typing = isAi && t < a;
          const txt = isAi ? typed(m.text, t, a, 1.8) : m.text;
          return (
            <div key={i} style={{ alignSelf: isAi ? 'flex-start' : 'flex-end', maxWidth: '82%', padding: '18px 24px', borderRadius: 24, borderBottomLeftRadius: isAi ? 6 : 24, borderBottomRightRadius: isAi ? 24 : 6, background: isAi ? ctx.look.card.inset : grad(ctx.look), color: isAi ? ctx.look.card.insetFg : '#FFFFFF', fontFamily: f.ui, fontWeight: 500, fontSize: fs, lineHeight: 1.35, transform: `scale(${Math.min(1, 0.85 + 0.15 * p).toFixed(3)})`, transformOrigin: isAi ? 'left bottom' : 'right bottom', opacity: Math.min(1, p * 1.4 + (typing ? 1 : 0)) }}>
              {typing ? <span style={{ letterSpacing: 6, opacity: 0.7 }}>{'•••'.slice(0, 1 + (Math.floor(t / 6) % 3))}</span> : txt}
            </div>
          );
        })}
      </div>
    </Card>
  );
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], sfx: ats.map((a, i): [number, string, number] => [a - (w.messages[i].from === 'ai' ? 0 : 6), 'pop', 0.45]) };
};

export const bars = (w: z.infer<typeof Bars>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const [cw, ch] = P ? [940, 900] : [1200, 700];
  const pad = P ? 50 : 52;
  const f = ctx.f;
  const from = ctx.cue(w.from);
  const max = Math.max(...w.items.map((i) => i.value)) || 1;
  const labelW = P ? 250 : 290;
  const node = (t: number) => (
    <Card ctx={ctx} w={cw} h={ch} pad={pad}>
      <Head ctx={ctx} icon="bars" label={w.title.toUpperCase()} right={w.unit ? <span style={{ fontFamily: f.mono, fontSize: 20, color: ctx.look.card.muted }}>{w.unit}</span> : undefined} size={P ? 24 : 20} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: (P ? 24 : 20) * 2.1, bottom: w.finePrint ? 40 : 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: P ? 34 : 26 }}>
        {w.items.map((it, i) => {
          const p = prog(t, from + i * 6, from + i * 6 + 28);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: labelW, fontFamily: f.ui, fontWeight: it.highlight ? 700 : 500, fontSize: P ? 30 : 28, color: it.highlight ? ctx.look.card.fg : ctx.look.card.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</div>
              <div style={{ flex: 1, height: P ? 46 : 42, borderRadius: 12, background: ctx.look.card.inset, overflow: 'hidden' }}>
                <div style={{ width: `${((it.value / max) * 100 * p).toFixed(2)}%`, height: '100%', borderRadius: 12, background: it.highlight ? grad(ctx.look, 90) : ctx.look.card.muted, opacity: it.highlight ? 1 : 0.55 }} />
              </div>
              <div style={{ width: P ? 150 : 160, textAlign: 'right', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: P ? 38 : 36, color: it.highlight ? ctx.look.hot : ctx.look.card.fg, opacity: prog(t, from + i * 6 + 14, from + i * 6 + 26), whiteSpace: 'nowrap' }}>{it.display}</div>
            </div>
          );
        })}
      </div>
      {w.finePrint && <div style={{ position: 'absolute', left: 0, bottom: 0, fontFamily: f.mono, fontSize: 18, color: ctx.look.card.muted, lineHeight: 1.5 }}>{w.finePrint}</div>}
    </Card>
  );
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], hits: [{ at: from + 30, kind: 'punch' }], sfx: [[from, 'roll', 0.35]] };
};

export const checklist = (w: z.infer<typeof Checklist>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const pad = P ? 50 : 52;
  const f = ctx.f;
  // the card hugs its content: width from the longest item (measured), height from the item count
  const itemW = Math.max(...w.items.map((it) => textW(it.text, f.ui, 600, P ? 38 : 36)));
  const cw = P ? 940 : Math.round(Math.max(640, Math.min(960, itemW + 54 + 22 + pad * 2 + 30)));
  const ch = Math.round(Math.max(P ? 560 : 440, (P ? 24 : 20) * 2.1 + w.items.length * ((P ? 38 : 36) * 1.5 + (P ? 34 : 26)) + pad * 2 + 70));
  const ats = w.items.map((i) => ctx.cue(i.at));
  const node = (t: number) => (
    <Card ctx={ctx} w={cw} h={ch} pad={pad}>
      <Head ctx={ctx} icon="check" label={w.title.toUpperCase()} size={P ? 24 : 20} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: (P ? 24 : 20) * 2.1, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: P ? 34 : 26 }}>
        {w.items.map((it, i) => {
          const p = pop(t, ats[i], 4);
          const on = t >= ats[i];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: on ? 1 : 0.35, transform: `translateX(${on ? 0 : 0}px)` }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, flex: 'none', border: `2px solid ${on ? GREEN : ctx.look.card.line}`, background: on ? 'rgba(34,197,94,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GREEN, fontSize: 32, transform: `scale(${on ? (0.7 + 0.3 * p).toFixed(3) : 1})` }}>{on ? '✓' : ''}</div>
              <div style={{ fontFamily: f.ui, fontWeight: 600, fontSize: P ? 38 : 36, whiteSpace: 'nowrap' }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], sfx: ats.map((a): [number, string, number] => [a, 'tick', 0.35]) };
};

/** a grid of dots filling up to `value` between from → to, next to the big number */
export const dots = (w: z.infer<typeof Dots>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const [cw, ch] = P ? [940, 1040] : [1240, 640];
  const pad = P ? 56 : 56;
  const from = ctx.cue(w.from);
  const to = ctx.cue(w.to) + 10;
  const cols = w.total >= 50 ? 10 : 5;
  const rows = Math.ceil(w.total / cols);
  const gridW = P ? cw - pad * 2 : Math.min(500, ch - pad * 2 - 60);
  const cell = gridW / cols;
  const numW = P ? cw - pad * 2 : cw - pad * 2 - gridW - 60;
  const size = fitSize(w.display, f.disp, f.dispWeight, P ? 170 : 150, numW, f.dispTrack);
  const node = (t: number) => {
    const fill = prog(t, from, to, inOut) * Math.min(w.value, w.total);
    return (
      <Card ctx={ctx} w={cw} h={ch} pad={pad}>
        <Head ctx={ctx} icon="bars" label={w.label.toUpperCase()} size={P ? 24 : 20} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: (P ? 24 : 20) * 2.6, bottom: 0, display: 'flex', flexDirection: P ? 'column' : 'row', alignItems: 'center', gap: P ? 40 : 60 }}>
          <div style={{ width: gridW, height: rows * cell, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gridAutoRows: `${cell}px`, flex: 'none' }}>
            {Array.from({ length: w.total }, (_, i) => {
              const on = Math.max(0, Math.min(1, fill - i));
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: cell * 0.62, height: cell * 0.62 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${ctx.look.card.line}` }} />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: ctx.look.hot, opacity: on, transform: `scale(${(0.6 + 0.4 * on).toFixed(3)})` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ width: numW, display: 'flex', flexDirection: 'column', alignItems: P ? 'center' : 'flex-start' }}>
            <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...gradText(ctx), opacity: prog(t, from + 4, from + 16) }}>{scrambleText(w.display, t, to - 18, 18)}</div>
            <div style={{ marginTop: 18, fontFamily: f.ui, fontWeight: 500, fontSize: P ? 34 : 30, color: ctx.look.card.muted, opacity: prog(t, from + 10, from + 24), textAlign: P ? 'center' : 'left' }}>{w.caption}</div>
          </div>
        </div>
      </Card>
    );
  };
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], hits: [{ at: to, kind: 'punch' }], sfx: [[from, 'roll', 0.35]] };
};

/** fixed lead word + a slot that rolls to each item on its cue, then an optional generalising line */
export const rotate = (w: z.infer<typeof Rotate>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const maxW = P ? 960 : 1600;
  const longest = w.items.reduce((a, it) => (it.text.length > a.length ? it.text : a), '');
  const size = Math.min(fitSize(`${w.lead} ${longest}`, f.disp, f.dispWeight, P ? 130 : 150, maxW, f.dispTrack), w.final ? fitSize(w.final.text, f.disp, f.dispWeight, P ? 130 : 150, maxW, f.dispTrack) : 999);
  const ats = w.items.map((it) => ctx.cue(it.at));
  const finAt = w.final ? ctx.cue(w.final.at) : null;
  const lineH = size * 1.15;
  const slotW = Math.max(...w.items.map((it) => textW(it.text, f.disp, f.dispWeight, size, f.dispTrack)));
  const h = Math.round(lineH * (w.final ? 2.2 : 1.2) + 20);
  const node = (t: number) => {
    // continuous slot position: index i at its cue, rolling over 10 frames
    let pos = 0;
    ats.forEach((a, i) => {
      if (i > 0) pos += prog(t, a - 6, a + 4, inOut);
    });
    const out = finAt !== null ? prog(t, finAt - 4, finAt + 10, inOut) : 0;
    return (
      <div style={{ width: maxW, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: ctx.look.world.text, transform: `scale(${(1 + 0.04 * prog(t, ats[0], (finAt ?? ats[ats.length - 1]) + 40, (x) => x)).toFixed(4)})` }}>
        <div data-fit="1" style={{ display: 'flex', alignItems: 'center', gap: size * 0.28, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.15, whiteSpace: 'nowrap', opacity: prog(t, ats[0] - 14, ats[0] - 2) }}>
          <span>{w.lead}</span>
          <span style={{ position: 'relative', display: 'inline-block', width: slotW, height: lineH, overflow: 'hidden' }}>
            <span style={{ position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', transform: `translateY(${(-pos * lineH).toFixed(2)}px)` }}>
              {w.items.map((it, i) => (
                <span key={i} style={{ height: lineH, ...gradText(ctx), opacity: 1 - 0.6 * out }}>{it.text}</span>
              ))}
            </span>
          </span>
        </div>
        {w.final && finAt !== null && (
          <div data-fit="1" style={{ marginTop: size * 0.1, fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: size, letterSpacing: `${f.dispTrack}em`, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
            <Chars text={w.final.text} t={t} at={finAt - 4} step={1.6} />
          </div>
        )}
      </div>
    );
  };
  return { layers: [{ key: 'text', dx: 0, dy: 0, w: maxW, h, node }], hits: [...ats.slice(1).map((a) => ({ at: a, kind: 'punch' as const })), ...(finAt !== null ? [{ at: finAt, kind: 'punch' as const }] : [])], sfx: ats.slice(1).map((a): [number, string, number] => [a - 6, 'tick', 0.35]) };
};
