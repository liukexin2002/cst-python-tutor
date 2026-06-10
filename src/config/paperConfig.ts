// Paper核心配置 - 网格吸附、端口系统、Manhattan路由
import * as joint from 'jointjs';

interface PaperConfigOptions {
  gridSize?: number;
  snapRadius?: number;
  padding?: number;
}

export function getPaperConfig(options: PaperConfigOptions = {}) {
  const {
    gridSize = 10,
    snapRadius = 40,
    padding = 25,
  } = options;

  return {
    // 网格配置
    gridSize,

    // 绘制网格背景
    drawGrid: true,
    gridColor: '#2a2a4a',
    gridThickness: 0.5,

    // 默认连线配置
    defaultLink: () => new (require('./shapes/index').CircuitLink)(),

    // 禁止连线到空白区域（必须连接端口）
    linkPinning: false,

    // 默认连接点：边界连接
    defaultConnectionPoint: { name: 'boundary' },

    // 端口吸附配置
    snapLinks: {
      radius: snapRadius,       // 搜索半径（像素）
      distance: 8,              // 吸附距离阈值
    },

    // 路由器配置 - Manhattan路由实现自动避障
    defaultRouter: {
      name: 'manhattan',        // 曼哈顿路由算法
      args: {
        step: gridSize,         // 步长对齐网格
        maxAllowedDirectionChange: 90,  // 最大转角90度
        padding: { top: padding, right: padding, bottom: padding, left: padding },
        perpendicular: true,     // 允许垂直段
        excludeEnds: ['source', 'target'],
        startDirections: ['top', 'bottom', 'left', 'right'],
        endDirections: ['top', 'bottom', 'left', 'right'],
      },
    },

    // 连接器配置 - 圆角连接
    defaultConnector: {
      name: 'rounded',
      args: { radius: 5 },
    },

    // 交互配置
    interactive: {
      vertexAdd: false,          // 禁用手动添加顶点
      vertexMove: false,         // 禁用手动移动顶点
      arrowheadMove: false,      // 禁止移动箭头
      labelMove: false,          // 禁止移动标签
      linkMove: false,           // 禁止移动连线
      elementMove: true,         // 允许移动元素
      useLinkTools: false,       // 禁用连线工具
    },

    // 验证函数 - 控制哪些端口可以互相连接
    validateConnection: (
      sourceView: joint.dia.CellView,
      magnetView: SVGElement | undefined,
      targetView: joint.dia.CellView,
      _targetMagnet: SVGElement | undefined,
      end: 'source' | 'target'
    ) => {
      // 不允许自连
      if (sourceView === targetView) return false;

      // 不允许连接到空白区域
      if (!magnetView && !_targetMagnet) return false;

      // 允许所有有效端口之间的连接
      return true;
    },

    // 验证是否允许从某个磁体开始连线
    validateMagnet: (
      _cellView: joint.dia.CellView,
      magnet: SVGElement
    ) => {
      // 只允许从端口开始连线（排除body等非端口元素）
      const isPort = magnet.getAttribute('class')?.includes('port') ||
                     magnet.getAttribute('magnet') === 'true';
      return !!isPort;
    },

    // 启用异步渲染以提升性能
    async: true,

    // 排序模式 - 近似排序提升性能
    sorting: joint.dia.Paper.sorting.APPROX,

    // 光标样式
    cursor: 'default',

    // 事件委托优化
    clickThreshold: 5,

    // 移动验证 - 网格吸附
    moveThreshold: gridSize,
  };
}

// 连线高亮配置
export const LinkHighlightConfig = {
  highlighter: {
    name: 'stroke',
    options: {
      padding: 3,
      rx: 5,
      ry: 5,
      attrs: {
        stroke: '#e94560',
        strokeWidth: 3,
        fill: 'none',
      },
    },
  },
};

// 端口高亮配置
export const PortHighlightConfig = {
  highlighter: {
    name: 'className',
    options: {
      className: 'port-highlighted',
    },
  },
};
