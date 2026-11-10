'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

/** MUX 2-1: S chọn đầu vào nào đi ra. C = A·S̄ + B·S */
export default function Mux() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [s, setS] = useState(0);
  const t1 = a & (1 - s), t2 = b & s, c = t1 | t2;
  const w = (on: number) => (on ? 'var(--signal)' : 'var(--line)');
  return (
    <Widget title="Bộ chọn MUX 2-1" hint="S = 0 thì C = A; S = 1 thì C = B. Bên dưới là mạch thật làm việc đó bằng 2 cổng AND, 1 cổng OR, 1 cổng NOT.">
      <div className="chips">
        {([['A', a, setA], ['B', b, setB], ['S', s, setS]] as const).map(([n, v, set]) => (
          <button key={n} className={`toggle${v ? ' on' : ''}`} onClick={() => set(1 - v)} aria-pressed={!!v}><span className="knob">{v}</span>{n}</button>
        ))}
      </div>
      <div className="svgbox">
        <svg viewBox="0 0 620 230" role="img" aria-label="Mạch MUX 2-1">
          <text x={10} y={54} className="mx-in">A = {a}</text>
          <text x={10} y={174} className="mx-in">B = {b}</text>
          <text x={10} y={118} className="mx-in">S = {s}</text>
          {/* A -> AND1 */}
          <line x1={70} y1={50} x2={300} y2={50} stroke={w(a)} strokeWidth={4} />
          {/* B -> AND2 */}
          <line x1={70} y1={170} x2={300} y2={170} stroke={w(b)} strokeWidth={4} />
          {/* S trunk */}
          <line x1={70} y1={114} x2={130} y2={114} stroke={w(s)} strokeWidth={4} />
          <line x1={130} y1={114} x2={130} y2={190} stroke={w(s)} strokeWidth={4} />
          <line x1={130} y1={190} x2={300} y2={190} stroke={w(s)} strokeWidth={4} />
          <line x1={130} y1={114} x2={130} y2={70} stroke={w(s)} strokeWidth={4} />
          <line x1={130} y1={70} x2={170} y2={70} stroke={w(s)} strokeWidth={4} />
          {/* NOT */}
          <path d="M170 56 L205 70 L170 84 Z" className="mx-gate" />
          <circle cx={209} cy={70} r={4} className="mx-gate" />
          <line x1={213} y1={70} x2={300} y2={70} stroke={w(1 - s)} strokeWidth={4} />
          <text x={226} y={92} className="mx-small">S̄ = {1 - s}</text>
          {/* AND1, AND2 */}
          <path d="M300 36 H330 A24 24 0 0 1 330 84 H300 Z" className="mx-gate" />
          <path d="M300 156 H330 A24 24 0 0 1 330 204 H300 Z" className="mx-gate" />
          <text x={308} y={64} className="mx-small">AND</text>
          <text x={308} y={184} className="mx-small">AND</text>
          <line x1={354} y1={60} x2={440} y2={60} stroke={w(t1)} strokeWidth={4} />
          <line x1={440} y1={60} x2={440} y2={104} stroke={w(t1)} strokeWidth={4} />
          <line x1={440} y1={104} x2={470} y2={104} stroke={w(t1)} strokeWidth={4} />
          <line x1={354} y1={180} x2={440} y2={180} stroke={w(t2)} strokeWidth={4} />
          <line x1={440} y1={180} x2={440} y2={128} stroke={w(t2)} strokeWidth={4} />
          <line x1={440} y1={128} x2={470} y2={128} stroke={w(t2)} strokeWidth={4} />
          <text x={362} y={52} className="mx-small">A·S̄ = {t1}</text>
          <text x={362} y={200} className="mx-small">B·S = {t2}</text>
          {/* OR */}
          <path d="M466 92 Q478 116 466 140 Q500 140 520 116 Q500 92 466 92 Z" className="mx-gate" />
          <line x1={520} y1={116} x2={575} y2={116} stroke={w(c)} strokeWidth={4} />
          <text x={540} y={106} className="mx-in">C = {c}</text>
        </svg>
      </div>
      <p className="explain mono">C = A·S̄ + B·S = {a}·{1 - s} + {b}·{s} = {t1} + {t2} = {c}   → {s ? 'S = 1 nên C đi theo B' : 'S = 0 nên C đi theo A'}</p>
    </Widget>
  );
}
