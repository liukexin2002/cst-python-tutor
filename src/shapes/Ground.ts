// 接地器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Ground = (joint.shapes.standard.Rectangle as any).extend({
  defaults: {
    type: 'circuit.Ground',
    size: { width: 60, height: 50 },
    attrs: {
      body: {
        fill: 'transparent',
        stroke: 'none',
        strokeWidth: 0,
      },
      label: {
        text: 'GND',
        fill: '#888888',
        fontSize: 11,
        fontWeight: 'normal',
        fontFamily: "'JetBrains Mono', monospace",
        refY: '95%',
      },
      symbol: {
        d: 'M30,5 L30,18 M18,18 L42,18 M22,26 L38,26 M26,34 L34,34',
        stroke: '#888888',
        strokeWidth: 2.5,
        fill: 'none',
        strokeLinecap: 'round',
      },
    },
    ports: {
      groups: basePortGroups,
      items: [{ id: 'input', group: 'top', attrs: { portLabel: { text: '' } } }],
    },
  },

  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'g', selector: 'ports' },       // ← 端口渲染容器
  ],
});

export function createGround(x = 500, y = 350) {
  return new Ground({
    position: { x, y },
    attrs: { label: { text: 'GND' } },
  });
}
