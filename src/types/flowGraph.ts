import { Node } from 'reactflow';

// Типы нод в графе
export type FlowNodeType = 
  | 'start'        // Начало программы
  | 'end'          // Конец программы
  | 'action'       // Команда (вперед, поворот, и т.д.)
  | 'customAction' // Настраиваемое действие (активировать, взять, и т.д.)
  | 'condition'    // Условие (if)
  | 'loop';        // Цикл (repeat, while)

// Данные ноды действия
export interface ActionNodeData {
  nodeType: string;        // 'moveForward', 'turnLeft', etc.
  label: string;           // Отображаемый текст
  icon: string;            // Иконка
  parameters?: {           // Параметры команды
    [key: string]: any;
  };
}

// Данные ноды настраиваемого действия
export interface CustomActionNodeData {
  actionType: string;      // 'activate', 'take', 'put', etc.
  label: string;           // Отображаемый текст
  icon: string;            // Иконка
  parameters?: {           // Параметры команды
    [key: string]: any;
  };
}

// Данные ноды условия
export interface ConditionNodeData {
  condition: string;       // 'energy > 50', 'hasItem', etc.
  label: string;
  icon: string;
}

// Данные ноды цикла
export interface LoopNodeData {
  loopType: 'repeat' | 'while';
  count?: number;          // Для repeat
  condition?: string;      // Для while
  label: string;
  icon: string;
}

// Данные стартовой/конечной ноды
export interface StartEndNodeData {
  label: string;
  icon: string;
}

// Объединённый тип данных ноды
export type FlowNodeData = 
  | ActionNodeData 
  | CustomActionNodeData
  | ConditionNodeData 
  | LoopNodeData 
  | StartEndNodeData;

// Нода в графе (расширяет React Flow Node)
export interface FlowNode extends Node {
  type: FlowNodeType;
  data: FlowNodeData;
}

// Связь между нодами (совместим с React Flow Edge)
export interface FlowEdge {
  id: string;              // ID связи
  source: string;          // ID исходной ноды
  target: string;          // ID целевой ноды
  sourceHandle?: string;   // Для условий: 'true' или 'false'
  targetHandle?: string;
  animated?: boolean;      // Анимация потока
  type?: string;           // Тип связи
  style?: any;             // Стили
  label?: string;          // Метка
}

// Граф программы
export interface ProgramGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Результат валидации графа
export interface GraphValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Настройки редактора
export interface EditorSettings {
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
  showControls: boolean;
}
