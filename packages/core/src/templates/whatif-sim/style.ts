// "What-if simulation" style tokens. One serif family, a red countdown, gold for "nothing happened", navy dips.
// Measured from the simulif.world reference; see README.md for the full style DNA.
import { loadFont } from '@remotion/google-fonts/EBGaramond';

const { fontFamily } = loadFont('normal', { weights: ['400', '500', '700'], subsets: ['latin'] });
loadFont('italic', { weights: ['400'], subsets: ['latin'] });

export const SERIF = fontFamily;

export const C = {
  white: '#F4F1EA', // HUD, captions
  red: '#E5452E', // countdown while the event runs, RESULT stamps, key word in titles
  gold: '#E2B04A', // "nothing" stamps, highlights, leaderboard results
  navy: '#11223A', // chapter dips (never pure black inside a chapter)
  fog: '#b4bdc7', // 3D fog = CSS horizon colour
} as const;

export const SHADOW = '0 2px 14px rgba(0,0,0,0.45)';

/** Portrait 1080x1920 at 30 fps. All positions below are in that space. */
export const FRAME = { width: 1080, height: 1920, fps: 30 } as const;

export const HUD_POS = { left: 72, top: 332 } as const;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
