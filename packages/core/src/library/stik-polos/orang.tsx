// The generic stickman of the "Stik Polos" style: grey round head with no face, thick dark outline, drawn with
// Limb (outline under fill). Ground at y = 0, centre at x = 0, about 255 px tall (1.7 m at 150 px/m).
// Mood comes from pose, not from a face. Time `t` is in 30-fps frames.
import React from 'react';
import { C, Limb } from '../../styles/stik-polos/kit';

export type PoseOrang = 'berdiri' | 'berjalan' | 'duduk' | 'menunduk' | 'tertawa';
export const POSE_ORANG: PoseOrang[] = ['berdiri', 'berjalan', 'duduk', 'menunduk', 'tertawa'];

const LEG = 13;
const ARM = 10;
const TORSO = 16;

export const OrangStik: React.FC<{ t?: number; pose?: PoseOrang; body?: string; head?: string }> = ({ t = 0, pose = 'berdiri', body = C.body, head = C.head }) => {
  const Head: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
    <g transform={`rotate(${rot} ${x} ${y + 24})`}>
      <circle cx={x} cy={y} r={24} fill={head} stroke={C.out} strokeWidth={3.5} />
    </g>
  );

  if (pose === 'berjalan') {
    const sw = Math.sin(t * 0.35);
    const bob = -Math.abs(sw) * 3;
    const lift = (v: number) => -Math.max(0, v) * 10;
    return (
      <g transform={`translate(0 ${bob})`}>
        <Limb d={`M0 -114 L${14 * sw} -58 L${26 * sw} ${lift(-sw)}`} w={LEG} c={body} />
        <Limb d={`M0 -114 L${-14 * sw} -58 L${-26 * sw} ${lift(sw)}`} w={LEG} c={body} />
        <Limb d="M0 -112 L3 -198" w={TORSO} c={body} />
        <Limb d={`M3 -196 L${-6 - 14 * sw} -152 L${-4 - 22 * sw} -118`} w={ARM} c={body} />
        <Limb d={`M3 -196 L${6 + 14 * sw} -152 L${4 + 22 * sw} -118`} w={ARM} c={body} />
        <Head x={5} y={-228} />
      </g>
    );
  }

  if (pose === 'duduk') {
    return (
      <g>
        <rect x={-30} y={-62} width={60} height={9} rx={3} fill="#5A4638" stroke={C.out} strokeWidth={3} />
        <line x1={-22} y1={-53} x2={-22} y2={0} stroke={C.out} strokeWidth={5} />
        <line x1={22} y1={-53} x2={22} y2={0} stroke={C.out} strokeWidth={5} />
        <Limb d="M-6 -72 L30 -72 L34 -2" w={LEG} c={body} />
        <Limb d="M-6 -72 L22 -75 L24 -2" w={LEG} c={body} />
        <Limb d="M-6 -70 L-3 -158" w={TORSO} c={body} />
        <Limb d="M-3 -154 L20 -118 L38 -98" w={ARM} c={body} />
        <Head x={-1} y={-186} />
      </g>
    );
  }

  if (pose === 'menunduk') {
    return (
      <g>
        <Limb d="M0 -114 L-13 -58 L-14 0" w={LEG} c={body} />
        <Limb d="M0 -114 L13 -58 L14 0" w={LEG} c={body} />
        <Limb d="M0 -112 L7 -196" w={TORSO} c={body} />
        <Head x={13} y={-216} rot={10} />
        <Limb d="M5 -192 L-24 -222 L4 -246" w={ARM} c={body} />
        <Limb d="M9 -192 L42 -216 L18 -244" w={ARM} c={body} />
      </g>
    );
  }

  if (pose === 'tertawa') {
    const hop = -Math.abs(Math.sin(t * 0.5)) * 4;
    const shake = Math.sin(t * 0.5) * 1.2;
    return (
      <g transform={`translate(${shake} 0)`}>
        <Limb d="M0 -114 L-13 -58 L-14 0" w={LEG} c={body} />
        <Limb d="M0 -114 L13 -58 L14 0" w={LEG} c={body} />
        <g transform={`translate(0 ${hop})`}>
          <Limb d="M0 -112 L-2 -198" w={TORSO} c={body} />
          <Limb d="M-2 -196 L-28 -152 L-8 -138" w={ARM} c={body} />
          <Limb d="M-2 -196 L24 -154 L8 -140" w={ARM} c={body} />
          <Head x={-4} y={-230} rot={-8} />
        </g>
      </g>
    );
  }

  const idle = Math.sin(t * 0.12) * 1;
  return (
    <g>
      <Limb d="M0 -114 L-13 -58 L-14 0" w={LEG} c={body} />
      <Limb d="M0 -114 L13 -58 L14 0" w={LEG} c={body} />
      <Limb d="M0 -112 L0 -198" w={TORSO} c={body} />
      <Limb d="M0 -196 L-26 -150 L-26 -112" w={ARM} c={body} />
      <Limb d="M0 -196 L26 -150 L26 -112" w={ARM} c={body} />
      <Head x={0} y={-228 + idle} />
    </g>
  );
};
