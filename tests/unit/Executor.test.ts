import { describe, it, expect, beforeEach } from 'vitest';
import { Executor } from '../../src/core/interpreter/Executor';
import { RobotState } from '../../src/types/robots';

describe('Executor', () => {
  let executor: Executor;
  let initialState: RobotState;

  beforeEach(() => {
    initialState = {
      position: [0, 0],
      direction: 'east',
      energy: 100,
      inventory: [],
      isMoving: false,
    };
    executor = new Executor(initialState);
  });

  it('should initialize with correct state', () => {
    const state = executor.getRobotState();
    expect(state.position).toEqual([0, 0]);
    expect(state.direction).toBe('east');
    expect(state.energy).toBe(100);
  });

  it('should load program', () => {
    const program = [
      { id: '1', nodeType: 'moveForward', parameters: {} },
      { id: '2', nodeType: 'turnRight', parameters: {} },
    ];
    
    executor.loadProgram(program);
    // Program loaded successfully if no error thrown
    expect(true).toBe(true);
  });

  it('should reset to initial state', () => {
    executor.reset();
    const state = executor.getRobotState();
    expect(state).toEqual(initialState);
  });

  it('should handle turn right correctly', async () => {
    const program = [{ id: '1', nodeType: 'turnRight', parameters: {} }];
    
    let finalDirection: string | undefined;
    executor.subscribe(event => {
      if (event.type === 'stateChange' && event.newState?.direction) {
        finalDirection = event.newState.direction;
      }
    });

    executor.loadProgram(program);
    await executor.run();

    expect(finalDirection).toBe('south');
  });
});
