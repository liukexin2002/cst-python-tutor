// 电感器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Inductor = (joint.shapes.standard.Rectangle as any).extend({
  defaults: {
    type: 'circuit.Inductor',
    size: { width: 100, height: 50 },
    attrs: {
      body: {
        fill: '#1a1a3e',
        stroke: '#bf5fff',
        strokeWidth: 2.5,
        rx: 4,
        ry: 4,
      },
      label: {
        text: 'L1',
        fill: '#bf5fff',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: "'JetBrains Mono', monospace",
      },
      // 电感符号 (线圈)
      symbol: {
        d: 'M12,25 Q22,10 32,25 Q42,40 52,25 Q62,10 72,25 Q82,40 92,25',
        stroke: '#bf5fff',
        strokeWidth: 2.5,
        fill: 'none',
        strokeLinecap: 'round',
      },
    },
    ports: {
      groups: basePortGroups,
      items: [
        { id: 'in', group: 'in', attrs: { portLabel: { text: '' } } },
        { id: 'out', group: 'out', attrs: { portLabel: { text: '' } } },
      ],
    },
  },

  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
  ],
});

export function createInductor(x = 100, y = 300) {
  return new Inductor({
    position: { x, y },
    attrs: { label: { text: `L${Math.floor(Math.random() * 100)}` } },
  });
}
