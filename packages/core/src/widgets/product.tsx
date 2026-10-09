// Product / app widgets: leaderboard climb, notification stack, prompt box, integrations orbit, text ring.
import React from 'react';
import type { z } from 'zod';
import { Caret, Card, Chars, Head, gradText } from '../engine/atoms';
import { fitSize, textW } from '../engine/fit';
import { grad } from '../engine/looks';
import type { Ctx, WidgetOut } from '../engine/types';
import { inOut, pop, prog, typed } from '../engine/util';
import type { Integrations, Leaderboard, Notify, Prompt, Ring } from '../spec/schema';

/** final order: ours first, the rest keep their relative order */
export const climbOrder = (w: z.infer<typeof Leaderboard>) => {
  const oi = Math.max(0, w.items.findIndex((i) => i.name === w.ours));
  return { oi, after: (i: number) => (i === oi ? 0 : i < oi ? i + 1 : i) };
};

export const leaderboard = (w: z.infer<typeof Leaderboard>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const n = w.items.length;
  const [cw, ch] = P ? [940, 230 + n * 120] : [1000, 200 + n * 96];
  const pad = P ? 52 : 50;
  const rh = P ? 110 : 88;
  const at = ctx.cue(w.climbAt);
  const { oi, after } = climbOrder(w);
  const node = (t: number) => {
    const p = prog(t, at - 4, at + 26, inOut);
    return (
      <Card ctx={ctx} w={cw} h={ch} pad={pad}>
        <Head ctx={ctx} icon="bars" label={w.title.toUpperCase()} size={P ? 24 : 20} />
        <div style={{ position: 'relative', marginTop: P ? 44 : 36, height: n * rh }}>
          {w.items.map((_, r) => (
            <div key={`n${r}`} style={{ position: 'absolute', left: 0, top: r * rh, height: rh - 12, width: 60, display: 'flex', alignItems: 'center', fontFamily: f.mono, fontSize: P ? 34 : 28, color: ctx.look.card.muted }}>{r + 1}</div>
          ))}
          {w.items.map((it, i) => {
            const y = (i + (after(i) - i) * p) * rh;
            const ours = i === oi;
            return (
              <div key={i} style={{ position: 'absolute', left: 70, right: 0, top: y, height: rh - 12, borderRadius: 18, display: 'flex', alignItems: 'center', padding: '0 26px', boxSizing: 'border-box', background: ours ? grad(ctx.look, 90) : ctx.look.card.inset, border: `1.5px solid ${ours ? 'transparent' : ctx.look.card.line}`, color: ours ? '#FFFFFF' : ctx.look.card.fg, zIndex: ours ? 2 : 1, transform: ours ? `scale(${(1 + 0.03 * Math.sin(Math.PI * p)).toFixed(4)})` : undefined }}>
                <span style={{ fontFamily: f.ui, fontWeight: ours ? 800 : 600, fontSize: P ? 38 : 32, whiteSpace: 'nowrap', flex: 1 }}>{it.name}</span>
                <span style={{ fontFamily: f.mono, fontSize: P ? 32 : 26, whiteSpace: 'nowrap', opacity: 0.85 }}>{it.score}</span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], hits: [{ at: at + 24, kind: 'punch' }], sfx: [[at - 4, 'whoosh', 0.4]] };
};

export const notify = (w: z.infer<typeof Notify>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const pad = P ? 44 : 40;
  const nh = P ? 170 : 140;
  const gap = 18;
  const [cw, ch] = P ? [900, 330 + w.items.length * (170 + 18)] : [860, 270 + w.items.length * (140 + 18)];
  const ats = w.items.map((i) => ctx.cue(i.at));
  const node = (t: number) => (
    <Card ctx={ctx} w={cw} h={ch} pad={pad}>
      <div style={{ textAlign: 'center', fontFamily: f.ui, fontWeight: 300, fontSize: P ? 120 : 96, color: ctx.look.card.fg, opacity: 0.9, letterSpacing: '-0.02em' }}>9:41</div>
      <div style={{ position: 'relative', marginTop: P ? 40 : 26 }}>
        {w.items.map((it, i) => {
          const inP = prog(t, ats[i] - 2, ats[i] + 12, inOut);
          if (inP <= 0) return null;
          // newer notifications push older ones down
          const below = w.items.reduce((a, _, j) => a + (j > i ? prog(t, ats[j] - 2, ats[j] + 12, inOut) : 0), 0);
          return (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: below * (nh + gap), height: nh, borderRadius: 28, background: ctx.look.card.inset, border: `1.5px solid ${ctx.look.card.line}`, padding: '20px 26px', boxSizing: 'border-box', opacity: inP, transform: `translateY(${((1 - inP) * -40).toFixed(1)}px) scale(${(0.94 + 0.06 * inP).toFixed(3)})`, display: 'flex', gap: 20 }}>
              <div style={{ width: P ? 64 : 54, height: P ? 64 : 54, borderRadius: 16, background: grad(ctx.look, 135), flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: P ? 30 : 26 }}>{w.app.slice(0, 1).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', fontFamily: f.ui, fontSize: P ? 24 : 20, color: ctx.look.card.muted, letterSpacing: '0.04em' }}>
                  <span style={{ flex: 1 }}>{w.app.toUpperCase()}</span>
                  <span>now</span>
                </div>
                <div style={{ marginTop: 6, fontFamily: f.ui, fontWeight: 700, fontSize: P ? 32 : 27, color: ctx.look.card.insetFg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</div>
                {it.body && <div style={{ marginTop: 4, fontFamily: f.ui, fontSize: P ? 26 : 22, color: ctx.look.card.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.body}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], sfx: ats.map((a): [number, string, number] => [a - 2, 'pop', 0.45]) };
};

export const prompt = (w: z.infer<typeof Prompt>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const [cw, ch] = P ? [940, w.result ? 980 : 520] : [1240, w.result ? 700 : 380];
  const pad = P ? 48 : 46;
  const at = ctx.cue(w.at);
  const cps = 1.6;
  const doneAt = at + Math.ceil(w.text.length / cps);
  const resAt = w.resultAt ? ctx.cue(w.resultAt) : doneAt + 14;
  const fs = P ? 36 : 34;
  const node = (t: number) => {
    const txt = typed(w.text, t, at, cps);
    const send = pop(t, doneAt + 2, 4);
    return (
      <Card ctx={ctx} w={cw} h={ch} pad={pad}>
        {w.label && <Head ctx={ctx} icon="chat" label={w.label.toUpperCase()} size={P ? 24 : 20} />}
        <div style={{ marginTop: w.label ? 28 : 0, display: 'flex', alignItems: 'flex-end', gap: 18, padding: '24px 24px 24px 30px', borderRadius: 26, background: ctx.look.card.inset, border: `1.5px solid ${ctx.look.card.line}`, minHeight: P ? 200 : 150, boxSizing: 'border-box' }}>
          <div style={{ flex: 1, fontFamily: f.ui, fontWeight: 500, fontSize: fs, lineHeight: 1.35, color: txt ? ctx.look.card.insetFg : ctx.look.card.muted }}>
            {txt || '…'}
            {t < doneAt + 10 && <Caret t={t} h={fs} color={ctx.look.hot} />}
          </div>
          <div style={{ width: 64, height: 64, borderRadius: 32, flex: 'none', background: t >= doneAt ? grad(ctx.look, 135) : ctx.look.card.line, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 30, transform: `scale(${(1 + 0.18 * Math.max(0, Math.sin(Math.PI * Math.min(1, send)))).toFixed(3)})` }}>↑</div>
        </div>
        {w.result && (
          <div style={{ marginTop: 28, padding: '26px 30px', borderRadius: 24, border: `1.5px solid ${ctx.look.card.line}`, opacity: prog(t, resAt, resAt + 12), transform: `translateY(${((1 - prog(t, resAt, resAt + 14)) * 24).toFixed(1)}px)` }}>
            <div style={{ fontFamily: f.ui, fontWeight: 800, fontSize: P ? 40 : 36, ...gradText(ctx), whiteSpace: 'nowrap' }}>{w.result.title}</div>
            {w.result.lines.map((l, i) => (
              <div key={i} style={{ marginTop: 12, fontFamily: f.ui, fontSize: P ? 32 : 28, color: ctx.look.card.muted, opacity: prog(t, resAt + 8 + i * 6, resAt + 18 + i * 6), whiteSpace: 'nowrap' }}>· {l}</div>
            ))}
          </div>
        )}
      </Card>
    );
  };
  return { layers: [{ key: 'card', dx: 0, dy: 0, w: cw, h: ch, node }], hits: w.result ? [{ at: resAt, kind: 'punch' }] : [], sfx: [[at, 'type', 0.3], [doneAt + 2, 'pop', 0.4]] };
};

export const integrations = (w: z.infer<typeof Integrations>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const S = P ? 960 : 1000;
  const R = S * 0.36;
  const at = ctx.cue(w.at);
  const n = w.items.length;
  const cfs = fitSize(w.center, f.disp, f.dispWeight, P ? 64 : 60, S * 0.34, f.dispTrack);
  const node = (t: number) => {
    const spin = (t - at) * 0.05;
    return (
      <div style={{ position: 'relative', width: S, height: S + (w.title ? 90 : 0), color: ctx.look.world.text }}>
        {w.title && <div style={{ textAlign: 'center', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: P ? 56 : 52, letterSpacing: `${f.dispTrack}em`, whiteSpace: 'nowrap', height: 90 }}><Chars text={w.title} t={t} at={at - 20} step={1.4} /></div>}
        <div style={{ position: 'absolute', left: 0, top: w.title ? 90 : 0, width: S, height: S }}>
          <svg width={S} height={S} style={{ position: 'absolute', left: 0, top: 0 }}>
            <circle cx={S / 2} cy={S / 2} r={R} fill="none" stroke={ctx.look.world.text} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="6 10" />
            {w.items.map((_, i) => {
              const a = ((i / n) * 360 + spin - 90) * (Math.PI / 180);
              const p = prog(t, at + i * 5 + 4, at + i * 5 + 18);
              return <line key={i} x1={S / 2} y1={S / 2} x2={S / 2 + Math.cos(a) * R * p} y2={S / 2 + Math.sin(a) * R * p} stroke={ctx.look.hot} strokeOpacity={0.5} strokeWidth={3} />;
            })}
          </svg>
          {w.items.map((it, i) => {
            const a = ((i / n) * 360 + spin - 90) * (Math.PI / 180);
            const p = pop(t, at + i * 5, 4);
            return (
              <div key={i} style={{ position: 'absolute', left: S / 2 + Math.cos(a) * R, top: S / 2 + Math.sin(a) * R, transform: `translate(-50%, -50%) scale(${Math.max(0, p).toFixed(3)})`, padding: P ? '16px 26px' : '14px 24px', borderRadius: 999, background: ctx.look.card.bg, color: ctx.look.card.fg, border: ctx.look.card.border, boxShadow: ctx.look.card.shadow, fontFamily: f.ui, fontWeight: 700, fontSize: P ? 32 : 28, whiteSpace: 'nowrap' }}>{it}</div>
            );
          })}
          <div style={{ position: 'absolute', left: S / 2, top: S / 2, transform: `translate(-50%, -50%) scale(${(0.85 + 0.15 * prog(t, at - 16, at)).toFixed(3)})`, width: S * 0.38, height: S * 0.38, borderRadius: '50%', background: grad(ctx.look, 135), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: cfs, letterSpacing: `${f.dispTrack}em`, whiteSpace: 'nowrap', opacity: prog(t, at - 16, at - 4) }}>{w.center}</div>
        </div>
      </div>
    );
  };
  return { layers: [{ key: 'orbit', dx: 0, dy: 0, w: S, h: S + (w.title ? 90 : 0), node }], hits: [{ at: at + n * 5, kind: 'punch' }], sfx: w.items.map((_, i): [number, string, number] => [at + i * 5, 'tick', 0.3]) };
};

export const ring = (w: z.infer<typeof Ring>, ctx: Ctx): WidgetOut => {
  const P = ctx.P;
  const f = ctx.f;
  const S = P ? 900 : 860;
  const r = S * 0.4;
  const at = ctx.cue(w.at);
  const circ = 2 * Math.PI * r;
  const unit = `${w.text.toUpperCase()} · `;
  const rs = P ? 44 : 42;
  const reps = Math.max(1, Math.round(circ / textW(unit, f.mono, 600, rs, 0.2)));
  const cfs = fitSize(w.center, f.disp, f.dispWeight, P ? 150 : 140, r * 1.5, f.dispTrack);
  const id = `ring-${ctx.beat.id}`;
  const show = Math.min(at, ctx.arrive) - 10;
  const node = (t: number) => (
    <div style={{ position: 'relative', width: S, height: S, color: ctx.look.world.text }}>
      <div style={{ position: 'absolute', left: S / 2 - r * 0.92, top: S / 2 - r * 0.92, width: r * 1.84, height: r * 1.84, borderRadius: '50%', background: ctx.look.card.bg, boxShadow: ctx.look.card.shadow, opacity: prog(t, show - 6, show + 10) }} />
      <svg width={S} height={S} style={{ position: 'absolute', left: 0, top: 0, transform: `rotate(${((t - at) * 0.22).toFixed(2)}deg)`, opacity: prog(t, show - 4, show + 12) }}>
        <defs>
          <path id={id} d={`M ${S / 2},${S / 2} m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} />
        </defs>
        <text fill={ctx.look.world.text} style={{ fontFamily: f.mono, fontWeight: 600, fontSize: rs, letterSpacing: '0.2em' }}>
          <textPath href={`#${id}`} textLength={circ - 4} lengthAdjust="spacing">{unit.repeat(reps)}</textPath>
        </text>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div data-fit="1" style={{ fontFamily: f.disp, fontWeight: f.dispWeight, fontSize: cfs, letterSpacing: `${f.dispTrack}em`, whiteSpace: 'nowrap', transform: `scale(${(1 + 0.08 * Math.exp(-Math.max(0, t - at) / 8) * (t >= at - 4 ? 1 : 0) * prog(t, at - 4, at)).toFixed(4)})` }}>
          <Chars text={w.center} t={t} at={show} step={2} style={gradText(ctx)} />
        </div>
      </div>
    </div>
  );
  return { layers: [{ key: 'ring', dx: 0, dy: 0, w: S, h: S, node }], hits: [{ at, kind: 'punch' }], sfx: [[at - 4, 'whoosh', 0.35]] };
};
