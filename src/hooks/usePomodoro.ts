import { useState, useEffect, useCallback, useRef } from 'react';

export type PomodoroStyle = 'dopamine' | 'apple' | 'candy';

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  sessions: number;
  currentStyle: PomodoroStyle;
}

interface UsePomodoroReturn extends PomodoroState {
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipToBreak: () => void;
  skipToWork: () => void;
  setStyle: (style: PomodoroStyle) => void;
  getProgress: () => number;
  formatTime: (seconds: number) => string;
}

const WORK_TIME = 25 * 60; // 25分钟
const BREAK_TIME = 5 * 60; // 5分钟

const STORAGE_KEY = 'pomodoro-style';

export const usePomodoro = (): UsePomodoroReturn => {
  const [state, setState] = useState<PomodoroState>({
    timeLeft: WORK_TIME,
    isRunning: false,
    isBreak: false,
    sessions: 0,
    currentStyle: 'dopamine',
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 从localStorage加载风格设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStyle = localStorage.getItem(STORAGE_KEY) as PomodoroStyle;
      if (savedStyle && ['dopamine', 'apple', 'candy'].includes(savedStyle)) {
        setState(prev => ({ ...prev, currentStyle: savedStyle }));
      }

      // 创建音频元素用于提示音
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    }
  }, []);

  // 计时器逻辑
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            // 播放提示音
            audioRef.current?.play().catch(() => {});
            
            const newIsBreak = !prev.isBreak;
            const newTimeLeft = newIsBreak ? BREAK_TIME : WORK_TIME;
            const newSessions = !newIsBreak ? prev.sessions + 1 : prev.sessions;
            
            return {
              ...prev,
              timeLeft: newTimeLeft,
              isBreak: newIsBreak,
              sessions: newSessions,
              isRunning: false,
            };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeLeft: prev.isBreak ? BREAK_TIME : WORK_TIME,
      isRunning: false,
    }));
  }, []);

  const skipToBreak = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeLeft: BREAK_TIME,
      isBreak: true,
      isRunning: false,
    }));
  }, []);

  const skipToWork = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeLeft: WORK_TIME,
      isBreak: false,
      isRunning: false,
    }));
  }, []);

  const setStyle = useCallback((style: PomodoroStyle) => {
    setState(prev => ({ ...prev, currentStyle: style }));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, style);
    }
  }, []);

  const getProgress = useCallback(() => {
    const totalTime = state.isBreak ? BREAK_TIME : WORK_TIME;
    return ((totalTime - state.timeLeft) / totalTime) * 100;
  }, [state.timeLeft, state.isBreak]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    start,
    pause,
    reset,
    skipToBreak,
    skipToWork,
    setStyle,
    getProgress,
    formatTime,
  };
};