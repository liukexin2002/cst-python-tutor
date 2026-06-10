// 连接点器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Junction = (joint.shapes.standard.Circle as any).extend({
  defaults: {
    type: 'circuit.Junction',
    size: { width: 24, height: 24 },
    attrs: {
      body: {
        fill: '#1a1a3e',
        stroke: '#00d9ff',
        strokeWidth: 2,
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
  },

  markup: [
    { tagName: 'circle', selector: 'body' },
    { tagName: 'circle', selector: 'dot' },
    { tagName: 'g', selector: 'ports' },       // ← 端口渲染容器
  ],
});

export function createJunction(x = 400, y = 200) {
  return new Junction({ position: { x, y } });
}
