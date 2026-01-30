// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
            read_file_as_base64
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
struct AudioFile {
    path: String,
    name: String,
    size: u64,
    extension: String,
}

#[tauri::command]
async fn list_audio_files(path: String) -> Result<Vec<AudioFile>, String> {
    let dir_path = Path::new(&path);
    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }
    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let mut audio_files = Vec::new();
    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let file_path = entry.path();
        if file_path.is_file() {
            let extension = file_path
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("")
                .to_lowercase();
            // Supported audio extensions
            let audio_extensions = ["mp3", "wav", "flac", "m4a", "ogg", "aac"];
            if audio_extensions.contains(&extension.as_str()) {
                let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
                let name = file_path
                    .file_stem()
                    .and_then(|stem| stem.to_str())
                    .unwrap_or("")
                    .to_string();
                audio_files.push(AudioFile {
                    path: file_path.to_string_lossy().to_string(),
                    name,
                    size: metadata.len(),
                    extension,
                });
            }
        }
    }
    Ok(audio_files)
}

#[tauri::command]
async fn read_file_metadata(path: String) -> Result<AudioFile, String> {
    let file_path = Path::new(&path);
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    let metadata = fs::metadata(file_path).map_err(|e| e.to_string())?;
    let name = file_path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .unwrap_or("")
        .to_string();
    let extension = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_lowercase();
    Ok(AudioFile {
        path: path,
        name,
        size: metadata.len(),
        extension,
    })
}

#[tauri::command]
async fn read_file_as_base64(path: String) -> Result<String, String> {
    use base64::Engine;
    use std::fs;
    let file_path = Path::new(&path);
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    let bytes = fs::read(file_path).map_err(|e| e.to_string())?;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(encoded)
}
