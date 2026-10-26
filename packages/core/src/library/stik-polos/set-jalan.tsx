import React from 'react';
import { C, ColdLines, Limb, Wheel } from '../../styles/stik-polos/kit';

export { C, CURB, GROUND } from '../../styles/stik-polos/kit';

type Pal = Partial<typeof C>;

/** Delivery scooter with its box, no rider. bbox ≈ x 33–250, y 696–882 */
export const MotorOjol: React.FC<{ pal?: Pal; spin?: number }> = ({ pal = {}, spin = 0 }) => {
  const p = { ...C, ...pal };
  return (
    <g>
      {/* rack under the box */}
      <path d="M52 760 L52 796 L92 796 L92 760 Z" fill={C.carDark} stroke={C.out} strokeWidth={3.5} strokeLinejoin="round" />
      {/* box */}
      <rect x={35} y={698} width={74} height={64} rx={7} fill={p.box} stroke={C.out} strokeWidth={4} />
      <line x1={39} y1={718} x2={105} y2={718} stroke={C.out} strokeWidth={2.5} opacity={0.6} />
      {/* scooter body */}
      <path
        d="M48 846 Q42 798 88 790 L142 790 Q160 792 162 815 L170 836 L192 836 L200 760 L210 742 L222 746 L224 792 Q250 810 247 846 Z"
        fill={p.scooter}
        stroke={C.out}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M212 742 L190 732" stroke={C.out} strokeWidth={6} strokeLinecap="round" />
      <Wheel x={76} y={854} r={25} spin={spin} />
      <Wheel x={222} y={854} r={25} spin={spin} />
    </g>
  );
};

/** Delivery rider on a scooter. bbox ≈ x 33–250, y 605–885 */
export const Ojol: React.FC<{ frame: number; pal?: Pal; spin?: number; lean?: number; cold?: boolean }> = ({
  frame, pal = {}, spin = 0, lean = 0, cold = true,
}) => {
  const p = { ...C, ...pal };
  const bob = Math.sin(frame * 0.45) * 1.2;
  return (
    <g>
      <MotorOjol pal={pal} spin={spin} />
      {/* rider */}
      <g transform={`translate(0 ${bob}) rotate(${lean} 130 790)`}>
        <Limb d="M128 772 Q118 822 128 880" w={13} c={p.cream} />
        <Limb d="M128 772 L162 798 L160 838" w={13} c={p.cream} />
        <Limb d="M140 688 L128 774" w={17} c={p.cream} />
        <Limb d="M138 702 Q164 734 192 734" w={11} c={p.cream} />
        <circle cx={140} cy={652} r={31} fill={p.cream} stroke={C.out} strokeWidth={4} />
        <path d="M150 636 Q176 636 172 660 Q168 668 150 666 Z" fill="#1A1F28" stroke={C.out} strokeWidth={3} />
        <path d="M112 640 Q130 622 156 628" stroke={C.out} strokeWidth={2.5} fill="none" opacity={0.55} />
      </g>
      {cold && <ColdLines x={140} y={605 + bob} frame={frame} />}
    </g>
  );
};

