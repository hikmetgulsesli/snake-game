// High Score Types

import { Difficulty } from './game';

/**
 * A single high score entry
 */
export interface HighScoreEntry {
  score: number;
  difficulty: Difficulty;
  date: string; // ISO 8601 date string
}

/**
 * Stored high scores structure with schema version
 */
export interface HighScoresStorage {
  version: number;
  scores: HighScoreEntry[];
}

/**
 * Result of checking if a score qualifies for top 10
 */
export interface ScoreQualificationResult {
  qualifies: boolean;
  rank: number | null; // 1-based rank if qualifies, null otherwise
  wouldReplace: HighScoreEntry | null; // Entry that would be replaced if any
}

/**
 * Validation result for high scores data
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: HighScoresStorage | null;
}
