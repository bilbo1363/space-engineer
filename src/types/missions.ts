// Типы для миссий

import { Direction } from './nodes';

export type Difficulty = 'tutorial' | 'easy' | 'medium' | 'hard' | 'expert';

export interface GridConfig {
  width: number;
  height: number;
  type: 'flat' | 'terrain';
}

export interface StartPosition {
  x: number;
  y: number;
  direction: Direction;
}

export interface GameObject {
  type: 'obstacle' | 'resource' | 'goal' | 'station' | 'enemy' | 'container' | 'base' | 'door' | 'terminal' | 'lever' | 'button';
  id?: string;
  position: [number, number];
  properties?: Record<string, any>;
}

export interface DynamicElement {
  type: 'door' | 'patrol' | 'timer';
  behavior: string;
  parameters: Record<string, any>;
}

export interface MissionObjective {
  id: string;
  type: 'reach' | 'collect' | 'deliver' | 'scan' | 'avoid' | 'custom' | 'move' | 'pickup' | 'log_at';
  description: string;
  target?: any;
  required: boolean;
  points?: number;
}

export interface MissionConstraints {
  nodeLimit?: number;
  timeLimit?: number;
  energyLimit?: number;
  noRepeat?: boolean;
}

export interface TutorialStep {
  trigger: 'start' | 'idle_time' | 'error' | 'custom';
  highlight?: string;
  message: string;
  arrowTo?: string;
  blockUntil?: 'acknowledged' | 'action_completed';
}

export interface Hint {
  level: 1 | 2 | 3;
  delay: number;
  text: string;
  showSolution?: boolean;
}

export interface SuccessCriteria {
  stars: {
    1: string;
    2: string;
    3: string;
  };
}

export interface MissionRewards {
  xp?: number; // Опыт (старый формат)
  experience?: number; // Опыт (новый формат)
  credits?: number; // Кредиты
  unlock?: string[]; // Разблокированные элементы
  achievements?: string[]; // Достижения
}

export interface Mission {
  id: string;
  stage: number;
  order: number;
  title: string;
  description: string;
  story: string;
  difficulty: Difficulty;
  estimatedTime: number;
  prerequisites: string[];
  requiredRobot: string;
  unlockRequirements?: {
    stageCompletion?: number;
    totalStars?: number;
  };
  grid: GridConfig;
  startPosition: StartPosition;
  objects: GameObject[];
  dynamicElements?: DynamicElement[];
  objectives: MissionObjective[];
  constraints: MissionConstraints;
  availableNodes: string[];
  tutorialMode?: {
    enabled: boolean;
    steps: TutorialStep[];
  };
  hints: Hint[];
  successCriteria: SuccessCriteria;
  rewards: MissionRewards;
}

export interface MissionProgress {
  missionId: string;
  completed: boolean;
  stars: number;
  bestTime?: number;
  bestNodes?: number;
  attempts: number;
}
