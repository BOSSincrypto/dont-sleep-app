import { useKeepAwake } from "./hooks/useKeepAwake";
import { StatusCard } from "./components/StatusCard";
import { TimerControl } from "./components/TimerControl";
import { SettingsPanel } from "./components/SettingsPanel";
import { Moon, AlertCircle } from "lucide-react";

function App() {
  const {
    isActive,
    timerSeconds,
    loading,
    error,
    toggle,
    startWithTimer,
    cancelTimer,
  } = useKeepAwake();

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Moon className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Don't Sleep</h1>
          </div>
          <span className="text-xs text-neutral-500 font-mono">v1.0.0</span>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <StatusCard
          isActive={isActive}
          onToggle={toggle}
          timerSeconds={timerSeconds}
          loading={loading}
        />

        <TimerControl
          isActive={isActive}
          onStartTimer={startWithTimer}
          timerSeconds={timerSeconds}
          onCancelTimer={cancelTimer}
        />

        <SettingsPanel />

        <footer className="text-center text-xs text-neutral-600 py-2">
          Press Ctrl+Shift+K to toggle anywhere
        </footer>
      </div>
    </div>
  );
}

export default App;
