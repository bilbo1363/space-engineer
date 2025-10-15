import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useMissionStore } from '../store/useMissionStore';
import { Executor } from '../core/interpreter/Executor';
import { ProgramNodeInstance } from '../types/nodes';
import { MissionValidator } from '../utils/missionValidator';
import { MissionCompleteModal } from './mission/MissionCompleteModal';
import { MissionChecker } from '../utils/missionChecker';

export const ControlPanel = () => {
  const { robotState, setRobotState, setExecutionState, program, addLogEntry, getFunctionById } = useGameStore();
  const { currentMission, setCurrentMission } = useMissionStore();
  const [executor] = useState(() => {
    const exec = new Executor(robotState, currentMission || undefined, getFunctionById);
    return exec;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [missionResult, setMissionResult] = useState({ success: false, stars: 0 });

  // Обновляем миссию в executor при изменении
  if (currentMission && executor) {
    executor.setMission(currentMission);
  }

  const handleRun = async () => {
    if (isRunning || program.length === 0) return;

    // Сбрасываем робота в начальную позицию перед запуском
    if (currentMission) {
      const initialState = {
        position: [currentMission.startPosition.x, currentMission.startPosition.y] as [number, number],
        direction: currentMission.startPosition.direction,
        energy: robotState.energy, // Сохраняем текущую энергию
        inventory: [],
      };
      setRobotState(initialState);
      executor.reset();
    }

    setIsRunning(true);
    setExecutionState({ running: true, paused: false });
    addLogEntry('Программа запущена', 'info');

    // Подписка на события интерпретатора
    executor.subscribe(event => {
      switch (event.type) {
        case 'nodeStart':
          setExecutionState({ currentNodeId: event.nodeId || null });
          break;
        case 'stateChange':
          if (event.newState) {
            setRobotState(event.newState);
          }
          break;
        case 'error':
          addLogEntry(event.error || 'Ошибка выполнения', 'error');
          break;
        case 'programComplete':
          addLogEntry('Программа завершена', 'info');
          setExecutionState({ running: false, currentNodeId: null });
          setIsRunning(false);
          
          // Проверка целей миссии
          if (currentMission) {
            const checker = new MissionChecker(currentMission, executor.getRobotState(), program);
            const progress = checker.checkObjectives();
            
            console.log('🎯 Прогресс миссии:', progress);
            
            if (progress.completed) {
              console.log('✅ Миссия выполнена!');
              setMissionResult({ success: true, stars: 3 });
              setShowModal(true);
            } else {
              console.log('❌ Миссия не выполнена');
              addLogEntry('Цели миссии не достигнуты', 'error');
            }
          }
          break;
      }
    });

    executor.loadProgram(program);
    await executor.run();
  };

  const handlePause = () => {
    executor.pause();
    setExecutionState({ paused: true });
    addLogEntry('Программа приостановлена', 'info');
  };

  const handleResume = () => {
    executor.resume();
    setExecutionState({ paused: false });
    addLogEntry('Программа возобновлена', 'info');
  };

  const handleReset = () => {
    executor.reset();
    setIsRunning(false);
    setExecutionState({ running: false, paused: false, currentNodeId: null });
    addLogEntry('Сброс выполнен', 'info');
  };

  // Тестовая программа для демонстрации
  const handleTestProgram = () => {
    const testProgram: ProgramNodeInstance[] = [
      { id: '1', nodeType: 'moveForward', parameters: {} },
      { id: '2', nodeType: 'moveForward', parameters: {} },
      { id: '3', nodeType: 'turnRight', parameters: {} },
      { id: '4', nodeType: 'moveForward', parameters: {} },
    ];
    
    console.log('🧪 Загружаем тестовую программу:', testProgram);
    useGameStore.getState().setProgram(testProgram);
    addLogEntry('✅ Загружена тестовая программа: 4 блока', 'info');
    console.log('📝 Программа в store:', useGameStore.getState().program);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Очищаем программу при выходе
    useGameStore.getState().setProgram([]);
    setCurrentMission(null);
  };

  const handleRetry = () => {
    setShowModal(false);
    handleReset();
  };

  return (
    <>
      <MissionCompleteModal
        isOpen={showModal}
        success={missionResult.success}
        stars={missionResult.stars}
        onClose={handleCloseModal}
        onRetry={handleRetry}
      />
      
      <div className="flex items-center gap-2">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className={`
          px-4 py-2 rounded font-bold transition-colors
          ${isRunning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-success-green hover:bg-success-green/80'}
        `}
      >
        ▶️ Запуск
      </button>
      
      <button
        onClick={handlePause}
        disabled={!isRunning}
        className="px-4 py-2 bg-bright-orange rounded hover:bg-bright-orange/80 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        ⏸️ Пауза
      </button>
      
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
      >
        🔄 Сброс
      </button>

      <div className="ml-4 border-l border-gray-600 pl-4">
        <button
          onClick={handleTestProgram}
          className="px-4 py-2 bg-bright-cyan text-deep-blue rounded hover:bg-bright-cyan/80 transition-colors font-bold"
        >
          🧪 Тест
        </button>
      </div>
      </div>
    </>
  );
};
