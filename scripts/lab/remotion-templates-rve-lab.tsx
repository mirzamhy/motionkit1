// Lab for reactvideoeditor/remotion-templates (MIT): lower third, chapter card and letterbox (scenes/titles.tsx),
// in two styles (modern, arsip), landscape and portrait, through Film's screen-space `over`.
// npx remotion still scripts/lab/remotion-templates-rve-lab.tsx TitlesLab out/repo-lab/ttl-<f>.png --frame=<f>
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, filmFrames, type Shot } from '../../packages/core/src/scenes/film';
import { Cloud, Foliage, Palm } from '../../packages/core/src/scenes/kit';
import { ChapterCard, Letterbox, LowerThird } from '../../packages/core/src/scenes/titles';

const Land: React.FC<{ a: number; sky: [string, string]; ground: string; seed: number }> = ({ a, sky, ground, seed }) => (
  <>
    <defs><linearGradient id={`tl-sky${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
    <rect width={1920} height={1080} fill={`url(#tl-sky${seed})`} />
    <Cloud x={420 + a * 0.3} y={200} s={1.4} />
    <rect y={720} width={1920} height={360} fill={ground} />
    <Foliage x={300} y={700} r={170} seed={seed} t={a} dark="#2F5A3A" light="#5E8F55" />
    <Foliage x={1600} y={690} r={200} seed={seed + 1} t={a} dark="#2F5A3A" light="#5E8F55" />
    <Palm x={1000} base={760} h={520} t={a} seed={seed + 2} />
  </>
);
const SHOTS: Shot[] = [
  {
    dur: 240,
    fill: ['#8EC3E6', '#7A8C55'], draw: (_u, a) => <Land a={a} sky={['#8EC3E6', '#E7F0EA']} ground="#7A8C55" seed={1} />,
    over: (u, _a, W, H) => <><Letterbox u={u} at={0} W={W} H={H} /><LowerThird u={u} at={30} until={200} name="Pak Darmo" role="Penjual sayur, Pasar Kapasan" W={W} H={H} /></>,
  },
  {
    dur: 200,
    fill: ['#F2B36A', '#8A7448'], draw: (_u, a) => <Land a={a} sky={['#F2B36A', '#F6E3C0']} ground="#8A7448" seed={4} />,
    over: (u, _a, W, H) => <ChapterCard u={u} at={20} until={170} n="BAB II" title="Pasar Pagi" W={W} H={H} style="arsip" />,
  },
  {
    dur: 220,
    age: 0.16,
    fill: ['#C9B48E', '#7D6A48'], draw: (_u, a) => <Land a={a} sky={['#C9B48E', '#EDE2C6']} ground="#7D6A48" seed={7} />,
    over: (u, _a, W, H) => <LowerThird u={u} at={20} until={190} name="Surabaya, 1923" role="Arsip foto keluarga" W={W} H={H} style="arsip" />,
  },
];
const FONTS = { mono: "'Special Elite', monospace", ui: 'Inter, sans-serif' };
const TitlesLab: React.FC = () => <Film shots={SHOTS} fonts={FONTS} captions={false} />;
const TitlesLabTall: React.FC = () => <Film shots={SHOTS} fonts={FONTS} captions={false} width={1080} height={1920} />;

registerRoot(() => <>
  <Composition id="TitlesLab" component={TitlesLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(SHOTS)} />
  <Composition id="TitlesLabTall" component={TitlesLabTall} width={1080} height={1920} fps={60} durationInFrames={filmFrames(SHOTS)} />
</>);
