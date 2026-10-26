import React from 'react'
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { draw, cacheState, type Usage, type StyleId, type Lang } from './draw'
import foto from './foto-mirza.webp'
import laptop from './laptop.webp'

const FPS = 30
const DUR = [6, 8, 17, 10, 9, 8, 14, 15, 6]
const START = DUR.reduce<number[]>((a, d, i) => [...a, i === 0 ? 0 : a[i - 1] + DUR[i - 1]], [])
export const USAGE_METER_FRAMES = DUR.reduce((a, b) => a + b, 0) * FPS

const C = {
  page: '#262624', side: '#1f1e1d', input: '#30302e', line: '#3d3d3a', text: '#faf9f5', dim: '#a6a39a', ubub: '#141413',
  clay: '#d97757', send: '#c6613f', green: '#22c55e', amber: '#f5a524', red: '#ef4444', blue: '#60a5fa', yellow: '#ffd23f',
}
const SANS = '"Segoe UI", system-ui, sans-serif'
const BLACK = '"Segoe UI Black", "Segoe UI", sans-serif'
const SERIF = 'Georgia, "Times New Roman", serif'
const MONO = 'Consolas, monospace'

// ---------- timing helpers ----------
const s = (sec: number) => Math.round(sec * FPS)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ent = (t: number, at: number, dur = 12) => interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
const lerp = (t: number, a: number, b: number, from: number, to: number) => interpolate(t, [a, b], [from, to], { ...clamp, easing: Easing.inOut(Easing.cubic) })
const pop = (t: number, at: number, fps: number, damping = 11) => spring({ frame: t - at, fps, config: { damping, stiffness: 160 } })
const typed = (txt: string, t: number, a: number, b: number) => txt.slice(0, Math.round(interpolate(t, [a, b], [0, txt.length], clamp)))

// ---------- band from the real mod code ----------
const NOW = Date.parse('2026-10-24T10:16:00Z')
const BASE: Usage = {
  tokens: 146000, window: 1000000, percent: 15,
  fiveHour: { percent: 64, resetsAt: '2026-10-24T12:30:00Z' },
  weekly: { percent: 88, resetsAt: '2026-10-26T08:00:00Z' },
  usd: 1.16,
}
const usage = (o: Partial<{ ctx: number; h5: number; wk: number; usd: number }> = {}): Usage => {
  const ctx = o.ctx ?? 15
  return {
    ...BASE, percent: Math.round(ctx), tokens: Math.round(ctx * 10000),
    fiveHour: { percent: Math.round(o.h5 ?? 64), resetsAt: BASE.fiveHour!.resetsAt },
    weekly: { percent: Math.round(o.wk ?? 88), resetsAt: BASE.weekly!.resetsAt },
    usd: o.usd ?? 1.16,
  }
}
const WARM = cacheState(BASE, NOW - 13 * 60_000, NOW, 0)
const bandSvg = (style: StyleId, lang: Lang, u: Usage) => draw(style, lang, u, NOW, lang === 'id' ? 'seblak' : 'auto', WARM)

const Band: React.FC<{ u?: Usage; style?: StyleId; lang?: Lang; zoom?: number; boxed?: boolean }> = ({ u = usage(), style = 'speedo', lang = 'id', zoom = 1, boxed = true }) => {
  const d = bandSvg(style, lang, u)
  return (
    <div style={{ zoom, background: boxed ? '#2f2e2c' : 'transparent', border: boxed ? '1px solid #ffffff10' : 'none', borderRadius: 12, padding: boxed ? '8px 12px' : 0, width: 'fit-content' }}
      dangerouslySetInnerHTML={{ __html: d.source }} />
  )
}
const bandItems = (u: Usage) => [...bandSvg('speedo', 'id', u).source.matchAll(/<rect x="([\d.]+)" y="0" width="([\d.]+)"/g)].map(m => ({ x: +m[1], w: +m[2] }))

// ---------- Claude desktop pieces ----------
const Caret: React.FC = () => {
  const f = useCurrentFrame()
  return <span style={{ display: 'inline-block', width: 11, height: 26, background: C.clay, verticalAlign: -4, marginLeft: 3, opacity: f % 30 < 16 ? 1 : 0 }} />
}

const Composer: React.FC<{ text?: string; typing?: boolean }> = ({ text, typing }) => (
  <div style={{ background: C.input, border: `1px solid ${C.line}`, borderRadius: 20, padding: '18px 20px 14px' }}>
    <div style={{ fontSize: text ? 22 : 23, color: text ? C.text : '#8f8c84', fontFamily: text ? MONO : SANS, minHeight: 36, wordBreak: 'break-all' }}>
      {text || 'Reply…'}{typing ? <Caret /> : null}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, fontSize: 19, color: C.dim }}>
      <span style={{ fontSize: 28, lineHeight: 1, marginRight: 'auto' }}>+</span>
      <span>Opus 5.5 ˅</span>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: C.send, marginLeft: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22 }}>↑</span>
    </div>
  </div>
)

