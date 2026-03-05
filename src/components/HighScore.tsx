import { useEffect, useState } from 'react';

interface HighScoreProps {
  currentScore?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HighScore({ currentScore, showLabel = true, size = 'md' }: HighScoreProps) {
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('snake-game-highscore');
    const savedHighScore = saved ? parseInt(saved, 10) : 0;
    setHighScore(savedHighScore);

    if (currentScore !== undefined && currentScore > savedHighScore && currentScore > 0) {
      setIsNewHighScore(true);
      localStorage.setItem('snake-game-highscore', currentScore.toString());
    }
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
