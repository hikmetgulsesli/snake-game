import { render, screen, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { calculateScore, calculateNewSpeed, gameReducer, createInitialState } from '../hooks/useGameReducer';
import { DIFFICULTY_SETTINGS, DIFFICULTY_MULTIPLIERS, MIN_SPEED_THRESHOLDS, SPEED_DECREMENTS } from '../constants/game';
import { GameState } from '../types/game';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Home', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('renders loading state initially', () => {
    render(<Home />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the game after loading', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('game-grid')).toBeInTheDocument();
    expect(screen.getByTestId('game-hud')).toBeInTheDocument();
  });

  it('renders HUD with score and speed', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByTestId('hud-score')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('hud-speed')).toBeInTheDocument();
    expect(screen.getByTestId('hud-high-score')).toBeInTheDocument();
  });

  it('renders difficulty buttons', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'EASY' })).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: 'NORMAL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'HARD' })).toBeInTheDocument();
  });

  it('renders controls info', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/to move/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/to pause/i)).toBeInTheDocument();
  });
});

describe('Scoring System', () => {
  describe('calculateScore', () => {
    it('calculates correct score for EASY difficulty (1x multiplier)', () => {
      const score = calculateScore(5, DIFFICULTY_MULTIPLIERS.EASY);
      expect(score).toBe(50); // 5 foods × 10 points × 1
    });

    it('calculates correct score for NORMAL difficulty (1.5x multiplier)', () => {
      const score = calculateScore(4, DIFFICULTY_MULTIPLIERS.NORMAL);
      expect(score).toBe(60); // 4 foods × 10 points × 1.5 = 60
    });

    it('calculates correct score for HARD difficulty (2x multiplier)', () => {
      const score = calculateScore(3, DIFFICULTY_MULTIPLIERS.HARD);
      expect(score).toBe(60); // 3 foods × 10 points × 2 = 60
    });

    it('returns 0 for 0 foods eaten', () => {
      const score = calculateScore(0, DIFFICULTY_MULTIPLIERS.NORMAL);
      expect(score).toBe(0);
    });

    it('handles decimal multipliers correctly', () => {
      const score = calculateScore(3, 1.5);
      expect(score).toBe(45); // 3 × 10 × 1.5 = 45
    });
  });

  describe('Difficulty Settings', () => {
    it('EASY has 1x score multiplier', () => {
      expect(DIFFICULTY_SETTINGS.EASY.scoreMultiplier).toBe(1);
    });

    it('NORMAL has 1.5x score multiplier', () => {
      expect(DIFFICULTY_SETTINGS.NORMAL.scoreMultiplier).toBe(1.5);
    });

    it('HARD has 2x score multiplier', () => {
      expect(DIFFICULTY_SETTINGS.HARD.scoreMultiplier).toBe(2);
    });
  });
});

describe('Speed System', () => {
  describe('calculateNewSpeed', () => {
    it('decreases speed by specified decrement', () => {
      const newSpeed = calculateNewSpeed(150, 3, 80);
      expect(newSpeed).toBe(147); // 150 - 3 = 147
    });

    it('respects minimum speed threshold', () => {
      const newSpeed = calculateNewSpeed(82, 3, 80);
      expect(newSpeed).toBe(80); // Should not go below 80
    });

    it('returns minSpeed when current speed is at threshold', () => {
      const newSpeed = calculateNewSpeed(80, 3, 80);
      expect(newSpeed).toBe(80); // Already at minimum
    });

    it('returns minSpeed when decrement would go below threshold', () => {
      const newSpeed = calculateNewSpeed(81, 3, 80);
      expect(newSpeed).toBe(80); // 81 - 3 = 78, but min is 80
    });
  });

  describe('Difficulty Speed Thresholds', () => {
    it('EASY has minimum speed of 100ms', () => {
      expect(MIN_SPEED_THRESHOLDS.EASY).toBe(100);
      expect(DIFFICULTY_SETTINGS.EASY.minSpeed).toBe(100);
    });

    it('NORMAL has minimum speed of 80ms', () => {
      expect(MIN_SPEED_THRESHOLDS.NORMAL).toBe(80);
      expect(DIFFICULTY_SETTINGS.NORMAL.minSpeed).toBe(80);
    });

    it('HARD has minimum speed of 60ms', () => {
      expect(MIN_SPEED_THRESHOLDS.HARD).toBe(60);
      expect(DIFFICULTY_SETTINGS.HARD.minSpeed).toBe(60);
    });
  });

  describe('Speed Decrements', () => {
    it('EASY decreases by 2ms per food', () => {
      expect(SPEED_DECREMENTS.EASY).toBe(2);
      expect(DIFFICULTY_SETTINGS.EASY.speedIncrement).toBe(2);
    });

    it('NORMAL decreases by 3ms per food', () => {
      expect(SPEED_DECREMENTS.NORMAL).toBe(3);
      expect(DIFFICULTY_SETTINGS.NORMAL.speedIncrement).toBe(3);
    });

    it('HARD decreases by 4ms per food', () => {
      expect(SPEED_DECREMENTS.HARD).toBe(4);
      expect(DIFFICULTY_SETTINGS.HARD.speedIncrement).toBe(4);
    });
  });
});

