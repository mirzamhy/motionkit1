// Uji badan manusia (badan.ts) sebelum dipasang ke teaser: proporsi, baju, wajah, dan lengan IK.
// Frame 0-3: putar 0°, 35°, 90°, 180°. Frame 4-5: meraih ke depan (dilihat dari depan dan samping).
// Latar grid 1 unit = 10 cm; garis merah tiap tinggi kepala perempuan (2,08) dari lantai.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { buatBadan, raih } from '../../../three/src/jajan/badan';
import { aturKaki, aturTangan, buatKaki, buatTangan, campurPose, POSE } from '../../../three/src/jajan/tubuh';

const SUDUT = [0, 35, 90, 180, 0, 90].map((d) => THREE.MathUtils.degToRad(d));

const Adegan: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  gl.shadowMap.enabled = true;
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.7));
    const sinar = new THREE.DirectionalLight('#fff0dc', 2.4);
    sinar.position.set(-8, 14, 12);
    sinar.castShadow = true;
    sinar.shadow.mapSize.set(2048, 2048);
    Object.assign(sinar.shadow.camera, { left: -15, right: 15, top: 20, bottom: -2 });
    g.add(sinar);
    scene.background = new THREE.Color('#E9E2D6');
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ color: '#B8AC9A', roughness: 0.9 }));
    lantai.rotation.x = -Math.PI / 2;
    lantai.receiveShadow = true;
    g.add(lantai);
    const grid = new THREE.GridHelper(40, 40, '#9a8f80', '#cfc6b8');
    grid.rotation.x = Math.PI / 2;
    grid.position.set(0, 20, -5);
    g.add(grid);
    for (let i = 1; i <= 8; i++) {
      const garis = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.06), new THREE.MeshBasicMaterial({ color: '#C8442F' }));
      garis.position.set(0, i * 2.08, -4.9);
      g.add(garis);
    }

    // penjual: perempuan berjilbab, baju kurung, rok panjang, celemek; lengan = rig tangan + IK
    const penjual = buatBadan({ baju: '#8A6A4A', rok: '#4A3A5A', celemek: '#E8D6B0', jilbab: '#5B7B6A', kulit: '#C68A62' });
    penjual.akar.position.set(-3.6, 7.8, 0);
    g.add(penjual.akar, ...penjual.lenganAtas);
    const tangan = [buatTangan(1, { kulit: '#C68A62', lenganBaju: '#8A6A4A', lengan: penjual.LENGAN_BAWAH }), buatTangan(-1, { kulit: '#C68A62', lenganBaju: '#8A6A4A', lengan: penjual.LENGAN_BAWAH })];
    tangan.forEach((r) => g.add(r.akar));

    // pejalan pria: kemeja, celana dari rig kaki, lengan sederhana
    const pria = buatBadan({ pria: true, baju: '#7FA0B8', kulit: '#B57E5A', rambut: '#1E1612', lenganSederhana: true });
    const holder = new THREE.Group();
    holder.position.set(3.8, 0, 0);
    pria.akar.position.y = 9.2;
    holder.add(pria.akar);
    const kaki = [buatKaki('#2B5DAA', { celana: '#3B4A5C', kulit: '#B57E5A' }), buatKaki('#2B5DAA', { celana: '#3B4A5C', kulit: '#B57E5A' })];
    kaki.forEach((k, i) => {
      k.akar.position.set(i ? 0.55 : -0.55, 9.2, 0);
      aturKaki(k, new THREE.Vector2(0, -9.2 + 0.8), 0, 0);
      holder.add(k.akar);
    });
    g.add(holder);
    return { g, penjual, tangan, pria, holder };
  }, [gl, scene]);

  const sudut = SUDUT[Math.min(t, SUDUT.length - 1)];
  const meraih = t >= 4;
  isi.penjual.akar.rotation.y = sudut;
  isi.penjual.batang.rotation.x = meraih ? 0.3 : 0;
  isi.holder.rotation.y = sudut;
  if (isi.pria.ayun) {
    isi.pria.ayun[0].rotation.x = meraih ? -0.4 : 0.05;
    isi.pria.ayun[1].rotation.x = meraih ? 0.35 : 0.05;
    isi.pria.ayun.forEach((a, i) => (a.rotation.z = (i ? 1 : -1) * 0.06));
  }
  // target tangan dalam ruang badan penjual, lalu ke dunia
  isi.penjual.akar.updateWorldMatrix(true, true);
  const keDunia = (v: THREE.Vector3) => isi.penjual.akar.localToWorld(v);
  const arahDunia = (v: THREE.Vector3) => v.applyQuaternion(isi.penjual.akar.quaternion);
  [0, 1].forEach((i) => {
    const s = i ? 1 : -1; // kanan orang = -X
    const rig = isi.tangan[i];
    const raihIni = meraih && i === 0;
    aturTangan(rig, raihIni ? campurPose(POSE.terbuka, POSE.jepit, 0.6) : POSE.rileks);
    const T = raihIni ? new THREE.Vector3(-0.6, 0.9, 4.2) : new THREE.Vector3(s * 1.95, -2.1, 0.35);
    raih(isi.penjual, i as 0 | 1, rig, keDunia(T), raihIni ? -1.2 : s * -0.2, arahDunia(new THREE.Vector3(s * 0.3, 0, -1)));
  });

  camera.position.set(0, 8.6, 40);
  camera.lookAt(0, 8.6, 0);
  (camera as THREE.PerspectiveCamera).fov = 30;
  camera.updateProjectionMatrix();
  return <primitive object={isi.g} />;
};

export const UjiBadan: React.FC = () => {
  const t = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{ fov: 30, near: 0.1, far: 200 }} gl={{ antialias: true }}>
      <Adegan t={t} />
    </ThreeCanvas>
  );
};
