'use client';

import React from 'react';
import { RetroButton } from './RetroButton';
import { HighScoresList } from './HighScoresList';
import { HighScoreEntry } from '../types/highScores';
import { Difficulty } from '../types/game';

interface MainMenuProps {
  /** Current difficulty selection */
  selectedDifficulty: Difficulty;
  /** Callback when difficulty changes */
  onDifficultyChange: (difficulty: Difficulty) => void;
  /** Callback when start game is clicked */
  onStartGame: () => void;
  /** High scores to display */
  highScores: HighScoreEntry[];
  /** Whether high scores are loaded */
  isLoaded: boolean;
  /** Optional className */
  className?: string;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HARD', label: 'Hard' },
];

/**
 * MainMenu Component
 * 
 * The main menu screen featuring:
 * - Game title in pixel/retro style
 * - Difficulty selector (Easy/Normal/Hard)
 * - High score table (top 10)
 * - How to play instructions
 * - Start game button
 * 
 * Centered layout with max-width 600px per design spec.
 */
export function MainMenu({
  selectedDifficulty,
  onDifficultyChange,
  onStartGame,
  highScores,
  isLoaded,
  className = '',
}: MainMenuProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4 ${className}`}
      data-testid="main-menu"
    >
      {/* Main Menu Container - Max 600px centered */}
      <div className="w-full max-w-[600px] flex flex-col items-center gap-6">
        
        {/* Game Title - Pixel Art Style */}
        <div className="text-center mb-2">
          <h1 
            className="text-5xl md:text-6xl font-bold tracking-tight mb-2"
            data-testid="game-title"
          >
            <span className="text-[#39ff14] drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]">
              SNAKE
            </span>
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-[0.3em]">
            Retro Arcade Game
          </p>
        </div>

        {/* Score Summary Cards */}
        <div className="flex flex-wrap gap-4 w-full justify-center">
          <div className="flex min-w-[120px] flex-1 max-w-[200px] flex-col gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4 items-center text-center shadow-lg">
            <p className="text-[#39ff14] text-3xl font-bold">0</p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Current Score</p>
            </div>
          </div>
          
          <div className="flex min-w-[120px] flex-1 max-w-[200px] flex-col gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4 items-center text-center shadow-lg">
            <p className="text-[#39ff14] text-3xl font-bold">
              {highScores.length > 0 ? highScores[0].score : 0}
            </p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">High Score</p>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="w-full flex justify-center">
          <div 
            className="flex h-12 w-full max-w-md items-center justify-center rounded-full bg-[#1e1e1e] p-1 border border-[#2a2a2a]"
            data-testid="difficulty-selector"
          >
            {DIFFICULTIES.map((diff) => (
              <label
                key={diff.value}
                className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-4 transition-all duration-200 text-sm font-bold leading-normal uppercase tracking-wider ${
                  selectedDifficulty === diff.value
                    ? 'bg-[#39ff14] text-[#0a0a0a] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={diff.value}
                  checked={selectedDifficulty === diff.value}
                  onChange={() => onDifficultyChange(diff.value)}
                  className="sr-only"
                  data-testid={`difficulty-${diff.value.toLowerCase()}`}
                />
                <span>{diff.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <RetroButton
          onClick={onStartGame}
          variant="primary"
          size="lg"
          className="w-full max-w-xs shadow-[0_0_15px_rgba(57,255,20,0.4)]"
          data-testid="start-game-button"
        >
          Start Game
        </RetroButton>

        {/* High Scores Section */}
        <div className="w-full mt-4">
          <h2 className="text-sm font-bold text-gray-400 mb-3 text-center uppercase tracking-wider">
            High Scores
          </h2>
          <div className="bg-[#151515] rounded-xl border border-[#2a2a2a] p-4">
            {!isLoaded ? (
              <div className="text-center py-6 text-gray-500">Loading...</div>
            ) : (
              <HighScoresList scores={highScores} maxScores={10} />
            )}
          </div>
        </div>

        {/* How to Play Section */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-row items-center justify-center gap-3 bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] py-4 px-4 text-center">
            <div className="rounded-full bg-[#39ff14]/20 p-2.5 text-[#39ff14] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </div>
            <div className="flex flex-col items-start sm:items-center">
              <p className="text-gray-300 text-sm font-medium">Arrow Keys / WASD</p>
              <p className="text-gray-500 text-xs">to move the snake</p>
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-center gap-3 bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] py-4 px-4 text-center">
            <div className="rounded-full bg-[#39ff14]/20 p-2.5 text-[#39ff14] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex flex-col items-start sm:items-center">
              <p className="text-gray-300 text-sm font-medium">Space Bar</p>
              <p className="text-gray-500 text-xs">to pause game</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
