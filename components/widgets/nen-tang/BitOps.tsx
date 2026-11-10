'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { signedOf, toBits, unsignedOf } from '@/lib/bits';

type Op = 'AND' | 'OR' | 'XOR' | 'NOT' | 'SLL' | 'SRL' | 'SRA';
const OPS: { id: Op; label: string; rv: string; desc: string }[] = [
  { id: 'AND', label: 'AND', rv: 'and', desc: 'Bit kết quả = 1 khi CẢ HAI bit đều 1. Hay dùng để "lọc" lấy vài bit.' },
  { id: 'OR', label: 'OR', rv: 'or', desc: 'Bit kết quả = 1 khi ÍT NHẤT MỘT bit là 1. Hay dùng để "bật" bit.' },
  { id: 'XOR', label: 'XOR', rv: 'xor', desc: 'Bit kết quả = 1 khi hai bit KHÁC nhau.' },
  { id: 'NOT', label: 'NOT A', rv: 'not (xori rd, rs, -1)', desc: 'Đảo mọi bit: 0 → 1, 1 → 0.' },
  { id: 'SLL', label: 'A << k', rv: 'sll / slli', desc: 'Dịch trái k bit, thêm 0 bên phải = nhân 2^k (bit tràn trái bị mất).' },
  { id: 'SRL', label: 'A >> k (logic)', rv: 'srl / srli', desc: 'Dịch phải, thêm 0 bên trái = chia 2^k cho số KHÔNG dấu.' },
  { id: 'SRA', label: 'A >> k (số học)', rv: 'sra / srai', desc: 'Dịch phải, chép bit dấu sang trái = chia 2^k cho số CÓ dấu.' },
];

function BitRow({ label, v, onToggle, cls }: { label: string; v: number; onToggle?: (i: number) => void; cls?: (i: number) => string }) {
  const b = toBits(v, 8);
  return (
    <div className="bo-row">
      <span className="bo-label">{label}</span>
      <div className="nibble-bits">
        {b.map((x, i) =>
          onToggle ? (
            <button key={i} className={`bit sm${x ? ' on' : ''} ${cls?.(i) ?? ''}`} onClick={() => onToggle(i)} aria-pressed={!!x} aria-label={`${label} bit ${7 - i}`}>{x}</button>
          ) : (
            <span key={i} className={`bit sm${x ? ' on' : ''} ${cls?.(i) ?? ''}`}>{x}</span>
          ),
        )}
      </div>
      <span className="bo-val mono">= {unsignedOf(v, 8)}{signedOf(v, 8) < 0 ? ` (có dấu: ${signedOf(v, 8)})` : ''}</span>
    </div>
  );
}

/** Thử các phép toán bit trên hai số 8 bit. */
export default function BitOps() {
  const [a, setA] = useState(8);
  const [b, setB] = useState(14);
  const [op, setOp] = useState<Op>('AND');
  const [k, setK] = useState(2);

  const flip = (v: number, i: number) => unsignedOf(v ^ (1 << (7 - i)), 8);
  let r = 0;
  switch (op) {
    case 'AND': r = a & b; break;
    case 'OR': r = a | b; break;
    case 'XOR': r = a ^ b; break;
    case 'NOT': r = ~a & 255; break;
    case 'SLL': r = (a << k) & 255; break;
    case 'SRL': r = a >>> k; break;
    case 'SRA': r = (((a << 24) >> 24) >> k) & 255; break;
  }
  const two = op === 'AND' || op === 'OR' || op === 'XOR';
  const shift = op === 'SLL' || op === 'SRL' || op === 'SRA';
  const info = OPS.find((o) => o.id === op)!;
  const filled = (i: number) => {
    if (op === 'SLL') return i >= 8 - k ? 'hl' : '';
    if (op === 'SRL' || op === 'SRA') return i < k ? 'hl' : '';
    return '';
  };

  return (
    <Widget title="Phòng thử phép toán bit" hint="Bấm bit của A và B, chọn phép toán. Ô viền vàng ở phép dịch là bit được thêm vào.">
      <div className="chips">
        {OPS.map((o) => <button key={o.id} className={`btn sm${op === o.id ? ' on' : ''}`} onClick={() => setOp(o.id)}>{o.label}</button>)}
      </div>
      {shift && (
        <label className="field">
          Dịch k = {k} bit
          <input id="bo-k" type="range" min={0} max={7} value={k} onChange={(e) => setK(+e.target.value)} />
        </label>
      )}
      <div className="scroll-x">
        <div className="bo-grid">
          <BitRow label="A" v={a} onToggle={(i) => setA(flip(a, i))} />
          {two && <BitRow label="B" v={b} onToggle={(i) => setB(flip(b, i))} />}
          <div className="bo-line" />
          <BitRow label="Kết quả" v={r} cls={filled} />
        </div>
      </div>
      <p className="explain">{info.desc} Lệnh RISC-V: <code>{info.rv}</code>.{op === 'SLL' && ` Ở đây ${unsignedOf(a, 8)} × ${2 ** k} = ${unsignedOf(a, 8) * 2 ** k}${unsignedOf(a, 8) * 2 ** k > 255 ? ' — vượt 8 bit nên bị cắt' : ''}.`}</p>
    </Widget>
  );
}
