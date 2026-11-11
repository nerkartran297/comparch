'use client';

import { useMemo, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { toBits } from '@/lib/bits';

type Row = { step: number; R: number; Q: number; diff: number; ok: boolean; Rn: number; Qn: number };

function trace(dividend: number, d: number, n: number): Row[] {
  const rows: Row[] = [];
  let R = 0, Q = dividend;
  const mask = (1 << n) - 1;
  for (let k = 1; k <= n; k++) {
    // dịch trái R,Q
    R = ((R << 1) | (Q >> (n - 1))) & mask;
    Q = (Q << 1) & mask;
    const diff = R - d;
    const ok = diff >= 0;
    const Rn = ok ? diff : R;
    const Qn = Q | (ok ? 1 : 0);
    rows.push({ step: k, R, Q, diff, ok, Rn, Qn });
    R = Rn; Q = Qn;
  }
  return rows;
}

/** Thuật toán chia "dịch trái và trừ" có khôi phục (slide 51) chạy từng bước. */
export default function Divider() {
  const n = 4;
  const [a, setA] = useState(6);
  const [d, setD] = useState(2);
  const [k, setK] = useState(0);
  const rows = useMemo(() => (d > 0 ? trace(a, d, n) : []), [a, d]);
  const b = (v: number) => toBits(v, n).join('');
  const last = rows[rows.length - 1];
  return (
    <Widget
      title={<L vi="Chia nhị phân: dịch trái rồi trừ" en="Binary division: shift left, then subtract" />}
      hint={<L
        vi="Mỗi vòng: dịch khối (Số dư R, Thương Q) sang trái 1 bit; thử R − D. Nếu ≥ 0 thì giữ và ghi bit thương 1; nếu < 0 thì khôi phục R và ghi bit thương 0."
        en="Each round: shift the block (Remainder R, Quotient Q) left by 1 bit; try R − D. If ≥ 0, keep it and write quotient bit 1; if < 0, restore R and write quotient bit 0 (restoring division)."
      />}
    >
      <div className="ctrls">
        <label className="field"><L vi="Số bị chia (0…15)" en="Dividend (0…15)" /><input id="dv-a" type="number" min={0} max={15} value={a} onChange={(e) => { setA(Math.max(0, Math.min(15, +e.target.value || 0))); setK(0); }} /></label>
        <label className="field"><L vi="Số chia D (1…15)" en="Divisor D (1…15)" /><input id="dv-d" type="number" min={0} max={15} value={d} onChange={(e) => { setD(Math.max(0, Math.min(15, +e.target.value || 0))); setK(0); }} /></label>
        <div className="chips"><span><L vi="Thử:" en="Try:" /></span>{[[6, 2], [13, 3], [7, 2], [15, 4]].map(([x, y]) => <button key={`${x}${y}`} className="btn sm" onClick={() => { setA(x); setD(y); setK(0); }}>{x} ÷ {y}</button>)}</div>
      </div>
      {d === 0 ? (
        <p className="pill bad"><L vi="Chia cho 0! Lệnh div của RISC-V không báo lỗi (trả về −1), phần mềm phải tự kiểm tra trước." en="Division by 0! RISC-V's div instruction does not raise an error (it returns −1); software must check beforehand." /></p>
      ) : (
        <>
          <p className="mono explain"><L vi="Bắt đầu:" en="Start:" /> R = 0000, Q = {b(a)} ({a}), D = {b(d)} ({d})</p>
          <div className="scroll-x">
            <table className="steptable">
              <thead>
                <tr>
                  <th><L vi="Vòng" en="Round" /></th>
                  <th><L vi="Sau dịch trái R, Q" en="After shifting R, Q left" /></th>
                  <th>R − D</th>
                  <th><L vi="Quyết định" en="Decision" /></th>
                  <th>R</th>
                  <th>Q</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i === k ? 'cur' : i > k ? 'future' : ''}>
                    <td>{r.step}</td>
                    <td>{b(r.R)}, {b(r.Q)}</td>
                    <td className={r.ok ? 'chg' : ''}>{r.diff}</td>
                    <td className="txt">{r.ok ? <L vi="≥ 0 → giữ, bit thương = 1" en="≥ 0 → keep it, quotient bit = 1" /> : <L vi="< 0 → khôi phục R, bit thương = 0" en="< 0 → restore R, quotient bit = 0" />}</td>
                    <td>{b(r.Rn)}</td>
                    <td className="chg">{b(r.Qn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="chips">
            <button className="btn" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>⏮ <L vi="Lùi" en="Back" /></button>
            <button className="btn primary" onClick={() => setK((x) => Math.min(rows.length - 1, x + 1))} disabled={k === rows.length - 1}>⏭ <L vi="Bước" en="Step" /></button>
            <button className="btn" onClick={() => setK(rows.length - 1)}><L vi="Hiện hết" en="Show all" /></button>
          </div>
          {k === rows.length - 1 && last && (
            <p className="verdict">
              <L vi="Thương" en="Quotient" /> Q = {b(last.Qn)} = <b>{last.Qn}</b>, <L vi="số dư" en="remainder" /> R = {b(last.Rn)} = <b>{last.Rn}</b> · <L vi="kiểm tra:" en="check:" /> {last.Qn} × {d} + {last.Rn} = {last.Qn * d + last.Rn} ✓
            </p>
          )}
        </>
      )}
    </Widget>
  );
}
