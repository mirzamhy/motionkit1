import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {FitText,Grain,family,hash,ease,useStudyFonts} from './shared';
import {appear,key,ShotCamera} from './Cinematic';
const red='#f0442a',paper='#ede8d7',ink='#141515';
const Book:React.FC<{open?:boolean;scale?:number;rotate?:number;x?:number;y?:number}>=({open=false,scale=1,rotate=-17,x=230,y=170})=><div style={{position:'absolute',left:x,top:y,width:620,height:760,perspective:1800,transform:`rotate(${rotate}deg) scale(${scale})`,transformOrigin:'center'}}>
  <div style={{position:'absolute',inset:0,transform:'rotateX(24deg) rotateY(-14deg)',transformStyle:'preserve-3d'}}>
    {Array.from({length:14},(_,i)=><div key={i} style={{position:'absolute',inset:0,background:i%2?'#c9c1ab':'#e4dfce',transform:`translate3d(${i*1.5}px,${i*1.8}px,${-i*1.9}px)`,boxShadow:i===13?'35px 55px 80px #0005':undefined}}/>)}
    <div style={{position:'absolute',inset:0,background:paper,boxShadow:'inset 16px 0 30px #0003',borderLeft:`20px solid ${red}`,transform:open?'rotateY(-50deg)':'rotateY(0deg)',transformOrigin:'left center'}}>
      <FitText text="SATU" x={44} y={56} width={526} size={205} color={ink} family={family.bold} weight={400}/><FitText text="BAB" x={44} y={254} width={526} size={225} color={red} family={family.bold} weight={400}/><FitText text="LAGI." x={44} y={478} width={526} size={185} color={ink} family={family.bold} weight={400}/>
      <div style={{position:'absolute',left:50,bottom:44,fontFamily:family.mono,fontSize:17,letterSpacing:3}}>SATU HALAMAN. IDE BERIKUTNYA.</div>
    </div>
  </div>
