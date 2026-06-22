import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useKeepAwake() {
  const [isActive, setIsActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const status = await invoke<boolean>("get_keep_awake_status");
      setIsActive(status);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const start = useCallback(async () => {
    await invoke("start_keep_awake");
    setIsActive(true);
  }, []);

  const stop = useCallback(async () => {
    await invoke("stop_keep_awake");
    setIsActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerSeconds(null);
  }, []);

  const toggle = useCallback(async () => {
    if (isActive) {
      await stop();
    } else {
      await start();
    }
  }, [isActive, start, stop]);

  const startWithTimer = useCallback(
    async (seconds: number) => {
      await start();
      setTimerSeconds(seconds);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      let remaining = seconds;
      timerIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setTimerSeconds(remaining);
        if (remaining <= 0) {
          stop();
        }
      }, 1000);
    },
    [start, stop]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return {
    isActive,
    timerSeconds,
    toggle,
    start,
    stop,
    startWithTimer,
  };
}
