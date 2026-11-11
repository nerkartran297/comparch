'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useT } from '@/lib/lang';
import { highlightAsmLine } from '@/lib/highlight';

type Props = {
  value: string;
  onChange: (v: string) => void;
  errors: { line: number; msg: string }[];
  focusLine?: { line: number; n: number } | null;
};

/** Ô soạn code: textarea trong suốt đặt trên lớp tô màu cú pháp. */
export default function Editor({ value, onChange, errors, focusLine }: Props) {
  const t = useT();
  const ta = useRef<HTMLTextAreaElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split('\n');
  const errLines = useMemo(() => new Set(errors.map((e) => e.line)), [errors]);

  const html = useMemo(
    () => lines.map((l, i) => `<span class="ed-line${errLines.has(i + 1) ? ' err' : ''}">${highlightAsmLine(l) || ' '}</span>`).join(''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, errLines],
  );

  const sync = () => {
    if (!ta.current || !pre.current || !gutter.current) return;
    pre.current.scrollTop = ta.current.scrollTop;
    pre.current.scrollLeft = ta.current.scrollLeft;
    gutter.current.scrollTop = ta.current.scrollTop;
  };

  useEffect(() => {
    if (!focusLine || !ta.current) return;
    const ls = value.split('\n');
    let start = 0;
    for (let i = 0; i < focusLine.line - 1 && i < ls.length; i++) start += ls[i].length + 1;
    const end = start + (ls[focusLine.line - 1]?.length ?? 0);
    ta.current.focus();
    ta.current.setSelectionRange(start, end);
    const lh = parseFloat(getComputedStyle(ta.current).lineHeight) || 20;
    ta.current.scrollTop = Math.max(0, (focusLine.line - 4) * lh);
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusLine]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const t = e.currentTarget;
      const s = t.selectionStart, en = t.selectionEnd;
      const next = value.slice(0, s) + '    ' + value.slice(en);
      onChange(next);
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; });
    }
  };

  return (
    <div className="ed">
      <div className="ed-gutter" ref={gutter} aria-hidden>
        {lines.map((_, i) => (
          <div key={i} className={errLines.has(i + 1) ? 'err' : ''}>{i + 1}</div>
        ))}
        <div>&nbsp;</div>
      </div>
      <div className="ed-area">
        <pre ref={pre} className="ed-hl" aria-hidden dangerouslySetInnerHTML={{ __html: html + '<span class="ed-line"> </span>' }} />
        <textarea
          id="lab-code"
          ref={ta}
          aria-label={t('Mã assembly RISC-V', 'RISC-V assembly code')}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={sync}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
