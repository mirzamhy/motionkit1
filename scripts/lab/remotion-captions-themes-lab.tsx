// Lab for vshukla7/remotion-captions-themes (MIT): word-by-word captions in Film from edge-tts word timings.
// python apps/cli/edge_say.py id-ID-ArdiNeural +0% projects/repo-lab/public/vo-pasar.txt projects/repo-lab/public/vo-pasar.mp3 projects/repo-lab/public/vo-pasar.json
// npx remotion render scripts/lab/remotion-captions-themes-lab.tsx WordCapsLab out/repo-lab/wordcaps.mp4 --public-dir=projects/repo-lab/public
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, filmFrames, type Shot } from '../../packages/core/src/scenes/film';
import { Cloud, Foliage } from '../../packages/core/src/scenes/kit';
import type { Word } from '../../packages/core/src/scenes/wordcaps';
import words from '../../projects/repo-lab/public/vo-pasar.json';

const Bg: React.FC<{ a: number; sky: string; ground: string; seed: number }> = ({ a, sky, ground, seed }) => (
  <>
    <rect width={1920} height={1080} fill={sky} />
    <Cloud x={500 + a * 0.3} y={220} s={1.3} />
    <rect y={700} width={1920} height={380} fill={ground} />
    <Foliage x={360} y={690} r={190} seed={seed} t={a} dark="#2F5A3A" light="#5E8F55" />
    <Foliage x={1560} y={680} r={210} seed={seed + 1} t={a} dark="#2F5A3A" light="#5E8F55" />
  </>
);
// recording: sentence 1 at 0.10–1.71 s, sentence 2 at 2.56–6.66 s
const SHOTS: Shot[] = [
  { dur: 180, fill: ['#9CC7E4', '#7A8C55'], draw: (_u, a) => <Bg a={a} sky="#9CC7E4" ground="#7A8C55" seed={2} />, vo: [{ at: 30, from: 0.1, to: 1.75 }] },
  { dur: 330, fill: ['#F0C089', '#8A7448'], draw: (_u, a) => <Bg a={a} sky="#F0C089" ground="#8A7448" seed={5} />, vo: [{ at: 24, from: 2.55, to: 6.7 }] },
];
const WordCapsLab: React.FC = () => <Film shots={SHOTS} fonts={{ mono: 'monospace', ui: 'Inter, sans-serif' }} vo="vo-pasar.mp3" words={words as Word[]} />;
const WordCapsLabTall: React.FC = () => <Film width={1080} height={1920} shots={SHOTS} fonts={{ mono: 'monospace', ui: 'Inter, sans-serif' }} vo="vo-pasar.mp3" words={words as Word[]} />;

registerRoot(() => <>
  <Composition id="WordCapsLab" component={WordCapsLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(SHOTS)} />
  <Composition id="WordCapsLabTall" component={WordCapsLabTall} width={1080} height={1920} fps={60} durationInFrames={filmFrames(SHOTS)} />
</>);
