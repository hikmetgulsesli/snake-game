import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudio } from './useAudio.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock AudioContext
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
    },
  }));
  
  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }));
  
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Mocking global AudioContext
    window.AudioContext = MockAudioContext;
    // @ts-expect-error - Mocking webkit prefix
    window.webkitAudioContext = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default preferences', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(0.5);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isInitialized).toBe(false);
  });

  it('should load preferences from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ muted: true, volume: 0.8 }));
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0.8);
  });

  it('should clamp volume to valid range', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ volume: 1.5 }));
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.volume).toBe(1);
  });

  it('should clamp negative volume to 0', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ volume: -0.5 }));
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.volume).toBe(0);
  });

  it('should toggle mute state', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.isMuted).toBe(false);
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(false);
  });

  it('should set volume and persist to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    act(() => {
      result.current.setVolume(0.75);
    });
    
    expect(result.current.volume).toBe(0.75);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'snakeAudioPreferences',
      expect.stringContaining('0.75')
    );
  });

  it('should clamp volume when setting', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    act(() => {
      result.current.setVolume(2);
    });
    
    expect(result.current.volume).toBe(1);
    
    act(() => {
      result.current.setVolume(-1);
    });
    
    expect(result.current.volume).toBe(0);
  });

  it('should initialize AudioContext on init call', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.isInitialized).toBe(false);
    
    act(() => {
      result.current.init();
    });
    
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it('should mark as unsupported when AudioContext is not available', () => {
    // @ts-expect-error - Removing AudioContext
    window.AudioContext = undefined;
    // @ts-expect-error - Removing webkit prefix
    window.webkitAudioContext = undefined;
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.isSupported).toBe(false);
  });

  it('should support webkitAudioContext fallback', async () => {
    // @ts-expect-error - Removing standard AudioContext
    window.AudioContext = undefined;
    // @ts-expect-error - Adding webkit prefix
    window.webkitAudioContext = MockAudioContext;
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current.isSupported).toBe(true);
    
    act(() => {
      result.current.init();
    });
    
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it('should not play sounds when muted', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ muted: true }));
    
    const { result } = renderHook(() => useAudio());
    
    act(() => {
      result.current.init();
    });
    
    // Should not throw when playing sounds while muted
    expect(() => {
      act(() => {
        result.current.playEatSound();
        result.current.playGameOverSound();
      });
    }).not.toThrow();
  });

  it('should not play sounds when AudioContext is not supported', () => {
    // @ts-expect-error - Removing AudioContext
    window.AudioContext = undefined;
    // @ts-expect-error - Removing webkit prefix
    window.webkitAudioContext = undefined;
    
    const { result } = renderHook(() => useAudio());
    
    // Should not throw when playing sounds without support
    expect(() => {
      act(() => {
        result.current.playEatSound();
        result.current.playGameOverSound();
      });
    }).not.toThrow();
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const { result } = renderHook(() => useAudio());
    
    // Should use defaults when localStorage fails
    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(0.5);
  });

  it('should handle localStorage setItem errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const { result } = renderHook(() => useAudio());
    
    // Should not throw when localStorage fails
    expect(() => {
      act(() => {
        result.current.toggleMute();
        result.current.setVolume(0.8);
      });
    }).not.toThrow();
    
    // State should still update
    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0.8);
  });

  it('should not initialize twice', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    act(() => {
      result.current.init();
    });
    
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });
    
    const initState = result.current.isInitialized;
    
    act(() => {
      result.current.init();
    });
    
    expect(result.current.isInitialized).toBe(initState);
  });

  it('should return correct interface', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAudio());
    
    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('isInitialized');
    expect(result.current).toHaveProperty('isMuted');
    expect(result.current).toHaveProperty('volume');
    expect(result.current).toHaveProperty('init');
    expect(result.current).toHaveProperty('playEatSound');
    expect(result.current).toHaveProperty('playGameOverSound');
    expect(result.current).toHaveProperty('toggleMute');
    expect(result.current).toHaveProperty('setVolume');
    
    expect(typeof result.current.init).toBe('function');
    expect(typeof result.current.playEatSound).toBe('function');
    expect(typeof result.current.playGameOverSound).toBe('function');
    expect(typeof result.current.toggleMute).toBe('function');
    expect(typeof result.current.setVolume).toBe('function');
  });
});
