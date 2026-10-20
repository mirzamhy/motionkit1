// The film runner for hand-built scenes: a list of shots played back to back with dissolves, on-screen narration,
// a corner label, an optional recorded voice-over cut into passages, and one grade over everything.
//
// Two clocks reach every shot:
//   u — the BEAT clock. With `warp` it is retimed so drawn events land on the words that name them.
//   a — the AMBIENT clock: real frames since the shot began. Use it for anything that should keep its own pace
//       whatever the retiming does (flags, leaves, footsteps, blinking).
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { inOut, outE, prog, typed } from '../engine/util';
import { CUT_SPAN, InkClip, Leak, type Cut } from './cuts';
import { n1 } from './kit';
import { WordCaps, type Word } from './wordcaps';

/** one passage of the voice-over: `at` = shot frame the speech starts on; from / to = seconds in the recording */
export type Vo = { at: number; from: number; to: number };
/** a sound: `at` = shot frame (real) it starts on; `len` in frames (omit to play the file once); `loop` for ambiences */
/** `from`: seconds into the file to start at · `fin` / `fout`: fade in / out, in frames */
export type Sfx = { at: number; file: string; vol?: number; len?: number; loop?: boolean; from?: number; fin?: number; fout?: number };
export type Shot = {
  dur: number;
  /** typewritten corner label, e.g. "SURABAYA · 1923" */
  label?: string;
  /** 0–0.2: strength of the warm "old photograph" wash for this shot (0 for present-day scenes) */
  age?: number;
  /** [frame in this film, frame on the shot's beat clock] pairs, linear in between. Omit for 1:1. */
  warp?: [number, number][];
  /** `P` is true when the film is rendered tall (phone): move or restack anything that would fall out of frame */
  draw: (u: number, a: number, P: boolean) => React.ReactNode;
  /** phone framing: the shot is drawn in its 1920×1080 space and seen through a tall window. Keyframes
   *  [frame, x, y, zoom]: the point (x, y) sits in the middle of the screen at that zoom; eased in between. */
  portrait?: [number, number, number, number][];
  /** colours behind the shot where the tall window looks past its drawn area: [above, below] */
  fill?: [string, string];
  /** narration lines: [from, to, text] in shot frames (real, not warped) */
  caps?: [number, number, string][];
  vo?: Vo[];
  sfx?: Sfx[];
  /** drawn in screen space above the grade (titles, lower thirds, letterbox): not moved by the portrait window */
  over?: (u: number, a: number, W: number, H: number) => React.ReactNode;
  /** how this shot enters over the previous one: 'dissolve' (default), 'ink' (a spreading blot), 'leak' (dissolve under a warm light leak) */
  cut?: Cut;
};

export const filmStarts = (shots: Shot[]) => shots.reduce<number[]>((a, _s, i) => [...a, i === 0 ? 0 : a[i - 1] + shots[i - 1].dur], []);
export const filmFrames = (shots: Shot[]) => shots.reduce((n, s) => n + s.dur, 0);

