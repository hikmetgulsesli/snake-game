// Game Types

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface Position {
  x: number;
  y: number;
}

export interface SnakeState {
  body: Position[];
  direction: Direction;
  directionQueue: Direction[];
}

export interface GameConfig {
  gridSize: number;
  cellSize: number;
  initialSpeed: number;
  speedIncrement: number;
  minSpeed: number;
  scoreMultiplier: number;
  difficulty: Difficulty;
}

export interface HighScore {
  score: number;
  date: string;
  difficulty: Difficulty;
}

export interface GameStats {
  score: number;
  highScore: number;
  speed: number;
  level: number;
}

// Complete Game State for useReducer
export interface GameState {
  // Game status
  status: GameStatus;
  difficulty: Difficulty;
  
  // Snake state
  snake: SnakeState;
  
  // Food position
  food: Position;
  
  // Game stats
  score: number;
  highScores: HighScore[];
  speed: number;
  foodsEaten: number;
  
  // Game configuration (derived from difficulty)
  config: GameConfig;
}

// Game Actions for useReducer
export type GameAction =
  | { type: 'INIT_GAME'; payload: { difficulty: Difficulty } }
  | { type: 'MOVE_SNAKE' }
  | { type: 'CHANGE_DIRECTION'; payload: { direction: Direction } }
  | { type: 'EAT_FOOD'; payload: { newFood: Position } }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET_GAME' };
