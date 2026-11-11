'use client';

import { useState } from 'react';
import { Widget } from '@/components/lesson/Blocks';
import { L, type Bi } from '@/components/i18n';
import { useT } from '@/lib/lang';

type Part = { id: string; name: Bi; does: Bi; analogy: Bi };
const PARTS: Record<string, Part> = {
  cu: {
    id: 'cu',
    name: { vi: 'Khối điều khiển (Control Unit)', en: 'Control Unit' },
    does: { vi: 'Lấy lệnh từ bộ nhớ, giải mã xem lệnh bảo làm gì, rồi ra lệnh cho các bộ phận khác làm theo.', en: 'Fetches instructions from memory, decodes what each one asks for, then tells the other parts what to do.' },
    analogy: { vi: 'Bếp trưởng đọc công thức và hô: "lấy trứng!", "đập vào bát!".', en: 'The head chef reading the recipe and calling out: "grab the eggs!", "crack them into the bowl!".' },
  },
  alu: {
    id: 'alu',
    name: { vi: 'ALU / Datapath (đường dữ liệu)', en: 'ALU / Datapath' },
    does: { vi: 'Làm phép tính số học (cộng, trừ…) và logic (AND, OR…).', en: 'Does arithmetic (add, subtract…) and logic (AND, OR…).' },
    analogy: { vi: 'Đôi tay đầu bếp: chỉ biết vài động tác đơn giản nhưng làm cực nhanh.', en: 'The chef’s hands: they know only a few simple moves, but do them extremely fast.' },
  },
  rf: {
    id: 'rf',
    name: { vi: 'Thanh ghi (register file) + PC, IR', en: 'Register file + PC, IR' },
    does: { vi: '32 ô nhớ siêu nhỏ, siêu nhanh nằm ngay trong CPU. PC giữ địa chỉ lệnh sắp chạy, IR giữ lệnh vừa lấy về.', en: '32 tiny, super-fast storage slots right inside the CPU. PC holds the address of the next instruction; IR holds the instruction just fetched.' },
    analogy: { vi: 'Cái thớt ngay trước mặt: chỉ để được vài thứ nhưng với tay là tới.', en: 'The cutting board in front of you: it holds only a few things, but they are within arm’s reach.' },
  },
  mem: {
    id: 'mem',
    name: { vi: 'Bộ nhớ chính (RAM)', en: 'Main memory (RAM)' },
    does: { vi: 'Một dãy ô, mỗi ô 1 byte, có địa chỉ riêng. Chứa cả lệnh của chương trình lẫn dữ liệu (ý tưởng Von Neumann).', en: 'A long row of cells, 1 byte each, each with its own address. It holds both the program’s instructions and its data (the Von Neumann idea).' },
    analogy: { vi: 'Tủ lạnh: chứa nhiều, nhưng mỗi lần lấy phải đi lại → chậm hơn thanh ghi 100–500 lần.', en: 'The fridge: holds a lot, but every trip takes time → 100–500 times slower than a register.' },
  },
  io: {
    id: 'io',
    name: { vi: 'Vào / Ra (I/O)', en: 'Input / Output (I/O)' },
    does: { vi: 'Giao tiếp với thế giới bên ngoài: bàn phím, chuột (vào); màn hình, loa (ra); ổ cứng, USB (lưu trữ); WiFi (truyền thông).', en: 'Talks to the outside world: keyboard, mouse (input); screen, speakers (output); disks, USB (storage); WiFi (communication).' },
    analogy: { vi: 'Quầy gọi món và quầy trả món cho khách.', en: 'The counter where customers order and pick up their food.' },
  },
  data: {
    id: 'data',
    name: { vi: 'Bus dữ liệu', en: 'Data bus' },
    does: { vi: 'Chở dữ liệu qua lại giữa CPU, bộ nhớ và I/O.', en: 'Carries data back and forth between the CPU, memory and I/O.' },
    analogy: { vi: 'Băng chuyền chở đồ ăn.', en: 'The conveyor belt that carries the food.' },
  },
  addr: {
    id: 'addr',
    name: { vi: 'Bus địa chỉ', en: 'Address bus' },
    does: { vi: 'Chở địa chỉ: CPU muốn đọc/ghi ô nhớ (hoặc thiết bị) nào.', en: 'Carries addresses: which memory cell (or device) the CPU wants to read or write.' },
    analogy: { vi: 'Tờ giấy ghi "lấy ở ngăn số 940".', en: 'A note saying "take it from shelf 940".' },
  },
  ctrl: {
    id: 'ctrl',
    name: { vi: 'Bus điều khiển', en: 'Control bus' },
    does: { vi: 'Chở tín hiệu điều khiển: đọc hay ghi, xung clock, tín hiệu ngắt…', en: 'Carries control signals: read or write, clock pulses, interrupt requests…' },
    analogy: { vi: 'Tiếng hô "lấy!", "cất!", "có khách!".', en: 'The shouts of "fetch!", "put it away!", "customer!".' },
  },
};

