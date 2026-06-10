import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as joint from 'jointjs';
import { registerCircuitShapes, CircuitLink } from '../shapes/index';
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

const GRID_SIZE = 10;

const Canvas = forwardRef<CanvasHandle>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<joint.dia.Graph | null>(null);
  const paperRef = useRef<joint.dia.Paper | null>(null);

  // 是否正在拖拽连线（用于区分平移和连线）
  const isLinkingRef = useRef(false);

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

    // 创建Paper视图 - 核心配置
    const paper = new joint.dia.Paper({
      el: containerRef.current,
      model: graph,
      width: '100%',
      height: '100%',
      gridSize: GRID_SIZE,
      drawGrid: true,

      // ========== 连线配置 ==========
      defaultLink: () => new (CircuitLink as any)(),
      linkPinning: false,              // 禁止连线到空白区域

      // ========== 连接点配置 ==========
      defaultConnectionPoint: { name: 'boundary' },

      // ========== 端口吸附配置 ==========
      snapLinks: {
        radius: 40,                   // 吸附搜索半径
      },

      // ========== 路由配置 - Manhattan棋盘避障路由 ==========
      defaultRouter: {
        name: 'manhattan',
        args: {
          step: GRID_SIZE,            // 步长对齐网格（关键！）
          maxAllowedDirectionChange: 90,
          padding: 20,
          perpendicular: true,
          excludeEnds: ['source', 'target'],
          startDirections: ['top', 'bottom', 'left', 'right'],
          endDirections: ['top', 'bottom', 'left', 'right'],
        },
      },

      // ========== 连接器配置 ==========
      defaultConnector: {
        name: 'rounded',
        args: { radius: 5 },
      },

      // ========== 交互配置 ==========
      interactive: {
        vertexAdd: false,
        vertexMove: false,
        arrowheadMove: false,
        labelMove: false,
        linkMove: false,
        elementMove: true,
        useLinkTools: false,
      },

      // ========== 连接验证 ==========
      validateConnection: (
        sourceView: any,
        _sourceMagnet: any,
        targetView: any,
        _targetMagnet: any,
        end: string
      ) => {
        // 不允许自连
        if (sourceView === targetView) return false;

        // 必须连接到端口
        if (!_sourceMagnet || !_targetMagnet) return false;

        return true;
      },

      // 简化验证：允许所有magnet开始连线
      validateMagnet: (_cellView: any, magnet: SVGElement) => {
        // 只要有magnet属性就允许
        return !!magnet && magnet.getAttribute('magnet') !== null;
      },

      // 性能优化
      async: true,
      sorting: joint.dia.Paper.sorting.APPROX,

      // 背景颜色
      background: { color: '#0a0a18' },
    });

    paperRef.current = paper;

    // ============================================================
    //                    事件绑定系统
    // ============================================================

    // ---------- 元素选中 ----------
    paper.on('element:pointerclick', (elementView: any) => {
      useEditorStore.getState().selectCell(elementView.model.id, 'element');
      elementView.highlight();
    });

    // ---------- 空白点击取消选择 ----------
    paper.on('blank:pointerclick', () => {
      useEditorStore.getState().selectCell(null);
      graph.getElements().forEach((cell: any) => {
        const view = paper.findViewByModel(cell);
        if (view) (view as any).unhighlight();
      });
    });

    // ---------- 连线选中 ----------
    paper.on('link:pointerclick', (linkView: any) => {
      useEditorStore.getState().selectCell(linkView.model.id, 'link');
    });

    // ---------- 元素移动 + 网格吸附 ----------
    paper.on('element:pointermove', (elementView: any) => {
      // 如果正在拖拽连线，跳过元素吸附（避免干扰）
      if (isLinkingRef.current) return;

      const element = elementView.model;
      const pos = element.position();
      const snapped = snapToGrid(pos.x, pos.y, GRID_SIZE);
      element.position(snapped.x, snapped.y, { silent: true });
    });

    // ---------- 元素放置完成 ----------
    paper.on('element:pointerup', (elementView: any) => {
      const element = elementView.model;
      const pos = element.position();
      const snapped = snapToGrid(pos.x, pos.y, GRID_SIZE);
      element.position(snapped.x, snapped.y);

      useEditorStore.getState().pushHistory('move', {
        id: element.id,
        position: snapped,
      });
    });

    // ---------- 端口悬停高亮 ----------
    paper.on('port:mouseenter', (portView: any) => {
      portView.highlight();
      console.log('[Port] Hover on port');
    });

    paper.on('port:mouseleave', (portView: any) => {
      portView.unhighlight();
    });

    // ---------- 连线创建成功 - 深度诊断 ----------
    paper.on('link:connect', (linkView: any, _evt: any, newCellView: any, _magnet: any, arrowhead: string) => {
      const link = linkView.model;
      console.log('========== [LINK CONNECTED] ==========');
      console.log('[Link] Link ID:', link.id);
      console.log('[Link] Link type:', link.get('type'));
      console.log('[Link] Source:', JSON.stringify(link.get('source')));
      console.log('[Link] Target:', JSON.stringify(link.get('target')));
      console.log('[Link] Vertices:', JSON.stringify(link.get('vertices')));
      console.log('[Link] Router:', JSON.stringify(link.get('router')));
      console.log('[Link] Connector:', JSON.stringify(link.get('connector')));
      console.log('[Link] Attrs:', JSON.stringify(link.get('attrs')));
      console.log('[Link] Markup:', JSON.stringify(link.markup));
      console.log('[Link] Target cell view:', newCellView?.model?.id);
      console.log('[Link] Arrowhead:', arrowhead);

      // 检查link是否在graph中
      const allLinks = graph.getLinks();
      console.log('[Link] Total links in graph:', allLinks.length);
      console.log('[Link] All link IDs:', allLinks.map((l: any) => l.id));

      // 检查link的DOM是否存在
      if (linkView.el) {
        console.log('[Link] DOM element exists:', linkView.el.outerHTML.substring(0, 200));
        const connectionWrap = linkView.el.querySelector('.connection-wrap');
        const connection = linkView.el.querySelector('.connection');
        console.log('[Link] .connection-wrap exists:', !!connectionWrap);
        console.log('[Link] .connection exists:', !!connection);
        if (connection) {
          console.log('[Link] .connection d attribute:', (connection as SVGPathElement).getAttribute('d'));
          console.log('[Link] .connection stroke:', (connection as SVGPathElement).getAttribute('stroke'));
          console.log('[Link] .connection stroke-width:', (connection as SVGPathElement).getAttribute('stroke-width'));
        }
      } else {
        console.error('[Link] ❌ NO DOM ELEMENT! linkView.el is null/undefined!');
      }

      // ========== 安全网：强制确保连线渲染 ==========
      // 延迟一帧后检查并修复不可见的连线
      requestAnimationFrame(() => {
        try {
          // 确保link在graph中
          if (!graph.getCell(link.id)) {
            console.warn('[Link] Safety: Link not in graph, adding...');
            graph.addCell(link);
          }

          // 强制触发重新计算路由
          const source = link.get('source');
          const target = link.get('target');
          console.log('[Link] Safety - Re-triggering route calc, source:', source, 'target:', target);

          // 触发属性更新以强制重绘
          link.set('source', { ...source });
          link.set('target', { ...target });

          // 再次检查DOM
          setTimeout(() => {
            const updatedView = paper.findViewByModel(link) as any;
            if (updatedView?.el) {
              const conn = updatedView.el.querySelector('.connection');
              if (conn) {
                const d = (conn as SVGPathElement).getAttribute('d');
                console.log('[Link] Safety - After fix, path d:', d);
                if (!d || d === '' || d === 'M 0 0') {
                  console.error('[Link] Safety - Path still empty! Trying orthogonal fallback...');
                  // 兜底：切换到orthogonal路由器
                  link.set('router', { name: 'orthogonal' });
                }
              } else {
                console.error('[Link] Safety - Still no .connection element!');
              }
            }
          }, 100);
        } catch (err) {
          console.error('[Link] Safety net error:', err);
        }
      });

      isLinkingRef.current = false;

      useEditorStore.getState().pushHistory('connect', {
        targetId: newCellView?.model?.id,
        arrowhead,
      });
    });

    // ---------- 连线断开 ----------
    paper.on('link:disconnect', (_linkView: any) => {
      console.log('[Link] Disconnected');
    });

    // ---------- 连线添加到Graph时（更早的钩子）----------
    paper.on('link:add', (link: any) => {
      console.log('[Link] ADD event - link added to graph:', link.id);
      console.log('[Link] Source:', JSON.stringify(link.get('source')));
      console.log('[Link] Target:', JSON.stringify(link.get('target')));
    });

    // ---------- 开始拖拽新连线 ----------
    paper.on('link:mouseenter', () => {
      console.log('[Link] Mouse enter existing link');
    });

    // ---------- 正在拖拽连线时的实时反馈 ----------
    paper.on('link:snap:connect', (_linkView: any, _evt: any, _snapView: any) => {
      console.log('[Link] SNAP - magnet snapped to target');
    });

    // ---------- 画布平移（仅在非连线模式下）----------
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;

    paper.on('blank:pointerdown', (evt: MouseEvent) => {
      // 延迟判断：如果短时间内没有link创建，则认为是平移操作
      isPanning = true;
      panStartX = evt.clientX;
      panStartY = evt.clientY;

      const onMouseMove = (moveEvt: MouseEvent) => {
        if (!isPanning) return;
        const dx = moveEvt.clientX - panStartX;
        const dy = moveEvt.clientY - panStartY;
        paper.translate(dx, dy);
        panStartX = moveEvt.clientX;
        panStartY = moveEvt.clientY;
      };

      const onMouseUp = () => {
        isPanning = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // ============================================================
    //               外部拖放处理（Stencil → Paper）
    // ============================================================

    containerRef.current.addEventListener(
      'dragover',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      },
      false
    );

    containerRef.current.addEventListener('dragleave', (e: DragEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (relatedTarget && !containerRef.current?.contains(relatedTarget)) {
        containerRef.current!.style.outline = '';
      }
    });

    containerRef.current.addEventListener('dragenter', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      containerRef.current!.style.outline = '2px dashed #00d9ff';
      containerRef.current!.style.outlineOffset = '-4px';
    });

    containerRef.current.addEventListener(
      'drop',
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        containerRef.current!.style.outline = '';

        // 获取器件类型
        let componentType = e.dataTransfer?.getData('componentType') || '';
        if (!componentType) componentType = e.dataTransfer?.getData('text/plain') || '';
        if (!componentType || !shapeConstructors[componentType]) return;

        // 解析属性
        let attrs: Record<string, any> = {};
        const attrsStr = e.dataTransfer?.getData('componentAttrs');
        if (attrsStr) {
          try { attrs = JSON.parse(attrsStr); } catch {}
        }

        // 坐标转换（SVG CTM逆矩阵）
        const rect = containerRef.current!.getBoundingClientRect();
        const clientX = e.clientX || 0;
        const clientY = e.clientY || 0;

        let point: { x: number; y: number };
        try {
          const svgEl = paper.svg as SVGSVGElement;
          const ctm = svgEl.getScreenCTM();
          if (ctm) {
            const svgPt = (svgEl.ownerSVGElement || svgEl).createSVGPoint();
            svgPt.x = clientX; svgPt.y = clientY;
            const localPt = svgPt.matrixTransform(ctm.inverse());
            point = { x: localPt.x, y: localPt.y };
          } else {
            point = { x: clientX - rect.left, y: clientY - rect.top };
          }
        } catch {
          point = { x: clientX - rect.left, y: clientY - rect.top };
        }

        // 网格吸附
        const snapped = snapToGrid(point.x, point.y, GRID_SIZE);

        // 创建元件
        const Constructor = shapeConstructors[componentType];
        const newElement = new Constructor({
          position: { x: snapped.x, y: snapped.y },
          attrs: attrs,
        }) as any;

        // 添加到图
        graph.addCell(newElement);

        // 选中+高亮
        useEditorStore.getState().selectCell(newElement.id, 'element');
        requestAnimationFrame(() => {
          const view = paper.findViewByModel(newElement);
          if (view) (view as any).highlight();
        });

        console.log(`[Drop] ${componentType} placed at (${snapped.x}, ${snapped.y})`);
      },
      false
    );

    // ---------- 鼠标滚轮缩放 ----------
    containerRef.current.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const currentZoom = useEditorStore.getState().zoom;
      const newZoom = Math.max(0.25, Math.min(4, currentZoom + delta));
      useEditorStore.getState().setZoom(newZoom);
      paper.scale(newZoom, newZoom);
    }, { passive: false });

    // ---------- 键盘快捷键 ----------
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Delete删除
      if (e.key === 'Delete' || e.key === 'Backspace') {
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

      // Ctrl+Z / Ctrl+Y
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); useEditorStore.getState().undo(); }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); useEditorStore.getState().redo(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 清理
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (containerRef.current) containerRef.current.innerHTML = '';
      paperRef.current = null;
      graphRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0a18] relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(15, 52, 96, 0.1) 0%, transparent 70%)',
      }}
    />
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
