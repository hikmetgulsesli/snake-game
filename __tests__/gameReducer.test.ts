import {
  gameReducer,
  createInitialState,
  generateFood,
} from '../hooks/useGameReducer';
import { GameState, Direction, Difficulty } from '../types/game';
import { DIFFICULTY_SETTINGS } from '../constants/game';

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Creates a test game state with custom properties
 */
function createTestState(overrides: Partial<GameState> = {}): GameState {
  const baseState = createInitialState('NORMAL');
  return { ...baseState, ...overrides };
}

// Test helper - kept for future use
// function createSnakeBody(positions: Position[]): Position[] {
//   return positions;
// }

// ============================================================================
// INITIAL STATE TESTS
// ============================================================================

describe('createInitialState', () => {
  it('should create initial state for EASY difficulty', () => {
    const state = createInitialState('EASY');
    
    expect(state.status).toBe('MENU');
    expect(state.difficulty).toBe('EASY');
    expect(state.config).toEqual(DIFFICULTY_SETTINGS.EASY);
    expect(state.score).toBe(0);
    expect(state.speed).toBe(DIFFICULTY_SETTINGS.EASY.initialSpeed);
    expect(state.snake.body).toHaveLength(3);
    expect(state.snake.direction).toBe('RIGHT');
    expect(state.snake.directionQueue).toEqual([]);
  });

  it('should create initial state for NORMAL difficulty', () => {
    const state = createInitialState('NORMAL');
    
    expect(state.status).toBe('MENU');
    expect(state.difficulty).toBe('NORMAL');
    expect(state.config).toEqual(DIFFICULTY_SETTINGS.NORMAL);
    expect(state.score).toBe(0);
    expect(state.speed).toBe(DIFFICULTY_SETTINGS.NORMAL.initialSpeed);
  });

  it('should create initial state for HARD difficulty', () => {
    const state = createInitialState('HARD');
    
    expect(state.status).toBe('MENU');
    expect(state.difficulty).toBe('HARD');
    expect(state.config).toEqual(DIFFICULTY_SETTINGS.HARD);
    expect(state.score).toBe(0);
    expect(state.speed).toBe(DIFFICULTY_SETTINGS.HARD.initialSpeed);
  });

  it('should default to NORMAL difficulty', () => {
    const state = createInitialState();
    expect(state.difficulty).toBe('NORMAL');
  });

  it('should place snake in the center of the grid', () => {
    const state = createInitialState('NORMAL');
    const gridSize = state.config.gridSize;
    const centerX = Math.floor(gridSize / 2);
    const centerY = Math.floor(gridSize / 2);

    expect(state.snake.body[0]).toEqual({ x: centerX, y: centerY });
    expect(state.snake.body[1]).toEqual({ x: centerX - 1, y: centerY });
    expect(state.snake.body[2]).toEqual({ x: centerX - 2, y: centerY });
  });

  it('should generate food that does not overlap with snake', () => {
    const state = createInitialState('NORMAL');
    
    const foodOnSnake = state.snake.body.some(
      segment => segment.x === state.food.x && segment.y === state.food.y
    );
    expect(foodOnSnake).toBe(false);
  });
});

// ============================================================================
// INIT_GAME ACTION TESTS
// ============================================================================

