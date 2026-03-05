import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import { 
  StartScreen, 
  GameOverScreen, 
  PauseScreen, 
  ScoreBoard, 
  GameBoard 
} from './components';
import { useAudio } from './hooks/useAudio';
import type { Position, Direction, Difficulty, GameScreen } from './types/game';
import { DIFFICULTY_SPEEDS, GRID_SIZE } from './types/game';

function App() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [screen, setScreen] = useState<GameScreen>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-game-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<number | null>(null);

  // Use centralized audio hook
  const { playEatSound, playGameOverSound } = useAudio();

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (screen !== 'playing') return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall and self collision
      const isWallCollision = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
      const isSelfCollision = newSnake.some(segment => segment.x === head.x && segment.y === head.y);

      if (isWallCollision || isSelfCollision) {
        setScreen('gameOver');
        playGameOverSound();
        const newScore = score;
        if (newScore > highScore) {
          setIsNewHighScore(true);
          localStorage.setItem('snake-game-highscore', newScore.toString());
          setHighScore(newScore);
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        playEatSound();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, screen, generateFood, playEatSound, playGameOverSound, score, highScore]);

  useEffect(() => {
    if (screen !== 'playing') return;
    
    const speed = DIFFICULTY_SPEEDS[difficulty] - Math.min(score * 0.5, 40);
    gameLoopRef.current = window.setInterval(moveSnake, Math.max(speed, 40));
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [difficulty, score, moveSnake, screen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen === 'start') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (screen === 'playing') {
          setScreen('paused');
        } else if (screen === 'paused') {
          setScreen('playing');
        }
        return;
      }

      if (screen !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || screen !== 'playing') return;

    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && directionRef.current !== 'LEFT') setDirection('RIGHT');
      else if (dx < 0 && directionRef.current !== 'RIGHT') setDirection('LEFT');
    } else {
      if (dy > 0 && directionRef.current !== 'UP') setDirection('DOWN');
      else if (dy < 0 && directionRef.current !== 'DOWN') setDirection('UP');
    }
    touchStart.current = null;
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    resetGame();
    setScreen('playing');
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setScore(0);
    setIsNewHighScore(false);
  };

  const handleRestart = () => {
    resetGame();
    setScreen('playing');
  };

  const handleBackToMenu = () => {
    resetGame();
    // Reload high score in case it was updated
    const saved = localStorage.getItem('snake-game-highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
    setScreen('start');
  };

  const handleResume = () => {
    setScreen('playing');
  };

  const handleQuitToMenu = () => {
    resetGame();
    // Reload high score
    const saved = localStorage.getItem('snake-game-highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
    setScreen('start');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-6 px-4"
      style={{ backgroundColor: 'var(--stitch-bg-primary)' }}
    >
      {screen === 'start' && (
        <StartScreen 
          onStart={startGame} 
          highScore={highScore}
        />
      )}

      {(screen === 'playing' || screen === 'paused') && (
        <div className="w-full max-w-lg animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 
              className="text-5xl font-bold mb-4 tracking-wider"
              style={{ 
                fontFamily: 'var(--stitch-font-heading)',
                color: 'var(--stitch-accent)',
                textShadow: '0 0 40px var(--stitch-accent-glow)',
              }}
            >
              SNAKE
            </h1>
            <ScoreBoard score={score} highScore={highScore} />
          </div>

          {/* Game Board */}
          <GameBoard 
            snake={snake} 
            food={food}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />

          {/* Controls hint */}
          <div 
            className="mt-6 text-center text-sm"
            style={{ color: 'var(--stitch-text-secondary)' }}
          >
            <p>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                ↑
              </span>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                ↓
              </span>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                ←
              </span>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                →
              </span>
              {' '}or{' '}
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                W
              </span>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                A
              </span>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                S
              </span>
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                D
              </span>
              {' '}to move ·{' '}
              <span 
                className="px-2 py-1 rounded text-xs mx-1"
                style={{ 
                  backgroundColor: 'var(--stitch-bg-card)', 
                  border: '1px solid var(--stitch-border)',
                }}
              >
                Space
              </span>
              {' '}to pause
            </p>
          </div>

          {/* Pause Screen */}
          {screen === 'paused' && (
            <PauseScreen 
              score={score}
              onResume={handleResume}
              onQuitToMenu={handleQuitToMenu}
            />
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {screen === 'gameOver' && (
        <GameOverScreen 
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
}

export default App;
