// Papan gaya teaser Jajan Dulu!: tiga keyframe untuk tiap gaya alternatif, dirender dengan aset 3D yang sama
// dengan teaser utama, supaya tim bisa memilih gaya sebelum dibangun penuh.
// Frame 0-2 Gacha summon, 3-5 POV meme, 6-8 Stop-motion flanel, 9-11 ASMR unboxing.
// Satuan dunia charm: 1 unit = 6 cm (kantong 9 × 11 cm).
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { loadFont as loadBagel } from '@remotion/google-fonts/BagelFatOne';
import { loadFont as loadGochi } from '@remotion/google-fonts/GochiHand';
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { buatCharm, type CharmId } from '../../../three/src/jajan/charm';
import { buatKantong } from '../../../three/src/jajan/kantong';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { aturTangan, buatTangan, campurPose, kunciJepit, letakkanJepit, POSE } from '../../../three/src/jajan/tubuh';
import { rng } from './kit';
import { kanvasTekstur } from './JajanLapak';

const bagel = loadBagel('normal', { weights: ['400'], subsets: ['latin'] });
const gochi = loadGochi('normal', { weights: ['400'], subsets: ['latin'] });
const poppins = loadPoppins('normal', { weights: ['500', '700'], subsets: ['latin'] });

export const GAYA_TEASER_FRAMES = 12;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Bahan bantu

export const teksturRadial = (dalam: string, luar: string) =>
  kanvasTekstur(256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, dalam);
    gr.addColorStop(1, luar);
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  });

export const cahayaBulat = (warna: string) => teksturRadial(warna, 'rgba(0,0,0,0)');

export function sprite(tex: THREE.Texture, k: number, opacity = 1) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  sp.scale.setScalar(k);
  return sp;
}

/** Charm berdiri tegak dengan dasar badan di y = 0 (ring di atas). */
export function charmBerdiri(id: CharmId) {
  const c = buatCharm(id);
  const g = new THREE.Group();
  g.add(c.grup);
  const kotak = new THREE.Box3().setFromObject(g);
  c.grup.position.y = -kotak.min.y;
  return g;
}

export const teksturKayu = () =>
  kanvasTekstur(512, 512, (g) => {
    const R = rng(44);
    g.fillStyle = '#B98A5E';
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 140; i++) {
      g.strokeStyle = `rgba(90,55,25,${0.08 + R() * 0.18})`;
      g.lineWidth = 1 + R() * 3;
      const y = R() * 512;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(170, y + (R() - 0.5) * 30, 340, y + (R() - 0.5) * 30, 512, y + (R() - 0.5) * 10);
      g.stroke();
    }
  }, 2);

export const teksturFlanel = (warna: string) =>
  kanvasTekstur(256, 256, (g) => {
    const R = rng(warna.length);
    g.fillStyle = warna;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 6000; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
      g.fillRect(R() * 256, R() * 256, 1 + R() * 2, 1);
    }
  }, 4);

// ---------------------------------------------------------------------------------------------------------------
// Adegan

type Set = { g: THREE.Group };

