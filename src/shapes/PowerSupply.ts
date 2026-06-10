// 电源器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const PowerSupply = (joint.shapes.standard.Rectangle as any).extend({
  defaults(): Record<string, any> {
    return {
      ...(joint.shapes.standard.Rectangle.prototype as any).defaults(),
      type: 'circuit.PowerSupply',
      size: { width: 70, height: 70 },
      attrs: {
        body: {
          fill: '#1a1a3e',
          stroke: '#00d9ff',
          strokeWidth: 2.5,
          rx: 35,
          ry: 35,
        },
        label: {
          text: 'VCC',
          fill: '#00d9ff',
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: "'JetBrains Mono', monospace",
        },
        // 电源符号 (圆形+正号)
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
    };
  },

  markup: [
    {
      tagName: 'circle',
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

// 工厂函数：创建新的电源实例
export function createPowerSupply(x = 500, y = 150) {
  return new PowerSupply({
    position: { x, y },
    attrs: {
      label: { text: `VCC` },
    },
  });
}
