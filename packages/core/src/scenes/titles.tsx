// Title overlays for narrative films, drawn in SVG so a shot's `draw` can include them. Ideas from
// reactvideoeditor/remotion-templates (MIT): lower-third (accent line, then bar, then text), chapter-title,
// letterbox-reveal. Those are fixed demos; these take content and a style, use the beat clock `u`, and exit faster
// than they enter.
import React from 'react';
import { inOut, outE, prog } from './motion';

export type TitleStyle = 'modern' | 'arsip';
const INK = { modern: { bar: 'rgba(16,18,20,0.86)', accent: '#F2C14E', text: '#F6F1E6', sub: '#C9C2B2' }, arsip: { bar: '#EFE4C8', accent: '#8C2F1E', text: '#2A2118', sub: '#5E4E3A' } };

/** name and role in the lower left: accent line, then the bar slides in, then the text; out over 10 frames */
export const LowerThird: React.FC<{ u: number; at: number; until: number; name: string; role?: string; W: number; H: number; style?: TitleStyle; font?: string; side?: 'left' | 'right' }> = ({ u, at, until, name, role, W, H, style = 'modern', font = 'Inter, sans-serif', side = 'left' }) => {
  if (u < at || u > until + 12) return null;
  const c = INK[style], P = H > W;
  const line = prog(u, at, at + 16, outE), bar = prog(u, at + 5, at + 26, outE), txt = prog(u, at + 14, at + 30, outE);
  const out = prog(u, until, until + 10, inOut);
  const fs = P ? 54 : 46, y = P ? H - 520 : H - 250;
  // estimated text widths (no measuring in SVG): bold name ≈ 0.6 em per letter, spaced capitals ≈ 0.72 em
  const w = Math.max(name.length * fs * (style === 'arsip' ? 0.62 : 0.6), (role ?? '').length * fs * 0.52 * 0.72) + 64;
  // put the card beside the person it names: mirrored to the right edge when side is 'right'
  const x = side === 'right' ? W - (P ? 60 : 96) - w : P ? 60 : 96;
  const dir = side === 'right' ? -1 : 1;
  return (
    <g opacity={1 - out} transform={`translate(${(-40 * out * dir).toFixed(1)} 0)`}>
      <rect x={side === 'right' ? x + w - 180 * line : x} y={y - 10} width={180 * line} height={4} fill={c.accent} />
      <g transform={`translate(${(-60 * (1 - bar) * dir).toFixed(1)} 0)`} opacity={bar}>
        <rect x={x} y={y} width={w} height={role ? fs * 2.15 : fs * 1.45} fill={c.bar} rx={style === 'arsip' ? 2 : 6} />
        <rect x={x} y={y} width={6} height={role ? fs * 2.15 : fs * 1.45} fill={c.accent} />
        <text x={x + 30} y={y + fs * 1.05} fontFamily={style === 'arsip' ? "'Special Elite', monospace" : font} fontWeight={style === 'arsip' ? 400 : 700} fontSize={fs} fill={c.text} opacity={txt}>{name}</text>
        {role && <text x={x + 30} y={y + fs * 1.8} fontFamily={font} fontSize={fs * 0.52} letterSpacing="0.08em" fill={c.sub} opacity={txt}>{role.toUpperCase()}</text>}
      </g>
    </g>
  );
};

/** chapter card over a dimmed shot: number, rule that draws out, title; holds, then leaves quicker than it came */
export const ChapterCard: React.FC<{ u: number; at: number; until: number; n: string; title: string; W: number; H: number; style?: TitleStyle; font?: string }> = ({ u, at, until, n, title, W, H, style = 'modern', font = "'Libre Baskerville', Georgia, serif" }) => {
  if (u < at || u > until + 14) return null;
  const c = INK[style], P = H > W;
  const dim = prog(u, at, at + 18, inOut) * (1 - prog(u, until, until + 14, inOut));
  const num = prog(u, at + 6, at + 26, outE), rule = prog(u, at + 14, at + 40, outE), ttl = prog(u, at + 22, at + 44, outE);
  const cx = W / 2, cy = H / 2, fs = P ? 76 : 84;
  return (
    <g opacity={dim}>
      <rect width={W} height={H} fill={style === 'arsip' ? '#EFE4C8' : '#0E0F10'} opacity={style === 'arsip' ? 0.9 : 0.72} />
      <text x={cx} y={cy - fs * 0.9 + (1 - num) * 16} textAnchor="middle" fontFamily="'Special Elite', monospace" fontSize={fs * 0.38} letterSpacing="0.3em" fill={c.accent} opacity={num}>{n}</text>
      <rect x={cx - 160 * rule} y={cy - fs * 0.55} width={320 * rule} height={2} fill={c.accent} />
      <text x={cx} y={cy + fs * 0.45 + (1 - ttl) * 20} textAnchor="middle" fontFamily={font} fontSize={fs} fill={c.text} opacity={ttl}>{title}</text>
    </g>
  );
};

/** cinematic bars easing in to a target aspect (2.39:1 landscape, 3:4 portrait unless given) and out again */
export const Letterbox: React.FC<{ u: number; at: number; until?: number; W: number; H: number; aspect?: number }> = ({ u, at, until = Infinity, W, H, aspect = W > H ? 2.39 : 0.75 }) => {
  const k = prog(u, at, at + 30, inOut) * (1 - prog(u, until, until + 30, inOut));
  const bar = Math.max(0, (H - W / aspect) / 2) * k;
  if (bar <= 0.5) return null;
  return (
    <g>
      <rect width={W} height={bar} fill="#000" />
      <rect y={H - bar} width={W} height={bar} fill="#000" />
    </g>
  );
};
