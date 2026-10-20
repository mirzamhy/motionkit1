// Lab for haidrrrry/claude-remotion-skill (MIT): bed ducking under voice, and entrance / hold / faster exit with a stagger.
// npx remotion render scripts/lab/claude-remotion-skill-lab.tsx DuckLab out/repo-lab/duck.wav --codec=wav --public-dir=projects/repo-lab/public
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, filmFrames, type Shot } from '../../packages/core/src/scenes/film';
import { inOut, outE, prog } from '../../packages/core/src/engine/util';

// The voice file is silence, so the rendered track is the bed alone and its level shows the duck.
// Passages: 2–4 s in shot 1, 7–9 s in shot 2 (film seconds, 60 fps).
const word = (text: string, i: number, u: number, out: number) => {
  const inP = prog(u, 20 + i * 5, 40 + i * 5, outE); // entrance 20 frames, 5-frame stagger
  const outP = prog(u, out + i * 3, out + 10 + i * 3, inOut); // exit 10 frames: faster than the entrance
  return <text key={i} x={960 + (i - 1) * 480} textAnchor="middle" y={560 - (1 - inP) * 40 + outP * -30} fontSize={110} fontFamily="Inter, sans-serif" fontWeight={700} fill="#F4EBD8" opacity={inP * (1 - outP)}>{text}</text>;
};
const SHOTS: Shot[] = [
  {
    dur: 300,
    draw: (u) => <svg width={1920} height={1080}><rect width={1920} height={1080} fill="#2B3A33" />{['masuk', 'tahan', 'keluar'].map((w, i) => word(w, i, u, 250))}</svg>,
    vo: [{ at: 120, from: 0, to: 2 }],
  },
  {
    dur: 300,
    draw: (u) => <svg width={1920} height={1080}><rect width={1920} height={1080} fill="#3A2F2B" />{['satu', 'dua', 'tiga'].map((w, i) => word(w, i, u, 250))}</svg>,
    vo: [{ at: 120, from: 4, to: 6 }],
  },
];
const DuckLab: React.FC = () => <Film shots={SHOTS} fonts={{ mono: 'monospace', ui: 'Inter, sans-serif' }} vo="vo-silent.wav" sfx bed={{ file: 'pad', vol: 0.5, duck: 0.3 }} captions={false} />;
const NoDuckLab: React.FC = () => <Film shots={SHOTS} fonts={{ mono: 'monospace', ui: 'Inter, sans-serif' }} vo="vo-silent.wav" sfx bed={{ file: 'pad', vol: 0.5 }} captions={false} />;

registerRoot(() => <>
  <Composition id="DuckLab" component={DuckLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(SHOTS)} />
  <Composition id="NoDuckLab" component={NoDuckLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(SHOTS)} />
</>);
