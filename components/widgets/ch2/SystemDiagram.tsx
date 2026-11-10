'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';

type Part = { id: string; name: string; does: string; analogy: string };
const PARTS: Record<string, Part> = {
  cu: { id: 'cu', name: 'Khối điều khiển (Control Unit)', does: 'Lấy lệnh từ bộ nhớ, giải mã xem lệnh bảo làm gì, rồi ra lệnh cho các bộ phận khác làm theo.', analogy: 'Bếp trưởng đọc công thức và hô: "lấy trứng!", "đập vào bát!".' },
  alu: { id: 'alu', name: 'ALU / Datapath (đường dữ liệu)', does: 'Làm phép tính số học (cộng, trừ…) và logic (AND, OR…).', analogy: 'Đôi tay đầu bếp: chỉ biết vài động tác đơn giản nhưng làm cực nhanh.' },
  rf: { id: 'rf', name: 'Thanh ghi (register file) + PC, IR', does: '32 ô nhớ siêu nhỏ, siêu nhanh nằm ngay trong CPU. PC giữ địa chỉ lệnh sắp chạy, IR giữ lệnh vừa lấy về.', analogy: 'Cái thớt ngay trước mặt: chỉ để được vài thứ nhưng với tay là tới.' },
  mem: { id: 'mem', name: 'Bộ nhớ chính (RAM)', does: 'Một dãy ô, mỗi ô 1 byte, có địa chỉ riêng. Chứa cả lệnh của chương trình lẫn dữ liệu (ý tưởng Von Neumann).', analogy: 'Tủ lạnh: chứa nhiều, nhưng mỗi lần lấy phải đi lại → chậm hơn thanh ghi 100–500 lần.' },
  io: { id: 'io', name: 'Vào / Ra (I/O)', does: 'Giao tiếp với thế giới bên ngoài: bàn phím, chuột (vào); màn hình, loa (ra); ổ cứng, USB (lưu trữ); WiFi (truyền thông).', analogy: 'Quầy gọi món và quầy trả món cho khách.' },
  data: { id: 'data', name: 'Bus dữ liệu', does: 'Chở dữ liệu qua lại giữa CPU, bộ nhớ và I/O.', analogy: 'Băng chuyền chở đồ ăn.' },
  addr: { id: 'addr', name: 'Bus địa chỉ', does: 'Chở địa chỉ: CPU muốn đọc/ghi ô nhớ (hoặc thiết bị) nào.', analogy: 'Tờ giấy ghi "lấy ở ngăn số 940".' },
  ctrl: { id: 'ctrl', name: 'Bus điều khiển', does: 'Chở tín hiệu điều khiển: đọc hay ghi, xung clock, tín hiệu ngắt…', analogy: 'Tiếng hô "lấy!", "cất!", "có khách!".' },
};

/** Sơ đồ tổng quát của máy tính. Bấm vào từng khối để xem nó làm gì. */
export default function SystemDiagram({ title = 'Bên trong một máy tính' }: { title?: string }) {
  const [sel, setSel] = useState('cu');
  const p = PARTS[sel];
  const box = (id: string, x: number, y: number, w: number, h: number, label: string, sub?: string) => (
    <g className={`sd-part${sel === id ? ' on' : ''}`} onClick={() => setSel(id)} onMouseEnter={() => setSel(id)} role="button" tabIndex={0} aria-label={PARTS[id].name} onKeyDown={(e) => e.key === 'Enter' && setSel(id)}>
      <rect x={x} y={y} width={w} height={h} rx={8} />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 6 : -4)} textAnchor="middle" className="sd-label">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="sd-sub">{sub}</text>}
    </g>
  );
  const bus = (id: string, y: number, label: string) => (
    <g className={`sd-bus${sel === id ? ' on' : ''}`} onClick={() => setSel(id)} onMouseEnter={() => setSel(id)} role="button" tabIndex={0} aria-label={PARTS[id].name} onKeyDown={(e) => e.key === 'Enter' && setSel(id)}>
      <rect x={16} y={y - 10} width={728} height={20} fill="transparent" />
      <line x1={110} y1={y} x2={744} y2={y} />
      <text x={16} y={y + 4} className="sd-sub">{label}</text>
    </g>
  );

  return (
    <Widget title={title} hint="Bấm (hoặc rê chuột) vào một khối hay một đường bus.">
      <div className="svgbox">
        <svg viewBox="0 0 760 330" role="img" aria-label="Sơ đồ CPU, bộ nhớ, I/O và bus hệ thống">
          <rect x={16} y={12} width={262} height={198} rx={12} className="sd-frame" />
          <text x={30} y={34} className="sd-title">CPU (bộ xử lý)</text>
          {box('cu', 30, 46, 112, 70, 'Điều khiển', 'Control Unit')}
          {box('alu', 152, 46, 112, 70, 'ALU', 'tính toán')}
          {box('rf', 30, 126, 234, 70, 'Thanh ghi', 'x0–x31 · PC · IR')}
          {box('mem', 300, 12, 200, 198, 'Bộ nhớ', 'lệnh + dữ liệu')}
          {box('io', 522, 12, 222, 198, 'Vào / Ra', 'phím, màn hình, ổ đĩa…')}
          {[147, 400, 633].map((x) => (
            <g key={x} className="sd-drop">
              <line x1={x} y1={210} x2={x} y2={300} />
            </g>
          ))}
          {bus('data', 245, 'Dữ liệu')}
          {bus('addr', 272, 'Địa chỉ')}
          {bus('ctrl', 299, 'Điều khiển')}
          {[147, 400, 633].flatMap((x) => [245, 272, 299].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} className="sd-dot" />))}
        </svg>
      </div>
      <div className="sd-info">
        <strong>{p.name}</strong>
        <p>{p.does}</p>
        <p className="sd-analogy"><b>Hình dung:</b> {p.analogy}</p>
      </div>
    </Widget>
  );
}