const Win: React.FC<{ x: number; y: number; w: number; h: number; transform?: string; title?: string; children?: React.ReactNode; dock?: React.ReactNode }> =
  ({ x, y, w, h, transform, title = 'Rapihin bab 4 skripsi', children, dock }) => (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform, background: C.page, borderRadius: 22, overflow: 'hidden', border: '1px solid #ffffff14', boxShadow: '0 60px 140px #000c, 0 0 0 1px #000' }}>
      <div style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, background: C.side, borderBottom: '1px solid #00000055' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map(c => <i key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c, display: 'block' }} />)}
        <div style={{ margin: '0 auto', display: 'flex', background: '#141413', borderRadius: 10, padding: 4, gap: 2, fontSize: 19 }}>
          {['Chat', 'Cowork', 'Code'].map(t => <span key={t} style={{ padding: '6px 18px', borderRadius: 7, color: t === 'Code' ? C.text : C.dim, background: t === 'Code' ? '#3a3936' : 'transparent' }}>{t}</span>)}
        </div>
        <span style={{ width: 62 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '18px 30px', fontSize: 21, color: '#d9d6ce' }}>{title} <span style={{ color: C.dim }}>˅</span></div>
      <div style={{ padding: '10px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>{children}</div>
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>{dock}</div>
    </div>
  )

const Appear: React.FC<{ t: number; at: number; children: React.ReactNode; align?: 'flex-end' | 'stretch' }> = ({ t, at, children, align }) => {
  const k = ent(t, at, 10)
  if (k <= 0) return null
  return <div style={{ opacity: k, transform: `translateY(${(1 - k) * 24}px)`, alignSelf: align }}>{children}</div>
}
const MU: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: C.ubub, borderRadius: 16, padding: '14px 20px', fontSize: 23, maxWidth: 680 }}>{children}</div>)
const MA: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 25, lineHeight: 1.5, color: '#ece9e1', fontFamily: SERIF }}>{children}</div>)
const Tool: React.FC<{ verb: string; obj: string }> = ({ verb, obj }) => (
  <div style={{ fontSize: 20, color: C.dim }}>● <b style={{ color: '#d9d6ce', fontWeight: 600 }}>{verb}</b> {obj}</div>)