describe('INIT_GAME action', () => {
  it('should initialize game with EASY difficulty', () => {
    const initialState = createInitialState('NORMAL');
    const newState = gameReducer(initialState, {
      type: 'INIT_GAME',
      payload: { difficulty: 'EASY' },
    });

    expect(newState.status).toBe('PLAYING');
    expect(newState.difficulty).toBe('EASY');
    expect(newState.score).toBe(0);
    expect(newState.snake.direction).toBe('RIGHT');
    expect(newState.snake.directionQueue).toEqual([]);
  });

  it('should initialize game with NORMAL difficulty', () => {
    const initialState = createInitialState('EASY');
    const newState = gameReducer(initialState, {
      type: 'INIT_GAME',
      payload: { difficulty: 'NORMAL' },
    });

    expect(newState.status).toBe('PLAYING');
    expect(newState.difficulty).toBe('NORMAL');
  });

  it('should initialize game with HARD difficulty', () => {
    const initialState = createInitialState('EASY');
    const newState = gameReducer(initialState, {
      type: 'INIT_GAME',
      payload: { difficulty: 'HARD' },
    });

    expect(newState.status).toBe('PLAYING');
    expect(newState.difficulty).toBe('HARD');
  });

  it('should reset score when initializing game', () => {
    const initialState = createTestState({ score: 100 });
    const newState = gameReducer(initialState, {
      type: 'INIT_GAME',
      payload: { difficulty: 'NORMAL' },
    });

    expect(newState.score).toBe(0);
  });

  it('should reset speed to initial speed for difficulty', () => {
    const initialState = createTestState({ speed: 50 });
    const newState = gameReducer(initialState, {
      type: 'INIT_GAME',
      payload: { difficulty: 'NORMAL' },
    });

    expect(newState.speed).toBe(DIFFICULTY_SETTINGS.NORMAL.initialSpeed);
  });
});

// ============================================================================
// MOVE_SNAKE ACTION TESTS
// ============================================================================

describe('MOVE_SNAKE action', () => {
  it('should not move snake when status is MENU', () => {
    const initialState = createTestState({ status: 'MENU' });
    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState).toEqual(initialState);
  });

  it('should not move snake when status is PAUSED', () => {
    const initialState = createTestState({ status: 'PAUSED' });
    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState).toEqual(initialState);
  });

  it('should not move snake when status is GAME_OVER', () => {
    const initialState = createTestState({ status: 'GAME_OVER' });
    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState).toEqual(initialState);
  });

  it('should move snake in current direction when status is PLAYING', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.snake.body).toEqual([
      { x: 11, y: 10 },
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ]);
  });

  it('should process queued direction when moving', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: ['UP'],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.snake.direction).toBe('UP');
    expect(newState.snake.body[0]).toEqual({ x: 10, y: 9 });
    expect(newState.snake.directionQueue).toEqual([]);
  });

  it('should grow snake when food is eaten', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      score: 0,
      speed: 150,
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
          { x: 8, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: [],
      },
      food: { x: 11, y: 10 },
      config: DIFFICULTY_SETTINGS.NORMAL,
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.snake.body).toHaveLength(4);
    expect(newState.score).toBe(10);
    expect(newState.speed).toBeLessThan(150);
  });

  it('should trigger GAME_OVER on wall collision (top)', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      snake: {
        body: [
          { x: 10, y: 0 },
          { x: 10, y: 1 },
          { x: 10, y: 2 },
        ],
        direction: 'UP',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.status).toBe('GAME_OVER');
  });

  it('should trigger GAME_OVER on wall collision (bottom)', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      config: { ...DIFFICULTY_SETTINGS.NORMAL, gridSize: 20 },
      snake: {
        body: [
          { x: 10, y: 19 },
          { x: 10, y: 18 },
          { x: 10, y: 17 },
        ],
        direction: 'DOWN',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.status).toBe('GAME_OVER');
  });

  it('should trigger GAME_OVER on wall collision (left)', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      snake: {
        body: [
          { x: 0, y: 10 },
          { x: 1, y: 10 },
          { x: 2, y: 10 },
        ],
        direction: 'LEFT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.status).toBe('GAME_OVER');
  });

  it('should trigger GAME_OVER on wall collision (right)', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      config: { ...DIFFICULTY_SETTINGS.NORMAL, gridSize: 20 },
      snake: {
        body: [
          { x: 19, y: 10 },
          { x: 18, y: 10 },
          { x: 17, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.status).toBe('GAME_OVER');
  });

  it('should trigger GAME_OVER on self collision', () => {
    const initialState = createTestState({
      status: 'PLAYING',
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
          { x: 9, y: 11 },
          { x: 9, y: 10 },
        ],
        direction: 'LEFT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, { type: 'MOVE_SNAKE' });

    expect(newState.status).toBe('GAME_OVER');
  });
});

