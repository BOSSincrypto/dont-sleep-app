import { Timer, Clock } from "lucide-react";

interface TimerControlProps {
  isActive: boolean;
  onStartTimer: (seconds: number) => void;
}

const PRESETS = [
  { label: "5 min", seconds: 300 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "1 h", seconds: 3600 },
  { label: "2 h", seconds: 7200 },
];

export function TimerControl({ isActive, onStartTimer }: TimerControlProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">Timer</h3>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.seconds}
            disabled={isActive}
            onClick={() => onStartTimer(preset.seconds)}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-neutral-800 px-2 py-3 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-700 hover:border-amber-500/30 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Clock className="h-4 w-4" />
            {preset.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Select a timer to automatically disable sleep prevention after the chosen duration.
      </p>
    </div>
  );
}
