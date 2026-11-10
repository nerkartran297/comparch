'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { signedOf, toBits, unsignedOf } from '@/lib/bits';

const PRESETS: [number, '+' | '−', number][] = [[12, '+', 8], [122, '+', 8], [122, '+', 80], [122, '−', 80], [-100, '+', -50], [50, '−', -100]];

/** Cộng/trừ 8 bit có dấu theo từng cột: thấy số nhớ, carry-out và tràn số. */
export default function OverflowLab() {
  const [aT, setAT] = useState('122');
  const [bT, setBT] = useState('8');
  const [op, setOp] = useState<'+' | '−'>('+');
  const a = Math.trunc(Number(aT)), b = Math.trunc(Number(bT));
  const ok = [a, b].every((x) => Number.isFinite(x) && x >= -128 && x <= 127) && aT.trim() !== '' && bT.trim() !== '';

  const pa = unsignedOf(a, 8);
  const pbRaw = unsignedOf(b, 8);
  const pb = op === '+' ? pbRaw : unsignedOf(-b, 8); // trừ = cộng số đối (bù 2)
  const sum = pa + pb;
  const r = sum & 255;
  // số nhớ vào từng cột
  const carryIn: number[] = [];
  let c = 0;
  for (let i = 0; i < 8; i++) { carryIn[i] = c; const s = ((pa >> i) & 1) + ((pb >> i) & 1) + c; c = s >> 1; }
  const cout = c;
  const c7 = carryIn[7];
  const trueVal = op === '+' ? a + b : a - b;
  const sr = signedOf(r, 8);
  const ovf = trueVal !== sr;

  const cells = (v: number) => toBits(v, 8).map((x, i) => <td key={i} className={i === 0 ? 'ov-sign' : ''}>{x}</td>);

  return (
    <Widget title="Cộng / trừ 8 bit theo từng cột — tràn số xảy ra khi nào?" hint="Phạm vi 8 bit có dấu: −128 … 127. Phép trừ được đổi thành cộng với số đối (đảo bit + 1). Cột trái nhất là bit dấu.">
      <div className="ctrls">
        <label className="field">A<input id="ov-a" className="mono" value={aT} onChange={(e) => setAT(e.target.value)} /></label>
        <div className="chips">
          <button className={`btn${op === '+' ? ' on' : ''}`} onClick={() => setOp('+')}>+</button>
          <button className={`btn${op === '−' ? ' on' : ''}`} onClick={() => setOp('−')}>−</button>
        </div>
        <label className="field">B<input id="ov-b" className="mono" value={bT} onChange={(e) => setBT(e.target.value)} /></label>
      </div>
      <div className="chips">
        <span>Ví dụ slide 19:</span>
        {PRESETS.map(([x, o, y]) => (
          <button key={`${x}${o}${y}`} className="btn sm" onClick={() => { setAT(String(x)); setOp(o); setBT(String(y)); }}>{x} {o} {y}</button>
        ))}
      </div>
      {!ok ? (
        <p className="pill bad">A và B phải nằm trong −128 … 127</p>
      ) : (
        <>
          <div className="scroll-x">
            <table className="ov-table mono">
              <tbody>
                <tr className="ov-carry"><th>nhớ</th><td className="ov-out">{cout}</td>{[...carryIn].reverse().map((x, i) => <td key={i}>{x || ''}</td>)}<td className="txt" /></tr>
                <tr><th>A</th><td />{cells(pa)}<td className="txt">= {a}</td></tr>
                <tr><th>{op === '+' ? '+ B' : '+ (−B)'}</th><td />{cells(pb)}<td className="txt">= {op === '+' ? b : `−(${b}) = đảo bit của ${b} rồi +1`}</td></tr>
                <tr className="ov-res"><th>=</th><td className="ov-out">{cout}</td>{cells(r)}<td className="txt">= {sr} (có dấu) · {r} (không dấu)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="readouts">
            <div className="readout"><span>Kết quả đúng phải là</span><strong>{trueVal}</strong></div>
            <div className="readout"><span>8 bit thu được (có dấu)</span><strong>{sr}</strong></div>
            <div className={`readout ${ovf ? 'signal' : 'accent'}`}><span>Tràn số (overflow)?</span><strong>{ovf ? 'CÓ' : 'Không'}</strong></div>
            <div className="readout"><span>Carry-out (bit thứ 9)</span><strong>{cout}</strong></div>
          </div>
          <p className="explain">
            {ovf
              ? <>Hai số hạng (sau khi đổi trừ thành cộng) <b>cùng dấu</b> nhưng kết quả <b>khác dấu</b> → tràn. Kết quả đúng {trueVal} nằm ngoài −128…127 nên bị quay vòng thành {sr}. Dấu hiệu phần cứng: nhớ vào bit dấu ({c7}) khác nhớ ra ({cout}).</>
              : <>Không tràn: {signedOf(pa, 8) >= 0 !== signedOf(pb, 8) >= 0 ? 'cộng hai số khác dấu không bao giờ tràn.' : 'kết quả vẫn cùng dấu với hai số hạng.'} {cout ? 'Có carry-out nhưng với số CÓ dấu thì bỏ qua carry-out, nó không có nghĩa là tràn.' : ''}</>}
            {' '}RISC-V không báo gì khi tràn; phần mềm phải tự kiểm tra.
          </p>
        </>
      )}
    </Widget>
  );
}
