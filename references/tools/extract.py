"""Technical facts + dominant palette for every downloaded reference video.
usage: python -I extract.py <scratch_dir> <out_json>"""
import glob, json, os, subprocess, sys, io
import numpy as np
from PIL import Image

root, out = sys.argv[1], sys.argv[2]

def run(args):
    return subprocess.run(args, capture_output=True, text=True, errors='replace')

def probe(f):
    r = run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
             'stream=width,height,r_frame_rate:format=duration', '-of', 'json', f])
    j = json.loads(r.stdout)
    s = j['streams'][0]
    num, den = s['r_frame_rate'].split('/')
    return float(j['format']['duration']), s['width'], s['height'], round(float(num) / float(den))

def cuts(f):
    r = run(['ffmpeg', '-i', f, '-vf', "scale=320:-2,select='gt(scene,0.3)',showinfo", '-an', '-f', 'null', '-'])
    ts = []
    for line in r.stderr.splitlines():
        if 'pts_time:' in line:
            ts.append(round(float(line.split('pts_time:')[1].split()[0]), 2))
    return ts

def frames(f, dur, n=12):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'fps={n / dur},scale=96:-2', '-f', 'image2pipe',
                        '-vcodec', 'png', '-'], capture_output=True)
    data, imgs, i = r.stdout, [], 0
    sig = b'\x89PNG\r\n\x1a\n'
    parts = data.split(sig)[1:]
    for p in parts:
        try:
            imgs.append(np.asarray(Image.open(io.BytesIO(sig + p)).convert('RGB'), dtype=np.float32))
        except Exception:
            pass
    return imgs

def palette(imgs, k=6):
    px = np.concatenate([im.reshape(-1, 3) for im in imgs])
    rng = np.random.default_rng(0)
    if len(px) > 40000:
        px = px[rng.choice(len(px), 40000, replace=False)]
    c = px[rng.choice(len(px), k, replace=False)]
    for _ in range(20):
        lab = ((px[:, None, :] - c[None]) ** 2).sum(-1).argmin(1)
        c = np.array([px[lab == j].mean(0) if (lab == j).any() else c[j] for j in range(k)])
    share = np.bincount(lab, minlength=k) / len(lab)
    order = share.argsort()[::-1]
    return [{'hex': '#%02X%02X%02X' % tuple(int(v) for v in c[j]), 'share': round(float(share[j]), 3)} for j in order]

def lum(h):
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

res = {}
for f in sorted(glob.glob(os.path.join(root, 'vids*', '*.mp4'))):
    vid = os.path.basename(f)[:-4]
    if vid in res:
        continue
    try:
        dur, w, h, fps = probe(f)
        imgs = frames(f, dur)
        pal = palette(imgs)
        ct = cuts(f)
        mean_l = float(np.mean([im.mean() for im in imgs])) if imgs else 0
        res[vid] = {
            'url': f'https://skillry.dev/ai-videos/opus-5-5/{vid}',
            'duration_s': round(dur, 1), 'width': w, 'height': h, 'fps': fps,
            'aspect': '16:9' if w > h * 1.5 else '9:16' if h > w * 1.5 else '1:1' if abs(w - h) < 40 else ('4:3' if w > h else '3:4'),
            'hard_cuts': len(ct), 'cut_times_s': ct,
            'cuts_per_10s': round(len(ct) / dur * 10, 2),
            'ground': 'dark' if mean_l < 70 else 'light' if mean_l > 170 else 'mid',
            'palette': pal,
            'accent': max(pal[:5], key=lambda p: (max(int(p['hex'][i:i + 2], 16) for i in (1, 3, 5)) - min(int(p['hex'][i:i + 2], 16) for i in (1, 3, 5))))['hex'],
        }
        print('ok', vid, flush=True)
    except Exception as e:
        print('ERR', vid, e, flush=True)
json.dump(res, open(out, 'w'), indent=1)
