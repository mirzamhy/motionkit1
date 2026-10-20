// Music onsets and snapping shot cuts to them. Idea from sellersessions/claude-remotion-flow (no licence, idea only):
// detect onsets in the music, then move each scene start to the nearest onset within a window, each onset used once,
// by changing the previous scene's length. Written fresh here; onset detection is a plain energy-flux peak picker
// over ffmpeg-decoded PCM, so it needs no Python.
import { execFileSync } from 'node:child_process';

export type Onset = { sec: number; strength: number };

/** mono float samples at `rate` Hz, decoded by ffmpeg */
export const decode = (file: string, rate = 22050) => {
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(rate), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
};

/** onsets from rises in short-time energy: half-wave rectified log-energy flux, peaks above a moving threshold,
 *  at least `gap` seconds apart. Strength is the flux relative to the threshold. */
export const detectOnsets = (pcm: Float32Array, rate: number, { hop = 512, win = 1024, gap = 0.12, k = 1.5 } = {}): Onset[] => {
  const n = Math.max(0, Math.floor((pcm.length - win) / hop));
  const e = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < win; j++) s += pcm[i * hop + j] ** 2;
    e[i] = Math.log10(1e-10 + s / win);
  }
  const flux = new Float64Array(n);
  for (let i = 1; i < n; i++) flux[i] = Math.max(0, e[i] - e[i - 1]);
  const W = Math.round((0.25 * rate) / hop); // ±0.25 s neighbourhood for the threshold
  const out: Onset[] = [];
  let last = -Infinity;
  for (let i = 1; i < n - 1; i++) {
    let sum = 0, c = 0;
    for (let j = Math.max(0, i - W); j <= Math.min(n - 1, i + W); j++) { sum += flux[j]; c++; }
    const thr = (sum / c) * k + 0.05;
    const sec = (i * hop + win) / rate; // the new energy has fully entered the window by its end
    if (flux[i] > thr && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1] && sec - last >= gap) {
      out.push({ sec, strength: flux[i] / thr });
      last = sec;
    }
  }
  return out;
};

/** Move each shot start (frames; index 0 never moves) to the nearest unused onset within `window` frames, by changing
 *  the previous shot's duration; a shot is never made shorter than `minDur`. Returns new durations and what moved. */
export const snapShots = (durs: number[], onsets: Onset[], fps: number, { window = 20, minDur = 30, minStrength = 0 } = {}) => {
  const d = [...durs];
  const used = new Set<number>();
  const moves: { shot: number; from: number; to: number }[] = [];
  const frames = onsets.filter((o) => o.strength >= minStrength).map((o) => Math.round(o.sec * fps));
  for (let i = 1; i < d.length; i++) {
    const start = d.slice(0, i).reduce((a, b) => a + b, 0);
    let best = -1, bestDist = Infinity;
    frames.forEach((f, k) => {
      const dist = Math.abs(f - start);
      if (!used.has(k) && dist <= window && dist < bestDist && d[i - 1] + (f - start) >= minDur) { best = k; bestDist = dist; }
    });
    if (best < 0) continue;
    used.add(best);
    d[i - 1] += frames[best] - start;
    if (frames[best] !== start) moves.push({ shot: i, from: start, to: frames[best] });
  }
  return { durs: d, moves };
};
