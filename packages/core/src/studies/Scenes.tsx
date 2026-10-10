import React from 'react';
import {AbsoluteFill,interpolate,interpolateColors,useCurrentFrame,useVideoConfig} from 'remotion';
import {BlurDissolve,decode,ease,family,FitText,hash,ObjectIris,ramp,SlotRoll,smooth,useStudyFonts,WordBands} from './primitives';

const TechChrome:React.FC=()=> <AbsoluteFill style={{fontFamily:family.mono,color:'#a4b344',fontSize:12,letterSpacing:2,pointerEvents:'none'}}>
  {[42,1018].flatMap(x=>[42,1018].map(y=><div key={`${x}-${y}`} style={{position:'absolute',left:x,top:y,width:22,height:22,borderTop:y===42?'1px solid #6d772a':undefined,borderBottom:y===1018?'1px solid #6d772a':undefined,borderLeft:x===42?'1px solid #6d772a':undefined,borderRight:x===1018?'1px solid #6d772a':undefined}}/>))}
  {['JSON','H3','SEEDANCE'].map((s,i)=><div key={s} style={{position:'absolute',top:136,left:64+i*400,fontSize:15}}><span style={{color:'#ff2bd6'}}>▪</span> {s}</div>)}
  <div style={{position:'absolute',bottom:24,left:54,fontSize:10}}>TH_SYS · 120 BPM · 1080×1080 · 60 FPS</div>
  <div style={{position:'absolute',bottom:24,right:52,fontSize:10}}>06.400 · REBUILD</div>
</AbsoluteFill>;

export const TechStudy:React.FC=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const ready=useStudyFonts();if(!ready)return null;
  const t=5.8+frame/fps;
  const wipe=smooth(t,6.52,7.02);
  const incoming=<>
    <FitText text="BAD" x={7} y={178} width={1000} size={310} family={family.bold} weight={400}/>
    <FitText text="PROMPTING" x={15} y={453} width={1025} size={170} family={family.bold} weight={400}/>
    <div style={{opacity:ease(t,8.02,8.38),filter:`blur(${(1-ease(t,8.02,8.38))*12}px)`,transform:`translateY(${(1-ease(t,8.02,8.38))*38}px)`}}>
      <FitText text="IS" x={548} y={587} width={510} size={350} color="#b8ff00" align="right"/>
      <div style={{position:'absolute',left:555,top:934,width:500*ease(t,8.06,8.4),height:6,background:'#b8ff00'}}/>
    </div>
  </>;
  const scramble=t<6.0?1:ramp(t,6.42,6.5);
  return <AbsoluteFill style={{background:'#0a0a0a',overflow:'hidden'}}>
    <TechChrome/>
    <div style={{position:'absolute',left:54,top:312,width:1,height:425,background:'#a4b344',opacity:.18}}/>
    <div style={{position:'absolute',inset:0,clipPath:`inset(0 ${wipe*1080}px 0 0)`}}>
      <FitText text="AI VIDEO" x={55} y={399} width={650} size={116}/>
      <FitText text="ISN’T" x={535} y={503} width={475} size={104} align="right"/>
      <FitText text={decode('EXPENSIVE',frame,scramble,8)} x={25} y={600} width={1025} size={170} family={family.bold} weight={400} color={t>=6.0&&t<6.5?'#b8ff00':'#f5f5f5'}/>
      <div style={{position:'absolute',left:55,top:786,width:960,height:5,background:'#b8ff00'}}/>
    </div>
    <WordBands progress={wipe} width={1080} height={1080}>{incoming}</WordBands>
    {[-1,1].map(k=><div key={k} style={{position:'absolute',inset:0,opacity:Math.sin(wipe*Math.PI)*.16,filter:'blur(2px)',transform:`translateX(${k*24*Math.sin(wipe*Math.PI)}px)`,mixBlendMode:'screen',color:k===1?'#ff2bd6':'#b8ff00'}}>{incoming}</div>)}
  </AbsoluteFill>;
};

const WarmGround:React.FC=()=> <AbsoluteFill style={{background:'#12100d'}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 48% 48%,rgba(106,52,37,.50),transparent 52%)'}}/>
  <svg width="1280" height="720" style={{position:'absolute',inset:0,opacity:.07}}><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="8" stitchTiles="stitch"/></filter><rect width="1280" height="720" filter="url(#grain)"/></svg>
