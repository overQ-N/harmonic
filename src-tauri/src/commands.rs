use crate::metadata::extract_audio_metadata;
use crate::models::AudioFile;
use std::fs;
use std::path::Path;
use tauri::{AppHandle, Manager, WebviewWindow};

/// 列出目录中的所有音频文件
#[tauri::command]
pub async fn list_audio_files(path: String) -> Result<Vec<AudioFile>, String> {
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
            if let Some(audio_file) = process_audio_file(&file_path) {
                audio_files.push(audio_file);
            }
        }
    }

    Ok(audio_files)
}

/// 读取单个音频文件的元数据
#[tauri::command]
pub async fn read_file_metadata(path: String) -> Result<AudioFile, String> {
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

    let (cover, artist, album) = extract_audio_metadata(file_path, &extension);

    Ok(AudioFile {
        path,
        name,
        size: metadata.len(),
        extension,
        cover,
        artist,
        album,
    })
}

/// 读取文件并转换为Base64编码
#[tauri::command]
pub async fn read_file_as_base64(path: String) -> Result<String, String> {
    use base64::Engine;

    let file_path = Path::new(&path);
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }

    let bytes = fs::read(file_path).map_err(|e| e.to_string())?;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(encoded)
}

/// 问候命令（示例）
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 辅助函数

/// 处理单个音频文件
fn process_audio_file(file_path: &Path) -> Option<AudioFile> {
    let extension = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("")
        .to_lowercase();

    if !AudioFile::is_supported_format(&extension) {
        return None;
    }

    let metadata = fs::metadata(file_path).ok()?;
    let name = file_path
        .file_stem()
        .and_then(|stem| stem.to_str())
        .unwrap_or("")
        .to_string();

    let (cover, artist, album) = extract_audio_metadata(file_path, &extension);

    Some(AudioFile {
        path: file_path.to_string_lossy().to_string(),
        name,
        size: metadata.len(),
        extension,
        cover,
        artist,
        album,
    })
}

// 定义一个命令，用来切换“忽略鼠标事件”的状态
#[tauri::command]
pub fn set_ignore_cursor_events(app: AppHandle, label: String, ignore: bool) {
    // ignore = true  => 鼠标穿透（无法点击窗口）
    // ignore = false => 鼠标不穿透（可以点击、拖动窗口）
    if let Some(win) = app.get_webview_window(&label) {
        win.set_ignore_cursor_events(ignore).unwrap_or_else(|e| {
            eprintln!("Failed to set ignore cursor events: {}", e);
        });
    }
}
