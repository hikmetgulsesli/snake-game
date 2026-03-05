import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isOutOfBounds,
  isSelfCollision,
  isFoodCollision,
  getNextHead,
  isOppositeDirection,
  generateFood,
  moveSnake,
  isGameOver,
} from './gameEngine';
import type { Position } from '../types/game';
import { GRID_SIZE } from '../types/game';

describe('Game Engine', () => {
  describe('isOutOfBounds', () => {
    it('should return false for positions inside grid', () => {
      expect(isOutOfBounds({ x: 0, y: 0 })).toBe(false);
      expect(isOutOfBounds({ x: 10, y: 10 })).toBe(false);
      expect(isOutOfBounds({ x: 19, y: 19 })).toBe(false);
    });

    it('should return true for negative x', () => {
      expect(isOutOfBounds({ x: -1, y: 10 })).toBe(true);
    });

    it('should return true for negative y', () => {
      expect(isOutOfBounds({ x: 10, y: -1 })).toBe(true);
    });

    it('should return true for x >= GRID_SIZE', () => {
      expect(isOutOfBounds({ x: 20, y: 10 })).toBe(true);
      expect(isOutOfBounds({ x: 25, y: 10 })).toBe(true);
    });

    it('should return true for y >= GRID_SIZE', () => {
      expect(isOutOfBounds({ x: 10, y: 20 })).toBe(true);
      expect(isOutOfBounds({ x: 10, y: 25 })).toBe(true);
    });
  });

  describe('isSelfCollision', () => {
    it('should return false when head does not collide with body', () => {
      const head: Position = { x: 5, y: 5 };
      const body: Position[] = [{ x: 4, y: 5 }, { x: 3, y: 5 }];
      expect(isSelfCollision(head, body)).toBe(false);
    });

    it('should return true when head collides with body segment', () => {
      const head: Position = { x: 4, y: 5 };
      const body: Position[] = [{ x: 4, y: 5 }, { x: 3, y: 5 }];
      expect(isSelfCollision(head, body)).toBe(true);
    });

    it('should return false for empty body', () => {
      const head: Position = { x: 5, y: 5 };
      expect(isSelfCollision(head, [])).toBe(false);
    });
  });

  describe('isFoodCollision', () => {
    it('should return true when head equals food position', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 5, y: 5 };
      expect(isFoodCollision(head, food)).toBe(true);
    });

    it('should return false when head does not equal food position', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 6, y: 6 };
      expect(isFoodCollision(head, food)).toBe(false);
    });
  });

  describe('getNextHead', () => {
    it('should move UP correctly', () => {
      const head: Position = { x: 5, y: 5 };
      expect(getNextHead(head, 'UP')).toEqual({ x: 5, y: 4 });
    });

    it('should move DOWN correctly', () => {
      const head: Position = { x: 5, y: 5 };
      expect(getNextHead(head, 'DOWN')).toEqual({ x: 5, y: 6 });
    });

    it('should move LEFT correctly', () => {
      const head: Position = { x: 5, y: 5 };
      expect(getNextHead(head, 'LEFT')).toEqual({ x: 4, y: 5 });
    });

    it('should move RIGHT correctly', () => {
      const head: Position = { x: 5, y: 5 };
      expect(getNextHead(head, 'RIGHT')).toEqual({ x: 6, y: 5 });
    });
  });

  describe('isOppositeDirection', () => {
    it('should return true for opposite pairs', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('should return false for same direction', () => {
      expect(isOppositeDirection('UP', 'UP')).toBe(false);
      expect(isOppositeDirection('DOWN', 'DOWN')).toBe(false);
    });

    it('should return false for perpendicular directions', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
    });
  });

  describe('generateFood', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate food within grid bounds', () => {
      const snake: Position[] = [{ x: 0, y: 0 }];
      const food = generateFood(snake);
      
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GRID_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GRID_SIZE);
    });

    it('should not generate food on snake body', () => {
      // Mock Math.random to return predictable values
      let callCount = 0;
      const mockValues = [0.1, 0.1, 0.5, 0.5]; // First two hit snake, next two don't
      vi.spyOn(Math, 'random').mockImplementation(() => {
        return mockValues[callCount++] || 0.9;
      });

      const snake: Position[] = [{ x: 2, y: 2 }, { x: 10, y: 10 }];
      const food = generateFood(snake);
      
      expect(snake.some(s => s.x === food.x && s.y === food.y)).toBe(false);
    });
  });

  describe('moveSnake', () => {
    it('should move snake in the given direction', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      const food: Position = { x: 10, y: 10 };
      
      const { newSnake, ateFood } = moveSnake(snake, 'RIGHT', food, false);
      
      expect(newSnake[0]).toEqual({ x: 6, y: 5 });
      expect(newSnake).toHaveLength(3);
      expect(ateFood).toBe(false);
    });

    it('should grow snake when food is eaten and grow is true', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      const food: Position = { x: 6, y: 5 }; // Food is to the right
      
      const { newSnake, ateFood } = moveSnake(snake, 'RIGHT', food, true);
      
      expect(newSnake).toHaveLength(3);
      expect(ateFood).toBe(true);
    });

    it('should not grow snake when grow is false', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      const food: Position = { x: 6, y: 5 };
      
      const { newSnake, ateFood } = moveSnake(snake, 'RIGHT', food, false);
      
      expect(newSnake).toHaveLength(2);
      expect(ateFood).toBe(true);
    });

    it('should remove tail when not growing', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      const food: Position = { x: 10, y: 10 };
      
      const { newSnake } = moveSnake(snake, 'RIGHT', food, false);
      
      expect(newSnake).not.toContainEqual({ x: 3, y: 5 });
    });
  });

  describe('isGameOver', () => {
    it('should return true for wall collision (nextHead provided)', () => {
      const snake: Position[] = [{ x: 0, y: 5 }];
      const nextHead: Position = { x: -1, y: 5 };
      expect(isGameOver(snake, nextHead)).toBe(true);
    });

    it('should return true for self collision (nextHead provided)', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      const nextHead: Position = { x: 4, y: 5 }; // Hits body
      expect(isGameOver(snake, nextHead)).toBe(true);
    });

    it('should return false when no collision (nextHead provided)', () => {
      const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      const nextHead: Position = { x: 6, y: 5 };
      expect(isGameOver(snake, nextHead)).toBe(false);
    });

    it('should check current head without nextHead', () => {
      const snake: Position[] = [{ x: -1, y: 5 }, { x: 0, y: 5 }]; // Head out of bounds
      expect(isGameOver(snake)).toBe(true);
    });
  });
});
