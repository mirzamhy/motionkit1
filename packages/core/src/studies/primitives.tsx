import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, interpolate, Easing} from 'remotion';
import {loadFont as syne} from '@remotion/google-fonts/Syne';
import {loadFont as archivo} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as inter} from '@remotion/google-fonts/Inter';
import {loadFont as mono} from '@remotion/google-fonts/IBMPlexMono';

const fonts = [syne('normal',{weights:['800'],subsets:['latin']}),archivo('normal',{weights:['400'],subsets:['latin']}),inter('normal',{weights:['900','600'],subsets:['latin']}),mono('normal',{weights:['400'],subsets:['latin']})];
export const family = {wide:'Syne',bold:'Archivo Black',sans:'Inter',mono:'IBM Plex Mono',serif:'Georgia'};
export const useStudyFonts = () => {
  const [ready,setReady]=useState(false);
  const [handle]=useState(()=>delayRender('study fonts'));
  useEffect(()=>{Promise.all(fonts.map(f=>f.waitUntilDone())).then(()=>{setReady(true);continueRender(handle);});},[handle]);
  return ready;
};
export const ramp=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const ease=(t:number,a:number,b:number)=>Easing.bezier(.22,1,.36,1)(ramp(t,a,b));
export const smooth=(t:number,a:number,b:number)=>Easing.inOut(Easing.cubic)(ramp(t,a,b));
export const hash=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453123;return v-Math.floor(v);};

export const decode=(text:string,frame:number,progress:number,seed=1)=>{
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789/=+#';
  return Array.from(text).map((c,i)=>c===' '||progress>=(i+1)/text.length?c:alphabet[Math.floor(hash(seed*983+i*47+Math.floor(frame/2)*13)*alphabet.length)]).join('');
};

export const FitText: React.FC<{text:string;x:number;y:number;width:number;size:number;family?:string;weight?:number;color?:string;align?:'left'|'right'|'center';tracking?:number;style?:React.CSSProperties}>=({text,x,y,width,size,family:font=family.wide,weight=800,color='#f5f5f5',align='left',tracking=-.04,style})=>{
  const ctx=document.createElement('canvas').getContext('2d')!;
  ctx.font=`${weight} ${size}px "${font}"`;
  const measured=ctx.measureText(text).width+Math.max(0,text.length-1)*size*tracking;
  const fit=Math.min(size,size*width/Math.max(1,measured));
  return <div style={{position:'absolute',left:x,top:y,width,fontFamily:font,fontWeight:weight,fontSize:fit,lineHeight:1,letterSpacing:`${tracking}em`,textAlign:align,whiteSpace:'pre',color,...style}}>{text}</div>;
};

export const BlurDissolve:React.FC<{progress:number;out?:boolean;children:React.ReactNode}>=({progress,out=false,children})=>{
  const visible=out?1-progress:progress;
  return <div style={{position:'absolute',inset:0,opacity:visible,filter:`blur(${(1-visible)*18}px)`}}>{children}</div>;
};

export const SlotRoll:React.FC<{from:string;to:string;progress:number;width:number;height:number;style?:React.CSSProperties}>=({from,to,progress,width,height,style})=><div style={{position:'relative',width,height,overflow:'hidden',...style}}><div style={{position:'absolute',inset:0,transform:`translateY(${-progress*height}px)`}}>{from}</div><div style={{position:'absolute',inset:0,transform:`translateY(${(1-progress)*height}px)`}}>{to}</div></div>;

export const ObjectIris:React.FC<{progress:number;center:[number,number];maxRadius:number;color:string}>=({progress,center,maxRadius,color})=>{
  const radius=2+(maxRadius-2)*progress;
  return <div style={{position:'absolute',left:center[0]-radius,top:center[1]-radius,width:radius*2,height:radius*2,borderRadius:'50%',background:color}}/>;
};

export const WordBands:React.FC<{progress:number;width:number;height:number;children:React.ReactNode}>=({progress,width,height,children})=><div style={{position:'absolute',inset:0,width,height}}>{Array.from({length:5},(_,i)=>{
  const p=Math.max(0,Math.min(1,progress+(i%2===0?.05:-.05)*Math.sin(progress*Math.PI)));
  const top=i*height/5;
  return <div key={i} style={{position:'absolute',inset:0,clipPath:`inset(${top}px 0 ${height-top-height/5}px ${(1-p)*width}px)`,transform:`translateX(${(1-p)*(i%2===0?22:-22)}px)`}}>{children}</div>;
})}</div>;
