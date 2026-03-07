'use client';

import React from 'react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_MULTIPLIERS } from '../constants/game';

interface HUDProps {
  /** Current score */
  score: number;
  /** Current speed in ms (lower = faster) */
  speed: number;
  /** Initial speed for calculating speed indicator */
  initialSpeed: number;
  /** Current difficulty */
  difficulty: Difficulty;
  /** High score */
  highScore?: number;
  /** Number of foods eaten */
  foodsEaten?: number;
  /** Optional className */
  className?: string;
}

/**
 * Calculate speed indicator (multiplier relative to initial speed)
 */
function calculateSpeedIndicator(currentSpeed: number, initialSpeed: number): string {
  if (initialSpeed <= 0) return '1.0x';
  const ratio = initialSpeed / currentSpeed;
  return `${ratio.toFixed(1)}x`;
}

/**
 * Format speed for display (convert ms to readable format)
 */
function formatSpeed(speedMs: number): string {
  // Speed in moves per second (1000ms / speedMs)
  const movesPerSecond = Math.round(1000 / speedMs);
  return `${movesPerSecond}/s`;
}

/**
 * HUD Component
 * 
 * Displays game statistics:
 * - Current score with difficulty multiplier indicator
 * - Speed indicator showing current game speed
 * - High score comparison
 * - Foods eaten count
 */
export function HUD({
  score,
  speed,
  initialSpeed,
  difficulty,
  highScore = 0,
  foodsEaten = 0,
  className = '',
}: HUDProps) {
  const speedIndicator = calculateSpeedIndicator(speed, initialSpeed);
  const speedDisplay = formatSpeed(speed);
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const isNewHighScore = score > 0 && score > highScore;

  return (
    <div className={`flex flex-wrap gap-4 ${className}`} data-testid="game-hud">
      {/* Score Card */}
      <div className="flex min-w-[140px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4 items-center text-center shadow-lg">
        <p 
          className="text-[#39ff14] tracking-light text-3xl font-bold leading-tight"
          data-testid="hud-score"
        >
          {score}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Score</p>
          <span 
            className="text-xs px-2 py-0.5 rounded-full bg-[#39ff14]/20 text-[#39ff14]"
            data-testid="score-multiplier"
          >
            {multiplier}x
          </span>
        </div>
      </div>

      {/* Speed Card */}
      <div className="flex min-w-[140px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-4 items-center text-center shadow-lg">
        <p 
          className="text-white tracking-light text-3xl font-bold leading-tight"
          data-testid="hud-speed"
        >
          {speedDisplay}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Speed</p>
          <span 
            className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400"
            data-testid="speed-indicator"
          >
            {speedIndicator}
          </span>
        </div>
      </div>

      {/* High Score Card */}
      <div className={`flex min-w-[140px] flex-1 basis-[fit-content] flex-col gap-2 rounded-xl border p-4 items-center text-center shadow-lg ${
        isNewHighScore 
          ? 'bg-[#39ff14]/10 border-[#39ff14]' 
          : 'bg-[#1e1e1e] border-[#2a2a2a]'
      }`}>
        <p 
          className={`tracking-light text-3xl font-bold leading-tight ${
            isNewHighScore ? 'text-[#39ff14]' : 'text-gray-300'
          }`}
          data-testid="hud-high-score"
        >
          {Math.max(highScore, score)}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">High Score</p>
          {isNewHighScore && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#39ff14] text-black font-bold">
              NEW!
            </span>
          )}
        </div>
      </div>

      {/* Foods Eaten Card (optional, smaller) */}
      {foodsEaten > 0 && (
        <div className="flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-3 items-center text-center shadow-lg">
          <p 
            className="text-red-400 tracking-light text-2xl font-bold leading-tight"
            data-testid="hud-foods"
          >
            {foodsEaten}
          </p>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Eaten</p>
        </div>
      )}
    </div>
  );
}

export default HUD;
