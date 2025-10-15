import { Handle, Position } from 'reactflow';
import { ActionNodeData } from '../../../types/flowGraph';

export const ActionNode = ({ data }: { data: ActionNodeData }) => {
  return (
    <div className="px-4 py-3 bg-bright-cyan/10 rounded-lg border-2 border-bright-cyan/50 hover:border-bright-cyan hover:bg-bright-cyan/20 transition-all min-w-[150px]">
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
      
      <div className="flex items-center gap-2">
        <span className="text-2xl">{data.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-white">
            {data.label}
          </div>
          {data.parameters && Object.keys(data.parameters).length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {Object.entries(data.parameters).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          )}
        </div>
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
