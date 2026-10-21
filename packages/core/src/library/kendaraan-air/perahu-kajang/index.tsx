// Perahu kajang: a Nusantara trading boat of the 1920s with a painted, carved bow, a bipod mast, a long yard and a
// woven-mat (kajang) roof amidships. Drawn from Tropenmuseum photos (see refs.md): the Madurese prauw at Surabaya,
// 1932 (painted bow, tall stem post) and the prauw at the Batavia quay, 1920-1930 (bipod mast, kajang roof, furled
// sail on a long yard). Proportions are read from those photos; colours of the painted band are invented (the photos
// are black and white).
import React, { useMemo } from 'react';
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Shape } from 'three';
import type { Item2DProps, Item3DProps, ItemMeta } from '../../types';

export const meta: ItemMeta = {
  id: 'perahu-kajang',
  name: 'Perahu kajang (prauw dagang, 1920-an)',
  category: 'kendaraan-air',
  tags: ['perahu', 'prauw', 'kapal', 'layar', 'kajang', 'madura', 'bugis', 'pelabuhan', 'boat', 'sailing', 'nusantara', 'kolonial'],
  era: '1910-1940',
  region: 'Jawa Timur, Madura, Batavia',
  size: [12.5, 11.5, 3],
  variants: ['tergulung', 'terkembang', 'darat'],
  refs: 'packages/core/src/library/kendaraan-air/perahu-kajang/refs.md',
  invented: ['warna pita hias (foto hitam-putih)', 'detail buritan'],
};

const C = { hullDark: '#3E2A1A', hull: '#6B4A2E', hullLit: '#8C6640', strake: '#C9A36A', red: '#A23B2A', cream: '#E8DCC0', green: '#3F6B4E', wood: '#4A3524', mat: '#C8B07A', matDark: '#9C8452', matLit: '#E0CC96', sail: '#E9DCC0', sailShade: '#C9B78F', rope: '#2A2018' };

/** sheer (top edge of the hull) and bottom along the length, metres; u from -1 (stern) to 1 (bow) */
const sheer = (u: number) => 1.15 + 0.55 * u * u + (u > 0 ? 0.5 * u ** 4 : 0.25 * u ** 4);
const bottom = (u: number) => -0.05 + 0.35 * u ** 6;

