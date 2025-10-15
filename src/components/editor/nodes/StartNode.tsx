import { Handle, Position } from 'reactflow';

export const StartNode = ({ data }: { data: any }) => {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-bright-cyan to-bright-orange rounded-lg border-2 border-bright-cyan shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{data.icon || '▶️'}</span>
        <div>
          <div className="font-heading font-bold text-deep-blue text-lg">
            {data.label || 'Начало'}
          </div>
          <div className="text-xs text-deep-blue/70">
            Start
          </div>
        </div>
      </div>
      
      {/* Выходная точка */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#00FFFF',
          width: 12,
          height: 12,
          border: '2px solid #0A0E2E',
        }}
      />
    </div>
  );
};
