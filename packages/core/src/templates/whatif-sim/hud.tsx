// HUD pieces: a header (label / big number / sub-label) and stats that stack under it.
// A film builds its own <Hud> from these, deciding per frame which header and which stats show.
import React from 'react';
import { Easing, interpolate } from 'remotion';
import { C, HUD_POS, SERIF, SHADOW, clamp } from './style';

/** m:ss.mmm, e.g. 0:04.948 */
export const fmtTimer = (s: number) => {
  const v = Math.max(0, s);
  const m = Math.floor(v / 60);
  const rest = v - m * 60;
  const ss = Math.floor(rest);
  const ms = Math.min(999, Math.floor((rest - ss) * 1000 + 1e-6));
  return `${m}:${String(ss).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
};

/** h:mm:ss for time-lapse clocks. */
export const fmtClock = (s: number) => {
  const v = Math.floor(Math.max(0, s));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

export const labelStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 500,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
};

export const subStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 500,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  opacity: 0.8,
  marginTop: 6,
};

/** m/s² with a proper superscript. */
export const Ms2: React.FC = () => (
  <>
    m/s<sup style={{ fontSize: '0.5em' }}>2</sup>
  </>
);

/** Top-left column that holds the header and the stats. */
export const HudFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      left: HUD_POS.left,
      top: HUD_POS.top,
      color: C.white,
      fontFamily: SERIF,
      fontVariantNumeric: 'tabular-nums lining-nums',
      textShadow: SHADOW,
    }}
  >
    {children}
  </div>
);

export const HudHeader: React.FC<{ label: string; value: React.ReactNode; sub: string; color?: string }> = ({
  label,
  value,
  sub,
  color = C.white,
}) => (
  <>
    <div style={{ ...labelStyle, color }}>{label}</div>
    <div style={{ fontSize: 96, lineHeight: 1.02, marginTop: 6, color }}>{value}</div>
    <div style={subStyle}>{sub}</div>
  </>
);

/** A stat that fades/slides in at `enter` and fades out at `exit` (8 frames each). Renders nothing outside. */
export const Stat: React.FC<{
  frame: number;
  enter: number;
  exit: number;
  title: string;
  value: React.ReactNode;
  note: string;
}> = ({ frame, enter, exit, title, value, note }) => {
  if (frame < enter || frame > exit + 8) return null;
  const o =
    interpolate(frame, [enter, enter + 8], [0, 1], clamp) * interpolate(frame, [exit, exit + 8], [1, 0], clamp);
  const y = interpolate(frame, [enter, enter + 8], [8, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ marginTop: 34, opacity: o, transform: `translateY(${y}px)` }}>
      <div style={labelStyle}>{title}</div>
      <div style={{ fontSize: 70, lineHeight: 1.05, marginTop: 4 }}>{value}</div>
      <div style={subStyle}>{note}</div>
    </div>
  );
};
