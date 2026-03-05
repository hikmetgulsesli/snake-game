import { useEffect, useState } from 'react';

interface PauseScreenProps {
  score: number;
  onResume: () => void;
  onQuitToMenu: () => void;
}

export function PauseScreen({ score, onResume, onQuitToMenu }: PauseScreenProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: 'rgba(15, 15, 18, 0.85)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div 
        className={`p-12 rounded-2xl text-center min-w-[320px] transition-all duration-300 ${
          animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          backgroundColor: 'var(--stitch-bg-card)',
          border: '1px solid var(--stitch-border)',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Pause Icon */}
        <div 
          className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center border-[3px]"
          style={{
            borderColor: 'var(--stitch-warning)',
          }}
        >
          <div className="flex gap-1">
            <div 
              className="w-1.5 h-6 rounded-sm"
              style={{ backgroundColor: 'var(--stitch-warning)' }}
            />
            <div 
              className="w-1.5 h-6 rounded-sm"
              style={{ backgroundColor: 'var(--stitch-warning)' }}
            />
          </div>
        </div>

        {/* Title */}
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ 
            fontFamily: 'var(--stitch-font-heading)',
            color: 'var(--stitch-warning)',
          }}
        >
          PAUSED
        </h2>
        <p 
          className="mb-8"
          style={{ color: 'var(--stitch-text-secondary)' }}
        >
          Game is paused
        </p>

        {/* Current Score */}
        <div 
          className="py-5 px-10 rounded-xl mb-8"
          style={{
            backgroundColor: 'var(--stitch-bg-primary)',
          }}
        >
          <div 
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: 'var(--stitch-text-secondary)' }}
          >
            Current Score
          </div>
          <div 
            className="text-4xl font-bold"
            style={{ 
              fontFamily: 'var(--stitch-font-heading)',
              color: 'var(--stitch-text-primary)',
            }}
          >
            {score}
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={onResume}
          className="w-full py-4 rounded-xl font-semibold text-base mb-3 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--stitch-accent)',
            color: 'var(--stitch-bg-primary)',
            boxShadow: '0 4px 16px var(--stitch-accent-glow)',
            fontFamily: 'var(--stitch-font-body)',
          }}
        >
          Resume Game
        </button>

        <button
          onClick={onQuitToMenu}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer hover:border-gray-400"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--stitch-text-secondary)',
            border: '1px solid var(--stitch-border)',
            fontFamily: 'var(--stitch-font-body)',
          }}
        >
          Quit to Menu
        </button>

        {/* Hint */}
        <p 
          className="mt-6 text-sm"
          style={{ color: 'var(--stitch-text-secondary)' }}
        >
          Press{' '}
          <span 
            className="px-1.5 py-0.5 rounded text-xs mx-1"
            style={{ 
              backgroundColor: 'var(--stitch-bg-primary)',
              border: '1px solid var(--stitch-border)',
            }}
          >
            Space
          </span>
          {' '}to resume
        </p>
      </div>
    </div>
  );
}
