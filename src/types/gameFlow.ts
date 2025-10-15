import { Mission } from './missions';
import { ProgramNodeInstance } from './nodes';
import { ProgramGraph } from './flowGraph';

// Этапы игрового процесса
export type GameStage = 'briefing' | 'programming' | 'execution' | 'result';

// Результат выполнения миссии
export interface ExecutionResult {
  success: boolean;
  stars: number; // 1-3 звезды
  statistics: {
    distance: number;
    energyLeft: number;
    blocksUsed: number;
    executionTime: number; // в секундах
  };
  objectives: {
    [key: string]: boolean;
  };
}

// Состояние игрового процесса
export interface GameFlowState {
  stage: GameStage;
  mission: Mission | null;
  program: ProgramNodeInstance[];
  programGraph: ProgramGraph | null; // Граф программы (визуальное представление)
  executionResult: ExecutionResult | null;
}

// Действия для управления потоком
export interface GameFlowActions {
  setStage: (stage: GameStage) => void;
  startMission: (mission: Mission) => void;
  setProgram: (program: ProgramNodeInstance[]) => void;
  setProgramGraph: (graph: ProgramGraph) => void; // Сохранение графа программы
  setExecutionResult: (result: ExecutionResult) => void;
  resetFlow: () => void;
  goToBriefing: () => void;
  goToProgramming: () => void;
  goToExecution: () => void;
  goToResult: (result: ExecutionResult) => void;
}
