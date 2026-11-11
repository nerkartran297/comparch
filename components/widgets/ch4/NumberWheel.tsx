'use client';

import { useEffect, useRef, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';

const toS = (p: number) => (p >= 8 ? p - 16 : p);
const bin4 = (p: number) => p.toString(2).padStart(4, '0');

/** Vòng số 4 bit: mỗi vị trí đọc được 2 cách (không dấu / có dấu). Cộng = đi vòng theo chiều kim đồng hồ. */
export default function NumberWheel() {
  const t = useT();
  const [a, setA] = useState(5);
  const [b, setB] = useState(4);
  const [pos, setPos] = useState(5);
  const [moved, setMoved] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pa = a & 15, pb = b & 15;
  const res = (pa + pb) & 15;
  const carry = pa + pb > 15;
  const overflow = toS(pa) >= 0 === toS(pb) >= 0 && toS(res) >= 0 !== toS(pa) >= 0;
  const done = !running && moved === pb;

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const go = () => {
    if (timer.current) clearInterval(timer.current);
    setPos(pa); setMoved(0); setRunning(true);
    let k = 0;
    timer.current = setInterval(() => {
      k++;
      if (k > pb) { clearInterval(timer.current!); setRunning(false); return; }
      setPos((pa + k) & 15); setMoved(k);
    }, 260);
    if (pb === 0) { clearInterval(timer.current); setRunning(false); }
  };
  const resetTo = (na: number, nb: number) => { if (timer.current) clearInterval(timer.current); setA(na); setB(nb); setPos(na & 15); setMoved(0); setRunning(false); };

  const R = 128, cx = 170, cy = 170;
  const pt = (p: number, r: number) => {
    const ang = (p / 16) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const boundary = (between: number, cls: string, label: string) => {
    const ang = ((between - 0.5) / 16) * Math.PI * 2 - Math.PI / 2;
    const [x1, y1] = [cx + 72 * Math.cos(ang), cy + 72 * Math.sin(ang)];
    const [x2, y2] = [cx + 168 * Math.cos(ang), cy + 168 * Math.sin(ang)];
    const ty = between === 0 ? -6 : 356;
    return (
      <g className={cls}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <text x={cx} y={ty} textAnchor="middle">{label}</text>
      </g>
    );
  };
  const visited = new Set(Array.from({ length: moved + 1 }, (_, k) => (pa + k) & 15));

  return (
    <Widget
      title={<L vi="Vòng số 4 bit: cộng là đi theo chiều kim đồng hồ" en="The 4-bit number wheel: adding means moving clockwise" />}
      hint={<L
        vi="Vòng ngoài: đọc không dấu (0…15). Vòng trong: đọc có dấu (−8…7). Chọn a, b rồi bấm Cộng để xem kim chạy b bước."
        en="Outer ring: read as unsigned (0…15). Inner ring: read as signed (−8…7). Pick a and b, then press Add to watch the pointer move b steps."
      />}
    >
      <div className="wheel-wrap">
        <div className="svgbox free wheel-svg">
          <svg viewBox="0 -20 340 384" role="img" aria-label={t('Vòng số 4 bit', '4-bit number wheel')}>
            <circle cx={cx} cy={cy} r={R} className="wh-ring" />
            {boundary(0, 'wh-carry', t('↓ biên không dấu: qua 15 → 0 là có carry', '↓ unsigned boundary: crossing 15 → 0 means a carry'))}
            {boundary(8, 'wh-ovf', t('↑ biên có dấu: qua 7 → −8 là tràn số', '↑ signed boundary: crossing 7 → −8 means overflow'))}
            {Array.from({ length: 16 }, (_, p) => {
              const [x, y] = pt(p, R);
              const [xo, yo] = pt(p, R + 26);
              const [xi, yi] = pt(p, R - 34);
              return (
                <g key={p} className={`wh-node${p === pos ? ' cur' : ''}${visited.has(p) && moved > 0 ? ' seen' : ''}${p === pa ? ' start' : ''}`}>
                  <circle cx={x} cy={y} r={15} />
                  <text x={x} y={y + 4} textAnchor="middle" className="wh-bits">{bin4(p)}</text>
                  <text x={xo} y={yo + 4} textAnchor="middle" className="wh-u">{p}</text>
                  <text x={xi} y={yi + 4} textAnchor="middle" className={`wh-s${p >= 8 ? ' neg' : ''}`}>{toS(p)}</text>
                </g>
              );
            })}
            <text x={cx} y={cy - 6} textAnchor="middle" className="wh-center">{bin4(pos)}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="wh-center-sub">{pos} | {toS(pos)}</text>
          </svg>
        </div>
        <div className="wheel-side">
          <label className="field"><L vi="a (có dấu, −8…7)" en="a (signed, −8…7)" />
            <select id="wh-a" value={a} onChange={(e) => resetTo(+e.target.value, b)}>
              {Array.from({ length: 16 }, (_, i) => i - 8).map((v) => <option key={v} value={v}>{v} = {bin4(v & 15)}</option>)}
            </select>
          </label>
          <label className="field"><L vi="b (có dấu, −8…7)" en="b (signed, −8…7)" />
            <select id="wh-b" value={b} onChange={(e) => resetTo(a, +e.target.value)}>
              {Array.from({ length: 16 }, (_, i) => i - 8).map((v) => <option key={v} value={v}>{v} = {bin4(v & 15)}</option>)}
            </select>
          </label>
          <div className="chips">
            <button className="btn primary" onClick={go} disabled={running}>▶ <L vi="Cộng a + b" en="Add a + b" /></button>
          </div>
          <div className="chips">
            <span><L vi="Thử:" en="Try:" /></span>
            <button className="btn sm" onClick={() => resetTo(5, 4)}>5 + 4</button>
            <button className="btn sm" onClick={() => resetTo(3, -1)}>3 + (−1)</button>
            <button className="btn sm" onClick={() => resetTo(-6, -5)}>−6 + (−5)</button>
            <button className="btn sm" onClick={() => resetTo(2, 3)}>2 + 3</button>
          </div>
          <p className="explain">
            <L
              vi={<>b = {b} có mẫu bit <code>{bin4(pb)}</code> = {pb} bước. {b < 0 && 'Trừ chính là cộng số bù 2: đi tới gần trọn một vòng.'}</>}
              en={<>b = {b} has the bit pattern <code>{bin4(pb)}</code> = {pb} steps. {b < 0 && "Subtracting is just adding the two's complement: you go almost a full lap."}</>}
            />
          </p>
          {done && pb > 0 && (
            <div className="readouts">
              <div className="readout"><span><L vi="Kết quả 4 bit" en="4-bit result" /></span><strong>{bin4(res)}</strong></div>
              <div className="readout">
                <span><L vi="Đọc không dấu" en="Read as unsigned" /></span>
                <strong>{pa} + {pb} → {res}</strong>
                <span>{carry ? <L vi="qua biên 15→0: có carry-out, sai nếu là số không dấu" en="crossed 15→0: there is a carry-out, wrong if the numbers are unsigned" /> : <L vi="không qua biên 15→0" en="did not cross 15→0" />}</span>
              </div>
              <div className={`readout ${overflow ? 'signal' : 'accent'}`}>
                <span><L vi="Đọc có dấu" en="Read as signed" /></span>
                <strong>{a} + {b} → {toS(res)}</strong>
                <span>{overflow ? <L vi="TRÀN SỐ: hai số cùng dấu mà ra khác dấu" en="OVERFLOW: two numbers with the same sign gave a result with the other sign" /> : <L vi="đúng, không tràn" en="correct, no overflow" />}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
}
