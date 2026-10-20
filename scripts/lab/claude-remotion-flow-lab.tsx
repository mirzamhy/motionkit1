// Lab for sellersessions/claude-remotion-flow (no licence, idea only): shot cuts snapped to music onsets
// (apps/cli/onsets.ts). Same four shots over a 128 BPM beat, cut where written vs snapped by
// `node bin/mk.mjs beats projects/repo-lab/public/sfx/beat128.wav --durs 160,175,190,150`.
// npx remotion render scripts/lab/claude-remotion-flow-lab.tsx SnapLab out/repo-lab/snap.mp4 --public-dir=projects/repo-lab/public
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, filmFrames, type Shot } from '../../packages/core/src/scenes/film';
import { Cloud, Foliage, Palm } from '../../packages/core/src/scenes/kit';

const SKY: [string, string][] = [['#8EC3E6', '#7A8C55'], ['#F2B36A', '#8A7448'], ['#2E3A66', '#3E4A3A'], ['#C9B48E', '#7D6A48']];
const Land: React.FC<{ a: number; i: number }> = ({ a, i }) => (
  <>
    <rect width={1920} height={1080} fill={SKY[i][0]} />
    <Cloud x={420 + a * 0.3} y={200} s={1.4} />
    <rect y={720} width={1920} height={360} fill={SKY[i][1]} />
    <Foliage x={300 + i * 120} y={700} r={170} seed={i * 3 + 1} t={a} dark="#2F5A3A" light="#5E8F55" />
    <Palm x={1100 - i * 90} base={760} h={520} t={a} seed={i * 3 + 2} />
  </>
);
const shots = (durs: number[], label: string): Shot[] => durs.map((dur, i) => ({ dur, cut: 'dissolve', label: `${label} · CUT ${i}`, fill: SKY[i], draw: (_u, a) => <Land a={a} i={i} /> }));
const RAW = shots([160, 175, 190, 150], 'SEPERTI DITULIS');
const SNAP = shots([170, 169, 196, 150], 'DI-SNAP KE KETUKAN');
const FONTS = { mono: 'monospace', ui: 'Inter, sans-serif' };
const bed = { file: 'beat128', vol: 0.8 };
const RawLab: React.FC = () => <Film shots={RAW} fonts={FONTS} captions={false} sfx bed={bed} />;
const SnapLab: React.FC = () => <Film shots={SNAP} fonts={FONTS} captions={false} sfx bed={bed} />;

registerRoot(() => <>
  <Composition id="RawLab" component={RawLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(RAW)} />
  <Composition id="SnapLab" component={SnapLab} width={1920} height={1080} fps={60} durationInFrames={filmFrames(SNAP)} />
</>);
