import { ProgramNodeInstance, UserFunction } from '../../types/nodes';
import { RobotState } from '../../types/robots';
import { Direction } from '../../types/nodes';
import { Mission } from '../../types/missions';
import { NODE_DEFINITIONS } from '../nodes/nodeDefinitions';

type ExecutorCallback = (event: ExecutorEvent) => void | Promise<void>;

interface ExecutorEvent {
  type: 'nodeStart' | 'nodeComplete' | 'error' | 'programComplete' | 'stateChange';
  nodeId?: string;
  nodeType?: string;
  error?: string;
  newState?: Partial<RobotState>;
}

export class Executor {
  private program: ProgramNodeInstance[] = [];
  private currentIndex: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private callbacks: ExecutorCallback[] = [];
  private robotState: RobotState;
  private initialState: RobotState;
  private mission: Mission | null = null;
  private initialMissionObjects: any[] = [];
  private getFunctionById: (id: string) => UserFunction | undefined;

  constructor(
    initialRobotState: RobotState, 
    mission?: Mission,
    getFunctionById?: (id: string) => UserFunction | undefined
  ) {
    this.robotState = { ...initialRobotState };
    this.initialState = { ...initialRobotState };
    
    // Работаем с оригинальной миссией для синхронизации визуализации
    this.mission = mission || null;
    
    // Сохраняем исходное состояние объектов миссии для возможности сброса
    if (mission?.objects) {
      this.initialMissionObjects = JSON.parse(JSON.stringify(mission.objects));
    }
    
    this.getFunctionById = getFunctionById || (() => undefined);
  }

  setMission(mission: Mission): void {
    // Работаем с оригинальной миссией для синхронизации визуализации
    this.mission = mission;
    // Обновляем сохраненное исходное состояние объектов
    if (mission.objects) {
      this.initialMissionObjects = JSON.parse(JSON.stringify(mission.objects));
    }
  }

  loadProgram(program: ProgramNodeInstance[]): void {
    console.log('📥 Executor.loadProgram вызван, загружаем программу:', JSON.stringify(program, null, 2));
    this.program = program;
    this.currentIndex = 0;
    console.log('✅ Программа загружена в Executor, this.program:', this.program);
  }

