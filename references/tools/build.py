"""Merge tech.json + labels into docs/style-catalog.json and docs/style-catalog.md.
usage: python build.py <tech.json> <docs_dir>"""
import json, sys, os, collections
from labels import L

tech = json.load(open(sys.argv[1]))
docs = sys.argv[2]
missing = sorted(set(tech) - set(L))
extra = sorted(set(L) - set(tech))
if missing or extra:
    print('missing labels:', missing, 'labels without video:', extra)

cat = {}
for vid, t in sorted(tech.items()):
    typ, theme, trans, notes, conf = L.get(vid, ('?', '?', '?', '', 'none'))
    cat[vid] = {'type': typ, 'theme': theme, 'transition': trans, 'notes': notes, 'label_confidence': conf, **t}

json.dump({'source': 'skillry.dev/ai-videos/opus-5-5 (originals), studied Oct 2026',
           'fields': {'hard_cuts': "ffmpeg scene>0.3 on 320px; soft transitions are not counted",
                      'palette': 'k-means k=6 over 12 frames, sorted by share',
                      'accent': 'most saturated of the top-5 palette colours',
                      'ground': 'mean luminance of sampled frames: dark <70, light >170',
                      'label_confidence': 'high = studied frame-by-frame / many frames; low = 6-frame strip only'},
           'videos': cat}, open(os.path.join(docs, 'style-catalog.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

def sw(h):
    return f'`{h}`'

out = ['# Style catalog', '',
       f'{len(cat)} Opus 5.5 videos from skillry.dev. Machine data: duration, size, fps, hard cuts, palette. '
       'Human labels: type, theme, main transition, notes. Raw data: [style-catalog.json](style-catalog.json). '
       'Narrative findings: [style-research.md](style-research.md).', '']
by = collections.Counter(v['type'] for v in cat.values())
out += ['## Counts', '', '| type | videos |', '|---|---|'] + [f'| {k} | {n} |' for k, n in by.most_common()] + ['']
th = collections.Counter(v['theme'] for v in cat.values())
out += ['| theme | videos |', '|---|---|'] + [f'| {k} | {n} |' for k, n in th.most_common()] + ['']
order = ['launch', 'kinetic', 'explainer', 'data', 'brand', 'story', 'art', '3d', '?']
for typ in order:
    rows = [(k, v) for k, v in cat.items() if v['type'] == typ]
    if not rows:
        continue
    out += [f'## {typ} ({len(rows)})', '',
            '| video | theme | transition | sec | aspect | cuts | ground | palette (top 4) | accent | notes |',
            '|---|---|---|---|---|---|---|---|---|---|']
    for k, v in sorted(rows, key=lambda r: r[1]['theme']):
        pal = ' '.join(sw(p['hex']) for p in v['palette'][:4])
        conf = '' if v['label_confidence'] == 'high' else ' ·'
        out.append(f"| [{k}]({v['url']}){conf} | {v['theme']} | {v['transition']} | {v['duration_s']} | {v['aspect']} | "
                   f"{v['hard_cuts']} | {v['ground']} | {pal} | {sw(v['accent'])} | {v['notes'].replace('|', '/')} |")
    out.append('')
out.append('`·` after a name = label from a 6-frame strip only (lower confidence).')
open(os.path.join(docs, 'style-catalog.md'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('written', len(cat))
