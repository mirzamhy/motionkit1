import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import {resolve} from 'node:path';
import {mkdirSync,writeFileSync,readFileSync,existsSync,statSync} from 'node:fs';
const root=process.cwd();const revision=process.argv.includes('--v2')?'v2':'v1';const selected=process.argv.slice(2).filter(a=>!a.startsWith('--'));const out=resolve(root,`projects/style-concepts-01/${revision==='v2'?'frames-v2':'frames'}`);mkdirSync(out,{recursive:true});
const manifestPath=resolve(root,`projects/style-concepts-01/preview-manifest${revision==='v2'?'-v2':''}.json`);
const serveUrl=await bundle({entryPoint:resolve(root,`packages/core/src/concepts/${revision==='v2'?'index-v2':'index'}.tsx`)});
const browser=await openBrowser('chrome');
const studies=[{id:'BooksConcept',name:'books',title:'Satu Bab Lagi',times:[1.1,4.5,8.0,12.1,15.6,18.8],transition:[6.17,6.3,6.4,6.55,6.75],captions:['Scroll terus?','Berhenti sebentar.','Buka satu buku.','Satu bab.','Satu ide baru.','Satu bab lagi.']},{id:'CoffeeConcept',name:'coffee',title:'Perjalanan Secangkir Kopi',times:[2,8,14,20,26,33],transition:[11.7,11.9,12.05,12.25,12.6],captions:['Perjalanan secangkir kopi.','Berawal dari biji.','Panas membentuk karakter.','Digiling. Membuka aroma.','Air menemukan rasa.','Secangkir. Banyak perjalanan.']},{id:'SignalConcept',name:'signal',title:'Sinyal dari Jauh',times:[1.5,5.5,9.5,13.5,17.5,22],transition:[7.8,7.9,8.0,8.12,8.35],captions:['Satu sinyal.','Dari jauh.','Menembus ruang.','Temukan arah.','Sebuah tujuan.','Sinyal diterima.']}];
if(revision==='v2'){const captions=JSON.parse(readFileSync(resolve(root,'references/concepts/preview-captions-v2.json'),'utf8'));for(const s of studies)s.captions=captions[s.name];}
writeFileSync(manifestPath,JSON.stringify(studies,null,2));
try{
 for(const s of studies){
  if(selected.length&&!selected.includes(s.name))continue;
  const composition=await selectComposition({serveUrl,id:s.id,browserInstance:browser});
  const jobs=[...s.times.map((t,i)=>({t,file:`${s.name}-${i+1}.png`})),...s.transition.map((t,i)=>({t,file:`${s.name}-transition-${i+1}.png`}))];
  for(let i=0;i<jobs.length;i+=3){await Promise.all(jobs.slice(i,i+3).map(async j=>{const output=resolve(out,j.file);if(!process.argv.includes('--force')&&existsSync(output)&&statSync(output).size>1000)return;console.log(`frame ${s.name} ${j.t}`);await renderStill({serveUrl,composition,browserInstance:browser,frame:Math.round(j.t*60),output});}));}
  console.log(`stills ready ${s.name}`);
 }
 writeFileSync(manifestPath,JSON.stringify(studies,null,2));
}catch(err){console.error('PREVIEW FAILED',err);process.exitCode=1;}finally{await browser.close({silent:true});}
