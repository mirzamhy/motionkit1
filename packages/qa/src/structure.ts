// Anti-slideshow checks on the spec, before anything renders. Adapted from the "PPT test" idea in bang-motion
// (MIT): a film reads as a slide deck when nothing happens for long stretches, when the same card repeats, or when
// it is the stock hook → feature → feature → feature → logo skeleton with no moment of its own.
import type { Timeline } from '../../core/src/engine/timeline';
import type { Spec } from '../../core/src/spec/schema';

const CUE_KEYS = new Set(['at', 'strike', 'climbAt', 'resultAt', 'titleAt', 'captionAt', 'from', 'to', 'cutAt', 'goAt', 'logoAt', 'scanFrom', 'scanTo', 'doneAt', 'kickerAt', 'revealAt']);
const CARD_TYPES = new Set(['stat', 'vision', 'code', 'checklist', 'chat', 'bars', 'price', 'agents']);

/** every frame where something is told to happen: beat arrivals, widget cues, punches, camera moves */
export const eventFrames = (spec: Spec, tl: Timeline): number[] => {
  const out: number[] = [];
  const walk = (o: unknown, key = '') => {
    if (Array.isArray(o)) o.forEach((v) => walk(v, key));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, k);
    else if (typeof o === 'string' && CUE_KEYS.has(key)) out.push(tl.cue(o));
  };
  for (const b of spec.beats) {
    walk(b.widget);
    out.push(tl.cue(b.at));
    (b.punches ?? []).forEach((c) => out.push(tl.cue(c)));
    (b.camera?.moves ?? []).forEach((m) => out.push(tl.cue(m.at)));
    if (b.stamp) out.push(tl.cue(b.stamp.at));
  }
  return [...new Set(out)].sort((a, b) => a - b);
};

export const structureWarnings = (spec: Spec, tl: Timeline): string[] => {
  const w: string[] = [];
  const fps = spec.fps;

  // 1. dead stretches: no event for > 3.5 s while the film is still talking
  const ev = eventFrames(spec, tl);
  const lastVo = tl.cue('end');
  for (let i = 1; i < ev.length; i++) {
    const gap = ev[i] - ev[i - 1];
    if (ev[i - 1] < lastVo && gap > 3.5 * fps)
      w.push(`structure: nothing happens for ${(gap / fps).toFixed(1)} s (frames ${ev[i - 1]}–${ev[i]}) — cue a word, add a punch or a camera move in between`);
  }

  // 2. the same widget three times in a row reads as a carousel
  for (let i = 2; i < spec.beats.length; i++) {
    const t = spec.beats[i].widget.type;
    if (t === spec.beats[i - 1].widget.type && t === spec.beats[i - 2].widget.type)
      w.push(`structure: beats ${i - 2}–${i} are all "${t}" — vary the widget or merge them`);
  }

  // 3. the stock skeleton with nothing of its own
  const types = spec.beats.map((b) => b.widget.type);
  const cards = types.slice(1, -1).filter((t) => CARD_TYPES.has(t)).length;
  const stock = (types[0] === 'hero' || types[0] === 'headline') && types[types.length - 1] === 'lockup' && cards >= 3 && cards === types.length - 2;
  const hasMoment = spec.beats.some((b) => (b.punches?.length ?? 0) > 0 || (b.camera?.moves?.length ?? 0) > 0 || b.widget.type === 'takeover' || b.widget.type === 'agents') || spec.transition.family !== 'camera';
  if (stock && !hasMoment) w.push('structure: hook → card → card → card → logo with no punches, camera moves, takeover or transition — it will read as a template; give it one moment');

  return w;
};
