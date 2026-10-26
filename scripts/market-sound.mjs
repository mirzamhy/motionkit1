import { mkdirSync, writeFileSync } from 'node:fs';
const rate = 48000, duration = 6, samples = rate * duration;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
let seed = 183, low = 0;
for (let i = 0; i < samples; i++) {
  const t = i / rate;
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const noise = seed / 2147483648 - 1;
  low = low * 0.99 + noise * 0.01;
  const rustle = Math.exp(-(((t - 3.9) / 0.32) ** 2)) * 0.08 * noise * (0.5 + 0.5 * Math.sin(t * 190));
  const impact = t > 4.1 ? Math.exp(-(t - 4.1) * 35) * Math.sin((t - 4.1) * 600) * 0.16 : 0;
  const envelope = Math.min(1, t / 0.25, (duration - t) / 0.4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, (low * 0.12 + rustle + impact) * envelope)) * 32767), 44 + i * 2);
}
mkdirSync('projects/vendor-action/public', { recursive: true });
writeFileSync('projects/vendor-action/public/market-sound.wav', wav);