describe('Game Reducer - Scoring and Speed', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialState('NORMAL');
  });

  describe('INIT_GAME', () => {
    it('initializes with correct difficulty settings', () => {
      const state = gameReducer(initialState, {
        type: 'INIT_GAME',
        payload: { difficulty: 'HARD' },
      });

      expect(state.difficulty).toBe('HARD');
      expect(state.config.scoreMultiplier).toBe(2);
      expect(state.config.minSpeed).toBe(60);
      expect(state.score).toBe(0);
      expect(state.foodsEaten).toBe(0);
      expect(state.speed).toBe(DIFFICULTY_SETTINGS.HARD.initialSpeed);
    });
  });

  describe('EAT_FOOD integration via MOVE_SNAKE', () => {
    it('applies difficulty multiplier to score when eating food', () => {
      // Setup state where snake is about to eat food
      const state: GameState = {
        ...initialState,
        status: 'PLAYING',
        snake: {
          body: [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 },
          ],
          direction: 'RIGHT',
          directionQueue: [],
        },
        food: { x: 6, y: 5 }, // Food is to the right of head
        score: 0,
        foodsEaten: 0,
        speed: 150,
        config: DIFFICULTY_SETTINGS.NORMAL,
      };

      const newState = gameReducer(state, { type: 'MOVE_SNAKE' });

      expect(newState.foodsEaten).toBe(1);
      expect(newState.score).toBe(15); // 1 × 10 × 1.5 = 15
    });

    it('calculates score correctly for HARD difficulty', () => {
      const state: GameState = {
        ...initialState,
        status: 'PLAYING',
        snake: {
          body: [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
          ],
          direction: 'RIGHT',
          directionQueue: [],
        },
        food: { x: 6, y: 5 },
        score: 40, // Already ate 2 foods
        foodsEaten: 2,
        speed: 100,
        config: DIFFICULTY_SETTINGS.HARD,
      };

      const newState = gameReducer(state, { type: 'MOVE_SNAKE' });

      expect(newState.foodsEaten).toBe(3);
      expect(newState.score).toBe(60); // 3 × 10 × 2 = 60
    });

    it('decreases speed after eating food', () => {
      const state: GameState = {
        ...initialState,
        status: 'PLAYING',
        snake: {
          body: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
          direction: 'RIGHT',
          directionQueue: [],
        },
        food: { x: 6, y: 5 },
        score: 0,
        foodsEaten: 0,
        speed: 150,
        config: DIFFICULTY_SETTINGS.NORMAL,
      };

      const newState = gameReducer(state, { type: 'MOVE_SNAKE' });

      expect(newState.speed).toBe(147); // 150 - 3 = 147
    });

    it('respects minimum speed threshold when eating food', () => {
      const state: GameState = {
        ...initialState,
        status: 'PLAYING',
        snake: {
          body: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
          direction: 'RIGHT',
          directionQueue: [],
        },
        food: { x: 6, y: 5 },
        score: 0,
        foodsEaten: 0,
        speed: 82, // Just above minimum of 80 for NORMAL
        config: DIFFICULTY_SETTINGS.NORMAL,
      };

      const newState = gameReducer(state, { type: 'MOVE_SNAKE' });

      expect(newState.speed).toBe(80); // Should not go below 80
    });

    it('maintains minimum speed when already at threshold', () => {
      const state: GameState = {
        ...initialState,
        status: 'PLAYING',
        snake: {
          body: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
          direction: 'RIGHT',
          directionQueue: [],
        },
        food: { x: 6, y: 5 },
        score: 100,
        foodsEaten: 10,
        speed: 80, // At minimum for NORMAL
        config: DIFFICULTY_SETTINGS.NORMAL,
      };

      const newState = gameReducer(state, { type: 'MOVE_SNAKE' });

      expect(newState.speed).toBe(80); // Stays at minimum
    });
  });
});

describe('HUD Component Logic', () => {
  it('difficulty multipliers are correctly defined', () => {
    expect(DIFFICULTY_MULTIPLIERS.EASY).toBe(1);
    expect(DIFFICULTY_MULTIPLIERS.NORMAL).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS.HARD).toBe(2);
  });
});
