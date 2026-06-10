// 连接点器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Junction = (joint.shapes.standard.Rectangle as any).extend({
  defaults(): Record<string, any> {
    return {
      ...(joint.shapes.standard.Rectangle.prototype as any).defaults(),
      type: 'circuit.Junction',
      size: { width: 24, height: 24 },
      attrs: {
        body: {
          fill: '#1a1a3e',
          stroke: '#00d9ff',
          strokeWidth: 2,
          rx: 12,
          ry: 12,
        },
        label: {
          text: '',
          fill: 'transparent',
        },
        dot: {
          cx: 12,
          cy: 12,
          r: 6,
          fill: '#00d9ff',
          stroke: '#ffffff',
          strokeWidth: 1.5,
        },
      },
      ports: {
        groups: basePortGroups,
        items: [
          { id: 'left', group: 'in', attrs: { portLabel: { text: '' } } },
          { id: 'right', group: 'out', attrs: { portLabel: { text: '' } } },
          { id: 'top', group: 'top', attrs: { portLabel: { text: '' } } },
          { id: 'bottom', group: 'bottom', attrs: { portLabel: { text: '' } } },
        ],
      },
    };
  },

  markup: [
    {
      tagName: 'circle',
      selector: 'body',
    },
    {
      tagName: 'circle',
      selector: 'dot',
    },
  ],
});

// 工厂函数：创建新的连接点实例
export function createJunction(x = 400, y = 200) {
  return new Junction({
    position: { x, y },
  });
}
