/**
 * 弹幕选择记忆管理
 * 用于记住用户选择的弹幕源，避免换集、换视频源或重新进入时重复搜索和选择
 */

const STORAGE_KEY_PREFIX = 'danmaku_selection_';

export interface DanmakuSelectionMemoryIdentity {
  title?: string | null;
  year?: string | null;
  doubanId?: number | null;
  tmdbId?: number | null;
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
}

/**
 * 生成与播放源无关的弹幕记忆键。
 * 优先使用搜索标题，其次使用外部内容 ID，避免不同播放源返回的标题略有差异时失效。
 */
export function buildDanmakuSelectionMemoryKey(
  identity: DanmakuSelectionMemoryIdentity
): string {
  const title = normalizeText(identity.title || '');
  if (title) {
    const year = normalizeText(identity.year || '');
    return `title:${title}${year ? `:${year}` : ''}`;
  }

  if (typeof identity.doubanId === 'number' && identity.doubanId > 0) {
    return `douban:${identity.doubanId}`;
  }

  if (typeof identity.tmdbId === 'number' && identity.tmdbId > 0) {
    return `tmdb:${identity.tmdbId}`;
  }

  return '';
}

/**
 * 优先读取 localStorage，并兼容升级前写入 sessionStorage 的临时记忆。
 */
function getStoredValue(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const persistentValue = window.localStorage.getItem(key);
    if (persistentValue !== null) {
      return persistentValue;
    }

    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue !== null) {
      window.localStorage.setItem(key, sessionValue);
      return sessionValue;
    }
  } catch (error) {
    console.error('[弹幕记忆] 读取记忆失败:', error);
  }

  return null;
}

/**
 * 保存自动搜索时用户选择的弹幕源下标
 * @param memoryKey 稳定的内容记忆键
 * @param selectedIndex 用户选择的弹幕源在搜索结果中的下标
 */
export function saveDanmakuSourceIndex(
  memoryKey: string,
  selectedIndex: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_KEY_PREFIX}index_${memoryKey}`;
    window.localStorage.setItem(key, selectedIndex.toString());
    console.log(`[弹幕记忆] 保存弹幕源下标: ${memoryKey} -> ${selectedIndex}`);
  } catch (error) {
    console.error('[弹幕记忆] 保存下标失败:', error);
  }
}

/**
 * 获取自动搜索时上次选择的弹幕源下标
 * @param memoryKey 稳定的内容记忆键
 * @returns 上次选择的下标，如果没有记录则返回 null
 */
export function getDanmakuSourceIndex(memoryKey: string): number | null {
  const key = `${STORAGE_KEY_PREFIX}index_${memoryKey}`;
  const value = getStoredValue(key);

  if (value !== null) {
    const index = parseInt(value, 10);
    if (!isNaN(index) && index >= 0) {
      console.log(`[弹幕记忆] 读取弹幕源下标: ${memoryKey} -> ${index}`);
      return index;
    }
  }

  return null;
}

/**
 * 保存用户手动选择的弹幕剧集 ID
 * @param memoryKey 稳定的内容记忆键
 * @param episodeIndex 视频集数下标
 * @param episodeId 弹幕剧集 ID
 */
export function saveManualDanmakuSelection(
  memoryKey: string,
  episodeIndex: number,
  episodeId: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_KEY_PREFIX}manual_${memoryKey}_${episodeIndex}`;
    window.localStorage.setItem(key, episodeId.toString());
    console.log(
      `[弹幕记忆] 保存手动选择: ${memoryKey} 第${episodeIndex}集 -> ${episodeId}`
    );
  } catch (error) {
    console.error('[弹幕记忆] 保存手动选择失败:', error);
  }
}

/**
 * 获取用户手动选择的弹幕剧集 ID
 * @param memoryKey 稳定的内容记忆键
 * @param episodeIndex 视频集数下标
 * @returns 弹幕剧集 ID，如果没有记录则返回 null
 */
