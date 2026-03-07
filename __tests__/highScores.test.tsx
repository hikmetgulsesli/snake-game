import {
  validateHighScores,
  loadHighScores,
  saveHighScores,
  checkScoreQualification,
  addHighScore,
} from '../hooks/useHighScores';
import { HighScoreEntry, HighScoresStorage } from '../types/highScores';
import { LOCAL_STORAGE_KEYS, MAX_HIGH_SCORES, HIGH_SCORES_SCHEMA_VERSION } from '../constants/game';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('High Scores - Validation', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  describe('validateHighScores', () => {
    it('validates correct data structure', () => {
      const validData: HighScoresStorage = {
        version: 1,
        scores: [
          { score: 100, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' },
          { score: 200, difficulty: 'NORMAL', date: '2026-03-07T13:00:00Z' },
        ],
      };

      const result = validateHighScores(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validData);
    });

    it('rejects non-object data', () => {
      const result = validateHighScores(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data must be an object');
      expect(result.data).toBeNull();
    });

    it('rejects invalid version', () => {
      const data = {
        version: 999,
        scores: [],
      };

      const result = validateHighScores(data);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Version mismatch'))).toBe(true);
    });

    it('rejects non-array scores', () => {
      const data = {
        version: 1,
        scores: 'not an array',
      };

      const result = validateHighScores(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Scores must be an array');
    });

    it('rejects entries with negative scores', () => {
      const data: HighScoresStorage = {
        version: 1,
        scores: [{ score: -10, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' }],
      };

      const result = validateHighScores(data);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('index 0'))).toBe(true);
    });

    it('rejects entries with invalid difficulty', () => {
      const data = {
        version: 1,
        scores: [{ score: 100, difficulty: 'INVALID', date: '2026-03-07T12:00:00Z' }],
      };

      const result = validateHighScores(data);

      expect(result.valid).toBe(false);
    });

    it('rejects entries with invalid date', () => {
      const data: HighScoresStorage = {
        version: 1,
        scores: [{ score: 100, difficulty: 'EASY', date: 'invalid-date' }],
      };

      const result = validateHighScores(data);

      expect(result.valid).toBe(false);
    });

    it('gracefully handles partial invalid data', () => {
      const data = {
        version: 1,
        scores: [
          { score: 100, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' },
          { score: -10, difficulty: 'NORMAL', date: '2026-03-07T13:00:00Z' },
        ],
      };

      const result = validateHighScores(data);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.data?.scores).toHaveLength(1);
      expect(result.data?.scores[0].score).toBe(100);
    });
  });
});

describe('High Scores - Storage Operations', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  describe('loadHighScores', () => {
    it('returns empty array when no data in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const scores = loadHighScores();

      expect(scores).toEqual([]);
    });

    it('loads and sorts scores from localStorage', () => {
      const storage: HighScoresStorage = {
        version: 1,
        scores: [
          { score: 100, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' },
          { score: 300, difficulty: 'HARD', date: '2026-03-07T13:00:00Z' },
          { score: 200, difficulty: 'NORMAL', date: '2026-03-07T14:00:00Z' },
        ],
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storage));

      const scores = loadHighScores();

      expect(scores).toHaveLength(3);
      expect(scores[0].score).toBe(300);
      expect(scores[1].score).toBe(200);
      expect(scores[2].score).toBe(100);
    });

    it('returns empty array for invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const scores = loadHighScores();

      expect(scores).toEqual([]);
    });

    it('returns empty array on localStorage error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const scores = loadHighScores();

      expect(scores).toEqual([]);
    });

    it('returns empty array during SSR', () => {
      // Temporarily remove window
      const originalWindow = global.window;
      // @ts-expect-error - testing SSR
      global.window = undefined;

      const scores = loadHighScores();

      expect(scores).toEqual([]);

      global.window = originalWindow;
    });
  });

  describe('saveHighScores', () => {
    it('saves scores to localStorage', () => {
      const scores: HighScoreEntry[] = [
        { score: 100, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' },
      ];

      saveHighScores(scores);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEYS.HIGH_SCORES,
        JSON.stringify({
          version: HIGH_SCORES_SCHEMA_VERSION,
          scores,
        })
      );
    });

    it('limits scores to MAX_HIGH_SCORES', () => {
      const scores: HighScoreEntry[] = Array.from({ length: 15 }, (_, i) => ({
        score: i * 10,
        difficulty: 'EASY',
        date: '2026-03-07T12:00:00Z',
      }));

      saveHighScores(scores);

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData.scores).toHaveLength(MAX_HIGH_SCORES);
    });

    it('handles localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const scores: HighScoreEntry[] = [
        { score: 100, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' },
      ];

      expect(() => saveHighScores(scores)).not.toThrow();
    });


  });
});

