import React, { useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Download, Upload, Trash2, Grid3X3 } from 'lucide-react';
import { useEditorStore } from '../stores/useEditorStore';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onClearCanvas: () => void;
  onExport: () => void;
  onImport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onClearCanvas,
  onExport,
  onImport,
}) => {
  const { zoom, isGridVisible, toggleGrid, undo, redo } = useEditorStore();

  return (
    <div className="h-14 bg-[#0f0f23] border-b border-[#1a1a3e] flex items-center justify-between px-6 shadow-lg">
      {/* Logo区域 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#00d9ff] to-[#e94560] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CE</span>
        </div>
        <h1 className="text-lg font-bold text-[#e94560] tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Circuit Editor
        </h1>
      </div>

      {/* 中间工具按钮 */}
      <div className="flex items-center gap-1">
        {/* 缩放控制 */}
        <div className="flex items-center gap-1 mr-4 bg-[#1a1a3e] rounded-lg px-3 py-1.5">
          <button
            onClick={onZoomOut}
            className="p-1 hover:bg-[#0f3460] rounded transition-colors"
            title="缩小"
          >
            <ZoomOut size={16} className="text-[#00d9ff]" />
          </button>
          <span className="text-xs text-gray-300 mx-2 min-w-[50px] text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 hover:bg-[#0f3460] rounded transition-colors"
            title="放大"
          >
            <ZoomIn size={16} className="text-[#00d9ff]" />
          </button>
          <button
            onClick={onZoomReset}
            className="p-1 hover:bg-[#0f3460] rounded transition-colors ml-1"
            title="适应窗口"
          >
            <Maximize size={16} className="text-gray-400" />
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-[#1a1a3e] mx-2" />

        {/* 网格切换 */}
        <button
          onClick={toggleGrid}
          className={`p-2 rounded-lg transition-all ${
            isGridVisible ? 'bg-[#0f3460] text-[#00d9ff]' : 'bg-transparent text-gray-500 hover:bg-[#1a1a3e]'
          }`}
          title="显示/隐藏网格"
        >
          <Grid3X3 size={18} />
        </button>

        {/* 撤销/重做 */}
        <button
          onClick={undo}
          className="p-2 rounded-lg bg-transparent text-gray-400 hover:bg-[#1a1a3e] hover:text-[#00d9ff] transition-all"
          title="撤销 (Ctrl+Z)"
        >
          <RotateCcw size={18} />
        </button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-[#1a1a3e] mx-2" />

        {/* 清空画布 */}
        <button
          onClick={onClearCanvas}
          className="p-2 rounded-lg bg-transparent text-gray-400 hover:bg-[#e94560]/20 hover:text-[#e94560] transition-all"
          title="清空画布"
        >
          <Trash2 size={18} />
        </button>

        {/* 导出JSON */}
        <button
          onClick={onExport}
          className="p-2 rounded-lg bg-transparent text-gray-400 hover:bg-[#00d9ff]/20 hover:text-[#00d9ff] transition-all"
          title="导出JSON"
        >
          <Download size={18} />
        </button>

        {/* 导入JSON */}
        <button
          onClick={onImport}
          className="p-2 rounded-lg bg-transparent text-gray-400 hover:bg-[#00ff88]/20 hover:text-[#00ff88] transition-all"
          title="导入JSON"
        >
          <Upload size={18} />
        </button>
      </div>

      {/* 右侧状态指示器 */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-gray-500">就绪</span>
      </div>
    </div>
  );
};

export default Toolbar;
