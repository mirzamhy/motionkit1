// Overcast CSS sky behind a transparent ThreeCanvas. Its bottom colour equals the 3D fog colour,
// so distant geometry melts into the horizon. `t` drives cloud drift (pass a looped clock for loop endings).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from './style';

export const Sky: React.FC<{ t: number }> = ({ t }) => {
  const drift = t * 0.25;
  const cloud = (x: number, y: number, w: number, h: number, o: number) => (
    <div
      style={{
        position: 'absolute',
        left: x + drift,
        top: y,
        width: w,
        height: h,
        borderRadius: '50%',
        background: `rgba(222,227,234,${o})`,
        filter: 'blur(40px)',
      }}
    />
  );
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #4f5c76 0%, #74819a 28%, #a3adbb 48%, ${C.fog} 58%, ${C.fog} 100%)`,
        overflow: 'hidden',
      }}
    >
      {cloud(-200, 120, 700, 260, 0.35)}
      {cloud(420, 300, 800, 240, 0.4)}
      {cloud(-100, 560, 900, 200, 0.3)}
      {cloud(500, 40, 600, 220, 0.25)}
    </AbsoluteFill>
  );
};
