import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, SERIF } from '../../templates/whatif-sim/style';
import { F, H, W } from './timeline';
import { rng } from '../../templates/whatif-sim/three/util';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Wedge geometry in 1080x1920 space at rest: apex = Earth's centre, top arc = surface.
const CX = 540;
const CY = 1890;
const R = 740;
const HALF = (26 * Math.PI) / 180;
const SURFACE: [number, number] = [CX, CY - R];

const polar = (r: number, a: number): [number, number] => [CX + r * Math.sin(a), CY - r * Math.cos(a)];

const wedge = (r: number) => {
  const [lx, ly] = polar(r, -HALF);
  const [rx, ry] = polar(r, HALF);
  return `M ${CX} ${CY} L ${lx} ${ly} A ${r} ${r} 0 0 1 ${rx} ${ry} Z`;
};
const arc = (r: number) => {
  const [lx, ly] = polar(r, -HALF);
  const [rx, ry] = polar(r, HALF);
  return `M ${lx} ${ly} A ${r} ${r} 0 0 1 ${rx} ${ry}`;
};

// Outermost first; each later wedge paints over the previous one.
const LAYERS: [number, string][] = [
  [1.0, '#4b6b3c'], // crust
  [0.975, '#6a2e22'], // upper mantle
  [0.8, '#94401f'], // lower mantle
  [0.55, '#e9831f'], // outer core
  [0.4, '#f39a2a'],
  [0.19, '#fff0b8'], // inner core
];

const ARROW_R = [0.92, 0.7, 0.5, 0.31];
const ARROW_A = [-14, -7, 0, 7, 14];

const STARS = (() => {
  const r = rng(5);
  return Array.from({ length: 160 }, () => ({ x: r() * W, y: r() * H, s: 0.8 + r() * 1.6, o: 0.25 + r() * 0.6 }));
})();

