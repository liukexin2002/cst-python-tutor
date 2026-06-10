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

// 自定义连线样式 - 电路专用Link
// ⚠️ 不定义markup！使用JointJS默认的Link markup（包含 .connection-wrap/.connection 等）
// 只通过 defaults.attrs 覆盖样式
export const CircuitLink = (joint.shapes.standard.Link as any).extend({
  defaults: {
    type: 'circuit.Link',
    // 仅覆盖连线视觉属性，不触碰markup
    attrs: {
      '.connection': {
        stroke: '#00d9ff',
        strokeWidth: 2.5,
        strokeLinejoin: 'round',
      },
      '.marker-target': {
        fill: '#00d9ff',
        stroke: '#00d9ff',
        d: 'M 10 -5 L 0 0 L 10 5 z',
        strokeWidth: 1,
      },
      '.marker-vertex': {
        r: 0,   // 隐藏顶点
      },
      '.connection-wrap': {
        'stroke-width': 20,  // 增大交互区域
        stroke: 'transparent',
      },
    },
    // router/connector由Paper配置统一管理
    z: -1,
  },
});

export default CircuitShapes;