describe('High Scores - Score Qualification', () => {
  const existingScores: HighScoreEntry[] = [
    { score: 500, difficulty: 'HARD', date: '2026-03-07T12:00:00Z' },
    { score: 400, difficulty: 'NORMAL', date: '2026-03-07T11:00:00Z' },
    { score: 300, difficulty: 'EASY', date: '2026-03-07T10:00:00Z' },
  ];

  describe('checkScoreQualification', () => {
    it('qualifies when scores list has less than MAX_HIGH_SCORES', () => {
      const shortList = existingScores.slice(0, 2);

      const result = checkScoreQualification(50, shortList);

      expect(result.qualifies).toBe(true);
      expect(result.rank).toBe(3);
    });

    it('qualifies when score beats lowest high score', () => {
      const fullList = Array.from({ length: 10 }, (_, i) => ({
        score: (10 - i) * 50,
        difficulty: 'EASY' as const,
        date: '2026-03-07T12:00:00Z',
      }));

      const result = checkScoreQualification(550, fullList);

      expect(result.qualifies).toBe(true);
      expect(result.rank).toBe(1);
      expect(result.wouldReplace?.score).toBe(50);
    });

    it('does not qualify when score is too low', () => {
      const fullList = Array.from({ length: 10 }, (_, i) => ({
        score: (10 - i) * 50,
        difficulty: 'EASY' as const,
        date: '2026-03-07T12:00:00Z',
      }));

      const result = checkScoreQualification(25, fullList);

      expect(result.qualifies).toBe(false);
      expect(result.rank).toBeNull();
    });

    it('calculates correct rank for middle positions', () => {
      const result = checkScoreQualification(450, existingScores);

      expect(result.qualifies).toBe(true);
      expect(result.rank).toBe(2);
    });

    it('qualifies for empty list with rank 1', () => {
      const result = checkScoreQualification(100, []);

      expect(result.qualifies).toBe(true);
      expect(result.rank).toBe(1);
    });
  });
});

describe('High Scores - Add Score', () => {
  describe('addHighScore', () => {
    it('adds new score and sorts by score descending', () => {
      const existing: HighScoreEntry[] = [
        { score: 300, difficulty: 'EASY', date: '2026-03-07T12:00:00Z' },
        { score: 100, difficulty: 'EASY', date: '2026-03-07T10:00:00Z' },
      ];
      const newScore: HighScoreEntry = {
        score: 200,
        difficulty: 'NORMAL',
        date: '2026-03-07T13:00:00Z',
      };

      const result = addHighScore(newScore, existing);

      expect(result).toHaveLength(3);
      expect(result[0].score).toBe(300);
      expect(result[1].score).toBe(200);
      expect(result[2].score).toBe(100);
    });

    it('limits to MAX_HIGH_SCORES', () => {
      const existing: HighScoreEntry[] = Array.from({ length: 10 }, (_, i) => ({
        score: (10 - i) * 100,
        difficulty: 'EASY' as const,
        date: '2026-03-07T12:00:00Z',
      }));
      const newScore: HighScoreEntry = {
        score: 1100,
        difficulty: 'HARD',
        date: '2026-03-07T14:00:00Z',
      };

      const result = addHighScore(newScore, existing);

      expect(result).toHaveLength(MAX_HIGH_SCORES);
      expect(result[0].score).toBe(1100);
    });

    it('breaks ties by date (newer first)', () => {
      const existing: HighScoreEntry[] = [
        { score: 100, difficulty: 'EASY', date: '2026-03-07T10:00:00Z' },
      ];
      const newScore: HighScoreEntry = {
        score: 100,
        difficulty: 'NORMAL',
        date: '2026-03-07T13:00:00Z',
      };

      const result = addHighScore(newScore, existing);

      expect(result[0]).toEqual(newScore);
      expect(result[1]).toEqual(existing[0]);
    });
  });
});
