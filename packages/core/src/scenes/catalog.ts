// What the scene kit already has, written for an agent deciding whether to draw something new. Ideas from
// ali-abassi/remotion-templates (agent catalog: role, uses, constraints per entry) and av/remotion-bits (`find`:
// a query scored against id, name, tags and description). Search with `mk kit find <words>`.
// Keep this list in step with docs/scenes/KIT.md: one entry per part another film could use unchanged.

export type KitEntry = {
  id: string;
  /** where it lives, relative to packages/core/src/scenes unless the path says otherwise */
  file: string;
  kind: 'component' | 'helper' | 'prop' | 'pattern';
  role: string;
  use: string;
  avoid?: string;
  example?: string;
  /** search words, Indonesian and English */
  tags: string[];
};

export const KIT: KitEntry[] = [
  { id: 'Film', file: 'film.tsx', kind: 'component', role: 'Runs a film from a list of shots: dissolves, captions, label, grade, voice-over passages, sound effects.', use: 'Every scene-mode film; one `Shot` per camera set-up.', example: '<Film shots={SHOTS} fonts={FONTS} vo={vo} />', tags: ['film', 'shot', 'runner', 'dissolve', 'caption', 'grade', 'vo', 'voice', 'suara', 'adegan'] },
  { id: 'Shot.cut', file: 'cuts.tsx', kind: 'prop', role: "How a shot enters: 'dissolve' (24 f), 'ink' (spreading blot, 54 f), 'leak' (dissolve under a warm light leak, 40 f).", use: 'Ink for painted or archive films, leak for a change of time or mood.', avoid: 'Mixing cut families in one film.', example: "{ dur: 300, cut: 'ink', draw: … }", tags: ['transition', 'transisi', 'cut', 'ink', 'tinta', 'leak', 'cahaya', 'dissolve', 'pergantian'] },
  { id: 'Film.words', file: 'wordcaps.tsx', kind: 'prop', role: 'Word-by-word captions from voice timings; the spoken word lit, pages of up to 4 words split at pauses.', use: 'Films voiced with edge-tts (apps/cli/edge_say.py writes the timings).', avoid: 'Human recordings without word timings.', example: '<Film … words={words} />', tags: ['caption', 'subtitle', 'teks', 'kata', 'karaoke', 'word', 'timing', 'tts'] },
  { id: 'Film.bed.duck', file: 'film.tsx', kind: 'prop', role: 'Dips the looping music bed while a voice passage plays (0.3 ≈ −10 dB, eased over 15 frames).', use: 'Any film with a bed and a voice-over.', example: "bed={{ file: 'pad', vol: 0.05, duck: 0.3 }}", tags: ['audio', 'music', 'musik', 'duck', 'ducking', 'bed', 'volume', 'suara'] },
  { id: 'beats', file: 'beats.ts', kind: 'helper', role: 'Named beats in order with lengths and gaps (negative overlaps); T.p(t, name) is 0→1 over a beat. Lengthening one moves the later ones.', use: 'Any shot with more than two timed actions, instead of loose frame numbers.', example: "const T = beats([['raih', 30, 12], ['serah', 20, 2]]); T.p(f, 'serah')", tags: ['timing', 'waktu', 'beat', 'timeline', 'frame', 'jadwal', 'tempo', 'hold', 'tahan'] },
  { id: 'BeatBar', file: 'debug.tsx', kind: 'component', role: 'Debug overlay: beat lanes, active beat lit, playhead, drawn into the frame.', use: 'Debug compositions; pair with a pure pose(T, f) to draw motion paths into a still.', avoid: 'Final renders.', example: '<BeatBar at={T.at} t={f} total={end} width={1280} />', tags: ['debug', 'timeline', 'beat', 'playhead', 'jalur', 'path', 'cek'] },
  { id: 'LowerThird / ChapterCard / Letterbox', file: 'titles.tsx', kind: 'component', role: "Name and role card, chapter card over a dimmed shot, cinematic bars; styles 'modern' and 'arsip'.", use: "Documentaries and history films, through a shot's `over` so portrait framing does not crop them.", avoid: 'More than one title family per film.', example: "over: (u, a, W, H) => <LowerThird u={u} at={30} until={200} name='Pak Darmo' role='Penjual sayur' W={W} H={H} />", tags: ['judul', 'title', 'nama', 'lower third', 'bab', 'chapter', 'letterbox', 'sinematik', 'dokumenter', 'teks'] },
  { id: 'prog / kf / pop / bump', file: '../engine/util.ts', kind: 'helper', role: 'Eased 0→1 between frames, keyframes with per-segment easing, springy overshoot, 0→1→0.', use: 'Every animated value; never a jump in one frame.', example: 'prog(u, 30, 60, outE)', tags: ['easing', 'animasi', 'keyframe', 'spring', 'interpolate', 'gerak'] },
  { id: 'rng', file: 'kit.tsx', kind: 'helper', role: 'Seeded random: the same sequence every frame.', use: 'Anything you would copy-paste: leaves, tiles, crowds, stock on a stall.', example: 'const R = rng(7); R()', tags: ['random', 'acak', 'seed', 'procedural', 'prosedural'] },
  { id: 'Cloud', file: 'kit.tsx', kind: 'component', role: 'Soft cloud.', use: 'Skies; drift it with the ambient clock.', example: '<Cloud x={300 + a * 0.08} y={200} />', tags: ['awan', 'cloud', 'sky', 'langit', 'alam', 'nature'] },
  { id: 'Foliage', file: 'kit.tsx', kind: 'component', role: 'Clump of leaf discs that sway.', use: 'Trees, shrubs, hedges, foreground framing.', example: '<Foliage x y r seed t={a} dark light />', tags: ['pohon', 'daun', 'semak', 'tree', 'bush', 'leaf', 'alam', 'nature'] },
  { id: 'Palm', file: 'kit.tsx', kind: 'component', role: 'Leaning ringed palm with arched fronds.', use: 'Tropical streets and coasts.', example: '<Palm x base h t={a} seed />', tags: ['palem', 'kelapa', 'palm', 'tree', 'pohon', 'tropis'] },
  { id: 'Walker', file: 'UnairParts.tsx', kind: 'component', role: 'Person seen from behind, walking or standing, optional cheering.', use: 'People moving through a scene; stagger starts, fade out at a door.', example: '<Walker x y s t={a} ph o={OUTFITS[0]} />', tags: ['orang', 'manusia', 'jalan', 'person', 'people', 'walk', 'crowd', 'kerumunan'] },
  { id: 'CrowdRow', file: 'UnairParts.tsx', kind: 'component', role: 'Row of heads and shoulders close to the lens.', use: 'Audiences, foreground crowds.', tags: ['kerumunan', 'crowd', 'penonton', 'audience', 'orang'] },
  { id: 'OUTFITS / OUTFITS_1954', file: 'UnairParts.tsx', kind: 'helper', role: 'Present-day (backpack, hijab) and 1950s (peci, kebaya) outfit sets.', use: 'Walker clothing by era.', tags: ['pakaian', 'baju', 'hijab', 'peci', 'kebaya', 'outfit', 'era', 'sejarah'] },
  { id: 'Student', file: 'UnairScene.tsx', kind: 'component', role: '1920s pupil: white jacket, shorts, knee socks.', use: 'Colonial-era school scenes.', tags: ['murid', 'pelajar', 'student', 'kolonial', 'sejarah', '1920'] },
  { id: 'Flag', file: 'UnairParts.tsx', kind: 'component', role: 'Waving flag with colour bands.', use: 'Flags on poles, ceremonies.', example: '<Flag x y w h bands={MERAH_PUTIH} t={a} />', tags: ['bendera', 'flag', 'merah putih', 'upacara', 'kain'] },
  { id: 'Cloth', file: 'UnairCloth.tsx', kind: 'component', role: 'Precomputed Verlet cloth dropped over an ellipsoid and pulled by its hem.', use: 'Unveilings and anything where a drawn fake reads wrong; adapt the constants.', tags: ['kain', 'cloth', 'simulasi', 'simulation', 'tirai', 'unveil', 'fisika'] },
  { id: 'HipRoof / Vents / NiasBuilding', file: 'UnairScene.tsx', kind: 'component', role: 'Two-pitch tiled hip roof, vent holes, a whole colonial building.', use: 'Pattern for drawing a real building from photos.', tags: ['gedung', 'bangunan', 'atap', 'rumah', 'building', 'roof', 'kolonial', 'arsitektur'] },
  { id: 'UnairMap', file: 'UnairMap.tsx', kind: 'pattern', role: 'Map from real longitude/latitude, routes that draw on.', use: 'Any map; never draw coastlines from memory.', tags: ['peta', 'map', 'rute', 'route', 'geografi', 'koordinat'] },
  { id: 'Room / TopDown / ScreenShot', file: 'PizzaScene.tsx', kind: 'pattern', role: 'Room interior with lamp and window, top-down table with hands, a typed screen with a click.', use: 'Read before drawing an interior, a table shot or a screen.', tags: ['ruangan', 'kamar', 'meja', 'layar', 'room', 'interior', 'table', 'screen', 'tangan'] },
  { id: 'Grain / Burst / Whip / Confetti / useHits', file: '../kit/fx.tsx', kind: 'component', role: 'Static film grain, radial burst, whip streak, confetti, camera shake/punch/flash for hits.', use: 'Accents on beats; every hit eases in and out.', tags: ['efek', 'fx', 'grain', 'burst', 'confetti', 'shake', 'flash', 'ledakan'] },
  { id: 'tubuh (3D body rig)', file: '../../../three/src/jajan/tubuh.ts', kind: 'pattern', role: 'Three.js body: FK hand with finger joints and pinch solver, two-bone IK legs, gait cycle.', use: '3D characters in ThreeCanvas; check with the UjiTubuh composition first.', avoid: 'useFrame and postprocessing: ThreeCanvas never runs them.', tags: ['3d', 'karakter', 'tubuh', 'rig', 'ik', 'tangan', 'kaki', 'jalan', 'three'] },
  { id: 'market lab (VendorStall, Vendor, MarketExchange)', file: '../../../../scripts/vendor-lab.tsx', kind: 'pattern', role: '3D wooden market stall with produce and scale, procedural vendor with IK arm, a hand-to-hand bag exchange on named beats.', use: 'Indonesian market scenes; lab code, not yet in the kit.', tags: ['pasar', 'lapak', 'penjual', 'pembeli', 'market', 'stall', 'sayur', 'timbangan', '3d'] },
];

const norm = (s: string) => s.toLowerCase();

/** score one entry against the query words: exact id/tag hits weigh most, then name parts, then the prose */
export const scoreKit = (e: KitEntry, query: string) => {
  const words = norm(query).split(/\s+/).filter(Boolean);
  const id = norm(e.id), tags = e.tags.map(norm), prose = norm(`${e.role} ${e.use} ${e.example ?? ''}`);
  let score = 0;
  for (const w of words) {
    let s = 0;
    if (id === w) s = 100;
    else if (id.split(/[^a-z0-9]+/).includes(w)) s = 60;
    else if (tags.includes(w)) s = 50;
    else if (id.includes(w)) s = 35;
    else if (tags.some((t) => t.includes(w))) s = 25;
    else if (prose.includes(w)) s = 10;
    score += s;
  }
  return score;
};

export const findKit = (query: string, limit = 6) =>
  KIT.map((e) => ({ e, s: scoreKit(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