/** Sơ đồ tổng quát của máy tính. Bấm vào từng khối để xem nó làm gì. */
export default function SystemDiagram({ title }: { title?: React.ReactNode }) {
  const t = useT();
  const [sel, setSel] = useState('cu');
  const p = PARTS[sel];
  const box = (id: string, x: number, y: number, w: number, h: number, label: string, sub?: string) => (
    <g className={`sd-part${sel === id ? ' on' : ''}`} onClick={() => setSel(id)} onMouseEnter={() => setSel(id)} role="button" tabIndex={0} aria-label={t(PARTS[id].name)} onKeyDown={(e) => e.key === 'Enter' && setSel(id)}>
      <rect x={x} y={y} width={w} height={h} rx={8} />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 6 : -4)} textAnchor="middle" className="sd-label">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="sd-sub">{sub}</text>}
    </g>
  );
  const bus = (id: string, y: number, label: string) => (
    <g className={`sd-bus${sel === id ? ' on' : ''}`} onClick={() => setSel(id)} onMouseEnter={() => setSel(id)} role="button" tabIndex={0} aria-label={t(PARTS[id].name)} onKeyDown={(e) => e.key === 'Enter' && setSel(id)}>
      <rect x={16} y={y - 10} width={728} height={20} fill="transparent" />
      <line x1={110} y1={y} x2={744} y2={y} />
      <text x={16} y={y + 4} className="sd-sub">{label}</text>
    </g>
  );

  return (
    <Widget
      title={title ?? <L vi="Bên trong một máy tính" en="Inside a computer" />}
      hint={<L vi="Bấm (hoặc rê chuột) vào một khối hay một đường bus." en="Click (or hover over) a block or a bus line." />}
    >
      <div className="svgbox">
        <svg viewBox="0 0 760 330" role="img" aria-label={t('Sơ đồ CPU, bộ nhớ, I/O và bus hệ thống', 'Diagram of the CPU, memory, I/O and system bus')}>
          <rect x={16} y={12} width={262} height={198} rx={12} className="sd-frame" />
          <text x={30} y={34} className="sd-title">{t('CPU (bộ xử lý)', 'CPU (processor)')}</text>
          {box('cu', 30, 46, 112, 70, t('Điều khiển', 'Control'), 'Control Unit')}
          {box('alu', 152, 46, 112, 70, 'ALU', t('tính toán', 'computes'))}
          {box('rf', 30, 126, 234, 70, t('Thanh ghi', 'Registers'), 'x0–x31 · PC · IR')}
          {box('mem', 300, 12, 200, 198, t('Bộ nhớ', 'Memory'), t('lệnh + dữ liệu', 'instructions + data'))}
          {box('io', 522, 12, 222, 198, t('Vào / Ra', 'Input / Output'), t('phím, màn hình, ổ đĩa…', 'keyboard, screen, disks…'))}
          {[147, 400, 633].map((x) => (
            <g key={x} className="sd-drop">
              <line x1={x} y1={210} x2={x} y2={300} />
            </g>
          ))}
          {bus('data', 245, t('Dữ liệu', 'Data'))}
          {bus('addr', 272, t('Địa chỉ', 'Address'))}
          {bus('ctrl', 299, t('Điều khiển', 'Control'))}
          {[147, 400, 633].flatMap((x) => [245, 272, 299].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={3.5} className="sd-dot" />))}
        </svg>
      </div>
      <div className="sd-info">
        <strong><L vi={p.name.vi} en={p.name.en} /></strong>
        <p><L vi={p.does.vi} en={p.does.en} /></p>
        <p className="sd-analogy"><b><L vi="Hình dung:" en="Picture it:" /></b> <L vi={p.analogy.vi} en={p.analogy.en} /></p>
      </div>
    </Widget>
  );
}
