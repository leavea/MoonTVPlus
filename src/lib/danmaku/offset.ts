export const DANMAKU_OFFSET_MIN_SECONDS = -180;
export const DANMAKU_OFFSET_MAX_SECONDS = 180;
export const DANMAKU_OFFSET_STEP_SECONDS = 0.1;

const DANMAKU_OFFSET_STORAGE_KEY = 'danmaku_episode_offsets_v1';

function buildDanmakuOffsetKey(
  source: string,
  id: string,
  episodeIndex: number
): string {
  return `${source}\\u0000${id}\\u0000${episodeIndex}`;
}

export function normalizeDanmakuOffsetSeconds(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const clamped = Math.max(
    DANMAKU_OFFSET_MIN_SECONDS,
    Math.min(DANMAKU_OFFSET_MAX_SECONDS, value)
  );
  return (
    Math.round(clamped / DANMAKU_OFFSET_STEP_SECONDS) *
    DANMAKU_OFFSET_STEP_SECONDS
  );
}

export function shiftDanmakuTime(
  time: number,
  offsetSeconds: number
): number {
  const safeTime = Number.isFinite(time) ? time : 0;
  return Math.max(
    0,
    safeTime + normalizeDanmakuOffsetSeconds(offsetSeconds)
  );
}

export function formatDanmakuOffsetSeconds(value: number): string {
  const offset = normalizeDanmakuOffsetSeconds(value);
  if (offset === 0) {
    return '0s';
  }

  const formatted = Number.isInteger(offset)
    ? String(offset)
    : offset.toFixed(1);
  return `${offset > 0 ? '+' : ''}${formatted}s`;
}

export function loadDanmakuOffsetSeconds(
  source: string,
  id: string,
  episodeIndex: number
): number {
  if (typeof window === 'undefined' || !source || !id) {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem(DANMAKU_OFFSET_STORAGE_KEY);
    if (!raw) {
      return 0;
    }

    const offsets = JSON.parse(raw) as Record<string, unknown>;
    const value = offsets[buildDanmakuOffsetKey(source, id, episodeIndex)];
    return typeof value === 'number'
      ? normalizeDanmakuOffsetSeconds(value)
      : 0;
  } catch {
    return 0;
  }
}

export function saveDanmakuOffsetSeconds(
  source: string,
  id: string,
  episodeIndex: number,
  value: number
): void {
  if (typeof window === 'undefined' || !source || !id) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(DANMAKU_OFFSET_STORAGE_KEY);
    const offsets = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    offsets[buildDanmakuOffsetKey(source, id, episodeIndex)] =
      normalizeDanmakuOffsetSeconds(value);
    window.localStorage.setItem(
      DANMAKU_OFFSET_STORAGE_KEY,
      JSON.stringify(offsets)
    );
  } catch {
    // 时间校准失败不应影响弹幕播放。
  }
}
