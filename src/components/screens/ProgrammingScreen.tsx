import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameFlowStore } from '../../store/useGameFlowStore';
import { useGameStore } from '../../store/useGameStore';
import { Simulator2D } from '../simulator/Simulator2D';
import { NodeBasedEditor } from '../editor/NodeBasedEditor';
import { FlowNodePalette } from '../editor/FlowNodePalette';
import { ProgramGraph } from '../../types/flowGraph';
import { GraphConverter } from '../../utils/graphConverter';

const ProgrammingContent = () => {
  const { mission, goToBriefing, goToExecution, setProgram: setFlowProgram, resetMissionToInitial, programGraph, setProgramGraph } = useGameFlowStore();
  const { getFunctionById } = useGameStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Дефолтный граф (используется только при первом входе)
  const getDefaultGraph = (): ProgramGraph => ({
    nodes: [
      {
        id: 'start',
        type: 'start',
        position: { x: 50, y: 250 },
        data: { label: 'Начало', icon: '▶️' },
      },
      {
        id: 'end',
        type: 'end',
        position: { x: 600, y: 250 },
        data: { label: 'Конец', icon: '⏹️' },
      },
    ],
    edges: [],
  });
  
  // Загружаем граф из store или создаем новый
  const [flowGraph, setFlowGraph] = useState<ProgramGraph>(() => programGraph || getDefaultGraph());
  
  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Текущая программа (конвертированная из графа)
  const [currentProgram, setCurrentProgram] = useState(() => {
    const converter = new GraphConverter(flowGraph);
    return converter.convert();
  });

  if (!mission) return null;

  const handleGoToPolygon = () => {
    // Валидация графа
    const validation = GraphConverter.validate(flowGraph);
    if (!validation.valid) {
      alert('Ошибки в графе:\n' + validation.errors.join('\n'));
      return;
    }
    
    // Конвертируем граф в программу
    const converter = new GraphConverter(flowGraph);
    const program = converter.convert();
    
    if (program.length === 0) {
      alert('Программа пуста! Добавьте блоки.');
      return;
    }
    
    setFlowProgram(program);
    goToExecution();
  };

  const handleGraphChange = useCallback((newGraph: ProgramGraph) => {
    setFlowGraph(newGraph);
    
    // Конвертируем граф в программу для симулятора
    const converter = new GraphConverter(newGraph);
    const convertedProgram = converter.convert();
    setCurrentProgram(convertedProgram);
    console.log('🔄 Граф обновлён, программа конвертирована:', convertedProgram);
    
    // КРИТИЧЕСКИ ВАЖНО: Сохраняем граф в store с задержкой (debounce)
    // Это предотвращает сохранение при каждом движении мыши во время перетаскивания
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setProgramGraph(newGraph);
      console.log('💾 Граф сохранён в store');
    }, 500); // Сохраняем через 500мс после последнего изменения
  }, [setProgramGraph]);

  return (
    <div className="h-screen bg-deep-blue text-white flex overflow-hidden">
      {/* Левая панель: Палитра */}
      <div className="w-[300px] flex flex-col border-r border-bright-cyan/30 flex-shrink-0">
        {/* Заголовок */}
        <div className="p-4 border-b border-bright-cyan/30 bg-dark-purple">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-heading text-bright-cyan">
              {mission.stage}.{mission.order}
            </h1>
            <button
              onClick={() => {
                // Сбрасываем миссию при возврате к брифингу
                resetMissionToInitial();
                goToBriefing();
              }}
              className="px-3 py-1 text-sm bg-bright-cyan/20 text-bright-cyan rounded hover:bg-bright-cyan/30 transition-colors"
              title="Вернуться к брифингу"
            >
              ℹ️
            </button>
          </div>
          
          <div className="text-xs text-gray-400">
            🎨 Визуальный редактор
          </div>
        </div>

        {/* Палитра блоков */}
        <div className="flex-1 overflow-y-auto">
          <FlowNodePalette />
        </div>
      </div>

      {/* Центральная панель: Визуальный редактор */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-2xl font-heading">🎨 Визуальный редактор</h2>
            <button
              onClick={handleGoToPolygon}
              className="px-6 py-2 bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue font-bold rounded hover:scale-105 transition-transform flex-shrink-0"
            >
              🎮 Полигон
            </button>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <NodeBasedEditor
              initialGraph={flowGraph}
              onGraphChange={handleGraphChange}
            />
          </div>
        </div>
      </div>

      {/* Правая панель: 2D Симулятор */}
      <div className="w-[400px] p-6 bg-dark-purple/50 border-l border-bright-cyan/30 flex flex-col flex-shrink-0 overflow-hidden">
        <h3 className="text-xl font-heading mb-4 text-bright-cyan flex-shrink-0">🧪 Тест</h3>
        <div className="flex-1 overflow-auto min-h-0 flex flex-col gap-4">
          <div className="flex-shrink-0">
            <Simulator2D
              mission={mission}
              program={currentProgram}
              getFunctionById={getFunctionById}
            />
          </div>
          
          {/* Описание миссии */}
          <div className="flex-shrink-0 p-4 bg-deep-blue/50 rounded border border-bright-cyan/20">
            <h4 className="text-sm font-bold text-bright-orange mb-2">📋 Описание миссии</h4>
            <p className="text-sm text-gray-300 mb-3">{mission.description}</p>
            
            {/* Цели миссии */}
            {mission.objectives && mission.objectives.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-bold text-warning-yellow mb-1">🎯 Цели:</h4>
                <ul className="space-y-1">
                  {mission.objectives.map((obj, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-warning-yellow">•</span>
                      <span>{obj.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {mission.story && (
              <>
                <h4 className="text-sm font-bold text-bright-cyan mb-2">📖 История</h4>
                <p className="text-xs text-gray-400 italic">{mission.story}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgrammingScreen = () => {
  return <ProgrammingContent />;
};
