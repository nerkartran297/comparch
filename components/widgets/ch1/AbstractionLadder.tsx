'use client';

import { useMemo, useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { Widget } from '@/components/lesson/Blocks';
import { group4 } from '@/lib/bits';

const C_LINES = ['void swap(int v[], int k)', '{', '    int temp;', '    temp = v[k];', '    v[k] = v[k+1];', '    v[k+1] = temp;', '}'];
const ASM: { src: string; c: number[]; note: string }[] = [
  { src: 'slli x6, x11, 2', c: [3, 4, 5], note: 'x6 = k × 4 (mỗi int 4 byte)' },
  { src: 'add  x6, x10, x6', c: [3, 4, 5], note: 'x6 = địa chỉ của v[k]' },
  { src: 'lw   x5, 0(x6)', c: [3], note: 'temp (x5) = v[k]' },
  { src: 'lw   x7, 4(x6)', c: [4], note: 'x7 = v[k+1]' },
  { src: 'sw   x7, 0(x6)', c: [4], note: 'v[k] = x7' },
  { src: 'sw   x5, 4(x6)', c: [5], note: 'v[k+1] = temp' },
  { src: 'jalr x0, 0(x1)', c: [6], note: 'quay về nơi gọi hàm' },
];

/** Từ C xuống assembly xuống mã máy: rê chuột/bấm vào một dòng để thấy nó tương ứng với dòng nào ở tầng khác. */
export default function AbstractionLadder() {
  const [hl, setHl] = useState<number | null>(3);
  const words = useMemo(() => {
    const p = RV.assemble('.text\n' + ASM.map((a) => a.src).join('\n'));
    return p.text.map((t) => t.word);
  }, []);
  const asmOn = (i: number) => hl !== null && (hl >= 100 ? hl - 100 === i : ASM[i].c.includes(hl));
  const cOn = (ci: number) => hl !== null && (hl >= 100 ? ASM[hl - 100].c.includes(ci) : hl === ci);

  return (
    <Widget title="Ba tầng của cùng một hàm swap" hint="Bấm hoặc rê chuột vào một dòng C hay một lệnh assembly. 1 dòng C → nhiều lệnh assembly; 1 lệnh assembly → đúng 1 lệnh máy.">
      <div className="ladder">
        <div className="ladder-col">
          <p className="ladder-h">Ngôn ngữ bậc cao (C)</p>
          <pre className="mono">
            {C_LINES.map((l, i) => (
              <span key={i} className={`ladder-line${cOn(i) ? ' on' : ''}`} onMouseEnter={() => setHl(i)} onClick={() => setHl(i)}>{l || ' '}</span>
            ))}
          </pre>
        </div>
        <div className="ladder-arrow" aria-hidden><span>compiler</span>→<em>1 : nhiều</em></div>
        <div className="ladder-col">
          <p className="ladder-h">Hợp ngữ RISC-V</p>
          <pre className="mono">
            {ASM.map((a, i) => (
              <span key={i} className={`ladder-line${asmOn(i) ? ' on' : ''}`} onMouseEnter={() => setHl(100 + i)} onClick={() => setHl(100 + i)}>{a.src}</span>
            ))}
          </pre>
        </div>
        <div className="ladder-arrow" aria-hidden><span>assembler</span>→<em>1 : 1</em></div>
        <div className="ladder-col">
          <p className="ladder-h">Mã máy (bit)</p>
          <pre className="mono small">
            {words.map((w, i) => (
              <span key={i} className={`ladder-line${asmOn(i) ? ' on' : ''}`} onMouseEnter={() => setHl(100 + i)} onClick={() => setHl(100 + i)}>{group4(RV.bin32(w))}</span>
            ))}
          </pre>
        </div>
      </div>
      <p className="explain">
        {hl === null ? 'Chọn một dòng.' : hl >= 100 ? <><b>{ASM[hl - 100].src}</b>: {ASM[hl - 100].note}.</> : <>Dòng C <b>{C_LINES[hl].trim()}</b> được dịch thành {ASM.filter((a) => a.c.includes(hl)).length || 'không'} lệnh assembly (tô sáng).</>}
      </p>
    </Widget>
  );
}
