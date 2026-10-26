// Frame numbers (30 fps) measured from the reference video. See BREAKDOWN.md.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const F = {
  // --- Scenes 1-5: park, countdown, gravity off ---
  cutClose: 270, // wide -> close on the character
  cutPov: 285, // close -> first-person
  off: 411, // gravity switches off
  gravStat: 414, // GRAVITY stat appears
  scaleStat: 480, // YOUR SCALE stat appears
  cutWide2: 495, // POV -> low wide shot
  stamp: 544, // "YOU FEEL NOTHING" slam
  fadeOut: 576, // HUD stats + stamp start fading

  // --- Scene 6: the myth (timer paused) ---
  freeze: 598, // timer reaches 4.750 and pauses
  myth: 603, // myth shot is under the dip from here
  mythScale: 690, // YOUR SCALE 0.0 kg (imagined)
  mythStamp: 822, // RESULT: MYTH
  mythExit: 850,
  resume: 870, // timer runs again (25x slowed)

  // --- Scene 7: Earth cross-section (2D) ---
  earth: 880, // 3D world unmounts, diagram takes over
  earthRest: 930, // zoom-out finished
  pressure: 1020, // PRESSURE stat starts counting
  pressureFull: 1080,
  flip: 1145, // shock ring leaves the core, arrows flip outward
  flipEnd: 1200,

  // --- Scene 8: push = pull ---
  pushZoom: 1240,
  pushZoomEnd: 1254,
  pushStat: 1245,
  chapterEnd: 1335, // dip to black

  // --- Scene 9: the Moon ---
  space: 1352, // space scene mounts under the black dip
  moonStat: 1410,
  straightLine: 1420, // red tangent line draws in
  offCourseStat: 1525,
  moonZoom: 1530,
  moonZoomEnd: 1551,
  offCourseLabel: 1545,

  // --- Scene 10: ISS ---
  iss: 1616, // under a short black crossfade
  issStamp: 1722,
  spaceEnd: 1752,

  // --- Scene 11: ground rising ---
  ground: 1776,
  groundSlow: 1785, // timer switches to SLOWED 3.7x
  risingStat: 1950,
  groundEnd: 2145,
  backTo25: 2150,

  // --- Scene 12: Earth rings like a bell ---
  ring: 2166, // globe mounts under the black dip
  comesBack: 2232, // timer hits zero: SINCE GRAVITY CAME BACK
  groundSpeedStat: 2250,
  swell: 2400,
  swing: 2500,
  ringStamp: 2610,
  ringExit: 2640,

  // --- Scene 13: bathroom scale ---
  scale: 2664,
  swingKg: 2785,
  cutLow: 2797, // close on the scale -> low angle full body
  cutDog: 2817, // -> wider shot, dog jumps at camera
  scaleEnd: 2872,

  // --- Scene 14-15: recap + CTA, then back to the opening shot ---
  recap: 2880,
  rowsIn: 2905,
  focusYou: 2970,
  rowsOut: 3045,
  cta: 3060,
  youOut: 3125,
  returnStart: 3130,
  end: 3180,
} as const;

export type Shot =
  | 'wide'
  | 'close'
  | 'pov'
  | 'wide2'
  | 'myth'
  | 'none'
  | 'scale1'
  | 'scale2'
  | 'scale3'
  | 'recap';

export const shotAt = (f: number): Shot => {
  if (f < F.cutClose) return 'wide';
  if (f < F.cutPov) return 'close';
  if (f < F.cutWide2) return 'pov';
  if (f < F.myth) return 'wide2';
  if (f < F.earth) return 'myth';
  if (f < F.scale) return 'none';
  if (f < F.cutLow) return 'scale1';
  if (f < F.cutDog) return 'scale2';
  if (f < F.recap) return 'scale3';
  return 'recap';
};

/* ---------- After gravity returns: simulated clock, swell and scale reading ---------- */

