/**
 * Tauri 事件系统集成说明
 * 
 * 功能：当主窗口的 currentTrack 变化时，通过 Tauri 事件系统
 * 将歌词加载请求推送到 LyricsWindow 窗口
 * 
 * 流程图：
 * ┌─────────────────────┐
 * │  useAudioPlayer.ts  │
 * │  (主窗口)           │
 * └──────────┬──────────┘
 *            │ currentTrack 变化
 *            │ 加载音频后
 *            ▼
 * ┌─────────────────────────────────┐
 * │ emit('track-changed', {          │
 * │   trackName: string,             │
 * │   trackPath: string              │
 * │ })                               │
 * └──────────┬──────────────────────┘
 *            │ Tauri 事件系统
 *            ▼
 * ┌─────────────────────┐
 * │  useLyrics.ts       │
 * │  listen 监听事件    │
 * │  (LyricsWindow)     │
 * └──────────┬──────────┘
 *            │ 接收事件
 *            ▼
 * ┌────────────────────────────┐
 * │ loadLyricsForTrack(path)   │
 * │ 加载对应的 .lrc 歌词文件   │
 * └────────────────────────────┘
 * 
 * 
 * 事件数据结构：
 * {
 *   trackName: "歌曲名称"      // 用于日志记录
 *   trackPath: "/path/to/song.mp3"  // 用于查找歌词文件 (.lrc)
 * }
 * 
 * 使用场景：
 * 1. 用户选择新歌曲 -> currentTrack 更新 -> 事件发送 -> LyricsWindow 加载歌词
 * 2. 播放列表自动下一首 -> currentTrack 更新 -> 事件发送 -> LyricsWindow 更新歌词
 * 3. 支持两个窗口（主窗口 + LyricsWindow）之间的通信
 * 
 * 好处：
 * - 解耦：主窗口和 LyricsWindow 互不依赖
 * - 实时性：trackChanged 事件及时通知歌词窗口
 * - 扩展性：将来可以添加其他监听者
 */