/** Car with stressed driver holding a bill. bbox ≈ x 296–720, y 660–882 */
export const Car: React.FC<{ frame: number; spin?: number }> = ({ frame, spin = 0 }) => {
  const bob = Math.sin(frame * 0.4 + 1) * 1;
  return (
    <g>
      <path
        d="M300 848 L300 774 Q302 758 320 755 L352 752 L392 672 Q398 662 412 662 L560 662 Q575 662 585 672 L650 748 L700 756 Q716 760 716 778 L716 848 Z"
        fill={C.car}
        stroke={C.out}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M364 750 L400 680 L468 680 L468 750 Z" fill={C.glassDark} stroke={C.out} strokeWidth={3} strokeLinejoin="round" />
      <path d="M482 750 L482 680 L563 680 Q571 680 577 688 L628 750 Z" fill={C.glassDark} stroke={C.out} strokeWidth={3} strokeLinejoin="round" />
      {/* driver */}
      <g transform={`translate(0 ${bob})`}>
        <Limb d="M520 738 L556 748 L588 728" w={9} c={C.head} />
        <circle cx={520} cy={712} r={22} fill={C.head} stroke={C.out} strokeWidth={3.5} />
      </g>
      <line x1={600} y1={712} x2={612} y2={748} stroke={C.out} strokeWidth={4} strokeLinecap="round" />
      {/* bill */}
      <g transform="translate(590 712) rotate(-18)">
        <rect x={-4} y={-6} width={38} height={28} rx={2} fill="#ECEAE3" stroke={C.out} strokeWidth={2.5} />
        <line x1={2} y1={2} x2={26} y2={2} stroke={C.out} strokeWidth={1.5} />
        <line x1={2} y1={8} x2={26} y2={8} stroke={C.out} strokeWidth={1.5} />
        <line x1={2} y1={14} x2={18} y2={14} stroke={C.out} strokeWidth={1.5} />
      </g>
      <line x1={475} y1={756} x2={475} y2={842} stroke={C.out} strokeWidth={2.5} />
      <rect x={430} y={772} width={22} height={5} rx={2} fill={C.out} opacity={0.7} />
      <rect x={530} y={772} width={22} height={5} rx={2} fill={C.out} opacity={0.7} />
      <rect x={296} y={768} width={10} height={24} rx={2} fill="#E0403A" stroke={C.out} strokeWidth={2} />
      <rect x={710} y={780} width={9} height={14} rx={2} fill="#F0EEE5" stroke={C.out} strokeWidth={2} />
      <Wheel x={380} y={838} r={42} spin={spin} />
      <Wheel x={630} y={838} r={42} spin={spin} />
    </g>
  );
};

/** Couple + child on a scooter under one poncho. bbox ≈ x 776–975, y 655–882 */
export const Couple: React.FC<{ frame: number; spin?: number; cold?: boolean }> = ({ frame, spin = 0, cold = true }) => {
  const bob = Math.sin(frame * 0.5 + 2) * 1.2;
  return (
    <g>
      <path
        d="M790 860 Q788 828 822 826 L900 826 L928 800 L944 788 L956 798 L960 830 Q976 842 972 862 Z"
        fill={C.scooterBeige}
        stroke={C.out}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <rect x={930} y={806} width={34} height={42} rx={5} fill="#B5A58F" stroke={C.out} strokeWidth={3} />
      <path d="M948 790 L958 766" stroke={C.out} strokeWidth={4} strokeLinecap="round" />
      <circle cx={960} cy={762} r={5} fill={C.hub} stroke={C.out} strokeWidth={2.5} />
      <Wheel x={815} y={857} r={23} spin={spin} />
      <Wheel x={950} y={857} r={23} spin={spin} />
      <g transform={`translate(0 ${bob})`}>
        <Limb d="M872 828 L876 878" w={11} c={C.body} />
        <path
          d="M778 714 Q800 700 842 708 L905 706 Q926 708 923 730 L918 832 Q860 846 790 820 Q772 762 778 714 Z"
          fill={C.poncho}
          stroke={C.out}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d="M800 730 Q812 780 806 812 M850 724 Q858 776 852 826 M890 726 L884 760" stroke={C.ponchoHi} strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={805} cy={690} r={26} fill={C.head} stroke={C.out} strokeWidth={3.5} />
        <circle cx={870} cy={684} r={27} fill={C.head} stroke={C.out} strokeWidth={3.5} />
        <circle cx={902} cy={728} r={15} fill="#B7BEC7" stroke={C.out} strokeWidth={3} />
      </g>
      {cold && (
        <>
          <ColdLines x={800} y={648 + bob} frame={frame + 2} />
          <ColdLines x={872} y={642 + bob} frame={frame} />
        </>
      )}
    </g>
  );
};