const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code style={{ fontFamily: MONO, fontSize: 21, background: '#ffffff10', padding: '1px 6px', borderRadius: 5, color: '#e8b4a0' }}>{children}</code>)
const Diff: React.FC = () => (
  <div style={{ fontFamily: MONO, fontSize: 19, background: '#1c1c1b', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 14px', lineHeight: 1.55 }}>
    <div style={{ color: '#f19a9a' }}>- plt.plot(x, y)</div>
    <div style={{ color: '#7ee2a0' }}>+ plt.bar(kategori, jumlah, color=warna)</div>
    <div style={{ color: '#7ee2a0' }}>+ plt.title("Distribusi responden")</div>
  </div>)

const Coding: React.FC<{ t: number; at: number[] }> = ({ t, at }) => (<>
  <Appear t={t} at={at[0]} align="flex-end"><MU>rapihin bab 4, terus bikin grafiknya sekalian</MU></Appear>
  <Appear t={t} at={at[1]}><Tool verb="Read" obj="bab4.docx · hasil.xlsx" /></Appear>
  <Appear t={t} at={at[2]}><MA>Oke, aku rapihin dulu struktur subbabnya, lalu grafik batang dari <Code>hasil.xlsx</Code>.</MA></Appear>
  <Appear t={t} at={at[3]}><Tool verb="Edit" obj="grafik.py" /></Appear>
  <Appear t={t} at={at[4]}><Diff /></Appear>
</>)

// ---------- type, captions, decor ----------
type Piece = string | { hl: string; color?: string } | { y: string } | '\n'
const Caption: React.FC<{ t: number; chunks: [number, number, Piece[]][]; top?: number }> = ({ t, chunks, top = 1340 }) => {
  const { fps } = useVideoConfig()
  const c = chunks.find(([a, b]) => t >= s(a) && t < s(b))
  if (!c) return null
  const [a, b, pieces] = c
  const t0 = s(a), span = Math.max(8, (s(b) - t0) * 0.55)
  const units: React.ReactNode[] = []
  let n = 0
  const total = pieces.reduce<number>((k, p) => k + (typeof p === 'string' ? (p === '\n' ? 0 : p.split(' ').filter(Boolean).length) : 1), 0)
  const at = () => t0 + (n++ / Math.max(1, total)) * span
  pieces.forEach((p, i) => {
    if (p === '\n') { units.push(<br key={'br' + i} />); return }
    if (typeof p === 'string') {
      p.split(' ').filter(Boolean).forEach((w, j) => {
        const k = pop(t, at(), fps, 14)
        units.push(<span key={i + '-' + j} style={{ display: 'inline-block', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 20}px) scale(${0.85 + 0.15 * k})`, marginRight: 18 }}>{w}</span>)
      })
      return
    }
    const k = pop(t, at(), fps, 9)
    if ('hl' in p) units.push(<span key={i} style={{ display: 'inline-block', background: p.color ?? C.clay, color: '#fff', padding: '0 16px', borderRadius: 12, transform: `rotate(-2deg) scale(${k})`, textShadow: 'none', boxShadow: '0 8px 0 #0008', marginRight: 18 }}>{p.hl}</span>)
    else units.push(<span key={i} style={{ display: 'inline-block', color: C.yellow, transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.5), marginRight: 18 }}>{p.y}</span>)
  })
  return (
    <div style={{ position: 'absolute', left: 50, right: 50, top, zIndex: 45, textAlign: 'center', fontFamily: BLACK, fontWeight: 900, fontSize: 76, lineHeight: 1.12, color: '#fff',
      textShadow: '0 6px 0 #000, 0 0 30px #000c, 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000' }}>{units}</div>
  )
}

const Mega: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: BLACK, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.92, ...style }}>{children}</div>)
const Glow: React.FC<{ x: number; y: number; w: number; h: number; color: string; o?: number }> = ({ x, y, w, h, color, o = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: '50%', background: color, filter: 'blur(90px)', opacity: o }} />)
const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#1b1a19ee', border: '1px solid #ffffff22', borderRadius: 50, padding: '12px 26px', fontSize: 34, fontWeight: 700, ...style }}>{children}</span>)
const Paper: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', background: '#f1ece2', color: '#2a2622', fontWeight: 800, padding: '10px 26px', clipPath: 'polygon(2% 8%,98% 0,100% 88%,4% 100%)', boxShadow: '0 8px 20px #0006', ...style }}>{children}</div>)
const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ display: 'inline-block', background: '#141413', border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 14px', fontFamily: MONO, fontSize: 24, color: '#e8b4a0', ...style }}>{children}</span>)
const Btn: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ display: 'inline-block', border: `1px solid ${C.line}`, borderRadius: 9, padding: '8px 16px', fontSize: 20, background: '#3a3936', ...style }}>{children}</span>)
const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: 'absolute', background: 'linear-gradient(180deg,#2c2b29,#211f1e)', border: '1px solid #ffffff14', borderRadius: 28, padding: '34px 38px', boxShadow: '0 40px 90px #000b', ...style }}>{children}</div>)

// Scene wrapper: punch-in, slow push, quick fade out.
const Scene: React.FC<{ dur: number; children: (t: number) => React.ReactNode }> = ({ dur, children }) => {
  const t = useCurrentFrame()
  const n = s(dur)
  const inK = ent(t, 0, 9)
  const out = interpolate(t, [n - 6, n], [1, 0], clamp)
  const scale = (1.08 - 0.08 * inK) * (1 + 0.035 * (t / n))
  return <AbsoluteFill style={{ opacity: inK * out, transform: `scale(${scale})` }}>{children(t)}</AbsoluteFill>
}

// ---------- scenes ----------
const S1: React.FC = () => <Scene dur={DUR[0]}>{t => {
  const { fps } = useVideoConfig()
  const min = Math.min(7, 5 + Math.floor(t / 22))
  const hit = s(3.8)
  const shake = t > hit ? Math.sin((t - hit) * 2.2) * 18 * Math.exp(-(t - hit) / 8) : 0
  const red = ent(t, hit, 6)
  return <>
    <Glow x={140} y={500} w={800} h={700} color="#ef4444" o={0.25 + 0.45 * red} />
    <Mega style={{ top: 150, fontSize: 92, color: '#ffffffcc', opacity: ent(t, 0) }}>POV:</Mega>
    <Mega style={{ top: 250, fontSize: 250, transform: `scale(${pop(t, 4, fps)})`, color: red > 0.5 ? '#ff8a8a' : C.text }}>23.0{min}</Mega>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontSize: 40, color: C.dim, fontWeight: 600, opacity: ent(t, 14) }}>deadline 23.59 · tugas tinggal dikit</div>
    <div style={{ position: 'absolute', inset: 0, perspective: 2200, transform: `translateX(${shake}px) translateY(${(1 - ent(t, 8, 18)) * 500}px)` }}>
      <Win x={90} y={600} w={900} h={800} transform="rotateX(14deg) rotateY(-10deg) rotateZ(2deg)"
        dock={<Composer />}>
        <Coding t={t} at={[18, 34, 48, 66, 78]} />
        {t >= hit && <div style={{ transform: `scale(${pop(t, hit, fps, 8)})`, border: '1.5px solid #b98a22', background: '#3a2e12', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', color: '#f2c14e', fontSize: 21, fontWeight: 600 }}>⚠ Claude usage limit reached</div>
          <div style={{ background: '#1d1a14', padding: '12px 16px', fontFamily: MONO, fontSize: 19, color: '#e5ddc9' }}>Your limit resets at 03.00</div></div>}
      </Win>
    </div>
    <Caption t={t} top={1440} chunks={[[0, 2.4, ['POV, jam sebelas malam']], [2.4, 3.8, ['tugas tinggal dikit lagi…']], [3.8, 6.2, ['terus Claude bilang…', '\n', { hl: 'LIMIT REACHED', color: C.red }]]]} />
  </>
}}</Scene>

const S2: React.FC = () => <Scene dur={DUR[1]}>{t => {
  const { fps } = useVideoConfig()
  const ph = pop(t, 0, fps, 13), lp = pop(t, 12, fps, 14)
  return <>
    <Glow x={200} y={400} w={700} h={700} color="#d97757" o={0.4} />
    <Img src={foto} style={{ position: 'absolute', left: 60, top: 300, width: 980, transform: `translateY(${(1 - ph) * -900}px) rotate(${-12 + 8 * ph}deg)`, filter: 'drop-shadow(0 30px 50px #000c)', WebkitMaskImage: 'linear-gradient(#000 80%, transparent 98%)' }} />
    <Img src={laptop} style={{ position: 'absolute', left: 120, top: 690, width: 820, transform: `translateY(${(1 - lp) * 900}px) rotate(3deg)`, filter: 'drop-shadow(0 30px 50px #000c)' }} />
    <div style={{ position: 'absolute', left: 700, top: 1070, transform: `rotate(7deg) scale(${pop(t, 30, fps, 8)})`, background: '#3a1414', border: `2px solid ${C.red}`, color: '#ffd6d6', borderRadius: 12, padding: '10px 18px', fontSize: 28, fontWeight: 700 }}>limit reached 😩</div>
    <Paper style={{ left: 70, top: 1260, fontSize: 96, transform: `rotate(-4deg) scale(${pop(t, 48, fps, 10)})` }}>Hai, aku Mirza</Paper>
    <Paper style={{ left: 330, top: 1410, fontSize: 52, background: C.clay, color: '#fff', transform: `rotate(3deg) scale(${pop(t, 66, fps, 10)})` }}>mahasiswa</Paper>
    <Caption t={t} top={1560} chunks={[[0, 1.3, ['Duh.']], [1.3, 4, ['kenalin, aku Mirza']], [4, 8.2, ['tiap hari ngerjain tugas', '\n', 'bareng', { y: 'Claude' }]]]} />
  </>
}}</Scene>

const S3: React.FC = () => <Scene dur={DUR[2]}>{t => {
  const { fps } = useVideoConfig()
  const count = Math.max(1, Math.floor(interpolate(t, [20, s(8)], [1, 14.99], clamp)))
  const bars = Array.from({ length: count }, (_, i) => i)
  const warmK = pop(t, s(9.2), fps, 12), coldK = pop(t, s(13), fps, 12)
  const hour = interpolate(t, [s(10.5), s(12.8)], [0, 180], clamp)
  return <>
    <Glow x={240} y={300} w={620} h={900} color="#d97757" o={0.3} />
    <Mega style={{ top: 120, fontSize: 190, color: 'transparent', WebkitTextStroke: '3px #ffffff30' }}>CONTEXT</Mega>
    <div style={{ position: 'absolute', left: 300, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', transform: 'rotate(-3deg)' }}>
      {bars.map(i => {
        const last = i === count - 1
        return <div key={i} style={{ height: 34, borderRadius: 9, marginTop: 8, width: 300 + (i * 37) % 160, background: last ? C.clay : 'linear-gradient(90deg,#4b4945,#3a3936)', boxShadow: last ? `0 0 30px ${C.clay}` : 'none' }} />
      })}
    </div>
    <div style={{ position: 'absolute', left: 760, top: 330 + (count - 1) * 42 - 4 + count * 1.5, fontSize: 30, color: C.clay, fontWeight: 700, transform: 'rotate(-3deg)' }}>← pesan ke-{count}</div>
    <div style={{ position: 'absolute', left: 660, top: 420, fontSize: 30, color: C.dim, fontWeight: 600, opacity: ent(t, s(4)) }}>semua ini<br />ikut dikirim ulang ↓</div>
    <div style={{ position: 'absolute', left: 90, right: 90, top: 1020, display: 'flex', gap: 30 }}>
      <div style={{ flex: 1, height: 200, borderRadius: 24, border: `3px solid ${C.clay}`, background: '#d9775722', boxShadow: '0 0 60px #d9775766', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${warmK})`, opacity: 1 - 0.5 * ent(t, s(13), 15) }}>
        <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 72, color: C.clay }}>WARM</div><div style={{ fontSize: 26, marginTop: 6 }}>dibaca murah 🪙</div></div>
      <div style={{ alignSelf: 'center', fontSize: 60, transform: `rotate(${hour}deg)`, opacity: ent(t, s(10.3)) }}>⏳</div>
      <div style={{ flex: 1, height: 200, borderRadius: 24, border: `3px solid ${C.blue}`, background: '#60a5fa1c', boxShadow: '0 0 60px #60a5fa55', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${coldK})` }}>
        <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 72, color: C.blue }}>COLD</div><div style={{ fontSize: 26, marginTop: 6 }}>harga penuh 🪙🪙🪙🪙</div></div>
    </div>
    <Caption t={t} chunks={[
      [0, 3, ['limit habis bukan karena', '\n', 'kebanyakan nanya']],
      [3, 6.4, ['tiap kirim pesan,', '\n', 'seluruh obrolan', { hl: 'DIKIRIM ULANG' }]],
      [6.4, 9.2, ['chat makin panjang,', '\n', 'tiap pesan makin', { hl: 'BERAT' }]],
      [9.2, 10.8, ['untungnya ada', { y: 'cache' }]],
      [10.8, 13, ['dibaca lagi?', '\n', 'jauh lebih', { hl: 'MURAH', color: C.green }]],
      [13, 15, ['kelamaan diem?', '\n', 'cache jadi', { hl: 'COLD', color: '#3b82f6' }]],
      [15, 17.2, ['semua dihitung', '\n', 'harga penuh lagi']],
    ]} />
  </>
}}</Scene>

const S4: React.FC = () => <Scene dur={DUR[3]}>{t => {
  const { fps } = useVideoConfig()
  const lens = pop(t, s(4), fps, 13)
  const items = bandItems(usage()).slice(0, 4)
  const step = Math.min(3, Math.floor((t - s(5.2)) / s(1.1)))
  const z = 1.28
  return <>
    <Glow x={100} y={700} w={900} h={600} color="#d97757" o={0.45} />
    <Mega style={{ top: 150, fontSize: 130, transform: `scale(${pop(t, 3, fps)})` }}>usage<span style={{ color: C.clay }}>-meter</span></Mega>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontSize: 36, color: C.dim, fontWeight: 600, opacity: ent(t, 14) }}>satu baris di atas kotak chat</div>
    <div style={{ position: 'absolute', inset: 0, perspective: 2200, transform: `translateX(${(1 - ent(t, 12, 20)) * 900}px)` }}>
      <Win x={60} y={400} w={960} h={880} transform="rotateX(10deg) rotateY(8deg)" dock={<><div style={{ marginBottom: 12 }}><Band zoom={1.13} /></div><Composer /></>}>
        <Coding t={t + 200} at={[0, 0, 0, 0, 0]} />
      </Win>
    </div>
    {lens > 0.01 && <div style={{ position: 'absolute', left: 30, top: 1030, width: 1020, padding: '14px 18px', borderRadius: 24, border: `3px solid ${C.clay}`, background: '#2f2e2c', overflow: 'hidden', transform: `scale(${0.85 + 0.15 * lens})`, opacity: lens, boxShadow: `0 0 0 8px #d9775733, 0 0 80px #d97757aa, 0 40px 80px #000c` }}>
      <div style={{ position: 'relative' }}>
        <Band zoom={z} boxed={false} />
        {step >= 0 && items[step] && <div style={{ position: 'absolute', top: -6, height: 40 * z + 12, left: items[step].x * z - 6, width: items[step].w * z, borderRadius: 12, border: `3px solid ${C.yellow}`, boxShadow: `0 0 30px ${C.yellow}88` }} />}
      </div></div>}
    <Caption t={t} top={1400} chunks={[
      [0, 2.6, ['semua itu', { hl: 'NGGAK KELIATAN' }]],
      [2.6, 5.2, ['makanya aku bikin', '\n', { y: 'usage-meter' }]],
      [5.2, 6.3, [{ y: 'context' }]], [6.3, 7.4, [{ y: 'limit 5 jam' }]], [7.4, 8.5, [{ y: 'limit mingguan' }]], [8.5, 10.2, ['status', { hl: 'CACHE' }]],
    ]} />
  </>
}}</Scene>

const S5: React.FC = () => <Scene dur={DUR[4]}>{t => {
  const { fps } = useVideoConfig()
  const slam = pop(t, 5, fps, 10)
  return <>
    <Glow x={150} y={350} w={800} h={800} color="#f5a524" o={0.35} />
    <Mega style={{ top: 200, fontSize: 200, transform: `scale(${2.2 - 1.2 * slam})`, opacity: Math.min(1, slam * 2) }}>$1.16</Mega>
    <Mega style={{ top: 420, fontSize: 80, color: C.dim, opacity: ent(t, 38) }}>↓ Rp21rb ↓</Mega>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', fontSize: 330, lineHeight: 1, filter: 'drop-shadow(0 30px 40px #000c)', transform: `translateY(${(1 - pop(t, 68, fps, 12)) * -700}px)` }}>🍜</div>
    <div style={{ position: 'absolute', left: 600, top: 760, fontFamily: BLACK, fontWeight: 900, fontSize: 150, color: C.clay, transform: `rotate(-6deg) scale(${pop(t, 92, fps, 8)})`, textShadow: '0 10px 0 #000' }}>×1,4</div>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 950, opacity: ent(t, 115), transform: `translateY(${(1 - ent(t, 115)) * 60}px)` }}>
      <div style={{ marginBottom: 12 }}><Band zoom={1.24} /></div>
      <Composer text={typed('/meter food seblak', t, 128, 175)} typing />
    </div>
    <Caption t={t} top={1300} chunks={[
      [0, 2.6, ['angka seblak', '\n', 'di pojok tadi?']],
      [2.6, 5.4, ['itu biaya sesi kamu', '\n', 'pakai', { y: 'harga API' }]],
      [5.4, 9.2, ['=', { hl: '1,4 SEBLAK' }]],
    ]} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1520, textAlign: 'center', fontSize: 28, color: C.dim, opacity: ent(t, s(5.4)) }}>langganan Pro/Max nggak ditagih, yang dihitung limit</div>
  </>
}}</Scene>