export function getManualDanmakuSelection(
  memoryKey: string,
  episodeIndex: number
): number | null {
  const key = `${STORAGE_KEY_PREFIX}manual_${memoryKey}_${episodeIndex}`;
  const value = getStoredValue(key);

  if (value !== null) {
    const episodeId = parseInt(value, 10);
    if (!isNaN(episodeId)) {
      console.log(
        `[弹幕记忆] 读取手动选择: ${memoryKey} 第${episodeIndex}集 -> ${episodeId}`
      );
      return episodeId;
    }
  }

  return null;
}

/**
 * 清除指定视频的所有弹幕选择记忆
 * @param memoryKey 稳定的内容记忆键
 */
export function clearDanmakuSelectionMemory(memoryKey: string): void {
  if (typeof window === 'undefined') return;

  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (
          key &&
          (key === `${STORAGE_KEY_PREFIX}index_${memoryKey}` ||
            key === `${STORAGE_KEY_PREFIX}keyword_${memoryKey}` ||
            key === `${STORAGE_KEY_PREFIX}anime_${memoryKey}` ||
            key.startsWith(`${STORAGE_KEY_PREFIX}manual_${memoryKey}_`))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
    }

    console.log(`[弹幕记忆] 清除记忆: ${memoryKey}`);
  } catch (error) {
    console.error('[弹幕记忆] 清除记忆失败:', error);
  }
}

/**
 * 清除所有弹幕选择记忆
 */
export function clearAllDanmakuSelectionMemory(): void {
  if (typeof window === 'undefined') return;

  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
    }

    console.log('[弹幕记忆] 清除所有记忆');
  } catch (error) {
    console.error('[弹幕记忆] 清除所有记忆失败:', error);
  }
}

/**
 * 保存用户搜索的弹幕关键词
 * @param memoryKey 稳定的内容记忆键
 * @param keyword 搜索关键词
 */
export function saveDanmakuSearchKeyword(
  memoryKey: string,
  keyword: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_KEY_PREFIX}keyword_${memoryKey}`;
    window.localStorage.setItem(key, keyword);
    console.log(`[弹幕记忆] 保存搜索关键词: ${memoryKey} -> ${keyword}`);
  } catch (error) {
    console.error('[弹幕记忆] 保存搜索关键词失败:', error);
  }
}

/**
 * 获取用户搜索的弹幕关键词
 * @param memoryKey 稳定的内容记忆键
 * @returns 搜索关键词，如果没有记录则返回 null
 */
export function getDanmakuSearchKeyword(memoryKey: string): string | null {
  const key = `${STORAGE_KEY_PREFIX}keyword_${memoryKey}`;
  const keyword = getStoredValue(key);

  if (keyword) {
    console.log(`[弹幕记忆] 读取搜索关键词: ${memoryKey} -> ${keyword}`);
    return keyword;
  }

  return null;
}

/**
 * 保存用户选择的弹幕动漫ID（用于换集、换源和重新进入时自动匹配）
 * @param memoryKey 稳定的内容记忆键
 * @param animeId 弹幕动漫ID
 */
export function saveDanmakuAnimeId(memoryKey: string, animeId: number): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_KEY_PREFIX}anime_${memoryKey}`;
    window.localStorage.setItem(key, animeId.toString());
    console.log(`[弹幕记忆] 保存动漫ID: ${memoryKey} -> ${animeId}`);
  } catch (error) {
    console.error('[弹幕记忆] 保存动漫ID失败:', error);
  }
}

/**
 * 获取用户选择的弹幕动漫ID
 * @param memoryKey 稳定的内容记忆键
 * @returns 弹幕动漫ID，如果没有记录则返回 null
 */
export function getDanmakuAnimeId(memoryKey: string): number | null {
  const key = `${STORAGE_KEY_PREFIX}anime_${memoryKey}`;
  const value = getStoredValue(key);

  if (value !== null) {
    const animeId = parseInt(value, 10);
    if (!isNaN(animeId)) {
      console.log(`[弹幕记忆] 读取动漫ID: ${memoryKey} -> ${animeId}`);
      return animeId;
    }
  }

  return null;
}
