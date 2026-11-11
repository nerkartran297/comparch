'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import { useLang } from '@/lib/lang';

/** Bài slide 37: máy B cần clock bao nhiêu để chạy trong thời gian mong muốn? */
export default function ClockSolver() {
  const [lang] = useLang();
  const loc = lang === 'en' ? 'en-US' : 'vi-VN';
  const [tA, setTA] = useState('10');
  const [ghzA, setGhzA] = useState('2');
  const [k, setK] = useState('1.2');
  const [tB, setTB] = useState('6');
  const ta = Number(tA), ga = Number(ghzA), kk = Number(k), tb = Number(tB);
  const ok = ta > 0 && ga > 0 && kk > 0 && tb > 0;
  const cycA = ta * ga * 1e9;
  const cycB = kk * cycA;
  const ghzB = cycB / tb / 1e9;
  const e9 = (x: number) => `${(x / 1e9).toLocaleString(loc, { maximumFractionDigits: 3 })} × 10⁹`;
  return (
    <Widget
      title={<L vi="Máy B cần clock bao nhiêu?" en="What clock rate does machine B need?" />}
      kicker={<L vi="Giải từng bước" en="Step-by-step solution" />}
      hint={<L
        vi="Đề slide 37: A chạy 10 s với clock 2 GHz. B cần số chu kỳ gấp 1,2 lần A. Muốn B chạy 6 s thì clock B = ?"
        en="Slide 37: A runs in 10 s with a 2 GHz clock. B needs 1.2 times as many cycles as A. For B to run in 6 s, what must B’s clock be?"
      />}
    >
      <div className="ctrls">
        <label className="field"><L vi="Thời gian A (s)" en="Time of A (s)" /><input id="cs-ta" className="mono" value={tA} onChange={(e) => setTA(e.target.value)} /></label>
        <label className="field"><L vi="Clock A (GHz)" en="Clock of A (GHz)" /><input id="cs-ga" className="mono" value={ghzA} onChange={(e) => setGhzA(e.target.value)} /></label>
        <label className="field"><L vi="B cần số chu kỳ gấp" en="B needs this many times the cycles" /><input id="cs-k" className="mono" value={k} onChange={(e) => setK(e.target.value)} /></label>
        <label className="field"><L vi="Thời gian B mong muốn (s)" en="Target time for B (s)" /><input id="cs-tb" className="mono" value={tB} onChange={(e) => setTB(e.target.value)} /></label>
      </div>
      {ok ? (
        <ol className="solve">
          <li><span><L vi="Số chu kỳ A = thời gian × clock" en="Cycles of A = time × clock rate" /></span><code>{ta} s × {ga} × 10⁹ = {e9(cycA)} <L vi="chu kỳ" en="cycles" /></code></li>
          <li><span><L vi={`Số chu kỳ B = ${kk} × chu kỳ A`} en={`Cycles of B = ${kk} × cycles of A`} /></span><code>{kk} × {e9(cycA)} = {e9(cycB)} <L vi="chu kỳ" en="cycles" /></code></li>
          <li><span><L vi="Clock B = số chu kỳ ÷ thời gian" en="Clock of B = cycles ÷ time" /></span><code>{e9(cycB)} ÷ {tb} s = <b>{ghzB.toLocaleString(loc, { maximumFractionDigits: 3 })} GHz</b></code></li>
        </ol>
      ) : (
        <p className="pill bad"><L vi="Các số phải lớn hơn 0" en="All numbers must be greater than 0" /></p>
      )}
    </Widget>
  );
}
