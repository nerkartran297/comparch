'use client';

import { useEffect, useRef, useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { useT } from '@/lib/lang';

type Seg = { s: number; e: number; kind: 'code' | 'cmd' | 'wait' | 'isr' };
type Sim = { cpu: Seg[]; io: Seg[]; total: number; wait: number };

const H = 1; // thời gian chạy chương trình phục vụ ngắt
const CMD = 1; // CPU ra lệnh WRITE cho máy in

function noInterrupt(C: number, T: number, n: number): Sim {
  const cpu: Seg[] = [], io: Seg[] = [];
  let t = 0, wait = 0;
  for (let k = 0; k < n; k++) {
    cpu.push({ s: t, e: t + C, kind: 'code' }); t += C;
    cpu.push({ s: t, e: t + CMD, kind: 'cmd' }); t += CMD;
    io.push({ s: t, e: t + T, kind: 'code' });
    cpu.push({ s: t, e: t + T, kind: 'wait' }); t += T; wait += T;
  }
  cpu.push({ s: t, e: t + C, kind: 'code' }); t += C;
  return { cpu, io, total: t, wait };
}

function withInterrupt(C: number, T: number, n: number): Sim {
  const cpu: Seg[] = [], io: Seg[] = [];
  let t = 0, wait = 0;
  let ioEnd: number | null = null;
  const runCode = (len: number) => {
    let rem = len;
    while (rem > 0) {
      if (ioEnd !== null && ioEnd < t + rem) {
        const run = Math.max(0, ioEnd - t);
        if (run > 0) cpu.push({ s: t, e: t + run, kind: 'code' });
        t += run; rem -= run;
        cpu.push({ s: t, e: t + H, kind: 'isr' }); t += H; ioEnd = null;
      } else { cpu.push({ s: t, e: t + rem, kind: 'code' }); t += rem; rem = 0; }
    }
  };
  for (let k = 0; k < n; k++) {
    runCode(C);
    if (ioEnd !== null) {
      if (ioEnd > t) { cpu.push({ s: t, e: ioEnd, kind: 'wait' }); wait += ioEnd - t; t = ioEnd; }
      cpu.push({ s: t, e: t + H, kind: 'isr' }); t += H; ioEnd = null;
    }
    cpu.push({ s: t, e: t + CMD, kind: 'cmd' }); t += CMD;
    io.push({ s: t, e: t + T, kind: 'code' }); ioEnd = t + T;
  }
  runCode(C);
  if (ioEnd !== null) {
    if (ioEnd > t) { cpu.push({ s: t, e: ioEnd, kind: 'wait' }); wait += ioEnd - t; t = ioEnd; }
    cpu.push({ s: t, e: t + H, kind: 'isr' }); t += H;
  }
  return { cpu, io, total: t, wait };
}

const KIND: Record<Seg['kind'], Bi> = {
  code: { vi: 'chạy code', en: 'running' },
  cmd: { vi: 'lệnh WRITE', en: 'WRITE command' },
  wait: { vi: 'CPU chờ', en: 'CPU waiting' },
  isr: { vi: 'ISR', en: 'ISR' },
};

const COLOR: Record<Seg['kind'], string> = { code: 'var(--accent)', cmd: 'var(--signal)', wait: 'url(#it-hatch)', isr: 'var(--f-f7)' };

/** So sánh CPU có và không có ngắt khi in 3 lần ra máy in chậm. */
export default function InterruptTimeline() {
  const t = useT();
  const [T, setT] = useState(6);
  const [C, setC] = useState(4);
  const n = 3;
  const a = noInterrupt(C, T, n), b = withInterrupt(C, T, n);
  const max = Math.max(a.total, b.total);
  const W = 700, x0 = 120;
  const sx = (t: number) => x0 + (t / max) * (W - x0 - 10);

  const [play, setPlay] = useState<number | null>(null);
  const raf = useRef(0);
  useEffect(() => {
    if (play === null) return;
    const start = performance.now() - (play / max) * 5000;
    const f = (now: number) => {
      const t = ((now - start) / 5000) * max;
      if (t >= max) { setPlay(null); return; }
      setPlay(t); raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play === null, max]);

  const row = (y: number, segs: Seg[], label: string) => (
    <g>
      <text x={8} y={y + 15} className="it-label">{label}</text>
      <rect x={x0} y={y} width={W - x0 - 10} height={22} className="it-track" />
      {segs.map((sg, i) => (
        <rect key={i} x={sx(sg.s)} y={y} width={Math.max(0.5, sx(sg.e) - sx(sg.s))} height={22} fill={COLOR[sg.kind]} stroke="var(--panel)" strokeWidth={1}>
          <title>{`${t(KIND[sg.kind])} ${sg.s}–${sg.e}`}</title>
        </rect>
      ))}
    </g>
  );
  const ticks = Array.from({ length: Math.floor(max / 5) + 1 }, (_, i) => i * 5);
  const printer = t('Máy in', 'Printer');

  return (
    <Widget
      title={<L vi="Có ngắt và không có ngắt: CPU phí bao nhiêu thời gian?" en="With and without interrupts: how much time does the CPU waste?" />}
      hint={<L
        vi="Chương trình in 3 lần. Mỗi lần: chạy code → ra lệnh WRITE → máy in mất một lúc mới in xong. Kéo thanh trượt để đổi độ chậm của máy in."
        en="The program prints 3 times. Each time: run some code → issue a WRITE command → the printer needs a while to finish. Drag the sliders to change how slow the printer is."
      />}
    >
      <div className="ctrls">
        <label className="field"><L vi={`Máy in mất T = ${T} đơn vị thời gian`} en={`Printer takes T = ${T} time units`} /><input id="it-t" type="range" min={1} max={14} value={T} onChange={(e) => setT(+e.target.value)} /></label>
        <label className="field"><L vi={`Code giữa 2 lần in C = ${C}`} en={`Code between two prints C = ${C}`} /><input id="it-c" type="range" min={1} max={10} value={C} onChange={(e) => setC(+e.target.value)} /></label>
        <button className="btn primary" onClick={() => setPlay(play === null ? 0 : null)}>{play === null ? <>▶ <L vi="Phát" en="Play" /></> : <>⏸ <L vi="Dừng" en="Stop" /></>}</button>
      </div>
      <div className="svgbox">
        <svg viewBox={`0 0 ${W} 222`} role="img" aria-label={t('Biểu đồ thời gian CPU và máy in', 'Timeline of the CPU and the printer')}>
          <defs>
            <pattern id="it-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="var(--sunk)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--bad)" strokeWidth="2" />
            </pattern>
          </defs>
          <text x={8} y={14} className="it-head">{t(`Không có ngắt — tổng ${a.total}`, `Without interrupts — total ${a.total}`)}</text>
          {row(22, a.cpu, 'CPU')}
          {row(50, a.io, printer)}
          <text x={8} y={102} className="it-head">{t(`Có ngắt — tổng ${b.total}`, `With interrupts — total ${b.total}`)}</text>
          {row(110, b.cpu, 'CPU')}
          {row(138, b.io, printer)}
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={sx(tk)} y1={168} x2={sx(tk)} y2={174} stroke="var(--faint)" />
              <text x={sx(tk)} y={188} textAnchor="middle" className="it-tick">{tk}</text>
            </g>
          ))}
          {play !== null && <line x1={sx(play)} y1={18} x2={sx(play)} y2={166} stroke="var(--signal)" strokeWidth={2} />}
          <g transform="translate(120 204)" className="it-legend">
            <rect width="12" height="12" fill="var(--accent)" /><text x="18" y="10">{t('chạy code / máy in đang in', 'running code / printer printing')}</text>
            <rect x="210" width="12" height="12" fill="var(--signal)" /><text x="228" y="10">{t('lệnh WRITE', 'WRITE command')}</text>
            <rect x="318" width="12" height="12" fill="url(#it-hatch)" /><text x="336" y="10">{t('CPU ngồi chờ', 'CPU waiting')}</text>
            <rect x="436" width="12" height="12" fill="var(--f-f7)" /><text x="454" y="10">{t('phục vụ ngắt (ISR)', 'servicing interrupt (ISR)')}</text>
          </g>
        </svg>
      </div>
      <div className="readouts">
        <div className="readout"><span><L vi="Không có ngắt: CPU chờ" en="Without interrupts: CPU waits" /></span><strong>{a.wait} / {a.total}</strong></div>
        <div className="readout accent"><span><L vi="Có ngắt: CPU chờ" en="With interrupts: CPU waits" /></span><strong>{b.wait} / {b.total}</strong></div>
        <div className="readout signal"><span><L vi="Có ngắt nhanh hơn" en="Interrupts are faster by" /></span><strong>{(a.total / b.total).toFixed(2)} <L vi="lần" en="×" /></strong></div>
      </div>
      <p className="explain">
        {T <= C ? (
          <L
            vi="Máy in in xong trước khi CPU tới lần WRITE kế tiếp: CPU gần như không phải chờ (slide 25)."
            en="The printer finishes before the CPU reaches the next WRITE: the CPU barely has to wait (slide 25)."
          />
        ) : (
          <L
            vi="Máy in chậm hơn đoạn code giữa hai lần in: tới lần WRITE sau CPU vẫn phải chờ lần in trước xong, nhưng vẫn ít phí hơn không có ngắt (slide 26)."
            en="The printer is slower than the code between two prints: at the next WRITE the CPU still has to wait for the previous print to finish, but it wastes much less time than without interrupts (slide 26)."
          />
        )}
      </p>
    </Widget>
  );
}