// ============================================================================
// CHANGE_DIRECTION ACTION TESTS
// ============================================================================

describe('CHANGE_DIRECTION action', () => {
  it('should change direction to UP from RIGHT', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'UP' },
    });

    expect(newState.snake.directionQueue).toEqual(['UP']);
  });

  it('should prevent 180° turn (RIGHT to LEFT)', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'LEFT' },
    });

    expect(newState).toEqual(initialState);
  });

  it('should prevent 180° turn (UP to DOWN)', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 10, y: 11 },
        ],
        direction: 'UP',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'DOWN' },
    });

    expect(newState).toEqual(initialState);
  });

  it('should queue multiple valid directions', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: ['UP'],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'LEFT' },
    });

    expect(newState.snake.directionQueue).toEqual(['UP', 'LEFT']);
  });

  it('should not queue more than 2 directions', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: ['UP', 'LEFT'],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'DOWN' },
    });

    expect(newState.snake.directionQueue).toEqual(['UP', 'LEFT']);
  });

  it('should not queue same direction as current', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: [],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'RIGHT' },
    });

    expect(newState.snake.directionQueue).toEqual([]);
  });

  it('should not queue duplicate directions', () => {
    const initialState = createTestState({
      snake: {
        body: [
          { x: 10, y: 10 },
          { x: 9, y: 10 },
        ],
        direction: 'RIGHT',
        directionQueue: ['UP'],
      },
    });

    const newState = gameReducer(initialState, {
      type: 'CHANGE_DIRECTION',
      payload: { direction: 'UP' },
    });

    expect(newState.snake.directionQueue).toEqual(['UP']);
  });
});

// ============================================================================
// PAUSE_GAME ACTION TESTS
// ============================================================================

describe('PAUSE_GAME action', () => {
  it('should pause game when playing', () => {
    const initialState = createTestState({ status: 'PLAYING' });
    const newState = gameReducer(initialState, { type: 'PAUSE_GAME' });

    expect(newState.status).toBe('PAUSED');
  });

  it('should not pause game when in MENU', () => {
    const initialState = createTestState({ status: 'MENU' });
    const newState = gameReducer(initialState, { type: 'PAUSE_GAME' });

    expect(newState).toEqual(initialState);
  });

  it('should not pause game when already PAUSED', () => {
    const initialState = createTestState({ status: 'PAUSED' });
    const newState = gameReducer(initialState, { type: 'PAUSE_GAME' });

    expect(newState).toEqual(initialState);
  });

  it('should not pause game when GAME_OVER', () => {
    const initialState = createTestState({ status: 'GAME_OVER' });
    const newState = gameReducer(initialState, { type: 'PAUSE_GAME' });

    expect(newState).toEqual(initialState);
  });
});

// ============================================================================
// RESUME_GAME ACTION TESTS
// ============================================================================

describe('RESUME_GAME action', () => {
  it('should resume game when paused', () => {
    const initialState = createTestState({ status: 'PAUSED' });
    const newState = gameReducer(initialState, { type: 'RESUME_GAME' });

    expect(newState.status).toBe('PLAYING');
  });

  it('should not resume game when in MENU', () => {
    const initialState = createTestState({ status: 'MENU' });
    const newState = gameReducer(initialState, { type: 'RESUME_GAME' });

    expect(newState).toEqual(initialState);
  });

  it('should not resume game when already PLAYING', () => {
    const initialState = createTestState({ status: 'PLAYING' });
    const newState = gameReducer(initialState, { type: 'RESUME_GAME' });

    expect(newState).toEqual(initialState);
  });

  it('should not resume game when GAME_OVER', () => {
    const initialState = createTestState({ status: 'GAME_OVER' });
    const newState = gameReducer(initialState, { type: 'RESUME_GAME' });

    expect(newState).toEqual(initialState);
  });
});

