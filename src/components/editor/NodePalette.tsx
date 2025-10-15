import { NODE_DEFINITIONS } from '../../core/nodes/nodeDefinitions';
import { useMissionStore } from '../../store/useMissionStore';
import { FunctionPalette } from './FunctionPalette';

export const NodePalette = () => {
  const { currentMission } = useMissionStore();

  if (!currentMission) return null;

  const availableNodeTypes = currentMission.availableNodes;

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('nodeType', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getNodesByCategory = () => {
    const categories: Record<string, typeof NODE_DEFINITIONS[string][]> = {
      movement: [],
      action: [],
      utility: [],
      loop: [],
      conditional: [],
    };

    availableNodeTypes.forEach(nodeType => {
      const node = NODE_DEFINITIONS[nodeType];
      if (node) {
        const category = node.category;
        if (categories[category]) {
          categories[category].push(node);
        }
      }
    });

    return categories;
  };

  const nodesByCategory = getNodesByCategory();

  const categoryNames: Record<string, string> = {
    movement: 'Движение',
    action: 'Действия',
    utility: 'Служебные',
    loop: 'Циклы',
    conditional: 'Условия',
  };

  return (
    <div className="w-64 bg-dark-purple border-r border-bright-cyan/30 p-4 overflow-y-auto">
      <h2 className="text-xl font-heading mb-4">📦 Блоки</h2>

      {Object.entries(nodesByCategory).map(([category, nodes]) => {
        if (nodes.length === 0) return null;

        return (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-bold text-bright-cyan mb-2">
              {categoryNames[category]}
            </h3>
            <div className="space-y-2">
              {nodes.map(node => (
                <div
                  key={node.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.type)}
                  className="p-3 bg-deep-blue rounded border border-bright-cyan/50 cursor-grab active:cursor-grabbing hover:bg-bright-cyan/10 transition-colors"
                  title={node.description}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{node.icon}</span>
                    <span className="text-sm">{node.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Панель функций */}
      <FunctionPalette />

      <div className="mt-6 p-3 bg-bright-cyan/10 rounded border border-bright-cyan/30">
        <p className="text-xs text-gray-300">
          💡 Перетащите блоки в область программы
        </p>
      </div>
    </div>
  );
};
