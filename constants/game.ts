// Game Constants

import { Difficulty, GameConfig } from '../types/game';

export const GRID_SIZE = 20;

export const CELL_SIZE = 20;

export const INITIAL_SPEED = 150;

export const SPEED_INCREMENT = 5;

export const MAX_SPEED = 50;

// Score base points per food
export const BASE_SCORE_PER_FOOD = 10;

// Difficulty multipliers
export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  EASY: 1,
  NORMAL: 1.5,
  HARD: 2,
};

// Minimum speed thresholds per difficulty (in ms)
export const MIN_SPEED_THRESHOLDS: Record<Difficulty, number> = {
  EASY: 100,
  NORMAL: 80,
  HARD: 60,
};

// Speed decrement per food eaten (ms reduction)
export const SPEED_DECREMENTS: Record<Difficulty, number> = {
  EASY: 2,
  NORMAL: 3,
  HARD: 4,
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, GameConfig> = {
  EASY: {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 180,
    speedIncrement: SPEED_DECREMENTS.EASY,
    minSpeed: MIN_SPEED_THRESHOLDS.EASY,
    scoreMultiplier: DIFFICULTY_MULTIPLIERS.EASY,
    difficulty: 'EASY',
  },
  NORMAL: {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 150,
    speedIncrement: SPEED_DECREMENTS.NORMAL,
    minSpeed: MIN_SPEED_THRESHOLDS.NORMAL,
    scoreMultiplier: DIFFICULTY_MULTIPLIERS.NORMAL,
    difficulty: 'NORMAL',
  },
  HARD: {
    gridSize: 20,
    cellSize: 20,
    initialSpeed: 100,
    speedIncrement: SPEED_DECREMENTS.HARD,
    minSpeed: MIN_SPEED_THRESHOLDS.HARD,
    scoreMultiplier: DIFFICULTY_MULTIPLIERS.HARD,
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
  HIGH_SCORES: 'snake_game_high_scores_v2',
  SETTINGS: 'snake_game_settings',
} as const;

// High Score Settings
export const MAX_HIGH_SCORES = 10;
export const HIGH_SCORES_SCHEMA_VERSION = 1;
