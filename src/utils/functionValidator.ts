import { UserFunction, ProgramNodeInstance } from '../types/nodes';

// Максимальные ограничения
const MAX_FUNCTION_SIZE = 20; // Максимум блоков в функции
const MAX_FUNCTION_DEPTH = 3; // Максимум уровней вложенности

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Валидация функции перед сохранением
 */
export function validateFunction(
  func: UserFunction,
  allFunctions: UserFunction[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Проверка размера
  if (func.body.length === 0) {
    warnings.push('Функция пустая. Добавьте хотя бы один блок.');
  }

  if (func.body.length > MAX_FUNCTION_SIZE) {
    errors.push(`Функция слишком большая (${func.body.length} блоков). Максимум: ${MAX_FUNCTION_SIZE}.`);
  }

  // 2. Проверка рекурсии
  const recursionCheck = checkRecursion(func, allFunctions);
  if (!recursionCheck.valid) {
    errors.push(recursionCheck.error!);
  }

  // 3. Проверка глубины вложенности
  const depthCheck = checkDepth(func, allFunctions);
  if (!depthCheck.valid) {
    errors.push(depthCheck.error!);
  }

  // 4. Проверка на циклические зависимости
  const cycleCheck = checkCyclicDependencies(func, allFunctions);
  if (!cycleCheck.valid) {
    errors.push(cycleCheck.error!);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Проверка на прямую рекурсию (функция вызывает саму себя)
 */
function checkRecursion(
  func: UserFunction,
  allFunctions: UserFunction[]
): { valid: boolean; error?: string } {
  // Проверяем, вызывает ли функция саму себя
  const callsSelf = func.body.some(node => node.functionId === func.id);

  if (callsSelf) {
    return {
      valid: false,
      error: `Функция "${func.name}" вызывает саму себя (прямая рекурсия запрещена).`,
    };
  }

  return { valid: true };
}

/**
 * Проверка глубины вложенности функций
 */
function checkDepth(
  func: UserFunction,
  allFunctions: UserFunction[],
  currentDepth: number = 0
): { valid: boolean; error?: string } {
  if (currentDepth > MAX_FUNCTION_DEPTH) {
    return {
      valid: false,
      error: `Слишком глубокая вложенность функций (>${MAX_FUNCTION_DEPTH} уровней).`,
    };
  }

  // Проверяем все вызовы функций в теле
  for (const node of func.body) {
    if (node.functionId) {
      const calledFunc = allFunctions.find(f => f.id === node.functionId);
      if (calledFunc) {
        const result = checkDepth(calledFunc, allFunctions, currentDepth + 1);
        if (!result.valid) {
          return result;
        }
      }
    }
  }

  return { valid: true };
}

/**
 * Проверка на циклические зависимости (A → B → C → A)
 */
function checkCyclicDependencies(
  func: UserFunction,
  allFunctions: UserFunction[]
): { valid: boolean; error?: string } {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(currentFunc: UserFunction): boolean {
    if (recursionStack.has(currentFunc.id)) {
      return true; // Цикл обнаружен!
    }

    if (visited.has(currentFunc.id)) {
      return false; // Уже проверяли эту функцию
    }

    visited.add(currentFunc.id);
    recursionStack.add(currentFunc.id);

    // Проверяем все вызовы функций
    for (const node of currentFunc.body) {
      if (node.functionId) {
        const calledFunc = allFunctions.find(f => f.id === node.functionId);
        if (calledFunc && hasCycle(calledFunc)) {
          return true;
        }
      }
    }

    recursionStack.delete(currentFunc.id);
    return false;
  }

  if (hasCycle(func)) {
    return {
      valid: false,
      error: `Обнаружена циклическая зависимость функций. Функция "${func.name}" косвенно вызывает саму себя.`,
    };
  }

  return { valid: true };
}

/**
 * Получить список функций, которые использует данная функция
 */
export function getFunctionDependencies(
  func: UserFunction,
  allFunctions: UserFunction[]
): UserFunction[] {
  const dependencies: UserFunction[] = [];
  const visited = new Set<string>();

  function collectDependencies(currentFunc: UserFunction) {
    if (visited.has(currentFunc.id)) return;
    visited.add(currentFunc.id);

    for (const node of currentFunc.body) {
      if (node.functionId) {
        const calledFunc = allFunctions.find(f => f.id === node.functionId);
        if (calledFunc) {
          dependencies.push(calledFunc);
          collectDependencies(calledFunc);
        }
      }
    }
  }

  collectDependencies(func);
  return dependencies;
}

/**
 * Проверка, можно ли удалить функцию (не используется ли она другими функциями)
 */
export function canDeleteFunction(
  functionId: string,
  allFunctions: UserFunction[]
): { canDelete: boolean; usedBy: string[] } {
  const usedBy: string[] = [];

  for (const func of allFunctions) {
    if (func.id === functionId) continue;

    const usesFunctionId = func.body.some(node => node.functionId === functionId);
    if (usesFunctionId) {
      usedBy.push(func.name);
    }
  }

  return {
    canDelete: usedBy.length === 0,
    usedBy,
  };
}

/**
 * Подсчет общего количества блоков (включая вложенные функции)
 */
export function calculateTotalBlocks(
  func: UserFunction,
  allFunctions: UserFunction[]
): number {
  const visited = new Set<string>();

  function countBlocks(currentFunc: UserFunction): number {
    if (visited.has(currentFunc.id)) return 0;
    visited.add(currentFunc.id);

    let total = currentFunc.body.length;

    for (const node of currentFunc.body) {
      if (node.functionId) {
        const calledFunc = allFunctions.find(f => f.id === node.functionId);
        if (calledFunc) {
          total += countBlocks(calledFunc);
        }
      }
    }

    return total;
  }

  return countBlocks(func);
}
