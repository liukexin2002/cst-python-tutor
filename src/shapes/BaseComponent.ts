// 基础电路器件 - 使用JointJS extend API定义公共属性和端口
import * as joint from 'jointjs';

export interface CircuitComponentAttributes {
  label?: string;
  value?: string;
}

// 基础端口配置（所有器件共用）
export const basePortGroups: Record<string, any> = {
  in: {
    position: {
      name: 'left',
      args: { dr: 10, dx: 0, dy: 0 },
    },
    attrs: {
      portBody: {
        magnet: true,
        r: 5,
        fill: '#00d9ff',
        stroke: '#ffffff',
        strokeWidth: 2,
        class: 'port-input',
      },
      portLabel: {
        text: '',
      },
    },
    markup: [
      {
        tagName: 'circle',
        selector: 'portBody',
      },
    ],
    label: {
      position: {
        name: 'left',
        args: { y: 10 },
      },
    },
  },
  out: {
    position: {
      name: 'right',
      args: { dl: 10, dx: 0, dy: 0 },
    },
    attrs: {
      portBody: {
        magnet: true,
        r: 5,
        fill: '#e94560',
        stroke: '#ffffff',
        strokeWidth: 2,
        class: 'port-output',
      },
      portLabel: {
        text: '',
      },
    },
    markup: [
      {
        tagName: 'circle',
        selector: 'portBody',
      },
    ],
    label: {
      position: {
        name: 'right',
        args: { y: 10 },
      },
    },
  },
  top: {
    position: {
      name: 'top',
      args: { dt: 10, dx: 0, dy: 0 },
    },
    attrs: {
      portBody: {
        magnet: true,
        r: 5,
        fill: '#00ff88',
        stroke: '#ffffff',
        strokeWidth: 2,
      },
    },
    markup: [
      {
        tagName: 'circle',
        selector: 'portBody',
      },
    ],
  },
  bottom: {
    position: {
      name: 'bottom',
      args: { db: 10, dx: 0, dy: 0 },
    },
    attrs: {
      portBody: {
        magnet: true,
        r: 5,
        fill: '#ffa500',
        stroke: '#ffffff',
        strokeWidth: 2,
      },
    },
    markup: [
      {
        tagName: 'circle',
        selector: 'portBody',
      },
    ],
  },
};

// 基础属性工厂函数
export function getBaseDefaults(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    type: 'circuit.Base',
    size: { width: 100, height: 60 },
    attrs: {
      body: {
        fill: '#16213e',
        stroke: '#0f3460',
        strokeWidth: 2,
        rx: 6,
        ry: 6,
      },
      label: {
        text: '',
        fill: '#e94560',
        fontSize: 12,
        fontWeight: 'bold',
        refX: '50%',
        refY: '50%',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontFamily: "'JetBrains Mono', monospace",
      },
    },
    ports: {
      groups: basePortGroups,
      items: [],
    },
    ...overrides,
  };
}
