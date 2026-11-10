'use client';

import { useMemo, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
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
    <Widget title="Chia nhị phân: dịch trái rồi trừ" hint="Mỗi vòng: dịch khối (Số dư R, Thương Q) sang trái 1 bit; thử R − D. Nếu ≥ 0 thì giữ và ghi bit thương 1; nếu < 0 thì khôi phục R và ghi bit thương 0.">
      <div className="ctrls">
        <label className="field">Số bị chia (0…15)<input id="dv-a" type="number" min={0} max={15} value={a} onChange={(e) => { setA(Math.max(0, Math.min(15, +e.target.value || 0))); setK(0); }} /></label>
        <label className="field">Số chia D (1…15)<input id="dv-d" type="number" min={0} max={15} value={d} onChange={(e) => { setD(Math.max(0, Math.min(15, +e.target.value || 0))); setK(0); }} /></label>
        <div className="chips"><span>Thử:</span>{[[6, 2], [13, 3], [7, 2], [15, 4]].map(([x, y]) => <button key={`${x}${y}`} className="btn sm" onClick={() => { setA(x); setD(y); setK(0); }}>{x} ÷ {y}</button>)}</div>
      </div>
      {d === 0 ? (
        <p className="pill bad">Chia cho 0! Lệnh div của RISC-V không báo lỗi (trả về −1), phần mềm phải tự kiểm tra trước.</p>
      ) : (
        <>
          <p className="mono explain">Bắt đầu: R = 0000, Q = {b(a)} ({a}), D = {b(d)} ({d})</p>
          <div className="scroll-x">
            <table className="steptable">
              <thead><tr><th>Vòng</th><th>Sau dịch trái R, Q</th><th>R − D</th><th>Quyết định</th><th>R</th><th>Q</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={i === k ? 'cur' : i > k ? 'future' : ''}>
                    <td>{r.step}</td>
                    <td>{b(r.R)}, {b(r.Q)}</td>
                    <td className={r.ok ? 'chg' : ''}>{r.diff}</td>
                    <td className="txt">{r.ok ? '≥ 0 → giữ, bit thương = 1' : '< 0 → khôi phục R, bit thương = 0'}</td>
                    <td>{b(r.Rn)}</td>
                    <td className="chg">{b(r.Qn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="chips">
            <button className="btn" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>⏮ Lùi</button>
            <button className="btn primary" onClick={() => setK((x) => Math.min(rows.length - 1, x + 1))} disabled={k === rows.length - 1}>⏭ Bước</button>
            <button className="btn" onClick={() => setK(rows.length - 1)}>Hiện hết</button>
          </div>
          {k === rows.length - 1 && last && (
            <p className="verdict">Thương Q = {b(last.Qn)} = <b>{last.Qn}</b>, số dư R = {b(last.Rn)} = <b>{last.Rn}</b> · kiểm tra: {last.Qn} × {d} + {last.Rn} = {last.Qn * d + last.Rn} ✓</p>
          )}
        </>
      )}
    </Widget>
  );
}