</AbsoluteFill>;
const EditorialChrome:React.FC<{label:string}>=({label})=><AbsoluteFill style={{fontFamily:family.mono,fontSize:10,color:'#b6a997',letterSpacing:3}}><div style={{position:'absolute',top:32,left:48}}>CLAUDE · CAPABILITIES</div><div style={{position:'absolute',top:32,right:48}}>2026</div><div style={{position:'absolute',left:48,bottom:29,right:48,height:1,background:'#765045'}}/><div style={{position:'absolute',top:210,left:100,fontSize:12,color:'#ca8065'}}>{label}</div></AbsoluteFill>;
export const ClaudeStudy:React.FC=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const ready=useStudyFonts();if(!ready)return null;const t=7.4+frame/fps;
  const out=ramp(t,7.8,8.0);const incoming=ease(t,8.03,8.33);const branch=ease(t,9.0,9.5);
  return <AbsoluteFill style={{overflow:'hidden'}}><WarmGround/>
    <BlurDissolve progress={out} out>
      <svg width="1280" height="720" style={{position:'absolute',inset:0,opacity:.24}}><circle cx="640" cy="360" r="316" fill="none" stroke="#ad8267" strokeWidth="1" strokeDasharray="1 10"/></svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:family.serif,fontSize:235,color:'#f1e9dc',letterSpacing:-12,transform:'translateY(-25px)'}}>Claude</div>
      <div style={{position:'absolute',top:218,left:0,width:1280,textAlign:'center',color:'#bd7b63',fontFamily:family.mono,fontSize:13,letterSpacing:5}}>AI MADE BY ANTHROPIC</div>
      <div style={{position:'absolute',left:400,top:482,width:480,height:2,background:'#bf755c'}}/>
      <div style={{position:'absolute',top:503,width:1280,textAlign:'center',fontFamily:family.serif,fontSize:27,fontStyle:'italic',color:'#cfbda7'}}>One mind. Many crafts.</div>
    </BlurDissolve>
    <BlurDissolve progress={incoming}>
      <EditorialChrome label="01 · REASONING"/>
      <div style={{position:'absolute',top:255,left:100,width:460,fontFamily:family.serif,fontSize:79,lineHeight:.95,color:'#f1e9dc',letterSpacing:-4}}>{['Thinks it','through.'].map((word,i)=> <div key={word} style={{opacity:ease(t,8.08+i*.12,8.26+i*.12),filter:`blur(${(1-ease(t,8.08+i*.12,8.26+i*.12))*6}px)`}}>{word}</div>)}</div>
      <div style={{position:'absolute',top:430,left:102,width:415,fontFamily:family.serif,fontSize:23,fontStyle:'italic',color:'#c1b09b',opacity:ease(t,8.6,8.9)}}>Checks the reasoning, one step at a time.</div>
      <div style={{position:'absolute',left:650,top:83,width:516,height:575,background:'rgba(33,31,25,.7)',border:'1px solid #484037',boxShadow:'0 24px 60px #0004',fontFamily:family.serif,color:'#e4dccb'}}>
        <div style={{position:'absolute',top:18,left:18,fontFamily:family.mono,fontSize:10,color:'#a09483',letterSpacing:3}}>REASONING</div>
        <div style={{position:'absolute',top:46,left:60,width:390,padding:'15px 0',textAlign:'center',fontSize:25,border:'1px solid #5c5145',background:'#29261f'}}>Choose a launch date.</div>
        <svg width="516" height="575" style={{position:'absolute',inset:0,opacity:branch}}>{[107,258,409].map(x=><path key={x} d={`M258 105 C258 161 ${x} 154 ${x} 213`} fill="none" stroke="#9d8066" strokeWidth="1.3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-branch}/>)}</svg>
        {['Budget','Team','Market'].map((word,i)=><div key={word} style={{position:'absolute',top:213,left:45+i*151,width:120,padding:'16px 0',fontSize:23,textAlign:'center',border:'1px solid #544a3e',background:'#29261f',opacity:ease(t,9.08+i*.08,9.38+i*.08),transform:`translateY(${(1-ease(t,9.08+i*.08,9.38+i*.08))*12}px)`}}>{word}<div style={{fontSize:10,color:'#a09483',marginTop:8}}>check the trade-off</div></div>)}
      </div>
    </BlurDissolve>
  </AbsoluteFill>;
};

export const ClaudeRollStudy:React.FC=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const ready=useStudyFonts();if(!ready)return null;const t=44.6+frame/fps;const p=smooth(t,45.0,45.1);
  return <AbsoluteFill><WarmGround/><EditorialChrome label=""/>
    <div style={{position:'absolute',left:0,top:147,width:1280,textAlign:'center',fontFamily:family.mono,fontSize:11,letterSpacing:5,color:'#c48269'}}>08 · LANGUAGES</div>
    <SlotRoll from="Hola" to="Bonjour" progress={p} width={1280} height={148} style={{position:'absolute',top:250,textAlign:'center',fontFamily:family.serif,fontSize:139,lineHeight:'148px',color:'#f1e9dc',letterSpacing:-5}}/>
    <div style={{position:'absolute',top:433,width:1280,textAlign:'center',fontFamily:family.mono,fontSize:10,letterSpacing:5,color:'#c48269'}}>{p<.5?'ESPAÑOL':'FRANÇAIS'}</div>
    <div style={{position:'absolute',top:518,width:1280,textAlign:'center',fontFamily:family.serif,fontStyle:'italic',fontSize:23,color:'#b5a18a'}}>Speaks, reads and writes in many languages.</div>
  </AbsoluteFill>;
};

