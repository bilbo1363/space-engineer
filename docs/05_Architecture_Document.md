# Архитектура проекта "Космический Инженер"

**Дата:** 15.10.2025  
**Версия:** 1.0 MVP

---

## 📐 Общая архитектура

### Архитектурный паттерн: **Feature-Sliced Design + Component-Based**

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Screens   │  │  Components│  │   Store    │       │
│  │  (Pages)   │←→│  (UI/Logic)│←→│  (Zustand) │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│         ↓               ↓               ↓              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Core     │  │   Utils    │  │   Types    │       │
│  │ (Business) │  │ (Helpers)  │  │(TypeScript)│       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
space-engineer/
├── src/
│   ├── components/           # React компоненты
│   │   ├── editor/          # Редактор программ
│   │   │   ├── NodeBasedEditor.tsx      # Главный редактор
│   │   │   ├── NodePalette.tsx          # Палитра блоков
│   │   │   ├── FunctionPalette.tsx      # Палитра функций
│   │   │   ├── FunctionEditor.tsx       # Редактор функций
│   │   │   ├── CreateFunctionModal.tsx  # Модалка создания
│   │   │   ├── SchemaManagerPanel.tsx   # Управление схемами
│   │   │   └── nodes/                   # Кастомные ноды
│   │   │       ├── StartNode.tsx
│   │   │       ├── EndNode.tsx
│   │   │       ├── ActionNode.tsx
│   │   │       ├── CustomActionNode.tsx
│   │   │       ├── ConditionNode.tsx
│   │   │       └── LoopNode.tsx
│   │   │
│   │   ├── scene/           # 3D визуализация
│   │   │   ├── GameScene.tsx            # Главная сцена
│   │   │   ├── Robot.tsx                # 3D модель робота
│   │   │   └── GameObject.tsx           # Объекты миссии
│   │   │
│   │   ├── screens/         # Экраны игры
│   │   │   ├── BriefingScreen.tsx       # Брифинг миссии
│   │   │   ├── ProgrammingScreen.tsx    # Программирование
│   │   │   ├── ExecutionScreen.tsx      # Выполнение
│   │   │   └── ResultScreen.tsx         # Результаты
│   │   │
│   │   ├── simulator/       # 2D симулятор
│   │   │   └── Simulator2D.tsx
│   │   │
│   │   ├── mission/         # Компоненты миссий
│   │   │   ├── MissionCard.tsx
│   │   │   ├── MissionObjectives.tsx
│   │   │   └── MissionInfo.tsx
│   │   │
│   │   └── ui/              # UI компоненты
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Card.tsx
│   │
│   ├── core/                # Ядро игры
│   │   ├── interpreter/     # Интерпретатор
│   │   │   └── Executor.ts              # Выполнение программ
│   │   │
│   │   ├── missions/        # Определения миссий
│   │   │   └── stage1Missions.ts        # Этап 1
│   │   │
│   │   ├── nodes/           # Типы блоков
│   │   │   └── nodeDefinitions.ts
│   │   │
│   │   └── robots/          # Роботы
│   │       └── robotDefinitions.ts
│   │
│   ├── store/               # State management
│   │   ├── useGameStore.ts              # Игровое состояние
│   │   └── useGameFlowStore.ts          # Поток игры
│   │
│   ├── types/               # TypeScript типы
│   │   ├── flowGraph.ts                 # Типы графа
│   │   ├── missions.ts                  # Типы миссий
│   │   ├── nodes.ts                     # Типы нод
│   │   ├── robots.ts                    # Типы роботов
│   │   └── gameFlow.ts                  # Типы потока
│   │
│   ├── utils/               # Утилиты
│   │   ├── graphConverter.ts            # Конвертер графа
│   │   ├── missionChecker.ts            # Проверка целей
│   │   ├── missionValidator.ts          # Валидация
│   │   ├── schemaManager.ts             # Управление схемами
│   │   └── functionValidator.ts         # Валидация функций
│   │
│   ├── contexts/            # React контексты
│   │   └── FunctionEditorContext.tsx
│   │
│   ├── assets/              # Ресурсы
│   │   ├── models/
│   │   ├── textures/
│   │   └── sounds/
│   │
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Entry point
│   └── index.css            # Глобальные стили
│
├── public/                  # Статические файлы
├── tests/                   # Тесты
├── Doc_new/                 # Документация
└── package.json             # Зависимости
```

---

## 🔄 Поток данных

### 1. Игровой цикл

```
┌─────────────┐
│  Briefing   │  Игрок читает описание миссии
└──────┬──────┘
       ↓
