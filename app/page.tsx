'use client';

import React, { useEffect, useCallback, useState, useSyncExternalStore } from 'react';
import { GameGrid } from '../components/GameGrid';
import { HUD } from '../components/HUD';
import { MainMenu } from '../components/MainMenu';
import { HighScoreSummary } from '../components/HighScoresList';
import { RetroButton } from '../components/RetroButton';
import { useGameReducer } from '../hooks/useGameReducer';
import { useHighScores } from '../hooks/useHighScores';
import { Direction, Difficulty } from '../types/game';
import { DIRECTION_KEYS, DIFFICULTY_SETTINGS } from '../constants/game';

// Hook to get cell size based on viewport
function useCellSize() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => {
      const width = window.innerWidth;
      if (width >= 1024) return 24;
      if (width >= 768) return 22;
      return 16;
    },
    () => 20 // Server fallback
  );
}

export default function Home() {
  const { state, initGame, moveSnake, changeDirection, pauseGame, resumeGame, resetGame } = useGameReducer('NORMAL');
  const { scores, isLoaded: scoresLoaded, addScore } = useHighScores();
  const [isMounted, setIsMounted] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [newScoreRank, setNewScoreRank] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('NORMAL');
  const cellSize = useCellSize();

  // Set mounted state for hydration safety
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle game over - check and save high score
  useEffect(() => {
    if (!scoresLoaded) return;
    if (state.status === 'GAME_OVER' && state.score > 0) {
      const result = addScore(state.score, state.difficulty);
      if (result.qualifies) {
        const timer = setTimeout(() => {
          setIsNewHighScore(true);
          setNewScoreRank(result.rank);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [scoresLoaded, state.status, state.score, state.difficulty, addScore]);

  // Reset new high score flag when starting new game
  useEffect(() => {
    if (state.status === 'PLAYING' || state.status === 'MENU') {
      const timer = setTimeout(() => {
        setIsNewHighScore(false);
        setNewScoreRank(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  // Game loop
  useEffect(() => {
    if (state.status !== 'PLAYING') return;

    const interval = setInterval(() => {
      moveSnake();
    }, state.speed);

    return () => clearInterval(interval);
  }, [state.status, state.speed, moveSnake]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    // Pause/Resume with space
    if (e.key === ' ') {
      if (state.status === 'PLAYING') {
        pauseGame();
      } else if (state.status === 'PAUSED') {
        resumeGame();
      }
      return;
    }

    // Direction controls
    const direction = DIRECTION_KEYS[e.key];
    if (direction && state.status === 'PLAYING') {
      changeDirection(direction as Direction);
    }
  }, [state.status, changeDirection, pauseGame, resumeGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle start game from menu
  const handleStartGame = useCallback(() => {
    initGame(selectedDifficulty);
  }, [initGame, selectedDifficulty]);

  // Handle difficulty change from menu
  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  }, []);

  const initialSpeed = DIFFICULTY_SETTINGS[state.difficulty].initialSpeed;
  const highestScore = scores.length > 0 ? scores[0].score : 0;

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#39ff14] text-xl font-bold">Loading...</div>
      </div>
    );
  }

  // Render Main Menu
  if (state.status === 'MENU') {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[#39ff14]">SNAKE</span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">GAME</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">v1.0</span>
          </div>
        </header>

        {/* Main Menu */}
        <MainMenu
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
          onStartGame={handleStartGame}
          highScores={scores}
          isLoaded={scoresLoaded}
        />
      </div>
    );
  }

  // Render Game Screen (PLAYING, PAUSED, GAME_OVER)
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-[#39ff14]">SNAKE</span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">GAME</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Difficulty:</span>
          <span className="px-3 py-1 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-sm font-bold text-[#39ff14]">
            {state.difficulty}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        {/* HUD - Score, Speed, High Score */}
        <HUD
          score={state.score}
          speed={state.speed}
          initialSpeed={initialSpeed}
          difficulty={state.difficulty}
          highScore={highestScore}
          foodsEaten={state.foodsEaten}
          className="w-full mb-6"
        />

        {/* Game Grid Container */}
        <div className="relative">
          <GameGrid
            gridSize={state.config.gridSize}
            cellSize={cellSize}
            snakeBody={state.snake.body}
            food={state.food}
            showGridLines={true}
          />

          {/* Pause Overlay */}
          {state.status === 'PAUSED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl">
              <h2 className="text-3xl font-bold mb-4 text-white">PAUSED</h2>
              <div className="flex gap-4">
                <RetroButton
                  onClick={resumeGame}
                  variant="primary"
                  data-testid="resume-button"
                >
                  RESUME
                </RetroButton>
                <RetroButton
                  onClick={() => { resetGame(); }}
                  variant="secondary"
                  data-testid="restart-button"
                >
                  RESTART
                </RetroButton>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {state.status === 'GAME_OVER' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-xl overflow-y-auto">
              <h2 className="text-4xl font-bold mb-2 text-red-500">GAME OVER</h2>
              <p className="text-xl mb-2 text-white">Score: {state.score}</p>
              {isNewHighScore && (
                <p className="text-[#39ff14] mb-4 font-bold animate-pulse">
                  🏆 New High Score! #{newScoreRank}
                </p>
              )}
              <div className="flex gap-4 mb-6">
                <RetroButton
                  onClick={() => initGame(state.difficulty)}
                  variant="primary"
                  data-testid="play-again-button"
                >
                  PLAY AGAIN
                </RetroButton>
                <RetroButton
                  onClick={resetGame}
                  variant="secondary"
                  data-testid="menu-button"
                >
                  MENU
                </RetroButton>
              </div>

              {/* High Scores Summary */}
              <div className="w-full max-w-xs px-4">
                <HighScoreSummary scores={scores} />
              </div>
            </div>
          )}
        </div>

        {/* Controls Info */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 bg-[#1e1e1e] rounded-xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-300">W</kbd>
              <kbd className="px-2 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-300">A</kbd>
              <kbd className="px-2 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-300">S</kbd>
              <kbd className="px-2 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-300">D</kbd>
            </div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex gap-1">
              <span className="text-gray-400 bg-[#2a2a2a] border border-gray-600 rounded p-0.5 text-sm">↑</span>
              <span className="text-gray-400 bg-[#2a2a2a] border border-gray-600 rounded p-0.5 text-sm">↓</span>
              <span className="text-gray-400 bg-[#2a2a2a] border border-gray-600 rounded p-0.5 text-sm">←</span>
              <span className="text-gray-400 bg-[#2a2a2a] border border-gray-600 rounded p-0.5 text-sm">→</span>
            </div>
          </div>
          <span className="text-gray-400 text-sm">to move</span>
          <span className="hidden sm:block text-gray-600">|</span>
          <div className="flex items-center gap-2">
            <kbd className="px-3 py-1 bg-[#2a2a2a] border border-gray-600 rounded text-xs text-gray-300">SPACE</kbd>
            <span className="text-gray-400 text-sm">to pause</span>
          </div>
        </div>
      </main>
    </div>
  );
}
