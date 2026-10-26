// Ending: a ranked recap list (rows stagger in, row 1 gets the gold focus) and the comment-bait CTA.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, SERIF, SHADOW, clamp } from './style';

export type RecapTiming = {
  start: number; // backdrop starts darkening
  rowsIn: number; // first row appears; each next row +6 frames
  focus: number; // rows 2.. dim, row 1 gets the gold rule
  rowsOut: number; // rows 2.. fade out
  firstOut: number; // row 1 fades out
};

const ROW_TOP = 556;
const ROW_H = 89;

export const Leaderboard: React.FC<{ rows: [string, string][]; timing: RecapTiming }> = ({ rows, timing: tm }) => {
  const frame = useCurrentFrame();
  if (frame < tm.start || frame >= tm.firstOut + 15) return null;
  const shade = interpolate(frame, [tm.start, tm.rowsIn, tm.firstOut, tm.firstOut + 15], [0, 1, 1, 0], clamp);
  const focus = interpolate(frame, [tm.focus, tm.focus + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: shade,
          background: 'linear-gradient(180deg, rgba(10,14,22,0.55) 0%, rgba(10,14,22,0.35) 45%, rgba(10,14,22,0) 62%)',
        }}
      />
      {rows.map(([name, result], i) => {
        const enter = tm.rowsIn + i * 6;
        const appear = interpolate(frame, [enter, enter + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const first = i === 0;
        const dim = first ? 1 : 1 - 0.65 * focus;
        const out = first
          ? interpolate(frame, [tm.firstOut, tm.firstOut + 10], [1, 0], clamp)
          : interpolate(frame, [tm.rowsOut, tm.rowsOut + 10], [1, 0], clamp);
        const glow = first ? focus : 0;
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: 72,
              right: 68,
              top: ROW_TOP + i * ROW_H,
              height: ROW_H - 14,
              display: 'flex',
              alignItems: 'center',
              borderBottom: `${first ? 1 + glow : 1}px solid ${first && glow > 0 ? C.gold : 'rgba(244,241,234,0.22)'}`,
              background: `linear-gradient(90deg, rgba(226,176,74,${0.14 * glow}) 0%, rgba(226,176,74,0) 80%)`,
              opacity: appear * dim * out,
              transform: `translateY(${(1 - appear) * 12}px)`,
              fontFamily: SERIF,
              color: C.white,
              textShadow: SHADOW,
            }}
          >
            <div style={{ width: 46, fontSize: 21, opacity: 0.6, paddingLeft: 6 }}>{i + 1}</div>
            <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{name}</div>
            <div
              style={{
                marginLeft: 'auto',
                fontSize: 30,
                fontStyle: 'italic',
                color: C.gold,
                textTransform: 'uppercase',
                opacity: first ? 1 : 0.85,
              }}
            >
              {result}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "Did you think you'd <word>?" + two small lines. Fades out over the last 15 frames before `end`. */
export const Cta: React.FC<{
  at: number;
  end: number;
  before: string;
  word: string;
  after?: string;
  line1: string;
  line2: string;
}> = ({ at, end, before, word, after = '?', line1, line2 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const o =
    interpolate(frame, [at, at + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) *
    interpolate(frame, [end - 15, end - 1], [1, 0], clamp);
  const s = interpolate(frame, [at, at + 12], [0.96, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const small: React.CSSProperties = { fontSize: 22, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase' };
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1090,
        textAlign: 'center',
        fontFamily: SERIF,
        color: C.white,
        textShadow: SHADOW,
        opacity: o,
        transform: `scale(${s})`,
      }}
    >
      <div style={{ fontSize: 68, fontStyle: 'italic', lineHeight: 1.1 }}>
        {before} <span style={{ color: C.red, fontWeight: 700 }}>{word}</span>
        {after}
      </div>
      <div style={{ ...small, marginTop: 22 }}>{line1}</div>
      <div style={{ ...small, marginTop: 22, color: C.gold, fontWeight: 700 }}>{line2}</div>
    </div>
  );
};
