import json, subprocess, sys, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(sys.argv[1]);font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',15)
windows=[('techhalla','exit-decode',2.15,3.1,60,2),('techhalla','thesis-swap',6.2,7.3,60,2),('techhalla','stack-to-code',11.7,12.6,60,3),('dheepanratnam','hook-brand',3.6,4.6,30,1),('dheepanratnam','brand-reasoning',7.5,8.6,30,1),('dheepanratnam','language-roll',44.6,45.2,30,1),('leowenai','intro-brand',5.7,6.4,30,1),('leowenai','ring-see',13.65,14.3,30,1),('leowenai','eye-iris',21.2,22.5,30,1)]
windows += [('techhalla','proof-entry',10.1,11.2,60,4),('techhalla','steal-entry',12.8,13.5,60,3),('techhalla','brand-entry',14.3,15.8,60,5)]
windows += [('dheepanratnam',label,t-.3,t+.4,30,2) for label,t in [('reason-writing',12),('writing-code',16),('code-photo',20),('photo-analysis',24),('analysis-search',28),('search-agents',32),('agents-art',36),('art-verbs',40),('verbs-language',44),('language-values',48),('values-question',52),('question-brand',54)]]
windows += [('leowenai',label,t-.3,t+.4,30,1) for label,t in [('brand-sees',7),('sees-stat',8),('stat-api',9),('api-counter',10),('see-act',15),('act-integrations',17),('integrations-summary',20),('eyes-logo',23)]]
for name,label,start,end,fps,step in windows:
    a=round(start*fps);b=round(end*fps);out=root/'evidence'/name/label;out.mkdir(exist_ok=True)
    vf=f"select='between(n,{a},{b})*not(mod(n-{a},{step}))',scale=240:-1"
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(root/'originals'/f'{name}.mp4'),'-vf',vf,'-fps_mode','vfr',str(out/'f-%03d.jpg')],check=True)
    files=sorted(out.glob('f-*.jpg'));h=Image.open(files[0]).height;cols=8;rows=math.ceil(len(files)/cols)
    sheet=Image.new('RGB',(cols*240,rows*(h+26)),'#17191c');d=ImageDraw.Draw(sheet)
    for i,p in enumerate(files):
        x=i%cols*240;y=i//cols*(h+26);f=a+i*step
        sheet.paste(Image.open(p),(x,y+26));d.text((x+5,y+4),f'f{f} / {f/fps:.3f}s',font=font,fill='white')
    sheet.save(root/'evidence'/name/f'{label}.jpg',quality=95)
    print(name,label,len(files),f'f{a}-f{b}')
(root/'evidence'/'strip-windows.json').write_text(json.dumps(windows,indent=2),encoding='utf8')
