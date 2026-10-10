import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,useVideoConfig,interpolateColors} from 'remotion';
import {ease,smooth,hash,family,FitText,useStudyFonts} from './shared';

const cyan='#8affde', white='#edf0df';
const Incoming:React.FC<{text:string;x:number;y:number;width:number;size:number;time:number;start:number;color:string}> = ({text,x,y,width,size,time,start,color}) => {
 const p=ease(time,start,start+.55);
 return <div style={{position:'absolute',inset:0,clipPath:`inset(${y}px 0 ${1080-y-size*1.25}px 0)`}}><FitText text={text} x={x} y={y+(1-p)*size*1.2} width={width} size={size} color={color} family={family.bold} weight={400}/></div>;
};

export const SignalMotionProbe:React.FC=()=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
 const ready=useStudyFonts();if(!ready)return null;
 const launch=smooth(t,1.85,2.65),arrive=smooth(t,4.8,5.45);
 const cx=960+260*smooth(t,4,4.8),cy=540-70*smooth(t,4,4.8);
 const planet=smooth(t,5.25,7.4);
 const pointX=1220+440*Math.cos(-2.8+planet*2.5),pointY=470+145*Math.sin(-2.8+planet*2.5);
 return <AbsoluteFill style={{background:'#030b10',overflow:'hidden'}}>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
   <defs><radialGradient id="signal-halo"><stop stopColor="#236655" stopOpacity=".6"/><stop offset="1" stopColor="#030b10" stopOpacity="0"/></radialGradient></defs>
   <ellipse cx={cx} cy={cy} rx="780" ry="620" fill="url(#signal-halo)"/>
   {Array.from({length:100},(_,i)=>{const angle=hash(i+44)*Math.PI*2;const r=120+hash(i+98)*1100;const stretch=1+launch*(.2+t*.2);return <path key={i} d={`M${cx+Math.cos(angle)*r*stretch} ${cy+Math.sin(angle)*r*stretch*.7} l${Math.cos(angle)*launch*90} ${Math.sin(angle)*launch*60}`} stroke={white} strokeWidth={1+hash(i)*2} opacity={.15+hash(i+88)*.5}/>;})}
   {Array.from({length:16},(_,i)=>{
    const travel=(t*.22+Math.max(0,t-2)*.8+i/16)%1;
    const r=12+travel**2*1500;
    return <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r*(1-launch*.38)} transform={`rotate(${-18*launch} ${cx} ${cy})`} fill="none" stroke={i%4===0?white:cyan} strokeWidth={1+travel*6} opacity={(1-travel)*(.15+launch*.5)}/>;
   })}
   <circle cx={cx} cy={cy} r={9+Math.sin(t*5)**2*4} fill={white}/>
   <circle cx={cx} cy={cy} r={30+Math.sin(t*5)**2*10} fill="none" stroke={cyan} strokeWidth="2"/>
   <path d={`M${cx-60} ${cy}h-80m200 0h80M${cx} ${cy-60}v-80m0 200v80`} stroke={cyan} opacity={1-launch}/>
  </svg>
  <div style={{position:'absolute',inset:0,opacity:1-smooth(t,1.8,2.25)}}>
   <Incoming text="ADA YANG" x={85} y={160} width={1100} size={112} time={t} start={-.2} color={white}/>
   <Incoming text="MEMANGGIL." x={85} y={282} width={1320} size={112} time={t} start={0} color={cyan}/>
  </div>
  <div style={{position:'absolute',inset:0,clipPath:`circle(${arrive*2400}px at ${cx}px ${cy}px)`,background:white}}>
   <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
    <defs>
     <radialGradient id="receiver-planet" cx="25%" cy="23%"><stop stopColor="#245b4c"/><stop offset=".5" stopColor="#0b2924"/><stop offset="1" stopColor="#02100f"/></radialGradient>
     <pattern id="receiver-dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="#75ebc7"/></pattern>
     <clipPath id="receiver-disc"><circle cx="1220" cy="470" r="350"/></clipPath>
    </defs>
    <g transform={`translate(${(1-ease(t,5.05,5.9))*120} 0)`}>
     <ellipse cx="1220" cy="470" rx="490" ry="160" fill="none" stroke="#25735e" strokeWidth="2" transform="rotate(-17 1220 470)"/>
     <circle cx="1220" cy="470" r="350" fill="url(#receiver-planet)"/>
     <g clipPath="url(#receiver-disc)">
      <rect x={840+planet*80} y="90" width="780" height="760" fill="url(#receiver-dots)" opacity=".35"/>
      {Array.from({length:15},(_,i)=><ellipse key={i} cx="1220" cy={140+i*46} rx={Math.sqrt(Math.max(0,350**2-(140+i*46-470)**2))} ry={28+Math.sin(planet*2+i)*14} fill="none" stroke={cyan} strokeWidth="1" opacity=".3"/>)}
     </g>
     <path d="M799 426 A490 160 -17 0 0 1641 514" fill="none" stroke="#258066" strokeWidth="4"/>
     <circle cx={pointX} cy={pointY} r="12" fill="#031a16"/>
     {[0,1,2].map(i=>{const p=(t*.7+i/3)%1;return <circle key={i} cx={pointX} cy={pointY} r={18+p*85} fill="none" stroke="#23795f" strokeWidth="2" opacity={(1-p)*.7}/>;})}
    </g>
    <path d="M90 924H1830" stroke="#183a2e" opacity=".2"/>
    <path d={`M90 924 ${Array.from({length:160},(_,i)=>`L${90+i*4} ${924-Math.sin(i*.44-t*7)*Math.exp(-(((i-80)/40)**2))*45*ease(t,5.6,6)}`).join(' ')}`} fill="none" stroke="#277f64" strokeWidth="3"/>
   </svg>
   <Incoming text="SINYAL" x={88} y={620} width={990} size={170} time={t} start={5.45} color="#0b2924"/>
   <Incoming text="DITERIMA." x={88} y={802} width={1040} size={120} time={t} start={5.63} color="#25735e"/>
  </div>
  <div style={{position:'absolute',left:86,top:70,fontFamily:family.mono,fontSize:22,letterSpacing:4,color:interpolateColors(arrive,[0,1],[cyan,'#183a2e'])}}>SINYAL DARI JAUH</div>
 </AbsoluteFill>;
};

const Root=()=> <Composition id="SignalMotionProbe" component={SignalMotionProbe} width={1920} height={1080} fps={60} durationInFrames={480}/>;
registerRoot(Root);
