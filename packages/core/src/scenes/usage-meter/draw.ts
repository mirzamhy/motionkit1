// Copy of usage-meter/hooks/draw.ts for the video.
export type LimitWindow = { percent: number; resetsAt: string | null }
export type Usage = { tokens: number | null; window: number; percent: number | null; fiveHour: LimitWindow | null; weekly: LimitWindow | null; usd: number | null }

export const HOUR = 60 * 60_000
export const FIVE_MIN = 5 * 60_000

export function slug(s: string): string {
  return s.toLowerCase().replace(/[\s_-]+/g, '')
}

// ---------- language ----------

export type Lang = 'en' | 'id'

export const LANGS: readonly Lang[] = ['en', 'id']

export function findLang(s: unknown): Lang | undefined {
  if (typeof s !== 'string') return undefined
  const v = slug(s)
  if (v === 'en' || v === 'english' || v === 'inggris') return 'en'
  if (v === 'id' || v === 'indonesia' || v === 'indonesian' || v === 'bahasa') return 'id'
  return undefined
}

type Strings = {
  fiveHour: string
  weekly: string
  noData: string
  token: string
  warm: string
  cold: string
  cacheIdle: string
  cacheLeft: (t: string) => string
  cacheGone: string
  costIdle: string
  reset: (d: number, h: number, m: number) => string
  resetShort: (d: number, h: number, m: number) => string
  minutes: (m: number) => string
  decimal: string
  tipContext: string
  tipFiveHour: string
  tipWeekly: string
  tipCache: (ttl: string) => string
  ttlHour: string
  ttlFive: string
  tipCost: (rate: string, list: string) => string
}

