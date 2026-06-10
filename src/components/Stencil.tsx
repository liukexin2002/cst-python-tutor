import React, { useRef, useCallback, useMemo } from 'react';
import * as joint from 'jointjs';
import { stencilGroups, shapeConstructors } from '../config/stencilConfig';

// 器件图标映射（简化SVG路径表示）
const componentIcons: Record<string, string> = {
  Resistor: '⚡',
  Capacitor: '═',
  Inductor: '〰',
  Diode: '▶',
  Transistor: '◈',
  PowerSupply: '⊕',
  Ground: '⏚',
  Junction: '●',
};

const componentColors: Record<string, string> = {
  Resistor: '#ff9500',
  Capacitor: '#00ff88',
  Inductor: '#bf5fff',
  Diode: '#ff6b6b',
  Transistor: '#ffd93d',
  PowerSupply: '#00d9ff',
  Ground: '#888888',
  Junction: '#00d9ff',
};

interface StencilProps {
  paperRef: React.RefObject<joint.dia.Paper | null>;
}

const Stencil: React.FC<StencilProps> = ({ paperRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragItemRef = useRef<{ type: string; attrs?: any } | null>(null);

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (e: React.DragEvent, type: string, attrs?: any) => {
      console.log('[Stencil] Drag started:', type);

      // 设置拖拽数据 - 使用多种格式确保兼容性
      if (e.dataTransfer) {
        e.dataTransfer.setData('componentType', type);
        e.dataTransfer.setData('componentAttrs', JSON.stringify(attrs || {}));
        e.dataTransfer.setData('text/plain', type); // 兜底格式
        e.dataTransfer.effectAllowed = 'copy';
      }

      // 创建视觉反馈（拖拽时的半透明副本）
      const target = e.currentTarget as HTMLElement;
      const ghost = target.cloneNode(true) as HTMLElement;
      ghost.style.opacity = '0.85';
      ghost.style.transform = 'scale(1.08)';
      ghost.style.width = `${target.offsetWidth}px`;
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px'; // 移出视口
      document.body.appendChild(ghost);

      try {
        if (e.dataTransfer && typeof e.dataTransfer.setDragImage === 'function') {
          e.dataTransfer.setDragImage(ghost, 45, 30);
        }
      } finally {
        // 清理临时DOM
        setTimeout(() => {
          if (document.body.contains(ghost)) {
            document.body.removeChild(ghost);
          }
        }, 100);
      }

      dragItemRef.current = { type, attrs };
    },
    []
  );

  // 渲染器件卡片
  const renderComponentCard = useCallback(
    (type: string, attrs?: any) => {
      const icon = componentIcons[type] || '?';
      const color = componentColors[type] || '#888';

      return (
        <div
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type, attrs)}
          className="group relative flex flex-col items-center justify-center p-3 bg-[#16213e] 
                     border-2 border-[#0f3460] rounded-xl cursor-grab active:cursor-grabbing
                     hover:border-[${color}] hover:bg-[#1a1a3e] hover:shadow-lg
                     hover:shadow-[${color}]/20 transition-all duration-200 select-none
                     hover:-translate-y-0.5"
        >
          {/* 图标区域 */}
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-2
                       bg-[#0f0f23] group-hover:bg-[#0f3460] transition-colors"
            style={{ color }}
          >
            {icon}
          </div>

          {/* 标签 */}
          <span
            className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {type}
          </span>

          {/* 悬停提示 */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#0f0f23] 
                          text-xs text-white rounded opacity-0 group-hover:opacity-100 
                          transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            拖拽到画布
          </div>
        </div>
      );
    },
    [handleDragStart]
  );

  // 渲染分组
  const groups = useMemo(
    () =>
      Object.entries(stencilGroups).map(([key, group]) => (
        <div key={key} className="mb-4">
          {/* 分组标题 */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#00d9ff] to-[#e94560]" />
            <h3
              className="text-sm font-semibold text-gray-300 uppercase tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {group.label}
            </h3>
            <span className="text-xs text-gray-600 ml-auto">{group.items.length}</span>
          </div>

          {/* 器件网格 */}
          <div className="grid grid-cols-2 gap-2 px-2">{group.items.map((item) => renderComponentCard(item.type, item.attrs))}</div>
        </div>
      )),
    [renderComponentCard]
  );

  return (
    <div ref={containerRef} className="w-64 h-full bg-[#0f0f23] border-r border-[#1a1a3e] flex flex-col overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-[#1a1a3e]">
        <h2 className="text-base font-bold text-[#00d9ff] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          器件库
        </h2>
        <p className="text-xs text-gray-500">拖拽器件到画布</p>
      </div>

      {/* 分组列表（可滚动） */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#1a1a3e] scrollbar-track-transparent">
        {groups}
      </div>

      {/* 底部提示 */}
      <div className="p-3 border-t border-[#1a1a3e] bg-[#0a0a18]">
        <div className="text-xs text-gray-600 text-center">
          <kbd className="px-1.5 py-0.5 bg-[#1a1a3e] rounded text-[10px]">Click</kbd> 选择 &nbsp;
          <kbd className="px-1.5 py-0.5 bg-[#1a1a3e] rounded text-[10px]">Drag</kbd> 连线
        </div>
      </div>
    </div>
  );
};

export default Stencil;
