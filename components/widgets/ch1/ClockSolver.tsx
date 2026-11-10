'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

/** Bài slide 37: máy B cần clock bao nhiêu để chạy trong thời gian mong muốn? */
export default function ClockSolver() {
  const [tA, setTA] = useState('10');
  const [ghzA, setGhzA] = useState('2');
  const [k, setK] = useState('1.2');
  const [tB, setTB] = useState('6');
  const ta = Number(tA), ga = Number(ghzA), kk = Number(k), tb = Number(tB);
  const ok = ta > 0 && ga > 0 && kk > 0 && tb > 0;
  const cycA = ta * ga * 1e9;
  const cycB = kk * cycA;
  const ghzB = cycB / tb / 1e9;
  const e9 = (x: number) => `${(x / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} × 10⁹`;
  return (
    <Widget title="Máy B cần clock bao nhiêu?" kicker="Giải từng bước" hint="Đề slide 37: A chạy 10 s với clock 2 GHz. B cần số chu kỳ gấp 1,2 lần A. Muốn B chạy 6 s thì clock B = ?">
      <div className="ctrls">
        <label className="field">Thời gian A (s)<input id="cs-ta" className="mono" value={tA} onChange={(e) => setTA(e.target.value)} /></label>
        <label className="field">Clock A (GHz)<input id="cs-ga" className="mono" value={ghzA} onChange={(e) => setGhzA(e.target.value)} /></label>
        <label className="field">B cần số chu kỳ gấp<input id="cs-k" className="mono" value={k} onChange={(e) => setK(e.target.value)} /></label>
        <label className="field">Thời gian B mong muốn (s)<input id="cs-tb" className="mono" value={tB} onChange={(e) => setTB(e.target.value)} /></label>
      </div>
      {ok ? (
        <ol className="solve">
          <li><span>Số chu kỳ A = thời gian × clock</span><code>{ta} s × {ga} × 10⁹ = {e9(cycA)} chu kỳ</code></li>
          <li><span>Số chu kỳ B = {kk} × chu kỳ A</span><code>{kk} × {e9(cycA)} = {e9(cycB)} chu kỳ</code></li>
          <li><span>Clock B = số chu kỳ ÷ thời gian</span><code>{e9(cycB)} ÷ {tb} s = <b>{ghzB.toLocaleString('vi-VN', { maximumFractionDigits: 3 })} GHz</b></code></li>
        </ol>
      ) : (
        <p className="pill bad">Các số phải lớn hơn 0</p>
      )}
    </Widget>
  );
}
