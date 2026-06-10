// Zustand状态管理 - 编辑器全局状态
import { create } from 'zustand';

interface EditorState {
  // 画布状态
  zoom: number;
  selectedCellId: string | null;
  selectedCellType: 'element' | 'link' | null;

  // UI状态
  isInspectorOpen: boolean;
  isGridVisible: boolean;

  // 操作历史
  history: Array<{
    action: string;
    data: any;
    timestamp: number;
  }>;
  historyIndex: number;

  // Actions - 缩放控制
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Actions - 选择管理
  selectCell: (id: string | null, type?: 'element' | 'link') => void;

  // Actions - UI控制
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  toggleGrid: () => void;

  // Actions - 历史记录
  pushHistory: (action: string, data: any) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Actions - 导入导出
  exportJSON: () => string;
  importJSON: (json: string) => void;

  // 内部数据存储
  _graphData: any;
  setGraphData: (data: any) => void;
}

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = 1;

export const useEditorStore = create<EditorState>((set, get) => ({
  // 初始状态
  zoom: DEFAULT_ZOOM,
  selectedCellId: null,
  selectedCellType: null,
  isInspectorOpen: true,
  isGridVisible: true,
  history: [],
  historyIndex: -1,
  _graphData: null,

  // 缩放控制
  setZoom: (zoom) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    set({ zoom: clampedZoom });
  },

  zoomIn: () => {
    const currentZoom = get().zoom;
    const newZoom = Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP);
    set({ zoom: newZoom });
  },

  zoomOut: () => {
    const currentZoom = get().zoom;
    const newZoom = Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP);
    set({ zoom: newZoom });
  },

  resetZoom: () => set({ zoom: DEFAULT_ZOOM }),

  // 选择管理
  selectCell: (id, type = 'element') =>
    set({
      selectedCellId: id,
      selectedCellType: id ? type : null,
      isInspectorOpen: id !== null,
    }),

  // UI控制
  toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  toggleGrid: () => set((state) => ({ isGridVisible: !state.isGridVisible })),

  // 历史记录
  pushHistory: (action, data) => {
    const state = get();
    const newEntry = {
      action,
      data,
      timestamp: Date.now(),
    };

    // 如果当前不在最新位置，截断后续历史
    const newHistory =
      state.historyIndex < state.history.length - 1
        ? state.history.slice(0, state.historyIndex + 1)
        : [...state.history];

    newHistory.push(newEntry);

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      set({ historyIndex: state.historyIndex - 1 });
      // 这里可以触发Graph的撤销操作
      console.log('Undo:', state.history[state.historyIndex - 1]);
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      set({ historyIndex: state.historyIndex + 1 });
      console.log('Redo:', state.history[state.historyIndex + 1]);
    }
  },

  clearHistory: () => set({ history: [], historyIndex: -1 }),

  // 导入导出
  exportJSON: () => {
    const graphData = get()._graphData;
    if (!graphData) return '{}';
    try {
      return JSON.stringify(graphData, null, 2);
    } catch (e) {
      console.error('Export error:', e);
      return '{}';
    }
  },

  importJSON: (json) => {
    try {
      const data = JSON.parse(json);
      set({ _graphData: data });
      console.log('Imported:', data);
    } catch (e) {
      console.error('Import error:', e);
    }
  },

  // 图形数据
  setGraphData: (data) => set({ _graphData: data }),
}));
