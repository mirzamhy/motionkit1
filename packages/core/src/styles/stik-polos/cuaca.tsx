// Weather is a parameter of a film, not part of the style: the same street, characters and camera under rain, drizzle,
// a clear starry night or fog. A film takes `cuaca` and draws three things from it:
//   <CuacaBelakang/>  behind the world (stars, moon)
//   <CuacaDepan/>     in front of everything (rain streaks, fog)
//   <Genangan/>       ripples on the road, only when the road is wet (CUACA[c].basah)
// and plays CUACA[c].suara. Everything is seeded, so any frame renders on its own.
import React from 'react';
import { random } from 'remotion';
import type { StikSound } from './kit';

export type Cuaca = 'hujan' | 'gerimis' | 'cerah' | 'kabut';

export const CUACA: Record<Cuaca, { nama: string; basah: boolean; suara: StikSound[] }> = {
  hujan: { nama: 'Hujan deras', basah: true, suara: [{ at: 0, file: 'rain', vol: 0.35, loop: true }] },
  gerimis: { nama: 'Gerimis', basah: true, suara: [{ at: 0, file: 'rain', vol: 0.14, loop: true }] },
  cerah: { nama: 'Malam cerah berbintang', basah: false, suara: [{ at: 0, file: 'wind', vol: 0.1, loop: true }] },
  kabut: { nama: 'Kabut', basah: false, suara: [{ at: 0, file: 'wind', vol: 0.18, loop: true }] },
};
export const CUACA_IDS = Object.keys(CUACA) as Cuaca[];
export const jalanBasah = (c: Cuaca) => CUACA[c].basah;

type Frame = { frame: number; jenis: Cuaca };

/** stars and a crescent moon, screen space (720×1280), drawn right after the sky and before the city */
export const CuacaBelakang: React.FC<Frame> = ({ frame, jenis }) => {
  if (jenis !== 'cerah') return null;
  const stars = Array.from({ length: 90 }, (_, i) => {
    const x = random(`st-x${i}`) * 720;
    const y = random(`st-y${i}`) * 620;
    const r = 0.7 + random(`st-r${i}`) * 1.6;
    const tw = 0.55 + 0.45 * Math.sin(frame * (0.05 + random(`st-f${i}`) * 0.07) + random(`st-p${i}`) * 6.28);
    return <circle key={i} cx={x} cy={y} r={r} fill="#DDE6F2" opacity={(0.25 + 0.55 * random(`st-o${i}`)) * tw} />;
  });
  return (
    <g>
      <defs>
        <mask id="stikMoonCut">
          <rect width={720} height={1280} fill="#fff" />
          <circle cx={618} cy={150} r={30} fill="#000" />
        </mask>
      </defs>
      {stars}
      <circle cx={600} cy={160} r={32} fill="#E6E9EE" opacity={0.92} mask="url(#stikMoonCut)" />
    </g>
  );
};

/** rain streaks (two depths) or fog, screen space, drawn over the whole frame */
export const CuacaDepan: React.FC<Frame> = ({ frame, jenis }) => {
  if (jenis === 'hujan' || jenis === 'gerimis') {
    const light = jenis === 'gerimis';
    const layers = [
      { n: light ? 40 : 110, len: [12, 22], w: light ? 0.9 : 1.1, op: light ? 0.16 : 0.22, v: light ? 14 : 26, seed: 'far' },
      { n: light ? 18 : 70, len: [26, 42], w: light ? 1.3 : 1.8, op: light ? 0.26 : 0.38, v: light ? 22 : 40, seed: 'near' },
    ];
    const drops: React.ReactNode[] = [];
    for (const L of layers) {
      for (let i = 0; i < L.n; i++) {
        const x0 = random(`${L.seed}x${i}`) * 780 - 30;
        const y0 = random(`${L.seed}y${i}`) * 1400;
        const len = L.len[0] + random(`${L.seed}l${i}`) * (L.len[1] - L.len[0]);
        const v = L.v * (0.85 + random(`${L.seed}v${i}`) * 0.3);
        const y = ((y0 + frame * v) % 1400) - 80;
        const x = x0 - (y + 80) * 0.06;
        drops.push(<line key={`${L.seed}${i}`} x1={x} y1={y} x2={x - len * 0.06} y2={y + len} stroke="#D7DEE8" strokeWidth={L.w} opacity={L.op} strokeLinecap="round" />);
      }
    }
    return <g>{drops}</g>;
  }
  if (jenis === 'kabut') {
    const bands = [
      { y: 330, h: 110, o: 0.1, v: 0.35, ph: 0 },
      { y: 700, h: 150, o: 0.13, v: 0.5, ph: 380 },
      { y: 920, h: 170, o: 0.12, v: 0.28, ph: 160 },
      { y: 560, h: 120, o: 0.08, v: 0.62, ph: 560 },
    ];
    return (
      <g>
        <defs>
          <radialGradient id="stikKabut">
            <stop offset="0" stopColor="#A9B4C4" stopOpacity={1} />
            <stop offset="1" stopColor="#A9B4C4" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={720} height={1280} fill="#8793A6" opacity={0.07} />
        {bands.map((b, i) => {
          const x = ((frame * b.v + b.ph) % 1100) - 330;
          return <ellipse key={i} cx={x + 330} cy={b.y} rx={420} ry={b.h} fill="url(#stikKabut)" opacity={b.o * 2.2} />;
        })}
      </g>
    );
  }
  return null;
};

/** ripples on the wet road, world space */
export const Genangan: React.FC<Frame & { x0?: number; span?: number; y0?: number }> = ({ frame, jenis, x0 = -200, span = 1700, y0 = 890 }) => {
  if (!jalanBasah(jenis)) return null;
  const n = Math.round((span / 1700) * (jenis === 'gerimis' ? 32 : 70));
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const period = 14 + Math.floor(random(`rp${i}`) * 10);
    const phase = Math.floor(random(`rph${i}`) * period);
    const cyc = Math.floor((frame + phase) / period);
    const t = ((frame + phase) % period) / period;
    const x = x0 + random(`rx${i}-${cyc}`) * span;
    const y = y0 + random(`ry${i}-${cyc}`) * 600;
    out.push(<ellipse key={i} cx={x} cy={y} rx={2 + t * 9} ry={1 + t * 3} fill="none" stroke="#8D96A3" strokeWidth={1.4} opacity={Math.sin(Math.PI * t) * 0.45} />);
  }
  return <g>{out}</g>;
};
