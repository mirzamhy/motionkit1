// Scene compositions. To add a scene: write the component, add it to COMPONENTS here and to SCENES in manifest.ts.
import React from 'react';
import { Composition } from 'remotion';
import { SCENES } from './manifest';
import { PIZZA_SCENE_FRAMES, PizzaScene } from './PizzaScene';
import { UNAIR_SCENE_FRAMES, UnairScene } from './UnairFilm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENTS: Record<string, { component: React.FC<any>; frames: number }> = {
  PizzaScene: { component: PizzaScene, frames: PIZZA_SCENE_FRAMES },
  PizzaScenePortrait: { component: PizzaScene, frames: PIZZA_SCENE_FRAMES },
  UnairScene: { component: UnairScene, frames: UNAIR_SCENE_FRAMES },
  UnairScenePortrait: { component: UnairScene, frames: UNAIR_SCENE_FRAMES },
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
    {SCENES.filter((s) => COMPONENTS[s.id]).map((s) => (
      <Composition key={s.id} id={s.id} component={COMPONENTS[s.id].component} width={s.width} height={s.height} fps={60} durationInFrames={COMPONENTS[s.id].frames} defaultProps={{ ...(s.props ?? {}), ...(s.vo ? { vo: null } : {}) }} />
    ))}
    {GEN.map((g) => (
      <Composition key={g.id} id={g.id} component={g.component} width={1920} height={1080} fps={60} durationInFrames={g.frames} />
    ))}
  </>
);
