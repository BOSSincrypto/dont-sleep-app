import { Eye, EyeOff, Power } from "lucide-react";
import { cn } from "../lib/utils";

interface StatusCardProps {
  isActive: boolean;
  onToggle: () => void;
  timerSeconds: number | null;
  loading?: boolean;
}

export function StatusCard({
  isActive,
  onToggle,
  timerSeconds,
  loading = false,
}: StatusCardProps) {
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 shadow-xl">
      <div
        className={cn(
          "absolute inset-0 opacity-10 transition-opacity duration-700",
          isActive ? "bg-amber-500" : "bg-neutral-500"
        )}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-500",
            isActive
              ? "border-amber-400 bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
              : "border-neutral-600 bg-neutral-800"
          )}
        >
          {isActive ? (
            <Eye className="h-10 w-10 text-amber-400 animate-pulse" />
          ) : (
            <EyeOff className="h-10 w-10 text-neutral-400" />
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isActive ? "Stay Awake" : "Sleep Allowed"}
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {isActive
              ? "Your device will not sleep"
              : "Your device can sleep normally"}
          </p>
        </div>

        {timerSeconds !== null && timerSeconds > 0 && (
          <div className="rounded-lg bg-white/5 px-4 py-2 text-lg font-mono font-medium text-amber-300">
            {formatTime(timerSeconds)}
          </div>
        )}

        <button
          onClick={onToggle}
          disabled={loading}
          className={cn(
            "mt-2 flex items-center gap-2 rounded-xl px-8 py-3 font-semibold transition-all duration-300 active:scale-95",
            isActive
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-amber-500 text-neutral-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Power className="h-5 w-5" />
          {isActive ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
}
