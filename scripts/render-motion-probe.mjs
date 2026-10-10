import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';
const output=resolve('projects/style-concepts-01/motion-probe');
mkdirSync(output,{recursive:true});
const signal=process.argv.includes('signal');
const id=signal?'SignalMotionProbe':'BooksMotionProbe';
const name=signal?'sinyal-dari-jauh-motion-probe':'satu-bab-lagi-motion-probe';
const serveUrl=await bundle({entryPoint:resolve(`packages/core/src/concepts/${id}.tsx`)});
const browser=await openBrowser('chrome');
try {
  const composition=await selectComposition({serveUrl,id,browserInstance:browser});
  await renderMedia({serveUrl,composition,browserInstance:browser,codec:'h264',muted:true,concurrency:2,crf:18,outputLocation:resolve(output,`${name}.mp4`),onProgress:({progress})=>{if(Math.floor(progress*100)%20===0)process.stdout.write('.');}});
  for(const frame of [55,145,255,350,455])await renderStill({serveUrl,composition,browserInstance:browser,frame,output:resolve(output,`${signal?'signal-':''}frame-${frame}.png`)});
  console.log('\nDONE');
} finally {await browser.close({silent:true});}
