// `mk aset baru <benda> <gaya>`: the skeleton of a new asset, so a thing is made in the library before a film uses it.
// The skeleton draws a labelled box, so `mk item preview <id>` works straight away.
import { gayaBySlug } from '../styles';

export const sisipkan = (text: string, marker: string, line: string) => {
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.includes(marker));
  if (i < 0) throw new Error(`marker "${marker}" tidak ada`);
  const indent = lines[i].match(/^\s*/)![0];
  lines.splice(i, 0, indent + line);
  return lines.join('\n');
};

const head = (id: string, benda: string, gaya: string, folder: string) => `export const meta: ItemMeta = {
  id: '${id}',
  name: '${benda} (${gaya})',
  category: 'properti', // ganti: kendaraan-air | bangunan | properti | alam | orang | kendaraan-darat
  benda: '${benda}', gaya: '${gaya}',
  tags: ['${benda}'],
  size: [1, 1, 1],
  variants: ['default'],
  refs: 'packages/core/src/library/${folder}/refs.md',
  file: 'packages/core/src/library/${folder}/${benda}.tsx',
  invented: ['BELUM DIGAMBAR: kerangka'],
};
`;

const skeleton2D = (id: string, benda: string, gaya: string, folder: string) => `// ${id}: BELUM DIGAMBAR. Ganti kotak ini dengan gambar aslinya (aturan gaya: lihat \`mk gaya show ${gaya}\`).
import React from 'react';
import type { Item2DProps, ItemMeta } from '../types';

${head(id, benda, gaya, folder)}
export const Item2D: React.FC<Item2DProps> = ({ x, y, s }) => (
  <g transform={\`translate(\${x} \${y}) scale(\${s})\`}>
    <rect x={-0.5} y={-1} width={1} height={1} fill="#c33" stroke="#400" strokeWidth={0.04} />
    <text x={0} y={-0.5} textAnchor="middle" fontSize={0.12} fill="#fff">BELUM DIGAMBAR</text>
  </g>
);
`;

const skeleton3D = (id: string, benda: string, gaya: string, folder: string) => `// ${id}: BELUM DIGAMBAR. Ganti kotak ini dengan modelnya (aturan gaya: lihat \`mk gaya show ${gaya}\`). Meter, titik asal di tengah alas.
import React from 'react';
import type { Item3DProps, ItemMeta } from '../types';

${head(id, benda, gaya, folder)}
// BELUM DIGAMBAR
export const Item3D: React.FC<Item3DProps> = () => (
  <mesh position={[0, 0.5, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshLambertMaterial color="#cc3333" />
  </mesh>
);
`;

const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export const kerangka = (benda: string, gaya: string, ada: Set<string>) => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(benda)) throw new Error(`benda "${benda}" harus huruf kecil/angka dengan strip`);
  const g = gayaBySlug(gaya);
  if (!g) throw new Error(`gaya "${gaya}" bukan slug terdaftar (mk gaya list)`);
  if (g.slug === 'stik') throw new Error('Stik Polos: tambah part({...}) di library/stik-polos/index.tsx (resep: styles/stik-polos/README.md)');
  if (!g.folder) throw new Error('ilustrasi memakai folder kategori lama (library/<kategori>/<id>/index.tsx, lihat docs/scenes/ITEMS.md)');
  const id = `${benda}-${g.slug}`;
  if (ada.has(id)) throw new Error(`aset "${id}" sudah ada`);
  const up = `ITEMS_${g.slug.toUpperCase()}`;
  return {
    id,
    folder: g.folder,
    file: `${g.folder}/${benda}.tsx`,
    content: (g.dimensi === '3d' ? skeleton3D : skeleton2D)(id, benda, g.slug, g.folder),
    /** index.ts of a look that has no folder yet */
    indexNew: `// Assets of the "${g.nama}" look. \`mk aset baru\` inserts at the aset: markers.\nimport type { LibraryItem } from '../types';\n// aset:impor\n\nexport const ${up}: LibraryItem[] = [\n  // aset:daftar\n];\n`,
    indexImport: `import { ${up} } from './${g.folder}';`,
    indexList: `...${up},`,
    itemImport: `import * as ${camel(benda)} from './${benda}';`,
    itemName: camel(benda),
    refsNote: `\n## ${id}\n\nBELUM ADA ACUAN. Tulis di sini foto/gambar yang dipakai, apa yang terlihat, ukuran nyata, dan bagian yang direka.\n`,
  };
};
