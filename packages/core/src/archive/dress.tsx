// Set dressing for the archive engine: everything that makes a sheet read as a filed document instead of a blank
// card (file header, folio, punch holes, ruled lines, tape / paper clip, aged edge) and the desk it lies on (lamp
// light, manila folder, index card, photo, coffee ring, pencil). All of it is static per sheet — only the header
// types on — so it adds detail without adding frame-to-frame noise.
import React from 'react';
import { typed } from '../engine/util';
import type { KPal } from '../kinetic/renderers';

type Box = { w: number; h: number; cx: number; cy: number; pad: number };
type Fonts = { mono: string; ui: string; disp: string };

export const PAPER_TINTS = ['#EFE6D3', '#F3ECDD', '#EADFC8', '#EFE4CF', '#F1E8D6'];
const HALFTONE = 'radial-gradient(rgba(31,26,20,0.22) 1.6px, transparent 1.8px) 0 0 / 9px 9px';

/** printed chrome on the paper itself — goes inside the clipped card, under the widget */
export const SheetChrome: React.FC<{ S: Box; P: boolean; pal: KPal; f: Fonts; index: number; count: number; label: string; date?: string; source?: string; t: number; at: number }> = ({ S, P, pal, f, index, count, label, date, source, t, at }) => {
  const small = { fontFamily: f.mono, fontWeight: 500, fontSize: P ? 19 : 17, letterSpacing: '0.16em', color: pal.muted, whiteSpace: 'nowrap' as const };
  const no = String(index + 1).padStart(2, '0');
  const x0 = P ? 74 : 86;
  return (
    <>
      {/* ruled lines + margin line */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg, transparent 0 45px, rgba(31,26,20,0.045) 45px 46px)' }} />
      <div style={{ position: 'absolute', left: x0 - 22, top: 0, bottom: 0, width: 2, background: 'rgba(185,28,28,0.16)' }} />
      {/* aged edge */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 90px rgba(120,82,30,0.2), inset 0 0 6px rgba(120,82,30,0.35)' }} />
      {/* punch holes */}
      {[0.28, 0.72].map((y) => (
        <div key={y} style={{ position: 'absolute', left: P ? 20 : 24, top: S.h * y - 12, width: 24, height: 24, borderRadius: 12, background: '#17120D', boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.5)' }} />
      ))}
      {/* file header */}
      <div style={{ position: 'absolute', left: x0, right: P ? 40 : 52, top: P ? 22 : 24, display: 'flex', justifyContent: 'space-between', ...small }}>
        <span>{typed(`BERKAS ${no}/${String(count).padStart(2, '0')} · ${label.toUpperCase()}`, t, at - 20, 1.4)}</span>
        <span style={{ color: pal.hot }}>{date ? typed(date.toUpperCase(), t, at - 8, 1.2) : ''}</span>
      </div>
      <div style={{ position: 'absolute', left: x0, right: P ? 40 : 52, top: P ? 54 : 54, height: 1, background: pal.line }} />
      {/* footer: source + folio */}
      <div style={{ position: 'absolute', left: x0, right: P ? 40 : 52, bottom: P ? 46 : 44, height: 1, background: pal.line }} />
      <div style={{ position: 'absolute', left: x0, right: P ? 40 : 52, bottom: P ? 18 : 18, display: 'flex', justifyContent: 'space-between', ...small, fontSize: P ? 17 : 15 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'clip', maxWidth: '78%' }}>{source ? `SUMBER · ${source.toUpperCase()}` : ''}</span>
        <span>HAL. {no}</span>
      </div>
      {/* a registration cross + halftone swatch in the corner, like a proof sheet */}
      <div style={{ position: 'absolute', right: P ? 40 : 52, bottom: P ? 64 : 62, width: P ? 74 : 66, height: P ? 30 : 26, background: HALFTONE, opacity: 0.8 }} />
    </>
  );
};

/** things attached to the sheet that overhang its edge — sibling of the clipped card */
export const SheetAttach: React.FC<{ S: Box; P: boolean; index: number; hot: string }> = ({ S, P, index, hot }) => {
  const kind = index % 3;
  if (kind === 0)
    // masking tape across the top edge
    return <div style={{ position: 'absolute', left: S.w * 0.5 - 95, top: -22, width: 190, height: 46, background: 'rgba(226,205,150,0.82)', boxShadow: '0 3px 6px rgba(0,0,0,0.25)', transform: 'rotate(-2.4deg)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 3px, transparent 3px 7px)' }} />;
  if (kind === 1)
    // paper clip on the top-left
    return (
      <svg width={54} height={120} viewBox="0 0 54 120" style={{ position: 'absolute', left: S.w * 0.6, top: -34, transform: 'rotate(6deg)', overflow: 'visible' }}>
        <path d="M 14 100 L 14 26 C 14 6, 42 6, 42 26 L 42 92 C 42 106, 24 106, 24 92 L 24 34" fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" transform="translate(2,3)" />
        <path d="M 14 100 L 14 26 C 14 6, 42 6, 42 26 L 42 92 C 42 106, 24 106, 24 92 L 24 34" fill="none" stroke="#B9BDC4" strokeWidth={5} strokeLinecap="round" />
      </svg>
    );
  // a coloured index tab on the right edge
  return (
    <div style={{ position: 'absolute', right: -26, top: S.h * 0.16, width: 44, height: 120, background: hot, borderRadius: '0 8px 8px 0', boxShadow: '0 4px 8px rgba(0,0,0,0.35)', opacity: 0.92 }} />
  );
};

/** the desk under the pile (inside the camera layer, so it drifts with the paper) */
export const DeskProps: React.FC<{ S: Box; P: boolean; f: Fonts; hot: string; label: string }> = ({ S, P, f, hot, label }) => {
  const L = S.cx - S.w / 2;
  const T = S.cy - S.h / 2;
  const R = L + S.w;
  const B = T + S.h;
  return (
    <>
      {/* cutting-mat grid */}
      <div style={{ position: 'absolute', inset: -200, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      {/* coffee ring */}
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ position: 'absolute', left: P ? L + 30 : L - 190, top: P ? B + 60 : B - 250, opacity: 0.4 }}>
        <circle cx={110} cy={110} r={92} fill="none" stroke="#6B4A2A" strokeWidth={7} strokeDasharray="420 30 80 48" />
        <circle cx={110} cy={110} r={84} fill="none" stroke="#6B4A2A" strokeWidth={1.5} opacity={0.6} />
      </svg>
      {/* manila folder with a labelled tab */}
      <div style={{ position: 'absolute', left: L - 70, top: T - 62, width: S.w + 120, height: S.h + 100, transform: 'rotate(-1.6deg)', transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', left: 60, top: -44, width: P ? 360 : 400, height: 60, background: '#C39A5B', borderRadius: '10px 10px 0 0', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', paddingLeft: 22, boxSizing: 'border-box', fontFamily: f.mono, fontWeight: 600, fontSize: 20, letterSpacing: '0.16em', color: 'rgba(40,26,10,0.8)', whiteSpace: 'nowrap', overflow: 'hidden' }}>{label.toUpperCase()}</div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #CBA263, #B78C4E)', borderRadius: 8, boxShadow: '0 50px 90px -30px rgba(0,0,0,0.85), inset 0 0 60px rgba(90,58,20,0.35)' }} />
      </div>
      {/* photo print peeking out top-right */}
      <div style={{ position: 'absolute', left: R - (P ? 250 : 190), top: T - (P ? 150 : 96), width: 290, height: 250, background: '#F6F1E6', padding: 14, boxSizing: 'border-box', transform: 'rotate(7deg)', boxShadow: '0 16px 30px -12px rgba(0,0,0,0.7)' }}>
        <div style={{ width: '100%', height: 176, background: `linear-gradient(140deg, #3A3128, #6E5E4C), ${HALFTONE}`, backgroundBlendMode: 'multiply' }} />
        <div style={{ marginTop: 10, height: 6, width: '60%', background: 'rgba(31,26,20,0.25)' }} />
      </div>
      {/* index card peeking out bottom-left */}
      <div style={{ position: 'absolute', left: L - (P ? 20 : 150), top: B - (P ? 70 : 190), width: 380, height: 240, background: '#F7F3EA', transform: 'rotate(-7deg)', boxShadow: '0 16px 30px -12px rgba(0,0,0,0.7)', backgroundImage: 'linear-gradient(180deg, transparent 0 46px, rgba(185,28,28,0.45) 46px 48px, transparent 48px), repeating-linear-gradient(180deg, transparent 0 31px, rgba(40,90,160,0.22) 31px 32px)' }}>
        <div style={{ position: 'absolute', left: 20, top: 12, fontFamily: f.mono, fontWeight: 600, fontSize: 18, letterSpacing: '0.14em', color: 'rgba(31,26,20,0.7)' }}>CATATAN</div>
      </div>
      {/* pencil */}
      <div style={{ position: 'absolute', left: P ? R - 420 : R + 40, top: P ? B + 90 : T + 240, width: P ? 420 : 22, height: P ? 22 : 420, transform: `rotate(${P ? -4 : 5}deg)`, borderRadius: 4, background: P ? `linear-gradient(90deg, #2A2018 0 6%, #E9D9B8 6% 12%, ${hot} 12% 90%, #B9BDC4 90% 94%, #D98A8A 94%)` : `linear-gradient(180deg, #2A2018 0 6%, #E9D9B8 6% 12%, ${hot} 12% 90%, #B9BDC4 90% 94%, #D98A8A 94%)`, boxShadow: '6px 10px 14px rgba(0,0,0,0.55)' }} />
    </>
  );
};

/** warm lamp light + vignette over the whole desk (outside the camera layer) */
export const DeskLight: React.FC = () => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 80% at 28% 18%, rgba(255,196,120,0.16), transparent 62%)', mixBlendMode: 'screen' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(85% 85% at 50% 48%, transparent 55%, rgba(0,0,0,0.6) 100%)' }} />
  </>
);
