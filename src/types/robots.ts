// Типы для роботов

import { Direction } from './nodes';

export interface RobotStats {
  speed: number; // 1-10
  capacity: number;
  energy: number;
  sensors: string[];
}

export interface RobotVisual {
  model: string;
  color: string;
  size: number;
}

export interface RobotType {
  id: string;
  name: string;
  description: string;
  unlockStage: number;
  stats: RobotStats;
  specialAbilities: string[];
  visual: RobotVisual;
}

export interface RobotState {
  position: [number, number];
  direction: Direction;
  energy: number;
  inventory: string[];
  isMoving: boolean;
  pickedUpItems?: string[]; // История взятых предметов для валидации миссий
}

export interface EnergySystem {
  maxEnergy: number;
  currentEnergy: number;
  consumptionRates: Record<string, number>;
  warnings: {
    lowBattery: number;
    criticalBattery: number;
  };
}
