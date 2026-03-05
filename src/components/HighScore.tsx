import { useMemo } from 'react';

interface HighScoreProps {
  currentScore?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getSavedHighScore(): number {
  try {
    const saved = localStorage.getItem('snake-game-highscore');
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem('snake-game-highscore', score.toString());
  } catch {
    // Ignore localStorage errors
  }
}

export function HighScore({ currentScore, showLabel = true, size = 'md' }: HighScoreProps) {
  const { highScore, isNewHighScore } = useMemo(() => {
    const savedHighScore = getSavedHighScore();
    
    if (currentScore !== undefined && currentScore > savedHighScore && currentScore > 0) {
      saveHighScore(currentScore);
      return { highScore: currentScore, isNewHighScore: true };
    }
    
    return { highScore: savedHighScore, isNewHighScore: false };
  }, [currentScore]);

  const sizeClasses = {
    sm: {
      value: 'text-xl',
      label: 'text-xs',
    },
    md: {
      value: 'text-3xl',
      label: 'text-sm',
    },
    lg: {
      value: 'text-5xl',
      label: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="text-center">
      {showLabel && (
        <div 
          className={`${classes.label} uppercase tracking-widest mb-1`}
          style={{ color: 'var(--stitch-text-secondary)' }}
        >
          High Score
        </div>
      )}
      <div 
        className={`${classes.value} font-bold`}
        style={{ 
          fontFamily: 'var(--stitch-font-heading)',
          color: isNewHighScore ? 'var(--stitch-accent)' : 'var(--stitch-text-primary)',
        }}
      >
        {Math.max(highScore, currentScore || 0)}
      </div>
      {isNewHighScore && (
        <div 
          className="text-sm mt-1 animate-pulse-slow"
          style={{ color: 'var(--stitch-accent)' }}
        >
          New High Score! 🎉
        </div>
      )}
    </div>
  );
}
