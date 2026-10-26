// Style "Stik Polos": flat, faceless stickmen with thick outlines on a night street. One wide SVG world, a keyframed camera that
// whips from character to character, thought bubbles that chain (each one wants the next one's life), a warm
// highlight at the end, then a word-by-word quote. Recipe and timing rules: ./README.md.
//
// All timing in this style is written in 30-fps frames ("f30"). useStikFrame() converts, so a film renders at the
// registry's 60 fps with the same beats and smoother motion.
import React from 'react';
import { Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';

export const { fontFamily: SANS } = loadFont('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });

// World units: 1 unit = 1px of a 720x1280 frame at camera scale 1.
// Vehicles touch the road at y = GROUND, buildings stand on y = CURB.
export const GROUND = 880;
export const CURB = 800;

export const C = {
  out: '#060A13',
  sky: '#0B0E15',
  city: '#131820',
  cityWin: '#1A202A',
  road: '#111317',
  roadEdge: '#1C1F26',
  lane: '#3A3E47',
  cream: '#DBD5CC',
  creamHi: '#EDE8DF',
  scooter: '#587585',
  box: '#424C54',
  car: '#646E80',
  carDark: '#525B6C',
  glassDark: '#232934',
  wheel: '#23272E',
  hub: '#8B929C',
  head: '#9199A2',
  body: '#7E8692',
  poncho: '#516D86',
  ponchoHi: '#6A87A0',
  scooterBeige: '#9A8A78',
  building: '#292E36',
  buildingLine: '#30363F',
  winDark: '#323944',
  glassTop: '#B3C1CA',
  glassBot: '#7F909A',
  sign: '#DDE2E5',
  teal: '#4F8A8B',
  awningLight: '#C1CBC8',
  awningBlue: '#5A7E8E',
  kiosk: '#43362F',
  kioskDark: '#2E241F',
  bubble: '#E6E5DC',
  yellow: '#FDFD33',
  red: '#FF463C',
  green: '#3DDC6A',
  text: '#F2F0EA',
  orange: '#F5A623',
};

const BASE_FPS = 30;
/** current frame in 30-fps units (fractional at 60 fps) */
export const useStikFrame = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame * BASE_FPS) / fps;
};
/** composition length for a film written in f30 */
export const stikFrames = (f30: number, fps = 60) => Math.round((f30 * fps) / BASE_FPS);

/** A sound from the scene bank (<public>/sfx/<file>.wav, apps/cli/sceneSfx.ts), started at an f30 frame. */
export type StikSound = { at: number; file: string; vol?: number; loop?: boolean };
export const Soundtrack: React.FC<{ on: boolean; total: number; sounds: StikSound[] }> = ({ on, total, sounds }) => {
  const { fps } = useVideoConfig();
  if (!on) return null;
  const k = fps / BASE_FPS;
  return (
    <>
      {sounds.map((s, i) => {
        const from = Math.round(s.at * k);
        const left = total * k - from;
        const vol = s.vol ?? 0.3;
        return (
          <Sequence key={i} from={from} layout="none">
            <Audio
              src={staticFile(`sfx/${s.file}.wav`)}
              loop={s.loop}
              volume={(fr) => (s.loop ? vol * Math.min(1, fr / (12 * k)) * Math.min(1, Math.max(0, (left - fr) / (24 * k))) : vol)}
            />
          </Sequence>
        );
      })}
    </>
  );
};

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.2, 0.8, 0.3, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0→1 over n frames starting at `at`. */
export const ramp = (frame: number, at: number, n = 5) => interpolate(frame, [at, at + n], [0, 1], clamp);

// ── camera: world point (cx, cy) sits at frame centre, at scale s ──
export type Cam = { f: number; cx: number; cy: number; s: number };
export const makeCam = (keys: Cam[]) => (f: number): Cam => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (f <= b.f) {
      const t = ease((f - a.f) / (b.f - a.f));
      // interpolate scale in log space so zooms feel even
      const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t);
      return { f, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, s };
    }
  }
  return keys[keys.length - 1];
};
export const camTransform = (c: Cam) => `translate(360 640) scale(${c.s}) translate(${-c.cx} ${-c.cy})`;

