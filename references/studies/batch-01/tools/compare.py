import subprocess,json,sys,hashlib,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
root=Path(sys.argv[1]);out=root/'out';font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',18)
clips=[('techhalla','techhalla',5.8,3.6,540,540),('dheepanratnam','dheepanratnam',7.4,2.8,640,360),('dheepanratnam','dheepanratnam-roll',44.6,.8,640,360),('leowenai','leowenai',20.8,2.3,640,360)]
report={}
for source,name,start,duration,w,h in clips:
    ref=out/f'{name}-reference.mp4';rem=out/f'{name}-remotion.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(start),'-i',str(root/'originals'/f'{source}.mp4'),'-t',str(duration),'-vf','fps=60','-c:v','libx264','-crf','18','-c:a','aac',str(ref)],check=True)
    header=Image.new('RGB',(w*2,36),'#17191c');draw=ImageDraw.Draw(header);draw.text((12,8),f'ORIGINAL | {start:.1f}s + t',font=font,fill='white');draw.text((w+12,8),'REMOTION | study recreation',font=font,fill='white');head=out/f'{name}-header.png';header.save(head)
    vf=f'[0:v]scale={w}:{h},setsar=1[a];[1:v]scale={w}:{h},setsar=1[b];[a][b]hstack,pad={w*2}:{h+36}:0:36[base];[base][2:v]overlay=0:0[v]'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(ref),'-i',str(rem),'-i',str(head),'-filter_complex',vf,'-map','[v]','-map','0:a?','-c:v','libx264','-crf','18','-c:a','aac','-shortest',str(out/f'{name}-comparison.mp4')],check=True)
    raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(rem),'-vf','scale=128:128','-f','rawvideo','-pix_fmt','rgb24','-'])
    a=np.frombuffer(raw,dtype=np.uint8).reshape(-1,128,128,3).astype(np.float32);delta=np.abs(np.diff(a,axis=0)).mean(axis=(1,2,3))/255
    peaks=[]
    for i in np.argsort(delta)[::-1]:
        t=(int(i)+1)/60
        if all(abs(t-p['local_s'])>.15 for p in peaks):peaks.append({'local_s':round(t,4),'source_s':round(start+t,4),'mean_delta':round(float(delta[i]),5)})
        if len(peaks)==6:break
    report[name]={'frames':len(a),'fps':60,'duration_s':len(a)/60,'source_range':[start,start+duration],'largest_frame_changes':sorted(peaks,key=lambda p:p['local_s']),'black_frames':np.where(a.mean(axis=(1,2,3))<.5)[0].tolist(),'scan_note':'Frame differences localize activity. These short studies contain intended rapid text/iris changes and intentional holds; slideshow thresholds calibrated on full promo films do not apply.'}
    # Representative states, including transition frames, for review.
    times=[0,.35,.6,.73,.8,.9,1.1,1.25,1.4,1.6,1.8,2.0] if source!='techhalla' else [0,.4,.6,.73,.83,.95,1.1,1.25,1.5,2.0,2.4,3.2]
    times=[t for t in times if t<duration]
    cell_w=320;cell_h=round((h+36)*cell_w/(w*2))
    cols=4;rows=math.ceil(len(times)/cols)
    sheet=Image.new('RGB',(cols*cell_w,rows*(cell_h+25)),'#17191c');d=ImageDraw.Draw(sheet)
    for i,t in enumerate(times):
        raw2=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),'-i',str(out/f'{name}-comparison.mp4'),'-frames:v','1','-vf',f'scale={cell_w}:{cell_h}','-f','image2pipe','-vcodec','png','-'])
        import io
        x=i%cols*cell_w;y=i//cols*(cell_h+25);sheet.paste(Image.open(io.BytesIO(raw2)),(x,y+25));d.text((x+5,y+3),f'source {start+t:.3f}s',font=font,fill='white')
    sheet.save(out/f'{name}-review.jpg',quality=95)
(root/'evidence'/'render-scan.json').write_text(json.dumps(report,indent=2),encoding='utf8')
manifest={'studied_on':'2026-10-10','sources':{}}
for name in ['techhalla','dheepanratnam','leowenai']:
    p=root/'originals'/f'{name}.mp4';manifest['sources'][name]={'file':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(root/'evidence'/'source-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print(json.dumps(report,indent=2))
