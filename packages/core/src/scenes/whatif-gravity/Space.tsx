import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, SERIF } from '../../templates/whatif-sim/style';
import { F, H, W, elapsedAt, swingAt } from './timeline';
import { makeEarthTextures, makeMoonTexture } from '../../templates/whatif-sim/three/planet';
import { rng } from '../../templates/whatif-sim/three/util';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
type P2 = [number, number];

// Pixel space (y down) -> ortho world space (y up, origin at frame centre).
const w = ([x, y]: P2): [number, number, number] => [x - W / 2, H / 2 - y, 0];

/* ---------- Layout (pixels, measured from the reference) ---------- */

const EARTH: P2 = [425, 1523];
const EARTH_R = 147;
const MOON0: P2 = [836, 821];
const MOON_R = 37;
const ORBIT_R = Math.hypot(MOON0[0] - EARTH[0], MOON0[1] - EARTH[1]);
const RADIAL: P2 = [(MOON0[0] - EARTH[0]) / ORBIT_R, (MOON0[1] - EARTH[1]) / ORBIT_R];
const TANGENT: P2 = [-RADIAL[1], RADIAL[0]]; // clockwise on screen: heading right-down
const TANGENT_DEG = (Math.atan2(TANGENT[1], TANGENT[0]) * 180) / Math.PI;

const ISS_EARTH: P2 = [1150, 1450];
const ISS_EARTH_R = 1250;
const ISS_POS: P2 = [454, 1340];

const moonAt = (f: number): P2 => {
  const k = Math.max(0, f - F.straightLine) * 0.06; // drifts along the straight line
  return [MOON0[0] + TANGENT[0] * k, MOON0[1] + TANGENT[1] * k];
};

/** Zoom = scale s about point P (pixels) which lands on screen point Q. */
const moonView = (f: number) => {
  const e = { ...clamp, easing: Easing.inOut(Easing.cubic) };
  const s = interpolate(f, [F.moonZoom, F.moonZoomEnd], [1, 5.5], e);
  const P = moonAt(f);
  const Q: P2 = [
    interpolate(f, [F.moonZoom, F.moonZoomEnd], [P[0], 687], e),
    interpolate(f, [F.moonZoom, F.moonZoomEnd], [P[1], 842], e),
  ];
  return { s, P, Q };
};

const STARS = (() => {
  const r = rng(91);
  return Array.from({ length: 220 }, () => ({ x: r() * W, y: r() * H, s: 0.6 + r() * 1.5, o: 0.2 + r() * 0.6 }));
})();

/* ---------- 3D ---------- */

const OrthoRig: React.FC<{ s: number; P: P2; Q: P2 }> = ({ s, P, Q }) => {
  const cam = useThree((st) => st.camera) as THREE.OrthographicCamera;
  const pw = w(P);
  cam.position.set(pw[0] - (Q[0] - W / 2) / s, pw[1] - (H / 2 - Q[1]) / s, 3000);
  cam.zoom = s;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return null;
};

const Planet: React.FC<{ at: P2; r: number; spin: number; tilt?: number }> = ({ at, r, spin, tilt = 0.35 }) => {
  const tex = useMemo(makeEarthTextures, []);
  return (
    <group position={w(at)} rotation={[tilt, 0, 0.12]}>
      <mesh rotation={[0, spin, 0]}>
        <sphereGeometry args={[r, 96, 64]} />
        <meshLambertMaterial map={tex.map} />
      </mesh>
      <mesh rotation={[0, spin * 1.25 + 0.6, 0]}>
        <sphereGeometry args={[r * 1.012, 96, 64]} />
        <meshLambertMaterial map={tex.clouds} transparent depthWrite={false} />
      </mesh>
    </group>
  );
};

const Moon: React.FC<{ at: P2 }> = ({ at }) => {
  const tex = useMemo(makeMoonTexture, []);
  return (
    <mesh position={w(at)} rotation={[0.2, -1.2, 0]}>
      <sphereGeometry args={[MOON_R, 64, 48]} />
      <meshLambertMaterial map={tex} />
    </mesh>
  );
};

