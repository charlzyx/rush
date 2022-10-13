#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use qiniu_upload_token::{FileType, UploadPolicy, credential::Credential, prelude::*};
use std::{time::Duration, fmt::Error};
use std::fs::File;
use flate2::read::GzDecoder;
use tar::Archive;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// #[tauri::command]
// fn unzip(file_path: &str, to: &str) -> Result<(), std::io::Error> {
//   let tar_gz = File::open(file_path)?;
//   let tar = GzDecoder::new(tar_gz);
//   let mut archive = Archive::new(tar);
//   archive.unpack(to)?;

//   Ok(())
// }

#[tauri::command]
fn qiniu_get_token(access_key: String, secret_key: String, bucket_name: String, life_time: u64) -> String {
  let upload_policy = UploadPolicy::new_for_bucket(bucket_name, Duration::from_secs(life_time))
    .file_type(FileType::Standard)
    .build();

  let credential = Credential::new(access_key, secret_key);
  let upload_token = upload_policy
    .into_static_upload_token_provider(credential, Default::default());

    let token =  upload_token.to_token_string(Default::default());
    return token.unwrap().to_string();
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
        .invoke_handler(generate_handler![greet, qiniu_get_token])
        .run(context)
        .expect("error while running tauri application");
}
