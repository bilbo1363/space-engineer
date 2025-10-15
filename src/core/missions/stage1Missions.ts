import { Mission } from '../../types/missions';

// Миссия 1.1: "Первый шаг"
export const MISSION_1_1: Mission = {
  id: 'mission_1_1',
  stage: 1,
  order: 1,
  title: 'Первый шаг',
  description:
    'Привет, Инженер! Добро пожаловать на Землю-3. Твой первый робот "Пионер" готов к работе. Давай научим его самому простому — двигаться вперёд. Твоя задача — довести его до флажка.',
  story: 'Первые шаги на новой планете всегда самые важные.',
  difficulty: 'tutorial',
  estimatedTime: 3,
  prerequisites: [],
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
      type: 'goal',
      id: 'flag',
      position: [5, 2],
    },
  ],
  objectives: [
    {
      id: 'reach_flag',
      type: 'reach',
      description: 'Доберись до флажка',
      target: [5, 2],
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 5,
  },
  availableNodes: ['moveForward'],
  hints: [
    {
      level: 1,
      delay: 30,
      text: 'Чтобы робот поехал, нужно дать ему команду. Попробуй перетащить блок из левой панели в область программы.',
    },
    {
      level: 2,
      delay: 60,
      text: 'До флажка три клетки. Кажется, одной команды "Вперёд" будет недостаточно...',
    },
    {
      level: 3,
      delay: 120,
      text: 'Используй команду "Вперёд" три раза подряд',
      showSolution: true,
    },
  ],
  successCriteria: {
    stars: {
      1: 'Достиг цели',
      2: 'Использовал ≤4 нодов',
      3: 'Завершил за ≤10 секунд',
    },
  },
  rewards: {
    xp: 50,
    unlock: ['turnLeft', 'turnRight'],
  },
};

