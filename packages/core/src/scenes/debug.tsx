// Debug overlays drawn into the frame, so one still shows timing that a still cannot. Idea from
// ytrofr/claude-remotion-editor (MIT): DebugSceneTimeline (segments + playhead) and DebugPathVisualization (markers
// along a path, brighter near the current frame). Rewritten for named beats, which may overlap: overlapping beats
// go to separate lanes.
import React from 'react';

type Ranges = Record<string, readonly [number, number]>;

/** beat bar: one lane per set of non-overlapping beats, the active beat lit and filled to its progress, a playhead */
export const BeatBar: React.FC<{ at: Ranges; t: number; total: number; width: number; bottom?: number }> = ({ at, t, total, width, bottom = 18 }) => {
  const list = Object.entries(at).filter(([, [a, b]]) => b > a).sort((x, y) => x[1][0] - y[1][0]);
  const lanes: [string, readonly [number, number]][][] = [];
  for (const item of list) {
    const lane = lanes.find((l) => l[l.length - 1][1][1] <= item[1][0]);
    lane ? lane.push(item) : lanes.push([item]);
  }
  const W = width - 48, x = (f: number) => 24 + (f / total) * W, LH = 26;
  const H = lanes.length * LH + 34;
  return (
    <svg width={width} height={H} style={{ position: 'absolute', left: 0, bottom, pointerEvents: 'none' }}>
      <rect x={12} y={0} width={width - 24} height={H} rx={8} fill="rgba(10,12,14,0.82)" />
      {lanes.map((lane, li) =>
        lane.map(([k, [a, b]]) => {
          const on = t >= a && t < b, past = t >= b;
          const y = 10 + li * LH;
          return (
            <g key={k}>
              <rect x={x(a)} y={y} width={Math.max(2, x(b) - x(a) - 2)} height={LH - 6} rx={4} fill={on ? '#F2C14E' : past ? '#5B6B5F' : '#2E3832'} />
              {on && <rect x={x(a)} y={y} width={(x(b) - x(a) - 2) * ((t - a) / (b - a))} height={LH - 6} rx={4} fill="rgba(255,255,255,0.35)" />}
              <text x={x(a) + 6} y={y + 15} fontFamily="monospace" fontSize={13} fill={on ? '#14110C' : '#C9D2C6'}>{k}</text>
            </g>
          );
        }),
      )}
      <line x1={x(t)} x2={x(t)} y1={4} y2={H - 22} stroke="#FF5A4E" strokeWidth={2} />
      <text x={x(t)} y={H - 8} textAnchor="middle" fontFamily="monospace" fontSize={13} fill="#FF8A80">{`f${t}`}</text>
    </svg>
  );
};
