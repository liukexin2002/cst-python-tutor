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
export const CircuitShapes = {
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
export const ShapeFactories = {
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
  };
}

// 连线样式配置（直接使用attrs，不创建自定义类）
// 这样可以避免extend()带来的渲染问题
//
// 重要：joint.shapes.standard.Link 的 JSON markup 只有两个选择器:
//   - 'wrapper': 透明点击区域（宽 stroke，方便交互）
//   - 'line': 可见连线路径 + 箭头标记（通过 targetMarker 定义）
//   standard.Link 没有 'marker-target' 或 'marker-vertex' 选择器！
//   箭头样式必须通过 line.targetMarker 属性设置。
export const circuitLinkAttrs = {
  line: {
    connection: true,           // 必须保留！告诉 JointJS 这是连接线元素
    stroke: '#00d9ff',
    strokeWidth: 2.5,
    strokeLinejoin: 'round',
    fill: 'none',
    targetMarker: {
      'type': 'path',
      'd': 'M 10 -5 L 0 0 L 10 5 z',
      'fill': '#00d9ff',
      'stroke': '#00d9ff',
      'stroke-width': 1,
    },
  },
  wrapper: {
    connection: true,           // 必须保留！告诉 JointJS 这是连接线元素
    'stroke-width': 20,
    stroke: 'transparent',
    fill: 'none',
    'stroke-linecap': 'round',
  },
};

export default CircuitShapes;
