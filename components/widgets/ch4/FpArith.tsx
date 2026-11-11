'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';
import { binaryOfDouble, f32Parts } from '@/lib/bits';

const fr = Math.fround;

/** |x| / 2^e dạng nhị phân 1.xxx hoặc 0.xxx */
const sig = (x: number, e: number) => binaryOfDouble(Math.abs(x) / 2 ** e, 40);
const sgn = (x: number) => (x < 0 ? '−' : '');
const exOf = (x: number) => Math.floor(Math.log2(Math.abs(x)));

function normExp(x: number) {
  let e = exOf(x);
  if (Math.abs(x) / 2 ** e >= 2) e++;
  if (Math.abs(x) / 2 ** e < 1) e--;
  return e;
}

/** Cộng và nhân số thực theo 5 bước như slide 68–73. */
export default function FpArith() {
  const t = useT();
  const [aT, setAT] = useState('0.5');
  const [bT, setBT] = useState('-0.4375');
  const [op, setOp] = useState<'+' | '×'>('+');
  const a = fr(Number(aT)), b = fr(Number(bT));
  const ok = aT.trim() !== '' && bT.trim() !== '' && isFinite(a) && isFinite(b) && a !== 0 && b !== 0 && f32Parts(a).e !== 0 && f32Parts(b).e !== 0;

  let steps: { t: string; d: React.ReactNode }[] = [];
  let result = 0;
  if (ok) {
    const ea = normExp(a), eb = normExp(b);
    if (op === '+') {
      const [x, y, ex, ey] = ea >= eb ? [a, b, ea, eb] : [b, a, eb, ea];
      const sh = ex - ey;
      const exact = a + b; // hai float32: tổng chính xác trong double (thường đúng)
      result = fr(exact);
      const e3 = exact === 0 ? 0 : normExp(exact);
      steps = [
        { t: t('Bước 0: khôi phục bit ẩn "1."', 'Step 0: restore the hidden bit "1."'), d: <>{sgn(x)}{sig(x, ex)} × 2^{ex}  {t('và', 'and')}  {sgn(y)}{sig(y, ey)} × 2^{ey}</> },
        { t: t(`Bước 1: căn mũ — dịch phải số có mũ nhỏ hơn ${sh} vị trí`, `Step 1: align exponents — shift the number with the smaller exponent right by ${sh} place(s)`), d: <>{sgn(y)}{sig(y, ey)} × 2^{ey} = {sgn(y)}{sig(y, ex)} × 2^{ex}</> },
        { t: t('Bước 2: cộng phần định trị', 'Step 2: add the significands'), d: <>{sgn(x)}{sig(x, ex)} + ({sgn(y)}{sig(y, ex)}) = {sgn(exact)}{sig(exact, ex)} (× 2^{ex})</> },
        {
          t: t('Bước 3: chuẩn hoá về 1.xxx, chỉnh mũ', 'Step 3: normalize to 1.xxx and adjust the exponent'),
          d: exact === 0
            ? <>{t('Kết quả bằng 0', 'The result is 0')}</>
            : <>{sgn(exact)}{sig(exact, ex)} × 2^{ex} = {sgn(exact)}{sig(exact, e3)} × 2^{e3}{e3 !== ex ? (e3 < ex ? t(`  (dịch ${Math.abs(e3 - ex)} bit sang trái, mũ giảm)`, `  (shift left ${Math.abs(e3 - ex)} bit(s), exponent goes down)`) : t(`  (dịch ${Math.abs(e3 - ex)} bit sang phải, mũ tăng)`, `  (shift right ${Math.abs(e3 - ex)} bit(s), exponent goes up)`)) : ''}</>,
        },
        { t: t('Bước 4: làm tròn còn 23 bit phần lẻ', 'Step 4: round to 23 fraction bits'), d: result === exact ? <>{t('Không cần làm tròn (đủ chỗ)', 'No rounding needed (it fits)')}</> : <>{t('Làm tròn', 'Round')}: {binaryOfDouble(exact, 40)} → {binaryOfDouble(result, 40)}</> },
        { t: t('Bước 5: giấu lại bit ẩn rồi lưu', 'Step 5: hide the hidden bit again and store'), d: <>{result} = 0x{f32Parts(result).bits.toString(16).toUpperCase().padStart(8, '0')}</> },
      ];
    } else {
      const Ea = ea + 127, Eb = eb + 127;
      const m = (Math.abs(a) / 2 ** ea) * (Math.abs(b) / 2 ** eb); // chính xác: 24 × 24 bit < 53 bit
      const e3 = ea + eb;
      const shift = m >= 2 ? 1 : 0;
      const exact = a * b;
      result = fr(exact);
      const same = (a < 0) === (b < 0);
      steps = [
        { t: t('Bước 0: khôi phục bit ẩn', 'Step 0: restore the hidden bit'), d: <>{sgn(a)}{sig(a, ea)} × 2^{ea}  {t('và', 'and')}  {sgn(b)}{sig(b, eb)} × 2^{eb}</> },
        {
          t: t('Bước 1: cộng mũ (dạng bias thì trừ bớt 127 một lần) + xác định dấu', 'Step 1: add the exponents (with bias, subtract 127 once) + work out the sign'),
          d: <>E = {Ea} + {Eb} − 127 = {e3 + 127} ({t('mũ thật', 'real exponent')} {ea} + {eb} = {e3}); {t('dấu', 'sign')}: {same ? t('cùng dấu → dương', 'same signs → positive') : t('khác dấu → âm', 'different signs → negative')}</>,
        },
        { t: t('Bước 2: nhân phần định trị', 'Step 2: multiply the significands'), d: <>{sig(a, ea)} × {sig(b, eb)} = {binaryOfDouble(m, 48)}</> },
        {
          t: t('Bước 3: chuẩn hoá (tích nằm trong [1, 4) nên dịch phải tối đa 1 bit)', 'Step 3: normalize (the product is in [1, 4), so shift right at most 1 bit)'),
          d: shift
            ? <>{binaryOfDouble(m, 48)} ≥ 2 → {t('dịch phải 1, mũ +1', 'shift right 1, exponent +1')}: {binaryOfDouble(m / 2, 48)} × 2^{e3 + 1}</>
            : <>{binaryOfDouble(m, 48)} × 2^{e3} {t('đã chuẩn hoá', 'is already normalized')}</>,
        },
        { t: t('Bước 4: làm tròn còn 23 bit', 'Step 4: round to 23 bits'), d: result === exact ? <>{t('Không cần làm tròn', 'No rounding needed')}</> : <>{t('Làm tròn', 'Round')} → {binaryOfDouble(Math.abs(result), 40)}</> },
        { t: t('Bước 5: giấu bit ẩn rồi lưu', 'Step 5: hide the hidden bit and store'), d: <>{result} = 0x{f32Parts(result).bits.toString(16).toUpperCase().padStart(8, '0')}</> },
      ];
    }
  }

  return (
    <Widget
      title={<L vi="Cộng và nhân số thực từng bước" en="Adding and multiplying floating-point numbers step by step" />}
      hint={<L vi="Mặc định là ví dụ slide 69–73: 0.5 và −0.4375. Thử số khác, ví dụ 1.5 và 2.25." en="The default is the example from slides 69–73: 0.5 and −0.4375. Try other numbers, e.g. 1.5 and 2.25." />}
    >
      <div className="ctrls">
        <label className="field">a<input id="fp-a" className="mono" value={aT} onChange={(e) => setAT(e.target.value)} /></label>
        <div className="chips">
          <button className={`btn${op === '+' ? ' on' : ''}`} onClick={() => setOp('+')}>+</button>
          <button className={`btn${op === '×' ? ' on' : ''}`} onClick={() => setOp('×')}>×</button>
        </div>
        <label className="field">b<input id="fp-b" className="mono" value={bT} onChange={(e) => setBT(e.target.value)} /></label>
      </div>
      {!ok ? (
        <p className="pill bad"><L vi="Nhập hai số thực khác 0 (không quá nhỏ, không phải ∞)." en="Enter two non-zero real numbers (not too small, not ∞)." /></p>
      ) : (
        <>
          <ol className="solve">
            {steps.map((s, i) => <li key={i}><span>{s.t}</span><code>{s.d}</code></li>)}
          </ol>
          <p className="verdict">{a} {op} {b} = <b>{result}</b> (float32)</p>
        </>
      )}
    </Widget>
  );
}
