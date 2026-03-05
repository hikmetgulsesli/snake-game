/**
 * Type definitions for Snake game
 * 
 * All game-related types are consolidated in game.ts for single source of truth.
 * This file re-exports them for convenience.
 */

export type {
  Position,
  Direction,
  Difficulty,
  GameScreen,
  GameState,
} from './game';

export {
  DIFFICULTY_SPEEDS,
  GRID_SIZE,
  CELL_SIZE,
} from './game';

/** Keyboard keys that control the game */
export type GameKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'KeyW' | 'KeyS' | 'KeyA' | 'KeyD' | 'Space';

/** Swipe direction for touch controls */
export type SwipeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** Touch event position */
export interface TouchPosition {
  x: number;
  y: number;
}
