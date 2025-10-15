# API Reference
## "Космический Инженер"

**Дата:** 15.10.2025  
**Версия:** 1.0

---

## 📚 Содержание

1. [Core Classes](#core-classes)
2. [Store (Zustand)](#store-zustand)
3. [Utils](#utils)
4. [Types](#types)
5. [Components](#components)

---

## 🎯 Core Classes

### Executor

**Файл:** `src/core/interpreter/Executor.ts`

**Описание:** Интерпретатор программ робота

#### Constructor

```typescript
constructor(
  initialRobotState: RobotState,
  mission?: Mission,
  getFunctionById?: (id: string) => UserFunction | undefined
)
```

**Параметры:**
- `initialRobotState` - начальное состояние робота
- `mission` - миссия (опционально)
- `getFunctionById` - функция получения пользовательских функций

#### Methods

**loadProgram()**
```typescript
loadProgram(program: ProgramNodeInstance[]): void
```
Загружает программу для выполнения.

**run()**
```typescript
async run(): Promise<void>
```
Запускает выполнение программы.

**pause()**
```typescript
pause(): void
```
Приостанавливает выполнение.

**resume()**
```typescript
resume(): void
```
Возобновляет выполнение после паузы.

**stop()**
```typescript
stop(): void
```
Останавливает выполнение.

**resetMission()**
```typescript
resetMission(): void
```
Сбрасывает миссию к исходному состоянию.

**getRobotState()**
```typescript
getRobotState(): RobotState
```
Возвращает текущее состояние робота.

**setMission()**
```typescript
setMission(mission: Mission): void
```
Устанавливает новую миссию.

#### Events

**nodeStart**
```typescript
{
  type: 'nodeStart',
  nodeId: string
}
```

**stateChange**
```typescript
{
  type: 'stateChange',
  newState: RobotState
}
```

**error**
```typescript
{
  type: 'error',
  error: string
}
```

**programComplete**
```typescript
{
  type: 'programComplete'
}
```

#### Example

```typescript
import { Executor } from './core/interpreter/Executor'

const executor = new Executor(robotState, mission, getFunctionById)

executor.subscribe(event => {
  switch (event.type) {
    case 'stateChange':
      console.log('Robot state:', event.newState)
      break
    case 'programComplete':
      console.log('Program complete!')
      break
  }
})

executor.loadProgram(program)
await executor.run()
```

---

### GraphConverter

**Файл:** `src/utils/graphConverter.ts`

**Описание:** Конвертер node-based графа в линейную программу

#### Methods

**convert()**
```typescript
convert(graph: ProgramGraph): ProgramNodeInstance[]
```

**Параметры:**
- `graph` - граф программы (nodes + edges)

**Возвращает:** Линейную программу

**Throws:** Error если граф невалиден

#### Example

```typescript
import { GraphConverter } from './utils/graphConverter'

const converter = new GraphConverter()
const program = converter.convert(graph)
```

---

### MissionChecker

**Файл:** `src/utils/missionChecker.ts`

**Описание:** Проверка выполнения целей миссии

#### Constructor

```typescript
constructor(
  mission: Mission,
  robotState: RobotState,
  program: ProgramNodeInstance[]
)
```

#### Methods

**checkObjectives()**
```typescript
checkObjectives(): MissionProgress
```

**Возвращает:**
```typescript
interface MissionProgress {
  completed: boolean
  objectives: Array<{
    id: string
    description: string
    completed: boolean
    required: boolean
  }>
}
```

#### Example

```typescript
import { MissionChecker } from './utils/missionChecker'

const checker = new MissionChecker(mission, robotState, program)
const progress = checker.checkObjectives()

if (progress.completed) {
  console.log('Mission complete!')
}
```

---

### SchemaManager

**Файл:** `src/utils/schemaManager.ts`

**Описание:** Управление сохраненными схемами

#### Methods

**getAllSchemas()**
```typescript
static getAllSchemas(): SavedSchema[]
```

**saveSchema()**
```typescript
static saveSchema(
  name: string,
  graph: ProgramGraph,
  description?: string
): SavedSchema
```

**loadSchema()**
```typescript
static loadSchema(id: string): SavedSchema | null
```

**deleteSchema()**
```typescript
static deleteSchema(id: string): void
```

**renameSchema()**
```typescript
static renameSchema(id: string, newName: string): void
```

**duplicateSchema()**
```typescript
static duplicateSchema(id: string, newName?: string): SavedSchema | null
```

**toggleFavorite()**
```typescript
static toggleFavorite(id: string): void
```

**searchSchemas()**
```typescript
static searchSchemas(query: string): SavedSchema[]
```

**sortSchemas()**
```typescript
static sortSchemas(
  schemas: SavedSchema[],
  sortBy: 'name' | 'date' | 'updated' | 'size',
  order: 'asc' | 'desc'
): SavedSchema[]
```

**exportToFile()**
```typescript
static exportToFile(schema: SavedSchema): void
```

**importFromFile()**
```typescript
static importFromFile(file: File): Promise<SavedSchema>
```

#### Example

```typescript
import { SchemaManager } from './utils/schemaManager'

// Сохранить схему
const schema = SchemaManager.saveSchema('My Program', graph, 'Description')

// Загрузить схему
const loaded = SchemaManager.loadSchema(schema.id)

// Поиск
const results = SchemaManager.searchSchemas('mission 1')

// Сортировка
const sorted = SchemaManager.sortSchemas(schemas, 'date', 'desc')
```

---

## 🗄️ Store (Zustand)

### useGameStore

**Файл:** `src/store/useGameStore.ts`

**Описание:** Глобальное состояние игры

#### State

```typescript
interface GameStore {
  // Состояние робота
  robotState: RobotState
  
  // Состояние выполнения
  executionState: {
    running: boolean
    paused: boolean
    currentNodeId: string | null
  }
  
  // Логи
  logs: Array<{
    message: string
    type: 'info' | 'success' | 'error' | 'warning'
    timestamp: number
  }>
  
  // Пользовательские функции
  userFunctions: UserFunction[]
}
```

#### Actions

```typescript
// Робот
setRobotState(state: Partial<RobotState>): void
resetRobotState(): void

// Выполнение
setExecutionState(state: Partial<ExecutionState>): void

// Логи
addLogEntry(message: string, type: LogType): void
clearLogs(): void

// Функции
createFunction(func: Omit<UserFunction, 'id' | 'createdAt' | 'usageCount'>): void
updateFunction(id: string, updates: Partial<UserFunction>): void
deleteFunction(id: string): void
getFunctionById(id: string): UserFunction | undefined
incrementFunctionUsage(id: string): void
```

#### Example

```typescript
import { useGameStore } from './store/useGameStore'

function MyComponent() {
  const { robotState, setRobotState } = useGameStore()
  
  const moveRobot = () => {
    setRobotState({
      position: [robotState.position[0] + 1, robotState.position[1]]
    })
  }
  
  return <button onClick={moveRobot}>Move</button>
}
```

---

### useGameFlowStore

**Файл:** `src/store/useGameFlowStore.ts`

**Описание:** Управление потоком игры

#### State

```typescript
interface GameFlowStore {
  stage: GameStage
  mission: Mission | null
  program: ProgramNodeInstance[]
  programGraph: ProgramGraph | null
  executionResult: ExecutionResult | null
}
```

#### Actions

```typescript
setStage(stage: GameStage): void
startMission(mission: Mission): void
setProgram(program: ProgramNodeInstance[]): void
setProgramGraph(graph: ProgramGraph): void
setExecutionResult(result: ExecutionResult): void
resetFlow(): void

// Навигация
goToBriefing(): void
goToProgramming(): void
goToExecution(): void
goToResult(result: ExecutionResult): void

// Миссия
resetMissionToInitial(): void
updateMission(mission: Mission): void
```

#### Example

```typescript
import { useGameFlowStore } from './store/useGameFlowStore'

function MissionSelect() {
  const { startMission } = useGameFlowStore()
  
  return (
    <button onClick={() => startMission(MISSION_1_1)}>
      Start Mission
    </button>
  )
}
```

---

## 🔧 Utils

### functionValidator

**Файл:** `src/utils/functionValidator.ts`

#### Functions

**validateNoRecursion()**
```typescript
validateNoRecursion(
  functionId: string,
  body: ProgramNodeInstance[],
  allFunctions: UserFunction[]
): boolean
```

**validateDepth()**
```typescript
validateDepth(
  body: ProgramNodeInstance[],
  allFunctions: UserFunction[],
  maxDepth: number = 10
): boolean
```

**validateSize()**
```typescript
validateSize(
  body: ProgramNodeInstance[],
  maxSize: number = 20
): boolean
```

**validateFunctionUsage()**
```typescript
validateFunctionUsage(
  functionId: string,
  allPrograms: ProgramGraph[]
): boolean
```

---

## 📝 Types

### Core Types

```typescript
// Направление
type Direction = 'north' | 'south' | 'east' | 'west'

// Тип ноды
type NodeType = 
  | 'moveForward'
  | 'moveBackward'
  | 'turnLeft'
  | 'turnRight'
  | 'pickUp'
  | 'putDown'
  | 'wait'
  | 'log'
  | 'open'

// Состояние робота
interface RobotState {
  position: [number, number]
  direction: Direction
  energy: number
  inventory: string[]
  pickedUpItems?: string[]
}

// Миссия
interface Mission {
  id: string
  stage: number
  order: number
  title: string
  description: string
  // ... (см. полное определение в types/missions.ts)
}

// Граф программы
interface ProgramGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// Пользовательская функция
interface UserFunction {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  body: ProgramNodeInstance[]
  createdAt: string
  usageCount: number
}
```

---

## 🎨 Components

### NodeBasedEditor

**Файл:** `src/components/editor/NodeBasedEditor.tsx`

**Props:**
```typescript
interface NodeBasedEditorProps {
  initialGraph?: ProgramGraph
  onGraphChange?: (graph: ProgramGraph) => void
}
```

**Example:**
```typescript
<NodeBasedEditor
  initialGraph={savedGraph}
  onGraphChange={(graph) => console.log('Graph changed:', graph)}
/>
```

---

### GameScene

**Файл:** `src/components/scene/GameScene.tsx`

**Props:** Нет (использует store)

**Example:**
```typescript
<GameScene />
```

---

### Simulator2D

**Файл:** `src/components/simulator/Simulator2D.tsx`

**Props:**
```typescript
interface Simulator2DProps {
  executor: Executor
  mission: Mission
  onReset?: () => void
}
```

**Example:**
```typescript
<Simulator2D
  executor={executor}
  mission={mission}
  onReset={() => console.log('Reset')}
/>
```

---

*Обновлено: 15.10.2025*  
*Версия: 1.0*
