// `mk storyboard "<brief>"`: a draft treatment.md chosen by rule, not by a model. It matches the brief to library assets,
// picks the look the library can serve best, borrows rhythm and camera from the closest finished film (catatan.ts),
// splits the seconds into shots and marks what is missing. Pure: the CLI passes in items, films and notes.
import { GAYA, gayaBySlug, type GayaSlug } from '../styles';
import { catatanFilm, type CatatanFilm, type Ritme } from '../scenes/catatan';
import { cariAset } from './matriks';
import type { LibraryItem } from './types';

export type Rasio = '9:16' | '16:9';
export type FilmInfo = { id: string; width: number; height: number };
export type Masukan = { brief: string; rasio: Rasio; detik: number; gaya?: GayaSlug };

const STOP = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'saat', 'ketika', 'untuk', 'dengan', 'pada', 'itu', 'ini', 'atau', 'the', 'and', 'with', 'for', 'dalam', 'akan', 'bisa', 'ada', 'oleh', 'sebuah', 'seorang', 'lalu', 'kemudian']);

export const rasioFilm = (f: FilmInfo): Rasio => (f.height > f.width ? '9:16' : '16:9');

export const kataBrief = (brief: string) =>
  [...new Set(brief.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w)))];

/** benda the brief asks for, in order of first mention, and the words that matched no asset */
export const bendaDariBrief = (brief: string, items: LibraryItem[]) => {
  const benda: string[] = [];
  const tanpa: string[] = [];
  for (const w of kataBrief(brief)) {
    const hit = cariAset(w, undefined, items).map((h) => h.benda);
    if (!hit.length) tanpa.push(w);
    for (const b of hit) if (!benda.includes(b)) benda.push(b);
  }
  return { benda, tanpa };
};

export const pilihGaya = (m: Masukan, benda: string[], items: LibraryItem[], films: FilmInfo[]) => {
  if (m.gaya) return { gaya: m.gaya, alasan: `gaya dipilih manual (--gaya ${m.gaya})`, skor: 1 };
  const ada = (g: GayaSlug, b: string) => items.some((i) => i.meta.gaya === g && i.meta.benda === b);
  const skor = GAYA.map((g) => {
    const punya = benda.filter((b) => ada(g.slug, b)).length;
    const cocok = films.filter((f) => catatanFilm(f.id)?.gaya === g.slug && rasioFilm(f) === m.rasio).length;
    const total = films.filter((f) => catatanFilm(f.id)?.gaya === g.slug).length;
    return { g, punya, skor: (benda.length ? punya / benda.length : 0) + (cocok ? 0.15 : 0), total };
  }).sort((a, b) => b.skor - a.skor || b.total - a.total || a.g.slug.localeCompare(b.g.slug));
  const t = skor[0];
  return { gaya: t.g.slug, skor: t.skor, alasan: benda.length ? `${t.punya} dari ${benda.length} benda sudah ada` : 'tidak ada benda yang cocok, dipilih dari film yang ada' };
};

export const pilihAcuan = (m: Masukan, gaya: GayaSlug, films: FilmInfo[]) => {
  const cand = films
    .map((f) => ({ f, c: catatanFilm(f.id) }))
    .filter((x): x is { f: FilmInfo; c: CatatanFilm } => !!x.c && x.c.gaya === gaya)
    .sort((a, b) => Number(rasioFilm(b.f) === m.rasio) - Number(rasioFilm(a.f) === m.rasio) || Math.abs(a.c.detik - m.detik) - Math.abs(b.c.detik - m.detik) || a.f.id.length - b.f.id.length || a.f.id.localeCompare(b.f.id));
  return cand[0];
};

const BAGI: Record<Ritme, [string, number][]> = {
  'beat-sheet': [['SETUP', 0.2], ['BELOKAN', 0.3], ['AKIBAT', 0.3], ['PENUTUP', 0.2]],
  'masalah-solusi': [['MASALAH', 0.3], ['AGITASI', 0.3], ['SOLUSI', 0.4]],
  'peta-energi': [['NAIK 1', 0.25], ['PUNCAK 1', 0.25], ['NAIK 2', 0.25], ['PUNCAK 2', 0.25]],
  'hook-hold-payoff': [],
};

/** shots with a job and a length in seconds (one decimal); the lengths always sum to exactly `detik` */
export const bagiShot = (ritme: Ritme, detik: number) => {
  let plan: [string, number][] = BAGI[ritme];
  if (ritme === 'hook-hold-payoff') {
    const holds = Math.min(4, Math.max(1, Math.round(detik / 8)));
    plan = [['HOOK', 0.15], ...Array.from({ length: holds }, (_, i): [string, number] => [`HOLD ${i + 1}`, 0.55 / holds]), ['PAYOFF', 0.3]];
  }
  const durasi = plan.map(([, p]) => Math.round(p * detik * 10) / 10);
  durasi[durasi.length - 1] = Math.round((detik - durasi.slice(0, -1).reduce((a, b) => a + b, 0)) * 10) / 10;
  return plan.map(([tugas], i) => ({ tugas, detik: durasi[i] }));
};

