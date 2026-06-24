import { useState, useEffect } from "react";
import { Settings, Keyboard, Zap, AlertCircle } from "lucide-react";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";

export function SettingsPanel() {
  const [autostart, setAutostart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isEnabled().then(setAutostart).catch(() => {});
  }, []);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const toggleAutostart = async () => {
    try {
      setError(null);
      if (autostart) {
        await disable();
        setAutostart(false);
      } else {
        await enable();
        setAutostart(true);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Autostart error:", e);
      showError(`Autostart error: ${message}`);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">Settings</h3>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">Launch on startup</p>
              <p className="text-xs text-neutral-500">Start automatically when you log in</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium ${
                autostart ? "text-amber-400" : "text-neutral-500"
              }`}
            >
              {autostart ? "Enabled" : "Disabled"}
            </span>
            <button
              onClick={toggleAutostart}
              className={`relative h-6 w-11 rounded-full transition-colors ${autostart ? "bg-amber-500" : "bg-neutral-600"}`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${autostart ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Keyboard className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">Global hotkey</p>
              <p className="text-xs text-neutral-500">Ctrl + Shift + K (toggle on/off)</p>
            </div>
          </div>
          <span className="text-xs rounded-md bg-amber-500/10 text-amber-400 px-2 py-1 font-mono">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
