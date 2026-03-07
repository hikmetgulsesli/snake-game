'use client';

import { useReducer, useCallback } from 'react';
import {
  GameState,
  GameAction,
  Direction,
  Difficulty,
  Position,
  GameStatus,
} from '../types/game';
import { DIFFICULTY_SETTINGS, OPPOSITE_DIRECTIONS } from '../constants/game';

// ============================================================================
// INITIAL STATE GENERATOR
// ============================================================================

/**
 * Generates a random food position that doesn't overlap with the snake
 */
export function generateFood(
  gridSize: number,
  snakeBody: Position[]
): Position {
  let food: Position;
  let isOnSnake: boolean;

  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    isOnSnake = snakeBody.some(
      (segment) => segment.x === food.x && segment.y === food.y
    );
  } while (isOnSnake);

  return food;
}

/**
 * Creates the initial snake centered on the grid
 */
function createInitialSnake(gridSize: number): Position[] {
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);

  // Snake starts with 3 segments, moving right
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
}

/**
 * Generates the initial game state based on difficulty
 */
export function createInitialState(difficulty: Difficulty = 'NORMAL'): GameState {
  const config = DIFFICULTY_SETTINGS[difficulty];
  const initialSnakeBody = createInitialSnake(config.gridSize);

  return {
    status: 'MENU' as GameStatus,
    difficulty,
    snake: {
      body: initialSnakeBody,
      direction: 'RIGHT' as Direction,
      directionQueue: [],
    },
    food: generateFood(config.gridSize, initialSnakeBody),
    score: 0,
    highScores: [],
    speed: config.initialSpeed,
    config,
  };
}

// ============================================================================
// REDUCER
// ============================================================================

/**
 * Calculates the next position based on direction
 */
function getNextPosition(current: Position, direction: Direction): Position {
  switch (direction) {
    case 'UP':
      return { x: current.x, y: current.y - 1 };
    case 'DOWN':
      return { x: current.x, y: current.y + 1 };
    case 'LEFT':
      return { x: current.x - 1, y: current.y };
    case 'RIGHT':
      return { x: current.x + 1, y: current.y };
  }
}

/**
 * Checks if a position is out of bounds
 */
function isOutOfBounds(position: Position, gridSize: number): boolean {
  return (
    position.x < 0 ||
    position.x >= gridSize ||
    position.y < 0 ||
    position.y >= gridSize
  );
}

/**
 * Checks if the snake has collided with itself
 */
function hasSelfCollision(head: Position, body: Position[]): boolean {
  // Skip the head (first element) and check against the rest of the body
  return body.slice(1).some(
    (segment) => segment.x === head.x && segment.y === head.y
  );
}

/**
 * Checks if the snake head is at the food position
 */
function isFoodEaten(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y;
}

