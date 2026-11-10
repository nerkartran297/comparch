'use client';
import { useCallback, useEffect, useState } from 'react';

/** Lưu trạng thái nhỏ (tiến độ, checklist) trong trình duyệt. Lỗi localStorage thì vẫn chạy bình thường. */
const EVT = 'ktmt-storage';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const sync = (e: Event) => {
      const k = (e as CustomEvent<string>).detail;
      if (!k || k === key) setValue(read(key, fallback));
    };
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* bỏ qua: chế độ ẩn danh hoặc bị chặn */
        }
        queueMicrotask(() => window.dispatchEvent(new CustomEvent(EVT, { detail: key })));
        return v;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export function useProgress() {
  const [done, setDone] = useStored<Record<string, boolean>>('ktmt-progress-v1', {});
  const toggle = useCallback(
    (id: string, v?: boolean) => setDone((d) => ({ ...d, [id]: v ?? !d[id] })),
    [setDone],
  );
  return { done, toggle };
}
