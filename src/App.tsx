import React, { useRef, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import Stencil from './components/Stencil';
import Canvas, { CanvasHandle } from './components/Canvas';
import Inspector from './components/Inspector';
import { useEditorStore } from './stores/useEditorStore';

const App: React.FC = () => {
  const canvasRef = useRef<CanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { zoomIn, zoomOut, resetZoom } = useEditorStore();

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    zoomIn();
    if (canvasRef.current) {
      const paper = canvasRef.current.getPaper();
      const newZoom = useEditorStore.getState().zoom;
      paper?.scale(newZoom, newZoom);
    }
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
    if (canvasRef.current) {
      const paper = canvasRef.current.getPaper();
      const newZoom = useEditorStore.getState().zoom;
      paper?.scale(newZoom, newZoom);
    }
  }, [zoomOut]);

  const handleZoomReset = useCallback(() => {
    resetZoom();
    if (canvasRef.current) {
      const paper = canvasRef.current.getPaper();
      paper?.scale(1, 1);
    }
  }, [resetZoom]);

  // 清空画布
  const handleClearCanvas = useCallback(() => {
    if (window.confirm('确定要清空画布吗？此操作不可撤销。')) {
      canvasRef.current?.clearCanvas();
    }
  }, []);

  // 导出JSON
  const handleExport = useCallback(() => {
    if (canvasRef.current) {
      const json = canvasRef.current.exportToJSON();
      // 创建下载
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circuit_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, []);

  // 导入JSON
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (canvasRef.current) {
        canvasRef.current.importFromJSON(content);
      }
    };
    reader.readAsText(file);

    // 重置input以允许重复导入同一文件
    e.target.value = '';
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0a0a18] overflow-hidden">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 顶部工具栏 */}
      <Toolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onClearCanvas={handleClearCanvas}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* 主内容区：三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧器件库 */}
        <Stencil paperRef={{ current: canvasRef.current?.getPaper() || null }} />

        {/* 中央画布区域 */}
        <div className="flex-1 relative overflow-hidden border-l border-r border-[#1a1a3e]">
          <Canvas ref={canvasRef} />
        </div>

        {/* 右侧属性面板 */}
        <Inspector graphRef={{ current: canvasRef.current?.getGraph() || null }} />
      </div>
    </div>
  );
};

export default App;
