'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { binOf, group4, signedOf, unsignedOf } from '@/lib/bits';

function Row({ label, bits, note, cls }: { label: React.ReactNode; bits: string; note: React.ReactNode; cls?: string }) {
  return (
    <tr className={cls}>
      <td className="txt">{label}</td>
      <td className="neg-bits">{group4(bits)}</td>
      <td className="txt">{note}</td>
    </tr>
  );
}

/** Tìm −x bằng bù 2: đảo hết bit rồi cộng 1. */
export default function Negate() {
  const [w, setW] = useState(8);
  const [txt, setTxt] = useState('2');
  const n = Math.trunc(Number(txt));
  const lo = -(2 ** (w - 1)), hi = 2 ** (w - 1) - 1;
  const ok = txt.trim() !== '' && Number.isFinite(n) && n >= lo && n <= hi;
  const x = unsignedOf(n, w);
  const inv = unsignedOf(~x, w);
  const neg = unsignedOf(inv + 1, w);
  const carries = (() => { // nhớ khi cộng 1
    const c: number[] = []; let carry = 1;
    for (let i = 0; i < w; i++) { const b = Math.floor(inv / 2 ** i) % 2; c.unshift(carry); carry = b & carry; }
    return c;
  })();
  const sneg = signedOf(neg, w);
  const special = n === lo;

  return (
    <Widget
      title={<L vi="Đổi dấu bằng bù 2: đảo bit, rồi +1" en="Negating with two's complement: invert the bits, then +1" />}
      hint={<L vi="Gõ một số (có thể âm). Bảng cho thấy từng bước tìm −x." en="Type a number (it can be negative). The table shows each step of finding −x." />}
    >
      <div className="ctrls">
        <label className="field">x =<input id="ng-x" className="mono" value={txt} onChange={(e) => setTxt(e.target.value)} /></label>
        <div className="chips">
          {[2, 16, 100, -4, 0, lo].map((v) => <button key={v} className="btn sm" onClick={() => setTxt(String(v))}>{v}</button>)}
        </div>
        <div className="chips">
          {[8, 16].map((b) => <button key={b} className={`btn sm${w === b ? ' on' : ''}`} onClick={() => setW(b)}>{b} bit</button>)}
        </div>
      </div>
      {!ok ? (
        <p className="pill bad"><L vi={`Với ${w} bit, x phải nằm trong ${lo} … ${hi}`} en={`With ${w} bits, x must be within ${lo} … ${hi}`} /></p>
      ) : (
        <>
          <div className="scroll-x">
            <table className="steptable">
              <tbody>
                <Row label={`1. x = ${n}`} bits={binOf(x, w)} note={n < 0 ? <L vi="số âm đã ở dạng bù 2" en="a negative number, already in two's complement" /> : <L vi="viết nhị phân bình thường" en="written in binary as usual" />} />
                <Row label={<L vi="2. Đảo hết bit" en="2. Invert every bit" />} bits={binOf(inv, w)} note={<L vi="0 → 1, 1 → 0 (bù 1)" en="0 → 1, 1 → 0 (one's complement)" />} />
                <Row label={<L vi="   nhớ khi +1" en="   carries for +1" />} bits={carries.join('')} note={<L vi="số nhớ lan từ phải sang" en="the carry ripples in from the right" />} cls="neg-carry" />
                <Row label={<L vi="3. Cộng 1" en="3. Add 1" />} bits={binOf(neg, w)} note={`= ${sneg}`} cls="cur" />
              </tbody>
            </table>
          </div>
          <p className="explain">
            {special ? (
              <L
                vi={`Trường hợp đặc biệt: −(${lo}) = ${-lo} không biểu diễn được bằng ${w} bit, nên kết quả quay lại chính nó (${sneg}). Đây là tràn số.`}
                en={`Special case: −(${lo}) = ${-lo} cannot be represented in ${w} bits, so the result wraps back to itself (${sneg}). This is overflow.`}
              />
            ) : (
              <L
                vi={<>Kết quả: −({n}) = <b>{sneg}</b>. Kiểm tra: x + (−x) = {group4(binOf(x, w))} + {group4(binOf(neg, w))} = 1 {group4('0'.repeat(w))} → bỏ bit nhớ thứ {w + 1} còn đúng 0.</>}
                en={<>Result: −({n}) = <b>{sneg}</b>. Check: x + (−x) = {group4(binOf(x, w))} + {group4(binOf(neg, w))} = 1 {group4('0'.repeat(w))} → drop carry bit number {w + 1} and exactly 0 remains.</>}
              />
            )}
          </p>
        </>
      )}
    </Widget>
  );
}
