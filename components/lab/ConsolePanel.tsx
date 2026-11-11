'use client';

import { useEffect, useRef, useState } from 'react';
import { L } from '@/components/i18n';
import { useLang } from '@/lib/lang';
import * as RV from '@/lib/riscv.mjs';
import type { SimT } from './Lab';
import type { StepRecord } from '@/lib/riscv.mjs';

const ASK: Record<string, [string, string]> = {
  int: ['Nhập một số nguyên rồi bấm Enter (ecall 5)', 'Type an integer and press Enter (ecall 5)'],
  float: ['Nhập một số thực rồi bấm Enter (ecall 6)', 'Type a real number and press Enter (ecall 6)'],
  string: ['Nhập một chuỗi rồi bấm Enter (ecall 8)', 'Type a string and press Enter (ecall 8)'],
  char: ['Gõ một ký tự rồi bấm Enter (ecall 12)', 'Type a character and press Enter (ecall 12)'],
};

type Rec = StepRecord;

function traceLine(r: Rec, en: boolean) {
  const d = RV.decode(r.word, r.pc);
  const parts: string[] = [];
  for (const [i, old, now] of r.regs) parts.push(old === now ? `${RV.ABI[i]} = ${now}` : `${RV.ABI[i]}: ${old} → ${now}`);
  for (const [i, , now] of r.fregs) parts.push(`${RV.FABI[i]} = ${RV.hex8(now)}`);
  if (r.memW) parts.push(`Mem[${RV.hex8(r.memW[0])}] ← ${r.memVal}`);
  if (d.fmt === 'B') parts.push(r.taken ? (en ? 'taken' : 'nhảy') : (en ? 'not taken' : 'không nhảy'));
  if ((d.name === 'jal' || d.name === 'jalr') && r.nextPc !== undefined) parts.push(`→ ${RV.hex8(r.nextPc)}`);
  return { addr: RV.hex8(r.pc), text: d.abiText, effect: parts.join(', ') };
}

/** Màn hình (console) + ô nhập khi chương trình gọi ecall đọc dữ liệu + nhật ký từng lệnh đã chạy. */
export default function ConsolePanel({ sim, onInput }: { sim: SimT; onInput: (s: string) => string }) {
  const [lang] = useLang();
  const en = lang === 'en';
  const [view, setView] = useState<'out' | 'trace'>('out');
  const [val, setVal] = useState('');
  const [msg, setMsg] = useState('');
  const outRef = useRef<HTMLPreElement>(null);
  const traceRef = useRef<HTMLOListElement>(null);
  const inRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
    if (traceRef.current) traceRef.current.scrollTop = traceRef.current.scrollHeight;
  });
  useEffect(() => {
    if (sim.waiting) { setView('out'); setTimeout(() => inRef.current?.focus(), 30); }
  }, [sim.waiting]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onInput(val);
    setMsg(err);
    if (!err) setVal('');
  };

  const hist = sim.history.slice(-200);

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="seg" role="group" aria-label={en ? 'View' : 'Chế độ xem'}>
          <button className={view === 'out' ? 'on' : ''} onClick={() => setView('out')}><L vi="Màn hình" en="Console" /></button>
          <button className={view === 'trace' ? 'on' : ''} onClick={() => setView('trace')}><L vi="Nhật ký lệnh" en="Trace" /></button>
        </div>
        <span className="panel-count tabular">{sim.count.toLocaleString(en ? 'en-US' : 'vi-VN')} <L vi="lệnh" en="instructions" /></span>
      </div>
      {view === 'out' ? (
        <>
          <pre className="console" ref={outRef}>{sim.out || <span className="console-empty"><L vi="(chưa in gì — dùng ecall 1, 4, 11… để in)" en="(nothing printed yet — use ecall 1, 4, 11… to print)" /></span>}</pre>
          {sim.waiting && (
            <form className="console-in" onSubmit={submit}>
              <label htmlFor="lab-input">{ASK[sim.waiting.kind][en ? 1 : 0]}</label>
              <div>
                <input id="lab-input" ref={inRef} value={val} onChange={(e) => setVal(e.target.value)} autoComplete="off" />
                <button type="submit"><L vi="Gửi" en="Send" /></button>
              </div>
              {msg && <p className="console-err">{msg}</p>}
            </form>
          )}
          {sim.halted && <p className={`console-end${sim.error ? ' bad' : ''}`}>{sim.haltMsg}</p>}
        </>
      ) : (
        <ol className="trace mono" ref={traceRef}>
          {hist.length === 0 && <li className="console-empty"><L vi="Chưa chạy lệnh nào." en="No instructions run yet." /></li>}
          {hist.map((r, i) => {
            const t = traceLine(r, en);
            return (
              <li key={sim.count - hist.length + i}>
                <span className="t-addr">{t.addr}</span>
                <span className="t-ins">{t.text}</span>
                <span className="t-eff">{t.effect}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
