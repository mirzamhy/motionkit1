# Inventaris pelepasan kode port

Tanggal: 2026-10-27. Baseline lokal: `c46eb2ac27fff254f1e3cd278384842dc9dc6399`.

Commit tersebut mencatat port as-is. Status identik membandingkan isi setelah normalisasi CRLF/LF; status diubah tidak membuktikan asal independen. Ini inventaris teknis, bukan penilaian hukum atau perbandingan upstream.

| File | Status terhadap baseline |
|---|---|
| `.env.example` | identik |
| `apps/cli/agent.ts` | diubah; perlu audit |
| `apps/cli/audio.ts` | diubah; perlu audit |
| `apps/cli/balance.ts` | identik |
| `apps/cli/code.ts` | identik |
| `apps/cli/dns.ts` | identik |
| `apps/cli/env.ts` | identik |
| `apps/cli/index.ts` | diubah; perlu audit |
| `apps/cli/lint.ts` | diubah; perlu audit |
| `apps/cli/llm.ts` | identik |
| `apps/cli/paths.ts` | diubah; perlu audit |
| `apps/cli/pipeline.ts` | diubah; perlu audit |
| `apps/cli/render.ts` | diubah; perlu audit |
| `apps/cli/target.ts` | identik |
| `bin/mk.mjs` | identik |
| `examples/mimo-v2.6-pro/brief.md` | identik |
| `examples/mimo-v2.6-pro/facts.md` | identik |
| `examples/mimo-v2.6-pro/spec.json` | identik |
| `examples/mimo-v2.6-pro/words.json` | identik |
| `packages/core/src/Root.tsx` | diubah; perlu audit |
| `packages/core/src/Spot.tsx` | diubah; perlu audit |
| `packages/core/src/code/CodeSpot.tsx` | identik |
| `packages/core/src/code/placeholder.tsx` | identik |
| `packages/core/src/engine/atoms.tsx` | diubah; perlu audit |
| `packages/core/src/engine/director.ts` | identik |
| `packages/core/src/engine/fit.ts` | identik |
| `packages/core/src/engine/fonts.ts` | diubah; perlu audit |
| `packages/core/src/engine/looks.ts` | diubah; perlu audit |
| `packages/core/src/engine/reveals.ts` | diubah; perlu audit |
| `packages/core/src/engine/timeline.ts` | identik |
| `packages/core/src/engine/types.ts` | identik |
| `packages/core/src/engine/util.ts` | identik |
| `packages/core/src/engine/world.tsx` | identik |
| `packages/core/src/engines/FlyThrough.tsx` | diubah; perlu audit |
| `packages/core/src/engines/Kinetic.tsx` | diubah; perlu audit |
| `packages/core/src/engines/Poster.tsx` | diubah; perlu audit |
| `packages/core/src/engines/shared.tsx` | identik |
| `packages/core/src/index.ts` | identik |
| `packages/core/src/kinetic/renderers.tsx` | diubah; perlu audit |
| `packages/core/src/kit/fonts.ts` | identik |
| `packages/core/src/kit/fx.tsx` | identik |
| `packages/core/src/kit/index.ts` | diubah; perlu audit |
| `packages/core/src/kit/text.tsx` | identik |
| `packages/core/src/kit/three.tsx` | identik |
| `packages/core/src/kit/ui.tsx` | identik |
| `packages/core/src/kit/vo.tsx` | identik |
| `packages/core/src/spec/schema.ts` | diubah; perlu audit |
| `packages/core/src/spec/script.ts` | identik |
| `packages/core/src/widgets/agents.tsx` | identik |
| `packages/core/src/widgets/cards.tsx` | diubah; perlu audit |
| `packages/core/src/widgets/hero.tsx` | identik |
| `packages/core/src/widgets/index.ts` | sudah dihapus |
| `packages/core/src/widgets/price.tsx` | identik |
| `packages/core/src/widgets/text.tsx` | diubah; perlu audit |
| `prompts/agent.md` | identik |
| `prompts/builder.md` | diubah; perlu audit |
| `prompts/coder.md` | identik |
| `prompts/concept-code.md` | identik |
| `prompts/concept.md` | identik |
| `prompts/kit.md` | identik |
| `prompts/script.md` | identik |
| `prompts/styles.md` | identik |
| `prompts/verifier.md` | identik |
| `remotion.config.ts` | identik |
| `skill/remotion-opus/SKILL.md` | sudah dihapus |

## Dependensi yang perlu diputus

- `scenes/film.tsx`, `scenes/lib.ts`, banyak shot, dan beberapa lab memakai `engine/util`.
- `PizzaScene.tsx` memakai `engine/fonts` untuk pasangan editorial.
- `Root.tsx` memasukkan komposisi spec/code dan import schema/timeline lama.
- `apps/cli/scene.ts` dan `gate.ts` memakai bundler `render.ts`; CLI memuat pipeline model/API lama.
- `sceneAgent.ts` memakai `agent.ts`, `env.ts`; fitur agent API bukan cakupan scene-only baru.
- `kit/index.ts` mengekspor modul port sekaligus tiga modul MotionKit baru. Tiga modul baru harus dipertahankan.
- `scripts/demo-4a.ts`, `demo-4b.ts`, `demo-4c.ts`, `frames.ts`, dan `transition-strips.ts` bergantung pada spec lama.

## Batas audit

File yang ditambahkan setelah baseline juga harus diperiksa untuk salinan/potongan kode port. Daftar baseline saja belum membuktikan seluruh source tree bersih. Riwayat Git dan media proyek pengguna tidak dihapus oleh migrasi ini.
