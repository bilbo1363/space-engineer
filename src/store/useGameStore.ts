import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RobotState } from '../types/robots';
import { ProgramNodeInstance, UserFunction } from '../types/nodes';

interface ExecutionState {
  running: boolean;
  paused: boolean;
  currentNodeId: string | null;
  currentStep: number;
  totalSteps: number;
}

interface GameState {
  // Состояние робота
  robotState: RobotState;
  setRobotState: (state: Partial<RobotState>) => void;
  
  // Состояние выполнения программы
  executionState: ExecutionState;
  setExecutionState: (state: Partial<ExecutionState>) => void;
  
  // Текущая программа
  program: ProgramNodeInstance[];
  setProgram: (program: ProgramNodeInstance[]) => void;
  
  // Пользовательские функции
  userFunctions: UserFunction[];
  createFunction: (name: string, icon: string, color: string, description?: string) => string;
  updateFunction: (id: string, body: ProgramNodeInstance[]) => void;
  deleteFunction: (id: string) => void;
  getFunctionById: (id: string) => UserFunction | undefined;
  incrementFunctionUsage: (id: string) => void;
  
  // Лог выполнения
  executionLog: Array<{ timestamp: number; message: string; type: 'info' | 'warning' | 'error' }>;
  addLogEntry: (message: string, type?: 'info' | 'warning' | 'error') => void;
  clearLog: () => void;
  
  // Сброс состояния
  reset: () => void;
}

const initialRobotState: RobotState = {
  position: [0, 0],
  direction: 'east',
  energy: 100,
  inventory: [],
  isMoving: false,
};

const initialExecutionState: ExecutionState = {
  running: false,
  paused: false,
  currentNodeId: null,
  currentStep: 0,
  totalSteps: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      robotState: initialRobotState,
      setRobotState: (state) =>
        set((prev) => ({
          robotState: { ...prev.robotState, ...state },
        })),

      executionState: initialExecutionState,
      setExecutionState: (state) =>
        set((prev) => ({
          executionState: { ...prev.executionState, ...state },
        })),

      program: [],
      setProgram: (program) => set({ program }),

      // Пользовательские функции
      userFunctions: [],
      
      createFunction: (name, icon, color, description) => {
        const id = `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newFunction: UserFunction = {
          id,
          name,
          icon,
          color,
          description,
          body: [],
          createdAt: Date.now(),
          usageCount: 0,
        };
        
        set((state) => ({
          userFunctions: [...state.userFunctions, newFunction],
        }));
        
        return id;
      },
      
      updateFunction: (id, body) => {
        set((state) => ({
          userFunctions: state.userFunctions.map((func) =>
            func.id === id ? { ...func, body } : func
          ),
        }));
      },
      
      deleteFunction: (id) => {
        set((state) => ({
          userFunctions: state.userFunctions.filter((func) => func.id !== id),
        }));
      },
      
      getFunctionById: (id) => {
        return get().userFunctions.find((func) => func.id === id);
      },
      
      incrementFunctionUsage: (id) => {
        set((state) => ({
          userFunctions: state.userFunctions.map((func) =>
            func.id === id ? { ...func, usageCount: func.usageCount + 1 } : func
          ),
        }));
      },

      executionLog: [],
      addLogEntry: (message, type = 'info') =>
        set((state) => ({
          executionLog: [
            ...state.executionLog,
            { timestamp: Date.now(), message, type },
          ],
        })),
      clearLog: () => set({ executionLog: [] }),

      reset: () =>
        set({
          robotState: initialRobotState,
          executionState: initialExecutionState,
          executionLog: [],
        }),
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        userFunctions: state.userFunctions, // Сохраняем только функции
      }),
    }
  )
);
