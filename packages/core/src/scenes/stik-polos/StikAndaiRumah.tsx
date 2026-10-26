import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { Bubble, C, CURB, City, Label, Quote, Road, SharedDefs, Soundtrack, camTransform, stikFrames, makeCam, ramp, useStikFrame, type StikSound } from '../../styles/stik-polos/kit';
import { CUACA, CuacaBelakang, CuacaDepan, Genangan, jalanBasah, type Cuaca } from '../../styles/stik-polos/cuaca';
import { KprHouse, Kos, Lamp, Mansion, Petak, PetakRoom } from '../../library/stik-polos/set-rumah';

// "Rumah": kos → KPR house → mansion → warm rumah petak. The last family wants nothing; their window glows instead.
const F30 = 390;
export const STIK_ANDAI_RUMAH_FRAMES = stikFrames(F30);

const SOUNDS: StikSound[] = [
  { at: 0, file: 'room', vol: 0.3, loop: true },
  ...[24, 48, 72].map((at) => ({ at, file: 'drip', vol: 0.35 })),
  ...[25, 110, 190].map((at) => ({ at, file: 'pop', vol: 0.45 })),
  ...[56, 134, 220, 272].map((at) => ({ at, file: 'whoosh', vol: 0.18 })),
  { at: 248, file: 'chime', vol: 0.3 },
];

// kos → KPR → mansion → warm rumah petak → wide
const camAt = makeCam([
  { f: 0, cx: 180, cy: 585, s: 1.75 },
  { f: 72, cx: 180, cy: 585, s: 1.75 },
  { f: 84, cx: 600, cy: 620, s: 1.55 },
  { f: 150, cx: 600, cy: 620, s: 1.55 },
  { f: 164, cx: 1240, cy: 570, s: 1.08 },
  { f: 236, cx: 1240, cy: 570, s: 1.08 },
  { f: 252, cx: 1745, cy: 690, s: 1.9 },
  { f: 288, cx: 1745, cy: 690, s: 1.9 },
  { f: 304, cx: 952, cy: -46, s: 0.39 },
]);

export const StikAndaiRumah: React.FC<{ sfx?: boolean; cuaca?: Cuaca }> = ({ sfx = false, cuaca = 'hujan' }) => {
  const frame = useStikFrame();
  const cam = camAt(frame);
  const labelsOut = interpolate(frame, [282, 290], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glow = ramp(frame, 244, 12);

  const street = (
    <>
      <Kos frame={frame} />
      <Lamp x={390} frame={frame} />
      <KprHouse frame={frame} />
      <Lamp x={890} frame={frame} />
      <Mansion frame={frame} />
      <Lamp x={1590} frame={frame} />
      <Petak frame={frame} glow={glow} />
    </>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.sky }}>
      <Soundtrack on={sfx} total={F30} sounds={[...CUACA[cuaca].suara, ...SOUNDS]} />
      <svg viewBox="0 0 720 1280" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <SharedDefs mirrorY={CURB} />
        <rect width={720} height={1280} fill="url(#sky)" />
        <CuacaBelakang frame={frame} jenis={cuaca} />

        <g transform={camTransform(cam)}>
          <g transform={`translate(${(cam.cx - 360) * 0.35} 0)`}>
            <City from={-900} to={2900} />
          </g>
          <Road />

          {street}

          {/* wet road mirrors the street */}
          <g clipPath="url(#belowGround)">
            <g transform={`translate(0 ${CURB * 2}) scale(1 -1)`} opacity={jalanBasah(cuaca) ? 0.14 : 0.05} filter="url(#softBlur)">
              {street}
            </g>
          </g>
          <rect x={-3000} y={CURB + 10} width={8000} height={900} fill="url(#roadFade)" />
          <Genangan frame={frame} jenis={cuaca} x0={-60} span={2040} y0={830} />

          <Label x={60} y={444} text="KOS" op={ramp(frame, 6) * labelsOut} />
          <Label x={786} y={636} text="KPR" op={ramp(frame, 86) * labelsOut} />
          <Label x={1450} y={548} text="SENDIRI" op={ramp(frame, 166) * labelsOut} />
          <Label x={1760} y={566} text="CUKUP" op={ramp(frame, 256) * labelsOut} />

          {/* each one wants the next house; the last family wants nothing */}
          <Bubble
            frame={frame} x={85} y={340} w={200} h={118} popAt={25} fadeAt={71}
            dots={[[152, 478, 6], [146, 502, 4.5], [140, 524, 3.5]]}
            icon={{ src: [415, 395, 450, 410], node: <KprHouse frame={0} /> }}
          />
          <Bubble
            frame={frame} x={495} y={436} w={210} h={128} popAt={110} fadeAt={150}
            dots={[[575, 584, 6], [571, 604, 4.5], [568, 622, 3.5]]}
            icon={{ src: [918, 330, 644, 472], node: <Mansion frame={0} /> }}
          />
          <Bubble
            frame={frame} x={1160} y={418} w={220} h={130} popAt={190} fadeAt={236}
            dots={[[1292, 566, 6], [1296, 590, 4.5], [1299, 610, 3.5]]}
            icon={{ src: [1648, 640, 190, 135], node: <PetakRoom frame={frame} /> }}
          />
        </g>

        <CuacaDepan frame={frame} jenis={cuaca} />
        <rect width={720} height={1280} fill="url(#vig)" />
      </svg>

      <Quote
        frame={frame}
        top={870}
        lines={[
          [['Rumah', 304], ['bukan', 310], ['soal', 316], ['‘luas’-nya,', 322]],
          [['tapi', 334], ['‘siapa’', 340, true], ['di', 346], ['dalamnya.', 352]],
        ]}
      />
    </AbsoluteFill>
  );
};