// Миссия 1.2: "Поворот за поворотом"
export const MISSION_1_2: Mission = {
  id: 'mission_1_2',
  stage: 1,
  order: 2,
  title: 'Поворот за поворотом',
  description:
    'Отличный старт! Теперь усложним задачу. Разведывательный дрон обнаружил узкий каньон. Проведи "Пионера" через него. Тебе понадобятся новые команды для поворотов. Удачи!',
  story: 'Прямые пути редко встречаются на неизведанных планетах.',
  difficulty: 'easy',
  estimatedTime: 5,
  prerequisites: ['mission_1_1'],
  requiredRobot: 'pioneer',
  grid: {
    width: 10,
    height: 10,
    type: 'flat',
  },
  startPosition: {
    x: 2,
    y: 2,
    direction: 'east',
  },
  objects: [
    // Внутренние препятствия (лабиринт)
    { type: 'obstacle', position: [3, 2] },
    { type: 'obstacle', position: [3, 3] },
    { type: 'obstacle', position: [3, 4] },
    { type: 'obstacle', position: [5, 4] },
    { type: 'obstacle', position: [5, 5] },
    { type: 'obstacle', position: [5, 6] },
    { type: 'obstacle', position: [7, 6] },
    { type: 'obstacle', position: [7, 7] },
    
    // Цель
    { type: 'goal', id: 'target', position: [8, 8] },
  ],
  objectives: [
    {
      id: 'reach_target',
      type: 'reach',
      description: 'Достигни зелёной зоны',
      target: [8, 8],
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 12,
  },
  availableNodes: ['moveForward', 'turnLeft', 'turnRight'],
  hints: [
    {
      level: 1,
      delay: 45,
      text: 'Стены блокируют прямой путь. Используй повороты!',
    },
    {
      level: 2,
      delay: 90,
      text: 'Попробуй двигаться по S-образному маршруту',
    },
  ],
  successCriteria: {
    stars: {
      1: 'Достиг цели',
      2: 'Использовал ≤11 нодов',
      3: 'Потратил ≤80 единиц энергии',
    },
  },
  rewards: {
    xp: 100,
    unlock: ['pickUp', 'putDown'],
  },
};

// Миссия 1.3: "Первая доставка"
export const MISSION_1_3: Mission = {
  id: 'mission_1_3',
  stage: 1,
  order: 3,
  title: 'Первая доставка',
  description:
    'На базе закончились энергоэлементы. Один запасной контейнер находится неподалеку. Твоя задача: добраться до контейнера, взять его с помощью манипулятора и доставить на базу.',
  story: 'Логистика — основа любой колонии.',
  difficulty: 'easy',
  estimatedTime: 7,
  prerequisites: ['mission_1_2'],
  requiredRobot: 'pioneer',
  grid: {
    width: 10,
    height: 10,
    type: 'flat',
  },
  startPosition: {
    x: 2,
    y: 2,
    direction: 'east',
  },
  objects: [
    { type: 'container', id: 'energy_container', position: [5, 2] },
    { type: 'base', id: 'main_base', position: [2, 7] },
  ],
  objectives: [
    {
      id: 'pickup_container',
      type: 'pickup',
      description: 'Подними контейнер',
      target: 'energy_container',
      required: true,
    },
    {
      id: 'deliver_to_base',
      type: 'deliver',
      description: 'Доставь контейнер на базу',
      target: 'main_base',
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 15,
  },
  availableNodes: ['moveForward', 'moveBackward', 'turnLeft', 'turnRight', 'pickUp', 'putDown'],
  hints: [
    {
      level: 1,
      delay: 60,
      text: 'Сначала доберись до контейнера, затем используй команду "Взять"',
    },
    {
      level: 2,
      delay: 120,
      text: 'После взятия контейнера нужно доставить его на базу и использовать "Положить"',
    },
  ],
  successCriteria: {
    stars: {
      1: 'Доставил контейнер на базу',
      2: 'Программа завершилась за ≤20 секунд',
      3: 'Использовал ≤12 нодов',
    },
  },
  rewards: {
    xp: 150,
    unlock: ['wait'],
  },
};

// Миссия 1.4: "Точный расчёт"
export const MISSION_1_4: Mission = {
  id: 'mission_1_4',
  stage: 1,
  order: 4,
  title: 'Точный расчёт',
  description:
    'Системы безопасности на этой планете иногда живут своей жизнью. Путь к следующему сектору преграждает автоматическая дверь. Она открывается лишь на короткое время. Тебе нужно точно рассчитать момент для прохода!',
  story: 'Время — критический ресурс в космосе.',
  difficulty: 'medium',
  estimatedTime: 8,
  prerequisites: ['mission_1_3'],
  requiredRobot: 'pioneer',
  grid: {
    width: 10,
    height: 5,
    type: 'flat',
  },
  startPosition: {
    x: 1,
    y: 2,
    direction: 'east',
  },
  objects: [
    { type: 'goal', id: 'target', position: [8, 2] },
    { 
      type: 'obstacle', 
      id: 'door', 
      position: [4, 2],
      properties: {
        isDoor: true,
        openTime: 3,
        openDuration: 5,  // Увеличено с 2 до 5 секунд
        isOpen: false,
      }
    }
  ],
  dynamicElements: [
    {
      type: 'door',
      behavior: 'timed',
      parameters: {
        position: [2, 0],
        openTime: 3,
        openDuration: 2,
      },
    },
  ],
  objectives: [
    {
      id: 'reach_target',
      type: 'reach',
      description: 'Пройди через дверь и достигни цели',
      target: [8, 2],
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 8,
  },
  availableNodes: ['moveForward', 'wait'],
  hints: [
    {
      level: 1,
      delay: 45,
      text: 'Дверь открывается через 3 секунды после старта',
    },
    {
      level: 2,
      delay: 90,
      text: 'Используй команду "Ждать", чтобы синхронизироваться с дверью',
    },
  ],
  successCriteria: {
    stars: {
      1: 'Достиг цели',
      2: 'Не врезался в дверь',
      3: 'Использовал ровно 1 ноду "Ждать" с правильным параметром',
    },
  },
  rewards: {
    xp: 200,
    unlock: ['log'],
  },
};

// Миссия 1.5: "Первый отчёт"
export const MISSION_1_5: Mission = {
  id: 'mission_1_5',
  stage: 1,
  order: 5,
  title: 'Первый отчёт',
  description:
    'Центр Управления требует первый научный отчёт. Вдоль маршрута расположены три неизвестных кристалла. Подведи робота к каждому из них и используй команду "Сообщить", чтобы отправить в лог подтверждение: "Объект найден".',
  story: 'Научные данные — ценнейший ресурс экспедиции.',
  difficulty: 'medium',
  estimatedTime: 10,
  prerequisites: ['mission_1_4'],
  requiredRobot: 'pioneer',
  grid: {
    width: 10,
    height: 10,
    type: 'flat',
  },
  startPosition: {
    x: 2,
    y: 2,
    direction: 'east',
  },
  objects: [
    { type: 'station', id: 'beacon_1', position: [5, 2] },
    { type: 'station', id: 'beacon_2', position: [7, 5] },
    { type: 'station', id: 'beacon_3', position: [3, 7] },
  ],
  objectives: [
    {
      id: 'activate_beacon_1',
      type: 'log_at',
      description: 'Активируй первый маяк',
      target: {
        positions: [[5, 2]],
        requiredMessage: 'Объект найден',
      },
      required: true,
    },
    {
      id: 'activate_beacon_2',
      type: 'log_at',
      description: 'Активируй второй маяк',
      target: {
        positions: [[7, 5]],
        requiredMessage: 'Объект найден',
      },
      required: true,
    },
    {
      id: 'activate_beacon_3',
      type: 'log_at',
      description: 'Активируй третий маяк',
      target: {
        positions: [[3, 7]],
        requiredMessage: 'Объект найден',
      },
      required: true,
    },
  ],
  constraints: {
    nodeLimit: 10,
  },
  availableNodes: ['moveForward', 'turnLeft', 'turnRight', 'log'],
  hints: [
    {
      level: 1,
      delay: 60,
      text: 'Подъезжай к каждому кристаллу и используй команду "Сообщить"',
    },
    {
      level: 2,
      delay: 120,
      text: 'Текст сообщения должен быть точно "Объект найден"',
    },
  ],
  successCriteria: {
    stars: {
      1: 'Отправил 3 сообщения в лог',
      2: 'Отправил сообщения, находясь на правильных клетках',
      3: 'Текст сообщений точно соответствует "Объект найден"',
    },
  },
  rewards: {
    xp: 250,
    achievements: ['stage_1_complete'],
  },
};

// Экспорт всех миссий Этапа 1
export const STAGE_1_MISSIONS: Mission[] = [
  MISSION_1_1,
  MISSION_1_2,
  MISSION_1_3,
  MISSION_1_4,
  MISSION_1_5,
];
