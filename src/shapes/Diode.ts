// 二极管器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Diode = (joint.shapes.standard.Rectangle as any).extend({
  defaults: {
    type: 'circuit.Diode',
    size: { width: 80, height: 60 },
    attrs: {
      body: {
        fill: '#1a1a3e',
        stroke: '#ff6b6b',
        strokeWidth: 2.5,
        rx: 4,
        ry: 4,
      },
      label: {
        text: 'D1',
        fill: '#ff6b6b',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: "'JetBrains Mono', monospace",
      },
      // 二极管符号 (三角+竖线)
      symbol: {
        d: 'M15,30 L42,14 L42,46 Z M44,12 L44,48',
        stroke: '#ff6b6b',
        strokeWidth: 2.5,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    },
    ports: {
      groups: basePortGroups,
      items: [
        { id: 'anode', group: 'in', attrs: { portLabel: { text: 'A' } } },
        { id: 'cathode', group: 'out', attrs: { portLabel: { text: 'K' } } },
      ],
    },
  },

  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
  ],
});

export function createDiode(x = 300, y = 100) {
  return new Diode({
    position: { x, y },
    attrs: { label: { text: `D${Math.floor(Math.random() * 100)}` } },
  });
}
