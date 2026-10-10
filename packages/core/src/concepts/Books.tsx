import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {decode,WordBands} from '../studies/primitives';
import {family,FitText,Grain,Lines,Mono,smooth,ease,useStudyFonts} from './shared';

const starts=[0,3.2,6.4,10.4,14.4,17.6];
const Cover:React.FC<{t:number;open?:number}>=({t,open=0})=><svg width="1080" height="1080" style={{position:'absolute',inset:0}}><g transform={`translate(650 650) rotate(${-12+Math.sin(t)*2}) scale(.85)`}><rect x="-170" y="-170" width="305" height="392" rx="5" fill="#e7dfc8" transform={`translate(${open*55} 8)`}/>{Array.from({length:8},(_,i)=><path key={i} d={`M-142 ${-110+i*35} H${110+open*45}`} stroke="#b0a792" strokeWidth="2"/>)}<g transform={`translate(${-open*85} 0) rotate(${-open*22})`}><rect x="-187" y="-185" width="305" height="392" rx="7" fill="#294bff"/><rect x="-187" y="-185" width="19" height="392" fill="#1930b8"/><text x="-143" y="-102" fill="#ffe35f" fontFamily="Syne" fontSize="45" fontWeight="800">IDE</text><text x="-143" y="-48" fill="#ffe35f" fontFamily="Syne" fontSize="45" fontWeight="800">BARU.</text><path d="M-143 62H70M-143 83H70M-143 104H-15" stroke="#9dabff" strokeWidth="5"/><path d="M45 -185H87V-73L66 -93L45 -73Z" fill="#ffe35f"/></g></g></svg>;
const BookScene:React.FC<{index:number;t:number;frame:number}>=({index,t,frame})=>{
  const local=t-starts[index];
  return <AbsoluteFill>
    {index===0&&<><Lines lines={['SCROLL','TERUS?']} x={44} y={245} width={992} size={250} gap={231} font={family.bold} weight={400} accent={1}/><div style={{position:'absolute',left:44,top:758,width:992,height:98,background:'#294bff',overflow:'hidden'}}><FitText text="SCROLL / SCROLL / SCROLL / SCROLL" x={-local*65} y={23} width={1600} size={49} color="#f4f1e5" family={family.mono} weight={400}/></div></>}
    {index===1&&<><Lines lines={['BERHENTI.','SEBENTAR.']} x={44} y={332} width={992} size={186} gap={189} font={family.bold} weight={400} accent={0}/><div style={{position:'absolute',left:44,top:754,width:992,height:8,background:'#ffe35f'}}/><Mono x={47} y={815} color="#efeee5" size={23}>SISAKAN RUANG UNTUK SATU IDE.</Mono></>}
    {index===2&&<><Lines lines={['BUKA','SATU BUKU.']} x={44} y={145} width={992} size={160} gap={156} font={family.bold} weight={400}/><Cover t={t} open={ease(local,.2,1.4)*.55}/><Mono x={50} y={880} color="#ffe35f" size={24}>CERITA DIMULAI DARI SINI ↗</Mono></>}
    {index===3&&<><FitText text="SATU" x={44} y={176} width={992} size={240} family={family.bold} weight={400}/><FitText text="BAB." x={44} y={407} width={660} size={285} family={family.bold} weight={400} color="#ffe35f"/><svg width="1080" height="1080" style={{position:'absolute',inset:0}}><g transform="translate(805 665) rotate(12)"><rect x="-104" y="-150" width="226" height="296" fill="#ede6cf"/>{Array.from({length:6},(_,i)=><path key={i} d={`M-70 ${-94+i*30} H82`} stroke="#9a9688" strokeWidth="3"/>)}<path d="M42 -150H84V-47L63 -66L42 -47Z" fill="#294bff"/></g></svg><Mono x={47} y={833} color="#efeee5" size={24}>MULAI DARI HALAMAN PERTAMA.</Mono></>}
    {index===4&&<><Lines lines={['SATU IDE',decode('BARU.',frame,ease(local,0,.8),42)]} x={44} y={268} width={992} size={236} gap={225} font={family.bold} weight={400} accent={1}/><svg width="1080" height="1080" style={{position:'absolute',inset:0}}><path d="M69 777H756M756 777L685 707M756 777L685 847" fill="none" stroke="#294bff" strokeWidth="23"/><g transform={`translate(895 777) rotate(${local*18})`}><path d="M0-74L16-18L74 0L18 16L0 74L-16 18L-74 0L-18-16Z" fill="#ffe35f"/></g></svg></>}
    {index===5&&<><Lines lines={['SATU','BAB LAGI.']} x={44} y={228} width={992} size={235} gap={235} font={family.bold} weight={400} accent={1}/><FitText text="Buka buku. Mulai membaca." x={48} y={800} width={980} size={47} family={family.sans} weight={600}/><div style={{position:'absolute',left:47,top:746,width:992,height:8,background:'#294bff'}}/></>}
  </AbsoluteFill>;
};
export const Books:React.FC=()=>{
  const frame=useCurrentFrame();const t=frame/60;const ready=useStudyFonts();if(!ready)return null;
  return <AbsoluteFill style={{background:'#111214',overflow:'hidden'}}><Grain id="book-grain" opacity={.035}/>
    {starts.map((start,i)=>{const pi=i===0?1:smooth(t,start-.2,start+.3);const po=i===5?0:smooth(t,starts[i+1]-.2,starts[i+1]+.3);if(pi===0||po===1)return null;return <div key={i} style={{position:'absolute',inset:0,clipPath:`inset(0 ${po*1080}px 0 0)`}}><WordBands progress={pi} width={1080} height={1080}><BookScene index={i} t={t} frame={frame}/></WordBands></div>;})}
    <Mono x={47} y={56} color="#ffe35f" size={18}>CATATAN MEMBACA</Mono><Mono x={811} y={56} color="#a5acbe" size={18}>VOL. 01</Mono>
    <div style={{position:'absolute',left:44,top:965,width:992,height:2,background:'#56513a'}}/><div style={{position:'absolute',left:44,top:962,width:992*t/20,height:7,background:'#ffe35f'}}/>
    <Mono x={47} y={1000} color="#979b9f" size={15}>SATU BAB LAGI · KINETIC READING POSTER</Mono><Mono x={918} y={1000} color="#ffe35f" size={15}>{String(Math.floor(t)).padStart(2,'0')}:00</Mono>
  </AbsoluteFill>;
};