const CatEyes:React.FC<{scale:number;center:[number,number];dark?:boolean;tilt?:number;blink?:number;corner?:number;color?:string}>=({scale,center,dark=false,tilt=0,blink=1,corner=5,color})=><div style={{position:'absolute',left:center[0],top:center[1],transform:`translate(-50%,-50%) scale(${scale})`,display:'flex',gap:30,filter:'blur(0px)'}}>{[-1,1].map(k=><div key={k} style={{width:16,height:38,borderRadius:dark?corner:4,background:color??(dark?'#050905':'#22d94e'),boxShadow:dark?'none':'0 0 12px #22d94e',transform:`perspective(180px) rotateY(${k*tilt}deg) scaleY(${blink})`}}/>)}</div>;
const HalftoneRings:React.FC<{t:number;opacity:number}>=({t,opacity})=>{
  const phase=(t-20.8)*68;
  return <svg width="1280" height="720" style={{position:'absolute',inset:0,opacity}}>
    <defs><pattern id="halftone" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.8" fill="#fff"/></pattern><mask id="dots"><rect width="1280" height="720" fill="url(#halftone)"/></mask></defs>
    <g mask="url(#dots)">{Array.from({length:18},(_,i)=>{const r=34+i*47+(phase%47);return <circle key={i} cx="930" cy="360" r={r} stroke="#27d751" strokeWidth={9+9*hash(i)} fill="none" opacity={.7+.3*hash(i+10)} transform={`rotate(${i*4+t*7} 930 360)`} strokeDasharray={`${160+40*i} ${4+8*i}`}/>;})}</g>
  </svg>;
};
export const LongCatStudy:React.FC=()=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const ready=useStudyFonts();if(!ready)return null;const t=20.8+frame/fps;
  const collapse=smooth(t,21.3,21.4);const iris=ramp(t,21.36,21.533);const radius=interpolate(t,[21.36,21.4,21.433,21.467,21.5,21.533],[25,50,105,192,432,810],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});const eyesScale=1+ease(t,21.38,21.52)*8;
  return <AbsoluteFill style={{background:'#020402',overflow:'hidden'}}>
    <HalftoneRings t={t} opacity={1-collapse}/>
    <div style={{position:'absolute',left:90,top:277,fontFamily:family.sans,fontWeight:900,fontSize:66,lineHeight:1,letterSpacing:-3,color:'#f5f5f5',opacity:1-collapse,filter:`blur(${collapse*10}px)`}}>Long-horizon.<br/>Multimodal.<br/><span style={{color:'#27d751'}}>Agentic.</span></div>
    <div style={{opacity:1-collapse}}><CatEyes scale={1} center={[930,360]}/></div>
    <div style={{opacity:ease(t,21.32,21.37)}}><ObjectIris progress={(radius-2)/808} center={[640,360]} maxRadius={810} color="radial-gradient(ellipse,#fff 62%,#e4e5e2)"/></div>
    <div style={{opacity:ease(t,21.32,21.42)}}><CatEyes scale={eyesScale} center={[640,360]} dark color={interpolateColors(t,[21.36,21.54],['#27d751','#050905'])} tilt={ease(t,21.5,21.8)*20} corner={5*(1-ease(t,21.6,21.8))} blink={1-.97*(smooth(t,21.95,22.0)-smooth(t,22.0,22.08))}/></div>
    <svg width="1280" height="720" style={{position:'absolute',inset:0,opacity:.04}}><path d="M48 0V720 M1232 0V720 M0 360H1280" stroke={iris>.8?'#000':'#fff'} strokeWidth="1"/></svg>
  </AbsoluteFill>;
};
