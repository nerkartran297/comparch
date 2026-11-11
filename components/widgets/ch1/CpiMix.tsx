'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { useT } from '@/lib/lang';

type Row = { op: string; freq: number; cpi: number; color: string };
const BASE: Row[] = [
  { op: 'ALU', freq: 50, cpi: 1, color: 'var(--f-rs1)' },
  { op: 'Load', freq: 20, cpi: 5, color: 'var(--f-rd)' },
  { op: 'Store', freq: 10, cpi: 3, color: 'var(--f-f3)' },
  { op: 'Branch', freq: 20, cpi: 2, color: 'var(--f-f7)' },
];

const IMPROVE: { id: string; label: Bi; apply: (r: Row) => Row }[] = [
  { id: 'load', label: { vi: 'Cache tốt hơn: Load còn 2 chu kỳ', en: 'Better cache: Load takes 2 cycles' }, apply: (r) => (r.op === 'Load' ? { ...r, cpi: 2 } : r) },
  { id: 'branch', label: { vi: 'Branch chỉ 1 chu kỳ', en: 'Branch takes only 1 cycle' }, apply: (r) => (r.op === 'Branch' ? { ...r, cpi: 1 } : r) },
  { id: 'alu', label: { vi: 'Chạy 2 lệnh ALU cùng lúc (ALU coi như 0,5)', en: 'Two ALU instructions at once (ALU counts as 0.5)' }, apply: (r) => (r.op === 'ALU' ? { ...r, cpi: r.cpi / 2 } : r) },
];

const avg = (rows: Row[]) => rows.reduce((s, r) => s + (r.freq / 100) * r.cpi, 0);

function Stack({ rows, total, label }: { rows: Row[]; total: number; label: React.ReactNode }) {
  const max = 2.6;
  return (
    <div className="hbar">
      <span>{label}</span>
      <div className="hbar-track">
        {rows.map((r) => {
          const c = (r.freq / 100) * r.cpi;
          return <div key={r.op} className="hbar-fill" title={`${r.op}: ${c.toFixed(2)}`} style={{ width: `${(c / max) * 100}%`, background: r.color, borderRight: '2px solid var(--panel)' }} />;
        })}
      </div>
      <span className="hbar-val">CPI = {total.toFixed(2)}</span>
    </div>
  );
}

/** CPI trung bình = Σ tỉ lệ × CPI. Bật các cải tiến để thấy máy nhanh lên bao nhiêu. */
export default function CpiMix() {
  const t = useT();
  const [rows, setRows] = useState<Row[]>(BASE);
  const [on, setOn] = useState<Record<string, boolean>>({ load: true });
  const sum = rows.reduce((s, r) => s + r.freq, 0);
  const newRows = IMPROVE.reduce((rs, imp) => (on[imp.id] ? rs.map(imp.apply) : rs), rows);
  const oldCpi = avg(rows), newCpi = avg(newRows);
  const speed = oldCpi / newCpi;

  const edit = (i: number, k: 'freq' | 'cpi', v: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: Math.max(0, Number(v) || 0) } : r)));

  return (
    <Widget
      title={<L vi="CPI trung bình và cải tiến (slide 42–43)" en="Average CPI and improvements (slides 42–43)" />}
      hint={<L
        vi="Mỗi loại lệnh góp một phần vào CPI. Bật/tắt cải tiến bên dưới để thấy CPI mới và máy nhanh hơn bao nhiêu phần trăm."
        en="Each instruction type contributes a share of the CPI. Toggle the improvements below to see the new CPI and how many percent faster the machine gets."
      />}
    >
      <div className="scroll-x">
        <table className="steptable">
          <thead><tr><th><L vi="Loại lệnh" en="Instruction type" /></th><th><L vi="Tỉ lệ (%)" en="Frequency (%)" /></th><th>CPI</th><th><L vi="Tỉ lệ × CPI" en="Frequency × CPI" /></th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.op}>
                <td><span className="swatch" style={{ background: r.color }} /> {r.op}</td>
                <td><input id={`cpi-f-${r.op}`} className="cell-in" value={r.freq} onChange={(e) => edit(i, 'freq', e.target.value)} aria-label={t(`Tỉ lệ ${r.op}`, `${r.op} frequency`)} /></td>
                <td><input id={`cpi-c-${r.op}`} className="cell-in" value={r.cpi} onChange={(e) => edit(i, 'cpi', e.target.value)} aria-label={t(`CPI ${r.op}`, `${r.op} CPI`)} /></td>
                <td>{((r.freq / 100) * r.cpi).toFixed(2)}</td>
              </tr>
            ))}
            <tr><td><b><L vi="Tổng" en="Total" /></b></td><td className={sum !== 100 ? 'chg' : ''}>{sum}%</td><td /><td><b>{oldCpi.toFixed(2)}</b></td></tr>
          </tbody>
        </table>
      </div>
      {sum !== 100 && <p className="pill warn"><L vi={`Tổng tỉ lệ đang là ${sum}%, nên bằng 100%.`} en={`The frequencies add up to ${sum}%; they should total 100%.`} /></p>}
      <div className="chips" role="group" aria-label={t('Cải tiến', 'Improvements')}>
        {IMPROVE.map((imp) => (
          <button key={imp.id} className={`btn sm${on[imp.id] ? ' on' : ''}`} aria-pressed={!!on[imp.id]} onClick={() => setOn((o) => ({ ...o, [imp.id]: !o[imp.id] }))}>
            {on[imp.id] ? '✓ ' : ''}<L vi={imp.label.vi} en={imp.label.en} />
          </button>
        ))}
      </div>
      <div className="hbars">
        <Stack rows={rows} total={oldCpi} label={<L vi="Ban đầu" en="Original" />} />
        <Stack rows={newRows} total={newCpi} label={<L vi="Sau cải tiến" en="Improved" />} />
      </div>
      <p className="verdict">
        <L
          vi={<>CPU time mới = {newCpi.toFixed(2)} × IC × CC. Tỉ số {oldCpi.toFixed(2)} / {newCpi.toFixed(2)} = {speed.toFixed(3)} → máy <b>nhanh hơn {((speed - 1) * 100).toFixed(1)}%</b>.</>}
          en={<>New CPU time = {newCpi.toFixed(2)} × IC × CC. Ratio {oldCpi.toFixed(2)} / {newCpi.toFixed(2)} = {speed.toFixed(3)} → the machine is <b>{((speed - 1) * 100).toFixed(1)}% faster</b>.</>}
        />
      </p>
    </Widget>
  );
}
