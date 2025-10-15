# Technical Design Document (TDD)
## "Космический Инженер"

**Дата:** 15.10.2025  
**Версия:** 2.0 MVP  
**Статус:** ✅ MVP реализован

---

## 📋 Содержание

1. [Технологический стек](#технологический-стек)
2. [Архитектура](#архитектура)
3. [Ключевые системы](#ключевые-системы)
4. [Структура данных](#структура-данных)
5. [Производительность](#производительность)
6. [Безопасность](#безопасность)

---

## 💻 Технологический стек

### Frontend

**Core:**
- React 18.3 - UI framework
- TypeScript 5.6 - типизация
- Vite 5.4 - build tool

**3D Graphics:**
- Three.js 0.180 - 3D движок
- React Three Fiber 8.17 - React обертка для Three.js
- Drei 9.114 - хелперы для R3F

**Node Editor:**
- ReactFlow 11.11 - node-based редактор
- Drag & Drop API

**State Management:**
- Zustand 5.0 - глобальное состояние
- localStorage - персистентность

**Styling:**
- TailwindCSS 3.4 - utility-first CSS
- PostCSS 8.5 - обработка CSS

**UI Components:**
- Radix UI - доступные компоненты
- Lucide React - иконки
- Framer Motion 12 - анимации

### Development Tools

**Linting & Formatting:**
- ESLint 9 - линтинг
- Prettier 3 - форматирование
- Husky 9 - git hooks
- lint-staged 16 - pre-commit проверки

**Testing:**
- Vitest 3.2 - unit тесты
- Playwright 1.55 - E2E тесты
- Testing Library - тестирование React

**Build & Deploy:**
- Vite - сборка
- GitHub Actions - CI/CD (планируется)
- Vercel/Netlify - хостинг (планируется)

---

## 🏗️ Архитектура

### Общая архитектура

```
┌─────────────────────────────────────────┐
│         React Application               │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Screens  │←→│Components│←→│ Store  ││
│  └──────────┘  └──────────┘  └────────┘│
│       ↓             ↓            ↓      │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   Core   │  │  Utils   │  │ Types  ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────┘
```

### Паттерны проектирования

**1. Feature-Sliced Design**
- Организация по фичам
- Четкое разделение слоев

**2. Component-Based Architecture**
- Переиспользуемые компоненты
- Композиция вместо наследования

**3. State Management (Flux-like)**
- Однонаправленный поток данных
- Zustand для глобального состояния

**4. Observer Pattern**
- EventEmitter в Executor
- Подписка на события

---

## 🔧 Ключевые системы

### 1. Executor (Интерпретатор)

**Файл:** `src/core/interpreter/Executor.ts`

**Назначение:** Выполнение программ робота

**Основные методы:**
```typescript
class Executor extends EventEmitter {
  loadProgram(program: ProgramNodeInstance[]): void
  async run(): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  resetMission(): void
  
  private async executeNode(node: ProgramNodeInstance): Promise<void>
  private async executeFunction(functionId: string): Promise<void>
}
```

**События:**
- `nodeStart` - начало выполнения ноды
- `stateChange` - изменение состояния робота
- `error` - ошибка выполнения
- `programComplete` - завершение программы

**Особенности:**
- Изоляция состояния (глубокое копирование миссии)
- Рекурсивное выполнение функций
- Валидация глубины вложенности (макс. 10)

---

### 2. GraphConverter

**Файл:** `src/utils/graphConverter.ts`

**Назначение:** Конвертация node-based графа в линейную программу

**Алгоритм:**
1. Найти start ноду
2. Обход графа в глубину (DFS)
3. Развертывание функций
4. Возврат линейной программы

**Методы:**
```typescript
class GraphConverter {
  convert(graph: ProgramGraph): ProgramNodeInstance[]
  
  private traverseFrom(
    nodeId: string,
    visited: Set<string>
  ): ProgramNodeInstance[]
  
  private expandFunction(
    functionId: string,
    visited: Set<string>
  ): ProgramNodeInstance[]
}
```

**Валидация:**
- Проверка циклических зависимостей
- Проверка корректности связей
- Обнаружение изолированных нод

---

### 3. MissionChecker/Validator

**Файлы:**
- `src/utils/missionChecker.ts`
- `src/utils/missionValidator.ts`

**Назначение:** Проверка выполнения целей миссии

**Поддерживаемые типы целей:**
- `reach` - достижение позиции
- `pickup` - взятие предмета
- `deliver` - доставка предмета
- `log_at` - вывод сообщения в определенном месте
- `custom` - кастомные цели

**Методы:**
```typescript
class MissionChecker {
  checkObjectives(): MissionProgress
  
  private checkObjective(objective: MissionObjective): boolean
  private checkReachObjective(objective: MissionObjective): boolean
  private checkPickupObjective(objective: MissionObjective): boolean
  private checkDeliverObjective(objective: MissionObjective): boolean
  private checkLogAtObjective(objective: MissionObjective): boolean
}
```

---

### 4. SchemaManager

**Файл:** `src/utils/schemaManager.ts`

**Назначение:** Управление сохраненными схемами программ

**Методы:**
```typescript
class SchemaManager {
  static getAllSchemas(): SavedSchema[]
  static saveSchema(name: string, graph: ProgramGraph): SavedSchema
  static loadSchema(id: string): SavedSchema | null
  static deleteSchema(id: string): void
  static renameSchema(id: string, newName: string): void
  static duplicateSchema(id: string): SavedSchema | null
  static toggleFavorite(id: string): void
  static searchSchemas(query: string): SavedSchema[]
  static sortSchemas(schemas: SavedSchema[], sortBy, order): SavedSchema[]
  static exportToFile(schema: SavedSchema): void
  static importFromFile(file: File): Promise<SavedSchema>
}
```

**Хранение:** localStorage

---

## 📊 Структура данных

### TypeScript типы

#### ProgramGraph
```typescript
interface ProgramGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowNode {
  id: string;
  type: 'start' | 'end' | 'action' | 'customAction' | 'condition' | 'loop';
  position: { x: number; y: number };
  data: FlowNodeData;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

#### Mission
```typescript
interface Mission {
  id: string;
  stage: number;
  order: number;
  title: string;
  description: string;
  story?: string;
  difficulty: 'tutorial' | 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  prerequisites: string[];
  requiredRobot: string;
  grid: {
    width: number;
    height: number;
    type: 'flat' | 'hills' | 'ice';
  };
  startPosition: {
    x: number;
    y: number;
    direction: 'north' | 'south' | 'east' | 'west';
  };
  objects: GameObject[];
  objectives: MissionObjective[];
  constraints: {
    nodeLimit?: number;
    energyLimit?: number;
    timeLimit?: number;
  };
  availableNodes: string[];
  hints?: Hint[];
  successCriteria?: {
    stars: {
      1: string;
      2: string;
      3: string;
    };
  };
  rewards?: {
    xp?: number;
    unlock?: string[];
    achievements?: string[];
  };
}
```

#### RobotState
```typescript
interface RobotState {
  position: [number, number];
  direction: 'north' | 'south' | 'east' | 'west';
  energy: number;
  inventory: string[];
  pickedUpItems?: string[];
}
```

#### UserFunction
```typescript
interface UserFunction {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  body: ProgramNodeInstance[];
  createdAt: string;
  usageCount: number;
}
```

---

## ⚡ Производительность

### Оптимизации

**React:**
- React.memo для тяжелых компонентов
- useMemo для вычислений
- useCallback для функций
- Lazy loading компонентов

**3D:**
- Оптимизация геометрии
- Переиспользование материалов
- Frustum culling
- LOD (Level of Detail) - планируется

**State Management:**
- Селекторы для избежания лишних ре-рендеров
- Persist middleware с debounce

### Метрики

**Текущие (MVP):**
- Время загрузки: <2 сек
- FPS в 3D: 60
- Размер bundle: ~500 KB (gzipped)
- Time to Interactive: <3 сек

**Цели (v1.0):**
- Время загрузки: <1.5 сек
- FPS в 3D: 60 (стабильно)
- Размер bundle: <400 KB (gzipped)
- Time to Interactive: <2 сек

---

## 🔒 Безопасность

### Текущие меры (MVP)

**Валидация:**
- Валидация пользовательского ввода
- Ограничение глубины рекурсии (макс. 10)
- Ограничение размера функций (макс. 20 нод)
- Ограничение количества функций (макс. 50)

**Хранение:**
- localStorage для локального хранения
- Нет чувствительных данных

### Планируется (v1.0)

**Backend:**
- JWT токены для аутентификации
- HTTPS для всех запросов
- Rate limiting API
- CORS настройки

**Данные:**
- Шифрование чувствительных данных
- Валидация на сервере
- Защита от SQL injection
- XSS защита

---

## 🔄 API (Планируется v1.0)

### REST API

**Endpoints:**

```
POST   /api/auth/register       - Регистрация
POST   /api/auth/login          - Вход
POST   /api/auth/logout         - Выход

GET    /api/user/profile        - Профиль пользователя
PUT    /api/user/profile        - Обновление профиля

GET    /api/missions            - Список миссий
GET    /api/missions/:id        - Детали миссии

GET    /api/progress            - Прогресс игрока
POST   /api/progress/mission    - Сохранение прогресса миссии

GET    /api/schemas             - Схемы игрока
POST   /api/schemas             - Создание схемы
PUT    /api/schemas/:id         - Обновление схемы
DELETE /api/schemas/:id         - Удаление схемы

GET    /api/functions           - Функции игрока
POST   /api/functions           - Создание функции
PUT    /api/functions/:id       - Обновление функции
DELETE /api/functions/:id       - Удаление функции

GET    /api/achievements        - Достижения игрока
GET    /api/leaderboard         - Рейтинг
```

### WebSocket (Планируется v2.0)

**События:**
- Мультиплеер
- Реал-тайм обновления
- Чат

---

## 📦 Deployment

### Текущий (MVP)

**Development:**
- `npm run dev` - локальный сервер
- Hot Module Replacement (HMR)

**Build:**
- `npm run build` - production build
- TypeScript compilation
- Vite optimization

### Планируется (v1.0)

**CI/CD:**
- GitHub Actions
- Автоматические тесты
- Автоматический deploy

**Hosting:**
- Frontend: Vercel/Netlify
- Backend: AWS/DigitalOcean
- Database: PostgreSQL
- CDN: Cloudflare

**Monitoring:**
- Sentry - отслеживание ошибок
- Google Analytics - аналитика
- Performance monitoring

---

## 🧪 Тестирование

### Unit тесты (Планируется)

**Vitest:**
- Тестирование утилит
- Тестирование Executor
- Тестирование GraphConverter
- Тестирование валидаторов

### E2E тесты (Планируется)

**Playwright:**
- Прохождение миссий
- Создание программ
- Сохранение/загрузка схем
- Создание функций

### Coverage (Цель)

- Unit тесты: 80%+
- E2E тесты: критические пути

---

*Обновлено: 15.10.2025*  
*Версия: 2.0*  
*Статус: ✅ MVP Complete*
