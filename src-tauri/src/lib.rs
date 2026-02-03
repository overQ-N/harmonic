// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// 模块定义
pub mod commands;
pub mod metadata;
pub mod models;

use commands::{
    greet, list_audio_files, read_file_as_base64, read_file_metadata, set_ignore_cursor_events,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_audio_files,
            read_file_metadata,
            read_file_as_base64,
            set_ignore_cursor_events
        ])
        .setup(|_app| {
            // 窗口已在 tauri.conf.json 中定义，无需重复创建
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
