import { Mission, MissionObjective } from '../types/missions';
import { RobotState } from '../types/robots';

export interface MissionResult {
  success: boolean;
  completedObjectives: string[];
  stars: number;
}

export class MissionValidator {
  private mission: Mission;
  private robotState: RobotState;
  private completedObjectives: Set<string> = new Set();

  constructor(mission: Mission, robotState: RobotState) {
    this.mission = mission;
    this.robotState = robotState;
  }

  checkObjectives(): void {
    this.mission.objectives.forEach(objective => {
      if (this.checkObjective(objective)) {
        this.completedObjectives.add(objective.id);
      }
    });
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
      
      case 'log_at':
        return this.checkLogAtObjective(objective);
      
      default:
        console.log('⚠️ Неизвестный тип цели:', objective.type);
        return false;
    }
  }

  private checkReachObjective(objective: MissionObjective): boolean {
    const [targetX, targetY] = objective.target as [number, number];
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

  getResult(): MissionResult {
    const requiredObjectives = this.mission.objectives.filter(obj => obj.required);
    const completedRequired = requiredObjectives.filter(obj => 
      this.completedObjectives.has(obj.id)
    );

    const success = completedRequired.length === requiredObjectives.length;
    const stars = this.calculateStars(success);

    return {
      success,
      completedObjectives: Array.from(this.completedObjectives),
      stars,
    };
  }

  private calculateStars(success: boolean): number {
    if (!success) return 0;

    let stars = 1; // Базовая звезда за выполнение

    // Вторая звезда за оптимизацию (упрощенная логика)
    // TODO: добавить проверку количества использованных блоков
    
    // Третья звезда за скорость (упрощенная логика)
    // TODO: добавить проверку времени выполнения

    return stars;
  }
}
