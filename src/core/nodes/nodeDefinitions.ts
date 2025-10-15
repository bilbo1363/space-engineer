import { BaseNode } from '../../types/nodes';

// Базовые 8 нодов для Этапа 1 (MVP)

export const NODE_DEFINITIONS: Record<string, BaseNode> = {
  // Категория: Движение (4 ноды)
  moveForward: {
    id: 'moveForward',
    type: 'moveForward',
    name: 'Вперёд',
    icon: '↑',
    description: 'Двигаться на одну клетку вперёд',
    category: 'movement',
    energyCost: 1,
    duration: 1000,
  },

  moveBackward: {
    id: 'moveBackward',
    type: 'moveBackward',
    name: 'Назад',
    icon: '↓',
    description: 'Двигаться на одну клетку назад',
    category: 'movement',
    energyCost: 1,
    duration: 1000,
  },

  turnLeft: {
    id: 'turnLeft',
    type: 'turnLeft',
    name: 'Повернуть налево',
    icon: '↰',
    description: 'Повернуться на 90° влево',
    category: 'movement',
    energyCost: 0.5,
    duration: 500,
  },

  turnRight: {
    id: 'turnRight',
    type: 'turnRight',
    name: 'Повернуть направо',
    icon: '↱',
    description: 'Повернуться на 90° вправо',
    category: 'movement',
    energyCost: 0.5,
    duration: 500,
  },

  // Категория: Действия (2 ноды)
  pickUp: {
    id: 'pickUp',
    type: 'pickUp',
    name: 'Взять',
    icon: '🤲',
    description: 'Поднять объект с текущей клетки',
    category: 'action',
    energyCost: 2,
    duration: 1500,
    conditions: ['objectPresent', 'inventoryNotFull'],
  },

  putDown: {
    id: 'putDown',
    type: 'putDown',
    name: 'Положить',
    icon: '📦',
    description: 'Положить объект на текущую клетку',
    category: 'action',
    energyCost: 1,
    duration: 1000,
    conditions: ['inventoryNotEmpty', 'cellEmpty'],
  },

  // Команды из CustomActionNode
  take: {
    id: 'take',
    type: 'take',
    name: 'Взять',
    icon: '🤲',
    description: 'Взять объект с текущей клетки',
    category: 'action',
    energyCost: 2,
    duration: 1500,
  },

  put: {
    id: 'put',
    type: 'put',
    name: 'Положить',
    icon: '📦',
    description: 'Положить объект на текущую клетку',
    category: 'action',
    energyCost: 1,
    duration: 1000,
  },

  activate: {
    id: 'activate',
    type: 'activate',
    name: 'Активировать',
    icon: '⚡',
    description: 'Активировать объект рядом',
    category: 'action',
    energyCost: 2,
    duration: 1500,
  },

  scan: {
    id: 'scan',
    type: 'scan',
    name: 'Сканировать',
    icon: '🔍',
    description: 'Сканировать область вокруг',
    category: 'action',
    energyCost: 1,
    duration: 1000,
  },

  repair: {
    id: 'repair',
    type: 'repair',
    name: 'Починить',
    icon: '🔧',
    description: 'Починить поврежденный объект',
    category: 'action',
    energyCost: 3,
    duration: 2000,
  },

  build: {
    id: 'build',
    type: 'build',
    name: 'Построить',
    icon: '🏗️',
    description: 'Построить структуру',
    category: 'action',
    energyCost: 5,
    duration: 3000,
  },

  destroy: {
    id: 'destroy',
    type: 'destroy',
    name: 'Разрушить',
    icon: '💥',
    description: 'Разрушить объект',
    category: 'action',
    energyCost: 3,
    duration: 2000,
  },

  open: {
    id: 'open',
    type: 'open',
    name: 'Открыть',
    icon: '🚪',
    description: 'Открыть дверь',
    category: 'action',
    energyCost: 1,
    duration: 1000,
  },

  close: {
    id: 'close',
    type: 'close',
    name: 'Закрыть',
    icon: '🔒',
    description: 'Закрыть дверь',
    category: 'action',
    energyCost: 1,
    duration: 1000,
  },

  use: {
    id: 'use',
    type: 'use',
    name: 'Использовать',
    icon: '🎯',
    description: 'Использовать интерактивный объект',
    category: 'action',
    energyCost: 2,
    duration: 1500,
  },

  // Категория: Служебные (2 ноды)
  wait: {
    id: 'wait',
    type: 'wait',
    name: 'Ждать',
    icon: '⏱️',
    description: 'Подождать указанное количество секунд',
    category: 'utility',
    energyCost: 0,
    duration: 'variable',
    parameters: [
      {
        name: 'seconds',
        label: 'Секунд',
        type: 'number',
        min: 1,
        max: 10,
        default: 1,
      },
    ],
  },

  log: {
    id: 'log',
    type: 'log',
    name: 'Сообщить',
    icon: '📡',
    description: 'Отправить сообщение на станцию',
    category: 'utility',
    energyCost: 1,
    duration: 500,
    parameters: [
      {
        name: 'message',
        label: 'Сообщение',
        type: 'string',
        default: 'Привет!',
      },
    ],
  },

  // Категория: Циклы (Этап 2)
  repeat: {
    id: 'repeat',
    type: 'repeat',
    name: 'Повторить',
    icon: '🔁',
    description: 'Повторить действия N раз',
    category: 'loop',
    energyCost: 0,
    duration: 0,
    parameters: [
      {
        name: 'times',
        label: 'Раз',
        type: 'number',
        min: 1,
        max: 100,
        default: 3,
      },
    ],
  },

  repeatWhile: {
    id: 'repeatWhile',
    type: 'repeatWhile',
    name: 'Пока',
    icon: '🔄',
    description: 'Повторять пока условие истинно',
    category: 'loop',
    energyCost: 0,
    duration: 0,
    parameters: [
      {
        name: 'condition',
        label: 'Условие',
        type: 'expression',
        default: 'energy > 50',
      },
    ],
  },

  // Категория: Условия (Этап 2)
  if: {
    id: 'if',
    type: 'if',
    name: 'Если',
    icon: '❓',
    description: 'Выполнить если условие истинно',
    category: 'conditional',
    energyCost: 0,
    duration: 0,
    parameters: [
      {
        name: 'condition',
        label: 'Условие',
        type: 'expression',
        default: 'energy > 50',
      },
    ],
  },

  else: {
    id: 'else',
    type: 'else',
    name: 'Иначе',
    icon: '❗',
    description: 'Выполнить если условие ложно',
    category: 'conditional',
    energyCost: 0,
    duration: 0,
  },
};

// Группировка нодов по категориям для UI
export const NODES_BY_CATEGORY = {
  movement: [
    NODE_DEFINITIONS.moveForward,
    NODE_DEFINITIONS.moveBackward,
    NODE_DEFINITIONS.turnLeft,
    NODE_DEFINITIONS.turnRight,
  ],
  action: [NODE_DEFINITIONS.pickUp, NODE_DEFINITIONS.putDown],
  utility: [NODE_DEFINITIONS.wait, NODE_DEFINITIONS.log],
};

// Доступные ноды для каждой миссии Этапа 1
export const MISSION_AVAILABLE_NODES: Record<string, string[]> = {
  'mission_1_1': ['moveForward'],
  'mission_1_2': ['moveForward', 'turnLeft', 'turnRight'],
  'mission_1_3': ['moveForward', 'moveBackward', 'turnLeft', 'turnRight', 'pickUp', 'putDown'],
  'mission_1_4': ['moveForward', 'wait'],
  'mission_1_5': ['moveForward', 'turnRight', 'log'],
};
