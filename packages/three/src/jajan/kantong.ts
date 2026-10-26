import * as THREE from 'three'
import { teksturKraft, teksturLabel, teksturRadial } from './tekstur'

export const KANTONG = { W: 1.5, H: 1.9, D: 0.95 }

export type Kantong = {
  grup: THREE.Group
  /** 0 tertutup, 1 terbuka penuh (tutup menggantung di belakang, lampu dalam menyala). */
  setBuka: (t: number) => void
  /** Kekuatan cahaya dari dalam (0-1), terpisah dari bukaan supaya bisa dipadamkan saat kantong jatuh. */
  setCahaya: (t: number) => void
}

function stikerTekstur() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#F2A7B8'
  g.beginPath()
  g.arc(64, 64, 62, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#3B2620'
  g.textAlign = 'center'
  g.font = '76px "Bagel Fat One", sans-serif'
  g.fillText('?', 64, 92)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Dinding kertas dua sisi: luar dan dalam punya material berbeda. */
function dinding(w: number, h: number, luar: THREE.Material, dalam: THREE.Material) {
  const g = new THREE.Group()
  const geo = new THREE.PlaneGeometry(w, h)
  const a = new THREE.Mesh(geo, luar)
  const b = new THREE.Mesh(geo, dalam)
  a.receiveShadow = b.receiveShadow = true
  g.add(a, b)
  return g
}

export function buatKantong(): Kantong {
  const { W, H, D } = KANTONG
  const grup = new THREE.Group()

  const kraft = teksturKraft()
  const luar = (warna: string) => new THREE.MeshStandardMaterial({ color: warna, map: kraft, roughness: 0.92 })
  // Warna material dikali tekstur kraft, jadi warna dasar dibuat hampir putih supaya hasilnya tetap cokelat muda.
  const matDalam = new THREE.MeshStandardMaterial({ color: '#b89a7c', map: kraft, roughness: 1, side: THREE.BackSide })
  const matDepan = new THREE.MeshStandardMaterial({ map: teksturLabel(), roughness: 0.9 })

  const depan = dinding(W, H, matDepan, matDalam)
  depan.position.set(0, H / 2, D / 2)
  const belakang = dinding(W, H, luar('#f2e8dc'), matDalam)
  belakang.position.set(0, H / 2, -D / 2)
  belakang.rotation.y = Math.PI
  const kiri = dinding(D, H, luar('#ecdccb'), matDalam)
  kiri.position.set(-W / 2, H / 2, 0)
  kiri.rotation.y = -Math.PI / 2
  const kanan = dinding(D, H, luar('#ecdccb'), matDalam)
  kanan.position.set(W / 2, H / 2, 0)
  kanan.rotation.y = Math.PI / 2
  const dasar = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#a07a55', map: kraft, roughness: 1 }))
  dasar.rotation.x = -Math.PI / 2
  dasar.position.y = 0.002
  grup.add(depan, belakang, kiri, kanan, dasar)

  // Tutup berengsel di tepi atas belakang. Sudut negatif = terangkat ke belakang.
  const engsel = new THREE.Group()
  engsel.position.set(0, H, -D / 2)
  const matTutup = new THREE.MeshStandardMaterial({ color: '#fff4e6', map: kraft, roughness: 0.9 })
  const matTutupDalam = new THREE.MeshStandardMaterial({ color: '#c9ab8a', map: kraft, roughness: 1, side: THREE.BackSide })
  const tutup = dinding(W + 0.02, D + 0.02, matTutup, matTutupDalam)
  tutup.rotation.x = -Math.PI / 2
  tutup.position.set(0, 0.004, D / 2)
  const lidah = dinding(W + 0.02, 0.3, matTutup, matTutupDalam)
  lidah.position.set(0, -0.15, D + 0.012)
  const stiker = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 40),
    new THREE.MeshStandardMaterial({ map: stikerTekstur(), roughness: 0.5, transparent: true }),
  )
  stiker.position.set(0, -0.29, D + 0.016)
  stiker.rotation.z = 0.15
  engsel.add(tutup, lidah, stiker)
  grup.add(engsel)

  // Lampu hangat di dalam kantong: menerangi dinding dalam dan charm dari bawah.
  const lampu = new THREE.PointLight('#ffc77a', 0, 4, 1.6)
  lampu.position.set(0, H * 0.45, 0)
  grup.add(lampu)

  // Cahaya di mulut kantong.
  const mulut = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 1.6, D * 1.9),
    new THREE.MeshBasicMaterial({
      map: teksturRadial('rgba(255,210,140,1)'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  mulut.rotation.x = -Math.PI / 2
  mulut.position.y = H - 0.05
  grup.add(mulut)

  // Berkas sinar yang naik dari mulut kantong, memudar ke atas.
  const sinarMat = new THREE.ShaderMaterial({
    uniforms: { uKuat: { value: 0 }, uWarna: { value: new THREE.Color('#ffd79a') } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uKuat; uniform vec3 uWarna; varying vec2 vUv;
      void main(){ float a = pow(1.0 - vUv.y, 1.8) * uKuat * 0.42; gl_FragColor = vec4(uWarna * a, a); }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const sinar = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.95, W * 0.48, 2.8, 48, 1, true), sinarMat)
  sinar.position.y = H + 1.4
  grup.add(sinar)

  const setCahaya = (t: number) => {
    lampu.intensity = t * 9
    sinarMat.uniforms.uKuat.value = t
    ;(mulut.material as THREE.MeshBasicMaterial).opacity = t * 0.75
  }

  const setBuka = (t: number) => {
    engsel.rotation.x = -t * THREE.MathUtils.degToRad(208)
  }

  return { grup, setBuka, setCahaya }
}

/** Bayangan lembut di lantai. */
export function buatBayangan(lebar: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(lebar, lebar * 0.6),
    new THREE.MeshBasicMaterial({ map: teksturRadial('rgba(0,0,0,0.75)'), transparent: true, depthWrite: false }),
  )
  m.rotation.x = -Math.PI / 2
  m.position.y = 0.001
  return m
}

/** Sorotan hangat di lantai sekitar kantong. */
export function buatSorot(lebar: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(lebar, lebar * 0.5),
    new THREE.MeshBasicMaterial({
      map: teksturRadial('rgba(255,214,160,0.22)'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  m.rotation.x = -Math.PI / 2
  m.position.y = 0.0005
  return m
}
