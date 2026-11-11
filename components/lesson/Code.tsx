'use client';

import { useState } from 'react';
import { highlightAsm, highlightC } from '@/lib/highlight';
import { useLang } from '@/lib/lang';
import { L } from '@/components/i18n';
import { useLab } from '../lab/LabProvider';

type Props = {
  code: string;
  /** Bản tiếng Anh của code (thường chỉ khác ở comment). Không có thì dùng chung `code`. */
  codeEn?: string;
  lang?: 'asm' | 'c' | 'text';
  title?: React.ReactNode;
  /** Có nút "Chạy trong Lab" không (mặc định: có với asm). */
  run?: boolean;
  /** Tên hiện trên đầu Lab khi bấm chạy. */
  runTitle?: string | { vi: string; en: string };
};

function render(src: string, lang: 'asm' | 'c' | 'text') {
  return lang === 'asm' ? highlightAsm(src) : lang === 'c' ? highlightC(src) : src.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
const clean = (s: string) => s.replace(/^\n/, '').replace(/\s+$/, '');

/** Khối code có tô màu, nút sao chép, và nút mở thẳng vào Lab để chạy từng bước. */
export default function Code({ code, codeEn, lang = 'asm', title, run, runTitle }: Props) {
  const { openLab } = useLab();
  const [ui] = useLang();
  const [copied, setCopied] = useState(false);
  const vi = clean(code);
  const en = codeEn !== undefined ? clean(codeEn) : null;
  const canRun = run ?? lang === 'asm';
  const active = ui === 'en' && en !== null ? en : vi;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(active);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  const runIt = () => {
    const src = active.includes('.text') || active.includes('.data') ? active : '.text\n' + active;
    const t = typeof runTitle === 'object' ? (ui === 'en' ? runTitle.en : runTitle.vi) : runTitle;
    openLab(src, t ?? (ui === 'en' ? 'Code from the lesson' : 'Code từ bài học'));
  };

  const pre = (s: string) => <pre><code dangerouslySetInnerHTML={{ __html: render(s, lang) }} /></pre>;

  return (
    <div className={`code code-${lang}`}>
      <div className="code-head">
        <span className="code-lang">{lang === 'asm' ? 'RISC-V' : lang === 'c' ? 'C' : <L vi="Văn bản" en="Text" />}</span>
        {title && <span className="code-title">{title}</span>}
        <span className="code-actions">
          <button onClick={copy}>{copied ? <L vi="Đã chép" en="Copied" /> : <L vi="Sao chép" en="Copy" />}</button>
          {canRun && (
            <button className="run" onClick={runIt}>
              ▶ <L vi="Chạy từng bước trong Lab" en="Step through in the Lab" />
            </button>
          )}
        </span>
      </div>
      {en === null || en === vi ? pre(vi) : <L vi={pre(vi)} en={pre(en)} />}
    </div>
  );
}
