import type { Position, Direction } from '../types/game';
import { GRID_SIZE } from '../types/game';

/**
 * Game engine for Snake game
 * Handles core game logic: movement, collision detection, and state updates
 */

/** Check if position is outside grid boundaries */
export function isOutOfBounds(position: Position): boolean {
  return position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE;
}

/** Check if snake head collides with its body */
export function isSelfCollision(head: Position, body: Position[]): boolean {
  return body.some((segment) => segment.x === head.x && segment.y === head.y);
}

/** Check if head position equals food position */
export function isFoodCollision(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y;
}

/** Calculate new head position based on direction */
export function getNextHead(head: Position, direction: Direction): Position {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
}

/** Check if two directions are opposite (would cause immediate self-collision) */
export function isOppositeDirection(current: Direction, next: Direction): boolean {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[current] === next;
}

/** Generate random food position that doesn't overlap with snake */
export function generateFood(snake: Position[]): Position {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

/** Move snake in the given direction, optionally growing if food is eaten */
export function moveSnake(
  snake: Position[],
  direction: Direction,
  food: Position,
  grow: boolean
): { newSnake: Position[]; ateFood: boolean } {
  const head = snake[0];
  const newHead = getNextHead(head, direction);
  
  const ateFood = isFoodCollision(newHead, food);
  const shouldGrow = grow && ateFood;
  
  const newSnake = [newHead, ...snake];
  
  if (!shouldGrow) {
    newSnake.pop();
  }
  
  return { newSnake, ateFood };
}

/** Check if game is over (wall collision or self collision) */
export function isGameOver(snake: Position[], nextHead?: Position): boolean {
  const head = nextHead || snake[0];
  const body = nextHead ? snake : snake.slice(1);
  
  return isOutOfBounds(head) || isSelfCollision(head, body);
}
