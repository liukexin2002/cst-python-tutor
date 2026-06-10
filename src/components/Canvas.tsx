import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as joint from 'jointjs';
import { registerCircuitShapes, CircuitLink } from '../shapes/index';
import { getPaperConfig } from '../config/paperConfig';
import { shapeConstructors } from '../config/stencilConfig';
import { useEditorStore } from '../stores/useEditorStore';
import { snapToGrid } from '../utils/helpers';

export interface CanvasHandle {
  getGraph: () => joint.dia.Graph | null;
  getPaper: () => joint.dia.Paper | null;
  clearCanvas: () => void;
  exportToJSON: () => string;
  importFromJSON: (json: string) => void;
}

const Canvas = forwardRef<CanvasHandle>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<joint.dia.Graph | null>(null);
  const paperRef = useRef<joint.dia.Paper | null>(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getGraph: () => graphRef.current,
    getPaper: () => paperRef.current,
    clearCanvas: () => {
      if (graphRef.current) {
        graphRef.current.clear();
        useEditorStore.getState().pushHistory('clear', {});
      }
    },
    exportToJSON: () => {
      if (graphRef.current) {
        return JSON.stringify(graphRef.current.toJSON(), null, 2);
      }
      return '{}';
    },
    importFromJSON: (json: string) => {
      if (graphRef.current && paperRef.current) {
        try {
          const data = JSON.parse(json);
          graphRef.current.fromJSON(data);
          useEditorStore.getState().pushHistory('import', data);
        } catch (e) {
          console.error('Import failed:', e);
        }
      }
    },
  }));

  // 初始化JointJS
  useEffect(() => {
    if (!containerRef.current) return;

    // 注册自定义Shape
    registerCircuitShapes();

    // 创建Graph数据模型
    const graph = new joint.dia.Graph();
    graphRef.current = graph;

    // 获取Paper配置
    const config = getPaperConfig();

    // 创建Paper视图
    const paper = new joint.dia.Paper({
      el: containerRef.current,
      model: graph,
      width: '100%',
      height: '100%',
      gridSize: config.gridSize,
      drawGrid: true,
      async: config.async,
      sorting: config.sorting,

      // 连线配置
      defaultLink: () => new (CircuitLink as any)(),
      linkPinning: config.linkPinning,
      defaultConnectionPoint: config.defaultConnectionPoint,

      // 吸附配置
      snapLinks: config.snapLinks,

      // 路由配置 - Manhattan避障路由
      defaultRouter: config.defaultRouter,
      defaultConnector: config.defaultConnector,

      // 交互配置
      interactive: config.interactive,

      // 验证函数
      validateConnection: config.validateConnection,
      validateMagnet: config.validateMagnet,

      // 背景颜色
      background: { color: '#0a0a18' },
    });

    paperRef.current = paper;

    // ========== 事件绑定 ==========

    // 元素选中事件
    paper.on('element:pointerclick', (elementView: any) => {
      const element = elementView.model;
      useEditorStore.getState().selectCell(element.id, 'element');

      // 高亮选中的元素
      paper.removeTools();
      elementView.highlight();
    });

    // 空白区域点击 - 取消选择
    paper.on('blank:pointerclick', () => {
      useEditorStore.getState().selectCell(null);

      // 移除所有高亮
      const cells = graph.getElements();
      cells.forEach((cell: any) => {
        const view = paper.findViewByModel(cell);
        if (view) (view as any).unhighlight();
      });
    });

    // 连线点击事件
    paper.on('link:pointerclick', (linkView: any) => {
      const link = linkView.model;
      useEditorStore.getState().selectCell(link.id, 'link');
    });

    // 元素移动事件 - 应用网格吸附
    paper.on('element:pointermove', (elementView: any, _evt: any) => {
      const element = elementView.model;
      const position = element.position();

      // 吸附到网格
      const snapped = snapToGrid(position.x, position.y, config.gridSize!);
      element.position(snapped.x, snapped.y, { silent: true });
    });

    // 元素放置完成事件
    paper.on('element:pointerup', (elementView: any) => {
      const element = elementView.model;
      const position = element.position();

      // 最终吸附
      const snapped = snapToGrid(position.x, position.y, config.gridSize!);
      element.position(snapped.x, snapped.y);

      // 记录历史
      useEditorStore.getState().pushHistory('move', {
        id: element.id,
        position: snapped,
      });
    });

    // 端口连接验证（实时反馈）
    paper.on('port:mouseenter', (portView: any) => {
      portView.highlight();
    });

    paper.on('port:mouseleave', (portView: any) => {
      portView.unhighlight();
    });

    // 连接建立事件
    paper.on('link:connect', (linkView: any, _evt: any, _sourceView: any, sourceMagnet: any, targetMagnet: any) => {
      console.log('Link connected:', {
        sourceId: sourceMagnet?.parentElement?.closest('.joint-cell')?.getAttribute('data-id'),
        targetId: targetMagnet?.parentElement?.closest('.joint-cell')?.getAttribute('data-id'),
      });
    });

    // 处理外部拖放（从Stencil拖入）- 使用translate替代startBatch/stopBatch
    paper.on('blank:pointerdown', (evt: MouseEvent) => {
      let startX = evt.clientX;
      let startY = evt.clientY;

      const onMouseMove = (moveEvt: MouseEvent) => {
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;
        paper.translate(dx, dy);
        startX = moveEvt.clientX;
        startY = moveEvt.clientY;
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // ========== 外部拖放处理（从Stencil拖入器件）==========
    // 注意：必须在捕获阶段监听，因为JointJS Paper会拦截冒泡阶段的drop事件

    // dragover - 必须阻止默认行为才能触发drop
    containerRef.current.addEventListener(
      'dragover',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'copy';
        }
      },
      false
    );

    // dragleave - 可选：添加视觉反馈
    containerRef.current.addEventListener('dragleave', (e: DragEvent) => {
      // 只有当离开容器边界时才处理
      const relatedTarget = e.relatedTarget as Node | null;
      if (relatedTarget && !containerRef.current?.contains(relatedTarget)) {
        containerRef.current!.style.outline = '';
      }
    });

    // dragenter - 添加视觉反馈
    containerRef.current.addEventListener('dragenter', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      containerRef.current!.style.outline = '2px dashed #00d9ff';
      containerRef.current!.style.outlineOffset = '-4px';
    });

    // drop - 核心放置逻辑
    containerRef.current.addEventListener(
      'drop',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 移除视觉反馈
        containerRef.current!.style.outline = '';

        console.log('[Canvas] Drop event triggered!');

        // 获取拖拽数据 - 尝试多种格式
        let componentType = e.dataTransfer?.getData('componentType');
        if (!componentType) {
          // 兜底：尝试 text/plain 格式
          componentType = e.dataTransfer?.getData('text/plain') || '';
        }
        console.log('[Canvas] Component type:', componentType);

        if (!componentType) {
          console.warn('[Canvas] No componentType in dataTransfer');
          return;
        }

        if (!shapeConstructors[componentType]) {
          console.warn('[Canvas] Unknown component type:', componentType);
          return;
        }

        // 解析属性
        let attrs: Record<string, any> = {};
        const attrsStr = e.dataTransfer?.getData('componentAttrs');
        if (attrsStr) {
          try {
            attrs = JSON.parse(attrsStr);
          } catch (err) {
            console.warn('[Canvas] Failed to parse attrs:', err);
          }
        }

        // 计算放置位置（转换为画布本地坐标）
        const rect = containerRef.current!.getBoundingClientRect();
        const clientX = e.clientX || (e as any).pageX || 0;
        const clientY = e.clientY || (e as any).pageY || 0;

        const point = paper.clientToLocalPoint({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });

        console.log('[Canvas] Drop position:', { clientX, clientY, localPoint: point });

        // 网格吸附
        const snapped = snapToGrid(point.x, point.y, config.gridSize!);
        console.log('[Canvas] Snapped position:', snapped);

        // 创建新元件实例
        const ShapeConstructor = shapeConstructors[componentType];
        const newElement = new ShapeConstructor({
          position: { x: snapped.x, y: snapped.y },
          attrs: attrs,
        }) as any;

        console.log('[Canvas] Created element:', newElement.id, newElement.get('type'));

        // 添加到图形模型
        graph.addCell(newElement);

        console.log('[Canvas] Element added to graph, total cells:', graph.getCells().length);

        // 记录历史
        useEditorStore.getState().pushHistory('add', {
          id: newElement.id,
          type: componentType,
          position: snapped,
        });

        // 选中新元素
        useEditorStore.getState().selectCell(newElement.id, 'element');

        // 高亮新添加的元素（延迟一帧确保DOM已渲染）
        requestAnimationFrame(() => {
          const view = paper.findViewByModel(newElement);
          if (view) {
            (view as any).highlight();
            console.log('[Canvas] Element highlighted');
          }
        });
      },
      false
    );

    // 鼠标滚轮缩放
    containerRef.current.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const currentZoom = useEditorStore.getState().zoom;
      const newZoom = Math.max(0.25, Math.min(4, currentZoom + delta));
      useEditorStore.getState().setZoom(newZoom);

      // 以鼠标位置为中心缩放
      const rect = containerRef.current!.getBoundingClientRect();
      const center = paper.clientToLocalPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      paper.scale(newZoom, newZoom);
    });

    // 键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete键删除选中元素
      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target || (e.target as HTMLElement).tagName !== 'INPUT') {
        const selectedId = useEditorStore.getState().selectedCellId;
        if (selectedId) {
          const cell = graph.getCell(selectedId);
          if (cell) {
            cell.remove();
            useEditorStore.getState().pushHistory('delete', { id: selectedId });
            useEditorStore.getState().selectCell(null);
          }
        }
      }

      // Ctrl+Z撤销 / Ctrl+Y重做
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          useEditorStore.getState().undo();
        }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          useEditorStore.getState().redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 清理函数 - 使用$el.remove()替代paper.remove()
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (paperRef.current) {
        const paperEl = containerRef.current;
        if (paperEl) paperEl.innerHTML = '';
        paperRef.current = null;
      }
      if (graphRef.current) {
        graphRef.current = null;
      }
    };
  }, []);

  // 同步zoom状态到paper
  useEffect(() => {
    if (paperRef.current) {
      const zoom = useEditorStore.getState().zoom;
      paperRef.current.scale(zoom, zoom);
    }
  }, [useEditorStore.getState().zoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0a18] relative overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle at center, rgba(15, 52, 96, 0.1) 0%, transparent 70%)',
      }}
    >
      {/* 加载提示（初始状态） */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-0 animate-fade-out">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-gray-500 text-sm">从左侧拖拽器件开始绘制电路</p>
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
