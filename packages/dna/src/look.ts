// Map Style DNA onto the engine's look system: nearest preset by ground (dark/light) and accent hue, with the
// reference's own accent colours overriding the preset's. Also the spec patch the pipeline applies.
import { presetMeta } from '../../core/src/engine/looks';
import type { Spec } from '../../core/src/spec/schema';
import { hue, rgb, type Dna } from './analyze';

const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

export const lookFromDna = (dna: Dna): Spec['look'] => {
  const want = hue(rgb(dna.accent[0]));
  const pool = presetMeta().filter((p) => (dna.ground === 'mid' ? true : p.dark === (dna.ground === 'dark')));
  const best = (pool.length ? pool : presetMeta()).map((p) => ({ p, d: hueGap(hue(rgb(p.accent[0])), want) })).sort((a, b) => a.d - b.d)[0].p;
  return { preset: best.id as Spec['look']['preset'], accent: [dna.accent[0], dna.accent[1]], hot: dna.accent[0] };
};

/** what the pipeline forces onto a spec when a reference DNA exists */
export const dnaPatch = (dna: Dna) => ({ look: lookFromDna(dna), transition: { family: dna.transition } as Spec['transition'] });

export const describeDna = (dna: Dna) => {
  const look = lookFromDna(dna);
  return [
    `source      ${dna.source}`,
    `format      ${dna.width}×${dna.height} ${dna.aspect} · ${dna.fps} fps · ${dna.duration} s`,
    `ground      ${dna.ground}`,
    `palette     ${dna.palette.map((s) => `${s.hex} ${(s.share * 100).toFixed(0)}%`).join('  ')}`,
    `accent      ${dna.accent.join(' → ')}`,
    `tempo       ${dna.cuts.length} hard cuts (${dna.cutsPer10s} / 10 s) · ${dna.flashes} flash(es)`,
    `→ look      ${look.preset} with accent ${look.accent!.join(' / ')}`,
    `→ transition ${dna.transition}`,
  ];
};
