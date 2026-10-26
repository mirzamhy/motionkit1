import React, { createContext, useContext, useMemo, useState } from 'react';
import { Color, RepeatWrapping, type Texture } from 'three';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { Vegetable } from './market-produce';
export const MARKET_PICK: [number, number, number] = [0.26, 1.025, 0.42];
export const MARKET_PAN: [number, number, number] = [-0.12, 1.16, 0.41];
/** optional PBR wood for every board (e.g. an ambientCG material); without it boards are flat colours as before */
export type WoodMaps = { map: Texture; normalMap?: Texture; roughnessMap?: Texture };
export const WoodLook = createContext<WoodMaps | null>(null);
const Wood = ({ p, s, c = '#94734c' }: { p: [number, number, number]; s: [number, number, number]; c?: string }) => {
  const look = useContext(WoodLook);
  // one texture copy per board, tiled about once per 40 cm along its two longest sides
  const mats = useMemo(() => {
    // only the brown boards are wood: green display boards and the scale keep their flat paint
    const col = new Color(c);
    if (!look || col.r <= col.g) return null;
    const [u, v] = [...s].sort((a, b) => b - a);
    const tile = (t?: Texture) => { if (!t) return undefined; const x = t.clone(); x.wrapS = x.wrapT = RepeatWrapping; x.repeat.set(Math.max(1, u / 0.4), Math.max(0.25, v / 0.4)); x.needsUpdate = true; return x; };
    return { map: tile(look.map), normalMap: tile(look.normalMap), roughnessMap: tile(look.roughnessMap), tint: col.clone().lerp(new Color('#ffffff'), 0.8) };
  }, [look, s, c]);
  return <mesh position={p} castShadow receiveShadow><boxGeometry args={s} />{mats ? <meshStandardMaterial color={mats.tint} map={mats.map} normalMap={mats.normalMap} roughnessMap={mats.roughnessMap} /> : <meshStandardMaterial color={c} roughness={0.95} />}</mesh>;
};
export const VendorStall = ({ load, hideRightPost = false, stock = true }: { load: number; hideRightPost?: boolean; stock?: boolean }) => {
  const [dial] = useState(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#eee8d5'; ctx.fillRect(0, 0, 256, 256);
    ctx.translate(128, 128); ctx.strokeStyle = '#313d37'; ctx.lineWidth = 3;
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 98, Math.cos(a) * 98); ctx.lineTo(Math.sin(a) * (i % 5 ? 89 : 78), Math.cos(a) * (i % 5 ? 89 : 78)); ctx.stroke(); }
    ctx.fillStyle = '#313d37'; ctx.font = '20px Arial'; ctx.textAlign = 'center'; ctx.fillText('kg', 0, 48);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  });
  return <>
    <Wood p={[0, 0.94, 0.48]} s={[1.65, 0.07, 0.65]} />
    {[-0.76, 0.76].map((x) => <React.Fragment key={x}><Wood p={[x, 0.46, 0.48]} s={[0.065, 0.92, 0.55]} c="#785638" />{!(hideRightPost && x > 0) && <Wood p={[x, 1.3, 0.8]} s={[0.065, 2.6, 0.065]} c="#705036" />}</React.Fragment>)}
    {Array.from({ length: 14 }, (_, i) => <Wood key={i} p={[-0.72 + i * 0.11, 0.5, 0.79]} s={[0.105, 0.84, 0.025]} c={i % 3 ? '#9a7950' : '#80603f'} />)}
    <Wood p={[0, 2.55, 0.8]} s={[1.6, 0.12, 0.07]} c="#785638" />
    <Wood p={[0, 2.4, 0.8]} s={[1.46, 0.21, 0.035]} c="#aa8b61" />
    <Wood p={[0.48, 0.99, 0.49]} s={[0.51, 0.035, 0.43]} c="#627845" />
    {stock && [0, 1, 2, 3, 4, 5].map((i) => <group key={i} position={[0.39 + (i % 2) * 0.13, 1.035, 0.37 + Math.floor(i / 2) * 0.11]} rotation={[0, 0.45 + i * 0.22, 0]} scale={0.65}><Vegetable kind={1} seed={i} /></group>)}
    <Wood p={[-0.57, 0.99, 0.49]} s={[0.27, 0.035, 0.43]} c="#627845" />
    {stock && [0, 1, 2].map((i) => <group key={i} position={[-0.57, 1.05, 0.36 + i * 0.12]} scale={0.6}><Vegetable kind={3} seed={i} /></group>)}
    <Wood p={[-0.12, 1.04, 0.41]} s={[0.25, 0.13, 0.22]} c="#466c57" />
    <mesh position={[-0.12, 1.13 - load * 0.004, 0.41]} castShadow><cylinderGeometry args={[0.17, 0.12, 0.035, 40]} /><meshStandardMaterial color="#b7beb3" roughness={0.38} metalness={0.5} /></mesh>
    <mesh position={[-0.12, 1.045, 0.527]}><circleGeometry args={[0.057, 40]} /><meshStandardMaterial map={dial} /></mesh>
    <group position={[-0.12, 1.045, 0.53]} rotation={[0, 0, -load * 0.75]}><Wood p={[0, 0.021, 0]} s={[0.003, 0.045, 0.002]} c="#a43c2c" /></group>
  </>;
};
