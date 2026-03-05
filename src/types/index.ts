/**
 * Type definitions for Snake game
 */

/** Grid position */
export interface Position {
  x: number;
  y: number;
}

/** Game direction */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** Game difficulty levels */
export type Difficulty = 'easy' | 'medium' | 'expert';

/** Game state */
export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameOver: boolean;
  paused: boolean;
  score: number;
  difficulty: Difficulty;
  gameStarted: boolean;
}

/** Keyboard keys that control the game */
export type GameKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD' | 'Space';

/** Swipe direction for touch controls */
export type SwipeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** Touch event position */
export interface TouchPosition {
  x: number;
  y: number;
}
