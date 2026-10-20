import {
  formatDanmakuOffsetSeconds,
  loadDanmakuOffsetSeconds,
  normalizeDanmakuOffsetSeconds,
  saveDanmakuOffsetSeconds,
  shiftDanmakuTime,
} from './offset';

describe('danmaku offset', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('normalizes and formats offsets', () => {
    expect(normalizeDanmakuOffsetSeconds(12.26)).toBe(12.5);
    expect(normalizeDanmakuOffsetSeconds(-999)).toBe(-180);
    expect(formatDanmakuOffsetSeconds(12.5)).toBe('+12.5s');
    expect(formatDanmakuOffsetSeconds(-3)).toBe('-3s');
  });

  it('shifts danmaku time without going below zero', () => {
    expect(shiftDanmakuTime(10, 65)).toBe(75);
    expect(shiftDanmakuTime(2, -5)).toBe(0);
  });

  it('stores offsets per episode', () => {
    saveDanmakuOffsetSeconds('source-a', 'video-1', 2, 30);
    saveDanmakuOffsetSeconds('source-a', 'video-1', 3, -2.5);

    expect(loadDanmakuOffsetSeconds('source-a', 'video-1', 2)).toBe(30);
    expect(loadDanmakuOffsetSeconds('source-a', 'video-1', 3)).toBe(-2.5);
    expect(loadDanmakuOffsetSeconds('source-a', 'video-1', 4)).toBe(0);
    expect(loadDanmakuOffsetSeconds('source-b', 'video-1', 2)).toBe(0);
  });
});
