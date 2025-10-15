interface NodePaletteItem {
  type: string;
  label: string;
  icon: string;
  category: string;
  color: string;
}

export const FlowNodePalette = () => {
  // Создаём палитру из доступных команд
  const paletteItems: NodePaletteItem[] = [
    // Системные блоки
    { type: 'start', label: 'Начало', icon: '▶️', category: 'system', color: '#00FF00' },
    { type: 'end', label: 'Конец', icon: '⏹️', category: 'system', color: '#FF0000' },
    
    // Базовые команды
    { type: 'moveForward', label: 'Вперед', icon: '↑', category: 'action', color: '#00FFFF' },
    { type: 'turnLeft', label: 'Налево', icon: '↰', category: 'action', color: '#00FFFF' },
    { type: 'turnRight', label: 'Направо', icon: '↱', category: 'action', color: '#00FFFF' },
    { type: 'customAction', label: 'Действие', icon: '🎯', category: 'customAction', color: '#00FFFF' },
    
    // Условия
    { type: 'condition', label: 'Условие', icon: '❓', category: 'condition', color: '#FFD700' },
    
    // Циклы
    { type: 'repeat', label: 'Повторить', icon: '🔁', category: 'loop', color: '#FF8C00' },
    { type: 'while', label: 'Пока', icon: '🔄', category: 'loop', color: '#FF8C00' },
  ];

  const onDragStart = (event: React.DragEvent, item: NodePaletteItem) => {
    const nodeData: any = {
      type: item.category,
      nodeType: item.type,
      label: item.label,
      icon: item.icon,
    };

    // Для циклов добавляем параметры по умолчанию
    if (item.category === 'loop') {
      if (item.type === 'repeat') {
        nodeData.loopType = 'repeat';
        nodeData.count = 5;
        nodeData.label = 'Повторить 5';
      } else if (item.type === 'while') {
        nodeData.loopType = 'while';
        nodeData.condition = 'energy > 50';
        nodeData.label = 'Пока energy > 50';
      }
    }
    
    // Для условий добавляем параметры по умолчанию
    if (item.category === 'condition') {
      nodeData.condition = 'isDoorOpen';
      nodeData.label = 'Дверь открыта';
    }
    
    // Для customAction добавляем параметры по умолчанию
    if (item.category === 'customAction') {
      nodeData.type = 'customAction';
      nodeData.actionType = 'activate';
      nodeData.label = 'Активировать';
      nodeData.icon = '⚡';
    }

    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 bg-dark-purple rounded border border-bright-cyan/30">
      <h3 className="text-lg font-heading text-bright-cyan mb-4">📦 Блоки</h3>
      
      {/* Системные блоки */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Системные</div>
        <div className="space-y-2">
          {paletteItems.filter(item => item.category === 'system').map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-500/30 rounded cursor-move hover:bg-gray-600/50 hover:border-gray-400 transition-all flex items-center gap-2"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Действия */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Действия</div>
        <div className="space-y-2">
          {paletteItems.filter(item => item.category === 'action').map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="px-3 py-2 bg-bright-cyan/10 border border-bright-cyan/30 rounded cursor-move hover:bg-bright-cyan/20 hover:border-bright-cyan transition-all flex items-center gap-2"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
            </div>
          ))}
          {paletteItems.filter(item => item.category === 'customAction').map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="px-3 py-2 bg-bright-cyan/20 border border-bright-cyan/50 rounded cursor-move hover:bg-bright-cyan/30 hover:border-bright-cyan transition-all flex items-center gap-2"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Условия */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Условия</div>
        <div className="space-y-2">
          {paletteItems.filter(item => item.category === 'condition').map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="px-3 py-2 bg-warning-yellow/10 border border-warning-yellow/30 rounded cursor-move hover:bg-warning-yellow/20 hover:border-warning-yellow transition-all flex items-center gap-2"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Циклы */}
      <div>
        <div className="text-sm text-gray-400 mb-2">Циклы</div>
        <div className="space-y-2">
          {paletteItems.filter(item => item.category === 'loop').map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="px-3 py-2 bg-bright-orange/10 border border-bright-orange/30 rounded cursor-move hover:bg-bright-orange/20 hover:border-bright-orange transition-all flex items-center gap-2"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Перетащите блок на холст
      </div>
    </div>
  );
};
