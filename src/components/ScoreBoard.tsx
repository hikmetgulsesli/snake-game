interface ScoreBoardProps {
  score: number;
  highScore: number;
}

export function ScoreBoard({ score, highScore }: ScoreBoardProps) {
  return (
    <div className="flex justify-center gap-12 mb-6">
      <div className="text-center">
        <div 
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: 'var(--stitch-text-secondary)' }}
        >
          Score
        </div>
        <div 
          className="text-3xl font-bold"
          style={{ 
            fontFamily: 'var(--stitch-font-heading)',
            color: 'var(--stitch-text-primary)',
          }}
        >
          {score}
        </div>
      </div>
      <div className="text-center">
        <div 
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: 'var(--stitch-text-secondary)' }}
        >
          High Score
        </div>
        <div 
          className="text-3xl font-bold"
          style={{ 
            fontFamily: 'var(--stitch-font-heading)',
            color: 'var(--stitch-accent)',
          }}
        >
          {highScore}
        </div>
      </div>
    </div>
  );
}
