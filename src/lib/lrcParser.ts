/**
 * 解析LRC歌词格式
 * 每行格式：[mm:ss.xx]歌词文本
 * 返回按时间排序的数组，每个元素包含时间（秒）和文本
 */
export interface LyricLine {
  time: number; // 秒
  text: string;
}

export function parseLRC(lrcText: string): LyricLine[] {
  const lines = lrcText.split("\n");
  const result: LyricLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 匹配时间标签，可能有多个标签（同一句歌词多个时间点）
    // 格式 [mm:ss.xx] 或 [mm:ss]
    const timeTagRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
    const timeTags = [];
    let match;
    let lastIndex = 0;
    while ((match = timeTagRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3], 10) : 0;
      // 毫秒部分：如果是两位数则代表百分之一秒，三位数代表毫秒
      const ms = match[3]?.length === 2 ? milliseconds * 10 : milliseconds;
      const timeInSeconds = minutes * 60 + seconds + ms / 1000;
      timeTags.push(timeInSeconds);
      lastIndex = timeTagRegex.lastIndex;
    }

    const text = trimmed.slice(lastIndex).trim();
    if (timeTags.length > 0) {
      // 每个时间标签都创建一条歌词行（同一句歌词多个时间点）
      for (const time of timeTags) {
        result.push({ time, text });
      }
    } else {
      // 没有时间标签的行（如专辑信息）忽略或作为无时间歌词
      // 这里忽略
    }
  }

  // 按时间排序
  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * 根据当前播放时间找到当前应显示的歌词行索引
 * 返回 -1 表示没有匹配的行
 */
export function findCurrentLineIndex(lyrics: LyricLine[], currentTime: number): number {
  // 如果当前时间小于第一行的时间，返回 -1
  if (lyrics.length === 0 || currentTime < lyrics[0].time) {
    return -1;
  }

  // 二分查找最后一个时间小于等于 currentTime 的行
  let left = 0;
  let right = lyrics.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (lyrics[mid].time <= currentTime) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}
