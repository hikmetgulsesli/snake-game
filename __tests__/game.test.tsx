import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import GameArena from '../app/game/page';
import { useGameReducer } from '../hooks/useGameReducer';
import { useHighScores } from '../hooks/useHighScores';

// Mock the hooks
jest.mock('../hooks/useGameReducer');
jest.mock('../hooks/useHighScores');
jest.mock('next/font/google', () => ({
  Space_Grotesk: () => ({ variable: '--font-space-grotesk' }),
  DM_Sans: () => ({ variable: '--font-dm-sans' }),
}));

// Mock window.addEventListener
type EventHandler = (event: { key: string; preventDefault: () => void }) => void;
const mockAddEventListener = jest.fn<(event: string, handler: EventHandler) => void>();
const mockRemoveEventListener = jest.fn<(event: string, handler: EventHandler) => void>();

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('GameArena', () => {
  const mockInitGame = jest.fn();
  const mockMoveSnake = jest.fn();
  const mockChangeDirection = jest.fn();
  const mockPauseGame = jest.fn();
  const mockResumeGame = jest.fn();
  const mockResetGame = jest.fn();
  const mockAddScore = jest.fn(() => ({ qualifies: false, rank: null }));

  const createMockState = (status: string = 'PLAYING', score: number = 0) => ({
    status,
    difficulty: 'NORMAL' as const,
    snake: {
      body: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      direction: 'RIGHT' as const,
      directionQueue: [],
    },
    food: { x: 15, y: 15 },
    score,
    highScores: [],
    speed: 150,
    foodsEaten: 0,
    config: {
      gridSize: 20,
      cellSize: 20,
      initialSpeed: 150,
      speedIncrement: 3,
      minSpeed: 80,
      scoreMultiplier: 1.5,
      difficulty: 'NORMAL' as const,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useGameReducer as jest.Mock).mockReturnValue({
      state: createMockState('PLAYING'),
      dispatch: jest.fn(),
      initGame: mockInitGame,
      moveSnake: mockMoveSnake,
      changeDirection: mockChangeDirection,
      pauseGame: mockPauseGame,
      resumeGame: mockResumeGame,
      resetGame: mockResetGame,
    });

    (useHighScores as jest.Mock).mockReturnValue({
      scores: [],
      isLoaded: true,
      error: null,
      addScore: mockAddScore,
      checkQualification: jest.fn(),
      clearScores: jest.fn(),
      refreshScores: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Game Arena Page Rendering', () => {
    it('renders loading state initially', () => {
      render(<GameArena />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders game arena after loading', async () => {
      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-hud')).toBeInTheDocument();
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });
    });

    it('auto-starts the game when entering arena', async () => {
      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('MENU'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockInitGame).toHaveBeenCalledWith('NORMAL');
      });
    });
  });

  describe('HUD Display', () => {
    it('displays score in HUD', async () => {
      const stateWithScore = createMockState('PLAYING', 100);
      (useGameReducer as jest.Mock).mockReturnValue({
        state: stateWithScore,
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('hud-score')).toHaveTextContent('100');
      });
    });

    it('displays speed in HUD', async () => {
      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('hud-speed')).toBeInTheDocument();
        expect(screen.getByTestId('speed-indicator')).toBeInTheDocument();
      });
    });

    it('displays pause button when playing', async () => {
      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('pause-button')).toBeInTheDocument();
      });
    });

    it('displays pause button when paused', async () => {
      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('PAUSED'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('pause-button')).toBeInTheDocument();
      });
    });

    it('does not display pause button when game is over', async () => {
      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('GAME_OVER'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('pause-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pause Functionality', () => {
    it('toggles pause when pause button is clicked', async () => {
      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('pause-button')).toBeInTheDocument();
      });

      const pauseButton = screen.getByTestId('pause-button');
      fireEvent.click(pauseButton);

      expect(mockPauseGame).toHaveBeenCalled();
    });

    it('pauses game when P key is pressed', async () => {
      let keyDownHandler: EventHandler | null = null;
      mockAddEventListener.mockImplementation((event: string, handler: EventHandler) => {
        if (event === 'keydown') {
          keyDownHandler = handler;
        }
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(keyDownHandler).toBeTruthy();
      });

      // Simulate P key press
      act(() => {
        keyDownHandler!({ key: 'p', preventDefault: jest.fn() });
      });

      expect(mockPauseGame).toHaveBeenCalled();
    });

    it('pauses game when uppercase P key is pressed', async () => {
      let keyDownHandler: EventHandler | null = null;
      mockAddEventListener.mockImplementation((event: string, handler: EventHandler) => {
        if (event === 'keydown') {
          keyDownHandler = handler;
        }
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(keyDownHandler).toBeTruthy();
      });

      // Simulate uppercase P key press
      act(() => {
        keyDownHandler!({ key: 'P', preventDefault: jest.fn() });
      });

      expect(mockPauseGame).toHaveBeenCalled();
    });

    it('resumes game when P key is pressed while paused', async () => {
      let keyDownHandler: EventHandler | null = null;
      mockAddEventListener.mockImplementation((event: string, handler: EventHandler) => {
        if (event === 'keydown') {
          keyDownHandler = handler;
        }
      });

      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('PAUSED'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(keyDownHandler).toBeTruthy();
      });

      // Simulate P key press while paused
      act(() => {
        keyDownHandler!({ key: 'p', preventDefault: jest.fn() });
      });

      expect(mockResumeGame).toHaveBeenCalled();
    });

    it('shows pause overlay when paused', async () => {
      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('PAUSED'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('pause-overlay')).toBeInTheDocument();
        expect(screen.getByText('PAUSED')).toBeInTheDocument();
      });
    });

    it('resumes game when resume button is clicked', async () => {
      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('PAUSED'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('resume-button')).toBeInTheDocument();
      });

      const resumeButton = screen.getByTestId('resume-button');
      fireEvent.click(resumeButton);

      expect(mockResumeGame).toHaveBeenCalled();
    });
  });

  describe('Game Loop', () => {
    it('moves snake on interval when playing', async () => {
      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-grid')).toBeInTheDocument();
      });

      // Advance timers by more than the game speed interval
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockMoveSnake).toHaveBeenCalled();
    });

    it('does not move snake when paused', async () => {
      const pausedState = createMockState('PAUSED');
      (useGameReducer as jest.Mock).mockReturnValue({
        state: pausedState,
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByTestId('pause-overlay')).toBeInTheDocument();
      });

      // Clear mock calls from initial render
      mockMoveSnake.mockClear();

      // Advance timers significantly
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not be called when paused
      expect(mockMoveSnake).not.toHaveBeenCalled();
    });

    it('does not move snake when game is over', async () => {
      const gameOverState = createMockState('GAME_OVER');
      (useGameReducer as jest.Mock).mockReturnValue({
        state: gameOverState,
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText('GAME OVER')).toBeInTheDocument();
      });

      // Clear mock calls from initial render
      mockMoveSnake.mockClear();

      // Advance timers significantly
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not be called when game over
      expect(mockMoveSnake).not.toHaveBeenCalled();
    });
  });

  describe('Direction Controls', () => {
    it('changes direction with arrow keys', async () => {
      let keyDownHandler: EventHandler | null = null;
      mockAddEventListener.mockImplementation((event: string, handler: EventHandler) => {
        if (event === 'keydown') {
          keyDownHandler = handler;
        }
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(keyDownHandler).toBeTruthy();
      });

      // Simulate arrow key presses
      act(() => {
        keyDownHandler!({ key: 'ArrowUp', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('UP');

      act(() => {
        keyDownHandler!({ key: 'ArrowDown', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('DOWN');

      act(() => {
        keyDownHandler!({ key: 'ArrowLeft', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('LEFT');

      act(() => {
        keyDownHandler!({ key: 'ArrowRight', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('RIGHT');
    });

    it('changes direction with WASD keys', async () => {
      let keyDownHandler: EventHandler | null = null;
      mockAddEventListener.mockImplementation((event: string, handler: EventHandler) => {
        if (event === 'keydown') {
          keyDownHandler = handler;
        }
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(keyDownHandler).toBeTruthy();
      });

      // Simulate WASD key presses
      act(() => {
        keyDownHandler!({ key: 'w', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('UP');

      act(() => {
        keyDownHandler!({ key: 'a', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('LEFT');

      act(() => {
        keyDownHandler!({ key: 's', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('DOWN');

      act(() => {
        keyDownHandler!({ key: 'd', preventDefault: jest.fn() });
      });
      expect(mockChangeDirection).toHaveBeenCalledWith('RIGHT');
    });

    it('does not change direction when paused', async () => {
      let keyDownHandler: EventHandler | null = null;
      mockAddEventListener.mockImplementation((event: string, handler: EventHandler) => {
        if (event === 'keydown') {
          keyDownHandler = handler;
        }
      });

      (useGameReducer as jest.Mock).mockReturnValue({
        state: createMockState('PAUSED'),
        dispatch: jest.fn(),
        initGame: mockInitGame,
        moveSnake: mockMoveSnake,
        changeDirection: mockChangeDirection,
        pauseGame: mockPauseGame,
        resumeGame: mockResumeGame,
        resetGame: mockResetGame,
      });

      render(<GameArena />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(keyDownHandler).toBeTruthy();
      });

      // Reset mock to check if it's called after pause
      mockChangeDirection.mockClear();

      // Simulate arrow key press while paused
      act(() => {
        keyDownHandler!({ key: 'ArrowUp', preventDefault: jest.fn() });
      });

      // Should not change direction while paused
      expect(mockChangeDirection).not.toHaveBeenCalled();
    });
  });
});