const S6: React.FC = () => <Scene dur={DUR[5]}>{t => {
  const { fps } = useVideoConfig()
  const k = lerp(t, 10, s(7.5), 0, 1)
  const u = usage({ ctx: 15 + 12 * k, h5: 64 + 9 * k, wk: 88 + 2 * k, usd: 1.16 + 0.46 * k })
  const mins = 30 + Math.floor(45 * k)
  const clock = `${22 + Math.floor(mins / 60)}.${String(mins % 60).padStart(2, '0')}`
  const bumps = [s(1.5), s(4), s(6.5)]
  return <>
    <Glow x={150} y={500} w={800} h={700} color="#22c55e" o={0.2} />
    <div style={{ position: 'absolute', left: 60, top: 150, fontFamily: BLACK, fontWeight: 900, fontSize: 120 }}>{clock} <span style={{ fontSize: 60, color: C.dim }}>🕙</span></div>
    <div style={{ position: 'absolute', inset: 0, perspective: 2200 }}>
      <Win x={60} y={330} w={960} h={1050} transform="rotateX(8deg) rotateY(-9deg)" dock={<><div style={{ marginBottom: 12 }}><Band u={u} zoom={1.13} /></div><Composer /></>}>
        <Appear t={t} at={8} align="flex-end"><MU>bikinin tabel ringkasan hasil uji</MU></Appear>
        <Appear t={t} at={bumps[0] - 10}><Tool verb="Write" obj="tabel_ringkasan.md" /></Appear>
        <Appear t={t} at={bumps[0]}><MA>Ini tabelnya, aku tambahin kolom p-value biar kebaca.</MA></Appear>
        <Appear t={t} at={s(2.8)} align="flex-end"><MU>grafiknya ganti jadi bar chart</MU></Appear>
        <Appear t={t} at={bumps[1]}><MA>Sudah. Warnanya ngikutin kategori.</MA></Appear>
        <Appear t={t} at={s(5.3)} align="flex-end"><MU>tambahin uji normalitas juga</MU></Appear>
        <Appear t={t} at={bumps[2]}><Tool verb="Run" obj="uji_normalitas.py" /></Appear>
      </Win>
    </div>
    {bumps.map((b, i) => {
      const a = t - b
      if (a < 0 || a > 40) return null
      return <div key={i} style={{ position: 'absolute', left: 120 + i * 230, top: 1000 - a * 3, fontFamily: BLACK, fontWeight: 900, fontSize: 54, color: C.amber, textShadow: '0 4px 0 #000', opacity: interpolate(a, [0, 6, 30, 40], [0, 1, 1, 0]) }}>▲+{[4, 4, 4][i]}%</div>
    })}
    <Caption t={t} top={1440} chunks={[[0, 4, ['tiap kamu chat,', '\n', 'meternya', { hl: 'IKUT GERAK' }]], [4, 8.2, ['jadi tahu kapan', '\n', 'harus', { y: 'ngerem' }]]]} />
  </>
}}</Scene>

