import { useState, useEffect, useRef, useCallback } from 'react';

// Audio preferences stored in localStorage
interface AudioPreferences {
  muted: boolean;
  volume: number;
}

const STORAGE_KEY = 'snakeAudioPreferences';

const defaultPreferences: AudioPreferences = {
  muted: false,
  volume: 0.5,
};

function loadPreferences(): AudioPreferences {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<AudioPreferences>;
      return {
        muted: parsed.muted ?? defaultPreferences.muted,
        volume: Math.max(0, Math.min(1, parsed.volume ?? defaultPreferences.volume)),
      };
    }
  } catch {
    // Fallback to defaults if localStorage fails
  }
  return defaultPreferences;
}

function savePreferences(prefs: AudioPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore localStorage errors
  }
}

export interface UseAudioReturn {
  isSupported: boolean;
  isInitialized: boolean;
  isMuted: boolean;
  volume: number;
  init: () => void;
  playEatSound: () => void;
  playGameOverSound: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

function checkAudioSupport(): boolean {
  if (typeof window === 'undefined') return true;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return !!AudioContextClass;
}

export function useAudio(): UseAudioReturn {
  const [isSupported, setIsSupported] = useState(() => checkAudioSupport());
  const [isInitialized, setIsInitialized] = useState(false);
  const [preferences, setPreferences] = useState<AudioPreferences>(() => loadPreferences());

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const hasInteractedRef = useRef(false);

  // Initialize audio context on first user interaction
  const init = useCallback(() => {
    if (isInitialized || !isSupported) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        setIsSupported(false);
        return;
      }

      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create master gain node for volume control
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = preferences.muted ? 0 : preferences.volume;
      gainNodeRef.current = masterGain;

      // Handle autoplay policy - resume if suspended
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          setIsInitialized(true);
        }).catch(() => {
          // Will retry on next interaction
        });
      } else {
        setIsInitialized(true);
      }

      hasInteractedRef.current = true;
    } catch {
      setIsSupported(false);
    }
  }, [isInitialized, isSupported, preferences.muted, preferences.volume]);

  // Resume audio context on user interaction (handles autoplay restrictions)
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteractedRef.current) {
        init();
      } else if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {
          // Ignore resume errors
        });
      }
    };

    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [init]);

  // Update gain when volume or mute changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        preferences.muted ? 0 : preferences.volume,
        audioContextRef.current?.currentTime || 0,
        0.1
      );
    }
  }, [preferences.muted, preferences.volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(() => {
          // Ignore close errors
        });
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    setPreferences(prev => {
      const next = { ...prev, muted: !prev.muted };
      savePreferences(next);
      return next;
    });
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setPreferences(prev => {
      const next = { ...prev, volume: clampedVolume };
      savePreferences(next);
      return next;
    });
  }, []);

  // Play eat sound: pleasant ascending frequency sweep
  const playEatSound = useCallback(() => {
    if (!isSupported || preferences.muted) return;
    
    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current;
    if (!ctx || !masterGain) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      // Pleasant ascending tone (frequency sweep up)
      const now = ctx.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now); // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      // Envelope for pleasant short sound
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch {
      // Ignore playback errors
    }
  }, [isSupported, preferences.muted]);

  // Play game over sound: descending tone sequence
  const playGameOverSound = useCallback(() => {
    if (!isSupported || preferences.muted) return;
    
    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current;
    if (!ctx || !masterGain) return;

    try {
      const now = ctx.currentTime;
      
      // Create three descending tones for dramatic effect
      const tones = [
        { freq: 300, duration: 0.2, delay: 0 },
        { freq: 200, duration: 0.2, delay: 0.15 },
        { freq: 100, duration: 0.3, delay: 0.3 },
      ];

      tones.forEach(({ freq, duration, delay }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.type = 'sawtooth';
        const startTime = now + delay;
        
        oscillator.frequency.setValueAtTime(freq, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + duration);

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch {
      // Ignore playback errors
    }
  }, [isSupported, preferences.muted]);

  return {
    isSupported,
    isInitialized,
    isMuted: preferences.muted,
    volume: preferences.volume,
    init,
    playEatSound,
    playGameOverSound,
    toggleMute,
    setVolume,
  };
}
