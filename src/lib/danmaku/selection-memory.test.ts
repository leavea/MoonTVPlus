import {
  buildDanmakuSelectionMemoryKey,
  clearDanmakuSelectionMemory,
  getDanmakuAnimeId,
  getDanmakuSearchKeyword,
  getDanmakuSourceIndex,
  getManualDanmakuSelection,
  saveDanmakuAnimeId,
  saveDanmakuSearchKeyword,
  saveDanmakuSourceIndex,
  saveManualDanmakuSelection,
} from './selection-memory';

describe('danmaku selection memory', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('builds a source-independent key from the search title and year', () => {
    expect(
      buildDanmakuSelectionMemoryKey({
        title: '  进击的巨人  ',
        year: '2013',
      })
    ).toBe('title:进击的巨人:2013');

    expect(
      buildDanmakuSelectionMemoryKey({
        title: 'Ｔｈｅ　Ｂｏｙｓ',
        year: '2024',
      })
    ).toBe('title:theboys:2024');
  });

  it('falls back to external content IDs when no title is available', () => {
    expect(
      buildDanmakuSelectionMemoryKey({
        doubanId: 123,
        tmdbId: 456,
      })
    ).toBe('douban:123');

    expect(
      buildDanmakuSelectionMemoryKey({
        tmdbId: 456,
      })
    ).toBe('tmdb:456');
  });

  it('persists the selected source and keyword across browser sessions', () => {
    const memoryKey = 'title:测试剧集:2025';

    saveDanmakuAnimeId(memoryKey, 9527);
    saveDanmakuSourceIndex(memoryKey, 2);
    saveDanmakuSearchKeyword(memoryKey, '测试剧集 别名');
    saveManualDanmakuSelection(memoryKey, 4, 10086);

    window.sessionStorage.clear();

    expect(getDanmakuAnimeId(memoryKey)).toBe(9527);
    expect(getDanmakuSourceIndex(memoryKey)).toBe(2);
    expect(getDanmakuSearchKeyword(memoryKey)).toBe('测试剧集 别名');
    expect(getManualDanmakuSelection(memoryKey, 4)).toBe(10086);
  });

  it('migrates legacy session values into persistent storage', () => {
    const memoryKey = 'title:旧记忆:2023';
    window.sessionStorage.setItem(`danmaku_selection_anime_${memoryKey}`, '42');

    expect(getDanmakuAnimeId(memoryKey)).toBe(42);
    expect(
      window.localStorage.getItem(`danmaku_selection_anime_${memoryKey}`)
    ).toBe('42');
  });

  it('clears only the requested content memory', () => {
    const firstKey = 'title:第一部:2024';
    const secondKey = 'title:第二部:2024';

    saveDanmakuAnimeId(firstKey, 1);
    saveDanmakuSearchKeyword(firstKey, '第一部');
    saveManualDanmakuSelection(firstKey, 0, 11);
    saveDanmakuAnimeId(secondKey, 2);

    clearDanmakuSelectionMemory(firstKey);

    expect(getDanmakuAnimeId(firstKey)).toBeNull();
    expect(getDanmakuSearchKeyword(firstKey)).toBeNull();
    expect(getManualDanmakuSelection(firstKey, 0)).toBeNull();
    expect(getDanmakuAnimeId(secondKey)).toBe(2);
  });
});
