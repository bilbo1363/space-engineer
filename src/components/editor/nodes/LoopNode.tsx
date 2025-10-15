import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { LoopNodeData } from '../../../types/flowGraph';

export const LoopNode = ({ data, id }: { data: LoopNodeData; id: string }) => {
  const [count, setCount] = useState(data.count || 5);
  const [condition, setCondition] = useState(data.condition || '');
  const { setNodes } = useReactFlow();

  // Синхронизируем состояние с data
  useEffect(() => {
    if (data.count !== undefined) setCount(data.count);
    if (data.condition !== undefined) setCondition(data.condition);
  }, [data.count, data.condition]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value) || 1;
    setCount(newCount);
    
    // Обновляем ноду в графе
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              count: newCount,
              label: `Повторить ${newCount}`,
            },
          };
        }
        return node;
      })
    );
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCondition = e.target.value;
    setCondition(newCondition);
    
    // Обновляем ноду в графе
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              condition: newCondition,
              label: `Пока ${newCondition}`,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="px-4 py-3 bg-bright-orange/10 rounded-lg border-2 border-bright-orange/50 hover:border-bright-orange hover:bg-bright-orange/20 transition-all min-w-[180px]">
      {/* Входная точка */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#FF8C00',
          width: 10,
          height: 10,
          border: '2px solid #0A0E2E',
        }}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-bright-orange text-sm">
            {data.loopType === 'repeat' ? 'ПОВТОРИТЬ' : 'ПОКА'}
          </div>
        </div>
      </div>
      
      {/* Редактируемые параметры */}
      {data.loopType === 'repeat' && (
        <div 
          className="mb-2 nodrag" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <label className="text-xs text-gray-400 block mb-1">Повторений:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={handleCountChange}
            className="w-full px-2 py-1 bg-deep-blue text-white border border-bright-orange/30 rounded text-sm focus:border-bright-orange focus:outline-none nodrag"
          />
        </div>
      )}
      {data.loopType === 'while' && (
        <div 
          className="mb-2 nodrag" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <label className="text-xs text-gray-400 block mb-1">Условие:</label>
          <input
            type="text"
            value={condition}
            onChange={handleConditionChange}
            placeholder="energy > 50"
            className="w-full px-2 py-1 bg-deep-blue text-white border border-bright-orange/30 rounded text-sm focus:border-bright-orange focus:outline-none nodrag"
          />
        </div>
      )}
      
      {/* Выходные точки */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="text-right">
          <div className="text-xs text-bright-orange inline-block mr-2">→ ТЕЛО</div>
          <Handle
            type="source"
            position={Position.Right}
            id="body"
            style={{
              background: '#FF8C00',
              width: 10,
              height: 10,
              border: '2px solid #0A0E2E',
              top: '70%',
            }}
          />
        </div>
        <div className="text-right">
          <div className="text-xs text-bright-cyan inline-block mr-2">→ ДАЛЕЕ</div>
          <Handle
            type="source"
            position={Position.Right}
            id="next"
            style={{
              background: '#00FFFF',
              width: 10,
              height: 10,
              border: '2px solid #0A0E2E',
              top: '85%',
            }}
          />
        </div>
      </div>
    </div>
  );
};
