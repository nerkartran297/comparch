'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';
import { f32FromBits, f32Parts, group4 } from '@/lib/bits';

const PRESETS: [string, string, string][] = [
  ['9.6875', 'slide 52', 'slide 52'], ['-13.375', 'slide 50', 'slide 50'], ['1', 'slide 51', 'slide 51'], ['0.5', '1.0₂ × 2⁻¹', '1.0₂ × 2⁻¹'],
  ['100.75', 'slide 54', 'slide 54'], ['0.1', 'không chính xác', 'not exact'],
  ['0', 'số 0', 'zero'], ['1.17549435e-38', 'nhỏ nhất chuẩn hoá', 'smallest normalized'], ['1e-40', 'không chuẩn hoá', 'denormalized'],
  ['3.4e38', 'gần lớn nhất', 'near the largest'], ['Infinity', '∞', '∞'], ['NaN', 'NaN', 'NaN'],
];

function kindOf(e: number, f: number) {
  if (e === 0 && f === 0) return { vi: 'Số 0', en: 'Zero', cls: '' };
  if (e === 0) return { vi: 'Không chuẩn hoá (denormalized): 0.F × 2⁻¹²⁶', en: 'Denormalized: 0.F × 2⁻¹²⁶', cls: 'warn' };
  if (e === 255 && f === 0) return { vi: 'Vô cực (∞)', en: 'Infinity (∞)', cls: 'bad' };
  if (e === 255) return { vi: 'NaN — không phải số', en: 'NaN — Not a Number', cls: 'bad' };
  return { vi: 'Số chuẩn hoá bình thường', en: 'Ordinary normalized number', cls: 'ok' };
}

/** Các bước đổi số thập phân sang nhị phân, chuẩn hoá, tính E. */
function Steps({ x }: { x: number }) {
  const t = useT();
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
  if (e === 0) return <p className="widget-note"><L vi="Số này quá nhỏ: E = 0, dùng dạng không chuẩn hoá 0.F × 2⁻¹²⁶." en="This number is too small: E = 0, so the denormalized form 0.F × 2⁻¹²⁶ is used." /></p>;
  const exp = e - 127;
  const fstr = f.toString(2).padStart(23, '0');
  const trimmed = fstr.replace(/0+$/, '') || '0';
  return (
    <ol className="solve">
      <li><span><L vi="1. Phần nguyên → nhị phân (chia 2)" en="1. Integer part → binary (divide by 2)" /></span><code>{ip} = {ip.toString(2)}₂</code></li>
      <li>
        <span><L vi="2. Phần lẻ → nhị phân (NHÂN 2, lấy phần nguyên)" en="2. Fraction part → binary (MULTIPLY by 2, take the integer part)" /></span>
        <code>
          {fracRows.length === 0 ? t('không có phần lẻ', 'no fraction part') : fracRows.slice(0, 8).map((r, i) => <span key={i} className="fr-row">{r.v.toPrecision(6).replace(/\.?0+$/, '')} × 2 = {r.r.toPrecision(6).replace(/\.?0+$/, '')} → {r.bit}<br /></span>)}
          {fracRows.length > 8 && '…'}
          {fracRows.length > 0 && <>→ 0.{fracBits}{more ? t('… (lặp mãi, phải làm tròn!)', '… (repeats forever, must be rounded!)') : ''}₂</>}
        </code>
      </li>
      <li><span><L vi="3. Ghép lại" en="3. Put them together" /></span><code>{ax} = {ip.toString(2)}{fracBits ? '.' + fracBits : ''}{more ? '…' : ''}₂</code></li>
      <li><span><L vi="4. Chuẩn hoá về 1.xxx × 2^mũ" en="4. Normalize to 1.xxx × 2^exponent" /></span><code>= 1.{trimmed} × 2^{exp}</code></li>
      <li><span><L vi="5. Tính E = mũ + 127" en="5. Compute E = exponent + 127 (bias)" /></span><code>{exp} + 127 = {e} = {e.toString(2).padStart(8, '0')}₂</code></li>
      <li><span><L vi="6. F = phần sau dấu chấm (bỏ số 1 ẩn), đủ 23 bit" en="6. F = the part after the point (drop the hidden 1), padded to 23 bits" /></span><code>{fstr}</code></li>
    </ol>
  );
}

