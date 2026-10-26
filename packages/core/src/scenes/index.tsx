// Scene compositions. To add a scene: write the component, add it to COMPONENTS here and to SCENES in manifest.ts.
import React from 'react';
import { UsageMeter, USAGE_METER_FRAMES } from './usage-meter/UsageMeter';
import { WhatIfGravity, WHATIF_GRAVITY_FRAMES } from './whatif-gravity/Gravity';
import { AsetUji3D, ASET_UJI_FRAMES } from './aset-uji/AsetUji3D';
import { Composition } from 'remotion';
import { SCENES } from './manifest';
import { PIZZA_SCENE_FRAMES, PizzaScene } from './PizzaScene';
import { UNAIR_SCENE_FRAMES, UnairScene } from './UnairFilm';
import { SURABAYA_KALIMAS_PROOF_FRAMES, SurabayaKalimasProof } from './SurabayaKalimasProof';
import { SURABAYA_FILM_FRAMES, SurabayaFilm } from './SurabayaFilm';
import { PELABUHAN_FRAMES, PelabuhanIlustrasi, PelabuhanIlustrasiTall } from './PelabuhanProof';
import { DICARI_SHOT3_FRAMES, DicariShot3 } from './JajanDicari';
import { LAPAK_SHOT4_FRAMES, LapakShot4, UjiCharm } from './JajanLapak';
import { TEASER_LAPAK_FRAMES, TeaserLapak } from './JajanTeaserLapak';
import { UjiTubuh } from './JajanUjiTubuh';
import { UjiBadan } from './JajanUjiBadan';
import { DESAIN_CHARM_FRAMES, DesainCharm, UjiFlanel } from './JajanDesainCharm';
import { GAYA_TEASER_FRAMES, GayaTeaser } from './JajanGayaTeaser';
import { GACHA_FRAMES, TeaserGacha } from './JajanGacha';
import { STOP_MOTION_FRAMES, TeaserStopMotion } from './JajanStopMotion';
import { ASMR_FRAMES, TeaserAsmr } from './JajanAsmr';
import { TEASER_TUDUNG_FRAMES, TeaserTudung } from './JajanTeaserTudung';
import { TEASER_MISTERI_FRAMES, TEASER_MISTERI_VIDEO_FRAMES, TeaserMisteriFrame, TeaserMisteriVideo } from './JajanTeaserMisteri';
import { LOGO_FRAMES, LogoJajan } from './JajanLogo';
import { STORY_TUKERAN_FRAMES, StoryTukeranFrame } from './JajanStoryTukeran';
import { STORY_PASAR_FRAMES, STORY_PASAR_VIDEO_FRAMES, StoryPasarFrame, StoryPasarVideo } from './JajanStoryPasarMinggu';
import { JAJAN_SHOT7_FRAMES, JAJAN_TEASER_PROOF_FRAMES, JajanTeaserProof, JajanTeaserShot7 } from './JajanTeaser';
import { STIK_ANDAI_OJOL_FRAMES, StikAndaiOjol } from './stik-polos/StikAndaiOjol';
import { STIK_ANDAI_RUMAH_FRAMES, StikAndaiRumah } from './stik-polos/StikAndaiRumah';
import { ATMOSPHERE_PROOF_FRAMES, AtmosphereGoldenHour, AtmosphereOvercastDay, AtmosphereRainyNight } from './AtmosphereProof';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENTS: Record<string, { component: React.FC<any>; frames: number }> = {
  StikAndaiOjol: { component: StikAndaiOjol, frames: STIK_ANDAI_OJOL_FRAMES },
  StikAndaiOjolGerimis: { component: StikAndaiOjol, frames: STIK_ANDAI_OJOL_FRAMES },
  StikAndaiRumah: { component: StikAndaiRumah, frames: STIK_ANDAI_RUMAH_FRAMES },
  StikAndaiRumahCerah: { component: StikAndaiRumah, frames: STIK_ANDAI_RUMAH_FRAMES },
  StikAndaiRumahKabut: { component: StikAndaiRumah, frames: STIK_ANDAI_RUMAH_FRAMES },
  AtmosphereGoldenHour: { component: AtmosphereGoldenHour, frames: ATMOSPHERE_PROOF_FRAMES },
  AtmosphereRainyNight: { component: AtmosphereRainyNight, frames: ATMOSPHERE_PROOF_FRAMES },
  AtmosphereOvercastDay: { component: AtmosphereOvercastDay, frames: ATMOSPHERE_PROOF_FRAMES },
  PizzaScene: { component: PizzaScene, frames: PIZZA_SCENE_FRAMES },
  PizzaScenePortrait: { component: PizzaScene, frames: PIZZA_SCENE_FRAMES },
  UnairScene: { component: UnairScene, frames: UNAIR_SCENE_FRAMES },
  UnairScenePortrait: { component: UnairScene, frames: UNAIR_SCENE_FRAMES },
  SurabayaKalimasProof: { component: SurabayaKalimasProof, frames: SURABAYA_KALIMAS_PROOF_FRAMES },
  SurabayaFilm: { component: SurabayaFilm, frames: SURABAYA_FILM_FRAMES },
  PelabuhanIlustrasi: { component: PelabuhanIlustrasi, frames: PELABUHAN_FRAMES },
  PelabuhanIlustrasiTall: { component: PelabuhanIlustrasiTall, frames: PELABUHAN_FRAMES },
  JajanTeaserProof: { component: JajanTeaserProof, frames: JAJAN_TEASER_PROOF_FRAMES },
  JajanTeaserShot7: { component: JajanTeaserShot7, frames: JAJAN_SHOT7_FRAMES },
  DicariShot3: { component: DicariShot3, frames: DICARI_SHOT3_FRAMES },
  LapakShot4: { component: LapakShot4, frames: LAPAK_SHOT4_FRAMES },
  UjiCharm: { component: UjiCharm, frames: 2 },
  TeaserLapak: { component: TeaserLapak, frames: TEASER_LAPAK_FRAMES },
  UjiTubuh: { component: UjiTubuh, frames: 90 },
  UjiBadan: { component: UjiBadan, frames: 6 },
  DesainCharm: { component: DesainCharm, frames: DESAIN_CHARM_FRAMES },
  UjiFlanel: { component: UjiFlanel, frames: 1 },
  GayaTeaser: { component: GayaTeaser, frames: GAYA_TEASER_FRAMES },
  TeaserGacha: { component: TeaserGacha, frames: GACHA_FRAMES },
  TeaserStopMotion: { component: TeaserStopMotion, frames: STOP_MOTION_FRAMES },
  TeaserGachaKartun: { component: TeaserGacha, frames: GACHA_FRAMES },
  TeaserGachaKertas: { component: TeaserGacha, frames: GACHA_FRAMES },
  TeaserStopMotionKartun: { component: TeaserStopMotion, frames: STOP_MOTION_FRAMES },
  TeaserStopMotionKertas: { component: TeaserStopMotion, frames: STOP_MOTION_FRAMES },
  TeaserAsmr: { component: TeaserAsmr, frames: ASMR_FRAMES },
  TeaserTudung: { component: TeaserTudung, frames: TEASER_TUDUNG_FRAMES },
  TeaserMisteriFrame: { component: TeaserMisteriFrame, frames: TEASER_MISTERI_FRAMES },
  TeaserMisteri: { component: TeaserMisteriVideo, frames: TEASER_MISTERI_VIDEO_FRAMES },
  LogoJajan: { component: LogoJajan, frames: LOGO_FRAMES },
  StoryPasarFrame: { component: StoryPasarFrame, frames: STORY_PASAR_FRAMES },
  StoryTukeranFrame: { component: StoryTukeranFrame, frames: STORY_TUKERAN_FRAMES },
  StoryPasarMinggu: { component: StoryPasarVideo, frames: STORY_PASAR_VIDEO_FRAMES },
  LogoJajanFinal: { component: LogoJajan, frames: 1 },
  TeaserTudungKertas: { component: TeaserTudung, frames: TEASER_TUDUNG_FRAMES },
};

