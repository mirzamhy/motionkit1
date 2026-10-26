import * as THREE from 'three'
import logoUrl from './logo-jajandulu.webp'
import { continueRender, delayRender, staticFile } from 'remotion'

function kanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const cache = new Map<string, THREE.Texture>()

function simpan(key: string, buat: () => THREE.Texture) {
  let t = cache.get(key)
  if (!t) {
    t = buat()
    cache.set(key, t)
  }
  return t
}

/** Warna serat halus; peta tinggi dibuat terpisah agar kain tidak tampak berbatu. */
export function teksturFlanel() {
  return simpan('flanel', () => {
    const [c, g] = kanvas(512, 512)
    const r = rng(7)
    g.fillStyle = '#e9e6df'
    g.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 19000; i++) {
      const x = r() * 512
      const y = r() * 512
      const a = r() * Math.PI
      const l = 5 + r() * 11
      const terang = r() > 0.5
      g.strokeStyle = terang ? `rgba(255,255,255,${0.32 + r() * 0.2})` : `rgba(58,42,32,${0.12 + r() * 0.13})`
      g.lineWidth = 0.8 + r() * 0.9
      g.beginPath()
      g.moveTo(x, y)
      g.quadraticCurveTo(x + Math.cos(a + 0.65) * l * 0.6, y + Math.sin(a + 0.65) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l)
      g.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 2)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  })
}

export function tinggiFlanel() {
  return simpan('flanel-height', () => {
    const [c, g] = kanvas(512, 512)
    const r = rng(17)
    g.fillStyle = '#808080'
    g.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 23000; i++) {
      const x = r() * 512
      const y = r() * 512
      const a = r() * Math.PI
      const l = 4 + r() * 10
      g.strokeStyle = r() > 0.5 ? '#bababa' : '#555555'
      g.lineWidth = 0.7 + r() * 1.1
      g.beginPath()
      g.moveTo(x, y)
      g.quadraticCurveTo(x + Math.cos(a + 0.5) * l * 0.6, y + Math.sin(a + 0.5) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l)
      g.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 2)
    t.anisotropy = 8
    return t
  })
}

export function teksturKlepon() {
  return simpan('klepon-fiber', () => {
    const handle = delayRender('Klepon fabric texture')
    const t = new THREE.TextureLoader().load(
      staticFile('jajan/klepon-fiber.png'),
      () => {
        t.needsUpdate = true
        window.setTimeout(() => continueRender(handle), 300)
      },
      undefined,
      () => continueRender(handle),
    )
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 2)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  })
}

/**
 * Benang terpilin: garis serat miring yang berulang sepanjang benang, plus bulu halus.
 * Dipakai di geometri tabung (u = sepanjang benang, v = mengelilingi benang).
 */
export function teksturBenang() {
  return simpan('benang', () => {
    const [c, g] = kanvas(256, 64)
    const r = rng(13)
    g.fillStyle = '#e4e4e4'
    g.fillRect(0, 0, 256, 64)
    // Pilinan: pita terang dan gelap miring.
    for (let x = -64; x < 256 + 64; x += 16) {
      g.fillStyle = 'rgba(255,255,255,0.55)'
      g.beginPath()
      g.moveTo(x, 0)
      g.lineTo(x + 8, 0)
      g.lineTo(x + 8 + 24, 64)
      g.lineTo(x + 24, 64)
      g.fill()
      g.fillStyle = 'rgba(0,0,0,0.18)'
      g.beginPath()
      g.moveTo(x + 9, 0)
      g.lineTo(x + 11, 0)
      g.lineTo(x + 11 + 24, 64)
      g.lineTo(x + 9 + 24, 64)
      g.fill()
    }
    // Bulu-bulu serat yang lepas.
    for (let i = 0; i < 600; i++) {
      const x = r() * 256
      const y = r() * 64
      g.strokeStyle = `rgba(255,255,255,${0.2 + r() * 0.3})`
      g.lineWidth = 0.6
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + (r() - 0.5) * 6, y + (r() - 0.5) * 6)
      g.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(3, 1)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })
}

/** Serat kertas kraft memanjang. */
export function teksturKraft() {
  return simpan('kraft', () => {
    const [c, g] = kanvas(512, 512)
    const r = rng(3)
    g.fillStyle = '#c89b6d'
    g.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 2600; i++) {
      const x = r() * 512
      const y = r() * 512
      g.strokeStyle = r() > 0.5 ? `rgba(255,236,205,${0.06 + r() * 0.1})` : `rgba(80,45,20,${0.05 + r() * 0.1})`
      g.lineWidth = 0.5 + r() * 1.2
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + (r() - 0.5) * 4, y + 10 + r() * 30)
      g.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })
}

/** Sisi depan kantong: kraft dengan label krem dan logo. Butuh font sudah dimuat. */
let _logo: Promise<HTMLImageElement | null> | undefined
/** Gambar logo balon, dimuat sekali. Selama dimuat, render Remotion ditahan. */
function muatLogo() {
  return (_logo ??= new Promise((r) => {
    const tahan = delayRender('logo Jajan Dulu!')
    const img = new Image()
    img.onload = () => {
      r(img)
      continueRender(tahan)
    }
    img.onerror = () => {
      r(null)
      continueRender(tahan)
    }
    img.src = logoUrl
  }))
}
/** Selesai saat logo sudah dimuat; kanvas 3D yang memakai tekstur logo perlu digambar ulang setelahnya. */
export const logoSiap = () => muatLogo().then(() => undefined)