const Iss: React.FC<{ t: number }> = ({ t }) => {
  const grey = '#bfc2c8';
  const panel = '#6e4b22';
  return (
    <group position={[ISS_POS[0] + t * 4 - W / 2, H / 2 - (ISS_POS[1] - t * 2), ISS_EARTH_R + 300]} rotation={[1.38, 0.12 + t * 0.01, 1.08 + t * 0.008, 'ZYX']}>
      <mesh>
        <boxGeometry args={[640, 14, 14]} />
        <meshLambertMaterial color={grey} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[14, 14, 240, 16]} />
        <meshLambertMaterial color="#d6d8dc" />
      </mesh>
      <mesh position={[40, 70, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[11, 11, 110, 14]} />
        <meshLambertMaterial color="#d6d8dc" />
      </mesh>
      {[-300, -238, 238, 300].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[44, 3, 390]} />
            <meshLambertMaterial color={panel} />
          </mesh>
          <mesh>
            <boxGeometry args={[6, 6, 392]} />
            <meshLambertMaterial color={grey} />
          </mesh>
        </group>
      ))}
      {[-120, 120].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[22, 2, 110]} />
          <meshLambertMaterial color="#eeeeee" />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- Layer ---------- */

const label = (size: number, color: string = C.white): React.SVGProps<SVGTextElement> => ({
  fontFamily: SERIF,
  fontSize: size,
  fontWeight: 500,
  letterSpacing: size * 0.3,
  fill: color,
});

export const Space: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < F.space || frame >= F.ground) return null;
  const iss = frame >= F.iss;
  const t = (frame - F.space) / 30;

  const view = iss ? { s: 1, P: [W / 2, H / 2] as P2, Q: [W / 2, H / 2] as P2 } : moonView(frame);
  const { s, P, Q } = view;
  const tf = `translate(${Q[0]} ${Q[1]}) scale(${s}) translate(${-P[0]} ${-P[1]})`;
  const moon = moonAt(frame);
  const lineLen = 1400;
  const draw = interpolate(frame, [F.straightLine, F.straightLine + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const detail = interpolate(frame, [F.moonZoom, F.moonZoom + 8], [1, 0], clamp);
  const offLabel = interpolate(frame, [F.offCourseLabel, F.offCourseLabel + 8], [0, 1], clamp);
  const glowAt = iss ? ISS_EARTH : EARTH;
  const glowR = iss ? ISS_EARTH_R : EARTH_R;
  const orbitLabelA = Math.atan2(RADIAL[1], RADIAL[0]) + 0.55; // a bit further along the orbit
  const orbitLabel: P2 = [EARTH[0] + Math.cos(orbitLabelA) * (ORBIT_R + 22), EARTH[1] + Math.sin(orbitLabelA) * (ORBIT_R + 22)];

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 45% 40%, #13213f 0%, #070b18 60%, #03040a 100%)' }}>
      {/* under the planets */}
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="atmo">
            <stop offset="0.86" stopColor="#7fb6ff" stopOpacity={0.55} />
            <stop offset="1" stopColor="#7fb6ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#fff" opacity={st.o} />
        ))}
        <g transform={tf}>
          <circle cx={glowAt[0]} cy={glowAt[1]} r={glowR * 1.1} fill="url(#atmo)" />
          {!iss && (
            <>
              <circle
                cx={EARTH[0]}
                cy={EARTH[1]}
                r={ORBIT_R}
                fill="none"
                stroke="#fff"
                strokeOpacity={0.5}
                strokeWidth={1.6}
                strokeDasharray="12 10"
              />
              <line
                x1={MOON0[0]}
                y1={MOON0[1]}
                x2={MOON0[0] + TANGENT[0] * lineLen}
                y2={MOON0[1] + TANGENT[1] * lineLen}
                stroke={C.red}
                strokeWidth={3.2}
                strokeDasharray={lineLen}
                strokeDashoffset={lineLen * (1 - draw)}
              />
            </>
          )}
        </g>
      </svg>

      <ThreeCanvas
        orthographic
        width={W}
        height={H}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3000], near: 1, far: 8000, zoom: 1 }}
      >
        <OrthoRig s={s} P={P} Q={Q} />
        <ambientLight intensity={0.12} />
        <directionalLight position={[-900, 600, 800]} intensity={2.8} />
        {iss ? (
          <>
            <Planet at={ISS_EARTH} r={ISS_EARTH_R} spin={2.3 + t * 0.004} tilt={-0.15} />
            <Iss t={(frame - F.iss) / 30} />
          </>
        ) : (
          <>
            <Planet at={EARTH} r={EARTH_R} spin={1.2 + t * 0.05} />
            <Moon at={moon} />
          </>
        )}
      </ThreeCanvas>

      {/* over the planets */}
      {!iss && (
        <svg width={W} height={H} style={{ position: 'absolute' }}>
          <g transform={tf} opacity={detail * draw}>
            <text
              {...label(17, C.red)}
              transform={`translate(${MOON0[0] + TANGENT[0] * 60 + RADIAL[0] * 22} ${MOON0[1] + TANGENT[1] * 60 + RADIAL[1] * 22}) rotate(${TANGENT_DEG})`}
            >
              STRAIGHT LINE
            </text>
          </g>
          <g transform={tf} opacity={detail}>
            <text
              {...label(17)}
              opacity={0.75}
              transform={`translate(${orbitLabel[0]} ${orbitLabel[1]}) rotate(${(orbitLabelA * 180) / Math.PI + 90})`}
            >
              ORBIT
            </text>
            <text {...label(16)} opacity={0.6} x={EARTH[0]} y={EARTH[1] + EARTH_R + 50} textAnchor="middle">
              NOT TO SCALE
            </text>
          </g>
          <text {...label(30, C.gold)} fontWeight={700} x={445} y={585} opacity={offLabel}>
            3.4 cm OFF COURSE
          </text>
        </svg>
      )}
    </AbsoluteFill>
  );
};

