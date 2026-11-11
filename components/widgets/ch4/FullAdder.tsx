'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';

/** Bộ cộng toàn phần 1 bit: S = A⊕B⊕Cin, Cout = AB + ACin + BCin */
export default function FullAdder() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [ci, setCi] = useState(0);
  const s = a ^ b ^ ci, co = (a & b) | (a & ci) | (b & ci);
  const rows = [0, 1].flatMap((x) => [0, 1].flatMap((y) => [0, 1].map((z) => [x, y, z])));
  return (
    <Widget
      title={<L vi="Bộ cộng toàn phần 1 bit (full adder)" en="1-bit full adder" />}
      hint={<L
        vi="Cộng 3 bit: A, B và số nhớ từ cột bên phải (Cin). Ra tổng S và số nhớ sang cột bên trái (Cout)."
        en="Adds 3 bits: A, B and the carry from the column to the right (Cin). Outputs the sum S and the carry to the column on the left (Cout)."
      />}
    >
      <div className="fa">
        <div className="fa-box">
          <div className="chips">
            {([['A', a, setA], ['B', b, setB], ['Cin', ci, setCi]] as const).map(([n, v, set]) => (
              <button key={n} className={`toggle${v ? ' on' : ''}`} onClick={() => set(1 - v)} aria-pressed={!!v}><span className="knob">{v}</span>{n}</button>
            ))}
          </div>
          <div className="fa-chip">
            <span>{a} + {b} + {ci} = {a + b + ci}</span>
            <strong className="mono">= {co}{s}₂</strong>
          </div>
          <div className="readouts">
            <div className={`readout${s ? ' signal' : ''}`}><span><L vi="S (tổng)" en="S (sum)" /></span><strong>{s}</strong></div>
            <div className={`readout${co ? ' signal' : ''}`}><span><L vi="Cout (nhớ)" en="Cout (carry)" /></span><strong>{co}</strong></div>
          </div>
          <p className="explain mono">
            S    = A ⊕ B ⊕ Cin = {a}⊕{b}⊕{ci} = {s}{'\n'}
            Cout = AB + ACin + BCin{'\n'}
            {'     '}= {a & b} + {a & ci} + {b & ci} = {co}
          </p>
          <p className="widget-note">
            <L
              vi={<>Mẹo: S = 1 khi có <b>lẻ</b> số bit 1. Cout = 1 khi có <b>ít nhất 2</b> bit 1.</>}
              en={<>Tip: S = 1 when there is an <b>odd</b> number of 1 bits. Cout = 1 when there are <b>at least 2</b> one bits.</>}
            />
          </p>
        </div>
        <div className="scroll-x">
          <table className="steptable">
            <thead><tr><th>A</th><th>B</th><th>Cin</th><th>S</th><th>Cout</th></tr></thead>
            <tbody>
              {rows.map(([x, y, z]) => (
                <tr key={`${x}${y}${z}`} className={x === a && y === b && z === ci ? 'cur' : ''}>
                  <td>{x}</td><td>{y}</td><td>{z}</td><td>{x ^ y ^ z}</td><td>{(x & y) | (x & z) | (y & z)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Widget>
  );
}
