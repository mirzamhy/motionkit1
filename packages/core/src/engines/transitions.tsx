// Scene-change overlays drawn over every engine's own camera move. One family per film (spec.transition), with a
// per-beat override. Timed to peak ~12 frames before the camera settles on the next beat, i.e. in the middle of the
// flight, so the cover hides the least readable frames. Everything eases over ≥5 frames — no one-frame steps.
// Captions render above this layer, so the VO text survives every change.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Look } from '../engine/looks';
import type { Timeline } from '../engine/timeline';
import type { AspectCfg } from '../engine/types';
import { clamp01, inOut, outE, prog } from '../engine/util';
import type { Spec } from '../spec/schema';

type Family = Spec['transition']['family'];
type Ev = { peak: number; family: Family };

const LEAD = 12; // frames before arrival that the cover peaks
const SPAN: Record<Family, [number, number]> = { camera: [0, 0], fade: [16, 18], flash: [6, 22], color: [12, 14], bar: [16, 16], streak: [9, 9], iris: [12, 16], blinds: [13, 14] };

export const transitionEvents = (spec: Spec, tl: Timeline): Ev[] => {
  const out: Ev[] = [];
  spec.beats.forEach((b, i) => {
    if (i === 0) return;
    const prev = spec.beats[i - 1];
    if (b.group && b.group === prev.group) return; // side-by-side station: no scene change
    if (b.widget.type === 'lockup' && b.widget.stack) return; // appears in place
    const family: Family = b.transition === 'none' ? 'camera' : (b.transition ?? spec.transition.family);
    if (family === 'camera') return;
    out.push({ peak: tl.cue(b.at) + 2 - LEAD, family });
  });
  return out;
};

const colorOf = (spec: Spec, look: Look, family: Family) => {
  const c = spec.transition.color ?? ({ fade: 'ground', flash: look.dark ? 'white' : 'accent', color: 'accent', bar: 'accent', streak: 'accent', iris: 'accent', blinds: 'ink', camera: 'ground' } as const)[family];
  if (c === 'accent') return `linear-gradient(120deg, ${look.accent[0]} 0%, ${look.accent[1]} 100%)`;
  if (c === 'brand') return spec.brand.color ?? look.hot;
  if (c === 'ground') return look.world.bg;
  if (c === 'ink') return look.world.text;
  return '#FFFFFF';
};

const One: React.FC<{ A: AspectCfg; ev: Ev; t: number; bg: string; hot: string }> = ({ A, ev, t, bg, hot }) => {
  const { peak, family } = ev;
  const [pre, post] = SPAN[family];
  if (t < peak - pre - 1 || t > peak + post + 1) return null;
  const { W, H } = A;
  switch (family) {
    case 'fade': {
      const o = t <= peak ? prog(t, peak - pre, peak - 2, inOut) : 1 - prog(t, peak + 2, peak + post, inOut);
      return <AbsoluteFill style={{ background: bg, opacity: o }} />;
    }
    case 'flash': {
      const o = t <= peak ? prog(t, peak - pre, peak, inOut) : 1 - prog(t, peak, peak + post, outE);
      return <AbsoluteFill style={{ background: bg, opacity: 0.92 * o }} />;
    }
    case 'color': {
      // a solid block wipes up over the frame, holds for a beat, and keeps going out the top
      const y = t <= peak ? 1 - prog(t, peak - pre, peak - 2, inOut) : -prog(t, peak + 2, peak + post, inOut);
      return <AbsoluteFill style={{ background: bg, transform: `translateY(${(y * 100).toFixed(2)}%)` }} />;
    }
    case 'bar': {
      // slanted parallelogram sweeping left → right, covering the frame around the peak
      const u = prog(t, peak - pre, peak + post, inOut);
      const w = W * 1.6;
      const cx = -W * 1.0 + u * W * 3.0;
      return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -H * 0.1, height: H * 1.2, left: cx - w / 2, width: w, background: bg, transform: 'skewX(-18deg)' }} />
        </AbsoluteFill>
      );
    }
    case 'streak': {
      // a thin bright diagonal line crossing the frame with a soft veil; never covers, just punctuates
      const u = prog(t, peak - pre, peak + post, inOut);
      const veil = 0.18 * Math.sin(Math.PI * clamp01(u));
      const len = Math.hypot(W, H) * 1.4;
      const x = -W * 0.4 + u * W * 1.8;
      return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <AbsoluteFill style={{ background: '#FFFFFF', opacity: veil }} />
          <div style={{ position: 'absolute', left: x, top: H / 2 - len / 2, width: 10, height: len, background: hot, boxShadow: `0 0 40px 12px ${hot}`, transform: 'rotate(24deg)', borderRadius: 10 }} />
        </AbsoluteFill>
      );
    }
    case 'iris': {
      const R = Math.hypot(W, H) / 2 + 24;
      const grow = t <= peak ? prog(t, peak - pre, peak, (x) => x * x * x) : 1;
      const o = t <= peak ? 1 : 1 - prog(t, peak + 2, peak + post, inOut);
      const s = t <= peak ? 1 : 1 + 0.08 * prog(t, peak, peak + post, outE);
      const r = Math.max(0.5, R * grow * s);
      return (
        <AbsoluteFill style={{ overflow: 'hidden', opacity: o }}>
          <div style={{ position: 'absolute', left: W / 2 - r, top: A.cy0 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: bg }} />
        </AbsoluteFill>
      );
    }
    case 'blinds': {
      const n = 8;
      const h = H / n;
      return (
        <AbsoluteFill>
          {Array.from({ length: n }, (_, k) => {
            const d = k * 0.5;
            const inP = prog(t, peak - pre + d, peak - pre + d + 9, inOut);
            const outP = prog(t, peak + 2 + d, peak + 2 + d + 9, inOut);
            const sy = t <= peak ? inP : 1 - outP;
            return <div key={k} style={{ position: 'absolute', left: 0, top: k * h - 1, width: W, height: h + 2, background: bg, transform: `scaleY(${sy.toFixed(4)})`, transformOrigin: t <= peak ? '50% 0%' : '50% 100%' }} />;
          })}
        </AbsoluteFill>
      );
    }
    default:
      return null;
  }
};

export const TransitionOverlay: React.FC<{ A: AspectCfg; spec: Spec; tl: Timeline; look: Look; t: number }> = ({ A, spec, tl, look, t }) => {
  const evs = React.useMemo(() => transitionEvents(spec, tl), [spec, tl]);
  if (!evs.length) return null;
  return (
    <>
      {evs.map((ev, i) => (
        <One key={i} A={A} ev={ev} t={t} bg={colorOf(spec, look, ev.family)} hot={look.hot} />
      ))}
    </>
  );
};
