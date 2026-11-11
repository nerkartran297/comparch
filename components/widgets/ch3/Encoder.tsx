'use client';

import { useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';
import FieldBreakdown from '@/components/lab/FieldBreakdown';

const PRESETS = ['add s1, s4, s5', 'lw t0, 0(s1)', 'addi t1, t1, 1', 'sw x5, 32(x30)', 'sub t0, t1, t2', 'slli x6, x11, 2', 'beq t0, t1, 16', 'jal ra, 2048', 'lui s0, 0x003D0', 'li s1, 0x3D0100'];

/** Gõ một lệnh → thấy định dạng, từng trường bit, mã máy. Hoặc ngược lại: gõ mã hex → giải mã. */
export default function Encoder() {
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');
  const [line, setLine] = useState('sw x5, 32(x30)');
  const [hex, setHex] = useState('0x015A04B3');

  let content: React.ReactNode;
  if (mode === 'enc') {
    const r = RV.encodeLine(line);
    if (!r.ok) content = <p className="pill bad">{r.msg}</p>;
    else {
      const d0 = r.words[0].d;
      const regOf = (f: string) => d0.fields.filter((x) => x.kind === f).map((x) => x.value);
      const regText = ['rd', 'rs1', 'rs2'].flatMap((k) => (regOf(k).length && d0.fields.some((f) => f.kind === k && f.name !== 'shamt') ? [`${k} = ${RV.ABI[regOf(k)[0]]} = x${regOf(k)[0]} = ${regOf(k)[0].toString(2).padStart(5, '0')}`] : [])).join(' · ') || '—';
      content = (
        <>
          {r.words.length > 1 && (
            <p className="pill warn">
              <L vi={`Đây là lệnh giả: assembler đổi thành ${r.words.length} lệnh thật bên dưới.`} en={`This is a pseudo-instruction: the assembler turns it into the ${r.words.length} real instructions below.`} />
            </p>
          )}
          {r.words.map((w, i) => <FieldBreakdown key={i} d={w.d} />)}
          {r.words.length === 1 && d0.ok && (
            <ol className="solve">
              <li><span><L vi="1. Định dạng" en="1. Format" /></span><code>{d0.name} → {d0.fmt}-type</code></li>
              <li><span><L vi="2. Đổi thanh ghi ra số" en="2. Turn registers into numbers" /></span><code>{regText}</code></li>
              <li><span><L vi="3. Tra opcode / funct" en="3. Look up opcode / funct" /></span><code>{d0.fields.filter((f) => ['op', 'f3', 'f7'].includes(f.kind)).map((f) => `${f.name} = ${f.value.toString(2).padStart(f.hi - f.lo + 1, '0')}`).join(' · ')}</code></li>
              <li><span><L vi="4. Ghép 32 bit, gom 4 bit → hex" en="4. Join the 32 bits, group by 4 → hex" /></span><code>{RV.hex8(d0.word)}</code></li>
            </ol>
          )}
        </>
      );
    }
  } else {
    const tx = hex.trim().replace(/^0x/i, '');
    if (!/^[0-9a-f]{1,8}$/i.test(tx)) content = <p className="pill bad"><L vi="Nhập tối đa 8 chữ số hex, ví dụ 0x00A00513" en="Enter at most 8 hex digits, e.g. 0x00A00513" /></p>;
    else {
      const d = RV.decode(parseInt(tx, 16) >>> 0, 0);
      content = d.ok ? <FieldBreakdown d={d} /> : <p className="pill bad"><L vi="Không phải lệnh RV32IM hợp lệ (opcode/funct không có trong bảng)." en="Not a valid RV32IM instruction (opcode/funct not in the table)." /></p>;
    }
  }

  return (
    <Widget
      title={<L vi="Mã hoá lệnh RISC-V thành 32 bit" en="Encoding a RISC-V instruction into 32 bits" />}
      hint={<L
        vi="Mỗi trường một màu: opcode (tím), rd (cam), funct3 (xanh lá), rs1 (xanh dương), rs2 (xanh ngọc), funct7 (hồng), imm (vàng đất)."
        en="Each field has its own colour: opcode (purple), rd (orange), funct3 (green), rs1 (blue), rs2 (teal), funct7 (pink), imm (ochre)."
      />}
    >
      <div className="chips">
        <button className={`btn sm${mode === 'enc' ? ' on' : ''}`} onClick={() => setMode('enc')}><L vi="Lệnh → mã máy" en="Instruction → machine code" /></button>
        <button className={`btn sm${mode === 'dec' ? ' on' : ''}`} onClick={() => setMode('dec')}><L vi="Mã máy → lệnh" en="Machine code → instruction" /></button>
      </div>
      {mode === 'enc' ? (
        <>
          <label className="field">
            <L vi="Gõ một lệnh (rẽ nhánh thì ghi số byte thay cho nhãn, ví dụ beq t0, t1, 16)" en="Type an instruction (for branches, give a byte offset instead of a label, e.g. beq t0, t1, 16)" />
            <input id="enc-line" className="mono wide" value={line} onChange={(e) => setLine(e.target.value)} spellCheck={false} />
          </label>
          <div className="chips">{PRESETS.map((p) => <button key={p} className="btn sm mono" onClick={() => setLine(p)}>{p}</button>)}</div>
        </>
      ) : (
        <label className="field">
          <L vi="Mã máy (hex)" en="Machine code (hex)" />
          <input id="enc-hex" className="mono wide" value={hex} onChange={(e) => setHex(e.target.value)} spellCheck={false} />
        </label>
      )}
      {content}
    </Widget>
  );
}
