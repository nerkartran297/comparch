'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { useLang } from '@/lib/lang';

type M = { ic: string; cpi: string; ghz: string };

const PRESETS: { label: Bi; a: M; b: M; note: Bi }[] = [
  {
    label: { vi: 'Slide 39', en: 'Slide 39' },
    a: { ic: '1000000000', cpi: '2.0', ghz: '4' }, b: { ic: '1000000000', cpi: '1.2', ghz: '2' },
    note: {
      vi: 'Cùng ISA nên cùng số lệnh. A: chu kỳ 250 ps (= 4 GHz), CPI 2.0. B: chu kỳ 500 ps (= 2 GHz), CPI 1.2.',
      en: 'Same ISA, so the same instruction count. A: 250 ps cycle (= 4 GHz), CPI 2.0. B: 500 ps cycle (= 2 GHz), CPI 1.2.',
    },
  },
  {
    label: { vi: 'Clock nhanh mà vẫn thua', en: 'Faster clock, still loses' },
    a: { ic: '1000000000', cpi: '3', ghz: '5' }, b: { ic: '1000000000', cpi: '1', ghz: '3' },
    note: {
      vi: 'A có clock cao hơn nhưng mỗi lệnh tốn nhiều chu kỳ hơn hẳn.',
      en: 'A has the higher clock rate, but each instruction takes many more cycles.',
    },
  },
  {
    label: { vi: 'Compiler tốt hơn', en: 'Better compiler' },
    a: { ic: '600000000', cpi: '1.5', ghz: '3' }, b: { ic: '1000000000', cpi: '1.5', ghz: '3' },
    note: {
      vi: 'Cùng phần cứng, nhưng compiler của A sinh ít lệnh hơn.',
      en: 'Same hardware, but A’s compiler produces fewer instructions.',
    },
  },
];

const fmtTime = (s: number, loc: string) => {
  if (!isFinite(s)) return '—';
  if (s >= 1) return `${s.toLocaleString(loc, { maximumFractionDigits: 3 })} s`;
  if (s >= 1e-3) return `${(s * 1e3).toLocaleString(loc, { maximumFractionDigits: 3 })} ms`;
  return `${(s * 1e6).toLocaleString(loc, { maximumFractionDigits: 3 })} µs`;
};

/** So sánh 2 máy bằng công thức CPU time = IC × CPI / clock rate. */
export default function PerfCompare() {
  const [lang] = useLang();
  const loc = lang === 'en' ? 'en-US' : 'vi-VN';
  const [a, setA] = useState<M>(PRESETS[0].a);
  const [b, setB] = useState<M>(PRESETS[0].b);
  const [note, setNote] = useState<Bi | null>(PRESETS[0].note);

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
      <strong><L vi={`Máy ${name}`} en={`Machine ${name}`} /></strong>
      <label className="field"><L vi="Số lệnh IC" en="Instruction count IC" /><input id={`pc-${name}-ic`} className="mono" value={m.ic} onChange={(e) => set({ ...m, ic: e.target.value })} inputMode="numeric" /></label>
      <label className="field">CPI<input id={`pc-${name}-cpi`} className="mono" value={m.cpi} onChange={(e) => set({ ...m, cpi: e.target.value })} inputMode="decimal" /></label>
      <label className="field"><L vi="Clock (GHz)" en="Clock (GHz)" /><input id={`pc-${name}-ghz`} className="mono" value={m.ghz} onChange={(e) => set({ ...m, ghz: e.target.value })} inputMode="decimal" /></label>
    </div>
  );

  return (
    <Widget
      title={<L vi="Máy nào nhanh hơn? CPU time = IC × CPI × CC" en="Which machine is faster? CPU time = IC × CPI × CC" />}
      hint={<L
        vi="Sửa số ở hai máy, hoặc chọn một ví dụ có sẵn. Thời gian càng ngắn càng nhanh."
        en="Edit the numbers for both machines, or pick a ready-made example. Shorter time means faster."
      />}
    >
      <div className="chips">
        <span><L vi="Ví dụ:" en="Examples:" /></span>
        {PRESETS.map((p) => (
          <button key={p.label.en} className="btn sm" onClick={() => { setA(p.a); setB(p.b); setNote(p.note); }}><L vi={p.label.vi} en={p.label.en} /></button>
        ))}
      </div>
      {note && <p className="widget-note"><L vi={note.vi} en={note.en} /></p>}
      <div className="two-col">{row('A', a, (m) => { setA(m); setNote(null); })}{row('B', b, (m) => { setB(m); setNote(null); })}</div>
      {!ok ? (
        <p className="pill bad"><L vi="Các số phải lớn hơn 0" en="All numbers must be greater than 0" /></p>
      ) : (
        <>
          <div className="hbars">
            {[['A', A], ['B', B]].map(([n, m]) => {
              const mm = m as typeof A;
              return (
                <div className="hbar" key={n as string}>
                  <span><L vi={`Máy ${n as string}`} en={`Machine ${n as string}`} /></span>
                  <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(mm.t / max) * 100}%`, background: n === faster ? 'var(--ok)' : 'var(--accent)' }} /></div>
                  <span className="hbar-val">{fmtTime(mm.t, loc)}</span>
                </div>
              );
            })}
          </div>
          <p className="explain mono">
            Time_A = {A.ic.toLocaleString(loc)} × {A.cpi} × {(A.cc * 1000).toLocaleString(loc, { maximumFractionDigits: 2 })} ps = {fmtTime(A.t, loc)}{'\n'}
            Time_B = {B.ic.toLocaleString(loc)} × {B.cpi} × {(B.cc * 1000).toLocaleString(loc, { maximumFractionDigits: 2 })} ps = {fmtTime(B.t, loc)}
          </p>
          <p className="verdict">
            {ratio === 1 ? (
              <L vi="Hai máy nhanh như nhau." en="Both machines are equally fast." />
            ) : (
              <L
                vi={<>Máy <b>{faster}</b> nhanh hơn <b>{ratio.toLocaleString('vi-VN', { maximumFractionDigits: 3 })} lần</b> = thời gian máy chậm ÷ thời gian máy nhanh.</>}
                en={<>Machine <b>{faster}</b> is <b>{ratio.toLocaleString('en-US', { maximumFractionDigits: 3 })} times faster</b> = time of the slower machine ÷ time of the faster one.</>}
              />
            )}
          </p>
        </>
      )}
    </Widget>
  );
}
