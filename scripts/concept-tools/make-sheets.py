import json,math,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[2]/'projects'/'style-concepts-01'
v2='--v2' in sys.argv
manifest=json.loads((root/('preview-manifest-v2.json' if v2 else 'preview-manifest.json')).read_text())
if v2:
    captions=json.loads((Path(__file__).resolve().parents[2]/'references'/'concepts'/'preview-captions-v2.json').read_text())
    for s in manifest:s['captions']=captions[s['name']]
    (root/'preview-manifest-v2.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
frames=root/('frames-v2' if v2 else 'frames')
title_font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',36)
caption_font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',20)
mono_font=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',17)
out=root/('storyboards-v2' if v2 else 'storyboards');out.mkdir(exist_ok=True)
for s in manifest:
    square=s['name']=='books';cols=3 if square else 2;w=400 if square else 640;h=w if square else 360;bar=65;header=116
    sheet=Image.new('RGB',(cols*w,header+2*(h+bar) if square else header+3*(h+bar)),'#f1eee6');d=ImageDraw.Draw(sheet)
    d.text((18,13),s['title'],font=title_font,fill='#22221f');d.text((20,65),'STORYBOARD / 6 ADEGAN / DRAF VISUAL '+('02' if v2 else '01'),font=mono_font,fill='#6d6a63')
    for i,t in enumerate(s['times']):
        x=i%cols*w;y=header+i//cols*(h+bar)
        im=Image.open(frames/f"{s['name']}-{i+1}.png").resize((w,h),Image.Resampling.LANCZOS);sheet.paste(im,(x,y))
        d.text((x+12,y+h+7),f'{i+1:02d} · {t:.1f} detik · f{round(t*60)}',font=mono_font,fill='#6d6a63')
        d.text((x+12,y+h+30),s['captions'][i],font=caption_font,fill='#22221f')
    sheet.save(out/f"{s['name']}-storyboard.jpg",quality=96)
    w=256;h=256 if square else 144;strip=Image.new('RGB',(w*5,102+h+54),'#f1eee6');d=ImageDraw.Draw(strip)
    d.text((18,12),s['title']+' — transisi',font=title_font,fill='#22221f');d.text((20,60),'URUTAN FRAME / KIRI → KANAN',font=mono_font,fill='#6d6a63')
    for i,t in enumerate(s['transition']):
        im=Image.open(frames/f"{s['name']}-transition-{i+1}.png").resize((w,h),Image.Resampling.LANCZOS);strip.paste(im,(i*w,102));d.text((i*w+12,102+h+10),f'{t:.2f}s / f{round(t*60)}',font=mono_font,fill='#6d6a63')
    strip.save(out/f"{s['name']}-transition.jpg",quality=96)
print('3 storyboards + 3 transition strips ready')
