'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

type M = { ic: string; cpi: string; ghz: string };

const PRESETS: { label: string; a: M; b: M; note: string }[] = [
  { label: 'Slide 39', a: { ic: '1000000000', cpi: '2.0', ghz: '4' }, b: { ic: '1000000000', cpi: '1.2', ghz: '2' }, note: 'Cùng ISA nên cùng số lệnh. A: chu kỳ 250 ps (= 4 GHz), CPI 2.0. B: chu kỳ 500 ps (= 2 GHz), CPI 1.2.' },
  { label: 'Clock nhanh mà vẫn thua', a: { ic: '1000000000', cpi: '3', ghz: '5' }, b: { ic: '1000000000', cpi: '1', ghz: '3' }, note: 'A có clock cao hơn nhưng mỗi lệnh tốn nhiều chu kỳ hơn hẳn.' },
  { label: 'Compiler tốt hơn', a: { ic: '600000000', cpi: '1.5', ghz: '3' }, b: { ic: '1000000000', cpi: '1.5', ghz: '3' }, note: 'Cùng phần cứng, nhưng compiler của A sinh ít lệnh hơn.' },
];

const fmtTime = (s: number) => {
  if (!isFinite(s)) return '—';
  if (s >= 1) return `${s.toLocaleString('vi-VN', { maximumFractionDigits: 3 })} s`;
  if (s >= 1e-3) return `${(s * 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} ms`;
  return `${(s * 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} µs`;
};

/** So sánh 2 máy bằng công thức CPU time = IC × CPI / clock rate. */
export default function PerfCompare() {
  const [a, setA] = useState<M>(PRESETS[0].a);
  const [b, setB] = useState<M>(PRESETS[0].b);
  const [note, setNote] = useState(PRESETS[0].note);

  const calc = (m: M) => {
    const ic = Number(m.ic), cpi = Number(m.cpi), ghz = Number(m.ghz);
    const t = (ic * cpi) / (ghz * 1e9);
    return { ic, cpi, ghz, t, cc: 1 / ghz, ok: ic > 0 && cpi > 0 && ghz > 0 };
  };
  const A = calc(a), B = calc(b);
  const ok = A.ok && B.ok;
  const max = Math.max(A.t, B.t);
  const faster = A.t <= B.t ? 'A' : 'B';
  const ratio = A.t <= B.t ? B.t / A.t : A.t / B.t;

  const row = (name: string, m: M, set: (m: M) => void) => (
    <div className="pc-machine">
      <strong>Máy {name}</strong>
      <label className="field">Số lệnh IC<input id={`pc-${name}-ic`} className="mono" value={m.ic} onChange={(e) => set({ ...m, ic: e.target.value })} inputMode="numeric" /></label>
      <label className="field">CPI<input id={`pc-${name}-cpi`} className="mono" value={m.cpi} onChange={(e) => set({ ...m, cpi: e.target.value })} inputMode="decimal" /></label>
      <label className="field">Clock (GHz)<input id={`pc-${name}-ghz`} className="mono" value={m.ghz} onChange={(e) => set({ ...m, ghz: e.target.value })} inputMode="decimal" /></label>
    </div>
  );

  return (
    <Widget title="Máy nào nhanh hơn? CPU time = IC × CPI × CC" hint="Sửa số ở hai máy, hoặc chọn một ví dụ có sẵn. Thời gian càng ngắn càng nhanh.">
      <div className="chips">
        <span>Ví dụ:</span>
        {PRESETS.map((p) => (
          <button key={p.label} className="btn sm" onClick={() => { setA(p.a); setB(p.b); setNote(p.note); }}>{p.label}</button>
        ))}
      </div>
      {note && <p className="widget-note">{note}</p>}
      <div className="two-col">{row('A', a, (m) => { setA(m); setNote(''); })}{row('B', b, (m) => { setB(m); setNote(''); })}</div>
      {!ok ? (
        <p className="pill bad">Các số phải lớn hơn 0</p>
      ) : (
        <>
          <div className="hbars">
            {[['A', A], ['B', B]].map(([n, m]) => {
              const mm = m as typeof A;
              return (
                <div className="hbar" key={n as string}>
                  <span>Máy {n as string}</span>
                  <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(mm.t / max) * 100}%`, background: n === faster ? 'var(--ok)' : 'var(--accent)' }} /></div>
                  <span className="hbar-val">{fmtTime(mm.t)}</span>
                </div>
              );
            })}
          </div>
          <p className="explain mono">
            Time_A = {A.ic.toLocaleString('vi-VN')} × {A.cpi} × {(A.cc * 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ps = {fmtTime(A.t)}{'\n'}
            Time_B = {B.ic.toLocaleString('vi-VN')} × {B.cpi} × {(B.cc * 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ps = {fmtTime(B.t)}
          </p>
          <p className="verdict">
            {ratio === 1 ? 'Hai máy nhanh như nhau.' : <>Máy <b>{faster}</b> nhanh hơn <b>{ratio.toLocaleString('vi-VN', { maximumFractionDigits: 3 })} lần</b> = thời gian máy chậm ÷ thời gian máy nhanh.</>}
          </p>
        </>
      )}
    </Widget>
  );
}