// ============================================================================
// GAME_OVER ACTION TESTS
// ============================================================================

describe('GAME_OVER action', () => {
  it('should set status to GAME_OVER', () => {
    const initialState = createTestState({ status: 'PLAYING' });
    const newState = gameReducer(initialState, { type: 'GAME_OVER' });

    expect(newState.status).toBe('GAME_OVER');
  });

  it('should work from any status', () => {
    const statuses: Array<'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'> = [
      'MENU',
      'PLAYING',
      'PAUSED',
    ];

    statuses.forEach((status) => {
      const initialState = createTestState({ status });
      const newState = gameReducer(initialState, { type: 'GAME_OVER' });
      expect(newState.status).toBe('GAME_OVER');
    });
  });
});

// ============================================================================
// RESET_GAME ACTION TESTS
// ============================================================================

describe('RESET_GAME action', () => {
  it('should reset game to initial state', () => {
    const initialState = createTestState({
      status: 'GAME_OVER',
      score: 100,
      speed: 80,
      snake: {
        body: [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
          { x: 2, y: 5 },
        ],
        direction: 'UP',
        directionQueue: ['LEFT', 'DOWN'],
      },
    });

    const newState = gameReducer(initialState, { type: 'RESET_GAME' });

    expect(newState.status).toBe('MENU');
    expect(newState.score).toBe(0);
    expect(newState.speed).toBe(DIFFICULTY_SETTINGS.NORMAL.initialSpeed);
    expect(newState.snake.directionQueue).toEqual([]);
    expect(newState.snake.direction).toBe('RIGHT');
  });

  it('should preserve difficulty when resetting', () => {
    const initialState = createTestState({
      difficulty: 'HARD',
      config: DIFFICULTY_SETTINGS.HARD,
    });

    const newState = gameReducer(initialState, { type: 'RESET_GAME' });

    expect(newState.difficulty).toBe('HARD');
    expect(newState.config).toEqual(DIFFICULTY_SETTINGS.HARD);
  });
});

// ============================================================================
// EAT_FOOD ACTION TESTS
// ============================================================================

describe('EAT_FOOD action', () => {
  it('should update food position', () => {
    const initialState = createTestState({
      food: { x: 5, y: 5 },
    });

    const newFood = { x: 10, y: 10 };
    const newState = gameReducer(initialState, {
      type: 'EAT_FOOD',
      payload: { newFood },
    });

    expect(newState.food).toEqual(newFood);
  });
});

// ============================================================================
// GENERATE FOOD UTILITY TESTS
// ============================================================================

describe('generateFood', () => {
  it('should generate food within grid bounds', () => {
    const snakeBody = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    const food = generateFood(20, snakeBody);

    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(20);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(20);
  });

  it('should not generate food on snake body', () => {
    const snakeBody = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];

    // Run multiple times to ensure randomness doesn't place food on snake
    for (let i = 0; i < 100; i++) {
      const food = generateFood(20, snakeBody);
      const onSnake = snakeBody.some(
        (segment) => segment.x === food.x && segment.y === food.y
      );
      expect(onSnake).toBe(false);
    }
  });
});

// ============================================================================
// TYPE SAFETY TESTS
// ============================================================================

describe('TypeScript type safety', () => {
  it('should have correct Direction type values', () => {
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    expect(directions).toHaveLength(4);
  });

  it('should have correct Difficulty type values', () => {
    const difficulties: Difficulty[] = ['EASY', 'NORMAL', 'HARD'];
    expect(difficulties).toHaveLength(3);
  });

  it('should have correct GameStatus type values', () => {
    const statuses: Array<'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'> = [
      'MENU',
      'PLAYING',
      'PAUSED',
      'GAME_OVER',
    ];
    expect(statuses).toHaveLength(4);
  });
});
