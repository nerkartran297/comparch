'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { f32FromBits, f32Parts, group4 } from '@/lib/bits';

const PRESETS: [string, string][] = [
  ['9.6875', 'slide 52'], ['-13.375', 'slide 50'], ['1', 'slide 51'], ['0.5', '1.0₂ × 2⁻¹'], ['100.75', 'slide 54'], ['0.1', 'không chính xác'],
  ['0', 'số 0'], ['1.17549435e-38', 'nhỏ nhất chuẩn hoá'], ['1e-40', 'không chuẩn hoá'], ['3.4e38', 'gần lớn nhất'], ['Infinity', '∞'], ['NaN', 'NaN'],
];

function kindOf(e: number, f: number) {
  if (e === 0 && f === 0) return { name: 'Số 0', cls: '' };
  if (e === 0) return { name: 'Không chuẩn hoá (denormalized): 0.F × 2⁻¹²⁶', cls: 'warn' };
  if (e === 255 && f === 0) return { name: 'Vô cực (∞)', cls: 'bad' };
  if (e === 255) return { name: 'NaN — không phải số', cls: 'bad' };
  return { name: 'Số chuẩn hoá bình thường', cls: 'ok' };
}

/** Các bước đổi số thập phân sang nhị phân, chuẩn hoá, tính E. */
function Steps({ x }: { x: number }) {
  if (!isFinite(x) || x === 0) return null;
  const ax = Math.abs(x);
  const ip = Math.floor(ax);
  let frac = ax - ip;
  const fracRows: { v: number; r: number; bit: number }[] = [];
  let guard = 0;
  while (frac > 0 && guard < 12) { const r = frac * 2; const bit = r >= 1 ? 1 : 0; fracRows.push({ v: frac, r, bit }); frac = r - bit; guard++; }
  const fracBits = fracRows.map((r) => r.bit).join('');
  const more = frac > 0;
  const { e, f } = f32Parts(x);
  if (e === 0) return <p className="widget-note">Số này quá nhỏ: E = 0, dùng dạng không chuẩn hoá 0.F × 2⁻¹²⁶.</p>;
  const exp = e - 127;
  const fstr = f.toString(2).padStart(23, '0');
  const trimmed = fstr.replace(/0+$/, '') || '0';
  return (
    <ol className="solve">
      <li><span>1. Phần nguyên → nhị phân (chia 2)</span><code>{ip} = {ip.toString(2)}₂</code></li>
      <li>
        <span>2. Phần lẻ → nhị phân (NHÂN 2, lấy phần nguyên)</span>
        <code>
          {fracRows.length === 0 ? 'không có phần lẻ' : fracRows.slice(0, 8).map((r, i) => <span key={i} className="fr-row">{r.v.toPrecision(6).replace(/\.?0+$/, '')} × 2 = {r.r.toPrecision(6).replace(/\.?0+$/, '')} → {r.bit}<br /></span>)}
          {fracRows.length > 8 && '…'}
          {fracRows.length > 0 && <>→ 0.{fracBits}{more ? '… (lặp mãi, phải làm tròn!)' : ''}₂</>}
        </code>
      </li>
      <li><span>3. Ghép lại</span><code>{ax} = {ip.toString(2)}{fracBits ? '.' + fracBits : ''}{more ? '…' : ''}₂</code></li>
      <li><span>4. Chuẩn hoá về 1.xxx × 2^mũ</span><code>= 1.{trimmed} × 2^{exp}</code></li>
      <li><span>5. Tính E = mũ + 127</span><code>{exp} + 127 = {e} = {e.toString(2).padStart(8, '0')}₂</code></li>
      <li><span>6. F = phần sau dấu chấm (bỏ số 1 ẩn), đủ 23 bit</span><code>{fstr}</code></li>
    </ol>
  );
}

