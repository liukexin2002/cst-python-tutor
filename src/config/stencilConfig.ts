// Stencil器件库配置 - 分组和器件定义
// 直接从各shape文件导入
import { Resistor as ResistorShape } from '../shapes/Resistor';
import { Capacitor as CapacitorShape } from '../shapes/Capacitor';
import { Inductor as InductorShape } from '../shapes/Inductor';
import { Diode as DiodeShape } from '../shapes/Diode';
import { Transistor as TransistorShape } from '../shapes/Transistor';
import { PowerSupply as PowerSupplyShape } from '../shapes/PowerSupply';
import { Ground as GroundShape } from '../shapes/Ground';
import { Junction as JunctionShape } from '../shapes/Junction';

// Stencil分组配置
export interface StencilGroupConfig {
  [groupName: string]: {
    label: string;
    index: number;
    collapsed?: boolean;  // 默认折叠状态
    items: Array<{
      type: string;
      attrs?: Record<string, any>;
      size?: { width: number; height: number };
    }>;
  };
}

export const stencilGroups: StencilGroupConfig = {
  passive: {
    label: '无源器件',
    index: 1,
    items: [
      {
        type: 'Resistor',
        attrs: { label: { text: 'R' } },
      },
      {
        type: 'Capacitor',
        attrs: { label: { text: 'C' } },
      },
      {
        type: 'Inductor',
        attrs: { label: { text: 'L' } },
      },
    ],
  },
  active: {
    label: '有源器件',
    index: 2,
    items: [
      {
        type: 'Diode',
        attrs: { label: { text: 'D' } },
      },
      {
        type: 'Transistor',
        attrs: { label: { text: 'Q' } },
      },
      {
        type: 'PowerSupply',
        attrs: { label: { text: 'VCC' } },
      },
    ],
  },
  auxiliary: {
    label: '辅助元件',
    index: 3,
    items: [
      {
        type: 'Ground',
        attrs: { label: { text: 'GND' } },
      },
      {
        type: 'Junction',
        attrs: {},
      },
    ],
  },
};

// Shape构造函数映射（用于Stencil动态创建）
export const shapeConstructors: Record<string, any> = {
  Resistor: ResistorShape,
  Capacitor: CapacitorShape,
  Inductor: InductorShape,
  Diode: DiodeShape,
  Transistor: TransistorShape,
  PowerSupply: PowerSupplyShape,
  Ground: GroundShape,
  Junction: JunctionShape,
};
