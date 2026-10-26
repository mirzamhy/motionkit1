// Preview sheet for one library item: every 2D variant side by side on a ground line, with a 1.65 m person and a
// metre rule for scale. `node bin/mk.mjs item preview <id>` renders it to out/items/<id>/preview-2d.jpg.
import React, { Suspense, useEffect, useState } from 'react';
import { AbsoluteFill, Composition, continueRender, delayRender, registerRoot, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { Box3, Vector3 } from 'three';
import { itemById } from './index';

const W = 1920, H = 1080, GROUND = 760;

/** a 1.65 m person, side on, as a scale reference */
const Person: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <g transform={`translate(${x} ${GROUND}) scale(${s})`} fill="#3a3a3a">
    <circle cx={0} cy={-1.53} r={0.11} />
    <path d="M -0.17 -1.4 L 0.17 -1.4 L 0.14 -0.82 L 0.1 0 L 0.02 0 L 0 -0.78 L -0.02 0 L -0.1 0 L -0.14 -0.82 Z" />
  </g>
);

const Preview2D: React.FC<{ id: string; t0?: number }> = ({ id, t0 = 0 }) => {
  const item = itemById(id);
  const t = useCurrentFrame() + t0;
  if (!item?.Item2D) return <AbsoluteFill style={{ background: '#EDE6D6', color: '#a00', fontSize: 40, padding: 60 }}>No 2D item "{id}"</AbsoluteFill>;
  const { meta, Item2D } = item;
  const variants = meta.variants?.length ? meta.variants : ['default'];
  const slot = (W - 240) / variants.length;
  // px per metre that fits every slot and keeps the 1.65 m person under the title
  const s = Math.min((slot * 0.8) / meta.size[0], (GROUND - 160) / meta.size[1], (GROUND - 150) / 1.7);
  return (
    <AbsoluteFill style={{ background: '#EDE6D6' }}>
      <svg width={W} height={H}>
        <rect y={GROUND} width={W} height={H - GROUND} fill="#8FAEA2" opacity={0.55} />
        <path d={`M 0 ${GROUND} H ${W}`} stroke="#5d5548" strokeWidth={2} />
        <Person x={110} s={s} />
        {/* metre rule */}
        {Array.from({ length: Math.ceil(meta.size[0]) + 1 }, (_, i) => <path key={i} d={`M ${170 + i * s} ${GROUND + 40} v ${i % 5 ? 10 : 22}`} stroke="#3a3a3a" strokeWidth={2} />)}
        <path d={`M 170 ${GROUND + 40} h ${Math.ceil(meta.size[0]) * s}`} stroke="#3a3a3a" strokeWidth={2} />
        <text x={170} y={GROUND + 90} fontFamily="monospace" fontSize={22} fill="#3a3a3a">{`1 m = ${s.toFixed(1)} px · orang 1,65 m`}</text>
        {variants.map((v, i) => (
          <g key={v}>
            <Item2D x={240 + slot * (i + 0.5)} y={GROUND} s={s} t={t} variant={v} seed={i} />
            <text x={240 + slot * (i + 0.5)} y={H - 60} textAnchor="middle" fontFamily="monospace" fontSize={26} fill="#3a3a3a">{v}</text>
          </g>
        ))}
        <text x={40} y={60} fontFamily="monospace" fontSize={30} fill="#1d1f1b">{`${meta.name}`}</text>
        <text x={40} y={100} fontFamily="monospace" fontSize={22} fill="#5d5548">{`${meta.id} · ${meta.size.join(' × ')} m · ${meta.era ?? ''} · rekaan: ${(meta.invented ?? []).join('; ') || '-'}`}</text>
      </svg>
    </AbsoluteFill>
  );
};

/** 3D preview: one row per variant, four turns each (0, 90, 180, 270 degrees), a 1.65 m post for scale, and the
 *  size measured from the first copy against meta.size */
