import { useEffect, useRef, useState } from 'react';
import { Mission } from '../../types/missions';
import { RobotState } from '../../types/robots';
import { ProgramNodeInstance, UserFunction } from '../../types/nodes';
import { Executor } from '../../core/interpreter/Executor';
import { useGameFlowStore } from '../../store/useGameFlowStore';

interface Simulator2DProps {
  mission: Mission;
  program: ProgramNodeInstance[];
  onComplete?: (success: boolean) => void;
  getFunctionById: (id: string) => UserFunction | undefined;
}

export const Simulator2D = ({ mission, program, onComplete, getFunctionById }: Simulator2DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resetMissionToInitial } = useGameFlowStore();
  const [robotState, setRobotState] = useState<RobotState>({
    position: [mission.startPosition.x, mission.startPosition.y],
    direction: mission.startPosition.direction,
    energy: 100,
    inventory: [],
    isMoving: false,
  });
  const robotStateRef = useRef<RobotState>(robotState);
  const [isRunning, setIsRunning] = useState(false);
  const [redrawTrigger, setRedrawTrigger] = useState(0);
  const [executor] = useState(() => {
    const exec = new Executor(robotState, mission, getFunctionById);
    return exec;
  });

  // Обновляем ref при изменении состояния
  useEffect(() => {
    robotStateRef.current = robotState;
  }, [robotState]);

  // КРИТИЧЕСКИ ВАЖНО: Обновляем миссию в executor при изменении
  useEffect(() => {
    executor.setMission(mission);
    console.log('🔄 Миссия обновлена в Simulator2D executor');
  }, [mission, executor]);

  // КРИТИЧЕСКИ ВАЖНО: Обновляем программу в executor при изменении program
  useEffect(() => {
    console.log('🔄 Программа обновлена в Simulator2D, загружаем в executor:', program);
    executor.loadProgram(program);
  }, [program, executor]);

  // Вызываем отрисовку при изменении состояния
  useEffect(() => {
    console.log('🎨 Перерисовка canvas, позиция робота:', robotState.position, 'направление:', robotState.direction);
    
    // Размеры клетки (адаптивно)
    const maxCanvasWidth = 350;
    const maxCanvasHeight = 300;
    const cellSize = Math.min(
      Math.floor((maxCanvasWidth - 40) / mission.grid.width),
      Math.floor((maxCanvasHeight - 40) / mission.grid.height),
      30
    );
    const padding = 20;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Размеры canvas
    const width = mission.grid.width * cellSize + padding * 2;
    const height = mission.grid.height * cellSize + padding * 2;
    canvas.width = width;
    canvas.height = height;

    // Очистка
    ctx.fillStyle = '#0A0E2E';
    ctx.fillRect(0, 0, width, height);

    // Сетка
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1;
    for (let x = 0; x <= mission.grid.width; x++) {
      ctx.beginPath();
      ctx.moveTo(padding + x * cellSize, padding);
      ctx.lineTo(padding + x * cellSize, padding + mission.grid.height * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= mission.grid.height; y++) {
      ctx.beginPath();
      ctx.moveTo(padding, padding + y * cellSize);
      ctx.lineTo(padding + mission.grid.width * cellSize, padding + y * cellSize);
      ctx.stroke();
    }

    // Объекты миссии
    if (mission.objects && Array.isArray(mission.objects)) {
      mission.objects.forEach(obj => {
        if (!obj || !obj.position) return;
        
        const [x, z] = obj.position;
        const centerX = padding + (x + 0.5) * cellSize;
        const centerY = padding + (z + 0.5) * cellSize;

        ctx.fillStyle = obj.type === 'goal' ? '#4CAF50' : 
                        obj.type === 'obstacle' ? '#666666' : 
                        obj.type === 'station' ? '#FF8C00' : '#FFD700';
        
        if (obj.type === 'goal') {
          // Флаг
          ctx.beginPath();
          ctx.arc(centerX, centerY, cellSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (obj.type === 'obstacle') {
          // Препятствие
          ctx.fillRect(
            centerX - cellSize * 0.3,
            centerY - cellSize * 0.3,
            cellSize * 0.6,
            cellSize * 0.6
          );
        } else {
          // Другие объекты
          ctx.beginPath();
          ctx.arc(centerX, centerY, cellSize * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Робот - используем актуальное состояние из ref
    const currentState = robotStateRef.current;
    if (currentState.position && Array.isArray(currentState.position) && currentState.position.length === 2) {
      const [rx, rz] = currentState.position;
      const robotX = padding + (rx + 0.5) * cellSize;
      const robotY = padding + (rz + 0.5) * cellSize;

      // Тело робота
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.arc(robotX, robotY, cellSize * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Направление (стрелка)
      ctx.fillStyle = '#FF8C00';
      ctx.save();
      ctx.translate(robotX, robotY);
      
      // Определяем угол поворота
      let angle = 0;
      switch (currentState.direction) {
        case 'north':
          angle = -Math.PI / 2;
          break;
        case 'east':
          angle = 0;
          break;
        case 'south':
          angle = Math.PI / 2;
          break;
        case 'west':
          angle = Math.PI;
          break;
        default:
          angle = 0;
      }
      ctx.rotate(angle);
      
      ctx.beginPath();
      ctx.moveTo(cellSize * 0.3, 0);
      ctx.lineTo(-cellSize * 0.1, -cellSize * 0.15);
      ctx.lineTo(-cellSize * 0.1, cellSize * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Энергия
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px monospace';
    ctx.fillText(`⚡ ${Math.round(currentState.energy)}%`, padding, padding - 5);
  }, [robotState, mission, redrawTrigger]);

  const handleRun = async () => {
    if (isRunning || program.length === 0) return;

    setIsRunning(true);

    // Сброс состояния
    const initialState: RobotState = {
      position: [mission.startPosition.x, mission.startPosition.y],
      direction: mission.startPosition.direction,
      energy: 100,
      inventory: [],
      isMoving: false,
    };
    setRobotState(initialState);
    executor.reset();

    // Подписка на события
    executor.subscribe(event => {
      if (event.type === 'stateChange' && event.newState) {
        console.log('📍 Обновление состояния:', event.newState);
        // ВАЖНО: Создаём НОВЫЙ объект, чтобы React увидел изменение!
        setRobotState({
          ...event.newState,
          position: event.newState.position ? [...event.newState.position] as [number, number] : [0, 0],
          inventory: event.newState.inventory ? [...event.newState.inventory] : [],
        } as RobotState);
      } else if (event.type === 'programComplete') {
        console.log('✅ Программа завершена');
        setIsRunning(false);
        if (onComplete) {
          onComplete(true);
        }
      } else if (event.type === 'error') {
        console.error('❌ Ошибка:', event.error);
        setIsRunning(false);
        if (onComplete) {
          onComplete(false);
        }
      }
    });

    // Программа уже загружена через useEffect, просто запускаем
    await executor.run();
  };

  const handleReset = () => {
    executor.stop();
    setIsRunning(false);
    
    // Сброс к начальному состоянию
    const initialState: RobotState = {
      position: [mission.startPosition.x, mission.startPosition.y],
      direction: mission.startPosition.direction,
      energy: 100,
      inventory: [],
      isMoving: false,
    };
    setRobotState(initialState);
    
    // Восстанавливаем миссию к исходному состоянию в store
    resetMissionToInitial();
    
    // Восстанавливаем объекты миссии в executor
    executor.resetMission();
    
    // Принудительная перерисовка canvas
    setRedrawTrigger(prev => prev + 1);
  };

  const handleStop = () => {
    executor.stop();
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Canvas контейнер */}
      <div className="flex items-center justify-center bg-black/30 rounded p-4">
        <canvas
          ref={canvasRef}
          className="border-2 border-bright-cyan/50 rounded"
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      {/* Информация */}
      <div className="text-sm text-gray-400 text-center">
        {isRunning ? '🔄 Выполнение...' : '⏸️ Готов к тесту'}
      </div>
      
      {/* Кнопки */}
      <div className="flex gap-2">
        {!isRunning ? (
          <>
            <button
              onClick={handleRun}
              disabled={program.length === 0}
              className="px-6 py-2 bg-bright-cyan text-deep-blue font-bold rounded hover:bg-bright-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶️ Запустить
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition-colors"
            >
              🔄 Сброс
            </button>
          </>
        ) : (
          <button
            onClick={handleStop}
            className="px-6 py-2 bg-error-red text-white font-bold rounded hover:bg-error-red/90 transition-colors"
          >
            ⏹️ Остановить
          </button>
        )}
      </div>
    </div>
  );
};
