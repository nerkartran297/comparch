'use client';

import { useMemo, useState } from 'react';
import * as RV from '@/lib/riscv.mjs';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { group4 } from '@/lib/bits';

const C_LINES = ['void swap(int v[], int k)', '{', '    int temp;', '    temp = v[k];', '    v[k] = v[k+1];', '    v[k+1] = temp;', '}'];
const ASM: { src: string; c: number[]; note: Bi }[] = [
  { src: 'slli x6, x11, 2', c: [3, 4, 5], note: { vi: 'x6 = k × 4 (mỗi int 4 byte)', en: 'x6 = k × 4 (each int is 4 bytes)' } },
  { src: 'add  x6, x10, x6', c: [3, 4, 5], note: { vi: 'x6 = địa chỉ của v[k]', en: 'x6 = address of v[k]' } },
  { src: 'lw   x5, 0(x6)', c: [3], note: { vi: 'temp (x5) = v[k]', en: 'temp (x5) = v[k]' } },
  { src: 'lw   x7, 4(x6)', c: [4], note: { vi: 'x7 = v[k+1]', en: 'x7 = v[k+1]' } },
  { src: 'sw   x7, 0(x6)', c: [4], note: { vi: 'v[k] = x7', en: 'v[k] = x7' } },
  { src: 'sw   x5, 4(x6)', c: [5], note: { vi: 'v[k+1] = temp', en: 'v[k+1] = temp' } },
  { src: 'jalr x0, 0(x1)', c: [6], note: { vi: 'quay về nơi gọi hàm', en: 'return to the caller' } },
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

  const explain = (() => {
    if (hl === null) return <L vi="Chọn một dòng." en="Pick a line." />;
    if (hl >= 100) {
      const a = ASM[hl - 100];
      return <><b>{a.src}</b>: <L vi={a.note.vi} en={a.note.en} />.</>;
    }
    const n = ASM.filter((a) => a.c.includes(hl)).length;
    const line = C_LINES[hl].trim();
    return (
      <L
        vi={<>Dòng C <b>{line}</b> được dịch thành {n || 'không'} lệnh assembly (tô sáng).</>}
        en={<>The C line <b>{line}</b> is compiled into {n || 'no'} assembly instruction{n === 1 ? '' : 's'} (highlighted).</>}
      />
    );
  })();

  return (
    <Widget
      title={<L vi="Ba tầng của cùng một hàm swap" en="Three levels of the same swap function" />}
      hint={<L
        vi="Bấm hoặc rê chuột vào một dòng C hay một lệnh assembly. 1 dòng C → nhiều lệnh assembly; 1 lệnh assembly → đúng 1 lệnh máy."
        en="Click or hover over a C line or an assembly instruction. 1 line of C → many assembly instructions; 1 assembly instruction → exactly 1 machine instruction."
      />}
    >
      <div className="ladder">
        <div className="ladder-col">
          <p className="ladder-h"><L vi="Ngôn ngữ bậc cao (C)" en="High-level language (C)" /></p>
          <pre className="mono">
            {C_LINES.map((l, i) => (
              <span key={i} className={`ladder-line${cOn(i) ? ' on' : ''}`} onMouseEnter={() => setHl(i)} onClick={() => setHl(i)}>{l || ' '}</span>
            ))}
          </pre>
        </div>
        <div className="ladder-arrow" aria-hidden><span>compiler</span>→<em><L vi="1 : nhiều" en="1 : many" /></em></div>
        <div className="ladder-col">
          <p className="ladder-h"><L vi="Hợp ngữ RISC-V" en="RISC-V assembly" /></p>
          <pre className="mono">
            {ASM.map((a, i) => (
              <span key={i} className={`ladder-line${asmOn(i) ? ' on' : ''}`} onMouseEnter={() => setHl(100 + i)} onClick={() => setHl(100 + i)}>{a.src}</span>
            ))}
          </pre>
        </div>
        <div className="ladder-arrow" aria-hidden><span>assembler</span>→<em>1 : 1</em></div>
        <div className="ladder-col">
          <p className="ladder-h"><L vi="Mã máy (bit)" en="Machine code (bits)" /></p>
          <pre className="mono small">
            {words.map((w, i) => (
              <span key={i} className={`ladder-line${asmOn(i) ? ' on' : ''}`} onMouseEnter={() => setHl(100 + i)} onClick={() => setHl(100 + i)}>{group4(RV.bin32(w))}</span>
            ))}
          </pre>
        </div>
      </div>
      <p className="explain">{explain}</p>
    </Widget>
  );
}
