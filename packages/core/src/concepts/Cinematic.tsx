import React from 'react';
import {AbsoluteFill,interpolate,interpolateColors} from 'remotion';
import {ease,smooth} from './shared';
export const key=(t:number,times:number[],values:number[])=>interpolate(t,times,values,{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const appear=(t:number,start:number,end:number,last=false)=>ease(t,start-.22,start+.28)*(last?1:1-ease(t,end-.22,end+.28));
export const Beam:React.FC<{x:number;y:number;angle:number;width:number;color:string;opacity?:number}>=({x,y,angle,width,color,opacity=.4})=><div style={{position:'absolute',left:x,top:y,width,height:2,transform:`rotate(${angle}deg)`,transformOrigin:'left center',background:color,opacity,boxShadow:`0 0 14px ${color},0 0 45px ${color}`}}/>;
export const RimBean:React.FC<{x:number;y:number;scale:number;angle:number;id:string;green?:boolean;heat?:boolean;tone?:number}>=({x,y,scale,angle,id,green=false,heat=false,tone})=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
  <defs><radialGradient id={`skin-${id}`} cx="28%" cy="20%" r="85%"><stop stopColor={interpolateColors(tone??(green?1:heat?2:0),[0,1,2],['#b5895f','#b7b987','#db9863'])}/><stop offset=".55" stopColor={interpolateColors(tone??(green?1:heat?2:0),[0,1,2],['#725036','#777b50','#94522b'])}/><stop offset="1" stopColor={interpolateColors(tone??(green?1:heat?2:0),[0,1,2],['#1b130e','#303b23','#33170f'])}/></radialGradient><linearGradient id={`seam-${id}`} x2="1"><stop stopColor="#100b07"/><stop offset=".6" stopColor="#382012"/><stop offset="1" stopColor="#d3a678"/></linearGradient></defs>
  <ellipse rx="69" ry="92" fill={`url(#skin-${id})`}/>
  {Array.from({length:24},(_,i)=><path key={i} d={`M${-40+i*3.6} ${-55+(i%3)*17} Q${-25+i*3} ${-20+(i%4)*15} ${-28+i*3.3} ${55-(i%3)*10}`} fill="none" stroke="#2e1b0c" opacity=".12" strokeWidth="1.5"/>)}
  <path d="M15-81C-52-32 48 9 -13 81" fill="none" stroke={`url(#seam-${id})`} strokeWidth="15" strokeLinecap="round"/>
  <path d="M-28-72Q-62-36-48 6" fill="none" stroke="#efd9ac" opacity=".22" strokeWidth="4" strokeLinecap="round"/>
</g>;
export const phaseFade=(t:number,start:number,end:number)=>smooth(t,start,end);

export const ShotCamera:React.FC<{t:number;boundaries:number[];referenceTimes:number[];strength:number;children:React.ReactNode}>=({t,boundaries,referenceTimes,strength,children})=>{
  const points=[...boundaries.map((time,i)=>({time,value:i===boundaries.length-1?1:1+strength})),...referenceTimes.map(time=>({time,value:1}))].sort((a,b)=>a.time-b.time);
  const scale=key(t,points.map(p=>p.time),points.map(p=>p.value));
  return <AbsoluteFill style={{overflow:'hidden'}}><AbsoluteFill style={{transform:`scale(${scale})`,transformOrigin:'50% 50%'}}>{children}</AbsoluteFill></AbsoluteFill>;
};
