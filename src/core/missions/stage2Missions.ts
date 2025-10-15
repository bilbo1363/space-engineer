import { Mission } from '../../types/missions';

// Миссия 2.1: "Введение в циклы"
export const MISSION_2_1: Mission = {
  id: 'mission_2_1',
  stage: 2,
  order: 1,
  title: 'Сила повторения',
  description:
    'Отлично! Ты освоил базовые команды. Теперь пора изучить циклы — они помогут повторять действия без копирования блоков. Твоя задача — пройти прямо 5 шагов используя цикл "Повторить".',
  story: 'Эффективность — ключ к успеху в космосе. Циклы экономят время и энергию.',
  difficulty: 'easy',
  estimatedTime: 5,
  prerequisites: ['mission_1_5'],
  requiredRobot: 'pioneer',
  grid: {
    width: 12,
    height: 5,
    type: 'flat',
  },
  startPosition: {
    x: 2,
    y: 2,
    direction: 'east',
  },
  objects: [
    {
      type: 'goal',
      id: 'flag',
      position: [7, 2],
    },
  ],
  objectives: [
    {
      id: 'reach_flag',
      type: 'reach',
      description: 'Доберись до флажка',
      target: [7, 2],
      required: true,
    },
    {
      id: 'use_loop',
      type: 'custom',
      description: 'Используй цикл "Повторить"',
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 3, // Заставляет использовать цикл
  },
  availableNodes: ['moveForward', 'repeat'],
  hints: [
    {
      level: 1,
      delay: 30,
      text: 'Вместо 5 блоков "Вперед", используй один блок "Повторить 5 раз" с одним "Вперед" внутри!',
    },
    {
      level: 2,
      delay: 60,
      text: 'Перетащи блок "Повторить" в программу, затем перетащи "Вперед" ВНУТРЬ цикла.',
    },
  ],
  rewards: {
    experience: 150,
    credits: 100,
  },
};

// Миссия 2.2: "Квадратный маршрут"
export const MISSION_2_2: Mission = {
  id: 'mission_2_2',
  stage: 2,
  order: 2,
  title: 'Квадратный маршрут',
  description:
    'Теперь усложним задачу! Тебе нужно объехать квадрат 3x3 клетки и вернуться на старт. Используй цикл чтобы не повторять код 4 раза!',
  story: 'Патрулирование территории — важная задача для робота-исследователя.',
  difficulty: 'medium',
  estimatedTime: 7,
  prerequisites: ['mission_2_1'],
  requiredRobot: 'pioneer',
  grid: {
    width: 10,
    height: 10,
    type: 'flat',
  },
  startPosition: {
    x: 3,
    y: 3,
    direction: 'east',
  },
  objects: [
    {
      type: 'marker',
      id: 'corner1',
      position: [6, 3],
    },
    {
      type: 'marker',
      id: 'corner2',
      position: [6, 6],
    },
    {
      type: 'marker',
      id: 'corner3',
      position: [3, 6],
    },
  ],
  objectives: [
    {
      id: 'visit_all_corners',
      type: 'custom',
      description: 'Посети все углы квадрата',
      required: true,
    },
    {
      id: 'return_to_start',
      type: 'reach',
      description: 'Вернись на старт',
      target: [3, 3],
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 8,
  },
  availableNodes: ['moveForward', 'turnRight', 'repeat'],
  hints: [
    {
      level: 1,
      delay: 40,
      text: 'Квадрат = 4 стороны. Каждая сторона: 3 шага вперед + поворот направо.',
    },
    {
      level: 2,
      delay: 80,
      text: 'Используй "Повторить 4 раза" с блоками внутри: 3x Вперед + Поворот направо.',
    },
  ],
  rewards: {
    experience: 200,
    credits: 150,
  },
};

// Миссия 2.3: "Умное условие"
export const MISSION_2_3: Mission = {
  id: 'mission_2_3',
  stage: 2,
  order: 3,
  title: 'Умное условие',
  description:
    'Пора научиться принимать решения! Твой робот должен дойти до маяка и активировать его ТОЛЬКО если у него осталось больше 50% энергии.',
  story: 'Автономные роботы должны уметь принимать решения самостоятельно.',
  difficulty: 'medium',
  estimatedTime: 8,
  prerequisites: ['mission_2_2'],
  requiredRobot: 'pioneer',
  grid: {
    width: 10,
    height: 5,
    type: 'flat',
  },
  startPosition: {
    x: 2,
    y: 2,
    direction: 'east',
  },
  objects: [
    {
      type: 'station',
      id: 'beacon',
      position: [7, 2],
      properties: {
        activated: false,
      },
    },
  ],
  objectives: [
    {
      id: 'reach_beacon',
      type: 'reach',
      description: 'Доберись до маяка',
      target: [7, 2],
      required: true,
    },
    {
      id: 'activate_if_energy',
      type: 'custom',
      description: 'Активируй маяк если энергии > 50%',
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 10,
  },
  availableNodes: ['moveForward', 'log', 'if', 'repeat'],
  hints: [
    {
      level: 1,
      delay: 40,
      text: 'Используй блок "Если" с условием "energy > 50".',
    },
    {
      level: 2,
      delay: 80,
      text: 'Внутри блока "Если" помести команду "Сообщить" для активации маяка.',
    },
  ],
  rewards: {
    experience: 250,
    credits: 200,
  },
};

// Миссия 2.4: "Цикл с условием"
export const MISSION_2_4: Mission = {
  id: 'mission_2_4',
  stage: 2,
  order: 4,
  title: 'Пока есть энергия',
  description:
    'Финальный тест! Робот должен двигаться вперед ПОКА у него есть энергия (> 20%). Используй цикл "Пока" чтобы робот сам решал когда остановиться.',
  story: 'Настоящая автономность — когда робот сам знает свои пределы.',
  difficulty: 'hard',
  estimatedTime: 10,
  prerequisites: ['mission_2_3'],
  requiredRobot: 'pioneer',
  grid: {
    width: 25,
    height: 10,
    type: 'flat',
  },
  startPosition: {
    x: 2,
    y: 5,
    direction: 'east',
  },
  objects: [
    {
      type: 'goal',
      id: 'flag',
      position: [20, 5],
    },
  ],
  objectives: [
    {
      id: 'move_while_energy',
      type: 'custom',
      description: 'Двигайся пока энергии > 20%',
      required: true,
    },
    {
      id: 'reach_distance',
      type: 'custom',
      description: 'Проедь минимум 15 клеток',
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 5,
  },
  availableNodes: ['moveForward', 'turnLeft', 'turnRight', 'repeatWhile', 'repeat', 'if'],
  hints: [
    {
      level: 1,
      delay: 40,
      text: 'Используй "Пока" с условием "energy > 20".',
    },
    {
      level: 2,
      delay: 80,
      text: 'Внутри цикла "Пока" помести команду "Вперед". Робот будет ехать пока не кончится энергия!',
    },
  ],
  rewards: {
    experience: 300,
    credits: 250,
  },
};

// Экспорт всех миссий Этапа 2
export const STAGE_2_MISSIONS: Mission[] = [
  MISSION_2_1,
  MISSION_2_2,
  MISSION_2_3,
  MISSION_2_4,
];
