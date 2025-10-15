import { Mission, MissionObjective } from '../types/missions';
import { RobotState } from '../types/robots';
import { ProgramNodeInstance } from '../types/nodes';

export interface MissionProgress {
  completed: boolean;
  objectives: {
    [key: string]: boolean;
  };
}

export class MissionChecker {
  private mission: Mission;
  private robotState: RobotState;
  private program: ProgramNodeInstance[];
  private startPosition: [number, number];

  constructor(mission: Mission, robotState: RobotState, program: ProgramNodeInstance[]) {
    this.mission = mission;
    this.robotState = robotState;
    this.program = program;
    this.startPosition = [mission.startPosition.x, mission.startPosition.y];
  }

  checkObjectives(): MissionProgress {
    const objectives: { [key: string]: boolean } = {};
    let allCompleted = true;

    for (const objective of this.mission.objectives) {
      const isCompleted = this.checkObjective(objective);
      objectives[objective.id] = isCompleted;

      if (objective.required && !isCompleted) {
        allCompleted = false;
      }
    }

    return {
      completed: allCompleted,
      objectives,
    };
  }

  private checkObjective(objective: MissionObjective): boolean {
    switch (objective.type) {
      case 'reach':
      case 'move':
        return this.checkReachObjective(objective);
      
      case 'pickup':
        return this.checkPickupObjective(objective);
      
      case 'deliver':
        return this.checkDeliverObjective(objective);
      
      case 'collect':
        return this.checkCollectObjective(objective);
      
      case 'log_at':
        return this.checkLogAtObjective(objective);
      
      case 'custom':
        return this.checkCustomObjective(objective);
      
      default:
        console.warn(`Unknown objective type: ${objective.type}`);
        return false;
    }
  }

  private checkReachObjective(objective: MissionObjective): boolean {
    if (!objective.target) return false;

    const [targetX, targetY] = objective.target;
    const [robotX, robotY] = this.robotState.position;

    return robotX === targetX && robotY === targetY;
  }

  private checkPickupObjective(objective: MissionObjective): boolean {
    // Проверяем что нужный предмет был взят
    const targetId = objective.target as string;
    const pickedUpItems = this.robotState.pickedUpItems || [];
    
    // Проверяем либо что предмет сейчас в инвентаре, либо был взят ранее
    const hasItemNow = this.robotState.inventory.includes(targetId);
    const hasPickedUpBefore = pickedUpItems.includes(targetId);
    
    console.log('🎯 Проверка взятия предмета:', {
      targetId,
      hasItemNow,
      hasPickedUpBefore,
      inventory: this.robotState.inventory,
      pickedUpItems
    });
    
    return hasItemNow || hasPickedUpBefore;
  }

  private checkDeliverObjective(objective: MissionObjective): boolean {
    // Проверяем что предмет был доставлен на базу
    const targetBaseId = objective.target as string;
    const baseObject = this.mission.objects.find(obj => 
      obj.type === 'base' && (obj.id === targetBaseId || !targetBaseId)
    );
    
    if (!baseObject) {
      console.log('❌ База не найдена');
      return false;
    }

    const [baseX, baseY] = baseObject.position;
    const [robotX, robotY] = this.robotState.position;
    
    const onBase = robotX === baseX && robotY === baseY;
    const inventoryEmpty = this.robotState.inventory.length === 0;
    const delivered = baseObject.properties?.delivered === true;
    const pickedUpItems = this.robotState.pickedUpItems || [];
    const hasPickedUpSomething = pickedUpItems.length > 0;
    
    console.log('🎯 Проверка доставки:', {
      onBase,
      inventoryEmpty,
      delivered,
      hasPickedUpSomething,
      robotPos: [robotX, robotY],
      basePos: [baseX, baseY],
      pickedUpItems
    });
    
    // Проверяем что предмет был взят И доставлен на базу
    return hasPickedUpSomething && ((onBase && inventoryEmpty) || delivered);
  }

