use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use tauri::{Emitter, Manager};
use tauri_plugin_notification::NotificationExt;

pub struct KeepAwakeState(pub std::sync::Mutex<Option<keepawake::KeepAwake>>);

impl KeepAwakeState {
    fn start(&self) -> Result<bool, String> {
        let mut guard = self.0.lock().map_err(|e| e.to_string())?;
        if guard.is_none() {
            let awake = keepawake::Builder::default()
                .display(true)
                .idle(true)
                .reason("Don't Sleep app")
                .create()
                .map_err(|e| e.to_string())?;
            *guard = Some(awake);
        }
        Ok(true)
    }

    fn stop(&self) -> Result<bool, String> {
        let mut guard = self.0.lock().map_err(|e| e.to_string())?;
        *guard = None;
        Ok(false)
    }

    fn toggle(&self) -> Result<bool, String> {
        let mut guard = self.0.lock().map_err(|e| e.to_string())?;
        if guard.is_some() {
            *guard = None;
            Ok(false)
        } else {
            let awake = keepawake::Builder::default()
                .display(true)
                .idle(true)
                .reason("Don't Sleep app")
                .create()
                .map_err(|e| e.to_string())?;
            *guard = Some(awake);
            Ok(true)
        }
    }

    fn status(&self) -> Result<bool, String> {
        let guard = self.0.lock().map_err(|e| e.to_string())?;
        Ok(guard.is_some())
    }
}

pub fn run() {
    println!("[lib] Building Tauri app...");
    let result = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            println!("[single-instance] Second instance detected, focusing window...");
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostarted"]),
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("CmdOrCtrl+Shift+K")
                .expect("failed to parse global shortcut")
                .with_handler(|app, _shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        println!("[shortcut] CmdOrCtrl+Shift+K pressed");
                        let state = app.state::<KeepAwakeState>();
                        let new_active = match state.toggle() {
                            Ok(active) => active,
                            Err(e) => {
                                eprintln!("[shortcut] toggle failed: {}", e);
                                return;
                            }
                        };
                        let _ = app.emit(
                            "keep-awake-changed",
                            serde_json::json!({ "active": new_active }),
                        );
                        let _ = app
                            .notification()
                            .builder()
                            .title("Don't Sleep")
                            .body(if new_active {
                                "Keep awake enabled"
                            } else {
                                "Keep awake disabled"
                            })
                            .show();
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .manage(KeepAwakeState(std::sync::Mutex::new(None)))
        .setup(|app| {
            println!("[setup] Tauri setup hook started");
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
                use tauri::tray::TrayIconBuilder;

                // Tracks whether the user explicitly chose "Quit" from the tray menu.
                // Prevents the CloseRequested handler from trying to hide the window
                // while the event loop is already shutting down, which can trigger
                // a tao panic on Windows ("cannot move state from Destroyed").
                let is_quitting = Arc::new(AtomicBool::new(false));
                let is_quitting_tray = is_quitting.clone();
                let is_quitting_window = is_quitting.clone();

                println!("[setup] Creating tray menu...");
                let menu = Menu::with_items(
                    app,
                    &[
                        &MenuItem::with_id(app, "show", "Show", true, None::<&str>)?,
                        &PredefinedMenuItem::separator(app)?,
                        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
                    ],
                )?;
                println!("[setup] Tray menu created");

                println!("[setup] Building tray icon...");
                let tray_builder = TrayIconBuilder::new()
                    .tooltip("Don't Sleep")
                    .menu(&menu)
                    .on_menu_event(move |app, event| {
                        match event.id.as_ref() {
                            "show" => {
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                            "quit" => {
                                is_quitting_tray.store(true, Ordering::Relaxed);
                                app.exit(0);
                            }
                            _ => {}
                        }
                    });

                let tray_builder = if let Some(icon) = app.default_window_icon() {
                    println!("[setup] Using default window icon for tray");
                    tray_builder.icon(icon.clone())
                } else {
                    println!("[setup] WARNING: no default window icon found");
                    tray_builder
                };

                tray_builder.build(app)?;
                println!("[setup] Tray icon built successfully");

                // Hide window on close instead of exiting
                let app_handle = app.handle().clone();
                if let Some(window) = app.get_webview_window("main") {
                    println!("[setup] Attaching CloseRequested handler...");
                    window.on_window_event(move |event| {
                        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                            if is_quitting_window.load(Ordering::Relaxed) {
                                // Let the event loop shut down cleanly.
                                return;
                            }
                            if let Some(window) = app_handle.get_webview_window("main") {
                                println!("[window] CloseRequested intercepted, hiding window...");
                                let _ = window.hide();
                                api.prevent_close();
                            }
                        }
                    });
                }
            }
            println!("[setup] Tauri setup hook completed successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_keep_awake,
            commands::stop_keep_awake,
            commands::toggle_keep_awake,
            commands::get_keep_awake_status
        ])
        .run(tauri::generate_context!());

    match result {
        Ok(()) => println!("[lib] Tauri app exited normally."),
        Err(e) => {
            eprintln!("[lib] CRITICAL ERROR: failed to run Tauri app: {}", e);
            std::fs::write("dont_sleep_app_error.log", format!("ERROR: {}\n", e)).ok();
        }
    }
}

mod commands {
    use tauri::State;

    use crate::KeepAwakeState;

    #[tauri::command]
    pub fn start_keep_awake(state: State<KeepAwakeState>) -> Result<bool, String> {
        println!("[command] start_keep_awake called");
        state.start()
    }

    #[tauri::command]
    pub fn stop_keep_awake(state: State<KeepAwakeState>) -> Result<bool, String> {
        println!("[command] stop_keep_awake called");
        state.stop()
    }

    #[tauri::command]
    pub fn toggle_keep_awake(state: State<KeepAwakeState>) -> Result<bool, String> {
        println!("[command] toggle_keep_awake called");
        state.toggle()
    }

    #[tauri::command]
    pub fn get_keep_awake_status(state: State<KeepAwakeState>) -> Result<bool, String> {
        state.status()
    }
}