const S7: React.FC = () => <Scene dur={DUR[6]}>{t => {
  const { fps } = useVideoConfig()
  const press = s(8.2)
  const ctx = interpolate(t, [press + 6, press + 36], [42, 9], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  const btn = t >= press && t < press + 8 ? 0.92 : 1
  const slide = (at: number, from: number) => ({ transform: `translateX(${(1 - ent(t, at, 16)) * from}px) rotate(var(--r))`, opacity: ent(t, at, 10) })
  return <>
    <Glow x={150} y={400} w={800} h={900} color="#d97757" o={0.3} />
    <Mega style={{ top: 140, fontSize: 120, transform: `scale(${pop(t, 2, fps)})` }}>TIPS <span style={{ color: C.clay }}>HEMAT</span></Mega>
    <Card style={{ left: 60, top: 310, width: 960, height: 270, ['--r' as string]: '-1.5deg', ...slide(s(0.4), -1100) }}>
      <div style={{ display: 'flex', gap: 34, alignItems: 'center' }}><div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 120, lineHeight: 0.8, color: C.clay }}>1</div><div>
        <div style={{ fontSize: 42, fontWeight: 800 }}>Pilih model sesuai tugas</div>
        <div style={{ marginTop: 16, fontSize: 26, lineHeight: 1.8 }}><Chip>rename</Chip> → <span style={{ color: C.green, fontWeight: 700 }}>model ringan</span><br /><Chip>debug</Chip> → <span style={{ color: C.clay, fontWeight: 700 }}>model pintar</span></div></div></div>
    </Card>
    <Card style={{ left: 60, top: 610, width: 960, height: 400, borderColor: '#d9775766', boxShadow: '0 0 70px #d9775744, 0 40px 90px #000b', ['--r' as string]: '1deg', ...slide(s(4.4), 1100) }}>
      <div style={{ display: 'flex', gap: 34, alignItems: 'flex-start' }}><div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 120, lineHeight: 0.8, color: C.clay }}>2</div><div style={{ flex: 1 }}>
        <div style={{ fontSize: 42, fontWeight: 800 }}>Compact di ±40%</div>
        <div style={{ marginTop: 14 }}><Band u={usage({ ctx })} zoom={0.92} /></div>
        <div style={{ marginTop: 12, fontSize: 23, color: t < press ? C.amber : C.green, lineHeight: 1.4 }}>{t < press ? 'Context sudah 42%. Sebaiknya /compact sekarang, mumpung cache masih warm.' : `Compacting… context ${Math.round(ctx)}%`}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}><Btn style={{ borderColor: C.clay, boxShadow: '0 0 0 4px #d9775766', transform: `scale(${btn})` }}>Compact sekarang</Btn><Btn>Nanti</Btn></div></div></div>
    </Card>
    <Card style={{ left: 60, top: 1040, width: 960, height: 220, ['--r' as string]: '-1deg', ...slide(s(10), -1100) }}>
      <div style={{ display: 'flex', gap: 34, alignItems: 'center' }}><div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 120, lineHeight: 0.8, color: C.clay }}>3</div><div>
        <div style={{ fontSize: 42, fontWeight: 800 }}>Ganti topik? Sesi baru</div>
        <div style={{ marginTop: 16 }}><Chip style={{ fontSize: 30 }}>{typed('/clear', t, s(10.6), s(11.1)) || ' '}</Chip>
          <span style={{ fontSize: 30, color: C.green, fontWeight: 800, marginLeft: 14, display: 'inline-block', transform: `scale(${pop(t, s(11.5), fps, 9)})` }}>context 2%</span></div></div></div>
    </Card>
    <Caption t={t} top={1350} chunks={[
      [0, 4.4, ['tugas ringan?', '\n', 'pakai', { y: 'model ringan' }]],
      [4.4, 8.2, ['context ±40%,', '\n', 'cache masih warm?']],
      [8.2, 10, [{ hl: 'COMPACT SEKARANG' }]],
      [10, 14.2, ['ganti topik?', '\n', { hl: 'SESI BARU' }]],
    ]} />
  </>
}}</Scene>

