use serde::{Deserialize, Serialize};

/// 音频文件信息结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AudioFile {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub extension: String,
    /// Base64编码的封面图片
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cover: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artist: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub album: Option<String>,
}

impl AudioFile {
    /// 检查是否为支持的音频格式
    pub fn is_supported_format(extension: &str) -> bool {
        matches!(extension, "mp3" | "wav" | "flac" | "m4a" | "ogg" | "aac")
    }
}