const Arrow: React.FC<{ x: number; y: number; deg: number; color: string; len?: number; width?: number }> = ({
  x,
  y,
  deg,
  color,
  len = 46,
  width = 4,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${deg})`}>
    <line x1={0} y1={-len / 2} x2={0} y2={len / 2 - width * 2.2} stroke={color} strokeWidth={width} strokeLinecap="round" />
    <path d={`M ${-width * 2.4} ${len / 2 - width * 3} L 0 ${len / 2} L ${width * 2.4} ${len / 2 - width * 3} Z`} fill={color} />
  </g>
);

const Pin: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 C -9 -14 -16 -22 -16 -33 A 16 16 0 1 1 16 -33 C 16 -22 9 -14 0 0 Z" fill={C.red} />
    <circle cx={0} cy={-33} r={5.5} fill="#7a1d12" />
  </g>
);

const labelStyle = (size: number): React.SVGProps<SVGTextElement> => ({
  fontFamily: SERIF,
  fontSize: size,
  fontWeight: 500,
  letterSpacing: size * 0.3,
  fill: C.white,
  textAnchor: 'middle',
});

export const EarthSection: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < F.earth - 10 || frame >= F.space + 10) return null;

  // Camera: zoom out from the crust, later dive back into the surface.
  const intro = { ...clamp, easing: Easing.out(Easing.cubic) };
  const dive = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const pushing = frame >= F.pushZoom;
  const s = pushing
    ? interpolate(frame, [F.pushZoom, F.pushZoomEnd], [1, 7], dive)
    : interpolate(frame, [F.earth, F.earthRest], [3.4, 1], intro);
  const fy = pushing
    ? interpolate(frame, [F.pushZoom, F.pushZoomEnd], [SURFACE[1], 1640], dive)
    : interpolate(frame, [F.earth, F.earthRest], [1060, SURFACE[1]], intro);
  const pinS = pushing ? interpolate(frame, [F.pushZoom, F.pushZoomEnd], [0.85, 2.3], dive) : 0.85 * Math.min(1.6, s);

  const detail = interpolate(frame, [F.pushZoom, F.pushZoom + 8], [1, 0], clamp);
  const arrowsIn = interpolate(frame, [F.earthRest, F.earthRest + 18], [0, 1], clamp) * detail;

  // Shock ring from the inner core to the surface.
  const ringR = interpolate(frame, [F.flip, F.flipEnd], [0.19, 1.02], { ...clamp, easing: Easing.in(Easing.quad) }) * R;
  const ringO =
    interpolate(frame, [F.flip, F.flip + 6], [0, 1], clamp) * interpolate(frame, [F.flipEnd - 8, F.flipEnd + 6], [1, 0], clamp);

  const pushO = interpolate(frame, [F.pushZoomEnd - 2, F.pushZoomEnd + 8], [0, 1], clamp);
  const arrowGrow = interpolate(frame, [F.pushZoomEnd, F.pushZoomEnd + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ background: '#05040b' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="coreGlow">
            <stop offset="0%" stopColor="#fffbe6" stopOpacity={1} />
            <stop offset="35%" stopColor="#ffe9a0" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#ffd070" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#000" stopOpacity={0} />
          </linearGradient>
          <filter id="blur8" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={8} />
          </filter>
        </defs>

        {STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#fff" opacity={st.o} />
        ))}

        <g transform={`translate(${CX} ${fy}) scale(${s}) translate(${-SURFACE[0]} ${-SURFACE[1]})`}>
          {LAYERS.map(([r, c]) => (
            <path key={r} d={wedge(r * R)} fill={c} />
          ))}
          <path d={wedge(0.975 * R)} fill="url(#shade)" opacity={0.6} />
          <path d={arc(R)} stroke="#7da35c" strokeWidth={3} fill="none" />
          <circle cx={CX} cy={CY} r={150} fill="url(#coreGlow)" />

          <g opacity={arrowsIn}>
            {ARROW_R.map((fr) =>
              ARROW_A.map((d) => {
                const a = (d * Math.PI) / 180;
                const [x, y] = polar(fr * R, a);
                const out = frame >= F.flip && ringR > fr * R;
                return (
                  <Arrow key={`${fr}-${d}`} x={x} y={y} deg={d + (out ? 180 : 0)} color={out ? '#ffe2a8' : '#f1ece4'} />
                );
              }),
            )}
          </g>

          <g opacity={ringO}>
            <path d={arc(ringR)} stroke="#fff3c4" strokeWidth={18} fill="none" filter="url(#blur8)" />
            <path d={arc(ringR)} stroke="#fffaf0" strokeWidth={5} fill="none" />
          </g>

          <g opacity={detail}>
            <text x={SURFACE[0] - 64} y={SURFACE[1] - 12} {...labelStyle(20)}>
              YOU
            </text>
            <text x={CX + 170} y={SURFACE[1] + 8} {...labelStyle(20)}>
              CRUST
            </text>
            <text x={CX} y={CY - 0.8 * R} {...labelStyle(22)} opacity={0.85}>
              MANTLE
            </text>
            <text x={CX} y={CY - 0.395 * R} {...labelStyle(22)} opacity={0.9}>
              OUTER CORE
            </text>
            <text x={CX} y={CY - 0.07 * R} {...labelStyle(18)} fill="#fff">
              INNER CORE
            </text>
          </g>
        </g>

        <Pin x={CX} y={fy} s={pinS} />

        {/* Scene 8: equal and opposite */}
        <g opacity={pushO}>
          <text x={72} y={1250} {...labelStyle(24)} textAnchor="start">
            GRAVITY’S PULL
          </text>
          <Arrow x={250} y={1290 + 120 * arrowGrow} deg={0} color="#9a9a9e" len={240 * arrowGrow + 1} width={9} />
          <text x={1008} y={1250} {...labelStyle(24)} textAnchor="end" fill={C.gold}>
            SAME-SIZE PUSH
          </text>
          <Arrow x={830} y={1530 - 120 * arrowGrow} deg={180} color={C.gold} len={240 * arrowGrow + 1} width={9} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
