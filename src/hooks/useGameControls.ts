import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, SwipeDirection, TouchPosition } from '../types';

const DIRECTION_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];

export interface UseGameControlsOptions {
  /** Whether the game has started */
  gameStarted: boolean;
  /** Whether the game is over */
  gameOver: boolean;
  /** Whether the game is paused */
  paused: boolean;
  /** Current direction of the snake */
  currentDirection: Direction;
  /** Callback when direction changes */
  onDirectionChange: (direction: Direction) => void;
  /** Callback when pause is toggled */
  onPauseToggle: () => void;
  /** Minimum swipe distance in pixels to register as a direction change */
  swipeThreshold?: number;
  /** Debounce time in milliseconds for direction changes */
  debounceMs?: number;
}

export interface UseGameControlsReturn {
  /** Whether input is currently being debounced */
  isDebouncing: boolean;
  /** Touch event handlers for the game board */
  touchHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

/**
 * Hook to encapsulate all game input controls
 * Handles keyboard (Arrow keys, WASD, Space) and touch/swipe gestures
 * Prevents 180-degree direction reversals and debounces rapid inputs
 */
export function useGameControls({
  gameStarted,
  gameOver,
  paused,
  currentDirection,
  onDirectionChange,
  onPauseToggle,
  swipeThreshold = 30,
  debounceMs = 50,
}: UseGameControlsOptions): UseGameControlsReturn {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const touchStartRef = useRef<TouchPosition | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDirectionRef = useRef<Direction>(currentDirection);

  // Keep ref in sync with prop
  useEffect(() => {
    lastDirectionRef.current = currentDirection;
  }, [currentDirection]);

  /**
   * Check if a direction change is valid (not a 180-degree reversal)
   */
  const isValidDirectionChange = useCallback((
    current: Direction,
    next: Direction
  ): boolean => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    return opposites[current] !== next;
  }, []);

  /**
   * Debounced direction change handler
   */
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    if (isDebouncing) return;
    if (!isValidDirectionChange(lastDirectionRef.current, newDirection)) return;

    onDirectionChange(newDirection);
    setIsDebouncing(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
    }, debounceMs);
  }, [isDebouncing, isValidDirectionChange, onDirectionChange, debounceMs]);

  /**
   * Map keyboard key to direction
   */
  const getDirectionFromKey = useCallback((key: string): Direction | null => {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        return 'UP';
      case 'ArrowDown':
      case 's':
      case 'S':
        return 'DOWN';
      case 'ArrowLeft':
      case 'a':
      case 'A':
        return 'LEFT';
      case 'ArrowRight':
      case 'd':
      case 'D':
        return 'RIGHT';
      default:
        return null;
    }
  }, []);

  /**
   * Check if a key is a game control key
   */
  const isGameControlKey = useCallback((key: string, code: string): boolean => {
    return DIRECTION_KEYS.includes(key) || code === 'Space';
  }, []);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted) return;

    // Prevent default browser scrolling for game control keys
    if (isGameControlKey(e.key, e.code)) {
      e.preventDefault();
    }

    // Handle pause/resume with spacebar
    if (e.code === 'Space') {
      onPauseToggle();
      return;
    }

    // Ignore direction changes when game is over or paused
    if (gameOver || paused) return;

    const newDirection = getDirectionFromKey(e.key);
    if (newDirection) {
      handleDirectionChange(newDirection);
    }
  }, [gameStarted, gameOver, paused, onPauseToggle, getDirectionFromKey, handleDirectionChange, isGameControlKey]);

  // Setup keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Calculate swipe direction from touch positions
   */
  const getSwipeDirection = useCallback((
    start: TouchPosition,
    end: TouchPosition
  ): SwipeDirection | null => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Check if swipe distance meets threshold
    if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) {
      return null;
    }

    // Determine primary direction
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      return dy > 0 ? 'DOWN' : 'UP';
    }
  }, [swipeThreshold]);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!gameStarted) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, [gameStarted]);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !gameStarted || gameOver || paused) return;

    const endPosition: TouchPosition = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const swipeDirection = getSwipeDirection(touchStartRef.current, endPosition);
    if (swipeDirection) {
      handleDirectionChange(swipeDirection);
    }

    touchStartRef.current = null;
  }, [gameStarted, gameOver, paused, getSwipeDirection, handleDirectionChange]);

  return {
    isDebouncing,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
}
