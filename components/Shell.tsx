'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { EN_TITLES, STEPS } from '@/lib/nav';
import { useProgress, useStored } from '@/lib/storage';
import { useLang } from '@/lib/lang';
import { L } from './i18n';
import { useLab } from './lab/LabProvider';

type Theme = 'system' | 'light' | 'dark';
const THEME_LABEL: Record<Theme, [string, string]> = {
  system: ['◐ Tự động', '◐ Auto'],
  light: ['☀ Sáng', '☀ Light'],
  dark: ['☾ Tối', '☾ Dark'],
};

/** Nút đổi ngôn ngữ: hiện cả hai, ngôn ngữ đang dùng được tô đậm. */
function LangSwitch({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useLang();
  return (
    <div className={`lang-switch${compact ? ' compact' : ''}`} role="group" aria-label="Ngôn ngữ / Language">
      <button className={lang === 'vi' ? 'on' : ''} aria-pressed={lang === 'vi'} onClick={() => setLang('vi')} title="Tiếng Việt">VI</button>
      <button className={lang === 'en' ? 'on' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')} title="English">EN</button>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { done } = useProgress();
  const { openLab } = useLab();
  const [lang] = useLang();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useStored<Theme>('ktmt-theme', 'system');
  const viTitle = useRef<Record<string, string>>({});

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  // Tiêu đề tab: tiếng Việt do metadata của trang đặt. Ở chế độ tiếng Anh thì ghi đè, và canh <title>
  // vì Next có thể đặt lại tiêu đề sau khi trang tải; đổi về tiếng Việt thì trả lại tiêu đề cũ.
  useEffect(() => {
    const en = EN_TITLES[path];
    const want = en ? (path === '/' ? en : `${en} · CompArch from Zero`) : null;
    const apply = () => {
      if (lang === 'en' && want) {
        if (document.title !== want) {
          viTitle.current[path] = document.title;
          document.title = want;
        }
      } else if (lang === 'vi' && viTitle.current[path] && document.title === want) {
        document.title = viTitle.current[path];
      }
    };
    apply();
    const obs = new MutationObserver(apply);
    // Next 16 có thể chèn <title> vào body khi stream metadata → theo dõi cả tài liệu (apply chỉ so sánh chuỗi, rất rẻ).
    obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
    return () => obs.disconnect();
  }, [lang, path]);

  const current = STEPS.find((s) => s.href === path);
  const doneCount = STEPS.filter((s) => done[s.id]).length;
  const cycleTheme = () => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system');
  const pick = (b: { vi: string; en: string }) => (lang === 'en' ? b.en : b.vi);

  return (
    <div className="shell">
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label={lang === 'en' ? 'Learning path' : 'Lộ trình học'}>
        <div className="brand-row">
          <Link href="/" className="brand">
            <span className="brand-code">IT3030E · HUST</span>
            <span className="brand-name"><L vi="Kiến trúc Máy tính từ số 0" en="Computer Architecture from Zero" /></span>
          </Link>
        </div>
        <LangSwitch />

        <nav>
          <p className="pipe-label"><L vi="Lộ trình" en="Learning path" /> · <L vi="đã xong" en="done" /> {doneCount}/{STEPS.length}</p>
          <ol className="pipe">
            <li className={path === '/' ? 'is-current' : ''}>
              <Link href="/">
                <span className="pipe-node">▸</span>
                <span className="pipe-text">
                  <span className="pipe-short"><L vi="Bắt đầu ở đây" en="Start here" /></span>
                  <span className="pipe-title"><L vi="Lộ trình & bức tranh toàn cảnh" en="Roadmap & the big picture" /></span>
                </span>
              </Link>
            </li>
            {STEPS.map((s) => (
              <li key={s.id} className={`${done[s.id] ? 'is-done' : ''} ${path === s.href ? 'is-current' : ''}`}>
                <Link href={s.href} aria-current={path === s.href ? 'page' : undefined}>
                  <span className="pipe-node">{done[s.id] ? '✓' : s.no}</span>
                  <span className="pipe-text">
                    <span className="pipe-short"><L vi={s.short.vi} en={s.short.en} /></span>
                    <span className="pipe-title"><L vi={s.title.vi} en={s.title.en} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="side-actions">
          <button className="lab-launch" onClick={() => openLab()}>
            <span className="glyph">▶</span>
            <strong><L vi="Mở Lab RISC-V" en="Open the RISC-V Lab" /></strong>
            <span><L vi="Viết, dịch, chạy từng lệnh" en="Write, assemble, step through" /></span>
          </button>
          <div className="side-row">
            <Link href="/lab"><L vi="Lab toàn màn hình" en="Full-screen Lab" /></Link>
            <button className="theme-btn" onClick={cycleTheme} title={lang === 'en' ? 'Switch light / dark' : 'Đổi giao diện sáng / tối'}>
              {THEME_LABEL[theme][lang === 'en' ? 1 : 0]}
            </button>
          </div>
        </div>
      </aside>
      <div className={`scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label={lang === 'en' ? 'Open the learning path' : 'Mở lộ trình'}>
            ☰ <L vi="Lộ trình" en="Path" />
          </button>
          <span className="topbar-title">{current ? `${current.no}. ${pick(current.short)}` : lang === 'en' ? 'Computer Architecture' : 'Kiến trúc Máy tính'}</span>
          <LangSwitch compact />
          <button className="icon-btn primary" onClick={() => openLab()}>▶ Lab</button>
        </header>
        {children}
      </div>
    </div>
  );
}