┌─────────────┐
│ Programming │  Создает программу в редакторе
└──────┬──────┘
       ↓
┌─────────────┐
│  Execution  │  Программа выполняется
└──────┬──────┘
       ↓
┌─────────────┐
│   Result    │  Показываются результаты
└──────┬──────┘
       ↓
    (Повтор или следующая миссия)
```

### 2. Создание и выполнение программы

```
┌──────────────────┐
│ NodeBasedEditor  │  Пользователь создает граф
└────────┬─────────┘
         ↓
┌──────────────────┐
│  ProgramGraph    │  Граф сохраняется в store
└────────┬─────────┘
         ↓
┌──────────────────┐
│ GraphConverter   │  Конвертирует граф → линейная программа
└────────┬─────────┘
         ↓
┌──────────────────┐
│    Executor      │  Выполняет программу пошагово
└────────┬─────────┘
         ↓
┌──────────────────┐
│   RobotState     │  Обновляет состояние робота
└────────┬─────────┘
         ↓
┌──────────────────┐
│   GameScene      │  Отображает изменения в 3D
└──────────────────┘
```

### 3. State Management (Zustand)

```
┌─────────────────────────────────────────┐
│          useGameFlowStore               │
│  ┌───────────────────────────────────┐  │
│  │ stage, mission, program,          │  │
│  │ programGraph, executionResult     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│           useGameStore                  │
│  ┌───────────────────────────────────┐  │
│  │ robotState, executionState,       │  │
│  │ logs, userFunctions               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│          React Components               │
└─────────────────────────────────────────┘
```

---

## 🎯 Ключевые компоненты

### 1. Executor (Интерпретатор)

**Назначение:** Выполнение программ робота

**Основные методы:**
```typescript
class Executor extends EventEmitter {
  // Загрузка программы
  loadProgram(program: ProgramNodeInstance[]): void
  
  // Запуск выполнения
  async run(): Promise<void>
  
  // Пауза/продолжение
  pause(): void
  resume(): void
  
  // Остановка
  stop(): void
  
  // Сброс миссии
  resetMission(): void
  
  // Выполнение одной ноды
  private async executeNode(node: ProgramNodeInstance): Promise<void>
  
  // Выполнение команд
  private async executeMove(direction: string): Promise<void>
  private async executeTurn(direction: string): Promise<void>
  private async executePickUp(): Promise<void>
  private async executePutDown(): Promise<void>
  private async executeWait(duration: number): Promise<void>
  private async executeLog(message: string): Promise<void>
  private async executeOpen(): Promise<void>
  
  // Выполнение функции
  private async executeFunction(functionId: string): Promise<void>
}
```

**События:**
- `nodeStart` - начало выполнения ноды
- `stateChange` - изменение состояния робота
- `error` - ошибка выполнения
- `programComplete` - завершение программы

---

### 2. GraphConverter

**Назначение:** Конвертация node-based графа в линейную программу

**Основной метод:**
```typescript
class GraphConverter {
  convert(graph: ProgramGraph): ProgramNodeInstance[] {
    // 1. Найти start ноду
    // 2. Обойти граф в глубину
    // 3. Развернуть функции
    // 4. Вернуть линейную программу
  }
  
  private traverseFrom(
    nodeId: string,
    visited: Set<string>
  ): ProgramNodeInstance[]
}
```

---

### 3. NodeBasedEditor

**Назначение:** Визуальный редактор программ

**Основные возможности:**
- Drag & Drop блоков
- Создание связей
- Inline редактирование
- Undo/Redo
- Сохранение/загрузка

**Используемые библиотеки:**
- ReactFlow - node-based редактор
- Zustand - state management

---

### 4. GameScene (3D)

**Назначение:** 3D визуализация выполнения

**Технологии:**
- Three.js - 3D движок
- React Three Fiber - React обертка для Three.js
- Drei - хелперы для R3F

**Компоненты:**
```tsx
<Canvas>
  <ambientLight />
  <directionalLight />
  <Robot position={robotState.position} />
  {mission.objects.map(obj => (
    <GameObject object={obj} />
  ))}
  <gridHelper />
  <OrbitControls />
