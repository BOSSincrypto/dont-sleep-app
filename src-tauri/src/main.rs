#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::panic;

fn main() {
    panic::set_hook(Box::new(|info| {
        eprintln!("[PANIC] {}", info);
        std::fs::write(
            "dont_sleep_app_panic.log",
            format!("PANIC: {}\n", info),
        ).ok();
    }));

    println!("[main] Starting Don't Sleep app...");
    dont_sleep_app_lib::run();
    println!("[main] Don't Sleep app exited normally.");
}
