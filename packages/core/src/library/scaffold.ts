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

/** import identifier: prefixed so it is never a reserved word and never starts with a digit; '-' becomes '_' so names stay unique */
const ident = (s: string) => `a_${s.replace(/-/g, '_')}`;

export const kerangka = (benda: string, gaya: string, ada: Set<string>) => {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(benda)) throw new Error(`benda "${benda}" harus diawali huruf, lalu huruf kecil/angka dengan strip`);
  const g = gayaBySlug(gaya);
  if (!g) throw new Error(`gaya "${gaya}" bukan slug terdaftar (mk gaya list)`);
  if (g.slug === 'stik') throw new Error('Stik Polos memakai kerangkaStik (part({...}) di library/stik-polos/index.tsx)');
  if (!g.folder) throw new Error(`gaya ${g.slug} belum punya folder di styles/index.ts`);
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
    itemImport: `import * as ${ident(benda)} from './${benda}';`,
    itemName: ident(benda),
    refsNote: `\n## ${id}\n\nBELUM ADA ACUAN. Tulis di sini foto/gambar yang dipakai, apa yang terlihat, ukuran nyata, dan bagian yang direka.\n`,
  };
};

/**
 * All text edits for one `mk aset baru`, computed in memory before anything is written, so a missing marker throws
 * while the disk is still untouched. `top`/`idx`/`refs` are the current file texts (undefined when the file does not exist yet).
 */
export const rencanaTulis = (k: ReturnType<typeof kerangka>, gaya: string, cur: { top: string; idx?: string; refs?: string }) => {
  let top: string | undefined;
  if (cur.idx === undefined) {
    top = sisipkan(cur.top, '// aset:impor-gaya', k.indexImport);
    top = sisipkan(top, '// aset:daftar-gaya', k.indexList);
  }
  let idx = cur.idx ?? k.indexNew;
  idx = sisipkan(idx, '// aset:impor', k.itemImport);
  idx = sisipkan(idx, '// aset:daftar', `${k.itemName},`);
  const refs = (cur.refs ?? `# ${gaya}: acuan\n`) + k.refsNote;
  return { top, idx, refs };
};

/** Stik Polos parts live in one index (`part({...})`), so a new one is an entry inserted at `// aset:daftar-stik`. */
export const kerangkaStik = (benda: string, ada: Set<string>) => {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(benda)) throw new Error(`benda "${benda}" harus diawali huruf, lalu huruf kecil/angka dengan strip`);
  const id = `${benda}-stik`;
  if (ada.has(id)) throw new Error(`aset "${id}" sudah ada`);
  const entry = [
    `part({`,
    `    id: '${id}', nama: '${benda} (BELUM DIGAMBAR)', kategori: 'properti',`,
    `    tags: ['${benda}'],`,
    `    bbox: [-75, -150, 75, 0], anchor: [0, 0],`,
    `    invented: ['BELUM DIGAMBAR: kotak penanda, ganti dengan gambar asli'],`,
    `    draw: () => (`,
    `      <g>`,
    `        <rect x={-75} y={-150} width={150} height={150} fill="#cc3333" fillOpacity={0.3} stroke="#cc3333" strokeWidth={4} />`,
    `        <text x={0} y={-70} textAnchor="middle" fontSize={20} fill="#cc3333">BELUM DIGAMBAR</text>`,
    `      </g>`,
    `    ),`,
    `  }),`,
  ].join('\n');
  return {
    id,
    entry,
    refsNote: `\n## ${id}\n\nBELUM ADA ACUAN. Tulis di sini foto/gambar yang dipakai, apa yang terlihat, ukuran nyata, dan bagian yang direka.\n`,
  };
};

export const rencanaStik = (k: ReturnType<typeof kerangkaStik>, cur: { idx: string; refs: string }) => ({
  idx: sisipkan(cur.idx, '// aset:daftar-stik', k.entry),
  refs: cur.refs + k.refsNote,
});
