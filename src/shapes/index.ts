// Shape注册入口 - 统一导出所有自定义器件
import { Resistor, createResistor } from './Resistor';
import { Capacitor, createCapacitor } from './Capacitor';
import { Inductor, createInductor } from './Inductor';
import { Diode, createDiode } from './Diode';
import { Transistor, createTransistor } from './Transistor';
import { PowerSupply, createPowerSupply } from './PowerSupply';
import { Ground, createGround } from './Ground';
import { Junction, createJunction } from './Junction';
import * as joint from 'jointjs';

// 器件类型映射表
export const CircuitShapes: Record<string, any> = {
  Resistor,
  Capacitor,
  Inductor,
  Diode,
  Transistor,
  PowerSupply,
  Ground,
  Junction,
};

// 工厂函数映射
export const ShapeFactories: Record<string, any> = {
  Resistor: createResistor,
  Capacitor: createCapacitor,
  Inductor: createInductor,
  Diode: createDiode,
  Transistor: createTransistor,
  PowerSupply: createPowerSupply,
  Ground: createGround,
  Junction: createJunction,
};

// 注册所有自定义Shape到JointJS命名空间
export function registerCircuitShapes() {
  const shapes = joint.shapes as any;
  shapes.circuit = {
    Resistor,
    Capacitor,
    Inductor,
    Diode,
    Transistor,
    PowerSupply,
    Ground,
    Junction,
    Base: null,
  };
}

// 自定义连线样式 - 电路专用Link（使用extend API）
export const CircuitLink = (joint.shapes.standard.Link as any).extend({
  defaults: {
    type: 'circuit.Link',
    attrs: {
      line: {
        stroke: '#00d9ff',
        strokeWidth: 2,
        targetMarker: {
          type: 'path',
          d: 'M 10 -5 L 0 0 L 10 5 z',
          fill: '#00d9ff',
          stroke: '#00d9ff',
          strokeWidth: 1,
        },
      },
    },
    router: { name: 'manhattan' },
    connector: { name: 'rounded' },
  },
});

export default CircuitShapes;
