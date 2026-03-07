'use client';

import React, { useEffect, useCallback, useState, useSyncExternalStore } from 'react';
import { GameGrid } from '../components/GameGrid';
import { useGameReducer } from '../hooks/useGameReducer';
import { Direction, Difficulty } from '../types/game';
import { DIRECTION_KEYS } from '../constants/game';

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
  const [highScore, setHighScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const cellSize = useCellSize();

  // Load high score from localStorage on mount - using setTimeout to defer setState
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('snake_high_score');
      const score = saved ? parseInt(saved, 10) : 0;
      setHighScore(score);
      setIsLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save high score when game ends - using setTimeout to defer setState
  useEffect(() => {
    if (!isLoaded) return;
    if (state.status === 'GAME_OVER' && state.score > highScore) {
      localStorage.setItem('snake_high_score', state.score.toString());
      const timer = setTimeout(() => {
        setHighScore(state.score);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, state.status, state.score, highScore]);

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

  const difficulties: Difficulty[] = ['EASY', 'NORMAL', 'HARD'];

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#39ff14] text-xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-[#39ff14]">🎮</span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">SNAKE</h1>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#39ff14] text-[#0a0a0a] font-bold">
            Score: {state.score}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] font-bold">
            High: {Math.max(highScore, state.score)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Difficulty Selector */}
        <div className="flex h-12 w-full max-w-md items-center justify-center rounded-full bg-[#1e1e1e] p-1 border border-[#2a2a2a] mb-6">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => state.status === 'MENU' && initGame(diff)}
              disabled={state.status !== 'MENU'}
              className={`flex h-full grow items-center justify-center overflow-hidden rounded-full px-4 text-sm font-bold uppercase transition-all duration-200 ${
                state.difficulty === diff
                  ? 'bg-[#39ff14] text-[#0a0a0a] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                  : 'text-gray-400 hover:text-white'
              } ${state.status !== 'MENU' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Game Grid Container */}
        <div className="relative">
          <GameGrid
            gridSize={state.config.gridSize}
            cellSize={cellSize}
            snakeBody={state.snake.body}
            food={state.food}
            showGridLines={true}
          />

          {/* Menu Overlay */}
          {state.status === 'MENU' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl">
              <h2 className="text-4xl font-bold mb-2 text-[#39ff14]">SNAKE</h2>
              <p className="text-gray-400 mb-6">Select difficulty and press button to start</p>
              <button
                onClick={() => initGame(state.difficulty)}
                className="px-8 py-3 bg-[#39ff14] text-[#0a0a0a] rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-shadow"
              >
                START GAME
              </button>
            </div>
          )}

          {/* Pause Overlay */}
          {state.status === 'PAUSED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl">
              <h2 className="text-3xl font-bold mb-4">PAUSED</h2>
              <div className="flex gap-4">
                <button
                  onClick={resumeGame}
                  className="px-6 py-2 bg-[#39ff14] text-[#0a0a0a] rounded-full font-bold hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-shadow"
                >
                  RESUME
                </button>
                <button
                  onClick={() => { resetGame(); initGame(state.difficulty); }}
                  className="px-6 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full font-bold hover:border-[#39ff14] transition-colors"
                >
                  RESTART
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {state.status === 'GAME_OVER' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-xl">
              <h2 className="text-4xl font-bold mb-2 text-red-500">GAME OVER</h2>
              <p className="text-xl mb-2">Score: {state.score}</p>
              {state.score >= highScore && state.score > 0 && (
                <p className="text-[#39ff14] mb-4">🏆 New High Score!</p>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => initGame(state.difficulty)}
                  className="px-6 py-2 bg-[#39ff14] text-[#0a0a0a] rounded-full font-bold hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-shadow"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full font-bold hover:border-[#39ff14] transition-colors"
                >
                  MENU
                </button>
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
