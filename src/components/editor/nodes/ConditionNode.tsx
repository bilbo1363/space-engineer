import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { ConditionNodeData } from '../../../types/flowGraph';

// Предустановленные условия для выбора
const PRESET_CONDITIONS = [
  { value: 'isDoorOpen', label: 'Дверь открыта', description: 'Проверяет открыта ли дверь впереди' },
  { value: 'isDoorAhead', label: 'Дверь впереди', description: 'Проверяет есть ли дверь впереди' },
  { value: 'canMoveForward', label: 'Путь свободен', description: 'Можно ли двигаться вперёд' },
  { value: 'hasItem', label: 'Есть предмет', description: 'Есть ли предмет в инвентаре' },
  { value: 'inventoryFull', label: 'Инвентарь полон', description: 'Инвентарь заполнен (≥5)' },
  { value: 'energy > 50', label: 'Энергия > 50', description: 'Энергия больше 50%' },
  { value: 'energy > 30', label: 'Энергия > 30', description: 'Энергия больше 30%' },
  { value: 'inventorySize > 0', label: 'Инвентарь не пуст', description: 'Есть хотя бы 1 предмет' },
];

export const ConditionNode = ({ data, id }: { data: ConditionNodeData; id: string }) => {
  const [condition, setCondition] = useState(data.condition || 'isDoorOpen');
  const { setNodes } = useReactFlow();

  // Синхронизируем состояние с data
  useEffect(() => {
    if (data.condition !== undefined) setCondition(data.condition);
  }, [data.condition]);

  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCondition = e.target.value;
    setCondition(newCondition);
    
    // Находим label для отображения
    const preset = PRESET_CONDITIONS.find(p => p.value === newCondition);
    const label = preset ? preset.label : newCondition;
    
    // Обновляем ноду в графе
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              condition: newCondition,
              label: label,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="px-4 py-3 bg-warning-yellow/10 rounded-lg border-2 border-warning-yellow/50 hover:border-warning-yellow hover:bg-warning-yellow/20 transition-all min-w-[200px]">
      {/* Входная точка */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#FFD700',
          width: 10,
          height: 10,
          border: '2px solid #0A0E2E',
        }}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-warning-yellow text-sm">
            УСЛОВИЕ
          </div>
        </div>
      </div>
      
      {/* Выбор условия */}
      <div 
        className="mb-3 nodrag" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <label className="text-xs text-gray-400 block mb-1">Проверить:</label>
        <select
          value={condition}
          onChange={handleConditionChange}
          className="w-full px-2 py-1 bg-deep-blue text-white border border-warning-yellow/30 rounded text-sm focus:border-warning-yellow focus:outline-none nodrag cursor-pointer"
        >
          {PRESET_CONDITIONS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-500 mt-1">
          {PRESET_CONDITIONS.find(p => p.value === condition)?.description || ''}
        </div>
      </div>
      
      {/* Две выходные точки: true и false */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="text-right">
          <div className="text-xs text-green-400 inline-block mr-2">✓ TRUE</div>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{
              background: '#4CAF50',
              width: 10,
              height: 10,
              border: '2px solid #0A0E2E',
              top: '70%',
            }}
          />
        </div>
        <div className="text-right">
          <div className="text-xs text-red-400 inline-block mr-2">✗ FALSE</div>
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{
              background: '#FF4444',
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
