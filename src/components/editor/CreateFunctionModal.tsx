import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface CreateFunctionModalProps {
  onClose: () => void;
  onCreated?: (functionId: string) => void;
}

const AVAILABLE_ICONS = ['📦', '🔄', '🏠', '⚙️', '🎯', '🔍', '🚀', '⭐', '🔧', '📡'];
const AVAILABLE_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

export const CreateFunctionModal = ({ onClose, onCreated }: CreateFunctionModalProps) => {
  const { createFunction } = useGameStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    // Валидация
    if (!name.trim()) {
      setError('Введите название функции');
      return;
    }

    if (name.length > 20) {
      setError('Название слишком длинное (макс. 20 символов)');
      return;
    }

    // Создаем функцию
    const functionId = createFunction(name.trim(), selectedIcon, selectedColor, description.trim() || undefined);
    
    // Вызываем callback если есть
    if (onCreated) {
      onCreated(functionId);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-deep-blue border border-bright-cyan rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-bright-cyan">Создать функцию</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Название */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Название функции *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="СобратьОбразец"
            className="w-full px-3 py-2 bg-deep-blue border border-bright-cyan/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-bright-cyan"
            maxLength={20}
            autoFocus
          />
          {error && (
            <div className="text-error-red text-xs mt-1">{error}</div>
          )}
        </div>

        {/* Иконка */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Иконка
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`
                  text-2xl p-2 rounded border transition-all
                  ${selectedIcon === icon 
                    ? 'border-bright-cyan bg-bright-cyan/20' 
                    : 'border-gray-600 hover:border-bright-cyan/50'
                  }
                `}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Цвет
          </label>
          <div className="flex gap-2">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`
                  w-10 h-10 rounded border-2 transition-all
                  ${selectedColor === color 
                    ? 'border-white scale-110' 
                    : 'border-transparent hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Описание */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Описание (опционально)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Собирает образец и относит на базу"
            className="w-full px-3 py-2 bg-deep-blue border border-bright-cyan/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-bright-cyan"
            maxLength={50}
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-bright-cyan text-deep-blue font-bold rounded hover:bg-bright-cyan/90 transition-colors"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