/** Man sitting on a bench with a coffee. bbox ≈ x 1085–1255, y 600–795 */
export const KioskGuy: React.FC<{ frame: number; bench?: boolean }> = ({ frame, bench = true }) => {
  const sip = Math.sin(frame * 0.12) * 2;
  return (
    <g>
      {bench && (
        <g>
          <rect x={1108} y={734} width={140} height={14} rx={3} fill="#5A4638" stroke={C.out} strokeWidth={3} />
          <line x1={1122} y1={748} x2={1122} y2={792} stroke={C.out} strokeWidth={5} />
          <line x1={1234} y1={748} x2={1234} y2={792} stroke={C.out} strokeWidth={5} />
        </g>
      )}
      <Limb d="M1172 734 L1122 744 L1100 790" w={13} c={C.body} />
      <Limb d="M1172 734 L1132 752 L1118 792" w={13} c={C.body} />
      <Limb d="M1182 660 L1172 736" w={16} c={C.body} />
      <Limb d="M1196 668 Q1214 712 1200 732" w={10} c={C.body} />
      <Limb d={`M1178 674 L1150 ${700 + sip} L1146 ${684 + sip}`} w={10} c={C.body} />
      <g transform={`translate(0 ${sip})`}>
        <path d="M1132 664 L1156 664 L1153 690 L1135 690 Z" fill="#E7E3DA" stroke={C.out} strokeWidth={2.5} />
        <rect x={1134} y={666} width={20} height={5} fill="#6B4A33" />
      </g>
      <circle cx={1186} cy={634} r={25} fill={C.head} stroke={C.out} strokeWidth={3.5} />
    </g>
  );
};

/** Traffic light on its pole. `red` 1 = red, 0 = green; cross-fade it, never switch in one frame. bbox ≈ x 985–1027, y 409–800 */
export const LampuLaluLintas: React.FC<{ red: number }> = ({ red }) => (
  <g>
      <rect x={1003} y={512} width={7} height={288} fill="#2F343C" stroke={C.out} strokeWidth={2} />
      <rect x={985} y={409} width={42} height={104} rx={8} fill="#1E2228" stroke={C.out} strokeWidth={3} />
      <circle cx={1006} cy={432} r={22} fill={C.red} opacity={0.25 * red} />
      <circle cx={1006} cy={490} r={22} fill={C.green} opacity={0.25 * (1 - red)} />
      <circle cx={1006} cy={432} r={12} fill="#4A2A28" stroke={C.out} strokeWidth={2} />
      <circle cx={1006} cy={432} r={10.5} fill={C.red} opacity={red} />
      <circle cx={1006} cy={461} r={12} fill="#4A3F22" stroke={C.out} strokeWidth={2} />
      <circle cx={1006} cy={490} r={12} fill="#1F3A26" stroke={C.out} strokeWidth={2} />
      <circle cx={1006} cy={490} r={10.5} fill={C.green} opacity={1 - red} />
  </g>
);

/** Hospital building with the patient window. x 755–1215, y -55–800 */
/** `red` 1 = red light, 0 = green; cross-fade it, never switch in one frame */
export const Hospital: React.FC<{ frame: number; red: number; glow: number; font: string }> = ({ frame, red, glow, font }) => {
  const breathe = Math.sin(frame * 0.1) * 1.2;
  const wins: [number, number, number, number][] = [
    [1078, 32, 108, 94], [1078, 199, 108, 93], [1078, 363, 108, 94], [801, 386, 111, 81], [801, 526, 111, 96], [801, 30, 111, 100],
  ];
  return (
    <g>
      <rect x={755} y={-55} width={460} height={855} fill={C.building} stroke={C.out} strokeWidth={4} />
      {[140, 480, 660].map((y) => (
        <line key={y} x1={757} y1={y} x2={1213} y2={y} stroke={C.buildingLine} strokeWidth={3} />
      ))}
      {wins.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={3} fill={C.winDark} stroke={C.out} strokeWidth={3} />
      ))}
      {/* sign */}
      <rect x={858} y={-42} width={252} height={40} rx={7} fill={C.sign} stroke={C.out} strokeWidth={3} />
      <path d="M876 -22 h20 M886 -32 v20" stroke={C.teal} strokeWidth={7} />
      <text x={994} y={-15} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={19} fill="#252A31" letterSpacing={0.5}>
        RUMAH SAKIT
      </text>
      {/* patient window */}
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.glassTop} />
          <stop offset="1" stopColor={C.glassBot} />
        </linearGradient>
        <clipPath id="winClip">
          <rect x={797} y={171} width={261} height={186} />
        </clipPath>
      </defs>
      <rect x={795} y={169} width={265} height={190} fill="url(#glass)" stroke={C.out} strokeWidth={5} />
      <g clipPath="url(#winClip)">
        <rect x={797} y={171} width={261} height={186} fill="#FFE27A" opacity={glow * 0.18} />
        <line x1={1046} y1={212} x2={1046} y2={352} stroke={C.out} strokeWidth={9} />
        <line x1={1046} y1={212} x2={1046} y2={352} stroke="#E6E8EA" strokeWidth={4} />
        <rect x={1035} y={204} width={22} height={30} rx={4} fill="#F0F2F4" stroke={C.out} strokeWidth={2.5} />
        <path d="M1046 234 Q1030 285 990 292" stroke="#E6E8EA" strokeWidth={2} fill="none" />
        <rect x={812} y={302} width={214} height={60} rx={4} fill="#E9EBEE" stroke={C.out} strokeWidth={3} />
        <g transform={`translate(0 ${breathe})`}>
          <Limb d="M958 302 L980 266" w={15} c={C.head} />
          <Limb d="M974 282 Q958 300 938 300" w={10} c={C.head} />
          <circle cx={984} cy={250} r={25} fill={C.head} stroke={C.out} strokeWidth={3.5} />
        </g>
        <rect x={818} y={278} width={150} height={32} rx={15} fill="#8EA6C4" stroke={C.out} strokeWidth={3} />
      </g>
      <line x1={905} y1={169} x2={905} y2={359} stroke={C.out} strokeWidth={5} />
      <rect x={785} y={358} width={285} height={11} fill="#3A404A" stroke={C.out} strokeWidth={3} />
      <LampuLaluLintas red={red} />
    </g>
  );
};

