# Full market proof

Composition FullMarket in scripts/vendor-lab.tsx. Scene in scripts/market-world.tsx. 240 frames, 24 fps, 1280x720, ten seconds. Original stylized construction based on the preceding wooden-stall study; fictional layout, not a reconstruction of a real market.

Six stalls in two rows, six vendors, two browsing buyers, four passersby. Two centre lanes have opposite directions. Absolute frame functions drive travel, gait, reach, parcel transfer and camera push. No physics or realtime crowd state. Roof is shown as a cutaway frame to keep people visible.

Reuses VendorStall, Vendor, RigArm, Vegetable and RawChicken. Character now accepts gait, shirtColor and apron flags. Existing static previews default to unchanged values.

Buyer interaction: reaching across the stall edge and a paper parcel translating towards the buyer. No payment, calibrated weighing, articulated bag grasp, collision avoidance or full finger-to-object contact simulation. Walking feet use procedural swing, not foot-locking IK. All people share the same base body and hair. Stall stock is mostly vegetables, with poultry accents; no full fish stall in this proof.

Audio reuses the original six-second synthetic noise/rustle track as a quiet loop; not recorded market chatter or footsteps. Lighting is a neutral day test. No commercial asset/library was downloaded for this scene.

```powershell
node scripts/market-sound.mjs
npx tsc --noEmit -p .
npx remotion render scripts/vendor-lab.tsx FullMarket out/full-market/full-market.mp4 --public-dir=projects/vendor-action/public --gl=angle --concurrency=1
```

Typecheck passed. Initial stills 40/125/210 rendered; frame 40 opened and revealed people outside the base. Extended ground and replaced parcel scale appearance with continuous translation. Revised frame 125 rendered and opened before video. Remaining weaknesses: repeated character silhouettes, sparse stock/background, visible segmented knees, wide shot obscures hand interactions. Existing Zod version warning persists.
