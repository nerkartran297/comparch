'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { useT } from '@/lib/lang';
import { signedOf, toBits, unsignedOf } from '@/lib/bits';

type Op = 'AND' | 'OR' | 'XOR' | 'NOT' | 'SLL' | 'SRL' | 'SRA';
const OPS: { id: Op; label: Bi; rv: string; desc: Bi }[] = [
  { id: 'AND', label: { vi: 'AND', en: 'AND' }, rv: 'and', desc: { vi: 'Bit kết quả = 1 khi CẢ HAI bit đều 1. Hay dùng để "lọc" lấy vài bit.', en: 'A result bit is 1 only when BOTH bits are 1. Often used to "mask" (pick out) some bits.' } },
  { id: 'OR', label: { vi: 'OR', en: 'OR' }, rv: 'or', desc: { vi: 'Bit kết quả = 1 khi ÍT NHẤT MỘT bit là 1. Hay dùng để "bật" bit.', en: 'A result bit is 1 when AT LEAST ONE bit is 1. Often used to "set" bits.' } },
  { id: 'XOR', label: { vi: 'XOR', en: 'XOR' }, rv: 'xor', desc: { vi: 'Bit kết quả = 1 khi hai bit KHÁC nhau.', en: 'A result bit is 1 when the two bits are DIFFERENT.' } },
  { id: 'NOT', label: { vi: 'NOT A', en: 'NOT A' }, rv: 'not (xori rd, rs, -1)', desc: { vi: 'Đảo mọi bit: 0 → 1, 1 → 0.', en: 'Flip every bit: 0 → 1, 1 → 0.' } },
  { id: 'SLL', label: { vi: 'A << k', en: 'A << k' }, rv: 'sll / slli', desc: { vi: 'Dịch trái k bit, thêm 0 bên phải = nhân 2^k (bit tràn trái bị mất).', en: 'Shift left by k bits, filling 0s on the right = multiply by 2^k (bits pushed out on the left are lost).' } },
  { id: 'SRL', label: { vi: 'A >> k (logic)', en: 'A >> k (logical)' }, rv: 'srl / srli', desc: { vi: 'Dịch phải, thêm 0 bên trái = chia 2^k cho số KHÔNG dấu.', en: 'Shift right, filling 0s on the left = divide by 2^k for UNSIGNED numbers.' } },
  { id: 'SRA', label: { vi: 'A >> k (số học)', en: 'A >> k (arithmetic)' }, rv: 'sra / srai', desc: { vi: 'Dịch phải, chép bit dấu sang trái = chia 2^k cho số CÓ dấu.', en: 'Shift right, copying the sign bit on the left = divide by 2^k for SIGNED numbers.' } },
];

function BitRow({ label, v, onToggle, cls }: { label: React.ReactNode; v: number; onToggle?: (i: number) => void; cls?: (i: number) => string }) {
  const t = useT();
  const b = toBits(v, 8);
  const name = typeof label === 'string' ? label : t('Kết quả', 'Result');
  return (
    <div className="bo-row">
      <span className="bo-label">{label}</span>
      <div className="nibble-bits">
        {b.map((x, i) =>
          onToggle ? (
            <button key={i} className={`bit sm${x ? ' on' : ''} ${cls?.(i) ?? ''}`} onClick={() => onToggle(i)} aria-pressed={!!x} aria-label={`${name} bit ${7 - i}`}>{x}</button>
          ) : (
            <span key={i} className={`bit sm${x ? ' on' : ''} ${cls?.(i) ?? ''}`}>{x}</span>
          ),
        )}
      </div>
      <span className="bo-val mono">= {unsignedOf(v, 8)}{signedOf(v, 8) < 0 ? <L vi={` (có dấu: ${signedOf(v, 8)})`} en={` (signed: ${signedOf(v, 8)})`} /> : ''}</span>
    </div>
  );
}

/** Thử các phép toán bit trên hai số 8 bit. */
export default function BitOps() {
  const t = useT();
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
  const ua = unsignedOf(a, 8);

  return (
    <Widget
      title={<L vi="Phòng thử phép toán bit" en="Bitwise operations playground" />}
      hint={<L
        vi="Bấm bit của A và B, chọn phép toán. Ô viền vàng ở phép dịch là bit được thêm vào."
        en="Click the bits of A and B and pick an operation. In shifts, the boxes with a yellow outline are the bits that get filled in."
      />}
    >
      <div className="chips">
        {OPS.map((o) => <button key={o.id} className={`btn sm${op === o.id ? ' on' : ''}`} onClick={() => setOp(o.id)}><L vi={o.label.vi} en={o.label.en} /></button>)}
      </div>
      {shift && (
        <label className="field">
          <L vi={`Dịch k = ${k} bit`} en={`Shift by k = ${k} bits`} />
          <input id="bo-k" type="range" min={0} max={7} value={k} onChange={(e) => setK(+e.target.value)} aria-label={t('Số bit dịch', 'Shift amount')} />
        </label>
      )}
      <div className="scroll-x">
        <div className="bo-grid">
          <BitRow label="A" v={a} onToggle={(i) => setA(flip(a, i))} />
          {two && <BitRow label="B" v={b} onToggle={(i) => setB(flip(b, i))} />}
          <div className="bo-line" />
          <BitRow label={<L vi="Kết quả" en="Result" />} v={r} cls={filled} />
        </div>
      </div>
      <p className="explain">
        <L vi={info.desc.vi} en={info.desc.en} /> <L vi="Lệnh RISC-V:" en="RISC-V instruction:" /> <code>{info.rv}</code>.
        {op === 'SLL' && (
          <L
            vi={` Ở đây ${ua} × ${2 ** k} = ${ua * 2 ** k}${ua * 2 ** k > 255 ? ' — vượt 8 bit nên bị cắt' : ''}.`}
            en={` Here ${ua} × ${2 ** k} = ${ua * 2 ** k}${ua * 2 ** k > 255 ? ' — that exceeds 8 bits, so it gets cut off' : ''}.`}
          />
        )}
      </p>
    </Widget>
  );
}
