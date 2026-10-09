// Style DNA: what a reference film looks and moves like, measured from the file itself.
//   palette     k-means over sampled frames; accent = most saturated cluster that is actually visible
//   ground      dark / light / mid from the dominant cluster and mean luminance
//   tempo       hard cuts (ffmpeg scene > 0.3) per 10 s
//   flashes     frames that jump to near-white
//   transition  a guess at the family, from tempo / flashes / ground
// Measured, not judged: the look and transition suggested here are starting points the builder can follow.
import { spawnSync } from 'node:child_process';

export type Swatch = { hex: string; share: number };
export type Dna = {
  source: string;
  duration: number;
  fps: number;
  width: number;
  height: number;
  aspect: '16:9' | '9:16' | '1:1' | 'other';
  ground: 'dark' | 'light' | 'mid';
  palette: Swatch[];
  accent: [string, string];
  cuts: number[];
  cutsPer10s: number;
  flashes: number;
  transition: 'camera' | 'fade' | 'flash' | 'color' | 'bar';
};

const run = (args: string[], binary = false) => spawnSync('ffmpeg', args, { encoding: binary ? 'buffer' : 'utf8', maxBuffer: 1 << 28 }) as { stdout: string | Buffer; stderr: string | Buffer; status: number | null };

const probe = (file: string) => {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'json', file], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffprobe failed on ${file}: ${r.stderr}`);
  const j = JSON.parse(r.stdout);
  const s = j.streams[0];
  const [n, d] = String(s.r_frame_rate).split('/').map(Number);
  return { duration: Number(j.format.duration), width: s.width as number, height: s.height as number, fps: Math.round(n / (d || 1)) };
};

const hex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const sat = ([r, g, b]: number[]) => {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
};
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
export const hue = ([r, g, b]: number[]) => {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx === mn) return 0;
  const d = mx - mn;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

/** sampled RGB pixels from ~16 frames (64 px wide for the palette; wider for thin vivid type) */
const pixels = (file: string, duration: number, w = 64) => {
  const r = run(['-v', 'error', '-i', file, '-vf', `fps=${16 / Math.max(1, duration)},scale=${w}:-2:flags=neighbor`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], true);
  const buf = r.stdout as Buffer;
  const px: number[][] = [];
  for (let i = 0; i + 2 < buf.length; i += 3) px.push([buf[i], buf[i + 1], buf[i + 2]]);
  return px;
};

/** deterministic k-means (k-means++ init with a fixed LCG) */
const kmeans = (px: number[][], k: number) => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const c: number[][] = [px[Math.floor(rnd() * px.length)]];
  while (c.length < k) {
    const dist = px.map((p) => Math.min(...c.map((q) => d2(p, q))));
    const tot = dist.reduce((a, v) => a + v, 0);
    let x = rnd() * tot;
    let i = 0;
    while (i < dist.length - 1 && (x -= dist[i]) > 0) i++;
    c.push(px[i]);
  }
  const lab = new Int32Array(px.length);
  for (let it = 0; it < 15; it++) {
    const sum = c.map(() => [0, 0, 0, 0]);
    px.forEach((p, i) => {
      let best = 0;
      let bd = Infinity;
      c.forEach((q, j) => {
        const v = d2(p, q);
        if (v < bd) {
          bd = v;
          best = j;
        }
      });
      lab[i] = best;
      const s = sum[best];
      s[0] += p[0];
      s[1] += p[1];
      s[2] += p[2];
      s[3]++;
    });
    sum.forEach((s, j) => {
      if (s[3]) c[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
  }
  const count = c.map(() => 0);
  lab.forEach((j) => count[j]++);
  return c.map((col, j) => ({ col, share: count[j] / px.length })).sort((a, b) => b.share - a.share);
};

const sceneCuts = (file: string) => {
  const r = run(['-i', file, '-vf', "scale=320:-2,select='gt(scene,0.3)',showinfo", '-an', '-f', 'null', '-']);
  const ts: number[] = [];
  for (const line of String(r.stderr).split('\n')) {
    const m = line.match(/pts_time:([\d.]+)/);
    if (m) ts.push(Math.round(Number(m[1]) * 100) / 100);
  }
  return ts;
};

const lumaSeries = (file: string) => {
  const r = run(['-v', 'error', '-i', file, '-vf', 'scale=160:-2,format=gray,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-an', '-f', 'null', '-']);
  return [...String(r.stdout).matchAll(/YAVG=([-\d.eE+]+)/g)].map((m) => Number(m[1]));
};

/** hard cuts that also swap the ground (dark ↔ light, or a full-bleed colour) */
const colourCuts = (y: number[], cuts: number[], fps: number) =>
  cuts.filter((t) => {
    const i = Math.round(t * fps);
    return i > 2 && i < y.length - 3 && Math.abs(y[i + 2] - y[i - 2]) > 70;
  }).length;

/** frames whose mean luma jumps well above their neighbours into near-white */
const flashCount = (y: number[]) => {
  let n = 0;
  for (let i = 3; i < y.length - 3; i++) {
    const around = (y[i - 3] + y[i + 3]) / 2;
    if (y[i] > 215 && y[i] - around > 60 && y[i] >= y[i - 1] && y[i] >= y[i + 1]) {
      n++;
      i += 6;
    }
  }
  return n;
};

export const analyze = (file: string, source = file): Dna => {
  const { duration, width, height, fps } = probe(file);
  const px = pixels(file, duration);
  const cl = kmeans(px, 8);
  const palette = cl.slice(0, 6).map((c) => ({ hex: hex(c.col), share: Math.round(c.share * 1000) / 1000 }));
  // accent: search the saturated pixels only — a lime headline or an orange logo is a few % of the frame and
  // vanishes inside whole-frame clusters. Fall back to the most saturated visible cluster.
  const big = pixels(file, duration, 240);
  const vivid = big.filter((p) => sat(p) > 0.5 && Math.max(...p) > 120 && lum(p) < 245);
  let a0: number[];
  let a1: number[] | undefined;
  if (vivid.length >= big.length * 0.003) {
    const vc = kmeans(vivid, Math.min(4, Math.max(1, Math.floor(vivid.length / 40))));
    const ranked = vc.sort((a, b) => b.share * (0.4 + sat(b.col)) * Math.max(...b.col) - a.share * (0.4 + sat(a.col)) * Math.max(...a.col));
    a0 = ranked[0].col;
    a1 = ranked.find((c) => hueGap(hue(c.col), hue(a0)) > 25 && c.share > 0.08)?.col;
  } else {
    const cands = cl.filter((c) => c.share >= 0.01 && lum(c.col) > 40 && lum(c.col) < 235).sort((a, b) => sat(b.col) - sat(a.col));
    a0 = cands[0]?.col ?? cl[0].col;
  }
  a1 ??= a0.map((v) => v * 0.78);
  const meanL = px.reduce((a, p) => a + lum(p), 0) / Math.max(1, px.length);
  const domL = lum(cl[0].col);
  const ground = domL < 70 || meanL < 60 ? 'dark' : domL > 185 || meanL > 175 ? 'light' : 'mid';
  const cuts = sceneCuts(file);
  const cutsPer10s = Math.round((cuts.length / duration) * 100) / 10;
  const y = lumaSeries(file);
  const flashes = flashCount(y);
  const swaps = colourCuts(y, cuts, fps);
  const transition: Dna['transition'] = flashes >= 2 ? 'flash' : swaps >= 2 || cutsPer10s >= 3 ? 'color' : cutsPer10s >= 1.5 ? 'bar' : ground === 'light' && cutsPer10s < 0.5 ? 'fade' : 'camera';
  const aspect = width > height * 1.5 ? '16:9' : height > width * 1.5 ? '9:16' : Math.abs(width - height) < 40 ? '1:1' : 'other';
  return { source, duration: Math.round(duration * 10) / 10, fps, width, height, aspect, ground, palette, accent: [hex(a0), hex(a1)], cuts, cutsPer10s, flashes, transition };
};

/** how close a render is to its reference: palette (weighted nearest-colour), tempo, ground */
export const distance = (ref: Dna, out: Dna) => {
  const top = ref.palette.slice(0, 4);
  const w = top.reduce((a, s) => a + s.share, 0) || 1;
  const pal = top.reduce((a, s) => {
    const d = Math.min(...out.palette.map((o) => Math.hypot(...rgb(s.hex).map((v, i) => v - rgb(o.hex)[i]))));
    return a + (s.share / w) * (d / 441.7);
  }, 0);
  const accentD = Math.min(...[out.accent[0], ...out.palette.map((p) => p.hex)].map((h) => Math.hypot(...rgb(ref.accent[0]).map((v, i) => v - rgb(h)[i])))) / 441.7;
  return {
    paletteMatch: Math.round((1 - pal) * 100),
    accentMatch: Math.round((1 - accentD) * 100),
    tempo: { ref: ref.cutsPer10s, out: out.cutsPer10s },
    ground: { ref: ref.ground, out: out.ground, same: ref.ground === out.ground },
  };
};
