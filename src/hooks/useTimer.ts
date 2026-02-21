import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number; // in seconds
  onTimeOver?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formatTime: () => string;
}

export const useTimer = ({ initialTime, onTimeOver, autoStart = false }: UseTimerOptions): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<any>(null);

  const start = useCallback(() => {
    if (!isRunning) setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    if (isRunning) setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (onTimeOver) onTimeOver();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, onTimeOver]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return { timeLeft, isRunning, start, pause, reset, formatTime };
};
