/** Hình minh hoạ tĩnh (SVG) dùng trong các bài. */
import type { SVGProps } from 'react';
import { L } from '@/components/i18n';

type TextProps = Omit<SVGProps<SVGTextElement>, 'children'> & { vi: string; en: string };

/** Chữ SVG song ngữ: vẽ cả hai <text>, CSS (.svg-vi / .svg-en) ẩn bản không dùng. */
function BiText({ vi, en, className, ...rest }: TextProps) {
  if (vi === en) return <text className={className} {...rest}>{vi}</text>;
  return (
    <>
      <text className={`${className ?? ''} svg-vi`} {...rest}>{vi}</text>
      <text className={`${className ?? ''} svg-en`} {...rest}>{en}</text>
    </>
  );
}

export function ClockTrap() {
  // 1 ns cộng; clock 1 GHz: 1 chu kỳ; clock 2 GHz: 2 chu kỳ
  const W = 640;
  const x0 = 140, x1 = 600;
  const sx = (ns: number) => x0 + ((x1 - x0) * ns) / 1.25;
  const ticks = (period: number) => Array.from({ length: Math.floor(1.25 / period) + 1 }, (_, i) => i * period);
  const wave = (y: number, period: number) => {
    let d = `M${sx(0)} ${y + 18}`;
    for (const t of ticks(period)) {
      if (t + period / 2 > 1.25) break;
      d += ` L${sx(t)} ${y} L${sx(t + period / 2)} ${y} L${sx(t + period / 2)} ${y + 18} L${sx(Math.min(1.25, t + period))} ${y + 18}`;
    }
    return d;
  };
  return (
    <figure className="fig">
      <div className="svgbox">
        <svg viewBox={`0 0 ${W} 190`} role="img" aria-label="Clock nhanh gấp đôi nhưng phép cộng vẫn mất 1 ns / A clock twice as fast, but the add still takes 1 ns">
          <text x={10} y={40} className="fg-label">1 GHz</text>
          <BiText x={10} y={56} className="fg-sub" vi="chu kỳ 1 ns" en="1 ns cycle" />
          <path d={wave(28, 1)} className="fg-wave" />
          <rect x={sx(0)} y={56} width={sx(1) - sx(0)} height={14} rx={3} className="fg-op" />
          <BiText x={sx(0.5)} y={67} textAnchor="middle" className="fg-optext" vi="cộng: 1 chu kỳ" en="add: 1 cycle" />
          <text x={10} y={120} className="fg-label">2 GHz</text>
          <BiText x={10} y={136} className="fg-sub" vi="chu kỳ 0.5 ns" en="0.5 ns cycle" />
          <path d={wave(108, 0.5)} className="fg-wave" />
          <rect x={sx(0)} y={136} width={sx(1) - sx(0)} height={14} rx={3} className="fg-op" />
          <BiText x={sx(0.5)} y={147} textAnchor="middle" className="fg-optext" vi="cộng: 2 chu kỳ" en="add: 2 cycles" />
          <line x1={sx(1)} y1={20} x2={sx(1)} y2={160} className="fg-mark" />
          <BiText x={sx(1)} y={178} textAnchor="middle" className="fg-sub" vi="cùng xong ở 1 ns" en="both finish at 1 ns" />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={sx(t)} y={178} textAnchor="middle" className="fg-tick">{t === 1 ? '' : `${t} ns`}</text>)}
        </svg>
      </div>
      <figcaption>
        <L
          vi="Clock nhanh gấp đôi, nhưng nếu phép cộng vốn cần 1 ns thì máy 2 GHz phải tốn 2 chu kỳ. Bước nhỏ hơn không có nghĩa là về đích sớm hơn (slide 45)."
          en="The clock is twice as fast, but if an add really needs 1 ns, the 2 GHz machine simply spends 2 cycles on it. Smaller steps do not mean you arrive sooner (slide 45)."
        />
      </figcaption>
    </figure>
  );
}

