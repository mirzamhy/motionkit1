import React from 'react';
import { C } from '../../styles/stik-polos/kit';

// Park bench and mountain in the Stik Polos look: flat fills, 4-unit outline, cold muted palette.
// Bench: drawn at 1 m = 150 px, centre of its ground line at (0, 0), 240 px (1.6 m) wide.
// Mountain: drawn at 1 m = 3 units (200 m = 600 units), centre of its base at (0, 0). The library wrapper scales both.

const W = {
  slat: '#6A6660',
  slatHi: '#7C776F',
  slatLo: '#57534E',
  iron: '#2C313A',
  ironHi: '#3E4553',
};

const Shadow: React.FC<{ rx: number }> = ({ rx }) => <ellipse cx={14} cy={2} rx={rx} ry={7} fill={C.out} opacity={0.4} />;

const Slat: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={2} fill={W.slat} stroke={C.out} strokeWidth={4} strokeLinejoin="round" />
    <line x1={x + 6} y1={y + 3.5} x2={x + w - 6} y2={y + 3.5} stroke={W.slatHi} strokeWidth={2} strokeLinecap="round" />
  </g>
);

/** Long park bench, front view. `sandaran` has a backrest; `tanpa-sandaran` is a plain backless bench. */
export const Bangku: React.FC<{ variant: string }> = ({ variant }) => {
  const back = variant !== 'tanpa-sandaran';
  return (
    <g strokeLinejoin="round">
      <Shadow rx={128} />
      {back ? (
        <g>
          {/* cast-iron ends: foot, front leg, rear post up to the backrest */}
          {[-1, 1].map((d) => (
            <g key={d}>
              <rect x={d * 100 - 5} y={-128} width={10} height={72} fill={W.iron} stroke={C.out} strokeWidth={4} />
              <rect x={d * 100 - 5} y={-60} width={10} height={54} fill={W.iron} stroke={C.out} strokeWidth={4} />
              <rect x={d * 100 - 15} y={-9} width={30} height={9} rx={3} fill={W.iron} stroke={C.out} strokeWidth={4} />
            </g>
          ))}
          <Slat x={-112} y={-124} w={224} h={14} />
          <Slat x={-112} y={-106} w={224} h={14} />
          <Slat x={-120} y={-76} w={240} h={14} />
          <Slat x={-120} y={-58} w={240} h={14} />
        </g>
      ) : (
        <g>
          {/* backless: thick slab seat on two splayed iron legs and a cross rail */}
          {[-1, 1].map((d) => (
            <g key={d}>
              <path d={`M ${d * 92 - 6} -52 L ${d * 92 + 6} -52 L ${d * 104 + 8} -8 L ${d * 104 - 8} -8 Z`} fill={W.iron} stroke={C.out} strokeWidth={4} />
              <rect x={d * 104 - 17} y={-9} width={34} height={9} rx={3} fill={W.iron} stroke={C.out} strokeWidth={4} />
            </g>
          ))}
          <rect x={-92} y={-44} width={184} height={8} fill={W.iron} stroke={C.out} strokeWidth={4} />
          <Slat x={-120} y={-80} w={240} h={16} />
          <Slat x={-120} y={-62} w={240} h={14} />
        </g>
      )}
    </g>
  );
};

// ───────────────────────── gunung ─────────────────────────
const M = {
  body: '#47525F',
  lit: '#5A6877',
  dark: '#2B3441',
  snow: '#E3E9ED',
  snowDark: '#AEBBC6',
};

// silhouette, left to right: main peak (apex -20,-330) and a lower second peak (150,-214)
const OUTLINE =
  'M -300 0 L -262 -45 L -228 -80 L -196 -118 L -150 -160 L -112 -225 L -78 -268 L -48 -300 L -20 -330 L 10 -300 L 40 -262 L 78 -226 L 112 -190 L 150 -214 L 190 -170 L 232 -112 L 262 -60 L 300 0 Z';

/** Flat mountain ~200 m wide: slate body, a darker shaded face on the side away from the sun (right), thick outline.
 *  `salju` has snow caps on both peaks; `polos` is bare rock. */
export const Gunung: React.FC<{ variant: string }> = ({ variant }) => {
  const salju = variant !== 'polos';
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* simple cast shadow on the ground, away from the sun */}
      <path d="M -60 0 L 340 0 L 310 16 L -90 16 Z" fill={C.out} opacity={0.35} />
      <path d={OUTLINE} fill={M.body} />
      {/* lit face of the main peak, near the crest */}
      <path d="M -20 -330 L -48 -300 L -78 -268 L -112 -225 L -90 -205 L -72 -228 L -52 -222 L -45 -250 Z" fill={M.lit} />
      {/* shade, main peak: right of the ridge line down to the valley */}
      <path d="M -20 -330 L -45 -250 L -30 -170 L -60 -90 L -40 0 L 110 0 L 105 -100 L 112 -190 L 78 -226 L 40 -262 L 10 -300 Z" fill={M.dark} />
      {/* shade, second peak */}
      <path d="M 150 -214 L 140 -150 L 155 -90 L 135 0 L 300 0 L 262 -60 L 232 -112 L 190 -170 Z" fill={M.dark} />
      {/* ridge lines */}
      <path d="M -150 -160 L -135 -100 L -150 -40 M -200 -118 L -190 -60 M -20 -330 L -45 -250 L -30 -170 L -60 -90 L -40 0 M 150 -214 L 140 -150 L 155 -90 L 135 0" fill="none" stroke={C.out} strokeWidth={3} opacity={0.55} />
      {salju && (
        <g>
          {/* main cap */}
          <path d="M -78 -268 L -48 -300 L -20 -330 L 10 -300 L 40 -262 L 22 -250 L 8 -270 L -8 -238 L -28 -262 L -45 -232 L -62 -252 Z" fill={M.snow} />
          <path d="M -20 -330 L 10 -300 L 40 -262 L 22 -250 L 8 -270 L -8 -238 L -24 -256 L -38 -278 Z" fill={M.snowDark} />
          {/* second cap */}
          <path d="M 112 -190 L 150 -214 L 190 -170 L 176 -160 L 164 -176 L 150 -150 L 136 -170 L 124 -164 Z" fill={M.snow} />
          <path d="M 150 -214 L 190 -170 L 176 -160 L 164 -176 L 150 -150 L 156 -190 Z" fill={M.snowDark} />
        </g>
      )}
      <path d={OUTLINE} fill="none" stroke={C.out} strokeWidth={4} />
      {salju && (
        <g fill="none" stroke={C.out} strokeWidth={3}>
          <path d="M -62 -252 L -45 -232 L -28 -262 L -8 -238 L 8 -270 L 22 -250" />
          <path d="M 124 -164 L 136 -170 L 150 -150 L 164 -176 L 176 -160" />
        </g>
      )}
    </g>
  );
};
