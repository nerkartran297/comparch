'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { highlightAsmLine } from '@/lib/highlight';
import type { Prog, SimT } from './Lab';

type Props = {
  prog: Prog;
  sim: SimT;
  bps: Set<number>;
  toggleBp: (addr: number) => void;
  sel: number | null;
  setSel: (a: number | null) => void;
};

/** Bảng các lệnh đã dịch: địa chỉ, mã máy, lệnh thật, dòng nguồn. Dòng tô vàng = lệnh sắp chạy (PC). */
export default function ExecView({ prog, sim, bps, toggleBp, sel, setSel }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const rows = useMemo(
    () => prog.text.map((t) => ({ ...t, d: RV.decode(t.word, t.addr), srcHtml: highlightAsmLine(t.src) })),
    [prog],
  );
  const pc = sim.pc >>> 0;
  const last = sim.lastRec?.pc;

  useEffect(() => {
    const el = box.current?.querySelector<HTMLTableRowElement>('tr.is-pc');
    const c = box.current;
    if (!el || !c) return;
    const top = el.offsetTop, bottom = top + el.offsetHeight;
    const headH = (c.querySelector('thead') as HTMLElement | null)?.offsetHeight ?? 0;
    if (top - headH < c.scrollTop) c.scrollTop = top - headH - 8;
    else if (bottom > c.scrollTop + c.clientHeight) c.scrollTop = bottom - c.clientHeight + 8;
  }, [pc, prog]);

  return (
    <div className="ex" ref={box}>
      <table>
        <thead>
          <tr>
            <th title="Bấm để đặt điểm dừng (breakpoint)">●</th>
            <th>Địa chỉ</th>
            <th>Mã máy</th>
            <th>Lệnh thật</th>
            <th>Dòng</th>
            <th>Mã nguồn</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const cls = [
              t.addr === pc && !sim.halted ? 'is-pc' : '',
              t.addr === last ? 'is-last' : '',
              t.addr === sel ? 'is-sel' : '',
              bps.has(t.addr) ? 'has-bp' : '',
            ].join(' ');
            return (
              <tr key={t.addr} className={cls} onClick={() => setSel(t.addr === sel ? null : t.addr)}>
                <td className="bp">
                  <button
                    aria-label={`Điểm dừng tại ${RV.hex8(t.addr)}`}
                    aria-pressed={bps.has(t.addr)}
                    onClick={(e) => { e.stopPropagation(); toggleBp(t.addr); }}
                  />
                </td>
                <td className="mono addr">{RV.hex8(t.addr)}</td>
                <td className="mono word">{RV.hex8(t.word)}</td>
                <td className="mono basic" title={t.d.abiText}>{t.d.text}</td>
                <td className="mono ln">{t.first ? t.line : ''}</td>
                <td className="mono src">
                  {t.first ? <span dangerouslySetInnerHTML={{ __html: t.srcHtml }} /> : <span className="cont">↳ phần tiếp của lệnh giả</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && <p className="ex-empty">Chưa có lệnh nào trong .text.</p>}
    </div>
  );
}
