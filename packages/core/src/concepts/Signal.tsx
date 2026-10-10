import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Lines,FitText,Stars,Mono,family,hash,smooth,ease,useStudyFonts} from './shared';
const starts=[0,4,8,12,16,20];
const titles=[['SATU','SINYAL.'],['DARI','JAUH.'],['MENEMBUS','RUANG.'],['TEMUKAN','ARAH.'],['SEBUAH','TUJUAN.'],['SINYAL','DITERIMA.']];
const Planet:React.FC<{t:number}>=({t})=><svg width="1920" height="1080" style={{position:'absolute',inset:0}}><g transform="translate(1410 540)">{Array.from({length:25},(_,i)=>{const yy=(i-12)*21;const extent=Math.sqrt(Math.max(0,272**2-yy**2));return Array.from({length:34},(_,j)=>{const xx=(j/33*2-1)*extent;return <circle key={`${i}-${j}`} cx={xx} cy={yy} r={1.8+2.5*(xx/272+1)/2} fill="#54e7fb" opacity={.3+.6*(xx/272+1)/2}/>;});})}<ellipse rx="405" ry="117" fill="none" stroke="#b4f6ff" strokeWidth="3" transform={`rotate(${-24+Math.sin(t*.3)*4})`}/><path d="M-294 -224L-305 -235M294 224L305 235" stroke="#54e7fb" strokeWidth="4"/></g></svg>;
const Rings:React.FC<{t:number;light:boolean;mode:number}>=({t,light,mode})=><svg width="1920" height="1080" style={{position:'absolute',inset:0}}><defs><pattern id={`signal-dots-${mode}`} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="white"/></pattern><mask id={`signal-mask-${mode}`}><rect width="1920" height="1080" fill={`url(#signal-dots-${mode})`}/></mask></defs><g mask={`url(#signal-mask-${mode})`}>{Array.from({length:18},(_,i)=><circle key={i} cx="1410" cy="540" r={70+i*62+((t*35)%62)} fill="none" stroke={light?'#092f3c':'#54e7fb'} strokeWidth={mode===2?16:8} opacity={.15+.55*hash(i+mode*91)} strokeDasharray={mode===2?'100 8':`${110+i*13} ${i*7+3}`} transform={`rotate(${t*5+i*7} 1410 540)`}/>)}</g></svg>;
const Shot:React.FC<{i:number;t:number}>=({i,t})=>{
  const light=i===2||i===5;const ink=light?'#06232e':'#edf7f5';
  return <AbsoluteFill style={{background:light?'#64e5f3':'#031015'}}>
    <Stars time={t} color={light?'#123f4b':'#81c4cf'}/>
    {(i===0||i===1||i===2)&&<Rings t={t} light={light} mode={i}/>}
    {i===3&&<svg width="1920" height="1080" style={{position:'absolute',inset:0}}><g fill="none" stroke="#4ee5ff" strokeWidth="2" opacity=".55"><path d="M1120 736L1410 540L1705 267L1760 744L1410 540L1280 253L1120 736"/><path d="M990 907L1120 736M1705 267L1777 167" strokeDasharray="6 10"/></g>{[[1120,736],[1705,267],[1760,744],[1280,253]].map(([x,y],j)=><g key={j}><circle cx={x} cy={y} r="13" fill="#54e7fb"/><circle cx={x} cy={y} r={29+Math.sin(t+j)*5} stroke="#54e7fb" fill="none" opacity=".35"/></g>)}</svg>}
    {i===4&&<Planet t={t}/>}
    {i===5&&<svg width="1920" height="1080" style={{position:'absolute',inset:0}}><circle cx="1410" cy="540" r="226" fill="none" stroke="#06232e" strokeWidth="2"/><circle cx="1410" cy="540" r="303" fill="none" stroke="#06232e" strokeWidth="1" strokeDasharray="4 12"/><path d="M1177 540H1643M1410 307V773" stroke="#06232e" strokeWidth="1" opacity=".3"/><path d="M1332 530L1390 588L1494 479" fill="none" stroke="#06232e" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    <Mono x={115} y={243} color={light?'#195664':'#54e7fb'} size={18}>CATATAN EKSPLORASI · {String(i+1).padStart(2,'0')}</Mono>
    <Lines lines={titles[i]} x={110} y={347} width={1050} size={179} gap={174} font={family.sans} weight={900} color={ink} accent={i===0||i===1?1:-1} accentColor="#54e7fb"/>
    <FitText text={i===5?'Perjalanan dimulai dari satu titik.':i===3?'Ikuti titiknya. Temukan jalurnya.':i===4?'Sinyal itu akhirnya menemukan rumah.':'SINYAL DARI JAUH / SEBUAH PERJALANAN'} x={116} y={787} width={1040} size={i===5?35:25} family={family.mono} weight={400} color={light?'#195664':'#8ab6be'} style={{letterSpacing:1}}/>
  </AbsoluteFill>;
};
export const Signal:React.FC=()=>{
  const frame=useCurrentFrame();const t=frame/60;const ready=useStudyFonts();if(!ready)return null;
  return <AbsoluteFill style={{background:'#031015',overflow:'hidden'}}>
    {starts.map((start,i)=>{const p=i===0?1:smooth(t,start-.18,start+.25);if(p===0)return null;const r=8+1850*p;return <div key={i} style={{position:'absolute',inset:0,clipPath:i===0?'none':`circle(${r}px at 1410px 540px)`}}><Shot i={i} t={t}/></div>;})}
    <svg width="1920" height="1080" style={{position:'absolute',inset:0,opacity:1-smooth(t,20,20.4)}}><circle cx="1410" cy="540" r="22" fill="#f1ffff"/><circle cx="1410" cy="540" r={44+Math.sin(t*2)*5} fill="none" stroke={t>=8&&t<12?'#06232e':'#54e7fb'} strokeWidth="2"/></svg>
    <Mono x={115} y={70} color={t>=8&&t<12||t>=20?'#195664':'#7aacb5'} size={16}>SINYAL DARI JAUH</Mono><Mono x={1550} y={70} color={t>=8&&t<12||t>=20?'#195664':'#7aacb5'} size={16}>TRANSMISSION / 001</Mono>
    <div style={{position:'absolute',left:115,top:975,width:1690,height:1,background:'#4c929c',opacity:.4}}/><div style={{position:'absolute',left:115,top:973,width:1690*t/25,height:4,background:'#54e7fb'}}/>
  </AbsoluteFill>;
};
