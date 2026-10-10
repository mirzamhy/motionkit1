import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease, smooth, family, useStudyFonts} from './shared';
import {WordBands} from '../studies/primitives';

const paper = '#f1ecdc', red = '#ff442d', ink = '#11120f';

const GlyphLine: React.FC<{text:string; y:number; size:number; width:number; time:number; start:number; color?:string}> = ({text,y,size,width,time,start,color=paper}) => {
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `400 ${size}px "${family.bold}"`;
  const natural = ctx.measureText(text).width;
  const fit = Math.min(size, size * width / natural);
  ctx.font = `400 ${fit}px "${family.bold}"`;
  return <div style={{position:'absolute',left:60,top:y,height:fit*1.2,width,overflow:'hidden'}}>
    {Array.from(text).map((char,i) => {
      const p = ease(time,start+i*.027,start+i*.027+.34);
      const x = ctx.measureText(text.slice(0,i)).width;
      return <span key={i} style={{position:'absolute',left:x,top:0,fontFamily:family.bold,fontSize:fit,lineHeight:1.05,color,whiteSpace:'pre',translate:`${(1-p)*-35}px ${(1-p)*fit}px`,rotate:`${(1-p)*9}deg`,opacity:p,filter:`blur(${(1-p)*8}px)`}}>{char}</span>;
    })}
  </div>;
};

export const BooksMotionProbe: React.FC = () => {
  const frame = useCurrentFrame(), {fps} = useVideoConfig(), t = frame/fps;
  const ready = useStudyFonts();
  if (!ready) return null;
  const first = smooth(t,1.65,2.13), second = smooth(t,3.35,3.85);
  const shrink = smooth(t,4.65,5.18), close = smooth(t,6.4,6.95);
  const stop = <>
    <GlyphLine text="BERHENTI." y={350} size={174} width={960} time={t} start={1.7}/>
    <GlyphLine text="SEBENTAR." y={535} size={165} width={960} time={t} start={1.85} color={red}/>
  </>;
  const chapter = <>
    <GlyphLine text="BUKA" y={290} size={240} width={960} time={t} start={3.3}/>
    <GlyphLine text="SATU BAB." y={535} size={180} width={960} time={t} start={3.47} color={red}/>
  </>;
  return <AbsoluteFill style={{background:ink,overflow:'hidden'}}>
    <div style={{position:'absolute',inset:38,border:'1px solid #f1ecdc25'}}/>
    <div style={{position:'absolute',left:60,top:63,fontFamily:family.mono,fontSize:18,letterSpacing:3,color:paper}}>SATU BAB LAGI</div>
    <div style={{position:'absolute',right:60,top:63,fontFamily:family.mono,fontSize:18,color:red}}>01 / MULAI</div>
    <div style={{position:'absolute',inset:0,clipPath:`inset(0 ${first*1080}px 0 0)`}}>
      <div style={{position:'absolute',inset:0,translate:`${-first*400}px 0px`}}>
        <GlyphLine text="SCROLL" y={310} size={235} width={960} time={t} start={-.1}/>
        <GlyphLine text="TERUS?" y={550} size={218} width={960} time={t} start={.1} color={red}/>
        <div style={{position:'absolute',left:60,top:809,width:960*ease(t,.4,1.3),height:8,background:red}}/>
      </div>
    </div>
    <div style={{position:'absolute',inset:0,clipPath:`inset(0 ${second*1080}px 0 0)`}}><WordBands progress={first} width={1080} height={1080}>{stop}</WordBands></div>
    <div style={{position:'absolute',inset:0,transformOrigin:'60px 290px',transform:`translate(${shrink*5}px,${-shrink*110}px) scale(${1-shrink*.7})`,clipPath:`inset(0 0 ${close*1080}px 0)`}}><WordBands progress={second} width={1080} height={1080}>{chapter}</WordBands></div>
    <div style={{position:'absolute',left:60,top:475,width:960,height:410,clipPath:`inset(0 ${(1-ease(t,4.85,5.4))*100}% 0 0)`,opacity:1-close}}>
      <div style={{position:'absolute',inset:0,border:'2px solid #f1ecdc55'}}/>
      <div style={{position:'absolute',left:479,top:0,height:410,width:3,background:red}}/>
      {Array.from({length:8},(_,i)=><div key={i} style={{position:'absolute',left:i<4?36:520,top:60+(i%4)*48,width:(i%4===3?240:350)*ease(t,5.05+i*.06,5.4+i*.06),height:i%4===0?12:3,background:i%4===0?red:paper,opacity:.8}}/>)}
      <div style={{position:'absolute',left:37,top:319,fontFamily:family.mono,fontSize:20,color:paper}}>01</div>
    </div>
    <div style={{position:'absolute',inset:0,clipPath:`inset(${(1-close)*1080}px 0 0 0)`}}>
      <GlyphLine text="SATU BAB" y={305} size={215} width={960} time={t} start={6.4}/>
      <GlyphLine text="LAGI." y={535} size={260} width={960} time={t} start={6.57} color={red}/>
    </div>
    <div style={{position:'absolute',left:60,top:885-close*76,width:960,height:8,background:red,scale:`${ease(t,4.7,5.25)} 1`,transformOrigin:'left center'}}/>
    <div style={{position:'absolute',left:60,bottom:68,width:960,height:2,background:'#f1ecdc25'}}><div style={{width:`${t/8*100}%`,height:2,background:paper}}/></div>
  </AbsoluteFill>;
};

const Root = () => <Composition id="BooksMotionProbe" component={BooksMotionProbe} width={1080} height={1080} fps={60} durationInFrames={480}/>;
registerRoot(Root);