  subscribe(callback: ExecutorCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private emit(event: ExecutorEvent): void {
    this.callbacks.forEach(cb => cb(event));
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.currentIndex = 0;

    // Запускаем таймеры для дверей
    this.startDoorTimers();

    try {
      while (this.currentIndex < this.program.length && this.isRunning) {
        if (this.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const node = this.program[this.currentIndex];
        await this.executeNode(node);
        this.currentIndex++;
      }

      if (this.isRunning) {
        this.emit({ type: 'programComplete' });
      }
    } catch (error) {
      this.emit({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.isRunning = false;
    }
  }

  private startDoorTimers(): void {
    if (!this.mission) return;

    // Находим все двери и запускаем таймеры
    this.mission.objects.forEach(obj => {
      if (obj.type === 'obstacle' && obj.properties?.isDoor) {
        const openTime = obj.properties.openTime || 3;
        const openDuration = obj.properties.openDuration || 2;

        // Открываем дверь через openTime секунд
        setTimeout(() => {
          if (obj.properties) {
            obj.properties.isOpen = true;
            console.log('🚪 Дверь открылась автоматически!');
            
            // Эмитим событие для обновления UI
            this.emit({
              type: 'stateChange',
              newState: this.robotState,
            });
            
            // Закрываем через openDuration секунд (только если робот не на двери)
            setTimeout(() => {
              if (obj.properties) {
                // Проверяем, не стоит ли робот на двери
                const [doorX, doorY] = obj.position;
                const [robotX, robotY] = this.robotState.position;
                
                if (robotX === doorX && robotY === doorY) {
                  console.log('🚪 Дверь не закрывается - робот внутри! Ждем...');
                  
                  // Проверяем каждые 500мс, ушел ли робот
                  const checkInterval = setInterval(() => {
                    const [currentX, currentY] = this.robotState.position;
                    if (currentX !== doorX || currentY !== doorY) {
                      // Робот ушел, закрываем дверь
                      if (obj.properties) {
                        obj.properties.isOpen = false;
                        console.log('🚪 Дверь закрылась (робот ушел)!');
                        
                        // Эмитим событие для обновления UI
                        this.emit({
                          type: 'stateChange',
                          newState: this.robotState,
                        });
                      }
                      clearInterval(checkInterval);
                    }
                  }, 500);
                } else {
                  obj.properties.isOpen = false;
                  console.log('🚪 Дверь закрылась автоматически!');
                  
                  // Эмитим событие для обновления UI
                  this.emit({
                    type: 'stateChange',
                    newState: this.robotState,
                  });
                }
              }
            }, openDuration * 1000);
          }
        }, openTime * 1000);
      }
    });
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
  }

  reset(): void {
    this.stop();
    this.currentIndex = 0;
    this.robotState = { ...this.initialState };
    this.emit({
      type: 'stateChange',
      newState: this.robotState,
    });
  }

  resetMission(): void {
    // Восстанавливаем объекты миссии из сохраненного состояния
    if (this.mission && this.initialMissionObjects.length > 0) {
      this.mission.objects = JSON.parse(JSON.stringify(this.initialMissionObjects));
      console.log('🔄 Объекты миссии восстановлены:', this.mission.objects);
      
      // Сбрасываем состояние робота
      this.robotState = { ...this.initialState };
      
      // Очищаем pickedUpItems
      this.robotState.pickedUpItems = undefined;
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    }
  }

  getRobotState(): RobotState {
    return this.robotState;
  }

  private async executeNode(node: ProgramNodeInstance): Promise<void> {
    console.log(`📝 Выполнение ноды: ${node.nodeType}, ID: ${node.id}`);
    
    // Если это вызов функции
    if (node.functionId) {
      console.log(`📦 Вызов функции: ${node.functionId}`);
      await this.executeFunction(node.functionId);
      return;
    }
    
    const nodeDef = NODE_DEFINITIONS[node.nodeType];
    
    if (!nodeDef) {
      throw new Error(`Unknown node type: ${node.nodeType}`);
    }
    
    this.emit({
      type: 'nodeStart',
      nodeId: node.id,
      nodeType: node.nodeType,
    });
    
    console.log(`🎯 Switch case для: ${node.nodeType}`);
    
    switch (node.nodeType) {
      case 'moveForward':
        await this.executeMoveForward();
        break;
      case 'moveBackward':
        await this.executeMoveBackward();
        break;
      case 'turnLeft':
        await this.executeTurnLeft();
        break;
      case 'turnRight':
        await this.executeTurnRight();
        break;
      case 'pickUp':
        await this.executePickUp();
        break;
      case 'putDown':
        await this.executePutDown();
        break;
      // Команды из CustomActionNode
      case 'take':
        await this.executePickUp();
        break;
      case 'put':
        await this.executePutDown();
        break;
      case 'activate':
        await this.executeActivate();
        break;
      case 'scan':
        await this.executeScan();
        break;
      case 'repair':
        await this.executeRepair();
        break;
      case 'build':
        await this.executeBuild();
        break;
      case 'destroy':
        await this.executeDestroy();
        break;
      case 'open':
        await this.executeOpen();
        break;
      case 'close':
        await this.executeClose();
        break;
      case 'use':
        await this.executeUse();
        break;
      case 'wait':
        await this.executeWait(node.parameters?.seconds || 1);
        break;
      case 'log':
        await this.executeLog(node.parameters?.message || '');
        break;
      case 'repeat':
        await this.executeRepeat(node);
        break;
      case 'repeatWhile':
        await this.executeRepeatWhile(node);
        break;
      case 'if':
        await this.executeIf(node);
        break;
      default:
        throw new Error(`Unimplemented node type: ${node.nodeType}`);
    }

    // Расход энергии
    this.robotState.energy -= nodeDef.energyCost;
    if (this.robotState.energy < 0) {
      throw new Error('Батарея разряжена!');
    }

    // Отправляем обновление состояния после расхода энергии
    this.emit({
      type: 'stateChange',
      newState: this.robotState,
    });

    this.emit({
      type: 'nodeComplete',
      nodeId: node.id,
      nodeType: node.nodeType,
    });

    // Задержка для анимации
    const duration = typeof nodeDef.duration === 'number' ? nodeDef.duration : 1000;
    await this.sleep(duration);
  }

  private canMoveTo(x: number, y: number): boolean {
    if (!this.mission) {
      console.log('⚠️ Нет миссии, движение разрешено');
      return true;
    }

    // Проверка границ поля
    if (x < 0 || y < 0 || x >= this.mission.grid.width || y >= this.mission.grid.height) {
      console.log(`🚫 Выход за границы поля: [${x}, ${y}], размер поля: ${this.mission.grid.width}x${this.mission.grid.height}`);
      return false;
    }

    // Проверка препятствий (obstacle блокирует движение, кроме открытых дверей)
    const blockingObstacle = this.mission.objects.find(obj => {
      if (obj.type === 'obstacle' && obj.position[0] === x && obj.position[1] === y) {
        // Если это дверь, проверяем открыта ли она
        if (obj.properties?.isDoor) {
          const isBlocked = !obj.properties.isOpen;
          console.log(`🚪 Дверь на [${x}, ${y}]: ${obj.properties.isOpen ? 'открыта' : 'закрыта'}`);
          return isBlocked;
        }
        // Обычное препятствие - всегда блокирует
        console.log(`🧱 Препятствие на [${x}, ${y}]`);
        return true;
      }
      return false;
    });

    if (blockingObstacle) {
      console.log(`❌ Движение на [${x}, ${y}] заблокировано объектом:`, blockingObstacle);
      return false;
    }

    console.log(`✅ Движение на [${x}, ${y}] разрешено`);
    return true;
  }

  private async executeMoveForward(): Promise<void> {
    const [x, y] = this.robotState.position;
    let newX = x;
    let newY = y;

    switch (this.robotState.direction) {
      case 'north':
        newY = y - 1;
        break;
      case 'east':
        newX = x + 1;
        break;
      case 'south':
        newY = y + 1;
        break;
      case 'west':
        newX = x - 1;
        break;
    }

    console.log(`🤖 Попытка движения вперед: [${x}, ${y}] -> [${newX}, ${newY}], направление: ${this.robotState.direction}`);

    // Проверка коллизий
    if (!this.canMoveTo(newX, newY)) {
      console.error(`❌ Путь заблокирован! Позиция [${newX}, ${newY}] недоступна`);
      throw new Error(`Путь заблокирован! Невозможно двигаться вперед на позицию [${newX}, ${newY}].`);
    }

    this.robotState.position = [newX, newY];
    console.log(`✅ Робот переместился на [${newX}, ${newY}]`);
    
    this.emit({
      type: 'stateChange',
      newState: { position: [newX, newY] },
    });
  }

  private async executeMoveBackward(): Promise<void> {
    const [x, y] = this.robotState.position;
    let newX = x;
    let newY = y;

    switch (this.robotState.direction) {
      case 'north':
        newY = y + 1;
        break;
      case 'east':
        newX = x - 1;
        break;
      case 'south':
        newY = y - 1;
        break;
      case 'west':
        newX = x + 1;
        break;
    }

    // Проверка коллизий
    if (!this.canMoveTo(newX, newY)) {
      throw new Error('Путь заблокирован! Невозможно двигаться назад.');
    }

    this.robotState.position = [newX, newY];
    this.emit({
      type: 'stateChange',
      newState: { position: [newX, newY] },
    });
  }

  private async executeTurnLeft(): Promise<void> {
    const directions: Direction[] = ['north', 'west', 'south', 'east'];
    const currentIndex = directions.indexOf(this.robotState.direction);
    const newDirection = directions[(currentIndex + 1) % 4];

    console.log(`🔄 Поворот налево: ${this.robotState.direction} -> ${newDirection}`);
    
    this.robotState.direction = newDirection;
    this.emit({
      type: 'stateChange',
      newState: { direction: newDirection },
    });
  }

  private async executeTurnRight(): Promise<void> {
    const directions: Direction[] = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(this.robotState.direction);
    const newDirection = directions[(currentIndex + 1) % 4];

    console.log(`🔄 Поворот направо: ${this.robotState.direction} -> ${newDirection}`);
    
    this.robotState.direction = newDirection;
    this.emit({
      type: 'stateChange',
      newState: { direction: newDirection },
    });
  }

  private async executePickUp(): Promise<void> {
    if (!this.mission) {
      throw new Error('Нет активной миссии');
    }

    const [x, y] = this.robotState.position;
    
    // Ищем предмет на текущей позиции
    const objectIndex = this.mission.objects.findIndex(obj => 
      (obj.type === 'resource' || obj.type === 'container') &&
      obj.position[0] === x && 
      obj.position[1] === y
    );

    if (objectIndex === -1) {
      throw new Error('Здесь нет предмета для взятия!');
    }

    const object = this.mission.objects[objectIndex];
    
    // Добавляем в инвентарь
    this.robotState.inventory.push(object.id || object.type);
    
    // Сохраняем информацию о взятом предмете для валидации
    if (!this.robotState.pickedUpItems) {
      this.robotState.pickedUpItems = [];
    }
    this.robotState.pickedUpItems.push(object.id || object.type);
    
    // Удаляем объект с поля
    this.mission.objects.splice(objectIndex, 1);
    
    this.emit({
      type: 'stateChange',
      newState: { inventory: [...this.robotState.inventory] },
    });
    
    console.log('✅ Предмет взят:', object.type, object.id);
  }

  private async executePutDown(): Promise<void> {
    if (!this.mission) {
      throw new Error('Нет активной миссии');
    }

    if (this.robotState.inventory.length === 0) {
      throw new Error('Инвентарь пуст! Нечего положить.');
    }

    const [x, y] = this.robotState.position;
    console.log(`📦 Попытка положить предмет на позиции [${x}, ${y}]`);
    console.log(`🎒 Инвентарь:`, this.robotState.inventory);
    
    const itemId = this.robotState.inventory.pop()!;
    
    // Проверяем, есть ли на этой позиции база/цель для доставки
    console.log(`🔍 Поиск базы/цели на позиции [${x}, ${y}]`);
    console.log(`📋 Все объекты миссии:`, this.mission.objects.map(obj => ({
      type: obj.type,
      id: obj.id,
      position: obj.position
    })));
    
    const targetObject = this.mission.objects.find(obj =>
      (obj.type === 'base' || obj.type === 'goal') &&
      obj.position[0] === x &&
      obj.position[1] === y
    );

    if (targetObject) {
      // Предмет доставлен в нужное место
      console.log(`✅ Предмет "${itemId}" доставлен в:`, targetObject.type, targetObject.id);
      
      // Помечаем базу как получившую доставку
      if (!targetObject.properties) {
        targetObject.properties = {};
      }
      targetObject.properties.delivered = true;
      targetObject.properties.deliveredItem = itemId;
    } else {
      // Просто кладем предмет на землю (возвращаем на поле)
      this.mission.objects.push({
        type: 'resource',
        id: itemId,
        position: [x, y],
      });
      console.log(`📦 Предмет "${itemId}" положен на землю на позиции [${x}, ${y}]`);
    }
    
    this.emit({
      type: 'stateChange',
      newState: { inventory: [...this.robotState.inventory] },
    });
  }

  private async executeWait(seconds: number): Promise<void> {
    await this.sleep(seconds * 1000);
  }

  private async executeFunction(functionId: string): Promise<void> {
    console.log(`📦 Выполнение функции: ${functionId}`);
    
    // Получаем функцию
    const func = this.getFunctionById(functionId);
    
    if (!func) {
      throw new Error(`Функция не найдена: ${functionId}`);
    }
    
    console.log(`📦 Функция "${func.name}" содержит ${func.body.length} блоков`);
    
    // Рекурсивно выполняем тело функции
    for (const node of func.body) {
      if (!this.isRunning) break;
      
      while (this.isPaused) {
        await this.sleep(100);
      }
      
      await this.executeNode(node);
    }
    
    console.log(`✅ Функция "${func.name}" выполнена`);
  }

  private async executeRepeat(node: ProgramNodeInstance): Promise<void> {
    // Поддерживаем оба варианта: count (из GraphConverter) и times (старый формат)
    const times = node.parameters?.count || node.parameters?.times || 3;
    console.log(`🔁 Повторить ${times} раз (параметры:`, node.parameters, ')');

    for (let i = 0; i < times; i++) {
      if (!this.isRunning) break;

      console.log(`🔁 Итерация ${i + 1}/${times}`);

      // Выполняем вложенные блоки
      const children = node.children || [];
      for (const child of children) {
        if (!this.isRunning) break;

        while (this.isPaused) {
          await this.sleep(100);
        }

        await this.executeNode(child);
      }
    }

    console.log(`✅ Цикл repeat завершен`);
  }

  private async executeRepeatWhile(node: ProgramNodeInstance): Promise<void> {
    const condition = node.parameters?.condition || 'energy > 50';
    console.log(`🔄 Повторять пока: ${condition}`);

    let iterations = 0;
    const maxIterations = 1000; // Защита от бесконечного цикла
    let shouldExit = false; // Флаг для выхода из внешнего цикла

    while (this.isRunning && iterations < maxIterations && !shouldExit) {
      // Проверяем условие ПЕРЕД итерацией
      const conditionResult = this.evaluateCondition(condition);
      console.log(`🔄 Проверка условия "${condition}": ${conditionResult}, энергия: ${this.robotState.energy}`);

      if (!conditionResult) {
        console.log(`🔄 Условие стало ложным, выход из цикла`);
        break;
      }

      iterations++;
      console.log(`🔄 Итерация ${iterations}`);

      // Выполняем вложенные блоки
      const children = node.children || [];
      for (const child of children) {
        if (!this.isRunning) {
          shouldExit = true;
          break;
        }

        while (this.isPaused) {
          await this.sleep(100);
        }

        await this.executeNode(child);
        
        // Проверяем условие ПОСЛЕ каждого блока
        const conditionAfter = this.evaluateCondition(condition);
        console.log(`🔄 Проверка условия после блока "${child.nodeType}": ${conditionAfter}, энергия: ${this.robotState.energy}`);
        
        if (!conditionAfter) {
          console.log(`🔄 Условие стало ложным после блока, выход из цикла`);
          shouldExit = true; // Устанавливаем флаг вместо return
          break; // Выходим из for
        }
      }
    }

    if (iterations >= maxIterations) {
      console.warn(`⚠️ Цикл прерван: достигнут лимит итераций (${maxIterations})`);
    }

    console.log(`✅ Цикл repeatWhile завершен (${iterations} итераций)`);
  }

  private async executeIf(node: ProgramNodeInstance): Promise<void> {
    const condition = node.parameters?.condition || 'energy > 50';
    console.log(`❓ Если: ${condition}`);

    // Проверяем условие
    const conditionResult = this.evaluateCondition(condition);
    console.log(`❓ Результат условия "${condition}": ${conditionResult}`);

    if (conditionResult) {
      // Выполняем TRUE ветку (children)
      const children = node.children || [];
      console.log(`✅ Условие TRUE, выполняем ${children.length} нод`);
      for (const child of children) {
        if (!this.isRunning) break;

        while (this.isPaused) {
          await this.sleep(100);
        }

        await this.executeNode(child);
      }
    } else {
      // Выполняем FALSE ветку (elseBranch)
      const elseBranch = node.elseBranch || [];
      console.log(`❌ Условие FALSE, выполняем ${elseBranch.length} нод`);
      for (const child of elseBranch) {
        if (!this.isRunning) break;

        while (this.isPaused) {
          await this.sleep(100);
        }

        await this.executeNode(child);
      }
    }

    console.log(`✅ Условие if завершено`);
  }

  private evaluateCondition(condition: string): boolean {
    try {
      // Проверяем специальные функции проверки окружения
      if (condition === 'canMoveForward') {
        return this.canMoveForward();
      }
      if (condition === 'isDoorAhead') {
        return this.isDoorAhead();
      }
      if (condition === 'isDoorOpen') {
        return this.isDoorOpen();
      }
      if (condition === 'hasItem') {
        return this.robotState.inventory.length > 0;
      }
      if (condition === 'inventoryFull') {
        return this.robotState.inventory.length >= 5;
      }
      
      // Простой парсер условий
      // Поддерживаемые операторы: >, <, >=, <=, ==, !=
      
      // Заменяем переменные на значения
      let expr = condition
        .replace(/energy/g, this.robotState.energy.toString())
        .replace(/inventorySize/g, this.robotState.inventory.length.toString());

      // Безопасная оценка выражения
      // Разрешаем только числа (включая дробные), операторы сравнения и логические операторы
      if (!/^[\d.\s><=!&|()]+$/.test(expr)) {
        console.warn(`⚠️ Небезопасное условие: ${condition}`);
        return false;
      }

      // Заменяем операторы на JavaScript
      expr = expr
        .replace(/==/g, '===')
        .replace(/!=/g, '!==');

      // Используем Function для безопасной оценки
      const result = new Function(`return ${expr}`)();
      return Boolean(result);
    } catch (error) {
      console.error(`❌ Ошибка оценки условия "${condition}":`, error);
      return false;
    }
  }

  // Проверка: можно ли двигаться вперед
  private canMoveForward(): boolean {
    if (!this.mission) return false;
    
    const [x, y] = this.robotState.position;
    const direction = this.robotState.direction;
    
    // Вычисляем следующую позицию
    let nextX = x;
    let nextY = y;
    
    switch (direction) {
      case 'north': nextY -= 1; break;
      case 'south': nextY += 1; break;
      case 'east': nextX += 1; break;
      case 'west': nextX -= 1; break;
    }
    
    // Проверяем границы
    if (nextX < 0 || nextX >= this.mission.grid.width || 
        nextY < 0 || nextY >= this.mission.grid.height) {
      return false;
    }
    
    // Проверяем препятствия
    const obstacle = this.mission.objects.find(
      obj => obj.type === 'obstacle' && 
             obj.position[0] === nextX && 
             obj.position[1] === nextY
    );
    
    if (obstacle) {
      // Если это дверь, проверяем открыта ли она
      if (obstacle.properties?.isDoor) {
        return obstacle.properties?.isOpen === true;
      }
      return false;
    }
    
    return true;
  }

  // Проверка: есть ли дверь впереди
  private isDoorAhead(): boolean {
    if (!this.mission) return false;
    
    const [x, y] = this.robotState.position;
    const direction = this.robotState.direction;
    
    // Вычисляем следующую позицию
    let nextX = x;
    let nextY = y;
    
    switch (direction) {
      case 'north': nextY -= 1; break;
      case 'south': nextY += 1; break;
      case 'east': nextX += 1; break;
      case 'west': nextX -= 1; break;
    }
    
    // Ищем дверь на следующей позиции
    const door = this.mission.objects.find(
      obj => obj.properties?.isDoor === true &&
             obj.position[0] === nextX && 
             obj.position[1] === nextY
    );
    
    return door !== undefined;
  }

  // Проверка: открыта ли дверь впереди
  private isDoorOpen(): boolean {
    if (!this.mission) return false;
    
    const [x, y] = this.robotState.position;
    const direction = this.robotState.direction;
    
    // Вычисляем следующую позицию
    let nextX = x;
    let nextY = y;
    
    switch (direction) {
      case 'north': nextY -= 1; break;
      case 'south': nextY += 1; break;
      case 'east': nextX += 1; break;
      case 'west': nextX -= 1; break;
    }
    
    // Ищем дверь на следующей позиции
    const door = this.mission.objects.find(
      obj => obj.properties?.isDoor === true &&
             obj.position[0] === nextX && 
             obj.position[1] === nextY
    );
    
    if (!door) return false;
    
    return door.properties?.isOpen === true;
  }

  private async executeLog(message: string): Promise<void> {
    if (!this.mission) {
      console.log(`[Robot Log]: ${message}`);
      return;
    }

    const [x, y] = this.robotState.position;
    
    // Ищем станцию/маяк на текущей позиции
    const station = this.mission.objects.find(obj =>
      obj.type === 'station' &&
      obj.position[0] === x &&
      obj.position[1] === y
    );

    if (station) {
      // Активируем маяк/станцию
      if (!station.properties) {
        station.properties = {};
      }
      station.properties.activated = true;
      station.properties.message = message;
      
      console.log(`📡 Маяк активирован! Сообщение: "${message}"`);
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log(`[Robot Log]: ${message}`);
    }
  }

  // Команды из CustomActionNode
  private async executeActivate(): Promise<void> {
    if (!this.mission) {
      console.log('⚡ Активация (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    
    // Ищем объект для активации на текущей позиции или рядом
    const targetObject = this.mission.objects.find(obj =>
      (obj.type === 'station' || obj.type === 'terminal' || obj.type === 'door') &&
      Math.abs(obj.position[0] - x) <= 1 &&
      Math.abs(obj.position[1] - y) <= 1
    );

    if (targetObject) {
      if (!targetObject.properties) {
        targetObject.properties = {};
      }
      targetObject.properties.activated = true;
      
      console.log(`⚡ Активирован объект: ${targetObject.type} на позиции [${targetObject.position}]`);
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log('⚠️ Нет объектов для активации рядом');
    }
  }

  private async executeScan(): Promise<void> {
    if (!this.mission) {
      console.log('🔍 Сканирование (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    console.log(`🔍 Сканирование области вокруг [${x}, ${y}]`);
    
    // Сканируем объекты в радиусе 2 клеток
    const nearbyObjects = this.mission.objects.filter(obj =>
      Math.abs(obj.position[0] - x) <= 2 &&
      Math.abs(obj.position[1] - y) <= 2
    );

    console.log(`📡 Обнаружено объектов: ${nearbyObjects.length}`);
    nearbyObjects.forEach(obj => {
      console.log(`  - ${obj.type} на [${obj.position}]`);
    });
  }

  private async executeRepair(): Promise<void> {
    if (!this.mission) {
      console.log('🔧 Ремонт (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    
    // Ищем поврежденный объект рядом
    const targetObject = this.mission.objects.find(obj =>
      obj.properties?.damaged &&
      Math.abs(obj.position[0] - x) <= 1 &&
      Math.abs(obj.position[1] - y) <= 1
    );

    if (targetObject && targetObject.properties) {
      targetObject.properties.damaged = false;
      targetObject.properties.repaired = true;
      
      console.log(`🔧 Отремонтирован объект: ${targetObject.type} на позиции [${targetObject.position}]`);
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log('⚠️ Нет поврежденных объектов рядом');
    }
  }

  private async executeBuild(): Promise<void> {
    console.log('🏗️ Строительство (заглушка)');
    // Заглушка для будущей реализации
  }

  private async executeDestroy(): Promise<void> {
    if (!this.mission) {
      console.log('💥 Разрушение (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    
    // Ищем разрушаемый объект рядом
    const targetIndex = this.mission.objects.findIndex(obj =>
      obj.properties?.destructible &&
      Math.abs(obj.position[0] - x) <= 1 &&
      Math.abs(obj.position[1] - y) <= 1
    );

    if (targetIndex !== -1) {
      const targetObject = this.mission.objects[targetIndex];
      this.mission.objects.splice(targetIndex, 1);
      
      console.log(`💥 Разрушен объект: ${targetObject.type} на позиции [${targetObject.position}]`);
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log('⚠️ Нет разрушаемых объектов рядом');
    }
  }

  private async executeOpen(): Promise<void> {
    if (!this.mission) {
      console.log('🚪 Открытие (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    const direction = this.robotState.direction;
    
    // Вычисляем позицию впереди
    let nextX = x;
    let nextY = y;
    
    switch (direction) {
      case 'north': nextY -= 1; break;
      case 'south': nextY += 1; break;
      case 'east': nextX += 1; break;
      case 'west': nextX -= 1; break;
    }
    
    // Ищем дверь впереди
    const door = this.mission.objects.find(obj =>
      obj.properties?.isDoor === true &&
      obj.position[0] === nextX &&
      obj.position[1] === nextY
    );

    if (door) {
      if (!door.properties) {
        door.properties = {};
      }
      door.properties.isOpen = true;
      
      console.log(`🚪 Дверь открыта на позиции [${door.position}]`);
      
      // ВАЖНО: Эмитим событие для обновления UI
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log('⚠️ Нет двери впереди');
    }
  }

  private async executeClose(): Promise<void> {
    if (!this.mission) {
      console.log('🔒 Закрытие (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    
    // Ищем открытую дверь рядом
    const door = this.mission.objects.find(obj =>
      obj.type === 'door' &&
      obj.properties?.open &&
      Math.abs(obj.position[0] - x) <= 1 &&
      Math.abs(obj.position[1] - y) <= 1
    );

    if (door && door.properties) {
      door.properties.open = false;
      
      console.log(`🔒 Дверь закрыта на позиции [${door.position}]`);
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log('⚠️ Нет открытых дверей рядом');
    }
  }

  private async executeUse(): Promise<void> {
    if (!this.mission) {
      console.log('🎯 Использование (нет миссии)');
      return;
    }

    const [x, y] = this.robotState.position;
    
    // Ищем интерактивный объект рядом
    const targetObject = this.mission.objects.find(obj =>
      (obj.type === 'terminal' || obj.type === 'lever' || obj.type === 'button') &&
      Math.abs(obj.position[0] - x) <= 1 &&
      Math.abs(obj.position[1] - y) <= 1
    );

    if (targetObject) {
      if (!targetObject.properties) {
        targetObject.properties = {};
      }
      targetObject.properties.used = true;
      
      console.log(`🎯 Использован объект: ${targetObject.type} на позиции [${targetObject.position}]`);
      
      this.emit({
        type: 'stateChange',
        newState: this.robotState,
      });
    } else {
      console.log('⚠️ Нет интерактивных объектов рядом');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
