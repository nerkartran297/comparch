'use client';

import { useState } from 'react';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';
import * as RV from '@/lib/riscv.mjs';
import type { SimT } from './Lab';

const GROUP = (i: number) =>
  i === 0 ? 'zero' : i === 1 || i === 2 || i === 3 || i === 4 ? 'sp' : (i >= 5 && i <= 7) || i >= 28 ? 't' : i === 8 || i === 9 || (i >= 18 && i <= 27) ? 's' : 'a';

/** 32 thanh ghi số nguyên (và tab số thực). Ô vừa thay đổi ở lệnh trước được tô vàng. */
export default function RegPanel({ sim }: { sim: SimT }) {
  const t = useT();
  const [fmt, setFmt] = useState<'dec' | 'hex'>('dec');
  const [kind, setKind] = useState<'int' | 'float'>('int');
  const rec = sim.lastRec;
  const changed = new Set<number>((rec?.regs ?? []).map((r: number[]) => r[0]));
  const fchanged = new Set<number>((rec?.fregs ?? []).map((r: number[]) => r[0]));
  const show = (v: number) => (fmt === 'hex' ? RV.hex8(v) : String(v | 0));

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="seg" role="group" aria-label={t('Loại thanh ghi', 'Register kind')}>
          <button className={kind === 'int' ? 'on' : ''} onClick={() => setKind('int')}><L vi="Số nguyên" en="Integer" /></button>
          <button className={kind === 'float' ? 'on' : ''} onClick={() => setKind('float')}><L vi="Số thực" en="Float" /></button>
        </div>
        {kind === 'int' && (
          <div className="seg" role="group" aria-label={t('Cách hiển thị', 'Display format')}>
            <button className={fmt === 'dec' ? 'on' : ''} onClick={() => setFmt('dec')}><L vi="Thập phân" en="Decimal" /></button>
            <button className={fmt === 'hex' ? 'on' : ''} onClick={() => setFmt('hex')}>Hex</button>
          </div>
        )}
      </div>
      <div className="pc-row mono">
        <span>PC</span>
        <strong>{RV.hex8(sim.pc)}</strong>
        <span className="pc-note"><L vi="địa chỉ lệnh sắp chạy" en="address of the next instruction" /></span>
      </div>
      {kind === 'int' ? (
        <div className="regs">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className={`reg g-${GROUP(i)}${changed.has(i) ? ' changed' : ''}`} title={`x${i} — ${t('tên ABI', 'ABI name')}: ${RV.ABI[i]}`}>
              <span className="reg-x mono">x{i}</span>
              <span className="reg-abi mono">{RV.ABI[i]}</span>
              <span className="reg-v mono">{show(sim.x[i])}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="regs">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className={`reg g-t${fchanged.has(i) ? ' changed' : ''}`} title={`f${i} = ${RV.hex8(sim.fb[i])}`}>
              <span className="reg-x mono">f{i}</span>
              <span className="reg-abi mono">{RV.FABI[i]}</span>
              <span className="reg-v mono">{RV.fmtFloat(sim.fv[i])}</span>
            </div>
          ))}
        </div>
      )}
      <p className="legend">
        <span className="g-t"><L vi="t: tạm" en="t: temporary" /></span> <span className="g-s"><L vi="s: cần giữ" en="s: saved" /></span> <span className="g-a"><L vi="a: tham số/kết quả" en="a: arguments/results" /></span>{' '}
        <span className="g-sp">ra, sp, gp, tp</span>
      </p>
    </div>
  );
}