</Canvas>
```

---

## 🔐 Изоляция состояния

### Проблема
Каждый экран создавал свой Executor, но все работали с одной ссылкой на миссию:

```
useGameFlowStore (mission) ← одна ссылка
    ↓
    ├─→ Simulator2D → Executor #1 (изменяет mission.objects)
    ├─→ ExecutionScreen → Executor #2 (видит изменения от #1)
    └─→ ControlPanel → Executor #3 (видит изменения от #1 и #2)
```

### Решение
Глубокое копирование миссии в каждом Executor:

```typescript
constructor(initialRobotState: RobotState, mission?: Mission) {
  if (mission) {
    // Создаем глубокую копию
    this.mission = JSON.parse(JSON.stringify(mission));
    this.initialMissionObjects = JSON.parse(JSON.stringify(mission.objects));
  }
}
```

---

## 🎨 UI/UX Архитектура

### Дизайн-система

**Цветовая палитра:**
```css
--space-black: #0A0E2E
--deep-blue: #1A1F3A
--dark-purple: #2A1F3D
--bright-cyan: #00D9FF
--bright-orange: #FF6B35
--warning-yellow: #FFD23F
--success-green: #06FFA5
--error-red: #FF006E
--info-blue: #3A86FF
```

**Типография:**
- Заголовки: Montserrat (700)
- Текст: Inter / PT Sans (400)
- Код: Roboto Mono

**Компоненты:**
- TailwindCSS для стилей
- Radix UI для доступности
- Lucide React для иконок
- Framer Motion для анимаций

---

## 🔄 Жизненный цикл компонентов

### ProgrammingScreen

```typescript
useEffect(() => {
  // Инициализация редактора
  if (mission && !programGraph) {
    // Создать пустой граф
  }
}, [mission]);

useEffect(() => {
  // Сохранение графа при изменении
  if (nodes.length > 0) {
    setProgramGraph({ nodes, edges });
  }
}, [nodes, edges]);
```

### ExecutionScreen

```typescript
useEffect(() => {
  // Создание Executor
  const executor = new Executor(robotState, mission);
  
  // Подписка на события
  executor.subscribe(event => {
    switch (event.type) {
      case 'stateChange':
        setRobotState(event.newState);
        updateMission(mission); // Форсировать ре-рендер
        break;
      case 'programComplete':
        goToResult(result);
        break;
    }
  });
  
  return () => executor.stop();
}, []);
```

---

## 📦 Управление зависимостями

### package.json

**Основные зависимости:**
```json
{
  "react": "^18.3.1",
  "three": "^0.180.0",
  "@react-three/fiber": "^8.17.10",
  "@react-three/drei": "^9.114.3",
  "reactflow": "^11.11.4",
  "zustand": "^5.0.8",
  "tailwindcss": "^3.4.1",
  "framer-motion": "^12.23.22",
  "lucide-react": "^0.544.0"
}
```

**Dev зависимости:**
```json
{
  "typescript": "~5.6.2",
  "vite": "^5.4.10",
  "vitest": "^3.2.4",
  "@playwright/test": "^1.55.1",
  "eslint": "^9.37.0",
  "prettier": "^3.6.2"
}
```

---

## 🚀 Производительность

### Оптимизации

1. **React.memo** для тяжелых компонентов
2. **useMemo** для вычислений
3. **useCallback** для функций
4. **Lazy loading** компонентов
5. **Code splitting** по роутам
6. **Tree shaking** неиспользуемого кода

### Метрики
- Время загрузки: <2 сек
- FPS в 3D: 60
- Размер bundle: ~500 KB (gzipped)

---

## 🔒 Безопасность

### Текущие меры
- Валидация пользовательского ввода
- Ограничение глубины рекурсии (макс. 10)
- Ограничение размера функций (макс. 20 нод)
- localStorage для локального хранения

### Планируется (v1.0)
- Backend API с аутентификацией
- JWT токены
- Rate limiting
- HTTPS

---

## 📊 Мониторинг и логирование

### Текущее логирование
```typescript
console.log('🤖 Робот переместился на', position);
console.log('🚪 Дверь открылась!');
console.log('📦 Предмет взят:', itemId);
console.error('❌ Ошибка выполнения:', error);
```

### Планируется (v1.0)
- Sentry для отслеживания ошибок
- Analytics (Google Analytics / Mixpanel)
- Performance monitoring

---

*Обновлено: 15.10.2025*  
*Версия: 1.0*
