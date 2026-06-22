import { Timer, Clock, X } from "lucide-react";

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

export function TimerControl({
  isActive,
  onStartTimer,
  timerSeconds = null,
  onCancelTimer,
}: TimerControlProps) {
  const timerRunning = timerSeconds !== null;

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">Timer</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((preset) => {
          const isActivePreset = timerSeconds === preset.seconds;
          return (
            <button
              key={preset.seconds}
              disabled={timerRunning ? !isActivePreset : isActive}
              onClick={() => onStartTimer(preset.seconds)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                isActivePreset
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
        Select a timer to automatically disable sleep prevention after the chosen duration.
      </p>
    </div>
  );
}
