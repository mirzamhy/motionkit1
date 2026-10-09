// HUD frame chrome (the "motion designer showreel" look from the research): corner brackets, mono labels in the
// corners, a running timecode, the current section "03 / 07", a thin progress line and a 4-step beat meter that
// pulses on punches. Drawn over every engine, under the captions. Everything is low-contrast so it never competes.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Look } from '../engine/looks';
import type { Timeline } from '../engine/timeline';
import type { AspectCfg, Hit } from '../engine/types';
import { hitEnv, prog } from '../engine/util';
import type { Spec } from '../spec/schema';

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

export const HudOverlay: React.FC<{ A: AspectCfg; spec: Spec; tl: Timeline; look: Look; t: number; hits: Hit[]; mono: string; ink?: string; hot?: string }> = ({ A, spec, tl, look, t, hits, mono, ink: inkIn, hot: hotIn }) => {
  if (!spec.hud) return null;
  const { W, H } = A;
  const P = A.aspect === 'portrait';
  // kinetic passes the colours of the scene on screen; card engines use the look's world ink
  const ink = inkIn ?? look.world.text;
  const hot = hotIn ?? look.hot;
  const m = P ? 44 : 40; // margin
  const fs = P ? 22 : 18;
  const fade = prog(t, 4, 24);
  const fps = spec.fps;
  const tc = `TC ${pad2(t / fps / 3600)}:${pad2((t / fps / 60) % 60)}:${pad2((t / fps) % 60)}:${pad2(t % fps)}`;
  const arrivals = spec.beats.map((b) => tl.cue(b.at));
  let idx = 0;
  arrivals.forEach((a, i) => {
    if (t >= a - 8) idx = i;
  });
  const sec = `${pad2(idx + 1)} / ${pad2(spec.beats.length)}`;
  const kind = spec.beats[idx].widget.type.toUpperCase();
  const punches = hits.filter((h) => h.kind === 'punch');
  const beat = punches.reduce((a, h) => a + hitEnv(t, h.at, 10, 4), 0);
  const step = punches.filter((h) => t >= h.at).length % 4;
  const label: React.CSSProperties = { position: 'absolute', fontFamily: mono, fontSize: fs, letterSpacing: '0.16em', color: ink, opacity: 0.55, whiteSpace: 'nowrap' };
  const corner = (x: number, y: number, sx: number, sy: number) => (
    <div style={{ position: 'absolute', left: x - (sx < 0 ? 22 : 0), top: y - (sy < 0 ? 22 : 0), width: 22, height: 22, borderLeft: sx > 0 ? `2px solid ${ink}` : undefined, borderRight: sx < 0 ? `2px solid ${ink}` : undefined, borderTop: sy > 0 ? `2px solid ${ink}` : undefined, borderBottom: sy < 0 ? `2px solid ${ink}` : undefined, opacity: 0.45 }} />
  );
  const progress = Math.min(1, t / Math.max(1, tl.total - 1));
  // bottom row sits at the very bottom, under the captions, in both aspects
  const bottomY = H - m - fs;
  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: 'none' }}>
      {corner(m - 12, m - 12, 1, 1)}
      {corner(W - m + 12, m - 12, -1, 1)}
      {corner(m - 12, H - m + 12, 1, -1)}
      {corner(W - m + 12, H - m + 12, -1, -1)}
      <div style={{ ...label, left: m + 18, top: m }}>{(spec.hud.label ?? spec.brand.name).toUpperCase()}</div>
      <div style={{ ...label, right: m + 18, top: m, fontVariantNumeric: 'tabular-nums' }}>{tc}</div>
      <div style={{ ...label, left: m + 18, top: bottomY, fontVariantNumeric: 'tabular-nums' }}>
        {sec} · {kind}
      </div>
      <div style={{ ...label, right: m + 18, top: bottomY, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7 }}>
        {spec.hud.right && <span style={{ marginRight: 10, opacity: 0.8 }}>{spec.hud.right.toUpperCase()}</span>}
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: fs * 0.7, height: fs * 0.7, background: i <= step ? hot : 'transparent', border: `1.5px solid ${i <= step ? hot : ink}`, transform: `scale(${(1 + (i === step ? 0.35 * beat : 0)).toFixed(3)})` }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: m + 18, right: m + 18, top: H - m + 2, height: 2 }}>
        <div style={{ position: 'absolute', inset: 0, background: ink, opacity: 0.18 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(progress * 100).toFixed(3)}%`, background: hot }} />
      </div>
    </AbsoluteFill>
  );
};
