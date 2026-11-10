'use client';

import { useMemo, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { toBits } from '@/lib/bits';

type Row = { step: string; q0: string; act: string; c: number; A: number; Q: number; note: string };

function trace(M: number, Q0: number, n: number): Row[] {
  const rows: Row[] = [{ step: 'Đầu', q0: '', act: 'C = 0, A = 0, Q = số nhân', c: 0, A: 0, Q: Q0, note: '' }];
  let C = 0, A = 0, Q = Q0;
  const mask = (1 << n) - 1;
  for (let k = 1; k <= n; k++) {
    const q0 = Q & 1;
    if (q0) {
      const s = A + M; C = s >> n; A = s & mask;
      rows.push({ step: `${k}`, q0: '1', act: 'C,A = A + M', c: C, A, Q, note: 'bit cuối của Q là 1 → cộng số bị nhân' });
    } else rows.push({ step: `${k}`, q0: '0', act: 'không cộng', c: C, A, Q, note: 'bit cuối của Q là 0 → bỏ qua' });
    // dịch phải C,A,Q
    Q = (Q >> 1) | ((A & 1) << (n - 1));
    A = (A >> 1) | (C << (n - 1));
    C = 0;
    rows.push({ step: '', q0: '', act: 'dịch phải C,A,Q', c: C, A, Q, note: `counter = ${n - k}` });
  }
  return rows;
}

/** Thuật toán nhân "cộng và dịch phải" (slide 44–45) chạy từng bước. */
export default function Multiplier() {
  const [n, setN] = useState(4);
  const [m, setM] = useState(6);
  const [q, setQ] = useState(5);
  const [k, setK] = useState(0);
  const max = (1 << n) - 1;
  const M = Math.min(m, max), Q = Math.min(q, max);
  const rows = useMemo(() => trace(M, Q, n), [M, Q, n]);
  const last = rows[rows.length - 1];
  const product = last.A * (1 << n) + last.Q;
  const shown = Math.min(k, rows.length - 1);
  const b = (v: number) => toBits(v, n).join('');

  const set = (fn: () => void) => { fn(); setK(0); };

  return (
    <Widget title="Nhân nhị phân: cộng rồi dịch phải" hint="M = số bị nhân, Q = số nhân. Mỗi vòng: nhìn bit cuối của Q (Q0); nếu 1 thì cộng M vào A; rồi dịch cả khối C,A,Q sang phải 1 bit. Kết quả 2n bit nằm trong A,Q.">
      <div className="ctrls">
        <label className="field">M (số bị nhân)<input id="mu-m" type="number" min={0} max={max} value={m} onChange={(e) => set(() => setM(Math.max(0, Math.min(max, +e.target.value || 0))))} /></label>
        <label className="field">Q (số nhân)<input id="mu-q" type="number" min={0} max={max} value={q} onChange={(e) => set(() => setQ(Math.max(0, Math.min(max, +e.target.value || 0))))} /></label>
        <div className="chips">{[4, 6].map((x) => <button key={x} className={`btn sm${n === x ? ' on' : ''}`} onClick={() => set(() => setN(x))}>{x} bit</button>)}</div>
      </div>
      <p className="mono explain">M = {b(M)} ({M}) · Q = {b(Q)} ({Q})</p>
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th>Vòng</th><th>Q0</th><th>Thao tác</th><th>C</th><th>A</th><th>Q</th><th>Giải thích</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === shown ? 'cur' : i > shown ? 'future' : ''}>
                <td>{r.step}</td><td>{r.q0}</td><td>{r.act}</td><td>{r.c}</td><td className="chg">{b(r.A)}</td><td>{b(r.Q)}</td><td className="txt">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="chips">
        <button className="btn" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={shown === 0}>⏮ Lùi</button>
        <button className="btn primary" onClick={() => setK((x) => Math.min(rows.length - 1, x + 1))} disabled={shown === rows.length - 1}>⏭ Bước</button>
        <button className="btn" onClick={() => setK(rows.length - 1)}>Hiện hết</button>
      </div>
      {shown === rows.length - 1 && (
        <p className="verdict">Kết quả A,Q = <span className="mono">{b(last.A)} {b(last.Q)}</span> = <b>{product}</b> · kiểm tra: {M} × {Q} = {M * Q} ✓</p>
      )}
    </Widget>
  );
}
