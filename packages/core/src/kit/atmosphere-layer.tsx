import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ATMOSPHERE_PRESETS, type AtmospherePreset } from './atmosphere';

type AtmosphereLayerProps = {
  preset: AtmospherePreset | keyof typeof ATMOSPHERE_PRESETS;
  opacity?: number;
  showWeather?: boolean;
};

const rainDrops = Array.from({ length: 42 }, (_, index) => ({
  left: (index * 37) % 100,
  delay: (index * 11) % 30,
  length: 12 + ((index * 7) % 16),
  opacity: 0.12 + ((index * 13) % 20) / 100,
}));

const resolvePreset = (preset: AtmosphereLayerProps['preset']): AtmospherePreset =>
  typeof preset === 'string' ? ATMOSPHERE_PRESETS[preset] : preset;

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = ({
  preset,
  opacity = 1,
  showWeather = true,
}) => {
  const frame = useCurrentFrame();
  const atmosphere = resolvePreset(preset);
  const isRain = showWeather && atmosphere.weather?.includes('rain');
  const drift = frame % 90;

  const palette = atmosphere.id === 'golden-hour'
    ? 'linear-gradient(135deg, rgba(255,170,78,.18), rgba(255,92,52,.06) 52%, rgba(21,31,72,.12))'
    : atmosphere.id === 'rainy-night'
      ? 'linear-gradient(135deg, rgba(19,42,88,.34), rgba(5,12,29,.48) 62%, rgba(18,82,112,.22))'
      : 'linear-gradient(135deg, rgba(130,145,165,.16), rgba(48,60,75,.12))';

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <AbsoluteFill style={{ background: palette }} />
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 15% rgba(0,0,0,.32)',
          opacity: atmosphere.id === 'rainy-night' ? 0.9 : 0.45,
        }}
      />
      {isRain ? (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          {rainDrops.map((drop, index) => {
            const y = ((frame + drop.delay * 3 + drift) * (1.2 + (index % 5) * 0.08)) % 118 - 18;
            return (
              <span
                key={index}
                style={{
                  position: 'absolute',
                  left: `${drop.left}%`,
                  top: `${y}%`,
                  width: 1,
                  height: drop.length,
                  opacity: drop.opacity,
                  background: 'rgba(182,220,255,.78)',
                  transform: 'rotate(14deg)',
                  transformOrigin: 'top center',
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,.28) 100%)',
          opacity: interpolate(frame % 60, [0, 30, 59], [0.72, 0.84, 0.72]),
        }}
      />
    </AbsoluteFill>
  );
};
