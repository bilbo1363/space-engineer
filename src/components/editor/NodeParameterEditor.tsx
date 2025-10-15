import { useState } from 'react';
import { ProgramNodeInstance } from '../../types/nodes';
import { NODE_DEFINITIONS } from '../../core/nodes/nodeDefinitions';

interface NodeParameterEditorProps {
  node: ProgramNodeInstance;
  onUpdate: (parameters: Record<string, any>) => void;
  onClose: () => void;
}

export const NodeParameterEditor = ({ node, onUpdate, onClose }: NodeParameterEditorProps) => {
  const nodeDef = NODE_DEFINITIONS[node.nodeType];
  const [parameters, setParameters] = useState(node.parameters || {});

  if (!nodeDef || !nodeDef.parameters || nodeDef.parameters.length === 0) {
    return null;
  }

  const handleSave = () => {
    onUpdate(parameters);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 bg-dark-purple border-2 border-bright-cyan rounded p-4 shadow-xl z-50 min-w-[200px]">
      <h3 className="text-sm font-bold mb-3 text-bright-cyan">Параметры</h3>
      
      {nodeDef.parameters.map(param => (
        <div key={param.name} className="mb-3">
          <label className="block text-xs text-gray-300 mb-1">
            {param.label}
          </label>
          
          {param.type === 'number' && (
            <input
              type="number"
              value={parameters[param.name] || param.default || 0}
              onChange={(e) => setParameters({
                ...parameters,
                [param.name]: parseFloat(e.target.value) || 0
              })}
              min={param.min}
              max={param.max}
              className="w-full px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-sm"
            />
          )}
          
          {param.type === 'string' && (
            <input
              type="text"
              value={parameters[param.name] || param.default || ''}
              onChange={(e) => setParameters({
                ...parameters,
                [param.name]: e.target.value
              })}
              className="w-full px-2 py-1 bg-deep-blue border border-bright-cyan/50 rounded text-white text-sm"
            />
          )}
          
          {param.type === 'boolean' && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={parameters[param.name] || param.default || false}
                onChange={(e) => setParameters({
                  ...parameters,
                  [param.name]: e.target.checked
                })}
                className="w-4 h-4"
              />
              <span className="text-xs text-gray-300">Включено</span>
            </label>
          )}
        </div>
      ))}
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-1 bg-bright-cyan text-deep-blue rounded hover:bg-bright-orange transition-colors text-sm font-bold"
        >
          Сохранить
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-sm"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};
