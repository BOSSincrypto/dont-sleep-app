import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

const getErrorMessage = (err: unknown, context: string): string => {
  if (err instanceof Error) {
    return `${context}: ${err.message}`;
  }
  if (typeof err === "string") {
    return `${context}: ${err}`;
  }
  return context;
};

export function useKeepAwake() {
  const [isActiveState, setIsActiveState] = useState(false);
  const [timerSecondsState, setTimerSecondsState] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const isActiveRef = useRef(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);

  const setIsActive = useCallback((value: boolean) => {
    isActiveRef.current = value;
    setIsActiveState(value);
  }, []);

  const setTimerSeconds = useCallback((value: number | null) => {
    setTimerSecondsState(value);
  }, []);

  const clearError = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setError = useCallback(
    (message: string | null) => {
      clearError();
      setErrorState(message);
      if (message) {
        errorTimeoutRef.current = setTimeout(() => {
          setErrorState(null);
          errorTimeoutRef.current = null;
        }, 5000);
      }
    },
    [clearError]
  );

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerSeconds(null);
  }, [setTimerSeconds]);

  const checkStatus = useCallback(async () => {
    try {
      const status = await invoke<boolean>("get_keep_awake_status");
      setIsActive(status);
    } catch {
      // Silent fail — polling should not spam the UI.
    }
  }, [setIsActive]);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<boolean>("start_keep_awake");
      setIsActive(result);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to start keep awake"));
    } finally {
      setLoading(false);
    }
  }, [setIsActive, setError]);

  const stop = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<boolean>("stop_keep_awake");
      setIsActive(result);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to stop keep awake"));
    } finally {
      setLoading(false);
    }
    clearTimer();
  }, [setIsActive, setError, clearTimer]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<boolean>("toggle_keep_awake");
      setIsActive(result);
      if (!result) {
        clearTimer();
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to toggle keep awake"));
    } finally {
      setLoading(false);
    }
  }, [setIsActive, setError, clearTimer]);

  const startWithTimer = useCallback(
    async (seconds: number) => {
      await start();
      if (!isActiveRef.current) return;

      clearTimer();
      setTimerSeconds(seconds);

      let remaining = seconds;
      timerIntervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          // Stop the interval immediately so another tick cannot fire
          // while the async stop() call is in flight.
          clearTimer();
          stop();
          return;
        }
        setTimerSeconds(remaining);
      }, 1000);
    },
    [start, stop, setTimerSeconds, clearTimer]
  );

  const cancelTimer = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  // Clear the auto-off timer if keep-awake is disabled externally
  // (e.g. via global hotkey or another instance).
  useEffect(() => {
    if (!isActiveState && timerSecondsState !== null) {
      clearTimer();
    }
  }, [isActiveState, timerSecondsState, clearTimer]);

  useEffect(() => {
    checkStatus();
    pollIntervalRef.current = setInterval(checkStatus, 2000);

    let ignore = false;
    listen<{ active: boolean }>("keep-awake-changed", (event) => {
      setIsActive(event.payload.active);
    }).then((unlisten) => {
      if (ignore) {
        unlisten();
      } else {
        unlistenRef.current = unlisten;
      }
    });

    return () => {
      ignore = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      unlistenRef.current?.();
    };
  }, [checkStatus, setIsActive]);

  return {
    isActive: isActiveState,
    timerSeconds: timerSecondsState,
    loading,
    error,
    start,
    stop,
    toggle,
    startWithTimer,
    cancelTimer,
  };
}
