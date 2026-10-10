import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(sys.argv[1])
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 16)
results = {}
for name in ['techhalla', 'dheepanratnam', 'leowenai']:
    src = ROOT / 'originals' / f'{name}.mp4'
    out = ROOT / 'evidence' / name
    out.mkdir(parents=True, exist_ok=True)
    meta = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(src)]))
    video = next(s for s in meta['streams'] if s['codec_type']=='video')
    duration = float(meta['format']['duration'])
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-vf','fps=1,scale=280:-1',str(out/'overview-%03d.jpg')],check=True)
    files = sorted(out.glob('overview-*.jpg'))
    for page in range((len(files)+19)//20):
        subset=files[page*20:(page+1)*20]
        h = Image.open(subset[0]).height
        sheet=Image.new('RGB',(5*280,4*(h+28)), '#17191c')
        d=ImageDraw.Draw(sheet)
        for i,p in enumerate(subset):
            x=(i%5)*280;y=(i//5)*(h+28)
            sheet.paste(Image.open(p),(x,y+28))
            d.text((x+6,y+5),f'{name} | {page*20+i+0.5:.1f}s',font=font,fill='white')
        sheet.save(out/f'overview-sheet-{page+1}.jpg',quality=92)
    # A 30 Hz, 128px-wide scan localizes motion; it does not classify the transition.
    raw = subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(src),'-vf','fps=30,scale=128:128','-f','rawvideo','-pix_fmt','rgb24','-'])
    frames=np.frombuffer(raw,dtype=np.uint8).reshape(-1,128,128,3).astype(np.float32)
    delta=np.abs(np.diff(frames,axis=0)).mean(axis=(1,2,3))/255
    candidates=[]
    for idx in np.argsort(delta)[::-1]:
        t=(int(idx)+1)/30
        if all(abs(t-c['time'])>0.6 for c in candidates):
            candidates.append({'time':round(t,3),'mean_delta':round(float(delta[idx]),4)})
        if len(candidates)==18: break
    result={'duration_s':duration,'width':video['width'],'height':video['height'],'fps':video['r_frame_rate'],'frames':video.get('nb_frames'),'audio':any(s['codec_type']=='audio' for s in meta['streams']),'motion_candidates':sorted(candidates,key=lambda c:c['time'])}
    results[name]=result
    print(name,json.dumps(result))
    (out/'metadata.json').write_text(json.dumps(meta,indent=2),encoding='utf8')
(ROOT/'evidence'/'scan.json').write_text(json.dumps(results,indent=2),encoding='utf8')
