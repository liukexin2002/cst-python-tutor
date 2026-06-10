// 电阻器件
import { basePortGroups } from './BaseComponent';
import * as joint from 'jointjs';

export const Resistor = (joint.shapes.standard.Rectangle as any).extend({
  defaults: {
    type: 'circuit.Resistor',
    size: { width: 90, height: 50 },
    attrs: {
      body: {
        fill: '#1a1a3e',
        stroke: '#ff9500',
        strokeWidth: 2.5,
        rx: 4,
        ry: 4,
      },
      label: {
        text: 'R1',
        fill: '#ff9500',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: "'JetBrains Mono', monospace",
      },
      // 电阻符号 (锯齿线)
      symbol: {
        d: 'M15,25 L30,25 L35,15 L45,35 L55,15 L65,35 L70,25 L85,25',
        stroke: '#ffb347',
        strokeWidth: 2.5,
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
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

  // ⚠️ 关键：必须包含 <g class="ports"> 才能渲染端口！
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'path', selector: 'symbol' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'g', selector: 'ports' },       // ← 端口渲染容器
  ],
});

export function createResistor(x = 100, y = 100) {
  return new Resistor({
    position: { x, y },
    attrs: { label: { text: `R${Math.floor(Math.random() * 100)}` } },
  });
}
