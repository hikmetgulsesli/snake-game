export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Difficulty = 'easy' | 'medium' | 'expert';
export type GameScreen = 'start' | 'playing' | 'paused' | 'gameOver';

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  paused: boolean;
  score: number;
  highScore: number;
  difficulty: Difficulty;
  screen: GameScreen;
  isNewHighScore: boolean;
}

export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 150,
  medium: 100,
  expert: 60,
};

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