// films written by `mk agent` (scenes/gen/<slug>/index.tsx exporting Scene and FRAMES) register themselves
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (require as any).context('./gen', true, /^\.\/[^/]+\/index\.tsx$/);
const GEN: { id: string; component: React.FC; frames: number }[] = (ctx.keys() as string[])
  .map((k) => ({ id: `Gen-${k.split('/')[1]}`, mod: ctx(k) }))
  .filter((g) => g.mod.Scene && g.mod.FRAMES)
  .map((g) => ({ id: g.id, component: g.mod.Scene, frames: g.mod.FRAMES }));

export const SceneCompositions: React.FC = () => (
  <>
    <Composition id="UsageMeterReels" component={UsageMeter} width={1080} height={1920} fps={30} durationInFrames={USAGE_METER_FRAMES} />
    {/* frame-accurate 30 fps film on the what-if-sim template */}
    <Composition id="WhatIfGravity" component={WhatIfGravity} width={1080} height={1920} fps={30} durationInFrames={WHATIF_GRAVITY_FRAMES} />
    <Composition id="AsetUji3D" component={AsetUji3D} width={1280} height={720} fps={30} durationInFrames={ASET_UJI_FRAMES} />
    {SCENES.filter((s) => COMPONENTS[s.id]).map((s) => (
      <Composition key={s.id} id={s.id} component={COMPONENTS[s.id].component} width={s.width} height={s.height} fps={60} durationInFrames={COMPONENTS[s.id].frames} defaultProps={{ ...(s.props ?? {}), ...(s.vo ? { vo: null } : {}), ...(s.sfx ? { sfx: false } : {}) }} />
    ))}
    {GEN.map((g) => (
      <Composition key={g.id} id={g.id} component={g.component} width={1920} height={1080} fps={60} durationInFrames={g.frames} />
    ))}
  </>
);
