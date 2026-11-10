'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { signedOf, toBits, unsignedOf } from '@/lib/bits';

/** Mở rộng 1 byte lên 32 bit: lb chép bit dấu, lbu điền 0. */
export default function SignExtend() {
  const [v, setV] = useState(0xec); // -20
  const b = toBits(v, 8);
  const sign = b[0];
  const lb = signedOf(sign ? v | 0xffffff00 : v, 32);
  const lbu = v;
  const row = (fill: number, label: string, val: number, note: string) => (
    <div className="se-row">
      <span className="se-label">{label}</span>
      <div className="se-bits mono">
        {Array.from({ length: 24 }, (_, i) => <span key={i} className={`se-b ext${fill ? ' one' : ''}`}>{fill}</span>)}
        {b.map((x, i) => <span key={`o${i}`} className={`se-b own${i === 0 ? ' sgn' : ''}`}>{x}</span>)}
      </div>
      <span className="se-val mono">= {val}</span>
      <span className="se-note">{note}</span>
    </div>
  );
  return (
    <Widget title="lb hay lbu: mở rộng 1 byte thành 32 bit" hint="Bấm bit của byte trong bộ nhớ. 24 bit thêm vào được tô màu: lb chép bit dấu, lbu luôn điền 0.">
      <div className="ctrls">
        <div className="nibble-bits">
          {b.map((x, i) => (
            <button key={i} className={`bit${x ? ' on' : ''}${i === 0 ? ' sign' : ''}`} onClick={() => setV(unsignedOf(v ^ (1 << (7 - i)), 8))} aria-pressed={!!x} aria-label={`bit ${7 - i}`}>{x}</button>
          ))}
        </div>
        <div className="chips">
          <button className="btn sm" onClick={() => setV(20)}>.byte 20</button>
          <button className="btn sm" onClick={() => setV(0xec)}>.byte −20</button>
          <button className="btn sm" onClick={() => setV(0x80)}>.byte −128</button>
          <button className="btn sm" onClick={() => setV(0x7f)}>.byte 127</button>
        </div>
      </div>
      <p className="explain">Byte trong bộ nhớ: 0x{v.toString(16).toUpperCase().padStart(2, '0')} — bit dấu (bit 7) = <b>{sign}</b>.</p>
      <div className="scroll-x">
        <div className="se-grid">
          {row(sign, 'lb', lb, `mở rộng DẤU: chép bit ${sign} sang trái`)}
          {row(0, 'lbu', lbu, 'mở rộng 0: coi là số không dấu')}
        </div>
      </div>
    </Widget>
  );
}