/** Coffee stall with striped awning. x 1030–1318, y 512–792 */
export const Kiosk: React.FC<{ frame: number; penjual?: boolean }> = ({ frame, penjual = true }) => {
  const n = 7;
  const x0 = 1030, x1 = 1318, top0 = 1046, top1 = 1302, yTop = 514, yBot = 562;
  const sw = (x1 - x0) / n;
  const tw = (top1 - top0) / n;
  const jars = ['#8C9A9E', '#A0816C', '#6F8C80', '#B1A27F', '#8C9A9E', '#A0816C'];
  return (
    <g>
      <rect x={1075} y={582} width={202} height={210} fill={C.kiosk} stroke={C.out} strokeWidth={4} />
      {[624, 668].map((y) => (
        <line key={y} x1={1079} y1={y} x2={1273} y2={y} stroke={C.kioskDark} strokeWidth={5} />
      ))}
      {jars.map((c, i) => (
        <rect key={i} x={1088 + i * 30} y={i % 2 ? 604 : 600} width={16} height={i % 2 ? 20 : 24} rx={3} fill={c} stroke={C.out} strokeWidth={2} />
      ))}
      {jars.slice(0, 5).map((c, i) => (
        <rect key={'b' + i} x={1100 + i * 34} y={646} width={18} height={22} rx={3} fill={c} stroke={C.out} strokeWidth={2} />
      ))}
      {penjual && <KioskGuy frame={frame} />}
      {Array.from({ length: n }).map((_, i) => {
        const col = i % 2 ? C.awningBlue : C.awningLight;
        const a = top0 + i * tw, b = top0 + (i + 1) * tw, c = x0 + (i + 1) * sw, d = x0 + i * sw;
        return (
          <g key={i}>
            <path d={`M${a} ${yTop} L${b} ${yTop} L${c} ${yBot} L${d} ${yBot} Z`} fill={col} />
            <path d={`M${d} ${yBot} A${sw / 2} ${sw / 2.4} 0 0 0 ${c} ${yBot} Z`} fill={col} />
          </g>
        );
      })}
      <path
        d={`M${top0} ${yTop} L${top1} ${yTop} L${x1} ${yBot} ${Array.from({ length: n })
          .map((_, i) => {
            const d = x1 - (i + 1) * sw;
            return `A${sw / 2} ${sw / 2.4} 0 0 1 ${d} ${yBot}`;
          })
          .join(' ')} Z`}
        fill="none"
        stroke={C.out}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <rect x={1300} y={642} width={16} height={16} rx={2} fill="#C7CDD2" stroke={C.out} strokeWidth={2} />
    </g>
  );
};
