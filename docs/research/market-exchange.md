# Market exchange proof

Composition MarketExchange in scripts/vendor-lab.tsx. Scene in scripts/market-exchange.tsx. 168 frames, 24 fps, 1280x960, seven seconds. Close two-person shot at the wooden stall from FullMarket; stylized, fictional, not a reconstruction of a real market.

Beats: seller lifts paper bag (12-50), buyer reaches (34-64), bag passes hand to hand (66-86), seller releases and returns (76-122), buyer pulls bag over the counter (96-118), steps back 0.3 m to clear the stall front (118-146), lowers bag to the hip with both handles gathered in the hand (136-160). Camera drifts slightly and follows the buyer's step.

The buyer steps back before lowering because a hip carry at the original spot would push the bag through the stall's front boards (Z 0.79). Step uses the procedural gait swing; feet slide, no foot-locking IK. Bag handles are rigid rings that converge while carried, not a cloth/rope sim. No payment shown.

```powershell
npx tsc --noEmit -p .
npx remotion still scripts/vendor-lab.tsx MarketExchange out/market-exchange/v3/f167.png --frame=167 --public-dir=projects/vendor-action/public --gl=angle
npx remotion render scripts/vendor-lab.tsx MarketExchange out/market-exchange/market-exchange.mp4 --public-dir=projects/vendor-action/public --gl=angle --concurrency=1
```

Typecheck passed. Stills 0/50/66/86/100/118/146/167 opened: handover fine, but the end showed an open palm beside the handles and the bag floating at chest height to the last frame. After the fix, stills 118-167 and a crop of the hand at 167 were opened, then the video was rendered and an 8-frame sheet taken from the MP4 (out/market-exchange/video-check.png) was opened. A still sheet does not prove the motion is smooth; the step-back has not been checked at full speed by a person. Remaining weaknesses: sliding feet during the step, identical body silhouettes, sparse background. Zod version warning persists.
