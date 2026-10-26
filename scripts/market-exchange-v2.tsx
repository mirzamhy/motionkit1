// Wave-1 proof: the market exchange with what the first ten repo studies added. Named beats with a hold and a lead
// (#4), word captions from an edge-tts voice (#3), a lower third and letterbox (#8), the crowd bed ducked under the
// voice (#1), sound effects 2 frames ahead of the picture (#1), a sound envelope of whoosh and boom (#9), grain and
// vignette. Two looks: 'modern' and 'arsip' (sepia wash, archive title).
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { MarketExchange, exchangeFrames, type ExchangeTiming } from './market-exchange';
import { WordCaps, type Word } from '../packages/core/src/scenes/wordcaps';
import { Letterbox, LowerThird, type TitleStyle } from '../packages/core/src/scenes/titles';
import { inOut, prog } from '../packages/core/src/scenes/motion';
import type { Shot } from '../packages/core/src/scenes/film';
import words from '../projects/vendor-action/public/vo-exchange.json';

type Person = React.ComponentProps<typeof MarketExchange>['Character'];
export const V2_TIMING: ExchangeTiming = { hold: 14, lead: 62 };
const VO_AT = 16; // the recording starts here; "menyerahkannya" (4.58 s) lands 2 frames before the handover beat
const VO_END = VO_AT + Math.round(6.96 * 24);
export const V2_FRAMES = exchangeFrames(V2_TIMING);
const W = 1280, H = 960, FPS = 24;
// WordCaps maps recording seconds to frames through a shot's voice passages: one passage over the whole shot
const SHOTS: Shot[] = [{ dur: V2_FRAMES, draw: () => null, vo: [{ at: VO_AT, from: 0, to: 6.96 }] }];

const sfx = (file: string, at: number, vol: number, len = 60) => (
  <Sequence from={Math.max(0, at)} durationInFrames={len} layout="none"><Audio src={staticFile(`sfx/${file}.wav`)} volume={(f) => vol * Math.min(1, (f + 1) / 4) * Math.min(1, (len - f) / 10)} /></Sequence>
);

export const MarketExchangeV2: React.FC<{ Character: Person; look?: TitleStyle }> = ({ Character, look = 'modern' }) => {
  const t = useCurrentFrame();
  // 1 outside the voice, 0.4 while it speaks, eased over 12 frames
  const duck = (f: number) => 1 - 0.6 * Math.min(prog(f, VO_AT - 12, VO_AT, inOut), 1 - prog(f, VO_END, VO_END + 12, inOut));
  const fade = (f: number) => Math.min(1, f / 18) * Math.min(1, (V2_FRAMES - f) / 30);
  const arsip = look === 'arsip';
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <MarketExchange Character={Character} timing={V2_TIMING} sound={false} />
      {/* grade: sepia wash for the archive look, vignette, static grain; then titles above */}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="v2-vig" cx="0.5" cy="0.5" r="0.72"><stop offset="0.6" stopColor="#120d08" stopOpacity="0" /><stop offset="1" stopColor="#120d08" stopOpacity="0.55" /></radialGradient>
          <filter id="v2-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0" /></filter>
        </defs>
        {/* archive: take most of the colour out, then tint it warm */}
        {arsip && <rect width={W} height={H} fill="#808080" opacity={0.75} style={{ mixBlendMode: 'saturation' }} />}
        {arsip && <rect width={W} height={H} fill="#A9834C" opacity={0.45} style={{ mixBlendMode: 'color' }} />}
        <rect width={W} height={H} fill="url(#v2-vig)" />
        <rect width={W} height={H} filter="url(#v2-grain)" opacity={arsip ? 0.3 : 0.16} style={{ mixBlendMode: 'overlay' }} />
        <Letterbox u={t} at={0} W={W} H={H} aspect={16 / 9} />
        <LowerThird u={t} at={4} until={52} name={arsip ? 'Pasar Kapasan, 1950-an' : 'Pak Darmo'} role={arsip ? 'Rekonstruksi bergaya, bukan foto' : 'Penjual sayur'} W={W} H={H - 120} style={look} side={arsip ? 'left' : 'right'} />
      </svg>
      <WordCaps shots={SHOTS} starts={[0]} fps={FPS} words={words as Word[]} t={t} font="Inter, sans-serif" portrait={false} bottom={22} />
      <AbsoluteFill style={{ background: '#000', opacity: 1 - Math.min(1, t / 12) }} />
      <Audio src={staticFile('sfx/crowd.wav')} loop volume={(f) => 0.32 * fade(f) * duck(f)} />
      <Sequence from={VO_AT} layout="none"><Audio src={staticFile('vo-exchange.mp3')} /></Sequence>
      {sfx('whoosh', 0, 0.35, 34)}
      {sfx('cloth', 126, 0.5, 52)}
      {sfx('thud', 234, 0.35, 14)}
      {sfx('boom', V2_FRAMES - 50, 0.4, 50)}
    </AbsoluteFill>
  );
};
