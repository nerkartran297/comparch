'use client';

import { useState } from 'react';
import { highlightAsm, highlightC } from '@/lib/highlight';
import { useLab } from '../lab/LabProvider';

type Props = {
  code: string;
  lang?: 'asm' | 'c' | 'text';
  title?: string;
  /** Có nút "Chạy trong Lab" không (mặc định: có với asm). */
  run?: boolean;
  runTitle?: string;
};

/** Khối code có tô màu, nút sao chép, và nút mở thẳng vào Lab để chạy từng bước. */
export default function Code({ code, lang = 'asm', title, run, runTitle }: Props) {
  const { openLab } = useLab();
  const [copied, setCopied] = useState(false);
  const src = code.replace(/^\n/, '').replace(/\s+$/, '');
  const html = lang === 'asm' ? highlightAsm(src) : lang === 'c' ? highlightC(src) : src.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const canRun = run ?? lang === 'asm';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`code code-${lang}`}>
      <div className="code-head">
        <span className="code-lang">{lang === 'asm' ? 'RISC-V' : lang === 'c' ? 'C' : 'Văn bản'}</span>
        {title && <span className="code-title">{title}</span>}
        <span className="code-actions">
          <button onClick={copy}>{copied ? 'Đã chép' : 'Sao chép'}</button>
          {canRun && (
            <button className="run" onClick={() => openLab(src.includes('.text') || src.includes('.data') ? src : '.text\n' + src, runTitle ?? title ?? 'Code từ bài học')}>
              ▶ Chạy từng bước trong Lab
            </button>
          )}
        </span>
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}
