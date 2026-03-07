import {
  GRID_SIZE,
  CELL_SIZE,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MAX_SPEED,
  DIFFICULTY_SETTINGS,
  DIRECTION_KEYS,
  OPPOSITE_DIRECTIONS,
  SCORE_PER_FOOD,
  LEVEL_THRESHOLD,
  LOCAL_STORAGE_KEYS,
} from '../constants/game';

describe('Game Constants', () => {
  describe('Grid Settings', () => {
    it('should have GRID_SIZE defined as positive number', () => {
      expect(GRID_SIZE).toBeGreaterThan(0);
      expect(typeof GRID_SIZE).toBe('number');
    });

    it('should have CELL_SIZE defined as positive number', () => {
      expect(CELL_SIZE).toBeGreaterThan(0);
      expect(typeof CELL_SIZE).toBe('number');
    });
  });

  describe('Speed Settings', () => {
    it('should have INITIAL_SPEED defined', () => {
      expect(INITIAL_SPEED).toBeGreaterThan(0);
      expect(typeof INITIAL_SPEED).toBe('number');
    });

    it('should have SPEED_INCREMENT defined', () => {
      expect(SPEED_INCREMENT).toBeGreaterThan(0);
      expect(typeof SPEED_INCREMENT).toBe('number');
    });

    it('should have MAX_SPEED defined and greater than 0', () => {
      expect(MAX_SPEED).toBeGreaterThan(0);
      expect(MAX_SPEED).toBeLessThan(INITIAL_SPEED);
    });
  });

  describe('Difficulty Settings', () => {
    it('should have EASY difficulty configured', () => {
      expect(DIFFICULTY_SETTINGS.EASY).toBeDefined();
      expect(DIFFICULTY_SETTINGS.EASY.difficulty).toBe('EASY');
    });

    it('should have NORMAL difficulty configured', () => {
      expect(DIFFICULTY_SETTINGS.NORMAL).toBeDefined();
      expect(DIFFICULTY_SETTINGS.NORMAL.difficulty).toBe('NORMAL');
    });

    it('should have HARD difficulty configured', () => {
      expect(DIFFICULTY_SETTINGS.HARD).toBeDefined();
      expect(DIFFICULTY_SETTINGS.HARD.difficulty).toBe('HARD');
    });

    it('should have increasing speed for higher difficulties', () => {
      const easySpeed = DIFFICULTY_SETTINGS.EASY.initialSpeed;
      const normalSpeed = DIFFICULTY_SETTINGS.NORMAL.initialSpeed;
      const hardSpeed = DIFFICULTY_SETTINGS.HARD.initialSpeed;
      
      expect(hardSpeed).toBeLessThan(normalSpeed);
      expect(normalSpeed).toBeLessThan(easySpeed);
    });
  });

  describe('Direction Keys', () => {
    it('should map arrow keys to directions', () => {
      expect(DIRECTION_KEYS.ArrowUp).toBe('UP');
      expect(DIRECTION_KEYS.ArrowDown).toBe('DOWN');
      expect(DIRECTION_KEYS.ArrowLeft).toBe('LEFT');
      expect(DIRECTION_KEYS.ArrowRight).toBe('RIGHT');
    });

    it('should map WASD keys to directions', () => {
      expect(DIRECTION_KEYS.w).toBe('UP');
      expect(DIRECTION_KEYS.s).toBe('DOWN');
      expect(DIRECTION_KEYS.a).toBe('LEFT');
      expect(DIRECTION_KEYS.d).toBe('RIGHT');
    });
  });

  describe('Opposite Directions', () => {
    it('should define opposite directions correctly', () => {
      expect(OPPOSITE_DIRECTIONS.UP).toBe('DOWN');
      expect(OPPOSITE_DIRECTIONS.DOWN).toBe('UP');
      expect(OPPOSITE_DIRECTIONS.LEFT).toBe('RIGHT');
      expect(OPPOSITE_DIRECTIONS.RIGHT).toBe('LEFT');
    });
  });

  describe('Score Settings', () => {
    it('should have SCORE_PER_FOOD defined', () => {
      expect(SCORE_PER_FOOD).toBeGreaterThan(0);
      expect(typeof SCORE_PER_FOOD).toBe('number');
    });

    it('should have LEVEL_THRESHOLD defined', () => {
      expect(LEVEL_THRESHOLD).toBeGreaterThan(0);
      expect(typeof LEVEL_THRESHOLD).toBe('number');
    });
  });

  describe('Local Storage Keys', () => {
    it('should have HIGH_SCORES key defined', () => {
      expect(LOCAL_STORAGE_KEYS.HIGH_SCORES).toBe('snake_game_high_scores');
    });

    it('should have SETTINGS key defined', () => {
      expect(LOCAL_STORAGE_KEYS.SETTINGS).toBe('snake_game_settings');
    });
  });
});
