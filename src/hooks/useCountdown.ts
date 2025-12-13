import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  autoStart?: boolean;
  storageKey?: string;
}

export const useCountdown = (initialSeconds: number = 60, options: UseCountdownOptions = {}) => {
  const { autoStart = true, storageKey } = options;

  const calculateRemainingTime = () => {
    if (storageKey) {
      const storedEndTime = sessionStorage.getItem(storageKey);
      if (storedEndTime) {
        const remaining = Math.ceil((parseInt(storedEndTime, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    }
    return initialSeconds;
  };

  const [seconds, setSeconds] = useState(calculateRemainingTime);
  const [isActive, setIsActive] = useState(() => {
    if (storageKey && sessionStorage.getItem(storageKey)) {
      const storedEndTime = sessionStorage.getItem(storageKey);
      return storedEndTime ? (parseInt(storedEndTime, 10) - Date.now()) > 0 : false;
    }
    return autoStart;
  });

  useEffect(() => {
    // Initial setup if autoStart is true and no storage key exists (or it expired)
    if (autoStart && storageKey && !sessionStorage.getItem(storageKey)) {
      const endTime = Date.now() + initialSeconds * 1000;
      sessionStorage.setItem(storageKey, endTime.toString());
      setIsActive(true);
    }
  }, [autoStart, storageKey, initialSeconds]);

  useEffect(() => {
    let interval: any;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (storageKey) {
            const storedEndTime = sessionStorage.getItem(storageKey);
            if (storedEndTime) {
              const remaining = Math.ceil((parseInt(storedEndTime, 10) - Date.now()) / 1000);
              if (remaining <= 0) {
                setIsActive(false);
                sessionStorage.removeItem(storageKey);
                return 0;
              }
              return remaining;
            }
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (seconds <= 0) {
      setIsActive(false);
      if (storageKey) sessionStorage.removeItem(storageKey);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds, storageKey]);

  const restart = useCallback(() => {
    const newEndTime = Date.now() + initialSeconds * 1000;
    if (storageKey) {
      sessionStorage.setItem(storageKey, newEndTime.toString());
    }
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds, storageKey]);

  const stop = useCallback(() => {
    setIsActive(false);
    if (storageKey) sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    seconds,
    isActive,
    restart,
    stop,
    formattedTime: `00:${seconds < 10 ? `0${seconds}` : seconds}`
  };
};
