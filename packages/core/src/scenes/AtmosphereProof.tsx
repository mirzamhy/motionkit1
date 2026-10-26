import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { AtmosphereLayer, type AtmospherePreset } from '../kit';

export const ATMOSPHERE_PROOF_FRAMES = 180;

type AtmosphereProofProps = { preset?: AtmospherePreset['id'] };

export const AtmosphereProof: React.FC<AtmosphereProofProps> = ({ preset = 'rainy-night' }) => {
  const frame = useCurrentFrame();
  const glow = 0.72 + 0.08 * Math.sin(frame / 18);
  return (
    <AbsoluteFill style={{ background: '#08111e', color: '#eef5ff', fontFamily: 'Arial, sans-serif' }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="ap-road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#17283d" />
            <stop offset="1" stopColor="#050a12" />
          </linearGradient>
          <linearGradient id="ap-shop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9b5f42" />
            <stop offset="1" stopColor="#452a2c" />
          </linearGradient>
          <filter id="ap-glow"><feGaussianBlur stdDeviation="24" /></filter>
          <filter id="ap-soft"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        <rect width="1920" height="1080" fill={preset === 'golden-hour' ? '#5c3d32' : preset === 'overcast-day' ? '#4b5b65' : '#0d1d31'} />
        <circle cx="1520" cy="360" r="220" fill="#67b8dc" opacity={glow * 0.22} filter="url(#ap-glow)" />
        <path d="M0 735 L1920 650 L1920 1080 L0 1080 Z" fill="url(#ap-road)" />
        <path d="M0 875 L1920 800" stroke="#93b8c4" strokeWidth="4" opacity=".24" />
        <path d="M70 1015 Q410 955 770 1010 T1500 965 T1880 1000" fill="none" stroke="#8ec7db" strokeWidth="14" opacity=".11" filter="url(#ap-soft)" />
        <path d="M0 800 L1920 730" stroke="#4c7891" strokeWidth="6" opacity=".32" />
        <g transform="translate(930 370)">
          <rect x="-360" y="0" width="720" height="365" rx="10" fill="#000" opacity=".3" />
          <rect x="-380" y="-24" width="720" height="365" rx="10" fill="url(#ap-shop)" stroke="#c58f63" strokeWidth="5" />
          <path d="M -400 -24 L 360 -24 L 395 56 L -435 56 Z" fill="#c8d7e3" opacity=".76" />
          {[-350, -250, -150, -50, 50, 150, 250].map((x) => <path key={x} d={`M ${x} -19 L ${x + 36} 51`} stroke={x % 200 === 0 ? '#d67b59' : '#f1e1bc'} strokeWidth="34" opacity=".78" />)}
          <path d="M -410 42 L 380 42" stroke="#f3c36b" strokeWidth="10" opacity=".8" />
          <rect x="-290" y="90" width="230" height="230" fill="#101d2a" stroke="#e9b868" strokeWidth="8" />
          <rect x="80" y="90" width="190" height="230" fill="#111c28" stroke="#e9b868" strokeWidth="8" />
          <rect x="-235" y="-4" width="380" height="70" rx="12" fill="#10283b" stroke="#72d3f0" strokeWidth="4" />
          <text x="-45" y="45" textAnchor="middle" fontSize="42" fontWeight="700" fill="#dff7ff">NIGHT SHOP</text>
          <rect x="-350" y="74" width="35" height="95" fill="#7c4b37" />
          <rect x="-340" y="87" width="15" height="60" fill="#e8b46b" />
          <rect x="285" y="90" width="28" height="230" fill="#6d3f31" />
          <circle cx="-320" cy="214" r="7" fill="#f5d68d" />
          <circle cx="-320" cy="244" r="7" fill="#f5d68d" />
          <path d="M -290 318 L -60 318" stroke="#d4955d" strokeWidth="9" />
          <path d="M 80 318 L 270 318" stroke="#d4955d" strokeWidth="9" />
          <circle cx="-180" cy="160" r="24" fill="#d9f3ff" opacity={glow} />
          <circle cx="180" cy="160" r="24" fill="#d9f3ff" opacity={glow} />
        </g>
        <g opacity=".75">
          <rect x="1290" y="700" width="130" height="72" rx="8" fill="#9a6b43" />
          <path d="M 1305 700 L 1305 772 M 1335 700 L 1335 772 M 1365 700 L 1365 772 M 1395 700 L 1395 772" stroke="#5c3a2a" strokeWidth="4" />
          <rect x="1428" y="724" width="88" height="48" rx="5" fill="#c59662" />
          <text x="1472" y="756" textAnchor="middle" fontSize="18" fill="#2a1b17">FRESH</text>
        </g>
        <g transform={`translate(${560 + frame * 1.8} 760)`}>
          <circle cx="0" cy="0" r="34" fill="#d09b78" />
          <path d="M -42 42 Q 0 10 42 42 L 58 210 L -58 210 Z" fill="#263e5a" stroke="#6f9bb7" strokeWidth="3" />
          <path d="M -30 74 L 30 74" stroke="#b9d7e3" strokeWidth="5" opacity=".6" />
          <path d="M -20 210 L -92 340 M 20 210 L 92 340" stroke="#1b2637" strokeWidth="30" strokeLinecap="round" />
          <path d="M -52 78 L -125 165 M 52 78 L 125 165" stroke="#d09b78" strokeWidth="18" strokeLinecap="round" />
        </g>
      </svg>
      <AtmosphereLayer preset={preset} />
      <div style={{ position: 'absolute', left: 72, bottom: 64, fontSize: 34, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.8 }}>
        Atmosphere proof · {preset}
      </div>
    </AbsoluteFill>
  );
};

export const AtmosphereGoldenHour: React.FC = () => <AtmosphereProof preset="golden-hour" />;
export const AtmosphereRainyNight: React.FC = () => <AtmosphereProof preset="rainy-night" />;
export const AtmosphereOvercastDay: React.FC = () => <AtmosphereProof preset="overcast-day" />;
