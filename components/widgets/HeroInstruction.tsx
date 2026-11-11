'use client';

import { useEffect, useMemo, useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';

const LINES: { src: string; say: string; sayEn: string }[] = [
  { src: 'add  a0, a0, a1', say: 'a0 ← a0 + a1', sayEn: 'a0 ← a0 + a1' },
  { src: 'lw   t0, 8(sp)', say: 't0 ← bộ nhớ tại sp + 8', sayEn: 't0 ← memory at sp + 8' },
  { src: 'addi sp, sp, -16', say: 'dành 16 byte trên stack', sayEn: 'reserve 16 bytes on the stack' },
  { src: 'beq  t0, t1, 16', say: 'nếu t0 = t1 thì nhảy 16 byte', sayEn: 'if t0 = t1, jump ahead 16 bytes' },
  { src: 'jal  ra, 2048', say: 'gọi hàm, nhớ đường về trong ra', sayEn: 'call a function, keep the way back in ra' },
];

/** Phần mở đầu trang chủ: một lệnh assembly tách thành 32 bit, mỗi trường một màu. Tự đổi lệnh vài giây một lần. */
export default function HeroInstruction() {
  const t = useT();
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const decoded = useMemo(() => LINES.map((l) => { const r = RV.encodeLine(l.src); return r.ok ? r.words[0].d : null; }), []);

  useEffect(() => {
    if (pause || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % LINES.length), 3600);
    return () => clearInterval(t);
  }, [pause]);

  const d = decoded[i];
  if (!d) return null;
  const bits = RV.bin32(d.word).split('');

  return (
    <div className="hero-ins" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <div className="hero-ins-top">
        <code className="hero-src" key={`s${i}`}>{LINES[i].src}</code>
        <span className="hero-say"><L vi={LINES[i].say} en={LINES[i].sayEn} /></span>
      </div>
      <div className="hero-fields" key={`f${i}`}>
        {d.fields.map((f) => {
          const w = f.hi - f.lo + 1;
          return (
            <div key={f.lo} className={`hero-field k-${f.kind}`} style={{ flexGrow: w }}>
              <span className="hero-bits mono">{bits.slice(31 - f.hi, 32 - f.lo).join('')}</span>
              <span className="hero-name">{f.name}</span>
            </div>
          );
        })}
      </div>
      <div className="hero-foot">
        <span className="mono">{RV.hex8(d.word)}</span>
        <span><L vi="định dạng" en="format" /> {d.fmt}</span>
        <div className="hero-dots" role="tablist" aria-label={t('Chọn lệnh ví dụ', 'Pick an example instruction')}>
          {LINES.map((l, k) => (
            <button key={k} role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={l.src} />
          ))}
        </div>
      </div>
    </div>
  );
}
