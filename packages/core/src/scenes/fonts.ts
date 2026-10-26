import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';
import { loadFont as loadNewsreader } from '@remotion/google-fonts/Newsreader';
import { loadFont as loadPlexMono } from '@remotion/google-fonts/IBMPlexMono';
import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

const latin = { subsets: ['latin'] as ['latin'] };
const display = loadFraunces('normal', { weights: ['500', '600', '700'], ...latin });
const reading = loadNewsreader('normal', { weights: ['400', '500', '600'], ...latin });
const mono = loadPlexMono('normal', { weights: ['400', '500', '600'], ...latin });

export const EDITORIAL_FONTS = {
  disp: display.fontFamily,
  ui: reading.fontFamily,
  mono: mono.fontFamily,
} as const;

let loaded = false;

export const useEditorialFonts = () => {
  const [ready, setReady] = useState(loaded);
  const [handle] = useState(() => (loaded ? null : delayRender('MotionKit editorial fonts')));

  useEffect(() => {
    if (ready || handle === null) return;
    Promise.all([display.waitUntilDone(), reading.waitUntilDone(), mono.waitUntilDone()])
      .then(() => document.fonts.ready)
      .catch((error) => console.warn(`MotionKit font load failed: ${String(error)}`))
      .finally(() => {
        loaded = true;
        setReady(true);
        continueRender(handle);
      });
  }, [handle, ready]);

  return EDITORIAL_FONTS;
};
