// 电源器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const PowerSupply = (joint.shapes.standard.Ellipse as any).extend({
  defaults: {
    type: 'circuit.PowerSupply',
    size: { width: 70, height: 70 },
    attrs: {
      body: {
        fill: '#1a1a3e',
        stroke: '#00d9ff',
        strokeWidth: 2.5,
      },
      label: {
        text: 'VCC',
        fill: '#00d9ff',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: "'JetBrains Mono', monospace",
      },
      symbol: {
        d: 'M27,31 L43,31 M35,23 L35,39',
        stroke: '#00d9ff',
        strokeWidth: 3,
        fill: 'none',
        strokeLinecap: 'round',
      },
    },
    ports: {
      groups: basePortGroups,
      items: [{ id: 'output', group: 'bottom', attrs: { portLabel: { text: '+' } } }],
    },
  },

  markup: [
    { tagName: 'ellipse', selector: 'body' },
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'g', selector: 'ports' },       // ← 端口渲染容器
  ],
});

export function createPowerSupply(x = 500, y = 150) {
  return new PowerSupply({
    position: { x, y },
    attrs: { label: { text: 'VCC' } },
  });
}
