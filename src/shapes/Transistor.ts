// NPN三极管器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Transistor = (joint.shapes.standard.Rectangle as any).extend({
  defaults(): Record<string, any> {
    return {
      ...(joint.shapes.standard.Rectangle.prototype as any).defaults(),
      type: 'circuit.Transistor',
      size: { width: 90, height: 80 },
      attrs: {
        body: {
          fill: '#1a1a3e',
          stroke: '#ffd93d',
          strokeWidth: 2.5,
          rx: 4,
          ry: 4,
        },
        label: {
          text: 'Q1',
          fill: '#ffd93d',
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: "'JetBrains Mono', monospace",
        },
        // 三极管符号 (NPN)
        symbol: {
          d: 'M35,65 L35,25 L60,15 M35,45 L58,38 M35,45 L58,52 M54,11 L54,19 L63,15 Z',
          stroke: '#ffd93d',
          strokeWidth: 2.5,
          fill: 'none',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      },
      ports: {
        groups: basePortGroups,
        items: [
          { id: 'base', group: 'in', attrs: { portLabel: { text: 'B' } } },
          { id: 'collector', group: 'top', attrs: { portLabel: { text: 'C' } } },
          { id: 'emitter', group: 'bottom', attrs: { portLabel: { text: 'E' } } },
        ],
      },
    };
  },

  markup: [
    {
      tagName: 'rect',
      selector: 'body',
    },
    {
      tagName: 'path',
      selector: 'symbol',
    },
    {
      tagName: 'text',
      selector: 'label',
    },
  ],
});

// 工厂函数：创建新的三极管实例
export function createTransistor(x = 300, y = 250) {
  return new Transistor({
    position: { x, y },
    attrs: {
      label: { text: `Q${Math.floor(Math.random() * 100)}` },
    },
  });
}