/**
 * Game state reducer
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      const { difficulty } = action.payload;
      const config = DIFFICULTY_SETTINGS[difficulty];
      const initialSnakeBody = createInitialSnake(config.gridSize);

      return {
        ...state,
        status: 'PLAYING',
        difficulty,
        snake: {
          body: initialSnakeBody,
          direction: 'RIGHT',
          directionQueue: [],
        },
        food: generateFood(config.gridSize, initialSnakeBody),
        score: 0,
        speed: config.initialSpeed,
        config,
      };
    }

    case 'MOVE_SNAKE': {
      if (state.status !== 'PLAYING') {
        return state;
      }

      // Process direction queue - get next direction if available
      let newDirection = state.snake.direction;
      const newQueue = [...state.snake.directionQueue];

      // Process queued directions, skipping invalid ones
      while (newQueue.length > 0) {
        const queuedDirection = newQueue[0];
        // Check if direction change is valid (not 180° turn)
        if (queuedDirection !== OPPOSITE_DIRECTIONS[newDirection]) {
          newDirection = queuedDirection;
          newQueue.shift();
          break;
        }
        // Skip invalid direction
        newQueue.shift();
      }

      const head = state.snake.body[0];
      const newHead = getNextPosition(head, newDirection);

      // Check for wall collision
      if (isOutOfBounds(newHead, state.config.gridSize)) {
        return {
          ...state,
          status: 'GAME_OVER',
        };
      }

      // Check for self collision
      if (hasSelfCollision(newHead, state.snake.body)) {
        return {
          ...state,
          status: 'GAME_OVER',
        };
      }

      // Move snake (add new head, remove tail unless eating)
      const newBody = [newHead, ...state.snake.body];

      // Check if food is eaten
      if (isFoodEaten(newHead, state.food)) {
        // Don't remove tail - snake grows
        const newScore = state.score + 10;
        const newSpeed = Math.max(
          50,
          state.speed - state.config.speedIncrement
        );

        // Generate new food at random empty position
        const newFood = generateFood(state.config.gridSize, newBody);

        return {
          ...state,
          snake: {
            body: newBody,
            direction: newDirection,
            directionQueue: newQueue,
          },
          food: newFood,
          score: newScore,
          speed: newSpeed,
        };
      }

      // Remove tail - snake moves
      newBody.pop();

      return {
        ...state,
        snake: {
          body: newBody,
          direction: newDirection,
          directionQueue: newQueue,
        },
      };
    }

    case 'CHANGE_DIRECTION': {
      const { direction } = action.payload;
      const currentDirection = state.snake.direction;
      const queue = state.snake.directionQueue;

      // Determine the effective direction after processing current queue
      // This is what direction the snake will be facing when the new input is processed
      let effectiveDirection = currentDirection;
      for (const queuedDir of queue) {
        // Only update if the queued direction is not opposite to current effective direction
        if (queuedDir !== OPPOSITE_DIRECTIONS[effectiveDirection]) {
          effectiveDirection = queuedDir;
        }
      }

      // Prevent 180° turns from the effective direction
      if (direction === OPPOSITE_DIRECTIONS[effectiveDirection]) {
        return state;
      }

      // Don't queue same direction as effective direction
      if (direction === effectiveDirection) {
        return state;
      }

      // Don't queue duplicate of last queued direction
      const lastQueued = queue[queue.length - 1];
      if (direction === lastQueued) {
        return state;
      }

      // Add to direction queue (max 2 queued directions)
      if (queue.length < 2) {
        return {
          ...state,
          snake: {
            ...state.snake,
            directionQueue: [...queue, direction],
          },
        };
      }

      return state;
    }

    case 'EAT_FOOD': {
      const { newFood } = action.payload;
      return {
        ...state,
        food: newFood,
      };
    }

    case 'PAUSE_GAME': {
      if (state.status !== 'PLAYING') {
        return state;
      }
      return {
        ...state,
        status: 'PAUSED',
      };
    }

    case 'RESUME_GAME': {
      if (state.status !== 'PAUSED') {
        return state;
      }
      return {
        ...state,
        status: 'PLAYING',
      };
    }

    case 'GAME_OVER': {
      return {
        ...state,
        status: 'GAME_OVER',
      };
    }

    case 'RESET_GAME': {
      return createInitialState(state.difficulty);
    }

    default:
      return state;
  }
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export interface UseGameReducerReturn {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Convenience methods
  initGame: (difficulty: Difficulty) => void;
  moveSnake: () => void;
  changeDirection: (direction: Direction) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
}

/**
 * Custom hook for game state management
 */
export function useGameReducer(
  initialDifficulty: Difficulty = 'NORMAL'
): UseGameReducerReturn {
  const [state, dispatch] = useReducer(
    gameReducer,
    createInitialState(initialDifficulty)
  );

  // Convenience callbacks
  const initGame = useCallback(
    (difficulty: Difficulty) => {
      dispatch({ type: 'INIT_GAME', payload: { difficulty } });
    },
    [dispatch]
  );

  const moveSnake = useCallback(() => {
    dispatch({ type: 'MOVE_SNAKE' });
  }, [dispatch]);

  const changeDirection = useCallback(
    (direction: Direction) => {
      dispatch({ type: 'CHANGE_DIRECTION', payload: { direction } });
    },
    [dispatch]
  );

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' });
  }, [dispatch]);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
  }, [dispatch]);

  const gameOver = useCallback(() => {
    dispatch({ type: 'GAME_OVER' });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  return {
    state,
    dispatch,
    initGame,
    moveSnake,
    changeDirection,
    pauseGame,
    resumeGame,
    gameOver,
    resetGame,
  };
}
