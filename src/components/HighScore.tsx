import { useMemo } from 'react';

interface HighScoreProps {
  highScore: number;
  currentScore?: number;
  isNewHighScore?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HighScore({ 
  highScore, 
  currentScore, 
  isNewHighScore = false,
  showLabel = true, 
  size = 'md' 
}: HighScoreProps) {
  const displayScore = useMemo(() => {
    if (currentScore !== undefined && currentScore > 0 && currentScore > highScore) {
      return currentScore;
    }
    return highScore;
  }, [highScore, currentScore]);

  const showNewHighScore = isNewHighScore || (currentScore !== undefined && currentScore > 0 && currentScore > highScore);

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
          color: showNewHighScore ? 'var(--stitch-accent)' : 'var(--stitch-text-primary)',
        }}
      >
        {displayScore}
      </div>
      {showNewHighScore && (
        <div
          className="text-sm mt-1 animate-pulse-slow"
          style={{ color: 'var(--stitch-accent)' }}
        >
          New High Score!
        </div>
      )}
    </div>
  );
}
