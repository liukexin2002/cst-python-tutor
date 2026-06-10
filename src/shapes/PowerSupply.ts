// 电源器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

const _ellipseDefaults = (joint.shapes.standard.Ellipse as any).prototype.defaults;

export const PowerSupply = (joint.shapes.standard.Ellipse as any).extend({
  defaults: joint.util.deepSupplement(
    {
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
    },
    _ellipseDefaults
  ),

  markup: [
    { tagName: 'ellipse', selector: 'body' },  // 圆形使用 ellipse
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
  ],
});

export function createPowerSupply(x = 500, y = 150) {
  return new PowerSupply({
    position: { x, y },
    attrs: { label: { text: 'VCC' } },
  });
}
