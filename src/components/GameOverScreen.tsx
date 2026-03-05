import { useEffect, useState } from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export function GameOverScreen({ 
  score, 
  highScore, 
  isNewHighScore, 
  onRestart, 
  onBackToMenu 
}: GameOverScreenProps) {
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
        backgroundColor: 'rgba(15, 15, 18, 0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className={`p-12 rounded-2xl text-center min-w-[360px] transition-all duration-300 ${
          animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          backgroundColor: 'var(--stitch-bg-card)',
          border: '1px solid var(--stitch-border)',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Game Over Icon */}
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--stitch-danger)',
            boxShadow: '0 0 32px var(--stitch-danger-glow)',
          }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
          </svg>
        </div>

        {/* Title */}
        <h2 
          className="text-4xl font-bold mb-8"
          style={{ 
            fontFamily: 'var(--stitch-font-heading)',
            color: 'var(--stitch-danger)',
          }}
        >
          GAME OVER
        </h2>

        {/* Final Score */}
        <div className="mb-8">
          <div 
            className="text-sm uppercase tracking-widest mb-2"
            style={{ color: 'var(--stitch-text-secondary)' }}
          >
            Final Score
          </div>
          <div 
            className="text-6xl font-bold"
            style={{ 
              fontFamily: 'var(--stitch-font-heading)',
              color: 'var(--stitch-text-primary)',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.1)',
            }}
          >
            {score}
          </div>
          {isNewHighScore && (
            <div 
              className="text-sm mt-3 animate-pulse-slow"
              style={{ color: 'var(--stitch-accent)' }}
            >
              New High Score! 🎉
            </div>
          )}
          {!isNewHighScore && (
            <div 
              className="text-sm mt-3"
              style={{ color: 'var(--stitch-text-muted)' }}
            >
              High Score: {highScore}
            </div>
          )}
        </div>

        {/* Buttons */}
        <button
          onClick={onRestart}
          className="w-full py-4 rounded-xl font-semibold text-base mb-3 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--stitch-accent)',
            color: 'var(--stitch-bg-primary)',
            boxShadow: '0 4px 16px var(--stitch-accent-glow)',
            fontFamily: 'var(--stitch-font-body)',
          }}
        >
          Play Again
        </button>

        <button
          onClick={onBackToMenu}
          className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer hover:border-gray-400"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--stitch-text-secondary)',
            border: '1px solid var(--stitch-border)',
            fontFamily: 'var(--stitch-font-body)',
          }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
