import { Handle, Position } from 'reactflow';

export const EndNode = ({ data }: { data: any }) => {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-error-red to-bright-orange rounded-lg border-2 border-error-red shadow-lg">
      {/* Входная точка */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#00FFFF',
          width: 12,
          height: 12,
          border: '2px solid #0A0E2E',
        }}
      />
      
      <div className="flex items-center gap-3">
        <span className="text-3xl">{data.icon || '⏹️'}</span>
        <div>
          <div className="font-heading font-bold text-white text-lg">
            {data.label || 'Конец'}
          </div>
          <div className="text-xs text-white/70">
            End
          </div>
        </div>
      </div>
    </div>
  );
};