export const Item2D: React.FC<Item2DProps> = ({ x, y, s, t = 0, seed = 0, variant = 'tergulung', flip = false }) => {
  const L = 6; // half length
  const bob = Math.sin(t / 34 + seed) * 0.06, roll = Math.sin(t / 47 + seed * 2) * 0.9;
  const P = (u: number, h: number) => `${(u * L).toFixed(3)} ${(-h).toFixed(3)}`;
  const N = 28, us = Array.from({ length: N + 1 }, (_, i) => -1 + (2 * i) / N);
  const line = (f: (u: number) => number, a = 0, b = 1) => us.filter((u) => u >= -1 + 2 * a && u <= -1 + 2 * b).map((u) => P(u, f(u))).join(' L ');
  const hull = `M ${line(sheer)} L ${[...us].reverse().map((u) => P(u, bottom(u))).join(' L ')} Z`;
  const strakes = [0.25, 0.5, 0.75].map((k) => (u: number) => bottom(u) + (sheer(u) - bottom(u)) * k);
  const band = (u: number) => sheer(u) - 0.32;
  const sail = variant === 'terkembang';
  const water = variant !== 'darat';
  const body = (
    <g>
      {/* hull: dark below, mid tone, lit upper side (sun from the upper left), planking lines, painted band */}
      <path d={hull} fill={C.hull} />
      <path d={`M ${line(strakes[0])} L ${[...us].reverse().map((u) => P(u, bottom(u))).join(' L ')} Z`} fill={C.hullDark} />
      <path d={`M ${line(sheer)} L ${[...us].reverse().map((u) => P(u, strakes[2](u))).join(' L ')} Z`} fill={C.hullLit} />
      {strakes.map((f, i) => <path key={i} d={`M ${line(f)}`} stroke={C.hullDark} strokeWidth={0.035} fill="none" opacity={0.7} />)}
      <path d={`M ${line(sheer)} L ${[...us].reverse().map((u) => P(u, band(u))).join(' L ')} Z`} fill={C.strake} />
      {/* triangles and diamonds along the band (painted pattern as on the Madurese prauw) */}
      {Array.from({ length: 22 }, (_, i) => {
        const u = -0.9 + i * 0.085, x0 = u * L, h0 = band(u), h1 = sheer(u), w = 0.24;
        return <path key={i} d={i % 2 ? `M ${x0 - w} ${-h0} L ${x0} ${-h1 + 0.04} L ${x0 + w} ${-h0} Z` : `M ${x0} ${-h0 - 0.02} L ${x0 + w * 0.6} ${-(h0 + h1) / 2} L ${x0} ${-h1 + 0.03} L ${x0 - w * 0.6} ${-(h0 + h1) / 2} Z`} fill={i % 4 < 2 ? C.red : C.green} opacity={0.9} />;
      })}
      <path d={`M ${line(sheer)}`} stroke={C.hullDark} strokeWidth={0.06} fill="none" />
      {/* tall carved stem post at the bow (Madurese prauw): a broad board rising well above the sheer, painted panels */}
      <path d={`M ${L * 0.9} ${-sheer(0.9)} L ${L * 0.98} ${-3.6} Q ${L * 1.04} ${-3.95} ${L * 1.1} ${-3.7} Q ${L * 1.07} ${-3.3} ${L * 1.08} ${-2.6} Q ${L * 1.06} ${-2.0} ${L * 0.99} ${-sheer(0.99)} Z`} fill={C.wood} />
      <path d={`M ${L * 0.93} ${-sheer(0.93) - 0.15} L ${L * 0.985} ${-3.4} Q ${L * 1.03} ${-3.65} ${L * 1.06} ${-3.55}`} stroke={C.hullLit} strokeWidth={0.06} fill="none" />
      {[2.2, 2.65, 3.1].map((h, i) => <path key={i} d={`M ${L * 1.0} ${-h - 0.18} l 0.16 0.18 l -0.16 0.18 l -0.16 -0.18 Z`} fill={i % 2 ? C.cream : C.red} />)}
      <path d={`M ${L * 0.965} ${-1.95} h 0.34`} stroke={C.green} strokeWidth={0.1} />
      {/* stern deck with a rail, and a quarter rudder hanging from the stern on the near side */}
      <rect x={-L * 1.0} y={-sheer(-0.97) - 0.5} width={1.4} height={0.5} fill={C.hullLit} />
      <path d={`M ${-L * 1.0} ${-sheer(-0.97) - 0.5} h 1.4`} stroke={C.hullDark} strokeWidth={0.05} />
      {[0, 0.45, 0.9, 1.35].map((d) => <path key={d} d={`M ${-L + d} ${-sheer(-0.97) - 0.5} v 0.5`} stroke={C.hullDark} strokeWidth={0.04} />)}
      <path d={`M ${-L * 0.82} ${-sheer(-0.82) - 0.4} L ${-L * 0.9} 0.55 L ${-L * 0.78} 0.6 L ${-L * 0.74} ${-sheer(-0.74) + 0.2} Z`} fill={C.wood} />
      <path d={`M ${-L * 0.82} ${-sheer(-0.82) - 0.4} L ${-L * 0.86} ${-sheer(-0.82) - 1.0}`} stroke={C.wood} strokeWidth={0.09} />
      {/* kajang: a woven-mat roof amidships, a filled arch from the deck, dark underside at the open ends */}
      {(() => {
        const x0 = -2.7, x1 = 1.6, top = 1.75, base = (xx: number) => -sheer(xx / L) + 0.05;
        const arch = (k: number) => { const xx = x0 + (x1 - x0) * k; return [xx, base(xx) - top * Math.sin(k * Math.PI) ** 0.7] as const; };
        const pts = Array.from({ length: 25 }, (_, i) => arch(i / 24));
        const d = `M ${pts.map(([a, b]) => `${a.toFixed(3)} ${b.toFixed(3)}`).join(' L ')} L ${x1} ${base(x1)} L ${x0} ${base(x0)} Z`;
        return <g>
          <path d={d} fill={C.mat} />
          {/* weave: diagonal strips both ways, clipped to the roof */}
          <clipPath id={`kj${seed}`}><path d={d} /></clipPath>
          <g clipPath={`url(#kj${seed})`} opacity={0.45}>
            {Array.from({ length: 30 }, (_, i) => <path key={`a${i}`} d={`M ${x0 - 2 + i * 0.25} 0 l 2 -3`} stroke={C.matDark} strokeWidth={0.05} />)}
            {Array.from({ length: 30 }, (_, i) => <path key={`b${i}`} d={`M ${x0 - 1 + i * 0.25} -3 l 2 3`} stroke={C.matLit} strokeWidth={0.04} />)}
          </g>
          {/* lit crown towards the sun, shaded lower edge */}
          <path d={`M ${pts.slice(3, 22).map(([a, b]) => `${a.toFixed(3)} ${(b + 0.08).toFixed(3)}`).join(' L ')}`} stroke={C.matLit} strokeWidth={0.12} fill="none" />
          <path d={`M ${x0} ${base(x0)} L ${x1} ${base(x1)}`} stroke={C.matDark} strokeWidth={0.18} />
          <path d={`M ${pts.map(([a, b]) => `${a.toFixed(3)} ${b.toFixed(3)}`).join(' L ')}`} stroke={C.matDark} strokeWidth={0.05} fill="none" />
        </g>;
      })()}
      {/* bipod mast: two poles seen side on, slightly apart, meeting at the head */}
      <path d={`M 0.15 ${-sheer(0.03)} L 0.62 -10.2 M 0.95 ${-sheer(0.16)} L 0.66 -10.2`} stroke={C.wood} strokeWidth={0.13} strokeLinecap="round" />
      <path d="M 0.55 -10.2 h 0.22 v 0.3 h -0.22 Z" fill={C.hullDark} />
      {/* rigging: forestay to the stem, backstays to the stern */}
      <path d={`M 0.64 -10.1 L ${L * 1.0} -3.1 M 0.64 -10.1 L ${-L * 0.95} ${-sheer(-0.95) - 0.5} M 0.64 -9.6 L ${-L * 0.6} ${-sheer(-0.6)}`} stroke={C.rope} strokeWidth={0.03} opacity={0.75} />
      {sail ? (
        // tanja sail set: a tilted quadrilateral between the long yard and a lower boom
        <g>
          <path d="M -4.2 -3.6 L 1.3 -9.6 L 5.4 -6.0 L 0.4 -2.6 Z" fill={C.sail} />
          <path d="M 1.3 -9.6 L 5.4 -6.0 L 0.4 -2.6 Z" fill={C.sailShade} opacity={0.5} />
          {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M ${-4.2 + 5.5 * k} ${-3.6 - 6 * k} L ${0.4 + 5.0 * k} ${-2.6 - 3.4 * k}`} stroke={C.sailShade} strokeWidth={0.05} />)}
          <path d="M -4.4 -3.4 L 1.4 -9.8" stroke={C.wood} strokeWidth={0.12} />
          <path d="M 0.2 -2.5 L 5.6 -6.1" stroke={C.wood} strokeWidth={0.1} />
        </g>
      ) : (
        // furled: the sail bundled along the yard, lashed at intervals
        <g>
          <path d="M -4.6 -3.3 L 5.2 -8.6" stroke={C.wood} strokeWidth={0.12} strokeLinecap="round" />
          <path d="M -4.1 -3.45 Q 0.6 -6.1 4.6 -8.35" stroke={C.sailShade} strokeWidth={0.42} strokeLinecap="round" fill="none" />
          <path d="M -4.1 -3.6 Q 0.6 -6.25 4.6 -8.5" stroke={C.sail} strokeWidth={0.22} strokeLinecap="round" fill="none" />
          {Array.from({ length: 9 }, (_, i) => { const k = i / 8, xx = -4.1 + 8.7 * k, yy = -3.45 - 4.9 * k - Math.sin(k * Math.PI) * 0.15; return <path key={i} d={`M ${xx} ${yy - 0.25} l 0.06 0.5`} stroke={C.rope} strokeWidth={0.05} />; })}
          <path d="M 0.64 -9.9 L 0.9 -6.3" stroke={C.rope} strokeWidth={0.035} />
        </g>
      )}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bob * s}) rotate(${roll}) scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})`}>
      {water && (
        // reflection: the hull mirrored below the waterline, broken into ripple bands, faded
        <g opacity={0.28} transform="scale(1 -0.7)">
          <path d={hull} fill={C.hull} />
          <path d={`M ${line(sheer)} L ${[...us].reverse().map((u) => P(u, band(u))).join(' L ')} Z`} fill={C.strake} />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-L * 1.1} y={-(0.2 + i * 0.32) - 0.08} width={L * 2.2} height={0.07} fill="#8FAEA2" transform={`translate(${Math.sin(t / 20 + i) * 0.15} 0)`} />)}
        </g>
      )}
      {body}
      {water && <ellipse cx={0} cy={0.02} rx={L * 1.05} ry={0.09} fill="#DCE6DA" opacity={0.35} />}
    </g>
  );
};

