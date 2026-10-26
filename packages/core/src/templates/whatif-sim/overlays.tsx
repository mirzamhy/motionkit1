// Text and transition layers. Everything is driven by data passed in, so a new film only writes lists.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, SERIF, SHADOW, clamp } from './style';

/* ---------- Captions: italic serif, 7-frame crossfade, no slide ---------- */

export type Cap = { from: number; to: number; text: string; top: number; size: number };

export const Captions: React.FC<{ caps: Cap[] }> = ({ caps }) => {
  const frame = useCurrentFrame();
  const c = caps.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const fadeIn = c.from === 0 ? 1 : interpolate(frame, [c.from, c.from + 7], [0, 1], clamp);
  const fadeOut = interpolate(frame, [c.to - 7, c.to], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: c.top,
        display: 'flex',
        justifyContent: 'center',
        opacity: fadeIn * fadeOut,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          textAlign: 'center',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: c.size,
          lineHeight: 1.25,
          color: C.white,
          textShadow: SHADOW,
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

/* ---------- Hook title: big centred serif, shown from frame 0 ---------- */

/**
 * Visible on [0, until). With `loopEnd`, it also fades back in over the last 15 frames so the video loops.
 * Put the key word in a <span style={{ color: C.red }}>.
 */
export const Title: React.FC<{ until: number; loopEnd?: number; top?: number; children: React.ReactNode }> = ({
  until,
  loopEnd,
  top = 640,
  children,
}) => {
  const frame = useCurrentFrame();
  const loopIn = loopEnd !== undefined && frame >= loopEnd - 15;
  if (frame >= until && !loopIn) return null;
  return (
    <div
      style={{
        opacity: loopIn && loopEnd !== undefined ? interpolate(frame, [loopEnd - 15, loopEnd - 1], [0, 1], clamp) : 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        textAlign: 'center',
        fontFamily: SERIF,
        fontSize: 92,
        lineHeight: 1.2,
        color: C.white,
        textShadow: SHADOW,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Stamp: 5-frame slam at -3deg, hold, 8-frame fade ---------- */

const SLAM_SCALE = [1.6, 1.3, 1.15, 1.05, 1.0];
const SLAM_OPACITY = [0.3, 0.7, 1, 1, 1];

export const Stamp: React.FC<{
  at: number;
  exit: number;
  small: string;
  big: string;
  color: string;
  left?: number;
  top?: number;
}> = ({ at, exit, small, big, color, left = 60, top = 800 }) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > exit + 8) return null;
  const i = frame - at;
  const scale = SLAM_SCALE[Math.min(i, 4)];
  const o = SLAM_OPACITY[Math.min(i, 4)] * interpolate(frame, [exit, exit + 8], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transformOrigin: 'center',
        transform: `rotate(-3deg) scale(${scale})`,
        opacity: o,
        border: `4px solid ${color}`,
        borderRadius: 4,
        padding: '8px 26px 10px',
        background: 'rgba(28,22,10,0.45)',
        color,
        fontFamily: SERIF,
        textAlign: 'center',
        boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase' }}>{small}</div>
      <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        {big}
      </div>
    </div>
  );
};

/* ---------- Flash on the "event" frame ---------- */

export const Flash: React.FC<{ at: number; color?: string; strength?: number }> = ({
  at,
  color = '#eef1ec',
  strength = 0.6,
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame > at + 40) return null;
  return <AbsoluteFill style={{ background: color, opacity: strength * Math.exp(-(frame - at) / 8) }} />;
};

/* ---------- Top-left vignette so the HUD reads over busy 3D ---------- */

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse 80% 45% at 5% 20%, rgba(14,18,32,0.55) 0%, rgba(14,18,32,0) 70%)',
    }}
  />
);

/* ---------- Dips: fade to colour, hold, fade back. Chapter separators. ---------- */

export type Dip = { at: [number, number, number, number]; color: 'navy' | 'black' };

export const Dips: React.FC<{ dips: Dip[] }> = ({ dips }) => {
  const frame = useCurrentFrame();
  const d = dips.find((x) => frame >= x.at[0] && frame < x.at[3]);
  if (!d) return null;
  const o = interpolate(frame, d.at, [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ background: d.color === 'navy' ? C.navy : '#000', opacity: o }} />;
};
