/**
 * Song ngữ Việt / Anh.
 *
 * - <L vi=… en=… />  : chữ trong dòng. Render CẢ HAI bản (span display: contents), CSS ẩn bản không dùng
 *                       theo <html data-lang>. Dùng được trong server component, không nháy khi tải trang.
 * - <LB vi=… en=… /> : giống L nhưng bọc bằng div — dùng khi bên trong có khối (p, ul, table…).
 * - useT() / useLang() (lib/lang.ts) : cho chuỗi trong thuộc tính (aria-label, title, placeholder),
 *                       <option>, chữ trong SVG, hoặc chuỗi tính toán trong client component.
 */
import type { ReactNode } from 'react';

export type Lang = 'vi' | 'en';
export type Bi = { vi: string; en: string };

export function L({ vi, en }: { vi: ReactNode; en: ReactNode }) {
  return (
    <>
      <span className="l-vi" lang="vi">{vi}</span>
      <span className="l-en" lang="en">{en}</span>
    </>
  );
}

export function LB({ vi, en }: { vi: ReactNode; en: ReactNode }) {
  return (
    <>
      <div className="l-vi" lang="vi">{vi}</div>
      <div className="l-en" lang="en">{en}</div>
    </>
  );
}

/** Hiện một chuỗi song ngữ dạng { vi, en }. */
export function T({ s }: { s: Bi }) {
  return <L vi={s.vi} en={s.en} />;
}
