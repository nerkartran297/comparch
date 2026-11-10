'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { STEPS } from '@/lib/nav';
import { useProgress, useStored } from '@/lib/storage';
import { useLab } from './lab/LabProvider';

type Theme = 'system' | 'light' | 'dark';
const THEME_LABEL: Record<Theme, string> = { system: '◐ Tự động', light: '☀ Sáng', dark: '☾ Tối' };

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { done } = useProgress();
  const { openLab } = useLab();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useStored<Theme>('ktmt-theme', 'system');

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  const current = STEPS.find((s) => s.href === path);
  const doneCount = STEPS.filter((s) => done[s.id]).length;
  const cycleTheme = () => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system');

  return (
    <div className="shell">
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Lộ trình học">
        <Link href="/" className="brand">
          <span className="brand-code">IT3030E · HUST</span>
          <span className="brand-name">Kiến trúc Máy tính từ số 0</span>
        </Link>

        <nav>
          <p className="pipe-label">Lộ trình · đã xong {doneCount}/{STEPS.length}</p>
          <ol className="pipe">
            <li className={path === '/' ? 'is-current' : ''}>
              <Link href="/">
                <span className="pipe-node">▸</span>
                <span className="pipe-text">
                  <span className="pipe-short">Bắt đầu ở đây</span>
                  <span className="pipe-title">Lộ trình & bức tranh toàn cảnh</span>
                </span>
              </Link>
            </li>
            {STEPS.map((s) => (
              <li key={s.id} className={`${done[s.id] ? 'is-done' : ''} ${path === s.href ? 'is-current' : ''}`}>
                <Link href={s.href} aria-current={path === s.href ? 'page' : undefined}>
                  <span className="pipe-node">{done[s.id] ? '✓' : s.no}</span>
                  <span className="pipe-text">
                    <span className="pipe-short">{s.short}</span>
                    <span className="pipe-title">{s.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="side-actions">
          <button className="lab-launch" onClick={() => openLab()}>
            <span className="glyph">▶</span>
            <strong>Mở Lab RISC-V</strong>
            <span>Viết, dịch, chạy từng lệnh</span>
          </button>
          <div className="side-row">
            <Link href="/lab">Lab toàn màn hình</Link>
            <button className="theme-btn" onClick={cycleTheme} title="Đổi giao diện sáng / tối">{THEME_LABEL[theme]}</button>
          </div>
        </div>
      </aside>
      <div className={`scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Mở lộ trình">☰ Lộ trình</button>
          <span className="topbar-title">{current ? `${current.no}. ${current.short}` : 'Kiến trúc Máy tính'}</span>
          <button className="icon-btn primary" onClick={() => openLab()}>▶ Lab</button>
        </header>
        {children}
      </div>
    </div>
  );
}
