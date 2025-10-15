import { create } from 'zustand';
import { GameStage, GameFlowState, GameFlowActions, ExecutionResult } from '../types/gameFlow';
import { Mission } from '../types/missions';
import { ProgramNodeInstance } from '../types/nodes';
import { ProgramGraph } from '../types/flowGraph';

type GameFlowStore = GameFlowState & GameFlowActions & {
  initialMission: Mission | null; // Исходное состояние миссии для сброса
  resetMissionToInitial: () => void;
  updateMission: (mission: Mission) => void; // Обновление миссии для форсирования ре-рендера
};

export const useGameFlowStore = create<GameFlowStore>((set, get) => ({
  // Начальное состояние
  stage: 'briefing',
  mission: null,
  initialMission: null,
  program: [],
  programGraph: null,
  executionResult: null,

  // Действия
  setStage: (stage: GameStage) => set({ stage }),

  startMission: (mission: Mission) => {
    // Создаем глубокую копию миссии для изоляции от изменений
    const missionCopy = JSON.parse(JSON.stringify(mission));
    // Сохраняем исходное состояние для возможности сброса
    const initialMissionCopy = JSON.parse(JSON.stringify(mission));
    set({
      mission: missionCopy,
      initialMission: initialMissionCopy,
      stage: 'briefing',
      program: [],
      programGraph: null, // Сбрасываем граф при выборе новой миссии
      executionResult: null,
    });
  },

  resetMissionToInitial: () => {
    const { initialMission } = get();
    if (initialMission) {
      // Восстанавливаем миссию из исходного состояния
      const restoredMission = JSON.parse(JSON.stringify(initialMission));
      set({ mission: restoredMission });
      console.log('🔄 Миссия восстановлена к исходному состоянию');
    }
  },

  updateMission: (mission: Mission) => {
    // Создаем новую ссылку на миссию для форсирования ре-рендера
    set({ mission: { ...mission, objects: [...mission.objects] } });
  },

  setProgram: (program: ProgramNodeInstance[]) => set({ program }),

  setProgramGraph: (graph: ProgramGraph) => set({ programGraph: graph }),

  setExecutionResult: (result: ExecutionResult) => set({ executionResult: result }),

  resetFlow: () => set({
    stage: 'briefing',
    mission: null,
    program: [],
    programGraph: null, // Сбрасываем граф только при выходе в меню
    executionResult: null,
  }),

  goToBriefing: () => set({ stage: 'briefing' }),

  goToProgramming: () => set({ stage: 'programming' }),

  goToExecution: () => set({ stage: 'execution' }),

  goToResult: (result: ExecutionResult) => set({
    stage: 'result',
    executionResult: result,
  }),
}));
