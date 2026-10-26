// Uji rig tubuh (tangan dan kaki) sebelum dipasang ke teaser. Dicek dengan `mk scene stills ... --grid`.
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { lampuStandar } from '../../../three/src/jajan/lampu';
import { aturKaki, aturTangan, buatKaki, buatTangan, kunciJepit, POSE, siklusJalan } from '../../../three/src/jajan/tubuh';

const NAMA_POSE = ['rileks', 'jepit', 'pegang', 'terbuka', 'kepal'] as const;

const AdeganTangan: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.8));
    const sinar = new THREE.DirectionalLight('#fff0dc', 2.2);
    sinar.position.set(-3, 5, 6);
    g.add(sinar);
    // Tiap baris satu pose. Kolom kiri: punggung tangan menghadap kamera. Kolom kanan: dilihat dari samping
    // (sisi ibu jari), supaya tekukan sendi MCP, PIP, DIP terlihat jelas.
    const rig = NAMA_POSE.flatMap((nama, i) =>
      [0, 1].map((k) => {
        const r = buatTangan(1);
        aturTangan(r, POSE[nama]);
        if (nama === 'jepit') kunciJepit(r);
        r.akar.position.set(k ? 1.9 : -2.1, 6.4 - i * 3.3 - 2.6, 0);
        r.akar.rotation.set(0, k ? -Math.PI / 2 : 0.2, 0);
        g.add(r.akar);
        return r;
      }),
    );
    return { g, rig };
  }, [gl, scene]);
  void t;
  void isi.rig;
  camera.position.set(0, 0, 33);
  camera.lookAt(0, -0.4, 0);
  return <primitive object={isi.g} />;
};

const AdeganKaki: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  const isi = useMemo(() => {
    const g = new THREE.Group();
    g.add(lampuStandar(scene, gl, 0.8));
    const sinar = new THREE.DirectionalLight('#fff0dc', 2.2);
    sinar.position.set(-6, 8, 6);
    g.add(sinar);
    const lantai = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#8A7A68', roughness: 0.8 }));
    lantai.rotation.x = -Math.PI / 2;
    g.add(lantai);
    const kiri = buatKaki('#3E8A4A', { celana: '#3B4A5C' });
    const kanan = buatKaki('#3E8A4A', { celana: '#3B4A5C' });
    // Tubuh berjalan ke +X: putar kaki supaya +Z lokal (depan kaki) menghadap +X dunia.
    kiri.akar.rotation.y = Math.PI / 2;
    kanan.akar.rotation.y = Math.PI / 2;
    g.add(kiri.akar, kanan.akar);
    return { g, kiri, kanan };
  }, [gl, scene]);
  const PINGGUL = 9.2;
  const LANGKAH = 3.4;
  const PERIODE = 70; // frame per satu siklus penuh (dua langkah)
  const p = (t % PERIODE) / PERIODE;
  const pKiri = siklusJalan(p, LANGKAH, PINGGUL);
  const pKanan = siklusJalan((p + 0.5) % 1, LANGKAH, PINGGUL);
  aturKaki(isi.kiri, pKiri.target, pKiri.pitch, pKiri.jari);
  aturKaki(isi.kanan, pKanan.target, pKanan.pitch, pKanan.jari);
  const bob = Math.abs(Math.sin(p * Math.PI * 2)) * 0.15;
  isi.kiri.akar.position.set(0, PINGGUL + bob, 0.45);
  isi.kanan.akar.position.set(0, PINGGUL + bob, -0.45);
  camera.position.set(0.5, 5, 26);
  camera.lookAt(0.5, 4.6, 0);
  return <primitive object={isi.g} />;
};

/** Frame 0-9: pose tangan. Frame 10 dan seterusnya: kaki berjalan (satu siklus = 70 frame). */
export const UjiTubuh: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#C9A574' }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 30, near: 0.1, far: 80 }} gl={{ antialias: true }}>
        {f < 10 ? <AdeganTangan t={f} /> : <AdeganKaki t={f - 10} />}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
