'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { hexOf, patternFrom, signedOf, toBits, unsignedOf } from '@/lib/bits';

/** Bấm từng bit để thấy giá trị thập phân, hex, có dấu/không dấu thay đổi thế nào. */
export default function BinaryPlayground({ signedView = false }: { signedView?: boolean }) {
  const [w, setW] = useState(8);
  const [v, setV] = useState(11);
  const [txt, setTxt] = useState('11');
  const [err, setErr] = useState('');

  const bits = toBits(v, w);
  const u = unsignedOf(v, w);
  const s = signedOf(v, w);
  const msb = bits[0] === 1;

  const setValue = (nv: number) => { setV(nv); setTxt(String(signedView && nv >= 2 ** (w - 1) ? nv - 2 ** w : nv)); setErr(''); };
  const toggle = (i: number) => setValue(unsignedOf(v ^ (2 ** (w - 1 - i)), w));
  const changeW = (nw: number) => { setW(nw); const nv = unsignedOf(v, nw); setV(nv); setTxt(String(nv)); };

  const onText = (t: string) => {
    setTxt(t);
    const n = Number(t.trim());
    if (t.trim() === '' || Number.isNaN(n)) { setErr('Nhập một số nguyên'); return; }
    const p = patternFrom(n, w);
    if (p === null) { setErr(`Với ${w} bit chỉ nhập được từ ${-(2 ** (w - 1))} đến ${2 ** w - 1}`); return; }
    setErr(''); setV(p);
  };

  const weights = bits.map((_, i) => 2 ** (w - 1 - i));
  const onW = weights.filter((_, i) => bits[i]);
  const uExplain = onW.length ? onW.join(' + ') + ` = ${u}` : '0';
  const sExplain = msb ? [`−${weights[0]}`, ...onW.slice(1).map(String)].join(' + ') + ` = ${s}` : uExplain;

  const nibbles: number[][] = [];
  for (let i = 0; i < w; i += 4) nibbles.push(bits.slice(i, i + 4));

  return (
    <Widget title={signedView ? 'Đọc một dãy bit theo 2 cách: không dấu và có dấu (bù 2)' : 'Bấm vào từng bit'} hint="Bấm ô bit để bật/tắt, hoặc gõ số vào ô bên dưới. Số dưới mỗi ô là trọng số của vị trí đó.">
      <div className="ctrls">
        <label className="field">
          Gõ số thập phân
          <input id={`bp-num-${signedView ? 's' : 'u'}`} className="mono" value={txt} onChange={(e) => onText(e.target.value)} inputMode="numeric" />
        </label>
        <div className="chips">
          <span>Số bit:</span>
          {[4, 8, 16].map((n) => (
            <button key={n} className={`btn sm${w === n ? ' on' : ''}`} onClick={() => changeW(n)}>{n} bit</button>
          ))}
        </div>
        <div className="chips">
          <button className="btn sm" onClick={() => setValue(0)}>Xoá về 0</button>
          <button className="btn sm" onClick={() => setValue(unsignedOf(-1, w))}>Bật hết</button>
          <button className="btn sm" onClick={() => setValue(Math.floor(Math.random() * 2 ** w))}>Ngẫu nhiên</button>
        </div>
      </div>
      {err && <p className="pill bad">{err}</p>}

      <div className="scroll-x">
        <div className="bits" role="group" aria-label="Các bit">
          {nibbles.map((nb, g) => (
            <div className="nibble" key={g}>
              <div className="nibble-bits">
                {nb.map((b, j) => {
                  const i = g * 4 + j;
                  return (
                    <div className="bitcell" key={i}>
                      <button className={`bit${b ? ' on' : ''}${signedView && i === 0 ? ' sign' : ''}`} onClick={() => toggle(i)} aria-label={`bit ${w - 1 - i}, trọng số ${signedView && i === 0 ? '−' : ''}${weights[i]}`} aria-pressed={!!b}>
                        {b}
                      </button>
                      <span className="bit-w">{signedView && i === 0 ? '−' : ''}{weights[i]}</span>
                    </div>
                  );
                })}
              </div>
              <span className="nib-hex" title="4 bit = 1 chữ số hex">{hexOf(nb.reduce((a, x) => a * 2 + x, 0), 4)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="readouts">
        <div className="readout accent"><span>Không dấu (unsigned)</span><strong>{u}</strong></div>
        <div className="readout"><span>Hex</span><strong>0x{hexOf(v, w)}</strong></div>
        {signedView && <div className={`readout${msb ? ' signal' : ''}`}><span>Có dấu (bù 2)</span><strong>{s}</strong></div>}
        <div className="readout"><span>Phạm vi {w} bit</span><strong>{signedView ? `${-(2 ** (w - 1))} … ${2 ** (w - 1) - 1}` : `0 … ${2 ** w - 1}`}</strong></div>
      </div>
      <p className="explain mono">Không dấu: {uExplain}{signedView && <><br />Có dấu:   {sExplain}{msb ? '   (bit trái nhất mang trọng số ÂM)' : '   (bit dấu = 0 → giống không dấu)'}</>}</p>
    </Widget>
  );
}
