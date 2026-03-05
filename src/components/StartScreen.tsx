import { useState, useEffect } from 'react';
import type { Difficulty } from '../types/game';
import { DIFFICULTY_SPEEDS } from '../types/game';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  highScore: number;
}

export function StartScreen({ onStart, highScore }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const difficulties: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'expert', label: 'Expert' },
  ];

  const getSpeedLabel = (difficulty: Difficulty): string => {
    const speed = DIFFICULTY_SPEEDS[difficulty];
    return `${speed}ms`;
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-[500px] transition-all duration-300 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {/* Logo */}
      <h1 
        className="text-6xl font-bold mb-2 tracking-wider"
        style={{ 
          fontFamily: 'var(--stitch-font-heading)',
          color: 'var(--stitch-accent)',
          textShadow: '0 0 40px var(--stitch-accent-glow)',
        }}
      >
        SNAKE
      </h1>

      {/* High Score Display */}
      <div className="mb-10 text-center">
        <div 
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: 'var(--stitch-text-secondary)' }}
        >
          High Score
        </div>
        <div 
          className="text-4xl font-bold"
          style={{ 
            fontFamily: 'var(--stitch-font-heading)',
            color: 'var(--stitch-text-primary)',
          }}
        >
          {highScore}
        </div>
      </div>

      {/* Difficulty Selector */}
      <div 
        className="flex gap-3 mb-8 p-2 rounded-xl"
        style={{ 
          backgroundColor: 'var(--stitch-bg-card)',
          border: '1px solid var(--stitch-border)',
        }}
      >
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => setSelectedDifficulty(diff.value)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              selectedDifficulty === diff.value 
                ? '' 
                : 'hover:text-white'
            }`}
            style={{
              backgroundColor: selectedDifficulty === diff.value 
                ? 'var(--stitch-accent)' 
                : 'transparent',
              color: selectedDifficulty === diff.value 
                ? 'var(--stitch-bg-primary)' 
                : 'var(--stitch-text-secondary)',
              boxShadow: selectedDifficulty === diff.value 
                ? '0 4px 12px var(--stitch-accent-glow)' 
                : 'none',
            }}
          >
            {diff.label}
          </button>
        ))}
      </div>

      {/* Speed indicator */}
      <div 
        className="text-sm mb-10"
        style={{ color: 'var(--stitch-text-muted)' }}
      >
        Speed: {getSpeedLabel(selectedDifficulty)}
      </div>

      {/* Start Button */}
      <button
        onClick={() => onStart(selectedDifficulty)}
        className="px-12 py-4 rounded-xl font-bold text-lg transition-all duration-200 cursor-pointer hover:scale-105"
        style={{
          backgroundColor: 'var(--stitch-accent)',
          color: 'var(--stitch-bg-primary)',
          fontFamily: 'var(--stitch-font-body)',
          boxShadow: '0 4px 16px var(--stitch-accent-glow)',
        }}
      >
        Start Game
      </button>

      {/* Controls hint */}
      <div 
        className="mt-10 text-center text-sm"
        style={{ color: 'var(--stitch-text-secondary)' }}
      >
        <p className="mb-2">
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>↑</span>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>↓</span>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>←</span>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>→</span>
          {' '}or{' '}
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>W</span>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>A</span>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>S</span>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>D</span>
          {' '}to move
        </p>
        <p>
          <span className="px-2 py-1 rounded text-xs mx-1" style={{ backgroundColor: 'var(--stitch-bg-card)', border: '1px solid var(--stitch-border)' }}>Space</span>
          {' '}to pause
        </p>
      </div>
    </div>
  );
}
