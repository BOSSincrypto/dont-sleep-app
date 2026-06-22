<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/BOSSincrypto/dont-sleep-app/main/src-tauri/icons/128x128.png" width="100" alt="Don't Sleep">
  <br>
  Don't Sleep
  <br>
</h1>

<h4 align="center">Cross-platform utility to keep your device awake. Lightweight. Native. Fast.</h4>

<p align="center">
  <a href="https://github.com/BOSSincrypto/dont-sleep-app/releases/latest">
    <img src="https://img.shields.io/github/v/release/BOSSincrypto/dont-sleep-app?style=flat-square&color=amber" alt="Release">
  </a>
  <a href="https://github.com/BOSSincrypto/dont-sleep-app/actions/workflows/release.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/BOSSincrypto/dont-sleep-app/release.yml?style=flat-square&color=blue" alt="CI">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/BOSSincrypto/dont-sleep-app?style=flat-square&color=green" alt="License">
  </a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square" alt="Platform">
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#download">Download</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#development">Development</a> •
  <a href="#license">License</a>
</p>

---

## Features

- **Toggle with one click** — Instantly prevent your system from sleeping
- **Timer mode** — Set a countdown (5 min / 15 min / 30 min / 1 h / 2 h) and let it auto-disable
- **Global hotkey** — Press `Ctrl + Shift + K` (or `Cmd + Shift + K` on macOS) from anywhere to toggle
- **System tray** — Minimize to tray; app keeps running in the background
- **Auto-start** — Optional launch on system startup
- **Cross-platform** — Native builds for Windows, macOS (Intel & Apple Silicon), and Linux
- **Lightweight** — Built with Tauri + Rust. No Electron bloat. ~5–10 MB binary.

---

## Download

| Platform | Download |
|----------|----------|
| **Windows** | [`.msi` installer](https://github.com/BOSSincrypto/dont-sleep-app/releases/latest) |
| **macOS (Apple Silicon)** | [`.dmg`](https://github.com/BOSSincrypto/dont-sleep-app/releases/latest) |
| **macOS (Intel)** | [`.dmg`](https://github.com/BOSSincrypto/dont-sleep-app/releases/latest) |
| **Linux** | [`.AppImage`](https://github.com/BOSSincrypto/dont-sleep-app/releases/latest) / [`.deb`](https://github.com/BOSSincrypto/dont-sleep-app/releases/latest) |

Or visit the [Releases](https://github.com/BOSSincrypto/dont-sleep-app/releases) page for all artifacts.

> **Note:** Unsigned binaries may trigger SmartScreen (Windows) or Gatekeeper (macOS). Click "More info" → "Run anyway" to proceed.

---

## Tech Stack

- [Tauri v2](https://tauri.app/) — Rust backend + native OS WebView
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — UI
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [keepawake](https://crates.io/crates/keepawake) — Cross-platform sleep prevention (Rust)
- [Lucide React](https://lucide.dev/) — Icons

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://rustup.rs/) (latest stable)
- Platform-specific dependencies:
  - **Windows:** Microsoft Visual C++ Build Tools
  - **macOS:** Xcode Command Line Tools
  - **Linux:** `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`

### Setup

```bash
git clone https://github.com/BOSSincrypto/dont-sleep-app.git
cd dont-sleep-app
npm install
```

### Run in development mode

```bash
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

---

## Auto-Deployment

This repository uses **GitHub Actions** for automated CI/CD:

1. Push a tag matching `v*` (e.g., `v1.0.0`)
2. GitHub Actions builds for Windows, macOS (Intel + ARM), and Linux
3. Artifacts are uploaded to a new GitHub Release draft
4. Review and publish the draft release manually

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Troubleshooting

### Windows: App immediately crashes on launch

1. **Install WebView2 Runtime** — Tauri apps require Microsoft Edge WebView2. The `.msi` installer attempts to download it automatically, but if you run the `.exe` directly or offline, install WebView2 manually from [Microsoft's official page](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).
2. **Check log files** — Starting from v1.0.5, the app writes diagnostic logs next to the executable:
   - `dont_sleep_app_error.log` — Tauri startup errors
   - `dont_sleep_app_panic.log` — Rust panic messages
3. **Run from Command Prompt** — Open `cmd.exe`, navigate to the install folder, and run `Dont Sleep.exe` to see real-time `println!` output.
4. **Visual C++ Redistributables** — Ensure the latest [MSVC redistributables](https://aka.ms/vs/17/release/vc_redist.x64.exe) are installed.

### Windows: SmartScreen warning

The app is not code-signed (certificates cost ~$70–99/year). Click **More info → Run anyway** to proceed.

### macOS: Gatekeeper blocks the app

Right-click the `.app` → **Open**, or run:
```bash
xattr -d com.apple.quarantine /Applications/Dont\ Sleep.app
```

---

## License
n
[MIT](LICENSE) © BOSSinCrypto

---

<p align="center">
  Built with ❤️ and ☕ by <a href="https://github.com/BOSSincrypto">BOSSinCrypto</a>
</p>
