import subprocess,json,sys
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(sys.argv[1]);data=[]
for f in range(641,651):
    raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(f/30),'-i',str(root/'originals'/'leowenai.mp4'),'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'])
    a=np.frombuffer(raw,dtype=np.uint8).reshape(720,1280,3)
    mask=(a.min(axis=2)>220);ys,xs=np.where(mask)
    d={'frame':f,'time':round(f/30,4),'white_share':round(mask.mean().item(),4)}
    if len(xs):d.update(bounds=[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())],centroid=[round(xs.mean(),1),round(ys.mean(),1)])
    data.append(d)
    Image.fromarray(a).save(root/'evidence'/'leowenai'/f'iris-f{f}.jpg',quality=96)
(root/'evidence'/'iris-geometry.json').write_text(json.dumps(data,indent=2),encoding='utf8');print(json.dumps(data))
