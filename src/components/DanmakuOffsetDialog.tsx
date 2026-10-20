'use client';

import { TimerReset, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  DANMAKU_OFFSET_MAX_SECONDS,
  DANMAKU_OFFSET_MIN_SECONDS,
  formatDanmakuOffsetSeconds,
  normalizeDanmakuOffsetSeconds,
} from '@/lib/danmaku/offset';

interface DanmakuOffsetDialogProps {
  isOpen: boolean;
  value: number;
  onClose: () => void;
  onSave: (value: number) => void;
}

export default function DanmakuOffsetDialog({
  isOpen,
  value,
  onClose,
  onSave,
}: DanmakuOffsetDialogProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setInputValue(String(value));
    setError('');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, value]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(inputValue);
    if (!inputValue.trim() || !Number.isFinite(parsed)) {
      setError('请输入有效的秒数');
      return;
    }
    if (
      parsed < DANMAKU_OFFSET_MIN_SECONDS ||
      parsed > DANMAKU_OFFSET_MAX_SECONDS
    ) {
      setError(
        `请输入 ${DANMAKU_OFFSET_MIN_SECONDS} 到 ${DANMAKU_OFFSET_MAX_SECONDS} 之间的秒数`
      );
      return;
    }

    onSave(normalizeDanmakuOffsetSeconds(parsed));
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4'
      role='presentation'
      onClick={onClose}
    >
      <form
        className='w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900'
        role='dialog'
        aria-modal='true'
        aria-labelledby='danmaku-offset-title'
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className='flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-300'>
              <TimerReset className='h-5 w-5' />
            </div>
            <div>
              <h2
                id='danmaku-offset-title'
                className='text-base font-semibold text-gray-900 dark:text-gray-100'
              >
                弹幕校准
              </h2>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                当前 {formatDanmakuOffsetSeconds(value)}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            aria-label='关闭'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='p-5'>
          <label
            htmlFor='danmaku-offset-input'
            className='text-sm font-medium text-gray-700 dark:text-gray-200'
          >
            时间偏移（秒）
          </label>
          <div className='mt-2 flex items-center rounded-md border border-gray-300 bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 dark:border-gray-600 dark:bg-gray-950'>
            <input
              id='danmaku-offset-input'
              type='number'
              inputMode='decimal'
              step='0.1'
              min={DANMAKU_OFFSET_MIN_SECONDS}
              max={DANMAKU_OFFSET_MAX_SECONDS}
              autoFocus
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setError('');
              }}
              className='min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none dark:text-gray-100'
            />
            <span className='px-3 text-sm text-gray-500 dark:text-gray-400'>
              秒
            </span>
          </div>
          <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
            正数延后，负数提前
          </p>
          {error && (
            <p className='mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300'>
              {error}
            </p>
          )}
        </div>

        <div className='flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-700'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          >
            取消
          </button>
          <button
            type='submit'
            className='rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700'
          >
            应用
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
