import { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Difficulty = 'easy' | 'medium' | 'expert';

const GRID_SIZE = 20;
const CELL_SIZE = 20;

const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 150,
  medium: 100,
  expert: 60,
};

function App() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameStarted, setGameStarted] = useState(false);
  
  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

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

  const playEatSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  const playGameOverSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || paused || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        playGameOverSound();
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        playGameOverSound();
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        playEatSound();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, paused, gameStarted, generateFood, playEatSound, playGameOverSound, highScore]);

  useEffect(() => {
    const speed = DIFFICULTY_SPEEDS[difficulty] - Math.min(score * 0.5, 40);
    gameLoopRef.current = window.setInterval(moveSnake, Math.max(speed, 40));
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [difficulty, score, moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setPaused(p => !p);
        return;
      }

      if (gameOver || paused) return;

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
  }, [gameStarted, gameOver, paused]);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || !gameStarted || gameOver || paused) return;

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

  const startGame = () => {
    setGameStarted(true);
    setPaused(false);
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setGameOver(false);
    setPaused(false);
    setScore(0);
    setGameStarted(true);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6">
        <h1 className="text-3xl font-bold text-center mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Snake Game
        </h1>
        
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="text-slate-300">
            Score: <span className="text-green-400 font-bold text-lg">{score}</span>
          </div>
          <div className="text-slate-300">
            High Score: <span className="text-yellow-400 font-bold text-lg">{highScore}</span>
          </div>
        </div>

        {!gameStarted ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
              <div className="flex justify-center gap-2">
                {(['easy', 'medium', 'expert'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      difficulty === diff
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              Start Game
            </button>
            
            <div className="mt-6 text-slate-400 text-sm">
              <p className="mb-1">Use Arrow keys or WASD to move</p>
              <p className="mb-1">Swipe on mobile</p>
              <p>Press Space to pause</p>
            </div>
          </div>
        ) : (
          <>
            <div 
              className="relative mx-auto border-4 border-slate-700 rounded-lg overflow-hidden bg-slate-900"
              style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Grid */}
              {Array.from({ length: GRID_SIZE }).map((_, y) => (
                Array.from({ length: GRID_SIZE }).map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`absolute ${(x + y) % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/50'}`}
                    style={{
                      left: x * CELL_SIZE,
                      top: y * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                    }}
                  />
                ))
              ))}

              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className={`absolute rounded-sm ${index === 0 ? 'bg-green-400' : 'bg-green-500'}`}
                  style={{
                    left: segment.x * CELL_SIZE + 1,
                    top: segment.y * CELL_SIZE + 1,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    boxShadow: index === 0 ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
                  }}
                />
              ))}

              {/* Food */}
              <div
                className="absolute bg-red-500 rounded-full animate-pulse"
                style={{
                  left: food.x * CELL_SIZE + 2,
                  top: food.y * CELL_SIZE + 2,
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                }}
              />

              {/* Pause overlay */}
              {paused && !gameOver && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                  <div className="text-2xl font-bold text-white">PAUSED</div>
                </div>
              )}

              {/* Game Over overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">GAME OVER</div>
                  <div className="text-xl text-white mb-4">Score: {score}</div>
                  <button
                    onClick={resetGame}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-xs text-slate-500">
                Difficulty: <span className="text-slate-300 capitalize">{difficulty}</span>
              </div>
              <button
                onClick={() => setPaused(p => !p)}
                className="px-4 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all"
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
