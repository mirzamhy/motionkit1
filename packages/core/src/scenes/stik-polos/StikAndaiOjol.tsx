import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { C, GROUND, Bubble, City, Label, Quote, Road, SANS, SharedDefs, Soundtrack, camTransform, stikFrames, makeCam, ramp, useStikFrame, type StikSound } from '../../styles/stik-polos/kit';
import { CUACA, CuacaBelakang, CuacaDepan, Genangan, jalanBasah, type Cuaca } from '../../styles/stik-polos/cuaca';
import { Car, Couple, Hospital, Kiosk, KioskGuy, Ojol } from '../../library/stik-polos/set-jalan';

// "Andai Ojol": ojol → car → couple in a poncho → man at a coffee stall → hospital patient who dreams of the ojol.
const F30 = 360;
export const STIK_ANDAI_OJOL_FRAMES = stikFrames(F30);

const SOUNDS: StikSound[] = [
  { at: 0, file: 'room', vol: 0.3, loop: true },
  ...[25, 115, 163].map((at) => ({ at, file: 'pop', vol: 0.45 })),
  ...[56, 120, 189, 243].map((at) => ({ at, file: 'whoosh', vol: 0.18 })),
  { at: 224, file: 'chime', vol: 0.3 },
];

// Optional small label on the road, e.g. your own handle.
const WATERMARK = '';

// ── camera: world point (cx, cy) sits at frame centre, at scale s ──
const camAt = makeCam([
  { f: 0, cx: 360, cy: 640, s: 1 },
  { f: 72, cx: 360, cy: 640, s: 1 },
  { f: 82, cx: 542, cy: 699, s: 1.3 },
  { f: 136, cx: 542, cy: 699, s: 1.3 },
  { f: 146, cx: 1025, cy: 627, s: 0.95 },
  { f: 205, cx: 1025, cy: 627, s: 0.95 },
  { f: 217, cx: 918, cy: 211, s: 1.24 },
  { f: 258, cx: 918, cy: 211, s: 1.24 },
  { f: 271, cx: 612, cy: 399, s: 0.52 },
]);

export const StikAndaiOjol: React.FC<{ sfx?: boolean; cuaca?: Cuaca }> = ({ sfx = false, cuaca = 'hujan' }) => {
  const frame = useStikFrame();
  const cam = camAt(frame);

  // vehicles roll forward once the light turns green
  const go = Math.max(0, frame - 330) / 29;
  const dx = 75 * go * go;
  const spin = (dx / 40) * (180 / Math.PI);
  const red = 1 - ramp(frame, 326, 5);

  const fadeIn = (a: number) => ramp(frame, a);
  const labelsOut = interpolate(frame, [252, 260], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [224, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const sepia = { cream: '#F6EEDC', scooter: '#C9A46A', box: '#B48A55' };

  const movers = (
    <>
      <g transform={`translate(${dx} 0)`}>
        <Ojol frame={frame} spin={spin} lean={go > 0 ? Math.min(6, go * 8) : 0} />
      </g>
      <g transform={`translate(${dx} 0)`}>
        <Car frame={frame} spin={spin} />
      </g>
      <g transform={`translate(${dx * 0.9} 0)`}>
        <Couple frame={frame} spin={spin} />
      </g>
    </>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.sky }}>
      <Soundtrack on={sfx} total={F30} sounds={[...CUACA[cuaca].suara, ...SOUNDS]} />
      <svg viewBox="0 0 720 1280" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <SharedDefs />

        <rect width={720} height={1280} fill="url(#sky)" />
        <CuacaBelakang frame={frame} jenis={cuaca} />

        <g transform={camTransform(cam)}>
          {/* backdrop */}
          <g transform={`translate(${(cam.cx - 360) * 0.35} 0)`} opacity={0.95}>
            <City />
          </g>
          <Road />

          {/* street */}
          <Hospital frame={frame} red={red} glow={glow} font={SANS} />
          <Kiosk frame={frame} />

          {/* wet reflections */}
          <g clipPath="url(#belowGround)">
            <g transform={`translate(0 ${GROUND * 2}) scale(1 -1)`} opacity={jalanBasah(cuaca) ? 0.14 : 0.05} filter="url(#softBlur)">
              {movers}
            </g>
          </g>
          <rect x={-3000} y={GROUND + 10} width={8000} height={900} fill="url(#roadFade)" />
          <Genangan frame={frame} jenis={cuaca} />

          {movers}

          {/* labels */}
          <Label x={98} y={604} text="OJOL" op={fadeIn(6) * labelsOut} />
          <Label x={640} y={650} text="CICILAN" op={fadeIn(84) * labelsOut} />
          <Label x={1172} y={490} text="BEBAS" op={fadeIn(147) * labelsOut} />

          {/* thoughts: each one wants the next one's life */}
          <Bubble
            frame={frame} x={160} y={405} w={205} h={125} popAt={25} fadeAt={71}
            dots={[[213, 552, 7], [199, 571, 5], [186, 588, 3.5]]}
            icon={{ src: [292, 656, 432, 230], node: <Car frame={0} /> }}
          />
          <Bubble
            frame={frame} x={420} y={452} w={210} h={140} popAt={115} fadeAt={138}
            dots={[[512, 608, 7], [516, 628, 5], [519, 646, 3.5]]}
            icon={{ src: [772, 650, 206, 236], node: <Couple frame={0} cold={false} /> }}
          />
          <Bubble
            frame={frame} x={836} y={482} w={176} h={138} popAt={163} fadeAt={193}
            dots={[[868, 634, 6], [858, 650, 4.5], [850, 664, 3]]}
            icon={{ src: [1085, 600, 172, 196], node: <KioskGuy frame={0} /> }}
          />
          <Bubble
            frame={frame} x={790} y={24} w={206} h={128} popAt={224} glow
            dots={[[946, 170, 7], [958, 187, 5], [968, 202, 3.5]]}
            icon={{ src: [30, 612, 224, 276], node: <Ojol frame={0} pal={sepia} cold={false} /> }}
          />
        </g>

        <CuacaDepan frame={frame} jenis={cuaca} />
        <rect width={720} height={1280} fill="url(#vig)" />

        {WATERMARK && (
          <text x={360} y={942} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={14} letterSpacing={5} fill="#C7CCD3" opacity={0.35}>
            {WATERMARK}
          </text>
        )}
      </svg>

      {/* closing line */}
      <Quote
        frame={frame}
        top={370}
        lines={[
          [['‘Kurang’-mu', 259], ['adalah', 266]],
          [['‘andai’-nya', 277, true], ['orang', 283], ['lain.', 289]],
        ]}
      />
    </AbsoluteFill>
  );
};
