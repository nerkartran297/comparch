'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

type T = 'char' | 'short' | 'int' | 'double';
const SIZE: Record<T, number> = { char: 1, short: 2, int: 4, double: 8 };
const COLORS = ['var(--f-rs1)', 'var(--f-f3)', 'var(--f-rd)', 'var(--f-op)', 'var(--f-f7)'];

type F = { type: T; name: string };

function layout(fields: F[]) {
  let off = 0;
  const out: { f: F; off: number; pad: number; i: number }[] = [];
  fields.forEach((f, i) => {
    const k = SIZE[f.type];
    const pad = (k - (off % k)) % k;
    off += pad;
    out.push({ f, off, pad, i });
    off += k;
  });
  const maxAlign = Math.max(...fields.map((f) => SIZE[f.type]));
  const tail = (maxAlign - (off % maxAlign)) % maxAlign;
  return { items: out, size: off + tail, tail };
}

/** Căn lề trong struct (slide 14): đổi thứ tự trường để thấy byte đệm thay đổi. */
export default function StructAlign() {
  const [fields, setFields] = useState<F[]>([{ type: 'char', name: 'x' }, { type: 'short', name: 'y' }, { type: 'int', name: 'z' }]);
  const L = layout(fields);
  const used = fields.reduce((s, f) => s + SIZE[f.type], 0);

  const move = (i: number, d: number) => setFields((fs) => { const n = [...fs]; const j = i + d; if (j < 0 || j >= n.length) return fs; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const setType = (i: number, t: T) => setFields((fs) => fs.map((f, j) => (j === i ? { ...f, type: t } : f)));

  const cells: { kind: 'f' | 'pad'; i?: number; label?: string }[] = [];
  L.items.forEach((it) => {
    for (let p = 0; p < it.pad; p++) cells.push({ kind: 'pad' });
    for (let b = 0; b < SIZE[it.f.type]; b++) cells.push({ kind: 'f', i: it.i, label: b === 0 ? it.f.name : '' });
  });
  for (let p = 0; p < L.tail; p++) cells.push({ kind: 'pad' });

  return (
    <Widget title="Căn lề dữ liệu: struct chiếm bao nhiêu byte?" hint="Quy tắc: kiểu k byte phải bắt đầu ở địa chỉ chia hết cho k. Thiếu thì chèn byte đệm (gạch chéo). Đổi thứ tự bằng nút ↑ ↓.">
      <div className="chips">
        <span>Thử:</span>
        <button className="btn sm" onClick={() => setFields([{ type: 'char', name: 'x' }, { type: 'short', name: 'y' }, { type: 'int', name: 'z' }])}>char, short, int (slide)</button>
        <button className="btn sm" onClick={() => setFields([{ type: 'char', name: 'x' }, { type: 'int', name: 'z' }, { type: 'short', name: 'y' }])}>char, int, short</button>
        <button className="btn sm" onClick={() => setFields([{ type: 'char', name: 'a' }, { type: 'double', name: 'd' }, { type: 'char', name: 'b' }])}>char, double, char</button>
      </div>
      <pre className="sa-code mono">
        {'struct data {\n'}
        {fields.map((f, i) => (
          <span key={i} className="sa-line">
            {'    '}
            <select id={`sa-t-${i}`} value={f.type} onChange={(e) => setType(i, e.target.value as T)} aria-label={`Kiểu trường ${f.name}`} style={{ color: COLORS[i] }}>
              {Object.keys(SIZE).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>{' '}
            <b style={{ color: COLORS[i] }}>{f.name}</b>;{'  '}
            <button className="btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Đưa ${f.name} lên`}>↑</button>
            <button className="btn sm" onClick={() => move(i, 1)} disabled={i === fields.length - 1} aria-label={`Đưa ${f.name} xuống`}>↓</button>
            <span className="sa-off">{'  '}// offset {L.items[i].off}{L.items[i].pad ? `, đệm ${L.items[i].pad} byte trước` : ''}</span>
            {'\n'}
          </span>
        ))}
        {'};'}
      </pre>
      <div className="scroll-x">
        <div className="sa-ruler">
          {cells.map((c, k) => (
            <div key={k} className={`sa-cell ${c.kind}`} style={c.kind === 'f' ? { background: COLORS[c.i!] } : undefined}>
              <span className="sa-idx mono">{k}</span>
              <span className="sa-name">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="readouts">
        <div className="readout accent"><span>sizeof(struct)</span><strong>{L.size} byte</strong></div>
        <div className="readout"><span>Dữ liệu thật</span><strong>{used} byte</strong></div>
        <div className={`readout${L.size - used ? ' signal' : ''}`}><span>Phí cho byte đệm</span><strong>{L.size - used} byte</strong></div>
      </div>
      {L.tail > 0 && <p className="widget-note">Cuối struct có thêm {L.tail} byte đệm để kích thước chia hết cho {Math.max(...fields.map((f) => SIZE[f.type]))} (để mảng các struct vẫn căn lề).</p>}
    </Widget>
  );
}
