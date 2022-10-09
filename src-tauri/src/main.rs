#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
#[macro_use]
extern crate objc;
extern crate lazy_static;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::{env};

#[cfg(target_os = "macos")]
use tauri::Menu;
use tauri::{generate_handler, Window, WindowEvent};
mod setup;
mod window_ext;

fn main() {
    let builder = tauri::Builder::default();
    let context = tauri::generate_context!();

    #[cfg(target_os = "macos")]
    let builder = builder.menu(Menu::os_default(&context.package_info().name));

    #[cfg(target_os = "windows")]
    let builder = builder.setup(|app| {
        use tauri::Manager;
        // windows main window create not trigger in `on_window_event`
        let main_window = app.get_window("main").unwrap();
        use window_ext::WindowExt;
        main_window.set_background();
        main_window.set_transparent_titlebar();
        Ok(())
    });

    builder
        .on_page_load(|w: Window, _| w.show().unwrap())
        .on_window_event(|event| match event.event() {
            WindowEvent::Resized(_) | WindowEvent::Moved(_) => {
                let window = event.window();
                #[cfg(any(target_os = "windows", target_os = "macos"))]
                // created event，new window
                {
                    use window_ext::WindowExt;
                    window.set_background();
                    window.set_transparent_titlebar();
                }
                #[cfg(target_os = "macos")]
                // fullscreen/resized event
                // bug: when enter fullscreen emit moved event
                {
                    use window_ext::WindowExt;
                    // https://github.com/tauri-apps/tauri/issues/4519
                    let monitor = window.current_monitor().unwrap().unwrap();
                    let screen = monitor.size();
                    let size = &window.outer_size().unwrap();
                    event.window().set_toolbar_visible(size != screen);
                }
            }
            _ => {}
        })

        .invoke_handler(generate_handler![greet])
        .run(context)
        .expect("error while running tauri application");
}
