// Motion energy from a rendered film: mean absolute luma change between consecutive frames (0–255 scale, 480 px
// grey, captions cropped out), averaged per second. A second with almost no change reads as a dead slide.
// Calibration (mimo example, a known-good film): content seconds sit at 1.0–13, only the final lockup hold drops
// below 0.4. So: < 0.25 dead, < 0.5 slow.
import { spawnSync } from 'node:child_process';

export type Aspect = 'landscape' | 'portrait';

/** per-frame YAVG of |frame[i] - frame[i-1]|; index 0 is the change into frame 1 */
export const frameDiffs = (file: string, aspect: Aspect): number[] => {
  const crop = aspect === 'landscape' ? 'crop=1920:900:0:0' : 'crop=1080:1600:0:0';
  const res = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `${crop},scale=480:-2,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-`, '-an', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const vals: number[] = [];
  // values can be in scientific notation (9.2e-06) on static frames — parse the whole token
  for (const m of res.stdout.matchAll(/YAVG=([-\d.eE+]+)/g)) vals.push(Number(m[1]));
  return vals;
};

export const DEAD = 0.25;
export const SLOW = 0.5;

export type EnergyReport = { perSecond: number[]; dead: number[]; slow: number[]; checkedUntil: number };

/** `tailSec`: the closing hold (lockup) is allowed to be still, so it is not judged */
export const motionEnergy = (diffs: number[], fps: number, tailSec: number): EnergyReport => {
  const perSecond: number[] = [];
  for (let s = 0; s * fps < diffs.length; s++) {
    const win = diffs.slice(s * fps, (s + 1) * fps);
    perSecond.push(win.reduce((a, v) => a + v, 0) / Math.max(1, win.length));
  }
  const checkedUntil = Math.max(0, Math.floor(diffs.length / fps - tailSec));
  const dead: number[] = [];
  const slow: number[] = [];
  perSecond.slice(0, checkedUntil).forEach((v, s) => {
    if (v < DEAD) dead.push(s);
    else if (v < SLOW) slow.push(s);
  });
  return { perSecond, dead, slow, checkedUntil };
};

export const describeEnergy = (r: EnergyReport) => {
  const span = (xs: number[]) => xs.map((s) => `${s}s`).join(', ');
  const out: string[] = [];
  if (r.dead.length) out.push(`⚠ ${r.dead.length} dead second(s) (almost no motion): ${span(r.dead)} — give that stretch a cue, a camera move or a punch`);
  if (r.slow.length) out.push(`· ${r.slow.length} slow second(s): ${span(r.slow)}`);
  if (!out.length) out.push(`✓ motion every second (min ${Math.min(...r.perSecond.slice(0, r.checkedUntil)).toFixed(2)})`);
  return out;
};
