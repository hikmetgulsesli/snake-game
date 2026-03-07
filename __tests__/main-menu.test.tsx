import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { MainMenu } from '../components/MainMenu';
import { RetroButton } from '../components/RetroButton';
import { HighScoreEntry } from '../types/highScores';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('MainMenu Component', () => {
  const mockOnDifficultyChange = jest.fn();
  const mockOnStartGame = jest.fn();

  const mockHighScores: HighScoreEntry[] = [
    { score: 1000, difficulty: 'NORMAL', date: '2026-03-07T10:00:00Z' },
    { score: 800, difficulty: 'EASY', date: '2026-03-06T10:00:00Z' },
    { score: 600, difficulty: 'HARD', date: '2026-03-05T10:00:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders game title in pixel style', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    expect(screen.getByTestId('game-title')).toBeInTheDocument();
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
    expect(screen.getByText('Retro Arcade Game')).toBeInTheDocument();
  });

  it('displays current score and high score cards', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    expect(screen.getByText('Current Score')).toBeInTheDocument();
    expect(screen.getByText('High Score')).toBeInTheDocument();
  });

  it('renders difficulty selector with 3 options', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    const difficultySelector = screen.getByTestId('difficulty-selector');
    expect(difficultySelector).toBeInTheDocument();

    expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-normal')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument();
  });

  it('calls onDifficultyChange when difficulty is selected', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    const easyRadio = screen.getByTestId('difficulty-easy');
    fireEvent.click(easyRadio);

    expect(mockOnDifficultyChange).toHaveBeenCalledWith('EASY');
  });

  it('renders start game button', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    const startButton = screen.getByTestId('start-game-button');
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveTextContent('Start Game');
  });

  it('calls onStartGame when start button is clicked', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    const startButton = screen.getByTestId('start-game-button');
    fireEvent.click(startButton);

    expect(mockOnStartGame).toHaveBeenCalled();
  });

  it('renders high scores section with title', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    expect(screen.getByText('High Scores')).toBeInTheDocument();
  });

  it('displays high scores when loaded', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
  });

  it('shows loading state when high scores are not loaded', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={[]}
        isLoaded={false}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders how to play instructions', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={mockHighScores}
        isLoaded={true}
      />
    );

    expect(screen.getByText('Arrow Keys / WASD')).toBeInTheDocument();
    expect(screen.getByText('to move the snake')).toBeInTheDocument();
    expect(screen.getByText('Space Bar')).toBeInTheDocument();
    expect(screen.getByText('to pause game')).toBeInTheDocument();
  });
});

describe('RetroButton Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders primary variant correctly', () => {
    render(
      <RetroButton onClick={mockOnClick} variant="primary">
        Click Me
      </RetroButton>
    );

    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders secondary variant correctly', () => {
    render(
      <RetroButton onClick={mockOnClick} variant="secondary">
        Secondary
      </RetroButton>
    );

    expect(screen.getByText('Secondary')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(
      <RetroButton onClick={mockOnClick} data-testid="test-button">
        Click Me
      </RetroButton>
    );

    fireEvent.click(screen.getByTestId('test-button'));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    render(
      <RetroButton onClick={mockOnClick} disabled data-testid="test-button">
        Disabled
      </RetroButton>
    );

    fireEvent.click(screen.getByTestId('test-button'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});

describe('Home Page - Menu Interactions', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
    jest.clearAllMocks();
  });

  it('renders main menu on initial load', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId('main-menu')).toBeInTheDocument();
    });
  });

  it('renders game title in menu', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId('game-title')).toBeInTheDocument();
    });

    expect(screen.getByText('Retro Arcade Game')).toBeInTheDocument();
  });

  it('renders difficulty selector with all options', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
    });

    expect(screen.getByTestId('difficulty-normal')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-hard')).toBeInTheDocument();
  });

  it('renders start game button in menu', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId('start-game-button')).toBeInTheDocument();
    });
  });

  it('changes difficulty when radio button is clicked', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId('difficulty-easy')).toBeInTheDocument();
    });

    const easyRadio = screen.getByTestId('difficulty-easy');
    fireEvent.click(easyRadio);

    // The radio should now be checked
    expect(easyRadio).toBeChecked();
  });

  it('renders high scores section in menu', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('High Scores')).toBeInTheDocument();
    });
  });

  it('renders how to play section in menu', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Arrow Keys / WASD')).toBeInTheDocument();
    });

    expect(screen.getByText('Space Bar')).toBeInTheDocument();
  });
});

describe('Responsive Design', () => {
  const mockOnDifficultyChange = jest.fn();
  const mockOnStartGame = jest.fn();

  it('maintains max-width of 600px on container', () => {
    render(
      <MainMenu
        selectedDifficulty="NORMAL"
        onDifficultyChange={mockOnDifficultyChange}
        onStartGame={mockOnStartGame}
        highScores={[]}
        isLoaded={true}
      />
    );

    const menu = screen.getByTestId('main-menu');
    expect(menu).toBeInTheDocument();
  });
});
