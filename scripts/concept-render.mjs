import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';

const root=process.cwd();
const out=resolve(root,'projects/style-concepts-01/out-v2');
mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:resolve(root,'packages/core/src/concepts/index-v2.tsx')});
const browser=await openBrowser('chrome');
const films=[
  ['BooksConcept','satu-bab-lagi-v2'],
  ['CoffeeConcept','perjalanan-secangkir-kopi-v2'],
  ['SignalConcept','sinyal-dari-jauh-v2'],
];
const result=[];
try{
  const selected=[];
  for(const [id,name] of films){
    if(process.argv.length>2&&!process.argv.slice(2).includes(id))continue;
    selected.push({id,name,composition:await selectComposition({serveUrl,id,browserInstance:browser})});
  }
  await Promise.all(selected.map(async ({id,name,composition})=>{
    let previous=-1;
    const outputLocation=resolve(out,`${name}.mp4`);
    console.log(`START ${name} ${composition.durationInFrames} frames`);
    await renderMedia({
      composition,serveUrl,browserInstance:browser,
      codec:'h264',pixelFormat:'yuv420p',outputLocation,concurrency:2,crf:18,muted:true,
      onProgress:({progress})=>{const bucket=Math.floor(progress*10);if(bucket>previous){previous=bucket;console.log(`${name} ${bucket*10}%`);}},
    });
    result.push({id,file:`${name}.mp4`,width:composition.width,height:composition.height,fps:composition.fps,frames:composition.durationInFrames,duration_s:composition.durationInFrames/composition.fps,audio:false});
    console.log(`DONE ${name}`);
  }));
  const manifest=resolve(out,'render-manifest.json');
  const old=existsSync(manifest)?JSON.parse(readFileSync(manifest,'utf8')):[];
  const ids=new Set(result.map(r=>r.id));
  writeFileSync(manifest,JSON.stringify([...old.filter(r=>!ids.has(r.id)),...result],null,2));
}catch(error){console.error('RENDER FAILED',error);process.exitCode=1;}
finally{await browser.close({silent:true});}
