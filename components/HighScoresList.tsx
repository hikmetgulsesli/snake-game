'use client';

import { HighScoreEntry } from '../types/highScores';

interface HighScoresListProps {
  scores: HighScoreEntry[];
  maxScores?: number;
  highlightNewest?: boolean;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'EASY':
      return 'text-green-400';
    case 'NORMAL':
      return 'text-yellow-400';
    case 'HARD':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

export function HighScoresList({
  scores,
  maxScores = 10,
  highlightNewest = false,
}: HighScoresListProps) {
  const displayScores = scores.slice(0, maxScores);
  const newestIndex = highlightNewest && scores.length > 0 ? 0 : -1;

  if (displayScores.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No high scores yet. Be the first!
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-2">
        {displayScores.map((score, index) => (
          <div
            key={`${score.date}-${index}`}
            data-testid={`high-score-${index}`}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
              index === newestIndex
                ? 'bg-[#39ff14]/10 border-[#39ff14]/50 shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                : 'bg-[#1e1e1e] border-[#2a2a2a]'
            }`}
          >
            {/* Rank and Score */}
            <div className="flex items-center gap-3">
              <span
                className={`w-8 text-center font-bold ${
                  index < 3 ? 'text-[#39ff14]' : 'text-gray-500'
                }`}
              >
                {getMedalEmoji(index + 1) || `#${index + 1}`}
              </span>
              <span className="text-white font-bold tabular-nums">
                {score.score.toLocaleString()}
              </span>
            </div>

            {/* Difficulty Badge */}
            <span
              className={`px-2 py-1 rounded text-xs font-bold uppercase ${getDifficultyColor(
                score.difficulty
              )}`}
            >
              {score.difficulty}
            </span>

            {/* Date */}
            <span className="text-gray-500 text-sm tabular-nums">
              {formatDate(score.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HighScoreSummaryProps {
  scores: HighScoreEntry[];
}

export function HighScoreSummary({ scores }: HighScoreSummaryProps) {
  const highestScore = scores.length > 0 ? scores[0].score : 0;
  const totalGames = scores.length;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] rounded-lg border border-[#2a2a2a]">
      <div className="flex items-center gap-2">
        <span className="text-[#39ff14] text-lg">🏆</span>
        <span className="text-gray-400">Highest:</span>
        <span className="text-white font-bold tabular-nums">
          {highestScore.toLocaleString()}
        </span>
      </div>
      <div className="text-gray-500 text-sm">
        {totalGames} {totalGames === 1 ? 'entry' : 'entries'}
      </div>
    </div>
  );
}