const S8: React.FC = () => <Scene dur={DUR[7]}>{t => {
  const { fps } = useVideoConfig()
  const install = '/plugin install usage-meter --marketplace mirzamhy/usage-meter'
  const cmds: [number, string][] = [[s(7.4), '/meter style segment'], [s(9.4), '/meter lang id'], [s(11.4), '/meter compact 50']]
  let text = typed(install, t, s(2), s(4.5))
  for (const [at, c] of cmds) if (t >= at - 4) text = typed(c, t, at - 4, at + 10)
  const style: StyleId = t >= s(8.2) ? 'segment' : 'speedo'
  const lang: Lang = t >= s(10.2) ? 'id' : 'en'
  const active = cmds.findIndex(([at], i) => t >= at + 12 && (i === cmds.length - 1 || t < cmds[i + 1][0] + 12))
  return <>
    <Glow x={150} y={300} w={800} h={900} color="#d97757" o={0.38} />
    <Mega style={{ top: 140, fontSize: 120, transform: `scale(${pop(t, 2, fps)})` }}>CARA <span style={{ color: C.clay }}>PAKAI</span></Mega>
    <Card style={{ left: 90, top: 300, width: 900, transform: `rotate(-1.5deg) scale(${pop(t, 10, fps, 12)})` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, color: C.dim }}>
        <svg width="44" height="44" viewBox="0 0 16 16" fill="#faf9f5"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>github.com/</div>
      <div style={{ fontFamily: BLACK, fontWeight: 900, fontSize: 96, lineHeight: 0.92, marginTop: 10 }}>mirzamhy/<br /><span style={{ color: C.clay }}>usage-meter</span></div>
      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}><Btn>⭐ Star</Btn><Btn>MIT</Btn><Btn>TypeScript</Btn></div>
    </Card>
    <div style={{ position: 'absolute', left: 60, right: 60, top: 780, opacity: ent(t, s(1.6)) }}>
      <Composer text={text} typing />
      <div style={{ margin: '16px 4px 20px', fontSize: 32, color: C.green, fontWeight: 800, opacity: ent(t, s(5)), transform: `scale(${0.8 + 0.2 * pop(t, s(5), fps)})`, transformOrigin: 'left' }}>✓ Installed · user scope</div>
      <div style={{ opacity: ent(t, s(6)), transform: `translateY(${(1 - ent(t, s(6))) * 40}px)` }}><Band style={style} lang={lang} zoom={1.4} /></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 18, opacity: ent(t, s(6.5)) }}>
        {['/meter style', '/meter lang id', '/meter compact 50'].map((c, i) =>
          <Chip key={c} style={{ borderColor: active === i ? C.clay : C.line, boxShadow: active === i ? '0 0 24px #d97757aa' : 'none' }}>{c}</Chip>)}
      </div>
      {t >= s(12) && <div style={{ marginTop: 16, fontSize: 26, color: C.amber, fontWeight: 700, opacity: ent(t, s(12)) }}>pengingat compact sekarang di 50%</div>}
    </div>
    <Caption t={t} top={1380} chunks={[
      [0, 2, ['mau coba?']],
      [2, 5, ['repo-nya ada di', '\n', { y: 'GitHub' }]],
      [5, 7.4, ['install, pilih', { hl: 'USER SCOPE' }]],
      [7.4, 9.4, ['ganti', { y: 'gaya' }]], [9.4, 11.4, ['ganti', { y: 'bahasa' }]], [11.4, 13.4, ['atur', { y: 'pengingat compact' }]],
      [13.4, 15.2, ['muncul di', { hl: 'SEMUA SESI' }]],
    ]} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontSize: 26, color: C.dim }}>butuh Claude Code dengan fitur mods (early access)</div>
  </>
}}</Scene>

