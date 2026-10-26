# The item library: research, build, keep

Every film needs things: boats, buildings, carts, stalls, people in period dress. Draw each one once, well, from
references, and keep it in the library so the next film starts from it instead of from a blank page. The library is
`packages/core/src/library/<category>/<item-id>/`.

## The workflow, for every task

1. **List the items** the storyboard needs: every object, building, vehicle, plant and kind of person on screen.
2. **Search first.** `node bin/mk.mjs item find <words>` (Indonesian or English) and `mk kit find`. Use what is there;
   if it is close but not right, add a variant to it rather than drawing a second one.
3. **Research what is missing.** Before drawing, find references:
   - photos with a clear licence: Wikimedia Commons (Tropenmuseum, KITLV, Nationaal Archief collections), museum open
     access, or photos the user sends;
   - write the item's `refs.md`: each photo's title, date, licence, URL, and **what you see in it** (proportions,
     shapes, materials, colours, details) and the real size you read from it (compare with a person in the photo);
   - keep downloaded photos in `projects/library-refs/` (never committed); the URLs let anyone fetch them again;
   - anything drawn without a reference is listed under "Rekaan" in `refs.md` and in `meta.invented`.
4. **Build it** in its folder, from `index.tsx`:
   - `meta` (`ItemMeta`): id, name, category, tags in both languages, era, region, real size in metres, variants,
     path of `refs.md`, invented parts;
   - `Item2D` (SVG) and/or `Item3D` (react-three-fiber), taking the shared props (`types.ts`):
     2D is drawn in metres times `s` px/m with (x, y) where it meets the ground or water, sun from the upper left;
     3D is in metres with the origin at the centre of its base;
   - draw it as CRAFT.md asks: three tones per form, texture by pattern or a static filter, seeded detail, a contact
     shadow, small motion on the ambient clock (`t`), variants for its states (sail furled/set, door open/shut, …).
   - A 3D item made from a downloaded model wraps the GLB (`mk asset … get`, `mk asset check --expect <metres>`) and
     scales it to its real size.
5. **Register it**: one line in `packages/core/src/library/index.ts`. The catalog picks it up, so `mk kit find` and
   `mk item find` list it. Items are named `<benda>-<gaya>` and carry `benda` and `gaya` in `meta`; make the skeleton with `mk aset baru <benda> <gaya>`; films use items through `<Aset>`/`<Aset3D>`.
6. **Preview and look.** `node bin/mk.mjs item preview <id>` renders `out/items/<id>/preview-2d.jpg` (every variant
   beside a 1.65 m person and a metre rule) and `preview-3d.jpg` (four angles, measured size). Open them, compare
   with the references, fix, render again.
7. **Use it in the scene**, and when the scene teaches you something about the item (a better silhouette, a new
   state), put the fix back into the item, not only into the scene.

## Where things go

| What | Where | Committed |
|---|---|---|
| item code, `meta`, `refs.md` | `packages/core/src/library/<category>/<id>/` | yes |
| reference photos | `projects/library-refs/` | no (rule 9); URLs in `refs.md` |
| downloaded models and textures | `projects/<project>/public/…` with `asset.json` (`mk asset note`) | no; provenance yes |
| preview sheets | `out/items/<id>/` | no |

## Categories

`kendaraan-air` (boats), `kendaraan-darat` (carts, cars, trams), `bangunan` (buildings and parts), `properti`
(props: crates, bollards, tools), `alam` (plants, rocks, water features), `orang` (people and costumes).
