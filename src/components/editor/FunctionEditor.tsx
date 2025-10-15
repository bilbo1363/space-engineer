import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ProgramNodeInstance } from '../../types/nodes';
import { NODE_DEFINITIONS } from '../../core/nodes/nodeDefinitions';
import { validateFunction, canDeleteFunction } from '../../utils/functionValidator';

interface FunctionEditorProps {
  functionId: string;
  onClose: () => void;
}

export const FunctionEditor = ({ functionId, onClose }: FunctionEditorProps) => {
  const { getFunctionById, updateFunction, deleteFunction, userFunctions } = useGameStore();
  const func = getFunctionById(functionId);
  
  const [body, setBody] = useState<ProgramNodeInstance[]>(func?.body || []);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  if (!func) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-deep-blue border border-error-red rounded-lg p-6">
          <p className="text-error-red">Функция не найдена!</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 rounded">
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedNodeIndex !== null) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'copy';
    }
    
    const targetIndex = index !== undefined ? index : body.length;
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
    const draggedIndex = e.dataTransfer.getData('draggedIndex');
    
    // Перемещение существующей ноды
    if (draggedIndex !== '') {
      const fromIndex = parseInt(draggedIndex);
      const toIndex = index !== undefined ? index : body.length;
      
      if (fromIndex === toIndex) {
        setDraggedNodeIndex(null);
        return;
      }
      
      const newBody = [...body];
      const [movedNode] = newBody.splice(fromIndex, 1);
      const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      newBody.splice(adjustedToIndex, 0, movedNode);
      
      setBody(newBody);
      setDraggedNodeIndex(null);
      return;
    }
    
    // Добавление новой ноды
    if (!nodeType) return;

    const newNode: ProgramNodeInstance = {
      id: `node_${Date.now()}_${Math.random()}`,
      nodeType,
      parameters: {},
    };

    const newBody = [...body];
    const insertIndex = index !== undefined ? index : body.length;
    newBody.splice(insertIndex, 0, newNode);
    setBody(newBody);
  };

  const handleRemoveNode = (index: number) => {
    const newBody = body.filter((_, i) => i !== index);
    setBody(newBody);
  };

  const handleSave = () => {
    if (!func) return;

    // Валидация перед сохранением
    const tempFunc = { ...func, body };
    const validation = validateFunction(tempFunc, userFunctions);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
      return;
    }

    // Показываем предупреждения, но разрешаем сохранить
    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
    }

    updateFunction(functionId, body);
    onClose();
  };

  const handleDelete = () => {
    if (!func) return;

    // Проверяем, используется ли функция
    const deleteCheck = canDeleteFunction(functionId, userFunctions);
    
    if (!deleteCheck.canDelete) {
      const usedByList = deleteCheck.usedBy.join(', ');
      alert(`Невозможно удалить функцию "${func.name}".\nОна используется в: ${usedByList}`);
      return;
    }

    if (confirm(`Удалить функцию "${func.name}"?`)) {
      deleteFunction(functionId);
      onClose();
    }
  };

  const getNodeIcon = (nodeType: string): string => {
    const node = NODE_DEFINITIONS[nodeType];
    return node?.icon || '❓';
  };

  const getNodeName = (nodeType: string): string => {
    const node = NODE_DEFINITIONS[nodeType];
    return node?.name || nodeType;
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-bright-cyan hover:text-white transition-colors"
              title="Назад к программе"
            >
              ← Назад
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{func.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-bright-cyan">
                  Функция: {func.name}
                </h2>
                {func.description && (
                  <p className="text-xs text-gray-400">{func.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-2 py-1 text-sm bg-error-red/20 text-error-red rounded hover:bg-error-red/30 transition-colors"
            >
              🗑️ Удалить
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-bright-cyan text-deep-blue font-bold rounded hover:bg-bright-cyan/90 transition-colors"
            >
              💾 Сохранить
            </button>
          </div>
        </div>

        {/* Тело функции */}
        <div className="flex-1 overflow-auto">
          <div className="mb-2 text-xs text-gray-400">
            Тело функции ({body.length} блоков):
          </div>
          
          <div
            className={`
              bg-deep-blue/50 rounded border-2 p-4 overflow-x-auto overflow-y-hidden
              ${dragOverIndex !== null ? 'border-bright-orange' : 'border-bright-cyan/30'}
              ${body.length === 0 ? 'flex items-center justify-center min-h-[150px]' : ''}
            `}
          >
            {body.length === 0 ? (
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
                  Перетащите блоки сюда...
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 h-full">
                {body.map((node, index) => (
                  <div key={node.id} className="flex items-center">
                    {/* Drop zone между блоками */}
                    <div
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`
                        transition-all flex items-center justify-center
                        ${dragOverIndex === index 
                          ? 'w-20 bg-bright-orange/20 border-2 border-dashed border-bright-orange rounded mx-2 h-32' 
                          : 'w-8 hover:w-16 hover:bg-bright-cyan/10 rounded h-32'
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
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('draggedIndex', index.toString());
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedNodeIndex(index);
                      }}
                      onDragEnd={() => setDraggedNodeIndex(null)}
                      className={`
                        relative flex flex-col items-center gap-2 p-3 rounded border transition-all group min-w-fit
                        ${draggedNodeIndex === index ? 'opacity-50' : ''}
                        bg-bright-cyan/10 border-bright-cyan/30 hover:bg-bright-cyan/20
                        cursor-move
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-bright-orange font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-3xl">{getNodeIcon(node.nodeType)}</span>
                      <span className="text-sm whitespace-nowrap">{getNodeName(node.nodeType)}</span>
                      
                      {/* Параметры блока */}
                      {NODE_DEFINITIONS[node.nodeType]?.parameters && (
                        <div className="mt-2 space-y-1" onClick={(e) => e.stopPropagation()}>
                          {NODE_DEFINITIONS[node.nodeType].parameters!.map((param) => (
                            <div key={param.name} className="flex flex-col items-center gap-1">
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
                                      const newBody = [...body];
                                      newBody[index] = {
                                        ...node,
                                        parameters: { ...node.parameters, [param.name]: value }
                                      };
                                      setBody(newBody);
                                    }}
                                    onKeyDown={(e) => {
                                      if (['ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Home', 'End', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
                                        return;
                                      }
                                      e.stopPropagation();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="w-16 px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs text-center"
                                  />
                                  <span className="text-xs text-bright-orange">{param.label}</span>
                                </>
                              )}
                              {param.type === 'string' && (
                                <>
                                  <input
                                    type="text"
                                    value={node.parameters?.[param.name] || param.default}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const newBody = [...body];
                                      newBody[index] = {
                                        ...node,
                                        parameters: { ...node.parameters, [param.name]: e.target.value }
                                      };
                                      setBody(newBody);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder={param.default}
                                    className="w-24 px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs"
                                  />
                                  <span className="text-xs text-bright-orange">{param.label}</span>
                                </>
                              )}
                              {param.type === 'expression' && (
                                <>
                                  <input
                                    type="text"
                                    value={node.parameters?.[param.name] || param.default}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const newBody = [...body];
                                      newBody[index] = {
                                        ...node,
                                        parameters: { ...node.parameters, [param.name]: e.target.value }
                                      };
                                      setBody(newBody);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder={param.default}
                                    className="w-28 px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-xs"
                                  />
                                  <span className="text-xs text-bright-orange">{param.label}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Кнопка удаления */}
                      <button
                        onClick={() => handleRemoveNode(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-error-red text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* Drop zone в конце */}
                <div
                  onDragOver={(e) => handleDragOver(e, body.length)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, body.length)}
                  className={`
                    transition-all flex items-center justify-center
                    ${dragOverIndex === body.length 
                      ? 'w-20 bg-bright-orange/20 border-2 border-dashed border-bright-orange rounded mx-2 h-32' 
                      : 'w-8 hover:w-16 hover:bg-bright-cyan/10 rounded h-32'
                    }
                  `}
                >
                  {dragOverIndex === body.length && (
                    <div className="text-bright-orange text-2xl">
                      ⬇
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ошибки валидации */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-error-red/20 rounded border border-error-red">
              <div className="font-bold text-error-red mb-2">❌ Ошибки:</div>
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm text-error-red">
                  • {error}
                </div>
              ))}
            </div>
          )}

          {/* Предупреждения валидации */}
          {validationWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-warning-yellow/20 rounded border border-warning-yellow">
              <div className="font-bold text-warning-yellow mb-2">⚠️ Предупреждения:</div>
              {validationWarnings.map((warning, index) => (
                <div key={index} className="text-sm text-warning-yellow">
                  • {warning}
                </div>
              ))}
            </div>
          )}

          {/* Подсказка */}
          <div className="mt-4 p-3 bg-bright-cyan/10 rounded border border-bright-cyan/30">
            <p className="text-xs text-gray-300">
              💡 Перетащите блоки из палитры слева в тело функции
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
