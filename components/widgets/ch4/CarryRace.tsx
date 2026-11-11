'use client';

import { useEffect, useRef, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useT } from '@/lib/lang';
import { toBits } from '@/lib/bits';

const N = 8;

/** Đua giữa bộ cộng nối tiếp (ripple-carry) và carry-lookahead. Mô hình đơn giản: mỗi mức cổng = 1 đơn vị trễ. */
export default function CarryRace() {
  const t = useT();
  const [a, setA] = useState(0b10110111);
  const [b, setB] = useState(0b01101001);
  const [tm, setTm] = useState(0);
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
    setTm(0); setRun(true);
    let k = 0;
    timer.current = setInterval(() => { k++; setTm(k); if (k >= END) { clearInterval(timer.current!); setRun(false); } }, 380);
  };
  const rand = () => { setA(Math.floor(Math.random() * 256)); setB(Math.floor(Math.random() * 256)); setTm(0); };

  const lane = (name: React.ReactNode, cAt: (i: number) => number, sAt: (i: number) => number, done: number) => (
    <div className="cr-lane">
      <div className="cr-lane-h">
        <strong>{name}</strong>
        <span className={`pill${tm >= done ? ' ok' : ''}`}>{tm >= done ? <L vi={`xong ở t = ${done}`} en={`done at t = ${done}`} /> : <L vi="đang tính…" en="computing…" />}</span>
      </div>
      <div className="cr-cells">
        {Array.from({ length: N }, (_, k) => {
          const i = N - 1 - k;
          const cReady = tm >= cAt(i), sReady = tm >= sAt(i);
          return (
            <div key={i} className="cr-cell">
              <span className={`cr-c${cReady ? ' on' : ''}`} title={t(`nhớ vào bit ${i}`, `carry into bit ${i}`)}>c{i}={cReady ? c[i] : '?'}</span>
              <span className={`cr-s mono${sReady ? ' on' : ''}`}>{sReady ? sBits[i] : '·'}</span>
              <span className="cr-i">bit {i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Widget
      title={<L vi="Đua tốc độ: ripple-carry và carry-lookahead (8 bit)" en="Speed race: ripple-carry vs carry-lookahead (8 bits)" />}
      hint={<L
        vi="Ripple: bit sau phải chờ số nhớ của bit trước, nên trễ tăng theo số bit. Lookahead: tính trước mọi số nhớ từ g, p nên gần như cùng lúc."
        en="Ripple: each bit must wait for the carry from the bit before it, so the delay grows with the number of bits. Lookahead: all carries are computed ahead of time from g and p, almost at once."
      />}
    >
      <div className="ctrls">
        <p className="mono cr-ab">A = {toBits(a, 8).join('')} ({a}){'\n'}B = {toBits(b, 8).join('')} ({b})</p>
        <button className="btn" onClick={rand} disabled={run}><L vi="Số ngẫu nhiên" en="Random numbers" /></button>
        <button className="btn primary" onClick={start} disabled={run}>▶ <L vi="Bắt đầu đua" en="Start the race" /></button>
        <span className="pill warn mono">t = {tm} <L vi="đơn vị trễ cổng" en="gate delays" /></span>
      </div>
      {lane(<L vi="Ripple-carry (nối tiếp)" en="Ripple-carry (serial)" />, rippleC, rippleS, RIPPLE_DONE)}
      {lane(<L vi="Carry-lookahead (2 tầng)" en="Carry-lookahead (2 levels)" />, claC, claS, CLA_DONE)}
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th>bit i</th>{Array.from({ length: N }, (_, k) => <th key={k}>{N - 1 - k}</th>)}</tr></thead>
          <tbody>
            <tr><td className="txt">gᵢ = aᵢ·bᵢ (<L vi="tự sinh nhớ" en="generate" />)</td>{g.slice().reverse().map((x, k) => <td key={k} className={x ? 'chg' : ''}>{x}</td>)}</tr>
            <tr><td className="txt">pᵢ = aᵢ+bᵢ (<L vi="truyền nhớ" en="propagate" />)</td>{p.slice().reverse().map((x, k) => <td key={k}>{x}</td>)}</tr>
            <tr><td className="txt">cᵢ₊₁ = gᵢ + pᵢ·cᵢ</td>{c.slice(1).reverse().map((x, k) => <td key={k}>{x}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="widget-note">
        <L
          vi={`Tổng A + B = ${sum}${c[N] ? ' (có carry-out)' : ''}. Mô hình đơn giản: mỗi mức cổng = 1 đơn vị; ripple cần khoảng 2n, lookahead chỉ tăng theo số tầng.`}
          en={`A + B = ${sum}${c[N] ? ' (with carry-out)' : ''}. Simplified model: each gate level = 1 time unit; ripple needs about 2n, lookahead only grows with the number of levels.`}
        />
      </p>
    </Widget>
  );
}