  private checkLogAtObjective(objective: MissionObjective): boolean {
    // Проверяем что на всех указанных позициях были активированы станции
    const target = objective.target as { positions: [number, number][]; requiredMessage?: string };
    
    if (!target.positions) {
      console.log('❌ Нет позиций для проверки');
      return false;
    }

    // Проверяем каждую позицию
    const allActivated = target.positions.every(([x, y]) => {
      const station = this.mission.objects.find(obj =>
        obj.type === 'station' &&
        obj.position[0] === x &&
        obj.position[1] === y
      );

      if (!station) {
        console.log(`❌ Станция не найдена на позиции [${x}, ${y}]`);
        return false;
      }

      const isActivated = station.properties?.activated === true;
      console.log(`🎯 Станция на [${x}, ${y}]: ${isActivated ? 'активирована ✅' : 'не активирована ❌'}`);
      
      return isActivated;
    });

    console.log('🎯 Проверка log_at:', {
      allActivated,
      positions: target.positions,
      requiredMessage: target.requiredMessage
    });

    return allActivated;
  }

  private checkCollectObjective(objective: MissionObjective): boolean {
    // Пока не используется в текущих миссиях
    // TODO: Добавить когда будут миссии на сбор ресурсов
    return false;
  }

  private checkCustomObjective(objective: MissionObjective): boolean {
    // Специальные проверки для кастомных целей
    const description = objective.description.toLowerCase();

    // Проверка использования цикла
    if (description.includes('используй цикл') || description.includes('повторить')) {
      return this.hasLoopInProgram();
    }

    // Проверка использования условия
    if (description.includes('если') || description.includes('условие')) {
      return this.hasConditionalInProgram();
    }

    // Проверка активации маяка
    if (description.includes('активируй маяк') || description.includes('активация')) {
      return this.checkBeaconActivation();
    }

    // Проверка посещения всех углов (для миссии 2.2)
    if (description.includes('посети все углы')) {
      return this.checkAllCornersVisited();
    }

    // Проверка движения пока энергия > 20%
    if (description.includes('пока') && description.includes('энергии')) {
      // Проверяем что:
      // 1. Есть цикл repeatWhile в программе
      // 2. Энергия робота <= 20% (строго, как в условии задачи)
      const hasWhileLoop = this.hasWhileLoopInProgram();
      const energyDepleted = this.robotState.energy <= 20;
      
      console.log('🔋 Проверка энергии:', {
        hasWhileLoop,
        currentEnergy: this.robotState.energy,
        energyDepleted,
        result: hasWhileLoop && energyDepleted
      });
      
      return hasWhileLoop && energyDepleted;
    }

    // Проверка пройденной дистанции
    if (description.includes('проедь') && description.includes('клеток')) {
      const distance = this.calculateDistance();
      const minDistance = 15; // Минимальная дистанция для миссии 2.4
      
      console.log('📏 Проверка дистанции:', {
        distance,
        minDistance,
        result: distance >= minDistance
      });
      
      return distance >= minDistance;
    }

    // По умолчанию считаем выполненным
    return true;
  }

  private hasLoopInProgram(): boolean {
    return this.searchInProgram(this.program, node => 
      node.nodeType === 'repeat' || node.nodeType === 'repeatWhile'
    );
  }

  private hasConditionalInProgram(): boolean {
    return this.searchInProgram(this.program, node => 
      node.nodeType === 'if'
    );
  }

  private hasWhileLoopInProgram(): boolean {
    return this.searchInProgram(this.program, node => 
      node.nodeType === 'repeatWhile'
    );
  }

  private searchInProgram(
    nodes: ProgramNodeInstance[],
    predicate: (node: ProgramNodeInstance) => boolean
  ): boolean {
    for (const node of nodes) {
      if (predicate(node)) {
        return true;
      }

      // Рекурсивно проверяем вложенные блоки
      if (node.children && node.children.length > 0) {
        if (this.searchInProgram(node.children, predicate)) {
          return true;
        }
      }
    }

    return false;
  }

  private checkBeaconActivation(): boolean {
    // Проверяем активирован ли маяк в объектах миссии
    const beacon = this.mission.objects.find(obj => obj.type === 'station');
    return beacon?.properties?.activated === true;
  }

  private checkAllCornersVisited(): boolean {
    // Для миссии 2.2 - проверяем что робот вернулся на старт
    // Это упрощенная проверка, можно расширить
    const [startX, startY] = [
      this.mission.startPosition.x,
      this.mission.startPosition.y
    ];
    const [robotX, robotY] = this.robotState.position;

    return robotX === startX && robotY === startY;
  }

  private calculateDistance(): number {
    // Манхэттенское расстояние от старта до текущей позиции
    const [startX, startY] = this.startPosition;
    const [currentX, currentY] = this.robotState.position;
    
    const distance = Math.abs(currentX - startX) + Math.abs(currentY - startY);
    return distance;
  }
}
