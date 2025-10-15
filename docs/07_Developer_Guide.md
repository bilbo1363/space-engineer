# Руководство разработчика
## "Космический Инженер"

**Дата:** 15.10.2025  
**Версия:** 1.0

---

## 🚀 Быстрый старт

### Требования

- Node.js 18+ 
- npm 9+
- Git
- VS Code (рекомендуется)

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/space-engineer/game.git
cd game/space-engineer

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Открыть в браузере
# http://localhost:5173
```

### Команды

```bash
npm run dev          # Development сервер
npm run build        # Production build
npm run preview      # Превью production build
npm run lint         # Линтинг
npm run format       # Форматирование
npm run test         # Unit тесты
npm run test:e2e     # E2E тесты
```

---

## 📁 Структура проекта

```
space-engineer/
├── src/
│   ├── components/       # React компоненты
│   │   ├── editor/      # Редактор программ
│   │   ├── scene/       # 3D сцена
│   │   ├── screens/     # Экраны игры
│   │   ├── simulator/   # 2D симулятор
│   │   ├── mission/     # Компоненты миссий
│   │   └── ui/          # UI компоненты
│   ├── core/            # Ядро игры
│   │   ├── interpreter/ # Интерпретатор
│   │   ├── missions/    # Миссии
│   │   ├── nodes/       # Типы блоков
│   │   └── robots/      # Роботы
│   ├── store/           # State management
│   ├── types/           # TypeScript типы
│   ├── utils/           # Утилиты
│   ├── contexts/        # React контексты
│   ├── assets/          # Ресурсы
│   ├── App.tsx          # Главный компонент
│   └── main.tsx         # Entry point
├── public/              # Статические файлы
├── tests/               # Тесты
├── Doc_new/             # Документация
└── package.json
```

---

## 🎨 Соглашения о коде

### TypeScript

**Именование:**
```typescript
// PascalCase для типов и компонентов
interface UserFunction {}
class Executor {}
const MyComponent = () => {}

// camelCase для переменных и функций
const robotState = {}
function executeNode() {}

// UPPER_CASE для констант
const MAX_DEPTH = 10
```

**Типизация:**
```typescript
// Всегда указывать типы параметров
function moveRobot(direction: Direction): void {}

// Использовать интерфейсы вместо type где возможно
interface Props {
  mission: Mission;
}

// Избегать any
// ❌ Плохо
const data: any = {}

// ✅ Хорошо
const data: Mission = {}
```

### React

**Компоненты:**
```typescript
// Функциональные компоненты с типизацией
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

export const MyComponent = ({ title, onSave }: MyComponentProps) => {
  return <div>{title}</div>
}
```

**Hooks:**
```typescript
// Правильный порядок хуков
const MyComponent = () => {
  // 1. State
  const [state, setState] = useState()
  
  // 2. Refs
  const ref = useRef()
  
  // 3. Context
  const context = useContext()
  
  // 4. Callbacks
  const handleClick = useCallback(() => {}, [])
  
  // 5. Effects
  useEffect(() => {}, [])
  
  return <div />
}
```

### Файлы

**Именование:**
```
PascalCase.tsx     - React компоненты
camelCase.ts       - Утилиты, хелперы
kebab-case.css     - Стили
```

**Структура файла:**
```typescript
// 1. Импорты
import React from 'react'
import { useStore } from './store'

// 2. Типы
interface Props {}

// 3. Константы
const MAX_VALUE = 100

// 4. Компонент/класс
export const Component = () => {}

// 5. Хелперы (если нужны)
function helper() {}
```

---

## 🔧 Разработка

### Добавление новой миссии

**1. Создать определение миссии:**

```typescript
// src/core/missions/stage1Missions.ts

export const MISSION_1_6: Mission = {
  id: 'mission_1_6',
  stage: 1,
  order: 6,
  title: 'Название миссии',
  description: 'Описание...',
  grid: { width: 10, height: 10, type: 'flat' },
  startPosition: { x: 2, y: 2, direction: 'east' },
  objects: [
    { type: 'goal', id: 'target', position: [8, 8] }
  ],
  objectives: [
    {
      id: 'reach_target',
      type: 'reach',
      description: 'Достигни цели',
      target: [8, 8],
      required: true
    }
  ],
  constraints: { nodeLimit: 10 },
  availableNodes: ['moveForward', 'turnLeft', 'turnRight'],
  difficulty: 'easy',
  estimatedTime: 5,
  prerequisites: ['mission_1_5'],
  requiredRobot: 'pioneer'
}
```

**2. Добавить в массив:**

```typescript
export const STAGE_1_MISSIONS: Mission[] = [
  MISSION_1_1,
  MISSION_1_2,
  MISSION_1_3,
  MISSION_1_4,
  MISSION_1_5,
  MISSION_1_6  // ← Новая миссия
]
```

**3. Протестировать:**
- Запустить игру
- Выбрать миссию
- Проверить что все цели достижимы

---

### Добавление новой команды

**1. Добавить тип:**

```typescript
// src/types/nodes.ts

export type NodeType = 
  | 'moveForward'
  | 'turnLeft'
  | 'myNewCommand'  // ← Новая команда
```

**2. Добавить определение:**

```typescript
// src/core/nodes/nodeDefinitions.ts

