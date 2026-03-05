import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import { Volume2, VolumeX } from 'lucide-react';
import {
  StartScreen,
  GameOverScreen,
  PauseScreen,
  ScoreBoard,
  GameBoard
} from './components';
import { useGameControls, useAudio } from './hooks';
import type { Position, Direction, Difficulty, GameScreen } from './types/game';
import { DIFFICULTY_SPEEDS } from './types/game';
import {
  generateFood,
  getNextHead,
  isOutOfBounds,
  isSelfCollision,
  isFoodCollision,
} from './engine/gameEngine';

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

  const {
    isSupported: isAudioSupported,
    playEatSound,
    playGameOverSound,
    isMuted,
    volume,
    toggleMute,
    setVolume,
    init: initAudio,
  } = useAudio();

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Use the game controls hook for input handling
  const { touchHandlers } = useGameControls({
    gameStarted: screen !== 'start',
    gameOver: screen === 'gameOver',
    paused: screen === 'paused',
    currentDirection: direction,
    onDirectionChange: setDirection,
    onPauseToggle: () => {
      if (screen === 'playing') {
        setScreen('paused');
      } else if (screen === 'paused') {
        setScreen('playing');
      }
    },
  });

  const moveSnake = useCallback(() => {
    if (screen !== 'playing') return;

    setSnake(currentSnake => {
      const head = currentSnake[0];
      const newHead = getNextHead(head, directionRef.current);

      // Check wall collision
      if (isOutOfBounds(newHead)) {
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

      // Check self collision (check against body only, not head)
      if (isSelfCollision(newHead, currentSnake)) {
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

      const newSnake = [newHead, ...currentSnake];

      // Check food collision
      if (isFoodCollision(newHead, food)) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        playEatSound();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, screen, playEatSound, playGameOverSound, score, highScore]);

  useEffect(() => {
    if (screen !== 'playing') return;

    const speed = DIFFICULTY_SPEEDS[difficulty] - Math.min(score * 0.5, 40);
    gameLoopRef.current = window.setInterval(moveSnake, Math.max(speed, 40));
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [difficulty, score, moveSnake, screen]);

  const startGame = (selectedDifficulty: Difficulty) => {
    initAudio(); // Initialize audio on game start
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
      {/* Audio Controls - Top Right */}
      {isAudioSupported && (
        <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            title="Volume"
          />
        </div>
      )}

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
            onTouchStart={touchHandlers.onTouchStart}
            onTouchEnd={touchHandlers.onTouchEnd}
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
