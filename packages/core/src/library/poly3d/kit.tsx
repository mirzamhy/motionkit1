// Copied from volcano-whatif/src/three/kit.tsx (flat, signTexture). The original project is untouched.
import * as THREE from 'three';

const matCache = new Map<string, THREE.MeshLambertMaterial>();

export const flat = (color: string): THREE.MeshLambertMaterial => {
  let m = matCache.get(color);
  if (!m) {
    m = new THREE.MeshLambertMaterial({color, flatShading: true});
    matCache.set(color, m);
  }
  return m;
};


export const signTexture = (bg: string, fg: string, lines: {text: string; size: number}[], w = 512, h = 192) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const total = lines.reduce((a, l) => a + l.size * 1.15, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    g.font = `bold ${l.size}px "Yu Gothic", "Meiryo", "MS Gothic", sans-serif`;
    g.fillText(l.text, w / 2, y + (l.size * 1.15) / 2);
    y += l.size * 1.15;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