export const warped = (s: Shot, u: number) => {
  const w = s.warp;
  if (!w) return u;
  if (u <= w[0][0]) return w[0][1] + (u - w[0][0]);
  for (let i = 1; i < w.length; i++)
    if (u <= w[i][0]) {
      const [a, b] = [w[i - 1], w[i]];
      return a[1] + ((u - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
    }
  const last = w[w.length - 1];
  return last[1] + (u - last[0]);
};

/** the tall window onto a shot at real frame `a` */
const tall = (s: Shot, a: number, w: number, h: number) => {
  const k = s.portrait ?? [[0, 960, 540, 1.3]];
  let cur = k[0];
  for (let i = 1; i < k.length; i++) {
    if (a >= k[i][0]) cur = k[i];
    else {
      const p = inOut(Math.max(0, Math.min(1, (a - k[i - 1][0]) / (k[i][0] - k[i - 1][0]))));
      cur = [a, k[i - 1][1] + (k[i][1] - k[i - 1][1]) * p, k[i - 1][2] + (k[i][2] - k[i - 1][2]) * p, k[i - 1][3] + (k[i][3] - k[i - 1][3]) * p];
      break;
    }
  }
  return `translate(${w / 2} ${h / 2}) scale(${cur[3].toFixed(4)}) translate(${n1(-cur[1])} ${n1(-cur[2])})`;
};

const FADE = 24;
const PAD_IN = 0.1; // seconds of the recording kept before / after each passage, inside its pauses
const PAD_OUT = 0.2;
const DUCK = 15; // frames the bed takes to dip before a voice passage and to come back after it

/** 0→1: how much a voice passage covers frame fr, eased over DUCK frames on both sides (for ducking the bed) */
const voCover = (shots: Shot[], starts: number[], fps: number, fr: number) => {
  let w = 0;
  shots.forEach((s, i) =>
    (s.vo ?? []).forEach((v) => {
      const a = starts[i] + v.at - Math.round(PAD_IN * fps);
      const b = a + Math.round((v.to + PAD_OUT) * fps) - Math.max(0, Math.round((v.from - PAD_IN) * fps));
      w = Math.max(w, Math.min(prog(fr, a - DUCK, a, inOut), 1 - prog(fr, b, b + DUCK, inOut)));
    }),
  );
  return w;
};

export const Film: React.FC<{
  shots: Shot[];
  /** <defs> blocks the shots need (gradients, patterns, static filters) */
  defs?: React.ReactNode;
  fonts: { mono: string; ui: string };
  width?: number;
  height?: number;
  fps?: number;
  /** file name inside the public dir; omitted or null = silent film */
  vo?: string | null;
  captions?: boolean;
  background?: string;
  /** play the shots' `sfx` (files live in <public>/sfx/, see apps/cli/sceneSfx.ts) */
  sfx?: boolean;
  /** a quiet looping bed under the whole film, e.g. { file: 'pad', vol: 0.05 }; `duck` (0–1) scales it while the voice speaks */
  bed?: { file: string; vol: number; duck?: number };
  /** word timings of the voice recording ([word, start s, end s], from apps/cli/edge_say.py): replaces the shots' `caps` with word-by-word captions */
  words?: Word[];
}> = ({ shots, defs, fonts, width = 1920, height = 1080, fps = 60, vo, captions = true, background = '#1A120A', sfx = false, bed, words }) => {
  const t = useCurrentFrame();
  const starts = filmStarts(shots);
  // which shot owns the frame (label, grade); the previous one keeps drawing under the dissolve
  let cur = 0;
  for (let i = 0; i < shots.length; i++) if (t >= starts[i]) cur = i;
  const shot = shots[cur];
  const cut = shot.cut ?? 'dissolve';
  const inMix = cur > 0 ? prog(t, starts[cur], starts[cur] + CUT_SPAN[cut], cut === 'ink' ? (x) => x : inOut) : 1;
  const inking = cut === 'ink' && inMix < 1;
  const prev = cur > 0 ? shots[cur - 1] : null;
  const age = prev ? (prev.age ?? 0) + ((shot.age ?? 0) - (prev.age ?? 0)) * inMix : shot.age ?? 0;
  const u = t - starts[cur];
  const portrait = height > width;
  return (
    <AbsoluteFill style={{ background }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="fm-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0" />
          </filter>
          <radialGradient id="fm-vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#1A120A" stopOpacity="0" />
            <stop offset="1" stopColor="#1A120A" stopOpacity="0.6" />
          </radialGradient>
        </defs>
        {defs}
        {inking && <InkClip id={`fm-ink${cur}`} m={inMix} w={width} h={height} seed={cur} />}
        {[prev && inMix < 1 ? { s: prev, a: t - starts[cur - 1], o: 1 } : null, { s: shot, a: u, o: inking ? 1 : inMix }].map(
          (x) =>
            x && (
              <g key={x.s === shot ? 'cur' : 'prev'} opacity={x.o} clipPath={inking && x.s === shot ? `url(#fm-ink${cur})` : undefined}>
                {portrait && x.s.fill && (
                  <>
                    <rect width={width} height={height / 2} fill={x.s.fill[0]} />
                    <rect y={height / 2} width={width} height={height / 2} fill={x.s.fill[1]} />
                  </>
                )}
                <g transform={portrait ? tall(x.s, x.a, width, height) : undefined}>{x.s.draw(warped(x.s, x.a), x.a, portrait)}</g>
              </g>
            ),
        )}
        {cut === 'leak' && cur > 0 && <Leak m={inMix} w={width} h={height} seed={cur} />}
        {/* grade: a warm wash for the old years, vignette, static grain */}
        <rect width={width} height={height} fill="#C9A46A" opacity={age} style={{ mixBlendMode: 'multiply' }} />
        <rect width={width} height={height} fill="url(#fm-vig)" />
        <rect width={width} height={height} filter="url(#fm-grain)" opacity={0.18} style={{ mixBlendMode: 'overlay' }} />
        {prev && inMix < 1 && prev.over && <g opacity={1 - inMix}>{prev.over(warped(prev, t - starts[cur - 1]), t - starts[cur - 1], width, height)}</g>}
        {shot.over && <g opacity={inking ? 1 : inMix}>{shot.over(warped(shot, u), u, width, height)}</g>}
      </svg>
      {shot.label && (
        <div style={{ position: 'absolute', left: portrait ? 48 : 64, top: portrait ? 120 : 54, fontFamily: fonts.mono, fontSize: 32, letterSpacing: '0.12em', color: '#FBF6EA', textShadow: '0 2px 10px rgba(0,0,0,0.6)', opacity: prog(u, 6, 20) * (1 - prog(u, shot.dur - 20, shot.dur - 4, inOut)) }}>{typed(shot.label, u, 16, 0.5)}</div>
      )}
      {captions && words && <WordCaps shots={shots} starts={starts} fps={fps} words={words} t={t} font={fonts.ui} portrait={portrait} />}
      {captions &&
        !words &&
        (shot.caps ?? []).map(([a, b, text]) => (
          <div key={a} style={{ position: 'absolute', left: 0, right: 0, bottom: portrait ? 250 : 64, display: 'flex', justifyContent: 'center', opacity: prog(u, a, a + 14) * (1 - prog(u, b - 14, b, inOut)), transform: `translateY(${n1((1 - prog(u, a, a + 18, outE)) * 16)}px)` }}>
            <div style={{ padding: '14px 30px', borderRadius: 14, background: 'rgba(18,14,10,0.82)', fontFamily: fonts.ui, fontSize: portrait ? 46 : 40, lineHeight: 1.25, color: '#F4EBD8', whiteSpace: portrait ? 'normal' : 'nowrap', maxWidth: portrait ? 900 : undefined, textAlign: 'center' }}>{text}</div>
          </div>
        ))}
      {/* voice-over: each passage of the recording, placed on its shot */}
      {vo &&
        shots.map((s, i) =>
          (s.vo ?? []).map((v) => {
            const startFrom = Math.max(0, Math.round((v.from - PAD_IN) * fps));
            const endAt = Math.round((v.to + PAD_OUT) * fps);
            return (
              <Sequence key={`${i}-${v.at}`} from={starts[i] + v.at - Math.round(PAD_IN * fps)} durationInFrames={endAt - startFrom} layout="none">
                <Audio src={staticFile(vo)} startFrom={startFrom} endAt={endAt} />
              </Sequence>
            );
          }),
        )}
      {sfx && bed && <Audio src={staticFile(`sfx/${bed.file}.wav`)} loop volume={(fr) => bed.vol * Math.min(1, fr / 60) * Math.min(1, (filmFrames(shots) - fr) / 120) * (vo && bed.duck !== undefined ? 1 - (1 - bed.duck) * voCover(shots, starts, fps, fr) : 1)} />}
      {sfx &&
        shots.map((s, i) =>
          (s.sfx ?? []).map((x, j) => {
            const len = x.len ?? Math.max(1, s.dur - x.at + FADE);
            // every sound eases in and out, so nothing clicks at a cut
            const env = (fr: number) => (x.vol ?? 0.3) * Math.min(1, (fr + 1) / (x.fin ?? 8)) * (x.loop || x.len ? Math.min(1, Math.max(0, (len - fr) / (x.fout ?? 20))) : 1);
            return (
              <Sequence key={`s${i}-${j}`} from={starts[i] + x.at} durationInFrames={len} layout="none">
                <Audio src={staticFile(`sfx/${x.file}.wav`)} loop={x.loop} startFrom={Math.round((x.from ?? 0) * fps)} volume={env} />
              </Sequence>
            );
          }),
        )}
    </AbsoluteFill>
  );
};
