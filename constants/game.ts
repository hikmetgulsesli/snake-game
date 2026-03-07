// Game Constants

import { Difficulty, GameConfig } from '../types/game';

export const GRID_SIZE = 20;

export const CELL_SIZE = 20;

export const INITIAL_SPEED = 150;

export const SPEED_INCREMENT = 5;

export const MAX_SPEED = 50;

export const DIFFICULTY_SETTINGS: Record<Difficulty, GameConfig> = {
  EASY: {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 180,
    speedIncrement: 3,
    difficulty: 'EASY',
  },
  NORMAL: {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 150,
    speedIncrement: 5,
    difficulty: 'NORMAL',
  },
  HARD: {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 100,
    speedIncrement: 8,
    difficulty: 'HARD',
  },
};

export const DIRECTION_KEYS: Record<string, string> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
  W: 'UP',
  S: 'DOWN',
  A: 'LEFT',
  D: 'RIGHT',
};

export const OPPOSITE_DIRECTIONS: Record<string, string> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export const SCORE_PER_FOOD = 10;

export const LEVEL_THRESHOLD = 50;

export const LOCAL_STORAGE_KEYS = {
  HIGH_SCORES: 'snake_game_high_scores',
  SETTINGS: 'snake_game_settings',
} as const;