export const NODE_DEFINITIONS = {
  // ...
  myNewCommand: {
    type: 'myNewCommand',
    label: 'Моя команда',
    icon: '🎯',
    category: 'actions',
    description: 'Описание команды',
    parameters: []
  }
}
```

**3. Реализовать выполнение:**

```typescript
// src/core/interpreter/Executor.ts

private async executeNode(node: ProgramNodeInstance): Promise<void> {
  switch (node.nodeType) {
    // ...
    case 'myNewCommand':
      await this.executeMyNewCommand()
      break
  }
}

private async executeMyNewCommand(): Promise<void> {
  // Реализация команды
  console.log('Выполняется моя команда')
  
  // Обновить состояние робота
  this.robotState.energy -= 5
  
  // Эмитить событие
  this.emit({
    type: 'stateChange',
    newState: this.robotState
  })
}
```

**4. Добавить в палитру:**

Команда автоматически появится в палитре если добавлена в `NODE_DEFINITIONS`.

---

### Добавление нового типа объекта

**1. Добавить тип:**

```typescript
// src/types/missions.ts

export interface GameObject {
  type: 'obstacle' | 'goal' | 'myNewObject'  // ← Новый тип
  id?: string
  position: [number, number]
  properties?: Record<string, any>
}
```

**2. Добавить визуализацию 3D:**

```typescript
// src/components/scene/GameObject.tsx

export const GameObject = ({ object }: GameObjectProps) => {
  const position: [number, number, number] = [
    object.position[0],
    0.5,
    object.position[1]
  ]

  switch (object.type) {
    // ...
    case 'myNewObject':
      return (
        <mesh position={position}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#FF00FF" />
        </mesh>
      )
  }
}
```

**3. Добавить визуализацию 2D:**

```typescript
// src/components/simulator/Simulator2D.tsx

// В функции drawObjects
if (obj.type === 'myNewObject') {
  ctx.fillStyle = '#FF00FF'
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
}
```

---

## 🧪 Тестирование

### Unit тесты

**Создать тест:**

```typescript
// src/utils/__tests__/graphConverter.test.ts

import { describe, it, expect } from 'vitest'
import { GraphConverter } from '../graphConverter'

describe('GraphConverter', () => {
  it('should convert simple graph', () => {
    const graph = {
      nodes: [
        { id: 'start', type: 'start', data: {} },
        { id: 'move', type: 'action', data: { nodeType: 'moveForward' } },
        { id: 'end', type: 'end', data: {} }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'move' },
        { id: 'e2', source: 'move', target: 'end' }
      ]
    }
    
    const converter = new GraphConverter()
    const program = converter.convert(graph)
    
    expect(program).toHaveLength(1)
    expect(program[0].nodeType).toBe('moveForward')
  })
})
```

**Запустить:**

```bash
npm run test
```

### E2E тесты

**Создать тест:**

```typescript
// tests/e2e/mission1.spec.ts

import { test, expect } from '@playwright/test'

test('should complete mission 1.1', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Выбрать миссию
  await page.click('text=Миссия 1.1')
  await page.click('text=Начать программирование')
  
  // Создать программу
  await page.dragAndDrop('[data-node="moveForward"]', '[data-editor]')
  
  // Запустить
  await page.click('text=Запустить')
  
  // Проверить результат
  await expect(page.locator('text=Успех')).toBeVisible()
})
```

**Запустить:**

```bash
npm run test:e2e
```

---

## 🐛 Отладка

### React DevTools

```bash
# Установить расширение
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

**Использование:**
- Components tab - инспекция компонентов
- Profiler tab - анализ производительности

### Redux DevTools (для Zustand)

```typescript
// src/store/useGameStore.ts

import { devtools } from 'zustand/middleware'

export const useGameStore = create(
  devtools(
    (set) => ({
      // ...
    }),
    { name: 'GameStore' }
  )
)
```

### Console логирование

```typescript
// Используйте эмодзи для категоризации
console.log('🤖 Робот переместился на', position)
console.log('🚪 Дверь открылась')
console.log('📦 Предмет взят:', itemId)
console.error('❌ Ошибка:', error)
console.warn('⚠️ Предупреждение:', warning)
```

---

## 📦 Сборка и деплой

### Production build

```bash
# Сборка
npm run build

# Результат в dist/
ls dist/

# Превью
npm run preview
```

### Оптимизация

**Анализ bundle:**

```bash
npm run build -- --mode analyze
```

**Рекомендации:**
- Lazy loading компонентов
- Code splitting
- Tree shaking
- Минификация

---

## 🔄 Git workflow

### Ветки

```
main          - production
develop       - development
feature/*     - новые фичи
bugfix/*      - исправления багов
hotfix/*      - критические исправления
```

### Commit messages

```
feat: добавлена миссия 1.6
fix: исправлена ошибка в Executor
docs: обновлена документация
style: форматирование кода
refactor: рефакторинг GraphConverter
test: добавлены тесты для MissionChecker
chore: обновлены зависимости
```

### Pull Request

**Чек-лист:**
- [ ] Код отформатирован (npm run format)
- [ ] Линтинг пройден (npm run lint)
- [ ] Тесты пройдены (npm run test)
- [ ] Документация обновлена
- [ ] Нет console.log в production коде
- [ ] TypeScript ошибок нет

---

## 📚 Полезные ресурсы

### Документация

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/)
- [ReactFlow](https://reactflow.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TailwindCSS](https://tailwindcss.com/)

### Инструменты

- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite](https://vitejs.dev/)

---

*Обновлено: 15.10.2025*  
*Версия: 1.0*
