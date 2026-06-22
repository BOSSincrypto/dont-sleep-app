pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
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
            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
                use tauri::tray::TrayIconBuilder;

                let menu = Menu::with_items(
                    app,
                    &[
                        &MenuItem::with_id(app, "show", "Show", true, None::<&str>)?,
                        &PredefinedMenuItem::separator(app)?,
                        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
                    ],
                )?;

                TrayIconBuilder::new()
                    .menu(&menu)
                    .on_menu_event(|app, event| {
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
                    })
                    .build(app)?;

                // Hide window on close instead of exiting
                if let Some(window) = app.get_webview_window("main") {
                    window.on_window_event(move |event| {
                        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                            window.hide().unwrap();
                            api.prevent_close();
                        }
                    });
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_keep_awake,
            commands::stop_keep_awake,
            commands::get_keep_awake_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod commands {
    use std::sync::Mutex;
    use tauri::State;

    pub struct KeepAwakeState(pub Mutex<Option<keepawake::KeepAwake>>);

    #[tauri::command]
    pub fn start_keep_awake(state: State<KeepAwakeState>) -> Result<(), String> {
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        if guard.is_none() {
            let awake = keepawake::Builder::default()
                .display(true)
                .idle(true)
                .reason("Don't Sleep app")
                .create()
                .map_err(|e| e.to_string())?;
            *guard = Some(awake);
        }
        Ok(())
    }

    #[tauri::command]
    pub fn stop_keep_awake(state: State<KeepAwakeState>) -> Result<(), String> {
        let mut guard = state.0.lock().map_err(|e| e.to_string())?;
        *guard = None;
        Ok(())
    }

    #[tauri::command]
    pub fn get_keep_awake_status(state: State<KeepAwakeState>) -> Result<bool, String> {
        let guard = state.0.lock().map_err(|e| e.to_string())?;
        Ok(guard.is_some())
    }
}

use tauri::Manager;
