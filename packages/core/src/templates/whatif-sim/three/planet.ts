import * as THREE from 'three';
import { rng } from './util';

/* Seamless sphere textures: sample 3D value noise on the unit sphere, write equirectangular pixels. */

const hash = (x: number, y: number, z: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const noise3 = (x: number, y: number, z: number, seed: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const w = smooth(z - zi);
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz, seed);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
};

const fbm = (x: number, y: number, z: number, oct: number, seed: number) => {
  let a = 0.5;
  let f = 1;
  let s = 0;
  let n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * noise3(x * f, y * f, z * f, seed + i * 17);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
};

const paint = (
  w: number,
  h: number,
  fn: (x: number, y: number, z: number, lat: number) => [number, number, number, number],
) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  for (let j = 0; j < h; j++) {
    const lat = Math.PI / 2 - ((j + 0.5) / h) * Math.PI;
    const cl = Math.cos(lat);
    const y = Math.sin(lat);
    for (let i = 0; i < w; i++) {
      const lon = ((i + 0.5) / w) * Math.PI * 2;
      const [r, gg, b, a] = fn(cl * Math.cos(lon), y, cl * Math.sin(lon), lat);
      const k = (j * w + i) * 4;
      img.data[k] = r;
      img.data[k + 1] = gg;
      img.data[k + 2] = b;
      img.data[k + 3] = a;
    }
  }
  g.putImageData(img, 0, 0);
  return { canvas: c, ctx: g };
};

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * Math.min(1, Math.max(0, t)));

const toTexture = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

/** Blur a texture canvas so coastlines don't stair-step when the globe fills the frame. */
const softened = (src: HTMLCanvasElement, px: number) => {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d')!;
  g.filter = `blur(${px}px)`;
  g.drawImage(src, 0, 0);
  return c;
};

export const makeEarthTextures = () => {
  const deep = [14, 48, 98];
  const shallow = [46, 108, 168];
  const green = [86, 118, 66];
  const dry = [178, 156, 108];
  const ice = [236, 240, 244];
  const surface = paint(1024, 512, (x, y, z, lat) => {
    const n = fbm(x * 2.2 + 3, y * 2.2, z * 2.2, 5, 1);
    const alat = Math.abs(lat);
    if (alat > 1.32) return [...ice, 255] as [number, number, number, number];
    if (n < 0.555) {
      const c = mix(deep, shallow, Math.pow(n / 0.555, 4));
      return [c[0], c[1], c[2], 255];
    }
    const m = fbm(x * 5 + 10, y * 5, z * 5, 3, 9);
    const desert = Math.abs(alat - 0.4) < 0.22 ? 0.35 : 0;
    let c = mix(green, dry, (m - 0.45) * 2.5 + desert);
    if (alat > 1.1) c = mix(c, ice, (alat - 1.1) * 6);
    return [c[0], c[1], c[2], 255];
  });
  const clouds = paint(1024, 512, (x, y, z) => {
    const c = fbm(x * 3.2 + 20, y * 6.5, z * 3.2, 5, 33); // stretched along latitude: banded weather
    const a = Math.min(1, Math.max(0, (c - 0.52) / 0.2));
    return [255, 255, 255, Math.round(a * 220)];
  });
  return { map: toTexture(softened(surface.canvas, 1.6)), clouds: toTexture(softened(clouds.canvas, 1.2)) };
};

export const makeMoonTexture = () => {
  const { canvas, ctx } = paint(512, 256, (x, y, z) => {
    const base = 150 + (fbm(x * 6, y * 6, z * 6, 4, 5) - 0.5) * 70;
    const maria = fbm(x * 1.6 + 7, y * 1.6, z * 1.6, 3, 2) < 0.47 ? 0.68 : 1;
    const v = base * maria;
    return [v, v * 0.98, v * 0.95, 255];
  });
  const r = rng(77);
  for (let i = 0; i < 70; i++) {
    const cx = r() * 512;
    const cy = 30 + r() * 196;
    const rad = 3 + Math.pow(r(), 2) * 16;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(70,68,66,0.25)';
    ctx.fill();
    ctx.lineWidth = Math.max(1, rad * 0.22);
    ctx.strokeStyle = 'rgba(205,202,196,0.3)';
    ctx.stroke();
  }
  return toTexture(canvas);
};
