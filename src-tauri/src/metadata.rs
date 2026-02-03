use base64::Engine;
use std::path::Path;

/// 提取音频文件的元数据（专辑封面、艺术家、专辑名称）
pub fn extract_audio_metadata(
    file_path: &Path,
    extension: &str,
) -> (Option<String>, Option<String>, Option<String>) {
    let mut cover = None;
    let mut artist = None;
    let mut album = None;

    match extension {
        "mp3" => {
            extract_mp3_metadata(file_path, &mut cover, &mut artist, &mut album);
        }
        "flac" => {
            extract_flac_metadata(file_path, &mut cover, &mut artist, &mut album);
        }
        _ => {
            // 其他格式暂不支持元数据提取
        }
    }

    (cover, artist, album)
}

/// 从MP3文件提取元数据
fn extract_mp3_metadata(
    file_path: &Path,
    cover: &mut Option<String>,
    artist: &mut Option<String>,
    album: &mut Option<String>,
) {
    use id3::TagLike;

    if let Ok(tag) = id3::Tag::read_from_path(file_path) {
        *artist = tag.artist().map(|a| a.to_string());
        *album = tag.album().map(|a| a.to_string());

        if let Some(pictures) = tag.pictures().next() {
            if let Ok(encoded) = encode_picture(&pictures.data) {
                *cover = Some(encoded);
            }
        }
    }
}

/// 从FLAC文件提取元数据
fn extract_flac_metadata(
    file_path: &Path,
    cover: &mut Option<String>,
    artist: &mut Option<String>,
    album: &mut Option<String>,
) {
    if let Ok(metaflac) = metaflac::Tag::read_from_path(file_path) {
        if let Some(vorbis) = metaflac.vorbis_comments() {
            *artist = vorbis
                .artist()
                .and_then(|a| a.iter().next())
                .map(|s| s.to_string());
            *album = vorbis
                .album()
                .and_then(|a| a.iter().next())
                .map(|s| s.to_string());
        }

        if let Some(pictures) = metaflac.pictures().next() {
            if let Ok(encoded) = encode_picture(&pictures.data) {
                *cover = Some(encoded);
            }
        }
    }
}

/// 将图片数据编码为Base64字符串
pub fn encode_picture(data: &[u8]) -> Result<String, String> {
    Ok(base64::engine::general_purpose::STANDARD.encode(data))
}
