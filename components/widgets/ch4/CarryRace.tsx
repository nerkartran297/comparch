'use client';

import { useEffect, useRef, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { toBits } from '@/lib/bits';

const N = 8;

/** Đua giữa bộ cộng nối tiếp (ripple-carry) và carry-lookahead. Mô hình đơn giản: mỗi mức cổng = 1 đơn vị trễ. */
export default function CarryRace() {
  const [a, setA] = useState(0b10110111);
  const [b, setB] = useState(0b01101001);
  const [t, setT] = useState(0);
  const [run, setRun] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // số nhớ c[i] vào bit i
  const g = Array.from({ length: N }, (_, i) => ((a >> i) & 1) & ((b >> i) & 1));
  const p = Array.from({ length: N }, (_, i) => ((a >> i) & 1) | ((b >> i) & 1));
  const c: number[] = [0];
  for (let i = 0; i < N; i++) c[i + 1] = g[i] | (p[i] & c[i]);
  const sum = (a + b) & 255;
  const sBits = Array.from({ length: N }, (_, i) => (sum >> i) & 1);

  // thời điểm có kết quả (đơn vị trễ cổng)
  const rippleC = (i: number) => 2 * i;          // nhớ vào bit i
  const rippleS = (i: number) => 2 * i + 1;       // tổng bit i
  const RIPPLE_DONE = rippleC(N);                 // carry-out
  const claC = (i: number) => (i === 0 ? 0 : i <= 4 ? 3 : 5); // khối 4 bit + tầng lookahead thứ 2
  const claS = (i: number) => claC(i) + 1;
  const CLA_DONE = 6;
  const END = Math.max(RIPPLE_DONE, CLA_DONE) + 1;

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const start = () => {
    if (timer.current) clearInterval(timer.current);
    setT(0); setRun(true);
    let k = 0;
    timer.current = setInterval(() => { k++; setT(k); if (k >= END) { clearInterval(timer.current!); setRun(false); } }, 380);
  };
  const rand = () => { setA(Math.floor(Math.random() * 256)); setB(Math.floor(Math.random() * 256)); setT(0); };

  const lane = (name: string, cAt: (i: number) => number, sAt: (i: number) => number, done: number) => (
    <div className="cr-lane">
      <div className="cr-lane-h"><strong>{name}</strong><span className={`pill${t >= done ? ' ok' : ''}`}>{t >= done ? `xong ở t = ${done}` : 'đang tính…'}</span></div>
      <div className="cr-cells">
        {Array.from({ length: N }, (_, k) => {
          const i = N - 1 - k;
          const cReady = t >= cAt(i), sReady = t >= sAt(i);
          return (
            <div key={i} className="cr-cell">
              <span className={`cr-c${cReady ? ' on' : ''}`} title={`nhớ vào bit ${i}`}>c{i}={cReady ? c[i] : '?'}</span>
              <span className={`cr-s mono${sReady ? ' on' : ''}`}>{sReady ? sBits[i] : '·'}</span>
              <span className="cr-i">bit {i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Widget title="Đua tốc độ: ripple-carry và carry-lookahead (8 bit)" hint="Ripple: bit sau phải chờ số nhớ của bit trước, nên trễ tăng theo số bit. Lookahead: tính trước mọi số nhớ từ g, p nên gần như cùng lúc.">
      <div className="ctrls">
        <p className="mono cr-ab">A = {toBits(a, 8).join('')} ({a}){'\n'}B = {toBits(b, 8).join('')} ({b})</p>
        <button className="btn" onClick={rand} disabled={run}>Số ngẫu nhiên</button>
        <button className="btn primary" onClick={start} disabled={run}>▶ Bắt đầu đua</button>
        <span className="pill warn mono">t = {t} đơn vị trễ cổng</span>
      </div>
      {lane('Ripple-carry (nối tiếp)', rippleC, rippleS, RIPPLE_DONE)}
      {lane('Carry-lookahead (2 tầng)', claC, claS, CLA_DONE)}
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th>bit i</th>{Array.from({ length: N }, (_, k) => <th key={k}>{N - 1 - k}</th>)}</tr></thead>
          <tbody>
            <tr><td className="txt">gᵢ = aᵢ·bᵢ (tự sinh nhớ)</td>{g.slice().reverse().map((x, k) => <td key={k} className={x ? 'chg' : ''}>{x}</td>)}</tr>
            <tr><td className="txt">pᵢ = aᵢ+bᵢ (truyền nhớ)</td>{p.slice().reverse().map((x, k) => <td key={k}>{x}</td>)}</tr>
            <tr><td className="txt">cᵢ₊₁ = gᵢ + pᵢ·cᵢ</td>{c.slice(1).reverse().map((x, k) => <td key={k}>{x}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="widget-note">Tổng A + B = {sum}{c[N] ? ' (có carry-out)' : ''}. Mô hình đơn giản: mỗi mức cổng = 1 đơn vị; ripple cần khoảng 2n, lookahead chỉ tăng theo số tầng.</p>
    </Widget>
  );
}
