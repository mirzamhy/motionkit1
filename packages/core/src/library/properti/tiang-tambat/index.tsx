// Tiang tambat: what a boat ties up to at the quay. Two kinds: a wooden pile with rope wrapped round it (the
// Madurese prauw at Surabaya, 1932, is moored by a rope from its bow to the quay) and a cast-iron bollard of the kind
// set along colonial stone quays (no 1920s Indonesian photo yet: invented from general knowledge). See refs.md.
import React from 'react';
import type { Item2DProps, Item3DProps, ItemMeta } from '../../types';

export const meta: ItemMeta = {
  id: 'tiang-tambat',
  name: 'Tiang tambat (tiang kayu bertali / bolder besi)',
  benda: 'tiang-tambat',
  gaya: 'ilustrasi',
  category: 'properti',
  tags: ['tiang tambat', 'bolder', 'bollard', 'mooring', 'tali', 'rope', 'kade', 'dermaga', 'pelabuhan', 'pier'],
  era: '1900-1950',
  size: [0.45, 1.2, 0.45],
  variants: ['kayu', 'besi'],
  refs: 'packages/core/src/library/properti/tiang-tambat/refs.md',
  invented: ['bolder besi (tanpa foto Indonesia 1920-an)', 'jumlah lilitan tali'],
};

const C = { wood: '#6A4B30', woodDark: '#4A3322', woodLit: '#8F6A45', top: '#7D5A3A', rope: '#B79C6A', ropeDark: '#8C7448', iron: '#2F3231', ironLit: '#5A605D', ironDark: '#1E2020' };

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, variant = 'kayu', t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`}>
    <ellipse cx={0.05} cy={0.02} rx={0.32} ry={0.06} fill="#000" opacity={0.2} />
    {variant === 'besi' ? (
      // cast-iron bollard: a waisted post with a domed cap and a flared lip, lit on the left
      <g>
        <path d="M -0.2 0 L -0.16 -0.32 Q -0.12 -0.42 -0.16 -0.5 L -0.22 -0.56 L 0.22 -0.56 L 0.16 -0.5 Q 0.12 -0.42 0.16 -0.32 L 0.2 0 Z" fill={C.iron} />
        <path d="M -0.2 0 L -0.16 -0.32 Q -0.12 -0.42 -0.16 -0.5 L -0.22 -0.56 L -0.1 -0.56 L -0.07 -0.5 Q -0.05 -0.42 -0.08 -0.32 L -0.1 0 Z" fill={C.ironLit} />
        <ellipse cx={0} cy={-0.58} rx={0.24} ry={0.05} fill={C.ironDark} />
        <path d="M -0.2 -0.6 Q 0 -0.72 0.2 -0.6 Z" fill={C.iron} />
        <path d="M -0.12 -0.64 Q -0.04 -0.69 0.04 -0.68" stroke={C.ironLit} strokeWidth={0.02} fill="none" />
      </g>
    ) : (
      // wooden pile: weathered, three tones, an end-grain top, rope wrapped in turns with a loose end
      <g>
        <rect x={-0.16} y={-1.2} width={0.32} height={1.2} fill={C.wood} />
        <rect x={-0.16} y={-1.2} width={0.09} height={1.2} fill={C.woodLit} />
        <rect x={0.08} y={-1.2} width={0.08} height={1.2} fill={C.woodDark} />
        {[0.2, 0.45, 0.8, 1.05].map((h) => <path key={h} d={`M -0.12 ${-h} q 0.06 0.05 0.1 0.02`} stroke={C.woodDark} strokeWidth={0.015} fill="none" />)}
        <ellipse cx={0} cy={-1.2} rx={0.16} ry={0.04} fill={C.top} />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M -0.17 ${-0.62 - i * 0.055} Q 0 ${-0.66 - i * 0.055} 0.17 ${-0.6 - i * 0.055}`} stroke={i % 2 ? C.ropeDark : C.rope} strokeWidth={0.05} strokeLinecap="round" fill="none" />)}
        <path d={`M 0.15 -0.66 Q 0.5 ${-0.5 + Math.sin(t / 40) * 0.02} 1.2 -0.85`} stroke={C.rope} strokeWidth={0.04} fill="none" />
      </g>
    )}
  </g>
);

export const Item3D: React.FC<Item3DProps> = ({ variant = 'kayu' }) =>
  variant === 'besi' ? (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow><cylinderGeometry args={[0.15, 0.2, 0.32, 24]} /><meshStandardMaterial color={C.iron} metalness={0.6} roughness={0.5} /></mesh>
      <mesh position={[0, 0.41, 0]} castShadow><cylinderGeometry args={[0.16, 0.13, 0.18, 24]} /><meshStandardMaterial color={C.iron} metalness={0.6} roughness={0.5} /></mesh>
      <mesh position={[0, 0.53, 0]} castShadow><cylinderGeometry args={[0.22, 0.17, 0.06, 24]} /><meshStandardMaterial color={C.iron} metalness={0.6} roughness={0.45} /></mesh>
      <mesh position={[0, 0.56, 0]} castShadow scale={[1, 0.45, 1]}><sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={C.iron} metalness={0.6} roughness={0.45} /></mesh>
    </group>
  ) : (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.16, 0.17, 1.2, 14]} /><meshStandardMaterial color={C.wood} roughness={0.95} /></mesh>
      <mesh position={[0, 1.201, 0]}><cylinderGeometry args={[0.155, 0.155, 0.01, 14]} /><meshStandardMaterial color={C.top} roughness={1} /></mesh>
      {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[0, 0.62 + i * 0.055, 0]} rotation={[Math.PI / 2, 0, i * 0.4]} castShadow><torusGeometry args={[0.175, 0.025, 8, 24]} /><meshStandardMaterial color={i % 2 ? C.ropeDark : C.rope} roughness={1} /></mesh>)}
    </group>
  );