</div>;
export const BooksV2:React.FC=()=>{
 const f=useCurrentFrame(),t=f/60;const ready=useStudyFonts();if(!ready)return null;
 const starts=[0,3.2,6.4,10.4,14.4,17.6,20];
 return <ShotCamera t={t} boundaries={starts} referenceTimes={[1.1,4.5,8,12.1,15.6,18.8]} strength={.18}><AbsoluteFill style={{background:paper,overflow:'hidden',perspective:1500}}><Grain id="b2-grain" opacity={.07}/>
  <div style={{position:'absolute',inset:0,opacity:appear(t,0,3.2)}}>
   <AbsoluteFill style={{background:ink}}/>
   {Array.from({length:6},(_,i)=><div key={i} style={{position:'absolute',left:-150,top:-230+i*238-t*55,width:1500,height:219,background:i%2?red:paper,transform:`rotate(-13deg) translateX(${i%2?t*18:-t*24}px)`,boxShadow:'0 15px 35px #0007'}}><FitText text={i%2?'TERUS?':'SCROLL / SCROLL'} x={35} y={21} width={1440} size={211} color={i%2?paper:ink} family={family.bold} weight={400}/></div>)}
  </div>
  <div style={{position:'absolute',inset:0,opacity:appear(t,3.2,6.4)}}>
   <AbsoluteFill style={{background:red}}/>
   <div style={{position:'absolute',left:10,top:240,width:1060,height:620,background:paper,transform:'rotate(-8deg)',boxShadow:'0 38px 55px #56130455'}}><FitText text="BERHENTI." x={45} y={140} width={955} size={210} color={ink} family={family.bold} weight={400}/><FitText text="SEBENTAR." x={60} y={351} width={940} size={132} color={red} family={family.wide} weight={800}/><div style={{position:'absolute',left:890,top:485,width:160,height:170,background:'#d6cbb1',clipPath:'polygon(0 0,100% 0,0 100%)'}}/></div>
  </div>
  <div style={{position:'absolute',inset:0,opacity:appear(t,6.4,10.4)}}><Book scale={1.04} rotate={-21+(t-6.4)*2} x={233} y={93}/><div style={{position:'absolute',left:78,top:72,fontFamily:family.mono,fontSize:23,color:ink,transform:'rotate(-90deg)',transformOrigin:'left center'}}>BUKA / SATU BUKU</div></div>
  <div style={{position:'absolute',inset:0,opacity:appear(t,10.4,14.4),transform:'perspective(1400px) rotateX(8deg) rotateZ(-5deg)'}}>
   <div style={{position:'absolute',left:-130,top:87,width:520,height:900,background:'#f8f3e4',boxShadow:'inset -24px 0 45px #0002'}}><FitText text="01" x={30} y={143} width={475} size={470} color={red} family={family.bold} weight={400}/>{Array.from({length:7},(_,i)=><div key={i} style={{position:'absolute',left:54,top:680+i*28,width:390,height:2,background:'#8c8677',opacity:.5}}/>)}</div>
   <div style={{position:'absolute',left:390,top:87,width:650,height:900,background:paper,boxShadow:'inset 25px 0 45px #0002'}}><FitText text="Halaman" x={45} y={230} width={490} size={110} color={ink} family={family.serif} weight={400}/><FitText text="pertama." x={45} y={350} width={490} size={110} color={ink} family={family.serif} weight={400}/><div style={{position:'absolute',left:45,top:550,width:490,fontFamily:family.serif,fontSize:30,lineHeight:1.4,color:'#605b50'}}>Satu bab cukup untuk memulai.</div></div>
   <div style={{position:'absolute',left:377,top:87,width:26,height:905,background:red}}/>
  </div>
  <div style={{position:'absolute',inset:0,opacity:appear(t,14.4,17.6)}}>
   <AbsoluteFill style={{background:ink}}/>
   {[0,1,2,3,4].map((i)=><div key={i} style={{position:'absolute',left:50+i*18,top:300-i*25,width:900,height:520,transformOrigin:'center center',transform:`perspective(900px) rotateY(-12deg) rotateZ(-10deg) translateZ(${i*15}px)`,opacity:i===4?1:.12+i*.1}}><FitText text="IDE" x={0} y={0} width={820} size={420} color={i===4?paper:red} family={family.bold} weight={400}/></div>)}
   <FitText text="BARU." x={80} y={778} width={910} size={155} color={red} family={family.wide} weight={800}/>
   <svg width="1080" height="1080" style={{position:'absolute',inset:0}}>{Array.from({length:16},(_,i)=><path key={i} d={`M${90+i*35} 780Q${540+hash(i)*400} ${200+hash(i+7)*400} ${800+hash(i+17)*230} ${110+hash(i+30)*350}`} fill="none" stroke={red} opacity=".25" strokeWidth="1"/> )}</svg>
  </div>
  <div style={{position:'absolute',inset:0,opacity:appear(t,17.6,20,true)}}><AbsoluteFill style={{background:red}}/><div style={{position:'absolute',left:-70,top:52,transform:'rotate(-9deg)'}}><FitText text="SATU BAB LAGI /" x={0} y={0} width={1600} size={195} color="#a92b1b" family={family.wide} weight={800}/></div><Book scale={.77} x={256} y={188} rotate={11}/><FitText text="Hari ini, satu bab lagi." x={48} y={918} width={987} size={60} color={paper} family={family.serif} weight={400}/></div>
  <div style={{position:'absolute',left:key(t,starts,[930,946,820,550,150,862,862]),top:key(t,starts,[0,0,55,95,765,193,193]),width:24,height:112,background:red,boxShadow:'0 7px 15px #0003',clipPath:'polygon(0 0,100% 0,100% 100%,50% 83%,0 100%)'}}/>
 </AbsoluteFill></ShotCamera>;
};
