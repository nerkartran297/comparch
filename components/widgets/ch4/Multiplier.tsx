'use client';

import { useMemo, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { toBits } from '@/lib/bits';

type Row = { step: Bi; q0: string; act: Bi; c: number; A: number; Q: number; note: Bi };

function trace(M: number, Q0: number, n: number): Row[] {
  const rows: Row[] = [{
    step: { vi: 'Đầu', en: 'Start' }, q0: '',
    act: { vi: 'C = 0, A = 0, Q = số nhân', en: 'C = 0, A = 0, Q = multiplier' },
    c: 0, A: 0, Q: Q0, note: { vi: '', en: '' },
  }];
  let C = 0, A = 0, Q = Q0;
  const mask = (1 << n) - 1;
  for (let k = 1; k <= n; k++) {
    const q0 = Q & 1;
    if (q0) {
      const s = A + M; C = s >> n; A = s & mask;
      rows.push({
        step: { vi: `${k}`, en: `${k}` }, q0: '1', act: { vi: 'C,A = A + M', en: 'C,A = A + M' }, c: C, A, Q,
        note: { vi: 'bit cuối của Q là 1 → cộng số bị nhân', en: 'the last bit of Q is 1 → add the multiplicand' },
      });
    } else {
      rows.push({
        step: { vi: `${k}`, en: `${k}` }, q0: '0', act: { vi: 'không cộng', en: 'no add' }, c: C, A, Q,
        note: { vi: 'bit cuối của Q là 0 → bỏ qua', en: 'the last bit of Q is 0 → skip' },
      });
    }
    // dịch phải C,A,Q
    Q = (Q >> 1) | ((A & 1) << (n - 1));
    A = (A >> 1) | (C << (n - 1));
    C = 0;
    rows.push({
      step: { vi: '', en: '' }, q0: '', act: { vi: 'dịch phải C,A,Q', en: 'shift C,A,Q right' }, c: C, A, Q,
      note: { vi: `counter = ${n - k}`, en: `counter = ${n - k}` },
    });
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
    <Widget
      title={<L vi="Nhân nhị phân: cộng rồi dịch phải" en="Binary multiplication: add, then shift right" />}
      hint={<L
        vi="M = số bị nhân, Q = số nhân. Mỗi vòng: nhìn bit cuối của Q (Q0); nếu 1 thì cộng M vào A; rồi dịch cả khối C,A,Q sang phải 1 bit. Kết quả 2n bit nằm trong A,Q."
        en="M = multiplicand, Q = multiplier. Each round: look at the last bit of Q (Q0); if it is 1, add M to A; then shift the whole C,A,Q block right by 1 bit. The 2n-bit product ends up in A,Q."
      />}
    >
      <div className="ctrls">
        <label className="field"><L vi="M (số bị nhân)" en="M (multiplicand)" /><input id="mu-m" type="number" min={0} max={max} value={m} onChange={(e) => set(() => setM(Math.max(0, Math.min(max, +e.target.value || 0))))} /></label>
        <label className="field"><L vi="Q (số nhân)" en="Q (multiplier)" /><input id="mu-q" type="number" min={0} max={max} value={q} onChange={(e) => set(() => setQ(Math.max(0, Math.min(max, +e.target.value || 0))))} /></label>
        <div className="chips">{[4, 6].map((x) => <button key={x} className={`btn sm${n === x ? ' on' : ''}`} onClick={() => set(() => setN(x))}>{x} bit</button>)}</div>
      </div>
      <p className="mono explain">M = {b(M)} ({M}) · Q = {b(Q)} ({Q})</p>
      <div className="scroll-x">
        <table className="steptable">
          <thead>
            <tr>
              <th><L vi="Vòng" en="Round" /></th><th>Q0</th><th><L vi="Thao tác" en="Action" /></th><th>C</th><th>A</th><th>Q</th><th><L vi="Giải thích" en="Explanation" /></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i === shown ? 'cur' : i > shown ? 'future' : ''}>
                <td><L vi={r.step.vi} en={r.step.en} /></td><td>{r.q0}</td><td><L vi={r.act.vi} en={r.act.en} /></td><td>{r.c}</td><td className="chg">{b(r.A)}</td><td>{b(r.Q)}</td><td className="txt"><L vi={r.note.vi} en={r.note.en} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="chips">
        <button className="btn" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={shown === 0}>⏮ <L vi="Lùi" en="Back" /></button>
        <button className="btn primary" onClick={() => setK((x) => Math.min(rows.length - 1, x + 1))} disabled={shown === rows.length - 1}>⏭ <L vi="Bước" en="Step" /></button>
        <button className="btn" onClick={() => setK(rows.length - 1)}><L vi="Hiện hết" en="Show all" /></button>
      </div>
      {shown === rows.length - 1 && (
        <p className="verdict"><L vi="Kết quả" en="Result" /> A,Q = <span className="mono">{b(last.A)} {b(last.Q)}</span> = <b>{product}</b> · <L vi="kiểm tra:" en="check:" /> {M} × {Q} = {M * Q} ✓</p>
      )}
    </Widget>
  );
}
