import { useState } from 'react';
import { ProgramNodeInstance } from '../../types/nodes';
import { NODE_DEFINITIONS } from '../../core/nodes/nodeDefinitions';

interface ContainerNodeProps {
  node: ProgramNodeInstance;
  index: number;
  isExecuting: boolean;
  onUpdateNode: (index: number, node: ProgramNodeInstance) => void;
  onRemoveNode: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export const ContainerNode = ({
  node,
  index,
  isExecuting,
  onUpdateNode,
  onRemoveNode,
  onDragStart,
  onDragEnd,
  isDragging,
}: ContainerNodeProps) => {
  const [dragOverChildIndex, setDragOverChildIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const nodeDef = NODE_DEFINITIONS[node.nodeType];
  const children = node.children || [];

  const handleChildDragOver = (e: React.DragEvent, childIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverChildIndex(childIndex !== undefined ? childIndex : children.length);
  };

  const handleChildDragLeave = () => {
    setDragOverChildIndex(null);
  };

  const handleChildDrop = (e: React.DragEvent, childIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverChildIndex(null);

    const nodeType = e.dataTransfer.getData('nodeType');
    if (!nodeType) return;

    const newChild: ProgramNodeInstance = {
      id: `node_${Date.now()}_${Math.random()}`,
      nodeType,
      parameters: {},
    };

    const newChildren = [...children];
    const insertIndex = childIndex !== undefined ? childIndex : children.length;
    newChildren.splice(insertIndex, 0, newChild);

    onUpdateNode(index, { ...node, children: newChildren });
  };

  const handleRemoveChild = (childIndex: number) => {
    const newChildren = children.filter((_, i) => i !== childIndex);
    onUpdateNode(index, { ...node, children: newChildren });
  };

  const handleUpdateParameter = (paramName: string, value: any) => {
    onUpdateNode(index, {
      ...node,
      parameters: { ...node.parameters, [paramName]: value },
    });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      className={`
        relative border-2 rounded-lg transition-all
        ${isDragging ? 'opacity-50' : ''}
        ${isExecuting 
          ? 'bg-warning-yellow/30 border-warning-yellow shadow-lg shadow-warning-yellow/50' 
          : 'bg-deep-blue/50 border-bright-cyan/50'
        }
      `}
    >
      {/* Заголовок контейнера */}
      <div className="flex items-center justify-between p-3 border-b border-bright-cyan/30 cursor-move">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-bright-cyan hover:text-white transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="text-2xl">{nodeDef?.icon || '❓'}</span>
          <span className="font-bold text-white">{nodeDef?.name || node.nodeType}</span>
          
          {/* Параметры */}
          {nodeDef?.parameters?.map((param) => (
            <div key={param.name} className="flex items-center gap-1 ml-2">
              {param.type === 'number' && (
                <>
                  <input
                    type="number"
                    min={param.min}
                    max={param.max}
                    value={node.parameters?.[param.name] ?? param.default}
                    onChange={(e) => {
                      e.stopPropagation();
                      const value = e.target.value === '' ? param.default : parseInt(e.target.value);
                      handleUpdateParameter(param.name, value);
                    }}
                    onKeyDown={(e) => {
                      // Разрешаем навигацию и редактирование - НЕ останавливаем эти события
                      if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Home', 'End', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
                        return; // Пропускаем эти клавиши - они работают нормально
                      }
                      // Останавливаем только остальные события (например, пробел, Enter и т.д.)
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-20 px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-sm text-center"
                  />
                  <span className="text-sm text-bright-orange">{param.label}</span>
                </>
              )}
              {param.type === 'expression' && (
                <input
                  type="text"
                  value={node.parameters?.[param.name] || param.default}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdateParameter(param.name, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={param.default}
                  className="px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-sm w-32"
                />
              )}
            </div>
          ))}
        </div>

        {/* Кнопка удаления */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveNode(index);
          }}
          className="w-6 h-6 bg-error-red text-white rounded-full hover:bg-error-red/80 transition-colors flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>

      {/* Тело контейнера (вложенные блоки) */}
      {isExpanded && (
        <div className="p-3 min-h-[80px]">
          {children.length === 0 ? (
            <div
              onDragOver={(e) => handleChildDragOver(e)}
              onDragLeave={handleChildDragLeave}
              onDrop={(e) => handleChildDrop(e)}
              className="border-2 border-dashed border-bright-cyan/30 rounded p-4 text-center text-gray-400 text-sm"
            >
              Перетащите блоки сюда...
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child, childIndex) => (
                <div key={child.id} className="relative">
                  {/* Drop zone */}
                  {dragOverChildIndex === childIndex && (
                    <div className="h-8 bg-bright-orange/20 border-2 border-dashed border-bright-orange rounded mb-2 flex items-center justify-center text-bright-orange text-xs">
                      ⬇ Вставить здесь
                    </div>
                  )}

                  {/* Вложенный блок */}
                  <div
                    onDragOver={(e) => handleChildDragOver(e, childIndex)}
                    onDragLeave={handleChildDragLeave}
                    className="flex items-center gap-2 p-2 bg-bright-cyan/10 border border-bright-cyan/30 rounded hover:bg-bright-cyan/20 transition-colors group"
                  >
                    <span className="text-bright-orange font-bold text-sm">{childIndex + 1}</span>
                    <span className="text-xl">{NODE_DEFINITIONS[child.nodeType]?.icon || '❓'}</span>
                    <span className="text-sm">{NODE_DEFINITIONS[child.nodeType]?.name || child.nodeType}</span>
                    
                    {/* Параметры вложенного блока */}
                    {NODE_DEFINITIONS[child.nodeType]?.parameters && (
                      <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                        {NODE_DEFINITIONS[child.nodeType].parameters!.map((param) => (
                          <div key={param.name} className="flex items-center gap-1">
                            {param.type === 'number' && (
                              <>
                                <input
                                  type="number"
                                  min={param.min}
                                  max={param.max}
                                  value={child.parameters?.[param.name] ?? param.default}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const value = e.target.value === '' ? param.default : parseInt(e.target.value);
                                    const newChildren = [...children];
                                    newChildren[childIndex] = {
                                      ...child,
                                      parameters: { ...child.parameters, [param.name]: value }
                                    };
                                    onUpdateNode(index, { ...node, children: newChildren });
                                  }}
                                  onKeyDown={(e) => {
                                    if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Home', 'End', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
                                      return;
                                    }
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="w-14 px-1 py-0.5 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs text-center"
                                />
                                <span className="text-xs text-bright-orange">{param.label}</span>
                              </>
                            )}
                            {param.type === 'string' && (
                              <>
                                <input
                                  type="text"
                                  value={child.parameters?.[param.name] || param.default}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const newChildren = [...children];
                                    newChildren[childIndex] = {
                                      ...child,
                                      parameters: { ...child.parameters, [param.name]: e.target.value }
                                    };
                                    onUpdateNode(index, { ...node, children: newChildren });
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  placeholder={param.default}
                                  className="w-20 px-1 py-0.5 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs"
                                />
                                <span className="text-xs text-bright-orange">{param.label}</span>
                              </>
                            )}
                            {param.type === 'expression' && (
                              <>
                                <input
                                  type="text"
                                  value={child.parameters?.[param.name] || param.default}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const newChildren = [...children];
                                    newChildren[childIndex] = {
                                      ...child,
                                      parameters: { ...child.parameters, [param.name]: e.target.value }
                                    };
                                    onUpdateNode(index, { ...node, children: newChildren });
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  placeholder={param.default}
                                  className="w-24 px-1 py-0.5 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs"
                                />
                                <span className="text-xs text-bright-orange">{param.label}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleRemoveChild(childIndex)}
                      className="opacity-0 group-hover:opacity-100 text-error-red hover:text-error-red/80 transition-all text-sm ml-auto"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Drop zone в конце */}
              <div
                onDragOver={(e) => handleChildDragOver(e, children.length)}
                onDragLeave={handleChildDragLeave}
                onDrop={(e) => handleChildDrop(e, children.length)}
                className={`
                  transition-all rounded
                  ${dragOverChildIndex === children.length 
                    ? 'h-8 bg-bright-orange/20 border-2 border-dashed border-bright-orange flex items-center justify-center text-bright-orange text-xs' 
                    : 'h-4 hover:h-8 hover:bg-bright-cyan/10'
                  }
                `}
              >
                {dragOverChildIndex === children.length && '⬇ Вставить в конец'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Индикатор количества блоков */}
      {!isExpanded && children.length > 0 && (
        <div className="px-3 pb-2 text-xs text-gray-400">
          {children.length} блоков внутри
        </div>
      )}
    </div>
  );
};