export function MemoryLayout() {
  const rows = [
    { y: 10, h: 54, name: ['Stack', 'Stack'], note: ['biến cục bộ, địa chỉ về… mọc XUỐNG ↓', 'local variables, return addresses… grows DOWN ↓'], addr: ['sp bắt đầu ≈ 0x7FFFEFFC', 'sp starts ≈ 0x7FFFEFFC'], cls: 'ml-stack' },
    { y: 64, h: 60, name: ['(trống)', '(free)'], note: ['stack và heap tiến lại gần nhau', 'stack and heap grow toward each other'], addr: ['', ''], cls: 'ml-free' },
    { y: 124, h: 40, name: ['Heap', 'Heap'], note: ['cấp phát động (malloc), mọc LÊN ↑', 'dynamic allocation (malloc), grows UP ↑'], addr: ['', ''], cls: 'ml-heap' },
    { y: 164, h: 44, name: ['Static data (.data)', 'Static data (.data)'], note: ['biến toàn cục, chuỗi, mảng khai báo sẵn', 'global variables, strings, predeclared arrays'], addr: ['0x10010000', '0x10010000'], cls: 'ml-data' },
    { y: 208, h: 44, name: ['Text (.text)', 'Text (.text)'], note: ['mã máy của chương trình', 'the program’s machine code'], addr: ['0x00400000', '0x00400000'], cls: 'ml-text' },
  ];
  return (
    <figure className="fig">
      <div className="svgbox">
        <svg viewBox="0 0 640 262" role="img" aria-label="Tổ chức bộ nhớ của chương trình / Program memory layout">
          <BiText x={20} y={16} className="fg-sub" vi="địa chỉ cao" en="high addresses" />
          <BiText x={20} y={256} className="fg-sub" vi="địa chỉ thấp" en="low addresses" />
          {rows.map((r) => (
            <g key={r.cls} className={r.cls}>
              <rect x={110} y={r.y} width={210} height={r.h} />
              <BiText x={215} y={r.y + r.h / 2 + 5} textAnchor="middle" className="fg-label" vi={r.name[0]} en={r.name[1]} />
              <BiText x={334} y={r.y + r.h / 2 - 2} className="fg-sub" vi={r.note[0]} en={r.note[1]} />
              {r.addr[0] && <BiText x={334} y={r.y + r.h / 2 + 15} className="fg-addr" vi={`${r.addr[0]} (trong RARS)`} en={`${r.addr[1]} (in RARS)`} />}
            </g>
          ))}
          <path d="M215 66 v18" className="fg-arrow" markerEnd="url(#ml-a)" />
          <path d="M215 122 v-18" className="fg-arrow" markerEnd="url(#ml-a)" />
          <defs>
            <marker id="ml-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="fg-arrowhead" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption>
        <L
          vi="Bố cục bộ nhớ của một chương trình RISC-V. Địa chỉ là của RARS (sách dùng địa chỉ khác, nhưng thứ tự các vùng giống nhau)."
          en="Memory layout of a RISC-V program. Addresses are the ones RARS uses (the textbook uses different ones, but the order of the regions is the same)."
        />
      </figcaption>
    </figure>
  );
}

