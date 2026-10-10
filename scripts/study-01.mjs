import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync} from 'node:fs';

const root=process.cwd();
const out=resolve(root,'projects/style-study-01/out');
mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:resolve(root,'packages/core/src/studies/index.tsx')});
const clips=[['TechStudy','techhalla',40],['ClaudeStudy','dheepanratnam',120],['ClaudeRollStudy','dheepanratnam-roll',36],['LongCatStudy','leowenai',48]];
for(const [id,name,still] of clips){
  if(process.argv.length>2&&!process.argv.slice(2).includes(id))continue;
  const composition=await selectComposition({serveUrl,id});
  console.log(`render ${name} ${composition.durationInFrames} frames`);
  await renderMedia({composition,serveUrl,codec:'h264',outputLocation:resolve(out,`${name}-remotion.mp4`),concurrency:3,crf:18});
  await renderStill({composition,serveUrl,output:resolve(out,`${name}-still.png`),frame:still});
  console.log(`done ${name}`);
}
