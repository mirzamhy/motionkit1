// Lab for lifeprompt-team/remotion-scenes (MIT): the 'ink' and 'leak' shot entrances in Film (scenes/cuts.tsx).
// npx remotion still scripts/lab/remotion-scenes-lab.tsx CutsLab out/repo-lab/cut-<f>.png --frame=<f>
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, filmFrames, type Shot } from '../../packages/core/src/scenes/film';
import { Cloud, Foliage, Palm } from '../../packages/core/src/scenes/kit';

const Land: React.FC<{ a: number; sky: [string, string]; ground: string; seed: number }> = ({ a, sky, ground, seed }) => (
  <>
    <defs><linearGradient id={`sky${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
    <rect width={1920} height={1080} fill={`url(#sky${seed})`} />
    <Cloud x={420 + a * 0.3} y={200} s={1.4} />
    <Cloud x={1380 + a * 0.2} y={150} s={1.1} />
    <rect y={720} width={1920} height={360} fill={ground} />
    <Foliage x={300} y={700} r={170} seed={seed} t={a} dark="#2F5A3A" light="#5E8F55" />
    <Foliage x={1600} y={690} r={200} seed={seed + 1} t={a} dark="#2F5A3A" light="#5E8F55" />
    <Palm x={1000} base={760} h={520} t={a} seed={seed + 2} />
  </>
);
const SHOTS: Shot[] = [
  { dur: 180, label: 'SHOT 1 · DAY', fill: ['#8EC3E6', '#7A8C55'], draw: (_u, a) => <Land a={a} sky={['#8EC3E6', '#E7F0EA']} ground="#7A8C55" seed={1} /> },
  { dur: 180, label: 'SHOT 2 · INK', cut: 'ink', fill: ['#F2B36A', '#8A7448'], draw: (_u, a) => <Land a={a} sky={['#F2B36A', '#F6E3C0']} ground="#8A7448" seed={4} /> },
  { dur: 180, label: 'SHOT 3 · LEAK', cut: 'leak', fill: ['#2E3A66', '#3E4A3A'], draw: (_u, a) => <Land a={a} sky={['#2E3A66', '#9A7FA0']} ground="#3E4A3A" seed={7} /> },
];
const CutsLab: React.FC = () => <Film shots={SHOTS} fonts={{ mono: 'monospace', ui: 'Inter, sans-serif' }} captions={false} />;
const CutsLabTall: React.FC = () => <Film width={1080} height={1920} shots={SHOTS} fonts={{ mono: 'monospace', ui: 'Inter, sans-serif' }} captions={false} />;

registerRoot(() => <>
  <Composition id="CutsLab" component={CutsLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(SHOTS)} />
  <Composition id="CutsLabTall" component={CutsLabTall} width={1080} height={1920} fps={60} durationInFrames={filmFrames(SHOTS)} />
</>);
