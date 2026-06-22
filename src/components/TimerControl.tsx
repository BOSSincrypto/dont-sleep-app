import { useState } from "react";
import { Timer, Clock, X, Settings2 } from "lucide-react";

interface TimerControlProps {
  isActive: boolean;
  onStartTimer: (seconds: number) => void;
  timerSeconds?: number | null;
  onCancelTimer?: () => void;
}

const PRESETS = [
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "1 h", seconds: 3600 },
  { label: "2 h", seconds: 7200 },
];

const MAX_HOURS = 23;
const MAX_MINUTES = 59;

export function TimerControl({
  isActive,
  onStartTimer,
  timerSeconds = null,
  onCancelTimer,
}: TimerControlProps) {
  const timerRunning = timerSeconds !== null;
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);

  const isPresetActive = (seconds: number) => timerSeconds === seconds;
  const isCustomActive =
    timerRunning && !PRESETS.some((p) => p.seconds === timerSeconds);

  const startCustomTimer = () => {
    const totalSeconds = customHours * 3600 + customMinutes * 60;
    if (totalSeconds > 0) {
      onStartTimer(totalSeconds);
    }
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const customTotalSeconds = customHours * 3600 + customMinutes * 60;
  const canStartCustom =
    customTotalSeconds > 0 && !timerRunning && !isActive;

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">Timer</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((preset) => {
          const activePreset = isPresetActive(preset.seconds);
          return (
            <button
              key={preset.seconds}
              disabled={timerRunning ? !activePreset : isActive}
              onClick={() => onStartTimer(preset.seconds)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                activePreset
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-neutral-800 text-neutral-300 hover:border-amber-500/30 hover:bg-neutral-700 hover:text-amber-300"
              }`}
            >
              <Clock className="h-4 w-4" />
              {preset.label}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-3 rounded-xl border px-4 py-3 transition-colors ${
          isCustomActive
            ? "border-amber-500 bg-amber-500/10"
            : "border-white/10 bg-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Custom</span>
          </div>
          {isCustomActive && timerSeconds !== null && (
            <span className="text-xs font-mono text-amber-300">
              {formatTime(timerSeconds)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-neutral-500">Hours</label>
            <input
              type="number"
              min={0}
              max={MAX_HOURS}
              value={customHours}
              disabled={timerRunning || isActive}
              onChange={(e) =>
                setCustomHours(clamp(Number(e.target.value) || 0, 0, MAX_HOURS))
              }
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-amber-500 disabled:opacity-40"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-neutral-500">Minutes</label>
            <input
              type="number"
              min={0}
              max={MAX_MINUTES}
              value={customMinutes}
              disabled={timerRunning || isActive}
              onChange={(e) =>
                setCustomMinutes(
                  clamp(Number(e.target.value) || 0, 0, MAX_MINUTES)
                )
              }
              className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-amber-500 disabled:opacity-40"
            />
          </div>
          <button
            onClick={startCustomTimer}
            disabled={!canStartCustom}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start
          </button>
        </div>
      </div>

      {timerRunning && onCancelTimer && (
        <button
          onClick={onCancelTimer}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
        >
          <X className="h-4 w-4" />
          Cancel timer
        </button>
      )}

      <p className="mt-3 text-xs text-neutral-500">
        Select a preset or set a custom duration to automatically disable sleep
        prevention afterwards.
      </p>
    </div>
  );
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}
