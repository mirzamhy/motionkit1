// Word-by-word captions for Film. Idea from vshukla7/remotion-captions-themes (MIT): word timings in, a short page of
// words on screen, the spoken word lit. Rewritten for scene mode: timings are seconds in the voice recording (as
// written by apps/cli/edge_say.py), mapped to film frames through each shot's `vo` passages; every change eases over
// several frames (the repo's themes switch colour in one frame and rely on CSS transitions, which do not render).
import React from 'react';
import { inOut, outE, prog } from '../engine/util';
import type { Shot } from './film';

/** [word, start s, end s] in the recording */
export type Word = [string, number, number];
type Placed = { text: string; a: number; b: number };
const BASE = [244, 235, 216]; // caption ink, as Film's sentence captions

/** recording seconds → film frame, through the passage that contains it (null if no passage plays it) */
const toFrame = (shots: Shot[], starts: number[], fps: number, sec: number) => {
  for (let i = 0; i < shots.length; i++)
    for (const v of shots[i].vo ?? []) if (sec >= v.from - 0.05 && sec <= v.to + 0.05) return starts[i] + v.at + (sec - v.from) * fps;
  return null;
};

/** phrases end at sentence punctuation, a comma, or a pause over 0.25 s; each phrase is split into pages of at most
 *  `max` words with sizes as even as possible (5 words → 3 + 2, never 4 + 1 with a word left alone) */
const paginate = (words: Placed[], fps: number, max: number) => {
  const phrases: Placed[][] = [];
  let cur: Placed[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (!next || /[.!?,;:]$/.test(w.text) || (next.a - w.b) / fps > 0.25) {
      phrases.push(cur);
      cur = [];
    }
  });
  return phrases.flatMap((ph) => {
    const n = Math.ceil(ph.length / max);
    return Array.from({ length: n }, (_, k) => ph.slice(Math.round((k * ph.length) / n), Math.round(((k + 1) * ph.length) / n)));
  });
};

export const WordCaps: React.FC<{ shots: Shot[]; starts: number[]; fps: number; words: Word[]; t: number; font: string; portrait: boolean; max?: number; lit?: string; bottom?: number }> = ({ shots, starts, fps, words, t, font, portrait, max = 4, lit = '#F2C14E', bottom }) => {
  const placed = words.flatMap(([text, s, e]) => {
    const a = toFrame(shots, starts, fps, s), b = toFrame(shots, starts, fps, e);
    return a === null || b === null ? [] : [{ text, a, b }];
  });
  const pages = paginate(placed, fps, max);
  const IN = 8, OUT = 10;
  const hi = [1, 3, 5].map((k) => parseInt(lit.slice(k, k + 2), 16));
  return (
    <>
      {pages.map((p, i) => {
        // A page that follows straight on from the last one (no real pause) swaps quickly and in turn: the old page is
        // gone before the new one fades in, so the two never sit on top of each other.
        const tight = (k: number) => k > 0 && k < pages.length && pages[k][0].a - pages[k - 1][pages[k - 1].length - 1].b < 30;
        const startOf = (k: number) => pages[k][0].a - (tight(k) ? 3 : IN);
        const a = startOf(i), fin = tight(i) ? 5 : IN;
        const fout = tight(i + 1) ? 5 : OUT;
        const gone = i + 1 < pages.length ? Math.min(p[p.length - 1].b + 18 + OUT, startOf(i + 1)) : p[p.length - 1].b + 18 + OUT;
        const b = gone - fout;
        if (t < a || t > gone) return null;
        const show = prog(t, a, a + fin, outE) * (1 - prog(t, b, gone, inOut));
        return (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: bottom ?? (portrait ? 300 : 72), display: 'flex', justifyContent: 'center', opacity: show, transform: `translateY(${((1 - prog(t, a, a + fin + 4, outE)) * 14).toFixed(1)}px)` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: portrait ? '6px 18px' : '6px 16px', maxWidth: portrait ? 940 : 1500, padding: '12px 28px', borderRadius: 14, background: 'rgba(18,14,10,0.78)', fontFamily: font, fontSize: portrait ? 58 : 48, fontWeight: 700, lineHeight: 1.2 }}>
              {p.map((w, j) => {
                // lit while spoken: eases in over 4 frames before the word starts, out over 6 after it ends
                const on = prog(t, w.a - 4, w.a, inOut) * (1 - prog(t, w.b, w.b + 6, inOut));
                const said = prog(t, w.a - 4, w.a, inOut);
                const col = BASE.map((x, k) => Math.round(x + (hi[k] - x) * on)).join(', ');
                const base = 0.62 + 0.38 * said; // words not reached yet stay dimmer
                return (
                  <span key={j} style={{ display: 'inline-block', color: `rgb(${col})`, opacity: base, transform: `translateY(${(-4 * on).toFixed(1)}px)` }}>
                    {w.text}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
