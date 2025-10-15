import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ProgramNodeInstance } from '../../types/nodes';
import { NODE_DEFINITIONS } from '../../core/nodes/nodeDefinitions';
import { ContainerNode } from './ContainerNode';

export const ProgramEditor = () => {
  const { program, executionState } = useGameStore();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);

  const isNodeExecuting = (nodeId: string): boolean => {
    return executionState.currentNodeId === nodeId && executionState.running;
  };

  const isContainerNode = (nodeType: string): boolean => {
    const nodeDef = NODE_DEFINITIONS[nodeType];
    return nodeDef?.category === 'loop' || nodeDef?.category === 'conditional';
  };

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Если перетаскиваем существующую ноду (draggedNodeIndex установлен)
    if (draggedNodeIndex !== null) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
    
    const targetIndex = index !== undefined ? index : program.length;
    setDragOverIndex(targetIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const nodeType = e.dataTransfer.getData('nodeType');
    const functionId = e.dataTransfer.getData('functionId');
    const draggedIndex = e.dataTransfer.getData('draggedIndex');
    
    // Если перетаскиваем существующую ноду
    if (draggedIndex !== '') {
      const fromIndex = parseInt(draggedIndex);
      const toIndex = index !== undefined ? index : program.length;
      
      if (fromIndex === toIndex) {
        setDraggedNodeIndex(null);
        return;
      }
      
      const newProgram = [...program];
      const [movedNode] = newProgram.splice(fromIndex, 1);
      
      // Корректируем индекс если перемещаем вниз
      const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      newProgram.splice(adjustedToIndex, 0, movedNode);
      
      useGameStore.getState().setProgram(newProgram);
      setDraggedNodeIndex(null);
      console.log('🔄 Нода перемещена с позиции', fromIndex, 'на позицию', adjustedToIndex);
      return;
    }
    
    // Если добавляем функцию
    if (functionId) {
      const func = useGameStore.getState().getFunctionById(functionId);
      if (!func) {
        console.log('❌ Функция не найдена:', functionId);
        return;
      }

      const newNode: ProgramNodeInstance = {
        id: `node_${Date.now()}_${Math.random()}`,
        nodeType: 'function',
        functionId: functionId,
        parameters: {},
      };

      const newProgram = [...program];
      const insertIndex = index !== undefined ? index : program.length;
      newProgram.splice(insertIndex, 0, newNode);
      
      // Увеличиваем счетчик использований
      useGameStore.getState().incrementFunctionUsage(functionId);
      
      console.log('✅ Функция добавлена:', func.name, 'Позиция:', insertIndex);
      useGameStore.getState().setProgram(newProgram);
      return;
    }
    
    // Если добавляем новую ноду из палитры
    if (!nodeType) {
      console.log('❌ Нет данных nodeType или functionId');
      return;
    }

    const newNode: ProgramNodeInstance = {
      id: `node_${Date.now()}_${Math.random()}`,
      nodeType,
      parameters: {},
    };

    const newProgram = [...program];
    const insertIndex = index !== undefined ? index : program.length;
    newProgram.splice(insertIndex, 0, newNode);
    
    console.log('✅ Блок добавлен:', nodeType, 'Позиция:', insertIndex);
    useGameStore.getState().setProgram(newProgram);
  };

  const handleRemoveNode = (index: number) => {
    const newProgram = program.filter((_, i) => i !== index);
    useGameStore.getState().setProgram(newProgram);
    console.log('🗑️ Блок удален, позиция:', index);
  };

  const handleClearProgram = () => {
    useGameStore.getState().setProgram([]);
    console.log('🗑️ Программа очищена');
  };

  const handleUpdateNodeParameters = (index: number, parameters: Record<string, any>) => {
    const newProgram = [...program];
    newProgram[index] = {
      ...newProgram[index],
      parameters,
    };
    useGameStore.getState().setProgram(newProgram);
    console.log('⚙️ Параметры ноды обновлены:', parameters);
  };

  const hasParameters = (nodeType: string): boolean => {
    const nodeDef = NODE_DEFINITIONS[nodeType];
    return !!(nodeDef?.parameters && nodeDef.parameters.length > 0);
  };

  const getNodeIcon = (node: ProgramNodeInstance): string => {
    // Если это функция
    if (node.functionId) {
      const func = useGameStore.getState().getFunctionById(node.functionId);
      return func?.icon || '📦';
    }
    
    // Обычная нода
    const nodeDef = NODE_DEFINITIONS[node.nodeType];
    return nodeDef?.icon || '❓';
  };

  const getNodeName = (node: ProgramNodeInstance): string => {
    // Если это функция
    if (node.functionId) {
      const func = useGameStore.getState().getFunctionById(node.functionId);
      return func?.name || 'Функция';
    }
    
    // Обычная нода
    const nodeDef = NODE_DEFINITIONS[node.nodeType];
    return nodeDef?.name || node.nodeType;
  };
  
  const getNodeColor = (node: ProgramNodeInstance): string | undefined => {
    // Если это функция, возвращаем её цвет
    if (node.functionId) {
      const func = useGameStore.getState().getFunctionById(node.functionId);
      return func?.color;
    }
    return undefined;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div
        className={`
          flex-1 bg-deep-blue rounded border-2 p-4 overflow-y-auto
          ${dragOverIndex !== null ? 'border-bright-orange' : 'border-bright-cyan/30'}
          ${program.length === 0 ? 'flex items-center justify-center' : ''}
        `}
      >
        {program.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => handleDrop(e)}
            className="w-full h-full flex items-center justify-center"
          >
            <p className="text-gray-400 text-center">
              Перетащите блоки сюда, чтобы создать программу...
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {program.map((node, index) => (
              <div key={node.id} className="flex flex-col">
                {/* Drop zone между блоками */}
                <div
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    transition-all flex items-center justify-center
                    ${dragOverIndex === index 
                      ? 'h-16 bg-bright-orange/20 border-2 border-dashed border-bright-orange rounded my-2' 
                      : 'h-4 hover:h-8 hover:bg-bright-cyan/10 rounded'
                    }
                  `}
                >
                  {dragOverIndex === index && (
                    <div className="text-bright-orange text-2xl">
                      ⬇
                    </div>
                  )}
                </div>

                {/* Блок программы */}
                {isContainerNode(node.nodeType) ? (
                  // Контейнерный блок (цикл/условие)
                  <ContainerNode
                    node={node}
                    index={index}
                    isExecuting={isNodeExecuting(node.id)}
                    onUpdateNode={(idx, updatedNode) => {
                      const newProgram = [...program];
                      newProgram[idx] = updatedNode;
                      useGameStore.getState().setProgram(newProgram);
                    }}
                    onRemoveNode={handleRemoveNode}
                    onDragStart={(e, idx) => {
                      if (!executionState.running) {
                        e.dataTransfer.setData('draggedIndex', idx.toString());
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedNodeIndex(idx);
                      }
                    }}
                    onDragEnd={() => setDraggedNodeIndex(null)}
                    isDragging={draggedNodeIndex === index}
                  />
                ) : (
                  // Обычный блок
                  <div
                    draggable={!executionState.running}
                    onDragStart={(e) => {
                      if (!executionState.running) {
                        e.dataTransfer.setData('draggedIndex', index.toString());
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedNodeIndex(index);
                      }
                    }}
                    onDragEnd={() => setDraggedNodeIndex(null)}
                    className={`
                      relative flex flex-row items-center gap-3 p-3 rounded border transition-all group w-full
                      ${draggedNodeIndex === index ? 'opacity-50' : ''}
                      ${isNodeExecuting(node.id) 
                        ? 'bg-warning-yellow/30 border-warning-yellow shadow-lg shadow-warning-yellow/50 animate-pulse' 
                        : 'bg-bright-cyan/10 border-bright-cyan/30 hover:bg-bright-cyan/20'
                      }
                      ${!executionState.running ? 'cursor-move' : ''}
                    `}
                    style={getNodeColor(node) ? {
                      borderColor: getNodeColor(node) + '80',
                      backgroundColor: getNodeColor(node) + '20'
                    } : undefined}
                  >
                  <div className="flex items-center gap-2">
                    <span className="text-bright-orange font-bold">
                      {index + 1}
                    </span>
                    {isNodeExecuting(node.id) && (
                      <span className="text-warning-yellow animate-pulse">▶</span>
                    )}
                  </div>
                  <span className="text-3xl">{getNodeIcon(node)}</span>
                  <span className="text-sm whitespace-nowrap">{getNodeName(node)}</span>
                  
                  {/* Отображение и редактирование параметров */}
                  {hasParameters(node.nodeType) && !executionState.running && (
                    <div className="text-xs mt-1" onClick={(e) => e.stopPropagation()}>
                      {node.nodeType === 'wait' && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={node.parameters?.seconds || 1}
                            onChange={(e) => {
                              const seconds = parseInt(e.target.value) || 1;
                              handleUpdateNodeParameters(index, { seconds });
                            }}
                            className="w-12 px-1 py-0.5 bg-deep-blue border border-bright-cyan/50 rounded text-white text-center"
                          />
                          <span className="text-bright-orange">сек</span>
                        </div>
                      )}
                      {node.nodeType === 'log' && (
                        <input
                          type="text"
                          value={node.parameters?.message || 'Объект найден'}
                          onChange={(e) => {
                            handleUpdateNodeParameters(index, { message: e.target.value });
                          }}
                          className="w-32 px-1 py-0.5 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs"
                          placeholder="Сообщение"
                        />
                      )}
                    </div>
                  )}
                  
                  {hasParameters(node.nodeType) && executionState.running && node.parameters && (
                    <div className="text-xs text-bright-orange mt-1">
                      {node.nodeType === 'wait' && `${node.parameters.seconds || 1}с`}
                      {node.nodeType === 'log' && node.parameters.message && `"${node.parameters.message.substring(0, 10)}..."`}
                    </div>
                  )}
                  
                  {!executionState.running && (
                    <button
                      onClick={() => handleRemoveNode(index)}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs bg-error-red/20 text-error-red rounded hover:bg-error-red/40 transition-all"
                      title="Удалить блок"
                    >
                      ✕
                    </button>
                  )}
                  </div>
                )}
              </div>
            ))}

            {/* Drop zone в конце */}
            <div
              onDragOver={(e) => handleDragOver(e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e)}
              className={`
                transition-all flex items-center justify-center
                ${dragOverIndex === program.length 
                  ? 'h-16 bg-bright-orange/20 border-2 border-dashed border-bright-orange rounded my-2' 
                  : 'h-4 hover:h-8 hover:bg-bright-cyan/10 rounded'
                }
              `}
            >
              {dragOverIndex === program.length && (
                <div className="text-bright-orange text-2xl">
                  ⬇
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
        <span>Блоков в программе: {program.length}</span>
        {program.length > 0 && (
          <button
            onClick={handleClearProgram}
            className="px-3 py-1 text-sm bg-error-red/20 text-error-red border border-error-red rounded hover:bg-error-red/30 transition-colors"
          >
            🗑️ Очистить
          </button>
        )}
      </div>
    </div>
  );
};
