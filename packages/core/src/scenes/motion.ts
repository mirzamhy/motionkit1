import { Easing } from 'remotion';

export type EasingFn = (progress: number) => number;
export type KP = readonly [frame: number, value: number, easing?: EasingFn];

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const outE: EasingFn = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut: EasingFn = Easing.bezier(0.65, 0, 0.35, 1);
export const flyE: EasingFn = Easing.bezier(0.8, 0, 0.2, 1);
export const lin: EasingFn = (value) => value;

export const prog = (frame: number, start: number, end: number, easing: EasingFn = outE) => {
  if (start === end) return frame <= start ? 0 : 1;
  return easing(clamp01((frame - start) / (end - start)));
};

export const pop = (frame: number, start: number, damping = 4) => {
  if (frame < start) return 0;
  const elapsed = frame - start;
  return 1 - Math.exp(-elapsed / Math.max(0.001, damping)) * Math.cos(elapsed * 0.45);
};

export const hitEnv = (frame: number, at: number, decay = 8, rise = 6) =>
  frame < at ? prog(frame, at - rise, at, inOut) : Math.exp(-(frame - at) / Math.max(0.001, decay));

export const seeded = (seed: number) => {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return raw - Math.floor(raw);
};

export const kf = (frame: number, points: readonly KP[]) => {
  if (points.length === 0) throw new Error('kf needs at least one keyframe');
  if (frame <= points[0][0]) return points[0][1];

  for (let i = points.length - 1; i >= 0; i--) {
    if (frame === points[i][0]) return points[i][1];
  }

  for (let i = 1; i < points.length; i++) {
    const [endFrame, endValue, easing = inOut] = points[i];
    if (frame < endFrame) {
      const [startFrame, startValue] = points[i - 1];
      const progress = prog(frame, startFrame, endFrame, easing);
      return startValue + (endValue - startValue) * progress;
    }
  }
  return points[points.length - 1][1];
};

export const typed = (text: string, frame: number, start: number, charsPerFrame = 1.4) => {
  const length = Math.floor(Math.max(0, frame - start) * Math.max(0, charsPerFrame));
  return text.slice(0, Math.min(text.length, length));
};
