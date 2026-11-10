/** Hình minh hoạ tĩnh (SVG) dùng trong các bài. */

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
        <svg viewBox={`0 0 ${W} 190`} role="img" aria-label="Clock nhanh gấp đôi nhưng phép cộng vẫn mất 1 ns">
          <text x={10} y={40} className="fg-label">1 GHz</text>
          <text x={10} y={56} className="fg-sub">chu kỳ 1 ns</text>
          <path d={wave(28, 1)} className="fg-wave" />
          <rect x={sx(0)} y={56} width={sx(1) - sx(0)} height={14} rx={3} className="fg-op" />
          <text x={sx(0.5)} y={67} textAnchor="middle" className="fg-optext">cộng: 1 chu kỳ</text>
          <text x={10} y={120} className="fg-label">2 GHz</text>
          <text x={10} y={136} className="fg-sub">chu kỳ 0.5 ns</text>
          <path d={wave(108, 0.5)} className="fg-wave" />
          <rect x={sx(0)} y={136} width={sx(1) - sx(0)} height={14} rx={3} className="fg-op" />
          <text x={sx(0.5)} y={147} textAnchor="middle" className="fg-optext">cộng: 2 chu kỳ</text>
          <line x1={sx(1)} y1={20} x2={sx(1)} y2={160} className="fg-mark" />
          <text x={sx(1)} y={178} textAnchor="middle" className="fg-sub">cùng xong ở 1 ns</text>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={sx(t)} y={178} textAnchor="middle" className="fg-tick">{t === 1 ? '' : `${t} ns`}</text>)}
        </svg>
      </div>
      <figcaption>Clock nhanh gấp đôi, nhưng nếu phép cộng vốn cần 1 ns thì máy 2 GHz phải tốn 2 chu kỳ. Bước nhỏ hơn không có nghĩa là về đích sớm hơn (slide 45).</figcaption>
    </figure>
  );
}

export function MemoryLayout() {
  const rows = [
    { y: 10, h: 54, name: 'Stack', note: 'biến cục bộ, địa chỉ về… mọc XUỐNG ↓', addr: 'sp bắt đầu ≈ 0x7FFFEFFC', cls: 'ml-stack' },
    { y: 64, h: 60, name: '(trống)', note: 'stack và heap tiến lại gần nhau', addr: '', cls: 'ml-free' },
    { y: 124, h: 40, name: 'Heap', note: 'cấp phát động (malloc), mọc LÊN ↑', addr: '', cls: 'ml-heap' },
    { y: 164, h: 44, name: 'Static data (.data)', note: 'biến toàn cục, chuỗi, mảng khai báo sẵn', addr: '0x10010000', cls: 'ml-data' },
    { y: 208, h: 44, name: 'Text (.text)', note: 'mã máy của chương trình', addr: '0x00400000', cls: 'ml-text' },
  ];
  return (
    <figure className="fig">
      <div className="svgbox">
        <svg viewBox="0 0 640 262" role="img" aria-label="Tổ chức bộ nhớ của chương trình">
          <text x={20} y={16} className="fg-sub">địa chỉ cao</text>
          <text x={20} y={256} className="fg-sub">địa chỉ thấp</text>
          {rows.map((r) => (
            <g key={r.name} className={r.cls}>
              <rect x={110} y={r.y} width={210} height={r.h} />
              <text x={215} y={r.y + r.h / 2 + 5} textAnchor="middle" className="fg-label">{r.name}</text>
              <text x={334} y={r.y + r.h / 2 - 2} className="fg-sub">{r.note}</text>
              {r.addr && <text x={334} y={r.y + r.h / 2 + 15} className="fg-addr">{r.addr} (trong RARS)</text>}
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
      <figcaption>Bố cục bộ nhớ của một chương trình RISC-V. Địa chỉ là của RARS (sách dùng địa chỉ khác, nhưng thứ tự các vùng giống nhau).</figcaption>
    </figure>
  );
}

export function InterruptOrder() {
  const lane = (y: number, segs: [number, number, string, string][]) =>
    segs.map(([s, e, cls, label], i) => (
      <g key={`${y}-${i}`}>
        <rect x={130 + s * 30} y={y} width={(e - s) * 30} height={24} className={cls} />
        <text x={130 + ((s + e) / 2) * 30} y={y + 16} textAnchor="middle" className="fg-optext">{label}</text>
      </g>
    ));
  return (
    <figure className="fig">
      <div className="svgbox">
        <svg viewBox="0 0 640 150" role="img" aria-label="Xử lý nhiều ngắt: tuần tự và lồng nhau">
          <text x={10} y={36} className="fg-label">Tuần tự</text>
          {lane(20, [[0, 3, 'io-user', 'chương trình'], [3, 7, 'io-isr1', 'ISR máy in'], [7, 10, 'io-isr2', 'ISR mạng'], [10, 16, 'io-user', 'chương trình']])}
          <text x={10} y={96} className="fg-label">Lồng nhau</text>
          {lane(80, [[0, 3, 'io-user', 'chương trình'], [3, 5, 'io-isr1', 'ISR in'], [5, 8, 'io-isr2', 'ISR mạng'], [8, 10, 'io-isr1', 'ISR in'], [10, 16, 'io-user', 'chương trình']])}
          <text x={130 + 5 * 30} y={128} textAnchor="middle" className="fg-sub">↑ ngắt mạng (ưu tiên cao) đến</text>
        </svg>
      </div>
      <figcaption>Tuần tự: đang phục vụ ngắt thì tạm tắt ngắt khác, xong mới tới cái sau. Lồng nhau: ngắt ưu tiên cao được chen ngang ISR ưu tiên thấp.</figcaption>
    </figure>
  );
}

export function StackPicture() {
  return (
    <figure className="fig">
      <div className="svgbox free">
        <svg viewBox="0 0 520 220" role="img" aria-label="Push và pop trên stack">
          {[0, 1, 2].map((k) => {
            const x = 20 + k * 170;
            const cells = k === 0 ? ['…', '…', ''] : k === 1 ? ['…', '…', 't0'] : ['…', '…', '(t0 cũ)'];
            const sp = k === 1 ? 2 : 1;
            return (
              <g key={k}>
                <text x={x + 60} y={18} textAnchor="middle" className="fg-label">{['Ban đầu', 'Sau PUSH t0', 'Sau POP'][k]}</text>
                {cells.map((c, i) => (
                  <g key={i}>
                    <rect x={x + 20} y={30 + i * 40} width={80} height={40} className={i <= sp ? 'st-used' : 'st-free'} />
                    <text x={x + 60} y={55 + i * 40} textAnchor="middle" className="fg-optext">{c}</text>
                  </g>
                ))}
                <text x={x + 104} y={55 + sp * 40} className="fg-addr">← sp</text>
                <text x={x + 60} y={170} textAnchor="middle" className="fg-sub">{['', 'addi sp, sp, -4', 'lw t0, 0(sp)'][k]}</text>
                <text x={x + 60} y={188} textAnchor="middle" className="fg-sub">{['', 'sw t0, 0(sp)', 'addi sp, sp, 4'][k]}</text>
              </g>
            );
          })}
          <text x={10} y={212} className="fg-sub">↑ địa chỉ cao ở trên, stack mọc xuống dưới</text>
        </svg>
      </div>
      <figcaption>PUSH: lùi sp xuống 4 byte rồi cất. POP: lấy ra rồi tăng sp. Dữ liệu cũ vẫn nằm đó nhưng coi như rác.</figcaption>
    </figure>
  );
}