const Fit: React.FC<{ span: number; rows: number; ready: (size: string) => void }> = ({ span, rows, ready }) => {
  const { gl, scene, camera } = useThree();
  const cx = span * 1.5, d = span * 4.4 + (rows - 1) * span * 1.4;
  camera.position.set(cx, d * 0.5, d * 1.05); camera.lookAt(cx, span * 0.25, -(rows - 1) * span * 1.1); camera.updateMatrixWorld();
  useEffect(() => {
    gl.render(scene, camera);
    const first = scene.getObjectByName('preview-first');
    const v = first ? new Box3().setFromObject(first, true).getSize(new Vector3()) : null;
    ready(v ? `${v.x.toFixed(2)} × ${v.y.toFixed(2)} × ${v.z.toFixed(2)} m` : '?');
  }, [gl, scene, camera, ready]);
  return null;
};
const Preview3D: React.FC<{ id: string }> = ({ id }) => {
  const item = itemById(id);
  const [handle] = useState(() => delayRender('Item preview 3D'));
  const [measured, setMeasured] = useState<string>('…');
  // the overlay text must show the measured size before the frame is taken
  useEffect(() => { if (measured !== '…') continueRender(handle); }, [measured, handle]);
  if (!item?.Item3D) return <AbsoluteFill style={{ background: '#EDE6D6', color: '#a00', fontSize: 40, padding: 60 }}>No 3D item "{id}"</AbsoluteFill>;
  const { meta, Item3D } = item;
  const variants = meta.variants?.length ? meta.variants.filter((v) => v !== 'darat') : ['default'];
  const span = Math.max(...meta.size) * 1.5;
  return (
    <AbsoluteFill style={{ background: '#EDE6D6' }}>
      <ThreeCanvas width={W} height={H} shadows camera={{ fov: 30, near: 0.01, far: Math.max(2000, span * 60) }}>
        <color attach="background" args={['#EDE6D6']} />
        <hemisphereLight args={['#fff6e8', '#6d7364', 1.4]} />
        <directionalLight position={[-span * 3, span * 6, span * 4]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-span * 6} shadow-camera-right={span * 6} shadow-camera-top={span * 6} shadow-camera-bottom={-span * 6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[span * 1.5, 0, 0]} receiveShadow><planeGeometry args={[span * 12, span * 12]} /><meshStandardMaterial color="#cfc8b6" /></mesh>
        <mesh position={[-span * 0.55, 0.825, 0]} castShadow><cylinderGeometry args={[0.12, 0.12, 1.65, 12]} /><meshStandardMaterial color="#3a3a3a" /></mesh>
        <Suspense fallback={null}>
          {variants.map((v, r) => [0, 1, 2, 3].map((k) => (
            <group key={`${v}${k}`} name={r === 0 && k === 0 ? 'preview-first' : undefined} position={[k * span, 0, -r * span * 2.2]} rotation={[0, (k * Math.PI) / 2, 0]}><Item3D variant={v} /></group>
          )))}
          <Fit span={span} rows={variants.length} ready={setMeasured} />
        </Suspense>
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: 'monospace', color: '#1d1f1b' }}>
        <div style={{ fontSize: 30 }}>{meta.name}</div>
        <div style={{ fontSize: 22, color: '#5d5548' }}>{`${meta.id} · meta ${meta.size.join(' × ')} m · terukur ${measured} · tiang 1,65 m · baris: ${variants.join(', ')} · putaran 0/90/180/270°`}</div>
      </div>
    </AbsoluteFill>
  );
};

registerRoot(() => <>
  <Composition id="ItemPreview2D" component={Preview2D} width={W} height={H} fps={30} durationInFrames={90} defaultProps={{ id: '' }} />
  <Composition id="ItemPreview3D" component={Preview3D} width={W} height={H} fps={30} durationInFrames={1} defaultProps={{ id: '' }} />
</>);
