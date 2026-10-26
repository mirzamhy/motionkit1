// "What if we lost gravity for 5 seconds?" — remake of a simulif.world short, built on the what-if-sim template.
// 1080x1920, 30 fps, 3180 frames (106 s); the last frame loops into frame 0. See BREAKDOWN.md for the shot list.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { C, Captions, Cta, Dips, Flash, Leaderboard, Sky, Stamp, Title, Vignette } from '../../templates/whatif-sim';
import { CAPS } from './captions';
import { EarthSection } from './EarthSection';
import { GroundRise } from './GroundRise';
import { Hud } from './Hud';
import { RingingEarth, Space } from './Space';
import { DIPS, F, H, W, shotAt } from './timeline';
import { World } from './World';

export const WHATIF_GRAVITY_FRAMES = F.end;

const RECAP_ROWS: [string, string][] = [
  ['You', 'Felt nothing'],
  ['The ground', '+120 m'],
  ['The Moon', '3 cm off'],
  ['Astronauts', 'Nothing'],
  ['The planet', 'Rings for weeks'],
  ['Your scale', '± 1.5 kg'],
];

export const WhatIfGravity: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = shotAt(frame);
  const in3d = frame < F.earth || frame >= F.scale;
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      {in3d && (
        <>
          <Sky t={frame >= F.recap ? frame - F.end : frame} />
          <ThreeCanvas width={W} height={H} gl={{ antialias: true, alpha: true }} camera={{ fov: 50, near: 0.05, far: 400 }}>
            <World frame={frame} shot={shot} />
          </ThreeCanvas>
          <Vignette />
        </>
      )}
      <EarthSection />
      <Space />
      <GroundRise />
      <RingingEarth />
      <Leaderboard
        rows={RECAP_ROWS}
        timing={{ start: F.recap, rowsIn: F.rowsIn, focus: F.focusYou, rowsOut: F.rowsOut, firstOut: F.youOut }}
      />
      <Flash at={F.off} />
      <Title until={F.cutClose} loopEnd={F.end}>
        What if we lost
        <br />
        <span style={{ color: C.red }}>gravity</span> for
        <br />5 seconds?
      </Title>
      <Captions caps={CAPS} />
      <Cta at={F.cta} end={F.end} before="Did you think you’d" word="float" line1="Comment yes or no" line2="Did the dog notice?" />
      <Hud />
      <Stamp at={F.stamp} exit={F.fadeOut} small="You feel" big="Nothing" color={C.gold} left={64} top={790} />
      <Stamp at={F.mythStamp} exit={F.mythExit} small="Result" big="Myth" color={C.red} left={64} top={730} />
      <Stamp at={F.issStamp} exit={F.spaceEnd} small="Astronauts feel" big="Nothing" color={C.gold} left={64} top={840} />
      <Stamp at={F.ringStamp} exit={F.ringExit} small="Result" big="Earth rings" color={C.red} left={64} top={760} />
      <Dips dips={DIPS} />
    </AbsoluteFill>
  );
};
