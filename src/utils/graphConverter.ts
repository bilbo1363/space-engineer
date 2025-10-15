import { ProgramGraph } from '../types/flowGraph';
import { ProgramNodeInstance } from '../types/nodes';

/**
 * Конвертер графа в линейную программу
 * Обходит граф начиная от Start ноды и строит последовательность команд
 */
export class GraphConverter {
  private graph: ProgramGraph;
  private visited: Set<string>;

  constructor(graph: ProgramGraph) {
    this.graph = graph;
    this.visited = new Set();
  }

  /**
   * Конвертирует граф в линейную программу
   */
  convert(): ProgramNodeInstance[] {
    const program: ProgramNodeInstance[] = [];
    
    // Находим стартовую ноду
    const startNode = this.graph.nodes.find(n => n.type === 'start');
    if (!startNode) {
      console.error('❌ Нет стартовой ноды!');
      return [];
    }

    // Начинаем обход с стартовой ноды
    this.traverseFrom(startNode.id, program);

    console.log('✅ Граф конвертирован в программу:', program);
    return program;
  }

  /**
   * Рекурсивный обход графа от заданной ноды
   */
  private traverseFrom(nodeId: string, program: ProgramNodeInstance[]): void {
    // Защита от циклов
    if (this.visited.has(nodeId)) {
      return;
    }
    this.visited.add(nodeId);

    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Пропускаем start и end ноды
    if (node.type === 'start' || node.type === 'end') {
      // Переходим к следующей ноде
      const nextEdge = this.graph.edges.find(e => e.source === nodeId);
      if (nextEdge) {
        this.traverseFrom(nextEdge.target, program);
      }
      return;
    }

    // Обрабатываем action ноду
    if (node.type === 'action') {
      const actionData = node.data as any;
      program.push({
        id: `node_${Date.now()}_${Math.random()}`,
        nodeType: actionData.nodeType,
        parameters: actionData.parameters || {},
      });

      // Переходим к следующей ноде
      const nextEdge = this.graph.edges.find(e => e.source === nodeId);
      if (nextEdge) {
        this.traverseFrom(nextEdge.target, program);
      }
    }

    // Обрабатываем customAction ноду
    if (node.type === 'customAction') {
      const actionData = node.data as any;
      program.push({
        id: `node_${Date.now()}_${Math.random()}`,
        nodeType: actionData.actionType || 'activate',
        parameters: actionData.parameters || {},
      });

      // Переходим к следующей ноде
      const nextEdge = this.graph.edges.find(e => e.source === nodeId);
      if (nextEdge) {
        this.traverseFrom(nextEdge.target, program);
      }
    }

    // Обрабатываем condition ноду
    if (node.type === 'condition') {
      const conditionData = node.data as any;
      
      // Создаём IF блок
      const ifNode: ProgramNodeInstance = {
        id: `node_${Date.now()}_${Math.random()}`,
        nodeType: 'if',
        parameters: { condition: conditionData.condition },
        children: [],
        elseBranch: [],
      };

      // Находим ветки true и false
      const trueEdge = this.graph.edges.find(e => e.source === nodeId && e.sourceHandle === 'true');
      const falseEdge = this.graph.edges.find(e => e.source === nodeId && e.sourceHandle === 'false');

      console.log('❓ Обработка condition ноды:', {
        nodeId,
        condition: conditionData.condition,
        hasTrueEdge: !!trueEdge,
        hasFalseEdge: !!falseEdge,
      });

      // Обрабатываем true ветку
      if (trueEdge) {
        const trueBranch: ProgramNodeInstance[] = [];
        this.traverseFrom(trueEdge.target, trueBranch);
        ifNode.children = trueBranch;
        console.log('✅ TRUE ветка обработана:', trueBranch.length, 'нод');
      }

      // Обрабатываем false ветку (else)
      if (falseEdge) {
        const falseBranch: ProgramNodeInstance[] = [];
        this.traverseFrom(falseEdge.target, falseBranch);
        ifNode.elseBranch = falseBranch;
        console.log('✅ FALSE ветка обработана:', falseBranch.length, 'нод');
      }
      
      program.push(ifNode);
      return; // ВАЖНО: Не продолжаем обход после condition ноды
    }

    // Обрабатываем loop ноду
    if (node.type === 'loop') {
      const loopData = node.data as any;
      
      console.log('🔁 Обработка loop ноды:', {
        nodeId: node.id,
        loopType: loopData.loopType,
        count: loopData.count,
        condition: loopData.condition,
        label: loopData.label,
        fullData: JSON.stringify(loopData, null, 2),
      });
      
      // Создаём LOOP блок
      const loopNode: ProgramNodeInstance = {
        id: `node_${Date.now()}_${Math.random()}`,
        nodeType: loopData.loopType === 'repeat' ? 'repeat' : 'repeatWhile',
        parameters: loopData.loopType === 'repeat' 
          ? { count: loopData.count || 5 }
          : { condition: loopData.condition || 'true' },
        children: [],
      };
      
      console.log('✅ Создан loop блок:', JSON.stringify(loopNode, null, 2));

      // Находим тело цикла
      const bodyEdge = this.graph.edges.find(e => e.source === nodeId && e.sourceHandle === 'body');
      if (bodyEdge) {
        const loopBody: ProgramNodeInstance[] = [];
        this.traverseFrom(bodyEdge.target, loopBody);
        loopNode.children = loopBody;
      }

      program.push(loopNode);

      // Переходим к следующей ноде после цикла
      const nextEdge = this.graph.edges.find(e => e.source === nodeId && e.sourceHandle === 'next');
      if (nextEdge) {
        this.traverseFrom(nextEdge.target, program);
      }
    }
  }

  /**
   * Валидация графа перед конвертацией
   */
  static validate(graph: ProgramGraph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Проверка наличия стартовой ноды
    const startNodes = graph.nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Отсутствует стартовая нода');
    }
    if (startNodes.length > 1) {
      errors.push('Слишком много стартовых нод');
    }

    // Проверка наличия конечной ноды
    const endNodes = graph.nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Отсутствует конечная нода');
    }

    // Проверка что все ноды соединены
    const connectedNodes = new Set<string>();
    graph.edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const disconnectedNodes = graph.nodes.filter(n => 
      n.type !== 'start' && n.type !== 'end' && !connectedNodes.has(n.id)
    );

    if (disconnectedNodes.length > 0) {
      errors.push(`Несоединённые ноды: ${disconnectedNodes.length}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
