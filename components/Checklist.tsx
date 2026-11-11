'use client';

import { useStored } from '@/lib/storage';
import { L } from './i18n';

const ITEMS: [string, string][] = [
  ['Tính được CPU time, CPI trung bình, “nhanh hơn bao nhiêu %”', 'Compute CPU time, average CPI, and “how many % faster”'],
  ['Đếm số lệnh động trong vòng lặp lồng nhau', 'Count dynamic instructions in nested loops'],
  ['Mô tả chu trình Fetch – Execute, vai trò PC và IR', 'Describe the Fetch – Execute cycle and the roles of PC and IR'],
  ['Giải thích ngắt, ISR, so sánh với gọi hàm; polling và ngắt', 'Explain interrupts and the ISR, compare them with function calls; polling vs interrupts'],
  ['Thuộc bảng thanh ghi (zero, ra, sp, t, s, a) và số x tương ứng', 'Know the register table (zero, ra, sp, t, s, a) and their x numbers by heart'],
  ['Chạy tay một đoạn assembly ra giá trị thanh ghi cuối', 'Trace a piece of assembly by hand to get the final register values'],
  ['Dịch C ↔ assembly: phép gán, mảng, if-else, for, while, switch', 'Translate C ↔ assembly: assignment, arrays, if-else, for, while, switch'],
  ['Mã hoá lệnh R, I, S ra nhị phân / hex', 'Encode R, I, S instructions into binary / hex'],
  ['Viết hàm có cất/khôi phục stack; hiểu đệ quy fact', 'Write functions that save/restore on the stack; understand recursive fact'],
  ['Vẽ bản đồ vùng .data (có căn lề)', 'Draw a map of the .data segment (with alignment)'],
  ['Dùng ecall: in/đọc số, in chuỗi, thoát', 'Use ecall: print/read numbers, print strings, exit'],
  ['Bù 2, mở rộng dấu, lb và lbu, blt và bltu', "Two's complement, sign extension, lb vs lbu, blt vs bltu"],
  ['Nhận biết tràn số', 'Recognise overflow'],
  ['Bảng chân lý full adder, công thức carry-lookahead', 'Full adder truth table, carry-lookahead formulas'],
  ['Chạy tay thuật toán nhân và chia 4 bit', 'Run the 4-bit multiply and divide algorithms by hand'],
  ['Đổi qua lại thập phân ↔ IEEE 754; nhận biết 0, ∞, NaN, không chuẩn hoá', 'Convert decimal ↔ IEEE 754; recognise 0, ∞, NaN, denormalized numbers'],
  ['Các bước cộng / nhân số thực', 'The steps of floating-point addition / multiplication'],
];

/** Checklist trước khi thi, lưu trong trình duyệt. */
export default function Checklist() {
  const [done, setDone] = useStored<Record<number, boolean>>('ktmt-checklist-v1', {});
  const n = ITEMS.filter((_, i) => done[i]).length;
  return (
    <div className="checklist">
      <p className="checklist-head">
        <b>{n}/{ITEMS.length}</b> <L vi="mục đã tự tin" en="items you are confident about" />{' '}
        <span className="hbar-track" style={{ width: 160, display: 'inline-flex', verticalAlign: 'middle', height: 10 }}>
          <span className="hbar-fill" style={{ width: `${(n / ITEMS.length) * 100}%`, background: 'var(--ok)' }} />
        </span>
      </p>
      <ul>
        {ITEMS.map(([vi, en], i) => (
          <li key={i}>
            <label>
              <input id={`ck-${i}`} type="checkbox" checked={!!done[i]} onChange={() => setDone((d) => ({ ...d, [i]: !d[i] }))} />
              <span><L vi={vi} en={en} /></span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