const Adegan: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  const isi = useMemo(() => {
    const root = new THREE.Group();
    lampuStandar(scene, gl, 0.6);

    // ---------- 1. Gacha summon: panggung gelap ungu, berkas cahaya memancar, kantong melayang
    const gacha = new THREE.Group();
    const latarGacha = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: teksturRadial('#5B2E8C', '#0E0818') }));
    latarGacha.position.z = -6;
    gacha.add(latarGacha);
    const berkas = new THREE.Group();
    const texBerkas = kanvasTekstur(64, 512, (g) => {
      const gr = g.createLinearGradient(0, 0, 64, 0);
      gr.addColorStop(0, 'rgba(255,220,150,0)');
      gr.addColorStop(0.5, 'rgba(255,230,170,0.9)');
      gr.addColorStop(1, 'rgba(255,220,150,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 512);
      const gv = g.createLinearGradient(0, 0, 0, 512);
      gv.addColorStop(0, 'rgba(0,0,0,0)');
      gv.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-in';
      g.fillStyle = gv;
      g.fillRect(0, 0, 64, 512);
    });
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.9 + (i % 3) * 0.4, 14), new THREE.MeshBasicMaterial({ map: texBerkas, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.35 }));
      b.geometry.translate(0, 7, 0);
      b.rotation.z = (i / 14) * Math.PI * 2;
      berkas.add(b);
    }
    berkas.position.set(0, 1.4, -4);
    gacha.add(berkas);
    const kantongG = buatKantong();
    kantongG.grup.position.set(0, -0.2, 0);
    gacha.add(kantongG.grup);
    const haloG = sprite(cahayaBulat('rgba(255,215,140,1)'), 6, 0.8);
    haloG.position.set(0, 1.6, -0.5);
    gacha.add(haloG);
    const ondeG = charmBerdiri('onde-onde');
    ondeG.scale.setScalar(1.25);
    gacha.add(ondeG);
    const rahasiaG = charmBerdiri('secret');
    rahasiaG.scale.setScalar(1.35);
    gacha.add(rahasiaG);
    const pelangi = new THREE.Group();
    ['rgba(255,120,160,1)', 'rgba(120,200,255,1)', 'rgba(255,230,120,1)', 'rgba(170,140,255,1)'].forEach((w, i) => {
      const sp = sprite(cahayaBulat(w), 3.2, 0.5);
      sp.position.set(Math.cos(i * 1.57) * 1.2, 2.2 + Math.sin(i * 1.57) * 1.0, -0.6);
      pelangi.add(sp);
    });
    gacha.add(pelangi);
    const kilauG: THREE.Sprite[] = [];
    const Rg = rng(3);
    const texKilau = cahayaBulat('rgba(255,245,210,1)');
    for (let i = 0; i < 40; i++) {
      const sp = sprite(texKilau, 0.08 + Rg() * 0.18, 0.9);
      sp.position.set((Rg() - 0.5) * 7, -1 + Rg() * 7, -2 + Rg() * 3);
      gacha.add(sp);
      kilauG.push(sp);
    }
    const kunciG = new THREE.PointLight('#FFC98A', 30, 12, 1.5);
    kunciG.position.set(0, 3.5, 2.5);
    const ungu = new THREE.PointLight('#A070FF', 25, 12, 1.5);
    ungu.position.set(-3, 1, -1);
    const biru = new THREE.PointLight('#60B0FF', 18, 12, 1.5);
    biru.position.set(3, 2, -1);
    gacha.add(kunciG, ungu, biru, new THREE.AmbientLight('#6040A0', 0.4));
    root.add(gacha);

    // ---------- 2. POV meme: pasar berbokeh di belakang, tangan pembeli dari kanan bawah
    const pov = new THREE.Group();
    const latarPov = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: teksturRadial('#C99A66', '#4A3020') }));
    latarPov.position.z = -14;
    pov.add(latarPov);
    const Rp = rng(8);
    const texBokeh = cahayaBulat('rgba(255,215,160,0.9)');
    for (let i = 0; i < 26; i++) {
      const sp = sprite(texBokeh, 0.8 + Rp() * 1.8, 0.25 + Rp() * 0.4);
      sp.position.set((Rp() - 0.5) * 16, -2 + Rp() * 10, -8 - Rp() * 4);
      pov.add(sp);
    }
    // tepi meja lapak dan taplak kotak-kotak di bawah frame
    const taplak = kanvasTekstur(128, 128, (g) => {
      g.fillStyle = '#F2EEE6';
      g.fillRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(200,52,46,0.85)';
      for (let i = 0; i < 4; i++) {
        g.fillRect(i * 32, 0, 16, 128);
        g.fillRect(0, i * 32, 128, 16);
      }
    }, 6);
    const meja = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), new THREE.MeshStandardMaterial({ map: taplak, roughness: 0.4 }));
    meja.rotation.x = -Math.PI / 2;
    meja.position.set(0, -1.2, -3);
    pov.add(meja);
    const mejaP = meja;
    const kleponP = charmBerdiri('klepon');
    pov.add(kleponP);
    const tanganP = buatTangan(1, { skala: 1.6, kulit: '#C98E66', lenganBaju: '#E2B23A' });
    pov.add(tanganP.akar);
    // tas kanvas dengan tali, tempat charm tergantung di keyframe terakhir
    const tas = new THREE.Group();
    const badanTas = new THREE.Mesh(new RoundedBoxGeometry(7, 6, 1.2, 4, 0.3), new THREE.MeshStandardMaterial({ map: teksturFlanel('#E8DCC4'), roughness: 0.95 }));
    badanTas.position.set(0, -3.4, -0.9);
    const tali = new THREE.Mesh(new RoundedBoxGeometry(0.9, 6, 0.2, 2, 0.08), new THREE.MeshStandardMaterial({ color: '#B88A5A', roughness: 0.8 }));
    tali.position.set(-1.6, 1.4, -0.3);
    tali.rotation.z = 0.1;
    const cincinD = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 30), new THREE.MeshStandardMaterial({ color: '#C8C8CC', metalness: 1, roughness: 0.25 }));
    cincinD.position.set(-1.55, 0.05, -0.15);
    tas.add(badanTas, tali, cincinD);
    pov.add(tas);
    const kleponGantung = buatCharm('klepon');
    kleponGantung.grup.rotation.set(0.15, -0.35, 0.12);
    const porosGantung = new THREE.Group();
    porosGantung.add(kleponGantung.grup);
    kleponGantung.grup.position.y = -0.8;
    porosGantung.position.set(-1.5, -0.05, 0.25);
    pov.add(porosGantung);
    const sinarPov = new THREE.DirectionalLight('#FFE2C0', 2.2);
    sinarPov.position.set(3, 5, 6);
    sinarPov.castShadow = true;
    pov.add(sinarPov, new THREE.HemisphereLight('#FFF1DC', '#5A3A28', 0.8));
    root.add(pov);

    // ---------- 4. Stop-motion flanel: meja kayu kerja, alas flanel, benang dan jarum
    const stop = new THREE.Group();
    const mejaKayu = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: teksturKayu(), roughness: 0.75 }));
    mejaKayu.rotation.x = -Math.PI / 2;
    mejaKayu.receiveShadow = true;
    stop.add(mejaKayu);
    const alas = new THREE.Mesh(new RoundedBoxGeometry(9, 0.06, 6, 2, 0.03), new THREE.MeshStandardMaterial({ map: teksturFlanel('#6E9C5A'), roughness: 1 }));
    alas.position.set(0, 0.03, 0);
    alas.receiveShadow = true;
    stop.add(alas);
    const gulungan = new THREE.Group();
    const inti = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.9, 24), new THREE.MeshStandardMaterial({ color: '#E05A6A', roughness: 0.9 }));
    const tepi = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), new THREE.MeshStandardMaterial({ color: '#D9B98A', roughness: 0.6 }));
    tepi.position.y = 0.51;
    const tepi2 = tepi.clone();
    tepi2.position.y = -0.51;
    gulungan.add(inti, tepi, tepi2);
    stop.add(gulungan);
    const jarum = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.006, 1.6, 10), new THREE.MeshStandardMaterial({ color: '#DADAE0', metalness: 1, roughness: 0.2 }));
    stop.add(jarum);
    const benangKurva = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.8, 0.05, 0.6), V(1.6, 0.02, 0.2), V(2.6, 0.05, 0.9)]);
    const benang = new THREE.Mesh(new THREE.TubeGeometry(benangKurva, 40, 0.025, 6), new THREE.MeshStandardMaterial({ color: '#E05A6A', roughness: 0.9 }));
    stop.add(benang);
    const kantongS = buatKantong();
    stop.add(kantongS.grup);
    const barisan: THREE.Group[] = (['klepon', 'onde-onde', 'kue-lapis', 'kue-lumpur', 'serabi'] as CharmId[]).map((id) => {
      const c = charmBerdiri(id);
      stop.add(c);
      return c;
    });
    const rahasiaS = new THREE.Group();
    const kain = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ map: teksturFlanel('#3A2C40'), roughness: 1, side: THREE.DoubleSide }));
    kain.scale.set(1, 1.5, 1);
    const tanyaS = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: kanvasTekstur(128, 128, (g) => {
      g.fillStyle = '#F6D77A';
      g.font = '110px "Bagel Fat One"';
      g.textAlign = 'center';
      g.fillText('?', 64, 108);
    }), transparent: true }));
    tanyaS.position.set(0, 0.62, 0.66);
    rahasiaS.add(kain, tanyaS);
    stop.add(rahasiaS);
    const jendela = new THREE.DirectionalLight('#FFF0DA', 2.6);
    jendela.position.set(-6, 9, 4);
    jendela.castShadow = true;
    jendela.shadow.mapSize.set(2048, 2048);
    Object.assign(jendela.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
    jendela.shadow.radius = 4;
    stop.add(jendela, new THREE.HemisphereLight('#FFF6E8', '#8A6A4A', 0.9));
    root.add(stop);

    // ---------- 5. ASMR: gelap, satu lampu hangat sempit, lensa makro
    const asmr = new THREE.Group();
    const lantaiA = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: '#2A1C14', roughness: 0.6 }));
    lantaiA.rotation.x = -Math.PI / 2;
    lantaiA.receiveShadow = true;
    asmr.add(lantaiA);
    const kantongA = buatKantong();
    asmr.add(kantongA.grup);
    const kleponA = charmBerdiri('klepon');
    asmr.add(kleponA);
    const ondeA = charmBerdiri('onde-onde');
    asmr.add(ondeA);
    const tanganA = buatTangan(1, { skala: 1.6, kulit: '#C98E66', lenganBaju: '#2E3A4A' });
    asmr.add(tanganA.akar);
    const lampuA = new THREE.SpotLight('#FFC88A', 120, 20, 0.45, 0.7, 1.4);
    lampuA.castShadow = true;
    lampuA.shadow.mapSize.set(2048, 2048);
    asmr.add(lampuA, lampuA.target, new THREE.AmbientLight('#3A2A20', 0.25));
    const tepiA = new THREE.DirectionalLight('#8FB0FF', 0.8);
    tepiA.position.set(4, 3, -5);
    asmr.add(tepiA);
    root.add(asmr);

    return { root, mejaP, gacha, berkas, kantongG, haloG, ondeG, rahasiaG, pelangi, kilauG, pov, kleponP, tanganP, tas, porosGantung, stop, gulungan, jarum, benang, kantongS, barisan, rahasiaS, asmr, kantongA, kleponA, ondeA, tanganA, lampuA };
  }, [gl, scene]);

  const gaya = Math.floor(t / 3);
  const k = t % 3;
  isi.gacha.visible = gaya === 0;
  isi.pov.visible = gaya === 1;
  isi.stop.visible = gaya === 2;
  isi.asmr.visible = gaya === 3;
  scene.fog = null;
  const cam = camera as THREE.PerspectiveCamera;
  const lihat = (p: THREE.Vector3, l: THREE.Vector3, fov: number, roll = 0) => {
    cam.position.copy(p);
    cam.up.set(0, 1, 0);
    cam.lookAt(l);
    cam.rotateZ(roll);
    cam.fov = fov;
    cam.updateProjectionMatrix();
  };

  if (gaya === 0) {
    scene.background = new THREE.Color('#0E0818');
    scene.environmentIntensity = 0.5;
    gl.toneMappingExposure = 1;
    isi.berkas.rotation.z = k * 0.12;
    isi.berkas.scale.setScalar([0.7, 1.2, 1.4][k]);
    isi.kantongG.grup.visible = k < 2;
    isi.kantongG.grup.rotation.set(0.12, [0.35, 0.2, 0][k], [0.06, -0.04, 0][k]);
    isi.kantongG.grup.position.y = [-0.6, -2.3, -1.6][k];
    isi.kantongG.setBuka([0.04, 1, 1][k]);
    isi.kantongG.setCahaya([0.5, 1, 1][k]);
    isi.haloG.material.opacity = [0.35, 0.9, 0.6][k];
    isi.haloG.position.y = [0.6, 1.9, 1.6][k];
    isi.haloG.scale.setScalar([4, 7.5, 6][k]);
    isi.ondeG.visible = k === 1;
    isi.ondeG.position.set(0, 0.55, 0.3);
    isi.ondeG.rotation.set(0.1, -0.35, 0.05);
    isi.rahasiaG.visible = k === 2;
    isi.rahasiaG.position.set(0, 0.6, 0.3);
    isi.rahasiaG.rotation.set(0.05, 0.25, 0);
    isi.pelangi.visible = k === 2;
    isi.kilauG.forEach((sp, i) => (sp.visible = k > 0 || i % 3 === 0));
    lihat(V(0, 1.5, 8.5), V(0, 1.3, 0), 34);
  }

  if (gaya === 1) {
    scene.background = new THREE.Color('#4A3020');
    scene.environmentIntensity = 0.6;
    gl.toneMappingExposure = 1;
    const pegang = k < 2;
    isi.kleponP.visible = pegang;
    isi.tanganP.akar.visible = pegang;
    isi.tas.visible = k === 2;
    isi.porosGantung.visible = k === 2;
    isi.mejaP.visible = k < 2;
    if (pegang) {
      // klepon dipegang di depan wajah; ring disembunyikan di belakang badan (keyframe 1), lalu terlihat (2)
      const pusat = k === 0 ? V(0.3, 0.9, 2.2) : V(0.15, 1.05, 3.6);
      isi.kleponP.position.copy(pusat).add(V(0, -0.55, 0));
      isi.kleponP.rotation.set(k === 0 ? -0.5 : 0.35, k === 0 ? 0.3 : -0.4, k === 0 ? 0 : -0.25);
      aturTangan(isi.tanganP, campurPose(POSE.pegang, POSE.jepit, 0.5));
      kunciJepit(isi.tanganP, 0.6);
      letakkanJepit(isi.tanganP, pusat.clone().add(V(0.52, -0.05, 0.1)), V(-0.75, 0.55, -0.35), k === 0 ? 2.4 : 2.2);
    }
    lihat(k === 2 ? V(-0.6, 0.2, 5.6) : V(0, 1.2, 7.2), k === 2 ? V(-1.4, -0.6, 0) : V(0.1, 1.0, 0), k === 2 ? 34 : 40, k === 1 ? -0.06 : 0);
  }

  if (gaya === 2) {
    scene.background = new THREE.Color('#3A2A1E');
    scene.environmentIntensity = 0.55;
    gl.toneMappingExposure = 1;
    // keyframe 1: klepon mengintip dari kantong; 2: barisan berjalan; 3: foto bersama dan yang keenam ditutup kain
    isi.kantongS.grup.visible = k === 0;
    isi.kantongS.grup.position.set(-0.4, 0.06, -0.2);
    isi.kantongS.grup.rotation.set(0, 0.35, 0);
    isi.kantongS.setBuka(1);
    isi.kantongS.setCahaya(0.25);
    isi.barisan.forEach((c, i) => {
      c.visible = k > 0 || i === 0;
      c.scale.setScalar(1);
      if (k === 0) {
        // klepon setengah keluar dari mulut kantong, sedikit miring
        c.position.set(-0.4, 1.35, -0.1);
        c.rotation.set(0.25, 0.35, -0.3);
      } else if (k === 1) {
        // berjalan berbaris: tiap charm dimiringkan bergantian seperti sedang melangkah
        c.position.set(-1.1 + i * 0.55, 0.06 + (i % 2) * 0.12, -3.0 + i * 1.35);
        c.rotation.set(0, 0.35, (i % 2 ? 1 : -1) * 0.16);
      } else {
        const tempat = [V(-1.3, 0.06, 0.8), V(-1.45, 0.06, -0.9), V(1.45, 0.06, -0.9), V(1.3, 0.06, 0.8), V(0, 0.06, 1.1)][i];
        c.position.copy(tempat);
        c.rotation.set(0, -tempat.x * 0.25, 0);
      }
    });
    isi.rahasiaS.visible = k === 2;
    isi.rahasiaS.position.set(0, 0.06, -1.1);
    isi.gulungan.position.set(k === 1 ? 3.4 : 3.0, 0.5, k === 1 ? -1.4 : 1.2);
    isi.gulungan.rotation.set(0, 0, k === 1 ? 0 : Math.PI / 2);
    isi.jarum.position.set(k === 2 ? -2.8 : 1.6, 0.08, k === 2 ? 1.8 : 1.4);
    isi.jarum.rotation.set(0, 0.7, Math.PI / 2);
    isi.benang.position.set(k === 2 ? -2.6 : 1.4, 0.06, k === 2 ? 1.5 : 0.8);
    if (k === 0) lihat(V(1.6, 4.6, 4.2), V(-0.4, 1.0, -0.1), 34);
    else if (k === 1) lihat(V(2.2, 1.3, 8.2), V(0, 0.6, -0.4), 34, 0.03);
    else lihat(V(0, 3.9, 10.5), V(0, 0.75, -0.1), 36);
  }

  if (gaya === 3) {
    scene.background = new THREE.Color('#120C08');
    scene.environmentIntensity = 0.12;
    gl.toneMappingExposure = 1.05;
    isi.kantongA.grup.visible = k === 0;
    isi.kantongA.setBuka(0.32);
    isi.kantongA.setCahaya(0.35);
    isi.kleponA.visible = k === 1;
    isi.ondeA.visible = k === 2;
    isi.tanganA.akar.visible = k === 2;
    isi.kleponA.position.set(0, 0, 0);
    isi.kleponA.rotation.set(0, -0.5, 0);
    isi.ondeA.position.set(0, 0, 0);
    isi.ondeA.rotation.set(0, 0.3, 0);
    const sasaran = [V(0, 1.9, 0.2), V(0, 1.4, 0), V(0, 0.6, 0)][k];
    isi.lampuA.position.copy(sasaran).add(V(-2.5, 6, 2.5));
    isi.lampuA.target.position.copy(sasaran);
    if (k === 2) {
      // ujung telunjuk mengusap butir wijen di permukaan onde-onde
      aturTangan(isi.tanganA, campurPose(POSE.rileks, POSE.terbuka, 0.3));
      letakkanJepit(isi.tanganA, V(0.3, 0.85, 0.5), V(-0.7, -0.35, -0.55), -1.4);
    }
    if (k === 0) lihat(V(2.6, 4.4, 5.6), V(0, 1.85, 0), 28);
    else if (k === 1) lihat(V(0.8, 1.6, 2.9), V(0, 1.2, 0), 26);
    else lihat(V(1.8, 1.5, 3.9), V(0.15, 0.7, 0.2), 28);
  }

  return <primitive object={isi.root} />;
};

