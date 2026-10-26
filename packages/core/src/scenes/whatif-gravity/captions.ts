// Captions for the gravity film: [from, to) frames, top in px, size in px.
import type { Cap } from '../../templates/whatif-sim';
import { F } from './timeline';

export const CAPS: Cap[] = [
  { from: 0, to: 160, text: 'When this timer hits zero, gravity switches off. Everywhere. For 5 seconds.', top: 1490, size: 42 },
  { from: 160, to: 225, text: 'You think you’d float away.', top: 1500, size: 42 },
  { from: 225, to: 300, text: 'You wouldn’t. Something much bigger moves.', top: 1500, size: 42 },
  { from: 300, to: 345, text: '3…', top: 935, size: 40 },
  { from: 345, to: 378, text: '2…', top: 935, size: 40 },
  { from: 378, to: F.off, text: '1…', top: 935, size: 40 },
  { from: 420, to: 480, text: 'Gravity is gone.', top: 965, size: 52 },
  { from: 480, to: 576, text: 'And you feel… nothing at all.', top: 965, size: 52 },
  // Scene 6: the myth
  { from: 615, to: 688, text: 'This is what most people imagine.', top: 1270, size: 48 },
  { from: 688, to: 790, text: 'Everyone floats up. The water drifts into the sky.', top: 1270, size: 48 },
  { from: 790, to: 856, text: 'It’s wrong.', top: 1270, size: 48 },
  // Scene 7: cross-section
  { from: 890, to: 1010, text: 'The ground under you is squeezed by the weight of the whole planet.', top: 960, size: 48 },
  { from: 1010, to: 1140, text: 'At the centre: 3.5 million × the air pressure.', top: 975, size: 48 },
  { from: 1140, to: 1230, text: 'Switch gravity off, and that squeeze springs outward.', top: 960, size: 48 },
  // Scene 8: push = pull
  { from: 1230, to: F.chapterEnd, text: 'It pushes everything up, exactly as hard as gravity pulled.', top: 960, size: 48 },
  // Scene 9: the Moon
  { from: 1380, to: 1509, text: 'Up in space, nothing is pushing. The Moon flies off in a straight line.', top: 1270, size: 48 },
  { from: 1509, to: 1606, text: 'In 5 seconds, it drifts 3 cm off course.', top: 1285, size: 48 },
  // Scene 10: ISS
  { from: 1628, to: 1755, text: 'Astronauts feel nothing. They were already falling.', top: 1270, size: 48 },
  // Scene 11: ground rising
  { from: 1785, to: 1950, text: 'Back on Earth, the whole planet is expanding. You, the air, the oceans, together.', top: 1270, size: 48 },
  { from: 1950, to: 2085, text: 'In 5 seconds, the ground rises 120 metres.', top: 1285, size: 48 },
  { from: 2085, to: F.groundEnd, text: 'Higher than the Statue of Liberty.', top: 1285, size: 48 },
  // Scene 12: the planet rings
  { from: 2178, to: F.comesBack, text: 'Then gravity comes back.', top: 960, size: 48 },
  { from: F.comesBack, to: F.swell, text: 'But the planet is still rising, at 176 km/h.', top: 960, size: 48 },
  { from: F.swell, to: F.swing, text: 'It swells kilometres outward, then sinks back.', top: 960, size: 48 },
  { from: F.swing, to: 2646, text: 'And rings like a bell, every 20 minutes, for weeks.', top: 945, size: 48 },
  // Scene 13: the scale
  { from: 2672, to: F.swingKg, text: 'Down here, your scale would read 1.5 kg lighter.', top: 975, size: 48 },
  { from: F.swingKg, to: F.scaleEnd, text: 'Then heavier. Then lighter. Over and over.', top: 975, size: 48 },
  // Scene 14-15: recap
  { from: 2895, to: F.focusYou, text: 'So no, you wouldn’t float away.', top: 1400, size: 48 },
  { from: F.focusYou, to: F.cta, text: 'The whole planet would jump. And you’d ride it.', top: 1385, size: 48 },
  { from: F.cta, to: F.returnStart, text: 'Be honest. Did you think you’d float?', top: 1400, size: 48 },
];