/** Khám phá IEEE 754 single precision: gõ số hoặc bấm từng bit. */
export default function Ieee754() {
  const t = useT();
  const [txt, setTxt] = useState('9.6875');
  const [bits, setBits] = useState(() => f32Parts(9.6875).bits);
  const [fromText, setFromText] = useState(true);

  const onText = (s: string) => {
    setTxt(s);
    const v = s.trim().toLowerCase() === 'nan' ? NaN : Number(s);
    if (s.trim() !== '' && (!Number.isNaN(v) || s.trim().toLowerCase() === 'nan')) { setBits(f32Parts(v).bits); setFromText(true); }
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
    <Widget
      title={<L vi="IEEE 754 single precision: 1 bit dấu · 8 bit mũ · 23 bit phần lẻ" en="IEEE 754 single precision: 1 sign bit · 8 exponent bits · 23 fraction bits" />}
      hint={<L
        vi="Gõ một số thực, hoặc bấm vào từng bit để xem giá trị đổi ra sao. Hồng = dấu S, xanh = mũ E, xanh lá = phần lẻ F."
        en="Type a real number, or click individual bits to see how the value changes. Pink = sign S, blue = exponent E, green = fraction F."
      />}
    >
      <div className="ctrls">
        <label className="field"><L vi="Số thực" en="Real number" /><input id="ie-x" className="mono wide" value={txt} onChange={(e) => onText(e.target.value)} /></label>
      </div>
      <div className="chips">
        {PRESETS.map(([v, nVi, nEn]) => <button key={v} className="btn sm" onClick={() => onText(v)} title={t(nVi, nEn)}>{v === 'Infinity' ? '∞' : v}</button>)}
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
          <span className="e"><L vi={`E (8 bit) = ${e}`} en={`E (8 bits) = ${e}`} /></span>
          <span className="f"><L vi="F (23 bit)" en="F (23 bits)" /></span>
        </div>
      </div>
      <div className="readouts">
        <div className="readout"><span>Hex</span><strong>0x{bits.toString(16).toUpperCase().padStart(8, '0')}</strong></div>
        <div className="readout"><span><L vi="Dấu S" en="Sign S" /></span><strong>{s} ({s ? t('âm', 'negative') : t('dương', 'positive')})</strong></div>
        <div className="readout"><span><L vi="Mũ thật = E − 127" en="Real exponent = E − 127" /></span><strong>{e === 0 ? t('−126 (đặc biệt)', '−126 (special)') : e === 255 ? '—' : `${e} − 127 = ${e - 127}`}</strong></div>
        <div className="readout accent"><span><L vi="Giá trị" en="Value" /></span><strong>{isFinite(val) ? exact : String(val)}</strong></div>
      </div>
      <p className="explain mono">
        {e === 255 ? (f ? 'E = 255, F ≠ 0 → NaN' : `E = 255, F = 0 → ${s ? '−' : '+'}∞`) : e === 0 && f === 0 ? `E = 0, F = 0 → ${s ? '−' : '+'}0` : `(−1)^${s} × ${mant}${fTrim}₂ × 2^${e === 0 ? -126 : e - 127}`}
      </p>
      <p><span className={`pill ${kind.cls}`}><L vi={kind.vi} en={kind.en} /></span></p>
      {lossy && (
        <p className="pill warn">
          <L
            vi={`Bạn gõ ${txt}, nhưng float chỉ lưu được gần đúng: ${exact}. Sai lệch ${Math.abs(typed - val).toExponential(2)}.`}
            en={`You typed ${txt}, but a float can only store an approximation: ${exact}. Error ${Math.abs(typed - val).toExponential(2)}.`}
          />
        </p>
      )}
      {fromText && isFinite(val) && val !== 0 && (
        <details className="ie-steps" open>
          <summary><L vi={`Cách đổi tay ${txt} sang IEEE 754 từng bước`} en={`Converting ${txt} to IEEE 754 by hand, step by step`} /></summary>
          <Steps x={val} />
          <p className="mono explain">{t('Ghép', 'Join')}: {s} | {e.toString(2).padStart(8, '0')} | {f.toString(2).padStart(23, '0')}{'\n'}    = {group4(bits.toString(2).padStart(32, '0'))} = 0x{bits.toString(16).toUpperCase().padStart(8, '0')}</p>
        </details>
      )}
    </Widget>
  );
}
