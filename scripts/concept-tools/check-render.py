import json,subprocess,re,math,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[2]/'projects'/'style-concepts-01';out=root/'out-v2'
films=[('books','satu-bab-lagi-v2',20,1200,[1.1,4.5,8,12.1,15.6,18.8],[3.2,6.4,10.4,14.4,17.6]),('coffee','perjalanan-secangkir-kopi-v2',36,2160,[2,8,14,20,26,33],[6,12,18,24,30]),('signal','sinyal-dari-jauh-v2',25,1500,[1.5,5.5,9.5,13.5,17.5,22],[4,8,12,16,20])]
font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',18);reports={}
for name,slug,seconds,count,times,bounds in films:
    if len(sys.argv)>1 and name not in sys.argv[1:]:continue
    p=out/f'{slug}.mp4';meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in meta['streams'] if s['codec_type']=='video')
    assert int(v['nb_frames'])==count,(name,v['nb_frames'],count)
    assert v['r_frame_rate']=='60/1',(name,v['r_frame_rate'])
    assert abs(float(v['duration'])-seconds)<1/60,(name,v['duration'])
    h=160 if name=='books' else 90
    raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(p),'-vf',f'scale=160:{h}','-f','rawvideo','-pix_fmt','gray','-'])
    a=np.frombuffer(raw,dtype=np.uint8).reshape(-1,h,160).astype(np.float32);delta=np.abs(np.diff(a,axis=0)).mean(axis=(1,2));energy=[round(float(delta[i*60:(i+1)*60].mean()),4) for i in range(seconds)]
    peaks=[]
    for idx in np.argsort(delta)[::-1]:
        t=(int(idx)+1)/60
        if all(abs(t-p['time_s'])>.2 for p in peaks):peaks.append({'time_s':round(t,4),'mean_delta':round(float(delta[idx]),4),'near_scene_boundary':any(abs(t-b)<.65 for b in bounds)})
        if len(peaks)==12:break
    tail=2 if name=='books' else 3
    reports[name]={'file':p.name,'width':v['width'],'height':v['height'],'fps':60,'frames':len(a),'duration_s':seconds,'audio':any(s['codec_type']=='audio' for s in meta['streams']),'mean_luma_change_per_second':energy,'closing_hold_seconds':tail,'slow_seconds_below_0_25':[i for i,e in enumerate(energy[:-tail]) if e<.25],'dark_frames':np.where(a.mean(axis=(1,2))<.5)[0].tolist(),'largest_frame_changes':sorted(peaks,key=lambda p:p['time_s'])}
    # Extract from encoded MP4, rather than reusing the approved PNG previews.
    cols=3 if name=='books' else 2;cw=400 if name=='books' else 640;ch=cw if name=='books' else 360;sheet=Image.new('RGB',(cols*cw,3*(ch+32) if cols==2 else 2*(ch+32)),'#181919');d=ImageDraw.Draw(sheet)
    import io
    for i,t in enumerate(times):
        b=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),'-i',str(p),'-frames:v','1','-vf',f'scale={cw}:{ch}','-f','image2pipe','-vcodec','png','-']);im=Image.open(io.BytesIO(b));x=i%cols*cw;y=i//cols*(ch+32);sheet.paste(im,(x,y+32));d.text((x+9,y+7),f'{t:.1f}s / MP4',font=font,fill='white')
    sheet.save(out/f'{name}-render-review.jpg',quality=94)
    print(name,json.dumps(reports[name]))
(out/('verification-'+sys.argv[1]+'.json' if len(sys.argv)>1 else 'verification.json')).write_text(json.dumps(reports,indent=2),encoding='utf8')