/** Khám phá IEEE 754 single precision: gõ số hoặc bấm từng bit. */
export default function Ieee754() {
  const [txt, setTxt] = useState('9.6875');
  const [bits, setBits] = useState(() => f32Parts(9.6875).bits);
  const [fromText, setFromText] = useState(true);

  const onText = (t: string) => {
    setTxt(t);
    const v = t.trim().toLowerCase() === 'nan' ? NaN : Number(t);
    if (t.trim() !== '' && (!Number.isNaN(v) || t.trim().toLowerCase() === 'nan')) { setBits(f32Parts(v).bits); setFromText(true); }
  };
  const flip = (i: number) => { const nb = (bits ^ (1 << (31 - i))) >>> 0; setBits(nb); setFromText(false); setTxt(String(f32FromBits(nb))); };

  const s = bits >>> 31, e = (bits >>> 23) & 0xff, f = bits & 0x7fffff;
  const val = f32FromBits(bits);
  const kind = kindOf(e, f);
  const typed = Number(txt);
  const exact = isFinite(val) ? val.toPrecision(17).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') : String(val);
  const lossy = fromText && isFinite(typed) && typed !== val;
  const b = bits.toString(2).padStart(32, '0').split('').map(Number);
  const mant = e === 0 ? '0.' : '1.';
  const fTrim = f.toString(2).padStart(23, '0').replace(/0+$/, '') || '0';

  return (
    <Widget title="IEEE 754 single precision: 1 bit dấu · 8 bit mũ · 23 bit phần lẻ" hint="Gõ một số thực, hoặc bấm vào từng bit để xem giá trị đổi ra sao. Hồng = dấu S, xanh = mũ E, xanh lá = phần lẻ F.">
      <div className="ctrls">
        <label className="field">Số thực<input id="ie-x" className="mono wide" value={txt} onChange={(e) => onText(e.target.value)} /></label>
      </div>
      <div className="chips">
        {PRESETS.map(([v, n]) => <button key={v} className="btn sm" onClick={() => onText(v)} title={n}>{v === 'Infinity' ? '∞' : v}</button>)}
      </div>
      <div className="scroll-x">
        <div className="ie-bits">
          {b.map((x, i) => {
            const part = i === 0 ? 's' : i <= 8 ? 'e' : 'f';
            return (
              <button key={i} className={`ie-bit ${part}${x ? ' on' : ''}${i === 8 || i === 0 ? ' gap' : ''}`} onClick={() => flip(i)} aria-pressed={!!x} aria-label={`bit ${31 - i}`}>
                {x}
              </button>
            );
          })}
        </div>
        <div className="ie-labels">
          <span className="s">S</span>
          <span className="e">E (8 bit) = {e}</span>
          <span className="f">F (23 bit)</span>
        </div>
      </div>
      <div className="readouts">
        <div className="readout"><span>Hex</span><strong>0x{bits.toString(16).toUpperCase().padStart(8, '0')}</strong></div>
        <div className="readout"><span>Dấu S</span><strong>{s} ({s ? 'âm' : 'dương'})</strong></div>
        <div className="readout"><span>Mũ thật = E − 127</span><strong>{e === 0 ? '−126 (đặc biệt)' : e === 255 ? '—' : `${e} − 127 = ${e - 127}`}</strong></div>
        <div className="readout accent"><span>Giá trị</span><strong>{isFinite(val) ? exact : String(val)}</strong></div>
      </div>
      <p className="explain mono">
        {e === 255 ? (f ? 'E = 255, F ≠ 0 → NaN' : `E = 255, F = 0 → ${s ? '−' : '+'}∞`) : e === 0 && f === 0 ? `E = 0, F = 0 → ${s ? '−' : '+'}0` : `(−1)^${s} × ${mant}${fTrim}₂ × 2^${e === 0 ? -126 : e - 127}`}
      </p>
      <p><span className={`pill ${kind.cls}`}>{kind.name}</span></p>
      {lossy && (
        <p className="pill warn">Bạn gõ {txt}, nhưng float chỉ lưu được gần đúng: {exact}. Sai lệch {Math.abs(typed - val).toExponential(2)}.</p>
      )}
      {fromText && isFinite(val) && val !== 0 && (
        <details className="ie-steps" open>
          <summary>Cách đổi tay {txt} sang IEEE 754 từng bước</summary>
          <Steps x={val} />
          <p className="mono explain">Ghép: {s} | {e.toString(2).padStart(8, '0')} | {f.toString(2).padStart(23, '0')}{'\n'}    = {group4(bits.toString(2).padStart(32, '0'))} = 0x{bits.toString(16).toUpperCase().padStart(8, '0')}</p>
        </details>
      )}
    </Widget>
  );
}