const STRINGS: Record<Lang, Strings> = {
  en: {
    fiveHour: '5h',
    weekly: 'Week',
    noData: 'no data yet',
    token: 'tokens',
    warm: 'Warm',
    cold: 'Cold',
    cacheIdle: 'no response yet',
    cacheLeft: t => `${t} left`,
    cacheGone: 'expired',
    costIdle: 'session cost (API)',
    reset: (d, h, m) => (d > 0 ? `resets ${d}d ${h}h` : h > 0 ? `resets ${h}h ${m}m` : `resets ${m}m`),
    resetShort: (d, h, m) => (d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`),
    minutes: m => (m < 1 ? '<1m' : `${m}m`),
    decimal: '.',
    tipContext: 'Context: how full this conversation is. Near the limit, Claude Code compacts it automatically.',
    tipFiveHour: 'Five-hour limit: your subscription allowance in a rolling 5-hour window, starting from your first message. At 100% you wait for the reset.',
    tipWeekly: 'Weekly limit: your allowance across all models over 7 days. At 100% you wait for the reset even if the 5-hour limit has room.',
    tipCache: ttl => `Prompt cache: Claude keeps the conversation cached for about ${ttl} after the last request. While warm, the next message is faster and lighter on your limits. Once cold, the whole context is processed again.`,
    ttlHour: '1 hour',
    ttlFive: '5 minutes',
    tipCost: (rate, list) => `What this session's tokens would cost at API prices${rate}. On a Pro or Max plan this is not billed: the 5-hour and weekly limits are what count. Prices: ${list}.`,
  },
  id: {
    fiveHour: '5 jam',
    weekly: 'Mingguan',
    noData: 'belum ada data',
    token: 'token',
    warm: 'Warm',
    cold: 'Cold',
    cacheIdle: 'belum ada respons',
    cacheLeft: t => `sisa ${t}`,
    cacheGone: 'cache habis',
    costIdle: 'biaya sesi (API)',
    reset: (d, h, m) => (d > 0 ? `reset ${d} hr ${h} jam` : h > 0 ? `reset ${h} jam ${m} mnt` : `reset ${m} mnt`),
    resetShort: (d, h, m) => (d > 0 ? `${d}hr ${h}j` : h > 0 ? `${h}j ${m}m` : `${m}m`),
    minutes: m => (m < 1 ? '<1 mnt' : `${m} mnt`),
    decimal: ',',
    tipContext: 'Context: seberapa penuh ingatan percakapan ini. Kalau hampir penuh, percakapan diringkas (compact) otomatis.',
    tipFiveHour: 'Limit 5 jam: jatah pemakaian langganan dalam jendela 5 jam, dihitung dari pesan pertama. Kalau 100%, tunggu sampai reset.',
    tipWeekly: 'Limit mingguan: total jatah pemakaian semua model dalam 7 hari. Kalau 100%, tunggu reset walau limit 5 jam masih sisa.',
    tipCache: ttl => `Prompt cache: Claude menyimpan percakapan sementara (perkiraan ${ttl} sejak request terakhir). Selama warm, pesan berikutnya lebih cepat dan lebih hemat limit. Kalau cold, seluruh context diproses ulang dari awal.`,
    ttlHour: '1 jam',
    ttlFive: '5 menit',
    tipCost: (rate, list) => `Perkiraan biaya token sesi ini kalau dihitung pakai harga API${rate}. Kalau kamu langganan Pro/Max, ini bukan tagihan: yang membatasi kamu adalah limit 5 jam dan mingguan. Harga: ${list}.`,
  },
}

// ---------- styles ----------

export const STYLES = [
  { id: 'speedo', en: 'small speedometer with a needle', id_: 'speedometer kecil dengan jarum' },
  { id: 'ring', en: 'donut ring', id_: 'cincin donat' },
  { id: 'bar', en: 'thin bar', id_: 'bar tipis' },
  { id: 'segment', en: 'ten battery segments', id_: 'segmen baterai 10 kotak' },
  { id: 'chip', en: 'compact pills on one line', id_: 'chip ringkas satu baris' },
] as const

export type StyleId = (typeof STYLES)[number]['id']

export const DEFAULT_STYLE: StyleId = 'speedo'

export function styleName(s: (typeof STYLES)[number], lang: Lang): string {
  return lang === 'id' ? s.id_ : s.en
}

export function findStyle(name: string): StyleId | undefined {
  const s = slug(name)
  const alias: Record<string, StyleId> = {
    speedometer: 'speedo', cincin: 'ring', donut: 'ring', segmen: 'segment',
    baterai: 'segment', battery: 'segment', pill: 'chip',
  }
  return STYLES.find(x => x.id === s)?.id ?? alias[s]
}

// ---------- price comparisons ----------

// Rough rate and street prices; good enough for a fun comparison.
export const IDR_PER_USD = 18_000

type Item = { name: string; plural: string; price: number }

// Sorted by price; `auto` picks from here. Prices in each list's own currency.
export const ITEMS: Record<Lang, readonly Item[]> = {
  en: [
    { name: 'gumball', plural: 'gumballs', price: 0.25 },
    { name: 'soda', plural: 'sodas', price: 1.5 },
    { name: 'candy bar', plural: 'candy bars', price: 2 },
    { name: 'espresso', plural: 'espressos', price: 3 },
    { name: 'coffee', plural: 'coffees', price: 5 },
    { name: 'Big Mac', plural: 'Big Macs', price: 6 },
    { name: 'matcha latte', plural: 'matcha lattes', price: 6.5 },
    { name: 'burrito', plural: 'burritos', price: 11 },
    { name: 'ramen', plural: 'bowls of ramen', price: 16 },
    { name: 'pizza', plural: 'pizzas', price: 20 },
  ],
  id: [
    { name: 'beng-beng', plural: 'beng-beng', price: 2_500 },
    { name: 'Indomie', plural: 'Indomie', price: 3_500 },
    { name: 'es teh', plural: 'es teh', price: 5_000 },
    { name: 'tahu kocek', plural: 'tahu kocek', price: 5_000 },
    { name: 'ayam goreng', plural: 'ayam goreng', price: 12_000 },
    { name: 'seblak', plural: 'seblak', price: 15_000 },
    { name: 'kopi susu', plural: 'kopi susu', price: 20_000 },
    { name: 'matcha', plural: 'matcha', price: 25_000 },
    { name: 'nasi padang', plural: 'nasi padang', price: 25_000 },
    { name: 'martabak', plural: 'martabak', price: 60_000 },
    { name: 'pizza besar', plural: 'pizza besar', price: 150_000 },
  ],
}

export const AUTO = 'auto'

export function findItem(name: string, lang: Lang): Item | undefined {
  return ITEMS[lang].find(f => slug(f.name) === slug(name))
}

export function rupiah(idr: number): string {
  if (idr >= 1_000_000) return `Rp${(idr / 1_000_000).toFixed(1).replace('.', ',')}jt`
  if (idr >= 10_000) return `Rp${Math.round(idr / 1_000)}rb`
  if (idr >= 1_000) return `Rp${(idr / 1_000).toFixed(1).replace('.', ',').replace(',0', '')}rb`
  return `Rp${Math.round(idr)}`
}

function dollars(usd: number): string {
  return usd % 1 === 0 ? `$${usd}` : `$${usd.toFixed(2)}`
}

export function priceText(price: number, lang: Lang): string {
  return lang === 'id' ? rupiah(price) : dollars(price)
}

// A chosen item, or in `auto` the priciest one the money covers at least once,
// so the count stays readable.
export function compare(usd: number, choice: string, lang: Lang): string {
  const items = ITEMS[lang]
  const money = lang === 'id' ? usd * IDR_PER_USD : usd
  const first = items[0]!
  const pick = findItem(choice, lang) ?? [...items].reverse().find(f => money / f.price >= 1) ?? first
  const n = money / pick.price
  const dec = STRINGS[lang].decimal
  const shown = n >= 10 ? Math.round(n).toString() : n.toFixed(1).replace('.0', '').replace('.', dec)
  const noun = shown === '1' ? pick.name : pick.plural
  return `≈ ${shown} ${noun}`
}

// ---------- cache ----------

// Claude Code caches subscription traffic for an hour and API-key traffic for
// five minutes. Until a hit or miss proves which, a known plan limit means 1h.
function cacheTtlMs(u: Usage, learned: number): number {
  if (learned > 0) return learned
  return u.fiveHour !== null || u.weekly !== null ? HOUR : FIVE_MIN
}

// A hit after more than five idle minutes proves the 1h TTL; a miss inside
// the hour proves the 5m one. Anything else says nothing new.
export function observeTtl(gapMs: number, read: number, written: number): number | null {
  const isHit = read > 0 && read >= written
  const isMiss = written > 0 && read < written
  if (isHit && gapMs > FIVE_MIN + 30_000) return HOUR
  if (isMiss && gapMs > FIVE_MIN + 30_000 && gapMs < HOUR - 60_000) return FIVE_MIN
  return null
}

export type CacheState = { status: 'none' | 'warm' | 'cold'; leftMs: number; ttlMs: number }

export function cacheState(u: Usage, last: number, now: number, learned: number): CacheState {
  const ttlMs = cacheTtlMs(u, learned)
  if (last === 0) return { status: 'none', leftMs: 0, ttlMs }
  const leftMs = last + ttlMs - now
  return { status: leftMs > 0 ? 'warm' : 'cold', leftMs: Math.max(0, leftMs), ttlMs }
}

// ---------- text helpers ----------

export function k(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
  return `${Math.round(n / 1000)}k`
}

function untilReset(resetsAt: string | null, now: number): [number, number, number] | null {
  if (!resetsAt) return null
  const mins = Math.max(0, Math.round((Date.parse(resetsAt) - now) / 60000))
  return [Math.floor(mins / 1440), Math.floor((mins % 1440) / 60), mins % 60]
}

function minutesLeft(ms: number, t: Strings): string {
  return t.minutes(Math.floor(ms / 60_000))
}

// ---------- the items, independent of style ----------

const MUTED = '#a3a3a3'
const TRACK = '#80808045'
const WARM = '#f97316'
const COLD = '#38bdf8'
const MONEY = '#60a5fa'
const FONT = 'font-family="system-ui,-apple-system,Segoe UI,sans-serif"'

function level(p: number): string {
  if (p >= 85) return '#ef4444'
  if (p >= 60) return '#f59e0b'
  return '#22c55e'
}

type Meter = {
  isCache: boolean
  frac: number
  color: string
  value: string
  label: string
  sub: string
  short: string
  tip: string
}

type Cost = { main: string; local: string; sub: string; tip: string }

function limitMeter(percent: number | null, label: string, sub: string, short: string, tip: string): Meter {
  const p = percent === null ? 0 : Math.min(Math.max(percent, 0), 100)
  return {
    isCache: false,
    frac: p / 100,
    color: percent === null ? MUTED : level(p),
    value: percent === null ? '–' : `${Math.round(p)}%`,
    label,
    sub,
    short,
    tip,
  }
}

function limitTexts(w: Usage['fiveHour'], now: number, t: Strings): [string, string] {
  const r = w ? untilReset(w.resetsAt, now) : null
  if (!w) return [t.noData, '–']
  if (!r) return ['', '']
  return [t.reset(...r), t.resetShort(...r)]
}

function meters(u: Usage, now: number, cache: CacheState, t: Strings): Meter[] {
  const ctx = `${u.tokens === null ? '–' : k(u.tokens)} / ${k(u.window)}`
  const [fiveSub, fiveShort] = limitTexts(u.fiveHour, now, t)
  const [weekSub, weekShort] = limitTexts(u.weekly, now, t)
  const left = minutesLeft(cache.leftMs, t)
  return [
    limitMeter(u.percent, 'Context', `${ctx} ${t.token}`, ctx, t.tipContext),
    limitMeter(u.fiveHour?.percent ?? null, t.fiveHour, fiveSub, fiveShort, t.tipFiveHour),
    limitMeter(u.weekly?.percent ?? null, t.weekly, weekSub, weekShort, t.tipWeekly),
    {
      isCache: true,
      frac: cache.status === 'warm' ? cache.leftMs / cache.ttlMs : 0,
      color: cache.status === 'warm' ? WARM : cache.status === 'cold' ? COLD : MUTED,
      value: cache.status === 'warm' ? t.warm : cache.status === 'cold' ? t.cold : '–',
      label: 'Cache',
      sub: cache.status === 'warm' ? t.cacheLeft(left) : cache.status === 'cold' ? t.cacheGone : t.cacheIdle,
      short: cache.status === 'warm' ? left : cache.status === 'cold' ? t.cacheGone : '–',
      tip: t.tipCache(cache.ttlMs >= HOUR ? t.ttlHour : t.ttlFive),
    },
  ]
}

function cost(usd: number | null, choice: string, lang: Lang): Cost {
  const t = STRINGS[lang]
  const list = ITEMS[lang].map(f => `${f.name} ${priceText(f.price, lang)}`).join(', ')
  const rate = lang === 'id' ? ` (kurs kira-kira Rp${IDR_PER_USD.toLocaleString('id-ID')}/USD)` : ''
  return {
    main: usd === null ? '–' : `$${usd.toFixed(2)}`,
    local: usd === null || lang !== 'id' ? '' : rupiah(usd * IDR_PER_USD),
    sub: usd === null ? t.costIdle : compare(usd, choice, lang),
    tip: t.tipCost(rate, list),
  }
}

// ---------- shapes ----------

function f2(n: number): string {
  return n.toFixed(2)
}

function pt(cx: number, cy: number, r: number, a: number): [string, string] {
  return [f2(cx + r * Math.cos(a)), f2(cy - r * Math.sin(a))]
}

function speedoGlyph(m: Meter, x: number): string {
  const cx = x + 20
  const cy = 28
  const r = 16
  const angle = Math.PI - Math.PI * Math.min(m.frac, 0.999)
  const [ex, ey] = pt(cx, cy, r, angle)
  const [nx, ny] = pt(cx, cy, r - 6, angle)
  const arc = m.frac > 0
    ? `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}" fill="none" stroke="${m.color}" stroke-width="5" stroke-linecap="round"/>`
    : ''
  return [
    `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${TRACK}" stroke-width="5" stroke-linecap="round"/>`,
    arc,
    `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${m.color}" stroke-width="2" stroke-linecap="round"/>`,
    `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${m.color}"/>`,
  ].join('')
}

function ringGlyph(m: Meter, x: number): string {
  const cx = x + 18
  const cy = 20
  const r = 13
  const circ = 2 * Math.PI * r
  const arc = m.frac > 0
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${m.color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${f2(circ * m.frac)} ${f2(circ)}" transform="rotate(-90 ${cx} ${cy})"/>`
    : ''
  const dot = m.isCache ? `<circle cx="${cx}" cy="${cy}" r="3" fill="${m.color}"/>` : ''
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${TRACK}" stroke-width="4"/>${arc}${dot}`
}

function hit(x: number, w: number, h: number, tip: string, body: string): string {
  return `<g><title>${tip}</title><rect x="${x}" y="0" width="${f2(w)}" height="${h}" fill="transparent"/>${body}</g>`
}

// SVG can't measure text, so widths come from a per-character guess.
function textWidth(s: string, px: number, isBold: boolean): number {
  return s.length * px * (isBold ? 0.6 : 0.5)
}

// The cache reads like the others: "Warm cache", "Cold cache", "– cache".
function headParts(m: Meter): [string, string] {
  return m.isCache ? [m.value, 'cache'] : [m.value, m.label]
}

const GAP = 18

// Two lines of text right of a glyph: speedo and ring.
function glyphWidth(m: Meter, style: StyleId): number {
  const [v, l] = headParts(m)
  const head = textWidth(v, 14, true) + 6 + textWidth(l, 14, true)
  return (style === 'speedo' ? 46 : 42) + Math.max(head, textWidth(m.sub, 12, false)) + GAP
}

function glyphItem(m: Meter, x: number, w: number, style: StyleId): string {
  const isNeedle = style === 'speedo'
  const glyph = isNeedle ? speedoGlyph(m, x) : ringGlyph(m, x)
  const tx = x + (isNeedle ? 46 : 42)
  const [v, l] = headParts(m)
  const head = `<tspan font-weight="700" fill="${m.color}">${v}</tspan><tspan dx="6" font-weight="600" fill="${MUTED}">${l}</tspan>`
  return hit(x, w, 40, m.tip, [
    glyph,
    `<text x="${tx}" y="17" ${FONT} font-size="14">${head}</text>`,
    `<text x="${tx}" y="33" ${FONT} font-size="12" fill="${MUTED}">${m.sub}</text>`,
  ].join(''))
}

// One line of text over a track: bar and segment.
function trackWidth(m: Meter): number {
  const [v, l] = headParts(m)
  const line = textWidth(v, 13, true) + 6 + textWidth(l, 13, true) + 6 + textWidth(m.short, 11.5, false)
  return Math.max(line, 100) + GAP
}

function trackItem(m: Meter, x: number, w: number, style: StyleId): string {
  const tw = w - GAP
  let track: string
  if (style === 'bar') {
    const fill = m.frac > 0 ? `<rect x="${x}" y="27" width="${f2(Math.max(5, tw * m.frac))}" height="5" rx="2.5" fill="${m.color}"/>` : ''
    track = `<rect x="${x}" y="27" width="${tw}" height="5" rx="2.5" fill="${TRACK}"/>${fill}`
  } else {
    const gap = 2
    const sw = (tw - gap * 9) / 10
    const lit = Math.round(m.frac * 10)
    track = Array.from({ length: 10 }, (_, i) =>
      `<rect x="${f2(x + i * (sw + gap))}" y="25" width="${f2(sw)}" height="8" rx="1.5" fill="${i < lit ? m.color : TRACK}"/>`,
    ).join('')
  }
  const [v, l] = headParts(m)
  const head = `<tspan font-weight="700" fill="${m.color}">${v}</tspan><tspan dx="6" font-weight="600" fill="${MUTED}">${l}</tspan>`
  return hit(x, w, 40, m.tip, [
    `<text x="${x}" y="16" ${FONT} font-size="13">${head}<tspan dx="6" font-size="11.5" fill="${MUTED}">${m.short}</tspan></text>`,
    track,
  ].join(''))
}

function costWidth(c: Cost, style: StyleId): number {
  const px = style === 'bar' || style === 'segment' ? 13 : 14
  const top = textWidth(c.main, px, true) + (c.local ? textWidth(` · ${c.local}`, px, true) : 0)
  return 4 + Math.max(top, textWidth(c.sub, 12, false)) + 6
}

function costItem(c: Cost, x: number, w: number, style: StyleId): string {
  const local = c.local ? `<tspan font-weight="600" fill="${MUTED}"> · ${c.local}</tspan>` : ''
  const isTrack = style === 'bar' || style === 'segment'
  return hit(x, w, 40, c.tip, [
    `<text x="${x + 4}" y="${isTrack ? 16 : 17}" ${FONT} font-size="${isTrack ? 13 : 14}"><tspan font-weight="700" fill="${MONEY}">${c.main}</tspan>${local}</text>`,
    `<text x="${x + 4}" y="${isTrack ? 32 : 33}" ${FONT} font-size="12" fill="${MUTED}">${c.sub}</text>`,
  ].join(''))
}

function chip(x: number, color: string, strong: string, rest: string, tip: string): [string, number] {
  const w = 24 + textWidth(strong, 12.5, true) + 5 + textWidth(rest, 12, false) + 10
  const body = [
    `<rect x="${x}" y="2" width="${f2(w)}" height="24" rx="12" fill="#80808018" stroke="${TRACK}"/>`,
    `<circle cx="${x + 14}" cy="14" r="4" fill="${color}"/>`,
    `<text x="${x + 24}" y="18.5" ${FONT} font-size="12.5"><tspan font-weight="700" fill="${color}">${strong}</tspan><tspan dx="5" font-size="12" fill="${MUTED}">${rest}</tspan></text>`,
  ].join('')
  return [hit(x, w, 28, tip, body), w]
}

export type Drawing = { source: string; width: number; height: number }

export function draw(style: StyleId, lang: Lang, u: Usage, now: number, choice: string, cache: CacheState): Drawing {
  const t = STRINGS[lang]
  const ms = meters(u, now, cache, t)
  const c = cost(u.usd, choice, lang)
  let body = ''
  let width = 0
  let height = 40

  if (style === 'chip') {
    height = 28
    for (const m of ms) {
      const rest = m.isCache
        ? m.value === '–' ? t.cacheIdle : `cache · ${m.short}`
        : `${m.label} · ${m.short}`
      const [g, w] = chip(width, m.color, m.isCache && m.value === '–' ? 'Cache' : m.value, rest, m.tip)
      body += g
      width += w + 8
    }
    const [g, w] = chip(width, MONEY, c.main, [c.local, c.sub].filter(Boolean).join(' · '), c.tip)
    body += g
    width += w
  } else {
    const isTrack = style === 'bar' || style === 'segment'
    for (const m of ms) {
      const w = isTrack ? trackWidth(m) : glyphWidth(m, style)
      body += isTrack ? trackItem(m, width, w, style) : glyphItem(m, width, w, style)
      width += w
    }
    const costW = costWidth(c, style)
    body += costItem(c, width, costW, style)
    width += costW
  }

  width = Math.ceil(width) + 2
  return {
    source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`,
    width,
    height,
  }
}

// ---------- compact reminder ----------

export const DEFAULT_COMPACT_AT = 40

// Compacting reads the whole conversation once to summarise it: cheap while
// the cache is warm, full price once it is cold. A cold cache on a new topic
// is better served by a fresh session.
export function compactAdvice(lang: Lang, percent: number, cache: CacheState): string {
  const p = Math.round(percent)
  if (lang === 'id') {
    if (cache.status === 'cold') {
      return `Context sudah ${p}% dan cache sudah cold. Ganti topik? Mulai sesi baru (/clear). Masih topik sama? /compact.`
    }
    const warm = cache.status === 'warm' ? ', mumpung cache masih warm jadi ringkasannya murah' : ''
    return `Context sudah ${p}%. Sebaiknya /compact sekarang${warm}.`
  }
  if (cache.status === 'cold') {
    return `Context is at ${p}% and the cache is cold. New topic? Start fresh with /clear. Same topic? /compact.`
  }
  const warm = cache.status === 'warm' ? ' while the cache is warm, so summarising is cheap' : ''
  return `Context is at ${p}%. Consider /compact now${warm}.`
}

export function compactLabels(lang: Lang): { compact: string; later: string } {
  return lang === 'id' ? { compact: 'Compact sekarang', later: 'Nanti' } : { compact: 'Compact now', later: 'Later' }
}

// Plain text for surfaces that draw no SVG (the terminal).
export function plain(lang: Lang, u: Usage, now: number, cache: CacheState, choice: string): string {
  const t = STRINGS[lang]
  const ms = meters(u, now, cache, t)
  const c = cost(u.usd, choice, lang)
  return [
    ...ms.map(m => (m.isCache ? `Cache ${m.value} ${m.short}` : `${m.label} ${m.value}`)),
    [c.main, c.local].filter(Boolean).join(' '),
  ].join('  ·  ')
}
