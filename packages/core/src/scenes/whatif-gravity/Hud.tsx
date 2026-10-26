// The gravity film's HUD: which header shows when, and the stat list. Pieces come from the template.
import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { C, HudFrame, HudHeader, Ms2, Stat, clamp, fmtClock, fmtTimer } from '../../templates/whatif-sim';
import { F, elapsedAt, lapseRate, riseAt, slowLabel, swellKm, timerAt, weightKg } from './timeline';

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const off = frame >= F.off;
  const paused = frame >= F.freeze && frame < F.resume;

  const g = interpolate(frame, [F.gravStat, F.gravStat + 18], [9.8, 0], { ...clamp, easing: Easing.out(Easing.quad) });
  const atm = Math.round(
    interpolate(frame, [F.pressure, F.pressureFull], [0, 3_500_000], { ...clamp, easing: Easing.out(Easing.cubic) }),
  );

  return (
    <HudFrame>
      {frame < F.comesBack ? (
        <HudHeader
          label={off ? 'Gravity back in' : 'Gravity off in'}
          value={fmtTimer(timerAt(frame))}
          sub={!off ? 'Real time' : paused ? 'Paused · the myth' : slowLabel(frame)}
          color={off ? C.red : C.white}
        />
      ) : frame < F.recap ? (
        <HudHeader
          label="Since gravity came back"
          value={fmtClock(elapsedAt(frame))}
          sub={`Time-lapse ${lapseRate(frame)}×`}
        />
      ) : (
        <HudHeader label="Gravity was off for" value="0:05.000" sub="Nobody felt a thing" />
      )}

      {/* scenes 1-5 */}
      <Stat frame={frame} enter={F.gravStat} exit={F.fadeOut} title="Gravity" value={<>{g.toFixed(1)} <Ms2 /></>} note="Switched off · everywhere" />
      <Stat frame={frame} enter={F.scaleStat} exit={F.stamp} title="Your scale" value="70.0 kg" note="Unchanged" />
      {/* 6: myth */}
      <Stat frame={frame} enter={F.mythScale} exit={F.mythExit + 6} title="Your scale" value="0.0 kg" note="Imagined" />
      {/* 7-8: cross-section */}
      <Stat frame={frame} enter={F.pressure} exit={F.chapterEnd} title="Pressure · Earth’s centre" value={`${atm.toLocaleString('en-US')} atm`} note="≈ 360 GPa" />
      <Stat frame={frame} enter={F.pushStat} exit={F.chapterEnd} title="Outward push" value={<>9.8 <Ms2 /></>} note="Same as gravity’s pull" />
      {/* 9-10: Moon, ISS */}
      <Stat frame={frame} enter={F.moonStat} exit={F.spaceEnd} title="The Moon’s speed" value="1.0 km/s" note="Now in a straight line" />
      <Stat frame={frame} enter={F.offCourseStat} exit={F.spaceEnd} title="Off course after 5 s" value="3.4 cm" note="384,400 km from Earth" />
      {/* 11: ground rising */}
      <Stat frame={frame} enter={F.ground} exit={F.groundEnd} title="Ground has risen" value={`+${Math.round(riseAt(frame))} m`} note="The air and the oceans too" />
      <Stat
        frame={frame}
        enter={F.risingStat}
        exit={F.groundEnd}
        title="Rising at"
        value={`${Math.round(interpolate(frame, [F.risingStat, 2130], [108, 165], clamp))} km/h`}
        note="Statue of Liberty: 93 m"
      />
      {/* 12: the planet rings */}
      <Stat frame={frame} enter={F.groundSpeedStat} exit={F.ringExit + 4} title="Ground speed · outward" value="176 km/h" note="49 m/s · nothing stops it" />
      <Stat frame={frame} enter={F.swell} exit={F.swing - 6} title="Planet swell" value={`+${Math.max(0, swellKm(frame)).toFixed(1)} km`} note="Peak ≈ 8 km · estimate" />
      <Stat frame={frame} enter={F.swing} exit={F.ringStamp} title="One swing" value="20.5 min" note="Rings for weeks" />
      {/* 13: the scale */}
      <Stat frame={frame} enter={F.scale} exit={F.scaleEnd} title="Your scale" value={`${weightKg(frame).toFixed(1)} kg`} note="Normally 70.0 kg" />
      <Stat frame={frame} enter={F.swingKg} exit={F.scaleEnd} title="Swing" value="± 1.5 kg" note="Every 20.5 minutes" />
    </HudFrame>
  );
};
