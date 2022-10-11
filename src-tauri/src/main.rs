#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
use tauri_plugin_sql::TauriSql;
use std::{env};
use tauri::{generate_handler};
mod setup;

fn main() {
    let builder = tauri::Builder::default();
    let context = tauri::generate_context!();

    builder
        .setup(setup::init)
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .skip_check_on_window_create()
                .build(),
        )
        .plugin(TauriSql::default())
        .invoke_handler(generate_handler![greet])
        .run(context)
        .expect("error while running tauri application");
}
