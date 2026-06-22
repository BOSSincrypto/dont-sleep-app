import { useState, useEffect } from "react";
import { Settings, Sun, Moon, Keyboard, Zap } from "lucide-react";
import { isEnabled, enable, disable } from "@tauri-apps/plugin-autostart";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { sendNotification } from "@tauri-apps/plugin-notification";

export function SettingsPanel() {
  const [autostart, setAutostart] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system");

  useEffect(() => {
    isEnabled().then(setAutostart).catch(() => {});
  }, []);

  const toggleAutostart = async () => {
    try {
      if (autostart) {
        await disable();
        setAutostart(false);
      } else {
        await enable();
        setAutostart(true);
      }
    } catch (e) {
      console.error("Autostart error:", e);
    }
  };

  const registerHotkey = async () => {
    try {
      await register("CommandOrControl+Shift+K", (event) => {
        if (event.state === "Pressed") {
          sendNotification({ title: "Don't Sleep", body: "Global hotkey pressed" });
        }
      });
    } catch (e) {
      console.error("Hotkey error:", e);
    }
  };

  useEffect(() => {
    registerHotkey();
    return () => {
      unregister("CommandOrControl+Shift+K").catch(() => {});
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">Settings</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">Launch on startup</p>
              <p className="text-xs text-neutral-500">Start automatically when you log in</p>
            </div>
          </div>
          <button
            onClick={toggleAutostart}
            className={`relative h-6 w-11 rounded-full transition-colors ${autostart ? "bg-amber-500" : "bg-neutral-600"}`}
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${autostart ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
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

        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-3">
            {theme === "light" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-amber-400" />}
            <div>
              <p className="text-sm font-medium text-white">Appearance</p>
              <p className="text-xs text-neutral-500">System theme</p>
            </div>
          </div>
          <div className="flex gap-1">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${theme === t ? "bg-amber-500 text-neutral-900" : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"}`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
