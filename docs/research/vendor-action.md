# Vendor action proof

Original procedural stylized character, no external model. Entry: scripts/vendor-lab.tsx, composition VendorAction, 144 frames at 24 fps (6 seconds). This is a single supported wooden counter for interaction testing; full market integration remains pending.

Timing: reach 12–36, close grip 34–44, lift 46–65, carry 65–88, release/lower 90–101, return 104–132. Smoothstep interpolation; absolute frame sampling; no physics state. Vegetable shares the hand position plus grasp offset while carried. Two-bone IK drives the right elbow; legs remain planted in the original pose. Fingers curl procedurally; body lean, skin deformation, knee IK and cloth simulation are not implemented.

Audio: scripts/market-sound.mjs generates a six-second mono 48 kHz WAV in ignored projects/vendor-action/public. Original synthetic noise/rustle and damped impact, not a field recording of a market.

```powershell
node scripts/market-sound.mjs
npx tsc --noEmit -p .
npx remotion render scripts/vendor-lab.tsx VendorAction out/vendor-action/vendor-action.mp4 --public-dir=projects/vendor-action/public --gl=angle --concurrency=1
```

Typecheck passed. Stills at 36, 65 and 100 rendered and opened before video. Reach, lift and placement are visible. Garment remains rigid, joint silhouettes are stylized, bag resembles an open paper container. Stills alone do not establish motion smoothness or audio quality. Existing Zod mismatch warning remains unchanged.

## Carrot weighing variation

Composition `VendorWeigh` (same duration and entry), added with `scripts/vendor-stall.tsx`. Original wooden stall with panel front, posts, cabbage and carrot displays, mechanical scale and animated dial. Reuses Vegetable from market-produce.tsx and existing Vendor/RigArm. Hand and carrot positions use common target points; carrot rests on the scale after release. Dial movement is illustrative, not a calibrated or measured weight. Feet are hidden behind the panel; leg IK remains unimplemented.

Stills at 36, 65 and 110 opened. Camera revised after post occluded arm; revised frame 65 opened before final video render. Surface and clothing remain stylized. Synthetic audio from the preceding action is reused; not authentic scale/market audio.

```powershell
npx remotion render scripts/vendor-lab.tsx VendorWeigh out/vendor-action/vendor-weigh.mp4 --public-dir=projects/vendor-action/public --gl=angle --concurrency=1
```
