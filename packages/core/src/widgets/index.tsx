import type { Widget } from '../spec/schema';
import React from 'react';
import type { Ctx, WidgetOut } from '../engine/types';
import { archiveWidget } from '../archive/renderers';
import { paperPal } from '../engines/Archive';
import { agents, lockup } from './agents';
import { code, stat, vision } from './cards';
import { hero } from './hero';
import { price } from './price';
import { integrations, leaderboard, notify, prompt, ring } from './product';
import { bars, chat, checklist, dots, headline, rotate, takeover, versus } from './text';

export const buildWidget = (w: Widget, ctx: Ctx): WidgetOut => {
  switch (w.type) {
    case 'hero':
      return hero(w, ctx);
    case 'stat':
      return stat(w, ctx);
    case 'vision':
      return vision(w, ctx);
    case 'code':
      return code(w, ctx);
    case 'price':
      return price(w, ctx);
    case 'agents':
      return agents(w, ctx);
    case 'lockup':
      return lockup(w, ctx);
    case 'headline':
      return headline(w, ctx);
    case 'chat':
      return chat(w, ctx);
    case 'bars':
      return bars(w, ctx);
    case 'checklist':
      return checklist(w, ctx);
    case 'takeover':
      return takeover(w, ctx);
    case 'versus':
      return versus(w, ctx);
    case 'dots':
      return dots(w, ctx);
    case 'rotate':
      return rotate(w, ctx);
    case 'leaderboard':
      return leaderboard(w, ctx);
    case 'notify':
      return notify(w, ctx);
    case 'prompt':
      return prompt(w, ctx);
    case 'integrations':
      return integrations(w, ctx);
    case 'ring':
      return ring(w, ctx);
    case 'document':
    case 'newspaper':
    case 'cutout':
    case 'receipt': {
      // documentary widgets sit on a paper card in the card engines
      const [cw, ch] = ctx.P ? [940, 1240] : [1240, 760];
      const pad = ctx.P ? 60 : 64;
      const out = archiveWidget(w, { ...ctx, pal: paperPal(ctx.look.hot), box: { x: pad, y: pad, w: cw - pad * 2, h: ch - pad * 2 }, fw: cw, fh: ch })!;
      const node = (t: number) => <div data-card="1" style={{ position: 'relative', width: cw, height: ch, background: '#EFE6D3', borderRadius: 6, boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6)', overflow: 'hidden' }}>{out.node(t)}</div>;
      return { layers: [{ key: 'paper', dx: 0, dy: 0, w: cw, h: ch, node }], hits: out.hits, sfx: out.sfx };
    }
  }
};
