'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

/** Bộ cộng toàn phần 1 bit: S = A⊕B⊕Cin, Cout = AB + ACin + BCin */
export default function FullAdder() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [ci, setCi] = useState(0);
  const s = a ^ b ^ ci, co = (a & b) | (a & ci) | (b & ci);
  const rows = [0, 1].flatMap((x) => [0, 1].flatMap((y) => [0, 1].map((z) => [x, y, z])));
  return (
    <Widget title="Bộ cộng toàn phần 1 bit (full adder)" hint="Cộng 3 bit: A, B và số nhớ từ cột bên phải (Cin). Ra tổng S và số nhớ sang cột bên trái (Cout).">
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
            <div className={`readout${s ? ' signal' : ''}`}><span>S (tổng)</span><strong>{s}</strong></div>
            <div className={`readout${co ? ' signal' : ''}`}><span>Cout (nhớ)</span><strong>{co}</strong></div>
          </div>
          <p className="explain mono">
            S    = A ⊕ B ⊕ Cin = {a}⊕{b}⊕{ci} = {s}{'\n'}
            Cout = AB + ACin + BCin{'\n'}
            {'     '}= {a & b} + {a & ci} + {b & ci} = {co}
          </p>
          <p className="widget-note">Mẹo: S = 1 khi có <b>lẻ</b> số bit 1. Cout = 1 khi có <b>ít nhất 2</b> bit 1.</p>
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
