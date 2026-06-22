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
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            println!("[setup] Tauri setup hook started");
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
                use tauri::tray::TrayIconBuilder;

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
                let tray_builder = TrayIconBuilder::new().menu(&menu).on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
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
                            if let Some(window) = app_handle.get_webview_window("main") {
                                println!("[window] CloseRequested intercepted, hiding window...");
                                window.hide().unwrap();
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
            commands::get_keep_awake_status
        ])
        .run(tauri::generate_context!());

    match result {
        Ok(()) => println!("[lib] Tauri app exited normally."),
        Err(e) => {
            eprintln!("[lib] CRITICAL ERROR: failed to run Tauri app: {}", e);
            std::fs::write(
                "dont_sleep_app_error.log",
                format!("ERROR: {}\n", e),
            ).ok();
        }
    }
}

mod commands {
    use std::sync::Mutex;
    use tauri::State;

    pub struct KeepAwakeState(pub Mutex<Option<keepawake::KeepAwake>>);

    #[tauri::command]
    pub fn start_keep_awake(state: State<KeepAwakeState>) -> Result<(), String> {
        println!("[command] start_keep_awake called");
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        if guard.is_none() {
            let awake = keepawake::Builder::default()
                .display(true)
                .idle(true)
                .reason("Dont Sleep app")
                .create()
                .map_err(|e| e.to_string())?;
            *guard = Some(awake);
            println!("[command] keepawake started successfully");
        }
        Ok(())
    }

    #[tauri::command]
    pub fn stop_keep_awake(state: State<KeepAwakeState>) -> Result<(), String> {
        println!("[command] stop_keep_awake called");
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        *guard = None;
        println!("[command] keepawake stopped");
        Ok(())
    }

    #[tauri::command]
    pub fn get_keep_awake_status(state: State<KeepAwakeState>) -> Result<bool, String> {
        let guard = state.0.lock().map_err(|e| e.to_string())?;
        Ok(guard.is_some())
    }
}

use tauri::Manager;
