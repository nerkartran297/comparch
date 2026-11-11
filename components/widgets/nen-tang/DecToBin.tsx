'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';

/** Đổi thập phân → nhị phân bằng cách chia 2 liên tục, đọc số dư từ dưới lên. */
export default function DecToBin() {
  const [txt, setTxt] = useState('25');
  const n = Math.floor(Number(txt));
  const ok = txt.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 1_000_000;

  const rows: { q: number; d: number; r: number }[] = [];
  if (ok) {
    let x = n;
    if (x === 0) rows.push({ q: 0, d: 0, r: 0 });
    while (x > 0) { rows.push({ q: x, d: Math.floor(x / 2), r: x % 2 }); x = Math.floor(x / 2); }
  }
  const result = rows.map((r) => r.r).reverse().join('') || '0';

  // cách nhanh: trừ dần lũy thừa của 2
  const parts: number[] = [];
  if (ok) { let x = n; for (let p = 2 ** 20; p >= 1; p /= 2) if (x >= p) { parts.push(p); x -= p; } }

  return (
    <Widget
      title={<L vi="Thập phân → nhị phân: chia 2, lấy số dư" en="Decimal → binary: divide by 2, keep the remainder" />}
      hint={<L
        vi="Gõ một số. Mỗi dòng chia cho 2; đọc cột số dư từ DƯỚI LÊN là ra số nhị phân."
        en="Type a number. Each row divides by 2; read the remainder column from the BOTTOM UP to get the binary number."
      />}
    >
      <div className="ctrls">
        <label className="field">
          <L vi="Số thập phân (0 … 1 000 000)" en="Decimal number (0 … 1,000,000)" />
          <input id="d2b-n" className="mono" value={txt} onChange={(e) => setTxt(e.target.value)} inputMode="numeric" />
        </label>
        <div className="chips">
          {[25, 125, 207, 255, 307].map((x) => <button key={x} className="btn sm" onClick={() => setTxt(String(x))}>{x}</button>)}
        </div>
      </div>
      {!ok ? (
        <p className="pill bad"><L vi="Nhập số nguyên từ 0 đến 1 000 000" en="Enter a whole number from 0 to 1,000,000" /></p>
      ) : (
        <div className="two-col">
          <div className="scroll-x">
            <table className="steptable">
              <thead><tr><th><L vi="Phép chia" en="Division" /></th><th><L vi="Thương" en="Quotient" /></th><th><L vi="Dư" en="Remainder" /></th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.q} ÷ 2</td>
                    <td>{r.d}</td>
                    <td className="chg">{r.r}{i === rows.length - 1 ? <L vi="  ↑ đọc từ đây" en="  ↑ read from here" /> : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="readouts" style={{ alignContent: 'start' }}>
            <div className="readout accent"><span><L vi="Kết quả nhị phân" en="Binary result" /></span><strong>{result}</strong></div>
            <div className="readout"><span><L vi="Cách nhanh: tổng các lũy thừa 2" en="Shortcut: sum of powers of 2" /></span><strong>{parts.join(' + ') || '0'}</strong></div>
            <div className="readout"><span><L vi="Hex (gom 4 bit)" en="Hex (groups of 4 bits)" /></span><strong>0x{n.toString(16).toUpperCase()}</strong></div>
          </div>
        </div>
      )}
    </Widget>
  );
}