// ── drawing helpers ──
export const Limb: React.FC<{ d: string; w: number; c: string; o?: string }> = ({ d, w, c, o = C.out }) => (
  <>
    <path d={d} stroke={o} strokeWidth={w + 7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const Wheel: React.FC<{ x: number; y: number; r: number; spin?: number; tire?: string; hub?: string }> = ({
  x, y, r, spin = 0, tire = C.wheel, hub = C.hub,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    <circle r={r} fill={tire} stroke={C.out} strokeWidth={4} />
    <circle r={r * 0.48} fill={hub} stroke={C.out} strokeWidth={3} />
    <line x1={-r * 0.3} y1={-r * 0.3} x2={r * 0.3} y2={r * 0.3} stroke={C.out} strokeWidth={3} strokeLinecap="round" />
  </g>
);

/** Three short strokes over a head: cold / tired. */
export const ColdLines: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => {
  const k = 0.75 + 0.75 * Math.sin(frame * 0.8);
  return (
    <g stroke="#C9CED6" strokeWidth={2.5} strokeLinecap="round" opacity={0.85}>
      <line x1={x - 20} y1={y + 6 - k} x2={x - 25} y2={y - 4 - k} />
      <line x1={x} y1={y - k} x2={x} y2={y - 11 - k} />
      <line x1={x + 20} y1={y + 6 - k} x2={x + 25} y2={y - 4 - k} />
    </g>
  );
};

/** Fit a world bbox [x,y,w,h] into a box. */
export const Fit: React.FC<{ src: [number, number, number, number]; dst: [number, number, number, number]; children: React.ReactNode }> = ({
  src, dst, children,
}) => {
  const [sx, sy, sw, sh] = src;
  const [dx, dy, dw, dh] = dst;
  const k = Math.min(dw / sw, dh / sh);
  const ox = dx + (dw - sw * k) / 2 - sx * k;
  const oy = dy + (dh - sh * k) / 2 - sy * k;
  return <g transform={`translate(${ox} ${oy}) scale(${k})`}>{children}</g>;
};

// ── thought bubble: pops in 5 frames, fades in 5 ──
type BubbleProps = {
  frame: number;
  x: number; y: number; w: number; h: number;
  popAt: number; fadeAt?: number;
  dots: [number, number, number][];
  glow?: boolean;
  icon: { src: [number, number, number, number]; node: React.ReactNode };
};
export const Bubble: React.FC<BubbleProps> = ({ frame, x, y, w, h, popAt, fadeAt, dots, glow, icon }) => {
  if (frame < popAt) return null;
  const pin = easeOut(interpolate(frame, [popAt, popAt + 5], [0, 1], { extrapolateRight: 'clamp' }));
  const pout = fadeAt === undefined ? 1 : interpolate(frame, [fadeAt, fadeAt + 5], [1, 0], clamp);
  if (pout <= 0) return null;
  const s = 0.78 + 0.22 * pin;
  const op = Math.min(1, pin * 1.4) * pout;
  const ox = x + w / 2, oy = y + h;
  const fill = glow ? C.yellow : C.bubble;
  const pulse = glow ? 0.85 + 0.15 * Math.sin(frame * 0.18) : 0;
  return (
    <g opacity={op} transform={`translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`}>
      {glow && (
        <>
          <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.95} ry={h * 1.05} fill="url(#halo)" opacity={pulse * pin} />
          <ellipse cx={x + w / 2} cy={y + h + 60} rx={w * 0.8} ry={110} fill="url(#halo)" opacity={0.45 * pin} />
        </>
      )}
      <rect x={x} y={y} width={w} height={h} rx={20} fill={fill} stroke={C.out} strokeWidth={4} />
      <Fit src={icon.src} dst={[x + 14, y + 12, w - 28, h - 24]}>
        {icon.node}
      </Fit>
      {dots.map(([dx, dy, r], i) => (
        <circle key={i} cx={dx} cy={dy} r={r} fill={fill} stroke={glow ? '#C79A1E' : 'none'} strokeWidth={1.5} />
      ))}
    </g>
  );
};

// ── word-by-word reveal (HTML, in the 1080x1920 frame) ──
export const Word: React.FC<{ frame: number; at: number; color?: string; children: string }> = ({ frame, at, color = C.text, children }) => {
  const t = ramp(frame, at, 4);
  return (
    <span style={{ opacity: t, color, display: 'inline-block', transform: `translateY(${(1 - t) * 6}px)` }}>{children}</span>
  );
};

/** Two-line closing quote. Each word is [text, frame, orange?]. */
export const Quote: React.FC<{ frame: number; top: number; lines: [string, number, boolean?][][] }> = ({ frame, top, lines }) => (
  <div
    style={{
      position: 'absolute', left: 0, right: 0, top, textAlign: 'center',
      fontFamily: SANS, fontWeight: 800, fontSize: 55, lineHeight: '86px', letterSpacing: -0.5, color: C.text,
    }}
  >
    {lines.map((ws, li) => (
      <div key={li}>
        {ws.map(([t, at, hi], wi) => (
          <React.Fragment key={wi}>
            {wi > 0 && ' '}
            <Word frame={frame} at={at} color={hi ? C.orange : C.text}>{t}</Word>
          </React.Fragment>
        ))}
      </div>
    ))}
  </div>
);

// ── background city, world space ──
export const City: React.FC<{ from?: number; to?: number }> = ({ from = -900, to = 2200 }) => {
  const blocks: React.ReactNode[] = [];
  let x = from;
  let i = 0;
  while (x < to) {
    const w = 110 + random(`cw${i}`) * 140;
    const h = 260 + random(`ch${i}`) * 380;
    const top = CURB - h;
    blocks.push(<rect key={`b${i}`} x={x} y={top} width={w} height={h} fill={i % 2 ? C.city : '#151A23'} />);
    for (let k = 0; k < 6; k++) {
      if (random(`cwin${i}-${k}`) < 0.45) continue;
      blocks.push(
        <rect key={`w${i}-${k}`} x={x + 14 + random(`wx${i}-${k}`) * (w - 34)} y={top + 20 + random(`wy${i}-${k}`) * (h - 60)} width={9} height={11} fill={C.cityWin} />,
      );
    }
    x += w + 8;
    i++;
  }
  return <g>{blocks}</g>;
};

/** Road surface with back edge and lane dashes. */
export const Road: React.FC = () => (
  <>
    <rect x={-3000} y={CURB} width={8000} height={3000} fill={C.road} />
    <rect x={-3000} y={CURB} width={8000} height={5} fill={C.roadEdge} />
    {Array.from({ length: 60 }).map((_, i) => (
      <rect key={i} x={-1200 + i * 115} y={926} width={62} height={4} fill={C.lane} />
    ))}
  </>
);

export const Label: React.FC<{ x: number; y: number; text: string; op: number }> = ({ x, y, text, op }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={17} letterSpacing={4} fill="#C7CCD3" opacity={0.6 * op}>
    {text}
  </text>
);

/** Gradients, filters and the reflection clip. `mirrorY` = line the reflections flip around. */
export const SharedDefs: React.FC<{ mirrorY?: number }> = ({ mirrorY = GROUND }) => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#090C12" />
      <stop offset="1" stopColor="#10141C" />
    </linearGradient>
    <linearGradient id="roadFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.55} />
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.48" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.6} />
    </radialGradient>
    <radialGradient id="halo">
      <stop offset="0.35" stopColor="#FFB12E" stopOpacity={0.75} />
      <stop offset="0.65" stopColor="#FF9A1E" stopOpacity={0.28} />
      <stop offset="1" stopColor="#FF9A1E" stopOpacity={0} />
    </radialGradient>
    <filter id="softBlur">
      <feGaussianBlur stdDeviation="2.5" />
    </filter>
    <clipPath id="belowGround">
      <rect x={-3000} y={mirrorY} width={8000} height={3000} />
    </clipPath>
  </defs>
);
