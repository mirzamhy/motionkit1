// Sound effects for scene-mode films, synthesised with ffmpeg (no samples, nothing to license): ambiences that loop
// under a shot and short events that land on a frame. Written once into <public>/sfx/. Drop a real recording with
// the same file name into that folder to replace any of them.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

type Sfx = { d: number; expr?: string; noise?: 'pink' | 'brown' | 'white'; af?: string };
const N = '(random(0)*2-1)';
const BANK: Record<string, Sfx> = {
  // ── ambiences (looped) ──
  birds: { d: 8, expr: `sin(2*PI*(2600+1400*sin(2*PI*6*t))*t)*pow(0.5+0.5*sin(2*PI*1.3*t),10)*0.22+sin(2*PI*(3500+900*sin(2*PI*9*t))*t)*pow(0.5+0.5*sin(2*PI*0.7*t+1),12)*0.2+sin(2*PI*(4200+600*sin(2*PI*13*t))*t)*pow(0.5+0.5*sin(2*PI*0.45*t+2.4),14)*0.14+${N}*0.012`, af: 'highpass=f=900,aecho=0.6:0.4:60:0.25' },
  crowd: { d: 8, noise: 'pink', af: 'bandpass=f=520:width_type=h:w=700,tremolo=f=3.1:d=0.35,tremolo=f=0.7:d=0.3,volume=1.6' },
  room: { d: 8, noise: 'brown', af: 'lowpass=f=260,volume=0.5' },
  wind: { d: 10, noise: 'brown', af: 'lowpass=f=520,highpass=f=70,tremolo=f=0.18:d=0.55,volume=0.9' },
  scratch: { d: 4, noise: 'pink', af: 'highpass=f=2400,lowpass=f=7000,tremolo=f=7:d=0.9,tremolo=f=1.1:d=0.6,volume=0.8' },
  type: { d: 4, expr: `(lt(mod(t,0.14),0.010)+lt(mod(t+0.05,0.37),0.010))*${N}*0.7`, af: 'bandpass=f=2600:width_type=h:w=3000' },
  rumble: { d: 10, noise: 'brown', af: 'lowpass=f=95,tremolo=f=0.6:d=0.4,volume=4' },
  siren: { d: 10, expr: 'sin(2*PI*560*t-(170/0.2)*cos(2*PI*0.2*t))*0.3', af: 'lowpass=f=1400,aecho=0.7:0.5:180|340:0.4|0.25,volume=0.7' },
  shimmer: { d: 4, expr: 'sin(2*PI*2093*t)*(0.5+0.5*sin(2*PI*5*t))*0.12+sin(2*PI*2637*t)*(0.5+0.5*sin(2*PI*7*t+1))*0.1+sin(2*PI*3136*t)*(0.5+0.5*sin(2*PI*3*t+2))*0.08', af: 'aecho=0.6:0.5:90:0.3,afade=t=in:d=0.5,afade=t=out:st=3.2:d=0.8' },
  pad: { d: 30, expr: '(sin(2*PI*110*t)*0.22+sin(2*PI*164.81*t)*0.15+sin(2*PI*220*t)*0.1+sin(2*PI*277.18*t)*0.06+sin(2*PI*329.63*t)*0.04)*(0.75+0.25*sin(2*PI*0.1*t))', af: 'lowpass=f=900,aecho=0.7:0.6:240:0.35' },
  // stand-ins for recordings a film may bring along (morning birds, a firefight, a riser): replace with the real thing
  morning: { d: 20, expr: `sin(2*PI*(2600+1400*sin(2*PI*6*t))*t)*pow(0.5+0.5*sin(2*PI*1.3*t),10)*0.1+sin(2*PI*(3500+900*sin(2*PI*9*t))*t)*pow(0.5+0.5*sin(2*PI*0.7*t+1),12)*0.09+${N}*0.01`, af: 'highpass=f=900,aecho=0.6:0.4:60:0.25' },
  morning2: { d: 20, noise: 'brown', af: 'lowpass=f=400,volume=0.3' },
  war: { d: 14, expr: `${N}*pow(0.5+0.5*sin(2*PI*0.9*t),8)*0.5+sin(2*PI*55*t)*pow(0.5+0.5*sin(2*PI*0.31*t+1),14)*0.8`, af: 'lowpass=f=900,aecho=0.7:0.5:300:0.4' },
  riser: { d: 4, expr: `${N}*pow(t/4,3)*0.8+sin(2*PI*(120+90*t*t)*t)*pow(t/4,2)*0.3`, af: 'highpass=f=200,afade=t=out:st=3.9:d=0.1' },
  // ── events ──
  whoosh: { d: 1.4, expr: `${N}*pow(sin(PI*t/1.4),2)`, af: 'highpass=f=220,lowpass=f=2200,volume=1.4' },
  cloth: { d: 2.2, expr: `${N}*pow(sin(PI*t/2.2),1.5)*(0.7+0.3*sin(2*PI*9*t))`, af: 'highpass=f=300,lowpass=f=3200,volume=1.3' },
  thud: { d: 0.6, expr: `sin(2*PI*70*t)*exp(-t*18)+${N}*exp(-t*60)*0.4` },
  knock: { d: 0.3, expr: `sin(2*PI*190*t)*exp(-t*35)+${N}*exp(-t*90)*0.5` },
  tick: { d: 0.08, expr: 'sin(2*PI*1800*t)*exp(-t*90)*0.5' },
  clunk: { d: 0.35, expr: `sin(2*PI*240*t)*exp(-t*22)*0.7+sin(2*PI*90*t)*exp(-t*14)*0.6+${N}*exp(-t*80)*0.3` },
  ping: { d: 1.2, expr: 'sin(2*PI*1320*t)*exp(-t*6)*0.4+sin(2*PI*1980*t)*exp(-t*8)*0.2' },
  chime: { d: 3, expr: '(sin(2*PI*440*t)+sin(2*PI*554.37*t)*0.8+sin(2*PI*659.25*t)*0.7+sin(2*PI*880*t)*0.5)*exp(-t*1.3)*0.22', af: 'aecho=0.7:0.6:160:0.35' },
  boom: { d: 2.6, expr: `sin(2*PI*(58-14*t)*t)*exp(-t*2.1)*0.95+${N}*exp(-t*6)*0.55`, af: 'lowpass=f=650,aecho=0.7:0.5:260:0.4' },
  applause: { d: 7, expr: `${N}*(0.55+0.45*sin(2*PI*11*t)*sin(2*PI*17*t+1))`, af: 'bandpass=f=2600:width_type=h:w=3200,afade=t=in:d=0.6,afade=t=out:st=5.2:d=1.8,volume=1.2' },
  cheer: { d: 5, noise: 'pink', af: 'bandpass=f=900:width_type=h:w=1100,tremolo=f=4.3:d=0.4,afade=t=in:d=0.5,afade=t=out:st=3.4:d=1.6,volume=2.2' },
  carve: { d: 2, noise: 'brown', af: 'lowpass=f=300,tremolo=f=14:d=0.5,afade=t=in:d=0.2,afade=t=out:st=1.3:d=0.7,volume=3' },
};

export const SFX_NAMES = Object.keys(BANK);

/** make sure every effect exists in <publicDir>/sfx/ (existing files are left alone, so real samples can replace them) */
export const ensureSceneSfx = (publicDir: string) => {
  const dir = join(publicDir, 'sfx');
  mkdirSync(dir, { recursive: true });
  let made = 0;
  for (const [name, s] of Object.entries(BANK)) {
    const out = join(dir, `${name}.wav`);
    if (existsSync(out)) continue;
    const src = s.expr ? `aevalsrc='${s.expr}':s=44100:d=${s.d}` : `anoisesrc=c=${s.noise}:r=44100:d=${s.d}:a=0.5`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', src, ...(s.af ? ['-af', s.af] : []), '-ac', '1', out]);
    made++;
  }
  return made;
};
