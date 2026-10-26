// What a film is, in the terms `mk storyboard` reasons with: look, format, camera, rhythm, and one lesson. Plain data
// (no React), safe for the CLI. Size and fps live in manifest.ts; the assets a film uses are read from its code by
// `mk film`. Add an entry when a film is finished (docs/scenes/WORKFLOW.md, last step).
import type { GayaSlug } from '../styles';

export type Kamera = 'tetap' | 'satu-ambilan' | 'lompat-antar-tokoh' | 'orbit' | 'dorong-masuk' | 'potong-cepat';
export type Ritme = 'beat-sheet' | 'hook-hold-payoff' | 'masalah-solusi' | 'peta-energi';

export type CatatanFilm = {
  gaya: GayaSlug;
  /** 'rantai-andai', 'teaser', 'explainer', 'dokumenter', 'storytelling', 'bukti' (a proof shot) */
  format: string;
  kamera: Kamera[];
  ritme: Ritme;
  /** length in seconds */
  detik: number;
  /** one or two sentences: what worked or failed */
  pelajaran?: string;
};

export const KAMERA: Kamera[] = ['tetap', 'satu-ambilan', 'lompat-antar-tokoh', 'orbit', 'dorong-masuk', 'potong-cepat'];
export const RITME: Ritme[] = ['beat-sheet', 'hook-hold-payoff', 'masalah-solusi', 'peta-energi'];

export const CATATAN: Record<string, CatatanFilm> = {
  StikAndaiOjol: { gaya: 'stik', format: 'rantai-andai', kamera: ['lompat-antar-tokoh'], ritme: 'hook-hold-payoff', detik: 12, pelajaran: 'Kamera meloncat antar tokoh di satu jalan; gelembung pikiran berantai; satu aksen hangat hanya di akhir.' },
  StikAndaiRumah: { gaya: 'stik', format: 'rantai-andai', kamera: ['lompat-antar-tokoh'], ritme: 'hook-hold-payoff', detik: 13, pelajaran: 'Cuaca adalah parameter film, bukan bagian gaya: satu film, tiga suasana.' },
  WhatIfGravity: { gaya: 'poly3d', format: 'explainer', kamera: ['orbit', 'potong-cepat'], ritme: 'beat-sheet', detik: 106, pelajaran: 'Simulasi dihitung di muka dan di-cache supaya tiap frame bisa dirender sendiri; portrait, loop.' },
  UnairScene: { gaya: 'ilustrasi', format: 'dokumenter', kamera: ['dorong-masuk', 'tetap'], ritme: 'beat-sheet', detik: 116, pelajaran: 'Sembilan shot dipotong mengikuti voice-over rekaman; fakta tiap shot ditelusuri ke facts.md.' },
  PizzaScene: { gaya: 'ilustrasi', format: 'bukti', kamera: ['tetap', 'potong-cepat'], ritme: 'hook-hold-payoff', detik: 14, pelajaran: 'Satu adegan dengan tiga set-up kamera, landscape dan portrait dari kode yang sama.' },
  SurabayaFilm: { gaya: 'ilustrasi', format: 'dokumenter', kamera: ['tetap'], ritme: 'beat-sheet', detik: 55 },
  PelabuhanIlustrasi: { gaya: 'ilustrasi', format: 'bukti', kamera: ['tetap'], ritme: 'beat-sheet', detik: 11, pelajaran: 'Pelabuhan rekaan 1920-an dari item pustaka (perahu, gudang, tiang tambat) menunjukkan aset dipakai lintas film.' },
  TeaserTudung: { gaya: 'flanel', format: 'teaser', kamera: ['satu-ambilan'], ritme: 'hook-hold-payoff', detik: 60, pelajaran: 'Satu dunia pasar dan kamera one-take dengan narasi bisik; versi papercraft memakai kode yang sama.' },
  TeaserLapak: { gaya: 'flanel', format: 'teaser', kamera: ['dorong-masuk'], ritme: 'hook-hold-payoff', detik: 30 },
  StoryPasarMinggu: { gaya: 'flanel', format: 'storytelling', kamera: ['potong-cepat'], ritme: 'beat-sheet', detik: 51 },
};

/** the note of a film, or of the film it is a variant of (StikAndaiOjolGerimis -> StikAndaiOjol): the longest key that prefixes the id */
export const catatanFilm = (id: string, catatan: Record<string, CatatanFilm> = CATATAN): CatatanFilm | undefined =>
  catatan[id] ?? Object.keys(catatan).filter((k) => id.startsWith(k)).sort((a, b) => b.length - a.length).map((k) => catatan[k])[0];
