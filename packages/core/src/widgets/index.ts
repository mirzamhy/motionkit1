import type { Widget } from '../spec/schema';
import type { Ctx, WidgetOut } from '../engine/types';
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
  }
};
