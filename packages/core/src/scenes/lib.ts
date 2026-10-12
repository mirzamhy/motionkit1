// Everything reusable for hand-built scenes, in one import:  import { Film, Walker, Flag, Palm, rng } from './lib';
// Catalogue with signatures and usage: docs/scenes/KIT.md
export { Film, filmFrames, filmStarts, warped, type Sfx, type Shot, type Vo } from './film';
export { Cloud, Foliage, Palm, bump, lerp, n1, rad, rng } from './kit';
export { BLUE, CrowdRow, Flag, GOLD, MERAH_PUTIH, OUTFITS, OUTFITS_1954, UNAIR_BANDS, Walker, YELLOW, type Outfit } from './UnairParts';
export { HipRoof, Student, Vents } from './UnairScene';
export { inOut, outE, pop, prog, typed } from '../engine/util';