/* ---------- Scene 12: the whole planet rings ---------- */

const GLOBE: P2 = [540, 1380];
const GLOBE_R = 330;

export const RingingEarth: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < F.ring || frame >= F.scale) return null;
  const back = frame >= F.comesBack;
  const k = back ? 1 + 0.05 * swingAt(frame) : 1; // swell, exaggerated
  const spin = 2.0 + (frame - F.ring) / 30 * 0.03 + (elapsedAt(frame) / 86400) * Math.PI * 2;
  const flash = interpolate(frame, [F.comesBack, F.comesBack + 3, F.comesBack + 36], [0, 0.55, 0], clamp);
  const id: P2 = [W / 2, H / 2];
  const ripple = (i: number) => {
    const p = (((frame - F.comesBack) / 48 + i / 3) % 1 + 1) % 1;
    return { r: GLOBE_R * (1.07 + p * 0.38), o: back ? (1 - p) * 0.55 : 0 };
  };

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 55%, #142446 0%, #080d1c 60%, #03040a 100%)' }}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="atmo2">
            <stop offset="0.86" stopColor="#7fb6ff" stopOpacity={0.6} />
            <stop offset="1" stopColor="#7fb6ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        {STARS.map((st, i) => (
          <circle key={i} cx={st.x} cy={st.y} r={st.s} fill="#fff" opacity={st.o} />
        ))}
        <circle cx={GLOBE[0]} cy={GLOBE[1]} r={GLOBE_R * k * 1.1} fill="url(#atmo2)" />
        {[0, 1, 2].map((i) => {
          const rp = ripple(i);
          return (
            <circle
              key={i}
              cx={GLOBE[0]}
              cy={GLOBE[1]}
              r={rp.r}
              fill="none"
              stroke="#cfe0ff"
              strokeWidth={3}
              strokeDasharray="2 10"
              strokeLinecap="round"
              opacity={rp.o}
            />
          );
        })}
      </svg>

      <ThreeCanvas
        orthographic
        width={W}
        height={H}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3000], near: 1, far: 8000, zoom: 1 }}
      >
        <OrthoRig s={1} P={id} Q={id} />
        <ambientLight intensity={0.15} />
        <directionalLight position={[-900, 600, 800]} intensity={2.8} />
        <group position={w(GLOBE)} scale={k}>
          <Planet at={id} r={GLOBE_R} spin={spin} />
        </group>
      </ThreeCanvas>

      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {/* original size, so the swell reads */}
        <circle
          cx={GLOBE[0]}
          cy={GLOBE[1]}
          r={GLOBE_R}
          fill="none"
          stroke="#fff"
          strokeOpacity={back ? 0.6 : 0}
          strokeWidth={2}
          strokeDasharray="10 8"
        />
        <text {...label(16)} opacity={0.75} x={GLOBE[0]} y={1768} textAnchor="middle">
          SWELL EXAGGERATED 50×
        </text>
      </svg>
      <AbsoluteFill style={{ background: '#56607a', opacity: flash }} />
    </AbsoluteFill>
  );
};