// ---- 3D: same proportions as the 2D drawing. Origin at the waterline amidships, +x towards the bow. ----

/** half beam and depth below the waterline along the length (u -1 stern .. 1 bow) */
const beam = (u: number) => 1.5 * Math.pow(Math.max(0, 1 - u * u), 0.55);
const draft = (u: number) => 0.75 * (1 - u ** 4);

/** lofted hull: U-shaped sections from one sheer to the other, coloured by height (dark below water, hull, painted band) */
const useHull = () => useMemo(() => {
  const NU = 40, NA = 18, L = 6, pos: number[] = [], col: number[] = [], idx: number[] = [];
  const dark = new Color(C.hullDark), mid = new Color(C.hull), lit = new Color(C.hullLit), strake = new Color(C.strake), red = new Color(C.red), green = new Color(C.green);
  for (let i = 0; i <= NU; i++) {
    const u = -1 + (2 * i) / NU, top = sheer(u), keel = -draft(u), B = beam(u) + 0.02;
    for (let j = 0; j <= NA; j++) {
      const phi = (Math.PI * j) / NA, k = 1 - Math.pow(Math.sin(phi), 1.6);
      const y = keel + (top - keel) * k, z = B * Math.cos(phi);
      pos.push(u * L, y, z);
      const h = (y - keel) / (top - keel);
      const c = h > 0.9 ? strake : h > 0.8 ? (Math.floor((u + 1) * 11) % 2 ? red : green) : y < 0.15 ? dark : h > 0.62 ? lit : mid;
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NA; j++) {
    const a = i * (NA + 1) + j, b = a + NA + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // deck: a flat strip just under the sheer between the two sides
  const dp: number[] = [], di: number[] = [];
  for (let i = 0; i <= NU; i++) { const u = -1 + (2 * i) / NU, y = sheer(u) - 0.18, B = beam(u) * 0.96; dp.push(u * L, y, B, u * L, y, -B); }
  for (let i = 0; i < NU; i++) { const a = i * 2; di.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const d = new BufferGeometry();
  d.setAttribute('position', new BufferAttribute(new Float32Array(dp), 3));
  d.setIndex(di);
  d.computeVertexNormals();
  return { hull: g, deck: d };
}, []);

const sailShape = (() => { const sh = new Shape(); sh.moveTo(-4.2, 3.6); sh.lineTo(1.3, 9.6); sh.lineTo(5.4, 6.0); sh.lineTo(0.4, 2.6); sh.closePath(); return sh; })();

export const Item3D: React.FC<Item3DProps> = ({ t = 0, seed = 0, variant = 'tergulung' }) => {
  const { hull, deck } = useHull();
  const L = 6, set = variant === 'terkembang';
  const bob = Math.sin(t / 34 + seed) * 0.06, roll = Math.sin(t / 47 + seed * 2) * 0.015;
  const wood = <meshStandardMaterial color={C.wood} roughness={0.9} />;
  return (
    <group position={[0, bob, 0]} rotation={[roll, 0, 0]}>
      <mesh geometry={hull} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.85} side={DoubleSide} /></mesh>
      <mesh geometry={deck} receiveShadow><meshStandardMaterial color="#8C6A46" roughness={0.95} side={DoubleSide} /></mesh>
      {/* tall carved stem post and painted panels */}
      <mesh position={[L * 1.0, 2.6, 0]} rotation={[0, 0, -0.12]} castShadow><boxGeometry args={[0.32, 2.2, 0.16]} />{wood}</mesh>
      {[2.2, 2.65, 3.1].map((h, i) => <mesh key={h} position={[L * 1.0 + 0.06 - (h - 2.2) * 0.12, h, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.18, 0.18, 0.18]} /><meshStandardMaterial color={i % 2 ? C.cream : C.red} /></mesh>)}
      {/* stern deck house and a quarter rudder on each side */}
      <mesh position={[-L * 0.92, sheer(-0.92) + 0.25, 0]} castShadow><boxGeometry args={[1.4, 0.5, 2.0]} /><meshStandardMaterial color={C.hullLit} roughness={0.9} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[-L * 0.84, 0.3, sd * (beam(-0.84) + 0.08)]} rotation={[sd * 0.12, 0, 0.35]} castShadow><boxGeometry args={[0.35, 2.4, 0.08]} />{wood}</mesh>)}
      {/* kajang: half-cylinder woven roof amidships */}
      {/* the cylinder's axis is y: turn it to lie along the boat, the open half (theta 0..pi) facing up */}
      <mesh position={[-0.55, sheer(0) - 0.15, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1.15, 1, 1]} castShadow>
        <cylinderGeometry args={[1.25, 1.25, 4.3, 24, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color={C.mat} roughness={1} side={DoubleSide} />
      </mesh>
      {/* bipod mast: two poles from the sides meeting at the head */}
      {[-1, 1].map((sd) => {
        const foot: [number, number, number] = [0.55, sheer(0.09) - 0.15, sd * 1.0], head: [number, number, number] = [0.65, 10.2, 0];
        const len = Math.hypot(head[0] - foot[0], head[1] - foot[1], head[2] - foot[2]);
        return <mesh key={sd} position={[(foot[0] + head[0]) / 2, (foot[1] + head[1]) / 2, (foot[2] + head[2]) / 2]} rotation={[sd * Math.atan2(1.0, head[1] - foot[1]), 0, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, len, 10]} />{wood}</mesh>;
      })}
      {set ? (
        // tanja sail set between the long yard and a lower boom, in the boat's centre plane
        <group>
          <mesh position={[0, 0, 0]} castShadow>
            <shapeGeometry args={[sailShape]} />
            <meshStandardMaterial color={C.sail} side={DoubleSide} roughness={0.9} />
          </mesh>
          <mesh position={[-1.5, 6.7, 0]} rotation={[0, 0, -0.83]} castShadow><cylinderGeometry args={[0.06, 0.06, 8.4, 8]} />{wood}</mesh>
        </group>
      ) : (
        <group position={[0.3, 5.95, 0]} rotation={[0, 0, 0.5]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.06, 0.06, 11.2, 8]} />{wood}</mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.18, 0]} castShadow><capsuleGeometry args={[0.2, 9.2, 6, 12]} /><meshStandardMaterial color={C.sail} roughness={1} /></mesh>
        </group>
      )}
    </group>
  );
};
