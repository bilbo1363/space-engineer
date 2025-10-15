// Типы для нодов программирования

export type NodeCategory = 'movement' | 'action' | 'utility' | 'sensor' | 'loop' | 'conditional' | 'function';

export type Direction = 'north' | 'east' | 'south' | 'west';

export interface NodeParameter {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'direction' | 'expression';
  min?: number;
  max?: number;
  default?: any;
  options?: string[];
}

export interface BaseNode {
  id: string;
  type: string;
  name: string;
  icon: string;
  description: string;
  category: NodeCategory;
  energyCost: number;
  duration: number | 'variable';
  parameters?: NodeParameter[];
  conditions?: string[];
}

export interface MovementNode extends BaseNode {
  category: 'movement';
  type: 'moveForward' | 'moveBackward' | 'turnLeft' | 'turnRight';
}

export interface ActionNode extends BaseNode {
  category: 'action';
  type: 'pickUp' | 'putDown';
}

export interface UtilityNode extends BaseNode {
  category: 'utility';
  type: 'wait' | 'log';
}

export interface SensorNode extends BaseNode {
  category: 'sensor';
  type: 'look' | 'scanArea' | 'distanceSensor';
  returns: string;
}

export interface LoopNode extends BaseNode {
  category: 'loop';
  type: 'repeat' | 'repeatWhile' | 'break';
  children?: ProgramNode[];
}

export interface ConditionalNode extends BaseNode {
  category: 'conditional';
  type: 'if' | 'else';
  children?: ProgramNode[];
}

export type ProgramNode = MovementNode | ActionNode | UtilityNode | SensorNode | LoopNode | ConditionalNode;

export interface ProgramNodeInstance {
  id: string;
  nodeType: string;
  parameters?: Record<string, any>;
  children?: ProgramNodeInstance[];
  elseBranch?: ProgramNodeInstance[];  // Для ветки ELSE в условиях
  
  // Для функций:
  functionId?: string;  // ID функции (если это вызов функции)
}

// Пользовательская функция
export interface UserFunction {
  id: string;                      // Уникальный ID
  name: string;                    // Название (СобратьОбразец)
  icon: string;                    // Иконка (📦)
  color: string;                   // Цвет (#4CAF50)
  description?: string;            // Описание
  body: ProgramNodeInstance[];     // Тело функции
  createdAt: number;               // Timestamp создания
  usageCount: number;              // Сколько раз использована
}
