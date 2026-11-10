import * as RV from '@/lib/riscv.mjs';
import { OPCODE_GROUP } from '@/lib/describe';
import type { Decoded, Field } from '@/lib/riscv.mjs';


const FMT_NAME: Record<string, string> = {
  R: 'R — 3 thanh ghi', I: 'I — 2 thanh ghi + hằng 12 bit', S: 'S — store', B: 'B — rẽ nhánh', U: 'U — hằng 20 bit cao', J: 'J — jal',
};

/** Thanh ghi nào là thanh ghi số thực, tuỳ theo lệnh. */
function isFloatReg(d: Decoded, field: string) {
  const op = d.op, f7 = d.f7 ?? 0;
  if (op === 0x07) return field === 'rd';
  if (op === 0x27) return field === 'rs2';
  if (op !== 0x53) return false;
  if (f7 === 0x68 || f7 === 0x78) return field === 'rd';
  if (f7 === 0x60 || f7 === 0x70 || f7 === 0x50) return field === 'rs1' || field === 'rs2';
  return true;
}

function meaning(d: Decoded, f: Field): string {
  switch (f.kind) {
    case 'op': return OPCODE_GROUP[f.value] ?? 'opcode';
    case 'rd': case 'rs1': case 'rs2': {
      if (d.fmt === 'I' && f.name === 'shamt') return `dịch ${f.value} bit`;
      return isFloatReg(d, f.kind) ? `f${f.value} = ${RV.FABI[f.value]}` : `x${f.value} = ${RV.ABI[f.value]}`;
    }
    case 'f3': return `→ ${d.name}`;
    case 'f7':
      if (d.op === 0x53) return 'chọn phép số thực';
      return f.value === 0x20 ? 'biến thể (sub / sra)' : f.value === 1 ? 'nhóm nhân/chia (M)' : 'bình thường';
    case 'imm':
      if (f.name === 'shamt') return `dịch ${f.value} bit`;
      if (d.fmt === 'I') return `= ${d.imm}`;
      if (d.fmt === 'S') return f.lo === 25 ? 'phần cao' : `ghép lại = ${d.imm}`;
      if (d.fmt === 'B') return f.lo === 25 ? 'bị xáo bit' : `imm = ${d.imm}`;
      if (d.fmt === 'U') return `= 0x${((d.imm ?? 0) >>> 0).toString(16).toUpperCase()}`;
      if (d.fmt === 'J') return `imm = ${d.imm}`;
      return '';
  }
  return '';
}

/** Vẽ các trường bit của một lệnh 32 bit, mỗi trường một màu. Dùng trong Lab và widget mã hoá lệnh. */
export default function FieldBreakdown({ d, compact = false }: { d: Decoded; compact?: boolean }) {
  if (!d.ok) return <p className="fb-bad">Không giải mã được 0x{(d.word >>> 0).toString(16)}</p>;
  const bits = RV.bin32(d.word);
  const kindAt = (bit: number) => d.fields.find((f) => bit <= f.hi && bit >= f.lo)?.kind ?? 'op';
  return (
    <div className={`fb${compact ? ' compact' : ''}`}>
      <div className="fb-top">
        <span className="fb-fmt">Định dạng {FMT_NAME[d.fmt ?? ''] ?? d.fmt}</span>
        <code className="fb-text">{d.abiText ?? d.text}</code>
        <code className="fb-hex">{RV.hex8(d.word)}</code>
      </div>
      <div className="fb-fields">
        {d.fields.map((f) => {
          const w = f.hi - f.lo + 1;
          return (
            <div key={f.name + f.lo} className={`fb-field k-${f.kind}`} style={{ flexGrow: w }}>
              <span className="fb-name">{f.name}</span>
              <span className="fb-range mono">{f.hi === f.lo ? f.hi : `${f.hi}–${f.lo}`}</span>
              <span className="fb-bits mono">{f.value.toString(2).padStart(w, '0')}</span>
              <span className="fb-mean">{meaning(d, f)}</span>
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="fb-ribbon mono" aria-label="32 bit của lệnh">
          {bits.split('').map((b, i) => (
            <span key={i} className={`k-${kindAt(31 - i)}${(31 - i) % 4 === 0 && i !== 31 ? ' nib' : ''}`} title={`bit ${31 - i}`}>{b}</span>
          ))}
        </div>
      )}
      {(d.fmt === 'B' || d.fmt === 'J') && d.target != null && (
        <p className="fb-note">Định địa chỉ tương đối PC: đích = PC {(d.imm ?? 0) >= 0 ? '+' : '−'} {Math.abs(d.imm ?? 0)} = {RV.hex8(d.target)}. Bit 0 của imm luôn là 0 nên không cần lưu.</p>
      )}
    </div>
  );
}
