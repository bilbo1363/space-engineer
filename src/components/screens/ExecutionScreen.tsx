import { useState, useEffect } from 'react';
import { useGameFlowStore } from '../../store/useGameFlowStore';
import { useGameStore } from '../../store/useGameStore';
import { GameScene } from '../scene/GameScene';
import { Executor } from '../../core/interpreter/Executor';
import { MissionChecker } from '../../utils/missionChecker';

export const ExecutionScreen = () => {
  const { mission, program, goToProgramming, goToResult, resetMissionToInitial, updateMission } = useGameFlowStore();
  const { robotState, setRobotState, setExecutionState, addLogEntry, getFunctionById } = useGameStore();
  const [executor] = useState(() => {
    const exec = new Executor(robotState, mission || undefined, getFunctionById);
    return exec;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Обновляем миссию в executor при изменении
  useEffect(() => {
    if (mission) {
      executor.setMission(mission);
    }
  }, [mission, executor]);

  // Убрали автозапуск - теперь пользователь сам нажимает "Запустить"

  const handleRun = async () => {
    if (isRunning || program.length === 0 || !mission) return;

    // КРИТИЧЕСКИ ВАЖНО: Сбрасываем миссию и робота к начальному состоянию
    resetMissionToInitial();
    executor.resetMission();
    
    // Сбрасываем робота в начальную позицию
    const initialState = {
      position: [mission.startPosition.x, mission.startPosition.y] as [number, number],
      direction: mission.startPosition.direction,
      energy: 100,
      inventory: [],
      pickedUpItems: [],
      isMoving: false,
    };
    
    // КРИТИЧЕСКИ ВАЖНО: Обновляем initialState в executor перед reset
    (executor as any).initialState = { ...initialState };
    (executor as any).robotState = { ...initialState };
    
    setRobotState(initialState);

    setIsRunning(true);
    setIsPaused(false);
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
            // Обновляем миссию для форсирования ре-рендера объектов
            if (mission) {
              updateMission(mission);
            }
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
          if (mission) {
            const checker = new MissionChecker(mission, executor.getRobotState(), program);
            const progress = checker.checkObjectives();
            
            console.log('🎯 Прогресс миссии:', progress);
            
            // Переходим к результатам
            const result = {
              success: progress.completed,
              stars: progress.completed ? 3 : 0,
              statistics: {
                distance: Math.abs(executor.getRobotState().position[0] - mission.startPosition.x) +
                         Math.abs(executor.getRobotState().position[1] - mission.startPosition.y),
                energyLeft: executor.getRobotState().energy,
                blocksUsed: program.length,
                executionTime: 0, // TODO: добавить таймер
              },
              objectives: progress.objectives,
            };
            
            goToResult(result);
          }
          break;
      }
    });

    executor.loadProgram(program);
    await executor.run();
  };

  const handlePause = () => {
    executor.pause();
    setIsPaused(true);
    setExecutionState({ paused: true });
    addLogEntry('Программа приостановлена', 'info');
  };

  const handleResume = () => {
    executor.resume();
    setIsPaused(false);
    setExecutionState({ paused: false });
    addLogEntry('Программа возобновлена', 'info');
  };

  const handleStop = () => {
    executor.stop();
    setIsRunning(false);
    setIsPaused(false);
    setExecutionState({ running: false, paused: false, currentNodeId: null });
    addLogEntry('Выполнение остановлено', 'info');
  };

  const handleReset = () => {
    if (!mission) return;
    
    executor.stop();
    setIsRunning(false);
    setIsPaused(false);
    
    // Сброс робота к начальному состоянию
    const initialState = {
      position: [mission.startPosition.x, mission.startPosition.y] as [number, number],
      direction: mission.startPosition.direction,
      energy: 100,
      inventory: [],
      pickedUpItems: [],
      isMoving: false,
    };
    
    // КРИТИЧЕСКИ ВАЖНО: Обновляем initialState в executor
    (executor as any).initialState = { ...initialState };
    (executor as any).robotState = { ...initialState };
    
    setRobotState(initialState);
    setExecutionState({ running: false, paused: false, currentNodeId: null });
    
    // Восстанавливаем миссию к исходному состоянию
    resetMissionToInitial();
    executor.resetMission();
    
    addLogEntry('Миссия сброшена к начальному состоянию', 'info');
  };

  if (!mission) return null;

  return (
    <div className="h-screen bg-deep-blue text-white flex flex-col">
      {/* Верхняя панель: Статус */}
      <div className="p-4 bg-dark-purple border-b border-bright-cyan/30 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-lg font-heading">
            {mission.stage}.{mission.order} {mission.title}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning-yellow transition-all"
                  style={{ width: `${robotState.energy}%` }}
                />
              </div>
              <span>{Math.round(robotState.energy)}%</span>
            </div>
            <div>📦 {program.length} блоков</div>
          </div>
        </div>

        {/* Контролы */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Сбрасываем миссию при возврате к редактированию
              resetMissionToInitial();
              goToProgramming();
            }}
            className="px-4 py-2 bg-bright-cyan/20 text-bright-cyan rounded hover:bg-bright-cyan/30 transition-colors"
          >
            📝 Редактировать
          </button>
          
          {!isRunning ? (
            <button
              onClick={handleRun}
              className="px-4 py-2 bg-bright-cyan text-deep-blue font-bold rounded hover:bg-bright-cyan/90 transition-colors"
            >
              ▶️ Запустить
            </button>
          ) : isPaused ? (
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-warning-yellow text-deep-blue font-bold rounded hover:bg-warning-yellow/90 transition-colors"
            >
              ▶️ Продолжить
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-warning-yellow text-deep-blue font-bold rounded hover:bg-warning-yellow/90 transition-colors"
            >
              ⏸️ Пауза
            </button>
          )}
          
          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="px-4 py-2 bg-error-red text-white font-bold rounded hover:bg-error-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏹️ Стоп
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition-colors"
          >
            🔄 Сброс
          </button>
        </div>
      </div>

      {/* 3D Сцена */}
      <div className="flex-1">
        <GameScene />
      </div>
    </div>
  );
};
