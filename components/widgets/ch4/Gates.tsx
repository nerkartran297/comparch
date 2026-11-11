'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';

type G = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';
const FN: Record<G, (a: number, b: number) => number> = {
  AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: (a) => 1 - a,
  NAND: (a, b) => 1 - (a & b), NOR: (a, b) => 1 - (a | b), XOR: (a, b) => a ^ b,
};
const FORMULA: Record<G, string> = { AND: 'A · B', OR: 'A + B', NOT: 'Ā', NAND: '¬(A · B)', NOR: '¬(A + B)', XOR: 'A ⊕ B' };

/** Ký hiệu cổng logic, dây sáng màu khi mang giá trị 1. */
export function GateSymbol({ g, a, b, out }: { g: G; a: number; b: number; out: number }) {
  const wire = (on: number) => (on ? 'var(--signal)' : 'var(--line)');
  const body = (() => {
    switch (g) {
      case 'AND': case 'NAND': return <path d="M22 6 H44 A19 19 0 0 1 44 44 H22 Z" />;
      case 'OR': case 'NOR': return <path d="M18 6 Q30 25 18 44 Q48 44 66 25 Q48 6 18 6 Z" />;
      case 'XOR': return <><path d="M22 6 Q34 25 22 44 Q50 44 66 25 Q50 6 22 6 Z" /><path d="M15 6 Q27 25 15 44" fill="none" /></>;
      case 'NOT': return <path d="M22 6 L58 25 L22 44 Z" />;
    }
  })();
  const bubble = g === 'NAND' ? 67 : g === 'NOR' ? 70 : g === 'NOT' ? 62 : null;
  const outX = bubble ? bubble + 4 : g === 'AND' ? 63 : 66;
  return (
    <svg viewBox="0 0 100 50" className="gate-svg" aria-hidden>
      {g === 'NOT' ? <line x1={0} y1={25} x2={22} y2={25} stroke={wire(a)} strokeWidth={3} /> : (
        <>
          <line x1={0} y1={15} x2={24} y2={15} stroke={wire(a)} strokeWidth={3} />
          <line x1={0} y1={35} x2={24} y2={35} stroke={wire(b)} strokeWidth={3} />
        </>
      )}
      <g className="gate-body">{body}</g>
      {bubble && <circle cx={bubble} cy={25} r={4} className="gate-bubble" />}
      <line x1={outX} y1={25} x2={100} y2={25} stroke={wire(out)} strokeWidth={3} />
    </svg>
  );
}

/** Bật/tắt A, B và xem đầu ra của 6 cổng logic cùng lúc, kèm bảng chân lý. */
export default function Gates() {
  const t = useT();
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const gates: G[] = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];
  return (
    <Widget
      title={<L vi="Sáu cổng logic" en="Six logic gates" />}
      hint={<L
        vi="Bấm A và B. Dây sáng vàng = mang giá trị 1. Dòng tô vàng trong bảng chân lý là trường hợp đang chọn."
        en="Click A and B. A wire lit in amber carries the value 1. The highlighted row in the truth table is the current case."
      />}
    >
      <div className="chips">
        <button className={`toggle${a ? ' on' : ''}`} onClick={() => setA(1 - a)} aria-pressed={!!a}><span className="knob">{a}</span>A</button>
        <button className={`toggle${b ? ' on' : ''}`} onClick={() => setB(1 - b)} aria-pressed={!!b}><span className="knob">{b}</span>B</button>
      </div>
      <div className="gate-grid">
        {gates.map((g) => {
          const o = FN[g](a, b);
          return (
            <div key={g} className="gate-card">
              <div className="gate-top"><strong>{g}</strong><code>{FORMULA[g]}</code><span className={`lamp${o ? ' on' : ''}`} aria-label={t(`đầu ra ${o}`, `output ${o}`)} /></div>
              <GateSymbol g={g} a={a} b={b} out={o} />
            </div>
          );
        })}
      </div>
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th>A</th><th>B</th>{gates.map((g) => <th key={g}>{g}</th>)}<th>¬(A·B)</th><th>Ā + B̄</th></tr></thead>
          <tbody>
            {[0, 1].flatMap((x) => [0, 1].map((y) => (
              <tr key={`${x}${y}`} className={x === a && y === b ? 'cur' : ''}>
                <td>{x}</td><td>{y}</td>
                {gates.map((g) => <td key={g}>{FN[g](x, y)}</td>)}
                <td>{1 - (x & y)}</td><td>{(1 - x) | (1 - y)}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      <p className="widget-note">
        <L
          vi={<>Hai cột cuối luôn bằng nhau: đó là luật <b>De Morgan</b> ¬(A·B) = Ā + B̄. (NOT chỉ dùng A.)</>}
          en={<>The last two columns are always equal: that is <b>De Morgan&apos;s law</b> ¬(A·B) = Ā + B̄. (NOT only uses A.)</>}
        />
      </p>
    </Widget>
  );
}
