// Tokoh utama teaser Jajan Dulu!: mahasiswa berkemeja hijau, digambar menghadap depan dalam ruang 1080×1920.
// Semua ekspresi dikendalikan angka 0-1 supaya bisa dianimasikan dari frame tanpa state.
import React from 'react';
import { lerp } from './kit';

export type Ekspresi = {
  /** 0 senyum santai, 1 kaget penuh (mata membesar, alis naik, mulut terbuka) */
  kaget: number;
  /** 0 tidak ada, 1 penuh: cahaya hangat dari bawah (kantong yang terbuka) */
  cahaya: number;
  /** -1..1 arah lirik mata horizontal */
  lirik?: number;
};

const KULIT = '#E3A982';
const KULIT_GELAP = '#C4865F';
const KULIT_TERANG = '#F3C7A1';
const RAMBUT = '#2E1D17';
const RAMBUT_TERANG = '#5A3A2C';
const KEMEJA = '#3E6B35';
const KEMEJA_GELAP = '#2C4F25';
const KAOS = '#F6EBDD';

// Kepala berpusat di (540, 760).
const KX = 540;
const KY = 760;

function Mata({ x, ry, lirik, cahaya }: { x: number; ry: number; lirik: number; cahaya: number }) {
  const id = `mata-${x}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={x} cy={KY + 10} rx={44} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={x} cy={KY + 10} rx={44} ry={ry} fill="#FFFDF8" />
      <g clipPath={`url(#${id})`}>
        <circle cx={x + lirik * 10} cy={KY + 12} r={27} fill="#4A2A1C" />
        <circle cx={x + lirik * 10} cy={KY + 12} r={27} fill="none" stroke="#2A160F" strokeWidth={4} />
        <circle cx={x + lirik * 10} cy={KY + 12} r={13} fill="#120907" />
        <circle cx={x + lirik * 10 - 9} cy={KY + 2} r={6.5} fill="#FFFFFF" />
        {/* pantulan hangat kantong di bagian bawah mata */}
        <ellipse cx={x + lirik * 10 + 6} cy={KY + 26} rx={9} ry={4} fill="#FFD38A" opacity={cahaya * 0.9} />
        {/* bayangan kelopak atas */}
        <ellipse cx={x} cy={KY + 10 - ry} rx={46} ry={10} fill="#000" opacity={0.12} />
      </g>
      {/* garis kelopak atas dan bulu mata */}
      <path
        d={`M${x - 46} ${KY + 10} Q ${x} ${KY + 10 - ry * 2.05} ${x + 46} ${KY + 10}`}
        fill="none"
        stroke={RAMBUT}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path d={`M${x + 40} ${KY + 4 - ry * 0.5} l 12 -8`} stroke={RAMBUT} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

function Mulut({ kaget }: { kaget: number }) {
  const lebar = lerp(46, 30, kaget);
  const buka = lerp(4, 38, kaget);
  const y = KY + 175;
  // Senyum: lengkung tipis. Kaget: oval terbuka dengan lidah.
  const senyum = `M${KX - lebar} ${y - 6} Q ${KX} ${y + 26 - kaget * 20} ${KX + lebar} ${y - 6}`;
  return (
    <g>
      <ellipse cx={KX} cy={y + buka * 0.3} rx={lebar} ry={buka} fill="#5C2620" opacity={Math.min(1, kaget * 2)} />
      <ellipse cx={KX} cy={y + buka * 0.85} rx={lebar * 0.65} ry={buka * 0.42} fill="#D9686F" opacity={Math.min(1, kaget * 2)} />
      <path d={senyum} fill="none" stroke="#7A3328" strokeWidth={8} strokeLinecap="round" opacity={1 - Math.min(1, kaget * 1.6)} />
    </g>
  );
}

export const Tokoh: React.FC<Ekspresi> = ({ kaget, cahaya, lirik = 0 }) => {
  const mataRy = lerp(24, 44, kaget);
  const alisY = lerp(0, -34, kaget);
  return (
    <g>
      <defs>
        <clipPath id="tk-kulit">
          <ellipse cx={KX} cy={KY} rx={215} ry={258} />
          <path d={`M${KX - 85} ${KY + 200} L ${KX + 85} ${KY + 200} L ${KX + 95} ${KY + 420} L ${KX - 95} ${KY + 420} Z`} />
        </clipPath>
        <radialGradient id="tk-cahaya" cx="540" cy="1330" r="760" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE2A6" stopOpacity="1" />
          <stop offset="0.45" stopColor="#FFC56E" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFB04D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tk-bayang-atas" x1="0" y1="500" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1A0D08" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1A0D08" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tk-kemeja" x1="0" y1="1150" x2="0" y2="1920" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={KEMEJA} />
          <stop offset="1" stopColor={KEMEJA_GELAP} />
        </linearGradient>
      </defs>

      {/* Bahu dan kemeja */}
      <path d="M40 1920 C 60 1420, 250 1230, 420 1185 L 660 1185 C 830 1230, 1020 1420, 1040 1920 Z" fill="url(#tk-kemeja)" />
      <path d="M440 1185 L 540 1340 L 640 1185 Z" fill={KAOS} />
      {/* kerah */}
      <path d="M420 1180 L 540 1340 L 470 1365 L 380 1225 Z" fill={KEMEJA} stroke={KEMEJA_GELAP} strokeWidth={4} />
      <path d="M660 1180 L 540 1340 L 610 1365 L 700 1225 Z" fill={KEMEJA} stroke={KEMEJA_GELAP} strokeWidth={4} />
      {/* jahitan bahu dan saku, supaya kemeja tidak datar */}
      <path d="M200 1400 C 260 1320, 330 1270, 400 1245" fill="none" stroke={KEMEJA_GELAP} strokeWidth={5} strokeDasharray="10 9" />
      <path d="M880 1400 C 820 1320, 750 1270, 680 1245" fill="none" stroke={KEMEJA_GELAP} strokeWidth={5} strokeDasharray="10 9" />

      {/* Leher */}
      <path d={`M${KX - 85} ${KY + 200} L ${KX + 85} ${KY + 200} L ${KX + 95} ${KY + 430} L ${KX - 95} ${KY + 430} Z`} fill={KULIT_GELAP} />

      {/* Telinga */}
      <ellipse cx={KX - 212} cy={KY + 30} rx={40} ry={58} fill={KULIT} />
      <ellipse cx={KX + 212} cy={KY + 30} rx={40} ry={58} fill={KULIT} />
      <ellipse cx={KX - 214} cy={KY + 32} rx={18} ry={32} fill={KULIT_GELAP} />
      <ellipse cx={KX + 214} cy={KY + 32} rx={18} ry={32} fill={KULIT_GELAP} />

      {/* Kepala: dasar, sisi bayangan, sorotan */}
      <ellipse cx={KX} cy={KY} rx={215} ry={258} fill={KULIT} />
      <ellipse cx={KX + 60} cy={KY + 40} rx={170} ry={225} fill={KULIT_GELAP} opacity={0.35} />
      <ellipse cx={KX - 70} cy={KY - 60} rx={110} ry={120} fill={KULIT_TERANG} opacity={0.45} />

      {/* Pipi */}
      <ellipse cx={KX - 130} cy={KY + 110} rx={48} ry={26} fill="#E9837A" opacity={0.35} />
      <ellipse cx={KX + 130} cy={KY + 110} rx={48} ry={26} fill="#E9837A" opacity={0.35} />

      {/* Mata dan alis */}
      <Mata x={KX - 92} ry={mataRy} lirik={lirik} cahaya={cahaya} />
      <Mata x={KX + 92} ry={mataRy} lirik={lirik} cahaya={cahaya} />
      <g transform={`translate(0 ${alisY})`}>
        <path d={`M${KX - 140} ${KY - 52} Q ${KX - 95} ${KY - 78 - kaget * 10} ${KX - 48} ${KY - 58}`} fill="none" stroke={RAMBUT} strokeWidth={15} strokeLinecap="round" />
        <path d={`M${KX + 140} ${KY - 52} Q ${KX + 95} ${KY - 78 - kaget * 10} ${KX + 48} ${KY - 58}`} fill="none" stroke={RAMBUT} strokeWidth={15} strokeLinecap="round" />
      </g>

      {/* Hidung */}
      <path d={`M${KX - 6} ${KY + 50} Q ${KX - 22} ${KY + 105} ${KX + 4} ${KY + 112} Q ${KX + 22} ${KY + 112} ${KX + 24} ${KY + 102}`} fill="none" stroke={KULIT_GELAP} strokeWidth={7} strokeLinecap="round" />

      <Mulut kaget={kaget} />

      {/* Rambut: massa utama, poni berjumbai, dan helai terang */}
      <path
        d={`M${KX - 232} ${KY + 10}
            C ${KX - 250} ${KY - 230}, ${KX - 120} ${KY - 330}, ${KX + 10} ${KY - 320}
            C ${KX + 170} ${KY - 315}, ${KX + 262} ${KY - 210}, ${KX + 232} ${KY + 20}
            L ${KX + 205} ${KY - 70}
            L ${KX + 150} ${KY - 120} L ${KX + 120} ${KY - 70} L ${KX + 70} ${KY - 135}
            L ${KX + 30} ${KY - 85} L ${KX - 20} ${KY - 150} L ${KX - 60} ${KY - 92}
            L ${KX - 110} ${KY - 140} L ${KX - 150} ${KY - 80} L ${KX - 200} ${KY - 110} Z`}
        fill={RAMBUT}
      />
      <path d={`M${KX - 150} ${KY - 230} C ${KX - 90} ${KY - 285}, ${KX + 10} ${KY - 290}, ${KX + 90} ${KY - 260}`} fill="none" stroke={RAMBUT_TERANG} strokeWidth={9} strokeLinecap="round" opacity={0.7} />
      <path d={`M${KX - 175} ${KY - 170} C ${KX - 130} ${KY - 220}, ${KX - 60} ${KY - 240}, ${KX - 10} ${KY - 230}`} fill="none" stroke={RAMBUT_TERANG} strokeWidth={6} strokeLinecap="round" opacity={0.5} />

      {/* Cahaya dari bawah: kulit bagian bawah menyala, ubun-ubun tetap gelap */}
      <g clipPath="url(#tk-kulit)">
        <rect x={0} y={400} width={1080} height={600} fill="url(#tk-bayang-atas)" opacity={cahaya * 0.8} />
        <rect x={0} y={400} width={1080} height={1000} fill="url(#tk-cahaya)" opacity={Math.min(1, cahaya * 1.15)} style={{ mixBlendMode: 'screen' }} />
        {/* sorotan langsung di bawah dagu, pipi bawah, dan ujung hidung */}
        <ellipse cx={KX} cy={KY + 235} rx={150} ry={60} fill="#FFE3A8" opacity={cahaya * 0.55} style={{ mixBlendMode: 'screen' }} />
        <ellipse cx={KX - 120} cy={KY + 150} rx={60} ry={40} fill="#FFD893" opacity={cahaya * 0.4} style={{ mixBlendMode: 'screen' }} />
        <ellipse cx={KX + 120} cy={KY + 150} rx={60} ry={40} fill="#FFD893" opacity={cahaya * 0.4} style={{ mixBlendMode: 'screen' }} />
        <ellipse cx={KX + 4} cy={KY + 112} rx={16} ry={8} fill="#FFE9C0" opacity={cahaya * 0.7} />
      </g>
      <path d="M40 1920 C 60 1420, 250 1230, 420 1185 L 660 1185 C 830 1230, 1020 1420, 1040 1920 Z" fill="url(#tk-cahaya)" opacity={cahaya * 0.5} style={{ mixBlendMode: 'screen' }} />
    </g>
  );
};

/** Dua tangan yang memegang sisi kantong, digambar di atas kanvas 3D. */
export const TanganMemegang: React.FC<{ cahaya: number; y: number }> = ({ cahaya, y }) => (
  <g>
    {[-1, 1].map((s) => {
      const x = 540 + s * 305;
      return (
        <g key={s} transform={`translate(${x} ${y}) scale(${s * 1.35} 1.35)`}>
          {/* lengan baju */}
          <path d="M60 210 C 70 120, 40 60, 10 30 L -40 60 C -20 110, -10 170, -6 230 Z" fill={KEMEJA_GELAP} />
          {/* telapak dan jari yang melingkari tepi kantong */}
          <path d="M-58 -40 C -70 -10, -60 40, -20 60 L 30 52 C 40 20, 38 -20, 20 -50 Z" fill={KULIT} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-74} y={-30 + i * 22} width={44} height={20} rx={10} fill={KULIT} stroke={KULIT_GELAP} strokeWidth={3} />
          ))}
          <path d="M14 -46 C 30 -60, 52 -54, 48 -30" fill="none" stroke={KULIT_GELAP} strokeWidth={4} />
          <path d="M-58 -40 C -70 -10, -60 40, -20 60 L 30 52 C 40 20, 38 -20, 20 -50 Z" fill="#FFD9A0" opacity={cahaya * 0.55} style={{ mixBlendMode: 'screen' }} />
        </g>
      );
    })}
  </g>
);
