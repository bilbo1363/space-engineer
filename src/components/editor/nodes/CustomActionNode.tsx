import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { CustomActionNodeData } from '../../../types/flowGraph';

// Доступные действия
const AVAILABLE_ACTIONS = [
  { value: 'activate', label: 'Активировать', icon: '⚡' },
  { value: 'take', label: 'Взять', icon: '🤲' },
  { value: 'put', label: 'Положить', icon: '📦' },
  { value: 'scan', label: 'Сканировать', icon: '🔍' },
  { value: 'repair', label: 'Починить', icon: '🔧' },
  { value: 'build', label: 'Построить', icon: '🏗️' },
  { value: 'destroy', label: 'Разрушить', icon: '💥' },
  { value: 'open', label: 'Открыть', icon: '🚪' },
  { value: 'close', label: 'Закрыть', icon: '🔒' },
  { value: 'use', label: 'Использовать', icon: '🎯' },
  { value: 'wait', label: 'Ждать', icon: '⏱️', hasParameter: true },
];

interface CustomActionNodeProps {
  data: CustomActionNodeData;
  id: string;
}

export const CustomActionNode = ({ data, id }: CustomActionNodeProps) => {
  const [selectedAction, setSelectedAction] = useState(data.actionType || 'activate');
  const [waitSeconds, setWaitSeconds] = useState(data.parameters?.seconds || 1);
  const { setNodes } = useReactFlow();

  // Синхронизируем состояние с data
  useEffect(() => {
    if (data.actionType !== undefined) {
      setSelectedAction(data.actionType);
    }
    if (data.parameters?.seconds !== undefined) {
      setWaitSeconds(data.parameters.seconds);
    }
  }, [data.actionType, data.parameters?.seconds]);

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAction = e.target.value;
    setSelectedAction(newAction);
    
    const actionInfo = AVAILABLE_ACTIONS.find(a => a.value === newAction);
    
    // Обновляем ноду в графе
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              actionType: newAction,
              label: actionInfo?.label || newAction,
              icon: actionInfo?.icon || '🎯',
              parameters: newAction === 'wait' ? { seconds: waitSeconds } : node.data.parameters,
            },
          };
        }
        return node;
      })
    );
  };

  const handleWaitSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeconds = parseFloat(e.target.value) || 1;
    setWaitSeconds(newSeconds);
    
    // Обновляем ноду в графе
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              parameters: { seconds: newSeconds },
              label: `Ждать ${newSeconds}с`,
            },
          };
        }
        return node;
      })
    );
  };

  const currentAction = AVAILABLE_ACTIONS.find(a => a.value === selectedAction) || AVAILABLE_ACTIONS[0];

  return (
    <div className="px-4 py-3 bg-bright-cyan/10 rounded-lg border-2 border-bright-cyan/50 hover:border-bright-cyan hover:bg-bright-cyan/20 transition-all min-w-[180px]">
      {/* Входная точка */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#00FFFF',
          width: 10,
          height: 10,
          border: '2px solid #0A0E2E',
        }}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{currentAction.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-bright-cyan text-sm">
            ДЕЙСТВИЕ
          </div>
        </div>
      </div>
      
      {/* Выбор действия */}
      <div 
        className="nodrag" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <label className="text-xs text-gray-400 block mb-1">Команда:</label>
        <select
          value={selectedAction}
          onChange={handleActionChange}
          className="w-full px-2 py-1 bg-deep-blue text-white border border-bright-cyan/30 rounded text-sm focus:border-bright-cyan focus:outline-none nodrag cursor-pointer"
        >
          {AVAILABLE_ACTIONS.map((action) => (
            <option key={action.value} value={action.value}>
              {action.icon} {action.label}
            </option>
          ))}
        </select>
        
        {/* Параметр времени для команды "Ждать" */}
        {selectedAction === 'wait' && (
          <div className="mt-2">
            <label className="text-xs text-gray-400 block mb-1">Секунд:</label>
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.5"
              value={waitSeconds}
              onChange={handleWaitSecondsChange}
              className="w-full px-2 py-1 bg-deep-blue text-white border border-bright-cyan/30 rounded text-sm focus:border-bright-cyan focus:outline-none nodrag"
            />
          </div>
        )}
      </div>
      
      {/* Выходная точка */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#00FFFF',
          width: 10,
          height: 10,
          border: '2px solid #0A0E2E',
        }}
      />
    </div>
  );
};