const S9: React.FC = () => <Scene dur={DUR[8]}>{t => {
  const { fps } = useVideoConfig()
  const ph = pop(t, 0, fps, 12)
  const wave = Math.sin(t / 5) * 2.5 * ent(t, 20)
  return <>
    <Glow x={150} y={400} w={800} h={800} color="#d97757" o={0.45} />
    <Img src={foto} style={{ position: 'absolute', left: 90, top: 230, width: 900, transform: `translateY(${(1 - ph) * -900}px) rotate(${-6 + wave}deg)`, filter: 'drop-shadow(0 30px 50px #000c)', WebkitMaskImage: 'linear-gradient(#000 80%, transparent 98%)' }} />
    <Mega style={{ top: 1060, fontSize: 130, textShadow: '0 10px 0 #000', transform: `scale(${pop(t, 16, fps, 10)})` }}>Thanks for<br /><span style={{ color: C.clay }}>watching!</span></Mega>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1360, textAlign: 'center', opacity: ent(t, 40) }}><Pill style={{ fontFamily: MONO, fontSize: 36 }}>github.com/mirzamhy/usage-meter</Pill></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontSize: 34, color: C.green, fontWeight: 800, transform: `scale(${pop(t, 62, fps, 9)})` }}>23.58 · ✓ tugas terkirim</div>
    <Caption t={t} top={1560} chunks={[[2.6, 6.2, ['share ke teman yang suka', '\n', { hl: 'VIBE CODING' }]]]} />
  </>
}}</Scene>

