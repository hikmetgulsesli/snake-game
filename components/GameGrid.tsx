'use client';

import React from 'react';
import { Position } from '../types/game';

interface GameGridProps {
  /** Size of the grid (gridSize x gridSize) */
  gridSize: number;
  /** Size of each cell in pixels */
  cellSize: number;
  /** Array of snake body positions */
  snakeBody: Position[];
  /** Food position */
  food: Position;
  /** Whether to show grid lines */
  showGridLines?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * GameGrid Component
 * 
 * Renders a responsive game grid with:
 * - Snake head with neon glow effect
 * - Snake body segments with darker green
 * - Food with pulse animation
 * - Grid lines based on viewport
 * 
 * Grid cell sizes by breakpoint:
 * - Desktop (1024px+): 24px cells
 * - Tablet (768px-1023px): 22px cells  
 * - Mobile (<768px): 16-18px cells
 */
export function GameGrid({
  gridSize,
  cellSize,
  snakeBody,
  food,
  showGridLines = true,
  className = '',
}: GameGridProps) {
  const gridWidth = gridSize * cellSize;
  const gridHeight = gridSize * cellSize;

  // Calculate snake segment styles based on index (head vs body)
  const getSnakeSegmentStyle = (index: number, segment: Position) => {
    const isHead = index === 0;
    const baseOpacity = isHead ? 1 : Math.max(0.3, 1 - index * 0.15);
    
    return {
      left: segment.x * cellSize,
      top: segment.y * cellSize,
      width: cellSize - 2,
      height: cellSize - 2,
      opacity: baseOpacity,
    };
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#151515] border-2 border-[#2a2a2a] shadow-inner ${className}`}
      style={{
        width: gridWidth,
        height: gridHeight,
        boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.5)',
      }}
      data-testid="game-grid"
    >
      {/* Grid background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #80808012 1px, transparent 1px),
            linear-gradient(to bottom, #80808012 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize * 2}px ${cellSize * 2}px`,
        }}
      />

      {/* Grid lines */}
      {showGridLines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
          data-testid="grid-lines"
        />
      )}

      {/* Snake segments */}
      {snakeBody.map((segment, index) => {
        const isHead = index === 0;
        return (
          <div
            key={`${segment.x}-${segment.y}-${index}`}
            data-testid={isHead ? 'snake-head' : 'snake-body'}
            data-segment-index={index}
            className={`absolute ${isHead ? 'snake-head' : 'snake-body'}`}
            style={getSnakeSegmentStyle(index, segment)}
          />
        );
      })}

      {/* Food */}
      <div
        data-testid="food"
        className="absolute food"
        style={{
          left: food.x * cellSize + 2,
          top: food.y * cellSize + 2,
          width: cellSize - 6,
          height: cellSize - 6,
        }}
      />
    </div>
  );
}

export default GameGrid;