// ---------------------------------------------------------------------------------------------------------------
// Lapisan 2D per gaya

const gayaTeks = (o: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left: 0, right: 0, textAlign: 'center', ...o });

const Label: React.FC<{ t: number }> = ({ t }) => {
  const nama = ['1 · Gacha summon', '2 · POV meme', '4 · Stop-motion flanel', '5 · ASMR unboxing'][Math.floor(t / 3)];
  return (
    <div style={{ position: 'absolute', left: 36, top: 36, padding: '10px 18px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 30 }}>
      {nama} · {String.fromCharCode(97 + (t % 3))}
    </div>
  );
};

const Gacha: React.FC<{ k: number }> = ({ k }) => (
  <AbsoluteFill>
    <div style={gayaTeks({ top: 110, fontFamily: bagel.fontFamily, fontSize: 84, color: '#FFE7A8', textShadow: '0 0 30px rgba(255,190,90,0.8), 0 6px 0 #5B2E8C' })}>GACHA PASAR</div>
    {k === 0 && (
      <>
        <div style={gayaTeks({ top: 250, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 36, color: '#E9DCFF' })}>6 karakter · 1 rahasia</div>
        <div style={{ position: 'absolute', left: 190, right: 190, bottom: 170, padding: '30px 0', borderRadius: 30, background: 'linear-gradient(#FFD36E,#F29A3A)', boxShadow: '0 10px 0 #9A4E1A, 0 0 40px rgba(255,200,100,0.6)', textAlign: 'center', fontFamily: bagel.fontFamily, fontSize: 64, color: '#5A2A10' }}>TARIK ×1</div>
        <div style={gayaTeks({ bottom: 100, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 32, color: '#E9DCFF' })}>Rp40.000 · kantong kertas tertutup</div>
      </>
    )}
    {k === 1 && (
      <>
        <div style={gayaTeks({ top: 230, fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: 60, color: '#FFD86E', letterSpacing: 8, textShadow: '0 0 20px rgba(255,200,80,0.8)' })}>★ ★ ★ ★</div>
        <div style={gayaTeks({ top: 310, fontFamily: bagel.fontFamily, fontSize: 96, color: '#FFF4E0', textShadow: '0 6px 0 #6b3a2a' })}>Onde-onde</div>
        <div style={gayaTeks({ top: 430, fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: 40, color: '#7CF0B0' })}>NEW!</div>
      </>
    )}
    {k === 2 && (
      <>
        <div style={gayaTeks({ top: 1290, fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: 60, background: 'linear-gradient(90deg,#FF8AB0,#8AD0FF,#FFE27A,#B79CFF)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: 8 })}>✦ ✦ ✦ ✦ ✦</div>
        <div style={gayaTeks({ top: 1380, fontFamily: bagel.fontFamily, fontSize: 110, color: '#FFF4E0', textShadow: '0 0 30px rgba(200,160,255,0.9)' })}>SECRET</div>
        <div style={gayaTeks({ top: 1520, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 38, color: '#E9DCFF' })}>??? · 1 dari 6</div>
      </>
    )}
  </AbsoluteFill>
);

const teksPov: React.CSSProperties = { display: 'inline-block', padding: '10px 26px', borderRadius: 18, background: '#fff', color: '#111', fontFamily: poppins.fontFamily, fontWeight: 700, fontSize: 58, lineHeight: 1.2, boxDecorationBreak: 'clone' };

const Pov: React.FC<{ k: number }> = ({ k }) => (
  <AbsoluteFill>
    <div style={gayaTeks({ top: 260, padding: '0 80px' })}>
      {k === 0 && <span style={teksPov}>POV: kamu beli klepon di pasar tapi...</span>}
      {k === 1 && <span style={teksPov}>kok... bunyinya *klik*?</span>}
      {k === 2 && <span style={teksPov}>ternyata gantungan tas</span>}
    </div>
    {k === 1 && <div style={gayaTeks({ top: 820, fontFamily: bagel.fontFamily, fontSize: 130, color: '#FFF', textShadow: '0 6px 0 #C8442F, 0 0 30px rgba(0,0,0,0.4)', transform: 'rotate(-8deg)' })}>*KLIK*</div>}
    {k === 2 && <div style={gayaTeks({ bottom: 220, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 36, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.6)' })}>Jajan Dulu! · pre-order via WA</div>}
  </AbsoluteFill>
);

const Stop: React.FC<{ k: number }> = ({ k }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ boxShadow: 'inset 0 0 220px rgba(40,25,10,0.55)', background: 'rgba(255,220,160,0.05)' }} />
    <div style={{ position: 'absolute', right: 50, top: 60, fontFamily: gochi.fontFamily, fontSize: 40, color: '#FFF4E0', opacity: 0.85 }}>frame {['012', '048', '096'][k]}</div>
    {k === 0 && <div style={gayaTeks({ top: 220, fontFamily: gochi.fontFamily, fontSize: 76, color: '#FFF4E0', textShadow: '0 3px 14px rgba(0,0,0,0.5)', transform: 'rotate(-3deg)' })}>psst... ada yang mau keluar</div>}
    {k === 1 && <div style={gayaTeks({ top: 220, fontFamily: gochi.fontFamily, fontSize: 76, color: '#FFF4E0', textShadow: '0 3px 14px rgba(0,0,0,0.5)', transform: 'rotate(2deg)' })}>berangkat ke pasar!</div>}
    {k === 2 && (
      <div style={{ position: 'absolute', left: 150, right: 150, top: 200, padding: '26px 0', borderRadius: 24, background: '#C8442F', border: '6px dashed #FFE7C2', outline: '10px solid #C8442F', textAlign: 'center', fontFamily: bagel.fontFamily, fontSize: 96, color: '#FFE7C2' }}>Jajan Dulu!</div>
    )}
  </AbsoluteFill>
);

const Asmr: React.FC<{ k: number }> = ({ k }) => {
  const R = rng(k + 2);
  return (
    <AbsoluteFill>
      <div style={gayaTeks({ top: 120, fontFamily: poppins.fontFamily, fontWeight: 500, fontSize: 30, color: 'rgba(255,240,220,0.7)', letterSpacing: 6 })}>PAKAI EARPHONE</div>
      <div style={gayaTeks({ ...(k === 0 ? { top: 230 } : { bottom: 330 }), fontFamily: gochi.fontFamily, fontSize: 70, color: '#FFF4E6', textShadow: '0 2px 16px rgba(0,0,0,0.7)' })}>{['sreeek...', 'klik.', 'lembut...'][k]}</div>
      <div style={{ position: 'absolute', left: 260, right: 260, ...(k === 0 ? { top: 330 } : { bottom: 200 }), height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Array.from({ length: 28 }, (_, i) => (
          <div key={i} style={{ width: 8, borderRadius: 4, background: 'rgba(255,220,170,0.85)', height: 8 + R() * (k === 1 && i > 10 && i < 18 ? 72 : 36) }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const GayaTeaser: React.FC = () => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [siap, setSiap] = useState(false);
  const [handle] = useState(() => delayRender('font gaya teaser'));
  useEffect(() => {
    Promise.all([bagel.waitUntilDone(), gochi.waitUntilDone(), poppins.waitUntilDone()]).then(() => {
      setSiap(true);
      continueRender(handle);
    });
  }, [handle]);
  if (!siap) return <AbsoluteFill style={{ background: '#111' }} />;
  const gaya = Math.floor(t / 3);
  const k = t % 3;
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 34, near: 0.05, far: 200 }} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <Adegan t={t} />
      </ThreeCanvas>
      {gaya === 0 && <Gacha k={k} />}
      {gaya === 1 && <Pov k={k} />}
      {gaya === 2 && <Stop k={k} />}
      {gaya === 3 && <Asmr k={k} />}
      <Label t={t} />
    </AbsoluteFill>
  );
};
