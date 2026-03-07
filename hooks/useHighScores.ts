'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  HighScoreEntry,
  HighScoresStorage,
  ScoreQualificationResult,
  ValidationResult,
} from '../types/highScores';
import { Difficulty } from '../types/game';
import {
  LOCAL_STORAGE_KEYS,
  MAX_HIGH_SCORES,
  HIGH_SCORES_SCHEMA_VERSION,
} from '../constants/game';

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates a single high score entry
 */
function isValidHighScoreEntry(entry: unknown): entry is HighScoreEntry {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }

  const e = entry as Record<string, unknown>;

  // Check score is a non-negative number
  if (typeof e.score !== 'number' || e.score < 0 || !Number.isFinite(e.score)) {
    return false;
  }

  // Check difficulty is valid
  if (
    typeof e.difficulty !== 'string' ||
    !['EASY', 'NORMAL', 'HARD'].includes(e.difficulty)
  ) {
    return false;
  }

  // Check date is a valid ISO string
  if (typeof e.date !== 'string') {
    return false;
  }
  const dateObj = new Date(e.date);
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return true;
}

/**
 * Validates the high scores storage structure
 */
export function validateHighScores(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push('Data must be an object');
    return { valid: false, errors, data: null };
  }

  const d = data as Record<string, unknown>;

  // Check version
  if (typeof d.version !== 'number') {
    errors.push('Version must be a number');
  } else if (d.version !== HIGH_SCORES_SCHEMA_VERSION) {
    errors.push(`Version mismatch: expected ${HIGH_SCORES_SCHEMA_VERSION}, got ${d.version}`);
  }

  // Check scores array
  if (!Array.isArray(d.scores)) {
    errors.push('Scores must be an array');
    return { valid: false, errors, data: null };
  }

  // Validate each score entry
  const validScores: HighScoreEntry[] = [];
  for (let i = 0; i < d.scores.length; i++) {
    if (isValidHighScoreEntry(d.scores[i])) {
      validScores.push(d.scores[i] as HighScoreEntry);
    } else {
      errors.push(`Invalid entry at index ${i}`);
    }
  }

  if (errors.length > 0) {
    // Return valid scores even if some entries were invalid (graceful degradation)
    return {
      valid: errors.length === 0,
      errors,
      data: {
        version: HIGH_SCORES_SCHEMA_VERSION,
        scores: validScores,
      },
    };
  }

  return {
    valid: true,
    errors: [],
    data: {
      version: HIGH_SCORES_SCHEMA_VERSION,
      scores: validScores,
    },
  };
}

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Loads high scores from localStorage with validation
 */
export function loadHighScores(): HighScoreEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.HIGH_SCORES);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    const validation = validateHighScores(parsed);

    if (validation.data) {
      // Sort by score descending
      return validation.data.scores.sort((a, b) => b.score - a.score);
    }

    return [];
  } catch {
    // Graceful fallback on any error
    return [];
  }
}

/**
 * Saves high scores to localStorage
 */
export function saveHighScores(scores: HighScoreEntry[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storage: HighScoresStorage = {
      version: HIGH_SCORES_SCHEMA_VERSION,
      scores: scores.slice(0, MAX_HIGH_SCORES),
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.HIGH_SCORES, JSON.stringify(storage));
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Checks if a score qualifies for the top 10
 */
export function checkScoreQualification(
  score: number,
  currentScores: HighScoreEntry[]
): ScoreQualificationResult {
  // Always qualify if less than 10 scores
  if (currentScores.length < MAX_HIGH_SCORES) {
    // Find the rank (1-based)
    const rank = currentScores.findIndex((s) => s.score < score) + 1;
    return {
      qualifies: true,
      rank: rank === 0 ? currentScores.length + 1 : rank,
      wouldReplace: null,
    };
  }

  // Check if score beats the lowest high score
  const lowestScore = currentScores[currentScores.length - 1]?.score ?? 0;
  if (score > lowestScore) {
    const rank = currentScores.findIndex((s) => s.score < score) + 1;
    return {
      qualifies: true,
      rank,
      wouldReplace: currentScores[currentScores.length - 1],
    };
  }

  return {
    qualifies: false,
    rank: null,
    wouldReplace: null,
  };
}

/**
 * Adds a new high score and returns the updated sorted list
 */
export function addHighScore(
  newScore: HighScoreEntry,
  currentScores: HighScoreEntry[]
): HighScoreEntry[] {
  const newScores = [...currentScores, newScore];
  // Sort by score descending, then by date descending for ties
  return newScores
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, MAX_HIGH_SCORES);
}

// ============================================================================
// HOOK
// ============================================================================

export interface UseHighScoresReturn {
  scores: HighScoreEntry[];
  isLoaded: boolean;
  error: string | null;
  addScore: (score: number, difficulty: Difficulty) => ScoreQualificationResult;
  checkQualification: (score: number) => ScoreQualificationResult;
  clearScores: () => void;
  refreshScores: () => void;
}

/**
 * Hook for managing high scores with localStorage persistence
 */
export function useHighScores(): UseHighScoresReturn {
  const [scores, setScores] = useState<HighScoreEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load scores from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const loaded = loadHighScores();
        setScores(loaded);
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load high scores');
        setIsLoaded(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Add a new score
  const addScore = useCallback(
    (score: number, difficulty: Difficulty): ScoreQualificationResult => {
      const qualification = checkScoreQualification(score, scores);

      if (qualification.qualifies) {
        const newEntry: HighScoreEntry = {
          score,
          difficulty,
          date: new Date().toISOString(),
        };

        const updatedScores = addHighScore(newEntry, scores);
        setScores(updatedScores);
        saveHighScores(updatedScores);
      }

      return qualification;
    },
    [scores]
  );

  // Check if a score would qualify (without adding)
  const checkQualification = useCallback(
    (score: number): ScoreQualificationResult => {
      return checkScoreQualification(score, scores);
    },
    [scores]
  );

  // Clear all scores
  const clearScores = useCallback(() => {
    setScores([]);
    saveHighScores([]);
  }, []);

  // Refresh scores from localStorage
  const refreshScores = useCallback(() => {
    try {
      const loaded = loadHighScores();
      setScores(loaded);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh high scores');
    }
  }, []);

  return {
    scores,
    isLoaded,
    error,
    addScore,
    checkQualification,
    clearScores,
    refreshScores,
  };
}