// Seblak counter that runs from scene 3 to 7.
const SeblakCounter: React.FC = () => {
  const f = useCurrentFrame()
  const sec = f / FPS
  const inRange = (i: number) => sec >= START[i] && sec < START[i] + DUR[i]
  if (!(inRange(2) || inRange(3) || inRange(5) || inRange(6))) return null
  if (inRange(2) && sec < START[2] + 4) return null
  let v = 0, tag = '▲', color = C.text
  if (inRange(2)) v = interpolate(sec, [START[2] + 4, START[2] + 17], [0.2, 0.9], clamp)
  if (inRange(3)) v = interpolate(sec, [START[3], START[3] + 10], [0.9, 1.4], clamp)
  if (inRange(5)) v = 1.39 + 0.55 * interpolate(sec, [START[5] + 0.33, START[5] + 7.5], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })
  if (inRange(6)) { v = 1.9; tag = sec > START[6] + 8.2 ? '✓ hemat' : '▲'; color = sec > START[6] + 8.2 ? C.green : C.text }
  const k = ent(f, s(inRange(2) ? START[2] + 4 : sec), 10)
  return (
    <div style={{ position: 'absolute', right: 56, top: 330, zIndex: 46, opacity: inRange(2) ? k : 1 }}>
      <Pill style={{ color }}>🍜 {v.toFixed(1).replace('.', ',')} <span style={{ fontSize: 24, color: C.dim, fontWeight: 500 }}>seblak</span> <span style={{ fontSize: 24 }}>{tag}</span></Pill>
    </div>
  )
}

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`

export const UsageMeter: React.FC = () => {
  const f = useCurrentFrame()
  const scenes = [S1, S2, S3, S4, S5, S6, S7, S8, S9]
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(900px 900px at 50% 38%, #3a2219 0%, #141210 55%, #0b0a09 100%)', color: C.text, fontFamily: SANS, overflow: 'hidden' }}>
      {scenes.map((Sc, i) => <Sequence key={i} from={s(START[i])} durationInFrames={s(DUR[i])}><Sc /></Sequence>)}
      <SeblakCounter />
      <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 40, background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, #000c 100%)' }} />
      <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50, opacity: 0.1, mixBlendMode: 'overlay', backgroundImage: GRAIN, backgroundPosition: `${(f * 37) % 240}px ${(f * 53) % 240}px` }} />
    </AbsoluteFill>
  )
}
