'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Bi, Lang } from '@/components/i18n';

/**
 * Ngôn ngữ hiện tại. Nguồn sự thật là <html data-lang> (đặt bởi script trong <head> trước khi vẽ trang,
 * và bởi setLang). Lần render đầu luôn trả 'vi' để khớp HTML từ server; sau khi mount mới đọc giá trị thật.
 */
const KEY = 'ktmt-lang';
const EVT = 'ktmt-lang-change';

const current = (): Lang =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'vi';

export function applyLang(l: Lang) {
  const root = document.documentElement;
  root.setAttribute('data-lang', l);
  root.setAttribute('lang', l);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(l));
  } catch {
    /* bỏ qua */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: l }));
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>('vi');
  useEffect(() => {
    setLang(current());
    const on = () => setLang(current());
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  return [lang, applyLang];
}

/** const t = useT();  t('Xin chào', 'Hello')  hoặc  t({ vi, en }) */
export function useT() {
  const [lang] = useLang();
  return useCallback(
    (vi: string | Bi, en?: string) => {
      if (typeof vi === 'object') return lang === 'en' ? vi.en : vi.vi;
      return lang === 'en' ? (en ?? vi) : vi;
    },
    [lang],
  );
}
