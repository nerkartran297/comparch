'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';
import { hexOf, patternFrom, signedOf, toBits, unsignedOf } from '@/lib/bits';

/** Bấm từng bit để thấy giá trị thập phân, hex, có dấu/không dấu thay đổi thế nào. */
export default function BinaryPlayground({ signedView = false }: { signedView?: boolean }) {
  const t = useT();
  const [w, setW] = useState(8);
  const [v, setV] = useState(11);
  const [txt, setTxt] = useState('11');
  const [err, setErr] = useState<null | { kind: 'nan' } | { kind: 'range'; w: number }>(null);

  const bits = toBits(v, w);
  const u = unsignedOf(v, w);
  const s = signedOf(v, w);
  const msb = bits[0] === 1;

  const setValue = (nv: number) => { setV(nv); setTxt(String(signedView && nv >= 2 ** (w - 1) ? nv - 2 ** w : nv)); setErr(null); };
  const toggle = (i: number) => setValue(unsignedOf(v ^ (2 ** (w - 1 - i)), w));
  const changeW = (nw: number) => { setW(nw); const nv = unsignedOf(v, nw); setV(nv); setTxt(String(nv)); };

  const onText = (txtIn: string) => {
    setTxt(txtIn);
    const n = Number(txtIn.trim());
    if (txtIn.trim() === '' || Number.isNaN(n)) { setErr({ kind: 'nan' }); return; }
    const p = patternFrom(n, w);
    if (p === null) { setErr({ kind: 'range', w }); return; }
    setErr(null); setV(p);
  };

  const weights = bits.map((_, i) => 2 ** (w - 1 - i));
  const onW = weights.filter((_, i) => bits[i]);
  const uExplain = onW.length ? onW.join(' + ') + ` = ${u}` : '0';
  const sExplain = msb ? [`−${weights[0]}`, ...onW.slice(1).map(String)].join(' + ') + ` = ${s}` : uExplain;

  const nibbles: number[][] = [];
  for (let i = 0; i < w; i += 4) nibbles.push(bits.slice(i, i + 4));

  return (
    <Widget
      title={signedView
        ? <L vi="Đọc một dãy bit theo 2 cách: không dấu và có dấu (bù 2)" en="Read one bit pattern two ways: unsigned and signed (two's complement)" />
        : <L vi="Bấm vào từng bit" en="Click each bit" />}
      hint={<L
        vi="Bấm ô bit để bật/tắt, hoặc gõ số vào ô bên dưới. Số dưới mỗi ô là trọng số của vị trí đó."
        en="Click a bit to flip it, or type a number in the box below. The number under each box is the weight of that position."
      />}
    >
      <div className="ctrls">
        <label className="field">
          <L vi="Gõ số thập phân" en="Type a decimal number" />
          <input id={`bp-num-${signedView ? 's' : 'u'}`} className="mono" value={txt} onChange={(e) => onText(e.target.value)} inputMode="numeric" />
        </label>
        <div className="chips">
          <span><L vi="Số bit:" en="Bits:" /></span>
          {[4, 8, 16].map((n) => (
            <button key={n} className={`btn sm${w === n ? ' on' : ''}`} onClick={() => changeW(n)}>{n} bit</button>
          ))}
        </div>
        <div className="chips">
          <button className="btn sm" onClick={() => setValue(0)}><L vi="Xoá về 0" en="Clear to 0" /></button>
          <button className="btn sm" onClick={() => setValue(unsignedOf(-1, w))}><L vi="Bật hết" en="All ones" /></button>
          <button className="btn sm" onClick={() => setValue(Math.floor(Math.random() * 2 ** w))}><L vi="Ngẫu nhiên" en="Random" /></button>
        </div>
      </div>
      {err && (
        <p className="pill bad">
          {err.kind === 'nan'
            ? <L vi="Nhập một số nguyên" en="Enter a whole number" />
            : <L vi={`Với ${err.w} bit chỉ nhập được từ ${-(2 ** (err.w - 1))} đến ${2 ** err.w - 1}`} en={`With ${err.w} bits you can only enter ${-(2 ** (err.w - 1))} to ${2 ** err.w - 1}`} />}
        </p>
      )}

      <div className="scroll-x">
        <div className="bits" role="group" aria-label={t('Các bit', 'Bits')}>
          {nibbles.map((nb, g) => (
            <div className="nibble" key={g}>
              <div className="nibble-bits">
                {nb.map((b, j) => {
                  const i = g * 4 + j;
                  const wl = `${signedView && i === 0 ? '−' : ''}${weights[i]}`;
                  return (
                    <div className="bitcell" key={i}>
                      <button
                        className={`bit${b ? ' on' : ''}${signedView && i === 0 ? ' sign' : ''}`}
                        onClick={() => toggle(i)}
                        aria-label={t(`bit ${w - 1 - i}, trọng số ${wl}`, `bit ${w - 1 - i}, weight ${wl}`)}
                        aria-pressed={!!b}
                      >
                        {b}
                      </button>
                      <span className="bit-w">{wl}</span>
                    </div>
                  );
                })}
              </div>
              <span className="nib-hex" title={t('4 bit = 1 chữ số hex', '4 bits = 1 hex digit')}>{hexOf(nb.reduce((a, x) => a * 2 + x, 0), 4)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="readouts">
        <div className="readout accent"><span><L vi="Không dấu (unsigned)" en="Unsigned" /></span><strong>{u}</strong></div>
        <div className="readout"><span>Hex</span><strong>0x{hexOf(v, w)}</strong></div>
        {signedView && <div className={`readout${msb ? ' signal' : ''}`}><span><L vi="Có dấu (bù 2)" en="Signed (two's complement)" /></span><strong>{s}</strong></div>}
        <div className="readout"><span><L vi={`Phạm vi ${w} bit`} en={`${w}-bit range`} /></span><strong>{signedView ? `${-(2 ** (w - 1))} … ${2 ** (w - 1) - 1}` : `0 … ${2 ** w - 1}`}</strong></div>
      </div>
      <p className="explain mono">
        <L vi="Không dấu:" en="Unsigned:" /> {uExplain}
        {signedView && (
          <>
            <br />
            <L vi="Có dấu:  " en="Signed:  " /> {sExplain}
            {msb
              ? <L vi="   (bit trái nhất mang trọng số ÂM)" en="   (the leftmost bit has a NEGATIVE weight)" />
              : <L vi="   (bit dấu = 0 → giống không dấu)" en="   (sign bit = 0 → same as unsigned)" />}
          </>
        )}
      </p>
    </Widget>
  );
}