/** Papan bertuliskan logo balon di atas warna latar (papan nama lapak). */
export function teksturLogo(latar: string, w: number, h: number) {
  return simpan(`logo-${latar}-${w}x${h}`, () => {
    const [c, g] = kanvas(w, h)
    g.fillStyle = latar
    g.fillRect(0, 0, w, h)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    muatLogo().then((img) => {
      if (!img) return
      const k = Math.min((w * 0.86) / img.naturalWidth, (h * 0.86) / img.naturalHeight)
      const lw = img.naturalWidth * k
      const lh = img.naturalHeight * k
      g.drawImage(img, (w - lw) / 2, (h - lh) / 2, lw, lh)
      t.needsUpdate = true
    })
    return t
  })
}

let labelBeres: () => void = () => {}
const _labelSiap = new Promise<void>((r) => (labelBeres = r))
/** Selesai saat logo sudah tergambar di label kantong; kanvas 3D perlu digambar ulang setelahnya. */
export const labelSiap = () => _labelSiap

/** Isi stiker label kantong: seri di atas, logo balon di tengah, ajakan di bawah. Tanpa logo: tulisan teks. */
function gambarLabel(g: CanvasRenderingContext2D, W: number, H: number, logo: HTMLImageElement | null) {
  const kraft = teksturKraft().image as HTMLCanvasElement
  g.drawImage(kraft, 0, 0, W, H)
  // Lipatan dasar.
  g.fillStyle = 'rgba(0,0,0,0.06)'
  g.fillRect(0, H * 0.91, W, H * 0.09)
  g.fillStyle = 'rgba(60,35,15,0.25)'
  g.fillRect(0, H * 0.91, W, 2)

  g.save()
  g.translate(W / 2, H * 0.6)
  g.rotate(-0.035)
  const lw = W * 0.7
  const lh = H * 0.42
  g.fillStyle = '#FFF8F1'
  g.beginPath()
  g.roundRect(-lw / 2, -lh / 2, lw, lh, 14)
  g.fill()
  g.textAlign = 'center'
  g.fillStyle = '#6B4A3F'
  g.font = '500 20px Poppins, sans-serif'
  g.fillText('Seri 01 · Jajanan Pasar', 0, -lh / 2 + 34)
  if (logo) {
    const lh2 = lh * 0.6
    const lw2 = (lh2 * logo.naturalWidth) / logo.naturalHeight
    g.drawImage(logo, -lw2 / 2, -lh / 2 + 46, lw2, lh2)
  } else {
    g.fillStyle = '#3B2620'
    g.font = '72px "Bagel Fat One", sans-serif'
    g.fillText('JAJAN', 0, -8)
    g.fillText('DULU!', 0, 62)
  }
  g.fillStyle = '#3E6B35'
  g.font = '30px "Gochi Hand", cursive'
  g.fillText('siapa yang kamu dapat?', 0, lh / 2 - 18)
  g.restore()
}

export function teksturLabel() {
  return simpan('label', () => {
    const W = 512
    const H = 640
    const [c, g] = kanvas(W, H)
    gambarLabel(g, W, H, null)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    // logo balon digambar ulang begitu gambarnya selesai dimuat
    const img = new Image()
    const tahan = delayRender('logo label kantong')
    const selesai = () => {
      continueRender(tahan)
      labelBeres()
    }
    img.onload = () => {
      gambarLabel(g, W, H, img)
      t.needsUpdate = true
      selesai()
    }
    img.onerror = () => selesai()
    img.src = logoUrl
    return t
  })
}

/** Garis kue lapis: pink, krem, hijau, krem, pink dari atas ke bawah. */
export function teksturLapis() {
  return simpan('lapis', () => {
    const [c, g] = kanvas(64, 320)
    const warna = ['#F27BAA', '#F8EEDC', '#8CC152', '#F8EEDC', '#F27BAA']
    warna.forEach((w, i) => {
      g.fillStyle = w
      g.fillRect(0, i * 64, 64, 64)
    })
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })
}

/** Tanda tanya untuk karakter rahasia, dipetakan ke UV bola (depan = u 0.25). */
export function teksturTanya() {
  return simpan('tanya', () => {
    const [c, g] = kanvas(1024, 512)
    // Dipakai sebagai emissiveMap: hitam = tidak menyala, putih = tanda tanya menyala.
    g.fillStyle = '#000000'
    g.fillRect(0, 0, 1024, 512)
    g.save()
    g.translate(256, 330)
    // UV bola meregang 2x di arah horizontal, jadi huruf dipipihkan dulu.
    g.scale(0.5, 1)
    g.fillStyle = '#ffffff'
    g.textAlign = 'center'
    g.font = '300px "Bagel Fat One", sans-serif'
    g.fillText('?', 0, 0)
    g.restore()
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })
}

/** Gradasi radial untuk bayangan lantai dan cahaya mulut kantong. */
export function teksturRadial(warnaTengah: string) {
  return simpan('radial' + warnaTengah, () => {
    const [c, g] = kanvas(256, 256)
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    gr.addColorStop(0, warnaTengah)
    gr.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = gr
    g.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })
}

export async function tungguFont() {
  await Promise.all([
    document.fonts.load('72px "Bagel Fat One"'),
    document.fonts.load('30px "Gochi Hand"'),
    document.fonts.load('500 20px Poppins'),
  ]).catch(() => undefined)
}
