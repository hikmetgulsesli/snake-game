import { describe, it, expect } from 'vitest';
import type { Position, Direction } from '../types/game';
import { GRID_SIZE, DIFFICULTY_SPEEDS } from '../types/game';

describe('Game Types', () => {
  describe('Position', () => {
    it('should create valid position objects', () => {
      const pos: Position = { x: 5, y: 10 };
      expect(pos.x).toBe(5);
      expect(pos.y).toBe(10);
    });
  });

  describe('Direction', () => {
    it('should accept all valid directions', () => {
      const up: Direction = 'UP';
      const down: Direction = 'DOWN';
      const left: Direction = 'LEFT';
      const right: Direction = 'RIGHT';

      expect(up).toBe('UP');
      expect(down).toBe('DOWN');
      expect(left).toBe('LEFT');
      expect(right).toBe('RIGHT');
    });
  });

  describe('GRID_SIZE', () => {
    it('should be 20x20', () => {
      expect(GRID_SIZE).toBe(20);
    });
  });

  describe('DIFFICULTY_SPEEDS', () => {
    it('should have speeds for all difficulties', () => {
      expect(DIFFICULTY_SPEEDS.easy).toBe(150);
      expect(DIFFICULTY_SPEEDS.medium).toBe(100);
      expect(DIFFICULTY_SPEEDS.expert).toBe(60);
    });

    it('should have faster speeds for higher difficulties', () => {
      expect(DIFFICULTY_SPEEDS.easy).toBeGreaterThan(DIFFICULTY_SPEEDS.medium);
      expect(DIFFICULTY_SPEEDS.medium).toBeGreaterThan(DIFFICULTY_SPEEDS.expert);
    });
  });
});
