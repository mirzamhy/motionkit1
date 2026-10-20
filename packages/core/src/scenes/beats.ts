// Named beats instead of loose frame numbers. Idea from codeverbojan/remotion-cinematic (MIT), whose camera keys
// say { scene: 'intro', at: 'end' } and are resolved to frames once. Here a shot lists its beats in order with a
// length and a gap after the previous beat (negative = overlaps it); lengthening one beat moves every later beat.
import { inOut, prog } from '../engine/util';

/** [name, length in frames, gap after the previous beat's end (negative overlaps it; for the first beat, its start)] */
export type BeatSpec<K extends string> = readonly [K, number, number?];

export const beats = <K extends string>(list: readonly BeatSpec<K>[]) => {
  const at = {} as Record<K, readonly [number, number]>;
  let end = 0;
  for (const [k, len, gap = 0] of list) {
    if (k in at) throw new Error(`beat "${k}" listed twice`);
    const a = end + gap;
    at[k] = [a, a + len];
    end = a + len;
  }
  const a = (k: K) => at[k][0];
  const b = (k: K) => at[k][1];
  return {
    at,
    a,
    b,
    /** last frame of the last-listed beat */
    end,
    /** 0→1 over beat k, or over the part of it between fractions `from` and `to` (they may run past 0–1) */
    p: (t: number, k: K, from = 0, to = 1, e: (x: number) => number = inOut) => {
      const len = b(k) - a(k);
      return prog(t, a(k) + len * from, a(k) + len * to, e);
    },
    /** 0→1 from the start of beat k1 to the end of beat k2 */
    span: (t: number, k1: K, k2: K, e: (x: number) => number = inOut) => prog(t, a(k1), b(k2), e),
  };
};
