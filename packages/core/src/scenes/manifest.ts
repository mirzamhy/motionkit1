// Scene registry — plain data, safe to import from the CLI (no React here). Add one line per scene composition.
//   project: folder under projects/ whose `public/` holds this scene's assets (voice-over, music)
//   vo:      file name of the voice-over inside that public folder; passed to the scene as the `vo` prop when present
export type SceneInfo = { id: string; about: string; width: number; height: number; project?: string; vo?: string; props?: Record<string, unknown> };

export const SCENES: SceneInfo[] = [
  { id: 'PizzaScene', about: 'Proof scene: the two pizzas (room, door, top-down pizza). 14 s.', width: 1920, height: 1080, props: { portrait: false } },
  { id: 'PizzaScenePortrait', about: 'The same scene framed for phones.', width: 1080, height: 1920, props: { portrait: true } },
  { id: 'UnairScenePortrait', about: 'The same film framed for phones (1080×1920).', width: 1080, height: 1920, project: 'unair-sejarah', vo: 'vo.mp3', props: { portrait: true } },
  { id: 'UnairScene', about: 'Film: the founding of Universitas Airlangga. Nine shots, cut to a voice-over. 116 s.', width: 1920, height: 1080, project: 'unair-sejarah', vo: 'vo.mp3' },
];
