export type AtmospherePreset = {
  id: string;
  lighting: string;
  weather?: string;
  colorGrade?: string;
  ambience?: string;
  music?: string;
  sfx?: readonly string[];
  cameraMood?: string;
};

export const ATMOSPHERE_PRESETS: Record<string, AtmospherePreset> = {
  'golden-hour': {
    id: 'golden-hour',
    lighting: 'warm-low-sun',
    colorGrade: 'warm-film',
    ambience: 'open-air-day',
    cameraMood: 'gentle-observational',
  },
  'rainy-night': {
    id: 'rainy-night',
    lighting: 'cool-neon-rim',
    weather: 'heavy-rain',
    colorGrade: 'blue-low-key',
    ambience: 'city-rain',
    sfx: ['wet-footstep', 'distant-car', 'neon-buzz'],
    cameraMood: 'slow-push-in',
  },
  'overcast-day': {
    id: 'overcast-day',
    lighting: 'soft-cloudy',
    weather: 'none',
    colorGrade: 'muted-natural',
    ambience: 'quiet-street',
    cameraMood: 'steady-documentary',
  },
};

export const getAtmosphere = (id: string): AtmospherePreset => {
  const preset = ATMOSPHERE_PRESETS[id];
  if (!preset) throw new Error(`Unknown atmosphere preset: ${id}`);
  return preset;
};
