// 电容器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

const _rectDefaults = (joint.shapes.standard.Rectangle as any).prototype.defaults;

export const Capacitor = (joint.shapes.standard.Rectangle as any).extend({
  defaults: joint.util.deepSupplement(
    {
      type: 'circuit.Capacitor',
      size: { width: 80, height: 60 },
      attrs: {
        body: {
          fill: '#1a1a3e',
          stroke: '#00ff88',
          strokeWidth: 2.5,
          rx: 4,
          ry: 4,
        },
        label: {
          text: 'C1',
          fill: '#00ff88',
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: "'JetBrains Mono', monospace",
        },
        // 电容符号 (两块平行板)
        symbol: {
          d: 'M20,20 L40,20 M40,12 L40,28 M48,12 L48,28 M48,20 L68,20 M20,40 L40,40 M40,32 L40,48 M48,32 L48,48 M48,40 L68,40',
          stroke: '#00ff88',
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
    _rectDefaults
  ),

  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
  ],
});

export function createCapacitor(x = 100, y = 200) {
  return new Capacitor({
    position: { x, y },
    attrs: { label: { text: `C${Math.floor(Math.random() * 100)}` } },
  });
}
