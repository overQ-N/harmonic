// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{WebviewUrl, WebviewWindowBuilder};

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
        .setup(|_app| {
            // 窗口已在 tauri.conf.json 中定义，无需重复创建
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use id3::TagLike;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::{fmt, fs};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AudioFile {
    path: String,
    name: String,
    size: u64,
    extension: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    cover: Option<String>, // Base64编码的封面图片
    #[serde(skip_serializing_if = "Option::is_none")]
    artist: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    album: Option<String>,
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

                // 提取元数据和封面
                let (cover, artist, album) = extract_audio_metadata(&file_path, &extension);

                audio_files.push(AudioFile {
                    path: file_path.to_string_lossy().to_string(),
                    name,
                    size: metadata.len(),
                    extension,
                    cover,
                    artist,
                    album,
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

    let (cover, artist, album) = extract_audio_metadata(&file_path, &extension);

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

// 辅助函数：提取音频元数据
fn extract_audio_metadata(
    file_path: &Path,
    extension: &str,
) -> (Option<String>, Option<String>, Option<String>) {
    let mut cover = None;
    let mut artist = None;
    let mut album = None;

    match extension {
        "mp3" => {
            if let Ok(tag) = id3::Tag::read_from_path(file_path) {
                artist = tag.artist().map(|a| a.to_string());
                album = tag.album().map(|a| a.to_string());
                println!("album: {:?}", album);
                if let Some(pictures) = tag.pictures().next() {
                    if let Ok(encoded) = base64_encode_picture(&pictures.data) {
                        cover = Some(encoded);
                        println!("cover: {:?}", cover);
                    }
                }
            }
        }
        "flac" => {
            if let Ok(metaflac) = metaflac::Tag::read_from_path(file_path) {
                if let Some(vorbis) = metaflac.vorbis_comments() {
                    artist = vorbis
                        .artist()
                        .and_then(|mut a| a.iter().next())
                        .map(|s| s.to_string());
                    album = vorbis
                        .album()
                        .and_then(|mut a| a.iter().next())
                        .map(|s| s.to_string());
                }

                if let Some(pictures) = metaflac.pictures().next() {
                    if let Ok(encoded) = base64_encode_picture(&pictures.data) {
                        cover = Some(encoded);
                    }
                }
            }
        }
        _ => {
            // 其他格式暂不支持元数据提取
        }
    }

    (cover, artist, album)
}

fn base64_encode_picture(data: &[u8]) -> Result<String, String> {
    use base64::Engine;
    Ok(base64::engine::general_purpose::STANDARD.encode(data))
}