export function InterruptOrder() {
  const lane = (y: number, segs: [number, number, string, string, string][]) =>
    segs.map(([s, e, cls, vi, en], i) => (
      <g key={`${y}-${i}`}>
        <rect x={130 + s * 30} y={y} width={(e - s) * 30} height={24} className={cls} />
        <BiText x={130 + ((s + e) / 2) * 30} y={y + 16} textAnchor="middle" className="fg-optext" vi={vi} en={en} />
      </g>
    ));
  return (
    <figure className="fig">
      <div className="svgbox">
        <svg viewBox="0 0 640 150" role="img" aria-label="Xử lý nhiều ngắt: tuần tự và lồng nhau / Handling several interrupts: sequential and nested">
          <BiText x={10} y={36} className="fg-label" vi="Tuần tự" en="Sequential" />
          {lane(20, [[0, 3, 'io-user', 'chương trình', 'program'], [3, 7, 'io-isr1', 'ISR máy in', 'printer ISR'], [7, 10, 'io-isr2', 'ISR mạng', 'network ISR'], [10, 16, 'io-user', 'chương trình', 'program']])}
          <BiText x={10} y={96} className="fg-label" vi="Lồng nhau" en="Nested" />
          {lane(80, [[0, 3, 'io-user', 'chương trình', 'program'], [3, 5, 'io-isr1', 'ISR in', 'print ISR'], [5, 8, 'io-isr2', 'ISR mạng', 'network ISR'], [8, 10, 'io-isr1', 'ISR in', 'print ISR'], [10, 16, 'io-user', 'chương trình', 'program']])}
          <BiText x={130 + 5 * 30} y={128} textAnchor="middle" className="fg-sub" vi="↑ ngắt mạng (ưu tiên cao) đến" en="↑ network interrupt (higher priority) arrives" />
        </svg>
      </div>
      <figcaption>
        <L
          vi="Tuần tự: đang phục vụ ngắt thì tạm tắt ngắt khác, xong mới tới cái sau. Lồng nhau: ngắt ưu tiên cao được chen ngang ISR ưu tiên thấp."
          en="Sequential: while one interrupt is being serviced, others are disabled and wait their turn. Nested: a higher-priority interrupt may cut into a lower-priority ISR."
        />
      </figcaption>
    </figure>
  );
}

export function StackPicture() {
  const heads: [string, string][] = [['Ban đầu', 'Start'], ['Sau PUSH t0', 'After PUSH t0'], ['Sau POP', 'After POP']];
  return (
    <figure className="fig">
      <div className="svgbox free">
        <svg viewBox="0 0 520 220" role="img" aria-label="Push và pop trên stack / Push and pop on the stack">
          {[0, 1, 2].map((k) => {
            const x = 20 + k * 170;
            const cells: [string, string][] = k === 0 ? [['…', '…'], ['…', '…'], ['', '']] : k === 1 ? [['…', '…'], ['…', '…'], ['t0', 't0']] : [['…', '…'], ['…', '…'], ['(t0 cũ)', '(old t0)']];
            const sp = k === 1 ? 2 : 1;
            return (
              <g key={k}>
                <BiText x={x + 60} y={18} textAnchor="middle" className="fg-label" vi={heads[k][0]} en={heads[k][1]} />
                {cells.map((c, i) => (
                  <g key={i}>
                    <rect x={x + 20} y={30 + i * 40} width={80} height={40} className={i <= sp ? 'st-used' : 'st-free'} />
                    <BiText x={x + 60} y={55 + i * 40} textAnchor="middle" className="fg-optext" vi={c[0]} en={c[1]} />
                  </g>
                ))}
                <text x={x + 104} y={55 + sp * 40} className="fg-addr">← sp</text>
                <text x={x + 60} y={170} textAnchor="middle" className="fg-sub">{['', 'addi sp, sp, -4', 'lw t0, 0(sp)'][k]}</text>
                <text x={x + 60} y={188} textAnchor="middle" className="fg-sub">{['', 'sw t0, 0(sp)', 'addi sp, sp, 4'][k]}</text>
              </g>
            );
          })}
          <BiText x={10} y={212} className="fg-sub" vi="↑ địa chỉ cao ở trên, stack mọc xuống dưới" en="↑ high addresses at the top, the stack grows downward" />
        </svg>
      </div>
      <figcaption>
        <L
          vi="PUSH: lùi sp xuống 4 byte rồi cất. POP: lấy ra rồi tăng sp. Dữ liệu cũ vẫn nằm đó nhưng coi như rác."
          en="PUSH: move sp down 4 bytes, then store. POP: load, then move sp back up. The old data is still there, but it is treated as garbage."
        />
      </figcaption>
    </figure>
  );
}