const bagiBenda = (benda: string[], n: number) => Array.from({ length: n }, (_, i) => benda.slice(Math.floor((i * benda.length) / n), Math.floor(((i + 1) * benda.length) / n)));

export const susunStoryboard = (m: Masukan, items: LibraryItem[], films: FilmInfo[]) => {
  const { benda, tanpa } = bendaDariBrief(m.brief, items);
  const g = pilihGaya(m, benda, items, films);
  const gaya = gayaBySlug(g.gaya)!;
  const acuan = pilihAcuan(m, g.gaya, films);
  const ritme: Ritme = acuan?.c.ritme ?? (m.detik < 30 ? 'hook-hold-payoff' : 'beat-sheet');
  const kamera = acuan?.c.kamera ?? ['tetap'];
  const shots = bagiShot(ritme, m.detik);
  const per = bagiBenda(benda, shots.length);
  const idAset = (b: string) => items.find((i) => i.meta.benda === b && i.meta.gaya === g.gaya)?.meta.id;
  const lain = (b: string) => items.filter((i) => i.meta.benda === b && i.meta.gaya !== g.gaya).map((i) => i.meta.id);
  const hilang = benda.filter((b) => !idAset(b));
  const tandai = (b: string) => (idAset(b) ? `\`${idAset(b)}\`` : `BELUM ADA — \`mk aset baru ${b} ${g.gaya}\`${lain(b).length ? ` (acuan: ${lain(b).map((x) => `\`${x}\``).join(', ')})` : ''}`);
  const akhir = shots.reduce<number[]>((acc, s) => [...acc, Math.round(((acc[acc.length - 1] ?? 0) + s.detik) * 10) / 10], []);

  const baris = shots.map((s, i) => `Shot ${i + 1} (~${s.detik} s)   ${s.tugas.padEnd(8)} ${per[i].length ? per[i].join(', ') : 'ISI: apa yang terjadi'}`).join('\n');
  const blok = shots.map((s, i) => `### Shot ${i + 1}: ${s.tugas} (${Math.round((akhir[i] - s.detik) * 10) / 10}–${akhir[i]} s)

| | |
|---|---|
| In frame | ${per[i].length ? per[i].map(tandai).join('; ') : 'ISI'} |
| Reference | ${per[i].map((b) => (idAset(b) ? `refs.md dari \`${idAset(b)}\`` : 'invented')).join('; ') || 'ISI'} |
| Camera | ${kamera.join(' / ')}${acuan ? ` (seperti ${acuan.f.id})` : ''} |
| Grid | ISI: garis cakrawala dan titik subjek |
| Beats | ISI: nama dan panjang beat |
| Narration | ISI |
| Sound | ISI |
| Text on screen | ISI atau tidak ada |
| Cut in | ISI: dissolve / ink / leak |
`).join('\n');

  const md = `# Treatment: draf dari \`mk storyboard\`

Draf berbasis aturan. Tiap bagian bertanda ISI harus dilengkapi orang; pilihan lain boleh diubah. Setujui sebelum menggambar (AGENTS.md aturan 3).

## Layer 1: brief

| | |
|---|---|
| Brief | ${m.brief} |
| Format | ${m.rasio}, ${m.detik} s |
| Gaya | ${gaya.nama} (\`${g.gaya}\`): ${g.alasan} |
| Film acuan | ${acuan ? `${acuan.f.id} (${acuan.c.format}, ${acuan.c.detik} s)${acuan.c.pelajaran ? `: ${acuan.c.pelajaran}` : ''}` : 'belum ada film di gaya ini'} |
| Goal / Audience / One line / Tone | ISI |
| Voice / Sources | ISI |

## Layer 2: skeleton

Ritme: \`${ritme}\`${acuan ? ` (dari ${acuan.f.id})` : ` (bawaan untuk ${m.detik} s)`}. Kamera: ${kamera.join(', ')}.

\`\`\`
${baris}
\`\`\`

## Aset

Benda dicocokkan lewat nama dan tag, jadi sebagian hanya saran (misalnya hujan memunculkan poncho). Hapus yang tidak perlu.

${benda.length ? benda.map((b) => `- ${b}: ${tandai(b)}`).join('\n') : '- tidak ada benda yang cocok dengan pustaka'}
${hilang.length ? `\nYang belum ada di gaya \`${g.gaya}\`: ${hilang.join(', ')}. Buat dengan \`mk aset prompt <benda> ${g.gaya}\` lalu \`mk aset baru <benda> ${g.gaya}\`.\n` : ''}${tanpa.length ? `\nKata yang tidak cocok aset mana pun (bila ada yang benda, buat asetnya): ${tanpa.join(', ')}.\n` : ''}
## Layer 3: satu blok per shot

${blok}
## Gate

Pengguna sudah membaca treatment ini dan bilang ya. Baru tulis skrip dan storyboard.
`;
  return { md, gaya: g.gaya, benda, hilang, tanpa, ritme, kamera, shots, acuan: acuan?.f.id };
};
