import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CreateFunctionModal } from './CreateFunctionModal';
import { useFunctionEditor } from '../../contexts/FunctionEditorContext';

export const FunctionPalette = () => {
  const { userFunctions } = useGameStore();
  const { setEditingFunctionId } = useFunctionEditor();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedFunctionId, setDraggedFunctionId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, functionId: string) => {
    e.dataTransfer.setData('functionId', functionId);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedFunctionId(functionId);
  };

  const handleDragEnd = () => {
    setDraggedFunctionId(null);
  };

  return (
    <div className="mt-4 border-t border-bright-cyan/30 pt-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-bright-cyan flex items-center gap-2">
          <span>⭐</span>
          <span>Мои функции</span>
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-2 py-1 text-xs bg-bright-cyan/20 text-bright-cyan rounded hover:bg-bright-cyan/30 transition-colors"
          title="Создать новую функцию"
        >
          + Создать
        </button>
      </div>

      {/* Список функций */}
      {userFunctions.length === 0 ? (
        <div className="text-xs text-gray-400 italic text-center py-4">
          Пока нет функций.
          <br />
          Создайте первую!
        </div>
      ) : (
        <div className="space-y-2">
          {userFunctions.map((func) => (
            <div
              key={func.id}
              className={`
                flex items-center gap-2 p-2 rounded border transition-all relative group
                ${draggedFunctionId === func.id 
                  ? 'opacity-50 border-bright-cyan' 
                  : 'border-bright-cyan/30 hover:border-bright-cyan hover:bg-bright-cyan/10'
                }
              `}
              style={{ borderColor: func.color + '50', backgroundColor: func.color + '10' }}
            >
              {/* Draggable область */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, func.id)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-2 flex-1 cursor-move"
              >
                {/* Иконка */}
                <span className="text-2xl">{func.icon}</span>
                
                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {func.name}
                  </div>
                  {func.description && (
                    <div className="text-xs text-gray-400 truncate">
                      {func.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {func.body.length} блоков • {func.usageCount} использований
                  </div>
                </div>
              </div>

              {/* Кнопка редактирования */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFunctionId(func.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-bright-cyan/20 text-bright-cyan rounded hover:bg-bright-cyan/30"
                title="Редактировать функцию"
              >
                ✏️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания функции */}
      {isModalOpen && (
        <CreateFunctionModal
          onClose={() => setIsModalOpen(false)}
          onCreated={(functionId: string) => {
            setIsModalOpen(false);
            setEditingFunctionId(functionId);
          }}
        />
      )}
    </div>
  );
};
