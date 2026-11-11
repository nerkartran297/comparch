'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L } from '@/components/i18n';

/** Cùng một word 32 bit, xếp vào bộ nhớ theo little-endian (RISC-V) và big-endian. */
export default function Endian() {
  const [txt, setTxt] = useState('FA5D1B68');
  const [hover, setHover] = useState<number | null>(null);
  const clean = txt.replace(/^0x/i, '').toUpperCase();
  const ok = /^[0-9A-F]{1,8}$/.test(clean);
  const word = ok ? clean.padStart(8, '0') : '00000000';
  const bytes = [0, 1, 2, 3].map((i) => word.slice(i * 2, i * 2 + 2)); // bytes[0] = MSB
  const COL = ['var(--f-f7)', 'var(--f-rs1)', 'var(--f-f3)', 'var(--f-rd)'];

  const mem = (order: number[], title: React.ReactNode, note: React.ReactNode) => (
    <div className="en-col">
      <p className="en-h">{title}</p>
      {[3, 2, 1, 0].map((off) => {
        const bi = order[off];
        return (
          <div key={off} className={`en-cell${hover === bi ? ' on' : ''}`} onMouseEnter={() => setHover(bi)} onMouseLeave={() => setHover(null)} style={{ ['--c' as string]: COL[bi] }}>
            <span className="mono en-addr">X+{off}</span>
            <strong className="mono">{bytes[bi]}</strong>
            <span className="en-tag">{bi === 0 ? 'MSB' : bi === 3 ? 'LSB' : ''}</span>
          </div>
        );
      })}
      <p className="en-note">{note}</p>
    </div>
  );

  return (
    <Widget
      title={<L vi="Little-endian và big-endian" en="Little-endian and big-endian" />}
      hint={<L
        vi="Gõ một word (8 chữ số hex). Rê chuột vào một byte để thấy nó nằm ở đâu trong hai kiểu. Địa chỉ cao vẽ ở trên."
        en="Type a word (8 hex digits). Hover over a byte to see where it lands in each layout. Higher addresses are drawn at the top."
      />}
    >
      <label className="field"><L vi="Word (hex)" en="Word (hex)" /><input id="en-w" className="mono" value={txt} onChange={(e) => setTxt(e.target.value)} /></label>
      {!ok && <p className="pill bad"><L vi="Nhập tối đa 8 chữ số hex" en="Enter at most 8 hex digits" /></p>}
      <div className="en-word mono">
        0x{bytes.map((b, i) => (
          <span key={i} className={hover === i ? 'on' : ''} style={{ color: COL[i] }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>{b}</span>
        ))}
      </div>
      <div className="en-grid">
        {mem([3, 2, 1, 0], <L vi="Little-endian (RISC-V, x86)" en="Little-endian (RISC-V, x86)" />, <L vi="Byte THẤP nhất (LSB) ở địa chỉ X." en="The LOWEST byte (LSB) is at address X." />)}
        {mem([0, 1, 2, 3], <L vi="Big-endian (IBM 360, SPARC)" en="Big-endian (IBM 360, SPARC)" />, <L vi="Byte CAO nhất (MSB) ở địa chỉ X." en="The HIGHEST byte (MSB) is at address X." />)}
      </div>
      <p className="explain">
        <L
          vi={<>Đọc ngược lại (bài slide 17): biết bộ nhớ RISC-V có X = {bytes[3]}, X+1 = {bytes[2]}, X+2 = {bytes[1]}, X+3 = {bytes[0]}. Little-endian → đọc từ địa chỉ <b>cao xuống thấp</b>: 0x{word}.</>}
          en={<>Reading it back (slide 17): RISC-V memory holds X = {bytes[3]}, X+1 = {bytes[2]}, X+2 = {bytes[1]}, X+3 = {bytes[0]}. Little-endian → read from the <b>highest address down to the lowest</b>: 0x{word}.</>}
        />
      </p>
    </Widget>
  );
}
