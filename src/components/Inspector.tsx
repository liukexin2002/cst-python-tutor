import React, { useEffect, useState } from 'react';
import { X, Save, Tag, Hash, Type } from 'lucide-react';
import { useEditorStore } from '../stores/useEditorStore';
import * as joint from 'jointjs';

const Inspector: React.FC<{
  graphRef: React.RefObject<joint.dia.Graph | null>;
}> = ({ graphRef }) => {
  const { selectedCellId, selectedCellType, isInspectorOpen, setInspectorOpen } = useEditorStore();
  const [cellData, setCellData] = useState<any>(null);

  // 当选中元素变化时，更新显示的数据
  useEffect(() => {
    if (!selectedCellId || !graphRef.current) {
      setCellData(null);
      return;
    }

    const cell = graphRef.current.getCell(selectedCellId) as any;
    if (!cell) {
      setCellData(null);
      return;
    }

    // 提取常用属性 - 使用Backbone Model API
    const data = {
      id: cell.id,
      type: cell.get('type') || cell.prop('type'),
      position: cell.position ? cell.position() : undefined,
      size: cell.size ? cell.size() : undefined,
      attrs: cell.get('attrs'),
      ports: cell.ports ? cell.ports.items : [],
    };

    setCellData(data);
  }, [selectedCellId, graphRef.current]);

  // 更新属性
  const updateAttribute = (path: string, value: string | number) => {
    if (!selectedCellId || !graphRef.current) return;

    const cell = graphRef.current.getCell(selectedCellId) as any;
    if (!cell) return;

    cell.attr(path, value);
    useEditorStore.getState().pushHistory('update', {
      id: selectedCellId,
      path,
      value,
    });

    // 刷新本地状态
    setCellData((prev: any) => {
      if (!prev) return prev;
      const newData = { ...prev };
      const keys = path.split('/');
      let current: any = newData.attrs;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (!isInspectorOpen) return null;

  return (
    <div className="w-72 h-full bg-[#0f0f23] border-l border-[#1a1a3e] flex flex-col overflow-hidden animate-slide-in-right">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-[#1a1a3e]">
        <h2 className="text-base font-bold text-[#e94560]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          属性面板
        </h2>
        <button
          onClick={() => setInspectorOpen(false)}
          className="p-1 hover:bg-[#1a1a3e] rounded transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedCellId || !cellData ? (
          /* 未选中状态 */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[#1a1a3e] rounded-2xl flex items-center justify-center mb-3">
              <Tag size={24} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">未选中器件</p>
            <p className="text-xs text-gray-600">点击器件查看属性</p>
          </div>
        ) : (
          /* 属性编辑表单 */
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="bg-[#1a1a3e] rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Hash size={12} />
                基本信息
              </h3>

              {/* ID */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">ID</label>
                <input
                  type="text"
                  value={cellData.id || ''}
                  readOnly
                  className="w-full px-3 py-1.5 bg-[#0f0f23] border border-[#0f3460] rounded-lg text-xs text-gray-400 font-mono cursor-not-allowed"
                />
              </div>

              {/* 类型 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">类型</label>
                <div className="px-3 py-1.5 bg-[#0f0f23] border border-[#0f3460] rounded-lg">
                  <span className="text-xs text-[#00d9ff] font-mono font-semibold">
                    {cellData.type?.replace('circuit.', '') || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 位置信息 */}
            {cellData.position && (
              <div className="bg-[#1a1a3e] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  位置
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">X</label>
                    <input
                      type="number"
                      value={Math.round(cellData.position.x)}
                      onChange={(e) => updateAttribute('', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-[#0f0f23] border border-[#0f3460] rounded-lg text-xs text-white focus:border-[#00d9ff] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Y</label>
                    <input
                      type="number"
                      value={Math.round(cellData.position.y)}
                      onChange={(e) => updateAttribute('', Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-[#0f0f23] border border-[#0f3460] rounded-lg text-xs text-white focus:border-[#00d9ff] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 标签编辑 */}
            {selectedCellType === 'element' && cellData.attrs?.label && (
              <div className="bg-[#1a1a3e] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Type size={12} />
                  标签
                </h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">文本</label>
                  <input
                    type="text"
                    value={cellData.attrs.label.text || ''}
                    onChange={(e) => updateAttribute('label/text', e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0f0f23] border border-[#0f3460] rounded-lg text-sm text-white focus:border-[#e94560] outline-none font-mono"
                    placeholder="输入标签..."
                  />
                </div>
              </div>
            )}

            {/* 端口列表 */}
            {cellData.ports && cellData.ports.length > 0 && (
              <div className="bg-[#1a1a3e] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  端口 ({cellData.ports.length})
                </h3>
                <div className="space-y-2">
                  {cellData.ports.map((port: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0f0f23] rounded-lg"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            port.group === 'out'
                              ? '#e94560'
                              : port.group === 'top'
                              ? '#00ff88'
                              : port.group === 'bottom'
                              ? '#ffa500'
                              : '#00d9ff',
                        }}
                      />
                      <span className="text-xs text-gray-300 font-mono">
                        {port.id || `Port ${index + 1}`}
                      </span>
                      <span className="text-xs text-gray-600 ml-auto">{port.group}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      {selectedCellId && (
        <div className="p-4 border-t border-[#1a1a3e] bg-[#0a0a18]">
          <button
            onClick={() => {
              if (selectedCellId && graphRef.current) {
                const cell = graphRef.current.getCell(selectedCellId) as any;
                if (cell) {
                  cell.remove();
                  useEditorStore.getState().pushHistory('delete', { id: selectedCellId });
                  useEditorStore.getState().selectCell(null);
                }
              }
            }}
            className="w-full px-4 py-2 bg-[#e94560]/10 border border-[#e94560]/30 
                       text-[#e94560] rounded-lg text-sm font-medium hover:bg-[#e94560]/20 
                       transition-colors flex items-center justify-center gap-2"
          >
            删除此器件
          </button>
        </div>
      )}
    </div>
  );
};

export default Inspector;