// [video second, simulated seconds since gravity came back] read off the reference HUD.
const LAPSE: [number, number][] = [
  [74.4, 0], [80.0, 28], [80.5, 127], [83.5, 795], [88.0, 3853], [88.3, 4057],
  [89.5, 4503], [92.0, 5116], [93.5, 5648], [94.5, 6019], [95.8, 6474],
];

export const elapsedAt = (f: number) => {
  const s = f / FPS;
  if (s <= LAPSE[0][0]) return 0;
  for (let i = 1; i < LAPSE.length; i++) {
    const [s1, e1] = LAPSE[i];
    if (s <= s1) {
      const [s0, e0] = LAPSE[i - 1];
      return e0 + ((s - s0) / (s1 - s0)) * (e1 - e0);
    }
  }
  return LAPSE[LAPSE.length - 1][1];
};

export const lapseRate = (f: number) => {
  const s = f / FPS;
  if (s < 80) return 5;
  if (s < 83.2) return 180;
  if (s < 88.4) return 680;
  if (s < 93) return 250;
  if (s < 94.3) return 400;
  return 350;
};

/** One planet "swing" lasts 20.5 min. +1 = swollen outward, -1 = sunk inward. */
export const swingAt = (f: number) => Math.sin((2 * Math.PI * elapsedAt(f)) / 1230);
export const swellKm = (f: number) => 8 * swingAt(f);
/** Out = farther from the centre = lighter. */
export const weightKg = (f: number) => 70 - 1.5 * swingAt(f);

// World clock: real time until gravity is off, then 25x slow motion.
export const worldTime = (f: number) =>
  f < F.off ? f / FPS : F.off / FPS + (f - F.off) / FPS / 25;

/** Countdown value shown in the HUD, in seconds. */
export const timerAt = (f: number) => {
  if (f < F.off) return (13.18 * (F.off - f)) / F.off; // real time
  if (f < F.freeze) return 5 - (f - F.off) / FPS / 25; // slowed 25x
  if (f < F.resume) return 4.75; // paused for the myth
  if (f < F.groundSlow) return 4.75 - (f - F.resume) / FPS / 25;
  const g = 3.408 - (f - F.groundSlow) / FPS / 3.7; // ground scene runs faster
  if (f < F.backTo25) return g;
  return 3.408 - (F.backTo25 - F.groundSlow) / FPS / 3.7 - (f - F.backTo25) / FPS / 25;
};

export const slowLabel = (f: number) => (f >= F.groundSlow && f < F.backTo25 ? 'Slowed 3.7×' : 'Slowed 25×');

/** Metres the ground has risen in scene 11 (keyframes read off the reference HUD). */
const RISE_S = [59.5, 60.5, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72];
const RISE_M = [14, 17, 25, 31, 38, 46, 54, 63, 72, 84, 95, 107, 119];
export const riseAt = (f: number) => {
  const s = f / FPS;
  if (s <= RISE_S[0]) return RISE_M[0];
  for (let i = 1; i < RISE_S.length; i++) {
    if (s <= RISE_S[i]) {
      const k = (s - RISE_S[i - 1]) / (RISE_S[i] - RISE_S[i - 1]);
      return RISE_M[i - 1] + k * (RISE_M[i] - RISE_M[i - 1]);
    }
  }
  return RISE_M[RISE_M.length - 1];
};

/** [start, full, holdEnd, end] — fade to colour, hold, fade back in. */
export const DIPS: { at: [number, number, number, number]; color: 'navy' | 'black' }[] = [
  { at: [580, 598, 603, 615], color: 'navy' },
  { at: [856, 872, 878, 890], color: 'navy' },
  { at: [F.chapterEnd, 1352, 1362, 1380], color: 'black' },
  { at: [1604, 1614, 1618, 1630], color: 'black' }, // moon -> ISS
  { at: [1755, 1770, 1776, 1790], color: 'black' },
  { at: [F.groundEnd, 2160, 2166, 2180], color: 'black' },
  { at: [2646, 2656, 2664, 2676], color: 'black' }, // globe -> scale
  { at: [F.scaleEnd, 2880, 2886, 2898], color: 'black' }, // scale -> recap
];
