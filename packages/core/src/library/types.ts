// The item library: things a film needs more than once (boats, buildings, props, people), each researched from
// references, drawn in 2D and/or built in 3D, previewed, and registered so the next film finds it.
// Read docs/scenes/ITEMS.md for the workflow.
import type React from 'react';
import type { GayaSlug } from '../styles';

/** what an item is and where it came from; kept in the item's index.tsx and listed by `mk item find` */
export type ItemMeta = {
  /** unique, kebab-case: 'perahu-lete', 'gudang-pelabuhan' */
  id: string;
  name: string;
  category: 'kendaraan-air' | 'bangunan' | 'properti' | 'alam' | 'orang' | 'kendaraan-darat';
  /** search words, Indonesian and English */
  tags: string[];
  era?: string;
  region?: string;
  /** real size in metres: width (x), height (y), depth (z) */
  size: [number, number, number];
  variants?: string[];
  /** path of the item's refs.md, relative to the repo root */
  refs: string;
  /** the thing: 'gedung', 'rumah-sakit'. id is `${benda}-${gaya}` (naming.ts) */
  benda: string;
  /** the look, a slug from styles/index.ts */
  gaya: GayaSlug;
  /** older ids that still resolve to this item, so a rename never breaks a film */
  aliases?: string[];
  /** names of the original components this item wraps; `mk aset peta` counts a scene that imports one as a user */
  komponen?: string[];
  /** source file relative to the repo root, when it is not <category>/<id>/index.tsx */
  file?: string;
  /** parts drawn without a reference; say so on screen when it matters */
  invented?: string[];
};

/** props every 2D item takes. Drawn in SVG; (x, y) is where the item meets the ground or the waterline;
 *  s is pixels per metre; light is the sun direction in degrees (0 = from the right, 135 = from the upper left). */
export type Item2DProps = { x: number; y: number; s: number; t?: number; seed?: number; variant?: string; light?: number; flip?: boolean };

/** props every 3D item takes. Metres, origin at the centre of its base, +x along its length, +y up. */
export type Item3DProps = { t?: number; seed?: number; variant?: string };

export type LibraryItem = { meta: ItemMeta; Item2D?: React.FC<Item2DProps>; Item3D?: React.FC<Item3DProps> };
