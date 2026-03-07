// Game Types

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  body: Position[];
  direction: Direction;
}

export interface GameConfig {
  gridSize: number;
  cellSize: number;
  initialSpeed: number;
  speedIncrement: number;
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
